const h=require('fs').readFileSync((process.env.HTML||require('path').join(__dirname,'../../index.html')),'utf8');let s=h.split('<script>')[1].split('</script>')[0];
const els={};const mk=()=>({innerHTML:'',textContent:'',style:{},classList:{toggle(){},add(){},remove(){}},insertAdjacentHTML(){},scrollIntoView(){}});
global.document={getElementById:id=>els[id]||(els[id]=mk()),querySelectorAll:()=>[]};global.localStorage={_:{},getItem(k){return this._[k]||null},setItem(k,v){this._[k]=v}};global.window={innerWidth:1200,scrollTo(){}};
eval(s+`;choosePens=async a=>kickOrder(a).slice(0,5).map(p=>p.n);
(async()=>{let stats={},errs=0,benchFull=0,subs=0,susp=0,inj=0,ten=0,talks=0,games=300,goals=0,ms=0,flows=0;
for(let g=0;g<games;g++){try{startDraft();let k=0;
 while(S.phase==="xi"&&k++<80){let i=S.cur.players.findIndex(p=>canPick(p)&&openSlots().some(z=>natural(p,z.pos)));if(i<0){roll();continue}pick(i);place(curSlots().findIndex(z=>!z.p&&natural(S.cur.players[i],z.pos)))}
 k=0; while(S.phase==="bench"&&k++<80){ let i=S.cur.players.findIndex(p=>canPick(p)&&openSlots().some(z=>natural(p,z.pos))); if(i<0){ if(S.rerolls>0){reroll();continue} skipBench(); break;} pick(i); }
 if(S.phase==="bench") skipBench(); if(S.bench.length===7&&S.bench.every(z=>z.p)) benchFull++;
 if(new Set([...S.slots,...S.bench].map(z=>z.p.n)).size!==S.slots.length+S.bench.length) throw "tekrar eden oyuncu";
 S.speed="Anında";startTournament();
 if(S.T.group.map(x=>x.t.rank).join()!=="1,2,3") throw "torba hatası";
 preMatch();
 while(!S.T.out&&S.T.i<7){ if(Math.random()<.7){doTalk(Math.floor(Math.random()*4));talks++}
   ten+= lineup(S.T).length<11?1:0;
   await runMatch(); ms++; const r=S.T.res.at(-1); goals+=r.g1+r.g2;
   susp+=Object.values(S.T.outs).filter(o=>o.k==="susp").length; inj+=Object.values(S.T.outs).filter(o=>o.k==="inj").length;
   if(S.T.out||S.T.i>=7) break;
   if(S.T.i===3&&!S.T.R) setupR16(); preMatch(); }
 finish(); const T=S.T; stats[T.out||"şampiyon"]=(stats[T.out||"şampiyon"]||0)+1;
 if(T.res.length>3){ if(!T.champ) throw "şampiyon yok"; if(!T.out && !T.champ.me) throw "biz kazandık ama şampiyon başka";
   if(T.res.length>4 && T.res[4].opp!==T.M[0][1].w.name) throw "çeyrek rakibi yanlış"; }
 const names=[...T.xi.map(x=>x.p.n),...T.bench.map(p=>p.n)]; if(new Set(names).size!==names.length) throw "kadro bozuldu";
}catch(e){errs++;console.log("HATA",e)}}
console.log(stats,"hata:",errs,"yedek dolu:",benchFull+"/"+games,"maç:",ms,"gol/maç:",(goals/ms).toFixed(2),"ceza:",susp,"sakat:",inj,"eksik 11 maçı:",ten,"konuşma:",talks);
console.log("ekranda:",els.play.innerHTML.includes("bracket")?"ağaç":"ağaç yok", els.play.innerHTML.includes("github.io")?"site adı var":"site adı YOK");
})();`);
