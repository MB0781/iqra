/**
 * Répétition espacée (FSRS via ts-fsrs) et règles de révision.
 */
import { createEmptyCard, fsrs, Rating, State, type Card, type Grade } from 'ts-fsrs';
import type { CarteStockee, Confusion, Reponse, Seance } from './types';

const planificateur = fsrs({ enable_fuzz: false });

/** Nombre maximal de cartes en début de séance (≈ 5 minutes). */
export const MAX_REVISION = 15;
/** Seuil de réussite en révision sous lequel on propose de revenir en arrière. */
export const SEUIL_REGRESSION = 0.7;
export const SEANCES_REGRESSION = 3;

export type Evaluation = 'juste' | 'hesitant' | 'faux';

export function noteDe(e: Evaluation): Grade {
  return e === 'juste' ? Rating.Good : e === 'hesitant' ? Rating.Hard : Rating.Again;
}

export function versCarte(c: CarteStockee): Card {
  return {
    due: new Date(c.due),
    stability: c.stability,
    difficulty: c.difficulty,
    elapsed_days: c.elapsed_days,
    scheduled_days: c.scheduled_days,
    learning_steps: c.learning_steps,
    reps: c.reps,
    lapses: c.lapses,
    state: c.state as State,
    last_review: c.last_review ? new Date(c.last_review) : undefined,
  };
}

export function versStockage(element: string, c: Card, prioritaire = false): CarteStockee {
  return {
    element,
    due: c.due.getTime(),
    stability: c.stability,
    difficulty: c.difficulty,
    elapsed_days: c.elapsed_days,
    scheduled_days: c.scheduled_days,
    learning_steps: c.learning_steps,
    reps: c.reps,
    lapses: c.lapses,
    state: c.state,
    last_review: c.last_review?.getTime(),
    prioritaire,
  };
}

export function nouvelleCarte(element: string, maintenant: Date): CarteStockee {
  return versStockage(element, createEmptyCard(maintenant));
}

/** Applique une évaluation à une carte. Une réponse juste lève la priorité. */
export function noter(carte: CarteStockee, e: Evaluation, maintenant: Date): CarteStockee {
  const res = planificateur.next(versCarte(carte), maintenant, noteDe(e));
  return versStockage(carte.element, res.card, e === 'faux' ? carte.prioritaire : false);
}

/** Cartes à revoir maintenant : prioritaires d'abord, puis les plus en retard. */
export function cartesDues(cartes: CarteStockee[], maintenant: Date, max = MAX_REVISION): CarteStockee[] {
  const t = maintenant.getTime();
  return cartes
    .filter((c) => c.prioritaire || c.due <= t)
    .sort((a, b) => Number(b.prioritaire) - Number(a.prioritaire) || a.due - b.due)
    .slice(0, max);
}

/** Éléments ratés au moins deux fois dans la séance → révision prioritaire. */
export function elementsAPrioriser(reponsesSeance: Reponse[]): string[] {
  const erreurs = new Map<string, number>();
  for (const r of reponsesSeance) if (!r.correct) erreurs.set(r.element, (erreurs.get(r.element) ?? 0) + 1);
  return [...erreurs].filter(([, n]) => n >= 2).map(([e]) => e);
}

export function cleConfusion(cible: string, choisi: string): string {
  return `${cible}|${choisi}`;
}

/** Confusions les plus fréquentes (pour générer des paires ciblées). */
export function principalesConfusions(confusions: Confusion[], n = 5): Confusion[] {
  return [...confusions].sort((a, b) => b.n - a.n || b.derniere - a.derniere).slice(0, n);
}

/** Si la réussite en révision est < 70 % pendant 3 séances consécutives (avec révisions), proposer de revenir en arrière. */
export function proposerRetour(seances: Seance[]): boolean {
  const avec = [...seances].filter((s) => s.revisionsTotal > 0).sort((a, b) => a.id.localeCompare(b.id));
  if (avec.length < SEANCES_REGRESSION) return false;
  return avec.slice(-SEANCES_REGRESSION).every((s) => s.revisionsJustes / s.revisionsTotal < SEUIL_REGRESSION);
}

/** Un élément est « maîtrisé » quand il est en phase de révision avec une stabilité d'au moins 3 jours. */
export function estMaitrise(c: CarteStockee | undefined): boolean {
  return !!c && c.state === State.Review && c.stability >= 3 && !c.prioritaire;
}

export function idSeance(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
