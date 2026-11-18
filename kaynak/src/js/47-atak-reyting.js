// ---------- maç içi: FM 2005 tarzı atak barı + oyuncuların canlı reytingi ----------
// Atak barı: son ~10 dakikadaki ataklardan (gol, şut, direk, kurtarış, pozisyon) baskı hesaplanır,
// bar baskın tarafa doğru kayar ve baskı bitince yavaşça ortaya döner.
// Canlı reyting: herkes 6.5 ile başlar; o ana kadar gösterilen olaylara göre (gol, asist, şut, kurtarış, kart, yenen gol) değişir.
const ATK_W = {goal:3, save:1.6, post:1.6, penS:1.6, penM:1.2, wide:1, flow:0.45};
function atkTarget(M, upto, m){
  const sc = [0.8, 0.8];
  for (let k = 0; k < upto; k++){ const e = M.ev[k], w = ATK_W[e.type]; if (!w || e.m > m || e.m < m-10) continue;
    if (e.type==="flow" && !e.p) continue;
    sc[e.side] += w * (1 - (m - e.m) / 12); }
  return (sc[0] - sc[1]) / (sc[0] + sc[1]); // -1 (rakip baskın) … +1 (sen baskınsın)
}
function atkInit(M, pw, opw){
  M._atk = Math.max(-0.25, Math.min(0.25, ((pw.att+pw.def) - (opw.att+opw.def)) / 40));
  atkPaint(M._atk);
}
function atkStep(M, upto, m){
  if (M._atk === undefined) M._atk = 0;
  M._atk = M._atk * 0.65 + atkTarget(M, upto, m) * 0.35;
  atkPaint(M._atk);
}
// gol: bar anında atan tarafa sert kayar
function atkGoal(M, side){
  const v = M._atk || 0;
  M._atk = side===0 ? Math.min(1, Math.max(v, 0) + 0.6) : Math.max(-1, Math.min(v, 0) - 0.6);
  atkPaint(M._atk);
}
function atkPaint(v){
  const pct = Math.round(50 + Math.max(-1, Math.min(1, v)) * 42);
  for (const id of ["atk-a", "ms-atk-a"]){ const el = $(id); if (el) el.style.width = pct + "%"; }
}
function atkHTML(o, id){
  return `<div class="atk" style="--atk-o:${atkOppColor(o)}"><div class="atk-tr"><i id="${id}"></i><b></b></div></div>`;
}
// rakip rengi: sarıya çok yakınsa (bizim renk sarı) ya da çok koyuysa (zemin koyu) ikinci renk / açık mavi
function atkOppColor(o){
  const rgb = h => { h = String(h).replace("#",""); if (h.length===3) h = h.split("").map(x=>x+x).join(""); const n = parseInt(h,16); return isNaN(n) ? [128,128,128] : [n>>16&255, n>>8&255, n&255]; };
  const bad = h => { const [r,g,b] = rgb(h), lum = (0.299*r + 0.587*g + 0.114*b)/255; return lum < 0.2 || (r > 190 && g > 140 && b < 110); };
  const k = kitC(o.t.team);
  return !bad(k[0]) ? k[0] : !bad(k[1]) ? k[1] : "#8ab4ff";
}

const LR_BASE = 6.5;
function liveRatings(M, upto, a, b){
  const R = {}, X = (p, side) => R[side+"|"+p.n] || (R[side+"|"+p.n] = {p, side, g:0, a:0, sh:0, ot:0, post:0, miss:0, y:0, r:0, sv:0});
  for (let k = 0; k < upto; k++){ const e = M.ev[k]; if (!e.p) continue;
    const x = X(e.p, e.side);
    if (TS_SHOT.includes(e.type)) x.sh++;
    if (TS_OT.includes(e.type)) x.ot++;
    if (e.type==="goal"){ x.g++; if (e.a) X(e.a, e.side).a++; }
    if (e.type==="post") x.post++;
    if (e.type==="penM" || e.type==="penS") x.miss++;
    if (e.type==="yellow") x.y++;
    if (e.type==="red") x.r++;
  }
  // kurtarışlar karşı takımın kalecisine yazılır
  const sv = [0, 0]; for (let k = 0; k < upto; k++){ const e = M.ev[k]; if (e.type==="save" || e.type==="penS") sv[1-e.side]++; }
  const ga = [b, a], lead = [a-b, b-a];
  return (p, side) => {
    const x = R[side+"|"+p.n] || {g:0,a:0,sh:0,ot:0,post:0,miss:0,y:0,r:0}, line = p.pos || "MF", c = ga[side];
    let rt = LR_BASE + (lead[side] > 0 ? 0.2 : lead[side] < 0 ? -0.2 : 0)
      + x.g*0.9 + x.a*0.6 + x.ot*0.15 + x.post*0.1 - Math.max(0, x.sh-x.ot-x.post)*0.04 - x.miss*0.5 - x.y*0.3 - x.r*1.6;
    if (line==="GK") rt += sv[side]*0.18 - c*0.28;
    else if (line==="DF") rt -= c*0.16;
    else if (line==="MF") rt -= c*0.05;
    return Math.round(Math.max(4.5, Math.min(10, rt)) * 10) / 10;
  };
}
// renkler: 5 altı kırmızı, 5-5.9 turuncu, 6-6.9 beyaz, 7-7.9 açık yeşil, 8-8.9 yeşil, 9+ altın
const lrCls = r => r<5 ? "lr1" : r<6 ? "lr2" : r<7 ? "lr3" : r<8 ? "lr4" : r<9 ? "lr5" : "lr6";
function lrTag(rt){ return `<span class="lr ${lrCls(rt)}">(${rt.toFixed(1)})</span>`; }
