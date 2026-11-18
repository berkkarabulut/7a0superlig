// ---------- turnuva sonu istatistikleri ----------
// Her maçtan sonra tsRecord ile T.st'ye yazılır; sonuç ekranında tsHTML gösterir.
const TS_POSS = {"Topa sahip ol":7, "Önde baskı":2, "Uzun top":-3, "Kontra atak":-5, "Otobüsü çek":-8};
function tsRecord(T, r, L, pw, opw, o){
  const st = T.st || (T.st = {pl:{}, m:[], opg:{}});
  const P = (p) => st.pl[p.n] || (st.pl[p.n] = {n:p.n, pos:p.pos||"", ap:0, g:0, a:0, sh:0, y:0, r:0});
  for (const p of L) P(p).ap++;
  for (const s of (r.subs||[])) P(s.in).ap++;
  const m = {opp:o.t.team, season:o.t.season, g1:r.g1, g2:r.g2, sh:[0,0], ot:[0,0], y:[0,0], rd:[0,0], poss:0};
  for (const e of r.ev){
    const sd = e.side;
    if (["goal","save","post","wide","penS","penM"].includes(e.type)) m.sh[sd]++;
    if (["goal","save","penS"].includes(e.type)) m.ot[sd]++;
    if (e.type==="yellow") m.y[sd]++;
    if (e.type==="red") m.rd[sd]++;
    if (sd===0 && e.p){
      const x = P(e.p);
      if (["goal","save","post","wide","penS","penM"].includes(e.type)) x.sh++;
      if (e.type==="goal"){ x.g++; if (e.a) P(e.a).a++; }
      if (e.type==="yellow") x.y++;
      if (e.type==="red") x.r++;
    }
    if (sd===1 && e.type==="goal" && e.p){ const k = e.p.n+"|"+o.t.team; st.opg[k] = (st.opg[k]||0)+1; }
  }
  m.poss = Math.round(Math.max(28, Math.min(72, 50 + ((pw.ovr||0)-(opw.ovr||0))*1.2 + (TS_POSS[T.style]||0) - (TS_POSS[o.pw.style]||0))));
  st.m.push(m);
}
const tsScore = x => x.g*3 + x.a*2 + x.sh*0.3 + x.ap*0.5 - x.y*0.5 - x.r*2;
function tsHTML(T){
  const st = T.st; if (!st || !st.m.length) return "";
  const M = st.m, n = M.length, sum = (f) => M.reduce((a,m)=>a+f(m),0);
  const pls = Object.values(st.pl).filter(x=>x.ap>0);
  const star = [...pls].sort((a,b)=>tsScore(b)-tsScore(a))[0];
  const tops = (k) => [...pls].filter(x=>x[k]>0).sort((a,b)=>b[k]-a[k]||b.g-a.g).slice(0,5);
  const cs = M.filter(m=>m.g2===0).length;
  const tile = (v,l) => `<div class="ts-tile"><b>${v}</b><span>${l}</span></div>`;
  const opTop = Object.entries(st.opg).sort((a,b)=>b[1]-a[1]).slice(0,3);
  const lst = (arr,k,ic) => arr.length ? arr.map(x=>`<div class="ts-li"><span>${esc(short(x.n))}</span><b>${x[k]} ${ic}</b></div>`).join("") : `<div class="mut">Yok</div>`;
  return `<details class="card ts-card" open><summary><h3>📊 Turnuva istatistikleri</h3></summary>
    <div class="ts-tiles">
      ${tile(n,"Maç")}${tile(`${T.W}-${T.D}-${T.L}`,"G-B-M")}${tile(`${T.gf}-${T.ga}`,"Atılan-Yenilen")}
      ${tile(`${sum(m=>m.sh[0])} / ${sum(m=>m.ot[0])}`,"Şut / isabet")}${tile("%"+Math.round(sum(m=>m.poss)/n),"Topa sahip olma")}
      ${tile(cs,"Gol yemeden")}${tile(`${sum(m=>m.y[0])} / ${sum(m=>m.rd[0])}`,"Sarı / kırmızı")}${tile((T.gf/n).toFixed(1),"Maç başı gol")}
    </div>
    ${star?`<div class="ts-star">⭐ <b>Turnuvanın yıldızı:</b> ${esc(star.n)} <span class="mut">· ${star.g} gol · ${star.a} asist · ${star.ap} maç</span></div>`:""}
    <div class="ts-cols">
      <div><h4>⚽ Gol krallığı</h4>${lst(tops("g"),"g","gol")}</div>
      <div><h4>🅰️ Asist</h4>${lst(tops("a"),"a","asist")}</div>
      <div><h4>🎯 Rakiplerin golcüleri</h4>${opTop.length?opTop.map(([k,v])=>{ const [nm,tm]=k.split("|"); return `<div class="ts-li"><span>${esc(short(nm))} <span class="mut">${esc(tm)}</span></span><b>${v} gol</b></div>`; }).join(""):`<div class="mut">Kalende gol yok 🧤</div>`}</div>
    </div>
    <h4>Oyuncular</h4>
    <div style="overflow-x:auto"><table class="ts-tbl"><tr><th style="text-align:left">Oyuncu</th><th>M</th><th>G</th><th>A</th><th>Şut</th><th>🟨</th><th>🟥</th></tr>
      ${[...pls].sort((a,b)=>b.g-a.g||b.a-a.a||b.ap-a.ap).map(x=>`<tr><td style="text-align:left">${esc(short(x.n))}</td><td>${x.ap}</td><td>${x.g||""}</td><td>${x.a||""}</td><td>${x.sh||""}</td><td>${x.y||""}</td><td>${x.r||""}</td></tr>`).join("")}</table></div>
    <h4>Maç maç</h4>
    <div style="overflow-x:auto"><table class="ts-tbl"><tr><th></th><th style="text-align:left">Rakip</th><th>Skor</th><th>Şut</th><th>İsabet</th><th>Topa sahip</th></tr>
      ${M.map((m,i)=>`<tr><td class="mut">${SHORTST[i]}</td><td style="text-align:left">${esc(m.opp)}</td><td><b>${m.g1}-${m.g2}</b></td><td>${m.sh[0]}-${m.sh[1]}</td><td>${m.ot[0]}-${m.ot[1]}</td><td>%${m.poss}</td></tr>`).join("")}</table></div>
  </details>`;
}
