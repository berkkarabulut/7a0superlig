// ---------- Moderatör paneli ----------
// Giriş: üstteki "Süper Lig 7-0" yazısına hızlıca 5 kez dokun → Google ile giriş.
// Yetki Firebase kurallarında: sahipler (OWNERS) ve sahiplerin eklediği moderatörler (mods/).
const MOD_OWNERS = ["7a0superlig@gmail.com", "berkordr2@gmail.com"];
const MOD = { user: null, role: null, tab: "stat", mode: "sl", day: null };
const modKey = e => String(e || "").toLowerCase().split(".").join(",");
const modDay = (n = 0) => { const d = new Date(); d.setDate(d.getDate() - n); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const modFmtT = t => { if (!t) return ""; const d = new Date(t); return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" }) + " " + d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }); };

async function modAuth() {
  await fb();
  if (!firebase.auth) await loadScript("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js");
  return firebase.auth();
}

function modShell(inner) {
  let el = document.getElementById("modpanel");
  if (!el) {
    el = document.createElement("div"); el.id = "modpanel"; el.className = "mod-ov"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", "Moderatör paneli");
    el.addEventListener("click", e => { if (e.target === el) modClose(); });
    document.body.appendChild(el);
  }
  el.innerHTML = `<div class="mod-box"><div class="mod-hd"><b>🛡️ Moderatör paneli</b><button class="mod-x" onclick="modClose()" aria-label="Kapat">✕</button></div><div class="mod-bd">${inner}</div></div>`;
  el.classList.add("on"); document.body.style.overflow = "hidden";
  return el;
}
function modClose() { const el = document.getElementById("modpanel"); if (el) el.classList.remove("on"); document.body.style.overflow = ""; }

async function openMod() {
  modShell(`<p class="mod-mut">Yükleniyor…</p>`);
  try {
    const auth = await modAuth();
    const u = auth.currentUser || await new Promise(ok => { const off = auth.onAuthStateChanged(x => { off(); ok(x); }); });
    if (!u) return modLogin();
    await modRole(u);
  } catch (e) { modShell(`<p class="mod-err">Bağlantı kurulamadı${e && (e.code || e.message) ? ": " + esc(e.code || e.message) : ""}. İnternetini kontrol edip tekrar dene.</p>`); }
}

function modLogin(msg) {
  modShell(`${msg ? `<p class="mod-err">${esc(msg)}</p>` : ""}<p>Bu bölüm sadece site yönetimi içindir.</p><button class="mod-btn mod-g" id="modGo">Google ile giriş yap</button>`);
  document.getElementById("modGo").onclick = async () => {
    const auth = await modAuth(), p = new firebase.auth.GoogleAuthProvider(); p.setCustomParameters({ prompt: "select_account" });
    try { const r = await auth.signInWithPopup(p); await modRole(r.user); }
    catch (e) {
      if (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment") { await auth.signInWithRedirect(p); return; }
      if (e.code !== "auth/popup-closed-by-user" && e.code !== "auth/cancelled-popup-request") modLogin("Giriş yapılamadı: " + (e.code || e.message));
    }
  };
}

async function modRole(u) {
  MOD.user = u; MOD.role = null;
  const em = String(u.email || "").toLowerCase();
  if (u.emailVerified && MOD_OWNERS.includes(em)) MOD.role = "sahip";
  else if (u.emailVerified) { try { const s = await FB.ref("mods/" + modKey(em)).get(); if (s.val() === true) MOD.role = "mod"; } catch (e) {} }
  if (!MOD.role) {
    modShell(`<p class="mod-err">${esc(em)} hesabının moderatör yetkisi yok.</p><button class="mod-btn" id="modOut">Çıkış yap</button>`);
    document.getElementById("modOut").onclick = modLogout; return;
  }
  modRender();
}
async function modLogout() { try { (await modAuth()).signOut(); } catch (e) {} MOD.user = MOD.role = null; modClose(); }

function modTabs() {
  const t = [["stat", "📊 İstatistik"], ["sira", "🏆 Sıralamalar"], ["rapor", "📝 Bildirimler"], ["ad", "🏷️ Takım adları"]];
  if (MOD.role === "sahip") t.push(["mods", "👮 Moderatörler"]);
  return `<div class="mod-who">${esc(MOD.user.email)} · <b>${MOD.role === "sahip" ? "Sahip" : "Moderatör"}</b> <button class="mod-lnk" onclick="modLogout()">çıkış</button></div>
  <div class="mod-tabs">${t.map(([k, n]) => `<button class="mod-tab${MOD.tab === k ? " on" : ""}" onclick="MOD.tab='${k}';modRender()">${n}</button>`).join("")}</div>`;
}

async function modRender() {
  const el = modShell(modTabs() + `<div id="modc"><p class="mod-mut">Yükleniyor…</p></div>`);
  const c = el.querySelector("#modc");
  try { c.innerHTML = await ({ stat: modStat, sira: modSira, rapor: modRapor, ad: modAd, mods: modMods })[MOD.tab](); modBind(c); }
  catch (e) { c.innerHTML = `<p class="mod-err">Okunamadı: ${esc(e.code || e.message || e)}</p>`; }
}

async function modStat() {
  const days = [...Array(7)].map((_, i) => modDay(i));
  const rows = await Promise.all(days.map(async d => [d, (await FB.ref("stats/" + d).get()).val() || {}]));
  const on = (await FB.ref("presence").get()).numChildren();
  const src = {}; let T = { v: 0, g: 0, f: 0, u: 0, tel: 0, pc: 0 };
  rows.forEach(([, s]) => { T.v += s.v || 0; T.g += s.g || 0; T.f += s.f || 0; T.u += Object.keys(s.u || {}).length; T.tel += (s.dev || {}).telefon || 0; T.pc += (s.dev || {}).bilgisayar || 0; Object.entries(s.src || {}).forEach(([k, n]) => src[k] = (src[k] || 0) + n); });
  const srcName = k => ({ direkt: "Direkt", "davet-linki": "Davet linki", google_com: "Google", l_instagram_com: "Instagram", instagram_com: "Instagram", t_co: "Twitter/X", m_facebook_com: "Facebook", tiktok_com: "TikTok" })[k] || k.replace(/_/g, ".");
  return `<div class="mod-kpis"><div><b>${on}</b><span>şu an online</span></div><div><b>${T.v}</b><span>ziyaret (7 gün)</span></div><div><b>${T.g}</b><span>maç başladı</span></div><div><b>${T.f}</b><span>maç bitti</span></div></div>
  <table class="mod-tb"><tr><th>Gün</th><th>Ziyaret</th><th>Kişi</th><th>Maç</th><th>Biten</th><th>📱/💻</th></tr>
  ${rows.map(([d, s]) => `<tr><td>${d.slice(8)}.${d.slice(5, 7)}</td><td>${s.v || 0}</td><td>${Object.keys(s.u || {}).length}</td><td>${s.g || 0}</td><td>${s.f || 0}</td><td>${(s.dev || {}).telefon || 0}/${(s.dev || {}).bilgisayar || 0}</td></tr>`).join("")}</table>
  <h4 class="mod-h">Nereden geldiler (7 gün)</h4>
  <table class="mod-tb">${Object.entries(src).sort((a, b) => b[1] - a[1]).map(([k, n]) => `<tr><td>${esc(srcName(k))}</td><td>${n}</td></tr>`).join("") || `<tr><td class="mod-mut">Veri yok</td></tr>`}</table>
  <p class="mod-mut">Şehir bilgisi Google Analytics'te (sadece çerezi kabul edenler).</p>`;
}

async function modSira() {
  const day = MOD.day || modDay(0), paths = { sl: "2026-27 Süper Lig", real: "Gerçek takım", solo: "Efsaneler Draft'ı", daily: "Günün Meydan Okuması" };
  const v = (await FB.ref(MOD.mode + "/" + day).get()).val() || {};
  const list = Object.entries(v).sort((a, b) => (b[1].w - a[1].w) || ((b[1].gf - b[1].ga) - (a[1].gf - a[1].ga)) || (b[1].gf - a[1].gf));
  return `<div class="mod-row"><select class="mod-in" onchange="MOD.mode=this.value;modRender()">${Object.entries(paths).map(([k, n]) => `<option value="${k}"${MOD.mode === k ? " selected" : ""}>${n}</option>`).join("")}</select>
  <input class="mod-in" type="date" value="${day}" onchange="MOD.day=this.value;modRender()"></div>
  <table class="mod-tb"><tr><th>#</th><th>İsim</th><th>G</th><th>Gol</th><th>Saat</th><th></th></tr>
  ${list.map(([k, e], i) => `<tr><td>${i + 1}</td><td>${esc(e.name || "?")}${e.team ? `<small class="mod-mut"> · ${esc(e.team)}</small>` : ""}</td><td>${e.w ?? "-"}</td><td>${e.gf ?? 0}-${e.ga ?? 0}</td><td>${esc(modFmtT(e.t))}</td>
  <td><button class="mod-del" data-del="${esc(MOD.mode + "/" + day + "/" + k)}" data-what="${esc(e.name || "kayıt")}">Sil</button></td></tr>`).join("") || `<tr><td colspan="6" class="mod-mut">Bu gün için kayıt yok</td></tr>`}</table>`;
}

async function modRapor() {
  const v = (await FB.ref("reports").orderByChild("t").limitToLast(150).get()).val() || {};
  const list = Object.entries(v).sort((a, b) => (b[1].t || 0) - (a[1].t || 0));
  return `<p class="mod-mut">Kadro şikâyetleri, öneriler ve hata bildirimleri (son 150).</p>
  ${list.map(([k, r]) => `<div class="mod-card"><div><b>${esc(r.type || "Bildirim")}</b> <small class="mod-mut">${esc(modFmtT(r.t))}</small></div>
  <div>${esc([r.season, r.team, r.player].filter(x => x && x !== "-").join(" · "))}</div>${r.msg ? `<div class="mod-msg">${esc(r.msg)}</div>` : ""}
  <button class="mod-del" data-del="${esc("reports/" + k)}" data-what="bu bildirimi">Sil</button></div>`).join("") || `<p class="mod-mut">Bildirim yok.</p>`}`;
}

async function modAd() {
  const v = (await FB.ref("names").get()).val() || {};
  const q = (MOD.q || "").toLocaleLowerCase("tr-TR");
  const list = Object.entries(v).filter(([k, n]) => !q || String(n.n || "").toLocaleLowerCase("tr-TR").includes(q)).sort((a, b) => (b[1].t || 0) - (a[1].t || 0));
  return `<div class="mod-row"><input class="mod-in" placeholder="Takım adı ara…" value="${esc(MOD.q || "")}" onchange="MOD.q=this.value;modRender()"></div>
  <p class="mod-mut">${list.length} ayrılmış takım adı. Silinen ad başkası tarafından alınabilir hale gelir.</p>
  <table class="mod-tb">${list.slice(0, 300).map(([k, n]) => `<tr><td>${esc(n.n || k)}</td><td>${esc(modFmtT(n.t))}</td><td><button class="mod-del" data-del="${esc("names/" + k)}" data-what="${esc(n.n || k)}">Sil</button></td></tr>`).join("")}</table>`;
}

async function modMods() {
  const v = (await FB.ref("mods").get()).val() || {};
  return `<p class="mod-mut">Moderatörler Google hesabıyla giriş yapar; sıralama, bildirim ve takım adlarını silebilir, istatistikleri görür. Moderatör ekleyip çıkarmak sadece sahiplerde.</p>
  <div class="mod-row"><input class="mod-in" id="modNew" type="email" placeholder="ornek@gmail.com"><button class="mod-btn" id="modAdd">Ekle</button></div>
  <table class="mod-tb">${MOD_OWNERS.map(e => `<tr><td>${esc(e)}</td><td class="mod-mut">sahip</td><td></td></tr>`).join("")}
  ${Object.keys(v).map(k => { const e = k.split(",").join("."); return `<tr><td>${esc(e)}</td><td class="mod-mut">moderatör</td><td><button class="mod-del" data-del="${esc("mods/" + k)}" data-what="${esc(e)}">Çıkar</button></td></tr>`; }).join("")}</table>`;
}

function modBind(c) {
  c.querySelectorAll("[data-del]").forEach(b => b.onclick = async () => {
    if (!confirm(`"${b.dataset.what}" silinsin mi? Geri alınamaz.`)) return;
    b.disabled = true;
    try { await FB.ref(b.dataset.del).remove(); modRender(); }
    catch (e) { b.disabled = false; alert("Silinemedi: " + (e.code || e.message)); }
  });
  const add = c.querySelector("#modAdd");
  if (add) add.onclick = async () => {
    const e = c.querySelector("#modNew").value.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return alert("Geçerli bir e-posta yaz");
    try { await FB.ref("mods/" + modKey(e)).set(true); modRender(); } catch (er) { alert("Eklenemedi: " + (er.code || er.message)); }
  };
}

// Gizli giriş: logodaki yazıya hızlıca 5 kez dokun (butonlar hariç)
(() => {
  let taps = 0, tt = 0;
  const lg = document.querySelector(".hdr .logo"); if (!lg) return;
  lg.addEventListener("click", e => {
    if (e.target.closest("button")) return;
    const n = Date.now(); taps = n - tt < 700 ? taps + 1 : 1; tt = n;
    if (taps >= 5) { taps = 0; openMod(); }
  });
})();
