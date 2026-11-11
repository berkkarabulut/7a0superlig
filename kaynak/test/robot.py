#!/usr/bin/env python3
"""Ekran robotu: siteyi bilgisayar ve telefon boyutunda baştan sona gezer.

Her ekranda olması gereken butonların gerçekten görünür ve tıklanabilir
olduğunu (ekranın içinde, başka bir şeyin altında kalmamış) kontrol eder,
sayfada JavaScript hatası olup olmadığına bakar. Bir şey bozuksa 1 ile çıkar.

Kullanım: python3 robot.py [index.html yolu]
Ekran görüntüleri: /tmp/robot/
"""
import os, sys, time
from playwright.sync_api import sync_playwright

HTML = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "..", "..", "index.html"))
SHOTS = "/tmp/robot"; os.makedirs(SHOTS, exist_ok=True)
CHROME = "/usr/bin/google-chrome" if os.path.exists("/usr/bin/google-chrome") else None

# görünür + ekranda + üstü kapalı değil
CHECK_JS = """(sel) => {
  const els=[...document.querySelectorAll(sel)];
  if (!els.length) return "bulunamadı";
  const el=els[0]; el.scrollIntoView({block:"center"});
  const r=el.getBoundingClientRect(), cs=getComputedStyle(el);
  if (cs.display==="none"||cs.visibility==="hidden"||+cs.opacity===0) return "gizli";
  if (r.width<4||r.height<4) return "boyutu sıfır ("+Math.round(r.width)+"x"+Math.round(r.height)+")";
  if (r.right<1||r.left>innerWidth-1||r.bottom<1||r.top>innerHeight-1) return "ekranın dışında ("+Math.round(r.left)+","+Math.round(r.top)+")";
  if (r.left<-2||r.right>innerWidth+2) return "yatayda taşıyor";
  const x=Math.min(innerWidth-2,Math.max(1,r.left+r.width/2)), y=Math.min(innerHeight-2,Math.max(1,r.top+r.height/2));
  const hit=document.elementFromPoint(x,y);
  if (!hit || !(hit===el || el.contains(hit) || hit.contains(el))) return "üstü kapalı ("+(hit?hit.tagName+"."+hit.className:"yok")+")";
  return "ok";
}"""

FILL = """(n)=>{ let k=0; while(S.phase==="xi"&&k++<80){ if(n!=null && S.slots.filter(z=>z.p).length>=n) break; let i=S.cur.players.findIndex(p=>canPick(p)&&openSlots().some(z=>natural(p,z.pos))); if(i<0){roll();continue} pick(i); place(curSlots().findIndex(z=>!z.p&&natural(S.cur.players[i],z.pos))) } }"""
BENCH = """(n)=>{ let k=0; while(S.phase==="bench"&&S.bench.some(z=>!z.p)&&k++<80){ if(n!=null && S.bench.filter(z=>z.p).length>=n) break; let i=S.cur.players.findIndex(p=>canPick(p)&&openSlots().some(z=>natural(p,z.pos))); if(i<0){ if(S.rerolls>0){reroll();continue} break;} pick(i);} }"""

fails = []


def run(name, vp, b):
    pg = b.new_page(viewport=vp)
    if os.environ.get("HARVEST"):
        hv = open(os.environ["HARVEST"], "a", encoding="utf-8")
        pg.expose_function("__push", lambda t: hv.write(t.replace("\n"," ")+"\n"))
        pg.add_init_script("""window.__T=new Set(); const put=t=>{ if(!window.__T.has(t)){ window.__T.add(t); try{ window.__push(t); }catch(e){} } }; const grab=()=>{ const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let n; while(n=w.nextNode()){ const t=n.nodeValue.trim(); if(t && !/^(script|style)$/i.test(n.parentNode.tagName)) put(t); }
          document.querySelectorAll('[placeholder],[title]').forEach(e=>{ if(e.placeholder) put('[ph] '+e.placeholder); if(e.title) put('[title] '+e.title); }); };
          document.addEventListener('DOMContentLoaded',()=>{ new MutationObserver(grab).observe(document.body,{subtree:true,childList:true,characterData:true}); grab(); });""")
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("file://" + HTML); time.sleep(0.8)
    pg.evaluate("()=>localStorage.clear()")
    if os.environ.get("DIL"): pg.evaluate("(d)=>localStorage.setItem('sl70:dil', JSON.stringify(d))", os.environ["DIL"])
    pg.reload(); time.sleep(1)

    def chk(screen, *sels):
        for s in sels:
            res = pg.evaluate(CHECK_JS, s)
            if res != "ok":
                fails.append(f"[{name}] {screen}: '{s}' {res}")
        pg.screenshot(path=f"{SHOTS}/{name}-{screen}.png")

    def click(sel):
        pg.evaluate("(s)=>{ const e=document.querySelector(s); e.scrollIntoView({block:'center'}); }", sel); time.sleep(0.15)
        pg.locator(sel).first.click(timeout=4000); time.sleep(0.35)

    def step(screen, fn):
        try: fn()
        except Exception as e: fails.append(f"[{name}] {screen}: adım çalışmadı -> {str(e).splitlines()[0][:160]}")

    # 1) takım adı
    def s1():
        chk("01-takim-adi", "input", "#tgo")
        pg.fill("input", "ROBOT"); click("#tgo"); time.sleep(0.6)
    step("01-takim-adi", s1)
    # 2) başlangıç
    def s2():
        chk("02-baslangic", ".mode", "#play .chip", "#play .btn", "#n-play", "#n-rank", "#n-squads")
    step("02-baslangic", s2)
    # 3) kadro kurma
    def s3():
        pg.evaluate("()=>startDraft()"); pg.evaluate(FILL, 3); time.sleep(0.3)
        chk("03-kadro", ".drawbtns .restart", ".drawbtns .btn:not(.restart)", ".pl:not([disabled])", ".pitch")
        pg.evaluate("()=>{ const i=S.cur.players.findIndex(canPick); pick(i); }"); time.sleep(0.3)
        chk("03b-oyuncu-secili", "#selcard .chip")
        click(".drawbtns .restart"); chk("03c-bastan-basla", "#restartbox .btn", "#restartbox .btn.ghost")
        click("#restartbox .btn.ghost")
    step("03-kadro", s3)
    # 4) yedekler
    def s4():
        pg.evaluate(FILL, None); time.sleep(0.3)
        chk("04-yedek", ".benchintro .btn", ".bench", ".pl:not([disabled])")
        pg.evaluate(BENCH, None); time.sleep(0.3)
        if pg.evaluate("()=>S.phase==='bench'"): pg.evaluate("()=>skipBench()")
        time.sleep(0.3)
        chk("05-hazir", "#play .chip", "#play .btn")
    step("04-yedek", s4)
    # 5) kura
    def s5():
        pg.evaluate("()=>{ SPEEDS['Hızlı']=8; S.speed='Hızlı'; startTournament(); }"); time.sleep(0.3)
        chk("06-kura", "#kdraw", "#kskip", ".exitc")
        click("#kdraw"); time.sleep(1.4); click("#kskip"); time.sleep(0.5)
        chk("06b-kura-bitti", "#kgo"); click("#kgo")
    step("05-kura", s5)
    # 6) maç önü
    def s6():
        chk("07-mac-onu", ".exitc", "#play .talk", "#play .chip", "#lpbox [data-drag^='x:']", "#lpbox [data-drag^='b:']", "#play .btn")
        click("#lpbox [data-drag='b:0']"); click("#lpbox [data-drag='x:9']")
        chk("07b-degisiklik", ".tacnote", "button[onclick='resetXi()']")
        click("#play .talk")
        chk("07c-konusma", ".talkres", "#play .btn.gold")
    step("06-mac-onu", s6)
    def s6b():
        pg.evaluate("()=>{ const T=S.T; T.outs[T.xi[3].p.n]={k:'susp',n:1}; T.prepFor=-1; T.alerted=-1; preMatch(); }"); time.sleep(0.4)
        chk("07d-kirmizi-uyari", "#missmodal .btn.gold", "#missmodal .btn.ghost")
        click("#missmodal .btn.ghost"); time.sleep(0.3)
        if pg.evaluate("()=>!!document.querySelector('#play .btn[disabled]')") is False: fails.append(f"[{name}] kırmızı uyarı: maça çık butonu kilitli değil")
        chk("07e-kirmizi-banner", ".missbox .btn.gold")
        click(".missbox .btn.gold"); time.sleep(0.3)
        if pg.evaluate("()=>mustFix(S.T)"): fails.append(f"[{name}] kırmızı uyarı: otomatik koy çalışmadı")
        chk("07f-duzeldi", "#play .btn.gold, #play .btn:not([disabled])")
    step("06b-kirmizi", s6b)
    # 7) maç + devre arası
    def s7():
        pg.evaluate("()=>{ runMatch(); }"); time.sleep(1)
        chk("08-mac", "#sc", "#clk", "#ev")
        pg.wait_for_selector("#htbox", timeout=40000); time.sleep(0.5)
        chk("09-devre-arasi", "#htbox .chip", "#htbox [data-drag^='x:']", "#htbox [data-drag^='b:']", "#htbox .btn.gold")
        for k in (8, 3):
            click("#htbox [data-drag^='b:']"); click(f"#htbox [data-drop='x:{k}']")
        if pg.locator("#htbox").count() == 0: fails.append(f"[{name}] devre arası: değişiklikten sonra panel kapandı")
        chk("09b-devre-arasi-2-degisiklik", "#htbox .btn.gold")
        click("#htbox .btn.gold")
        pg.wait_for_function("()=>!!document.querySelector('#after .btn[onclick=\"finish()\"], #after .btn[onclick=\"nextStep()\"]')", timeout=40000)
        chk("10-mac-sonu", "#after .btn")
    step("07-mac", s7)
    # 8) penaltı seçimi (eleme maçını zorla berabere bitir)
    def s8():
        pg.evaluate("""()=>{ const T=S.T; T.i=3; setupR16(); T.prepFor=-1; preMatch(); if (mustFix(T)) autoFixMiss(); document.getElementById('missmodal')?.remove(); S.speed='Anında';
          const mk=window.makeMatch; window.makeMatch=(...a)=>{ const M=mk(...a); const run=M.run; M.run=(m0,m1,mu)=>{ run(m0,m1,mu); M.g[0]=M.g[1]=0; for(let i=M.ev.length-1;i>=0;i--) if(M.ev[i].type==='goal') M.ev.splice(i,1); }; return M; };
          runMatch(); }""")
        pg.wait_for_selector(".penpick", timeout=40000); time.sleep(0.4)
        chk("11-penalti", ".penpick .lrow", ".penpick .btn.ghost")
        click(".penpick .btn.ghost")
        chk("11b-penalti-sirali", ".penpick .btn.gold"); click(".penpick .btn.gold")
        pg.wait_for_function("()=>!!document.querySelector('#after .btn[onclick=\"finish()\"], #after .btn[onclick=\"nextStep()\"]')", timeout=40000)
    step("08-penalti", s8)
    # 9) sonuç + paylaş
    def s9():
        pg.evaluate("()=>{ S.T.out=S.T.out||'Son 16\\'da elendin'; finish(); }"); time.sleep(0.8)
        chk("12-sonuc", ".result .btn", ".result .btn.ghost", ".result .btn.gold", ".site a", ".result button[onclick='shareChallenge()']")
        click(".result .btn.gold"); time.sleep(1.2)
        chk("13-paylas", "#sharebox .btn", "#sharebox canvas, #sharebox img")
        pg.evaluate("()=>closeShare()")
    step("09-sonuc", s9)
    # 10) sekmeler
    def s10():
        click("#n-squads"); time.sleep(0.4)
        chk("14-kadrolar", "#squads .chip", "#squads .repbtn")
        pg.evaluate("()=>{ const b=document.querySelector('#squads .chip[onclick^=openMultiReport]'); b.scrollIntoView({block:'center'}); b.click(); }"); time.sleep(0.4)
        chk("15-bildir", "#repbox .mr_cb", "#mr_send"); pg.evaluate("()=>closeReport()")
        click("#n-rank"); time.sleep(0.4); chk("16-siralama", "#rank")
        click("#n-ach"); time.sleep(0.3); chk("17-basarimlar", "#ach .card")
        click("#n-how"); time.sleep(0.3); chk("18-nasil", "#how .card")
    step("10-sekmeler", s10)
    # 11) büyüme paketi
    def s11():
        click("#n-profile"); time.sleep(0.4); chk("19-profil", "#profile .stats", "#profile .album")
        click("#n-rank"); time.sleep(0.3)
        pg.evaluate("()=>renderRank(todayKey(),'week')"); time.sleep(0.4); chk("20-haftalik", "#rank .chip.on")
        if pg.locator("#sndbtn").count(): fails.append(f"[{name}] üstte ses ikonu hâlâ var")
        click("#n-play"); pg.evaluate("()=>renderStart()"); time.sleep(0.3)
        pg.evaluate("()=>{ const b=document.querySelector('.mode[onclick^=startQuiz]'); b.scrollIntoView({block:'center'}); b.click(); }"); time.sleep(0.4)
        chk("22-quiz", ".qopt", ".qpitch", ".exitc")
        for i in range(5):
            click(".qopt"); chk(f"22b-quiz-{i}", ".quiz .btn.gold"); click(".quiz .btn.gold")
        chk("23-quiz-sonuc", ".result .btn.gold", ".result .btn.ghost")
    step("11-buyume", s11)
    def s12():
        pg.goto("file://"+HTML+"?m=k3x9z&d=4-4-2&s=5-2&n=TESTCI"); time.sleep(1)
        chk("25-meydan-banner", ".chal .btn.gold", ".chal .btn.ghost")
        click(".chal .btn.gold"); time.sleep(0.4)
        a = pg.evaluate("()=>[S.form, S.seed, S.cur.id]")
        pg.evaluate("()=>startDraft()"); b = pg.evaluate("()=>[S.form, S.seed, S.cur.id]")
        if a[0]!="4-4-2" or a!=b: fails.append(f"[{name}] meydan linki: aynı kura gelmedi {a} {b}")
    step("12-meydan", s12)
    def s13():
        pg.evaluate("()=>{ S.challenge=null; startDraft(); }"); pg.evaluate(FILL, None); pg.evaluate(BENCH, None)
        pg.evaluate("()=>{ if(S.phase==='bench') skipBench(); SPEEDS['Hızlı']=40; S.speed='Hızlı'; startTournament(); }"); time.sleep(0.3)
        pg.evaluate("()=>{ $('kskip').click(); }"); time.sleep(0.5); pg.evaluate("()=>{ $('kgo').click(); }"); time.sleep(0.4)
        pg.evaluate("()=>{ if (mustFix(S.T)) autoFixMiss(); document.getElementById('missmodal')?.remove(); runMatch(); }"); time.sleep(1.2)
        chk("26-mac-ici-cikis", ".exitc"); click(".exitc"); time.sleep(0.3)
        chk("26b-cikis-onay", "#exitmodal .btn", "#exitmodal .btn.ghost"); click("#exitmodal .btn:not(.ghost)"); time.sleep(2.5)
        if not pg.evaluate("()=>!!document.querySelector('.modes')"): fails.append(f"[{name}] çıkış: ana sayfaya dönmedi")
        chk("26c-ana-sayfa", ".modes .mode")
    step("13-cikis", s13)
    def s14():
        pg.evaluate("()=>{ const o=$('online'); o.classList.remove('hidden'); $('onlineN').textContent='12'; const l=$('leader'); l.classList.remove('hidden'); l.innerHTML='👑 <span>Tek:</span> ROBOT FC <b>7-0</b>'; }"); time.sleep(0.2)
        sb = ".setmob" if name=="telefon" else "#n-settings"
        chk("27-ayarlar-butonu", sb, "#betabtn"); click(sb); time.sleep(0.3)
        chk("28-ayarlar", "#setbox .chip[onclick^=setLang]", "#setbox .chip[onclick^=setTheme]", "#setbox .chip[onclick*=sound]")
        click("#setbox .chip[onclick=\"setTheme('gece')\"]"); time.sleep(0.3)
        if pg.evaluate("()=>curTheme()") != "gece": fails.append(f"[{name}] ayarlar: tema değişmedi")
        chk("28b-ayarlar-gece", "#setbox .chip[onclick^=setTheme]")
        click("#setbox .chip[onclick=\"setTheme('tv')\"]"); pg.evaluate("()=>closeSettings()")
        if pg.locator("#play .chip[onclick^=setTheme]").count(): fails.append(f"[{name}] tema seçimi hâlâ ana ekranda")
    step("14-ayarlar", s14)
    def s15():
        chk("29-beta", "#betabtn"); click("#betabtn"); time.sleep(0.3)
        chk("30-beta-pencere", "#fb_msg", "#fb_send"); pg.evaluate("()=>closeBeta()")
    step("15-beta", s15)

    if os.environ.get("HARVEST"):
        try:
            got = pg.evaluate("()=>[...(window.__T||[])]")
            with open(os.environ["HARVEST"], "a", encoding="utf-8") as fh:
                for t in got: fh.write(t.replace("\n"," ")+"\n")
        except Exception as e: print("harvest", e)
    real = [e for e in errs if "firebase" not in e.lower()]
    for e in real: fails.append(f"[{name}] JavaScript hatası: {e[:200]}")
    pg.close()


with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME, args=["--no-sandbox"]) if CHROME else p.chromium.launch()
    run("bilgisayar", {"width": 1280, "height": 860}, b)
    run("telefon", {"width": 390, "height": 844}, b)
    b.close()

if fails:
    print(f"❌ ROBOT: {len(fails)} sorun")
    for f in fails: print("   " + f)
    sys.exit(1)
print("✅ ROBOT: bilgisayar ve telefonda tüm ekranlar ve butonlar sağlam")
