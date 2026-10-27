# Avancement

État au 26 octobre 2026 (fin de la première session).

## Fait

- Texte Tanzil téléchargé, intact, contrôlé (empreinte SHA-256, comparaison du HTML construit, rendu de chaque
  référence avec toutes les aides).
- Étapes 1 à 8 complètes (43 leçons + 8 tests de fin d'étape), étape 9 avec 5 sourates (5 leçons) :
  48 leçons, 430 exercices, 257 questions de mini-test, 127 questions de test d'étape. Voir docs/PROGRAMME.md.
- Toutes les pages du cahier des charges, PWA hors ligne, studio d'enregistrement, design system et page /design.
- Progression locale (Dexie, repli localStorage), FSRS, confusions, priorités, retour en arrière, export/import.
- Tests : 92 Vitest, 100 Playwright (parcours complet mobile + ordinateur, axe-core clair/sombre, clavier).
- Lighthouse mobile ≥ 96 partout. Revues du critique design et du gardien du texte, corrections appliquées.
- Workflow GitHub Actions de construction, vérification et déploiement.

## Reste à faire (humain) — voir docs/RAPPORT-FINAL.md

1. Activer GitHub Pages (Settings → Pages → Source : GitHub Actions) et fusionner la PR dans `main`.
2. Enregistrer les 476 audios « à enregistrer » via /studio (docs/GUIDE-ENREGISTREMENT.md).
3. Faire relire les contenus par une personne qualifiée (points listés dans docs/revues/gardien-du-texte-2026-10-26.md).

## Pistes pour une prochaine session

- Repli des étapes fermées dans le parcours ; gabarits de page unifiés (souhaits du critique design).
- Mettre en cache l'audio Quran.com écouté (hors ligne complet), si la licence le permet.
- Rapporter la réussite de la lecture guidée libre dans la progression.
