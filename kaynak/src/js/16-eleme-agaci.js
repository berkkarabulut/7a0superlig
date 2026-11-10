function simMatch(a,b){
  const r=simGoals(a.pw,b.pw,a.pl,b.pl); let pen=null, et=false;
  if (r.g1===r.g2){ et=true; r.g1+=poisson(lam(a.pw.att,b.pw.def)/3*0.85); r.g2+=poisson(lam(b.pw.att,a.pw.def)/3*0.85); }
  let w = r.g1>r.g2?a:b;
  if (r.g1===r.g2){ const ga=a.pl.find(p=>p.pos==="GK")?.r||75, gb=b.pl.find(p=>p.pos==="GK")?.r||75; pen=penalties(ga,gb); w = pen[0]>pen[1]?a:b; }
  return {a,b,g1:r.g1,g2:r.g2,pen,et,w};
}
function simRound(k,from){
  const T=S.T, R=T.R[k]; T.M[k]=T.M[k]||[];
  for (let j=from;j<R.length/2;j++) T.M[k][j]=simMatch(R[2*j],R[2*j+1]);
  if (R.length>2) T.R[k+1]=T.M[k].map(m=>m.w);
  else T.champ=T.M[k][0].w;
}
function finishBracket(){
  const T=S.T;
  for (let k=0;k<4;k++){
    if (!T.R[k]) break;
    if (!T.M[k] || T.M[k].length < T.R[k].length/2) simRound(k, T.M[k]?T.M[k].length:0);
    if (k===3 && !T.champ) T.champ=T.M[3][0].w;
  }
}
const shortName = n => n===myName() ? n : n.replace(/^(\d{2})(\d{2})-(\d{2}) /,"$2-$3 ");
function bracketHTML(){
  const T=S.T, RN=["Son 16","Çeyrek final","Yarı final","Final"];
  const col = k => { const R=T.R[k]; if(!R) return `<div class="bcol"><div class="bh">${RN[k]}</div><div class="bbody"><div class="bm empty">—</div></div></div>`;
    const ms=[]; for(let j=0;j<R.length/2;j++){ const m=T.M[k]&&T.M[k][j], a=R[2*j], b=R[2*j+1];
      const line=(x,g,p,isW)=>`<div class="bt ${x.me?"me":""} ${m?(isW?"w":"l"):""}"><span>${x.t?kit(x.t.team):""}${esc(shortName(x.name))}</span><b>${m?g+(p!=null?` <small>(${p})</small>`:(m.et?` <small>uz.</small>`:"")):""}</b></div>`;
      ms.push(`<div class="bm">${line(a,m?.g1,m?.pen?.[0],m&&m.w===a)}${line(b,m?.g2,m?.pen?.[1],m&&m.w===b)}</div>`); }
    return `<div class="bcol"><div class="bh">${RN[k]}</div><div class="bbody">${ms.join("")}</div></div>`; };
  const champ = T.champ ? `<div class="bcol"><div class="bh">Şampiyon</div><div class="bbody"><div class="bm champ ${T.champ.me?"me":""}">🏆 ${esc(shortName(T.champ.name))}</div></div></div>` : "";
  return `<div class="bracket">${[0,1,2,3].map(col).join("")}${champ}</div>`;
}
function ourMatchesHTML(){
  return `<table>${S.T.res.map((r,i)=>`<tr><td class="mut" style="white-space:nowrap">${STAGES[i]}</td><td>${r.team?kit(r.team):""}${esc(r.opp)}</td><td class="${r.res}" style="white-space:nowrap"><b>${r.g1}-${r.g2}</b>${r.et&&!r.pen?` <small>(uz.)</small>`:""}${r.pen?` <small>(uz., pen. ${r.pen[0]}-${r.pen[1]})</small>`:""}</td></tr>`).join("")}</table>`;
}
