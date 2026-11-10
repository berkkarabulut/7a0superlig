// ---------- simülasyon ----------
function poisson(l){ let L=Math.exp(-l),k=0,p=1; do{k++;p*=Math.random();}while(p>L); return k-1; }
function scorer(pl){
  const w = pl.map(p=>({FW:5,MF:2.4,DF:0.7,GK:0}[p.pos]??1)*Math.max(1,p.r-60));
  let r = Math.random()*w.reduce((a,b)=>a+b,0);
  for (let i=0;i<pl.length;i++){ r-=w[i]; if(r<=0) return pl[i]; }
  return pl[0];
}
const lam = (att,def) => { const d=att-def, k=d/9 + Math.sign(d)*Math.max(0,Math.abs(d)-6)*0.03; return Math.max(0.2, Math.min(2.7, 1.08*Math.exp(k))); };
function simGoals(A,B,pa,pb){
  const g1 = poisson(lam(A.att,B.def)), g2 = poisson(lam(B.att,A.def));
  const ev = [...Array(g1)].map(()=>({m:1+Math.floor(Math.random()*90),side:0,p:scorer(pa)}))
     .concat([...Array(g2)].map(()=>({m:1+Math.floor(Math.random()*90),side:1,p:scorer(pb)})));
  ev.sort((a,b)=>a.m-b.m); return {g1,g2,ev};
}
const TXT = {
  goal:["GOL! {p} ağları sarstı","GOL! {p} fileleri havalandırdı","GOL! {p} kaleciyi avladı","GOL! {p} topu köşeye gönderdi"],
  post:["{p} şutunu çekti, top direkten döndü","{p} vurdu, top üst direkte patladı"],
  save:["{gk} kurtardı! {p} vuruşunda kaleciyi geçemedi","{p} karşı karşıya kaldı, {gk} geçit vermedi","{gk} uçtu, {p} şutunu kornere çeldi"],
  wide:["{p} kafayı vurdu, top az farkla auta","{p} uzaktan denedi, top dışarıda","{p} vole vurdu, top yandan auta"],
  penG:["Penaltı! {p} topun başında… GOL!"], penS:["Penaltı! {gk} kurtardı, {p} gol atamadı"], penM:["Penaltı! {p} topu auta attı"],
  y:["Hakem {ref} sarı kartını çıkardı: {p}","{p} sert girdi, {ref} sarı kartı gösterdi","{ref} itirazdan dolayı {p}'ye sarı kart gösterdi"],
  yr:["{ref} ikinci sarıyı gösterdi, ardından kırmızı! {p} oyundan atıldı, takımı 10 kişi"], r:["Direkt kırmızı! {ref} hiç düşünmedi, {p} oyundan atıldı"],
  flow:["{p} sol kanattan bindirdi, orta kesildi","{p} ceza sahası önünde faul yaptırdı","{t} topu ayağında tutuyor, pas trafiği artıyor","{p} uzun topla arkaya sarktı ama ofsayt","{p} topu kornere gönderdi","Orta sahada sert ikili mücadeleler, {ref} oyunu akıttı","{p} çalımla birini geçti, ikincisine takıldı","{p} kafayla indirdi, savunma uzaklaştırdı","{t} baskıyı artırdı"],
  injO:["{p} sakatlandı, yerine yedek oyuncu girdi"], injS:["{p} sakatlandı, oyuna devam edemiyor. 🔁 Yerine {q} girdi"], injN:["{p} sakatlandı, değişiklik yapılamıyor, takım 10 kişi"]
};
Object.assign(TXT, {
  "g_Kontra atak":["Hızlı çıktılar! 3'e 2 yakaladılar, {p} bitirdi: GOL!","Kontra! Top 3 pasta öbür kaleye gitti, {p} affetmedi: GOL!"],
  "g_Kanat oyunu":["Kanattan ortayı yaptılar, {p} kafayı vurdu: GOL!","Bek bindirdi, ortaya çevirdi, {p} tamamladı: GOL!"],
  "g_Uzun top":["Uzun top, {p} savunmanın arkasına sarktı… GOL!","Kaleci uzun vurdu, indirme, {p} vurdu: GOL!"],
  "g_Topa sahip ol":["Pas pas pas… 20 paslık atağın sonunda {p}: GOL!","Tiki-taka! {p} son vuruşu yaptı: GOL!"],
  "g_Önde baskı":["Önde bastılar, top kapıldı, {p} affetmedi: GOL!","Baskı meyvesini verdi! {p} hatayı cezalandırdı: GOL!"],
  "g_Otobüsü çek":["Duran top! {p} kafayı vurdu: GOL!","Tek pozisyon, tek gol: {p}!"],
  "f_Önde baskı":["{t} rakibi kendi yarı sahasına hapsetti","{p} rakip stopere bastı, top taca"],
  "f_Topa sahip ol":["{t} topu kendi arasında dolaştırıyor, rakip topa dokunamıyor","{p} geriye pasla oyunu yeniden kurdu"],
  "f_Kontra atak":["{t} geride bekliyor, kontra fırsatı kolluyor","{p} hızlı çıktı ama son pas olmadı"],
  "f_Kanat oyunu":["{p} kanattan ortaladı, kaleci kurtardı","{t} sürekli kanatlardan yükleniyor"],
  "f_Uzun top":["{t} uzun toplarla oynuyor, {p} hava topunu kazandı","{p} uzun topu göğsüyle yumuşattı"],
  "f_Otobüsü çek":["{t} 11 kişi kendi yarı sahasında, otobüs park halinde","{p} topu tribüne gönderdi, rahatlama"],
  tired:["{t} yoruldu, baskının dozu düştü","{t} ayakta zor duruyor, önde basmayı bıraktı"]
});
TXT.penG=["{ref} beyaz noktayı gösterdi! {p} topun başında… GOL!"]; TXT.penS=["Penaltı! {gk} kurtardı, {p} gol atamadı"]; TXT.penM=["{ref} penaltı verdi, {p} topu auta attı"];
const fill = (k, o) => rnd(TXT[k]).replace("{p}", o.p?short(o.p.n):"").replace("{gk}", o.gk?short(o.gk.n):"kaleci").replace(/\{ref\}/g, o.ref||"Hakem").replace("{q}", o.q?short(o.q.n):"").replace("{t}", o.t||"");
function wpick(list, wf){ const w=list.map(wf), s=w.reduce((a,b)=>a+b,0); let r=Math.random()*s; for(let i=0;i<list.length;i++){ r-=w[i]; if(r<=0) return list[i]; } return list[0]; }
function makeMatch(A,B,pa,pb,o={}){
  const pl=[pa.slice(),pb.slice()], ev=[], g=[0,0], red=[o.startRed||0,0], yel=[{},{}], out=[new Set(),new Set()], adj=[0,0], reds=[], injs=[], subs=[];
  const ref=o.ref||"Hakem", sty=[A.style||"Dengeli", B.style||"Dengeli"], ment=[{att:0,def:0},{att:0,def:0}], tired=[false,false], tn=[o.myName||"", o.oppName||""]; let nsub=0;
  const av = s => pl[s].filter(p=>!out[s].has(p.n));
  const gk = s => av(s).find(p=>p.pos==="GK") || {n:"Kaleci",r:65,pos:"GK"};
  const shooter = s => wpick(av(s).filter(p=>p.pos!=="GK"), p=>({FW:5,MF:2.4,DF:0.7}[p.pos]||1)*Math.max(1,p.r-60));
  const booker = s => wpick(av(s), p=>({DF:3,MF:2.5,FW:1,GK:0.15}[p.pos]||1));
  const taker = s => { if (s===0 && o.penOrder){ const n=o.penOrder.find(n=>av(0).some(p=>p.n===n)); if(n) return av(0).find(p=>p.n===n); }
    return wpick(av(s).filter(q=>q.pos!=="GK"),q=>({FW:4,MF:2,DF:.5}[q.pos]||1)*q.r); };
  const T = (k,x) => fill(k,{...x,ref});
  const late = (s,m) => STYLES[sty[s]]?.late && m>60 ? 2 : 0;
  const attOf = (s,m) => (s?B.att:A.att)+adj[s]+ment[s].att+ctrOf(sty[s],sty[1-s])-late(s,m);
  const defOf = (s,m) => (s?B.def:A.def)+adj[s]+ment[s].def-late(s,m);
  const step = (m, mult) => { for (const s of [0,1]) { const o2=1-s;
      if (m===61 && STYLES[sty[s]]?.late && !tired[s]){ tired[s]=true; ev.push({m,side:s,type:"flow",text:T("tired",{t:tn[s]})}); }
      const f = Math.pow(0.65,red[s]) * Math.pow(1.3,red[o2]) * mult, lead = g[s]-g[o2];
      const pg = lam(attOf(s,m), defOf(o2,m))*f/90*0.92 * (lead>=4?0.35:lead>=3?0.55:1);
      const x = Math.random();
      if (x < pg){ const p=shooter(s), k=TXT["g_"+sty[s]]&&Math.random()<.5?"g_"+sty[s]:"goal"; g[s]++; ev.push({m,side:s,type:"goal",p,text:T(k,{p})}); }
      else if (x < pg*2.3){ const p=shooter(s), k=rnd(["save","save","post","wide","wide"]); ev.push({m,side:s,type:k,p,text:T(k,{p,gk:gk(o2)})}); }
      else if (Math.random() < 0.05){ const p=shooter(s), k=TXT["f_"+sty[s]]&&Math.random()<.4?"f_"+sty[s]:"flow"; ev.push({m,side:s,type:"flow",p,text:T(k,{p,t:tn[s]})}); }
      if (Math.random() < 0.11/90*f){ const p=taker(s), k=gk(o2), y=Math.random();
        if (y < 0.76+(p.r-k.r)/250){ g[s]++; ev.push({m,side:s,type:"goal",pen:true,p,text:T("penG",{p})}); }
        else if (y < 0.93){ ev.push({m,side:s,type:"penS",p,text:T("penS",{p,gk:k})}); }
        else ev.push({m,side:s,type:"penM",p,text:T("penM",{p})}); }
      if (Math.random() < 1.8/90){ const p=booker(s);
        if (yel[s][p.n]){ if (Math.random()<0.18){ out[s].add(p.n); red[s]++; if(!s) reds.push(p.n); ev.push({m,side:s,type:"red",p,text:T("yr",{p})}); } }
        else { yel[s][p.n]=1; ev.push({m,side:s,type:"yellow",p,text:T("y",{p})}); } }
      if (Math.random() < 0.012/90){ const p=booker(s); if(!out[s].has(p.n)){ out[s].add(p.n); red[s]++; if(!s) reds.push(p.n); ev.push({m,side:s,type:"red",p,text:T("r",{p})}); } }
      if (Math.random() < 0.12/90){ const p=wpick(av(s), q=>q.pos==="GK"?0.3:1);
        if (s===1){ ev.push({m,side:s,type:"inj",p,text:T("injO",{p})}); }
        else { out[0].add(p.n); injs.push(p.n);
          const sub = nsub<MAXSUBS && o.pickSub ? o.pickSub(p.role, new Set(pl[0].map(q=>q.n))) : null;
          if (sub){ nsub++; pl[0].push(sub); adj[0]+=(sub.r-p.r)/11; subs.push({out:p,in:sub}); ev.push({m,side:0,type:"inj",p,text:T("injS",{p,q:sub})}); }
          else { red[0]++; ev.push({m,side:0,type:"inj",p,text:T("injN",{p})}); } } }
  } };
  return {
    ev, g, pl, subs,
    run(m0,m1,mult=1){ for (let m=m0;m<=m1;m++) step(m,mult); },
    onPitch: () => av(0),
    subsLeft: () => MAXSUBS-nsub,
    sub(outP, inP, m){ if (nsub>=MAXSUBS || out[0].has(outP.n)) return false; nsub++; out[0].add(outP.n); pl[0].push(inP); adj[0]+=(inP.r-outP.r)/11; subs.push({out:outP,in:inP});
      ev.push({m,side:0,type:"sub",p:inP,text:`🔁 Değişiklik: ${short(outP.n)} çıktı, ${short(inP.n)} girdi`}); return true; },
    setTactic(style, mentality){ if (style && style!==sty[0]){ sty[0]=style; A={...teamPower(av(0),style)}; adj[0]=0; } if (mentality) ment[0]=mentality; },
    result(et){ return { g1:g[0], g2:g[1], ev, et, len: et?120:90, red, reds, injs, subs, onPitch: av(0) }; }
  };
}
function matchEngine(A,B,pa,pb,ko,o={}){
  const M = makeMatch(A,B,pa,pb,o); M.run(1,90); let et=false;
  if (ko && M.g[0]===M.g[1]){ et=true; M.run(91,120,0.85); }
  return M.result(et);
}
function penalties(gkA,gkB){
  const pA=0.75+(gkA-gkB)/300, pB=0.75+(gkB-gkA)/300; let a=0,b=0;
  for(let i=0;i<5;i++){ if(Math.random()<pA)a++; if(Math.random()<pB)b++; }
  while(a===b){ if(Math.random()<pA)a++; if(Math.random()<pB)b++; }
  return [a,b];
}
function kickOrder(pl){
  const w = p => ({FW:3,MF:2,DF:1,GK:0}[p.pos]??1)*100 + p.r;
  const out = pl.filter(p=>p.pos!=="GK").sort((a,b)=>w(b)-w(a));
  return out.concat(pl.filter(p=>p.pos==="GK"));
}
function shootout(plA, plB, orderA){
  const gkA = plA.find(p=>p.pos==="GK")?.r||75, gkB = plB.find(p=>p.pos==="GK")?.r||75;
  let oA = kickOrder(plA);
  if (orderA && orderA.length){ const first = orderA.map(n=>plA.find(p=>p.n===n)).filter(Boolean); oA = first.concat(oA.filter(p=>!first.includes(p))); }
  const oB = kickOrder(plB), kicks=[]; let a=0,b=0,ta=0,tb=0;
  const prob = (k,gk) => Math.max(0.55, Math.min(0.92, 0.76 + (k.r-gk)/200));
  for (let round=0; round<30; round++){
    const ka = oA[round % oA.length], ga = Math.random() < prob(ka,gkB); if(ga)a++; ta++;
    kicks.push({side:0,p:ka,goal:ga,a,b,save: !ga && Math.random()<0.6});
    if (round<5 && (a > b + (5-tb) || b > a + (5-ta))) break;
    const kb = oB[round % oB.length], gb = Math.random() < prob(kb,gkA); if(gb)b++; tb++;
    kicks.push({side:1,p:kb,goal:gb,a,b,save: !gb && Math.random()<0.6});
    if (round<5 && (a > b + (5-ta) || b > a + (5-tb))) break;
    if (round>=4 && a!==b) break;
  }
  return {a,b,kicks};
}
function opp(t){ const pl=oppPlayers(t), st=oppStyle(t); return {name:t.season+" "+t.team, t, pl, pw:teamPower(pl,st)}; }

function addTbl(n,gf,ga){ const r=S.T.table[n]; r.O++; r.A+=gf; r.Y+=ga; if(gf>ga){r.G++;r.P+=3}else if(gf===ga){r.B++;r.P+=1}else r.M++; }
function sortedTable(){ return Object.values(S.T.table).sort((a,b)=>b.P-a.P||(b.A-b.Y)-(a.A-a.Y)||b.A-a.A); }

function pathHTML(){
  const T=S.T; return `<div class="path">${STAGES.map((s,i)=>`<span class="${i<T.res.length?T.res[i].res:(i===T.i&&!T.done?"cur":"")}">${s}${i<T.res.length?` ${T.res[i].g1}-${T.res[i].g2}`:""}</span>`).join("")}</div>`;
}
function tableHTML(){
  return `<table><tr><th>Grup</th><th>O</th><th>G</th><th>B</th><th>M</th><th>A</th><th>Y</th><th>P</th></tr>${sortedTable().map(r=>`<tr class="${r.n===myName()?"me":""}"><td>${esc(r.n)}</td><td>${r.O}</td><td>${r.G}</td><td>${r.B}</td><td>${r.M}</td><td>${r.A}</td><td>${r.Y}</td><td>${r.P}</td></tr>`).join("")}</table>`;
}
