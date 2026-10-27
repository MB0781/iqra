# Design system d'Iqra'

Référence : la rigueur des Human Interface Guidelines d'Apple (clarté, sobriété, hiérarchie, profondeur mesurée),
sans rien copier d'Apple. Les tokens vivent dans `src/styles/global.css` ; la vitrine est la page `/design`.

## Idée directrice : le cahier de lecture

Un livre calme, de l'encre sur du papier. Une seule audace : **la lettre arabe en très grand**, traitée comme le
sujet de la page (la lettre ب de l'accueil, la lettre étudiée à 56 px). Tout le reste se tait : texte latin sobre,
aplats, filets fins, une seule couleur d'accent.

Ce que l'on a évité volontairement (choix par défaut des pages générées) : crème #F4F1EA + accent terracotta, fond
presque noir + vert acide, cartes identiques avec ombre grise, dégradés, étiquettes en majuscules espacées, « → » à la
fin des liens, chaînes « A · B · C », police Inter, emojis comme icônes, héros centré « titre + deux boutons + trois
cartes ». Le héros de l'accueil est un exercice réel : on lit sa première lettre en dix secondes.

## Couleurs

| Token | Clair | Sombre | Rôle |
|---|---|---|---|
| `--papier` | #F6F4EF | #181612 | fond de page (neutre chaud, légèrement gris) |
| `--surface` | #FCFBF8 | #201E19 | panneaux, options |
| `--surface-2` | #EEEBE4 | #2A2721 | zones en retrait |
| `--encre` | #1C1A17 | #EEE9DF | texte |
| `--encre-2` | #57524A | #BDB6A9 | texte secondaire (AA) |
| `--encre-3` | #6F695F | #A29B8E | légendes (AA sur papier) |
| `--trait` / `--trait-fort` | #DCD7CC / #C2BCAF | #3A362F / #4D483F | filets, bordures |
| `--accent` | #1F5F4F | #86CCB1 | **seule couleur d'accent** : vert d'encre |
| `--accent-doux` | #E2EDE8 | #1F3730 | fonds de réussite, élément actif |
| `--erreur` | #A13A29 | #F19A87 | erreur (fonctionnelle) |
| `--attention` | #7D5400 | #E6BF6E | mise en garde (fonctionnelle) |

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
- Rayons hiérarchisés : 8 px (petits éléments), 12 px (boutons, options), 20 px (panneaux).
- Ombres très légères, seulement pour ce qui flotte (carte de l'accueil, dialogue).
- Transitions 150 à 250 ms, courbe `cubic-bezier(.2,.7,.2,1)`, uniquement en réponse à une action.
  `prefers-reduced-motion` coupe tout.

## Composants

Boutons (principal, secondaire, discret), options d'exercice (≥ 64 px de haut), interrupteurs Radix, groupes radio
Radix, dialogue d'alerte Radix, bouton audio (avec 0,75× et mention honnête « audio en préparation »), panneaux de
retour (juste / pas tout à fait), barre de progression, marque (étoile à huit branches dessinée pour le projet, deux
carrés croisés : motif géométrique discret, utilisé seulement comme logo).

## Mise en page

Mobile d'abord : barre d'onglets en bas (Parcours, Révision, Alphabet, Lecture, Progrès), zones tactiles ≥ 44 px,
aucun défilement horizontal (vérifié par test). Ordinateur : navigation en haut, contenus en deux colonnes
asymétriques quand le contenu s'y prête.

## Accessibilité

Contrastes AA vérifiés par axe-core en clair et en sombre, focus visible (double anneau accent), lien d'évitement,
`lang="ar" dir="rtl"` sur chaque bloc arabe, retours annoncés (`role="status"`), focus déplacé sur « Continuer » après
une réponse, navigation complète au clavier (testée).
