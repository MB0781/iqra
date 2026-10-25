/** Affiche les jetons Tanzil d'un verset : npx tsx scripts/jetons.ts 112 1 */
import { verset, nombreVersets } from '../src/lib/coran';

const s = Number(process.argv[2]);
const a = process.argv[3] ? [Number(process.argv[3])] : Array.from({ length: nombreVersets(s) }, (_, i) => i + 1);
for (const n of a) {
  const v = verset(s, n);
  console.log(`— ${s}:${n}`);
  for (const j of v.jetons) console.log(`  q:${s}:${n}:${j.index}\t${j.texte}${j.basmala ? '\t(basmala)' : ''}${j.mot ? `\tmot Quran.com ${j.mot}` : ''}`);
}
