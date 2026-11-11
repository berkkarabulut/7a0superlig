// ---------- "Bu kadro hangi sezon?" bilgi yarışması ----------
const QN = 5;
function quizBest11(t){
  const take = (line, n) => t.players.filter(p=>p.p[0]===line).sort((a,b)=>b.r-a.r).slice(0,n);
  let xi = [...take("GK",1), ...take("DF",4), ...take("MF",3), ...take("FW",3)];
  if (xi.length<11) xi = xi.concat(t.players.filter(p=>!xi.includes(p)).sort((a,b)=>b.r-a.r).slice(0,11-xi.length));
  return xi;
}
function startQuiz(practice){
  const day = todayKey(), seed = practice ? Math.floor(Math.random()*1e9) : [...("quiz"+day)].reduce((a,c)=>a*31+c.charCodeAt(0),11);
  const R = seeded(seed), pick = a => a[Math.floor(R()*a.length)];
  const pool = POOL.filter(t=>t.players.length>=11), qs = [], used = new Set();
  while (qs.length<QN){ const t = pick(pool); if (used.has(t.id)) continue; used.add(t.id);
    const same = pool.filter(x=>x.team===t.team && x.id!==t.id), other = pool.filter(x=>x.team!==t.team), opts=[t];
    while (opts.length<4){ const c = (opts.length<3 && same.length && R()<0.75) ? pick(same) : pick(other); if (!opts.includes(c)) opts.push(c); }
    for (let i=opts.length-1;i>0;i--){ const j=Math.floor(R()*(i+1)); [opts[i],opts[j]]=[opts[j],opts[i]]; }
    qs.push({t, opts}); }
  S.Q = {qs, i:0, ans:[], practice, day};
  if (!practice) bump("q");
  renderQuiz();
}
function renderQuiz(){
  const Q=S.Q, q=Q.qs[Q.i], done=Q.ans.length>Q.i, xi=quizBest11(q.t);
  const lines = ["FW","MF","DF","GK"].map(l=>xi.filter(p=>p.p[0]===l));
  $("play").innerHTML = `<div class="pathbar">${exitBtn(Q.practice?"":"Yarıda bırakırsan bugünkü quiz sayılmaz, tekrar başlayınca aynı sorular gelir.")}</div><div class="card quiz"><div class="row" style="justify-content:space-between"><h2 style="margin:0">🧠 Bu kadro hangi sezon?</h2><span class="badge">${Q.i+1}/${QN}${Q.practice?" · pratik":""}</span></div>
    <p class="mut" style="margin:6px 0 10px">İpucu: ${q.t.rank===1?"o sezonun şampiyonu":`ligi ${q.t.rank}. bitirdi`}${coachOf(q.t)?` · teknik direktörü ${esc(coachOf(q.t)).replace(/(?<=\S)\S+/g,m=>m.replace(/./g,"•"))}`:""}</p>
    <div class="qpitch">${lines.map(ps=>`<div class="qline">${ps.map(p=>`<span class="qp"><span class="pos ${p.p[0]}">${roles(p).map(r=>LABEL[r])[0]}</span>${esc(p.n)}</span>`).join("")}</div>`).join("")}</div>
    <div class="qopts">${q.opts.map((o,k)=>{ const cls = done ? (o===q.t?"right":(Q.ans[Q.i]===k?"wrong":"")) : "";
      return `<button class="card qopt ${cls}" ${done?"disabled":`onclick="quizAnswer(${k})"`}>${kit(o.team)}<b>${o.season}</b> ${esc(o.team)}</button>`; }).join("")}</div>
    ${done?`<div class="row" style="margin-top:12px"><button class="btn gold" onclick="quizNext()">${Q.i+1<QN?"Sonraki soru ▶":"Sonucu gör ▶"}</button></div>`:""}</div>`;
}
function quizAnswer(k){ const Q=S.Q; if (Q.ans.length>Q.i) return; Q.ans.push(k); renderQuiz(); }
function quizNext(){ const Q=S.Q; if (Q.i+1<QN){ Q.i++; renderQuiz(); } else quizEnd(); }
function quizEnd(){
  const Q=S.Q, marks = Q.qs.map((q,i)=>q.opts[Q.ans[i]]===q.t), score = marks.filter(Boolean).length;
  const prev = store.get("quiz:"+Q.day, null); if (!Q.practice && !prev) store.set("quiz:"+Q.day, {score, marks});
  const line = marks.map(m=>m?"🟩":"🟥").join("");
  S.quizShare = `🧠 Süper Lig 7-0 · Bu kadro hangi sezon?\n${Q.practice?"Pratik":todayKey()}: ${score}/${QN} ${line}\n${SITE}`;
  $("play").innerHTML = `<div class="card result"><div class="rec ${score===QN?"gold":score>=3?"W":"L"}">${score}/${QN}</div><div style="font-size:28px">${line}</div>
    <p>${score===QN?"Ansiklopedi gibisin! 🧠":score>=3?"Fena değil, futbolu biliyorsun.":"Bir daha dene, kadroları Kadrolar sekmesinden çalışabilirsin 😄"}</p>
    ${!Q.practice&&prev?`<p class="mut">Bugünkü ilk sonucun ${prev.score}/${QN} olarak kaldı. Yarın yeni sorular gelecek.</p>`:!Q.practice?`<p class="mut">Yarın yeni sorular gelecek.</p>`:""}
    <div class="col" style="text-align:left;max-width:520px;margin:10px auto">${Q.qs.map((q,i)=>`<div>${marks[i]?"✅":"❌"} ${kit(q.t.team)}${q.t.season} ${esc(q.t.team)}</div>`).join("")}</div>
    <div class="row" style="justify-content:center;margin-top:10px"><button class="btn gold" onclick="quizShare()">📤 Paylaş</button><button class="btn ghost" onclick="startQuiz(true)">Pratik yap</button><button class="btn ghost" onclick="renderStart()">Ana sayfa</button></div>
    <div id="quizout" style="max-width:520px;margin:8px auto 0"></div></div>`;
}
async function quizShare(){
  try { if (navigator.share){ await navigator.share({text:S.quizShare}); return; } } catch(e){ if (e && e.name==="AbortError") return; }
  $("quizout").innerHTML = `<textarea class="inp" rows="4" readonly onclick="this.select()">${esc(S.quizShare)}</textarea>`;
  try { await navigator.clipboard.writeText(S.quizShare); $("quizout").insertAdjacentHTML("beforeend",`<div class="mut" style="font-size:12px">Kopyalandı ✓</div>`); } catch(e){}
}
