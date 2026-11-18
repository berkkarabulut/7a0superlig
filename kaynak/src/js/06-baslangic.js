// ---------- başlangıç ----------
let S = { mode:"solo", form:"4-3-3", style:"Dengeli", almanac:false, speed:"Normal" };
function renderStart(){
  if (S.sl) return renderSLSetup(); // SL modunda "baştan kur / yeni kadro" SL kurulum ekranına döner
  if (S.homePick || S.challenge) return renderSetupPage(); // mod seçildiyse kurulum ayrı sayfa
  RNG = Math.random;
  const seasons = Object.keys(DATA);
  const daily = store.get("daily:"+todayKey(), null);
  $("play").innerHTML = `
    <h1>${esc(myName())}, efsane 11'ini kur, 7-0 yap.</h1>
    <p class="mut">Süper Lig'de 1980'den bugüne her sezonun ilk 3'ü: ${seasons.length} sezon, ${POOL.length} takım, ${POOL.reduce((a,t)=>a+t.players.length,0)} oyuncu.
    Takım çek, her takımdan bir oyuncu seç, 11'i tamamla, turnuvaya çık. Hedef: 7 maç, 7 galibiyet, kalende tek gol yok.</p>
    ${challengeBanner()}
    <div id="installbox" class="row" style="margin:6px 0">${installHTML()}</div>
    <div class="mgroup"><h2 class="mg-h">⭐ Efsaneler <span class="mut">· 1980–2026</span></h2><p class="mut mg-d">Süper Lig tarihinin her sezonundan ilk 3 takım ve oyuncuları.</p>
    <div class="modes">
      <button class="card mode ${S.homePick&&S.mode==="solo"?"on":""}" onclick="pickMode('solo')"><b><span class="mi">🎮</span> Efsaneler Draft'ı</b><span class="mut">1980'den 2026'ya her sezonun ilk 3'ünden takım çek, her takımdan bir oyuncu al, efsane 11'ini kur. Sınırsız oyna.</span></button>
      <button class="card mode ${S.homePick&&S.mode==="daily"?"on":""}" onclick="pickMode('daily')"><b><span class="mi">🗓️</span> Günün Meydan Okuması</b><span class="mut">Herkese bugün aynı takımlar ve ${DAILY_BUDGET} M bütçe. Her oyuncunun bir fiyatı var. Günde bir kez sayılır.${daily?` <br>Bugünkü sonucun: <b style="color:var(--gold)">${esc(daily.title)}</b>`:""}<br>${streakHTML()}</span></button>
      <button class="card mode realcard" onclick="renderRealPicker()"><b><span class="mi">🏟️</span> Gerçek takımla oyna</b><span class="mut">Bir sezonun gerçek kadrosunu seç, onunla turnuvaya çık. 1998-99 Galatasaray ile 7-0 yapabilir misin?</span></button>
      <button class="card mode" onclick="startQuiz(false)"><b><span class="mi">🧠</span> Bu kadro hangi sezon?</b><span class="mut">Günlük bilgi yarışması: 11'i gör, hangi sezonun hangi takımı olduğunu bil. 5 soru.${store.get("quiz:"+todayKey(),null)?` <br>Bugünkü skorun: <b style="color:var(--gold)">${store.get("quiz:"+todayKey()).score}/5</b>`:""}</span></button>
    </div></div>
    <div class="mgroup"><h2 class="mg-h">🔥 Bu sezon <span class="mut">· ${GUNCEL.sezon}</span></h2><p class="mut mg-d">Bugünkü Süper Lig: ${CUR.length} takımın güncel kadroları.</p>
    <div class="modes">
      <button class="card mode slcard ${S.sl?"on":""}" onclick="renderSL()"><b><span class="mi">🏆</span> ${GUNCEL.sezon} Süper Lig turnuvası</b><span class="mut">Rakiplerin bu sezonun ${CUR.length} Süper Lig takımı. Kendi 11'ini kur ya da güncel bir takımla gir.</span></button>
    </div></div>
    <div class="mgroup"><h2 class="mg-h">⚡ Tek maç</h2><p class="mut mg-d">Tarihin ya da bu sezonun herhangi iki takımı, tek maç.</p></div>
    <div class="modes mg-inv">
      <button class="card mode sacard" onclick="renderSantra()"><b><span class="mi">⚽</span> Santra</b><span class="mut">İstediğin takımla istediğin takıma karşı tek maç oyna. 2000 Galatasaray mı, 2026-27 Fenerbahçe mi? Sen seç, maçı sen yönet.</span></button>
      <button class="card mode invcard" onclick="openInvite()"><b><span class="mi">📨</span> Arkadaşını davet et</b><span class="mut">Linki WhatsApp'tan at, bakalım o 7-0 yapabilecek mi.</span></button>
    </div>
    `;
}
function pickMode(m){
  S.mode = m; S.homePick = true; S.sl = false; S.santraOn = false; renderStart();
}
// Efsaneler Draft'ı / Günün Meydan Okuması kurulumu: ayrı sayfa, üstte geri tuşu
function renderSetupPage(){
  RNG = Math.random;
  const daily = store.get("daily:"+todayKey(), null);
  const title = S.challenge ? "⚔️ Meydan okuma" : S.mode==="daily" ? "🗓️ Günün Meydan Okuması" : "🎮 Efsaneler Draft'ı";
  const desc = S.challenge ? "" : S.mode==="daily" ? `Herkese bugün aynı takımlar ve ${DAILY_BUDGET} M bütçe. Her oyuncunun bir fiyatı var. Günde bir kez sayılır.` : "1980'den 2026'ya her sezonun ilk 3'ünden takım çek, her takımdan bir oyuncu al, efsane 11'ini kur.";
  $("play").innerHTML = `${topBar("")}
    <h1>${title}</h1>${desc?`<p class="mut">${desc}</p>`:""}
    ${challengeBanner()}
    ${`<div class="card" id="setupcard">
      <h3>Diziliş</h3>
      <div class="row">${Object.keys(FORMATIONS).map(f=>`<button class="chip ${f===S.form?"on":""}" onclick="S.form='${f}';renderStart()">${f}</button>`).join("")}</div>
      <h3 style="margin-top:16px">Oyun tarzı</h3>
      <div class="row">${Object.entries(STYLES).map(([k,v])=>`<button class="chip ${k===S.style?"on":""}" onclick="S.style='${k}';renderStart()">${v.e} ${k} <span class="mut" style="font-weight:400">· ${v.d}</span></button>`).join("")}</div>
      <h3 style="margin-top:16px">Ayarlar</h3>
      <div class="row">
        <label class="toggle"><input type="checkbox" ${S.almanac?"checked":""} onchange="S.almanac=this.checked"> <b>Almanak modu</b> <span class="mut">· reytingler gizli, sadece isim ve mevki</span></label>
      </div>
      <div style="margin-top:20px" class="row">
        <button class="btn" onclick="startDraft()">${S.mode==="daily"?(daily?"Tekrar oyna (sayılmaz)":"Günün meydan okumasına başla"):"Kuraya başla"}</button>
      </div>
    </div>`}`;
  toTop();
}

