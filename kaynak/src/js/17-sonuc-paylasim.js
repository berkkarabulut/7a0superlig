function finish(){
  const T=S.T; T.done=true;
  if (T.R && T.i>3 || (T.R && T.res.length>3)) finishBracket();
  const champ = !T.out, [wins] = record(), seven = wins===7, perfect = seven && T.ga===0, unbeaten = champ && T.L===0;
  const title = resultTitle();
  const sub = perfect ? "7 maç, 7 galibiyet, kalende tek gol yok. Bundan ötesi yok." :
              seven ? `7 maçın 7'sini de kazandın. Bir de gol yemeden yapabilir misin?` :
              champ ? `Kupayı kaldırdın ama ${7-wins} maçı kazanamadın. 7-0 için hepsini kazanmalısın.` : "Kadroyu değiştirip bir daha dene.";
  const unlocked = checkAch({champ,perfect,unbeaten,seven});
  let submitP = null, soloP = null;
  const resTxt = champ ? "Şampiyon" : T.out.replace(" elendin","").replace(/^Grupta \d\. oldun,?/,"Grup");
  if (S.mode==="solo") soloP = submitSolo({ name: myName(), w: record()[0], gf: T.gf, ga: T.ga, spent: 0, ovr: teamPower(T.me,S.style).ovr, res: resTxt });
  if (S.mode==="daily" && S.counted){ store.set("daily:"+todayKey(), {title:recStr()+" · "+title, spent:S.spent, ovr:teamPower(T.me,S.style).ovr, perfect}); S.counted=false;
    submitP = submitDaily({ name: myName(), w: record()[0], gf: T.gf, ga: T.ga, spent: S.spent, ovr: teamPower(T.me,S.style).ovr, res: resTxt }); }
  if (soloP) soloP.then(async r => { const el=$("solorank"); if(!el) return;
    if (!r){ el.textContent="Sıralamaya gönderilemedi (bağlantı yok)."; return; }
    try { const db=await fb(), rows=rowsOf((await db.ref("solo/"+todayKey()).once("value")).val()), pos=rows.findIndex(x=>x.id===r.key)+1;
      el.innerHTML = (r.better ? `🔥 Günün en iyi sonucun güncellendi! Tek oyunculu tabloda <b style="color:var(--gold)">${pos}. sıradasın</b> (${rows.length} takım).`
        : `Bugünkü en iyin hâlâ <b>${r.old.w}-${7-r.old.w}</b>, tabloda <b style="color:var(--gold)">${pos}. sıradasın</b>.`) + ` <a href="#" onclick="S.rankMode='solo';show('rank');return false">Tabloyu gör</a>`; } catch(e){} });
  if (submitP) submitP.then(async id => { const el=$("dailyrank"); if(!el) return;
    if (!id){ el.textContent="Sıralamaya gönderilemedi (bağlantı yok)."; return; }
    try { const db=await fb(), s=await db.ref("daily/"+todayKey()).once("value"); const rows=Object.entries(s.val()||{}).map(([k,v])=>({id:k,...v})).sort(rankSort);
      const pos=rows.findIndex(r=>r.id===id)+1; el.innerHTML=`🏅 Meydan okuma sıralamasında <b style="color:var(--gold)">${pos}. sıradasın</b> (${rows.length} takım). <a href="#" onclick="show('rank');return false">Sıralamayı gör</a>`; } catch(e){} });
  const hist = store.get("hist", []); hist.unshift({d:Date.now(), title:recStr()+" · "+title, mode:S.mode}); store.set("hist", hist.slice(0,50));
  $("play").innerHTML = `${pathHTML()}
    <div class="card result">
      <div class="rec ${seven?"gold":champ?"W":"L"}">${recStr()}</div>
      <div class="big ${champ?"W":"L"}" style="font-size:28px">${esc(title)}</div>
      <div class="site">⚽ SÜPER LİG 7-0 · <a href="https://${SITE}/" target="_blank">${SITE}</a></div>
      <p class="mut">${T.W}G ${T.D}B ${T.L}M · Atılan ${T.gf} · Yenen ${T.ga}${S.mode==="daily"?` · Bütçe ${S.spent}/${DAILY_BUDGET} M`:""}${S.almanac?" · Almanak":""}</p>
      <p>${sub}</p>
      ${S.mode==="solo"?`<p id="solorank" class="mut">Günün tek oyunculu tablosuna bakılıyor…</p>`:""}
      ${S.mode==="daily"?`<p id="dailyrank" class="mut">${submitP?"Sıralamaya ekleniyor…":"Bugünkü hakkını kullanmıştın, bu oyun sıralamaya sayılmadı."}</p>`:""}
      ${unlocked.length?`<p>Yeni başarım: ${unlocked.map(a=>`<b style="color:var(--gold)">${esc(a)}</b>`).join(", ")}</p>`:""}
      <div class="row" style="justify-content:center;margin-top:12px">
        <button class="btn" onclick="startTournament()">Aynı kadroyla tekrar</button>
        <button class="btn ghost" onclick="renderStart()">Yeni kadro</button>
        <button class="btn gold" onclick="openShare()">📸 Paylaş</button>
      </div><p class="mut" id="cp" style="font-size:12px"></p>
    </div>
    ${T.res.length>3?`<div class="card" style="margin-top:16px"><h3>Eleme ağacı</h3>${bracketHTML()}</div>`:""}
    <div class="grid" style="margin-top:16px"><div class="card"><h3>Maçlarımız</h3><table>${T.res.map((r,i)=>`<tr><td>${STAGES[i]}</td><td>${esc(r.opp)}</td><td class="${r.res}"><b>${r.g1}-${r.g2}</b>${r.pen?` (pen. ${r.pen[0]}-${r.pen[1]})`:""}</td></tr>`).join("")}</table></div><div>${pitchHTML()}${benchHTML()}</div></div>`;
}
const SHORTST = ["G1","G2","G3","S16","ÇF","YF","F"];
function record(){ const w=S.T.res.filter(r=>r.res==="W").length; return [w,7-w]; }
const recStr = () => record().join("-");
function resultTitle(){ const T=S.T, champ=!T.out, [w]=record();
  return w===7&&T.ga===0 ? "Efsane! Kalesini gole kapatarak 7-0" : w===7 ? "Efsane! 7'de 7" : champ&&T.L===0 ? "Yenilmez şampiyon" : champ ? "Şampiyon" : T.out; }
function shareText(){
  const T=S.T, line = T.res.map(r=>r.res==="W"?"🟩":r.res==="D"?"🟨":"🟥").join("") + "⬛".repeat(7-T.res.length);
  return `⚽ Süper Lig 7-0 · ${myName()}: ${recStr()}\n${resultTitle()}\n${line}\n${T.W}G ${T.D}B ${T.L}M · Atılan ${T.gf} · Yenen ${T.ga}\n${S.form} · ${S.style}${S.almanac?" · Almanak":""}${S.mode==="daily"?` · Günün meydan okuması (${todayKey()})`:""}\n11'im: ${S.slots.map(s=>short(s.p.n)).join(", ")}\n${SITE}`;
}
function rr(c,x,y,w,h,r){ c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
function fitText(c,txt,max){ let s=txt; while(c.measureText(s).width>max && s.length>3) s=s.slice(0,-2); return s===txt?s:s+"…"; }
function makeShareCanvas(){
  const T=S.T, W=1080, H=1350, cv=document.createElement("canvas"); cv.width=W; cv.height=H; const c=cv.getContext("2d");
  const F = "'Barlow Condensed','Arial Narrow',system-ui,sans-serif";
  c.fillStyle="#14061f"; c.fillRect(0,0,W,H);
  // başlık
  c.fillStyle="#e30a17"; c.fillRect(0,0,W,10);
  c.textAlign="left"; c.fillStyle="#ffffff"; c.font=`800 58px ${F}`; c.fillText("SÜPER LİG",60,100);
  const w1=c.measureText("SÜPER LİG ").width; c.fillStyle="#e30a17"; c.fillRect(60+w1-4,52,c.measureText("7-0").width+16,62); c.fillStyle="#fff"; c.fillText("7-0",60+w1+4,100);
  c.textAlign="right"; c.fillStyle="#c9a3e0"; c.font=`600 28px ${F}`;
  c.fillText(S.mode==="daily"?`Günün meydan okuması · ${todayKey()}`:new Date().toLocaleDateString("tr-TR"),W-60,96);
  // sonuç
  const champ=!T.out, [wins]=record(), seven=wins===7;
  c.textAlign="center"; c.fillStyle= seven?"#ffb703": champ?"#00d9b8":"#ff4d6d"; c.font=`900 120px ${F}`;
  c.fillText(recStr(),W/2,215);
  c.font=`800 36px ${F}`; c.fillText(fitText(c,(champ?"🏆 ":"")+myName()+" · "+resultTitle(),W-120),W/2,262);
  c.fillStyle="#c9a3e0"; c.font=`600 26px ${F}`;
  c.fillText(`Atılan ${T.gf}  ·  Yenen ${T.ga}`,W/2,296);
  // maç kutuları
  const bw=132, gap=12, bx=(W-(7*bw+6*gap))/2;
  for(let i=0;i<7;i++){ const r=T.res[i], x=bx+i*(bw+gap), y=310;
    c.fillStyle = !r?"#2a0f45": r.res==="W"?"#00a88f": r.res==="D"?"#d99a00":"#c40812"; rr(c,x,y,bw,110,16); c.fill();
    c.fillStyle= r?"#ffffff":"#6b4f86"; c.font=`700 22px ${F}`; c.fillText(SHORTST[i],x+bw/2,y+36);
    c.font=`900 40px ${F}`; c.fillText(r?`${r.g1}-${r.g2}`:"–",x+bw/2,y+86);
    if(r&&r.pen){ c.font=`600 17px ${F}`; c.fillText(`pen ${r.pen[0]}-${r.pen[1]}`,x+bw/2,y+106); } }
  // saha
  const px=60, py=455, pw=W-120, ph=760;
  const g=c.createLinearGradient(0,py,0,py+ph); g.addColorStop(0,"#1f6b3a"); g.addColorStop(1,"#1b5f33"); c.fillStyle=g; rr(c,px,py,pw,ph,28); c.fill();
  c.save(); rr(c,px,py,pw,ph,28); c.clip();
  for(let i=0;i<10;i+=2){ c.fillStyle="rgba(255,255,255,.035)"; c.fillRect(px,py+i*ph/10,pw,ph/10); }
  c.restore();
  c.strokeStyle="rgba(255,255,255,.28)"; c.lineWidth=3; rr(c,px,py,pw,ph,28); c.stroke();
  c.beginPath(); c.moveTo(px+40,py+ph/2); c.lineTo(px+pw-40,py+ph/2); c.stroke();
  c.beginPath(); c.arc(W/2,py+ph/2,90,0,Math.PI*2); c.stroke();
  c.strokeRect(W/2-170,py+ph-120,340,120); c.strokeRect(W/2-170,py,340,120);
  const col = r => r>=90?"#e8221a":r>=87?"#ffb703":r>=84?"#00c2a8":r>=80?"#3d8bff":"#4a3a5a";
  for(const s of S.slots){ const p=s.p, x=px+pw*s.x/100, y=py+ph*s.y/100;
    c.fillStyle=col(p.r); c.beginPath(); c.arc(x,y,38,0,Math.PI*2); c.fill();
    c.lineWidth=4; c.strokeStyle= p.r>=LEGEND?"#ffb703":"#ffffff"; c.stroke();
    c.fillStyle= (p.r>=84&&p.r<90)?"#1d1200":"#fff"; c.font=`900 30px ${F}`; c.fillText(S.almanac?"?":p.r,x,y+11);
    c.fillStyle="#fff"; c.shadowColor="rgba(0,0,0,.6)"; c.shadowBlur=6; c.font=`800 24px ${F}`; c.fillText(fitText(c,short(p.n),190),x,y+68);
    c.font=`600 18px ${F}`; c.fillStyle="rgba(255,255,255,.8)"; c.fillText(fitText(c,`${p.team} ${p.season.slice(2)}`,190),x,y+92); c.shadowBlur=0; }
  // alt bilgi
  const pw2=teamPower(T.me,S.style);
  c.textAlign="left"; c.fillStyle="#ffffff"; c.font=`800 32px ${F}`;
  c.fillText(`${S.form} · ${S.style}${S.almanac?" · Almanak":""}`,60,1275);
  c.textAlign="right"; c.fillText(S.almanac?"Genel ?":`Genel ${pw2.ovr}`,W-60,1275);
  c.textAlign="center"; c.fillStyle="#ffb703"; c.font=`700 26px ${F}`; c.fillText(`Sen de 11'ini kur · ${SITE}`,W/2,1322);
  return cv;
}
async function openShare(){
  try { await document.fonts?.load?.("800 40px 'Barlow Condensed'"); } catch(e){}
  const cv = makeShareCanvas(), url = cv.toDataURL("image/png");
  S.shareUrl = url;
  const m = document.createElement("div"); m.id="sharebox"; m.className="modal";
  m.innerHTML = `<div class="mbox"><div class="row" style="justify-content:space-between"><h3 style="margin:0">Sonucunu paylaş</h3><button class="chip" onclick="closeShare()">✕</button></div>
    <img src="${url}" alt="Sonuç görseli" style="width:100%;border-radius:12px;margin:12px 0">
    <div class="row">
      <button class="btn gold" onclick="downloadShare()">⬇️ Görseli indir</button>
      <button class="btn" onclick="nativeShare()">📤 Paylaş</button>
      <button class="btn ghost" onclick="copyResult()">📋 Metni kopyala</button>
    </div>
    <p class="mut" id="cp" style="font-size:13px;margin:10px 0 0">İndirme açılmazsa görsele basılı tut (bilgisayarda sağ tık) ve "Resmi kaydet" de.</p>
    <textarea id="sharetxt" readonly style="width:100%;margin-top:8px;background:#0f1813;color:var(--txt);border:1px solid var(--line);border-radius:8px;padding:8px;font:inherit;font-size:13px" rows="5">${esc(shareText())}</textarea></div>`;
  m.addEventListener("click", e=>{ if(e.target===m) closeShare(); });
  document.body.appendChild(m);
}
function closeShare(){ document.getElementById("sharebox")?.remove(); }
async function downloadShare(){
  const fname=`superlig-7-0-${Date.now()}.png`;
  try {
    if (window.claude && window.claude.use) {
      const dl = await window.claude.use("downloads");
      if (dl) {
        const blob = await (await fetch(S.shareUrl)).blob();
        try { await dl.save({filename:fname, data:blob}); }
        catch(e1){ await dl.save({filename:fname, data:new Uint8Array(await blob.arrayBuffer())}); }
        $("cp").textContent="Görsel kaydedildi ✓"; return;
      }
    }
  } catch(e){ if (e && /declin|cancel|abort/i.test(String(e.code||e.name||e.message))) { $("cp").textContent="İndirme iptal edildi."; return; } }
  try { const a=document.createElement("a"); a.href=S.shareUrl; a.download=fname; document.body.appendChild(a); a.click(); a.remove();
    $("cp").textContent="İndiriliyor… İnmezse görsele basılı tut ya da sağ tıkla, 'Resmi kaydet' de."; } catch(e){ $("cp").textContent="İndirme açılmadı. Görsele basılı tut ya da sağ tıkla, 'Resmi kaydet' de."; }
}
async function nativeShare(){
  const txt=shareText();
  try {
    const blob = await (await fetch(S.shareUrl)).blob(); const file = new File([blob],"superlig-7-0.png",{type:"image/png"});
    if (navigator.canShare && navigator.canShare({files:[file]})) { await navigator.share({files:[file], text:txt}); return; }
    if (navigator.share) { await navigator.share({text:txt}); return; }
    throw 0;
  } catch(e){ if (e && e.name==="AbortError") return; $("cp").textContent="Bu tarayıcı direkt paylaşımı desteklemiyor. Görseli indirip ya da metni kopyalayıp paylaşabilirsin."; }
}
function copyResult(){
  const txt=shareText(), ta=$("sharetxt");
  const ok=()=>$("cp").textContent="Metin kopyalandı ✓", fail=()=>{ if(ta){ ta.focus(); ta.select(); } $("cp").textContent="Otomatik kopyalanamadı. Kutudaki metin seçili, kopyala de."; };
  try { navigator.clipboard.writeText(txt).then(ok, ()=>{ try{ ta.select(); document.execCommand("copy")?ok():fail(); }catch(e){fail()} }); } catch(e){ fail(); }
}

