import json,re,collections
top=[l.strip().split('|') for l in open('raw/top3.txt' if False else 'top3.txt',encoding='utf-8') if l.strip()]
def parse_know(files):
    d=collections.defaultdict(list)
    for f in files:
        cur=None
        for l in open(f,encoding='utf-8'):
            l=l.rstrip()
            if not l or (l.startswith('#') and '|' not in l): continue
            if l.startswith('#'): cur=tuple(l[1:].split('|')); continue
            p,r,n=l.split(' ',2); d[cur].append({'n':n,'p':[p],'r':int(r)})
    return d
K=parse_know(['raw/know_a.txt','raw/know_b.txt','raw/know_c.txt'])
# NFT
POS={'GK':'GK'}
for x in 'CB LB RB SW DF Libero D'.split(): POS[x]='DF'
for x in 'DM CM AM LM RM MF M'.split(): POS[x]='MF'
for x in 'CF SS LW RW FW ST'.split(): POS[x]='FW'
N=collections.defaultdict(list); cur=None
for l in open('raw/nft.txt',encoding='utf-8'):
    l=l.strip()
    if l.startswith('## '): cur=tuple(l[3:].split('|')); continue
    if l and cur: n,p,m=l.split('|'); N[cur].append((n,POS[p],int(m)))
bestr={}
for k,v in K.items():
    for p in v: bestr[p['n']]=max(bestr.get(p['n'],0),p['r'])
LEG={'Gheorghe Hagi':91,'Hakan Şükür':89,'Tanju Çolak':93,'Cláudio Taffarel':86,'Harald Schumacher':86,'Aykut Kocaman':88,'Rıdvan Dilmen':86,'Oğuz Çetin':85,'Fatih Terim':85,'Bafétimbi Gomis':86,'Fernando Muslera':85,'Younès Belhanda':83,'Zoran Simović':85}
seasons={}; dropped=[]
for y,*teams in top:
    S=f"{y}-{str(int(y)+1)[2:]}"; out=[]
    for rank,t in enumerate(teams,1):
        k=(y,t)
        if k in N:
            base=82-rank
            ps=[]
            for n,p,m in sorted(N[k],key=lambda x:-x[2]):
                if m==0: continue
                r=LEG.get(n) or bestr.get(n) or base+min(4,m//9)
                ps.append({'n':n,'p':[p],'r':r})
            # pick by apps: 1 GK, up to 5 DF,5 MF,3 FW, max 14
            lim={'GK':1,'DF':5,'MF':5,'FW':3}; c=collections.Counter(); sel=[]
            for p in ps:
                if c[p['p'][0]]<lim[p['p'][0]] and len(sel)<14: sel.append(p); c[p['p'][0]]+=1
            ps=sel; src='kaynak'
        else:
            ps=K.get(k,[]); src='bilgi'
            seen=set(); ps=[p for p in ps if not (p['n'] in seen or seen.add(p['n']))]
        if len(ps)<6: dropped.append(f"{S} {t} ({len(ps)} oyuncu)"); continue
        out.append({'team':t,'rank':rank,'note':['Şampiyon','İkinci','Üçüncü'][rank-1]+(' · kadro kaynaktan' if src=='kaynak' else ''),'players':ps})
    seasons[S]=out
json.dump(seasons,open('data2.json','w',encoding='utf-8'),ensure_ascii=False)
n=sum(len(v) for v in seasons.values()); pl=sum(len(t['players']) for v in seasons.values() for t in v)
print(n,'takım',pl,'oyuncu'); print('düşen:',dropped)
short=[(s,t['team'],len(t['players'])) for s,v in seasons.items() for t in v if len(t['players'])<11]; print('11den az:',len(short),short)
nogk=[(s,t['team']) for s,v in seasons.items() for t in v if not any('GK' in p['p'] for p in t['players'])]; print('kalecisiz:',nogk)
