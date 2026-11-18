// ---------- maç ----------
const MENTS = { "Aynen devam":{att:0,def:0}, "Hücuma geç":{att:2,def:-2}, "Skoru koru":{att:-2,def:2} };
function halfTime(M, a, b){
  return new Promise(res => {
    const T=S.T; let style=T.style, ment="Aynen devam", sel=null, msg=null, hstep=0;
    const cur = k => slotPlayer(M,T,k);
    const benchAv = () => { const used=new Set(M.pl[0].map(p=>p.n)); return T.bench.map((p,i)=>({p,i})).filter(x=>!isOut(T,x.p.n)&&!used.has(x.p.n)); };
    const doSub = (k, bi) => { const outP=cur(k), bp=T.bench[bi], pos=T.xi[k].pos; if(!outP||!bp) return;
      if (M.subsLeft()<=0){ msg=["bad","Değişiklik hakkın bitti"]; return; }
      const inP = {...bp, r:Math.round(effR(T,bp,pos)), pos:LINE(pos), role:pos};
      if (M.sub(outP, inP, 46)){ const pen=penOf(bp,pos); msg=[pen?"bad":"good", `🔁 ${esc(short(outP.n))} çıktı, ${esc(short(bp.n))} girdi${pen?` (mevki dışı, −${pen})`:""}`]; } };
    const move = (x,y) => { sel=null; const [ta,ia]=x.split(":"), [tb,ib]=y.split(":"); if (ta===tb) return draw();
      const k = ta==="x"?+ia:+ib, bi = ta==="b"?+ia:+ib; doSub(k,bi); draw(); };
    const tap = id => { if (!sel){ sel=id; return draw(); } if (sel===id){ sel=null; return draw(); } const x=sel; move(x,id); };
    const draw = () => {
      const selP = sel ? (sel[0]==="b" ? T.bench[+sel.split(":")[1]] : cur(+sel.split(":")[1])) : null, os=T.o.pw.style;
      const inline = typeof window!=="undefined" && window.innerWidth<=900;
      const big = matchPitchHTML(M,T,T.o,{sel,selP});
      const pitch = inline ? big : "";
      if ($("mpitch")){ if (inline) $("mpitch").style.display="none"; else $("mpitch").innerHTML = big; }
      const bl = benchAv();
      const benchHTML2 = `<div class="ph" style="margin-top:10px">Kulübe</div>${bl.length&&M.subsLeft()?`<div class="lineup">${bl.map(({p,i})=>`<div class="lrow bench2 ${sel==="b:"+i?"sel":""}" data-drag="b:${i}" data-drop="b:${i}"><span class="grip">⠿</span><span class="pos ${p.p[0]}">${roles(p).map(x=>LABEL[x]).join("/")}</span><span class="ln">${esc(p.n)}</span><span class="rv ${tier(p.base)}">${showR(p.base)}</span></div>`).join("")}</div>`:`<p class="mut">${M.subsLeft()?"Kulübede girebilecek oyuncu kalmadı.":"Değişiklik hakkın bitti."}</p>`}`;
      const goHTML = `<div class="row" style="margin-top:12px"><button class="btn gold" onclick="window.__hgo()">İkinci yarıyı başlat ▶</button></div>`;
      const quick = `<button class="btn ghost wz-quick" onclick="window.__hgo()">⏩ Direkt başlat</button>`;
      const navH = hstep===0 ? `<button class="btn" onclick="window.__hst(1)">İleri: Anlayış ▶</button>${quick}`
                 : hstep===1 ? `<button class="btn ghost" onclick="window.__hst(0)">◀ Taktik</button><button class="btn" onclick="window.__hst(2)">İleri: Değişiklik ▶</button>${quick}`
                 : `<button class="btn ghost" onclick="window.__hst(1)">◀ Anlayış</button><button class="btn gold" onclick="window.__hgo()">İkinci yarıyı başlat ▶</button>`;
      $("after").innerHTML = `<div class="card ht" id="htbox"><h3 style="margin-top:0">⏸️ Devre arası · ${a}-${b}</h3>
        <p class="mut" style="margin:0 0 8px;font-size:13px">${a<b?"Gerideysin. Hücuma geçmenin ya da tarzı değiştirmenin tam zamanı.":a>b?"Öndesin. Skoru korumak isteyebilirsin.":"Eşitlik var. İkinci yarı için planın ne?"} Rakip: ${STYLES[os].e} ${esc(os)}</p>
        ${wzSteps(["📋 Taktik","🎯 Anlayış","🔁 Değişiklik","⚽ 2. yarı"], hstep)}
        ${hstep===0?`<div class="ph">Oyun tarzı</div><p class="mut" style="font-size:13px;margin:0 0 6px">${STYLES[style].e} <b style="color:var(--txt)">${esc(style)}:</b> ${esc(STYLES[style].d)}. ${ctrOf(style,os)>0?`<span style="color:var(--win)">✓ Rakibe karşı avantajlı.</span>`:ctrOf(os,style)>0?`<span style="color:var(--loss)">⚠ Rakibin tarzı buna karşı avantajlı.</span>`:""}</p><div class="row">${Object.keys(STYLES).map(k=>`<button class="chip ${k===style?"on":""}" onclick="window.__hs('${k}')">${STYLES[k].e} ${k}${ctrOf(k,os)>0?" ✓":ctrOf(os,k)>0?" ⚠":""}</button>`).join("")}</div>`:""}
        ${hstep===1?`<div class="ph">Anlayış</div><p class="mut" style="font-size:13px;margin:0 0 6px">Takım ikinci yarıda nasıl oynasın? Hücuma geçersen gol şansın artar ama arkada boşluk verirsin.</p><div class="row">${Object.keys(MENTS).map(k=>`<button class="chip ${k===ment?"on":""}" onclick="window.__hm('${k}')">${k}${MENTS[k].att?` <span class="mut">(${MENTS[k].att>0?"+":""}${MENTS[k].att} hücum, ${MENTS[k].def>0?"+":""}${MENTS[k].def} savunma)</span>`:""}</button>`).join("")}</div>`:""}
        ${hstep===2?`<div class="ph">Oyuncu değişikliği <span class="mut" style="text-transform:none">· ${M.subsLeft()} hakkın kaldı</span></div>
        <p class="mut" style="font-size:13px;margin:0 0 6px">Yedeği sahadaki oyuncunun üstüne sürükle ya da önce yedeğe sonra çıkacak oyuncuya dokun. İstediğin kadar değişiklik yap, bitince ikinci yarıyı başlat.</p>
        ${pitch}
        ${msg?`<div class="tacnote ${msg[0]}" style="margin-top:6px">${msg[1]}</div>`:""}
        ${M.subs.length?`<div class="mut" style="font-size:13px;margin-top:6px">${M.subs.map(s=>`🔁 ${esc(short(s.out.n))} → ${esc(short(s.in.n))}`).join(" · ")}</div>`:""}
        ${inline ? benchHTML2 : ""}`:""}
        <div class="row wz-nav">${navH}</div></div>`;
      if (!inline){ if ($("mbench")) $("mbench").innerHTML = hstep===2 ? `<div class="card mbench">${benchHTML2}</div>` : ""; if ($("mgo")) $("mgo").innerHTML = hstep===2 ? `<div class="mgo">${goHTML.replace('style="margin-top:12px"','')}</div>` : ""; }
      msg=null;
      enableDrag($("mgrid")||$("htbox"), move, tap); };
    window.__hs = k => { style=k; draw(); };
    window.__hm = k => { ment=k; draw(); };
    window.__hst = k => { hstep=k; sel=null; draw(); try{ $("htbox").scrollIntoView({block:"start",behavior:"smooth"}); }catch(e){} };
    window.__ho = n => { const k=T.xi.findIndex((s,kk)=>cur(kk)?.n===n); if(k>=0){ sel="x:"+k; draw(); } };
    window.__hi = bi => { if (sel && sel[0]==="x") move(sel,"b:"+bi); };
    window.__hgo = () => { M.setTactic(style, MENTS[ment]); T.htStyle=style; $("after").innerHTML=""; if ($("mbench")) $("mbench").innerHTML=""; if ($("mgo")) $("mgo").innerHTML=""; if ($("mpitch")){ $("mpitch").style.display=""; $("mpitch").innerHTML = matchPitchHTML(M,T,T.o); } res({style,ment}); };
    draw();
    try{ const tgt = (typeof window!=="undefined" && window.innerWidth>900 && $("mgo")) ? $("mgrid") : $("after"); tgt.scrollIntoView({block:"start",behavior:"smooth"}); }catch(e){}
  });
}
// maç sırasında bir mevkide şu an kim oynuyor (değişiklik zincirini takip eder)
function slotPlayer(M,T,k){ let n=T.matchXi[k]; if(!n) return null; let ch=true; while(ch){ ch=false; for (const s of M.subs) if (s.out.n===n){ n=s.in.n; ch=true; } } return M.onPitch().find(q=>q.n===n) || null; }
// rakibin 11'i: en iyi kaleci + 4 defans + 4 orta saha + 2 forvet (eksikse en yüksek reytinglilerle tamamlanır)
function oppXI(o){
  const pl=[...o.pl].sort((a,b)=>b.r-a.r), take=(g,n)=>pl.filter(p=>p.pos===g).slice(0,n);
  let xi=[...take("GK",1),...take("DF",4),...take("MF",4),...take("FW",2)];
  for (const p of pl){ if (xi.length>=11) break; if (!xi.includes(p) && p.pos!=="GK") xi.push(p); }
  const Y={GK:5,DF:15,MF:29,FW:42}, X={GK:[50],DF:[14,38,62,86],MF:[13,38,62,87],FW:[37,63]}, lines={GK:[],DF:[],MF:[],FW:[]}; xi.forEach(p=>lines[p.pos].push(p));
  return Object.entries(lines).flatMap(([g,ps])=>ps.map((p,i)=>({p, x: ps.length===X[g].length ? X[g][i] : ps.length===1?50:12+i*76/(ps.length-1), y:Y[g]})));
}
// iki takım tek sahada: rakip üst yarı, sen alt yarı. edit=true iken (devre arası) senin oyuncuların sürüklenebilir.
// maç sahasında bizim oyuncuların dikey konumları: her diziliş için elle dizildi (FORMATIONS'taki sırayla, sahanın yüzdesi).
// Aynı hattakiler aynı yükseklikte, hatlar arası eşit; 9 dizilişte telefon ve bilgisayarda isim/not çakışması yok (test/saha-cakisma.py).
const MP_TABLE = {
  "4-3-3":   [96, 85,85,85,85, 66,75,66, 54,52,54],
  "4-4-2":   [96, 85,85,85,85, 69,69,69,69, 54,54],
  "3-5-2":   [96, 85,85,85, 65,65,75,65,65, 53,53],
  "4-2-3-1": [96, 85,85,85,85, 75,75, 64,64,64, 53],
  "4-1-4-1": [96, 85,85,85,85, 75, 64,64,64,64, 53],
  "4-4-1-1": [96, 85,85,85,85, 72,72,72,72, 62, 52],
  "4-3-1-2": [96, 85,85,85,85, 68,75,68, 61.5, 51.5,51.5],
  "3-4-3":   [96, 85,85,85, 69,69,69,69, 54,52,54],
  "5-3-2":   [96, 80,85,85,85,80, 67,75,67, 54,54],
};
function mpYs(xi){
  const f = Object.keys(FORMATIONS).find(k => FORMATIONS[k].length===xi.length && FORMATIONS[k].every((s,i)=>s[0]===xi[i].pos && s[2]===xi[i].y));
  const t = f && MP_TABLE[f];
  return xi.map((s,i)=> t ? t[i] : (s.pos==="GK" ? 96 : 52 + Math.max(0, Math.min(64, s.y-13)) * 33/64));
}
function matchPitchHTML(M,T,o,ht){
  const sel = ht && ht.sel, selP = ht && ht.selP;
  const sc = M._sc || M.g || [0,0], rate = liveRatings(M, M._shown ?? M.ev.length, sc[0], sc[1]);
  const mine = new Set(T.xi.map(s=>kitC(s.p.team)[0])), oc0 = kitC(o.t.team), oc = mine.has(oc0[0]) ? [oc0[1], oc0[0]] : oc0; // aynı renkse rakip deplasman formasıyla
  const opp = oppXI(o).map(({p,x,y})=>`<div class="slot full mp-o" style="--x:${x};--y:${y}">${SHIRT(oc, p.r)}${lrTag(rate(p,1))}<div class="nm" title="${esc(p.n)}">${esc(short(p.n))}</div></div>`).join("");
  const YS = mpYs(T.xi);
  const me = T.xi.map((s,k)=>{ const p=slotPlayer(M,T,k), y = YS[k];
    if (!p) return `<div class="slot mp-m" style="--x:${s.x};--y:${y}"><div class="dot">🟥</div></div>`;
    const pen=penOf(p,s.pos), subIn=M.subs.some(x=>x.in.n===p.n), act = ht ? `data-drag="x:${k}" data-drop="x:${k}"` : "";
    let prev=""; if (selP && sel && sel[0]==="b"){ const pp=penOf(selP,s.pos), pr=Math.round(effR(T,selP,s.pos)); prev=`<div class="prev ${pp?"bad":"good"}">${pp?"▼":"✓"} ${pr}</div>`; }
    return `<div class="slot full mp-m ${sel==="x:"+k?"selx":""} ${pen?"offp":""}" style="--x:${s.x};--y:${y}" ${act}>${SHIRT(kitC(p.team), p.r, pen>0)}${lrTag(rate(p,0))}<div class="nm" title="${esc(p.n)}">${subIn?"🔁 ":""}${esc(short(p.n))}</div>${prev}</div>`; }).join("");
  return `<div class="pitch mp ${ht?"mp-edit":""}"><div class="mp-lbl mp-lt">${kit(o.t.team)}${esc(o.name)}</div><div class="mp-lbl mp-lb">${esc(myName())}</div>${opp}${me}</div>`;
}
function onPitchHTML(M,T){
  return T.xi.map((s,k)=>{ const p=slotPlayer(M,T,k); if(!p) return `<div class="row" style="gap:6px;padding:2px 0;opacity:.6"><span class="pos ${LINE(s.pos)}">${LABEL[s.pos]}</span>— boş (oyundan çıktı)</div>`;
    const pen=penOf(p,s.pos), subIn=M.subs.some(x=>x.in.n===p.n);
    return `<div class="row" style="gap:6px;padding:2px 0"><span class="pos ${LINE(s.pos)}">${LABEL[s.pos]}</span>${subIn?"🔁 ":""}${esc(p.n)}<span class="rt">${pen?`<b class="neg" style="margin-right:4px">−${pen}</b>`:""}<span class="rv ${tier(p.r)} ${pen?"drop":""}">${showR(p.r)}</span></span></div>`; }).join("");
}
async function runMatch(){
  const rid = S.runId = (S.runId||0)+1;
  try { await runMatchInner(rid); } catch(e){ if (e!=="iptal") throw e; }
}
async function runMatchInner(rid){
  const nap = async ms => { await sleep(ms); if (S.runId!==rid) throw "iptal"; };
  const T=S.T, i=T.i, isKo = T.single ? !!T.pk : i>=3, o=T.o;
  const L = lineup(T); const missing = 11 - L.length;
  T.matchXi = T.xi.map(s=>isOut(T,s.p.n)?null:s.p.n);
  const pw = {...teamPower(L, T.style)};
  const boost = STAGE_BOOST[i]||0; if (boost>0){ pw.att+=boost*0.5; pw.def+=boost; }
  const opw = {...o.pw}; if (boost<0){ opw.att-=boost; opw.def-=boost; }
  const pickSub = (role, used) => { const b=bestSub(T, role, used); if(!b) return null; return {...b, r:Math.round(effR(T,b,role)), pos:LINE(role), role}; };
  const M = makeMatch(pw, opw, L, o.pl, {ref:T.ref, startRed:missing, pickSub, penOrder:T.penOrder, myName:myName(), oppName:o.t.team});
  M._shown = 0; M._sc = [0,0];
  $("play").innerHTML = `
    ${pathHTML()}
    <div class="grid mgrid" id="mgrid">
      <div class="minisc" id="minisc" aria-hidden="true"><div class="ms-row"><span class="ms-t">${esc(myName())}</span><span class="ms-s" id="ms-s">0-0</span><span class="ms-c" id="ms-c">0'</span><span class="ms-t">${esc(o.t.team)}</span></div>${atkHTML(o,"ms-atk-a")}<ul class="events ms-ev" id="ms-ev"></ul></div>
      <div>
        <div id="mgo"></div>
        <div class="card">
          <div class="mut" style="text-align:center;font-weight:700">${T.single?"Santra":STAGES[i]} · Hakem: ${esc(T.ref)}</div>
          <div class="score"><div class="tn">${esc(myName())}<div class="mut" style="font-size:12px;font-weight:400" id="mystyle">${S.form} · ${STYLES[T.style].e} ${esc(T.style)}</div></div>
            <div><div class="big" id="sc">0-0</div><div class="clock" id="clk">0'</div><div class="bar"><i id="bar"></i></div><div id="rc" style="font-size:12px;color:#ff7a7a;margin-top:4px"></div></div>
            <div class="tn">${kit(o.t.team)}${esc(o.name)}<div class="mut" style="font-size:12px;font-weight:400">${STYLES[o.pw.style].e} ${esc(o.pw.style)}${coachOf(o.t)?` · TD: ${esc(coachOf(o.t))}`:""}</div></div></div>
          <div class="atk-w"><span class="atk-lb">Atak</span>${atkHTML(o,"atk-a")}</div>
          ${ctrOf(T.style,o.pw.style)>0?`<div class="tacnote good">✓ Tarzın rakibe karşı avantajlı (${esc(T.style)} > ${esc(o.pw.style)})</div>`:ctrOf(o.pw.style,T.style)>0?`<div class="tacnote bad">⚠ Rakibin tarzı sana karşı avantajlı (${esc(o.pw.style)} > ${esc(T.style)})</div>`:""}
          <div id="after" class="m-after"></div>
          <ul class="events" id="ev"></ul>
        </div>
        ${isKo&&!T.single?`<div class="card" style="margin-top:14px"><h3>Eleme ağacı</h3><div id="brk">${bracketHTML()}</div></div>`:""}
      </div>
      <div class="mside">
        <div id="mpitch">${matchPitchHTML(M,T,o)}</div>
        <div id="mbench"></div>
        ${T.single ? "" : `<div class="card">${isKo ? `<h3>Maçlarımız</h3>${ourMatchesHTML()}` : `<h3>Grup tablosu</h3><div id="tbl" style="overflow-x:auto">${tableHTML()}</div>`}</div>`}
      </div>
    </div>`;
  miniScore(); atkInit(M, pw, opw);
  const ms = SPEEDS[S.speed]; let a=0,b=0, ei=0, len=90;
  const ICON={goal:"⚽",save:"🧤",post:"🥅",wide:"↗️",penS:"🧤",penM:"❌",yellow:"🟨",red:"🟥",inj:"🚑",flow:"·",sub:""};
  const add = h => { const el=$("ev"); el.insertAdjacentHTML("beforeend", h); if(el.scrollTop!==undefined) el.scrollTop=el.scrollHeight; };
  const redsTxt = ()=>{ const rr=[missing,0]; M.ev.slice(0,ei).forEach(e=>{ if(e.type==="red"||(e.type==="inj"&&e.side===0&&/10 kişi/.test(e.text))) rr[e.side]++; }); return rr; };
  const anim = async (m0,m1) => { for (let m=m0;m<=m1;m++){
    while (ei<M.ev.length && M.ev[ei].m<=m){
      const e=M.ev[ei++]; M._shown=ei; if(e.type==="goal"){ if(e.side===0)a++; else b++; $("sc").textContent=`${a}-${b}`; M._sc=[a,b]; atkGoal(M, e.side); const sc=$("sc"); sc.classList.remove("flash"); void sc.offsetWidth; sc.classList.add("flash"); sfx("goal", e.side===0); goalFx(e.side===0); }
      add(`<li class="${e.side?"away":""} ev-${e.type}"><span class="m">${e.m>90?"U"+(e.m):e.m}'</span><span>${ICON[e.type]||""} ${esc(e.text)}</span></li>`);
      if (e.type!=="flow"){ const op=$("mpitch"); if(op && ms) op.innerHTML=matchPitchHTML(M,T,o); }
      if (e.type==="red"||e.type==="inj"){ const rr=redsTxt(); $("rc").innerHTML = (rr[0]?`🟥 Senin takım ${11-rr[0]} kişi `:"")+(rr[1]?` · 🟥 Rakip ${11-rr[1]} kişi`:""); }
      if (ms){ if (e.type==="goal") await nap(ms*12); else if (e.type!=="flow") await nap(ms*3); }
    }
    if (ms) atkStep(M, ei, m);
    if (ms){ $("clk").textContent=(m>90?"Uzatma ":"")+m+"'"; $("bar").style.width=(m/len*100)+"%";
      if (m===105){ $("clk").textContent="Uzatma devresi"; await nap(ms*14); }
      await nap(ms); } } };
  add(`<li class="penh"><span>🟢 Hakem ${esc(T.ref)} başlama düdüğünü çaldı</span></li>`); sfx("start");
  if (missing) $("rc").innerHTML = `Senin takım ${11-missing} kişi`;
  M.run(1,45); await anim(1,45);
  $("clk").textContent="Devre arası"; sfx("half"); add(`<li class="penh"><span>⏸️ ${esc(T.ref)} ilk yarıyı bitirdi: ${a}-${b}</span></li>`);
  if (ms){ const h = await halfTime(M,a,b); if (S.runId!==rid) throw "iptal"; if (h.style!==T.style || h.ment!=="Aynen devam") add(`<li class="penh"><span>📋 İkinci yarı planı: ${STYLES[h.style].e} ${esc(h.style)} · ${esc(h.ment)}</span></li>`); $("mystyle").textContent=`${S.form} · ${STYLES[h.style].e} ${h.style}`; }
  { const op=$("mpitch"); if(op) op.innerHTML=matchPitchHTML(M,T,o); }
  M.run(46,90); await anim(46,90);
  let et=false;
  if (isKo && M.g[0]===M.g[1]){ et=true; len=120; add(`<li class="penh"><span>⏱️ 90 dakika ${a}-${b} bitti, uzatmalara gidiliyor</span></li>`); if(ms) await nap(ms*18); M.run(91,120,0.85); await anim(91,120); }
  const r = M.result(et);
  M._shown = M.ev.length; M._sc = [r.g1, r.g2]; { const op=$("mpitch"); if(op) op.innerHTML=matchPitchHTML(M,T,o); }
  $("clk").textContent= r.et ? "Uzatmalar bitti" : "Maç sonu"; $("bar").style.width="100%";
  add(`<li class="penh"><span>🏁 ${esc(T.ref)} son düdüğü çaldı</span></li>`); sfx("end");
  T.scorers = T.scorers || {}; r.ev.filter(e=>e.side===0&&e.type==="goal"&&e.p).forEach(e=>{ T.scorers[e.p.n]=(T.scorers[e.p.n]||0)+1; });
  let pen=null, res = r.g1>r.g2?"W":r.g1<r.g2?"L":"D";
  if (isKo && r.g1===r.g2){
    $("clk").textContent="Penaltılar";
    const order = await choosePens(r.onPitch); if (S.runId!==rid) throw "iptal";
    const so = shootout(r.onPitch, o.pl, order); pen=[so.a,so.b];
    add(`<li class="penh"><span>🥅 Penaltı atışları</span></li>`);
    for (const k of so.kicks){
      if (ms) await nap(Math.max(ms*12, 450));
      $("sc").innerHTML = `${a}-${b}<div class="pensc">(${k.a}-${k.b})</div>`;
      add(`<li class="${k.side?"away":""} ${k.goal?"pg":"pm"}"><span class="m">${k.a}-${k.b}</span><span>${k.goal?"⚽":"❌"} ${esc(k.p.n)}${k.goal?"":` <small class="mut">${k.save?"kaleci kurtardı":"kaçırdı"}</small>`}</span></li>`);
    }
    res = pen[0]>pen[1]?"W":"L";
    add(`<li class="penh"><span>${res==="W"?"✅ Penaltılarla kazandın":"💔 Penaltılarla kaybettin"} (${pen[0]}-${pen[1]})</span></li>`);
  }
  // cezalar, sakatlıklar, oyuna girenler
  for (const n of Object.keys(T.outs)) { T.outs[n].n--; if (T.outs[n].n<=0) delete T.outs[n]; }
  for (const n of r.reds) T.outs[n] = {k:"susp", n:1};
  for (const n of r.injs) T.outs[n] = {k:"inj", n: Math.random()<0.6?1:2};
  // maç içi değişiklikler kalıcı değil: bir sonraki maça senin kurduğun 11 ile çıkılır (sakat/cezalı olan maç önünde otomatik değişir)
  afterMorale(T,res,r);
  T.gf+=r.g1; T.ga+=r.g2; if(r.g1>r.g2)T.W++; else if(r.g1<r.g2)T.L++; else T.D++;
  T.res.push({res, g1:r.g1, g2:r.g2, pen, et:r.et, opp:o.name, team:o.t.team});
  r.lr = liveRatings(M, M.ev.length, r.g1, r.g2); // maç sonu notları sahadaki canlı notlarla aynı
  tsRecord(T, r, L, pw, opw, o);
  let msg="";
  const sideNotes = [...r.reds.map(n=>`🟥 ${esc(n)} bir sonraki maçta cezalı.`), ...r.injs.map(n=>`🚑 ${esc(n)} ${T.outs[n].n} maç yok.`)];
  if (T.single){ santraAfter(T, res, r, pen, sideNotes); return; }
  if (!isKo){
    addTbl(myName(), r.g1, r.g2); addTbl(o.name, r.g2, r.g1);
    const om = T.others[i]; addTbl(om.a,om.g1,om.g2); addTbl(om.b,om.g2,om.g1);
    msg = `<span class="mut">Gruptaki diğer maç: ${esc(om.a)} ${om.g1}-${om.g2} ${esc(om.b)}</span>`;
    $("tbl").innerHTML = tableHTML();
    if (i===2){ const pos = sortedTable().findIndex(x=>x.n===myName()); if (pos>1) T.out = `Grupta ${pos+1}. oldun, elendin`; }
  } else {
    const k=i-3, ME=T.R[k][0];
    T.M[k]=[{a:ME,b:o,g1:r.g1,g2:r.g2,pen,et:r.et,w:res==="W"?ME:o}];
    simRound(k,1);
    $("brk").innerHTML = bracketHTML();
    if (res==="L") T.out = ({3:"Son 16'da",4:"Çeyrek finalde",5:"Yarı finalde",6:"Finalde"})[i]+" elendin";
  }
  T.i++;
  const last = T.out || T.i===7;
  $("after").innerHTML = `${msg}${sideNotes.length&&!last?`<div class="mut" style="margin-top:6px">${sideNotes.join("<br>")}</div>`:""}${tsHTML(T,false,true)}<div class="row" style="margin-top:10px"><button class="btn ${last?"gold":""}" onclick="${last?"finish()":"nextStep()"}">${last?"Sonucu gör":"Sonraki maç: "+STAGES[T.i]}</button></div>`;
}

// asıl skor tabelası görünmüyorsa üstte küçük skor şeridini göster; skor ve dakika #sc / #clk'tan kopyalanır
function miniScore(){
  try {
    const sc=$("sc"), ck=$("clk"), box=document.querySelector?.("#mgrid .score"), mini=$("minisc");
    if (!sc || !mini || typeof IntersectionObserver==="undefined" || typeof MutationObserver==="undefined") return;
    const sync = () => { const a=$("ms-s"), b=$("ms-c"); if (a) a.textContent = sc.textContent; if (b) b.textContent = ck ? ck.textContent : ""; };
    new MutationObserver(sync).observe(sc, {childList:true, characterData:true, subtree:true});
    const ev=$("ev"), mev=$("ms-ev");
    if (ev && mev) new MutationObserver(() => { mev.innerHTML = [...ev.children].slice(-4).map(li=>li.outerHTML).join(""); }).observe(ev, {childList:true}); // son 4 olay
    if (ck) new MutationObserver(sync).observe(ck, {childList:true, characterData:true, subtree:true});
    new IntersectionObserver(es => { for (const e of es) mini.classList.toggle("on", !e.isIntersecting); }).observe(box);
    sync();
  } catch(e){}
}
