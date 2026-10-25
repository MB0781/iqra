# Guide de rédaction des leçons

Ce guide est la référence pour écrire ou modifier une leçon. Les schémas exacts sont dans `src/content/schema.ts`.

## Fichiers

- Une leçon = `src/content/lecons/etape-N/eN-lXX.json` (ex. `e3-l02.json`). `ordre` = 1, 2, 3… sans trou.
- Le test de fin d'étape = `src/content/lecons/etape-N/test-etape.json` (au moins 12 questions ; obligatoire étapes 1 à 8).
- Les éléments (lettres, formes, syllabes, mots) = `src/content/elements/etape-N.json` (tableau). Un élément créé à une
  étape peut être réutilisé dans toutes les étapes suivantes. Avant de créer un identifiant, vérifie qu'il n'existe pas
  déjà (`grep -r '"id": "mot-xxx"' src/content/elements`).
- Translittération des références coraniques = `src/content/coran-translit/etape-N.json` : `{ "q:1:2:1": "al-ḥamdu" }`.

## Identifiants stables

- Lettres : `lettre-ba`… (déjà créées, étape 1). Formes : `forme-ba-debut`, `forme-ba-milieu`, `forme-ba-fin`.
- Syllabes : `syl-ba-a` (بَ), `syl-ba-i` (بِ), `syl-ba-ou` (بُ), `syl-ba-aa` (بَا), `syl-bab-a` (بَبْ)…
- Mots : `mot-kataba`. Expressions : `expr-…`. Toujours minuscules, chiffres et tirets.
- Références coraniques : `q:S:A:W` où W est la position du **jeton** dans la ligne Tanzil (séparé par des espaces).
  Attention : dans Tanzil, le verset 1 de chaque sourate (sauf 1 et 9) commence par les 4 jetons de la basmala.
  Ex. `q:112:1:5` = قُلْ ; `q:1:2:1` = ٱلْحَمْدُ. Ne recopie **jamais** un mot coranique dans un élément : utilise la référence.
  Pour lister les jetons : `npx tsx scripts/jetons.ts 112 1`.

## Translittération (pour francophones)

Simple et constante : a, i, ou ; longues â, î, oû ; ḥ (ح), kh, ʿ (ع), gh, q, ṣ, ḍ, ṭ, ẓ, th (ث), dh (ذ), ch (ش), dj (ج) ;
hamza = ʾ ; lettre doublée = consonne doublée (« rabbi »). Exemple : بِسْمِ = « bismi ».

## Notions et ordre (vérifié automatiquement)

Chaque texte arabe « demande » des notions, déduites automatiquement (lettres, voyelles, signes, formes liées si au moins
deux lettres, madd si voyelle longue, article al-…). Une notion doit être déclarée dans `enseigne` d'une leçon antérieure
ou de la leçon elle-même. Répartition (`src/content/notions.ts`) :

| Étape | Notions |
|---|---|
| 1 | les 28 `lettre-*` (forme isolée, un seul caractère par élément) |
| 2 | `notion-formes-liees` (dès qu'un élément contient 2 lettres ou un tatweel ـ) |
| 3 | `voyelle-fatha`, `voyelle-kasra`, `voyelle-damma` |
| 4 | `madd-naturel`, `signe-soukoun`, `signe-chadda`, `signe-tanwin`, `signe-alif-suscrit` (ٰ) |
| 5 | aucune nouvelle notion : assemblage de 2 à 4 syllabes |
| 6 | `signe-hamza` (ء أ إ ؤ ئ), `signe-madd` (ٓ / آ), `signe-ta-marbuta` (ة), `signe-alif-maqsura` (ى), `signe-petites-lettres` (ۥ ۦ) |
| 7 | `notion-article`, `notion-lettres-lunaires`, `notion-lettres-solaires`, `signe-alif-wasla` (ٱ), `signe-lettre-muette` (۟) |
| 8 | aucune : Al-Fatiha |
| 9 | `signe-mim-iqlab` (ۢ, dans Al-Ikhlas 112:4) |

Conséquence : en étape 1, chaque élément est **une seule lettre isolée** ; en étape 2, mots **non vocalisés** ;
à partir de l'étape 3, tout est vocalisé ; pas de ٱ avant l'étape 7, pas de ة / ى / hamza avant l'étape 6.

## Structure d'une leçon

1. **Théorie courte** (3 à 6 blocs) : `texte`, `presentation` (un élément + note), `paire` (deux éléments à distinguer),
   `galerie`, `astuce`, `attention`. Phrases courtes, tutoiement, ton sobre et chaleureux. Gras avec `**…**`.
2. **Pratique active** (6 à 10 exercices) : retour immédiat via `explication` (toujours dire *pourquoi*).
   Entrelacer avec des éléments des leçons précédentes.
3. **Mini-test** (5 à 6 questions), 80 % pour valider la leçon.
4. Durée visée : 5 à 10 minutes (`duree`).

## Types d'exercices

| type | champs | usage |
|---|---|---|
| `ecoute-choisis` | `cible`, `options` (2–4, contient la cible) | on entend (ou on lit la translittération si l'audio manque) → choisir l'arabe |
| `lis-choisis-son` | `cible`, `options` | on voit l'arabe → choisir le son (translittération) |
| `paires-minimales` | `paire` [a, b], `cible` | distinguer deux sons proches (ح/ه, ع/أ, ق/ك, ص/س, ط/ت, ض/د, ظ/ذ, ث/س, ذ/ز, غ/ر) |
| `trouve-lettre` | `mot`, `lettre` (élément de type lettre), `reponse` : debut / milieu / fin / absente | la lettre ne doit apparaître qu'une fois dans le mot |
| `assemble` | `morceaux` (dans l'ordre de lecture), `distracteurs?`, `resultat` | remettre syllabes ou lettres dans l'ordre |
| `classe` | `categories` (2–3), `elements` [{ref, categorie}] (3–8) | solaire/lunaire, court/long, avec/sans soukoun… |
| `lis-verifie` | `cible` | lire à voix haute, écouter la référence, s'auto-évaluer juste / hésitant / faux |
| `lecture-guidee` | `versets` « S:A1-A2 », `aides` | versets avec aides : espacement, voyelles, syllabes, audio |

## Test de fin d'étape (85 % pour débloquer l'étape suivante)

- Items **jamais vus** en exercice : aucune question identique (même type, cible et options) à un exercice de l'étape ;
  à partir de l'étape 3, la `cible` ne doit avoir été interrogée dans aucun exercice de l'étape (crée des syllabes ou
  mots nouveaux, construits uniquement avec des notions déjà enseignées).
- Mélange de toutes les notions de l'étape.

## Contrôle

```
npx tsx scripts/verifier-contenus.ts          # tout
IQRA_ETAPES=3,4,5 npx tsx scripts/verifier-contenus.ts   # seulement ces étapes
```
Zéro problème exigé. Puis `npm run audio:manifest` pour mettre à jour le manifeste audio.
