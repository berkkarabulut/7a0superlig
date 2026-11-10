const h=require('fs').readFileSync((process.env.HTML||require('path').join(__dirname,'../../index.html')),'utf8');let s=h.split('<script>')[1].split('</script>')[0];
const els={};const mk=()=>({innerHTML:'',textContent:'',style:{},classList:{toggle(){},add(){},remove(){}},insertAdjacentHTML(){},scrollIntoView(){}});
global.document={getElementById:id=>els[id]||(els[id]=mk()),querySelectorAll:()=>[]};global.localStorage={_:{},getItem(k){return this._[k]||null},setItem(k,v){this._[k]=v}};global.window={innerWidth:1200,scrollTo(){}};
eval(s+`;(async()=>{ startDraft(); let k=0; while(S.phase==="xi"&&k++<80){let i=S.cur.players.findIndex(p=>canPick(p)&&openSlots().some(z=>natural(p,z.pos)));if(i<0){roll();continue}pick(i);place(curSlots().findIndex(z=>!z.p&&natural(S.cur.players[i],z.pos)))}
 k=0; while(S.phase==="bench"&&k++<80){ let i=S.cur.players.findIndex(p=>canPick(p)&&openSlots().some(z=>natural(p,z.pos))); if(i<0){ if(S.rerolls>0){reroll();continue} skipBench(); break;} pick(i); }
 if(S.phase==="bench") skipBench(); S.speed="Hızlı"; SPEEDS["Hızlı"]=1; startTournament(); preMatch(); const before=S.T.xi.map(x=>x.p.n).join();
 halfTime = async (M)=>{ const o=M.onPitch()[5], b=S.T.bench[0]; M.sub(o,{...b,r:b.base,pos:LINE(o.role),role:o.role},46); return {style:S.T.style,ment:"Aynen devam"}; };
 await runMatch(); const after=S.T.xi.map(x=>x.p.n).join(); console.log("devre arası değişikliği kalıcı mı:", before!==after && !S.T.injsLast ? "EVET(hata?)":"hayır", S.T.res[0].g1+"-"+S.T.res[0].g2);
 preMatch(); swapIn(0); selXi(2); swapIn(1); console.log("elle değiştirince fark:", S.T.xi.map(x=>x.p.n).join()!==before); resetXi(); console.log("geri dön sonrası aynı mı:", S.T.xi.map(x=>x.p.n).join()===before || Object.keys(S.T.outs).length>0);
})();`);
