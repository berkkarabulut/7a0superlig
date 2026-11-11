// ---------- arkadaşına meydan oku linki ----------
// Link aynı kura tohumunu (seed) ve dizilişi taşır: arkadaşın aynı takım sırasıyla kurar,
// grup ve Son 16 kurası da aynı gelir. Sonunda iki sonuç karşılaştırılır.
function readChallengeFromUrl(){
  if (typeof location==="undefined") return;
  const q = new URLSearchParams(location.search), m = q.get("m");
  if (!m) return;
  const seed = parseInt(m, 36); if (!isFinite(seed)) return;
  const form = FORMATIONS[q.get("d")] ? q.get("d") : "4-3-3";
  S.challenge = { seed, form, rec: (q.get("s")||"").slice(0,5), from: (q.get("n")||"Bir arkadaşın").slice(0,24) };
  S.mode = "solo"; S.form = form;
  try { history.replaceState(null, "", location.pathname); } catch(e){}
}
function challengeBanner(){
  const c = S.challenge; if (!c) return "";
  return `<div class="card chal"><div style="font-size:20px;font-weight:800;font-family:var(--cond);text-transform:uppercase">⚔️ ${esc(c.from)} sana meydan okudu!</div>
    <p style="margin:6px 0">${c.rec?`Bu kurayla <b style="color:var(--gold)">${esc(c.rec)}</b> yaptı. `:""}Aynı takım sırası, aynı diziliş (${esc(c.form)}), aynı grup ve Son 16 kurası. Bakalım geçebilecek misin?</p>
    <p class="mut" style="font-size:12px;margin:0 0 8px">Farklı oyuncu seçersen sonraki çekilişlerde bazı takımlar atlanabilir, maçlar her zaman sürprize açık.</p>
    <div class="row"><button class="btn gold" onclick="startDraft()">Meydan okumayı kabul et ▶</button><button class="btn ghost" onclick="S.challenge=null;renderStart()">Vazgeç</button></div></div>`;
}
function challengeResultHTML(){
  const c = S.challenge; if (!c || !c.rec) return "";
  const mine = record()[0], his = parseInt(c.rec)||0;
  const verdict = mine>his ? `🏆 Kazandın! ${esc(c.from)}'i geçtin.` : mine<his ? `😤 ${esc(c.from)} kazandı. Bir daha dene!` : "🤝 Berabere!";
  return `<div class="card chal" style="margin:10px 0"><b>⚔️ Meydan okuma sonucu</b><div style="font-size:22px;font-weight:800;font-family:var(--cond);margin:4px 0">Sen ${recStr()} · ${esc(c.from)} ${esc(c.rec)}</div>${verdict}</div>`;
}
function challengeLink(){
  const base = IS_WEB ? location.origin+location.pathname : SITE_URL;
  return `${base}?m=${(S.seed>>>0).toString(36)}&d=${encodeURIComponent(S.form)}&s=${recStr()}&n=${encodeURIComponent(myName())}`;
}
async function shareChallenge(){
  const url = challengeLink(), txt = `⚔️ ${myName()} sana Süper Lig 7-0'da meydan okuyor! Ben ${recStr()} yaptım, aynı kurayla sen kaç yaparsın?`;
  try { if (navigator.share){ await navigator.share({title:"Süper Lig 7-0 meydan okuma", text:txt, url}); return; } } catch(e){ if (e && e.name==="AbortError") return; }
  const el = $("chalout"); if (!el) return;
  el.innerHTML = `<textarea class="inp" rows="3" readonly onclick="this.select()">${esc(txt+"\n"+url)}</textarea>`;
  try { await navigator.clipboard.writeText(txt+"\n"+url); el.insertAdjacentHTML("beforeend", `<div class="mut" style="font-size:12px">Link kopyalandı ✓ WhatsApp'a yapıştır.</div>`); } catch(e){}
}
