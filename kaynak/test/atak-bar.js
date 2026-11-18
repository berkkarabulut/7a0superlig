// atak barı: gol atan taraf, golden hemen sonra ve 3 dakika sonra barda önde olmalı
const h=require('fs').readFileSync((process.env.HTML||require('path').join(__dirname,'../../index.html')),'utf8');let s=h.split('<script>')[1].split('</script>')[0];
const els={};const mk=()=>({innerHTML:'',textContent:'',style:{},classList:{toggle(){},add(){},remove(){},contains(){return false}},insertAdjacentHTML(){},scrollIntoView(){}});
global.document={getElementById:id=>els[id]||(els[id]=mk()),querySelectorAll:()=>[]};global.localStorage={_:{},getItem(k){return this._[k]||null},setItem(k,v){this._[k]=v}};global.window={innerWidth:1200,scrollTo(){}};
eval(s+`;
let goals=0, now=0, later=0, errs=0;
const TL=CUR;
for(let k=0;k<300;k++){
  const A=TL[k%TL.length], B=TL[(k*7+3)%TL.length]; if(A.id===B.id) continue;
  const pa=oppPlayers(A), pb=oppPlayers(B), wa=teamPower(pa,"Dengeli"), wb=teamPower(pb,"Dengeli");
  const M=makeMatch(wa,wb,pa,pb,{ref:"X"}); M.run(1,45); M.run(46,90);
  atkInit(M,wa,wb); let ei=0; const after={};
  for(let m=1;m<=90;m++){
    while(ei<M.ev.length && M.ev[ei].m<=m){ const e=M.ev[ei++]; if(e.type==="goal"){ atkGoal(M,e.side); goals++; const ok=e.side===0?M._atk>0:M._atk<0; if(ok) now++; else errs++; after[m+3]=e.side; } }
    atkStep(M,ei,m);
    if(after[m]!==undefined){ const sd=after[m]; if(sd===0?M._atk>0:M._atk<0) later++; }
  }
}
console.log("gol:",goals,"golden hemen sonra doğru taraf:",now,"3 dk sonra hâlâ doğru taraf:",later);
if(errs||now!==goals||later<goals*0.8){ console.log("HATA atak barı gollere uymuyor"); process.exitCode=1; }
`);
