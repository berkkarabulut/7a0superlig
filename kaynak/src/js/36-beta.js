// ---------- BETA etiketi ve geri bildirim ----------
function openBeta(){
  if (typeof document==="undefined" || !document.createElement) return;
  document.getElementById("betabox")?.remove();
  const d = document.createElement("div"); d.id="betabox"; d.className="modal";
  d.innerHTML = `<div class="mbox"><div class="row" style="justify-content:space-between"><h3 style="margin:0">🧪 Beta sürüm</h3><button class="chip" onclick="closeBeta()">✕</button></div>
    <p>Site deneme sürümünde. Kadroları, reytingleri ve oyunu her gün geliştiriyoruz, ufak tefek hatalar olabilir.</p>
    <p class="mut">Bir hata mı gördün, bir fikrin mi var? Yaz, okuyup düzeltelim.</p>
    <textarea id="fb_msg" class="inp" rows="4" maxlength="300" placeholder="Hata ya da önerin…"></textarea>
    <div class="row" style="margin-top:10px"><button class="btn" id="fb_send" onclick="sendBeta()">Gönder</button></div>
    <p class="mut" id="fb_info" style="font-size:13px;margin:8px 0 0"></p></div>`;
  d.addEventListener("click", e=>{ if(e.target===d) closeBeta(); });
  document.body.appendChild(d);
}
function closeBeta(){ document.getElementById("betabox")?.remove(); }
async function sendBeta(){
  const msg = ($("fb_msg").value||"").trim().slice(0,300), info=$("fb_info"), btn=$("fb_send");
  if (msg.length<3){ info.textContent = L("Birkaç kelime yaz."); return; }
  btn.disabled = true; info.textContent = L("Gönderiliyor…");
  try { const db = await fb(); await db.ref("reports").push({season:"-", team:"-", player:"Geri bildirim", type:"Öneri / geri bildirim", msg, by: myName(), lang: LANG, t: TS()});
    info.textContent = L("Teşekkürler! Mesajın ulaştı ✓"); setTimeout(closeBeta, 1400); }
  catch(e){ info.textContent = L("Gönderilemedi, internet bağlantını kontrol edip tekrar dene."); btn.disabled=false; }
}
