const h=require('fs').readFileSync((process.env.HTML||require('path').join(__dirname,'../../index.html')),'utf8');let s=h.split('<script>')[1].split('</script>')[0];
const els={};const mk=()=>({innerHTML:'',textContent:'',style:{},classList:{toggle(){},add(){},remove(){}},insertAdjacentHTML(){},scrollIntoView(){}});
global.document={getElementById:id=>els[id]||(els[id]=mk()),querySelectorAll:()=>[]};global.localStorage={_:{},getItem(k){return this._[k]||null},setItem(k,v){this._[k]=v}};global.window={innerWidth:1200,scrollTo(){}};
eval(s+`;choosePens=async a=>kickOrder(a).slice(0,5).map(p=>p.n);
(async()=>{let N=600,ms=0,goals=0,big=0,tot7=0,grp=0,champ=0,seven=0,margins={}; const ex=[];
for(let g=0;g<N;g++){ S.style=Object.keys(STYLES)[g%7];S.form=Object.keys(FORMATIONS)[g%9]; startDraft();let k=0;
 while(S.phase==="xi"&&k++<80){let i=S.cur.players.findIndex(p=>canPick(p)&&openSlots().some(z=>natural(p,z.pos)));if(i<0){roll();continue}pick(i);place(curSlots().findIndex(z=>!z.p&&natural(S.cur.players[i],z.pos)))}
 k=0; while(S.phase==="bench"&&k++<80){ let i=S.cur.players.findIndex(p=>canPick(p)&&openSlots().some(z=>natural(p,z.pos))); if(i<0){ if(S.rerolls>0){reroll();continue} skipBench(); break;} pick(i); }
 if(S.phase==="bench"&&S.bench.some(z=>!z.p)) skipBench(); S.speed="Anında";startTournament(); preMatch(); if(mustFix(S.T)) autoFixMiss();
 while(!S.T.out&&S.T.i<7){ const before=S.T.mePw; await runMatch(); const r=S.T.res.at(-1); ms++; goals+=r.g1+r.g2; const mg=Math.abs(r.g1-r.g2); margins[mg]=(margins[mg]||0)+1; if(r.g1+r.g2>=7) tot7++; if(mg>=5) {big++; if(ex.length<5) ex.push(r.g1+"-"+r.g2+" "+r.opp);} if(S.T.out||S.T.i>=7) break; if(S.T.i===3&&!S.T.R) setupR16(); preMatch(); if(mustFix(S.T)) autoFixMiss(); }
 const T=S.T; if(!/Grupta/.test(T.out||"")) grp++; if(!T.out) champ++; if(T.res.filter(r=>r.res==="W").length===7) seven++; }
console.log("gol/maç",(goals/ms).toFixed(2),"7+ gollü maç %"+(tot7/ms*100).toFixed(1),"5+ fark %"+(big/ms*100).toFixed(1),"fark dağılımı",JSON.stringify(margins));
console.log("gruptan çıkma %"+(grp/N*100).toFixed(1),"şampiyon %"+(champ/N*100).toFixed(1),"7-0 %"+(seven/N*100).toFixed(1), ex.join(" | "));})();`);
