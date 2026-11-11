#!/usr/bin/env python3
"""İngilizce/İspanyolca modda ekranda kalan Türkçe yazıları listeler.
Kullanım: DIL=en HARVEST=/tmp/h_en.txt python3 robot.py ; python3 ceviri-kontrol.py /tmp/h_en.txt"""
import json, re, sys, os
H = os.path.join(os.path.dirname(__file__), "..")
d = json.load(open(os.path.join(H, "data4.json"), encoding="utf-8"))
names, teams = set(), set()
for s, ts in d.items():
    for t in ts:
        teams.add(t["team"])
        for p in t["players"]:
            names.add(p["n"]); ps = p["n"].split(" ")
            if len(ps) > 1: names.add(ps[0][0] + ". " + " ".join(ps[1:]))
html = open(os.path.join(H, "..", "index.html"), encoding="utf-8").read()
names |= set(re.findall(r'"[0-9-]+\|[^"]+":"([^"]+)"', html)) | set(re.findall(r'\["([^"]+)",\d{4},\d{4}\]', html))
TR = re.compile(r"[çğıöşüÇĞŞÖÜ]|İ|(?i:\b(ve|bir|ile|için|maç|oyuncu|takım|sezon|kadro|yap|seç|dakika|hakem|kura|yedek|kaleci|bitirdi|başla)\b)")
left = set()
for l in open(sys.argv[1], encoding="utf-8"):
    l = l.strip()
    if not l or not TR.search(l): continue
    core = re.sub(r"^[^\wÇĞİÖŞÜçğıöşü\[]+", "", l).strip()
    if core in names or core in teams: continue
    stripped = l
    for n in sorted(names | teams, key=len, reverse=True):
        if n in stripped: stripped = stripped.replace(n, "")
    if not TR.search(stripped): continue
    left.add(l)
for l in sorted(left): print(l)
print(f"--- {len(left)} çevrilmemiş satır", file=sys.stderr)
