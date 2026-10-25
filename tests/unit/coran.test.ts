import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { FICHIER_TANZIL, nombreVersets, resoudreRef, texteVerset, urlAudioMot, urlAudioVerset, verset } from '../../src/lib/coran';

describe('fichier Tanzil', () => {
  it('est intact (empreinte SHA-256 de la version téléchargée)', () => {
    const h = createHash('sha256').update(readFileSync(FICHIER_TANZIL)).digest('hex');
    expect(h).toBe('bf4f57b968d03f4131c070b1e285da9be0e0a108a21c910e872801ca273312c8');
  });
  it('contient le bloc de licence Tanzil', () => {
    expect(readFileSync(FICHIER_TANZIL, 'utf-8')).toContain('Tanzil Quran Text');
  });
  it('contient 6236 versets', () => {
    const lignes = readFileSync(FICHIER_TANZIL, 'utf-8').split('\n').filter((l) => /^\d+\|\d+\|/.test(l));
    expect(lignes).toHaveLength(6236);
  });
  it('sourates courtes : nombre de versets', () => {
    expect([1, 103, 108, 112, 113, 114].map(nombreVersets)).toEqual([7, 3, 3, 4, 5, 6]);
  });
});

describe('références', () => {
  it('jeton unique avec position Quran.com', () => {
    const r = resoudreRef('q:1:2:1');
    expect(r.texte).toBe(texteVerset(1, 2).split(' ')[0]);
    expect(r.mot).toBe(1);
  });
  it('la basmala en tête de 112:1 ne compte pas dans les mots Quran.com', () => {
    const v = verset(112, 1);
    expect(v.jetons.slice(0, 4).every((j) => j.basmala && j.mot === null)).toBe(true);
    expect(v.jetons[4].mot).toBe(1);
  });
  it('plage de jetons et verset entier', () => {
    expect(resoudreRef('q:112:1:5-8').texte.split(' ')).toHaveLength(4);
    expect(resoudreRef('q:1:1').texte).toBe(texteVerset(1, 1));
  });
  it('refuse une référence hors limites', () => {
    expect(() => resoudreRef('q:1:1:9')).toThrow();
    expect(() => resoudreRef('q:1:8')).toThrow();
  });
  it('URL audio', () => {
    expect(urlAudioMot(1, 2, 1)).toBe('https://audio.qurancdn.com/wbw/001_002_001.mp3');
    expect(urlAudioVerset(112, 4)).toBe('https://verses.quran.com/Alafasy/mp3/112004.mp3');
  });
});
