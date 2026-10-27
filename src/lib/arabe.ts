/**
 * Analyse de l'écriture arabe.
 *
 * Ce module ne modifie jamais un texte : il le lit pour en déduire
 * les notions (lettres, voyelles, signes) qu'il faut connaître pour le déchiffrer,
 * et le découpe en « grappes » (une lettre + ses signes) pour l'affichage.
 */

export const FATHA = 'َ';
export const DAMMA = 'ُ';
export const KASRA = 'ِ';
export const SOUKOUN = 'ْ';
export const SOUKOUN_UTHMANI = 'ۡ';
export const CHADDA = 'ّ';
export const TANWIN_FATH = 'ً';
export const TANWIN_DAMM = 'ٌ';
export const TANWIN_KASR = 'ٍ';
export const ALIF_SUSCRIT = 'ٰ';
export const MADD = 'ٓ';
export const HAMZA_SUSCRITE = 'ٔ';
export const HAMZA_SOUSCRITE = 'ٕ';
export const PETIT_WAW = 'ۥ';
export const PETIT_YA = 'ۦ';
export const ZERO_ROND = '۟';
export const MIM_IQLAB = 'ۢ';
export const MIM_IQLAB_BAS = 'ۭ';
export const TATWEEL = 'ـ';
export const ZWJ = '‍';

/** Lettres de base → identifiant de notion. */
export const LETTRES: Record<string, string> = {
  'ا': 'lettre-alif',
  'ب': 'lettre-ba',
  'ت': 'lettre-ta',
  'ث': 'lettre-tha',
  'ج': 'lettre-jim',
  'ح': 'lettre-hha',
  'خ': 'lettre-kha',
  'د': 'lettre-dal',
  'ذ': 'lettre-dhal',
  'ر': 'lettre-ra',
  'ز': 'lettre-zay',
  'س': 'lettre-sin',
  'ش': 'lettre-chin',
  'ص': 'lettre-sad',
  'ض': 'lettre-dad',
  'ط': 'lettre-tta',
  'ظ': 'lettre-dha',
  'ع': 'lettre-ayn',
  'غ': 'lettre-ghayn',
  'ف': 'lettre-fa',
  'ق': 'lettre-qaf',
  'ك': 'lettre-kaf',
  'ل': 'lettre-lam',
  'م': 'lettre-mim',
  'ن': 'lettre-noun',
  'ه': 'lettre-ha',
  'و': 'lettre-waw',
  'ي': 'lettre-ya',
};

/** Lettres composées : lettre porteuse + notions supplémentaires. */
export const LETTRES_COMPOSEES: Record<string, string[]> = {
  'ء': ['signe-hamza'],
  'أ': ['lettre-alif', 'signe-hamza'],
  'إ': ['lettre-alif', 'signe-hamza'],
  'ؤ': ['lettre-waw', 'signe-hamza'],
  'ئ': ['lettre-ya', 'signe-hamza'],
  'آ': ['lettre-alif', 'signe-hamza', 'signe-madd'],
  'ٱ': ['lettre-alif', 'signe-alif-wasla'],
  'ة': ['lettre-ta', 'lettre-ha', 'signe-ta-marbuta'],
  'ى': ['lettre-alif', 'lettre-ya', 'signe-alif-maqsura'],
};

/** Signes diacritiques → notion. */
export const SIGNES: Record<string, string> = {
  [FATHA]: 'voyelle-fatha',
  [KASRA]: 'voyelle-kasra',
  [DAMMA]: 'voyelle-damma',
  [SOUKOUN]: 'signe-soukoun',
  [SOUKOUN_UTHMANI]: 'signe-soukoun',
  [CHADDA]: 'signe-chadda',
  [TANWIN_FATH]: 'signe-tanwin',
  [TANWIN_DAMM]: 'signe-tanwin',
  [TANWIN_KASR]: 'signe-tanwin',
  [ALIF_SUSCRIT]: 'signe-alif-suscrit',
  [MADD]: 'signe-madd',
  [HAMZA_SUSCRITE]: 'signe-hamza',
  [HAMZA_SOUSCRITE]: 'signe-hamza',
  [PETIT_WAW]: 'signe-petites-lettres',
  [PETIT_YA]: 'signe-petites-lettres',
  [ZERO_ROND]: 'signe-lettre-muette',
  [MIM_IQLAB]: 'signe-mim-iqlab',
  [MIM_IQLAB_BAS]: 'signe-mim-iqlab',
};

const VOYELLES_COURTES = new Set([FATHA, KASRA, DAMMA]);
const TANWINS = new Set([TANWIN_FATH, TANWIN_DAMM, TANWIN_KASR]);

export function estLettre(c: string): boolean {
  return c in LETTRES || c in LETTRES_COMPOSEES;
}

export function estSigne(c: string): boolean {
  return c in SIGNES;
}

/** Une grappe = une lettre (ou un caractère isolé) suivie de ses signes. */
export interface Grappe {
  base: string;
  signes: string;
  texte: string;
}

export function grappes(mot: string): Grappe[] {
  const res: Grappe[] = [];
  for (const c of Array.from(mot)) {
    if (estSigne(c) && res.length > 0) {
      const g = res[res.length - 1];
      g.signes += c;
      g.texte += c;
    } else {
      res.push({ base: c, signes: '', texte: c });
    }
  }
  return res;
}

/** Lettres qui ne s'attachent jamais à la lettre suivante (à gauche). */
export const NON_ATTACHANTES = new Set(['ا', 'أ', 'إ', 'آ', 'ٱ', 'د', 'ذ', 'ر', 'ز', 'و', 'ؤ', 'ة', 'ء', 'ى']);
// Note : ى et ة sont des formes finales ; ء ne s'attache ni avant ni après.
const NE_S_ATTACHE_PAS_AVANT = new Set(['ء']);

/**
 * Pour chaque grappe d'un mot : s'attache-t-elle à la précédente / à la suivante ?
 * Sert à garder la forme contextuelle quand on espace les lettres à l'affichage.
 */
export function liaisons(gs: Grappe[]): { avant: boolean; apres: boolean }[] {
  const lettre = (g: Grappe | undefined) => !!g && (estLettre(g.base) || g.base === TATWEEL);
  return gs.map((g, i) => {
    const prev = gs[i - 1];
    const next = gs[i + 1];
    const avant =
      lettre(g) && lettre(prev) && !NON_ATTACHANTES.has(prev!.base) && !NE_S_ATTACHE_PAS_AVANT.has(g.base);
    const apres =
      lettre(g) && lettre(next) && !NON_ATTACHANTES.has(g.base) && !NE_S_ATTACHE_PAS_AVANT.has(next!.base);
    return { avant, apres };
  });
}

export function estVocalise(texte: string): boolean {
  return Array.from(texte).some((c) => VOYELLES_COURTES.has(c) || TANWINS.has(c) || c === SOUKOUN || c === CHADDA);
}

/**
 * Notions nécessaires pour déchiffrer un texte.
 * Les déductions structurelles (formes liées, madd, article) s'ajoutent aux lettres et signes.
 */
export function notionsRequises(texte: string): Set<string> {
  const notions = new Set<string>();
  const vocalise = estVocalise(texte);
  for (const mot of texte.split(/\s+/).filter(Boolean)) {
    const gs = grappes(mot);
    const lettres = gs.filter((g) => estLettre(g.base));
    for (const g of gs) {
      if (g.base in LETTRES) notions.add(LETTRES[g.base]);
      if (g.base in LETTRES_COMPOSEES) LETTRES_COMPOSEES[g.base].forEach((n) => notions.add(n));
      if (g.base === TATWEEL || g.base === ZWJ) notions.add('notion-formes-liees');
      for (const s of Array.from(g.signes)) notions.add(SIGNES[s]);
    }
    if (lettres.length >= 2) notions.add('notion-formes-liees');
    if (vocalise) {
      lettres.forEach((g, i) => {
        if (i === 0 || g.signes.length > 0) return;
        const prev = lettres[i - 1].signes;
        if ((g.base === 'ا' && prev.includes(FATHA)) || (g.base === 'و' && prev.includes(DAMMA)) || (g.base === 'ي' && prev.includes(KASRA)) || (g.base === 'ى' && prev.includes(FATHA))) {
          notions.add('madd-naturel');
        }
      });
    }
    // Article : ال / ٱل en début de mot, suivi d'au moins une lettre.
    if (lettres.length >= 3 && (lettres[0].base === 'ا' || lettres[0].base === 'ٱ') && lettres[1].base === 'ل') {
      notions.add('notion-article');
      if (lettres[2].signes.includes(CHADDA) && lettres[1].signes === '') notions.add('notion-lettres-solaires');
      else if (lettres[1].signes.includes(SOUKOUN) || lettres[1].signes.includes(SOUKOUN_UTHMANI)) notions.add('notion-lettres-lunaires');
    }
  }
  notions.delete(undefined as unknown as string);
  return notions;
}

/** Caractères autorisés dans les contenus pédagogiques (hors texte coranique). */
const AUTORISES = new Set([
  ...Object.keys(LETTRES),
  ...Object.keys(LETTRES_COMPOSEES),
  ...Object.keys(SIGNES),
  TATWEEL,
  ZWJ,
  ' ',
]);

export interface ProblemeVocalisation {
  texte: string;
  position: number;
  message: string;
}

/**
 * Vérifie un texte pédagogique : caractères autorisés et, s'il est vocalisé,
 * que chaque lettre porte bien sa voyelle (« voyelles complètes »).
 */
export function verifierTextePedagogique(texte: string): ProblemeVocalisation[] {
  const pb: ProblemeVocalisation[] = [];
  Array.from(texte).forEach((c, i) => {
    if (!AUTORISES.has(c)) pb.push({ texte, position: i, message: `caractère inattendu U+${c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}` });
  });
  if (!estVocalise(texte)) return pb;
  for (const mot of texte.split(/\s+/).filter(Boolean)) {
    const gs = grappes(mot).filter((g) => estLettre(g.base));
    gs.forEach((g, i) => {
      const s = g.signes;
      const prev = gs[i - 1]?.signes ?? '';
      const next = gs[i + 1];
      const aVoyelle = Array.from(s).some((c) => VOYELLES_COURTES.has(c) || TANWINS.has(c) || c === SOUKOUN || c === SOUKOUN_UTHMANI || c === ALIF_SUSCRIT);
      if (s.includes(CHADDA) && !Array.from(s).some((c) => VOYELLES_COURTES.has(c) || TANWINS.has(c))) {
        pb.push({ texte: mot, position: i, message: `chadda sans voyelle sur « ${g.base} »` });
        return;
      }
      if (aVoyelle) return;
      // Exceptions où une lettre se lit sans signe propre
      if (g.base === 'ٱ') return; // alif de liaison
      if (g.base === 'ا' && i > 0 && (prev.includes(FATHA) || prev.includes(TANWIN_FATH))) return; // madd ou alif du tanwin
      if (g.base === 'ى' && i > 0 && (prev.includes(FATHA) || prev.includes(TANWIN_FATH))) return;
      if (g.base === 'آ') return;
      if (g.base === 'و' && i > 0 && prev.includes(DAMMA)) return;
      if (g.base === 'ي' && i > 0 && prev.includes(KASRA)) return;
      if (g.base === 'ا' && i === 0 && next?.base === 'ل') return; // alif de l'article
      if (g.base === 'ل' && i === 1 && (gs[0].base === 'ا' || gs[0].base === 'ٱ') && next?.signes.includes(CHADDA)) return; // lam solaire
      if (g.base === 'ا' && i === gs.length - 1 && gs[i - 1]?.base === 'و' && (gs[i - 2]?.signes.includes(DAMMA) || prev.includes(SOUKOUN))) return; // alif après waw du pluriel
      pb.push({ texte: mot, position: i, message: `lettre « ${g.base} » sans voyelle` });
    });
  }
  return pb;
}

/** Translittération lisible de l'identifiant de signe pour les messages. */
export const CLASSE_SIGNE: Record<string, string> = {
  [FATHA]: 'fatha',
  [KASRA]: 'kasra',
  [DAMMA]: 'damma',
  [SOUKOUN]: 'soukoun',
  [SOUKOUN_UTHMANI]: 'soukoun',
  [CHADDA]: 'chadda',
  [TANWIN_FATH]: 'tanwin',
  [TANWIN_DAMM]: 'tanwin',
  [TANWIN_KASR]: 'tanwin',
  [ALIF_SUSCRIT]: 'madd',
  [MADD]: 'madd',
  [PETIT_WAW]: 'madd',
  [PETIT_YA]: 'madd',
};

/**
 * Découpage en syllabes (aide visuelle) : une syllabe commence à chaque lettre
 * qui porte une voyelle (courte, tanwin ou alif suscrit) ; les lettres sans voyelle
 * (soukoun, prolongation, alif de liaison, lâm solaire) restent avec la syllabe en cours.
 * Renvoie des groupes d'indices de grappes.
 */
export function syllabes(gs: Grappe[]): number[][] {
  const res: number[][] = [];
  const porteVoyelle = (g: Grappe) =>
    estLettre(g.base) && Array.from(g.signes).some((c) => VOYELLES_COURTES.has(c) || TANWINS.has(c) || c === ALIF_SUSCRIT);
  gs.forEach((g, i) => {
    const courante = res[res.length - 1];
    const couranteAVoyelle = courante?.some((j) => porteVoyelle(gs[j]));
    if (!courante || (porteVoyelle(g) && couranteAVoyelle)) res.push([i]);
    else courante.push(i);
  });
  return res;
}
