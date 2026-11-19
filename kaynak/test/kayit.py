# Otomatik kayıt / "Kaldığın yerden devam et" testi (telefon ekranı).
# Oyunun her aşamasında sayfa zorla yenilenir (telefonun sekmeyi öldürmesi gibi); ana sayfada devam notu çıkmalı,
# "Devam et" oyuncuyu tam bıraktığı yere götürmeli. Maçın ortasında yenilenen maç tekrar açılınca birebir aynı oynanmalı.
import sys, os, time, json
from playwright.sync_api import sync_playwright
HTML = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "..", "..", "index.html"))
FILL = """(n)=>{ let k=0; while(S.phase==="xi"&&k++<80){ if(n!=null && S.slots.filter(z=>z.p).length>=n) break; let i=S.cur.players.findIndex(p=>canPick(p)&&openSlots().some(z=>natural(p,z.pos))); if(i<0){roll();continue} pick(i); place(curSlots().findIndex(z=>!z.p&&natural(S.cur.players[i],z.pos))) } }"""
BENCH = """(n)=>{ let k=0; while(S.phase==="bench"&&S.bench.some(z=>!z.p)&&k++<80){ if(n!=null && S.bench.filter(z=>z.p).length>=n) break; let i=S.cur.players.findIndex(p=>canPick(p)&&openSlots().some(z=>natural(p,z.pos))); if(i<0){ if(S.rerolls>0){reroll();continue} break;} pick(i);} }"""
fails = []
def ok(c, msg):
    if not c: fails.append(msg); print("❌", msg)
    else: print("✓", msg)

with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    pg = b.new_page(viewport={"width": 390, "height": 844}); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("file://" + HTML)
    pg.evaluate("()=>{localStorage.clear();localStorage.setItem('sl70:team',JSON.stringify({name:'KAYIT',suffix:'FC'}));localStorage.setItem('sl70:cerez',JSON.stringify({a:true,t:1}))}")
    pg.reload(); time.sleep(0.8)
    ok(pg.locator("#devamkart").count() == 0, "kayıt yokken ana sayfada devam notu çıkmıyor")
    def mac_bitir(n):
        # devam sonrası kendiliğinden başlayan maçı bitir (devre arasında "Direkt başlat")
        for _ in range(400):
            if pg.evaluate("(n)=>S.T && S.T.res.length>=n", n): return True
            pg.evaluate("()=>{const b=[...document.querySelectorAll('#htbox button')].find(x=>/Direkt başlat/.test(x.textContent)); if(b) b.click();}")
            time.sleep(0.1)
        return False
    def yenile_devam(hizli=False):
        pg.reload(); time.sleep(0.8)
        if hizli: pg.evaluate("()=>{ for(const k in SPEEDS) if(k!=='Anında') SPEEDS[k]=5; }")
        has = pg.locator("#devamkart").count() > 0
        txt = pg.locator("#devamkart").inner_text() if has else ""
        if has: pg.locator("#devamkart .btn.gold").click(); time.sleep(0.6)
        return has, txt

    # 1) draft ortası
    pg.evaluate("()=>{ pickMode('solo'); startDraft(); }"); pg.evaluate(FILL, 5); time.sleep(0.3)
    names = pg.evaluate("()=>S.slots.filter(s=>s.p).map(s=>s.p.n)")
    has, txt = yenile_devam()
    ok(has and "5/11" in txt, f"draft ortasında yenileyince devam notu çıkıyor ({txt.splitlines()[1] if has else '-'})")
    ok(pg.evaluate("()=>S.slots.filter(s=>s.p).map(s=>s.p.n)") == names and pg.locator(".pitch").count() > 0, "devam: draft ekranı, aynı 5 oyuncu yerinde")
    # draft'ı bitir, turnuvaya gir
    pg.evaluate(FILL, None); time.sleep(0.2); pg.evaluate(BENCH, None)
    if pg.evaluate("()=>S.phase==='bench'"): pg.evaluate("()=>skipBench()")
    time.sleep(0.3)
    has, txt = yenile_devam()
    ok(has and "Turnuva öncesi" in txt and pg.locator("#play .btn").count() > 0, "hazır ekranında yenileyince devam → hazır ekranı")
    pg.evaluate("()=>{ S.speed='Anında'; startTournament(); }"); time.sleep(0.3)
    pg.evaluate("()=>{ const s=document.getElementById('kskip'); if(s) s.click(); }"); time.sleep(0.4)
    pg.evaluate("()=>{ const g=document.getElementById('kgo'); if(g) g.click(); }"); time.sleep(0.4)
    grp = pg.evaluate("()=>S.T.group.map(g=>g.name)")
    # 2) maç öncesi
    has, txt = yenile_devam()
    ok(has and "Grup 1. maç öncesi" in txt and pg.locator(".wz-steps").count() > 0, f"maç öncesinde yenileyince devam → maç öncesi ({txt.splitlines()[1] if has else '-'})")
    ok(pg.evaluate("()=>S.T.group.map(g=>g.name)") == grp, "devam: grup rakipleri aynı")
    ok(pg.evaluate("()=>S.T.o===S.T.group[0]"), "devam: rakip nesnesi gruptakiyle aynı nesne (kimlik korunuyor)")
    # 3) maç sonu
    pg.evaluate("async ()=>{ S.speed='Anında'; await runMatch(); }"); time.sleep(0.3)
    r1 = pg.evaluate("()=>S.T.res[0]")
    has, txt = yenile_devam()
    ok(has and "Grup 2. maç öncesi" in txt and "1 maç" in txt, f"maç bitince yenileyince devam notu ({txt.splitlines()[1] if has else '-'})")
    ok(pg.evaluate("()=>S.T.i===1 && S.T.res.length===1 && S.T.o===S.T.group[1]") and pg.locator(".wz-steps").count() > 0, "devam: 2. maçın öncesine gelindi, 1. maç sonucu duruyor")
    ok(pg.evaluate("()=>JSON.stringify(S.T.res[0])") == json.dumps(r1, separators=(",", ":"), ensure_ascii=False), "devam: 1. maç sonucu birebir aynı")
    # 4) maç ortası: aynı maç birebir aynı oynanmalı
    pg.evaluate("()=>{ SPEEDS['Hızlı']=60; S.speed='Hızlı'; setTimeout(()=>runMatch(),0); }"); time.sleep(1.2)
    canli = pg.evaluate("()=>localStorage.getItem('sl70:kayit')")
    ok(json.loads(canli)["nerede"] == "live", "maç başlayınca 'maç oynanıyor' kaydı alındı")
    # maçı (devre arası dahil) bitir, sonucu al
    pg.evaluate("()=>{ S.runId++; }"); pg.evaluate("async ()=>{ S.speed='Anında'; await runMatch(); }"); time.sleep(0.3)
    ra = pg.evaluate("()=>[S.T.res[1], S.T.st.m[1] && S.T.st.m[1].sh]")
    # kaydı maç başına geri al, sayfa yenile (telefon sekmeyi öldürdü), devam et, maçı tekrar oyna
    pg.evaluate("(k)=>localStorage.setItem('sl70:kayit',k)", canli)
    has, txt = yenile_devam(hizli=True)
    ok(has and "oynanıyordu" in txt, f"maç ortasında yenileyince devam notu ({txt.splitlines()[1] if has else '-'})")
    ok(pg.evaluate("()=>!!document.getElementById('mgrid')"), "devam: maç ortasında kalan maç direkt maç ekranında açıldı (maç öncesine dönülmedi)")
    ok(mac_bitir(2), "devam eden maç sonuna kadar oynandı"); time.sleep(0.3)
    rb = pg.evaluate("()=>[S.T.res[1], S.T.st.m[1] && S.T.st.m[1].sh]")
    ok(ra == rb, f"maç ortasında çıkıp dönünce aynı maç birebir aynı oynandı ({ra[0]['g1']}-{ra[0]['g2']} = {rb[0]['g1']}-{rb[0]['g2']})")
    # 5) turnuvayı bitir → kayıt silinir
    for _ in range(8):
        if pg.evaluate("()=>!S.T || S.T.done || S.T.out || S.T.i>=7"): break
        pg.evaluate("()=>{ nextStep(); const s=document.getElementById('kskip'); if(s) s.click(); }"); time.sleep(0.3)
        pg.evaluate("()=>{ const g=document.getElementById('kgo'); if(g) g.click(); }"); time.sleep(0.3)
        pg.evaluate("async ()=>{ if(mustFix(S.T)) autoFixMiss(); S.speed='Anında'; await Promise.race([runMatch(), new Promise(r=>setTimeout(r,20000))]); }"); time.sleep(0.3)
    pg.evaluate("()=>finish()"); time.sleep(0.4)
    ok(pg.evaluate("()=>localStorage.getItem('sl70:kayit')") is None, "turnuva bitince kayıt silindi")
    pg.reload(); time.sleep(0.8)
    ok(pg.locator("#devamkart").count() == 0, "turnuva bitince ana sayfada devam notu yok")
    # 6) Santra: maç ortası → devam → aynı maç; bitince kayıt silinir
    pg.evaluate("()=>{ const L=saTeams(); S.santra={me:L[0].id,op:L[5].id,pk:false}; santraGo(); startSantra(); if(mustFix(S.T)) autoFixMiss(); SPEEDS['Hızlı']=60; S.speed='Hızlı'; setTimeout(()=>runMatch(),0); }"); time.sleep(1.0)
    canli = pg.evaluate("()=>localStorage.getItem('sl70:kayit')")
    pg.evaluate("()=>{ S.runId++; }"); pg.evaluate("async ()=>{ S.speed='Anında'; await runMatch(); }"); time.sleep(0.3)
    sa = pg.evaluate("()=>S.T.res[0]")
    ok(pg.evaluate("()=>localStorage.getItem('sl70:kayit')") is None, "Santra maçı bitince kayıt silindi")
    pg.evaluate("(k)=>localStorage.setItem('sl70:kayit',k)", canli)
    has, txt = yenile_devam(hizli=True)
    ok(has and "Santra" in txt, f"Santra maç ortasında yenileyince devam notu ({txt.splitlines()[1] if has else '-'})")
    ok(mac_bitir(1), "Santra: devam eden maç sonuna kadar oynandı"); time.sleep(0.3)
    sb = pg.evaluate("()=>S.T.res[0]")
    ok(sa == sb, f"Santra: aynı maç birebir aynı ({sa['g1']}-{sa['g2']} = {sb['g1']}-{sb['g2']})")
    # 7) "Sil, yeni oyun"
    pg.evaluate("()=>{ pickMode('solo'); startDraft(); }"); pg.evaluate(FILL, 2); pg.reload(); time.sleep(0.8)
    pg.locator("#devamkart .btn.ghost").click(); time.sleep(0.3)
    ok(pg.locator("#devamkart").count() == 0 and pg.evaluate("()=>localStorage.getItem('sl70:kayit')") is None, "'Sil, yeni oyun' kaydı ve notu kaldırıyor")
    ok(not errs, f"sayfa hatası yok {errs[:2]}")
    b.close()
print("kayıt testi:", "HATA " + str(len(fails)) if fails else "tamam")
sys.exit(1 if fails else 0)
