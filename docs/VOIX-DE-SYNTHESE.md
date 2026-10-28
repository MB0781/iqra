# Voix de synthèse

Décision du propriétaire du projet (octobre 2026) : les lettres, formes, syllabes et mots d'entraînement utilisent une
voix de synthèse en attendant un récitateur. **Le texte coranique n'est jamais synthétisé** : mots et versets
restent récités par Mishary Rashid Alafasy (audio public de Quran.com).

## La voix

- Moteur : [Piper](https://github.com/rhasspy/piper) (licence MIT), voix `ar_JO-kareem-medium`
  ([rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices)), voix d'homme, arabe (Jordanie).
- Licence des données d'entraînement : la fiche du modèle renvoie au dépôt `AliMokhammad/arabicttstrain`, qui ne
  déclare aucune licence. **Zone grise** acceptée pour un usage éducatif gratuit ; à remplacer par un enregistrement
  humain ou une voix sous licence claire si le projet évolue.

## Comment les sons sont produits

`scripts/voix/ipa.py` convertit l'arabe **entièrement vocalisé** en phonèmes (règles de l'arabe littéral, tanwin
prononcé, article et lettres solaires, emphatiques ṣ ḍ ṭ ẓ). Le phonétiseur intégré de Piper n'est pas utilisé : il lit
une syllabe isolée comme un nom de lettre (« قَ » → « qâf ») et perd les emphatiques. Tests : `python3 -I scripts/voix/test_ipa.py`.

`scripts/voix/generer.py` :
- **lettres et formes** : consonne appuyée + voyelle tenue (« style B », choisi à l'écoute) ;
- **syllabes** : diction lente, consonne appuyée, **longueur de voyelle respectée** (بَ ≠ بَا) ;
- **mots** : débit posé ;
- fondu d'entrée et de sortie, normalisation, MP3 64 kbit/s mono dans `public/audio/<id>.mp3` ;
- journal dans `data/audio/synthese.json` ; les mots **non vocalisés** (étape 2) ne sont pas générés.

## Régénérer

```
python3 -m venv .venv-voix && .venv-voix/bin/pip install -r scripts/voix/requirements.txt
# télécharger ar_JO-kareem-medium.onnx et .onnx.json depuis rhasspy/piper-voices (ar/ar_JO/kareem/medium/) dans un dossier
.venv-voix/bin/python scripts/voix/generer.py <dossier> [--seulement id1,id2] [--forcer]
npm run audio:manifest
```

Un enregistrement humain déposé dans `public/audio/` (même identifiant) remplace le son de synthèse : retirer l'entrée
de `data/audio/synthese.json`, puis `npm run audio:manifest`. Le studio (`/studio`) propose aussi ces éléments.
