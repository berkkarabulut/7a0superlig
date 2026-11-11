// ---------- yardımcılar ----------
let RNG = Math.random;
function seeded(seed){ let s = seed>>>0; return () => { s = (s + 0x6D2B79F5)>>>0; let t = s; t = Math.imul(t ^ t>>>15, t|1); t ^= t + Math.imul(t ^ t>>>7, t|61); return ((t ^ t>>>14)>>>0)/4294967296; }; }
const rnd = a => a[Math.floor(RNG()*a.length)];
const shuffle = a => { a=[...a]; for(let i=a.length-1;i>0;i--){const j=Math.floor(RNG()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
const avg = a => a.length ? a.reduce((x,y)=>x+y,0)/a.length : 70;
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const short = n => { const p=n.split(" "); return p.length>1 ? p[0][0]+". "+p.slice(1).join(" ") : n; };
const price = r => Math.max(1, Math.round(((r-75)**2)/25));
const todayKey = () => { const d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); };
const store = {
  get(k,def){ try{ const v=localStorage.getItem("sl70:"+k); return v?JSON.parse(v):def; }catch(e){ return def; } },
  set(k,v){ try{ localStorage.setItem("sl70:"+k, JSON.stringify(v)); }catch(e){} }
};
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const $ = id => document.getElementById(id);

function show(id){
  for (const s of ["play","rank","squads","profile","ach","how"]) { $(s).classList.toggle("hidden", s!==id); $("n-"+s).classList.toggle("on", s===id); }
  if (id==="squads") renderSquads();
  if (id==="rank") renderRank(todayKey(), S.mode==="solo"?"solo":"daily");
  if (id==="ach") renderAch();
  if (id==="profile") renderProfile();
  if (id==="how") renderHow();
}

