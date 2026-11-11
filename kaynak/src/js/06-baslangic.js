// ---------- başlangıç ----------
let S = { mode:"solo", form:"4-3-3", style:"Dengeli", almanac:false, speed:"Normal" };
function renderStart(){
  RNG = Math.random;
  const seasons = Object.keys(DATA);
  const daily = store.get("daily:"+todayKey(), null);
  $("play").innerHTML = `
    <h1>${esc(myName())}, efsane 11'ini kur, 7-0 yap.</h1>
    <p class="mut">Süper Lig'de 1980'den bugüne her sezonun ilk 3'ü: ${seasons.length} sezon, ${POOL.length} takım, ${POOL.reduce((a,t)=>a+t.players.length,0)} oyuncu.
    Takım çek, her takımdan bir oyuncu seç, 11'i tamamla, turnuvaya çık. Hedef: 7 maç, 7 galibiyet, kalende tek gol yok.</p>
    ${challengeBanner()}
    <div id="installbox" class="row" style="margin:6px 0">${installHTML()}</div>
    <div class="modes">
      <button class="card mode ${S.mode==="solo"?"on":""}" onclick="S.mode='solo';renderStart()"><b>Tek oyunculu</b><span class="mut">Sınırsız oyun. İstediğin kadar kur, istediğin kadar dene.</span></button>
      <button class="card mode ${S.mode==="daily"?"on":""}" onclick="S.mode='daily';renderStart()"><b>Günün Meydan Okuması</b><span class="mut">Herkese bugün aynı takımlar ve ${DAILY_BUDGET} M bütçe. Her oyuncunun bir fiyatı var. Günde bir kez sayılır.${daily?` <br>Bugünkü sonucun: <b style="color:var(--gold)">${esc(daily.title)}</b>`:""}<br>${streakHTML()}</span></button>
      <button class="card mode" onclick="startQuiz(false)"><b>🧠 Bu kadro hangi sezon?</b><span class="mut">Günlük bilgi yarışması: 11'i gör, hangi sezonun hangi takımı olduğunu bil. 5 soru.${store.get("quiz:"+todayKey(),null)?` <br>Bugünkü skorun: <b style="color:var(--gold)">${store.get("quiz:"+todayKey()).score}/5</b>`:""}</span></button>
    </div>
    <div class="card">
      <h3>Diziliş</h3>
      <div class="row">${Object.keys(FORMATIONS).map(f=>`<button class="chip ${f===S.form?"on":""}" onclick="S.form='${f}';renderStart()">${f}</button>`).join("")}</div>
      <h3 style="margin-top:16px">Oyun tarzı</h3>
      <div class="row">${Object.entries(STYLES).map(([k,v])=>`<button class="chip ${k===S.style?"on":""}" onclick="S.style='${k}';renderStart()">${v.e} ${k} <span class="mut" style="font-weight:400">· ${v.d}</span></button>`).join("")}</div>
      <h3 style="margin-top:16px">Tema</h3>
      <div class="row">${themeChips()}</div>
      <h3 style="margin-top:16px">Ayarlar</h3>
      <div class="row">
        <label class="toggle"><input type="checkbox" ${S.almanac?"checked":""} onchange="S.almanac=this.checked"> <b>Almanak modu</b> <span class="mut">· reytingler gizli, sadece isim ve mevki</span></label>
      </div>
      <div style="margin-top:20px" class="row">
        <button class="btn" onclick="startDraft()">${S.mode==="daily"?(daily?"Tekrar oyna (sayılmaz)":"Günün meydan okumasına başla"):"Kuraya başla"}</button>
      </div>
    </div>`;
}

