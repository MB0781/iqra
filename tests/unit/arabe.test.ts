import { describe, expect, it } from 'vitest';
import { grappes, liaisons, notionsRequises, syllabes, verifierTextePedagogique, estVocalise } from '../../src/lib/arabe';

const sylls = (mot: string) => {
  const gs = grappes(mot);
  return syllabes(gs).map((s) => s.map((i) => gs[i].texte).join(''));
};

describe('grappes', () => {
  it('rattache les signes à leur lettre sans rien perdre', () => {
    const mot = 'كَتَبَ';
    const gs = grappes(mot);
    expect(gs.map((g) => g.base)).toEqual(['ك', 'ت', 'ب']);
    expect(gs.map((g) => g.texte).join('')).toBe(mot);
  });
  it('liaisons : د ne s’attache pas à la lettre suivante', () => {
    const l = liaisons(grappes('بدر'));
    expect(l).toEqual([
      { avant: false, apres: true },
      { avant: true, apres: false },
      { avant: false, apres: false },
    ]);
  });
});

describe('syllabes', () => {
  it('découpe un mot simple', () => {
    expect(sylls('كَتَبَ')).toEqual(['كَ', 'تَ', 'بَ']);
  });
  it('garde soukoun et prolongation dans la syllabe', () => {
    expect(sylls('بِسْمِ')).toEqual(['بِسْ', 'مِ']);
    expect(sylls('كِتَابٌ')).toEqual(['كِ', 'تَا', 'بٌ']);
  });
  it('alif de liaison et lâm solaire restent avec la syllabe suivante', () => {
    expect(sylls('ٱلرَّحْمَٰنِ')).toEqual(['ٱلرَّحْ', 'مَٰ', 'نِ']);
  });
});

describe('notions requises', () => {
  it('une lettre isolée ne demande que cette lettre', () => {
    expect([...notionsRequises('ب')]).toEqual(['lettre-ba']);
  });
  it('un mot demande les formes liées, les voyelles et le madd', () => {
    const n = notionsRequises('كِتَابٌ');
    for (const x of ['notion-formes-liees', 'voyelle-kasra', 'voyelle-fatha', 'madd-naturel', 'signe-tanwin']) expect(n.has(x)).toBe(true);
  });
  it('article : lettres solaires et lunaires', () => {
    expect(notionsRequises('ٱلشَّمْسُ').has('notion-lettres-solaires')).toBe(true);
    expect(notionsRequises('الْقَمَرُ').has('notion-lettres-lunaires')).toBe(true);
    expect(notionsRequises('ٱلشَّمْسُ').has('signe-alif-wasla')).toBe(true);
  });
  it('signes du Mushaf', () => {
    expect(notionsRequises('لَّهُۥ').has('signe-petites-lettres')).toBe(true);
    expect(notionsRequises('ءَامَنُوا۟').has('signe-lettre-muette')).toBe(true);
    expect(notionsRequises('أَحَدٌۢ').has('signe-mim-iqlab')).toBe(true);
    expect(notionsRequises('صَلَاةٌ').has('signe-ta-marbuta')).toBe(true);
  });
});

describe('vérification des textes pédagogiques', () => {
  it('accepte un mot entièrement vocalisé', () => {
    expect(verifierTextePedagogique('كَتَبَ')).toEqual([]);
    expect(verifierTextePedagogique('كِتَابًا')).toEqual([]);
  });
  it('signale une lettre sans voyelle dans un mot vocalisé', () => {
    expect(verifierTextePedagogique('كَتَب')).toHaveLength(1);
  });
  it('signale une chadda sans voyelle', () => {
    expect(verifierTextePedagogique('رَبّ')[0].message).toMatch(/chadda/);
  });
  it('signale un caractère latin', () => {
    expect(verifierTextePedagogique('بa')[0].message).toMatch(/inattendu/);
  });
  it('un mot non vocalisé (étape 2) est accepté tel quel', () => {
    expect(estVocalise('باب')).toBe(false);
    expect(verifierTextePedagogique('باب')).toEqual([]);
  });
});
