/**
 * Repérage des mots coraniques tapés en dur dans les textes pédagogiques.
 * Les textes doivent citer le Coran par référence [[q:S:A:W]], jamais par recopie.
 */
import { grappes } from '../lib/arabe';
import { nombreVersets, verset } from '../lib/coran';

export const RE_PASSAGE_ARABE = /[؀-ۿݐ-ݿࢠ-ࣿ]+(?:\s+[؀-ۿݐ-ݿࢠ-ࣿ]+)*/g;

/** Forme comparable d'un mot : signes triés dans chaque grappe, ponctuation retirée. */
export function normaliserMot(mot: string): string {
  // NFD : آ précomposé (U+0622) devient ا + ٓ, comme dans Tanzil.
  return grappes(mot.normalize('NFD').replace(/[،؛؟.,]/g, ''))
    .map((g) => g.base + Array.from(g.signes).sort().join(''))
    .join('');
}

/** Lettres de base d'un mot (pour ignorer les lettres et syllabes isolées). */
function nbLettres(mot: string): number {
  return grappes(mot).filter((g) => /[ء-يٱ]/.test(g.base)).length;
}

let cache: Map<string, string> | null = null;

/** Mots de 2 lettres ou plus des sourates étudiées et des étapes 6-7 → première référence. */
export function indexMotsCoran(): Map<string, string> {
  if (cache) return cache;
  cache = new Map();
  // Les sourates étudiées d'abord, pour que la référence pointe vers le passage travaillé.
  const ordre = [1, 112, 113, 114, 108, 103, ...Array.from({ length: 114 }, (_, i) => i + 1)];
  for (const s of ordre) {
    for (let a = 1; a <= nombreVersets(s); a++) {
      for (const j of verset(s, a).jetons) {
        if (j.basmala && !(s === 1 && a === 1)) continue;
        if (nbLettres(j.texte) < 2) continue;
        const cle = normaliserMot(j.texte);
        if (!cache.has(cle)) cache.set(cle, `q:${s}:${a}:${j.index}`);
      }
    }
  }
  return cache;
}

/** Index prioritaire : références déjà utilisées (ex. dans une leçon), puis l'index général. */
export function indexAvecPriorite(refs: string[], resoudre: (r: string) => string): Map<string, string> {
  const m = new Map<string, string>();
  for (const r of refs) {
    if (!/^q:\d+:\d+:\d+$/.test(r)) continue;
    const cle = normaliserMot(resoudre(r));
    if (!m.has(cle)) m.set(cle, r);
  }
  for (const [k, v] of indexMotsCoran()) if (!m.has(k)) m.set(k, v);
  return m;
}

/** Mots coraniques recopiés dans un texte (hors balises [[q:…]]). */
export function motsCoranEnDur(texte: string): string[] {
  const index = indexMotsCoran();
  const sansRefs = texte.replace(/\[\[q:[^\]]+\]\]/g, '');
  return (sansRefs.match(RE_PASSAGE_ARABE) ?? []).flatMap((p) => p.split(/\s+/)).filter((m) => index.has(normaliserMot(m)));
}
