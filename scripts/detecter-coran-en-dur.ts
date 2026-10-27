/**
 * Détecte (et avec --corriger, remplace par des références [[q:S:A:W]]) les mots du Coran tapés en dur
 * dans les textes des leçons (notes, explications, consignes, blocs de texte).
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { indexAvecPriorite, normaliserMot, RE_PASSAGE_ARABE } from '../src/contenus/coran-en-dur';
import { resoudreRef } from '../src/lib/coran';

const corriger = process.argv.includes('--corriger');
const racine = join(process.cwd(), 'src', 'contenus', 'lecons');
let trouves = 0;
for (const d of readdirSync(racine).sort()) {
  for (const f of readdirSync(join(racine, d)).filter((x) => x.endsWith('.json'))) {
    const chemin = join(racine, d, f);
    const brut = readFileSync(chemin, 'utf-8');
    const json = JSON.parse(brut);
    const etape = Number(d.slice(6));
    const refsLocales = [...brut.matchAll(/"(q:\d+:\d+:\d+)"/g)].map((m) => m[1]);
    const index = indexAvecPriorite(refsLocales, (r) => resoudreRef(r).texte);
    let modif = false;
    const visiter = (o: unknown): unknown => {
      if (typeof o === 'string') {
        return o.replace(RE_PASSAGE_ARABE, (passage) =>
          passage
            .split(/(\s+)/)
            .map((mot) => {
              const ref = index.get(normaliserMot(mot));
              if (!ref) return mot;
              trouves++;
              console.log(`${d}/${f} : ${mot} → ${ref}`);
              modif = true;
              return `[[${ref}]]`;
            })
            .join(''),
        );
      }
      if (Array.isArray(o)) return o.map(visiter);
      if (o && typeof o === 'object') {
        return Object.fromEntries(
          Object.entries(o).map(([k, v]) => [k, ['texte', 'note', 'explication', 'consigne', 'resume', 'titre'].includes(k) ? visiter(v) : typeof v === 'object' ? visiter(v) : v]),
        );
      }
      return o;
    };
    const res = visiter(json);
    if (corriger && modif && etape >= 6) writeFileSync(chemin, JSON.stringify(res, null, 2) + '\n');
  }
}
console.log(`${trouves} mot(s) coranique(s) tapé(s) en dur${corriger ? ', remplacé(s) par des références' : ''}.`);
