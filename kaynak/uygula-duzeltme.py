# Kullanım: python3 uygula-duzeltme.py duzeltme-....txt  → data4.json'u yerinde günceller
import json, sys
GRP = {"GK":"GK","RB":"DF","CB":"DF","LB":"DF","RWB":"DF","LWB":"DF","DM":"MF","CM":"MF","AM":"MF","RM":"MF","LM":"MF","ST":"FW"}
D = json.load(open("data4.json", encoding="utf-8"))
ren, pos = {}, {}
for line in open(sys.argv[1], encoding="utf-8"):
    line = line.strip()
    if not line or line.startswith("#"): continue
    if line.startswith("@"): a, b = line[1:].split("=>"); ren[a.strip()] = b.strip()
    else: n, v = line.split("=", 1); pos[n.strip()] = [x.strip() for x in v.split(",")]
cnt = {"ad": 0, "mevki": 0}; seen = set()
for s, teams in D.items():
    for t in teams:
        for p in t["players"]:
            if p["n"] in ren: p["n"] = ren[p["n"]]; cnt["ad"] += 1
            if p["n"] in pos:
                p["d"] = pos[p["n"]]; seen.add(p["n"]); cnt["mevki"] += 1
                g = GRP.get(p["d"][0])
                if g and p["p"][0] != g and p["d"][0] not in ("RW", "LW"): p["p"] = [g]
missing = [n for n in pos if n not in seen]
json.dump(D, open("data4.json", "w", encoding="utf-8"), ensure_ascii=False)
print("✅", cnt, "| bulunamayan:", missing)
