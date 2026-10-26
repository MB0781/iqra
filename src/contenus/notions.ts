/**
 * Catalogue des notions enseignées. Chaque leçon déclare dans `enseigne`
 * les notions qu'elle introduit ; le vérificateur s'assure qu'aucun contenu
 * n'utilise une notion avant la leçon qui l'enseigne.
 */
import { LETTRES } from '../lib/arabe';

export const NOMS_LETTRES: Record<string, { nom: string; son: string }> = {
  'lettre-alif': { nom: 'alif', son: 'support de voyelle, ou « â » long' },
  'lettre-ba': { nom: 'bâ', son: 'b' },
  'lettre-ta': { nom: 'tâ', son: 't' },
  'lettre-tha': { nom: 'thâ', son: 'th (anglais « think »)' },
  'lettre-jim': { nom: 'jîm', son: 'dj' },
  'lettre-hha': { nom: 'ḥâ', son: 'ḥ (souffle serré, gorge)' },
  'lettre-kha': { nom: 'khâ', son: 'kh (« jota » espagnole)' },
  'lettre-dal': { nom: 'dâl', son: 'd' },
  'lettre-dhal': { nom: 'dhâl', son: 'dh (anglais « this »)' },
  'lettre-ra': { nom: 'râ', son: 'r roulé' },
  'lettre-zay': { nom: 'zây', son: 'z' },
  'lettre-sin': { nom: 'sîn', son: 's' },
  'lettre-chin': { nom: 'chîn', son: 'ch' },
  'lettre-sad': { nom: 'ṣâd', son: 'ṣ (s emphatique)' },
  'lettre-dad': { nom: 'ḍâd', son: 'ḍ (d emphatique)' },
  'lettre-tta': { nom: 'ṭâ', son: 'ṭ (t emphatique)' },
  'lettre-dha': { nom: 'ẓâ', son: 'ẓ (dh emphatique)' },
  'lettre-ayn': { nom: 'ʿayn', son: 'ʿ (contraction de la gorge)' },
  'lettre-ghayn': { nom: 'ghayn', son: 'gh (r grasseyé)' },
  'lettre-fa': { nom: 'fâ', son: 'f' },
  'lettre-qaf': { nom: 'qâf', son: 'q (k du fond de la gorge)' },
  'lettre-kaf': { nom: 'kâf', son: 'k' },
  'lettre-lam': { nom: 'lâm', son: 'l' },
  'lettre-mim': { nom: 'mîm', son: 'm' },
  'lettre-noun': { nom: 'noûn', son: 'n' },
  'lettre-ha': { nom: 'hâ', son: 'h (expiré, comme « hop » en anglais)' },
  'lettre-waw': { nom: 'wâw', son: 'w, ou « oû » long' },
  'lettre-ya': { nom: 'yâ', son: 'y, ou « î » long' },
};

export const NOTIONS: Record<string, string> = {
  ...Object.fromEntries(Object.values(LETTRES).map((id) => [id, `Lettre ${NOMS_LETTRES[id].nom}`])),
  'notion-formes-liees': 'Les formes des lettres selon leur position',
  'voyelle-fatha': 'Fatha (a)',
  'voyelle-kasra': 'Kasra (i)',
  'voyelle-damma': 'Damma (ou)',
  'madd-naturel': 'Voyelles longues (madd naturel)',
  'signe-soukoun': 'Soukoun (absence de voyelle)',
  'signe-chadda': 'Chadda (lettre doublée)',
  'signe-tanwin': 'Tanwin (an, in, oun)',
  'signe-alif-suscrit': 'Petit alif suscrit (â)',
  'signe-hamza': 'Hamza (coup de glotte)',
  'signe-madd': 'Signe madd (prolongation)',
  'signe-ta-marbuta': 'Tâ marbouta',
  'signe-alif-maqsura': 'Alif maqsoura',
  'signe-petites-lettres': 'Petits wâw et yâ de prolongation',
  'notion-article': "L'article al-",
  'notion-lettres-solaires': 'Lettres solaires',
  'notion-lettres-lunaires': 'Lettres lunaires',
  'signe-alif-wasla': 'Alif de liaison (wasla)',
  'signe-lettre-muette': 'Lettre écrite mais non prononcée',
  'signe-mim-iqlab': 'Petit mîm (noûn prononcé m)',
};

export function estNotion(id: string): boolean {
  return id in NOTIONS;
}

/**
 * Répartition prévue des notions par étape (programme).
 * Le vérificateur contrôle que chaque leçon n'enseigne que des notions de son étape.
 */
export const NOTIONS_PAR_ETAPE: Record<number, string[]> = {
  1: Object.values(LETTRES),
  2: ['notion-formes-liees'],
  3: ['voyelle-fatha', 'voyelle-kasra', 'voyelle-damma'],
  4: ['madd-naturel', 'signe-soukoun', 'signe-chadda', 'signe-tanwin', 'signe-alif-suscrit'],
  5: [],
  6: ['signe-hamza', 'signe-madd', 'signe-ta-marbuta', 'signe-alif-maqsura', 'signe-petites-lettres'],
  7: ['notion-article', 'notion-lettres-lunaires', 'notion-lettres-solaires', 'signe-alif-wasla', 'signe-lettre-muette'],
  8: [],
  9: ['signe-mim-iqlab'],
};
