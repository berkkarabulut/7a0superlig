const h=require('fs').readFileSync((process.env.HTML||require('path').join(__dirname,'../../index.html')),'utf8');let s=h.split('<script>')[1].split('</script>')[0];
const els={};const mk=()=>({innerHTML:'',textContent:'',style:{},classList:{toggle(){},add(){},remove(){},contains(){return false}},insertAdjacentHTML(){},scrollIntoView(){}});
global.document={getElementById:id=>els[id]||(els[id]=mk()),querySelectorAll:()=>[]};global.localStorage={_:{},getItem(k){return this._[k]||null},setItem(k,v){this._[k]=v}};global.window={innerWidth:1200,scrollTo(){}};
eval(s+`;choosePens=async a=>kickOrder(a).slice(0,5).map(p=>p.n);
(async()=>{let errs=0;const t0=Date.now();const ok=POOL.filter(realOk);const ms=Date.now()-t0;
 console.log("oynanabilir:",ok.length,"/",POOL.length,"· hesap süresi:",ms+"ms");
 if(ms>1500) {console.log("HATA yavaş");errs++}
 renderRealPicker("Tümü"); if(!els.play.innerHTML.includes("rl-card")) {console.log("HATA seçim ekranı boş");errs++}
 const stats={};let plays=0;
 for(const t of ok){ try{ pickReal(t.id);
   if(S.slots.length!==11||!S.slots.every(z=>z.p)) throw "11 dolmadı "+t.id;
   if(S.slots.some(z=>z.p.forced)) throw "zorunlu yerleştirme "+t.id;
   const nm=[...S.slots,...S.bench].map(z=>z.p.n); if(new Set(nm).size!==nm.length) throw "tekrar "+t.id;
   if(nm.some(n=>!t.players.some(p=>p.n===n))) throw "başka takımdan oyuncu "+t.id;
   for(const f of Object.keys(FORMATIONS)) if(realAssign(t,f)) { realSetForm(f); if(!S.slots.every(z=>z.p)) throw "diziliş değişince boş "+f; }
   if(plays<60){ plays++; S.speed="Anında"; startTournament();
     if([...S.T.group,...S.T.rest15.map(opp)].some(x=>x.t.id===t.id)) throw "kendi takımı rakip "+t.id;
     preMatch(); if(mustFix(S.T)) autoFixMiss();
     while(!S.T.out&&S.T.i<7){ await runMatch(); if(S.T.out||S.T.i>=7) break; if(S.T.i===3&&!S.T.R) setupR16(); preMatch(); if(mustFix(S.T)) autoFixMiss(); }
     finish(); const k=S.T.out||"şampiyon"; stats[k]=(stats[k]||0)+1; }
 }catch(e){errs++;console.log("HATA",e)} }
 console.log("60 turnuva:",JSON.stringify(stats),"hata:",errs);
 renderRank(todayKey(),"real");
})();`);
