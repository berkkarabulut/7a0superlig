from playwright.sync_api import sync_playwright
CARDS=[ # name, rating, pos, season, club, shirt c1, c2, tier
 ("RÜŞTÜ",92,"KL","FB 2000-01","#163962","#ffed00"),
 ("HAGİ",94,"OOS","GS 1998-99","#a90432","#fdb912"),
 ("SERGEN",95,"OOS","BJK 2003-04","#111111","#ffffff"),
 ("HAMİ",93,"SF","TS 1995-96","#7b1e3a","#6cace4"),
 ("ALEX",92,"OOS","FB 2004-05","#163962","#ffed00"),
]
def card(i,c):
    n,r,p,s,c1,c2=c
    off=i-2; big=(off==0)
    rot=off*7; dy=abs(off)*abs(off)*9+ (0 if big else 18); x=off*150
    sc=1.04 if big else 0.9
    return f'''<div class="card{' gold' if r>=94 else ''}" style="transform:translate(calc(-50% + {x}px),{dy}px) rotate({rot}deg) scale({sc});z-index:{10-abs(off)}">
 <div class="ct"><div class="rt">{r}</div><div class="ps">{p}</div></div>
 <svg viewBox="0 0 40 38" class="sh"><path d="M13 3 Q20 8 27 3 L37 8 L40 17 L33 19 L32 37 L8 37 L7 19 L0 17 L3 8 Z" fill="{c1}" stroke="{c2}" stroke-width="2.4"/><path d="M13 3 Q20 8 27 3" fill="none" stroke="{c2}" stroke-width="2.4"/></svg>
 <div class="nm">{n}</div><div class="ss">{s}</div></div>'''
HTML=f"""<html lang="tr"><head><style>
*{{box-sizing:border-box}}
body{{margin:0;width:1200px;height:630px;overflow:hidden;position:relative;font-family:'Inter Display','Inter',sans-serif;color:#fff;
 background:radial-gradient(ellipse 60% 70% at 50% 62%,#3a1260 0%,#1b0730 55%,#0d0318 100%)}}
.lights{{position:absolute;inset:0;background:
 radial-gradient(circle at 8% -10%,#ffffff22 0,transparent 32%),radial-gradient(circle at 92% -10%,#ffffff22 0,transparent 32%);}}
.pitch{{position:absolute;left:50%;bottom:-260px;width:1500px;height:520px;transform:translateX(-50%) perspective(600px) rotateX(55deg);
 background:repeating-linear-gradient(90deg,#1f7a44 0 100px,#1a6d3c 100px 200px);opacity:.55;border-top:4px solid #ffffff44}}
.pitch:after{{content:"";position:absolute;left:50%;top:-4px;width:300px;height:300px;border:4px solid #ffffff44;border-radius:50%;transform:translate(-50%,-50%)}}
.top{{position:absolute;top:0;left:0;right:0;height:10px;background:#e30a17}}
.bug{{position:absolute;top:34px;left:44px;display:flex;font-weight:800;font-size:22px;letter-spacing:2px}}
.bug span{{padding:8px 14px;background:#ffffff14;border:1px solid #ffffff22}}
.bug .live{{background:#e30a17;border-color:#e30a17}}
.free{{position:absolute;top:34px;right:44px;font-weight:800;font-size:22px;letter-spacing:2px;padding:8px 16px;border:2px solid #ffb703;color:#ffb703}}
.word{{position:absolute;top:70px;left:0;right:0;text-align:center;font-weight:900;font-size:104px;letter-spacing:-2px;line-height:1;text-shadow:0 8px 30px #000a}}
.word b{{display:inline-block;background:#e30a17;padding:2px 22px 6px;margin-left:16px;border-radius:6px;transform:skewX(-8deg);box-shadow:0 10px 30px #e30a1766}}
.tag{{position:absolute;top:190px;left:0;right:0;text-align:center;font-weight:700;font-size:34px;color:#ffb703;letter-spacing:.5px}}
.deck{{position:absolute;left:50%;top:286px;width:0;height:0}}
.card{{position:absolute;left:0;top:0;width:170px;height:236px;transform-origin:50% 120%;border-radius:14px 14px 22px 22px;padding:12px 12px 10px;
 background:linear-gradient(160deg,#e9e4f2 0%,#b8acc9 100%);color:#1b0730;box-shadow:0 18px 40px #000c;border:3px solid #ffffff88;text-align:center}}
.card.gold{{background:linear-gradient(160deg,#fff1b8 0%,#e0a800 55%,#a87400 100%);border-color:#fff4c4}}
.ct{{position:absolute;left:14px;top:10px;text-align:center;line-height:1}}
.rt{{font-weight:900;font-size:44px}} .ps{{font-weight:800;font-size:17px;margin-top:2px}}
.sh{{width:86px;height:82px;margin:30px 0 8px 62px;display:block;filter:drop-shadow(0 4px 4px #0006)}}
.nm{{font-weight:900;font-size:30px;letter-spacing:.5px;margin-top:6px;border-top:2px solid #1b073033;padding-top:4px}}
.ss{{font-weight:700;font-size:15px;opacity:.75;margin-top:1px}}
.foot{{z-index:50;position:absolute;left:0;right:0;bottom:0;height:62px;background:#0d0318e6;border-top:3px solid #e30a17;display:flex;align-items:center;justify-content:center;gap:34px;
 font-weight:800;font-size:25px;letter-spacing:1px}}
.foot i{{font-style:normal;color:#ffb703}}
.rec{{display:flex;gap:6px}} .rec span{{width:34px;height:34px;display:grid;place-items:center;background:#00a88f;border-radius:4px;font-size:18px}}
</style></head><body>
<div class="lights"></div><div class="pitch"></div><div class="top"></div>
<div class="bug"><span class="live">● CANLI</span><span>DRAFT · 1980–2025</span></div>
<div class="free">ÜCRETSİZ</div>
<div class="word">SÜPER LİG<b>7-0</b></div>
<div class="tag">Efsane 11'ini kur · 7 maç · 7 galibiyet · kalende gol yok</div>
<div class="deck">{''.join(card(i,c) for i,c in enumerate(CARDS))}</div>
<div class="foot"><span><i>46</i> SEZON</span><span><i>137</i> TAKIM</span><span><i>1756</i> OYUNCU</span><div class="rec"><span>G</span><span>G</span><span>G</span><span>G</span><span>G</span><span>G</span><span>G</span></div><span>⚽ TARAYICIDA OYNA</span></div>
</body></html>"""
import sys
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
    pg=b.new_page(viewport={"width":1200,"height":630}); pg.set_content(HTML); pg.wait_for_timeout(400)
    pg.screenshot(path=sys.argv[1]); b.close()
