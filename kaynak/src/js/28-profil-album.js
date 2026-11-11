// ---------- profil, istatistik, efsaneler albümü ----------
const LEGENDS = (() => { const m = {}; for (const t of POOL) for (const p of t.players) if (p.r>=LEGEND){ const x = m[p.n] || (m[p.n] = {n:p.n, r:p.r, teams:new Set()}); x.r=Math.max(x.r,p.r); x.teams.add(t.team); } return Object.values(m).sort((a,b)=>b.r-a.r||a.n.localeCompare(b.n,"tr")); })();
function profile(){ return store.get("prof", {games:0, champs:0, sevens:0, perfects:0, wins:0, gf:0, ga:0, best:-1, picks:{}, scorers:{}, forms:{}, styles:{}}); }
function recordProfile(T, champ, perfect){
  const p = profile(), w = record()[0];
  p.games++; if (champ) p.champs++; if (w===7) p.sevens++; if (perfect) p.perfects++;
  p.wins += w; p.gf += T.gf; p.ga += T.ga; p.best = Math.max(p.best, w);
  for (const n of [...T.xi.map(s=>s.p.n)]) p.picks[n] = (p.picks[n]||0)+1;
  for (const [n,g] of Object.entries(T.scorers||{})) p.scorers[n] = (p.scorers[n]||0)+g;
  p.forms[S.form] = (p.forms[S.form]||0)+1; p.styles[T.style] = (p.styles[T.style]||0)+1;
  store.set("prof", p);
  const alb = new Set(store.get("album", [])), before = alb.size;
  for (const x of [...T.xi.map(s=>s.p), ...T.bench]) if (x && x.base>=LEGEND) alb.add(x.n);
  store.set("album", [...alb]);
  return alb.size - before;
}
const topN = (o,k=5) => Object.entries(o||{}).sort((a,b)=>b[1]-a[1]).slice(0,k);
function renderProfile(){
  const p = profile(), alb = new Set(store.get("album", [])), s = streak();
  const stat = (v,l) => `<div class="stat"><b>${v}</b><span>${l}</span></div>`;
  $("profile").innerHTML = `<h1>${esc(myName())}</h1>
    <div class="card"><div class="stats" style="flex-wrap:wrap">${stat(p.games,"Turnuva")}${stat(p.champs,"Şampiyonluk")}${stat(p.sevens,"7-0")}${stat(p.perfects,"Gol yemeden 7-0")}
      ${stat(p.games?(p.wins/p.games).toFixed(1):"–","Turnuva başı galibiyet")}${stat(p.best>=0?`${p.best}-${7-p.best}`:"–","En iyi sonuç")}${stat(`${p.gf}-${p.ga}`,"Atılan-yenen")}${stat(`${s.best||0}`,"En uzun seri")}</div></div>
    <div class="grid" style="margin-top:14px">
      <div class="card"><h3>En çok seçtiğin oyuncular</h3>${topN(p.picks).map(([n,c],i)=>`<div class="row" style="gap:8px;padding:3px 0"><b>${i+1}.</b> ${esc(n)}<span class="rt mut">${c} kez</span></div>`).join("")||`<p class="mut">Henüz turnuva oynamadın.</p>`}
        <h3 style="margin-top:14px">Golcülerin</h3>${topN(p.scorers).map(([n,c],i)=>`<div class="row" style="gap:8px;padding:3px 0"><b>${i+1}.</b> ⚽ ${esc(n)}<span class="rt mut">${c} gol</span></div>`).join("")||`<p class="mut">Henüz gol yok.</p>`}
        <h3 style="margin-top:14px">Favorilerin</h3><p class="mut">${topN(p.forms,1).map(([f])=>`Diziliş: <b style="color:var(--txt)">${f}</b>`).join("")||"–"} ${topN(p.styles,1).map(([f])=>` · Tarz: <b style="color:var(--txt)">${STYLES[f]?.e||""} ${esc(f)}</b>`).join("")}</p></div>
      <div class="card"><h3>📒 Efsaneler albümü <span class="mut" style="text-transform:none">· ${alb.size}/${LEGENDS.length}</span></h3>
        <div class="albbar"><i style="width:${(alb.size/LEGENDS.length*100).toFixed(1)}%"></i></div>
        <p class="mut" style="font-size:13px">Reytingi ${LEGEND} ve üstü her oyuncu bir efsane. Turnuvaya çıktığın kadronda (yedekler dahil) olan efsaneler albümüne girer.</p>
        <div class="album">${LEGENDS.map(x=>`<span class="alb ${alb.has(x.n)?"has":""}" title="${esc([...x.teams].join(", "))}"><b class="rv ${tierAlways(x.r)}">${alb.has(x.n)?x.r:"?"}</b>${alb.has(x.n)?esc(x.n):"???"}</span>`).join("")}</div></div>
    </div>`;
}
