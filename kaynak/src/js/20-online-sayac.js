// ---------- anlık online sayacı (Firebase Realtime Database) ----------
// Üstteki "N ONLINE" rozeti geçici olarak gizli. Geri getirmek için true yap. (Sayım arka planda devam ediyor.)
const SHOW_ONLINE = false;
const FB_CONFIG = {
  apiKey: "AIzaSyAyukQnm1cLDRt9uq-lD4kXIv2YuKBgDH4",
  authDomain: "superlig70-5e30a.firebaseapp.com",
  databaseURL: "https://superlig70-5e30a-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "superlig70-5e30a",
  appId: "1:202497077193:web:e89a7e289d76e60e3c8218"
};
function loadScript(src){ return new Promise((ok,no)=>{ const s=document.createElement("script"); s.src=src; s.async=true; s.onload=ok; s.onerror=no; document.head.appendChild(s); }); }
let FB=null, FBready=null;
function fb(){
  if (!FBready) FBready = (async()=>{
    if (!(typeof location!=="undefined" && location.protocol.startsWith("http"))) throw new Error("offline");
    const V="10.12.2";
    await loadScript(`https://www.gstatic.com/firebasejs/${V}/firebase-app-compat.js`);
    await loadScript(`https://www.gstatic.com/firebasejs/${V}/firebase-database-compat.js`);
    const app = firebase.initializeApp(FB_CONFIG); FB = firebase.database(app); return FB;
  })();
  return FBready;
}
const TS = () => firebase.database.ServerValue.TIMESTAMP;
const nameKey = n => n.toLocaleLowerCase("tr-TR").replace(/[^a-z0-9çğıöşü]/g,"");
async function startPresence(){
  try {
    const db = await fb(), list = db.ref("presence");
    db.ref(".info/connected").on("value", snap => {
      if (snap.val() !== true) return;
      const me = list.push();
      me.onDisconnect().remove().then(()=> me.set({ t: TS() }));
    });
    list.on("value", snap => { $("onlineN").textContent = Math.max(1, snap.numChildren()); if (SHOW_ONLINE) $("online").classList.remove("hidden"); },
      () => $("online").classList.add("hidden"));
    watchLeader();
  } catch(e) { /* sunucu yoksa oyun normal çalışır */ }
}
