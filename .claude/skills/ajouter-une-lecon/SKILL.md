---
name: ajouter-une-lecon
description: Ajouter ou modifier une leçon d'Iqra' (format JSON, validation Zod, ordre des notions, audio, tests). À utiliser dès qu'on touche à src/contenus/.
---

# Ajouter une leçon

Référence complète : `docs/GUIDE-REDACTION.md`. Schémas : `src/contenus/schema.ts`.

## 1. Choisir la place

- Étape N, ordre k : fichier `src/contenus/lecons/etape-N/eN-lKK.json` (`ordre` = k, sans trou ; renuméroter les
  suivantes si on insère : `id`, nom de fichier et `ordre`).
- Les notions nouvelles vont dans `enseigne` et doivent appartenir à l'étape (`NOTIONS_PAR_ETAPE` dans
  `src/contenus/notions.ts`).

## 2. Écrire

- Éléments pédagogiques nouveaux → `src/contenus/elements/etape-N.json` (id unique : `grep -r '"id": "x"' src/contenus/elements`).
- Texte coranique → **uniquement** des références `q:S:A:W` (`npx tsx scripts/jetons.ts S A` pour les lister) et leur
  translittération dans `src/contenus/coran-translit/etape-N.json`.
- Théorie 3–6 blocs, pratique 6–10 exercices, mini-test 5–6 questions, chaque `explication` dit pourquoi.

## 3. Valider

```
npx tsx scripts/verifier-contenus.ts      # 0 problème exigé
npm run audio:manifest                    # ajoute les nouveaux audios « à enregistrer »
npx tsx scripts/programme.ts              # met à jour docs/PROGRAMME.md
npm test && npm run build && npm run verifier
npx playwright test tests/e2e/parcours.spec.ts   # si l'étape 1 a changé
```

## 4. Audio

Les nouveaux éléments apparaissent dans `/studio` (statut « à enregistrer »). Voir `docs/GUIDE-ENREGISTREMENT.md`.

## Pièges fréquents

- Un mot de 2 lettres demande `notion-formes-liees` (étape 2+) ; un mot vocalisé avec voyelle longue demande `madd-naturel` (étape 4+).
- `ال` en début de mot = article (étape 7). Pas de ة, ى, hamza avant l'étape 6.
- `trouve-lettre` : la lettre ne doit apparaître qu'une fois dans le mot.
- Test de fin d'étape : à partir de l'étape 3, chaque cible doit être inédite dans l'étape.
