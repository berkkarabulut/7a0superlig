// ---------- güncel derbi simülasyonu ----------
// GUNCEL kadrolardan iki takım: en iyi diziliş otomatik kurulur, maç motoru oynatır. Tek maç ya da 1.000 maç.
const DB_N = 1000, DB_HOME = { att: 2, def: 1 };
// turnuva motoru büyük güç farklarına göre ayarlı; gerçek derbiler daha dengeli olduğu için farkları yarıya indiriyoruz
const DB_SHRINK = 0.5, dbShr = x => 85 + (x-85)*DB_SHRINK;
function dbSide(t, home){
  const b = realBest(t); if (!b) return null;
  const slots = FORMATIONS[b.form].map(x=>x[0]);
  const pl = b.pick.map((j,i) => { const p = t.players[j], pen = penaltyFor(p, slots[i]); return {...p, r: p.r-pen, pos: LINE(slots[i]), role: slots[i]}; });
  const style = oppStyle(t), pw = teamPower(pl, style);
  if (home){ pw.att += DB_HOME.att; pw.def += DB_HOME.def; }
  pw.att = dbShr(pw.att); pw.def = dbShr(pw.def);
  return { t, form: b.form, pl, pw, style };
}
const dbTeam = id => CUR.find(t=>t.id===id);
function dbPair(){
  const D = S.db || (S.db = { a: CUR[0]?.id, b: CUR[1]?.id });
  if (D.a===D.b) D.b = CUR.find(t=>t.id!==D.a)?.id;
  return D;
}
function dbSet(k, id){ const D = dbPair(); D[k] = id; if (D.a===D.b) D[k==="a"?"b":"a"] = CUR.find(t=>t.id!==id)?.id; D.res = null; D.many = null; renderDerby(); }
function dbSwap(){ const D = dbPair(); [D.a, D.b] = [D.b, D.a]; D.res = null; D.many = null; renderDerby(); }
function dbPlay(){
  const D = dbPair(), A = dbSide(dbTeam(D.a), true), B = dbSide(dbTeam(D.b), false);
  const r = matchEngine(A.pw, B.pw, A.pl, B.pl, false, { ref: pickRef(GUNCEL.sezon), myName: A.t.team, oppName: B.t.team });
  D.res = { g1: r.g1, g2: r.g2, ev: r.ev.filter(e => e.type==="goal" || e.type==="red").map(e => ({m: e.m, side: e.side, type: e.type, n: e.p?.n || ""})) };
  bump("db"); renderDerby();
}
function dbMany(){
  const D = dbPair(), A = dbSide(dbTeam(D.a), true), B = dbSide(dbTeam(D.b), false);
  let w = 0, d = 0, l = 0, gf = 0, ga = 0; const sc = {};
  for (let i=0; i<DB_N; i++){
    const g1 = poisson(lam(A.pw.att, B.pw.def)), g2 = poisson(lam(B.pw.att, A.pw.def));
    gf += g1; ga += g2; g1>g2 ? w++ : g1===g2 ? d++ : l++;
    const k = g1+"-"+g2; sc[k] = (sc[k]||0)+1;
  }
  const top = Object.entries(sc).sort((x,y)=>y[1]-x[1]).slice(0,3);
  D.many = { w, d, l, gf: gf/DB_N, ga: ga/DB_N, top };
  bump("db"); renderDerby();
}
function dbXI(s){
  const order = ["GK","DF","MF","FW"];
  return order.map(k => s.pl.filter(p=>p.pos===k).map(p=>short(p.n)).join(", ")).filter(Boolean).join(" · ");
}
function dbShareText(){
  const D = dbPair(), A = dbTeam(D.a), B = dbTeam(D.b), L = [];
  if (D.res){
    L.push(`⚔️ ${A.team} ${D.res.g1}-${D.res.g2} ${B.team} (simülasyon)`);
    for (const e of D.res.ev) L.push(`${e.m}' ${e.type==="goal"?"⚽":"🟥"} ${short(e.n)} (${e.side?B.team:A.team})`);
  }
  if (D.many){
    const m = D.many;
    L.push(`🎲 ${DB_N} maçta: ${A.team} %${Math.round(m.w/DB_N*100)} · beraberlik %${Math.round(m.d/DB_N*100)} · ${B.team} %${Math.round(m.l/DB_N*100)}`);
    L.push(`En olası skor: ${m.top[0][0]}`);
  }
  L.push(`Sen de dene: https://7a0superlig.com/?derbi`);
  return L.join("\n");
}
async function dbShare(){
  const txt = dbShareText(), out = $("dbshare");
  try { if (navigator.share){ await navigator.share({text: txt}); return; } } catch(e){ if (e && e.name==="AbortError") return; }
  try { await navigator.clipboard.writeText(txt); if (out) out.textContent = "Kopyalandı ✓"; } catch(e){ if (out) out.textContent = "Kopyalanamadı"; }
}
function dbPick(k){
  const D = dbPair();
  const c = kitC(dbTeam(D[k]).team);
  return `<div class="db-pick"><div class="mut db-lab">${k==="a"?"Ev sahibi":"Deplasman"}</div><div class="db-selw"><span class="kit" style="--c1:${c[0]};--c2:${c[1]}"></span><select class="db-sel" onchange="dbSet('${k}',this.value)">${CUR.map(t => `<option value="${esc(t.id)}" ${D[k]===t.id?"selected":""}>${esc(t.team)}</option>`).join("")}</select></div></div>`;
}
function renderDerby(){
  const D = dbPair(), TA = dbTeam(D.a), TB = dbTeam(D.b);
  if (!TA || !TB){ $("play").innerHTML = `${topBar("")}<p class="mut">Güncel kadro yok.</p>`; return; }
  const A = dbSide(TA, true), B = dbSide(TB, false), ca = kitC(TA.team), cb = kitC(TB.team);
  const side = (s, c) => `<div class="db-side"><div class="db-name"><span class="kit" style="--c1:${c[0]};--c2:${c[1]}"></span><b>${esc(s.t.team)}</b></div>
    <div class="mut db-meta">${s.form} · ${STYLES[s.style]?.e||""} ${esc(s.style)} · güç ${s.pw.ovr}${coachOf(s.t)?` · TD ${esc(coachOf(s.t))}`:""}</div>
    <div class="db-xi">${esc(dbXI(s))}</div></div>`;
  let res = "";
  if (D.res){
    const r = D.res, win = r.g1>r.g2 ? TA.team : r.g2>r.g1 ? TB.team : "";
    res += `<div class="card db-res"><div class="db-score"><span>${esc(TA.team)}</span><b>${r.g1} - ${r.g2}</b><span>${esc(TB.team)}</span></div>
      <div class="mut db-win">${win ? `${esc(win)} kazandı` : "Berabere"}</div>
      <div class="db-ev">${r.ev.length ? r.ev.map(e=>`<div class="db-e ${e.side?"db-r":""}"><span class="db-m">${e.m}'</span> ${e.type==="goal"?"⚽":"🟥"} ${esc(e.n)}</div>`).join("") : `<div class="mut">Gol yok, 0-0.</div>`}</div></div>`;
  }
  if (D.many){
    const m = D.many, pc = x => Math.round(x/DB_N*100);
    res += `<div class="card db-res"><h3 style="margin:0 0 8px">🎲 ${DB_N.toLocaleString("tr-TR")} maçlık simülasyon</h3>
      <div class="db-bar"><span style="flex:${m.w};background:${ca[0]}"></span><span style="flex:${m.d};background:#8a8f98"></span><span style="flex:${m.l};background:${cb[0]}"></span></div>
      <div class="db-pcs"><span><b>%${pc(m.w)}</b> ${esc(TA.team)}</span><span><b>%${pc(m.d)}</b> beraberlik</span><span><b>%${pc(m.l)}</b> ${esc(TB.team)}</span></div>
      <div class="mut db-meta">Maç başı gol: ${m.gf.toFixed(1)} - ${m.ga.toFixed(1)} · En olası skorlar: ${m.top.map(([k,v])=>`${k} (%${(v/DB_N*100).toFixed(0)})`).join(", ")}</div></div>`;
  }
  $("play").innerHTML = `${topBar("")}
    <h1>⚔️ Güncel derbi simülasyonu</h1>
    <p class="mut">${GUNCEL.sezon} güncel kadrolarıyla iki takımı seç. İlk 11 ve diziliş otomatik kurulur, ev sahibi küçük bir avantajla başlar. Kadrolar ${GUNCEL.guncelleme.split("-").reverse().join(".")} itibarıyla.</p>
    <div class="card db-cfg">${dbPick("a")}<div class="row" style="justify-content:center;margin:4px 0"><button class="btn ghost db-swap" onclick="dbSwap()">⇅ Yer değiştir</button></div>${dbPick("b")}</div>
    <div class="db-sides">${side(A, ca)}<div class="db-vs">VS</div>${side(B, cb)}</div>
    <div class="row db-act"><button class="btn" onclick="dbPlay()">▶️ Maçı oynat</button><button class="btn ghost" onclick="dbMany()">🎲 ${DB_N.toLocaleString("tr-TR")} kez simüle et</button>
      ${D.res||D.many?`<button class="btn ghost" onclick="dbShare()">📤 Paylaş</button><span id="dbshare" class="mut"></span>`:""}</div>
    ${res}
    <div class="row" style="margin-top:14px"><button class="btn ghost" onclick="pickReal('${esc(TA.id)}')">🏟️ ${esc(TA.team)} ile turnuvaya çık</button></div>`;
  toTop();
}
if (typeof location!=="undefined" && /[?&]derbi/.test(location.search)) setTimeout(()=>renderDerby(), 400);
