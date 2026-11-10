const STYLES = {
  "Dengeli":       { att: 0,   def: 0,   e:"⚖️", d: "Ne şiş yansın ne kebap" },
  "Topa sahip ol": { att: 0.3, def: 0.4,  e:"🎯", key:"mf", w:0.35, d: "Pas pas pas. Orta sahan iyiyse uçar, kontraya açık verir" },
  "Önde baskı":    { att: 2.5, def: 0.5, e:"⚡", late:true, d: "Rakibi kendi yarısında boğ, 60'tan sonra yorulursun" },
  "Kontra atak":   { att: -0.3,def: 1,   e:"🏹", key:"fw", w:0.3, d: "Geride bekle, hızlı çık. Önde basanlara karşı ölümcül" },
  "Kanat oyunu":   { att: 0.5, def: -0.5,e:"🪽", key:"wg", w:0.45, d: "Kanatların ve beklerin iyiyse ortalar yağar" },
  "Uzun top":      { att: 0,   def: 0.2, e:"🚀", key:"fw", w:0.25, d: "Basit ve sağlam, güçlü forvet ister. Baskıyı atlatır" },
  "Otobüsü çek":   { att: -2.3,def: 3.5, e:"🚌", d: "Kaleyi kapat, golü duran toptan bul" },
};
// saldıran tarz -> savunan tarz : hücum bonusu
const COUNTER = {
  "Kontra atak":   { "Önde baskı":1.5, "Topa sahip ol":1, "Kanat oyunu":0.5 },
  "Önde baskı":    { "Topa sahip ol":1.5, "Dengeli":0.5, "Uzun top":-1.5 },
  "Uzun top":      { "Önde baskı":1.2 },
  "Topa sahip ol": { "Otobüsü çek":1, "Dengeli":0.5, "Kontra atak":-1 },
  "Kanat oyunu":   { "Otobüsü çek":1.5, "Topa sahip ol":0.5, "Kontra atak":-0.5 },
  "Otobüsü çek":   { "Kanat oyunu":-1 },
};
const ctrOf = (a,b) => (COUNTER[a]||{})[b]||0;
const beats = st => Object.keys(STYLES).filter(k=>ctrOf(k,st)>0).sort((a,b)=>ctrOf(b,st)-ctrOf(a,st));
const COACH_STYLE = { "Fatih Terim":"Önde baskı","Christoph Daum":"Önde baskı","Okan Buruk":"Önde baskı","Jorge Jesus":"Önde baskı","Mircea Lucescu":"Topa sahip ol",
  "Zico":"Topa sahip ol","Frank Rijkaard":"Topa sahip ol","Ersun Yanal":"Topa sahip ol","Abdullah Avcı":"Topa sahip ol","Gheorghe Hagi":"Topa sahip ol","Vítor Pereira":"Topa sahip ol",
  "Gordon Milne":"Kanat oyunu","Ertuğrul Sağlam":"Kanat oyunu","Slaven Bilić":"Kanat oyunu","Mustafa Denizli":"Kontra atak","Şenol Güneş":"Kontra atak","Aykut Kocaman":"Kontra atak",
  "José Mourinho":"Otobüsü çek","Dick Advocaat":"Dengeli","Roberto Mancini":"Dengeli","Jupp Derwall":"Dengeli","Karl-Heinz Feldkamp":"Uzun top","Branko Stanković":"Uzun top",
  "Eric Gerets":"Önde baskı","Jean Tigana":"Kontra atak","Bülent Uygun":"Kontra atak","Thomas Reis":"Önde baskı","İsmail Kartal":"Kanat oyunu","Sergen Yalçın":"Topa sahip ol" };
function oppStyle(t){ const c=coachOf(t); if (COACH_STYLE[c]) return COACH_STYLE[c]; const ks=Object.keys(STYLES); let h=0; for (const ch of t.id) h=(h*31+ch.charCodeAt(0))>>>0; return ks[h%ks.length]; }
function styleMod(style, players){
  const st = STYLES[style] || STYLES["Dengeli"]; if (!st.key) return {att:st.att, def:st.def};
  const a = arr => arr.length ? avg(arr) : 82;
  const isW = p => ["RW","LW","RM","LM","RWB","LWB","RB","LB"].includes(p.role || roles(p)[0]);
  const v = {mf:a(players.filter(p=>p.pos==="MF").map(p=>p.r)), fw:a(players.filter(p=>p.pos==="FW").map(p=>p.r)), wg:a(players.filter(isW).map(p=>p.r))}[st.key];
  const sk = Math.max(-2.5, Math.min(2, (v-84)*st.w));
  return {att: st.att+sk, def: st.def+sk*0.4};
}
const STAGES = ["Grup 1. maç","Grup 2. maç","Grup 3. maç","Son 16","Çeyrek final","Yarı final","Final"];
const LEGEND = 88;
const DAILY_BUDGET = 70;
