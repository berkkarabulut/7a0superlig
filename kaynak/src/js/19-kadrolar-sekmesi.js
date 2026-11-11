// ---------- kadrolar ----------
function renderSquads(sel){
  const seasons = Object.keys(DATA); sel = sel || seasons.at(-1);
  $("squads").innerHTML = `<h1>Kadrolar</h1><p class="mut" style="font-size:13px">Yanlış bir şey mi gördün? Oyuncunun yanındaki ⚠️ ile ya da kadronun altındaki 🚩 Bildir ile birden fazla oyuncuyu seçip bildir, düzeltelim.</p>
    <div class="scrollx" style="margin:12px 0 18px">${seasons.map(s=>`<button class="chip ${s===sel?"on":""}" onclick="renderSquads('${s}')">${s}</button>`).join("")}</div>
    <div class="plist" style="grid-template-columns:repeat(auto-fill,minmax(min(320px,100%),1fr))">${DATA[sel].map(t=>`
      <div class="card" style="border-top:4px solid ${kitC(t.team)[0]}"><h2>${t.rank}. ${kit(t.team)}${esc(t.team)}</h2><div class="mut" style="font-size:12px;margin:-6px 0 8px">${esc(rankNote(sel,t.rank))}${COACH[sel+"|"+t.team]?` · TD: ${esc(COACH[sel+"|"+t.team])}`:""}</div>
      <table>${t.players.map(p=>`<tr><td><span class="pos ${p.p[0]}">${roles(p).map(r=>LABEL[r]).join("/")}</span></td><td>${esc(p.n)}${p.r>=LEGEND?'<span class="seal">★</span>':""}</td><td class="rt" style="text-align:right"><span class="rv ${tierAlways(p.r)}">${p.r}</span></td><td style="width:28px"><button class="repbtn" title="Hata bildir" onclick="openReport('${sel}','${esc(t.team)}','${esc(p.n).replace(/'/g,"\\'")}')">⚠️</button></td></tr>`).join("")}</table>
      <div class="row" style="margin-top:8px"><button class="chip" style="font-size:12px" onclick="openMultiReport('${sel}','${esc(t.team)}')">🚩 Bildir</button><button class="chip" style="font-size:12px" onclick="openReport('${sel}','${esc(t.team)}','')">➕ Eksik oyuncu bildir</button></div></div>`).join("")}
    </div>`;
}


