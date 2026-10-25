import 'fake-indexeddb/auto';
import { describe, expect, it, beforeEach } from 'vitest';
import { Depot } from '../../src/lib/progression/depot';
import { MoteurDexie, MoteurLocalStorage, MoteurMemoire, CLE_LOCALSTORAGE, choisirMoteur } from '../../src/lib/progression/moteurs';
import { importer, exporter, ErreurImport, VERSION_EXPORT } from '../../src/lib/progression/echange';
import { donneesVides } from '../../src/lib/progression/types';

class StockageMemoire implements Storage {
  private m = new Map<string, string>();
  get length() { return this.m.size; }
  clear() { this.m.clear(); }
  getItem(k: string) { return this.m.get(k) ?? null; }
  key(i: number) { return [...this.m.keys()][i] ?? null; }
  removeItem(k: string) { this.m.delete(k); }
  setItem(k: string, v: string) { this.m.set(k, v); }
}

const t0 = new Date('2026-03-01T09:00:00');
let n = 0;

for (const [nom, fabrique] of [
  ['IndexedDB (Dexie)', async () => { const m = new MoteurDexie(`test-${n++}`); await m.ouvrir(); return m; }],
  ['localStorage', async () => new MoteurLocalStorage(new StockageMemoire())],
  ['mémoire', async () => new MoteurMemoire()],
] as const) {
  describe(`dépôt — ${nom}`, () => {
    let d: Depot;
    beforeEach(async () => { d = new Depot(await fabrique(), () => t0); });

    it('enregistre les réponses et les confusions', async () => {
      await d.repondre({ element: 'lettre-hha', lecon: 'e1-l03', contexte: 'pratique', correct: false, choisi: 'lettre-ha' });
      await d.repondre({ element: 'lettre-hha', lecon: 'e1-l03', contexte: 'pratique', correct: true });
      const tout = await d.toutLire();
      expect(tout.reponses).toHaveLength(2);
      expect(tout.confusions).toEqual([expect.objectContaining({ cible: 'lettre-hha', choisi: 'lettre-ha', n: 1 })]);
    });

    it('un élément raté deux fois dans la séance passe en révision prioritaire', async () => {
      await d.repondre({ element: 'lettre-qaf', lecon: null, contexte: 'pratique', correct: false });
      expect((await d.toutLire()).cartes).toHaveLength(0);
      await d.repondre({ element: 'lettre-qaf', lecon: null, contexte: 'pratique', correct: false });
      const c = (await d.toutLire()).cartes;
      expect(c).toEqual([expect.objectContaining({ element: 'lettre-qaf', prioritaire: true })]);
    });

    it('une leçon réussie crée les cartes de révision, une leçon ratée non', async () => {
      await d.terminerLecon('e1-l01', 0.6, ['lettre-ba']);
      expect((await d.toutLire()).cartes).toHaveLength(0);
      const e = await d.terminerLecon('e1-l01', 1, ['lettre-ba', 'lettre-ta']);
      expect(e.reussie).toBe(true);
      expect((await d.toutLire()).cartes.map((c) => c.element).sort()).toEqual(['lettre-ba', 'lettre-ta']);
    });

    it('test de fin d’étape : 85 % requis', async () => {
      expect((await d.terminerTestEtape(1, 0.8)).reussie).toBe(false);
      expect((await d.terminerTestEtape(1, 0.9)).reussie).toBe(true);
    });

    it('les révisions alimentent les statistiques de séance', async () => {
      await d.repondre({ element: 'a', lecon: null, contexte: 'revision', correct: true });
      await d.repondre({ element: 'b', lecon: null, contexte: 'revision', correct: false });
      expect((await d.toutLire()).seances).toEqual([{ id: '2026-03-01', revisionsTotal: 2, revisionsJustes: 1 }]);
    });

    it('évaluer une carte la replanifie', async () => {
      await d.ajouterCartes(['lettre-ba']);
      await d.evaluer('lettre-ba', 'juste');
      const [c] = (await d.toutLire()).cartes;
      expect(c.reps).toBe(1);
      expect(c.due).toBeGreaterThan(t0.getTime());
    });

    it('réglages par défaut puis modifiés', async () => {
      expect((await d.reglages()).vitesse).toBe(1);
      await d.definirReglages({ ...(await d.reglages()), vitesse: 0.75 });
      expect((await d.reglages()).vitesse).toBe(0.75);
    });

    it('export puis import restitue exactement la progression', async () => {
      await d.repondre({ element: 'lettre-ba', lecon: 'e1-l01', contexte: 'test', correct: true });
      await d.terminerLecon('e1-l01', 1, ['lettre-ba']);
      await d.terminerTestEtape(1, 0.9);
      const json = await d.exporter();
      const avant = await d.toutLire();
      const autre = new Depot(new MoteurMemoire(), () => t0);
      await autre.importer(json);
      expect(await autre.toutLire()).toEqual(avant);
    });
  });
}

describe('localStorage : persistance entre deux visites', () => {
  it('relit les données écrites', async () => {
    const s = new StockageMemoire();
    const d1 = new Depot(new MoteurLocalStorage(s), () => t0);
    await d1.terminerLecon('e1-l01', 1, ['lettre-ba']);
    expect(s.getItem(CLE_LOCALSTORAGE)).toContain('e1-l01');
    const d2 = new Depot(new MoteurLocalStorage(s), () => t0);
    expect((await d2.toutLire()).lecons[0].lecon).toBe('e1-l01');
  });
  it('un contenu corrompu repart de zéro sans planter', async () => {
    const s = new StockageMemoire();
    s.setItem(CLE_LOCALSTORAGE, '{pas du json');
    const d = new Depot(new MoteurLocalStorage(s), () => t0);
    expect((await d.toutLire()).lecons).toEqual([]);
  });
});

describe('choix du moteur', () => {
  it('utilise IndexedDB quand il existe', async () => {
    expect((await choisirMoteur()).nom).toBe('indexeddb');
  });
});

describe('import : fichiers invalides', () => {
  it('refuse un texte qui n’est pas du JSON', () => {
    expect(() => importer('bonjour')).toThrow(ErreurImport);
  });
  it('refuse un JSON étranger', () => {
    expect(() => importer('{"a":1}')).toThrow(ErreurImport);
  });
  it('refuse une version future', () => {
    expect(() => importer(JSON.stringify({ application: 'iqra', version: VERSION_EXPORT + 1, exporteLe: '', donnees: {} }))).toThrow(/plus récente/);
  });
  it('complète les tables absentes', () => {
    const d = importer(JSON.stringify({ application: 'iqra', version: 1, exporteLe: '', donnees: { lecons: [] } }));
    expect(d).toEqual(donneesVides());
  });
  it('export contient la version et la date', () => {
    const j = JSON.parse(exporter(donneesVides(), t0));
    expect(j).toMatchObject({ application: 'iqra', version: VERSION_EXPORT });
  });
});
