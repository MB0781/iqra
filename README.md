# Iqra'

Site gratuit pour apprendre à lire l'arabe, de la première lettre jusqu'à la lecture des courtes sourates du Coran.
Pour adultes francophones qui partent de zéro. Sans publicité, sans traqueur, sans compte : la progression reste dans
le navigateur.

- **En ligne** : https://mb0781.github.io/iqra/ (dès que GitHub Pages est activé, voir plus bas)
- **Parcours** : 9 étapes, 48 leçons de 5 à 10 minutes, de la lettre ب à Al-Fatiha puis cinq sourates courtes.
  Détail dans [docs/PROGRAMME.md](docs/PROGRAMME.md).
- **Texte coranique** : [Tanzil](https://tanzil.net) (uthmani, Mushaf de Médine), reproduit sans modification.

## Voir le site sur ton ordinateur

Il faut [Node.js](https://nodejs.org) version 22.

```bash
npm install        # une seule fois : télécharge les outils
npm run dev        # puis ouvre http://localhost:4321/iqra/
```

## Publier le site (GitHub Pages)

Le site se publie tout seul à chaque modification de la branche `main` (fichier
`.github/workflows/deploiement.yml`). **Une seule action manuelle, la première fois** : sur GitHub, ouvre
*Settings → Pages* du dépôt et choisis **Source : GitHub Actions**. L'adresse sera https://mb0781.github.io/iqra/.

## Ajouter ou modifier une leçon

Chaque leçon est un fichier JSON dans `src/contenus/lecons/etape-N/`. Le mode d'emploi complet est dans
[docs/GUIDE-REDACTION.md](docs/GUIDE-REDACTION.md). En résumé :

1. Copie une leçon voisine, change son `id`, son `ordre` et son contenu.
2. Pour un mot du Coran, n'écris jamais le texte : écris sa référence (`q:112:1:5` = sourate 112, verset 1, 5ᵉ mot
   du fichier Tanzil). `npx tsx scripts/jetons.ts 112` liste les mots d'une sourate.
3. Vérifie : `npx tsx scripts/verifier-contenus.ts` doit afficher 0 problème. Le programme refuse par exemple une
   voyelle utilisée avant la leçon qui l'enseigne.
4. Mets à jour l'audio et le programme : `npm run audio:manifest` puis `npx tsx scripts/programme.ts`.

Avec Claude Code, demande simplement « ajoute une leçon sur… » : le skill `ajouter-une-lecon` connaît la marche à suivre.

## Ajouter les audios

Les mots et versets du Coran utilisent l'audio public de Quran.com. Les lettres, syllabes et mots d'entraînement
doivent être enregistrés par un récitateur, sur la page cachée `/studio/` du site. Mode d'emploi :
[docs/GUIDE-ENREGISTREMENT.md](docs/GUIDE-ENREGISTREMENT.md). En bref : enregistrer, télécharger le ZIP, déposer les
fichiers dans `public/audio/`, lancer `npm run audio:manifest`.

## Vérifier que tout va bien

```bash
npm test                 # tests unitaires (progression, répétition espacée, contenus, texte coranique)
npm run build            # construit le site dans dist/
npm run verifier         # texte affiché identique à Tanzil, ordre des notions, manifeste audio
npx playwright test      # parcours complet dans un vrai navigateur, accessibilité (mobile et ordinateur)
```

## Documents

| Fichier | Contenu |
|---|---|
| [docs/RAPPORT-FINAL.md](docs/RAPPORT-FINAL.md) | Ce qui est fait, preuves, ce qui reste à faire par un humain |
| [docs/PROGRAMME.md](docs/PROGRAMME.md) | Le parcours complet, leçon par leçon |
| [docs/DESIGN.md](docs/DESIGN.md) | Le design system |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Les choix techniques et pourquoi |
| [docs/SOURCES-ET-LICENCES.md](docs/SOURCES-ET-LICENCES.md) | Sources et licences |
| [CLAUDE.md](CLAUDE.md) | Consignes pour les prochaines sessions de Claude Code |
