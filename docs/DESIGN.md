# Design system d'Iqra'

Référence : la rigueur des Human Interface Guidelines d'Apple (clarté, sobriété, hiérarchie, profondeur mesurée),
sans rien copier d'Apple. Les tokens vivent dans `src/styles/global.css` ; la vitrine est la page `/design`.

## Idée directrice : « Earthy Minimal », un cahier de lecture qui ressemble à une appli

Palette choisie par le propriétaire (novembre 2026) : tons naturels, chaleureux et sobres. Vert profond pour le texte
et les actions, sauge et sable pour les surfaces, terre cuite en touche. Inspiration « application mobile » :
écran d'ouverture court, en-tête courbe vert profond sur l'accueil, cartes très arrondies à ombre douce, boutons en
pilule, barre de navigation flottante en pilule en bas de l'écran mobile.

La lettre arabe reste le sujet : la lettre ب en très grand dans la carte de l'accueil, la lettre étudiée à 56 px.
Toujours interdits : dégradés violet/bleu, emojis comme icônes, police Inter, étiquettes en majuscules espacées, « → »
décoratif.

## Couleurs

Palette source : #2E3A2F (principal), #6B7F5B (secondaire), #D9C9B2 (tertiaire), #C96F4F (accent), #F8F6EE (fond).

| Token | Clair | Sombre | Rôle |
|---|---|---|---|
| `--papier` | #F8F6EE | #1A1F1B | fond de page |
| `--surface` | #FDFCF8 | #222923 | panneaux, options |
| `--surface-2` | #EFEADF | #2B332C | zones en retrait, pastilles, pied de page |
| `--encre` | #2E3A2F | #F1EEE4 | texte (vert profond) |
| `--encre-2` | #4A5648 | #C9C6B8 | texte secondaire (AA) |
| `--encre-3` | #5C6658 | #ABA899 | légendes (AA) |
| `--trait` / `--trait-fort` | #E6DDCE / #D9C9B2 | #343D35 / #4A534A | filets, bordures |
| `--accent` | #2E3A2F | #B5C4A5 | boutons principaux, liens, focus |
| `--accent-doux` | #E3E8DD | #2C3A2D | fonds de réussite, élément actif |
| `--sauge` | #6B7F5B | #8FA27E | graphismes (contraste 4:1, pas pour du petit texte) |
| `--sable` | #D9C9B2 | #D9C9B2 | cartes, mise en valeur sur fond vert |
| `--terre` | #C96F4F | #D9845F | touches de couleur, grands textes seulement |
| `--terre-texte` | #9C4F2E | #E39A78 | terre cuite pour du texte (AA) |
| `--erreur` | #A13A29 | #F19A87 | erreur (fonctionnelle) |
| `--attention` | #7D5400 | #E6BF6E | mise en garde (fonctionnelle) |

Sur l'en-tête vert profond : texte #F8F6EE, accent #D9C9B2, pastilles #3C4A3D. La barre de navigation mobile est
vert profond dans les deux thèmes ; l'onglet actif est une pilule claire.

Couleurs **fonctionnelles** de l'aide « couleur des voyelles » (jamais décoratives) : fatha #A2421C, kasra #1D5C99,
damma #7A3A8E, soukoun #4F6A2A (variantes claires en sombre). On colore la **lettre entière** avec sa voyelle :
les navigateurs ne savent pas peindre un signe d'une autre couleur que sa lettre. La couleur n'est jamais le seul
indice : le signe reste visible.

La police Amiri Quran contient des signes colorés (table COLR) : ils sont ramenés à la couleur de l'encre par
`@font-palette-values`, comme un Mushaf imprimé. Avec l'aide voyelles, le texte coranique passe en Amiri (même dessin,
sans couleurs intégrées).

## Typographie

- Latin : `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` (SF Pro sur appareils Apple,
  jamais hébergée). Aucune police latine téléchargée.
- Arabe des exercices : **Noto Naskh Arabic** (OFL), points nets et lisibles pour un débutant.
- Texte coranique : **Amiri Quran** (OFL), et Amiri pour l'aide voyelles.
- Échelle (≈ 1,2) : 13 · 15 · 17 (corps) · 20 · 24 · 30 · 40 · 52 px. Interlignage 1,55 pour le corps.
- Arabe : 36 px minimum en exercice (`--taille-ar`), 56 px pour la lettre étudiée (`--taille-ar-etude`), 2,1
  d'interligne (2,3 pour le Coran) pour que les voyelles ne se chevauchent pas. Réglable (grande, très grande).
- Longueur de ligne ≤ 38 rem pour la prose. Texte aligné à gauche ; arabe aligné à droite ou centré.

## Espacements, rayons, ombres, mouvement

- Grille de 4 px (échelle Tailwind), sections espacées de 64 à 96 px. Gouttière mobile 16 px.
- Rayons : 10 px (petits éléments), 16 px (options), 28 px (panneaux, cartes), pilule (boutons, pastilles, navigation).
- Ombres douces et diffuses (`--ombre-2`) sur les panneaux et cartes.
- Écran d'ouverture : accueil seulement, une fois par session, 1,6 s, jamais avec `prefers-reduced-motion`.
- Transitions 150 à 250 ms, courbe `cubic-bezier(.2,.7,.2,1)`, uniquement en réponse à une action.
  `prefers-reduced-motion` coupe tout.

## Composants

Boutons (principal, secondaire, discret), options d'exercice (≥ 64 px de haut), interrupteurs Radix, groupes radio
Radix, dialogue d'alerte Radix, bouton audio (avec 0,75× et mention honnête « audio en préparation »), panneaux de
retour (juste / pas tout à fait), barre de progression, marque (étoile à huit branches dessinée pour le projet, deux
carrés croisés : motif géométrique discret, utilisé seulement comme logo).

## Mise en page

Mobile d'abord : barre d'onglets flottante en pilule en bas (Parcours, Révision, Alphabet, Lecture, Progrès), zones tactiles ≥ 44 px,
aucun défilement horizontal (vérifié par test). Ordinateur : navigation en haut, contenus en deux colonnes
asymétriques quand le contenu s'y prête.

## Accessibilité

Contrastes AA vérifiés par axe-core en clair et en sombre, focus visible (double anneau accent), lien d'évitement,
`lang="ar" dir="rtl"` sur chaque bloc arabe, retours annoncés (`role="status"`), focus déplacé sur « Continuer » après
une réponse, navigation complète au clavier (testée).
