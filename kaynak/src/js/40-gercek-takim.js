// ---------- gerçek takımla oyna ----------
// Bir sezonun gerçek kadrosunu seçersin; en iyi diziliş ve 11 otomatik kurulur, kalanlar yedeğe geçer.
// Rakipler zaten diğer sezonların gerçek kadroları. Sıralama: real/GÜN/anahtar (tek oyunculu gibi, günün en iyisi).
const REAL_BENCH = { GK:"BGK", DF:"BDF", MF:"BMF", FW:"BFW" };
const REAL_CACHE = {};
// Macar algoritması: n satır (slot) ≤ m sütun (oyuncu), toplam maliyeti en küçük atama; satır başına seçilen sütun döner
function hungarian(a){
  const n=a.length, m=a[0]?.length||0; if (!n || m<n) return null;
  const INF=1e18, u=new Array(n+1).fill(0), v=new Array(m+1).fill(0), p=new Array(m+1).fill(0), way=new Array(m+1).fill(0);
  for (let i=1;i<=n;i++){ p[0]=i; let j0=0; const minv=new Array(m+1).fill(INF), used=new Array(m+1).fill(false);
    do { used[j0]=true; const i0=p[j0]; let delta=INF, j1=0;
      for (let j=1;j<=m;j++) if (!used[j]){ const cur=a[i0-1][j-1]-u[i0]-v[j]; if (cur<minv[j]){ minv[j]=cur; way[j]=j0; } if (minv[j]<delta){ delta=minv[j]; j1=j; } }
      for (let j=0;j<=m;j++){ if (used[j]){ u[p[j]]+=delta; v[j]-=delta; } else minv[j]-=delta; }
      j0=j1; } while (p[j0]!==0);
    do { const j1=way[j0]; p[j0]=p[j1]; j0=j1; } while (j0); }
  const res=new Array(n); for (let j=1;j<=m;j++) if (p[j]) res[p[j]-1]=j-1; return res;
}
// slotlara oyuncu ataması: her slot doğal ya da yakın mevkiyle dolmalı (zorunlu yerleştirme yok); toplam efektif reyting en yüksek olan seçilir
function realAssign(t, form){
  const key = t.id+"|"+form; if (key in REAL_CACHE) return REAL_CACHE[key];
  const slots = FORMATIONS[form].map(x=>x[0]), ps = t.players;
  const sc = slots.map(s => ps.map(p => natural(p,s) ? p.r : (!roles(p).includes("GK") && s!=="GK" && roles(p).some(x=>NEAR[s].includes(x))) ? p.r-OFFPOS : null));
  const res = hungarian(sc.map(row=>row.map(v=>v==null?1e6:-v)));
  const ok = res && res.every((j,i)=>sc[i][j]!=null);
  const out = ok ? {v: res.reduce((a,j,i)=>a+sc[i][j],0), pick: res} : null;
  return (REAL_CACHE[key] = out ? {form, total:out.v, pick:out.pick, nat: out.pick.filter((j,i)=>natural(ps[j],slots[i])).length} : null);
}
function realBest(t){
  if (t.players.length < 11 || !t.players.some(p=>roles(p).includes("GK"))) return null;
  let best = null;
  for (const f of Object.keys(FORMATIONS)){ const a = realAssign(t, f); if (a && (!best || a.nat > best.nat || (a.nat===best.nat && a.total > best.total))) best = a; }
  return best;
}
const realOk = t => !!realBest(t);
const realLabel = () => { const t = findTeam(S.realId); return t ? `${t.season} ${t.team}` : ""; };
// Gerçek takım seçici: önce sezon, sonra o sezonun takımları (açılır listeler)
const RANKTXT = r => r===1 ? "Şampiyon" : r+".";
function realSeasons(){ return [GUNCEL.sezon+"*", ...[...new Set(POOL.filter(t=>!t.cur).map(t=>t.season))].sort().reverse()]; }
function realTeamsOf(sz){
  const pw = t => { const b = realBest(t); return b ? b.total : -1; };
  return sz.endsWith("*") ? CUR.slice().sort((a,b)=>pw(b)-pw(a)) : POOL.filter(t=>!t.cur && t.season===sz).sort((a,b)=>a.rank-b.rank);
}
function renderRealPicker(arg){
  navPush("real", () => renderRealPicker());
  S.sl = false; S.santraOn = false;
  if (arg && /^Güncel/.test(arg)) S.realSeason = GUNCEL.sezon+"*";
  const seasons = realSeasons();
  if (!seasons.includes(S.realSeason)) S.realSeason = seasons[0];
  const teams = realTeamsOf(S.realSeason);
  if (!teams.some(t=>t.id===S.realPick && realBest(t))) S.realPick = (teams.find(t=>realBest(t))||{}).id;
  const t = findTeam(S.realPick), bst = t && realBest(t), c = t ? kitC(t.team) : ["#888","#444"], coach = t && coachOf(t);
  $("play").innerHTML = `${topBar("")}
    <h1>🏟️ Gerçek takımla oyna</h1>
    <p class="mut">Bir sezonun gerçek kadrosunu seç, 7-0 yapabilecek misin?</p>
    <div class="card rl-pick">
      <label class="rl-lab">1 · Sezon
        <select id="rl-sz" onchange="S.realSeason=this.value;S.realPick=null;renderRealPicker()">${seasons.map(z=>`<option value="${z}" ${z===S.realSeason?"selected":""}>${z.endsWith("*")?z.slice(0,-1)+" · Güncel":z}</option>`).join("")}</select></label>
      <label class="rl-lab">2 · Takım
        <select id="rl-tm" onchange="S.realPick=this.value;renderRealPicker()">${teams.map(x=>{ const b = realBest(x); return `<option value="${esc(x.id)}" ${x.id===S.realPick?"selected":""} ${b?"":"disabled"}>${esc(x.team)} · ${x.cur?"":RANKTXT(x.rank)+" · "}${b?Math.round(b.total/11):"🔒"}</option>`; }).join("")}</select></label>
      ${t && bst ? `<div class="rl-prev"><span class="kit" style="--c1:${c[0]};--c2:${c[1]}"></span><span class="rl-n"><small class="rl-sz">${t.season}${t.cur?" · Güncel":" · "+RANKTXT(t.rank)}</small><b>${esc(t.team)}</b><small class="mut">${bst.form}${coach?" · TD: "+esc(coach):""}</small></span><span class="rl-pw">${Math.round(bst.total/11)}</span></div>
      <button class="btn gold rl-go" onclick="pickReal('${esc(t.id)}')">Bu takımla oyna ▶</button>` : `<p class="mut">Bu sezonda oynanabilir kadro yok.</p>`}
    </div>`;
  toTop();
}
function realFill(form){
  const t = findTeam(S.realId), a = realAssign(t, form); if (!a) return false;
  const meta = {team:t.team, season:t.season, key:t.id};
  S.form = form;
  S.slots = FORMATIONS[form].map(([pos,x,y],i)=>{ const p = t.players[a.pick[i]], pen = penaltyFor(p,pos);
    return {pos,x,y,p:{...p, r:p.r-pen, base:p.r, off:pen>0, forced:false, ...meta}}; });
  const used = new Set(a.pick.map(j=>t.players[j].n));
  S.bench = t.players.filter(p=>!used.has(p.n)).sort((x,y)=>y.r-x.r).slice(0, BENCH_SLOTS.length)
    .map(p=>({pos:REAL_BENCH[p.p[0]]||"BMF", p:{...p, base:p.r, ...meta}}));
  return true;
}
function pickReal(id){
  const t = findTeam(id); if (!t || !realOk(t)) return;
  S.mode = "real"; S.realId = id; S.challenge = null; S.almanac = false;
  S.seed = Math.floor(Math.random()*2e9); S.phase = "ready"; S.used = new Set(); S.drawn = new Set(); S.spent = 0; S.counted = false;
  realFill(realBest(t).form); bump("g"); renderReady();
}
function realSetForm(f){ if (realFill(f)) renderReady(); }
function realFormHTML(){
  const t = findTeam(S.realId); if (!t) return "";
  return `<div class="card rl-info"><b>🏟️ ${esc(realLabel())}</b>${coachOf(t)?` <span class="mut">· ${esc(coachOf(t))}</span>`:""}
    <h3 style="margin:10px 0 6px">Diziliş</h3>
    <div class="row">${Object.keys(FORMATIONS).map(f=>{ const a = realAssign(t,f); return a ? `<button class="chip ${f===S.form?"on":""}" onclick="realSetForm('${f}')">${f}</button>` : `<button class="chip" disabled title="Bu kadroyla kurulamıyor">${f}</button>`; }).join("")}</div>
    <h3 style="margin:12px 0 6px">Oyun tarzı</h3>
    <div class="row">${Object.entries(STYLES).map(([k,v])=>`<button class="chip ${k===S.style?"on":""}" onclick="S.style='${k}';renderReady()">${v.e} ${k}</button>`).join("")}</div>
    <div class="row" style="margin-top:12px"><button class="btn ghost" onclick="${S.santraOn?"renderSantra()":"renderRealPicker()"}">${S.santraOn?"Takımları değiştir":"Başka takım seç"}</button></div></div>`;
}
async function submitReal(entry, path){
  path = path || "real";
  if (myTeamBad() || badName(entry.name)) return null;
  try {
    const db = await fb(), key = nameKey(entry.name), ref = db.ref(path+"/"+todayKey()+"/"+key);
    const old = (await ref.once("value")).val();
    const better = !old || rankSort({...entry,t:0},{...old,t:0}) < 0;
    if (better) await ref.set({...entry, games:(old?.games||0)+1, t: TS()});
    else await ref.child("games").set((old.games||0)+1).catch(()=>{});
    store.set(path+"Id:"+todayKey(), key); return {key, better, old};
  } catch(e){ return null; }
}
