// ---------- 2026-27 Süper Lig turnuvası ----------
// Rakipler GUNCEL kadrolardan gelir. İki giriş: kendi draft kadronla (S.sl) ya da güncel bir takımla (gerçek takım modu).
const slOn = () => !!S.sl || (S.mode==="real" && CUR.some(t=>t.id===S.realId));
// güncel takımın sahaya çıkan 11'i (kadrolar 20+ kişi; yedekler güç hesabını düşürmesin)
function curXI(t){
  if (t._xi) return t._xi;
  const b = realBest(t);
  if (!b) return (t._xi = t.players.map(p=>({...p, pos:p.p[0]})));
  const slots = FORMATIONS[b.form].map(x=>x[0]);
  return (t._xi = b.pick.map((j,i) => { const p = t.players[j]; return {...p, r: p.r-penaltyFor(p, slots[i]), pos: LINE(slots[i])}; }));
}
const curPow = t => t.cur ? (t._pw ?? (t._pw = teamPower(curXI(t), oppStyle(t)).ovr)) : 0;
function slDraft(){ pickMode("solo"); S.sl = true; renderStart(); try { $("setupcard")?.scrollIntoView({behavior:"smooth", block:"start"}); } catch(e){} }
function renderSL(){
  const list = [...CUR].sort((a,b)=>curPow(b)-curPow(a));
  $("play").innerHTML = `${topBar("")}
    <h1>🏆 ${GUNCEL.sezon} Süper Lig turnuvası</h1>
    <p class="mut">Bildiğin turnuva: 3 grup maçı, sonra son 16, çeyrek final, yarı final, final. Bu sefer rakiplerin bu sezonun ${CUR.length} Süper Lig takımı, güncel kadrolarıyla. Kadrolar ${GUNCEL.guncelleme.split("-").reverse().join(".")} itibarıyla.</p>
    <div class="modes sl-modes">
      <button class="card mode" onclick="slDraft()"><b><span class="mi">🎮</span> Kendi 11'ini kur</b><span class="mut">Efsanelerden draft yap, bu sezonun Süper Lig takımlarına karşı oyna. Sonuç sıralamaya yazılmaz.</span></button>
      <button class="card mode" onclick="renderRealPicker('Güncel ${GUNCEL.sezon}')"><b><span class="mi">🏟️</span> Güncel bir takımla gir</b><span class="mut">Takımını seç, diğer ${CUR.length-1} takıma karşı şampiyonluğa oyna. Sonuç gerçek takım tablosuna yazılır.</span></button>
    </div>
    <h3 style="margin-top:18px">Takımlar ve güçleri</h3>
    <div class="sl-list">${list.map((t,i)=>{ const c = kitC(t.team);
      return `<div class="sl-row"><span class="mut sl-i">${i+1}.</span><span class="kit" style="--c1:${c[0]};--c2:${c[1]}"></span><b>${esc(t.team)}</b><span class="mut sl-c">${coachOf(t)?esc(coachOf(t)):""}</span><span class="sl-p">${curPow(t)}</span></div>`; }).join("")}</div>`;
  toTop();
}
