# Iqra' — consignes pour Claude

Site gratuit qui apprend à un adulte francophone débutant à lire l'arabe, jusqu'à déchiffrer seul les courtes sourates.
Interface en français. Public : débutant complet. Le propriétaire du projet est lui-même débutant en développement :
explique simplement, note tes choix dans `docs/DECISIONS.md`.

## Règles non négociables

1. **Texte coranique** : uniquement `data/quran/quran-uthmani.txt` (Tanzil, uthmani, CC BY 3.0). Ne jamais le modifier,
   le retaper ni le générer. Dans les contenus, on écrit une **référence** (`q:1:2:1` = sourate 1, verset 2, jeton 1 ;
   `q:1:2:1-3` ; `q:1:2` = verset entier) et le texte est lu dans Tanzil. Toute mise en forme se fait à l'affichage.
   Chaque bloc coranique affiché porte `data-q="S:A:W1-W2"` ; `npm run verifier` compare le HTML construit à Tanzil.
2. **Pas de voix de synthèse pour l'arabe.** Audio mot par mot : `https://audio.qurancdn.com/wbw/SSS_AAA_WWW.mp3` ;
   audio par verset : `https://verses.quran.com/Alafasy/mp3/SSSAAA.mp3`. Lettres, syllabes, mots non coraniques :
   statut « à enregistrer » dans `data/audio/manifest.json`, enregistrés plus tard via `/studio`.
3. Respecter les licences (Tanzil, Quran.com, polices OFL, bibliothèques MIT/Apache). Rien copié d'une appli concurrente.
4. Gratuit, sans publicité, sans traqueur, sans compte. Progression dans le navigateur (IndexedDB, repli localStorage).
5. Distinguer **déchiffrage** (but), **prononciation** (expliquée, jamais corrigée automatiquement), **tajwid** (minimum utile).
6. Arabe entièrement vocalisé dans les contenus pédagogiques (à partir de l'étape 3), `dir="rtl" lang="ar"` sur chaque bloc arabe.
7. Domaine réseau bloqué : ne pas contourner, le noter dans le rapport.

## Structure

```
data/quran/quran-uthmani.txt     texte Tanzil (lecture seule)
data/audio/manifest.json         manifeste audio (généré : npm run audio:manifest)
src/lib/arabe.ts                 analyse de l'arabe (grappes, notions requises, vocalisation)
src/lib/coran.ts                 lecture Tanzil, références q:…, URL audio (serveur uniquement)
src/lib/progression/             stockage Dexie, FSRS, déblocage, confusions, export/import (client)
src/contenus/schema.ts            schémas Zod des contenus
src/contenus/notions.ts           catalogue des notions + répartition par étape
src/contenus/etapes.json          les 9 étapes
src/contenus/elements/etape-N.json  lettres, formes, syllabes, mots (pédagogiques)
src/contenus/coran-translit/*.json  translittération des références coraniques
src/contenus/lecons/etape-N/eN-lXX.json  une leçon par fichier ; test-etape.json = test de fin d'étape
src/contenus/verification.ts      contrôles automatiques (ordre des notions, tests inédits, vocalisation…)
src/components/                  composants Astro et îlots React (exercices, lecture guidée, studio…)
src/pages/                       pages du site
scripts/                         vérification, manifeste audio, captures, image de partage
tests/unit (Vitest)  tests/e2e (Playwright + axe-core)
docs/                            DESIGN, PROGRAMME, DECISIONS, AVANCEMENT, revues, rapport final
```

## Commandes

```
npm run dev                 serveur local (http://localhost:4321/iqra/)
npm run build               astro check + build (doit passer sans erreur ni avertissement)
npm test                    Vitest
npx playwright test         parcours navigateur mobile + ordinateur, axe-core
npm run verifier            Tanzil vs HTML construit, ordre des notions, manifeste audio (après build)
npx tsx scripts/verifier-contenus.ts   contrôle rapide des contenus seuls
IQRA_ETAPES=3,4 npx tsx scripts/verifier-contenus.ts   idem, limité à certaines étapes
npm run audio:manifest      régénère data/audio/manifest.json
```

## Ajouter une leçon

Voir le skill `.claude/skills/ajouter-une-lecon/SKILL.md` et `docs/GUIDE-REDACTION.md`.

## Design

`docs/DESIGN.md` fait foi (tokens dans `src/styles/global.css`). Aucun dégradé violet/bleu, aucun emoji-icône, pas
d'Inter, pas de majuscules d'étiquette, pas de « → » décoratif. Page `/design` = vitrine des composants.

## Méthode de travail

Construire → tester → revue (gardien du texte, critique design, accessibilité) → corriger → re-tester.
Pas de « c'est fini » sans preuve (sortie de commande, capture, rapport). Skills utiles dans `.claude/skills/`.
