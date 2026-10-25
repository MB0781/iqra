/** Vérification rapide des contenus pédagogiques (sans construire le site). */
import { toutVerifier } from '../src/content/verification';

const res = toutVerifier();
let total = 0;
for (const [nom, pbs] of Object.entries(res)) {
  console.log(`${pbs.length === 0 ? '✔' : '✘'} ${nom} : ${pbs.length} problème(s)`);
  pbs.slice(0, 200).forEach((p) => console.log(`   - ${p.ou} : ${p.message}`));
  total += pbs.length;
}
process.exit(total === 0 ? 0 : 1);
