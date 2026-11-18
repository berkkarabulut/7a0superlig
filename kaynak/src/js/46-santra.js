// ---------- Santra: istediğin iki takımla tek maç ----------
// Takımlar: 2026-27 güncel kadrolar + 1980-2026 efsane sezonlar. Senin takımın gerçek takım akışıyla (diziliş, ilk 11) kurulur,
// sonra turnuva motoru tek maçlık (T.single) çalışır.
const saTeams = () => [...CUR, ...POOL.filter(realOk).slice().reverse()];
const saLabel = t => t.cur ? `${t.team} (${t.season} güncel)` : `${t.season} ${t.team} (${t.rank}.)`;
function saState(){
  const A = S.santra || (S.santra = { me: CUR[0]?.id, op: CUR[1]?.id, pk: false });
  if (!findTeam(A.me)) A.me = CUR[0]?.id;
  if (!findTeam(A.op) || A.op===A.me) A.op = saTeams().find(t=>t.id!==A.me)?.id;
  return A;
}
const santraOppLabel = () => { const t = findTeam(saState().op); return t ? saLabel(t) : ""; };
function saSet(k, id){ const A = saState(); A[k] = id; if (A.me===A.op) A[k==="me"?"op":"me"] = saTeams().find(t=>t.id!==id)?.id; renderSantra(); }
function saRand(k){ const L = saTeams().filter(t=>t.id!==saState()[k==="me"?"op":"me"]); saSet(k, rnd(L).id); }
function saSwap(){ const A = saState(); [A.me, A.op] = [A.op, A.me]; renderSantra(); }
function saSelect(k){
  const A = saState(), opts = t => `<option value="${esc(t.id)}" ${A[k]===t.id?"selected":""}>${esc(saLabel(t))}</option>`;
  const old = POOL.filter(realOk).slice().reverse();
  const t = findTeam(A[k]), c = kitC(t.team);
  return `<div class="sa-pick"><div class="mut sa-lab">${k==="me"?"Senin takımın":"Rakip"}</div>
    <div class="sa-selw"><span class="kit" style="--c1:${c[0]};--c2:${c[1]}"></span><select class="sa-sel" onchange="saSet('${k}',this.value)">
      <optgroup label="${GUNCEL.sezon} · güncel kadrolar">${CUR.map(opts).join("")}</optgroup>
      <optgroup label="Efsane sezonlar · 1980-2026">${old.map(opts).join("")}</optgroup></select>
      <button class="btn ghost sa-rnd" onclick="saRand('${k}')" title="Rastgele">🎲</button></div>
    <div class="mut sa-meta">${t.cur?"":`${esc(t.note||"")} · `}güç ${t.cur?curPow(t):teamPower(oppPlayers(t), oppStyle(t)).ovr}${coachOf(t)?` · TD ${esc(coachOf(t))}`:""}</div></div>`;
}
function renderSantra(){
  navPush("santra", () => renderSantra());
  S.santraOn = false; S.sl = false;
  const A = saState();
  $("play").innerHTML = `${topBar("")}
    <h1>⚽ Santra</h1>
    <p class="mut">İstediğin takımla istediğin takıma karşı tek maç. Kendi takımının dizilişini ve ilk 11'ini ayarlarsın, maç öncesi konuşmanı yaparsın, devre arasında taktik ve değişiklik yaparsın.</p>
    <div class="card sa-cfg">${saSelect("me")}<div class="sa-mid"><button class="btn ghost sa-swap" onclick="saSwap()">⇅ Yer değiştir</button></div>${saSelect("op")}</div>
    <label class="toggle sa-pk"><input type="checkbox" ${A.pk?"checked":""} onchange="saState().pk=this.checked"> <b>Berabere biterse uzatma ve penaltı</b> <span class="mut">· kapalıysa beraberlik geçerli</span></label>
    <div class="row" style="margin-top:16px"><button class="btn" onclick="santraGo()">Kadroyu ayarla ▶</button></div>`;
  toTop();
}
function santraGo(){ const A = saState(); pickReal(A.me); S.santraOn = true; renderReady(); }
// rakip de gerçek takım: senin takımın gibi tam kimya bonusu alsın (yoksa seçen taraf hep avantajlı olur)
function saOpp(t){ const o = opp(t); o.pw = teamPower(o.pl.map(p=>({...p, key:t.id, team:t.team})), o.pw.style); return o; }
function startSantra(){
  navPush("tour", () => {});
  const A = saState(), ot = findTeam(A.op); if (!ot) return renderSantra();
  RNG = Math.random;
  const xi = S.slots.map(s=>({pos:s.pos, x:s.x, y:s.y, p:{...s.p, r:s.p.base}}));
  const bench = (S.bench||[]).filter(s=>s.p).map(s=>({...s.p}));
  const T = { single:true, pk:!!A.pk, xi, bench, orig: xi.map(s=>s.p.n), mor:{}, outs:{}, penOrder:null, style:S.style, group:[saOpp(ot)], pots:[], R:null, rest15:[], M:[], i:0, res:[], table:{}, W:0,D:0,L:0,gf:0,ga:0, out:null, done:false, others:[] };
  S.T = T; T.me = lineup(T); T.mePw = teamPower(T.me, T.style);
  bump("db");
  preMatch();
}
function santraAfter(T, res, r, pen, notes){
  T.done = true; T.i = 1;
  const me = findTeam(S.realId), ot = T.o.t;
  const verdict = res==="W" ? "🏆 Kazandın!" : res==="L" ? "😔 Kaybettin." : "🤝 Berabere.";
  $("after").innerHTML = `<div class="sa-end"><b>${verdict}</b> <span class="mut">${esc(me?saLabel(me):myName())} ${r.g1}-${r.g2} ${esc(saLabel(ot))}${pen?` · pen. ${pen[0]}-${pen[1]}`:""}</span></div>
    <div class="row" style="margin-top:10px"><button class="btn gold" onclick="startSantra()">🔁 Rövanş</button><button class="btn" onclick="santraGo()">Kadroyu değiştir</button><button class="btn ghost" onclick="renderSantra()">⚽ Yeni maç</button><button class="btn ghost" onclick="saShare()">📤 Paylaş</button><span id="sashare" class="mut"></span></div>`;
  try { $("after").insertAdjacentHTML("beforeend", tsHTML(T)); } catch(e){}
}
async function saShare(){
  const T = S.T, r = T.res[0], me = findTeam(S.realId); if (!r) return;
  const goals = (T.st?.pl ? Object.values(T.st.pl).filter(x=>x.g).map(x=>`${short(x.n)}${x.g>1?" x"+x.g:""}`) : []).join(", ");
  const txt = `⚽ Santra: ${me?saLabel(me):myName()} ${r.g1}-${r.g2} ${saLabel(T.o.t)}${goals?`\n⚽ ${goals}`:""}\nSen de dene: https://${SITE}/?santra`;
  const out = $("sashare");
  try { if (navigator.share){ await navigator.share({text: txt}); return; } } catch(e){ if (e && e.name==="AbortError") return; }
  try { await navigator.clipboard.writeText(txt); if (out) out.textContent = "Kopyalandı ✓"; } catch(e){ if (out) out.textContent = "Kopyalanamadı"; }
}
if (typeof location!=="undefined" && /[?&](santra|derbi)/.test(location.search)) setTimeout(()=>renderSantra(), 400);
