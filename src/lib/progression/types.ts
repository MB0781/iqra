/** Types de la progression enregistrée dans le navigateur. */

export type Contexte = 'pratique' | 'test' | 'test-etape' | 'revision';

export interface Reponse {
  id?: number;
  element: string;
  lecon: string | null;
  contexte: Contexte;
  correct: boolean;
  /** Élément choisi à tort (pour mémoriser les confusions). */
  choisi?: string;
  date: number;
  /** Séance = jour local AAAA-MM-JJ. */
  seance: string;
}

/** Carte de répétition espacée (FSRS), dates en millisecondes pour le stockage. */
export interface CarteStockee {
  element: string;
  due: number;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: number;
  last_review?: number;
  prioritaire: boolean;
}

export interface EtatLecon {
  lecon: string;
  meilleurScore: number;
  reussie: boolean;
  tentatives: number;
  date: number;
}

export interface EtatEtape {
  etape: number;
  meilleurScore: number;
  reussie: boolean;
  tentatives: number;
  date: number;
}

export interface Confusion {
  cle: string;
  cible: string;
  choisi: string;
  n: number;
  derniere: number;
}

export interface Seance {
  id: string;
  revisionsTotal: number;
  revisionsJustes: number;
}

export interface Meta {
  cle: string;
  valeur: unknown;
}

export interface Donnees {
  reponses: Reponse[];
  cartes: CarteStockee[];
  lecons: EtatLecon[];
  etapes: EtatEtape[];
  confusions: Confusion[];
  seances: Seance[];
  meta: Meta[];
}

export type NomTable = keyof Donnees;

export const CLES: Record<NomTable, string> = {
  reponses: 'id',
  cartes: 'element',
  lecons: 'lecon',
  etapes: 'etape',
  confusions: 'cle',
  seances: 'id',
  meta: 'cle',
};

export const TABLES = Object.keys(CLES) as NomTable[];

export function donneesVides(): Donnees {
  return { reponses: [], cartes: [], lecons: [], etapes: [], confusions: [], seances: [], meta: [] };
}

export interface Reglages {
  tailleArabe: 'normale' | 'grande' | 'tres-grande';
  vitesse: 1 | 0.75;
  theme: 'systeme' | 'clair' | 'sombre';
  aidesParDefaut: { espacement: boolean; voyelles: boolean; syllabes: boolean };
}

export const REGLAGES_DEFAUT: Reglages = {
  tailleArabe: 'normale',
  vitesse: 1,
  theme: 'systeme',
  aidesParDefaut: { espacement: false, voyelles: true, syllabes: false },
};
