// ---------- ana ekrana ekle (PWA) ----------
let installEvt = null;
function registerPWA(){
  try { if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(()=>{}); } catch(e){}
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEvt = e; const b=$("installbox"); if (b) b.innerHTML = installHTML(); });
}
const isStandalone = () => { try { return matchMedia("(display-mode: standalone)").matches || navigator.standalone; } catch(e){ return false; } };
const isIOS = () => typeof navigator!=="undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent||"");
function installHTML(){
  if (isStandalone()) return "";
  if (installEvt) return `<button class="chip" onclick="doInstall()">📲 Ana ekrana ekle</button>`;
  if (isIOS()) return `<span class="mut" style="font-size:13px">📲 Uygulama gibi kullanmak için: Safari'de <b>Paylaş</b> → <b>Ana Ekrana Ekle</b></span>`;
  return "";
}
async function doInstall(){ if (!installEvt) return; installEvt.prompt(); try { await installEvt.userChoice; } catch(e){} installEvt=null; const b=$("installbox"); if (b) b.innerHTML=""; }
