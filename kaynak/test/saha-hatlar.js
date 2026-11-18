// maç sahası: dizilişte daha geride duran oyuncu sahada asla önde görünmemeli; ayrı hattakiler (6 birimden fazla) sırayla, neredeyse aynı yükseklikteki (3 birim) oyuncular yan yana durmalı
const h=require('fs').readFileSync((process.env.HTML||require('path').join(__dirname,'../../index.html')),'utf8');let s=h.split('<script>')[1].split('</script>')[0];
const els={};const mk=()=>({innerHTML:'',textContent:'',style:{},classList:{toggle(){},add(){},remove(){},contains(){return false}},insertAdjacentHTML(){},scrollIntoView(){}});
global.document={getElementById:id=>els[id]||(els[id]=mk()),querySelectorAll:()=>[]};global.localStorage={_:{},getItem(k){return this._[k]||null},setItem(k,v){this._[k]=v}};global.window={innerWidth:1200,scrollTo(){}};
eval(s+`;
let errs=0;
for (const [f, slots] of Object.entries(FORMATIONS)){
  if (!MP_TABLE[f]) { console.log("HATA", f, "için saha tablosu yok"); errs++; continue; }
  const xi = slots.map(([pos,x,y])=>({pos,x,y})), Y = mpYs(xi);
  for (let i=0;i<xi.length;i++) for (let j=0;j<xi.length;j++){
    const dy = xi[j].y - xi[i].y;
    if (dy > 0 && Y[j] < Y[i]) { console.log("HATA", f, xi[j].pos, "dizilişte", xi[i].pos, "oyuncusunun gerisinde ama sahada önünde"); errs++; }
    if (dy > 6 && !(Y[j] > Y[i])) { console.log("HATA", f, xi[j].pos, "ayrı ve daha geri hatta ama sahada", xi[i].pos, "ile aynı yükseklikte"); errs++; }
    if (Math.abs(dy) <= 3 && xi[i].pos!=="GK" && xi[j].pos!=="GK" && Math.abs(Y[j]-Y[i]) > 3) { console.log("HATA", f, xi[i].pos, "ile", xi[j].pos, "aynı hatta ama farklı yükseklikte"); errs++; }
  }
}
console.log("saha hatları:", Object.keys(FORMATIONS).length, "diziliş kontrol edildi, hata:", errs);
if (errs) process.exitCode = 1;
`);
