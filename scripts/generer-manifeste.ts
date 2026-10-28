/**
 * Génère data/audio/manifest.json : un élément par audio nécessaire.
 * - Mots coraniques (un seul jeton) : audio mot par mot Quran.com → « disponible ».
 * - Versets entiers : audio verset par verset Quran.com (Alafasy) → « disponible ».
 * - Lettres, syllabes, mots pédagogiques : « à enregistrer », sauf si un fichier
 *   public/audio/<id>.(mp3|m4a|webm|ogg) existe → « disponible » (enregistrement).
 * Les plages de plusieurs mots coraniques n'ont pas d'audio propre (on écoute mot par mot).
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { contenus, refsBloc, refsExercice } from '../src/contenus/charger';
import type { ManifesteEntree } from '../src/contenus/types';
import { estRefCoran, nombreVersets } from '../src/lib/coran';

const { lecons, tests, item } = contenus();
const refs = new Set<string>();
for (const l of lecons) {
  [...l.elementsNouveaux, ...l.theorie.flatMap(refsBloc), ...l.pratique.flatMap(refsExercice), ...l.test.flatMap(refsExercice)].forEach((r) => refs.add(r));
}
for (const t of tests.values()) t.questions.flatMap(refsExercice).forEach((r) => refs.add(r));
// Lecture libre : tous les versets des sourates proposées
for (const s of [1, 103, 108, 112, 113, 114]) for (let a = 1; a <= nombreVersets(s); a++) refs.add(`q:${s}:${a}`);

const dossierAudio = join(process.cwd(), 'public', 'audio');
// Sons produits par la voix de synthèse (scripts/voix/generer.py) : remplaçables par un enregistrement humain.
const cheminSynthese = join(process.cwd(), 'data', 'audio', 'synthese.json');
const synthese: Record<string, unknown> = existsSync(cheminSynthese) ? JSON.parse(readFileSync(cheminSynthese, 'utf-8')) : {};
const fichiers = existsSync(dossierAudio) ? readdirSync(dossierAudio) : [];

const parId = new Map<string, ManifesteEntree>();
for (const r of [...refs].sort()) {
  const it = item(r);
  if (parId.has(it.id)) continue;
  if (estRefCoran(r)) {
    if (!it.audio) continue; // plage de mots : écoute mot par mot
    const verset = /^q:\d+:\d+$/.test(r);
    parId.set(it.id, { id: it.id, ar: it.ar, translit: it.translit, source: verset ? 'quran.com-verset' : 'quran.com-mot', statut: 'disponible', url: it.audio });
  } else {
    const fichier = fichiers.find((f) => f.replace(/\.(mp3|m4a|webm|ogg|wav)$/, '') === it.id);
    const source = fichier && it.id in synthese ? 'synthese-vocale' : 'enregistrement';
    parId.set(it.id, { id: it.id, ar: it.ar, translit: it.translit, source, statut: fichier ? 'disponible' : 'à enregistrer', ...(fichier ? { fichier } : {}) });
  }
}

const elements = [...parId.values()].sort((a, b) => a.id.localeCompare(b.id));
const res = {
  description: "Manifeste audio d'Iqra'. Généré par `npm run audio:manifest` — ne pas modifier à la main.",
  sources: {
    'quran.com-mot': 'Audio mot par mot public de Quran.com : https://audio.qurancdn.com/wbw/SSS_AAA_WWW.mp3',
    'quran.com-verset': 'Audio verset par verset (Mishary Rashid Alafasy) : https://verses.quran.com/Alafasy/mp3/SSSAAA.mp3',
    enregistrement: 'Enregistré par un récitateur via /studio, fichier dans public/audio/',
    'synthese-vocale': 'Voix de synthèse Piper ar_JO-kareem-medium (scripts/voix/generer.py), fichier dans public/audio/ ; remplaçable par un enregistrement humain',
  },
  total: elements.length,
  disponibles: elements.filter((e) => e.statut === 'disponible').length,
  aEnregistrer: elements.filter((e) => e.statut === 'à enregistrer').length,
  elements,
};
writeFileSync(join(process.cwd(), 'data', 'audio', 'manifest.json'), JSON.stringify(res, null, 2) + '\n');
console.log(`Manifeste : ${res.total} éléments, ${res.disponibles} disponibles, ${res.aEnregistrer} à enregistrer.`);
