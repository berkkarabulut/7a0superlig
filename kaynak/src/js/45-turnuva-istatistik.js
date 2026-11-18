// ---------- turnuva / maç sonu istatistikleri (FM tarzı) ----------
// Her maçtan sonra tsRecord T.st'ye yazar: oyuncu başına dakika, gol, asist, şut, kart ve maç notu; maç başına takım sayıları.
// tsHTML sonuç ekranında sekmeli (Genel / Oyuncular / Maçlar) kutuyu çizer.
const TS_POSS = {"Topa sahip ol":7, "Önde baskı":2, "Uzun top":-3, "Kontra atak":-5, "Otobüsü çek":-8};
const TS_SHOT = ["goal","save","post","wide","penS","penM"], TS_OT = ["goal","save","penS"];
const tsClamp = (x,a,b) => Math.max(a, Math.min(b, x));
function tsRecord(T, r, L, pw, opw, o){
  const st = T.st || (T.st = {pl:{}, m:[], opg:{}});
  const len = r.len || (r.et ? 120 : 90);
  const P = p => st.pl[p.n] || (st.pl[p.n] = {n:p.n, role:p.role||"", pos:p.pos||"", ap:0, st:0, min:0, g:0, pg:0, a:0, sh:0, ot:0, y:0, r:0, mom:0, rts:[]});
  // bu maçta oynayanlar ve dakikaları
  const mins = {}, rows = {};
  for (const p of L){ mins[p.n] = len; rows[p.n] = {p, start:true}; }
  for (const e of r.ev){ if (e.side!==0) continue;
    if (e.type==="sub" && e.o){ mins[e.o.n] = e.m; mins[e.p.n] = len - e.m; rows[e.p.n] = {p:e.p, start:false}; }
    if (e.type==="inj"){ mins[e.p.n] = e.m; if (e.q){ mins[e.q.n] = len - e.m; rows[e.q.n] = {p:e.q, start:false}; } }
    if (e.type==="red") mins[e.p.n] = e.m;
  }
  for (const s of (r.subs||[])) if (!rows[s.in.n]){ rows[s.in.n] = {p:s.in, start:false}; mins[s.in.n] = mins[s.in.n] ?? 30; }
  const m = {opp:o.t.team, season:o.t.season, g1:r.g1, g2:r.g2, sh:[0,0], ot:[0,0], y:[0,0], rd:[0,0], poss:0, res: r.g1>r.g2?"W":r.g1<r.g2?"L":"D", rt:{}, mom:null};
  const ev = {}; const E = n => ev[n] || (ev[n] = {g:0,pg:0,a:0,sh:0,ot:0,post:0,miss:0,y:0,r:0});
  let saves = 0;
  for (const e of r.ev){
    const sd = e.side;
    if (TS_SHOT.includes(e.type)) m.sh[sd]++;
    if (TS_OT.includes(e.type)) m.ot[sd]++;
    if (e.type==="yellow") m.y[sd]++;
    if (e.type==="red") m.rd[sd]++;
    if (sd===1 && (e.type==="save" || e.type==="penS")) saves++;
    if (sd===0 && e.p){
      const x = E(e.p.n);
      if (TS_SHOT.includes(e.type)) x.sh++;
      if (TS_OT.includes(e.type)) x.ot++;
      if (e.type==="goal"){ x.g++; if (e.pen) x.pg++; if (e.a) E(e.a.n).a++; }
      if (e.type==="post") x.post++;
      if (e.type==="penM" || e.type==="penS") x.miss++;
      if (e.type==="yellow") x.y++;
      if (e.type==="red") x.r++;
    }
    if (sd===1 && e.type==="goal" && e.p){ const k = e.p.n+"|"+o.t.team; st.opg[k] = (st.opg[k]||0)+1; }
  }
  const resB = m.res==="W" ? 0.35 : m.res==="L" ? -0.35 : 0;
  let best = null;
  for (const [n, row] of Object.entries(rows)){
    const p = row.p, x = E(n), mn = tsClamp(mins[n] ?? len, 1, len), line = p.pos || LINE(p.role||"CM");
    let rt = (row.start ? 6.55 : 6.35) + resB + x.g*(x.pg===x.g?0.7:1.0) + x.a*0.6 + x.ot*0.15 + x.post*0.1 - (x.sh-x.ot-x.post)*0.04 - x.miss*0.5 - x.y*0.3 - x.r*1.6;
    if (line==="GK"){ rt += saves*0.18 + (r.g2===0 ? 0.7 : -0.28*r.g2); }
    else if (line==="DF"){ rt += r.g2===0 ? 0.5 : -0.16*r.g2; }
    else if (line==="MF"){ rt += r.g2===0 ? 0.15 : -0.05*r.g2; }
    rt += (Math.random()-0.5)*0.6;
    if (mn < 30) rt = 6.2 + (rt-6.2)*0.6;
    rt = Math.round(tsClamp(rt, 4.5, 10)*10)/10;
    if (r.lr) rt = r.lr(p, 0);                           // canlı oynanan maçta saha üstündeki notun aynısı
    m.rt[n] = rt;
    const a = P(p); a.ap++; if (row.start) a.st++; a.min += mn; a.rts.push(rt);
    a.g += x.g; a.pg += x.pg; a.a += x.a; a.sh += x.sh; a.ot += x.ot; a.y += x.y; a.r += x.r;
    if (!best || rt > m.rt[best]) best = n;
  }
  if (best){ m.mom = best; P(rows[best].p).mom++; }
  m.poss = Math.round(tsClamp(50 + ((pw.ovr||0)-(opw.ovr||0))*1.2 + (TS_POSS[T.style]||0) - (TS_POSS[o.pw.style]||0), 28, 72));
  st.m.push(m);
}
const tsAvg = x => x.rts.length ? x.rts.reduce((a,b)=>a+b,0)/x.rts.length : 0;
// sahadaki canlı notla aynı renk skalası: 5 altı kırmızı, 5'ler turuncu, 6'lar beyaz, 7'ler açık yeşil, 8'ler yeşil, 9+ altın
const tsRtCls = v => v<5 ? "q1" : v<6 ? "q2" : v<7 ? "q3" : v<8 ? "q4" : v<9 ? "q5" : "q6";
const tsRt = v => `<span class="ts-rt ${tsRtCls(v)}">${v.toFixed(1)}</span>`;
const tsLineOrd = {GK:0, DF:1, MF:2, FW:3};
let TS_TAB = "gen", TS_SORT = "rt", TS_PM = false;
function tsTab(k){ TS_TAB = k; const b = $("tsbox"); if (b && S.T) b.innerHTML = tsInner(S.T); }
function tsSort(k){ TS_SORT = k; tsTab("pl"); }
// perMatch: turnuva içindeki her maçın sonunda; ilk sekme "Bu maç", diğerleri turnuvanın o ana kadarki toplamı
function tsHTML(T, open, perMatch){
  if (!T.st || !T.st.m.length) return "";
  TS_PM = !!perMatch && !T.single; TS_TAB = TS_PM ? "bm" : "gen"; TS_SORT = "rt";
  return `<details class="card ts-card" ${open?"open":""}><summary><h3>📊 ${TS_PM?"Maç istatistikleri":T.single?"Maç istatistikleri":"Turnuva istatistikleri"}</h3><span class="ts-tog"><span class="ts-sh">Göster ▾</span><span class="ts-hd">Gizle ▴</span></span></summary><div id="tsbox">${tsInner(T)}</div></details>`;
}
function tsInner(T){
  const st = T.st, M = st.m, n = M.length, sum = f => M.reduce((a,m)=>a+f(m),0);
  const pls = Object.values(st.pl).filter(x=>x.ap>0);
  const sv = x => tsAvg(x) + x.g*0.12 + x.a*0.06 + x.mom*0.12; // yıldız: en az maçların yarısında oynamış olsun
  const star = [...pls].filter(x=>x.ap>=Math.ceil(n/2)).sort((a,b)=>sv(b)-sv(a))[0];
  const tabs = [...(TS_PM?[["bm","Bu maç"]]:[]), ["gen",TS_PM?"Turnuva":"Genel"],["pl","Oyuncular"],["mt",T.single?"Maç":"Maçlar"]];
  const head = `<div class="ts-tabs">${tabs.map(([k,l])=>`<button class="ts-tb ${TS_TAB===k?"on":""}" onclick="tsTab('${k}')">${l}</button>`).join("")}</div>`;
  if (TS_TAB==="bm") return head + tsThis(T, M[n-1], n-1);
  if (TS_TAB==="pl") return head + tsPlayers(T, pls);
  if (TS_TAB==="mt") return head + tsMatches(T, M);
  // ---- Genel ----
  const form = `<div class="ts-form">${M.map((m,i)=>`<span class="ts-fm ${m.res}" title="${esc(m.opp)} ${m.g1}-${m.g2}">${T.single?"":`<i>${SHORTST[i]}</i>`}${m.g1}-${m.g2}</span>`).join("")}</div>`;
  const cmp = (l, a, b, fmt=x=>x) => { const t = a+b || 1; return `<div class="ts-cmp"><b>${fmt(a)}</b><div class="ts-bar"><i style="width:${a/t*100}%"></i><u style="width:${b/t*100}%"></u></div><b>${fmt(b)}</b><span>${l}</span></div>`; };
  const possA = Math.round(sum(m=>m.poss)/n);
  const leader = (title, arr, val) => `<div class="ts-lead"><h4>${title}</h4>${arr.length?arr.map((x,i)=>`<div class="ts-li"><span><i>${i+1}</i>${esc(short(x.n))}</span><b>${val(x)}</b></div>`).join(""):`<div class="mut">—</div>`}</div>`;
  const top = (f, filt=()=>true) => [...pls].filter(filt).sort((a,b)=>f(b)-f(a)).slice(0,3);
  const opTop = Object.entries(st.opg).sort((a,b)=>b[1]-a[1]).slice(0,3);
  return head + `
    ${form}
    ${star?`<div class="ts-star"><div class="ts-star-rt">${tsRt(tsAvg(star))}</div><div><div class="mut ts-star-l">⭐ ${T.single?"Maçın yıldızı":"Turnuvanın yıldızı"}</div><div class="ts-star-n">${esc(star.n)}</div>
      <div class="mut">${LABEL[star.role]||star.pos} · ${star.ap} maç · ${star.g} gol · ${star.a} asist${star.mom?` · ${star.mom}× maçın oyuncusu`:""}</div></div></div>`:""}
    <div class="ts-cmpbox"><div class="ts-cmph"><span>Biz</span><span>${T.single?esc(M[0].opp):"Rakipler"}</span></div>
      ${cmp("Gol", T.gf, T.ga)}${cmp("Şut", sum(m=>m.sh[0]), sum(m=>m.sh[1]))}${cmp("İsabetli şut", sum(m=>m.ot[0]), sum(m=>m.ot[1]))}
      ${cmp("Topa sahip olma", possA, 100-possA, x=>"%"+x)}${cmp("Sarı kart", sum(m=>m.y[0]), sum(m=>m.y[1]))}${cmp("Kırmızı kart", sum(m=>m.rd[0]), sum(m=>m.rd[1]))}</div>
    <div class="ts-leads">
      ${leader("⚽ Gol", top(x=>x.g*100+x.a, x=>x.g>0), x=>x.g)}
      ${leader("🅰️ Asist", top(x=>x.a*100+x.g, x=>x.a>0), x=>x.a)}
      ${leader("📈 Ortalama not", top(tsAvg, x=>x.ap>=Math.ceil(n/2)), x=>tsRt(tsAvg(x)))}
      ${T.single ? leader("🎯 Şut", top(x=>x.sh*10+x.ot, x=>x.sh>0), x=>`${x.ot}/${x.sh}`) : leader("🏅 Maçın oyuncusu", top(x=>x.mom*10+tsAvg(x), x=>x.mom>0), x=>x.mom+"×")}
    </div>
    ${opTop.length?`<div class="ts-opp mut">Sana gol atanlar: ${opTop.map(([k,v])=>{ const [nm,tm]=k.split("|"); return `<b>${esc(short(nm))}</b> (${esc(tm)}) ${v}`; }).join(" · ")}</div>`:`<div class="ts-opp mut">🧤 Kalende gol yok.</div>`}`;
}
// "Bu maç" sekmesi: son oynanan maçın karşılaştırması, maçın oyuncusu ve bizim oyuncuların notları (mevkiye göre)
function tsThis(T, m, i){
  const cmp = (l, a, b, fmt=x=>x) => { const t = a+b || 1; return `<div class="ts-cmp"><b>${fmt(a)}</b><div class="ts-bar"><i style="width:${a/t*100}%"></i><u style="width:${b/t*100}%"></u></div><b>${fmt(b)}</b><span>${l}</span></div>`; };
  const c = kitC(m.opp), mom = m.mom, pl = T.st.pl;
  const rows = Object.entries(m.rt).map(([nm,v])=>({nm, v, x:pl[nm]||{}})).sort((a,b)=>((tsLineOrd[a.x.pos]??9)-(tsLineOrd[b.x.pos]??9)) || b.v-a.v);
  return `<div class="ts-mh ts-this"><span class="ts-fm ${m.res}">${m.g1}-${m.g2}</span><span class="mut">${STAGES[i]||""}</span><span class="ts-mo"><span class="kit" style="--c1:${c[0]};--c2:${c[1]}"></span>${esc(m.season)} ${esc(m.opp)}</span></div>
    ${mom?`<div class="ts-star"><div class="ts-star-rt">${tsRt(m.rt[mom])}</div><div><div class="mut ts-star-l">🏅 Maçın oyuncusu</div><div class="ts-star-n">${esc(mom)}</div></div></div>`:""}
    <div class="ts-cmpbox"><div class="ts-cmph"><span>Biz</span><span>${esc(m.opp)}</span></div>
      ${cmp("Gol", m.g1, m.g2)}${cmp("Şut", m.sh[0], m.sh[1])}${cmp("İsabetli şut", m.ot[0], m.ot[1])}
      ${cmp("Topa sahip olma", m.poss, 100-m.poss, x=>"%"+x)}${cmp("Sarı kart", m.y[0], m.y[1])}${cmp("Kırmızı kart", m.rd[0], m.rd[1])}</div>
    <div class="ts-scroll"><table class="ts-tbl ts-pl"><tr><th>Mvk</th><th>Oyuncu</th><th>Not</th></tr>
      ${rows.map(r=>`<tr><td><span class="pos ${r.x.pos||""}">${LABEL[r.x.role]||r.x.pos||""}</span></td><td class="ts-nm">${esc(short(r.nm))}${r.nm===mom?" 🏅":""}</td><td>${tsRt(r.v)}</td></tr>`).join("")}</table></div>`;
}
function tsPlayers(T, pls){
  const keys = {pos:x=>-(tsLineOrd[x.pos]??9)*100 - x.st, n:x=>0, ap:x=>x.ap*1000+x.min, min:x=>x.min, g:x=>x.g*100+x.a, a:x=>x.a*100+x.g, sh:x=>x.sh*10+x.ot, ot:x=>x.ot, y:x=>x.y, r:x=>x.r, mom:x=>x.mom*10+tsAvg(x), rt:x=>tsAvg(x)};
  const list = TS_SORT==="n" ? [...pls].sort((a,b)=>a.n.localeCompare(b.n,"tr")) : [...pls].sort((a,b)=>keys[TS_SORT](b)-keys[TS_SORT](a));
  const th = (k,l,t="") => `<th class="${TS_SORT===k?"on":""}" ${t?`title="${t}"`:""} onclick="tsSort('${k}')">${l}</th>`;
  return `<div class="ts-scroll"><table class="ts-tbl ts-pl"><tr>${th("pos","Mvk","Mevki")}${th("n","Oyuncu")}${th("ap","M","Maç (ilk 11)")}${th("min","Dk","Dakika")}${th("g","G","Gol")}${th("a","A","Asist")}${th("sh","Şut")}${th("ot","İsb","İsabetli şut")}${th("y","🟨")}${th("r","🟥")}${th("mom","MO","Maçın oyuncusu")}${th("rt","Not","Ortalama not")}</tr>
    ${list.map(x=>`<tr><td><span class="pos ${x.pos}">${LABEL[x.role]||x.pos}</span></td><td class="ts-nm">${esc(short(x.n))}</td><td>${x.ap}${x.ap>x.st?` <span class="mut">(${x.st})</span>`:""}</td><td>${x.min}</td><td>${x.g||"–"}</td><td>${x.a||"–"}</td><td>${x.sh||"–"}</td><td>${x.ot||"–"}</td><td>${x.y||""}</td><td>${x.r||""}</td><td>${x.mom||""}</td><td>${tsRt(tsAvg(x))}</td></tr>`).join("")}</table></div>
    <p class="mut ts-note">Başlığa dokun, o sütuna göre sırala. Not 10 üzerinden: gol, asist, isabetli şut, kartlar, sonuç ve (defans/kaleci için) yenilen gole göre hesaplanır.</p>`;
}
function tsMatches(T, M){
  return `<div class="ts-mlist">${M.map((m,i)=>{ const c = kitC(m.opp), mom = m.mom;
    return `<div class="ts-m"><div class="ts-mh"><span class="ts-fm ${m.res}">${m.g1}-${m.g2}</span><span class="mut">${T.single?"Santra":STAGES[i]}</span><span class="ts-mo"><span class="kit" style="--c1:${c[0]};--c2:${c[1]}"></span>${esc(m.season)} ${esc(m.opp)}</span></div>
      <div class="ts-mrow"><span>Şut <b>${m.sh[0]}-${m.sh[1]}</b></span><span>İsabet <b>${m.ot[0]}-${m.ot[1]}</b></span><span>Kart <b>${m.y[0]+m.rd[0]}-${m.y[1]+m.rd[1]}</b></span>
      <span class="ts-pos">Topa sahip <div class="ts-bar"><i style="width:${m.poss}%"></i><u style="width:${100-m.poss}%"></u></div><b>%${m.poss}</b></span></div>
      ${mom?`<div class="ts-mom">🏅 Maçın oyuncusu: <b>${esc(short(mom))}</b> ${tsRt(m.rt[mom])}</div>`:""}
      <div class="ts-rts">${Object.entries(m.rt).sort((a,b)=>b[1]-a[1]).map(([nm,v])=>`<span>${esc(short(nm))} ${tsRt(v)}</span>`).join("")}</div></div>`; }).join("")}</div>`;
}
