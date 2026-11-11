// ---------- kura ----------
function startDraft(){
  toTop();
  if (S.mode==="daily"){ const k=todayKey(); RNG = seeded([...k].reduce((a,c)=>a*31+c.charCodeAt(0),7)); S.deck = shuffle(POOL).slice(0,40); S.deckI = 0; }
  else { if (S.challenge){ S.form = S.challenge.form; S.seed = S.challenge.seed; } else S.seed = Math.floor(Math.random()*2e9);
    RNG = seeded(S.seed); S.deck = shuffle(POOL); S.deckI = 0; }
  bump("g");
  S.slots = FORMATIONS[S.form].map(([pos,x,y])=>({pos,x,y,p:null}));
  S.phase = "xi"; S.bench = [];
  S.rolls = 0; S.rerolls = REROLLS; S.used = new Set(); S.drawn = new Set(); S.spent = 0; S.counted = S.mode==="daily" && !store.get("daily:"+todayKey(), null);
  roll();
}
function askRestart(){
  const n = S.slots.filter(s=>s.p).length;
  if (!n) { renderStart(); return; }
  $("restartbox").innerHTML = `<div class="card hint" style="border-color:#e30a17;background:#2a1012">
    <b>Baştan başlamak istiyor musun?</b> Kadrona aldığın ${n} oyuncu silinecek, diziliş ve tarz seçimine döneceksin.${S.mode==="daily"?" Günün meydan okumasında yine aynı takım sırası gelir.":""}
    <div class="row" style="margin-top:10px"><button class="btn" onclick="renderStart()">Evet, baştan başla</button><button class="btn ghost" onclick="$('restartbox').innerHTML=''">Vazgeç</button></div></div>`;
  try { $("restartbox").scrollIntoView({block:"center",behavior:"smooth"}); } catch(e){}
}
function reroll(){
  if (S.rerolls<=0) return;
  S.rerolls--; roll();
}
function updateForced(){ S.forced=false; if (S.rerolls<=0 && !S.cur.players.some(canPick)) S.forced=true; }
function roll(){
  let t;
  if (S.deck){ let k=0; do { t = S.deck[S.deckI % S.deck.length]; S.deckI++; k++; } while (k<S.deck.length && !t.players.some(p=>!inSquad(p.n) && openSlots().some(s=>natural(p,s.pos)))); }
  else {
    const useful = x => x.players.some(p => !inSquad(p.n) && openSlots().some(s=>natural(p,s.pos)));
    let c = POOL.filter(x=>!S.drawn.has(x.id) && useful(x));
    if(!c.length){ S.drawn.clear(); c = POOL.filter(useful); }
    if(!c.length) c = POOL;
    t = rnd(c);
  }
  S.drawn.add(t.id); S.cur = t; S.rolls++; S.sel = null;
  updateForced();
  renderDraft();
  try { if (window.innerWidth<=700) window.scrollTo({top:0,behavior:"smooth"}); } catch(e){}
}
const curSlots = () => S.phase==="bench" ? S.bench : S.slots;
const openSlots = () => curSlots().filter(s=>!s.p);
const openPos = () => new Set(openSlots().map(s=>NAME[s.pos]));
const keyOf = p => S.cur.id+"|"+p.n;
const inSquad = n => S.slots.some(s=>s.p && s.p.n===n) || (S.bench||[]).some(s=>s.p && s.p.n===n);
function canPick(p){
  if (S.used.has(keyOf(p)) || inSquad(p.n)) return false;
  if (!openSlots().some(s=>fits(p,s.pos))) return false;
  if (S.mode==="daily" && S.phase!=="bench" && S.spent + price(p.r) > DAILY_BUDGET - minRest(1)) return false;
  return true;
}
function minRest(extra){ return Math.max(0, S.slots.filter(s=>!s.p).length - extra); } // her boş yer için en az 1 M kalsın
function pick(i){
  const p = S.cur.players[i]; if(!canPick(p)) return;
  if (S.phase==="bench"){ let si = S.bench.findIndex(s=>!s.p && natural(p,s.pos)); if (si<0) si = S.bench.findIndex(s=>!s.p && fits(p,s.pos)); if (si<0) return;
    S.sel = i; S.lastBench = p.n; return place(si); }
  S.sel = (S.sel===i) ? null : i; renderDraft();
}
function place(si){
  if (S.sel==null) return;
  const arr = curSlots(), p = S.cur.players[S.sel], slot = arr[si];
  if (!slot || slot.p || !fits(p, slot.pos)) return;
  S.sel = null;
  const pen = penaltyFor(p, slot.pos), off = pen>0;
  S.forced = false;
  const meta = {team:S.cur.team, season:S.cur.season, key:S.cur.id};
  if (S.phase==="bench") slot.p = {...p, base:p.r, ...meta};
  else slot.p = {...p, r: p.r-pen, base:p.r, off, forced: pen===FORCED, ...meta};
  S.used.add(keyOf(p)); if (S.phase!=="bench") S.spent += S.mode==="daily" ? price(p.r) : 0;
  if (S.phase!=="bench" && S.slots.every(s=>s.p)) return startBench();
  if (S.phase==="bench" && S.bench.every(s=>s.p)) return renderReady();
  roll();
}
function startBench(){ S.lastBench=null; S.phase="bench"; S.bench = BENCH_SLOTS.map(pos=>({pos,p:null})); S.rerolls = REROLLS; S.forced=false; roll(); }
function skipBench(){ S.bench = S.bench.filter(s=>s.p); renderReady(); }
const anyPickable = () => S.cur.players.some(canPick);
const showR = r => S.almanac ? "?" : r;

const SHIRT = (c,r,drop) => `<div class="shirt"><svg viewBox="0 0 40 38"><path d="M13 3 Q20 8 27 3 L37 8 L40 17 L33 19 L32 37 L8 37 L7 19 L0 17 L3 8 Z" fill="${c[0]}"/><path d="M0 17 L7 19 L7.3 15.6 L1.1 13.5 Z M40 17 L33 19 L32.7 15.6 L38.9 13.5 Z" fill="${c[1]}"/><path d="M18.3 7.4 L21.7 7.4 L21.7 37 L18.3 37 Z" fill="${c[1]}" opacity=".45"/><path d="M13 3 Q20 8 27 3 L25.4 2.3 Q20 6 14.6 2.3 Z" fill="${c[1]}"/><path d="M15.6 3.6 L20 8.6 L24.4 3.6" fill="none" stroke="${c[1]}" stroke-width="1.5" stroke-linejoin="round"/><path d="M13 3 Q20 8 27 3 L37 8 L40 17 L33 19 L32 37 L8 37 L7 19 L0 17 L3 8 Z" fill="url(#shg)"/><path d="M13 3 Q20 8 27 3 L37 8 L40 17 L33 19 L32 37 L8 37 L7 19 L0 17 L3 8 Z" fill="none" stroke="#0008" stroke-width=".9" stroke-linejoin="round"/></svg><span class="rv rb ${tier(r)} ${drop?"drop":""}">${showR(r)}</span></div>`;
// formaların ışık/gölge degradesi: sayfada bir kez tanımlanır
try { if (typeof document!=="undefined" && document.body && !document.getElementById("shgdefs")) document.body.insertAdjacentHTML("afterbegin", `<svg id="shgdefs" width="0" height="0" style="position:absolute"><defs><linearGradient id="shg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".32"/></linearGradient></defs></svg>`); } catch(e){}
function pitchHTML(){
  const selP = (S.sel!=null && S.cur && S.phase!=="bench") ? S.cur.players[S.sel] : null;
  const rs = S.phase==="ready" ? S.rsel : null, rp = rs ? (rs.k==="x" ? S.slots[rs.i].p : S.bench[rs.i].p) : null;
  return `<div class="pitch ${S.phase==="ready"?"rd-edit":""}">${S.slots.map((s,si)=>{ const ok = selP && !s.p && fits(selP,s.pos);
    const rsel = rs && rs.k==="x" && rs.i===si, rok = rp && !rsel && readyCanSwap({k:"x",i:si});
    const tap = S.phase==="ready" ? `onclick="readyTap('x',${si})"` : (ok?`onclick="place(${si})"`:""); return `
    <div class="slot ${rsel?"rsel":""} ${rok?"rok":""} ${s.p?"full":""} ${s.pos==="GK"?"gk":""} ${s.p&&s.p.r>=LEGEND?"leg":""} ${ok?(natural(selP,s.pos)?"ok":"ok near"):""} ${selP&&!ok&&!s.p?"no":""} ${s.p&&s.p.off?"offp":""}" style="--x:${s.x};--y:${s.y}" ${tap}>
      ${s.p ? SHIRT(kitC(s.p.team), s.p.r) : `<div class="dot">${LABEL[s.pos]}</div>`}
      ${s.p?`<div class="nm">${esc(short(s.p.n))}</div><div class="tm">${esc(s.p.team)} ${s.p.season.slice(2)}</div>`:(ok?`<div class="nm">${NAME[s.pos]}${natural(selP,s.pos)?"":` −${penaltyFor(selP,s.pos)}`}</div>`:"")}
    </div>`;}).join("")}</div>`;
}
function benchHTML(){
  if (!S.bench || !S.bench.length) return "";
  const selP = (S.sel!=null && S.cur && S.phase==="bench") ? S.cur.players[S.sel] : null;
  return `<div class="bench"><div class="bh2">YEDEK KULÜBESİ</div><div class="brow">${S.bench.map((s,si)=>{ const ok = selP && !s.p && fits(selP,s.pos);
    const rs = S.phase==="ready" ? S.rsel : null, rsel = rs && rs.k==="b" && rs.i===si, rok = rs && !rsel && s.p && readyCanSwap({k:"b",i:si});
    return `<div class="bslot ${rsel?"rsel":""} ${rok?"rok":""} ${s.p?"full":""} ${ok?"ok":""}" ${S.phase==="ready"&&s.p?`onclick="readyTap('b',${si})"`:ok?`onclick="place(${si})"`:""}>${s.p?`<span class="rv ${tier(s.p.base)}">${showR(s.p.base)}</span><span class="bn">${esc(short(s.p.n))}</span>`:`<span class="bl">${LABEL[s.pos]}</span>`}</div>`; }).join("")}</div></div>`;
}
function renderDraft(){
  const bp = S.phase==="bench", filled = curSlots().filter(s=>s.p).length, t = S.cur, free = !anyPickable(), tc = kitC(t.team);
  const natOK = p => canPick(p) && openSlots().some(s=>natural(p,s.pos));
  const natList = t.players.filter(natOK);
  const noNatural = natList.length===0;
  $("play").innerHTML = `<div class="pathbar">${exitBtn(S.slots.some(s=>s.p)?"Kurduğun kadro silinecek.":"")}</div>
  <div class="grid draft">
    <div>
      ${bp&&filled===0?`<div class="card hint benchintro"><b>11'in tamam! 🎉 Şimdi yedek kulübesini kur.</b> 7 yedek seçeceksin: 1 kaleci, 2 defans, 2 orta saha, 2 forvet. Kırmızı kart cezası ya da sakatlıkta bunlar oyuna girer, maç öncesi istediğinle değiştirebilirsin. Yedeklerde mevki dışı yok, sadece kendi mevkisindeki oyuncuyu koyabilirsin.
        <div class="row" style="margin-top:8px"><button class="btn ghost" onclick="skipBench()">Yedeksiz devam et</button></div></div>`:""}
      <div class="draw" style="border-left:6px solid ${tc[0]};box-shadow:inset 6px 0 0 ${tc[1]}33;padding-left:12px">
        <div><span class="badge">${bp?`Yedek ${filled+1}/7`:`${filled+1}. oyuncu`} · ${S.mode==="daily"?"Günün meydan okuması":"Tek oyunculu"}${S.almanac?" · Almanak":""}</span>
          <h2 style="margin:8px 0 0">${kit(t.team)}${esc(t.season)} ${esc(t.team)}</h2>
          <div class="mut" style="font-size:13px">${esc(t.note||"")}${coachOf(t)?` · TD: ${esc(coachOf(t))}`:""}</div></div>
        <div class="row drawbtns">
        <button class="btn ghost restart" onclick="askRestart()">↺ Baştan başla</button>${bp?`<button class="btn ghost" onclick="skipBench()">Yedekleri bitir</button>`:""}
        <button class="btn ${(free||noNatural)&&S.rerolls>0?"blink":"ghost"}" onclick="reroll()" ${S.rerolls<=0?"disabled":""}>${S.rerolls>0?`🎲 Yeniden çek (${S.rerolls} hak)`:"Yeniden çekme hakkın bitti"}</button></div>
      </div>
      ${S.mode==="daily"?`<p>Bütçe: <span class="budget ${S.spent>DAILY_BUDGET?"over":""}">${S.spent} / ${DAILY_BUDGET} M</span> <span class="mut">· kalan ${DAILY_BUDGET-S.spent} M</span></p>`:""}
      ${bp&&S.lastBench?`<div class="tacnote good" style="margin-bottom:8px">✓ ${esc(S.lastBench)} yedek kulübesine eklendi</div>`:""}
      <div id="restartbox"></div>
      ${S.forced?`<div class="card hint"><b>Bu takımdan hiçbir oyuncu boş yerlerine uymuyor ve yeniden çekme hakkın bitti.</b> İstediğin oyuncuyu istediğin boş yere zorunlu koyabilirsin: oyuncu −${FORCED} olur, takım gücü −${TEAM_OFF} düşer.</div>`:""}
      ${free&&S.rerolls>0?`<div class="card hint">Bu takımda boş yerlerine konabilecek oyuncu yok. <b>Yeniden çek (${S.rerolls} hak).</b></div>`:""}
      ${noNatural&&!free&&!S.forced?`<div class="card hint">Bu takımda boş yerlerine <b>asıl mevkisinde</b> oynayacak oyuncu yok. Mevki dışı koyarsan −${OFFPOS} reyting kaybedersin. ${S.rerolls>0?`<b>Yeniden çekmeni öneririz (${S.rerolls} hakkın var).</b>`:`<b>Yeniden çekme hakkın bitti</b>, birini mevki dışı koymak zorundasın. Takımın zorlanacak.`}</div>`:""}
      ${S.sel!=null?`<div class="card" id="selcard" style="margin-bottom:10px;border-color:var(--gold)"><b>${esc(t.players[S.sel].n)}</b> · nereye koyalım? <span class="mut">Sahada yanan yerlerden birine dokun.</span>
        <div class="row" style="margin-top:8px">${S.slots.map((s,si)=>(!s.p&&fits(t.players[S.sel],s.pos))?`<button class="chip ${natural(t.players[S.sel],s.pos)?"on":"nearc"}" onclick="place(${si})">${NAME[s.pos]}${natural(t.players[S.sel],s.pos)?"":nearFit(t.players[S.sel],s.pos)?` (mevki dışı −${OFFPOS})`:` (zorunlu −${FORCED})`}</button>`:"").join("")}<button class="chip" onclick="S.sel=null;renderDraft()">Vazgeç</button></div>
        ${natOK(t.players[S.sel])?"":`<div class="hint" style="margin-top:10px">${esc(short(t.players[S.sel].n))}'nın asıl mevkisi (${roles(t.players[S.sel]).map(r=>NAME[r]).join(", ")}) kadronda dolu. Mevki dışı koyarsan −${OFFPOS} olur.
          ${natList.length?` Bu takımdan asıl mevkisine uyanlar: <b>${natList.map(p=>esc(short(p.n))).join(", ")}</b>.`:""}
          <br><b>Dikkat:</b> mevki dışı her oyuncu takımının hücum ve savunmasını ${TEAM_OFF} puan düşürür, kazanmak çok zorlaşır.
          ${S.rerolls>0?`<div class="row" style="margin-top:8px"><button class="btn blink" onclick="reroll()">🎲 Yeniden çek (${S.rerolls} hak)</button></div>`:`<div style="margin-top:6px"><b>Yeniden çekme hakkın kalmadı.</b></div>`}</div>`}
      </div>`:""}
      <div class="plist">${t.players.map((p,i)=>`
        <button class="pl ${S.sel===i?"sel":""} ${canPick(p)?(natOK(p)?"nat":"nearp"):""}" onclick="pick(${i})" ${canPick(p)?"":"disabled"}>
          <span class="pos ${p.p[0]}">${roles(p).map(r=>LABEL[r]).join("/")}</span>
          <span>${esc(p.n)}${p.r>=LEGEND&&!S.almanac?'<span class="seal" title="Efsane">★</span>':""}</span>
          <span class="rt">${inSquad(p.n)?'<span class="tag in">Kadronda</span>':canPick(p)?(natOK(p)?'<span class="tag ok">✓</span>':`<span class="tag nr">−${S.forced?FORCED:OFFPOS}</span>`):""}<span class="rv ${tier(p.r)}">${showR(p.r)}</span>${S.mode==="daily"?`<span class="price">${price(p.r)} M</span>`:""}</span>
        </button>`).join("")}</div>
      <div class="row" style="margin:8px 0"><button class="chip" onclick="openMultiReport('${esc(t.season)}','${esc(t.team).replace(/'/g,"\\'")}')">🚩 Bu kadroda hata bildir</button></div>
      <p class="mut" style="font-size:13px">Boş yerler: ${[...openPos()].join(", ")} · ${bp?"Yedek seçerken oyuncuya dokunman yeter, kulübede uygun yere kendisi geçer.":"Oyuncuya dokun, sahada nereye koyacağını seç."} Sarı: asıl mevkisi. Turuncu: mevki dışı (oyuncu −${OFFPOS}, takım gücü −${TEAM_OFF}). Kadro başına ${REROLLS} yeniden çekme hakkın var.</p>
      ${S.almanac?"":`<div class="legend"><span class="rv r90">90+</span><span class="rv r87">87-89</span><span class="rv r84">84-86</span><span class="rv r80">80-83</span><span class="rv r70">&lt;80</span></div>`}
    </div>
    <div class="side">${pitchHTML()}${bp?benchHTML():""}${statsHTML()}</div>
  </div>`;
  if (S.sel!=null) document.getElementById("selcard")?.scrollIntoView?.({block:"center",behavior:"smooth"});
}


// ---------- hazır ekranında kadro değişikliği (dokun-değiştir) ----------
const strictFit = (p, pos) => natural(p,pos) || nearFit(p,pos);
function readyPlayer(r){ return r.k==="x" ? (S.slots[r.i]||{}).p : ((S.bench||[])[r.i]||{}).p; }
function readyCanSwap(t){
  const a = S.rsel; if (!a) return false; const pa = readyPlayer(a), pb = readyPlayer(t); if (!pa || !pb) return false;
  if (a.k==="b" && t.k==="b") return false;
  const okA = t.k!=="x" || strictFit(pa, S.slots[t.i].pos), okB = a.k!=="x" || strictFit(pb, S.slots[a.i].pos);
  return okA && okB;
}
function readySet(r, p){
  if (r.k==="x"){ const pos=S.slots[r.i].pos, pen=penaltyFor(p,pos); S.slots[r.i].p = {...p, r:p.base-pen, off:pen>0, forced:false}; }
  else S.bench[r.i].p = {...p, r:p.base, off:false, forced:false};
}
function readyTap(k, i){
  const t = {k, i};
  if (!S.rsel){ if (readyPlayer(t)) S.rsel = t; return renderReady(); }
  if (S.rsel.k===k && S.rsel.i===i){ S.rsel = null; return renderReady(); }
  if (!readyCanSwap(t)){ S.rsel = readyPlayer(t) ? t : null; return renderReady(); }
  const pa = readyPlayer(S.rsel), pb = readyPlayer(t); readySet(S.rsel, pb); readySet(t, pa); S.rsel = null; renderReady();
}
