// ---------- maç sahasında top animasyonu ----------
// Sonucu maç motoru belirler; burada sadece olaylar sahada canlandırılır (pas zinciri → şut → gol/kurtarış/direk/aut).
// Saha: rakip üst yarıda (kalesi y≈3), sen alt yarıdasın (kalen y≈97). side 0 = sen (yukarı hücum), side 1 = rakip (aşağı hücum).
const BALL = { x:50, y:50, own:0, tick:0 };
const ballPitch = () => document.querySelector && document.querySelector("#mpitch .pitch.mp");
function ballEl(){
  const pt = ballPitch(); if (!pt) return null;
  let b = pt.querySelector(".mp-ball");
  if (!b){ pt.insertAdjacentHTML("beforeend", `<div class="mp-ball" style="left:${BALL.x}%;top:${BALL.y}%"></div>`); b = pt.querySelector(".mp-ball"); }
  return b;
}
function ballSlots(side){ const pt = ballPitch(); if (!pt) return [];
  return [...pt.querySelectorAll(side===0 ? ".slot.mp-m.full" : ".slot.mp-o")].map(el => ({el, n:el.dataset.n, x:+el.dataset.hx, y:+el.dataset.hy})); }
function ballNudge(){
  const pt = ballPitch(); if (!pt) return;
  pt.querySelectorAll(".slot[data-hx]").forEach(el => { const hx=+el.dataset.hx, hy=+el.dataset.hy;
    const dx = Math.max(-5, Math.min(5, (BALL.x-hx)*0.14)), dy = Math.max(-4, Math.min(4, (BALL.y-hy)*0.12));
    el.style.setProperty("--x", (hx+dx).toFixed(1)); el.style.setProperty("--y", (hy+dy).toFixed(1)); });
}
function ballTo(x, y, dur){
  const b = ballEl(); BALL.x = x; BALL.y = y; if (!b) return;
  b.style.transitionDuration = Math.max(60, dur)+"ms";
  b.style.left = x+"%"; b.style.top = y+"%";
  const pt = ballPitch(); if (pt) pt.style.setProperty("--nudge", Math.max(120, dur*1.6)+"ms");
  ballNudge();
}
const ballFind = (side, name) => ballSlots(side).find(s => s.n===name);
// hücum eden takımın, topa göre kaleye daha yakın rastgele bir oyuncusu
function ballStep(side, towardY){
  const ss = ballSlots(side).filter(s => side===0 ? s.y < BALL.y+4 && s.y > towardY : s.y > BALL.y-4 && s.y < towardY);
  const c = ss.length ? ss : ballSlots(side); return c.length ? c[Math.floor(Math.random()*c.length)] : null;
}
function ballMark(slot, cls){ if (!slot || !slot.el) return; slot.el.classList.remove(cls); void slot.el.offsetWidth; slot.el.classList.add(cls); setTimeout(()=>slot.el.classList.remove(cls), 1600); }
// her birkaç dakikada bir: orta sahada paslaşma, arada top el değiştirir
function ballIdle(ms){
  if (!ms || !ballPitch()) return;
  if (++BALL.tick % 2) return;
  if (Math.random() < 0.28) BALL.own = 1-BALL.own;
  const ss = ballSlots(BALL.own).filter(s => s.y > 14 && s.y < 86);
  const s = ss[Math.floor(Math.random()*ss.length)]; if (s) ballTo(s.x + (Math.random()*4-2), s.y + (BALL.own===0?-3:3), ms*2.2);
}
// olayı canlandır; nap(ms) maç iptal edilirse fırlatır
async function ballEvent(e, ms, nap){
  if (!ms || !ballPitch()) return false;
  const side = e.side, goalY = side===0 ? 3 : 97, hop = Math.max(90, ms*1.4);
  if (e.type==="yellow" || e.type==="red" || e.type==="inj"){ ballMark(ballFind(side, e.p?.n), e.type==="inj" ? "fx-inj" : e.type==="red" ? "fx-red" : "fx-yel"); return false; }
  if (e.type==="sub") return false;
  if (e.type==="flow"){ const s = e.p ? ballFind(side, e.p.n) : null; BALL.own = side; if (s) ballTo(s.x, s.y + (side===0?-3:3), hop*1.6); return false; }
  if (!["goal","save","post","wide","penS","penM"].includes(e.type)) return false;
  BALL.own = side;
  const pen = e.pen || e.type==="penS" || e.type==="penM";
  let shooter = e.p ? ballFind(side, e.p.n) : null;
  if (pen){ ballTo(50, side===0 ? 13 : 87, hop*2); await nap(hop*3); }
  else {
    const towardY = side===0 ? 22 : 78;
    for (let k=0; k<2; k++){ const s = ballStep(side, towardY); if (s){ ballTo(s.x, s.y + (side===0?-3:3), hop); await nap(hop); } }
    if (!shooter) shooter = ballStep(side, towardY);
    const sx = shooter ? shooter.x : 50, sy = side===0 ? Math.max(14, Math.min(30, shooter ? shooter.y : 22)) : Math.min(86, Math.max(70, shooter ? shooter.y : 78));
    ballTo(sx, sy, hop); await nap(hop);
  }
  if (shooter) ballMark(shooter, "fx-shot");
  const gx = 50 + (Math.random()*8-4);
  if (e.type==="goal"){ ballTo(gx, side===0 ? 1.5 : 98.5, hop*0.9); await nap(hop); const pt = ballPitch(); if (pt){ pt.classList.remove(side===0?"net-top":"net-bot"); void pt.offsetWidth; pt.classList.add(side===0?"net-top":"net-bot"); }
    await nap(hop*2.5); BALL.own = 1-side; ballTo(50, 50, hop*2); }
  else if (e.type==="save" || e.type==="penS"){ const gk = ballSlots(1-side).find(s => side===0 ? s.y < 10 : s.y > 90); ballTo(gk ? gk.x : 50, goalY + (side===0?3:-3), hop*0.9); await nap(hop); if (gk) ballMark(gk, "fx-save"); BALL.own = 1-side; }
  else if (e.type==="post"){ const px = Math.random()<.5 ? 43.5 : 56.5; ballTo(px, goalY + (side===0?1:-1), hop*0.9); await nap(hop); ballTo(px + (px<50?-8:8), side===0 ? 14 : 86, hop*1.2); }
  else { ballTo(Math.random()<.5 ? 30 : 70, side===0 ? 0.5 : 99.5, hop*1.1); await nap(hop); BALL.own = 1-side; }
  return true;
}
function ballReset(){ BALL.x=50; BALL.y=50; BALL.own=0; BALL.tick=0; }
