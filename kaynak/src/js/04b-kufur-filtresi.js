// ---------- küfür / hakaret / ırkçılık filtresi (takım adları) ----------
// İki katman: (1) kelimenin TAMAMI eşleşirse yasak (kısa kelimeler: "am", "göt", "kürt"…),
// (2) adın içinde HERHANGİ bir yerde geçerse yasak (uzun, yanlış alarm vermeyen kökler: "orospu", "siktir"…).
// Harfleri bozma (s1kt1r, $iktir, o.r.o.s.p.u, siiiktir) normalleştirilerek yakalanır.
const BAD_TOKENS = new Set(("am amk aq amq mk mq oc oç pic piç sik sikik got göt göte gote ibne puşt pust kahpe kaltak yarak yarrak tasak taşak "
  + "meme seks sex porn porno penis vajina dick cock cunt fuck fucker shit bitch whore slut puta putas mierda pendejo coño cono "
  + "kürt kürd kurd kürdistan kurdistan ermeni yahudi cingene çingene zenci gavur kıro kiro arap suriyeli rum laz nigga nigger negro "
  + "nazi hitler isis işid isid pkk ypg fetö feto apo öcalan ocalan terör teror terorist terörist").split(" "));
const BAD_STEMS = ["orospu","oruspu","orspu","siktir","siktr","sikerim","sikeyim","sikiyim","sikis","sikim","yarrak","dalyarak","amcik","aminak",
  "aminakoy","aminiko","amink","anani","ananin","anasini","anaskm","bacini","avradini","sokayim","sokarim","koyayim","pezevenk","pezeveng","gavat","kaltak","surtuk",
  "kahpe","ibne","gotveren","gotune","gotos","yavsak","serefsiz","fahise","kevase","kancik","orosbu","vajina","porno",
  "fuck","shit","bitch","nigger","nigga","faggot","whore","kurdistan","kurtistan","hitler"];
function normName(s, keepTr, keepRep){
  let x = String(s||"").toLocaleLowerCase("tr-TR");
  x = x.replace(/[0@4]/g, c => ({ "0":"o","@":"a","4":"a" })[c]).replace(/1|!|\|/g,"i").replace(/3/g,"e").replace(/[5$]/g,"s").replace(/7/g,"t").replace(/8/g,"b");
  if (!keepTr) x = x.replace(/ı/g,"i").replace(/ş/g,"s").replace(/ç/g,"c").replace(/ğ/g,"g").replace(/ö/g,"o").replace(/ü/g,"u").replace(/[âà]/g,"a").replace(/[îì]/g,"i").replace(/[ûù]/g,"u");
  return keepRep ? x : x.replace(/(.)\1+/g, "$1");
}
function badName(name){
  if (!name) return false;
  const raw = normName(name, true), plain = normName(name, false);
  const rep = normName(name, false, true);
  const tokens = new Set([...raw.split(/[^a-zçğıöşüâîû]+/), ...plain.split(/[^a-z]+/), ...rep.split(/[^a-z]+/)].filter(Boolean));
  for (const t of tokens) if (BAD_TOKENS.has(t)) return true;
  const joined = plain.replace(/[^a-z]/g, "");
  return BAD_STEMS.some(w => joined.includes(w));
}
