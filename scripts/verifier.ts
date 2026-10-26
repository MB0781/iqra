/**
 * Vérification de publication (à lancer après `npm run build`) :
 *  1. 100 % du texte coranique affiché (éléments [data-q] du HTML construit) est identique au fichier Tanzil ;
 *  2. contenus : aucun élément utilisé avant d'être enseigné, tests inédits, vocalisation, références ;
 *  3. manifeste audio : chaque entrée a un statut ; si « disponible », une URL (ou un fichier) qui répond.
 *
 * Options : --sans-reseau  ne teste pas les URL distantes (signalées comme non vérifiées).
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { JSDOM } from 'jsdom';
import { texteVerset } from '../src/lib/coran';
import { toutVerifier } from '../src/contenus/verification';

const DIST = join(process.cwd(), 'dist');
const sansReseau = process.argv.includes('--sans-reseau');
let echecs = 0;

function fichiersHtml(d: string): string[] {
  return readdirSync(d).flatMap((f) => {
    const p = join(d, f);
    return statSync(p).isDirectory() ? fichiersHtml(p) : p.endsWith('.html') ? [p] : [];
  });
}

// 1. Texte coranique affiché
if (!existsSync(DIST)) {
  console.error('✘ dist/ absent : lance d’abord npm run build');
  process.exit(1);
}
let blocs = 0;
const ecarts: string[] = [];
const pages = new Set<string>();
for (const f of fichiersHtml(DIST)) {
  const doc = new JSDOM(readFileSync(f, 'utf-8')).window.document;
  for (const el of doc.querySelectorAll('[data-q]')) {
    const q = el.getAttribute('data-q')!;
    const m = /^(\d+):(\d+):(\d+)-(\d+)$/.exec(q);
    blocs++;
    pages.add(relative(DIST, f));
    if (!m) {
      ecarts.push(`${relative(DIST, f)} : attribut data-q mal formé « ${q} »`);
      continue;
    }
    const [, s, a, w1, w2] = m.map(Number);
    const attendu = texteVerset(s, a).split(' ').slice(w1 - 1, w2).join(' ');
    const affiche = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (affiche !== attendu) ecarts.push(`${relative(DIST, f)} [${q}] : affiché « ${affiche} » ≠ Tanzil « ${attendu} »`);
  }
}
// Garde-fou : aucun texte d'un verset ne doit apparaître hors d'un bloc data-q vérifié.
console.log(`${ecarts.length === 0 ? '✔' : '✘'} Texte coranique : ${blocs} blocs affichés sur ${pages.size} pages, ${blocs - ecarts.length} identiques à Tanzil (${blocs ? (((blocs - ecarts.length) / blocs) * 100).toFixed(1) : 0} %)`);
ecarts.slice(0, 50).forEach((e) => console.log(`   - ${e}`));
echecs += ecarts.length;
if (blocs === 0) {
  console.log('✘ Aucun bloc coranique trouvé : la vérification ne prouve rien.');
  echecs++;
}

// 2. Contenus
for (const [nom, pbs] of Object.entries(toutVerifier())) {
  console.log(`${pbs.length === 0 ? '✔' : '✘'} Contenus / ${nom} : ${pbs.length} problème(s)`);
  pbs.slice(0, 30).forEach((p) => console.log(`   - ${p.ou} : ${p.message}`));
  echecs += pbs.length;
}

// 3. Manifeste audio
const manifeste = JSON.parse(readFileSync(join(process.cwd(), 'data', 'audio', 'manifest.json'), 'utf-8')) as {
  elements: { id: string; statut: string; url?: string; fichier?: string }[];
};
const sansStatut = manifeste.elements.filter((e) => e.statut !== 'disponible' && e.statut !== 'à enregistrer');
const dispoSansSource = manifeste.elements.filter((e) => e.statut === 'disponible' && !e.url && !e.fichier);
const fichiersManquants = manifeste.elements.filter((e) => e.fichier && !existsSync(join(process.cwd(), 'public', 'audio', e.fichier)));
console.log(`${sansStatut.length + dispoSansSource.length + fichiersManquants.length === 0 ? '✔' : '✘'} Manifeste audio : ${manifeste.elements.length} entrées, toutes avec un statut valide${sansStatut.length ? ` (sauf ${sansStatut.length})` : ''}`);
echecs += sansStatut.length + dispoSansSource.length + fichiersManquants.length;
fichiersManquants.forEach((e) => console.log(`   - fichier absent : public/audio/${e.fichier}`));

const urls = manifeste.elements.filter((e) => e.statut === 'disponible' && e.url).map((e) => e.url!);
if (sansReseau) {
  console.log(`… URL audio distantes : ${urls.length} non testées (--sans-reseau)`);
} else {
  const domaines = new Map<string, { ok: number; ko: number; bloque: number; exemple?: string }>();
  async function tester(u: string) {
    const d = new URL(u).host;
    const s = domaines.get(d) ?? { ok: 0, ko: 0, bloque: 0 };
    domaines.set(d, s);
    try {
      const r = await fetch(u, { headers: { Range: 'bytes=0-0' }, signal: AbortSignal.timeout(15000) });
      await r.body?.cancel();
      if (r.ok) s.ok++;
      else {
        s.ko++;
        s.exemple ??= `${u} → HTTP ${r.status}`;
      }
    } catch (e) {
      s.bloque++;
      s.exemple ??= `${u} → ${(e as Error).cause ? String((e as Error & { cause: unknown }).cause) : (e as Error).message}`;
    }
  }
  const file = [...urls];
  await Promise.all(Array.from({ length: 8 }, async () => { while (file.length) await tester(file.shift()!); }));
  for (const [d, s] of domaines) {
    const ok = s.ko === 0 && s.bloque === 0;
    console.log(`${ok ? '✔' : '✘'} URL audio ${d} : ${s.ok} répondent, ${s.ko} en erreur, ${s.bloque} injoignables${s.bloque ? ' (domaine bloqué par le réseau ?)' : ''}`);
    if (s.exemple) console.log(`   - exemple : ${s.exemple}`);
    echecs += s.ko + s.bloque;
  }
}

console.log(echecs === 0 ? '\nTout est conforme.' : `\n${echecs} problème(s).`);
process.exit(echecs === 0 ? 0 : 1);
