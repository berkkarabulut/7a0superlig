const h=require('fs').readFileSync((process.env.HTML||require('path').join(__dirname,'../../index.html')),'utf8');let s=h.split('<script>')[1].split('</script>')[0];
const els={};const mk=(id)=>({id,innerHTML:'',textContent:'',value:'',style:{},classList:{_h:true,toggle(c,v){if(c==='hidden')this._h=v===undefined?!this._h:v},remove(c){if(c==='hidden')this._h=false},add(c){if(c==='hidden')this._h=true},contains(c){return c==='hidden'?this._h:false}},insertAdjacentHTML(){},focus(){}});
global.document={getElementById:id=>els[id]||(els[id]=mk(id)),querySelector:()=>({value:"1"}),createElement:()=>({addEventListener(){},remove(){}}),body:{appendChild(){}},head:{appendChild(){}}};
global.localStorage={_:{},getItem(k){return this._[k]||null},setItem(k,v){this._[k]=v}};global.window={innerWidth:1200,scrollTo(){}};
global.location={protocol:"file:"};
eval(require('fs').readFileSync(require('path').join(__dirname,'fbmock.js'),'utf8').replace(/window\./g,'global.'));
eval(s+`;FBready=Promise.resolve(firebase.database());
(async()=>{
 // ad rezervasyonu
 els.tname.value="TAKEN"; els.tsuf.value="FC"; await saveName(); console.log("alınmış ad:",els.terr.textContent);
 els.tname.value="BERKO"; els.tsuf.value="FC"; await saveName(); console.log("kaydedilen:",myName(), "rezerv:",JSON.stringify(__DB.names.berkofc));
 await startPresence();
 const d=todayKey(); __DB.daily[d]={a:{name:"ALİ SK",w:4,gf:9,ga:6,spent:60,ovr:85,res:"Yarı final",t:1},b:{name:"VELİ JK",w:6,gf:12,ga:4,spent:68,ovr:86,res:"Final",t:2}};
 async function play(mode){ S.mode=mode; startDraft(); let k=0; while(S.slots.some(x=>!x.p)&&k++<100){let i=S.cur.players.findIndex(p=>canPick(p)&&openSlots().some(z=>natural(p,z.pos)));if(i<0)i=S.cur.players.findIndex(canPick);if(i<0){if(S.rerolls>0){reroll();continue}updateForced();i=S.cur.players.findIndex(canPick);if(i<0)break;} pick(i);let si=S.slots.findIndex(z=>!z.p&&natural(S.cur.players[i],z.pos));if(si<0)si=S.slots.findIndex(z=>!z.p&&fits(S.cur.players[i],z.pos));place(si)}
  S.speed="Anında"; choosePens=async a=>kickOrder(a).slice(0,5).map(p=>p.n); if(S.phase==="bench") skipBench(); startTournament(); preMatch(); while(!S.T.out&&S.T.i<7){await runMatch(); if(S.T.out||S.T.i>=7) break; if(S.T.i===3&&!S.T.R) setupR16(); preMatch();} finish(); await new Promise(r=>setTimeout(r,50)); return recStr(); }
 const r1=await play("daily"); console.log("meydan sonucu:",r1,"|",els.dailyrank.innerHTML.replace(/<[^>]+>/g,""));
 const r1b=await play("daily"); console.log("2. meydan oyunu sayılmadı mı:",Object.keys(__DB.daily[d]).length===3);
 for(let g=0;g<3;g++){ const sr=document.getElementById("solorank");sr.innerHTML="";sr.textContent="";const r=await play("solo"); console.log("tek",g+1,":",r,"|",(els.solorank.innerHTML+els.solorank.textContent).replace(/<[^>]+>/g,"").slice(0,90)); }
 console.log("başlık:",els.leader.innerHTML.replace(/<[^>]+>/g,""));
 await renderRank(d,"daily"); console.log("meydan tablosu satır:",(els.rankbox.innerHTML.match(/<tr/g)||[]).length-1, els.rankbox.innerHTML.includes('class="me"')?"(benimki vurgulu)":"");
 await renderRank(d,"solo"); console.log("tek tablosu satır:",(els.rankbox.innerHTML.match(/<tr/g)||[]).length-1, "kayıt:",JSON.stringify(__DB.solo[d]));
 // bildirim
 document.getElementById("rp_msg").value="o sezon kiralıktı"; await sendReport("1998-99","Galatasaray","Hakan Şükür"); console.log("bildirim:",JSON.stringify(Object.values(__DB.reports)[0]));
 document.getElementById("rp_name").value="Ab"; document.getElementById("rp_pos").value="ST"; await sendReport("1980-81","Adanaspor",""); console.log("kısa ad uyarısı:",els.rp_info.textContent);
 process.exit(0);
})().catch(e=>{console.log("HATA",e);process.exit(1)});`);
