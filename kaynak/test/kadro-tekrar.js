const h=require('fs').readFileSync((process.env.HTML||require('path').join(__dirname,'../../index.html')),'utf8');let s=h.split('<script>')[1].split('</script>')[0];
const els={};const mk=()=>({innerHTML:'',textContent:'',style:{},classList:{toggle(){}},insertAdjacentHTML(){}});
global.document={getElementById:id=>els[id]||(els[id]=mk())};global.localStorage={getItem(){return null},setItem(){}};
eval(s+`;let dup=0,dead=0;
for(let g=0;g<500;g++){S.mode=g%4?"solo":"daily";S.form=Object.keys(FORMATIONS)[g%3];startDraft();let k=0;
 while(S.slots.some(x=>!x.p)&&k++<200){ if(!S.cur.players.some(canPick)){dead++;roll();continue}
   let i=S.cur.players.findIndex(p=>canPick(p)&&openSlots().some(s=>natural(p,s.pos)));if(i<0)i=S.cur.players.findIndex(canPick);
   pick(i);let si=S.slots.findIndex(s=>!s.p&&natural(S.cur.players[i],s.pos));if(si<0)si=S.slots.findIndex(s=>!s.p&&fits(S.cur.players[i],s.pos));place(si);}
 const n=S.slots.map(x=>x.p.n); if(new Set(n).size!==n.length)dup++;}
console.log("500 kadroda tekrar eden oyuncu:",dup,"takılan kura:",dead);
// Okan Buruk testi
startDraft();const a=POOL.find(x=>x.id==="1996-97|Galatasaray");S.cur=a;let i=a.players.findIndex(p=>p.n==="Okan Buruk");pick(i);place(S.slots.findIndex(s=>!s.p&&fits(a.players[i],s.pos)));
S.cur=POOL.find(x=>x.id==="1998-99|Galatasaray");const o=S.cur.players.find(p=>p.n==="Okan Buruk");console.log("Okan ikinci kez seçilebilir mi:",canPick(o));`);
