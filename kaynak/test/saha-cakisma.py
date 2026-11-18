# maç sahasında hiçbir oyuncunun ismi başka bir oyuncunun formasına, ismine ya da notuna değmemeli (her diziliş, telefon + bilgisayar)
from playwright.sync_api import sync_playwright
import time, json, sys, os
HTML=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else os.path.join(os.path.dirname(__file__),"..","..","index.html"))
CHK = """()=>{ const sl=[...document.querySelectorAll('#mpitch .slot.full')]; const R=e=>e?e.getBoundingClientRect():null;
 const hit=(a,b)=>a&&b&&a.left<b.right-1&&b.left<a.right-1&&a.top<b.bottom-1&&b.top<a.bottom-1; const bad=[];
 for(const A of sl) for(const B of sl){ if(A===B) continue; const an=R(A.querySelector('.nm'));
   if(hit(an,R(B.querySelector('.shirt')))||hit(an,R(B.querySelector('.nm')))||hit(an,R(B.querySelector('.lr')))) bad.push(A.querySelector('.nm').textContent+' > '+B.querySelector('.nm').textContent); }
 return bad; }"""
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
    tot=0
    for vp,n in [({"width":1280,"height":1000},"pc"),({"width":390,"height":844},"tel"),({"width":1440,"height":900},"pc2")]:
        pg=b.new_page(viewport=vp)
        pg.goto("file://"+HTML)
        pg.evaluate("()=>{localStorage.setItem('sl70:team',JSON.stringify({name:'DENEM',suffix:'FC'}));localStorage.setItem('sl70:cerez',JSON.stringify({a:true,t:1}))}")
        pg.reload(); time.sleep(1)
        forms=pg.evaluate("()=>Object.keys(FORMATIONS)")
        for f in forms:
            ok=pg.evaluate("(f)=>{S.runId=(S.runId||0)+1; const L=saTeams(); S.santra={me:L.find(t=>t.id.includes('2026-27|Galatasaray')).id,op:L.find(t=>t.id.includes('2026-27|Fenerbahçe')).id,pk:false}; santraGo(); const r=realSetForm(f); startSantra(); if(mustFix(S.T)) autoFixMiss(); S.speed='Yavaş'; setTimeout(()=>runMatch(),0); return S.form}", f)
            time.sleep(1.2)
            bad=pg.evaluate(CHK); tot+=len(bad)
            if bad: print("HATA", n, f, bad[:3])
        pg.close()
    print("saha: 9 diziliş x 3 ekran, isim çakışması:", tot)
    if tot: sys.exit(1)
    b.close()
