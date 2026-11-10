// ---------- penaltıcı seçimi ----------
function choosePens(avail){
  return new Promise(res => {
    const T=S.T; let order = (T.penOrder||[]).filter(n=>avail.some(p=>p.n===n));
    const draw = () => { $("after").innerHTML = `<div class="card penpick"><h3 style="margin-top:0">🥅 Penaltıcılarını seç</h3>
      <p class="mut" style="margin:0 0 8px;font-size:13px">Atış sırasına göre oyunculara dokun (en az 5). Seri uzarsa sıra başa döner.</p>
      <div class="lineup">${kickOrder(avail).map(p=>{ const k=order.indexOf(p.n); return `<button class="lrow ${k>=0?"sel":""}" onclick="window.__pp('${esc(p.n).replace(/'/g,"\\'")}')"><span class="pnum">${k>=0?k+1:""}</span><span class="pos ${p.pos}">${LABEL[p.role]||p.pos}</span><span class="ln">${esc(p.n)}</span><span class="rv ${tier(p.r)}">${showR(p.r)}</span></button>`; }).join("")}</div>
      <div class="row" style="margin-top:10px"><button class="btn ${order.length>=Math.min(5,avail.length)?"gold":""}" ${order.length>=Math.min(5,avail.length)?"":"disabled"} onclick="window.__pgo()">Atışları başlat ▶</button>
      <button class="btn ghost" onclick="window.__pauto()">Otomatik sırala</button><button class="btn ghost" onclick="window.__preset()">Sıfırla</button></div></div>`;
      try{ $("after").scrollIntoView({block:"center",behavior:"smooth"}); }catch(e){} };
    window.__pp = n => { const k=order.indexOf(n); if(k>=0) order.splice(k,1); else order.push(n); draw(); };
    window.__pauto = () => { order = kickOrder(avail).slice(0,5).map(p=>p.n); draw(); };
    window.__preset = () => { order=[]; draw(); };
    window.__pgo = () => { T.penOrder = order.slice(); $("after").innerHTML=""; res(order.slice()); };
    draw();
  });
}
