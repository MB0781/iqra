/**
 * Intègre les enregistrements libres VALIDÉS à l'écoute (page /studio/sources/).
 * Entrée : data/audio/validation-audio.json  { "valide": { "lettre-ba": "Bapron.wav", "lettre-lam": "aucun", … } }
 * Effet : copie public/audio/commons/<fichier> vers public/audio/<id>.wav pour la lettre et ses formes,
 *         et écrit les crédits (auteur, licence, lien) dans data/audio/credits.json.
 * Puis lancer : npm run audio:manifest
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { contenus } from '../src/contenus/charger';

const racine = process.cwd();
const validation = JSON.parse(readFileSync(join(racine, 'data/audio/validation-audio.json'), 'utf-8')) as { valide: Record<string, string> };
const { fichiers: sources } = JSON.parse(readFileSync(join(racine, 'data/audio/candidats-lettres.json'), 'utf-8')) as {
  fichiers: Record<string, { url: string; page: string; auteur: string; licence: string }>;
};
const dossierCommons = join(racine, 'public/audio/commons');
mkdirSync(dossierCommons, { recursive: true });

/** Télécharge un fichier validé depuis Wikimedia, en respectant ses limites de débit. */
async function telecharger(fichier: string): Promise<void> {
  const dest = join(dossierCommons, fichier);
  if (existsSync(dest)) return;
  for (;;) {
    const r = await fetch(sources[fichier].url, { headers: { 'User-Agent': 'IqraEducationalSite/1.0 (https://github.com/MB0781/iqra)' } });
    if (r.ok) {
      writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
      return;
    }
    const attente = Number(r.headers.get('retry-after') ?? 60);
    console.log(`Wikimedia demande d'attendre ${attente} s…`);
    await new Promise((ok) => setTimeout(ok, attente * 1000));
  }
}
const cheminCredits = join(racine, 'data/audio/credits.json');
const credits: Record<string, { auteur: string; licence: string; source: string; fichierOrigine: string }> = existsSync(cheminCredits) ? JSON.parse(readFileSync(cheminCredits, 'utf-8')) : {};

const { elements } = contenus();
let n = 0;
for (const [lettre, fichier] of Object.entries(validation.valide)) {
  if (!fichier || fichier === 'aucun') continue;
  const src = sources[fichier];
  if (!src) throw new Error(`Fichier inconnu : ${fichier}`);
  await telecharger(fichier);
  const base = lettre.replace(/^lettre-/, '');
  // La lettre et ses formes (début, milieu, fin) partagent le même son.
  const cibles = [...elements.values()].filter((e) => e.id === lettre || e.id.startsWith(`forme-${base}-`)).map((e) => e.id);
  for (const id of cibles) {
    copyFileSync(join(dossierCommons, fichier), join(racine, 'public/audio', `${id}.wav`));
    credits[id] = { auteur: src.auteur, licence: src.licence, source: src.page, fichierOrigine: fichier };
    n++;
  }
}
writeFileSync(cheminCredits, JSON.stringify(credits, null, 1) + '\n');
console.log(`${n} éléments reçoivent un enregistrement validé. Lance maintenant : npm run audio:manifest`);
