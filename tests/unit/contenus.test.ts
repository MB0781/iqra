import { describe, expect, it } from 'vitest';
import { toutVerifier } from '../../src/contenus/verification';
import { contenus } from '../../src/contenus/charger';

describe('contenus pédagogiques', () => {
  const res = toutVerifier();
  for (const [nom, pbs] of Object.entries(res)) {
    it(`${nom} : aucun problème`, () => {
      expect(pbs.map((p) => `${p.ou} : ${p.message}`)).toEqual([]);
    });
  }
  it('étapes 1 à 8 complètes avec test de fin d’étape, étape 9 avec au moins 5 sourates', () => {
    const { lecons, tests } = contenus();
    for (let e = 1; e <= 8; e++) {
      expect(lecons.filter((l) => l.etape === e).length).toBeGreaterThanOrEqual(3);
      expect(tests.get(e)?.questions.length).toBeGreaterThanOrEqual(10);
    }
    const sourates9 = new Set(
      lecons.filter((l) => l.etape === 9).flatMap((l) => [...l.pratique, ...l.test]).filter((x) => x.type === 'lecture-guidee').map((x) => (x as { versets: string }).versets.split(':')[0]),
    );
    for (const s of ['112', '113', '114', '108', '103']) expect(sourates9.has(s)).toBe(true);
  });
});

import { motsCoranEnDur } from '../../src/contenus/coran-en-dur';
import { resoudreMarqueurs } from '../../src/contenus/charger';

describe('citations coraniques dans les textes', () => {
  it('un mot du Coran recopié est détecté, une balise ne l’est pas', () => {
    expect(motsCoranEnDur('Lis ٱلْحَمْدُ à voix haute')).toEqual(['ٱلْحَمْدُ']);
    expect(motsCoranEnDur('Lis [[q:1:2:1]] à voix haute')).toEqual([]);
    expect(motsCoranEnDur('La lettre ب et la syllabe بَ')).toEqual([]);
    // آ précomposé alors que Tanzil écrit ا + ٓ
    expect(motsCoranEnDur('Le mot جَآءَ')).toHaveLength(1);
  });
  it('une balise est résolue depuis Tanzil', () => {
    expect(resoudreMarqueurs('Lis [[q:1:2:1]].')).toBe('Lis [[1:2:1-1|ٱلْحَمْدُ]].');
  });
});
