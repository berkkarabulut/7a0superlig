// ---------- ziyaretçi istatistikleri (Firebase, kişisel veri yok) ----------
// stats/GÜN/v: ziyaret, u/ID: tekil ziyaretçi, g: başlayan oyun, f: biten oyun, q: quiz, src/KAYNAK, dev/m|d
const visitorId = () => { let id = store.get("vid", null); if (!id){ id = Math.random().toString(36).slice(2,12); store.set("vid", id); } return id; };
async function bump(path){
  try { const db = await fb(); const ref = db.ref("stats/"+todayKey()+"/"+path);
    if (ref.transaction) await ref.transaction(v => (v||0)+1); } catch(e){}
}
async function trackVisit(){
  try {
    const db = await fb(), day = todayKey();
    bump("v");
    if (consentOK()) db.ref(`stats/${day}/u/${visitorId()}`).set(true).catch(()=>{});
    let src = "direkt";
    try { const r = document.referrer ? new URL(document.referrer).host : ""; if (r && r !== location.host) src = r.replace(/^www\./,""); } catch(e){}
    if (/[?&]m=/.test(location.search)) src = "meydan-linki";
    else if (/[?&]r=/.test(location.search)) src = "davet-linki";
    bump("src/"+src.replace(/[.#$\[\]\/]/g,"_").slice(0,50));
    bump("dev/"+(window.innerWidth<=700?"telefon":"bilgisayar"));
  } catch(e){}
}
function onConsentGranted(){ if (typeof IS_WEB!=="undefined" && IS_WEB) fb().then(db=>db.ref(`stats/${todayKey()}/u/${visitorId()}`).set(true)).catch(()=>{}); }
async function renderStats(){
  show("play");
  $("play").innerHTML = `${topBar("")}<h1>📊 Site istatistikleri</h1><div class="card" id="statbox"><p class="mut">Yükleniyor…</p></div>`;
  try {
    const db = await fb(), days = [...Array(14)].map((_,i)=>dayKeyOffset(-i));
    const rows = await Promise.all(days.map(async d => ({d, v:(await db.ref("stats/"+d).once("value")).val()||{}})));
    const src = {}; rows.forEach(r=>Object.entries(r.v.src||{}).forEach(([k,n])=>src[k]=(src[k]||0)+n));
    const n = x => x||0, uq = r => Object.keys(r.v.u||{}).length;
    $("statbox").innerHTML = `<div style="overflow-x:auto"><table><tr><th>Gün</th><th>Ziyaret</th><th>Tekil kişi</th><th>Başlayan oyun</th><th>Biten oyun</th><th>Quiz</th><th>Davet tıklama</th><th>Telefon</th><th>Bilgisayar</th></tr>
      ${rows.map(r=>`<tr><td>${r.d}</td><td>${n(r.v.v)}</td><td>${uq(r)}</td><td>${n(r.v.g)}</td><td>${n(r.v.f)}</td><td>${n(r.v.q)}</td><td>${n(r.v.dv)}</td><td>${n(r.v.dev?.telefon)}</td><td>${n(r.v.dev?.bilgisayar)}</td></tr>`).join("")}</table></div>
      <h3 style="margin-top:14px">Nereden geliyorlar (14 gün)</h3>
      <table>${Object.entries(src).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([k,v])=>`<tr><td>${esc(k.replace(/_/g,"."))}</td><td>${v}</td></tr>`).join("")||"<tr><td class='mut'>Henüz veri yok</td></tr>"}</table>`;
  } catch(e){ $("statbox").innerHTML = `<p class="mut">İstatistiklere ulaşılamadı. Firebase kurallarına "stats" bölümü eklendi mi?</p>`; }
}
