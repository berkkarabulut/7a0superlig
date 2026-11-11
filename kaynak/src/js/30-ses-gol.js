// ---------- stadyum sesi ve gol animasyonu (dosya yok, sesler tarayıcıda üretilir) ----------
let AC = null;
const soundOn = () => store.get("sound", true);
function ac(){ try { if (!AC) AC = new (window.AudioContext||window.webkitAudioContext)(); if (AC.state==="suspended") AC.resume(); return AC; } catch(e){ return null; } }
function noise(dur, f0, f1, vol){
  const a=ac(); if(!a) return; const n=a.sampleRate*dur, buf=a.createBuffer(1,n,a.sampleRate), d=buf.getChannelData(0);
  for (let i=0;i<n;i++) d[i]=(Math.random()*2-1)*(0.6+0.4*Math.sin(i/a.sampleRate*9));
  const src=a.createBufferSource(); src.buffer=buf; const bp=a.createBiquadFilter(); bp.type="bandpass"; bp.Q.value=0.8;
  bp.frequency.setValueAtTime(f0,a.currentTime); bp.frequency.linearRampToValueAtTime(f1,a.currentTime+dur);
  const g=a.createGain(); g.gain.setValueAtTime(0.0001,a.currentTime); g.gain.exponentialRampToValueAtTime(vol,a.currentTime+0.25); g.gain.exponentialRampToValueAtTime(0.0001,a.currentTime+dur);
  src.connect(bp).connect(g).connect(a.destination); src.start();
}
function whistle(times=1){
  const a=ac(); if(!a) return;
  for (let k=0;k<times;k++){ const t=a.currentTime+k*0.42, o=a.createOscillator(), lfo=a.createOscillator(), lg=a.createGain(), g=a.createGain();
    o.frequency.value=2900; lfo.frequency.value=32; lg.gain.value=120; lfo.connect(lg).connect(o.frequency);
    g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.12,t+0.03); g.gain.setValueAtTime(0.12,t+(k===times-1?0.5:0.25)); g.gain.exponentialRampToValueAtTime(0.0001,t+(k===times-1?0.6:0.32));
    o.connect(g).connect(a.destination); o.start(t); lfo.start(t); o.stop(t+0.7); lfo.stop(t+0.7); }
}
function sfx(kind, mine){
  if (!soundOn() || SPEEDS[S.speed]===0) return;
  try {
    if (kind==="goal") mine ? noise(2.4, 700, 1300, 0.5) : noise(1.2, 500, 300, 0.18);
    else if (kind==="start") whistle(1);
    else if (kind==="half") whistle(2);
    else if (kind==="end") whistle(3);
    else if (kind==="miss") noise(0.9, 600, 350, 0.15);
  } catch(e){}
}
function goalFx(mine){
  if (typeof document==="undefined" || typeof document.querySelector!=="function") return;
  const box = document.querySelector("#play .score"); if (!box || SPEEDS[S.speed]===0) return;
  const d = document.createElement("div"); d.className = "golfx "+(mine?"golfx-me":"golfx-op"); d.textContent = mine?"GOL!":"GOL…";
  box.style.position="relative"; box.appendChild(d); setTimeout(()=>d.remove(), 1500);
}
function paintSoundBtn(){
  if (typeof document==="undefined" || typeof document.querySelector!=="function" || typeof document.createElement!=="function") return;
  let b = $("sndbtn");
  if (!b || !b.tagName){ const nav=document.querySelector("header nav"); if(!nav || !nav.prepend) return; b=document.createElement("button"); b.id="sndbtn"; b.title="Stadyum sesi"; b.onclick=()=>{ store.set("sound", !soundOn()); ac(); paintSoundBtn(); }; nav.prepend(b); }
  b.textContent = soundOn() ? "🔊" : "🔇";
}
