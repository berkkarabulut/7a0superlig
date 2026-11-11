// ---------- sağ üstte ⚙️ Ayarlar: dil, tema, ses ----------
function openSettings(){
  if (typeof document==="undefined" || !document.createElement) return;
  document.getElementById("setbox")?.remove();
  const d = document.createElement("div"); d.id="setbox"; d.className="modal";
  d.innerHTML = `<div class="mbox"><div class="row" style="justify-content:space-between"><h3 style="margin:0">⚙️ Ayarlar</h3><button class="chip" onclick="closeSettings()">✕</button></div>
    <div class="ph" style="margin-top:14px">Dil · Language · Idioma</div><div class="row">${langChips()}</div>
    <div class="ph" style="margin-top:14px">Tema</div><div class="row">${themeChips()}</div>
    <div class="ph" style="margin-top:14px">Stadyum sesi</div><div class="row"><button class="chip ${soundOn()?"on":""}" onclick="store.set('sound',true);paintSoundBtn();openSettings()">🔊 Açık</button><button class="chip ${soundOn()?"":"on"}" onclick="store.set('sound',false);paintSoundBtn();openSettings()">🔇 Kapalı</button></div></div>`;
  d.addEventListener("click", e=>{ if(e.target===d) closeSettings(); });
  document.body.appendChild(d);
}
function closeSettings(){ document.getElementById("setbox")?.remove(); }
