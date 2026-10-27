import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { JSDOM } from 'jsdom';
import TexteArabe from '../../src/components/arabe/TexteArabe';
import { contenus, refsBloc, refsExercice } from '../../src/contenus/charger';
import { estRefCoran, resoudreRef, texteVerset } from '../../src/lib/coran';

const combinaisons = [
  {},
  { voyelles: true },
  { espacement: true },
  { syllabes: true },
  { espacement: true, voyelles: true, syllabes: true },
];

function toutesLesRefsCoraniques(): string[] {
  const { lecons, tests } = contenus();
  const refs = new Set<string>();
  for (const l of lecons) {
    [...l.elementsNouveaux, ...l.theorie.flatMap(refsBloc), ...l.pratique.flatMap(refsExercice), ...l.test.flatMap(refsExercice)].filter(estRefCoran).forEach((r) => refs.add(r));
  }
  for (const t of tests.values()) t.questions.flatMap(refsExercice).filter(estRefCoran).forEach((r) => refs.add(r));
  for (const s of [1, 103, 108, 112, 113, 114]) for (let a = 1; ; a++) {
    try { texteVerset(s, a); refs.add(`q:${s}:${a}`); } catch { break; }
  }
  return [...refs];
}

describe('affichage du texte coranique', () => {
  const refs = toutesLesRefsCoraniques();
  it('il y a des références à vérifier', () => {
    expect(refs.length).toBeGreaterThan(200);
  });
  it('chaque référence, avec chaque combinaison d’aides, affiche exactement le texte Tanzil', () => {
    let n = 0;
    for (const r of refs) {
      const q = resoudreRef(r);
      for (const aides of combinaisons) {
        const html = renderToStaticMarkup(<TexteArabe texte={q.texte} coranRef={`${q.sourate}:${q.verset}:${q.de}-${q.a}`} aides={aides} motsMaitrises={new Set([0])} />);
        const el = new JSDOM(html).window.document.querySelector('[data-q]')!;
        expect(el.textContent).toBe(q.texte);
        expect(el.getAttribute('lang')).toBe('ar');
        expect(el.getAttribute('dir')).toBe('rtl');
        n++;
      }
    }
    expect(n).toBe(refs.length * combinaisons.length);
  }, 120_000);
});
