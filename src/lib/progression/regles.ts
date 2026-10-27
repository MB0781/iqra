/**
 * Règles de déblocage (fonctions pures, testées).
 * - Une leçon est réussie avec au moins 80 % au mini-test.
 * - Dans une étape, chaque leçon se débloque quand la précédente est réussie.
 * - Une étape se débloque avec au moins 85 % au test de fin de l'étape précédente.
 * - Le test d'une étape débloquée peut être tenté à tout moment (validation directe
 *   pour qui connaît déjà les lettres) ; la réussite du test valide l'étape.
 */
import type { EtatEtape, EtatLecon } from './types';

export const SEUIL_LECON = 0.8;
export const SEUIL_ETAPE = 0.85;

export interface LeconRef {
  id: string;
  etape: number;
  ordre: number;
}

export function leconReussie(score: number): boolean {
  return score >= SEUIL_LECON;
}

export function testReussi(score: number): boolean {
  return score >= SEUIL_ETAPE;
}

export function etapeValidee(n: number, etapes: EtatEtape[]): boolean {
  return etapes.some((e) => e.etape === n && e.reussie);
}

export function etapeDebloquee(n: number, etapes: EtatEtape[]): boolean {
  return n === 1 || etapeValidee(n - 1, etapes);
}

export function leconDebloquee(l: LeconRef, toutes: LeconRef[], lecons: EtatLecon[], etapes: EtatEtape[]): boolean {
  if (!etapeDebloquee(l.etape, etapes)) return false;
  if (l.ordre === 1 || etapeValidee(l.etape, etapes)) return true;
  const prec = toutes.find((x) => x.etape === l.etape && x.ordre === l.ordre - 1);
  return !prec || lecons.some((e) => e.lecon === prec.id && e.reussie);
}

export function testEtapeDisponible(n: number, etapes: EtatEtape[]): boolean {
  return etapeDebloquee(n, etapes);
}

/** Leçons de l'étape toutes réussies (le test est alors recommandé). */
export function etapeTerminee(n: number, toutes: LeconRef[], lecons: EtatLecon[]): boolean {
  return toutes.filter((l) => l.etape === n).every((l) => lecons.some((e) => e.lecon === l.id && e.reussie));
}

/** Prochaine action conseillée. */
export function prochaineLecon(toutes: LeconRef[], lecons: EtatLecon[], etapes: EtatEtape[]): LeconRef | null {
  const triees = [...toutes].sort((a, b) => a.etape - b.etape || a.ordre - b.ordre);
  return (
    triees.find(
      (l) => !etapeValidee(l.etape, etapes) && leconDebloquee(l, toutes, lecons, etapes) && !lecons.some((e) => e.lecon === l.id && e.reussie),
    ) ?? null
  );
}

export function etapeCourante(nbEtapes: number, etapes: EtatEtape[]): number {
  for (let n = 1; n <= nbEtapes; n++) if (!etapeValidee(n, etapes)) return n;
  return nbEtapes;
}

export function majEtatLecon(prec: EtatLecon | undefined, lecon: string, score: number, date: number): EtatLecon {
  return {
    lecon,
    meilleurScore: Math.max(prec?.meilleurScore ?? 0, score),
    reussie: (prec?.reussie ?? false) || leconReussie(score),
    tentatives: (prec?.tentatives ?? 0) + 1,
    date,
  };
}

export function majEtatEtape(prec: EtatEtape | undefined, etape: number, score: number, date: number): EtatEtape {
  return {
    etape,
    meilleurScore: Math.max(prec?.meilleurScore ?? 0, score),
    reussie: (prec?.reussie ?? false) || testReussi(score),
    tentatives: (prec?.tentatives ?? 0) + 1,
    date,
  };
}
