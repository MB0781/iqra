"""Tests du convertisseur : python3 -I scripts/voix/test_ipa.py"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ipa import phonemes

def p(t): return "".join(phonemes(t))
cas = {
    "بَ": "bˈa", "بَا": "bˈaː", "بِي": "bˈiː", "بُو": "bˈuː", "بْ": "b",
    "كَتَبَ": "kˈataba", "كِتَابٌ": "kitˈaːbun", "قَلَمٌ": "qˈalamun",
    "مَدْرَسَةٌ": "madrˈasatun", "رَبٌّ": "rˈabbun", "كِتَابًا": "kitˈaːban",
    "ٱلشَّمْسُ": "ʔaʃʃˈamsu", "الْقَمَرُ": "ʔalqˈamaru", "سُؤَالٌ": "suʔˈaːlun",
    "صَبْرٌ": "sˤˈabrun", "طَيْرٌ": "tˤˈajrun", "آمَنَ": "ʔˈaːmana", "هٰذَا": "hˈaːðaː",
}
erreurs = 0
for ar, attendu in cas.items():
    obtenu = p(ar)
    ok = obtenu == attendu
    erreurs += not ok
    print(("✔" if ok else "✘"), ar, obtenu, "" if ok else f"(attendu {attendu})")
print(f"{len(cas) - erreurs}/{len(cas)}")
sys.exit(1 if erreurs else 0)
