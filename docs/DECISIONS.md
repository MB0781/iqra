# Décisions

Choix faits en autonomie, avec leur raison. Le plus récent en bas.

1. **Branche de travail** : le cahier des charges demandait `v1`, mais l'environnement de cette session impose
   `claude/new-session-qbjwjm` (instruction système : ne jamais pousser ailleurs sans permission). La pull request
   part de cette branche vers `main` ; le nom de branche n'a aucune incidence sur le site.
2. **Versions** : Astro 5.18 (et non 7, sortie trop récente), React 19.1, Tailwind 4.1, TypeScript 5.9, Zod 3.25,
   Vitest 3.2, Playwright 1.63 (version préinstallée du navigateur). Toutes publiées depuis plus de deux semaines.
3. **Texte coranique par référence** : les contenus ne contiennent jamais de texte coranique, seulement des références
   `q:S:A:W` résolues à la construction depuis le fichier Tanzil. Chaque bloc affiché porte `data-q` ; un script
   compare le HTML construit à Tanzil, et un test rend chaque référence avec toutes les aides et compare le texte.
   Le découpage en mots suit les espaces du fichier Tanzil (« jetons »).
4. **Basmala en tête de verset** : le fichier Tanzil téléchargé place la basmala au début du verset 1 des sourates
   (sauf 1 et 9). On l'affiche telle quelle (texte intact) ; pour l'audio mot par mot, ces 4 jetons sont exclus de la
   numérotation Quran.com.
5. **Contrôle automatique de l'ordre des notions** : `src/lib/arabe.ts` déduit de chaque texte arabe les notions
   requises (lettres, voyelles, signes, formes liées, madd, article…). Le vérificateur refuse toute notion utilisée
   avant la leçon qui l'enseigne. Répartition des notions par étape dans `src/contenus/notions.ts`.
6. **Tests de fin d'étape « inédits »** : étapes 1–2, aucune question identique (type + cible + options) à un exercice ;
   à partir de l'étape 3, cible jamais interrogée dans l'étape (il n'y a que 28 lettres isolées).
7. **Seuils** : mini-test de leçon 80 % (1 erreur tolérée sur 5) ; test de fin d'étape 85 % comme demandé. Le test
   d'une étape ouverte peut être tenté directement (pour qui connaît déjà les lettres) : c'est le test qui garantit la
   maîtrise, pas le nombre de leçons faites.
8. **Séance = jour local** (AAAA-MM-JJ) pour « raté deux fois dans une séance » et « 3 séances sous 70 % ».
   Auto-évaluation : juste = 1, hésitant = 0,5 (FSRS « Hard »), faux = 0.
9. **Polices** : Noto Naskh Arabic pour les exercices (points nets pour débutants), Amiri Quran pour le Coran.
   Polices KFGQPC non retenues : licence du complexe du roi Fahd non libre pour la redistribution web. Amiri Quran a
   des signes colorés (table COLR) : neutralisés par `@font-palette-values`. Avec l'aide « voyelles », le Coran passe
   en Amiri (même dessinateur, sans couleurs intégrées).
10. **Couleur des voyelles par lettre entière** : Chromium ne peint pas un signe diacritique d'une autre couleur que sa
    lettre (vérifié par capture). On colore donc la grappe lettre + signe selon sa voyelle.
11. **Espacement des lettres sans altérer le texte** : chaque grappe devient un bloc ; un ZWJ ajouté en pseudo-élément
    CSS conserve la forme liée. Le `textContent` reste identique à Tanzil (testé).
12. **Audio** : mots `https://audio.qurancdn.com/wbw/SSS_AAA_WWW.mp3` (documentation Quran Foundation : chemin relatif
    résolu sur audio.qurancdn.com) ; versets `https://verses.quran.com/Alafasy/mp3/SSSAAA.mp3` (récitation 7, Alafasy ;
    exemple de la documentation de l'API v4). Ces domaines étaient **bloqués** dans l'environnement de construction :
    URL non vérifiées en direct, à confirmer (voir rapport final). Les plages de plusieurs mots n'ont pas d'audio
    propre : écoute mot par mot.
13. **Pas de service de polices tiers** : polices auto-hébergées (Fontsource), aucun appel à Google Fonts.
14. **PWA** : service worker écrit à la main (réseau d'abord pour les pages, cache d'abord pour les fichiers du site),
    plus simple et plus prévisible qu'un plugin. L'audio de Quran.com n'est pas mis en cache.
15. **Stockage** : Dexie (IndexedDB) avec schéma versionné ; repli localStorage (un seul document JSON) ; repli mémoire.
    Export JSON versionné avec migrations (`src/lib/progression/echange.ts`).
16. **GitHub Pages** : `base: '/iqra'`, site `https://mb0781.github.io`. Le workflow tente d'activer Pages
    (`configure-pages` avec `enablement: true`) ; si le jeton n'en a pas le droit, un clic humain reste nécessaire.
17. **Agents** : les contenus ont été rédigés par quatre agents pédagogues en parallèle (étapes 1-2, 3-5, 6-7, 8-9),
    contrôlés par le vérificateur automatique ; les revues (gardien du texte, critique design) sont dans `docs/revues/`.
18. **Translittération** : voyelle u écrite « ou », longues â î oû, forme de pause en fin de verset (« aḥad »).
