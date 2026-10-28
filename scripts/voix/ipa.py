"""
Conversion de l'arabe ENTIÈREMENT VOCALISÉ (contenus pédagogiques d'Iqra') en phonèmes
pour la voix de synthèse Piper « ar_JO-kareem ». Règles de l'arabe littéral, forme complète
(tanwin prononcé), sans pause finale. Ne sert jamais au texte coranique.
"""
FATHA, DAMMA, KASRA = "َ", "ُ", "ِ"
SOUKOUN, CHADDA = "ْ", "ّ"
TAN_A, TAN_U, TAN_I = "ً", "ٌ", "ٍ"
ALIF_SUSCRIT, MADD = "ٰ", "ٓ"
TATWEEL, ZWJ = "ـ", "‍"

CONSONNES = {
    "ب": "b", "ت": "t", "ث": "θ", "ج": "dʒ", "ح": "ħ", "خ": "χ", "د": "d", "ذ": "ð", "ر": "r",
    "ز": "z", "س": "s", "ش": "ʃ", "ص": "sˤ", "ض": "dˤ", "ط": "tˤ", "ظ": "ðˤ", "ع": "ʕ", "غ": "ɣ",
    "ف": "f", "ق": "q", "ك": "k", "ل": "l", "م": "m", "ن": "n", "ه": "h", "و": "w", "ي": "j",
    "ء": "ʔ", "أ": "ʔ", "إ": "ʔ", "ؤ": "ʔ", "ئ": "ʔ", "ة": "t",
}
VOYELLES = {FATHA: "a", DAMMA: "u", KASRA: "i"}
TANWINS = {TAN_A: "an", TAN_U: "un", TAN_I: "in"}
SOLAIRES = set("تثدذرزسشصضطظلن")
SIGNES = set([FATHA, DAMMA, KASRA, SOUKOUN, CHADDA, TAN_A, TAN_U, TAN_I, ALIF_SUSCRIT, MADD])


def grappes(mot):
    g = []
    for c in mot:
        if c in (TATWEEL, ZWJ):
            continue
        if c in SIGNES and g:
            g[-1][1] += c
        else:
            g.append([c, ""])
    return g


def mot_vers_segments(mot):
    """Renvoie une liste de segments phonétiques : consonnes et voyelles (a, aː, i, iː, u, uː)."""
    g = grappes(mot)
    seg = []
    i = 0
    # Article al- en début de mot (ال / ٱل)
    if len(g) >= 3 and g[0][0] in "اٱ" and g[1][0] == "ل":
        seg += ["ʔ", "a"]
        suivante = g[2][0]
        if suivante in SOLAIRES and CHADDA in g[2][1]:
            pass  # lâm assimilé : la chadda de la lettre suivante double le son
        else:
            seg.append("l")
        i = 2
    elif g and g[0][0] == "ٱ":
        seg += ["ʔ"]  # alif de liaison en début de mot isolé : prononcé avec sa voyelle
        i = 1
    while i < len(g):
        base, s = g[i]
        prev = seg[-1] if seg else ""
        if base == "آ":
            seg += ["ʔ", "aː"]
        elif base == "ا":
            if prev == "a":
                seg[-1] = "aː"
            elif prev.endswith("n") and i == len(g) - 1:
                pass  # alif muet après tanwin fath
            elif i == 0:
                seg.append("ʔ")
                if FATHA in s: seg.append("a")
                elif KASRA in s: seg.append("i")
                elif DAMMA in s: seg.append("u")
        elif base == "ى":
            if prev == "a":
                seg[-1] = "aː"
            elif prev == "i":
                seg[-1] = "iː"
        elif base == "و" and not s and prev == "u":
            seg[-1] = "uː"
        elif base == "ي" and not s and prev == "i":
            seg[-1] = "iː"
        elif base in CONSONNES:
            c = CONSONNES[base]
            seg.append(c)
            if CHADDA in s:
                seg.append(c)
            for v, ph in VOYELLES.items():
                if v in s:
                    seg.append(ph)
            for t, ph in TANWINS.items():
                if t in s:
                    seg += [ph[0], "n"]
            if ALIF_SUSCRIT in s:
                if seg[-1] == "a":
                    seg[-1] = "aː"
                else:
                    seg.append("aː")
        i += 1
    return seg


EST_VOYELLE = {"a", "i", "u", "aː", "iː", "uː"}


def accentuer(seg):
    """Place l'accent (ˈ) avant la voyelle de la syllabe accentuée (règle classique de l'arabe littéral)."""
    noyaux = [k for k, s in enumerate(seg) if s in EST_VOYELLE]
    if not noyaux:
        return seg
    def lourde(n):
        k = noyaux[n]
        fin = noyaux[n + 1] if n + 1 < len(noyaux) else len(seg)
        coda = [s for s in seg[k + 1:fin] if s not in EST_VOYELLE]
        # en milieu de mot, la dernière consonne avant la voyelle suivante appartient à la syllabe suivante
        if n + 1 < len(noyaux):
            coda = coda[:-1]
        return seg[k].endswith("ː") or len(coda) >= 1
    n = len(noyaux)
    if n == 1:
        cible = 0
    elif lourde(n - 1) and (seg[noyaux[-1]].endswith("ː") and noyaux[-1] < len(seg) - 1):
        cible = n - 1  # syllabe finale surlourde
    elif lourde(n - 2) or n == 2:
        cible = n - 2
    else:
        cible = n - 3
    k = noyaux[cible]
    return seg[:k] + ["ˈ"] + seg[k:]


def phonemes(texte):
    """Texte arabe vocalisé → liste de phonèmes Piper (mots séparés par une espace)."""
    res = []
    for m, mot in enumerate(texte.split()):
        if m:
            res.append(" ")
        for s in accentuer(mot_vers_segments(mot)):
            res += list(s)
    return res


def nb_syllabes(texte):
    return sum(1 for mot in texte.split() for s in mot_vers_segments(mot) if s in EST_VOYELLE)
