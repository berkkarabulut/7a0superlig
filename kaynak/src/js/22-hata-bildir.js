// ---------- hata bildir ----------
const REPORT_TYPES = ["O sezon bu takımda oynamadı","Mevkisi yanlış","Reytingi yanlış","İsmi yanlış yazılmış","Diğer"];
function openReport(season, team, player){
  const m = document.createElement("div"); m.id="repbox"; m.className="modal";
  const isMissing = !player;
  m.innerHTML = `<div class="mbox"><div class="row" style="justify-content:space-between"><h3 style="margin:0">⚠️ ${isMissing?"Eksik oyuncu bildir":"Hata bildir"}</h3><button class="chip" onclick="closeReport()">✕</button></div>
    <p class="mut" style="margin:8px 0">${esc(season)} ${esc(team)}${player?` · <b style="color:var(--txt)">${esc(player)}</b>`:""}</p>
    ${isMissing?`<input id="rp_name" class="inp" maxlength="60" placeholder="Eksik oyuncunun adı soyadı">
      <select id="rp_pos" class="inp">${Object.entries(NAME).filter(([k])=>!["RWB","LWB"].includes(k)).map(([k,v])=>`<option value="${k}">${v}</option>`).join("")}</select>`
    :`<div class="col">${REPORT_TYPES.map((r,i)=>`<label class="toggle"><input type="radio" name="rp_t" value="${i}" ${i===0?"checked":""}> ${r}</label>`).join("")}</div>`}
    <textarea id="rp_msg" class="inp" rows="3" maxlength="300" placeholder="${isMissing?"Not (isteğe bağlı): kaç maç oynadı, kaynak vs.":"Doğrusu ne? Örn: o sezon Kocaelispor'daydı / sağ bek oynardı"}"></textarea>
    <div class="row" style="margin-top:10px"><button class="btn" id="rp_send" onclick="sendReport('${esc(season)}','${esc(team).replace(/'/g,"\\'")}','${esc(player||"").replace(/'/g,"\\'")}')">Gönder</button></div>
    <p class="mut" id="rp_info" style="font-size:13px;margin:8px 0 0"></p></div>`;
  m.addEventListener("click", e=>{ if(e.target===m) closeReport(); });
  document.body.appendChild(m);
}
function closeReport(){ document.getElementById("repbox")?.remove(); }
function openMultiReport(season, team){
  const tm = (DATA[season]||[]).find(x=>x.team===team); if(!tm) return;
  const m = document.createElement("div"); m.id="repbox"; m.className="modal";
  const types = ["İsmi yanlış yazılmış","O sezon bu takımda oynamadı","Mevkisi yanlış","Reytingi yanlış","Diğer"];
  m.innerHTML = `<div class="mbox"><div class="row" style="justify-content:space-between"><h3 style="margin:0">🚩 Kadroda hata bildir</h3><button class="chip" onclick="closeReport()">✕</button></div>
    <p class="mut" style="margin:8px 0">${kit(team)}${esc(season)} ${esc(team)} · hatalı oyuncuları seç</p>
    <div class="mlist">${tm.players.map((p,i)=>`<label class="toggle"><input type="checkbox" class="mr_cb" value="${i}"> ${esc(p.n)} <span class="mut" style="font-size:12px">${roles(p).map(r=>LABEL[r]).join("/")} · ${p.r}</span></label>`).join("")}</div>
    <div class="col" style="margin-top:8px">${types.map((r,i)=>`<label class="toggle"><input type="radio" name="mr_t" value="${i}" ${i===0?"checked":""}> ${r}</label>`).join("")}</div>
    <textarea id="mr_msg" class="inp" rows="3" maxlength="300" placeholder="Doğrusu ne? Örn: doğrusu Ümit Davala / o sezon Kocaelispor'daydı"></textarea>
    <div class="row" style="margin-top:10px"><button class="btn" id="mr_send">Gönder</button></div>
    <p class="mut" id="mr_info" style="font-size:13px;margin:8px 0 0"></p></div>`;
  m.addEventListener("click", e=>{ if(e.target===m) closeReport(); });
  document.body.appendChild(m);
  $("mr_send").onclick = async () => {
    const sel=[...document.querySelectorAll(".mr_cb:checked")].map(c=>tm.players[+c.value].n), info=$("mr_info"), btn=$("mr_send");
    if (!sel.length){ info.textContent="En az bir oyuncu seç."; return; }
    btn.disabled=true; info.textContent="Gönderiliyor…";
    const type=types[+document.querySelector('input[name="mr_t"]:checked').value], msg=($("mr_msg").value||"").trim().slice(0,300);
    try { const db=await fb(); for (const n of sel) await db.ref("reports").push({season, team, player:n.slice(0,60), type, msg, by:myName(), t:TS()});
      info.innerHTML=`Teşekkürler! ${sel.length} oyuncu bildirildi ✓`; setTimeout(closeReport,1400); }
    catch(e){ info.textContent="Gönderilemedi, internet bağlantını kontrol edip tekrar dene."; btn.disabled=false; }
  };
}
async function sendReport(season, team, player){
  const btn=$("rp_send"), info=$("rp_info"); btn.disabled=true; info.textContent="Gönderiliyor…";
  const isMissing=!player;
  const rec = { season, team, player: isMissing ? (($("rp_name").value||"").trim().slice(0,60)) : player,
    type: isMissing ? "Eksik oyuncu · "+NAME[$("rp_pos").value] : REPORT_TYPES[+document.querySelector('input[name="rp_t"]:checked').value],
    msg: ($("rp_msg").value||"").trim().slice(0,300), by: myName() };
  if (isMissing && rec.player.length<3){ info.textContent="Oyuncunun adını yaz."; btn.disabled=false; return; }
  try { const db = await fb(); await db.ref("reports").push({...rec, t: TS()}); info.innerHTML="Teşekkürler! Bildirimin ulaştı ✓"; setTimeout(closeReport, 1400); }
  catch(e){ info.textContent="Gönderilemedi, internet bağlantını kontrol edip tekrar dene."; btn.disabled=false; }
}
