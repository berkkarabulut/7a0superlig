// ---------- arkadaşını davet et ----------
// link: SITE_URL?r=ziyaretçiKimliği  → gelen ziyaret istatistikte "davet-linki" kaynağı olarak sayılır
function inviteLink(){ return `${SITE_URL}?r=${visitorId()}`; }
function inviteText(){
  const p = profile(), b = p.best;
  if (LANG==="en") return b===7 ? `I went 7-0 on Süper Lig 7-0 🏆 Can you do it? ⚽`
    : b>=3 ? `I built my legends XI on Süper Lig 7-0, my best run is ${b}-${7-b} 😤 Can you go 7-0? ⚽`
    : `Süper Lig 7-0: build your XI from Turkish league legends since 1980 and win 7 out of 7. Think you can? ⚽`;
  if (LANG==="es") return b===7 ? `¡Hice 7-0 en Süper Lig 7-0 🏆 ¿Puedes tú? ⚽`
    : b>=3 ? `Armé mi XI de leyendas en Süper Lig 7-0, mi mejor resultado es ${b}-${7-b} 😤 ¿Puedes hacer 7-0? ⚽`
    : `Süper Lig 7-0: arma tu XI con leyendas de la liga turca desde 1980 y gana 7 de 7. ¿Te atreves? ⚽`;
  return b===7 ? `Süper Lig 7-0'da 7'de 7 yaptım 🏆 Sen yapabilir misin? ⚽`
    : b>=3 ? `Süper Lig 7-0'da efsane 11'imi kurdum, en iyi sonucum ${b}-${7-b} 😤 Sen 7-0 yapabilir misin? ⚽`
    : `Süper Lig 7-0: 1980'den bugüne Süper Lig efsanelerinden 11'ini kur, 7 maçta 7 galibiyet al. Bakalım yapabilecek misin? ⚽`;
}
async function openInvite(){
  if (typeof document==="undefined" || !document.createElement) return;
  bump("dv");
  const url = inviteLink(), txt = inviteText();
  const touch = window.matchMedia && matchMedia("(pointer:coarse)").matches;
  if (navigator.share && touch){
    try { await navigator.share({title:"Süper Lig 7-0", text:txt, url}); return; }
    catch(e){ if (e && e.name==="AbortError") return; }
  }
  document.getElementById("invbox")?.remove();
  const full = txt+"\n"+url, enc = encodeURIComponent;
  const d = document.createElement("div"); d.id="invbox"; d.className="modal";
  d.innerHTML = `<div class="mbox"><div class="row" style="justify-content:space-between"><h3 style="margin:0">📨 Arkadaşını davet et</h3><button class="chip" onclick="closeInvite()">✕</button></div>
    <p class="mut">Linki gönder, bakalım o 7-0 yapabilecek mi.</p>
    <textarea id="inv_txt" class="inp" rows="3" readonly onclick="this.select()">${esc(full)}</textarea>
    <div class="row invrow" style="margin-top:10px">
      <a class="btn invwa" href="https://wa.me/?text=${enc(full)}" target="_blank" rel="noopener" lang="en">WhatsApp</a>
      <a class="btn ghost" href="https://twitter.com/intent/tweet?text=${enc(txt)}&url=${enc(url)}" target="_blank" rel="noopener" lang="en">X / Twitter</a>
      <button class="btn ghost" id="inv_copy" onclick="copyInvite()">🔗 Linki kopyala</button>
    </div>
    <p class="mut" id="inv_info" style="font-size:13px;margin:8px 0 0"></p></div>`;
  d.addEventListener("click", e=>{ if(e.target===d) closeInvite(); });
  document.body.appendChild(d);
}
function closeInvite(){ document.getElementById("invbox")?.remove(); }
async function copyInvite(){
  const t = $("inv_txt"), info = $("inv_info");
  try { await navigator.clipboard.writeText(t.value); info.textContent = L("Kopyalandı ✓ Şimdi istediğin yere yapıştır."); }
  catch(e){ t.select(); try { document.execCommand("copy"); info.textContent = L("Kopyalandı ✓ Şimdi istediğin yere yapıştır."); } catch(_){ info.textContent = L("Metni seçip kopyala."); } }
}
