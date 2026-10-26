# Rapport final — Iqra' v1

Date : 26 octobre 2026. Branche : `claude/new-session-qbjwjm` → pull request vers `main`.
Les sorties de commandes complètes sont dans `docs/preuves/`, les captures dans `docs/captures/` (80 écrans), les
revues dans `docs/revues/`.

## En une phrase

Le site est complet et testé : 9 étapes, 48 leçons, révision espacée, lecture guidée d'Al-Fatiha et de 5 sourates.
Pour qu'il soit en ligne, il reste **un clic** (activer GitHub Pages), puis la fusion de la pull request. Il faudra
ensuite **enregistrer les audios** des lettres et syllabes, et **faire relire** le contenu par une personne qualifiée.

## Critères d'acceptation

| # | Critère | Statut | Preuve |
|---|---|---|---|
| 1 | `npm run build` sans erreur ni avertissement de type | **Prouvé** | `docs/preuves/build.txt` : `0 errors, 0 warnings, 0 hints`, 76 pages |
| 2 | `npm test` à 100 % (progression, FSRS, déblocage, export/import) | **Prouvé** | `docs/preuves/vitest.txt` : 7 fichiers, **92/92** |
| 3 | `npx playwright test` à 100 %, parcours étape 1 → test, mobile et ordinateur | **Prouvé** | `docs/preuves/playwright.txt` : **100/100** (dont le parcours complet sur `mobile` Pixel 7 et `ordinateur` 1280 px) |
| 4 | Vérification : Coran affiché = Tanzil ; 0 élément avant d'être enseigné ; manifeste audio | **Prouvé, sauf la réponse des URL** | `docs/preuves/verifier.txt` : 120/120 blocs identiques (100 %), 0 problème de contenu, 690 entrées avec statut. Les 214 URL « disponibles » (Quran.com) n'ont pas pu être appelées : domaines **bloqués** par le réseau de construction. La CI GitHub refait ce contrôle avec un accès normal |
| 5 | axe-core : 0 violation sérieuse ou critique, clavier | **Prouvé** | Playwright : 19 pages × clair/sombre × mobile/ordinateur + exercice en cours + lecture guidée ; test de navigation complète au clavier ; aucun défilement horizontal |
| 6 | Lighthouse mobile ≥ 90 (accueil et leçon) | **Prouvé** | `docs/preuves/lighthouse.txt` : accueil 100/100/100/100, leçon 98/100/100/100, lecture d'Al-Fatiha 96/100/100/100 |
| 7 | Validation écrite du critique design et du gardien du texte | Voir la section Revues | `docs/revues/critique-design-2026-10-26.md`, `docs/revues/gardien-du-texte-2026-10-26.md` |
| 8 | Étapes 1 à 8 entières, étape 9 avec ≥ 5 sourates | **Prouvé** | `docs/PROGRAMME.md` ; test `contenus.test.ts` (étapes 1-8 avec test d'étape, sourates 112, 113, 114, 108, 103) |
| 9 | Workflow de déploiement qui passe ; URL publique | **Workflow prêt** | `.github/workflows/deploiement.yml`. URL : https://mb0781.github.io/iqra/ après l'activation de Pages (une action humaine, ci-dessous) |
| 10 | Rapport final et pull request | **Fait** | Ce fichier ; pull request en brouillon vers `main` |

## Ce qui est construit

- **Parcours** (`docs/PROGRAMME.md`) :
  - 48 leçons de 5 à 10 minutes, chacune en trois temps : théorie, pratique, mini-test.
  - 430 exercices de 8 types ; 257 questions de mini-test (80 % pour valider une leçon).
  - 8 tests de fin d'étape (127 questions sur des items jamais vus, 85 % pour ouvrir l'étape suivante).
  - L'étape 9 couvre Al-Ikhlas, Al-Kawthar, Al-'Asr, Al-Falaq et An-Nas.
- **Garde-fous automatiques** :
  - texte coranique uniquement par référence Tanzil, et comparaison du HTML construit avec Tanzil ;
  - aucune notion utilisée avant d'être enseignée, déduite automatiquement de chaque texte arabe ;
  - tests de fin d'étape sur des items inédits ;
  - vocalisation complète ;
  - aucun mot coranique recopié dans les explications.
- **Pages** :
  - accueil, avec une première lettre à lire en dix secondes ;
  - première question « Connais-tu déjà des lettres ? », carte du parcours, leçon, test d'étape ;
  - révision du jour, alphabet (28 × 4 formes, paires difficiles), lecture guidée (6 sourates) ;
  - tableau de bord, méthode, sources et licences, confidentialité, réglages ;
  - `/design`, `/studio` (cachée), 404.
- **Apprentissage** :
  - répétition espacée FSRS, plafonnée à 15 cartes, soit 5 minutes environ ;
  - un élément raté deux fois passe en révision prioritaire ;
  - les confusions sont mémorisées et deviennent des paires ciblées ;
  - sous 70 % trois séances de suite, le site propose de revenir à l'étape précédente ;
  - les mots maîtrisés sont soulignés en lecture guidée ;
  - les aides se retirent une à une : espacement, couleurs, syllabes, audio. On lit d'abord, on écoute ensuite.
- **Technique** :
  - Astro 5, React 19, Tailwind 4, Radix, Lucide, Dexie (repli localStorage), ts-fsrs, Zod ;
  - PWA hors ligne pour les pages visitées ;
  - polices auto-hébergées, aucun traqueur.

## Revues

- **Critique design** (`docs/revues/critique-design-2026-10-26.md`) :
  - premier passage : « à corriger, sur une base saine », sans aucun marqueur « fait par une IA » ;
  - trois points bloquants : l'aide syllabes, l'arabe dans le texte français, le contraste des interrupteurs ;
  - ces trois points et la plupart des souhaits ont été corrigés ;
  - la revue de contrôle se trouve en fin de fichier.
- **Gardien du texte** (`docs/revues/gardien-du-texte-2026-10-26.md`) :
  - premier passage : « bloqué », car 167 mots coraniques avaient été recopiés dans des explications ;
  - correction : balises de citation `[[q:S:A:W]]` résolues depuis Tanzil, plus un contrôle automatique `coranEnDur` ;
  - aucune lettre fausse sur les quelque 500 éléments pédagogiques, et les 354 translittérations sont vérifiées ;
  - la revue de contrôle se trouve en fin de fichier.

## Ce qui reste à faire par un humain

1. **Activer GitHub Pages (un clic)** : sur GitHub, ouvrir *Settings → Pages* du dépôt `MB0781/iqra` et choisir
   **Source : GitHub Actions**. Puis fusionner la pull request dans `main` : le site sera publié à
   https://mb0781.github.io/iqra/. (Je n'ai pas d'accès à l'API d'administration du dépôt depuis cette session.)
2. **Domaines réseau à autoriser** pour vérifier ou utiliser l'audio depuis l'environnement Claude Code (pas
   nécessaire pour les visiteurs du site) : `audio.qurancdn.com`, `verses.quran.com` ; et pour la documentation :
   `api-docs.quran.foundation`, `api.quran.com`. Ils étaient bloqués : les URL audio sont construites selon la
   documentation Quran Foundation, mais **n'ont pas été écoutées**. La CI GitHub les teste (étape « Vérification »).
   Point à confirmer à l'écoute : les fichiers par verset (`verses.quran.com/Alafasy/mp3/SSSAAA.mp3`).
3. **Enregistrer 476 audios** (lettres, formes, syllabes, mots d'entraînement) avec un récitateur, sur `/studio`,
   puis déposer le ZIP dans `public/audio/` et lancer `npm run audio:manifest` : `docs/GUIDE-ENREGISTREMENT.md`.
   D'ici là, ces exercices restent utilisables visuellement, avec la mention « audio en préparation ».
4. **Relecture du contenu par une personne qualifiée** (enseignant d'arabe ou de Coran) :
   - les 48 leçons ;
   - les translittérations et la convention choisie (« ou », formes de pause, hamza initiale non notée) ;
   - les points de tajwid minimaux ;
   - les sept points listés par le gardien du texte : alif avec voyelle sans hamza, petit alif dans هٰذَا, etc. ;
   - la présentation de ى comme alif maqsoura ou yâ final ;
   - les sens donnés en français.
5. **Vérifier l'audio Al-Alafasy du verset 1 des sourates 112 à 114** : les exercices « lis puis vérifie » portent
   sur le verset entier, basmala comprise (texte Tanzil), alors que le fichier audio commence sans doute après la
   basmala.

## Limites connues

- Les plages de plusieurs mots coraniques n'ont pas d'audio propre : on les écoute mot par mot.
- L'audio Quran.com n'est pas mis en cache hors ligne, car il est servi par un tiers.
- Les captures sont rendues avec la police de substitution du conteneur. Sur un appareil Apple, le texte latin
  s'affiche en SF Pro.
- Le parcours complet est testé de bout en bout pour l'étape 1. Les étapes 2 à 9 sont couvertes par les contrôles
  automatiques de contenu, et les écrans de leçon par axe-core.
