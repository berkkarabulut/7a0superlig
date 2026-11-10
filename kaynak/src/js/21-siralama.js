// ---------- günlük sıralama ----------
const rankSort = (a,b) => b.w-a.w || (b.gf-b.ga)-(a.gf-a.ga) || b.gf-a.gf || a.spent-b.spent || a.t-b.t;
let LB = {};
const MODES = { daily:{path:"daily", title:"Günün Meydan Okuması", short:"Meydan"}, solo:{path:"solo", title:"Tek oyunculu", short:"Tek"} };
const rowsOf = v => Object.entries(v||{}).map(([id,x])=>({id,...x})).sort(rankSort);
function watchLeader(){
  fb().then(db => { for (const m of ["daily","solo"]) db.ref(MODES[m].path+"/"+todayKey()).on("value", s => {
    LB[m+":"+todayKey()] = rowsOf(s.val()); paintLeader();
    if (!$("rank").classList.contains("hidden") && (S.rankDay||todayKey())===todayKey()) renderRank(todayKey(), S.rankMode||"daily");
  }); }).catch(()=>{});
}
function paintLeader(){
  const d=LB["daily:"+todayKey()]||[], s=LB["solo:"+todayKey()]||[], el=$("leader"), parts=[];
  if (d.length) parts.push(`<span class="mut">Meydan:</span> ${esc(d[0].name)} <b>${d[0].w}-${7-d[0].w}</b>`);
  if (s.length) parts.push(`<span class="mut">Tek:</span> ${esc(s[0].name)} <b>${s[0].w}-${7-s[0].w}</b>`);
  el.innerHTML = parts.length ? "👑 "+parts.join(" · ") : ""; el.classList.toggle("hidden", !parts.length);
}
async function submitSolo(entry){
  try {
    const db = await fb(), key = nameKey(entry.name), ref = db.ref("solo/"+todayKey()+"/"+key);
    const old = (await ref.once("value")).val();
    const better = !old || rankSort({...entry,t:0},{...old,t:0}) < 0;
    if (better) await ref.set({...entry, games:(old?.games||0)+1, t: TS()});
    else await ref.child("games").set((old.games||0)+1).catch(()=>{});
    store.set("soloId:"+todayKey(), key); return {key, better, old};
  } catch(e){ return null; }
}
async function submitDaily(entry){
  try {
    const db = await fb(), ref = db.ref("daily/"+todayKey()).push();
    await ref.set({...entry, t: TS()}); store.set("dailyId:"+todayKey(), ref.key); return ref.key;
  } catch(e){ return null; }
}
function dayKeyOffset(d){ const x=new Date(); x.setDate(x.getDate()+d); return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0"); }
async function renderRank(day, mode){
  mode = mode || S.rankMode || "daily"; S.rankDay = day; S.rankMode = mode; const today=todayKey(), yest=dayKeyOffset(-1), M=MODES[mode];
  $("rank").innerHTML = `<h1>Günün sıralaması</h1>
    <div class="row" style="margin:10px 0 6px">${Object.entries(MODES).map(([k,v])=>`<button class="chip ${k===mode?"on":""}" onclick="renderRank('${day}','${k}')">${k==="daily"?"🗓️":"🎮"} ${v.title}</button>`).join("")}</div>
    <div class="row" style="margin:6px 0 16px"><button class="chip ${day===today?"on":""}" onclick="renderRank('${today}','${mode}')">Bugün</button><button class="chip ${day===yest?"on":""}" onclick="renderRank('${yest}','${mode}')">Dün</button></div>
    <div class="card" id="rankbox"><p class="mut">Yükleniyor…</p></div>
    <p class="mut" style="font-size:13px">${mode==="daily"
      ? "Meydan okumada herkes aynı takımlarla ve aynı bütçeyle oynar. Günde sadece ilk oyun sayılır. Sıralama: galibiyet sayısı, averaj, atılan gol, sonra harcanan bütçe (az olan önde)."
      : "Tek oyunculuda istediğin kadar oynarsın, tabloya her takımın günün en iyi sonucu yazılır. Sıralama: galibiyet sayısı, averaj, atılan gol."}</p>`;
  try {
    const db = await fb(); let rows = LB[mode+":"+day];
    if (!rows || day!==today){ rows = rowsOf((await db.ref(M.path+"/"+day).once("value")).val()); LB[mode+":"+day]=rows; }
    const mine = store.get((mode==="daily"?"dailyId:":"soloId:")+day, null);
    $("rankbox").innerHTML = rows.length ? `<div style="overflow-x:auto"><table><tr><th>#</th><th>Takım</th><th>Sonuç</th><th>A-Y</th>${mode==="daily"?"<th>Bütçe</th>":"<th>Oyun</th>"}<th>Genel</th></tr>${rows.map((r,i)=>`<tr class="${r.id===mine?"me":""}"><td>${i===0?"👑":i+1}</td><td>${esc(r.name)}</td><td><b>${r.w}-${7-r.w}</b> <small class="mut">${esc(r.res||"")}</small></td><td>${r.gf}-${r.ga}</td><td>${mode==="daily"?r.spent+" M":(r.games||1)}</td><td>${r.ovr}</td></tr>`).join("")}</table></div>`
      : `<p class="mut">${day===today?"Bugün henüz kimse oynamadı. İlk sen ol!":"O gün kimse oynamamış."}</p>`;
  } catch(e){ $("rankbox").innerHTML = `<p class="mut">Sıralamaya şu an ulaşılamıyor. İnternet bağlantını kontrol et.</p>`; }
}
