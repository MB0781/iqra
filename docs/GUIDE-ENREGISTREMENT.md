# Guide d'enregistrement audio

Les lettres, syllabes et mots d'entraînement n'ont pas d'audio libre et fiable : il faut une vraie voix.
Ce guide s'adresse au récitateur (ou à la récitatrice) et à la personne qui dépose les fichiers dans le projet.

## Matériel minimal

- Un téléphone récent ou un micro-casque USB. Un micro-cravate à 20 € donne déjà un excellent résultat.
- Un navigateur à jour (Chrome, Edge, Firefox ou Safari).
- Des écouteurs pour réécouter.

## La pièce

- Une petite pièce meublée (chambre, dressing) : les tissus absorbent l'écho. Évite cuisine et salle de bains.
- Fenêtres fermées, ventilation et machines éteintes, téléphone en mode avion (sauf s'il sert de micro).

## La prise de son

- Distance : une main à une main et demie (15 à 20 cm) entre la bouche et le micro, un peu sur le côté pour éviter
  les souffles sur ب et ف.
- Voix posée, débit lent et régulier, prononciation soignée selon la lecture Hafs. Une seule prise par élément,
  sans rien dire avant ni après.
- Lettres (`lettre-…`) : dire **le son** de la lettre suivi d'une fatha brève (ب → « ba », ح → « ḥa », ع → « ʿa »),
  car une consonne seule est presque inaudible. Pour l'alif, dire « a » précédé d'un léger coup de glotte.
- Formes (`forme-…`) : même son que la lettre correspondante.
- Syllabes et mots (`syl-…`, `mot-…`, `expr-…`) : lire exactement ce qui est écrit, voyelles comprises ; la
  translittération affichée à côté sert de repère.
- Garde le même niveau de voix pour tous les éléments. Fais une pause toutes les vingt minutes.

## Dans le studio

1. Ouvre `https://mb0781.github.io/iqra/studio/` (page cachée, non référencée).
2. Autorise le micro quand le navigateur le demande.
3. Pour chaque ligne : **Enregistrer**, prononcer, **Arrêter**, **Réécouter**. Si ce n'est pas parfait : **Refaire**.
4. Le filtre en haut permet de travailler par étape (`syl-`, `mot-`, `lettre-`…).
5. Quand une série est terminée, clique sur **ZIP** : chaque fichier porte déjà l'identifiant attendu
   (ex. `lettre-ba.webm`, `syl-ba-a.m4a`). Rien n'est envoyé sur internet.

Les enregistrements restent dans la page tant qu'elle est ouverte : télécharge le ZIP avant de la fermer.

## Déposer les fichiers dans le projet

1. Décompresse le ZIP.
2. Copie les fichiers dans le dossier `public/audio/` du dépôt (sur GitHub : *Add file → Upload files* dans ce dossier).
3. Lance `npm run audio:manifest` (ou demande-le à Claude) : le manifeste `data/audio/manifest.json` passe ces éléments
   en « disponible » et le site utilise aussitôt ta voix à la place de « audio en préparation ».
4. Vérifie avec `npm run build` puis `npm run verifier`, et publie (commit sur `main`).

Formats acceptés : `.webm`, `.m4a`, `.ogg`, `.mp3`. Idéalement, convertis en `.mp3` 64 kbit/s mono avant dépôt pour
alléger le site (par exemple avec Audacity ou `ffmpeg -i lettre-ba.webm -ac 1 -b:a 64k lettre-ba.mp3`).
