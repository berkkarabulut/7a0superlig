// ---------- TikTok canlı yayın modu: sohbet oyla oynatır ----------
// Aç: 7a0superlig.com/?yayin   (deneme: ?yayin=test → sahte izleyiciler oy verir)
// Sohbet TikFinity masaüstü uygulamasının yerel olay API'sinden okunur: ws://localhost:21213
// İzleyici sohbete numara yazar (ya da oyuncunun adını); her oylamada herkesin son yazdığı tek oy sayılır.
const STREAM = { on:false, test:false, sec:15, ws:null, wsOk:false, vote:null, viewers:new Set(), games:0, lastVoters:[] };
const stIsOn = () => typeof location!=="undefined" && /[?&]yayin/.test(location.search);
const stWait = ms => new Promise(r => setTimeout(r, ms));
const stNorm = s => String(s||"").toLocaleLowerCase("tr").replace(/ı/g,"i").normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();

// --- sohbet bağlantısı (TikFinity) ---
function stConnect(){
  if (STREAM.test) return;
  try {
    const ws = new WebSocket("ws://localhost:21213/");
    STREAM.ws = ws;
    ws.onopen = () => { STREAM.wsOk = true; stStatus(); };
    ws.onclose = () => { STREAM.wsOk = false; stStatus(); setTimeout(stConnect, 3000); };
    ws.onerror = () => { try { ws.close(); } catch(e){} };
    ws.onmessage = ev => { let m; try { m = JSON.parse(ev.data); } catch(e){ return; }
      const type = m.event || m.type || "", d = m.data || m;
      const user = d.uniqueId || d.userId || d.nickname || (d.user && (d.user.uniqueId || d.user.nickname)) || "?";
      const nick = d.nickname || (d.user && d.user.nickname) || user;
      if (/chat|comment/i.test(type) || d.comment!=null) stChat(String(user), String(nick), String(d.comment ?? d.message ?? d.text ?? ""));
      if (/member|join/i.test(type)) { STREAM.viewers.add(user); }
    };
  } catch(e){ setTimeout(stConnect, 3000); }
}
function stStatus(){
  const el = document.getElementById("st-conn"); if (!el) return;
  el.className = "st-conn " + (STREAM.test ? "test" : STREAM.wsOk ? "ok" : "no");
  el.textContent = STREAM.test ? "🧪 Deneme modu · sahte izleyiciler" : STREAM.wsOk ? "🟢 Sohbet bağlı (TikFinity)" : "🔴 Sohbet bağlı değil · TikFinity masaüstü uygulamasını aç";
}
// --- yorum → oy ---
function stChat(user, nick, text){
  const v = STREAM.vote; if (!v || v.done) return;
  const t = String(text).trim(); let k = -1;
  const m = t.match(/^\s*#?\s*(\d{1,2})(?!\d)/);
  if (m){ const n = +m[1]; k = v.opts.findIndex(o => o.n === n); }
  else {
    const q = stNorm(t); if (q.length >= 3){
      const hits = v.opts.map((o,i)=>({i, s:stNorm(o.label)})).filter(x => x.s.split(" ").some(w => w.length>=3 && (w===q || q.split(" ").includes(w))));
      if (hits.length === 1) k = hits[0].i;
    }
  }
  if (k < 0) return;
  v.by[user] = k;
  STREAM.lastVoters.unshift(`${nick} → ${v.opts[k].n}`); STREAM.lastVoters.length = Math.min(STREAM.lastVoters.length, 4);
  stDrawVote();
}
// --- oylama ---
// opts: [{n, label, sub?}] ; def: kimse oy vermezse seçilecek indeks
function stVote(title, opts, def=0, sec){
  return new Promise(res => {
    const v = STREAM.vote = { title, opts, def, by:{}, end: Date.now() + (sec||STREAM.sec)*1000, done:false, res };
    stDrawVote();
    const tick = setInterval(() => {
      if (v.done){ clearInterval(tick); return; }
      if (STREAM.test && Math.random() < 0.55) stChat("bot"+Math.floor(Math.random()*40), "izleyici"+Math.floor(Math.random()*40), String(opts[Math.random()<.5 ? def : Math.floor(Math.random()*opts.length)].n));
      if (Date.now() >= v.end) stCloseVote(v, null); else stDrawVote();
    }, 250);
  });
}
function stCount(v){ const c = v.opts.map(()=>0); Object.values(v.by).forEach(k => c[k]++); return c; }
function stCloseVote(v, forced){
  if (v.done) return; v.done = true;
  const c = stCount(v), total = c.reduce((a,b)=>a+b,0);
  let win = forced;
  if (win == null){ const max = Math.max(...c); const top = c.map((x,i)=>x===max?i:-1).filter(i=>i>=0); win = total ? top[Math.floor(Math.random()*top.length)] : v.def; }
  v.win = win; stDrawVote();
  setTimeout(() => { if (STREAM.vote === v) STREAM.vote = null; stDrawVote(); v.res(win); }, 1400);
}
function stPick(k){ const v = STREAM.vote; if (v && !v.done) stCloseVote(v, k); }   // yayıncı tıklarsa direkt seçer
function stDrawVote(){
  const box = document.getElementById("st-vote"); if (!box) return;
  const v = STREAM.vote;
  if (!v){ box.innerHTML = STREAM.msg ? `<div class="st-msg">${STREAM.msg}</div>` : ""; return; }
  const c = stCount(v), total = c.reduce((a,b)=>a+b,0), left = Math.max(0, Math.ceil((v.end - Date.now())/1000));
  const max = Math.max(1, ...c);
  box.innerHTML = `<div class="st-q"><span>${v.title}</span><span class="st-t ${left<=5&&!v.done?"hot":""}">${v.done?"✓":left}</span></div>
    <div class="st-opts">${v.opts.map((o,i)=>`<button class="st-o ${v.done&&v.win===i?"win":""} ${!v.done&&c[i]===max&&c[i]>0?"lead":""}" onclick="stPick(${i})">
      <span class="st-n">${o.n}</span><span class="st-l"><b>${o.label}</b>${o.sub?`<small>${o.sub}</small>`:""}</span><span class="st-c">${c[i]}</span>
      <span class="st-bar" style="width:${total?Math.round(c[i]/total*100):0}%"></span></button>`).join("")}</div>
    <div class="st-foot"><div>${v.done ? `✅ Seçilen: <b>${v.opts[v.win].label}</b>` : `💬 Sohbete <b>numarayı</b> yaz · <b>${total}</b> oy`}</div>${STREAM.lastVoters.length&&!v.done?`<div class="st-last">${STREAM.lastVoters.map(esc).join(" · ")}</div>`:""}</div>`;
}
const stSay = async (html, ms) => { STREAM.msg = html; stDrawVote(); await stWait(ms); STREAM.msg = null; stDrawVote(); };

// --- oyun akışı ---
async function stDraft(){
  S.mode = "solo"; S.challenge = null; S.almanac = false; S.speed = "Normal";
  const forms = Object.keys(FORMATIONS);
  const fi = await stVote("📋 Diziliş ne olsun?", forms.map((f,i)=>({n:i+1, label:f})), Math.max(0, forms.indexOf("4-3-3")));
  S.form = forms[fi];
  const sts = Object.keys(STYLES);
  const si = await stVote("🎯 Oyun tarzı?", sts.map((k,i)=>({n:i+1, label:`${STYLES[k].e} ${k}`})), 0);
  S.style = sts[si];
  startDraft();
  let guard = 0;
  while (S.phase === "xi" && STREAM.on && guard++ < 60){
    const cands = S.cur.players.map((p,i)=>({p,i})).filter(x=>canPick(x.p)).sort((a,b)=>b.p.r-a.p.r).slice(0,8);
    if (!cands.length){ roll(); continue; }
    const opts = cands.map((x,k)=>({n:k+1, label:x.p.n, sub:`${roles(x.p).map(r=>LABEL[r]).join("/")} · ${x.p.r}`}));
    if (S.rerolls > 0) opts.push({n:0, label:"🔄 Yeniden çek", sub:`${S.rerolls} hak kaldı`});
    const left = S.slots.filter(s=>!s.p).length;
    const k = await stVote(`${kit(S.cur.team)}${S.cur.season} ${esc(S.cur.team)} · kimi alalım? <small>(${11-left+1}/11)</small>`, opts, 0);
    if (!STREAM.on) return;
    if (opts[k].n === 0){ reroll(); continue; }
    const ci = cands[k].i, p = S.cur.players[ci];
    pick(ci);
    let slot = S.slots.findIndex(s=>!s.p && natural(p,s.pos)); if (slot < 0) slot = S.slots.findIndex(s=>!s.p && fits(p,s.pos));
    if (slot >= 0) place(slot); else { S.sel = null; roll(); }
  }
  // yedekler: oylamasız, en iyi uygun oyuncularla
  let g = 0;
  while (S.phase === "bench" && S.bench.some(z=>!z.p) && g++ < 80){
    const i = S.cur.players.map((p,i)=>({p,i})).filter(x=>canPick(x.p) && openSlots().some(z=>natural(x.p,z.pos))).sort((a,b)=>b.p.r-a.p.r)[0];
    if (!i){ if (S.rerolls > 0){ reroll(); continue; } break; }
    pick(i.i);
  }
  if (S.phase === "bench") skipBench();
}
async function stClick(id, tries=40){ for (let t=0; t<tries; t++){ const b = document.getElementById(id); if (b){ b.click(); return true; } await stWait(250); } return false; }
async function stCeremony(){ await stClick("kskip"); await stWait(2500); await stClick("kgo"); await stWait(800); }
async function stMatch(){
  const T = S.T;
  if (mustFix(T)) autoFixMiss();
  const tk = await stVote(`🗣️ Maç önü konuşması · rakip: ${kit(T.o.t.team)}${esc(T.o.name)}`, TALKS.map((t,i)=>({n:i+1, label:`${t.e} “${esc(t.t)}”`})), 2);
  if (!STREAM.on) return;
  doTalk(tk); await stWait(2500);
  let htDone = false, penDone = false, running = true;
  const watch = (async () => { while (running){
    if (!htDone && document.getElementById("htbox") && window.__hgo){ htDone = true;
      const ms = Object.keys(MENTS); const m = await stVote("⏸️ Devre arası · nasıl devam?", ms.map((k,i)=>({n:i+1, label:k})), 0, 12);
      window.__hm && window.__hm(ms[m]); window.__hgo && window.__hgo(); }
    if (!penDone && document.querySelector(".penpick") && window.__pauto){ penDone = true; window.__pauto(); await stWait(300); window.__pgo && window.__pgo(); }
    await stWait(300); } })();
  await runMatch(); running = false; await watch;
}
async function stTournament(){
  startTournament(); await stCeremony();
  while (STREAM.on){
    await stWait(600);
    await stMatch();
    await stWait(5000);
    const T = S.T; if (!T) return;
    if (T.out || T.i >= 7){ finish(); return; }
    const goesToDraw = T.i === 3 && !T.R;
    nextStep(); if (goesToDraw) await stCeremony();
  }
}
async function stLoop(){
  while (STREAM.on){
    try {
      await stSay(`⚽ <b>Yeni oyun başlıyor!</b><br>Kadroyu siz kuruyorsunuz. Sohbete numara yazarak oy verin.`, 4000);
      await stDraft(); if (!STREAM.on) break;
      await stSay(`✅ <b>11 hazır!</b> Turnuva başlıyor…`, 3500);
      await stTournament(); STREAM.games++;
      const T = S.T, [w] = T ? record() : [0];
      await stSay(`🏁 <b>Sonuç: ${w}-${7-w}</b>${w===7?" · 🏆 7-0 YAPTIK!":""}<br>30 saniye sonra yeni oyun. Takip etmeyi unutmayın!`, 30000);
    } catch(e){ console.error("yayın", e); await stWait(3000); }
  }
}
function stStart(){
  if (STREAM.on) return;
  STREAM.on = true; STREAM.test = /[?&]yayin=test/.test(location.search);
  document.body.classList.add("yayin");
  if (!document.getElementById("st-ui")) document.body.insertAdjacentHTML("beforeend", `<div id="st-ui"><div class="st-top"><b>SÜPER LİG <span>7-0</span></b><span>Kadroyu sohbet kuruyor</span><span class="st-url">7a0superlig.com</span></div><div id="st-conn" class="st-conn"></div><div id="st-vote"></div></div>`);
  stStatus(); stConnect(); stLoop();
}
function stIntro(){
  document.body.classList.add("yayin");
  $("play").innerHTML = `<div class="card st-intro"><h1>📺 Canlı yayın modu</h1>
    <p>İzleyiciler sohbete numara yazarak dizilişi, oyun tarzını, her oyuncuyu, maç önü konuşmasını ve devre arası planını seçer. Her oylama ${STREAM.sec} saniye; kimse oy vermezse en iyi seçenek alınır. Sen bir seçeneğe tıklarsan direkt o seçilir.</p>
    <ol><li><b>TikFinity masaüstü uygulamasını</b> aç ve TikTok hesabına bağla (sohbet buradan okunur).</li>
    <li>Bu pencereyi dikey yap (ör. 540×960) ve TikTok LIVE Studio'da <b>pencere yakalama</b> ile ekle.</li>
    <li>Yayını başlat, sonra aşağıdaki butona bas.</li></ol>
    <div class="row"><button class="btn gold" onclick="stStart()">▶ Oyunu başlat</button>
    <a class="btn ghost" href="?yayin=test">🧪 Deneme modu (sahte izleyiciler)</a></div></div>`;
}
if (stIsOn()) setTimeout(() => { if (/[?&]yayin=test/.test(location.search)) stStart(); else stIntro(); }, 700);
