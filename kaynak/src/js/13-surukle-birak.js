// ---------- sürükle bırak / dokun seç ----------
function enableDrag(root, onDrop, onTap){
  if (!root || !root.querySelectorAll) return;
  root.querySelectorAll("[data-drag]").forEach(el => {
    el.addEventListener("pointerdown", e => {
      if (e.button>0) return;
      const src=el.dataset.drag, sx=e.clientX, sy=e.clientY; let ghost=null, hov=null;
      try { el.setPointerCapture(e.pointerId); } catch(_){}
      const target = ev => { const x=document.elementFromPoint(ev.clientX,ev.clientY); return x && x.closest ? x.closest("[data-drop]") : null; };
      const move = ev => { if (!ghost && Math.hypot(ev.clientX-sx, ev.clientY-sy) > 8){ ghost=el.cloneNode(true); ghost.classList.add("dragghost"); ghost.style.width=el.offsetWidth+"px"; document.body.appendChild(ghost); el.classList.add("dragging"); }
        if (ghost){ ev.preventDefault(); ghost.style.left=ev.clientX+"px"; ghost.style.top=ev.clientY+"px";
          if (ev.clientY < 70) window.scrollBy(0,-14); else if (ev.clientY > window.innerHeight-70) window.scrollBy(0,14); const tg=target(ev); if (tg!==hov){ hov?.classList.remove("hov"); hov=tg; if (hov && hov!==el) hov.classList.add("hov"); } } };
      const end = ev => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", end); el.removeEventListener("pointercancel", cancel);
        hov?.classList.remove("hov"); el.classList.remove("dragging");
        if (ghost){ ghost.remove(); const tg=target(ev); if (tg && tg.dataset.drop!==src) onDrop(src, tg.dataset.drop); }
        else onTap(src); };
      const cancel = () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", end); el.removeEventListener("pointercancel", cancel); ghost?.remove(); hov?.classList.remove("hov"); el.classList.remove("dragging"); };
      el.addEventListener("pointermove", move); el.addEventListener("pointerup", end); el.addEventListener("pointercancel", cancel);
    });
  });
}
const pAt = id => { const T=S.T, [k,i]=id.split(":"); return k==="x" ? T.xi[+i]?.p : T.bench[+i]; };
function xiPitch(){
  const T=S.T, sel=T.sel, selP = sel ? pAt(sel) : null;
  return `<div class="pitch lp">${T.xi.map((s,k)=>{ const p=s.p, pen=penOf(p,s.pos), r=Math.round(effR(T,p,s.pos)), out=isOut(T,p.n), me=sel==="x:"+k;
    let prev=""; if (selP && !me){ const pp=penOf(selP,s.pos), pr=Math.round(effR(T,selP,s.pos)); prev=`<div class="prev ${pp?"bad":"good"}">${pp?"▼":"✓"} ${pr}</div>`; }
    return `<div class="slot full ${me?"selx":""} ${out?"outx":""} ${p.r>=LEGEND?"leg":""}" style="--x:${s.x};--y:${s.y}" data-drag="x:${k}" data-drop="x:${k}">
      ${SHIRT(kitC(p.team), r, pen>0)}<div class="nm">${out?(T.outs[p.n].k==="susp"?"🟥 ":"🚑 "):""}${esc(short(p.n))}</div><div class="tm">${LABEL[s.pos]}${pen?` <b class="neg">−${pen}</b>`:""}</div>${prev}</div>`; }).join("")}</div>`;
}
function doMove(a,b){
  const T=S.T; T.sel=null; if (!a||!b||a===b) return renderPre();
  const [ta,ia]=a.split(":"), [tb,ib]=b.split(":");
  if (ta==="b" && tb==="b") return renderPre();
  if (ta==="x" && tb==="x"){ const A=T.xi[+ia], B=T.xi[+ib]; [A.p,B.p]=[B.p,A.p]; T.msg=["good",`↔ ${esc(short(A.p.n))} ${NAME[A.pos]}, ${esc(short(B.p.n))} ${NAME[B.pos]} oldu`]; }
  else { const xk = ta==="x" ? +ia : +ib, bk = ta==="b" ? +ia : +ib, bp=T.bench[bk], s=T.xi[xk];
    if (isOut(T,bp.n)){ T.msg=["bad",`${esc(bp.n)} ${T.outs[bp.n].k==="susp"?"cezalı":"sakat"}, oynayamaz`]; return renderPre(); }
    T.bench[bk]=s.p; s.p=bp; const pen=penOf(bp,s.pos);
    T.msg=[pen?"bad":"good", `🔁 ${esc(short(bp.n))} ${NAME[s.pos]} mevkisine girdi${pen?` (mevki dışı, −${pen})`:""}`]; }
  renderPre();
}
function tapSel(id){ const T=S.T; if (!T.sel){ T.sel=id; return renderPre(); } if (T.sel===id){ T.sel=null; return renderPre(); } const a=T.sel; doMove(a,id); }
function setStyleT(k){ S.T.style=k; renderPre(); }
function resetXi(){ const T=S.T;
  T.xi.forEach((s,k)=>{ const n=T.orig[k]; if (s.p.n===n) return; const bi=T.bench.findIndex(p=>p.n===n); if (bi<0 || isOut(T,n)) return; const cur=s.p; s.p=T.bench[bi]; T.bench[bi]=cur; });
  T.notes = autoFix(T); T.selXi=null; renderPre(); }
function selXi(k){ const T=S.T; T.selXi = T.selXi===k ? null : k; renderPre(); }
function swapIn(k){ const T=S.T; if (T.selXi==null) return; const a="x:"+T.selXi; T.selXi=null; doMove(a,"b:"+k); }
function doTalk(k){
  const T=S.T, t=TALKS[k], fx=t.fx[talkCtx(T,T.o)]; let up=0, dn=0; const lines=[];
  for (const s of T.xi){ if(!s.p) continue; const n=s.p.n, x=Math.random(); let d = x<fx[0] ? (t.big&&Math.random()<.4?2:1) : x<fx[0]+fx[1] ? 0 : -1;
    T.mor[n] = Math.max(-3, Math.min(3, (T.mor[n]||0)+d)); if(d>0){up++; if(lines.length<3&&s.p.base>=84) lines.push(`${esc(short(n))}: “${rnd(["Hocam, bugün sahada olacağız!","Kafama yazdım, kazanacağız.","Topu bana atın yeter."])}”`);} if(d<0){dn++;} }
  const head = up>=7 ? "Soyunma odası ayağa kalktı! 🔥" : up>=4&&dn<=2 ? "Mesaj yerine ulaştı. 👍" : dn>=5 ? "Ters tepti, oyuncular gergin. 😬" : dn>up ? "Pek tutmadı, bazı oyuncular bozuldu." : "Karışık tepkiler var.";
  T.talked=true; T.talkRes = `<div style="font-size:18px;font-weight:800;font-family:var(--cond);text-transform:uppercase">${t.e} ${head}</div><div class="mut">“${esc(t.t)}” · ${up} oyuncunun morali yükseldi, ${dn} oyuncunun düştü.</div>${lines.length?`<div style="margin-top:6px;font-size:14px">${lines.join("<br>")}</div>`:""}`;
  renderPre();
}
function afterMorale(T,res,r){
  for (const p of [...T.xi.map(s=>s.p), ...T.bench]){ if(!p) continue; const n=p.n; let v=T.mor[n]||0;
    v += v>0?-1:v<0?1:0;
    if (res==="W" && Math.random()<.6) v++; if (res==="L" && Math.random()<.6) v--;
    T.mor[n]=Math.max(-3,Math.min(3,v)); }
  r.ev.filter(e=>e.side===0&&e.type==="goal").forEach(e=>{ T.mor[e.p.n]=Math.min(3,(T.mor[e.p.n]||0)+1); });
}
