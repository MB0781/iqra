/**
 * Contrôles automatiques des contenus (utilisés par `npm run verifier` et par Vitest).
 * Chaque fonction renvoie une liste de problèmes lisibles ; liste vide = conforme.
 */
import { contenus, refsBloc, refsExercice, cibleExercice } from './charger';
import { NOTIONS, NOTIONS_PAR_ETAPE } from './notions';
import { etapesFiltrees } from './charger';
import { estLettre, notionsRequises, verifierTextePedagogique } from '../lib/arabe';
import { estRefCoran, resoudreRef } from '../lib/coran';
import type { Exercice, Lecon } from './schema';

export interface Probleme {
  ou: string;
  message: string;
}

/** Notions connues avant (et pendant) chaque leçon, dans l'ordre du parcours. */
export function notionsParLecon(): Map<string, Set<string>> {
  const { lecons } = contenus();
  const connues = new Set<string>();
  // En mode rédaction filtré, on suppose acquises les notions prévues des étapes précédentes.
  const filtre = etapesFiltrees();
  if (filtre) {
    const min = Math.min(...filtre);
    for (let e = 1; e < min; e++) NOTIONS_PAR_ETAPE[e].forEach((n) => connues.add(n));
  }
  const res = new Map<string, Set<string>>();
  for (const l of lecons) {
    l.enseigne.forEach((n) => connues.add(n));
    res.set(l.id, new Set(connues));
  }
  return res;
}

function exercicesDe(l: Lecon): { ex: Exercice; ou: string }[] {
  return [
    ...l.pratique.map((ex) => ({ ex, ou: `${l.id} / pratique ${ex.id}` })),
    ...l.test.map((ex) => ({ ex, ou: `${l.id} / mini-test ${ex.id}` })),
  ];
}

export function verifierStructure(): Probleme[] {
  const pb: Probleme[] = [];
  const { lecons, tests, etapes, item } = contenus();
  const ids = new Set<string>();
  for (const l of lecons) {
    if (ids.has(l.id)) pb.push({ ou: l.id, message: 'identifiant de leçon en double' });
    ids.add(l.id);
    if (!l.id.startsWith(`e${l.etape}-`)) pb.push({ ou: l.id, message: `l'identifiant ne correspond pas à l'étape ${l.etape}` });
    l.enseigne.forEach((n) => {
      if (!(n in NOTIONS)) pb.push({ ou: l.id, message: `notion inconnue : ${n}` });
      else if (!NOTIONS_PAR_ETAPE[l.etape].includes(n)) pb.push({ ou: l.id, message: `la notion ${n} n'est pas prévue à l'étape ${l.etape}` });
    });
    const exIds = new Set<string>();
    for (const { ex, ou } of exercicesDe(l)) {
      if (exIds.has(ex.id)) pb.push({ ou, message: `identifiant d'exercice en double dans la leçon` });
      exIds.add(ex.id);
      pb.push(...verifierExercice(ex, ou));
    }
    for (const r of [...l.elementsNouveaux, ...l.theorie.flatMap(refsBloc)]) {
      try {
        item(r);
      } catch (e) {
        pb.push({ ou: l.id, message: (e as Error).message });
      }
    }
  }
  // Ordres consécutifs par étape
  for (const e of etapes) {
    const ls = lecons.filter((l) => l.etape === e.numero);
    ls.forEach((l, i) => {
      if (l.ordre !== i + 1) pb.push({ ou: l.id, message: `ordre ${l.ordre} attendu ${i + 1}` });
    });
    const filtre = etapesFiltrees();
    if (filtre && !filtre.includes(e.numero)) continue;
    if (e.numero <= 8 && !tests.has(e.numero)) pb.push({ ou: `étape ${e.numero}`, message: 'test de fin d’étape manquant' });
  }
  for (const [n, t] of tests) {
    const qIds = new Set<string>();
    t.questions.forEach((q) => {
      const ou = `test étape ${n} / ${q.id}`;
      if (qIds.has(q.id)) pb.push({ ou, message: 'identifiant de question en double' });
      qIds.add(q.id);
      pb.push(...verifierExercice(q, ou));
    });
  }
  return pb;
}

export function verifierExercice(ex: Exercice, ou: string): Probleme[] {
  const pb: Probleme[] = [];
  const { item } = contenus();
  for (const r of refsExercice(ex)) {
    try {
      item(r);
    } catch (e) {
      pb.push({ ou, message: (e as Error).message });
    }
  }
  if (pb.length) return pb;
  if (ex.type === 'ecoute-choisis' || ex.type === 'lis-choisis-son') {
    if (!ex.options.includes(ex.cible)) pb.push({ ou, message: 'la cible doit figurer parmi les options' });
    if (new Set(ex.options).size !== ex.options.length) pb.push({ ou, message: 'options en double' });
    const textes = ex.options.map((o) => (ex.type === 'lis-choisis-son' ? item(o).translit : item(o).ar));
    if (new Set(textes).size !== textes.length) pb.push({ ou, message: 'deux options ont le même affichage' });
    if (ex.type === 'lis-choisis-son') ex.options.forEach((o) => !item(o).translit && pb.push({ ou, message: `translittération manquante pour ${o}` }));
  }
  if (ex.type === 'paires-minimales') {
    if (!ex.paire.includes(ex.cible)) pb.push({ ou, message: 'la cible doit être un élément de la paire' });
    if (ex.paire[0] === ex.paire[1]) pb.push({ ou, message: 'paire identique' });
  }
  if (ex.type === 'classe') {
    const cats = new Set(ex.categories.map((c) => c.id));
    ex.elements.forEach((e) => !cats.has(e.categorie) && pb.push({ ou, message: `catégorie inconnue ${e.categorie}` }));
    ex.categories.forEach((c) => !ex.elements.some((e) => e.categorie === c.id) && pb.push({ ou, message: `catégorie vide ${c.id}` }));
  }
  if (ex.type === 'trouve-lettre') {
    const lettre = item(ex.lettre);
    if (lettre.type !== 'lettre') pb.push({ ou, message: 'trouve-lettre : « lettre » doit être un élément de type lettre' });
    const base = lettre.ar;
    const mot = item(ex.mot).ar;
    const lettres = Array.from(mot).filter((c) => /[ء-يٱ]/.test(c));
    const pos = lettres.indexOf(base);
    const attendu = pos === -1 ? 'absente' : pos === 0 ? 'debut' : pos === lettres.length - 1 ? 'fin' : 'milieu';
    if (lettres.filter((c) => c === base).length > 1) pb.push({ ou, message: 'trouve-lettre : la lettre apparaît plusieurs fois, réponse ambiguë' });
    else if (attendu !== ex.reponse) pb.push({ ou, message: `trouve-lettre : réponse « ${ex.reponse} » mais la lettre est en position « ${attendu} »` });
  }
  return pb;
}

/** 0 élément d'exercice utilisé avant d'avoir été enseigné. */
export function verifierOrdreNotions(): Probleme[] {
  const pb: Probleme[] = [];
  const { lecons, tests, item } = contenus();
  const parLecon = notionsParLecon();
  const verifierRefs = (refs: string[], connues: Set<string>, ou: string) => {
    for (const r of refs) {
      let ar: string;
      try {
        ar = item(r).ar;
      } catch {
        continue; // signalé par verifierStructure
      }
      for (const n of notionsRequises(ar)) {
        if (!connues.has(n)) pb.push({ ou, message: `« ${ar} » (${r}) utilise « ${NOTIONS[n] ?? n} » avant qu'elle soit enseignée` });
      }
    }
  };
  for (const l of lecons) {
    const connues = parLecon.get(l.id)!;
    verifierRefs([...l.elementsNouveaux, ...l.theorie.flatMap(refsBloc)], connues, `${l.id} / théorie`);
    for (const { ex, ou } of exercicesDe(l)) verifierRefs(refsExercice(ex), connues, ou);
  }
  for (const [n, t] of tests) {
    const derniere = [...lecons].filter((l) => l.etape <= n).pop();
    const connues = derniere ? parLecon.get(derniere.id)! : new Set<string>();
    t.questions.forEach((q) => verifierRefs(refsExercice(q), connues, `test étape ${n} / ${q.id}`));
  }
  return pb;
}

/** Signature d'une question : type + cible + options triées. */
function signature(ex: Exercice): string {
  const refs = [...refsExercice(ex)];
  const cible = cibleExercice(ex) ?? '';
  return `${ex.type}|${cible}|${refs.sort().join(',')}`;
}

/** Les tests de fin d'étape portent sur des items jamais vus en exercice. */
export function verifierTestsInedits(): Probleme[] {
  const pb: Probleme[] = [];
  const { lecons, tests } = contenus();
  for (const [n, t] of tests) {
    const ls = lecons.filter((l) => l.etape === n);
    const exos = ls.flatMap((l) => [...l.pratique, ...l.test]);
    const signatures = new Set(exos.map(signature));
    const ciblesVues = new Set(exos.map(cibleExercice).filter(Boolean));
    for (const q of t.questions) {
      const ou = `test étape ${n} / ${q.id}`;
      if (signatures.has(signature(q))) pb.push({ ou, message: 'question identique à un exercice déjà fait' });
      const c = cibleExercice(q);
      // À partir de l'étape 3, la cible elle-même doit être inédite (combinaisons nouvelles).
      if (n >= 3 && c && ciblesVues.has(c)) pb.push({ ou, message: `cible « ${c} » déjà interrogée dans les exercices de l'étape` });
    }
  }
  return pb;
}

/** Voyelles complètes et caractères autorisés dans les contenus pédagogiques (hors Coran). */
export function verifierTexteArabe(): Probleme[] {
  const pb: Probleme[] = [];
  const { elements, lecons } = contenus();
  const etapeDe = new Map<string, number>();
  for (const l of lecons) {
    for (const { ex } of exercicesDe(l)) refsExercice(ex).forEach((r) => !etapeDe.has(r) && etapeDe.set(r, l.etape));
    l.theorie.flatMap(refsBloc).forEach((r) => !etapeDe.has(r) && etapeDe.set(r, l.etape));
  }
  for (const e of elements.values()) {
    for (const p of verifierTextePedagogique(e.ar)) pb.push({ ou: `élément ${e.id}`, message: `${p.message} dans « ${p.texte} »` });
    // À partir de l'étape 3, syllabes et mots doivent être entièrement vocalisés.
    const etape = etapeDe.get(e.id);
    if (etape && etape >= 3 && (e.type === 'syllabe' || e.type === 'mot' || e.type === 'expression')) {
      if (!/[ً-ْ]/.test(e.ar)) pb.push({ ou: `élément ${e.id}`, message: 'mot non vocalisé utilisé à partir de l’étape 3' });
    }
  }
  return pb;
}

/** Les références coraniques sont valides et le texte vient de Tanzil. */
export function verifierRefsCoran(): Probleme[] {
  const pb: Probleme[] = [];
  const { lecons, tests, translitCoran } = contenus();
  const refs = new Set<string>();
  for (const l of lecons) {
    for (const { ex } of exercicesDe(l)) refsExercice(ex).filter(estRefCoran).forEach((r) => refs.add(r));
    l.theorie.flatMap(refsBloc).filter(estRefCoran).forEach((r) => refs.add(r));
  }
  for (const t of tests.values()) t.questions.flatMap(refsExercice).filter(estRefCoran).forEach((r) => refs.add(r));
  for (const r of refs) {
    try {
      resoudreRef(r);
    } catch (e) {
      pb.push({ ou: r, message: (e as Error).message });
    }
  }
  for (const r of Object.keys(translitCoran)) {
    if (!estRefCoran(r)) pb.push({ ou: 'coran-translit.json', message: `clé invalide ${r}` });
  }
  return pb;
}

export function toutVerifier(): Record<string, Probleme[]> {
  return {
    structure: verifierStructure(),
    ordreNotions: verifierOrdreNotions(),
    testsInedits: verifierTestsInedits(),
    texteArabe: verifierTexteArabe(),
    refsCoran: verifierRefsCoran(),
  };
}
