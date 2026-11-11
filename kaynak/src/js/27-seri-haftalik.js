// ---------- günlük seri ----------
function streak(){ const s = store.get("streak", {last:null, n:0, best:0}); const t=todayKey(), y=dayKeyOffset(-1);
  return { ...s, alive: s.last===t || s.last===y, today: s.last===t }; }
function bumpStreak(){
  const s = store.get("streak", {last:null, n:0, best:0}), t=todayKey(), y=dayKeyOffset(-1);
  if (s.last===t) return s;
  s.n = s.last===y ? s.n+1 : 1; s.last = t; s.best = Math.max(s.best||0, s.n);
  store.set("streak", s); return s;
}
function streakHTML(){
  const s = streak(); if (!s.n || !s.alive) return `<span class="streak streak-cold">🔥 Seri başlat: her gün meydan okumayı oyna</span>`;
  return `<span class="streak">🔥 ${s.n} gün seri${s.today?" ✓":` · <b>bugün oynamazsan bozulur!</b>`}</span>`;
}

// ---------- haftalık lig (meydan okuma galibiyetlerinin toplamı) ----------
function weekDays(){ const d=new Date(), wd=(d.getDay()+6)%7; return [...Array(wd+1)].map((_,i)=>dayKeyOffset(-wd+i)); }
async function weekTable(){
  const db = await fb(), days = weekDays(), agg = {};
  const snaps = await Promise.all(days.map(d => db.ref("daily/"+d).once("value")));
  snaps.forEach((s,i) => Object.values(s.val()||{}).forEach(r => { if (badName(r.name||"")) return; const k=nameKey(r.name||"?");
    const a = agg[k] || (agg[k] = {name:r.name, w:0, gf:0, ga:0, n:0, days:{}});
    if (a.days[days[i]]) return; a.days[days[i]]=1; a.w+=r.w||0; a.gf+=r.gf||0; a.ga+=r.ga||0; a.n++; }));
  return Object.values(agg).sort((a,b)=>b.w-a.w || (b.gf-b.ga)-(a.gf-a.ga) || b.gf-a.gf || b.n-a.n);
}
async function renderWeek(){
  S.rankMode="week";
  $("rank").innerHTML = `<h1>Haftalık lig</h1>
    <div class="row" style="margin:10px 0 16px">${Object.entries(MODES).map(([k,v])=>`<button class="chip ${k==="week"?"on":""}" onclick="renderRank('${todayKey()}','${k}')">${v.icon} ${v.title}</button>`).join("")}</div>
    <div class="card" id="rankbox"><p class="mut">Yükleniyor…</p></div>
    <p class="mut" style="font-size:13px">Bu haftanın (pazartesiden bugüne) Günün Meydan Okuması galibiyetleri toplanır. Her gün oynayan öne geçer. Pazar gecesi tablonun lideri haftanın şampiyonu olur.</p>`;
  try { const rows = await weekTable(), me = nameKey(myName());
    $("rankbox").innerHTML = rows.length ? `${rows[0]?`<div class="weekking">👑 Haftanın lideri: <b>${esc(rows[0].name)}</b> · ${rows[0].w} galibiyet</div>`:""}
      <div style="overflow-x:auto"><table><tr><th>#</th><th>Takım</th><th>Galibiyet</th><th>Gün</th><th>A-Y</th></tr>${rows.map((r,i)=>`<tr class="${nameKey(r.name)===me?"me":""}"><td>${i+1}</td><td>${i===0?"👑 ":""}${esc(r.name)}</td><td><b>${r.w}</b></td><td>${r.n}/7</td><td>${r.gf}-${r.ga}</td></tr>`).join("")}</table></div>`
      : `<p class="mut">Bu hafta henüz kimse meydan okumayı oynamadı.</p>`;
  } catch(e){ $("rankbox").innerHTML = `<p class="mut">Sıralamaya şu an ulaşılamıyor.</p>`; }
}
