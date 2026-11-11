// ---------- temalar: aynı tasarım, farklı renk paleti (TV yayını renkleri çalışma anında eşlenir) ----------
const THEMES = {
  tv:     { ad:"📺 TV Yayını", meta:"#14061f", map:{} },
  klasik: { ad:"🟩 Klasik Yeşil", meta:"#0d1410", map:{ "14061f":"0d1410","1f0a33":"16211b","2a0f45":"1d2b23","3e1a5c":"2c4235","c9a3e0":"8ea697","170528":"0f1813","0d0216":"0a100c","1b0630":"0f1813","2a0a44":"16211b","22093a":"16211b","3a1257":"1f3328","0b0012":"050806","2e1a05":"2b2410","4a3a5a":"55635b","6b4f86":"5d6e64","5a2a7a":"2f5a3e","e8dcf0":"e0ebe4","ffb703":"f2c14e","00d9b8":"7ee08f","ff4d6d":"ff7a7a","00c2a8":"3fb96b","00241f":"06200f","3d8bff":"3b8fd9","d99a00":"b8902e","00a88f":"2f8a50","c40812":"b03a3a" } },
  gece:   { ad:"🌙 Gece Mavisi", meta:"#070d1a", map:{ "14061f":"070d1a","1f0a33":"0f1a2e","2a0f45":"16233d","3e1a5c":"26385a","c9a3e0":"93a4c3","170528":"0b1426","0d0216":"050a14","1b0630":"0b1426","2a0a44":"0f1a2e","22093a":"0f1a2e","3a1257":"1c2c4a","0b0012":"02050c","2e1a05":"2a2208","4a3a5a":"3d4a63","6b4f86":"56637d","5a2a7a":"2a4a7a","e8dcf0":"e2e8f5","e30a17":"2563eb","ff5a36":"38bdf8","ffb703":"facc15","00c2a8":"22d3ee","00d9b8":"34d399","ff4d6d":"fb7185","3d8bff":"a78bfa","1d1200":"1a1400","c40812":"1d4ed8","e8221a":"2563eb","d99a00":"ca8a04","00a88f":"0891b2" } },
};
const curTheme = () => THEMES[store.get("tema","tv")] ? store.get("tema","tv") : "tv";
const TH = hex => { const m = THEMES[curTheme()].map, k = hex.replace("#","").toLowerCase(); return m[k] ? "#"+m[k] : hex; };
let BASE_CSS = null;
function applyTheme(){
  if (typeof document==="undefined" || typeof document.getElementById!=="function") return;
  const el = document.getElementById("css"); if (!el || el.textContent==null) return;
  if (BASE_CSS==null) BASE_CSS = el.textContent;
  const m = THEMES[curTheme()].map;
  el.textContent = Object.keys(m).length ? BASE_CSS.replace(/#([0-9a-fA-F]{6})(?=[0-9a-fA-F]{2}\b|\b)/g, (all,h) => m[h.toLowerCase()] ? "#"+m[h.toLowerCase()] : all) : BASE_CSS;
  try { document.querySelector('meta[name="theme-color"]').setAttribute("content", THEMES[curTheme()].meta); } catch(e){}
}
function setTheme(k){ store.set("tema", k); applyTheme(); if (!$("play").classList.contains("hidden") && document.querySelector(".modes")) renderStart(); }
function themeChips(){ return Object.entries(THEMES).map(([k,v])=>`<button class="chip ${k===curTheme()?"on":""}" onclick="setTheme('${k}')">${v.ad}</button>`).join(""); }
