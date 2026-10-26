/** Génère docs/PROGRAMME.md à partir des contenus (npx tsx scripts/programme.ts). */
import { writeFileSync } from 'node:fs';
import { contenus } from '../src/contenus/charger';
import { NOTIONS } from '../src/contenus/notions';

const { etapes, lecons, tests } = contenus();
const types = new Map<string, number>();
for (const l of lecons) for (const e of [...l.pratique, ...l.test]) types.set(e.type, (types.get(e.type) ?? 0) + 1);
for (const t of tests.values()) for (const e of t.questions) types.set(e.type, (types.get(e.type) ?? 0) + 1);

let md = `# Programme d'Iqra'\n\n> Fichier généré par \`npx tsx scripts/programme.ts\` à partir de \`src/contenus/\`. Ne pas modifier à la main.\n\n`;
md += `**${lecons.length} leçons**, ${lecons.reduce((s, l) => s + l.pratique.length, 0)} exercices de pratique, ${lecons.reduce((s, l) => s + l.test.length, 0)} questions de mini-test, ${tests.size} tests de fin d'étape (${[...tests.values()].reduce((s, t) => s + t.questions.length, 0)} questions).\n\n`;
md += `Règles : mini-test ≥ 80 % pour valider une leçon ; test de fin d'étape ≥ 85 % (sur des items jamais vus en exercice) pour ouvrir l'étape suivante. Durée visée : 5 à 10 minutes par leçon.\n\n`;
md += `Types d'exercices utilisés : ${[...types].sort((a, b) => b[1] - a[1]).map(([t, n]) => `\`${t}\` (${n})`).join(', ')}.\n\n`;
for (const e of etapes) {
  const ls = lecons.filter((l) => l.etape === e.numero);
  md += `## Étape ${e.numero} : ${e.titre}\n\n**Objectif :** ${e.objectif}${e.palier ? `  \n**Palier :** ${e.palier}` : ''}\n\n${e.description}\n\n`;
  md += `| Leçon | Titre | Durée | Notions enseignées | Exercices | Mini-test |\n|---|---|---|---|---|---|\n`;
  for (const l of ls) md += `| ${l.id} | ${l.titre} | ${l.duree} min | ${l.enseigne.map((n) => NOTIONS[n] ?? n).join(', ') || '(révision, assemblage)'} | ${l.pratique.length} | ${l.test.length} |\n`;
  const t = tests.get(e.numero);
  md += t ? `\nTest de fin d'étape : ${t.questions.length} questions.\n\n` : `\nPas de test de fin d'étape (dernière étape).\n\n`;
}
writeFileSync('docs/PROGRAMME.md', md);
console.log('docs/PROGRAMME.md écrit.');
