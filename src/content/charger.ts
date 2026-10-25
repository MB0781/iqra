/**
 * Chargement et résolution des contenus (au moment de la construction, côté serveur).
 * Les composants interactifs reçoivent ensuite des objets déjà résolus.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  ElementSchema,
  EtapeSchema,
  LeconSchema,
  TestEtapeSchema,
  type Element,
  type Etape,
  type Exercice,
  type Lecon,
  type TestEtape,
} from './schema';
import { estRefCoran, idAudioRef, resoudreRef, urlAudioMot, urlAudioVerset } from '../lib/coran';

const RACINE = join(process.cwd(), 'src', 'content');

function lireJson(chemin: string): unknown {
  try {
    return JSON.parse(readFileSync(chemin, 'utf-8'));
  } catch (e) {
    throw new Error(`JSON invalide : ${chemin}\n${(e as Error).message}`);
  }
}

function parse<T>(schema: { safeParse: (v: unknown) => { success: true; data: T } | { success: false; error: { issues: { path: (string | number)[]; message: string }[] } } }, val: unknown, fichier: string): T {
  const r = schema.safeParse(val);
  if (!r.success) {
    const details = r.error.issues.map((i) => `  - ${i.path.join('.')} : ${i.message}`).join('\n');
    throw new Error(`Contenu non conforme : ${fichier}\n${details}`);
  }
  return r.data;
}

/** Élément prêt à afficher. */
export interface Item {
  ref: string;
  /** Identifiant stable utilisé pour la progression et l'audio. */
  id: string;
  ar: string;
  translit: string;
  type: Element['type'] | 'coran';
  coran: boolean;
  /** Pour une référence coranique : « S:A:W1-W2 » en jetons Tanzil. */
  coranRef?: string;
  nom?: string;
  prononciation?: string;
  sens?: string;
  audio: string | null;
}

export interface ManifesteEntree {
  id: string;
  ar: string;
  translit: string;
  source: 'quran.com-mot' | 'quran.com-verset' | 'enregistrement';
  statut: 'disponible' | 'à enregistrer';
  url?: string;
  fichier?: string;
}

let memo: ReturnType<typeof chargerTout> | null = null;

/**
 * IQRA_ETAPES=3,4,5 : mode « rédaction » — seules ces étapes sont chargées et vérifiées,
 * les fichiers des autres étapes en cours d'écriture sont ignorés.
 */
export function etapesFiltrees(): number[] | null {
  const v = process.env.IQRA_ETAPES;
  return v ? v.split(',').map(Number) : null;
}

export function contenus() {
  if (!memo) memo = chargerTout();
  return memo;
}

/** Pour les tests : relire les fichiers. */
export function reinitialiser() {
  memo = null;
}

function chargerTout() {
  const etapes = (lireJson(join(RACINE, 'etapes.json')) as unknown[]).map((e, i) => parse<Etape>(EtapeSchema, e, `etapes.json[${i}]`));

  const filtre = etapesFiltrees();
  const elements = new Map<string, Element>();
  const dossierElements = join(RACINE, 'elements');
  for (const f of readdirSync(dossierElements).filter((f) => f.endsWith('.json')).sort()) {
    let liste: unknown;
    try {
      liste = lireJson(join(dossierElements, f));
    } catch (e) {
      if (filtre) continue; // fichier d'une autre étape en cours de rédaction
      throw e;
    }
    if (!Array.isArray(liste)) throw new Error(`elements/${f} doit contenir un tableau`);
    liste.forEach((el, i) => {
      const e = parse<Element>(ElementSchema, el, `elements/${f}[${i}]`);
      if (elements.has(e.id)) throw new Error(`Identifiant d'élément en double : ${e.id} (elements/${f})`);
      elements.set(e.id, e);
    });
  }

  // Translittérations des références coraniques : un fichier par étape dans coran-translit/.
  const translitCoran: Record<string, string> = {};
  const dossierTranslit = join(RACINE, 'coran-translit');
  if (existsSync(dossierTranslit)) {
    for (const f of readdirSync(dossierTranslit).filter((f) => f.endsWith('.json')).sort()) {
      Object.assign(translitCoran, lireJson(join(dossierTranslit, f)) as Record<string, string>);
    }
  }

  const lecons: Lecon[] = [];
  const tests = new Map<number, TestEtape>();
  const dossierLecons = join(RACINE, 'lecons');
  for (const d of readdirSync(dossierLecons).filter((d) => /^etape-\d$/.test(d)).sort()) {
    if (filtre && !filtre.includes(Number(d.slice(6)))) continue;
    for (const f of readdirSync(join(dossierLecons, d)).filter((f) => f.endsWith('.json')).sort()) {
      const chemin = `lecons/${d}/${f}`;
      const brut = lireJson(join(dossierLecons, d, f));
      if (f === 'test-etape.json') {
        const t = parse<TestEtape>(TestEtapeSchema, brut, chemin);
        tests.set(t.etape, t);
      } else {
        const l = parse<Lecon>(LeconSchema, brut, chemin);
        if (`${l.id}.json` !== f) throw new Error(`${chemin} : le nom du fichier doit être ${l.id}.json`);
        lecons.push(l);
      }
    }
  }
  lecons.sort((a, b) => a.etape - b.etape || a.ordre - b.ordre);

  const items = new Map<string, Item>();
  function item(ref: string): Item {
    const deja = items.get(ref);
    if (deja) return deja;
    let it: Item;
    if (estRefCoran(ref)) {
      const r = resoudreRef(ref);
      const id = idAudioRef(ref);
      const motUnique = r.mot !== null;
      const versetEntier = r.de === 1 && r.a === resoudreRef(`q:${r.sourate}:${r.verset}`).a;
      it = {
        ref,
        id,
        ar: r.texte,
        translit: translitCoran[ref] ?? '',
        type: 'coran',
        coran: true,
        coranRef: `${r.sourate}:${r.verset}:${r.de}-${r.a}`,
        audio: motUnique ? urlAudioMot(r.sourate, r.verset, r.mot!) : versetEntier ? urlAudioVerset(r.sourate, r.verset) : null,
      };
    } else {
      const e = elements.get(ref);
      if (!e) throw new Error(`Élément inconnu : ${ref}`);
      it = { ref, id: e.id, ar: e.ar, translit: e.translit, type: e.type, coran: false, nom: e.nom, prononciation: e.prononciation, sens: e.sens, audio: null };
    }
    items.set(ref, it);
    return it;
  }

  const manifeste = chargerManifeste();
  // Audio local enregistré (déposé dans public/audio) prioritaire sur l'absence d'audio.
  function audioDe(it: Item): string | null {
    const m = manifeste.get(it.id);
    if (m?.fichier) return `audio/${m.fichier}`;
    return it.audio;
  }

  return { etapes, elements, lecons, tests, translitCoran, item, audioDe, manifeste };
}

export function chargerManifeste(): Map<string, ManifesteEntree> {
  const chemin = join(process.cwd(), 'data', 'audio', 'manifest.json');
  const m = new Map<string, ManifesteEntree>();
  if (!existsSync(chemin)) return m;
  const brut = JSON.parse(readFileSync(chemin, 'utf-8')) as { elements: ManifesteEntree[] };
  for (const e of brut.elements) m.set(e.id, e);
  return m;
}

/** Toutes les références utilisées par un exercice. */
export function refsExercice(ex: Exercice): string[] {
  switch (ex.type) {
    case 'ecoute-choisis':
    case 'lis-choisis-son':
      return [ex.cible, ...ex.options];
    case 'paires-minimales':
      return [...ex.paire];
    case 'trouve-lettre':
      return [ex.mot, ex.lettre];
    case 'assemble':
      return [...ex.morceaux, ...(ex.distracteurs ?? []), ex.resultat];
    case 'classe':
      return ex.elements.map((e) => e.ref);
    case 'lis-verifie':
      return [ex.cible];
    case 'lecture-guidee': {
      const [s, plage] = ex.versets.split(':');
      const [a1, a2] = plage.split('-').map(Number);
      const refs: string[] = [];
      for (let a = a1; a <= (a2 ?? a1); a++) refs.push(`q:${s}:${a}`);
      return refs;
    }
  }
}

/** Référence « principale » interrogée par un exercice (celle qui est évaluée). */
export function cibleExercice(ex: Exercice): string | null {
  switch (ex.type) {
    case 'ecoute-choisis':
    case 'lis-choisis-son':
    case 'paires-minimales':
    case 'lis-verifie':
      return ex.cible;
    case 'trouve-lettre':
      return ex.mot;
    case 'assemble':
      return ex.resultat;
    default:
      return null;
  }
}

export function refsBloc(b: Lecon['theorie'][number]): string[] {
  switch (b.type) {
    case 'presentation':
      return [b.element];
    case 'paire':
      return [...b.elements];
    case 'galerie':
      return b.elements;
    default:
      return [];
  }
}

export function leconsEtape(n: number): Lecon[] {
  return contenus().lecons.filter((l) => l.etape === n);
}
