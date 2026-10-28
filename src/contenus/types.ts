/** Types partagés entre le serveur (construction) et les composants du navigateur. */
import type { Element } from './schema';

/** Élément prêt à afficher. */
export interface Item {
  ref: string;
  /** Identifiant stable utilisé pour la progression et l'audio. */
  id: string;
  ar: string;
  translit: string;
  type: Element['type'] | 'coran';
  coran: boolean;
  /** Pour une référence coranique : « S:A:W1-W2 » en jetons Tanzil. */
  coranRef?: string;
  nom?: string;
  prononciation?: string;
  sens?: string;
  audio: string | null;
  /** Pour un verset entier : chaque jeton avec son audio mot par mot (null pour la basmala en tête). */
  mots?: { texte: string; audio: string | null }[];
}

export interface ManifesteEntree {
  id: string;
  ar: string;
  translit: string;
  source: 'quran.com-mot' | 'quran.com-verset' | 'enregistrement' | 'synthese-vocale';
  statut: 'disponible' | 'à enregistrer';
  url?: string;
  fichier?: string;
}
