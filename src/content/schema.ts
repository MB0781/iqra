/**
 * Schémas Zod des contenus pédagogiques.
 * Un fichier JSON par leçon dans src/content/lecons/etape-N/,
 * et les éléments (lettres, syllabes, mots) dans src/content/elements/etape-N.json.
 *
 * Références d'éléments dans les leçons :
 *  - un identifiant d'élément pédagogique : « lettre-ba », « syl-ba-a », « mot-kataba »…
 *  - une référence coranique Tanzil : « q:1:2:1 » (sourate:verset:jeton) ou « q:1:2:1-2 », ou « q:1:2 » (verset entier).
 *    Le texte affiché est alors lu dans le fichier Tanzil, jamais recopié.
 */
import { z } from 'zod';

const Id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'identifiant en minuscules-avec-tirets');
export const Ref = z.string().min(1);

export const ElementSchema = z
  .object({
    id: Id,
    type: z.enum(['lettre', 'forme', 'syllabe', 'mot', 'expression']),
    ar: z.string().min(1),
    translit: z.string().min(1),
    /** Nom de la lettre (pour les lettres). */
    nom: z.string().optional(),
    /** Conseil de prononciation pour un francophone. */
    prononciation: z.string().optional(),
    /** Sens en français (facultatif, pour les mots). */
    sens: z.string().optional(),
  })
  .strict();
export type Element = z.infer<typeof ElementSchema>;

const Base = {
  id: z.string().min(1),
  /** Consigne affichée (sinon consigne par défaut du type). */
  consigne: z.string().optional(),
  /** Explication montrée après la réponse (retour explicatif). */
  explication: z.string().min(1),
};

export const ExerciceSchema = z.discriminatedUnion('type', [
  z.object({ ...Base, type: z.literal('ecoute-choisis'), cible: Ref, options: z.array(Ref).min(2).max(4) }).strict(),
  z.object({ ...Base, type: z.literal('lis-choisis-son'), cible: Ref, options: z.array(Ref).min(2).max(4) }).strict(),
  z.object({ ...Base, type: z.literal('paires-minimales'), paire: z.tuple([Ref, Ref]), cible: Ref }).strict(),
  z
    .object({
      ...Base,
      type: z.literal('trouve-lettre'),
      mot: Ref,
      lettre: Ref,
      reponse: z.enum(['debut', 'milieu', 'fin', 'absente']),
    })
    .strict(),
  z
    .object({
      ...Base,
      type: z.literal('assemble'),
      /** Morceaux dans l'ordre de lecture (de droite à gauche). */
      morceaux: z.array(Ref).min(2).max(6),
      distracteurs: z.array(Ref).max(3).optional(),
      resultat: Ref,
    })
    .strict(),
  z
    .object({
      ...Base,
      type: z.literal('classe'),
      categories: z.array(z.object({ id: Id, label: z.string() }).strict()).min(2).max(3),
      elements: z.array(z.object({ ref: Ref, categorie: Id }).strict()).min(3).max(8),
    })
    .strict(),
  z.object({ ...Base, type: z.literal('lis-verifie'), cible: Ref }).strict(),
  z
    .object({
      ...Base,
      type: z.literal('lecture-guidee'),
      /** « S:A1-A2 » */
      versets: z.string().regex(/^\d+:\d+(-\d+)?$/),
      aides: z.array(z.enum(['espacement', 'voyelles', 'syllabes', 'audio'])),
    })
    .strict(),
]);
export type Exercice = z.infer<typeof ExerciceSchema>;
export type TypeExercice = Exercice['type'];

export const BlocSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('texte'), texte: z.string().min(1) }).strict(),
  z.object({ type: z.literal('astuce'), texte: z.string().min(1) }).strict(),
  z.object({ type: z.literal('attention'), texte: z.string().min(1) }).strict(),
  z.object({ type: z.literal('presentation'), element: Ref, note: z.string().optional() }).strict(),
  z.object({ type: z.literal('paire'), elements: z.tuple([Ref, Ref]), note: z.string().min(1) }).strict(),
  z.object({ type: z.literal('galerie'), elements: z.array(Ref).min(2).max(12), note: z.string().optional() }).strict(),
]);
export type Bloc = z.infer<typeof BlocSchema>;

export const LeconSchema = z
  .object({
    id: z.string().regex(/^e\d-l\d{2}$/),
    etape: z.number().int().min(1).max(9),
    ordre: z.number().int().min(1),
    titre: z.string().min(1),
    resume: z.string().min(1),
    duree: z.number().int().min(3).max(12),
    /** Notions introduites par cette leçon. */
    enseigne: z.array(z.string()),
    /** Éléments qui deviennent des cartes de révision une fois la leçon réussie. */
    elementsNouveaux: z.array(Ref),
    theorie: z.array(BlocSchema).min(1),
    pratique: z.array(ExerciceSchema).min(3),
    test: z.array(ExerciceSchema).min(3),
  })
  .strict();
export type Lecon = z.infer<typeof LeconSchema>;

export const TestEtapeSchema = z
  .object({
    etape: z.number().int().min(1).max(9),
    titre: z.string(),
    consigne: z.string(),
    questions: z.array(ExerciceSchema).min(10),
  })
  .strict();
export type TestEtape = z.infer<typeof TestEtapeSchema>;

export const EtapeSchema = z
  .object({
    numero: z.number().int(),
    titre: z.string(),
    objectif: z.string(),
    description: z.string(),
    palier: z.string().optional(),
  })
  .strict();
export type Etape = z.infer<typeof EtapeSchema>;

export const SEUIL_ETAPE = 0.85;
export const SEUIL_LECON = 0.8;
