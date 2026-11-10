// ---------- maç önü: kadro + takım konuşması ----------
function talkCtx(T,o){ const me=teamPower(lineup(T),T.style), d=(me.att+me.def)-(o.pw.att+o.pw.def); return d>3?"fav":d<-3?"dog":"even"; }
function preMatch(){
  const T=S.T, i=T.i, isKo=i>=3, o = isKo ? T.R[i-3][1] : T.group[i];
  T.o = o; T.ref = pickRef(o.t.season);
  if (T.prepFor!==i){ T.prepFor=i; T.notes = autoFix(T); T.talked=false; T.talkRes=null; T.selXi=null; T.sel=null; }
  renderPre();
}
function renderPre(){
  const T=S.T, i=T.i, o=T.o, isKo=i>=3, L=lineup(T), pw=teamPower(L,T.style), ctx=talkCtx(T,o), os=o.pw.style;
  const mor = n => { const v=T.mor[n]||0; return v>0?`<span class="mor up">▲${v}</span>`:v<0?`<span class="mor dn">▼${-v}</span>`:""; };
  const stat = p => isOut(T,p.n) ? `<span class="tag nr">${T.outs[p.n].k==="susp"?"🟥 cezalı":"🚑 sakat"}</span>` : "";
  const selP = T.selXi!=null ? T.xi[T.selXi] : null;
  $("play").innerHTML = `${pathHTML()}
  <div class="grid">
    <div>
      <div class="card">
        <div class="mut" style="text-align:center;font-weight:700;letter-spacing:.5px">${STAGES[i].toUpperCase()} · MAÇ ÖNÜ</div>
        <div class="score pre"><div class="tn">${esc(myName())}<div class="mut" style="font-size:12px;font-weight:400">${S.form} · ${STYLES[T.style].e} ${esc(T.style)}</div></div>
          <div><div class="big vs">VS</div><div class="clock">⚖️ ${esc(T.ref)}</div></div>
          <div class="tn">${kit(o.t.team)}${esc(o.name)}<div class="mut" style="font-size:12px;font-weight:400">${STYLES[os].e} ${esc(os)}${coachOf(o.t)?` · TD: ${esc(coachOf(o.t))}`:""}</div></div></div>
        <div class="stats" style="margin-top:4px"><div class="stat"><b>${pw.att.toFixed(1)}</b><span>Hücumun</span></div><div class="stat"><b>${pw.def.toFixed(1)}</b><span>Savunman</span></div>
          <div class="stat"><b>${o.pw.att.toFixed(1)}</b><span>Rakip hücum</span></div><div class="stat"><b>${o.pw.def.toFixed(1)}</b><span>Rakip savunma</span></div></div>
        ${T.notes.length?`<div class="hint card" style="margin-top:10px">${T.notes.join("<br>")}</div>`:""}
      </div>
      <div class="card" style="margin-top:14px">
        <h3>📋 Taktik</h3>
        <p class="mut" style="font-size:13px;margin-top:0">Rakibin oyun tarzı: <b style="color:var(--txt)">${STYLES[os].e} ${esc(os)}</b>${coachOf(o.t)&&COACH_STYLE[coachOf(o.t)]?` (${esc(coachOf(o.t))} böyle oynatır)`:""}. ${beats(os).length?`Buna karşı etkili: <b style="color:var(--win)">${beats(os).map(esc).join(", ")}</b>.`:""}</p>
        <div class="row">${Object.keys(STYLES).map(k=>`<button class="chip ${k===T.style?"on":""}" onclick="setStyleT('${k}')">${STYLES[k].e} ${k}${ctrOf(k,os)>0?" ✓":ctrOf(os,k)>0?" ⚠":""}</button>`).join("")}</div>
        <p class="mut" style="font-size:13px;margin:8px 0 0">${STYLES[T.style].e} <b style="color:var(--txt)">${esc(T.style)}:</b> ${esc(STYLES[T.style].d)}. ${ctrOf(T.style,os)>0?`<span style="color:var(--win)">✓ Rakibe karşı avantajlısın.</span>`:ctrOf(os,T.style)>0?`<span style="color:var(--loss)">⚠ Rakibin tarzı buna karşı avantajlı.</span>`:""}</p>
      </div>
      <div class="card" style="margin-top:14px">
        <h3>🗣️ Soyunma odası konuşması</h3>
        <p class="mut" style="font-size:13px;margin-top:0">${ctx==="fav"?"Kağıt üstünde favorisin. Rehavete dikkat.":ctx==="dog"?"Rakip daha güçlü görünüyor. Oyuncuları ateşlemen lazım.":"Başa baş bir maç bekleniyor."} Konuşman oyuncuların moralini yükseltebilir de düşürebilir de.</p>
        ${T.talked ? `<div class="talkres">${T.talkRes}</div>` :
          `<div class="talks">${TALKS.map((t,k)=>`<button class="card talk" onclick="doTalk(${k})"><span style="font-size:22px">${t.e}</span><span>“${esc(t.t)}”</span></button>`).join("")}</div>`}
      </div>
      <div class="row" style="margin-top:14px"><button class="btn ${T.talked?"gold":""}" onclick="runMatch()">${T.talked?"Maça çık ▶":"Konuşmadan maça çık ▶"}</button></div>
    </div>
    <div class="card">
      <div class="row" style="justify-content:space-between;align-items:center"><h3 style="margin:0">İlk 11'ini ayarla</h3>${T.xi.some((s,k)=>s.p.n!==T.orig[k])?`<button class="chip" onclick="resetXi()">↺ Kurduğum 11'e dön</button>`:""}</div>
      <p class="mut" style="font-size:13px;margin:4px 0 8px">Oyuncuyu sürükleyip başka bir mevkiye ya da yedeğin üstüne bırak, veya önce birine sonra diğerine dokun. Kırmızı reyting: oyuncu mevkisi dışında, gücü düşüyor. Maç içindeki değişiklikler sonraki maça taşınmaz.</p>
      <div id="lpbox">${xiPitch()}
      ${T.msg?`<div class="tacnote ${T.msg[0]}" style="margin-top:6px">${T.msg[1]}</div>`:""}
      <h3 style="margin-top:14px">Yedekler</h3>
      ${T.bench.length?`<div class="lineup">${T.bench.map((p,k)=>{ const sel=T.sel==="b:"+k;
        return `<div class="lrow bench2 ${sel?"sel":""} ${isOut(T,p.n)?"outp":""}" data-drag="b:${k}" data-drop="b:${k}"><span class="grip">⠿</span><span class="pos ${p.p[0]}">${roles(p).map(r=>LABEL[r]).join("/")}</span><span class="ln">${esc(p.n)} ${stat(p)}</span>${mor(p.n)}<span class="rv ${tier(p.base)}">${showR(p.base)}</span></div>`; }).join("")}</div>`:`<p class="mut">Yedek seçmedin.</p>`}
      </div>
      <p class="mut" style="font-size:12px;margin-top:10px">Rakibin 11'i</p>
      <div style="font-size:13px">${o.pl.slice(0,16).map(p=>`<div class="row" style="gap:6px;padding:2px 0"><span class="pos ${p.pos}">${roles(p).map(r=>LABEL[r]).join("/")}</span>${esc(p.n)}<span class="rt"><span class="rv ${tier(p.r)}">${showR(p.r)}</span></span></div>`).join("")}</div>
    </div>
  </div>`;
  T.msg=null;
  enableDrag($("lpbox"), doMove, tapSel);
}
