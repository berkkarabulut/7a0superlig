import re,json,sys,collections
src=open(sys.argv[1],encoding='utf-8').read().splitlines()
teams=[];cur=None
for line in src:
    s=line.strip()
    if not s: continue
    m=re.match(r'^(\d+)\.\s+(.+?)(\s*\((.+)\))?$',s)
    if m and '-' not in s.split('(')[-1][:6] and not re.search(r'\((GK|DF|MF|FW)',s):
        cur={'rank':int(m.group(1)),'team':m.group(2).strip(),'note':m.group(4) or '','players':[]};teams.append(cur);continue
    m=re.match(r'^(.+?)\s*\(((?:GK|DF|MF|FW)(?:/(?:GK|DF|MF|FW|Libero))*)\s*-\s*(\d+)\)(.*)$',s)
    if m and cur:
        raw=m.group(1)
        if ' / ' in re.sub(r'\([^)]*\)','',raw):
            dep=0;cut=None
            for i,c in enumerate(raw):
                dep+= c=='(' ; dep-= c==')'
                if dep==0 and raw[i:i+3]==' / ': cut=i;break
            first,alt=(raw[:cut],raw[cut+3:]) if cut is not None else (raw,'')
            if not alt: alt=first
            raw=alt if '(' in first and not first.strip().startswith(('Sedat',)) else first
        name=re.sub(r'\s*\([^)]*\)','',raw).strip()
        name=re.sub(r'\s*\(".*?"\)','',name)
        cur['players'].append({'n':name,'p':[x for x in m.group(2).split('/') if x!='Libero'],'r':int(m.group(3))})
# validation
issues=[]
seen=collections.defaultdict(list)
for t in teams:
    names=[p['n'] for p in t['players']]
    for n,c in collections.Counter(names).items():
        if c>1: issues.append(f"{t['team']}: '{n}' aynı takımda {c} kez")
    if sum('GK' in p['p'] for p in t['players'])!=1: issues.append(f"{t['team']}: {sum('GK' in p['p'] for p in t['players'])} kaleci")
    for p in t['players']:
        seen[p['n']].append(t['team'])
        if len(p['n'].split())<2: issues.append(f"{t['team']}: '{p['n']}' sadece tek isim")
for n,ts in seen.items():
    if len(set(ts))>1: issues.append(f"'{n}' aynı sezonda birden fazla takımda: {', '.join(sorted(set(ts)))}")
print(json.dumps(teams,ensure_ascii=False),file=open(sys.argv[2],'w',encoding='utf-8'))
print(len(teams),'takım',sum(len(t['players']) for t in teams),'oyuncu')
print('\n'.join(issues))
