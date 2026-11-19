// ---------- otomatik kayıt: telefon sekmeyi öldürse de kaldığın yerden devam ----------
// Oyunun tüm durumu (S, içindeki turnuva T dahil) her önemli adımda bu cihaza (localStorage) yazılır.
// Takım ve oyuncu nesneleri veri dosyasındaki asıllarına referansla, ortak/çevrimsel nesneler kimlikleri korunarak saklanır.
// Kayıt noktaları: draft (her seçim), hazır ekranı, maç öncesi, maç başlarken (maçın zarı ile), maç sonu.
const KAYIT_KEY = "sl70:kayit", KAYIT_V = 1;

function kayitRefs(){
  const T = new Map(), P = new Map();
  for (const t of [...POOL, ...CUR]){ T.set(t, t.id); t.players.forEach((p,i)=>P.set(p, [t.id, i])); }
  return {T, P};
}
function kayitKodla(root){
  const {T:TR, P:PR} = kayitRefs(), ids = new Map(), out = [];
  const e = v => {
    if (v === null || typeof v !== "object") return typeof v === "function" ? undefined : v;
    if (typeof Node !== "undefined" && v instanceof Node) return undefined;
    const tid = TR.get(v); if (tid) return {$t: tid};
    const pr = PR.get(v); if (pr) return {$p: pr};
    if (ids.has(v)) return {$r: ids.get(v)};
    const id = out.length; ids.set(v, id); out.push(null);
    let o, kind;
    const nz = x => { const y = e(x); return y === undefined ? null : y; };
    if (Array.isArray(v)){ kind = 1; o = v.map(nz); }
    else if (v instanceof Set){ kind = 2; o = [...v].map(nz); }
    else if (v instanceof Map){ kind = 3; o = [...v].map(([k, x]) => [nz(k), nz(x)]); }
    else { kind = 0; o = {}; for (const k of Object.keys(v)){ const y = e(v[k]); if (y !== undefined) o[k] = y; } }
    out[id] = [kind, o];
    return {$r: id};
  };
  return {root: e(root), out};
}
function kayitCoz(enc){
  const objs = enc.out.map(([k]) => k === 1 ? [] : k === 2 ? new Set() : k === 3 ? new Map() : {});
  const d = v => {
    if (v === null || typeof v !== "object") return v;
    if (v.$t) return findTeam(v.$t);
    if (v.$p){ const t = findTeam(v.$p[0]); return t ? t.players[v.$p[1]] : null; }
    if ("$r" in v) return objs[v.$r];
    return v;
  };
  enc.out.forEach(([kind, o], i) => {
    const tgt = objs[i];
    if (kind === 1) o.forEach((x, j) => tgt[j] = d(x));
    else if (kind === 2) o.forEach(x => tgt.add(d(x)));
    else if (kind === 3) o.forEach(([k, x]) => tgt.set(d(k), d(x)));
    else for (const k of Object.keys(o)) tgt[k] = d(o[k]);
  });
  return d(enc.root);
}

// nerede: "draft" | "ready" | "pre" | "live" | "after"
function kayitAl(nerede){
  try {
    if (typeof stIsOn === "function" && stIsOn()) return;     // TikTok yayın modunda kayıt yok
    const veri = { v: KAYIT_V, t: Date.now(), nerede, ozet: kayitOzet(nerede), S: kayitKodla(S) };
    localStorage.setItem(KAYIT_KEY, JSON.stringify(veri));
  } catch(e){ /* depolama dolu ya da kapalı: oyun yine çalışır */ }
}
function kayitSil(){ try { localStorage.removeItem(KAYIT_KEY); } catch(e){} }
function kayitOku(){
  try {
    const v = JSON.parse(localStorage.getItem(KAYIT_KEY) || "null");
    if (!v || v.v !== KAYIT_V) return null;
    if (Date.now() - v.t > 7*24*3600e3){ kayitSil(); return null; }   // bir haftadan eski kayıt silinir
    return v;
  } catch(e){ return null; }
}
function kayitOzet(nerede){
  const T = S.T, mod = S.santraOn ? "Santra" : slOn() ? "2026-27 Süper Lig" : S.mode==="daily" ? "Günün meydan okuması" : S.mode==="real" ? "Gerçek takım" : "Efsaneler Draft'ı";
  let yer = "";
  if (nerede === "draft") yer = `Draft · ${(S.slots||[]).filter(s=>s.p).length}/11 oyuncu`;
  else if (nerede === "ready") yer = "Turnuva öncesi";
  else if (T && T.single) yer = nerede === "live" ? "Maç oynanıyordu" : "Maç öncesi";
  else if (T){
    const st = STAGES[Math.min(T.i, STAGES.length-1)];
    yer = nerede === "after" ? `${STAGES[T.i] ? STAGES[T.i]+" öncesi" : "Turnuva sonu"}` : nerede === "live" ? `${st} oynanıyordu` : `${st} öncesi`;
    const w = T.res.filter(r=>r.res==="W").length; if (T.res.length) yer += ` · ${T.res.length} maç, ${w} galibiyet`;
  }
  return {mod, yer};
}

function devamEt(){
  const k = kayitOku(); if (!k) return renderStart();
  let yeni;
  try { yeni = kayitCoz(k.S); } catch(e){ kayitSil(); return renderStart(); }
  for (const key of Object.keys(S)) delete S[key];
  Object.assign(S, yeni);
  S.runId = (S.runId||0) + 1;
  NAV.length = 0; navPush("home", () => { S.T=null; S.sl=false; S.santraOn=false; S.homePick=false; S.challenge=null; renderStart(); });
  show("play");
  const T = S.T;
  try {
    if (k.nerede === "draft") renderDraft();
    else if (k.nerede === "ready") renderReady();
    else if (T && k.nerede === "pre") renderPre();
    else if (T && k.nerede === "live"){ renderPre(); setTimeout(() => runMatch(), 0); }   // maç ortasında kalan maç: direkt aynı maça dön (taktik değiştirip yeniden deneme yok)
    else if (T && k.nerede === "after"){ if (T.single || T.done) { kayitSil(); renderStart(); } else if (T.i >= STAGES.length || T.out) finish(); else nextStep(); }
    else renderStart();
  } catch(e){ console.error(e); kayitSil(); renderStart(); }
  toTop();
}
function kayitBanner(){
  const k = kayitOku(); if (!k) return "";
  const dk = Math.max(1, Math.round((Date.now() - k.t) / 60000)), ne = dk < 60 ? `${dk} dk önce` : dk < 1440 ? `${Math.round(dk/60)} saat önce` : `${Math.round(dk/1440)} gün önce`;
  return `<div class="card devam-kart" id="devamkart">
    <div class="devam-ust">⏸️ <b>Yarım kalan oyunun var</b> <span class="mut">· ${ne}</span></div>
    <div class="devam-ozet"><b>${esc(k.ozet.mod)}</b> · ${esc(k.ozet.yer)}</div>
    <div class="mut devam-not">Kaldığın yerden devam edebilirsin. Devam etmek istiyorsan "Devam et"e tıkla.</div>
    <div class="row devam-btn"><button class="btn gold" onclick="devamEt()">▶ Devam et</button><button class="btn ghost" onclick="kayitSil();document.getElementById('devamkart').remove()">✕ Sil, yeni oyun</button></div>
  </div>`;
}

// maçın zarı: aynı maç tekrar açılırsa birebir aynı oynanır (çıkıp girerek kaybedilen maçı yeniden deneme olmasın)
function zarliMac(T, olustur){
  if (T.mseed == null) T.mseed = Math.floor(Math.random() * 2147483647);
  let s = T.mseed | 0;
  const rng = () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const sar = (f, ctx) => (...a) => { const R = Math.random; Math.random = rng; try { return f.apply(ctx, a); } finally { Math.random = R; } };
  const M = sar(olustur, null)();
  for (const k of Object.keys(M)) if (typeof M[k] === "function") M[k] = sar(M[k], M);
  return M;
}
