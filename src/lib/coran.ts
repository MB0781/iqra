/**
 * Accès en lecture seule au texte coranique Tanzil (uthmani, Mushaf de Médine).
 *
 * Règle absolue : le fichier data/quran/quran-uthmani.txt n'est jamais modifié.
 * Ce module ne fait que le lire et le découper en mots (séparés par une espace),
 * exactement comme ils apparaissent dans la source.
 *
 * Module serveur uniquement (lecture du fichier au moment de la construction).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { estLettre } from './arabe';

export const FICHIER_TANZIL = join(process.cwd(), 'data', 'quran', 'quran-uthmani.txt');

export interface Jeton {
  /** Position du jeton dans le verset Tanzil (1 = premier). */
  index: number;
  texte: string;
  /** Position du mot selon Quran.com (audio mot par mot), ou null (basmala en tête, signe isolé). */
  mot: number | null;
  basmala: boolean;
}

export interface Verset {
  sourate: number;
  verset: number;
  texte: string;
  jetons: Jeton[];
}

let cache: Map<string, string> | null = null;

export function parserTanzil(brut: string): Map<string, string> {
  const m = new Map<string, string>();
  for (const ligne of brut.split('\n')) {
    if (!/^\d+\|\d+\|/.test(ligne)) continue;
    const [s, a, ...reste] = ligne.split('|');
    m.set(`${Number(s)}:${Number(a)}`, reste.join('|').replace(/\r$/, ''));
  }
  return m;
}

function versets(): Map<string, string> {
  if (!cache) cache = parserTanzil(readFileSync(FICHIER_TANZIL, 'utf-8'));
  return cache;
}

export function texteVerset(s: number, a: number): string {
  const t = versets().get(`${s}:${a}`);
  if (t === undefined) throw new Error(`Verset introuvable dans Tanzil : ${s}:${a}`);
  return t;
}

export function nombreVersets(s: number): number {
  let n = 0;
  while (versets().has(`${s}:${n + 1}`)) n++;
  return n;
}

/** Jetons de la basmala (texte de 1:1). */
export function jetonsBasmala(): string[] {
  return texteVerset(1, 1).split(' ');
}

export function verset(s: number, a: number): Verset {
  const texte = texteVerset(s, a);
  const bruts = texte.split(' ');
  const basm = jetonsBasmala();
  // On compare les lettres seules : Tanzil écrit parfois la basmala avec un signe de plus (ex. 97:1 « بِّسْمِ »).
  const lettres = (t: string) => Array.from(t).filter(estLettre).join('');
  const prefixeBasmala =
    a === 1 && s !== 1 && s !== 9 && basm.every((b, i) => bruts[i] !== undefined && lettres(bruts[i]) === lettres(b)) ? basm.length : 0;
  let pos = 0;
  const jetons = bruts.map((t, i) => {
    const basmala = i < prefixeBasmala;
    const estMot = !basmala && Array.from(t).some(estLettre);
    return { index: i + 1, texte: t, mot: estMot ? ++pos : null, basmala };
  });
  return { sourate: s, verset: a, texte, jetons };
}

export interface RefCoran {
  ref: string;
  sourate: number;
  verset: number;
  de: number;
  a: number;
  texte: string;
  /** Position Quran.com du premier mot (si la référence vise un seul mot). */
  mot: number | null;
}

const RE_REF = /^q:(\d+):(\d+)(?::(\d+)(?:-(\d+))?)?$/;

export function estRefCoran(ref: string): boolean {
  return RE_REF.test(ref);
}

/** Résout « q:S:A » (verset), « q:S:A:W » (jeton) ou « q:S:A:W1-W2 » (suite de jetons). */
export function resoudreRef(ref: string): RefCoran {
  const m = RE_REF.exec(ref);
  if (!m) throw new Error(`Référence coranique invalide : ${ref}`);
  const s = Number(m[1]);
  const a = Number(m[2]);
  const v = verset(s, a);
  const de = m[3] ? Number(m[3]) : 1;
  const fin = m[4] ? Number(m[4]) : m[3] ? de : v.jetons.length;
  if (de < 1 || fin > v.jetons.length || fin < de) throw new Error(`Référence hors limites : ${ref}`);
  const sel = v.jetons.slice(de - 1, fin);
  return {
    ref,
    sourate: s,
    verset: a,
    de,
    a: fin,
    texte: sel.map((j) => j.texte).join(' '),
    mot: sel.length === 1 ? sel[0].mot : null,
  };
}

/** Audio mot par mot public de Quran.com (chemin relatif résolu sur audio.qurancdn.com). */
export const BASE_AUDIO_MOTS = 'https://audio.qurancdn.com/';
/** Audio verset par verset (récitation Mishary Rashid Alafasy, id 7 dans l'API Quran.com). */
export const BASE_AUDIO_VERSETS = 'https://verses.quran.com/';

const pad = (n: number) => String(n).padStart(3, '0');

export function urlAudioMot(s: number, a: number, mot: number): string {
  return `${BASE_AUDIO_MOTS}wbw/${pad(s)}_${pad(a)}_${pad(mot)}.mp3`;
}

export function urlAudioVerset(s: number, a: number): string {
  return `${BASE_AUDIO_VERSETS}Alafasy/mp3/${pad(s)}${pad(a)}.mp3`;
}

/** Identifiant de fichier sûr pour une référence (q:1:2:1 → q-1-2-1). */
export function idAudioRef(ref: string): string {
  return ref.replace(/:/g, '-');
}

export const SOURATES: Record<number, { nom: string; nomArabe: string; sens: string }> = {
  1: { nom: 'Al-Fatiha', nomArabe: 'الفاتحة', sens: "L'Ouverture" },
  103: { nom: "Al-'Asr", nomArabe: 'العصر', sens: 'Le Temps' },
  108: { nom: 'Al-Kawthar', nomArabe: 'الكوثر', sens: "L'Abondance" },
  112: { nom: 'Al-Ikhlas', nomArabe: 'الإخلاص', sens: 'Le Monothéisme pur' },
  113: { nom: 'Al-Falaq', nomArabe: 'الفلق', sens: "L'Aube naissante" },
  114: { nom: 'An-Nas', nomArabe: 'الناس', sens: 'Les Hommes' },
};
