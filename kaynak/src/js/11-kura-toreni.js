// ---------- kura töreni ----------
function drawCeremony(title, note, items, doneTxt, onDone){
  let k=0, busy=false;
  const nm = t => esc(t.season.slice(2)+" "+t.team);
  const resHTML = r => Array.isArray(r) ? `${kit(r[0].team)}${nm(r[0])} <span class="mut">–</span> ${kit(r[1].team)}${nm(r[1])}` : `${kit(r.team)}${nm(r)}${coachOf(r)?`<div class="mut" style="font-size:12px;font-weight:500">TD: ${esc(coachOf(r))}</div>`:""}`;
  $("play").innerHTML = `<div class="pathbar">${exitBtn("Turnuvan başlamadan bitecek, kurduğun kadro kaybolur.")}</div><div class="card kura"><h1>🎱 ${esc(title)}</h1><p class="mut">${esc(note)}</p>
    <div class="pots">${items.map((it,i)=>`<div class="pot ${it.big?"big":""}"><div class="ph">${esc(it.label)}</div><div class="ball" id="ball${i}"><span class="q">?</span></div></div>`).join("")}</div>
    <div class="row" style="margin-top:14px" id="kbtns"><button class="btn" id="kdraw">🎱 Top çek</button><button class="btn ghost" id="kskip">Kurayı atla</button></div></div>`;
  const reveal = async (i, fast) => { const b=$("ball"+i), it=items[i]; b.classList.add("spin");
    if (!fast){ for (let j=0;j<12;j++){ const t=rnd(it.pool); b.innerHTML=`<span class="roll">${kit(t.team)}${nm(t)}</span>`; await sleep(60+j*12); } }
    b.classList.remove("spin"); b.classList.add("rev"); b.innerHTML = resHTML(it.res); };
  const done = () => { $("kbtns").innerHTML = `<button class="btn gold" id="kgo">${esc(doneTxt)} ▶</button>`; $("kgo").onclick = onDone; };
  $("kdraw").onclick = async () => { if (busy) return; busy=true; await reveal(k++, false); busy=false; if (k>=items.length) done(); };
  $("kskip").onclick = async () => { if (busy) return; busy=true; while (k<items.length) await reveal(k++, true); done(); };
}
