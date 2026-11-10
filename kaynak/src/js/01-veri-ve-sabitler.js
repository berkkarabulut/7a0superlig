const DATA = /*DATA*/;

// ---------- havuz ----------
const POOL = [];
function rankNote(season, rank){ return rank===1 ? `${season} sezonunu şampiyon bitirdi` : `${season} sezonunu ${rank}. bitirdi`; }
for (const [season, teams] of Object.entries(DATA))
  for (const t of teams) POOL.push({ season, team: t.team, rank: t.rank, note: rankNote(season, t.rank), players: t.players, id: season+"|"+t.team });

const FORMATIONS = {
  "4-3-3": [["GK",50,90],["LB",14,70],["CB",38,75],["CB",62,75],["RB",86,70],["CM",27,48],["DM",50,56],["CM",73,48],["LW",16,22],["ST",50,15],["RW",84,22]],
  "4-4-2": [["GK",50,90],["LB",14,70],["CB",38,75],["CB",62,75],["RB",86,70],["LM",13,44],["CM",38,50],["CM",62,50],["RM",87,44],["ST",37,18],["ST",63,18]],
  "3-5-2": [["GK",50,90],["CB",25,73],["CB",50,76],["CB",75,73],["LWB",10,46],["CM",30,48],["DM",50,57],["CM",70,48],["RWB",90,46],["ST",37,18],["ST",63,18]],
  "4-2-3-1": [["GK",50,90],["LB",14,70],["CB",38,75],["CB",62,75],["RB",86,70],["DM",36,57],["DM",64,57],["LW",15,33],["AM",50,37],["RW",85,33],["ST",50,14]],
  "4-1-4-1": [["GK",50,90],["LB",14,70],["CB",38,75],["CB",62,75],["RB",86,70],["DM",50,59],["LM",13,40],["CM",36,44],["CM",64,44],["RM",87,40],["ST",50,14]],
  "4-4-1-1": [["GK",50,90],["LB",14,70],["CB",38,75],["CB",62,75],["RB",86,70],["LM",13,47],["CM",37,52],["CM",63,52],["RM",87,47],["AM",50,32],["ST",50,13]],
  "4-3-1-2": [["GK",50,90],["LB",14,70],["CB",38,75],["CB",62,75],["RB",86,70],["CM",27,53],["DM",50,59],["CM",73,53],["AM",50,36],["ST",37,16],["ST",63,16]],
  "3-4-3": [["GK",50,90],["CB",25,74],["CB",50,77],["CB",75,74],["LWB",11,48],["CM",37,52],["CM",63,52],["RWB",89,48],["LW",17,22],["ST",50,14],["RW",83,22]],
  "5-3-2": [["GK",50,90],["LWB",9,62],["CB",30,75],["CB",50,78],["CB",70,75],["RWB",91,62],["CM",28,47],["DM",50,54],["CM",72,47],["ST",37,17],["ST",63,17]],
};
const ACCEPT = { GK:["GK"], RB:["RB"], LB:["LB"], CB:["CB"], DM:["DM","CM"], CM:["CM","DM","AM"], AM:["AM","CM"],
  RM:["RM","RW"], LM:["LM","LW"], RW:["RW","RM"], LW:["LW","LM"], ST:["ST"], RWB:["RB","RM","RW"], LWB:["LB","LM","LW"],
  BGK:["GK"], BDF:["RB","CB","LB"], BMF:["DM","CM","AM","RM","LM"], BFW:["RW","LW","ST"] };
const LABEL = { GK:"KL", RB:"SĞB", CB:"STP", LB:"SLB", DM:"ÖL", CM:"MO", AM:"OOS", RM:"SĞO", LM:"SLO", RW:"SĞK", LW:"SLK", ST:"FV", RWB:"SĞB/O", LWB:"SLB/O", BGK:"KL", BDF:"DEF", BMF:"OS", BFW:"FV" };
const NAME = { GK:"Kaleci", RB:"Sağ bek", CB:"Stoper", LB:"Sol bek", DM:"Ön libero", CM:"Merkez orta saha", AM:"Ofansif orta saha", RM:"Sağ orta saha", LM:"Sol orta saha", RW:"Sağ kanat", LW:"Sol kanat", ST:"Forvet", RWB:"Sağ bek/kanat", LWB:"Sol bek/kanat", BGK:"Yedek kaleci", BDF:"Yedek defans", BMF:"Yedek orta saha", BFW:"Yedek forvet" };
const LINE = r => r==="GK"?"GK":["RB","CB","LB"].includes(r)?"DF":["RW","LW","ST"].includes(r)?"FW":["RWB","LWB"].includes(r)?"MF":"MF";
const NEAR = { GK:[], RB:["CB","RM","RW"], LB:["CB","LM","LW"], CB:["RB","LB","DM"], DM:["CB","CM","AM"], CM:["DM","AM","RM","LM"], AM:["CM","ST","RW","LW"],
  RM:["RB","CM","AM"], LM:["LB","CM","AM"], RW:["ST","AM","RB"], LW:["ST","AM","LB"], ST:["RW","LW","AM"], RWB:["CB","CM"], LWB:["CB","CM"], BGK:[], BDF:[], BMF:[], BFW:[] };
const OFFPOS = 4;
const TEAM_OFF = 2.5;
const FORCED = 8;    // hiçbir yere uymayan oyuncu zorunlu konursa   // mevki dışı oyuncu başına takım hücum/savunma cezası
const REROLLS = 2;
const roles = p => p.d || p.p;
const tier = r => S.almanac ? "rq" : r>=90?"r90":r>=87?"r87":r>=84?"r84":r>=80?"r80":"r70";
const tierAlways = r => r>=90?"r90":r>=87?"r87":r>=84?"r84":r>=80?"r80":"r70";
const natural = (p, slotRole) => roles(p).some(x => ACCEPT[slotRole].includes(x));
const nearFit = (p, slotRole) => !natural(p,slotRole) && !roles(p).includes("GK") && slotRole!=="GK" && roles(p).some(x => NEAR[slotRole].includes(x));
const fits = (p, slotRole) => natural(p,slotRole) || nearFit(p,slotRole) || (S.forced && !inSquad(p.n));
const penaltyFor = (p, slotRole) => natural(p,slotRole) ? 0 : nearFit(p,slotRole) ? OFFPOS : FORCED;
