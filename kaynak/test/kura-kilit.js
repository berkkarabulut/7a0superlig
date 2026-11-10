const h=require('fs').readFileSync((process.env.HTML||require('path').join(__dirname,'../../index.html')),'utf8');let s=h.split('<script>')[1].split('</script>')[0];
const els={};const mk=()=>({innerHTML:'',textContent:'',style:{},classList:{toggle(){}},insertAdjacentHTML(){}});
global.document={getElementById:id=>els[id]||(els[id]=mk())};global.localStorage={getItem(){return null},setItem(){}};global.window={innerWidth:1200,scrollTo(){}};
eval(s+`;
startDraft(); reroll(); reroll(); const id=S.cur.id; reroll(); console.log("2 haktan sonra çekiliş engelli:",S.cur.id===id, "hak:",S.rerolls);
// kilit testi: haklar bitik, takımda uyan kimse yok
startDraft(); S.rerolls=0;
for(const sl of S.slots){ if(sl.pos!=="GK") sl.p={n:"x"+sl.pos+Math.random(),r:80,p:["MF"],d:["CM"],team:"t",season:"2000-01",key:"k"}; }
S.cur={...POOL[0], players:POOL[0].players.filter(p=>!p.p.includes("GK"))}; updateForced(); renderDraft();
console.log("zorunlu mod:",S.forced, "seçilebilir oyuncu:",S.cur.players.filter(canPick).length);
const i=S.cur.players.findIndex(canPick); pick(i); place(S.slots.findIndex(z=>!z.p)); 
const gk=S.slots.find(z=>z.pos==="GK").p; console.log("kaleye konan:",gk.n,"reyting",gk.base,"->",gk.r,"zorunlu:",gk.forced,"kadro tamam:",S.slots.every(z=>z.p));
// 1000 normal kura: kilitlenme var mı (haklar kullanılmadan)
let stuck=0; for(let g=0;g<1000;g++){ startDraft(); let k=0; while(S.slots.some(x=>!x.p)&&k++<50){ if(!S.cur.players.some(canPick)){ if(S.rerolls>0){reroll();continue} stuck++; break; }
  let i=S.cur.players.findIndex(p=>canPick(p)&&openSlots().some(z=>natural(p,z.pos))); if(i<0) i=S.cur.players.findIndex(canPick); pick(i);
  let si=S.slots.findIndex(z=>!z.p&&natural(S.cur.players[i],z.pos)); if(si<0) si=S.slots.findIndex(z=>!z.p&&fits(S.cur.players[i],z.pos)); place(si);} }
console.log("1000 kurada kilitlenen:",stuck);`);
