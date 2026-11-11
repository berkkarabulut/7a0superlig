// ---------- çerez / gizlilik bildirimi ----------
// sl70:cerez = {a:true|false, t}  a=true: istatistik + (ileride) reklam çerezlerine izin
function consent(){ return store.get("cerez", null); }
function consentOK(){ const c = consent(); return !!(c && c.a); }
function setConsent(a){
  store.set("cerez", {a:!!a, t:Date.now()});
  document.getElementById("cerezbar")?.remove();
  if (a && typeof onConsentGranted==="function") onConsentGranted();
}
function showConsent(force){
  if (typeof document==="undefined" || !document.createElement) return;
  if (!force && consent()) return;
  document.getElementById("cerezbar")?.remove();
  const d = document.createElement("div"); d.id="cerezbar"; d.className="cerezbar"; d.setAttribute("role","dialog");
  d.innerHTML = `<div class="cztxt">🍪 <b>Çerezler ve gizlilik</b><br><span>Oyunun çalışması için ayarlarını ve skorlarını cihazında saklıyoruz. İzin verirsen ziyaret istatistiği ve ileride reklam için de çerez kullanırız. Ayrıntılar <a href="gizlilik.html" target="_blank" rel="noopener">gizlilik politikasında</a>.</span></div>
    <div class="czbtn"><button class="btn" id="cz_ok" onclick="setConsent(true)">Kabul et</button><button class="btn ghost" id="cz_no" onclick="setConsent(false)">Sadece gerekli</button></div>`;
  document.body.appendChild(d);
}
function openConsent(){ showConsent(true); return false; }
