# Critique design « anti-IA » — 26 octobre 2026

Critique extérieure, sans avoir vu la conception. Base : les 72 captures de `docs/captures/` (12 pages
obligatoires, plus `lecture` et `commencer`), regardées en mobile et en ordinateur, en clair et en sombre. J'ai lu le
code seulement pour confirmer une cause (`src/styles/global.css`, `TexteArabe.tsx`, `LectureGuidee.tsx`,
`Reglages.tsx`, `Parcours.tsx`). Références : `docs/DESIGN.md`, §5 du cahier des charges, skill `frontend-design`.

Remarque sur les captures : dans le conteneur, `system-ui` est rendu en **Inter** (`fc-match system-ui` donne
Inter-Regular.otf). Ce n'est pas un défaut du site, qui ne télécharge aucune police latine. Mais les captures ne
montrent donc pas le rendu réel (SF Pro, Segoe UI, Roboto). Je ne juge pas la police latine sur ces images.

## Impression générale

L'identité tient. Fond papier neutre chaud, une seule couleur d'accent (vert d'encre), aucun dégradé, aucun glow,
aucun emoji, aucune étiquette en majuscules, aucun « → ». Le héros de l'accueil est un vrai exercice et non un
« titre + deux boutons + trois cartes ». Le mode sombre est travaillé et n'a rien d'un simple négatif : l'accent passe
à #86CCB1 (9,7:1 sur le fond), et le Coran est ramené à la couleur de l'encre. Hiérarchie claire, espacements
généreux, rayons cohérents (8 / 12 / 20). Rien ne trahit un gabarit généré.

Les vrais problèmes sont ailleurs : **le rendu de l'arabe hors des blocs d'exercice** (dans les titres, la prose et
l'aide syllabes) et **la typographie française** (espaces insécables, apostrophes). Pour un site dont le sujet est
justement l'écriture, ces deux points pèsent plus qu'un détail de couleur.

---

## Écran par écran

### Accueil — À CORRIGER

1. **Aide « syllabes » de la basmala (bloquant).** Dans `.aide-syllabes`, l'écart entre syllabes (`margin-inline-start:
   0.35em`, `global.css` l. 340) est **plus grand** qu'une espace entre mots (environ 0,25 em). Résultat : on ne voit
   plus où finit un mot (بِسْ | مِ | ٱللَّ | هِ… sont tous à égale distance). Sur mobile, c'est pire : le mot
   ٱلرَّحِيمِ est **coupé en fin de ligne** (« ٱلرَّ » sur la ligne 1, « حِيمِ » sur la ligne 2), parce que chaque
   syllabe est un `inline-block` séparé et que rien n'empêche le retour à la ligne à l'intérieur d'un mot.
   Correction attendue :
   - envelopper chaque **mot** dans un élément `display:inline-block; white-space:nowrap` (dans `TexteArabe.tsx`,
     autour de `rendreMot`) ;
   - réduire l'écart entre syllabes à **0,12–0,15 em** ;
   - élargir l'écart entre mots sous `.aide-syllabes` (`word-spacing` ou marge) à **≥ 0,6 em**.
   Le soulignement par syllabe peut rester. Cette correction vaut pour tous les écrans qui utilisent l'aide (lecture
   guidée, réglages, leçons).
2. **Mobile : l'exercice du héros arrive sous la ligne de flottaison.** Le titre, le paragraphe et les deux boutons
   occupent environ 650 px CSS. La lettre ب apparaît vers 700 px et les réponses vers 940 px, donc hors de l'écran sur
   la plupart des téléphones. Or c'est l'idée du site. Demande : sous 768 px, raccourcir l'introduction à une phrase
   (ou la placer après la carte) et garder un seul bouton au-dessus de la carte, pour que les deux réponses
   « « t » / « b » » soient visibles dans les 800 premiers px.
3. **Carte du héros (ordinateur)** : environ 90 px vides sous les réponses (place réservée au retour). Réduire la
   réserve à la hauteur réelle du panneau de retour, ou aligner la carte sur le haut du texte. Dans la carte,
   l'étiquette et la question sont alignées à gauche alors que l'indice est centré : **aligner l'indice à gauche**
   (seule la lettre reste centrée).
4. **« Le chemin »** : descriptions creuses ou redondantes. Étape 8 « Al-Fatiha, verset par verset » / « Al-Fatiha »,
   étape 7 « La basmala », étape 9 « Cinq sourates courtes ». Écrire une phrase de compétence comme pour les étapes
   1 à 5 (ex. étape 8 : « Lire les sept versets avec des aides de moins en moins présentes »).

### Parcours — À CORRIGER

1. **Arabe dans les titres de leçons (bloquant, règle 6 et lisibilité).** « Un même dessin, trois sons : ب ت ث »
   est rendu dans la police latine, à 17 px, sans `lang="ar" dir="rtl"` (`Parcours.tsx` l. 69 affiche `l.titre`
   brut). Ces lettres font environ 10 px de haut : c'est illisible pour un débutant. Sur mobile, la liste des lettres se
   **coupe sur deux lignes** (« ب ت ث / ن ي »). Demande : isoler la partie arabe des titres dans un
   `<span lang="ar" dir="rtl" class="ar-inline">` (Noto Naskh, **1,4 em**, `white-space:nowrap`). Il faut un champ
   séparé dans le contenu, ou un découpage à l'affichage. Même traitement dans le titre de leçon (h1), le tableau de
   bord et partout où ces titres apparaissent.
2. **48 lignes dont 47 grisées identiques.** C'est un mur de verrous. Demande : replier les étapes non ouvertes (titre
   d'étape, description, « 9 leçons, s'ouvre après le test de l'étape N ») et ne déplier que l'étape en cours. Un clic
   permet de voir le détail.
3. **Test de fin d'étape** : la ligne de l'étape 1 a une sous-ligne (« 85 % pour ouvrir… »), pas celle des étapes 2
   à 8. Uniformiser.
4. Mobile : « 85 / % » est séparé par le retour à la ligne dans le chapeau. Voir la correction typographique globale.

### Leçon (étape 1) — À CORRIGER (mineur)

1. Guillemets orphelins : « comme dans « / bateau ». », « comme dans « / table ». ». Voir la correction
   typographique globale (espaces fines insécables).
2. Apostrophes droites et typographiques mélangées sur le même écran (« L'arabe », « l'anglais » contre
   « M’entraîner »). Voir la correction globale.
3. Mobile : dans les cartes-lettres, l'explication est **centrée** sur trois lignes. Garder la lettre centrée et
   aligner nom, explication et mention audio **à gauche** (DESIGN.md : « texte aligné à gauche »).
4. L'arabe du h1 (« ب ت ث ») : même demande que pour le parcours, point 1.

La présentation des trois lettres, le conseil en panneau accent-doux et le bouton unique « M’entraîner (6 exercices) »
sont justes.

### Leçon étape 8 — À CORRIGER

1. **Colonnes mal alignées** : le texte des trois cartes commence à 366, 363 puis 375 px, parce que la colonne arabe
   prend la largeur du mot. Fixer la colonne arabe (`grid-template-columns: 8.5rem 1fr` en ordinateur) pour que tous
   les textes partent du même bord.
2. « Audio indisponible pour l’instant. » est affiché en **rouge erreur** à côté de chaque mot, et contredit le ton
   « audio en préparation » des autres écrans. Si c'est un échec réseau, une seule mention par page suffit, en
   `--encre-3` avec l'icône haut-parleur barrée. Réserver `--erreur` aux réponses fausses. Sur mobile, ce texte rouge
   centré sur deux lignes alourdit chaque carte.
3. « verset / 2 : « La louange… » » est coupé (mobile). Voir la correction typographique globale.

Le panneau tajwid (attention) et le panneau « leçon fermée » sont sobres et bien hiérarchisés.

### Test d'étape — À CORRIGER (mineur)

1. Le seuil de 85 % est répété deux fois en trois lignes (chapeau et paragraphe). En garder une seule mention.
2. « 85 / % » est coupé en ordinateur, et « Test de l'étape / 1 : » sur mobile. Mettre une espace insécable entre
   « étape » et le numéro, et avant « % ».
3. Mobile : le bouton principal n'occupe pas toute la largeur, alors qu'il le fait à l'accueil. Choisir une règle
   (je recommande la pleine largeur sous 640 px pour l'action principale) et l'appliquer partout (test, révision,
   404, méthode).

### Révision — VALIDÉ

État vide clair, une action, aucun faux enthousiasme. Seule suggestion (souhaitable) : quand des révisions sont
programmées plus tard, dire quand (« Prochaine révision demain »).

### Alphabet — À CORRIGER

1. **Ordre des colonnes.** Le chapeau dit « le début d’un mot est à droite », mais le tableau range, de gauche à
   droite : Isolée, Début, Milieu, Fin. Le débutant lit donc la forme « début » à gauche de la forme « fin ».
   Demande : sous le titre « Lettre et son », ordonner les colonnes **Fin, Milieu, Début, Isolée** de gauche à droite
   (lecture à droite), ou donner au bloc des formes `dir="rtl"`.
2. **Arabe dans la prose** (chapeau « (ا د ذ ر ز و) », « Les paires difficiles » : « ع se fait… ; ك au même
   endroit… ») : lettres à 15 px dans la police latine, sans `lang="ar"`. Même demande que pour le parcours :
   `.ar-inline` à 1,4 em.
3. **« audio en préparation » répété 38 fois**, une fois par ligne du tableau de prononciation. Une seule mention
   en tête de section, tant que rien n'est enregistré.
4. **Paires difficiles** : 9 cartes identiques dont le texte ne part pas du même bord (275, 284, 307, 292 px…).
   Fixer la largeur de la colonne des lettres (`6rem`). Ces cartes pourraient aussi devenir une liste à filets comme
   le tableau au-dessus, ce qui ferait moins « kit de cartes ».
5. Lignes hamza : quatre glyphes identiques (ء ء ء ء, أ أ أ أ). Afficher un tiret « — » discret là où la forme
   n'existe pas, ou la vraie forme liée (ـأ) quand elle existe. Faire de même pour les six lettres sans forme
   « début » distincte, comme l'annonce le chapeau.

### Lecture guidée, Al-Fatiha — À CORRIGER

1. **Numéros de versets à gauche, loin du texte.** Le verset 4 occupe 650–780 px et son numéro est à 220 px : l'œil
   traverse 400 px de vide. En arabe, la ligne commence à droite. Demande : placer le numéro **à droite** de la ligne
   (début du verset), dans une colonne de 2,5 rem, ou à la fin du verset comme dans un mushaf (numéro dans un petit
   cercle à `--encre-3`), mais jamais isolé de l'autre côté de la page. Sur mobile, le verset 7 (deux lignes) a le
   même défaut.
2. Le `<details>` « Aides à la lecture » garde le triangle natif du navigateur (▾), seul élément non dessiné de
   l'interface. Le remplacer par le chevron du jeu d'icônes, avec une rotation de 150 ms.
3. Interrupteurs : voir le point bloquant de contraste dans « Réglages ».

Le corps arabe (Amiri Quran, environ 36 px, interligne large) est beau. Les couleurs de voyelles restent
fonctionnelles et désactivables.

### Lecture (liste des sourates) — VALIDÉ

Liste sobre, noms arabes à droite et à la bonne taille. Rien à redire.

### Commencer — VALIDÉ

Deux choix clairs et honnêtes, pas de piège. Un détail souhaitable : la page est très vide en ordinateur (environ
200 px de vide sous les choix). On peut remonter le pied de page ou laisser ainsi.

### Tableau de bord — À CORRIGER

1. **Chiffres-clés** : c'est le motif « gros chiffre + petite étiquette » par défaut. Ici, il est en plus mal aligné :
   le chiffre descend quand l'étiquette tient sur une ligne (« 0 jour actif » est plus bas que « 0 leçons
   validées… »). Mettre `align-items:start` sur les tuiles. Réécrire les étiquettes pour éviter « sur / 48 » orphelin
   et « 0 éléments maîtrisés sur 0 en révision » : par exemple « 0 / 48 leçons validées », « 0 élément maîtrisé ».
2. **État vide** : quatre zéros découragent. Quand rien n'est fait, remplacer la rangée de tuiles par une phrase et le
   lien vers la première leçon. Les tuiles n'apparaissent qu'à la première leçon validée.
3. « Prochaine étape » pointe vers une **leçon** : renommer en « Prochaine leçon ». L'arabe du lien : même demande que
   pour le parcours.

La section « Sauvegarder ou transférer » est claire, honnête et bien placée.

### Réglages — À CORRIGER

1. **Contraste des interrupteurs éteints (bloquant, WCAG 1.4.11).** À l'état « off », le curseur `--surface` sur la
   piste `--surface-2` donne **1,12:1** en sombre et **1,15:1** en clair. La bordure `--trait-fort` contre le fond
   donne **1,99:1** en sombre et **1,72:1** en clair. Le seuil des composants d'interface est **3:1**. Sur la capture
   sombre, on distingue à peine l'interrupteur éteint. Demande (`Interrupteur`, `LectureGuidee.tsx`) : à l'état
   éteint, curseur en `--encre-3`, plus une bordure de piste en `--encre-3`. `--encre-3` sur papier atteint
   4,95:1 en clair et 6,55:1 en sombre.
2. **Aperçu de taille trompeur.** Les ب d'exemple sont à 28, 34 et 40 px (`Reglages.tsx` l. 70-72), alors que les
   vraies tailles sont 36, 44 et 52 px (`--taille-ar`). L'option « Normale » montre donc plus petit que ce que l'on
   lira. Utiliser les valeurs réelles, et un mot court vocalisé (ex. بَيْتٌ) plutôt qu'une lettre seule, pour juger
   la place des voyelles.
3. En ordinateur, le lien « Réglages » de l'en-tête n'est pas marqué comme page active (les autres onglets le sont).
   Ajouter `aria-current="page"` et le même style gras.

### Méthode — À CORRIGER (mineur)

1. **Bidi cassé dans la prose** : « (ح et ع ,ه et l’alif, ق et ك…) ». La virgule saute de l'autre côté de ه parce
   que les lettres arabes ne sont pas isolées. Chaque lettre dans la prose française doit être dans un
   `<span lang="ar" dir="rtl">` (ou `<bdi>`) : le correctif `.ar-inline` décrit pour le parcours règle les deux
   problèmes. Même chose dans « (par exemple ح choisi au lieu de ه) ».
2. **Grille de page incohérente** : le bord gauche du contenu change d'une page à l'autre. 94 px pour la méthode, le
   parcours et l'accueil ; 219 px pour l'alphabet, la lecture de la Fatiha et le tableau de bord ; 256 px pour la
   leçon, le test, la révision et les réglages ; 294 px pour la 404. Choisir **deux** gabarits, par exemple « large »
   (aligné sur le logo) et « lecture » (colonne de 38 rem centrée), et les nommer dans DESIGN.md. La méthode, page de
   prose, devrait utiliser le gabarit « lecture », comme la leçon.

### 404 — VALIDÉ (mineur)

Texte utile et rassurant (« Ta progression, elle, n’a pas bougé »), deux sorties claires. DESIGN.md réserve
l'étoile au logo ; ici, elle sert d'illustration. C'est acceptable, mais on peut la retirer sans rien perdre. Le bord
gauche de la page (294 px) est à aligner sur l'un des deux gabarits.

---

## Corrections transversales

- **Typographie française (souhaitable, mais visible partout).** Ajouter des espaces fines insécables (U+202F) avant
  `: ; ? ! %` et à l'intérieur des guillemets « », et une espace insécable entre un nombre et son unité
  (« étape 1 », « 85 % », « 5 min »). Remplacer l'apostrophe droite `'` par `’` dans le texte français. On trouve
  environ 670 apostrophes droites dans `src/content`, `src/pages` et `src/components`, contre environ 135
  typographiques. Le plus sûr est un filtre appliqué **à l'affichage** du texte français (jamais au texte
  coranique), plus un contrôle dans `verifier-contenus.ts`.
- **Arabe dans le texte latin.** Créer une classe `.ar-inline` (Noto Naskh, 1,4 em, `lang="ar" dir="rtl"`,
  `unicode-bidi:isolate`, `white-space:nowrap` pour une suite de lettres) et l'appliquer à toute lettre ou à tout mot
  arabe inclus dans une phrase française : titres de leçons, prose des leçons, alphabet, méthode, tableau de bord.
- **Captures manquantes.** Aucune capture ne montre un exercice en cours : options, retour « juste / pas tout à
  fait », barre de progression, fin de leçon. C'est pourtant l'écran le plus utilisé. Ajouter au moins
  « exercice-question » et « exercice-retour » à `scripts/captures.ts` pour la prochaine revue.

## Verdict global

**À CORRIGER, mais sur une base saine.** La direction artistique est cohérente, sobre, propre au sujet, et ne fait
pas « généré par une IA ». Il n'y a rien à refaire dans la palette, les rayons, les ombres ni la structure des pages.
Les défauts portent sur la manière d'écrire l'arabe et le français, qui est justement le cœur du projet. Ils se
corrigent en quelques composants, sans refonte.

### Bloquantes

1. **Aide syllabes** : un mot coupé en fin de ligne et des limites de mots invisibles (écart entre syllabes supérieur
   à l'espace entre mots). Il faut un mot insécable, un écart de 0,12–0,15 em entre syllabes et d'au moins 0,6 em
   entre mots (`TexteArabe.tsx`, `global.css` l. 340).
2. **Arabe dans le texte latin** : rendu à 15–17 px dans la police latine, sans `lang`/`dir`, avec un bidi cassé
   (virgule déplacée dans la méthode) et des listes de lettres coupées (parcours mobile). Il faut un composant
   `.ar-inline` à 1,4 em, isolé et insécable, dans les titres de leçons, le parcours, l'alphabet, la méthode et le
   tableau de bord.
3. **Contraste des interrupteurs éteints** : 1,1 à 2:1, sous le seuil de 3:1 (WCAG 1.4.11). Curseur et bordure en
   `--encre-3` à l'état éteint.

### Souhaitables, par ordre d'importance

4. Lecture guidée : numéros de versets collés au début du verset (à droite) au lieu d'être isolés à gauche.
5. Accueil mobile : l'exercice du héros doit être visible sans défiler (réponses dans les 800 premiers px).
6. Typographie française : espaces fines insécables, apostrophes typographiques (filtre à l'affichage, plus un
   contrôle automatique).
7. Alphabet : colonnes des formes dans l'ordre de lecture (début à droite) ; une seule mention « audio en
   préparation » ; colonne des lettres à largeur fixe dans les paires.
8. Réglages : aperçus à la vraie taille (36, 44, 52 px), avec un mot vocalisé.
9. Leçon étape 8 et paires difficiles : colonne arabe à largeur fixe pour aligner les textes.
10. Audio indisponible : une mention neutre par page, pas de rouge erreur répété.
11. Tableau de bord : état vide sans les quatre zéros ; tuiles alignées en haut ; « Prochaine leçon ».
12. Parcours : replier les étapes fermées.
13. Deux gabarits de page (large / lecture) au lieu de quatre bords gauches différents.
14. Détails : triangle natif du `<details>`, seuil de 85 % répété dans le test, descriptions des étapes 6 à 9 sur
    l'accueil, explications centrées dans les cartes-lettres sur mobile, largeur des boutons principaux sur mobile.

---

## Revue de contrôle (26 octobre 2026, après le commit 79c223e)

Base : les nouvelles captures `docs/captures/*.jpg` (mobile ×2), dont `exercice-question-*` et `exercice-retour-*`,
en clair et en sombre, en mobile et en ordinateur.

### Les trois bloquantes

1. **Aide syllabes — levée.** Les mots ne sont plus coupés (sur mobile, la basmala passe sur deux lignes, deux mots
   par ligne, sans couper ٱلرَّحِيمِ). Les limites de mots se voient nettement en ordinateur.
   Reste un détail : sur mobile, le soulignement de la ligne 1 touche presque l'alif suscrit de ٱلرَّحْمَٰنِ sur la
   ligne 2. Il faut monter l'interligne du bloc `.aide-syllabes` à environ 2,4 (souhaitable).
2. **Arabe dans le texte français — levée.** Les titres de leçons (parcours, h1, tableau de bord), les paires
   difficiles, l'explication de l'étape 8 et la méthode affichent l'arabe isolé, à la bonne taille, insécable. Le
   bidi de la méthode est corrigé (« ح et ه, ع et l’alif… »).
3. **Interrupteurs éteints — levée.** Le curseur `--encre-3` se lit nettement en clair comme en sombre (lecture
   guidée, réglages).

### Statut final par écran

| Écran | Statut | Commentaire |
|---|---|---|
| Accueil | **VALIDÉ** | Exercice juste sous le titre sur mobile, basmala lisible. Reste environ 120 px vides au bas de la carte du héros (place du retour) : détail. |
| Parcours | **VALIDÉ** | Arabe lisible et insécable. Le repli des étapes fermées n'est pas fait, par choix assumé : accepté. Le chapeau de `parcours.astro` garde « 85 % » avec une espace normale, d'où « 85 / % » coupé sur mobile : à reprendre au passage. |
| Leçon | **VALIDÉ** | Typographie corrigée (« Son : « b », comme dans « bateau » »), explication alignée à gauche. |
| Leçon étape 8 | **VALIDÉ** | Textes alignés (colonne fixe), mention « audio indisponible » neutre. |
| Exercice (question / retour) | **VALIDÉ** | Options larges, retour clair (✓ / ✗ et panneau), bouton « Continuer » pleine largeur sur mobile, sombre soigné. Souhaitable : dans les titres, l'arabe en `.ar-inline` (1,4 em d'un h1) est presque aussi grand que la lettre à lire de l'exercice (56 px), ce qui brouille la hiérarchie. Ramener l'arabe des titres à **1,15 em** pour que la lettre étudiée reste le sujet de la page. |
| Test d'étape | **À CORRIGER (mineur)** | Le h1 et le chapeau ne passent pas par la typographie française : « Test de l'étape / 1 : » est coupé sur mobile, avec des apostrophes droites (« l'étape 2 ») et « 85 % » sans espace insécable. Il faut appliquer le même filtre au titre et au chapeau du test. Le seuil n'est plus répété : correct. |
| Révision | **VALIDÉ** | Inchangé. |
| Alphabet | **VALIDÉ** | Colonnes dans l'ordre de lecture (Fin, Milieu, Début, Isolée), une seule mention audio, paires alignées. Détails : la liste « Conseils de prononciation » garde des espaces normales dans les guillemets (« « b » ») alors que les paires ont des espaces fines, et le chapeau parle de « boutons d’écoute » que la liste n'affiche pas. |
| Lecture Al-Fatiha | **VALIDÉ** | Numéros cerclés à droite, chevron dessiné, interrupteurs lisibles. Détail : « L'Ouverture » avec une apostrophe droite. |
| Lecture (liste) | **VALIDÉ** | Inchangé. |
| Tableau de bord | **VALIDÉ** | L'état vide est maintenant une phrase et une action, sans les quatre zéros : bien. |
| Réglages | **VALIDÉ** | Aperçus à la vraie taille, interrupteurs conformes. Détail : le lien « Réglages » de l'en-tête n'est toujours pas marqué comme page active. |
| Méthode | **VALIDÉ** | Bidi corrigé. Détail : l'arabe en ligne agrandit l'interligne de sa ligne (saut visible dans le paragraphe « La prononciation »). Mettre `line-height: 1` sur `.ar-inline` dans la prose. L'unification des gabarits n'est pas faite, par choix assumé : accepté. |
| 404 | **VALIDÉ** | Détail : sur mobile, les deux boutons ne sont pas en pleine largeur, contrairement à la règle « < 640 px » appliquée ailleurs. |

### Verdict global de la revue de contrôle

**VALIDÉ.** Les trois corrections bloquantes sont levées et vérifiées sur les captures, en clair et en sombre, en
mobile et en ordinateur. La plupart des corrections souhaitables sont appliquées sans régression visible. Les deux
refus assumés (repli du parcours, gabarits unifiés) relèvent du confort et ne gênent pas l'apprentissage. Le site
garde une identité propre et calme, qui ne fait pas « généré par une IA ».

Reste un seul point à corriger, mineur et non bloquant : la typographie française du titre et du chapeau du test
d'étape (et du chapeau du parcours). Suivent quelques détails optionnels :
- interligne de `.aide-syllabes` à environ 2,4 ;
- arabe des titres à 1,15 em ;
- `line-height: 1` pour `.ar-inline` dans la prose ;
- état actif de « Réglages » dans l'en-tête ;
- boutons de la 404 en pleine largeur sur mobile ;
- apostrophe de « L'Ouverture ».
