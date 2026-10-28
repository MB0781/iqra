"""
Génère l'audio de synthèse des éléments pédagogiques « à enregistrer » (lettres, formes, syllabes, mots).
Voix : Piper « ar_JO-kareem-medium » (https://huggingface.co/rhasspy/piper-voices).
Jamais pour le texte coranique (audio humain de Quran.com).

Prérequis (voir docs/VOIX-DE-SYNTHESE.md) :
  python3 -m venv .venv-voix && .venv-voix/bin/pip install piper-tts==1.8.0 audiotsm lameenc numpy
  modèle : ar_JO-kareem-medium.onnx et .onnx.json dans le dossier passé en argument.
Usage :
  .venv-voix/bin/python scripts/voix/generer.py <dossier-modele> [--seulement id1,id2] [--forcer]
Puis : npm run audio:manifest
"""
import glob, json, os, sys, wave
import numpy as np
import lameenc
from piper import PiperVoice, SynthesisConfig
from audiotsm import wsola
from audiotsm.io.array import ArrayReader, ArrayWriter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ipa import phonemes, nb_syllabes, mot_vers_segments, CONSONNES, TATWEEL, ZWJ

RACINE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SORTIE = os.path.join(RACINE, "public", "audio")
modele = sys.argv[1]
forcer = "--forcer" in sys.argv
seulement = set(sys.argv[sys.argv.index("--seulement") + 1].split(",")) if "--seulement" in sys.argv else None

voix = PiperVoice.load(os.path.join(modele, "ar_JO-kareem-medium.onnx"))
SR = voix.config.sample_rate
LENT = SynthesisConfig(length_scale=3.5, noise_scale=0.4, noise_w_scale=0.3)   # syllabes et lettres
MOT = SynthesisConfig(length_scale=1.7, noise_scale=0.45, noise_w_scale=0.5)   # mots : débit posé


def parole(a, seuil=0.03):
    win = int(0.01 * SR)
    env = np.convolve(np.abs(a), np.ones(win) / win, "same")
    i = np.where(env > seuil * env.max())[0]
    m = int(0.02 * SR)
    return a[max(0, i[0] - m): i[-1] + m]


def etirer(a, cible):
    vitesse = (len(a) / SR) / cible
    if vitesse >= 1:
        return a
    vitesse = max(vitesse, 1 / 1.4)  # étirement limité pour rester naturel
    r, w = ArrayReader(a[np.newaxis, :]), ArrayWriter(1)
    wsola(1, speed=vitesse, frame_length=1024, synthesis_hop=256).run(r, w)
    return w.data[0]


def synthese(ph, cfg, cible=None):
    a = np.asarray(voix.phoneme_ids_to_audio(voix.phonemes_to_ids(ph), cfg), dtype=np.float32)
    a = parole(a)
    if cible:
        a = etirer(a, cible)
    a = a / max(1e-6, np.abs(a).max()) * 0.85
    f = int(0.02 * SR)
    a = a.copy()
    a[:f] *= np.linspace(0, 1, f)
    a[-f:] *= np.linspace(1, 0, f)
    sil = np.zeros(int(0.25 * SR), dtype=np.float32)
    return np.concatenate([sil, a, sil])


def mp3(a, chemin):
    enc = lameenc.Encoder()
    enc.set_bit_rate(64); enc.set_in_sample_rate(SR); enc.set_channels(1); enc.set_quality(2)
    data = enc.encode((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes()) + enc.flush()
    open(chemin, "wb").write(data)


# Son d'une lettre isolée : consonne appuyée + voyelle tenue (style « B » validé à l'écoute)
SON_LETTRE = {"ا": "ʔaː", "ء": "ʔaː", "أ": "ʔaː", "إ": "ʔiː", "ؤ": "ʔuː", "ئ": "ʔiː", "آ": "ʔaː",
              "ٱ": "ʔa", "ة": "ttaː", "ى": "ʔaː"}


def phonemes_lettre(ar):
    base = [c for c in ar if c not in (TATWEEL, ZWJ)][0]
    if base in SON_LETTRE:
        s = SON_LETTRE[base]
    else:
        c = CONSONNES[base]
        s = c + c + "aː"
    return list(s.replace("aː", "ˈaː").replace("iː", "ˈiː").replace("uː", "ˈuː").replace("ʔˈa", "ʔˈa"))


def main():
    manifeste = json.load(open(os.path.join(RACINE, "data", "audio", "manifest.json"), encoding="utf-8"))
    elements = {}
    for f in glob.glob(os.path.join(RACINE, "src", "contenus", "elements", "*.json")):
        for e in json.load(open(f, encoding="utf-8")):
            elements[e["id"]] = e
    journal = {}
    chemin_journal = os.path.join(RACINE, "data", "audio", "synthese.json")
    if os.path.exists(chemin_journal):
        journal = json.load(open(chemin_journal, encoding="utf-8"))
    ignores, faits = [], 0
    for ent in manifeste["elements"]:
        id_ = ent["id"]
        if seulement and id_ not in seulement:
            continue
        if ent["source"] != "enregistrement":
            continue
        if ent["statut"] == "disponible" and id_ not in journal:
            continue  # enregistrement humain : jamais écrasé
        if id_ in journal and not forcer:
            continue
        e = elements[id_]
        ar = e["ar"]
        vocalise = any(ch in ar for ch in "ًٌٍَُِّْ")
        if e["type"] in ("lettre", "forme"):
            a = synthese(phonemes_lettre(ar), LENT, cible=0.85)
            style = "lettre"
        elif not vocalise:
            ignores.append(id_)
            continue
        elif e["type"] == "syllabe" and nb_syllabes(ar) == 1:
            seg = mot_vers_segments(ar)
            # consonne initiale appuyée, longueur de voyelle respectée (بَ ≠ بَا)
            ph = phonemes(ar)
            if seg and seg[0] not in ("a", "i", "u"):
                c = seg[0]
                ph = list(c) + ph
            longue = any(s.endswith("ː") for s in seg)
            a = synthese(ph, LENT, cible=0.95 if longue else 0.65)
            style = "syllabe"
        else:
            a = synthese(phonemes(ar), MOT)
            style = "mot"
        dur = (len(a) / SR) - 0.5
        if dur < 0.15 or dur > 6:
            print(f"⚠ durée anormale {id_} : {dur:.2f} s", flush=True)
        mp3(a, os.path.join(SORTIE, f"{id_}.mp3"))
        journal[id_] = {"voix": "piper ar_JO-kareem-medium", "style": style, "duree": round(dur, 2)}
        faits += 1
    json.dump(journal, open(chemin_journal, "w", encoding="utf-8"), ensure_ascii=False, indent=1, sort_keys=True)
    print(f"{faits} sons générés ; {len(ignores)} ignorés (non vocalisés) : {', '.join(ignores[:5])}…")


main()
