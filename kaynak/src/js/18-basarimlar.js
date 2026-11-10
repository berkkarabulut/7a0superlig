// ---------- başarımlar ----------
const ACH = [
  ["ilk","İlk maç","Bir turnuvayı bitir"],
  ["sampiyon","Şampiyon","Turnuvayı kazan"],
  ["yenilmez","Yenilmez","Hiç kaybetmeden şampiyon ol"],
  ["yedisifir","7-0","7 maçın 7'sini de kazan"],
  ["kilit","Kalede kilit","Hiç gol yemeden 7-0 yap"],
  ["almanak","Almanakçı","Almanak modunda şampiyon ol"],
  ["almanak70","Altın mühür","Almanak modunda 7-0 yap"],
  ["gunluk","Günün adamı","Günün meydan okumasında şampiyon ol"],
  ["cimri","Cimri","Günün meydan okumasında 50 M altına şampiyon ol"],
  ["anadolu","Anadolu kartalı","İstanbul dışı takımlardan en az 6 oyuncuyla şampiyon ol"],
  ["seksenler","80'ler çocuğu","Bütün 11'i 1980'lerden olan kadroyla şampiyon ol"],
  ["tek","Tek forma","11'in 8'i aynı kulüpten olsun ve şampiyon ol"],
  ["zayif","Mütevazı","Genel reytingi 80'in altında bir kadroyla şampiyon ol"],
];
function checkAch({champ,perfect,unbeaten,seven}){
  const got = new Set(store.get("ach", [])), before = new Set(got), me = S.T.me, pw = teamPower(me,S.style);
  got.add("ilk");
  if (champ){ got.add("sampiyon"); if(unbeaten) got.add("yenilmez"); if(seven) got.add("yedisifir"); if(perfect) got.add("kilit");
    if(S.almanac){ got.add("almanak"); if(seven) got.add("almanak70"); }
    if(S.mode==="daily"){ got.add("gunluk"); if(S.spent<50) got.add("cimri"); }
    if(me.filter(p=>!["Galatasaray","Fenerbahçe","Beşiktaş","Başakşehir"].includes(p.team)).length>=6) got.add("anadolu");
    if(me.every(p=>p.season.startsWith("198"))) got.add("seksenler");
    const c={}; me.forEach(p=>c[p.team]=(c[p.team]||0)+1); if(Math.max(...Object.values(c))>=8) got.add("tek");
    if(pw.ovr<80) got.add("zayif");
  }
  store.set("ach",[...got]);
  return ACH.filter(a=>got.has(a[0])&&!before.has(a[0])).map(a=>a[1]);
}
function renderAch(){
  const got = new Set(store.get("ach", [])), hist = store.get("hist", []);
  $("ach").innerHTML = `<h1>Başarımlar</h1><p class="mut">${got.size}/${ACH.length} açıldı. Bu tarayıcıda saklanır.</p>
   <div class="ach">${ACH.map(a=>`<div class="card ${got.has(a[0])?"got":""}"><b>${got.has(a[0])?"🏅 ":""}${esc(a[1])}</b><div class="mut" style="font-size:13px">${esc(a[2])}</div></div>`).join("")}</div>
   <h2 style="margin-top:24px">Son oyunlar</h2>${hist.length?`<table>${hist.slice(0,15).map(h=>`<tr><td>${new Date(h.d).toLocaleString("tr-TR")}</td><td>${h.mode==="daily"?"Günlük":"Tek"}</td><td>${esc(h.title)}</td></tr>`).join("")}</table>`:`<p class="mut">Henüz oyun yok.</p>`}`;
}

