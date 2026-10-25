import { describe, expect, it } from 'vitest';
import { toutVerifier } from '../../src/content/verification';
import { contenus } from '../../src/content/charger';

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
