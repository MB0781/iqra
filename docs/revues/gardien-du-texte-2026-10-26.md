# Revue du gardien du texte arabe — 26 octobre 2026

Révision du dépôt : `6fe539a` (site déjà construit dans `dist/`). Revue en lecture seule : seul ce rapport a été écrit.

## Verdict : BLOQUÉ

Le texte coranique **affiché dans les blocs `data-q`** est identique à Tanzil à 100 %, et les éléments pédagogiques
ne contiennent aucune faute de lettre ni de vocalisation. Le blocage vient d'un seul problème, de structure :
**167 mots coraniques sont retapés à la main** dans les textes libres des leçons des étapes 6 et 7 (notes de théorie,
explications), dont deux versets entiers. C'est contraire à la règle 1 de `CLAUDE.md` (« ne jamais le retaper »).
Ces mots échappent aussi à `npm run verifier`, et 69 d'entre eux ne sont pas identiques à Tanzil octet par octet.
Aucune lettre fausse n'a été trouvée dans ces copies : le blocage porte sur la règle, pas sur une erreur visible.

## 1. Méthode

1. Lancement de `npm test` et de `npx tsx scripts/verifier.ts --sans-reseau`.
2. Empreinte SHA-256 de `data/quran/quran-uthmani.txt`, recherche de texte coranique tapé en dur dans `src/` :
   chaque suite de lettres arabes des fichiers `.json/.ts/.tsx/.astro` est comparée à tous les jetons Tanzil
   (égalité octet par octet, puis égalité après remise des signes dans l'ordre canonique Unicode, NFD), et aux bigrammes
   Tanzil (squelette sans voyelles).
3. Relecture des 500 éléments de `src/content/elements/etape-1..7.json`, un par un, avec la décomposition Unicode de
   chaque caractère (`unicodedata.name`), comparée à la translittération ; inventaire de tous les caractères utilisés.
4. Comparaison des **354 translittérations** de `src/content/coran-translit/*.json` (toutes, pas un échantillon)
   avec le texte Tanzil de chaque référence.
5. Classement de chaque mot arabe des textes libres des leçons (`src/content/lecons/**`) : élément connu, fragment
   (lettre, syllabe, signe), jeton Tanzil. Contrôle approché de l'ordre des notions et de la vocalisation dans ces textes.

Scripts (hors dépôt) : `/tmp/claude-0/-home-user-iqra/92cf249d-f702-5387-866a-e674cabea1c4/scratchpad/`
(`chercher.py`, `elements.py`, `ordre.py`, `libres.py`, `translit.py`, `ordrelibre.py`).

## 2. Sorties des commandes

`npm test` :

```
 ✓ tests/unit/coran.test.ts (9 tests)
 ✓ tests/unit/depot.test.ts (32 tests)
 ✓ tests/unit/revision.test.ts (12 tests)
 ✓ tests/unit/arabe.test.ts (14 tests)
 ✓ tests/unit/regles.test.ts (12 tests)
 ✓ tests/unit/contenus.test.ts (6 tests)
 ✓ tests/unit/texte-coran.test.tsx (2 tests)
 Test Files  7 passed (7)
      Tests  87 passed (87)
```

`npx tsx scripts/verifier.ts --sans-reseau` :

```
✔ Texte coranique : 97 blocs affichés sur 25 pages, 97 identiques à Tanzil (100.0 %)
✔ Contenus / structure : 0 problème(s)
✔ Contenus / ordreNotions : 0 problème(s)
✔ Contenus / testsInedits : 0 problème(s)
✔ Contenus / texteArabe : 0 problème(s)
✔ Contenus / refsCoran : 0 problème(s)
✔ Manifeste audio : 690 entrées, toutes avec un statut valide
… URL audio distantes : 214 non testées (--sans-reseau)
Tout est conforme.
```

Empreinte : `sha256sum data/quran/quran-uthmani.txt` donne
`bf4f57b968d03f4131c070b1e285da9be0e0a108a21c910e872801ca273312c8`, la valeur attendue par
`tests/unit/coran.test.ts`. Le fichier est **intact** (dernière modification dans git : commit `9b73090`, l'ajout initial).

Limite : le vérificateur ne contrôle que les éléments HTML qui portent `data-q`. Le texte arabe des champs `texte`,
`note` et `explication` n'est contrôlé par aucun outil (voir écart A).

## 3. Écarts certains

### A. Mots coraniques retapés dans les textes libres des leçons (BLOQUANT, règle 1)

Les champs `note`, `texte` et `explication` contiennent des mots du Coran tapés en clair au lieu d'une référence
`q:S:A:W`. Ils s'affichent comme du texte simple : sans `data-q`, donc non vérifiés, et sans `lang="ar" dir="rtl"`.
Exemple dans `dist/lecon/e6-l03/index.html` :
`<p class="">لَيْلَةِ : « laylati », la nuit (de)…</p>`.

| Fichier | Mots retapés | Exemples (référence Tanzil) |
|---|---|---|
| `etape-6/e6-l01.json` | 9 | أَحَدٌ (112:1:8), نَعْبُدُ (1:5:2), إِيَّاكَ, أَنْعَمْتَ |
| `etape-6/e6-l02.json` | 19 | يُؤْمِنُونَ (2:3:2), شَانِئَكَ (108:3:2), جَآءَ, إِنَّآ, لَآ, إِلَٰهَ, سُئِلَتْ |
| `etape-6/e6-l03.json` | 9 | لَيْلَةِ (97:1:8), أَنزَلْنَٰهُ, جَآءَهُ, سِنَةٌ, رِحْلَةَ, خَاطِئَةٍ, هُمَزَةٍ, عَامِلَةٌ, نَاقَةَ |
| `etape-6/e6-l04.json` | 12 | عَلَىٰ, فِى, هِىَ, شَىْءٍ, حَتَّىٰ, هُدًى, طَغَىٰ, يَخْشَىٰ, وَلِىَ, أَبِى |
| `etape-6/e6-l05.json` | 16 | لَّهُۥ, بِهِۦ, رَبُّهُۥ, كُرْسِيُّهُ, خَلَقَهُۥ, فَأُمُّهُۥ, تَأْخُذُهُۥ, مَالُهُۥ |
| `etape-6/test-etape.json` | 8 | أُنزِلَ, تُؤْثِرُونَ, قُرْءَانٌ, جَارِيَةٌ, قَيِّمَةٌ, سَجَىٰ, أَهْلِهِۦ, بِإِذْنِهِۦ |
| `etape-7/e7-l01.json` | 5 | أَلْفِ (97:3:5), عِلْمِهِۦٓ (2:255:37), أَعُوذُ |
| `etape-7/e7-l02.json` | 1 | عَلَيْهِمْ (1:7:4) |
| `etape-7/e7-l03.json` | 32 | فِى ٱلْعُقَدِ (113:4:4-5), مَلِكِ ٱلنَّاسِ (114:2), يَوْمِ ٱلدِّينِ, ٱلنَّفَّٰثَٰتِ, بِرَبِّ ٱلْفَلَقِ |
| `etape-7/e7-l04.json` | 19 | ءَامَنُوا۟, وَتَوَاصَوْا۟, أُو۟لَٰٓئِكَ, ٱلصَّٰلِحَٰتِ, بِٱلصَّبْرِ |
| `etape-7/e7-l05.json` | 21 | **versets entiers** : ٱلرَّحْمَٰنِ ٱلرَّحِيمِ (1:3, ligne 32) et مَٰلِكِ يَوْمِ ٱلدِّينِ (1:4, ligne 33, `test/t4`) ; بِسْمِ ٱللَّهِ |
| `etape-7/test-etape.json` | 16 | ٱلسَّمَٰوَٰتِ, ٱلصَّلَوٰةَ, ٱلصِّرَٰطَ, إِلَٰهِ ٱلنَّاسِ, ٱلْمَغْضُوبِ |

Total : 167 occurrences dans 12 fichiers. La liste complète, mot par mot, se refait avec
`python3 -I libres.py TANZIL` (dans le dossier des scripts).

- **Conformité des copies** : 98 copies sont identiques à Tanzil octet par octet. Les **69 autres** (marquées par
  `*` dans la sortie du script) ont la voyelle tapée **avant** la chadda (par exemple `ن + َ + ّ` dans ٱلنَّاسِ), alors
  que Tanzil met toujours la chadda d'abord (23 016 cas dans Tanzil, 0 dans l'autre ordre). À l'écran rien ne change,
  mais ce n'est pas le texte Tanzil, et cela prouve que ces mots ont été retapés. Aucune lettre ni voyelle fausse.
- **Correction proposée** (pour le développeur, pas faite ici) :
  1. Ajouter dans les textes libres une balise de référence, par exemple `[[q:97:1:8]]`, que `TexteRiche` remplace à
     l'affichage par `<TexteArabe coranRef="97:1:8">` (texte lu dans Tanzil, `data-q`, `lang="ar" dir="rtl"`).
  2. Remplacer les 167 occurrences par ces balises.
  3. Ajouter un contrôle dans `src/content/verification.ts` : tout mot arabe d'un texte libre doit être soit un
     fragment (lettre, syllabe, signe), soit le `ar` d'un élément pédagogique ; un jeton Tanzil retapé est refusé.
- Les étapes 4 et 5 contiennent aussi 8 mots qui existent dans Tanzil (ذَا, كَيْفَ, مَرَّ, عَلَّمَ, سَلَّمَ). Ce sont des
  mots d'arabe courant, déjà présents comme éléments, pas des citations : **acceptable**.

### B. Arabe affiché sans `lang="ar" dir="rtl"` dans les textes libres (règle 6, accessibilité)

`src/components/ui/TexteRiche.tsx` affiche les notes et explications sans baliser l'arabe qu'elles contiennent :
les mots de l'écart A, mais aussi des fragments comme جَدْ / دِي, ة, ال. Un lecteur d'écran les lira avec une voix française.
Correction proposée : dans `TexteRiche`, entourer chaque suite arabe d'un `<span lang="ar" dir="rtl">`. La correction de A
règle le cas des mots coraniques. Ce n'est pas bloquant à lui seul.

### C. Ordre voyelle / chadda dans 7 éléments (encodage, sans effet visuel, non bloquant)

`src/content/elements/etape-7.json` : `mot-ach-chams` (الشَّمْسُ), `mot-an-nour` (النُّورُ), `mot-as-salam` (السَّلَامُ),
`mot-ad-dars` (الدَّرْسُ), `mot-ar-radjoul` (الرَّجُلُ), `mot-at-tin` (التِّينُ), `mot-adh-dhahab` (الذَّهَبُ).
Ces mots ont la voyelle **avant** la chadda (U+064E/064F/0650 puis U+0651), alors que les 17 autres éléments avec chadda
(étapes 4 et 5) et Tanzil mettent la chadda d'abord. Correction : réécrire la lettre doublée sous la forme
lettre + `ّ` + voyelle (exemple : `ش ّ َ`). Même chose dans les textes libres `e4-l03`, `e4-l05`, `e5-l01..03`,
`e7-l02` (ces mots sont listés par `python3 -I ordre.py`).

## 4. Résultats sans écart

**Éléments pédagogiques (500 éléments, étapes 1 à 7)** :

- Inventaire des caractères : seulement des lettres arabes standard (U+0621 à U+064A), les signes U+064B à U+0652,
  ٰ (U+0670), ٱ (U+0671), le tatweel et l'espace. **Aucun ی, ک ni caractère persan ou ourdou** ; ى (U+0649) apparaît
  seulement là où il le faut (`lettre-alif-maqsura`, `mot-macha`, `mot-baka`).
- Étape 1 : 28 lettres isolées, un seul caractère chacune, points corrects. Étape 2 : 72 formes (tatweel bien placé ;
  pas de forme « début » ou « milieu » pour ا د ذ ر ز و, ce qui est juste) et 47 mots non vocalisés, sans faute.
- Étapes 3 à 7 : chaque voyelle correspond à la translittération (a/i/ou, â/î/oû) ; chaque chadda (24) porte une voyelle ;
  chaque soukoun est sur la bonne consonne ; tanwin correct ; les **14 tanwin fath** sont tous suivis de l'alif muet
  (بًا, كِتَابًا, شُكْرًا, جِدًّا, لَيْلًا…) ; hamza sur le bon support : أَمَلٌ, أَلَمٌ (début, sur alif), سَأَلَ (sur alif),
  سُؤَالٌ (après damma, sur wâw), بِئْرٌ (après kasra, sur yâ), آمَنَ ; tâ marbouta correcte (مَدْرَسَةٌ, شَجَرَةٌ) ;
  article : lam avec soukoun devant les lettres lunaires, lam sans signe et lettre suivante doublée devant les solaires.
- Trois paires d'éléments ont la même translittération : `syl-ba-i-noun` بِنْ / `syl-ba-in` بٍ (« bin »),
  `syl-mim-a-noun` مَنْ / `syl-mim-an` مًا (« man »), `syl-fa-ou-noun` فُنْ / `syl-fa-oun` فٌ (« foun »). Le son est le même,
  c'est donc juste. Aucun des 474 exercices `lis-choisis-son` / `ecoute-choisis` ne propose les deux à la fois.

**Translittérations coraniques (354 sur 354 vérifiées, dont toutes celles de l'étape 8 et des sourates 103, 108,
112, 113, 114)** : chaque translittération correspond aux lettres et voyelles du jeton Tanzil. Les assimilations sont
justes : « yakoul lahoû » (112:4), « bismi llâhi r-raḥmâni r-raḥîm », « maliki » (114:2) et « mâliki » (1:4) selon Hafs,
« koufouwan », lettres solaires et lunaires, petits wâw et yâ (« lahoû », « bihî »), « koursiyyouhou » (2:255:42, sans
petit wâw, comme dans Tanzil). **Aucune erreur certaine.**

**Textes libres des leçons** : en dehors de l'écart A, tout l'arabe est fait de fragments (lettres, syllabes, signes
isolés, ال) ou de mots d'éléments déjà vus. Aucun signe n'est utilisé avant l'étape où il est enseigné, et aucun mot
non vocalisé n'apparaît à partir de l'étape 3 (contrôle approché par caractère).

**Noms de sourates** (`src/lib/coran.ts`, `SOURATES.nomArabe` : الفاتحة, العصر, الكوثر, الإخلاص, الفلق, الناس) :
ce sont des titres, pas des versets. Ils sont écrits sans voyelles, comme sur les en-têtes du Mushaf, et affichés
sans `data-q` avec `lang="ar" dir="rtl"` (`src/pages/lecture/index.astro`). **Acceptable.** Le reste de l'arabe des
fichiers de code (lettres de `arabe.ts`, بَ des réglages, ب et ت de `PremiereLettre`, كَتَبَ de `/design`) n'est pas coranique.

## 5. Points à faire valider par une personne qualifiée (non bloquants)

1. **Alif porteur de voyelle sans hamza** : `syl-alif-a` اَ, `syl-alif-i` اِ, `syl-alif-ou` اُ, `syl-alif-a-ba` اَبْ
   (étapes 3 et 4, translittérés « a », « i », « ou », « ab »). Dans l'orthographe normale, ce serait أَ إِ أُ (hamza).
   C'est une simplification courante des méthodes d'alphabet avant d'enseigner la hamza (étape 6). À confirmer, et
   à signaler à l'apprenant en étape 6.
2. **Petit alif sans fatha** : `mot-hadha` هٰذَا, `mot-dhalika` ذٰلِكَ, `mot-hakadha` هٰكَذَا, `mot-hadhihi` هٰذِهِ,
   `mot-lakin` لٰكِنْ. Tanzil écrit fatha + petit alif (هَٰذَا). Les deux se voient dans les livres ; écrire la fatha
   préparerait mieux à la lecture du Coran (ٱلرَّحْمَٰنِ, مَٰلِكِ).
3. **Hamza de début de mot non notée** alors que le guide dit « hamza = ʾ » : `mot-amal-espoir` « amaloun »,
   `mot-alam-douleur` « alamoun », `mot-amana-courant` « âmana », à comparer avec `syl-hamza-a` « ʾa ». La paire
   أَمَلٌ / عَمَلٌ sert justement à distinguer ʾ et ʿ : « ʾamaloun » / « ʿamaloun » serait plus clair. Côté Coran,
   ce n'est pas homogène non plus : « wa-ʾoulâʾika », « wa-ʾâthara », « bi-ʾidhni » mais « wa-iyyâka » (1:5:3).
4. **Pause en fin de verset, appliquée de façon inégale aux jetons seuls** : « al-falaq », « aṣ-ṣamad », « khalaq »
   (forme de pause) mais `q:97:1:9` « al-qadri » et `q:97:5:5` « al-fadjri » (forme liée), alors que ces deux mots
   finissent aussi un verset. L'étape 6 donne volontairement la forme liée (« hâwiyatoun », « djâriyatoun »), et
   l'explication le dit ; c'est cohérent pour elle.
5. **Voyelle longue raccourcie devant l'alif de liaison** : « fi l-ʿouqad » (113:4) est raccourci, mais « ihdinâ
   ṣ-ṣirâṭa » (1:6), « wa-lâ ḍ-ḍâllîn » (1:7) et « illâ lladhîna » (103:3) gardent â. Il faut choisir une seule règle
   (prononciation réelle : voyelle brève).
6. **Trait d'union pas toujours le même** : `q:113:1:7` « birabbi » mais `q:113:1:7-8` « bi-rabbi l-falaq » ; idem
   pour 114:1.
7. Formulation dans `e6-l01.json` `p6` : le découpage « ʾa-n-ʿam-ta » est mieux écrit « ʾan-ʿam-ta ».

## 6. Résumé

| Contrôle | Résultat |
|---|---|
| Tests unitaires | 87/87 réussis |
| Texte coranique `data-q` contre Tanzil | 97/97 identiques (100 %) |
| Notions utilisées avant d'être enseignées | 0 |
| Fichier Tanzil | intact (SHA-256 conforme) |
| Éléments pédagogiques (500) | 0 faute de lettre ou de vocalisation ; 7 éléments avec l'ordre voyelle/chadda inversé (C) |
| Translittérations coraniques (354) | 0 erreur certaine ; 6 points d'harmonisation |
| Texte coranique tapé en dur | **167 occurrences dans 12 leçons des étapes 6 et 7 (A) : BLOQUANT** |

Pour lever le blocage : corriger A (balise de référence, remplacement, contrôle automatique), puis relancer
`npm run build`, `npm run verifier` et cette revue.

---

## Revue de contrôle (après corrections, commit `79c223e`, `dist/` reconstruit)

### Sorties des commandes

`npm test` : `Test Files 7 passed (7)` · `Tests 92 passed (92)` (dont 9 tests dans `contenus.test.ts`).

`npx tsx scripts/verifier.ts --sans-reseau` :

```
✔ Texte coranique : 120 blocs affichés sur 27 pages, 120 identiques à Tanzil (100.0 %)
✔ Contenus / structure : 0 problème(s)
✔ Contenus / ordreNotions : 0 problème(s)
✔ Contenus / testsInedits : 0 problème(s)
✔ Contenus / texteArabe : 0 problème(s)
✔ Contenus / refsCoran : 0 problème(s)
✔ Contenus / coranEnDur : 0 problème(s)
✔ Manifeste audio : 690 entrées, toutes avec un statut valide
Tout est conforme.
```

### Contrôle indépendant

Mes scripts ont été relancés sur `src/contenus/`. Ils comparent chaque mot arabe des textes libres aux jetons Tanzil,
après décomposition Unicode (NFD) et remise des signes dans l'ordre canonique. J'ai aussi analysé le HTML de toutes les
pages de `dist/` pour trouver l'arabe placé hors de `lang="ar"`.

- **A, en grande partie corrigé** : sur 167 mots retapés, il en reste **10** dans les étapes 6 et 7. Ce sont tous des
  mots avec la vague du madd :
  - `etape-6/e6-l02.json` : جَآءَ (ligne 50, note de théorie ; lignes 151 et 258), شَآءَ (151), إِنَّآ (162), مَآءً (173),
    لَآ (187), جَآءَتِ (258) ;
  - `etape-6/e6-l03.json` : جَآءَهُ (ligne 114) ;
  - `etape-7/e7-l05.json` : ٱلضَّآلِّينَ (ligne 141).

  Ces mots sont tapés avec **آ précomposé (U+0622)**. Tanzil écrit **ا + ٓ (U+0627 U+0653)**. Ce ne sont donc pas les
  caractères de Tanzil. ٱلضَّآلِّينَ a aussi la fatha placée avant la chadda. Ils s'affichent sans `data-q`. Exemple dans
  `dist/lecon/e6-l02/index.html` : `<span lang="ar" dir="rtl" class="ar-inline">جَآءَ</span> : « djâʾa »`.

  **Pourquoi `coranEnDur` ne les voit pas** : `normaliserMot` (`src/contenus/coran-en-dur.ts`) trie les signes mais
  ne décompose pas آ. Vérifié avec tsx : `motsCoranEnDur('جَآءَ')` renvoie `[]`.

  Corrections :
  1. Appliquer `.normalize('NFD')` (ou remplacer آ par ا + ٓ) dans `normaliserMot`, puis ajouter un test avec جَآءَ.
  2. Remplacer les 10 mots par des balises : جَآءَ → `[[q:110:1:6]]`, شَآءَ → `[[q:2:255:40]]`, إِنَّآ → `[[q:108:1:5]]`,
     مَآءً → `[[q:78:14:4]]`, لَآ → `[[q:2:255:2]]`, جَآءَتِ → `[[q:79:34:2]]`, جَآءَهُ → `[[q:80:2:2]]`,
     ٱلضَّآلِّينَ → `[[q:1:7:9]]`.
- **28 mots des étapes 4 et 5** qui existent aussi dans le Coran (كَتَبَ, مِنْ, قُلْ, كَانَ, كِتَابٌ, شُكْرًا, مَرَّ, عَلَّمَ…) :
  **acceptable**. Ce sont des mots d'arabe courant, en orthographe standard, sans signe propre au Mushaf. Ils sont
  utilisés comme vocabulaire d'entraînement, pas comme citations.
- **B, corrigé**. Aucune page de leçon, de test, de lecture ni l'accueil n'affiche d'arabe hors `lang="ar"`.
  Deux restes mineurs, non bloquants :
  - `src/pages/alphabet.astro` ligne 75 et `src/components/exercices/BlocTheorie.tsx` ligne 16 affichent le champ
    `prononciation` sans `TexteMixte`. Conséquence : ت (dans la fiche de ṭâ) et ذ (dans celle de ẓâ) n'ont pas
    `lang="ar"` sur `/alphabet`.
  - `src/components/exercices/LectureGuidee.tsx` ligne 146 affiche `ex.explication` en texte brut. Aucun arabe n'y
    figure aujourd'hui, mais une balise `[[q:…]]` y apparaîtrait telle quelle. Il faut passer par `TexteMixte`.
- **C, corrigé dans les éléments** : les 24 chaddas des éléments viennent maintenant avant la voyelle. Dans les textes
  libres, l'ordre voyelle puis chadda reste dans des mots d'entraînement (`e4-l03`, `e4-l05`, `e5-l01..03`, الشَّمْسُ dans
  `e7-l02`) et dans ٱللَّه (`e7-l03` ligne 45). Rien ne change à l'écran : non bloquant.
- **À faire valider** : ٱللَّه, cité sans voyelle finale dans `e7-l03` ligne 45, est le nom divin pris comme exemple, pas un
  jeton de verset. C'est acceptable, ou on peut le remplacer par `[[q:112:1:7]]`.
- Rien n'a changé : le fichier Tanzil est intact (le test d'empreinte passe), et les éléments et translittérations n'ont
  pas d'écart nouveau.

### Verdict final par type d'écran

| Écran | Verdict | Motif |
|---|---|---|
| Leçons (`/lecon/…`) | **BLOQUÉ** | 10 mots coraniques retapés avec آ précomposé, sans `data-q`, dans `e6-l02`, `e6-l03` et `e7-l05` |
| Tests de fin d'étape (`/test/…`) | **VALIDÉ** | aucun mot coranique en dur, blocs `data-q` identiques à Tanzil |
| Lecture guidée (`/lecture/…`) | **VALIDÉ** | 100 % identique à Tanzil ; prévoir `TexteMixte` pour les explications (préventif) |
| Accueil (`/`) | **VALIDÉ** | le bloc coranique est vérifié et identique à Tanzil |
| Alphabet (`/alphabet`) | **VALIDÉ** | lettres correctes ; `lang="ar"` manque sur ت et ذ dans deux conseils (mineur) |

**Verdict global : BLOQUÉ**, jusqu'à la correction des 10 mots et de `normaliserMot`. Une fois ces deux points
corrigés et `npm run verifier` relancé, rien d'autre ne s'oppose à la validation.
