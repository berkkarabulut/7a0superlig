// ---------- turnuva: kadro, moral, ceza ----------
const penOf = (p,pos) => natural(p,pos) ? 0 : nearFit(p,pos) ? OFFPOS : FORCED;
const morB = (T,n) => Math.round(((T.mor[n]||0)*0.7)*10)/10;
const isOut = (T,n) => (T.outs[n]?.n||0) > 0;
const effR = (T,p,pos) => p.base - penOf(p,pos) + morB(T,p.n);
function lineup(T){
  return T.xi.filter(s=>s.p && !isOut(T,s.p.n)).map(s=>({...s.p, r: Math.round(effR(T,s.p,s.pos)), pos: LINE(s.pos), role: s.pos, off: penOf(s.p,s.pos)>0}));
}
function bestSub(T, pos, used){
  const c = T.bench.filter(p=>!isOut(T,p.n) && !(used&&used.has(p.n)));
  if (!c.length) return null;
  return c.sort((a,b)=>effR(T,b,pos)-effR(T,a,pos))[0];
}
function autoFix(T){
  const notes=[];
  for (const s of T.xi){ if (!s.p || !isOut(T,s.p.n)) continue;
    const o=s.p, why = T.outs[o.n].k==="susp" ? "cezalı" : "sakat", sub=bestSub(T,s.pos);
    if (sub){ T.bench.splice(T.bench.indexOf(sub),1,o); s.p=sub; notes.push(`${why==="cezalı"?"🟥":"🚑"} <b>${esc(o.n)}</b> ${why}, yerine <b>${esc(sub.n)}</b> (${NAME[s.pos]}) giriyor.`); }
    else notes.push(`${why==="cezalı"?"🟥":"🚑"} <b>${esc(o.n)}</b> ${why} ve yerine girecek yedek yok: bu maça 10 kişi çıkıyorsun.`); }
  return notes;
}
function startTournament(){
  RNG = S.seed!=null && S.mode!=="daily" ? seeded(S.seed*7+13) : Math.random;
  const xi = S.slots.map(s=>({pos:s.pos, x:s.x, y:s.y, p:{...s.p, r:s.p.base}}));
  const bench = (S.bench||[]).filter(s=>s.p).map(s=>({...s.p}));
  const others = shuffle(POOL); RNG = Math.random;
  const pots = [1,2,3].map(r=>others.filter(t=>t.rank===r));
  const gTeams = pots.map(p=>p[0]);
  const rest = others.filter(t=>!gTeams.includes(t));
  const group = gTeams.map(opp);
  const T = { xi, bench, orig: xi.map(s=>s.p.n), mor:{}, outs:{}, penOrder:null, style:S.style, group, pots, R:null, rest15: rest.slice(0,15), M:[], i:0, res:[], table:null, W:0,D:0,L:0,gf:0,ga:0, out:null, done:false };
  S.T = T;
  T.me = lineup(T); T.mePw = teamPower(T.me, T.style);
  const tbl = {}; [myName(), ...group.map(g=>g.name)].forEach(n=>tbl[n]={n,O:0,G:0,B:0,M:0,A:0,Y:0,P:0});
  T.table = tbl;
  T.others = [[1,2],[0,2],[0,1]].map(([a,b])=>{ const x=group[a],y=group[b]; const r=simGoals(x.pw,y.pw,x.pl,y.pl); return {a:x.name,b:y.name,g1:r.g1,g2:r.g2}; });
  drawCeremony("Grup kurası", "Her torbadan bir takım senin grubuna düşecek. Topları tek tek çek ya da kurayı atla.",
    group.map((g,i)=>({label:`${i+1}. Torba · ${["Şampiyonlar","İkinciler","Üçüncüler"][i]}`, pool:pots[i], res:g.t})),
    "Grup maçlarına geç", () => preMatch());
}
function setupR16(){
  const T=S.T, ME={ name:myName(), me:true, pw:T.mePw, pl:T.me };
  T.R=[[ME, ...T.rest15.map(opp)]];
}
function nextStep(){
  const T=S.T;
  if (T.i===3 && !T.R){ setupR16(); const R=T.R[0];
    drawCeremony("Son 16 kurası", "Grubu geçtin! Şimdi eleme turu rakibin belli oluyor.",
      [{label:"Senin rakibin", pool:T.rest15, res:R[1].t, big:true}, ...[1,2,3,4,5,6,7].map(j=>({label:`${j+1}. eşleşme`, pool:T.rest15, res:[R[2*j].t,R[2*j+1].t]}))],
      "Son 16 maçına geç", () => preMatch());
    return; }
  preMatch();
}
