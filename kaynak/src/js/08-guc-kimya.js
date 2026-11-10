// ---------- güç ----------
const DUOS = [
  ["Gheorghe Hagi","Hakan Şükür"],["Gheorghe Hagi","Gheorghe Popescu"],["Hakan Şükür","Arif Erdem"],["Tugay Kerimoğlu","Hakan Şükür"],["Okan Buruk","Hakan Şükür"],["Ümit Davala","Hakan Şükür"],["Cláudio Taffarel","Bülent Korkmaz"],
  ["Metin Tekin","Ali Gültiken"],["Metin Tekin","Feyyaz Uçar"],["Ali Gültiken","Feyyaz Uçar"],["Rıza Çalımbay","Metin Tekin"],["Rıza Çalımbay","Mehmet Özdilek"],["Sergen Yalçın","Oktay Derelioğlu"],["Sergen Yalçın","Nihat Kahveci"],
  ["Tanju Çolak","Uğur Tütüneker"],["Aykut Kocaman","Rıdvan Dilmen"],["Aykut Kocaman","Oğuz Çetin"],["Harald Schumacher","Müjdat Yetkiner"],["Elvir Bolić","Jay-Jay Okocha"],["Rüştü Reçber","Ogün Temizkanoğlu"],
  ["Alex de Souza","Tuncay Şanlı"],["Alex de Souza","Mehmet Aurélio"],["Alex de Souza","Stephen Appiah"],["Alex de Souza","Emre Belözoğlu"],["Diego Lugano","Edu Dracena"],["Volkan Demirel","Diego Lugano"],
  ["Wesley Sneijder","Didier Drogba"],["Wesley Sneijder","Burak Yılmaz"],["Didier Drogba","Burak Yılmaz"],["Felipe Melo","Selçuk İnan"],["Fernando Muslera","Semih Kaya"],
  ["Ricardo Quaresma","Mario Gómez"],["Ricardo Quaresma","Cenk Tosun"],["Ricardo Quaresma","Anderson Talisca"],["Atiba Hutchinson","Oğuzhan Özyakup"],["José Sosa","Mario Gómez"],
  ["Şenol Güneş","Turgay Semercioğlu"],["Hami Mandıralı","Shota Arveladze"],["Hami Mandıralı","Ünal Karaman"],["Gökdeniz Karadeniz","Fatih Tekke"],["Burak Yılmaz","Umut Bulut"],
  ["Pablo Batalla","Volkan Şen"],["Pablo Batalla","Ozan İpek"],["Mauro Icardi","Dries Mertens"],["Victor Osimhen","Barış Alper Yılmaz"],["Lucas Torreira","Gabriel Sara"],["Edin Džeko","Dušan Tadić"],
  ["Anthony Nwakaeme","Abdülkadir Ömür"],["Marek Hamšík","Anastasios Bakasetas"],["Emre Belözoğlu","Edin Višća"],["Mehmet Yıldız","Abdurrahman Dereli"],["Tanju Çolak","Fatih Uraz"]
];
function chemistry(players){
  const parts=[]; let total=0;
  const ks={}; players.forEach(p=>ks[p.key]=(ks[p.key]||0)+1);
  for (const [k,n] of Object.entries(ks)) if(n>1){ const v=(n-1)*0.5; total+=v; parts.push(`${k.replace("|"," ")} (${n} oyuncu) +${v}`); }
  const cl={}; players.forEach(p=>cl[p.team]=(cl[p.team]||0)+1);
  for (const [c,n] of Object.entries(cl)) if(n>=3){ const v=n>=5?2:n===4?1.5:1; total+=v; parts.push(`${c} kulüp bağı (${n}) +${v}`); }
  const names=new Set(players.map(p=>p.n));
  for (const [a,b] of DUOS) if(names.has(a)&&names.has(b)){ total+=1; parts.push(`Efsane ikili: ${short(a)} & ${short(b)} +1`); }
  return { total: Math.min(5,total), parts };
}
function teamPower(players, style){
  const allAvg = avg(players.map(p=>p.r)) - 3;
  const by = k => { const a = players.filter(p=>p.pos===k).map(p=>p.r); return a.length ? avg(a) : allAvg; };
  const gk = by("GK"), df = by("DF"), mf = by("MF"), fw = by("FW");
  let att = fw*0.5 + mf*0.35 + df*0.15;
  let def = gk*0.35 + df*0.45 + mf*0.2;
  const chem = players[0]?.key ? chemistry(players).total : 0;
  const st = styleMod(style, players);
  const off = players.filter(p=>p.off).length, pen = off*TEAM_OFF;
  return { att: att+st.att+chem-pen, def: def+st.def+chem-pen, chem, off, style: STYLES[style]?style:"Dengeli", ovr: Math.round(avg(players.map(p=>p.r))) };
}
const myPlayers = () => S.slots.filter(s=>s.p).map(s=>({...s.p,pos:LINE(s.pos),role:s.pos}));
const oppPlayers = t => t.players.map(p=>({...p,pos:p.p[0]}));
function statsHTML(){
  const pl = myPlayers(); if(!pl.length) return "";
  const pw = teamPower(pl, S.style), A = S.almanac;
  return `<div class="stats card" style="margin-top:12px">
    <div class="stat"><b>${A?"?":pw.ovr}</b><span>Genel</span></div>
    <div class="stat"><b>${A?"?":pw.att.toFixed(1)}</b><span>Hücum</span></div>
    <div class="stat"><b>${A?"?":pw.def.toFixed(1)}</b><span>Savunma</span></div>
    <div class="stat"><b>+${pw.chem.toFixed(1)}</b><span>Kimya</span></div>
    ${pw.off?`<div class="stat" style="color:#f0a050"><b>−${pw.off*TEAM_OFF}</b><span>Mevki dışı (${pw.off})</span></div>`:""}
    <div class="stat"><b>${S.form}</b><span>${S.style}</span></div></div>
    ${(()=>{ const c=chemistry(pl); return c.parts.length?`<div class="chemlist">⚗️ Kimya${c.total>=5?" (en fazla +5)":""}: ${c.parts.map(esc).join(" · ")}</div>`:`<div class="chemlist mut">⚗️ Kimya için aynı kulüpten 3+ oyuncu ya da efsane ikililer topla.</div>`; })()}`;
}
function renderReady(){
  $("play").innerHTML = `
  <div class="grid">
    <div><h1>11'in hazır.</h1>
      <p class="mut">Turnuva 7 maç: önce grup kurası çekilir, 4 takımlı grupta 3 maç oynarsın, ilk 2'ye girersen Son 16 kurası, çeyrek final, yarı final ve final gelir. Her maç öncesi takımına konuşma yapar, kadronu ayarlarsın. Elemelerde beraberlikte uzatma, sonra penaltı: penaltıcılarını sen seçersin.</p>
      ${(S.bench||[]).length?"":`<p class="hint card">Yedeğin yok: kırmızı kart ya da sakatlıkta 10 kişi kalırsın.</p>`}
      ${S.mode==="daily"?`<p>Harcanan bütçe: <b>${S.spent} / ${DAILY_BUDGET} M</b>${S.counted?"":" · <span class='mut'>bugünkü hakkını kullandın, bu oyun sayılmaz</span>"}</p>`:""}
      <h3>Maç hızı</h3>
      <div class="row">${Object.keys(SPEEDS).map(k=>`<button class="chip ${k===S.speed?"on":""}" onclick="S.speed='${k}';renderReady()">${k}</button>`).join("")}</div>
      <div class="row" style="margin-top:18px"><button class="btn" onclick="startTournament()">Turnuvaya başla</button>
      <button class="btn ghost" onclick="renderStart()">Baştan kur</button></div>
    </div>
    <div class="side">${pitchHTML()}${benchHTML()}${statsHTML()}</div>
  </div>`;
}

