// ---------- her ekranda ana sayfaya çıkış ----------
const exitBtn = (what) => `<button class="exitc" onclick="askExit('${what||""}')">✕ Ana sayfa</button>`;
function askExit(what){
  if (typeof document==="undefined" || !document.createElement) return goHome();
  if (!what) return goHome();
  document.getElementById("exitmodal")?.remove();
  const d=document.createElement("div"); d.id="exitmodal"; d.className="modal";
  d.innerHTML = `<div class="mbox"><h3 style="margin-top:0">Ana sayfaya dönülsün mü?</h3><p>${what}</p>
    <div class="row"><button class="btn" onclick="goHome()">Evet, çık</button><button class="btn ghost" onclick="document.getElementById('exitmodal').remove()">Devam et</button></div></div>`;
  d.addEventListener("click", e=>{ if(e.target===d) d.remove(); });
  document.body.appendChild(d);
}
function goHome(){ document.getElementById?.("exitmodal")?.remove?.(); S.runId=(S.runId||0)+1; S.T=null; S.Q=null; show("play"); renderStart(); try{ window.scrollTo(0,0); }catch(e){} }
