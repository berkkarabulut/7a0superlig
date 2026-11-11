// ---------- yayıncı modu: büyük yazı, numaralı oyuncular, sohbet oylaması sayacı, klavye kısayolu ----------
const streamer = () => store.get("streamer", {on:false, sec:20});
function applyStreamerMode(){ try { document.body.classList.toggle("yayinci", streamer().on); } catch(e){} }
function setStreamer(on, sec){ const s=streamer(); if (on!=null) s.on=on; if (sec) s.sec=sec; store.set("streamer", s); applyStreamerMode(); renderStart(); }
let voteTimer = null, numBuf = "", numTO = null;
function startVote(){
  const s = streamer(); if (!s.on) return; clearInterval(voteTimer);
  const el = $("votebar"); if (!el || !el.querySelector) return;
  let left = s.sec; const paint = () => { el.innerHTML = left>0 ? `<div class="vote"><b>💬 SOHBET OYLAMASI</b> · numarayı yazın · <b>${left} sn</b><i style="width:${left/s.sec*100}%"></i></div>`
    : `<div class="vote vote-end"><b>⏰ SÜRE DOLDU!</b> En çok yazılan numarayı seç (klavyeden numarayı da yazabilirsin)</div>`; };
  paint(); voteTimer = setInterval(()=>{ left--; paint(); if (left<=0) clearInterval(voteTimer); }, 1000);
}
if (typeof document!=="undefined" && document.addEventListener) document.addEventListener("keydown", e => {
  if (!streamer().on || !S.cur || !/^[0-9]$/.test(e.key) || ["INPUT","TEXTAREA"].includes(e.target.tagName)) return;
  if ($("play").classList.contains("hidden") || !document.querySelector(".plist")) return;
  numBuf += e.key; clearTimeout(numTO);
  numTO = setTimeout(()=>{ const i = parseInt(numBuf,10)-1; numBuf=""; if (S.cur.players[i] && canPick(S.cur.players[i])) pick(i); }, 550);
});
