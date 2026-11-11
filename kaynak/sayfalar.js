// Google için statik kadro sayfaları üretir: /kadro/*.html, /kadro/index.html, sitemap.xml, robots.txt
// Çalıştır: node kaynak/sayfalar.js   (build.py bunu otomatik çağırır)
const fs = require("fs"), path = require("path");
const HERE = __dirname, ROOT = path.join(HERE, ".."), OUT = path.join(ROOT, "kadro");
const SITE = "https://7a0superlig.com";
const DATA = JSON.parse(fs.readFileSync(path.join(HERE, "data4.json"), "utf8"));

// renk ve hoca tablolarını oyunun kendi kaynağından al (tek doğru kaynak)
const src = fs.readFileSync(path.join(HERE, "src/js/03-takim-renk-td-hakem.js"), "utf8");
const grab = name => { const m = src.match(new RegExp("const " + name + " = (\\{[\\s\\S]*?\\n?\\});")); return m ? Function("return " + m[1])() : {}; };
const COLORS = grab("COLORS"), COACH = grab("COACH");
const LABEL = { GK:"KL", RB:"SĞB", CB:"STP", LB:"SLB", DM:"ÖL", CM:"MO", AM:"OOS", RM:"SĞO", LM:"SLO", RW:"SĞK", LW:"SLK", ST:"FV", RWB:"SĞB/O", LWB:"SLB/O" };
const LONG = { GK:"Kaleci", RB:"Sağ bek", CB:"Stoper", LB:"Sol bek", DM:"Ön libero", CM:"Merkez orta saha", AM:"Ofansif orta saha", RM:"Sağ orta saha", LM:"Sol orta saha", RW:"Sağ kanat", LW:"Sol kanat", ST:"Forvet" };
const GROUPS = [["GK","Kaleciler"],["DF","Defans"],["MF","Orta saha"],["FW","Forvet"]];

const slug = s => s.toLocaleLowerCase("tr").replace(/ı/g,"i").replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ş/g,"s").replace(/ö/g,"o").replace(/ç/g,"c").replace(/đ/g,"d")
  .normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const gen = w => { const v = (w.toLocaleLowerCase("tr").match(/[aıoueiöü](?=[^aıoueiöü]*$)/)||["a"])[0];
  const h = {a:"ı",ı:"ı",e:"i",i:"i",o:"u",u:"u",ö:"ü",ü:"ü"}[v]; return w + "'" + (/[aıoueiöü]$/i.test(w) ? "n" : "") + h + "n"; };
const finish = t => (t.note || "").split("·")[0].trim();
const rankTxt = r => ({1:"birinci",2:"ikinci",3:"üçüncü"})[r] || r + ".";
const kitC = team => COLORS[team] || ["#6b4f86","#ffffff"];
const pageName = (season, team) => `${season}-${slug(team)}.html`;

const all = []; // {season, team, rank, note, players}
for (const season of Object.keys(DATA)) for (const t of DATA[season]) all.push({ season, ...t });
const seasons = Object.keys(DATA);
const clubs = [...new Set(all.map(t => t.team))].sort((a,b) => all.filter(x=>x.team===b).length - all.filter(x=>x.team===a).length);

const CSS = `:root{--bg:#14061f;--card:#1d0a30;--line:#3e1a5c;--txt:#f3eefa;--mut:#c2b3d6;--gold:#ffb703;--red:#e30a17;--green:#00a88f}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--txt);font:16px/1.55 Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
a{color:var(--gold)}.top{height:8px;background:var(--red)}
.hd{max-width:900px;margin:0 auto;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.logo{font-weight:900;font-size:24px;letter-spacing:-.5px;color:#fff;text-decoration:none;text-transform:uppercase}.logo b{background:var(--red);padding:0 8px;margin-left:6px;border-radius:3px}
main{max-width:900px;margin:0 auto;padding:6px 18px 50px}
.bc{font-size:14px;color:var(--mut)}.bc a{color:var(--mut)}
h1{font-size:32px;line-height:1.15;margin:10px 0 6px}h2{font-size:20px;margin:28px 0 10px;color:var(--gold)}
.sub{color:var(--mut);margin:0 0 14px}.sub b{color:var(--txt)}
.tag{display:inline-block;padding:2px 10px;border-radius:3px;font-weight:800;font-size:14px;margin-right:6px}
.t1{background:var(--gold);color:#1d1200}.t2{background:#c9c9d6;color:#14061f}.t3{background:#c07a3a;color:#fff}
.kit{display:inline-block;width:18px;height:18px;border-radius:3px;vertical-align:-3px;margin-right:8px;border:3px solid var(--c2);background:var(--c1)}
.cta{display:inline-block;background:var(--red);color:#fff;text-decoration:none;font-weight:800;padding:12px 20px;border-radius:4px;margin:8px 0;font-size:17px}
.cta:hover{filter:brightness(1.1)}
table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:6px;overflow:hidden}
th,td{padding:8px 12px;text-align:left;border-bottom:1px solid var(--line)}th{font-size:13px;color:var(--mut);text-transform:uppercase;letter-spacing:.5px}
td.r{font-weight:800;width:60px;text-align:center}td.p{color:var(--mut);font-size:14px}
.r90{color:var(--gold)}.r85{color:#7fe3a0}
.grid{display:flex;flex-wrap:wrap;gap:8px}.grid a{background:var(--card);border:1px solid var(--line);padding:6px 12px;border-radius:4px;text-decoration:none;color:var(--txt);font-size:15px}
.grid a:hover{border-color:var(--gold)}
.box{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--gold);border-radius:6px;padding:12px 16px}
.season{margin:0 0 18px}.season h3{margin:0 0 6px;font-size:17px}
footer{max-width:900px;margin:0 auto;padding:20px 18px 40px;color:var(--mut);font-size:13px;text-align:center}footer a{color:var(--mut)}`;

function shell({ title, desc, url, body, ld }){
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Süper Lig 7-0">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}"><meta property="og:image" content="${SITE}/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/icon-192.png">
${ld ? `<script type="application/ld+json">${JSON.stringify(ld)}</script>` : ""}
<style>${CSS}</style>
</head>
<body>
<div class="top"></div>
<div class="hd"><a class="logo" href="/">Süper Lig<b>7-0</b></a><a class="cta" style="margin:0;padding:8px 14px;font-size:15px" href="/">▶ Oyna</a></div>
<main>
${body}
</main>
<footer><a href="/">Süper Lig 7-0</a> · <a href="/kadro/">Tüm kadrolar</a> · <a href="/gizlilik.html">Gizlilik politikası</a> · <a href="mailto:mberkarabulut@gmail.com">İletişim</a><br>Reytingler oyun için hazırlanmış tahmini değerlerdir; resmi bir kaynağa dayanmaz.</footer>
</body>
</html>
`;
}

function teamPage(t){
  const url = `${SITE}/kadro/${pageName(t.season, t.team)}`, coach = COACH[t.season + "|" + t.team] || "";
  const ps = [...t.players].sort((a,b) => b.r - a.r), top = ps.slice(0, 3), avg = Math.round(ps.reduce((s,p)=>s+p.r,0) / ps.length);
  const fin = finish(t), [c1, c2] = kitC(t.team);
  const tagCls = "t" + Math.min(t.rank, 3);
  const others = all.filter(x => x.season === t.season && x.team !== t.team);
  const club = all.filter(x => x.team === t.team);
  const prevSeason = seasons[seasons.indexOf(t.season) - 1], nextSeason = seasons[seasons.indexOf(t.season) + 1];
  const title = `${t.season} ${t.team} Kadrosu, Oyuncuları ve Reytingleri | Süper Lig 7-0`;
  const desc = `${t.season} sezonunda Süper Lig'i ${rankTxt(t.rank)} bitiren ${gen(t.team)} kadrosu${coach ? `, teknik direktör ${coach}` : ""}. ${top.map(p=>p.n).join(", ")} ve diğer oyuncular, mevkileri ve reytingleri.`;
  const rowsFor = g => ps.filter(p => p.p[0] === g).map(p => `<tr><td>${esc(p.n)}</td><td class="p" title="${esc(p.d.map(x=>LONG[x]||x).join(", "))}">${p.d.map(x=>LABEL[x]||x).join(" / ")}</td><td class="r ${p.r>=90?"r90":p.r>=85?"r85":""}">${p.r}</td></tr>`).join("");
  const tables = GROUPS.map(([g, label]) => { const r = rowsFor(g); return r ? `<h2>${label}</h2><table><tr><th>Oyuncu</th><th>Mevki</th><th>Reyting</th></tr>${r}</table>` : ""; }).join("");
  const about = `${t.season} sezonunda ${esc(t.team)}, Süper Lig'i <b>${rankTxt(t.rank)}</b> sırada tamamladı${fin && fin !== "Şampiyon" && fin !== "İkinci" && fin !== "Üçüncü" ? ` (${esc(fin)})` : t.rank === 1 ? " ve <b>şampiyon</b> oldu" : ""}.`
    + (coach ? ` Teknik direktör: <b>${esc(coach)}</b>.` : "")
    + ` Kadronun en yüksek reytingli oyuncuları ${top.map(p => `<b>${esc(p.n)}</b> (${p.r})`).join(", ").replace(/, ([^,]*)$/, " ve $1")}. Kadronun ortalama reytingi <b>${avg}</b>.`
    + ` Süper Lig 7-0'da bu kadrodan bir oyuncu seçip 1980'den bugüne efsanelerle kendi 11'ini kurabilir, turnuvada 7'de 7 yapmaya çalışabilirsin.`;
  const ld = [
    { "@context":"https://schema.org", "@type":"SportsTeam", name:`${t.team} (${t.season})`, sport:"Futbol",
      ...(coach ? { coach:{ "@type":"Person", name:coach } } : {}), athlete: ps.map(p => ({ "@type":"Person", name:p.n })) },
    { "@context":"https://schema.org", "@type":"BreadcrumbList", itemListElement:[
      { "@type":"ListItem", position:1, name:"Süper Lig 7-0", item:SITE + "/" },
      { "@type":"ListItem", position:2, name:"Kadrolar", item:SITE + "/kadro/" },
      { "@type":"ListItem", position:3, name:`${t.team} kadroları`, item:`${SITE}/kadro/${slug(t.team)}.html` },
      { "@type":"ListItem", position:4, name:`${t.season} ${t.team}`, item:url } ] } ];
  const body = `<div class="bc"><a href="/">Süper Lig 7-0</a> › <a href="/kadro/">Kadrolar</a> › <a href="/kadro/${slug(t.team)}.html">${esc(t.team)}</a> › ${t.season}</div>
<h1><span class="kit" style="--c1:${c1};--c2:${c2}"></span>${t.season} ${esc(t.team)} Kadrosu</h1>
<p class="sub"><span class="tag ${tagCls}">${t.rank}.</span><b>${esc(fin || rankTxt(t.rank))}</b>${coach ? ` · Teknik direktör: <b>${esc(coach)}</b>` : ""} · ${ps.length} oyuncu · Ortalama reyting <b>${avg}</b></p>
<div class="box">${about}</div>
<a class="cta" href="/">▶ Bu efsanelerle 11'ini kur, 7-0 yap</a>
${tables}
<h2>${t.season} sezonunun diğer takımları</h2>
<div class="grid">${others.map(o => `<a href="${pageName(o.season, o.team)}">${o.rank}. ${esc(o.team)}</a>`).join("")}</div>
<h2>${esc(gen(t.team))} diğer kadroları</h2>
<div class="grid">${club.map(o => o.season === t.season ? `<a style="border-color:var(--gold)">${o.season}</a>` : `<a href="${pageName(o.season, o.team)}">${o.season} · ${o.rank}.</a>`).join("")}</div>
<p class="sub" style="margin-top:20px">${prevSeason ? `<a href="/kadro/#s${prevSeason}">← ${prevSeason} sezonu</a>` : ""}${prevSeason && nextSeason ? " · " : ""}${nextSeason ? `<a href="/kadro/#s${nextSeason}">${nextSeason} sezonu →</a>` : ""}</p>`;
  return shell({ title, desc, url, body, ld });
}

function clubPage(club){
  const list = all.filter(x => x.team === club), [c1, c2] = kitC(club), url = `${SITE}/kadro/${slug(club)}.html`;
  const champs = list.filter(x => x.rank === 1).length;
  const best = list.flatMap(t => t.players.map(p => ({ ...p, season: t.season }))).sort((a,b) => b.r - a.r).slice(0, 10);
  const title = `${club} Kadroları 1980'den Bugüne: Şampiyonluk ve İlk 3 Sezonları | Süper Lig 7-0`;
  const desc = `${gen(club)} 1980'den bugüne Süper Lig'de ilk 3'e girdiği ${list.length} sezonun kadrosu${champs ? `, ${champs} şampiyonluk` : ""}. Her sezonun oyuncuları, teknik direktörü ve reytingleri.`;
  const body = `<div class="bc"><a href="/">Süper Lig 7-0</a> › <a href="/kadro/">Kadrolar</a> › ${esc(club)}</div>
<h1><span class="kit" style="--c1:${c1};--c2:${c2}"></span>${esc(club)} Kadroları</h1>
<p class="sub">1980'den bugüne Süper Lig'i ilk 3'te bitirdiği <b>${list.length}</b> sezon${champs ? ` · <b>${champs}</b> şampiyonluk` : ""}</p>
<a class="cta" href="/">▶ ${esc(club)} efsaneleriyle 11'ini kur</a>
<h2>Sezonlar</h2>
<table><tr><th>Sezon</th><th>Sıra</th><th>Teknik direktör</th><th>Yıldızı</th></tr>
${list.map(t => { const s = [...t.players].sort((a,b)=>b.r-a.r)[0]; return `<tr><td><a href="${pageName(t.season, t.team)}">${t.season}</a></td><td>${esc(finish(t) || t.rank + ".")}</td><td class="p">${esc(COACH[t.season + "|" + t.team] || "–")}</td><td>${esc(s.n)} <span class="p">(${s.r})</span></td></tr>`; }).join("")}</table>
<h2>En yüksek reytingli ${esc(club)} oyuncuları</h2>
<table><tr><th>Oyuncu</th><th>Sezon</th><th>Reyting</th></tr>${best.map(p => `<tr><td>${esc(p.n)}</td><td class="p">${p.season}</td><td class="r r90">${p.r}</td></tr>`).join("")}</table>`;
  return shell({ title, desc, url, body, ld: { "@context":"https://schema.org", "@type":"BreadcrumbList", itemListElement:[
    { "@type":"ListItem", position:1, name:"Süper Lig 7-0", item:SITE + "/" }, { "@type":"ListItem", position:2, name:"Kadrolar", item:SITE + "/kadro/" },
    { "@type":"ListItem", position:3, name:`${club} kadroları`, item:url } ] } });
}

function indexPage(){
  const url = `${SITE}/kadro/`;
  const title = "Süper Lig Kadroları 1980'den Bugüne: Her Sezonun İlk 3 Takımı | Süper Lig 7-0";
  const desc = `1980-81'den bugüne Süper Lig'de her sezon ilk 3'e giren ${all.length} takımın kadrosu: Galatasaray, Fenerbahçe, Beşiktaş, Trabzonspor ve diğerleri. Oyuncular, teknik direktörler ve reytingler.`;
  const body = `<div class="bc"><a href="/">Süper Lig 7-0</a> › Kadrolar</div>
<h1>Süper Lig Kadroları (1980'den bugüne)</h1>
<p class="sub">${seasons.length} sezon · ${all.length} takım · ${all.reduce((s,t)=>s+t.players.length,0)} oyuncu. Her sezon ilk 3'e giren takımların kadroları.</p>
<a class="cta" href="/">▶ Efsane 11'ini kur, 7-0 yap</a>
<h2>Kulüpler</h2>
<div class="grid">${clubs.map(c => `<a href="${slug(c)}.html"><span class="kit" style="--c1:${kitC(c)[0]};--c2:${kitC(c)[1]}"></span>${esc(c)} (${all.filter(x=>x.team===c).length})</a>`).join("")}</div>
<h2>Sezonlar</h2>
${[...seasons].reverse().map(s => `<div class="season" id="s${s}"><h3>${s}</h3><div class="grid">${DATA[s].map(t => `<a href="${pageName(s, t.team)}">${t.rank}. ${esc(t.team)}</a>`).join("")}</div></div>`).join("")}`;
  return shell({ title, desc, url, body });
}

fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
const urls = [SITE + "/", SITE + "/kadro/"];
fs.writeFileSync(path.join(OUT, "index.html"), indexPage());
for (const c of clubs){ fs.writeFileSync(path.join(OUT, slug(c) + ".html"), clubPage(c)); urls.push(`${SITE}/kadro/${slug(c)}.html`); }
for (const t of all){ fs.writeFileSync(path.join(OUT, pageName(t.season, t.team)), teamPage(t)); urls.push(`${SITE}/kadro/${pageName(t.season, t.team)}`); }
urls.push(SITE + "/gizlilik.html");
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`);
fs.writeFileSync(path.join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`✅ sayfalar: ${all.length} takım + ${clubs.length} kulüp + dizin, sitemap ${urls.length} adres`);
