const h=require('fs').readFileSync((process.env.HTML||require('path').join(__dirname,'../../index.html')),'utf8');let s=h.split('<script>')[1].split('</script>')[0];
const els={};const mk=()=>({innerHTML:'',textContent:'',style:{},classList:{toggle(){},add(){},remove(){},contains(){return false}},insertAdjacentHTML(){},scrollIntoView(){}});
global.document={getElementById:id=>els[id]||(els[id]=mk()),querySelectorAll:()=>[]};global.localStorage={_:{},getItem(k){return this._[k]||null},setItem(k,v){this._[k]=v}};global.window={innerWidth:1200,scrollTo(){}};
eval(s+`;choosePens=async a=>kickOrder(a).slice(0,5).map(p=>p.n);
(async()=>{let errs=0;const stats={},stats2={};
 console.log("güç sırası:",[...CUR].sort((a,b)=>curPow(b)-curPow(a)).map(t=>t.team+" "+curPow(t)).join(", "));
 renderSL(); if(!els.play.innerHTML.includes("sl-row")) {console.log("HATA SL ekranı");errs++}
 const run=async(lbl,st)=>{ S.speed="Anında"; startTournament();
   const ops=[...S.T.group,...S.T.rest15.map(opp)];
   if(ops.some(x=>!x.t.cur)) throw lbl+" güncel olmayan rakip";
   if(S.mode==="real"&&ops.some(x=>x.t.id===S.realId)) throw lbl+" kendi takımı rakip";
   if(S.T.rest15.length!==15) throw lbl+" son16 eksik "+S.T.rest15.length;
   if(ops.some(x=>x.pl.length!==11)) throw lbl+" rakip 11 değil";
   preMatch(); if(mustFix(S.T)) autoFixMiss();
   while(!S.T.out&&S.T.i<7){ await runMatch(); if(S.T.out||S.T.i>=7) break; if(S.T.i===3&&!S.T.R) setupR16(); preMatch(); if(mustFix(S.T)) autoFixMiss(); }
   finish(); const k=S.T.out||"şampiyon"; st[k]=(st[k]||0)+1; };
 for(const t of CUR){ for(let r=0;r<3;r++){ try{ pickReal(t.id); if(!slOn()) throw "slOn kapalı "+t.id; await run(t.team,stats); }catch(e){errs++;console.log("HATA",e)} } }
 const legends=POOL.filter(realOk).slice(-30);
 for(const t of legends){ try{ pickReal(t.id); S.mode="solo"; S.sl=true; await run("draft "+t.id,stats2); }catch(e){errs++;console.log("HATA",e)} }
 console.log("güncel takımla 54 turnuva:",JSON.stringify(stats));
 console.log("efsane kadroyla SL 30 turnuva:",JSON.stringify(stats2),"hata:",errs);
 slDraft(); if(!els.play.innerHTML.includes("slsetup")){console.log("HATA SL kurulum ekranı");errs++} startDraft(); for(let i=0;i<30;i++){ if(!S.cur.cur){console.log("HATA draft güncel olmayan takım",S.cur.id);errs++;break} S.rerolls=5; reroll(); }
 if(!challengeLink().includes("l=1")){console.log("HATA meydan linkinde SL yok");errs++}
 console.log("SL draft: 30 çekilişin hepsi güncel takım");
 S.sl=false; pickMode("solo"); if(S.sl) {console.log("HATA sl sıfırlanmadı");errs++}
 if(errs) process.exitCode=1;
})();`);
