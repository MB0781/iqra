import { describe, expect, it } from 'vitest';
import {
  etapeDebloquee,
  leconDebloquee,
  majEtatEtape,
  majEtatLecon,
  prochaineLecon,
  testEtapeDisponible,
  testReussi,
  leconReussie,
  etapeCourante,
  etapeTerminee,
} from '../../src/lib/progression/regles';
import type { EtatEtape, EtatLecon } from '../../src/lib/progression/types';

const lecons = [
  { id: 'e1-l01', etape: 1, ordre: 1 },
  { id: 'e1-l02', etape: 1, ordre: 2 },
  { id: 'e2-l01', etape: 2, ordre: 1 },
  { id: 'e2-l02', etape: 2, ordre: 2 },
];
const ok = (lecon: string): EtatLecon => ({ lecon, meilleurScore: 1, reussie: true, tentatives: 1, date: 0 });
const etape = (n: number, score: number): EtatEtape => majEtatEtape(undefined, n, score, 0);

describe('seuils', () => {
  it('leçon réussie à 80 %, pas en dessous', () => {
    expect(leconReussie(0.8)).toBe(true);
    expect(leconReussie(0.79)).toBe(false);
  });
  it('étape validée à 85 %, pas en dessous', () => {
    expect(testReussi(0.85)).toBe(true);
    expect(testReussi(0.849)).toBe(false);
  });
});

describe('déblocage des étapes', () => {
  it("l'étape 1 est toujours ouverte, l'étape 2 non", () => {
    expect(etapeDebloquee(1, [])).toBe(true);
    expect(etapeDebloquee(2, [])).toBe(false);
  });
  it("l'étape 2 s'ouvre avec 85 % au test de l'étape 1", () => {
    expect(etapeDebloquee(2, [etape(1, 0.84)])).toBe(false);
    expect(etapeDebloquee(2, [etape(1, 0.85)])).toBe(true);
  });
  it('un échec après une réussite ne referme pas une étape', () => {
    const e = majEtatEtape(etape(1, 0.9), 1, 0.2, 1);
    expect(e.reussie).toBe(true);
    expect(e.meilleurScore).toBe(0.9);
    expect(e.tentatives).toBe(2);
  });
  it("le test d'une étape ouverte est disponible même sans les leçons (validation directe)", () => {
    expect(testEtapeDisponible(1, [])).toBe(true);
    expect(testEtapeDisponible(2, [])).toBe(false);
  });
});

describe('déblocage des leçons', () => {
  it('la première leçon est ouverte, la suivante attend la réussite de la précédente', () => {
    expect(leconDebloquee(lecons[0], lecons, [], [])).toBe(true);
    expect(leconDebloquee(lecons[1], lecons, [], [])).toBe(false);
    expect(leconDebloquee(lecons[1], lecons, [ok('e1-l01')], [])).toBe(true);
  });
  it('les leçons de l’étape 2 restent fermées tant que le test 1 n’est pas réussi', () => {
    const toutes = [ok('e1-l01'), ok('e1-l02')];
    expect(leconDebloquee(lecons[2], lecons, toutes, [])).toBe(false);
    expect(leconDebloquee(lecons[2], lecons, toutes, [etape(1, 0.9)])).toBe(true);
  });
  it('une étape validée par le test ouvre toutes ses leçons', () => {
    expect(leconDebloquee(lecons[1], lecons, [], [etape(1, 0.9)])).toBe(true);
  });
  it('prochaine leçon conseillée', () => {
    expect(prochaineLecon(lecons, [], [])?.id).toBe('e1-l01');
    expect(prochaineLecon(lecons, [ok('e1-l01')], [])?.id).toBe('e1-l02');
    expect(prochaineLecon(lecons, [ok('e1-l01'), ok('e1-l02')], [])).toBeNull();
    expect(prochaineLecon(lecons, [ok('e1-l01'), ok('e1-l02')], [etape(1, 1)])?.id).toBe('e2-l01');
  });
  it('étape courante et étape terminée', () => {
    expect(etapeCourante(9, [])).toBe(1);
    expect(etapeCourante(9, [etape(1, 1)])).toBe(2);
    expect(etapeTerminee(1, lecons, [ok('e1-l01')])).toBe(false);
    expect(etapeTerminee(1, lecons, [ok('e1-l01'), ok('e1-l02')])).toBe(true);
  });
  it('meilleur score et réussite conservés', () => {
    const a = majEtatLecon(undefined, 'e1-l01', 0.6, 0);
    expect(a.reussie).toBe(false);
    const b = majEtatLecon(a, 'e1-l01', 1, 1);
    const c = majEtatLecon(b, 'e1-l01', 0.2, 2);
    expect(c).toMatchObject({ reussie: true, meilleurScore: 1, tentatives: 3 });
  });
});
