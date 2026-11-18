const h=require('fs').readFileSync((process.env.HTML||require('path').join(__dirname,'../../index.html')),'utf8');let s=h.split('<script>')[1].split('</script>')[0];
const els={};const mk=()=>({innerHTML:'',textContent:'',style:{},classList:{toggle(){},add(){},remove(){},contains(){return false}},insertAdjacentHTML(){},scrollIntoView(){}});
global.document={getElementById:id=>els[id]||(els[id]=mk()),querySelectorAll:()=>[]};global.localStorage={_:{},getItem(k){return this._[k]||null},setItem(k,v){this._[k]=v}};global.window={innerWidth:1200,scrollTo(){}};
eval(s+`;choosePens=async a=>kickOrder(a).slice(0,5).map(p=>p.n);
(async()=>{let errs=0;const st={W:0,D:0,L:0,pen:0};
 renderStart(); if(!els.play.innerHTML.includes("renderSantra()")) {console.log("HATA menüde Santra yok");errs++}
 if(els.play.innerHTML.includes("renderDerby")) {console.log("HATA derbi hâlâ menüde");errs++}
 renderSantra(); if(!els.play.innerHTML.includes("sa-sel")) {console.log("HATA Santra ekranı");errs++}
 const L=saTeams();
 for(let k=0;k<40;k++){ try{
   const a=rnd(L), b=rnd(L.filter(t=>t.id!==a.id)); S.santra={me:a.id,op:b.id,pk:k%2===0}; S.speed="Anında";
   santraGo(); if(!S.santraOn) throw "santraOn yok"; if(!els.play.innerHTML.includes("startSantra()")) throw "hazır ekranında santra butonu yok";
   startSantra(); if(!S.T.single) throw "single değil"; if(S.T.o.t.id!==b.id) throw "rakip yanlış "+S.T.o.t.id;
   if(mustFix(S.T)) autoFixMiss();
   await runMatch(); const r=S.T.res[0]; if(!r) throw "sonuç yok";
   if(S.T.res.length!==1) throw "birden fazla maç";
   if(S.T.pk && r.res==="D") throw "penaltılı maç berabere bitti";
   if(!els.after.innerHTML.includes("Rövanş")) throw "rövanş butonu yok";
   st[r.res]++; if(r.pen) st.pen++;
   const before=S.T; startSantra(); if(S.T===before||S.T.res.length) throw "rövanş yeni maç kurmadı";
 }catch(e){errs++;console.log("HATA",e)} }
 // geri tuşu zinciri: ana sayfa -> santra -> kadro -> maç; geri -> kadro -> santra -> ana sayfa
 goHome(); renderSantra(); santraGo(); startSantra(); goBack(); if(!els.play.innerHTML.includes("startSantra()")) {console.log("HATA geri: kadro ekranına dönmedi");errs++}
 goBack(); if(!els.play.innerHTML.includes("sa-sel")) {console.log("HATA geri: Santra seçimine dönmedi");errs++}
 goBack(); if(!els.play.innerHTML.includes("renderSantra()")||els.play.innerHTML.includes("sa-sel")) {console.log("HATA geri: ana sayfaya dönmedi");errs++}
 renderSL(); slDraft(); goBack(); if(!els.play.innerHTML.includes("sl-row")) {console.log("HATA geri: SL kurulumdan SL menüsüne dönmedi");errs++}
 renderRealPicker("Tümü"); goBack(); if(!els.play.innerHTML.includes("sl-row")) {console.log("HATA geri: gerçek takımdan SL menüsüne dönmedi");errs++}
 console.log("geri tuşu zinciri kontrol edildi");
 console.log("40 santra maçı:",JSON.stringify(st),"hata:",errs);
 if(errs) process.exitCode=1;
})();`);
