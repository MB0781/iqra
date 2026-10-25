import { describe, expect, it } from 'vitest';
import {
  cartesDues,
  elementsAPrioriser,
  estMaitrise,
  MAX_REVISION,
  noter,
  nouvelleCarte,
  principalesConfusions,
  proposerRetour,
  idSeance,
} from '../../src/lib/progression/revision';
import type { Reponse } from '../../src/lib/progression/types';

const t0 = new Date('2026-01-01T10:00:00Z');
const jours = (n: number) => new Date(t0.getTime() + n * 86400000);

describe('répétition espacée FSRS', () => {
  it('une nouvelle carte est due immédiatement', () => {
    expect(cartesDues([nouvelleCarte('lettre-ba', t0)], t0)).toHaveLength(1);
  });
  it('une bonne réponse repousse la carte, une erreur la garde proche', () => {
    let c = nouvelleCarte('lettre-ba', t0);
    c = noter(c, 'juste', t0);
    c = noter(c, 'juste', new Date(c.due));
    const bon = c.due;
    const mauvais = noter(nouvelleCarte('lettre-ta', t0), 'faux', t0).due;
    expect(bon).toBeGreaterThan(t0.getTime() + 86400000);
    expect(mauvais).toBeLessThan(t0.getTime() + 86400000);
  });
  it('« hésitant » planifie plus tôt que « juste »', () => {
    const base = noter(noter(nouvelleCarte('x', t0), 'juste', t0), 'juste', jours(1));
    const h = noter(base, 'hesitant', new Date(base.due));
    const j = noter(base, 'juste', new Date(base.due));
    expect(h.due).toBeLessThan(j.due);
  });
  it('les cartes dues sont limitées à 15 (≈ 5 min) et les prioritaires passent devant', () => {
    const cartes = Array.from({ length: 30 }, (_, i) => nouvelleCarte(`e${i}`, t0));
    cartes[29] = { ...cartes[29], prioritaire: true, due: jours(10).getTime() };
    const dues = cartesDues(cartes, t0);
    expect(dues).toHaveLength(MAX_REVISION);
    expect(dues[0].element).toBe('e29');
  });
  it('une carte non due et non prioritaire n’est pas proposée', () => {
    const c = { ...nouvelleCarte('a', t0), due: jours(3).getTime() };
    expect(cartesDues([c], t0)).toHaveLength(0);
  });
  it('maîtrise : carte en révision avec stabilité ≥ 3 jours', () => {
    let c = nouvelleCarte('a', t0);
    expect(estMaitrise(c)).toBe(false);
    for (let i = 0; i < 4; i++) c = noter(c, 'juste', new Date(c.due));
    expect(estMaitrise(c)).toBe(true);
    expect(estMaitrise({ ...c, prioritaire: true })).toBe(false);
  });
});

describe('séance', () => {
  const r = (element: string, correct: boolean): Reponse => ({ element, correct, lecon: null, contexte: 'pratique', date: 0, seance: 's' });
  it('un élément raté deux fois devient prioritaire', () => {
    expect(elementsAPrioriser([r('a', false), r('b', false), r('a', true), r('a', false)])).toEqual(['a']);
  });
  it('identifiant de séance = jour local', () => {
    expect(idSeance(new Date(2026, 0, 5, 23, 0))).toBe('2026-01-05');
  });
  it('confusions triées par fréquence', () => {
    const c = principalesConfusions([
      { cle: 'a|b', cible: 'a', choisi: 'b', n: 1, derniere: 5 },
      { cle: 'c|d', cible: 'c', choisi: 'd', n: 4, derniere: 1 },
    ]);
    expect(c[0].cle).toBe('c|d');
  });
});

describe('retour en arrière', () => {
  const s = (id: string, total: number, justes: number) => ({ id, revisionsTotal: total, revisionsJustes: justes });
  it('proposé après 3 séances consécutives sous 70 %', () => {
    expect(proposerRetour([s('2026-01-01', 10, 6), s('2026-01-02', 10, 5), s('2026-01-03', 10, 6)])).toBe(true);
  });
  it('pas proposé si une des 3 dernières séances atteint 70 %', () => {
    expect(proposerRetour([s('2026-01-01', 10, 6), s('2026-01-02', 10, 7), s('2026-01-03', 10, 6)])).toBe(false);
  });
  it('pas proposé avec moins de 3 séances, et les séances sans révision sont ignorées', () => {
    expect(proposerRetour([s('2026-01-01', 10, 1), s('2026-01-02', 10, 1)])).toBe(false);
    expect(proposerRetour([s('2026-01-01', 10, 1), s('2026-01-02', 0, 0), s('2026-01-03', 10, 1), s('2026-01-04', 10, 2)])).toBe(true);
  });
});
