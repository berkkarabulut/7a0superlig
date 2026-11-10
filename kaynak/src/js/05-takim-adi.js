// ---------- takım adı ----------
const SUFFIXES = [
 ["SK","Türkiye"],["JK","Türkiye"],["Spor","Türkiye"],["Gücü","Türkiye"],["Belediyespor","Türkiye"],["İdmanyurdu","Türkiye"],["A.Ş.","Türkiye"],["Kulübü","Türkiye"],
 ["FC","İngiltere / dünya"],["AFC","İngiltere"],["United","İngiltere"],["City","İngiltere"],["Athletic","İngiltere"],["Rovers","İngiltere"],["Wanderers","İngiltere"],["Albion","İngiltere"],["Town","İngiltere"],
 ["SV","Almanya"],["VfB","Almanya"],["VfL","Almanya"],["TSV","Almanya"],["TSG","Almanya"],["SC","Almanya / dünya"],["BSC","Almanya"],["SG","Almanya"],["1. FC","Almanya"],["Borussia","Almanya"],
 ["AC","İtalya"],["AS","İtalya"],["SS","İtalya"],["US","İtalya"],["SSC","İtalya"],["ACF","İtalya"],["Calcio","İtalya"],
 ["CF","İspanya"],["CD","İspanya"],["UD","İspanya"],["SD","İspanya"],["RCD","İspanya"],["Real","İspanya"],["Atlético","İspanya"],
 ["OGC","Fransa"],["AJ","Fransa"],["RC","Fransa"],["Olympique","Fransa"],["Stade","Fransa"],["FCO","Fransa"],
 ["SL","Portekiz"],["SC Braga","Portekiz"],["CS","Portekiz"],["GD","Portekiz"],
 ["PSV","Hollanda"],["AFC Ajax","Hollanda"],["SBV","Hollanda"],["KV","Belçika"],["KRC","Belçika"],["RSC","Belçika"],["KAA","Belçika"],
 ["IF","İsveç"],["IK","İsveç"],["AIK","İsveç"],["IFK","İsveç"],["BK","Danimarka"],["FF","İsveç"],["SK Brann","Norveç"],
 ["FK","Sırbistan / Rusya"],["PFC","Bulgaristan / Rusya"],["NK","Hırvatistan"],["HNK","Hırvatistan"],["GNK","Hırvatistan"],["KS","Polonya"],["MKS","Polonya"],["FCSB","Romanya"],["ACS","Romanya"],
 ["CA","Arjantin"],["CR","Brezilya"],["SE","Brezilya"],["EC","Brezilya"],["CSD","Arjantin"],["Club","Güney Amerika"],
 ["SC Corinthians","Brezilya"],["Deportivo","Latin Amerika"],["Esporte Clube","Brezilya"],["Sporting","Portekiz / dünya"],["Dinamo","Doğu Avrupa"],["Spartak","Rusya"],["Lokomotiv","Rusya"],["Galaxy","ABD"],["FC Inter","dünya"]
];
const getTeam = () => store.get("team", null);
const myName = () => { const t=getTeam(); return t ? (t.suffix ? `${t.name} ${t.suffix}` : t.name) : "Senin takımın"; };
const NAME_RE = /^[A-Za-zÇĞİÖŞÜçğıöşüÂâÎîÛû0-9 .'-]{4,20}$/;
function renderNameScreen(edit){
  const cur = getTeam() || {name:"", suffix:"FC"};
  $("play").innerHTML = `
    <div class="card" style="max-width:520px;margin:30px auto;text-align:center">
      <h1 style="margin-top:0">${edit?"Takımının adını değiştir":"Takımını kur ⚽"}</h1>
      <p class="mut">Takımının adını yaz, yanından uzantısını seç. Bütün maçlarda, tabloda ve paylaşım görselinde bu ad yazacak.</p>
      <div class="namebox">
        <input id="tname" maxlength="20" placeholder="Örn: BERKO" value="${esc(cur.name)}" autocomplete="off">
        <select id="tsuf">${SUFFIXES.map(([s,c])=>`<option value="${esc(s)}" ${s===cur.suffix?"selected":""}>${esc(s)} · ${esc(c)}</option>`).join("")}<option value="" ${cur.suffix===""?"selected":""}>Uzantısız</option></select>
      </div>
      <div class="preview" id="tprev"></div>
      <p class="mut" id="terr" style="font-size:13px;min-height:18px"></p>
      <div class="row" style="justify-content:center"><button class="btn" id="tgo" onclick="saveName()">${edit?"Kaydet":"Oynamaya başla"}</button>${edit?`<button class="btn ghost" onclick="renderStart()">Vazgeç</button>`:""}</div>
    </div>`;
  const upd = () => { const n=($("tname").value||"").trim(), s=$("tsuf").value||"", ok=NAME_RE.test(n);
    $("tprev").textContent = n ? (s?`${n} ${s}`:n) : "";
    $("terr").textContent = !n ? "En az 4 karakter" : ok ? "" : n.length<4 ? `En az 4 karakter (${n.length}/4)` : "Sadece harf, rakam, boşluk, nokta ve tire kullanabilirsin";
    $("tgo").disabled = !ok; };
  $("tname").oninput = upd; $("tsuf").onchange = upd; $("tname").onkeydown = e=>{ if(e.key==="Enter" && !$("tgo").disabled) saveName(); };
  upd(); try{ $("tname").focus(); }catch(e){}
}
async function saveName(){
  const n=$("tname").value.trim().replace(/\s+/g," "), s=$("tsuf").value;
  if (!NAME_RE.test(n)) return;
  const full = s ? `${n} ${s}` : n;
  $("tgo").disabled=true; $("terr").textContent="Kontrol ediliyor…";
  try { const ok = await Promise.race([reserveName(full), new Promise((_,no)=>setTimeout(()=>no("zaman"),6000))]);
    if (!ok){ $("terr").textContent=`"${full}" adı başka biri tarafından alınmış, başka bir ad ya da uzantı dene.`; $("tgo").disabled=false; return; } }
  catch(e){ /* sunucuya ulaşılamazsa adı yine kaydet */ }
  store.set("team", {name:n, suffix:s}); updateHeaderName(); renderStart();
}
function updateHeaderName(){ const el=$("myteam"); if(!el) return; const t=getTeam(); el.textContent = t ? "🛡️ "+myName() : ""; el.classList.toggle("hidden", !t); }

