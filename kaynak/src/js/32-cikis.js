// ---------- her ekranda: ← Geri (bir önceki ekran) ve ⌂ Ana sayfa ----------
// Sayfa çizen her fonksiyon navPush ile kendini geçmişe yazar; aynı sayfanın yeniden çizimi kaydı tekrarlamaz, sadece günceller.
const NAV = [];
function navPush(key, fn){
  const top = NAV.at(-1);
  if (top && top.key===key){ top.fn = fn; return; }
  const i = NAV.findIndex(x=>x.key===key);
  if (i>=0) NAV.splice(i); // aynı sayfaya geri gelindiyse arkasındakiler düşer
  NAV.push({key, fn}); if (NAV.length>30) NAV.shift();
}
const exitBtn = (what) => { const w = (what||"").replace(/'/g,"\\'");
  return `<button class="exitc" onclick="askBack('${w}')">← Geri</button><button class="exitc exith" onclick="askExit('${w}')">⌂ Ana sayfa</button>`; };
const topBar = (what) => `<div class="pathbar">${exitBtn(what)}</div>`;
const toTop = () => { try { window.scrollTo(0,0); } catch(e){} };
function exitModal(title, what, go){
  if (typeof document==="undefined" || !document.createElement || !what) return go();
  document.getElementById("exitmodal")?.remove();
  const d=document.createElement("div"); d.id="exitmodal"; d.className="modal";
  d.innerHTML = `<div class="mbox"><h3 style="margin-top:0">${title}</h3><p>${what}</p>
    <div class="row"><button class="btn" id="exitgo">Evet, çık</button><button class="btn ghost" onclick="document.getElementById('exitmodal').remove()">Devam et</button></div></div>`;
  d.addEventListener("click", e=>{ if(e.target===d) d.remove(); });
  document.body.appendChild(d);
  document.getElementById("exitgo").onclick = go;
}
function askExit(what){ exitModal("Ana sayfaya dönülsün mü?", what, goHome); }
function askBack(what){ exitModal("Bir önceki ekrana dönülsün mü?", what, goBack); }
function stopRun(){ document.getElementById?.("exitmodal")?.remove?.(); S.runId=(S.runId||0)+1; S.Q=null; }
function goBack(){
  stopRun();
  NAV.pop(); const prev = NAV.pop();
  if (!prev) return goHome();
  show("play"); prev.fn(); toTop();
}
function goHome(){ stopRun(); NAV.length=0; S.T=null; S.sl=false; S.santraOn=false; S.homePick=false; S.challenge=null; show("play"); renderStart(); toTop(); }
