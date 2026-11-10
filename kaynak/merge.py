import re,json,collections
H=collections.defaultdict(list)
y=None
for line in open('/mnt/user-data/uploads/2cd34545-attachment.txt',encoding='utf-8'):
    m=re.match(r'^(\d{4})–\d{4} Sezonu',line)
    if m: y=m.group(1); continue
    m=re.match(r'^(\d)\. ([^:]+): (.*)$',line.strip())
    if not m or not y: continue
    team=m.group(2).replace('İstanbul Başakşehir','Başakşehir')
    for n,p,r in re.findall(r'(?:^|, )([^,()]+?) \(([A-Za-z/]+) - (\d+)\)',m.group(3)):
        H[(y,team)].append((n.strip(),p,int(r)))
SPECIAL={'Boško Gjurovski / Hayrettin Demirbaş':'Hayrettin Demirbaş','Claudio Taffarel / Volkan Kilimci':'Volkan Kilimci','Ümit Davala / Capone':'Capone',
 'Patrick N N N / Gökhan Tokgöz':'Gökhan Tokgöz','Fernando Muslera dönemi öncesi Aykut Erçetin / Orkun Uşak':'Aykut Erçetin',
 'Serkan Kırıntılı dönemi sonrası İbrahim Sehic':'İbrahim Šehić','Omar Coloma':'Omar Colley','Mbwana Samatta / Valencia':'Mbwana Samatta',
 'Taffarel':'Cláudio Taffarel','Claudio Taffarel':'Cláudio Taffarel','Hagi':'Gheorghe Hagi','Popescu':'Gheorghe Popescu','Amokachi':'Daniel Amokachi',
 'Song':'Rigobert Song','Tomas':'Stjepan Tomas','Delgado':'Matías Delgado','Holosko':'Filip Hološko','Nobre':'Mert Nobre','Kuyt':'Dirk Kuyt','Keita':'Abdul Kader Keïta',
 'Colman':'Gustavo Colman','Marcelo':'Marcelo Guedes','Fabricio':'Fabri','Mossoró':'Márcio Mossoró','Fernando':'Fernando Reges','Marcao':'Marcão','Maicon':'Maicon',
 'Novak':'Filip Novák','Jose Sosa':'José Sosa','Fabio Luciano':'Fábio Luciano','Marco Aurélio':'Mehmet Aurélio','Bilica':'Fábio Bilica','Cale':'Cale','Vederson':'Gökçek Vederson',
 'Zago':'Antônio Carlos Zago','Ilie':'Adrian Ilie','Capone':'Capone','Oscar Cordoba':'Óscar Córdoba','Jes Högh':'Jes Høgh','Falco Götz':'Falko Götz','Şota Arveladze':'Shota Arveladze',
 'Petkoviç':'Michael Petković','Michael Petkovic':'Michael Petković','Yattara':'Ibrahima Yattara','Saidou':'Saidou Panandétiguiri','Bobô':'Bobô','Zokora':'Didier Zokora',
 'Trezeguet':'Trézéguet','Dusko Tosic':'Duško Tošić','Vukovic':'Jagoš Vuković','Skubic':'Nejc Skubic','Hadziahmetovic':'Amir Hadžiahmetović','Calvo':'Francisco Calvo',
 'Guilherme':'Guilherme Sityá','Bytyqi':'Zymer Bytyqi','Elano Blumer':'Elano','Deivid de Souza':'Deivid','Gaston Campi':'Gastón Campi','Aurelien Chedjou':'Aurélien Chedjou',
 'Victor Ruiz':'Víctor Ruiz','Rıdvan Yılmaz':'Ridvan Yılmaz','Sergio Oliveira':'Sérgio Oliveira','Willian Arao':'Willian Arão','Samet Akaydin':'Samet Akaydın','Dimitrios Pelkas':'Dimitris Pelkas',
 'Elvir Baliç':'Elvir Baljić','Obi Mikel':'John Obi Mikel','Meunier':'Thomas Meunier','Al-Musrati':'Al-Musrati','Gökhan Zan / Dany':'Gökhan Zan','Puchacz / Eren Elmalı':'Tymoteusz Puchacz',
 'Edgar Ié / Denswil':'Edgar Ié','Rayyan Baniya / Mendy':'Rayyan Baniya','Mostafa Mohamed / Falcao':'Mostafa Mohamed','Mergim Berisha / Serdar Dursun':'Mergim Berisha',
 'Roberto Soldado / Fernandao':'Roberto Soldado','Badou Ndiaye / Selçuk İnan':'Badou Ndiaye','Robinho / Demba Ba':'Robinho','Moussa Sow / Niang':'Moussa Sow','İzet Hajrović / Yekta':'Izet Hajrović',
 'Çağlar Söyüncü / Rodrigo Becão':'Çağlar Söyüncü','Mauro Icardi / Victor Osimhen':'Mauro Icardi','Jean Onana / Al-Musrati':'Jean Onana','Serhat Akın / Semih Şentürk':'Serhat Akın','Arif Erdem / Hasan Şaş':'Arif Erdem',
 'Myatt Göksel / Ike Shorunmu':'Ike Shorunmu','Ahmed Hossam Mido / John Carew':'','Nicolás Isimat-Mirin / Necip':'','İbrahim Üzülmez bıraktıktan sonra Emre Özkan / Uğur Boral':'','İees':'','Ali Güandüz':''}
KEEP1={'Capone','Bobô','Fabri','Elano','Deivid','Cale','Maicon','Robinho','Marcão','Mariano','Adriano','Fred','Souza','Giuliano','Alanzinho','Jajá','Trézéguet','Tetê','Angeliño','Ederson','Rhodolfo','Welinton','Lincoln','Carrusca','Al-Musrati'}
def clean(n):
    n=SPECIAL.get(n,n)
    if not n or any(w in n for w in ('dönem','sonrası','henüz')): return ''
    if ' / ' in n: n=n.split(' / ')[0]
    if len(n.split())<2 and n not in KEEP1: return ''
    return n
def pos(p):
    ps=[x for x in p.replace('Libero','DF').split('/') if x in('GK','DF','MF','FW')]
    return ps or ['MF']
# my data
K=json.load(open('data2.json',encoding='utf-8'))
NFTSEAS={('1980','Galatasaray'),('1982','Galatasaray'),('1983','Galatasaray'),('1987','Galatasaray'),('1996','Galatasaray'),('1998','Galatasaray'),('2017','Galatasaray'),('1988','Fenerbahçe'),('1987','Malatyaspor')}
# known wrong in his file: (year,team):[names]; '*' team = all
RM={('1980','Trabzonspor'):['Mehmet Ekşi','Hasan Şengün'],('1980','Galatasaray'):['Turgay İnal'],('1981','Trabzonspor'):['Mehmet Ekşi','Turgay İnal'],('1981','Beşiktaş'):['Ömer Kaner'],
('1982','Trabzonspor'):['Mehmet Ekşi','Turgay İnal'],('1982','Galatasaray'):['Bora Öztürk'],('1983','Galatasaray'):['Bora Öztürk'],('1983','Trabzonspor'):['Mehmet Ekşi','Turgay İnal'],
('1984','Trabzonspor'):['Mehmet Ekşi'],('1985','Samsunspor'):['Hasan Şengün'],('1988','Fenerbahçe'):['Semih Yuvakuran'],('1993','Galatasaray'):['Ertuğrul Sağlam'],('1993','Fenerbahçe'):['Elvir Bolić'],
('1994','Beşiktaş'):['Alpay Özalan'],('1996','Galatasaray'):['Fatih Akyel'],('1997','Galatasaray'):['Cláudio Taffarel'],('1997','Trabzonspor'):['Ogün Temizkanoğlu'],('2000','Fenerbahçe'):['Fatih Akyel'],
('2001','Galatasaray'):['Gheorghe Hagi','Gheorghe Popescu'],('2002','Galatasaray'):['Frank de Boer'],('2007','Beşiktaş'):['Rüştü Reçber','Tomáš Sivok'],('2008','Beşiktaş'):['Rüştü Reçber'],
('2018','Başakşehir'):['Martin Škrtel'],('2020','Fenerbahçe'):['İrfan Can Kahveci'],('2025','Galatasaray'):['Fernando Muslera','Dries Mertens','Mauro Icardi'],
('2025','Fenerbahçe'):['Dominik Livaković','Dušan Tadić','Fred','Sebastian Szymański','Sofyan Amrabat','Alexander Djiku']}
out={}; report=collections.Counter(); dupfix=[]
for S,teams in K.items():
    y=S[:4]; nt=[]
    for t in teams:
        key=(y,t['team']); mine={p['n']:p for p in t['players']}
        his={}
        for n,p,r in H.get(key,[]):
            c=clean(n)
            if c and c not in RM.get(key,[]) and not (c=='Fatih Terim' and int(y)>=1985): his[c]={'n':c,'p':pos(p),'r':r}
        merged=dict(mine)
        for n,p in his.items():
            if n in merged: merged[n]['r']=round((merged[n]['r']+p['r'])/2)
            else: merged[n]=p; report['eklenen']+=1
        nt.append({**t,'players':list(merged.values())})
    # drop also missing teams that his file has but mine dropped
    out[S]=nt
# add teams I had dropped (not in data2) from his file
top=[l.strip().split('|') for l in open('top3.txt',encoding='utf-8') if l.strip()]
for yy,*teams in top:
    S=f"{yy}-{str(int(yy)+1)[2:]}"; have={t['team'] for t in out[S]}
    for rank,tm in enumerate(teams,1):
        if tm in have: continue
        ps={}
        for n,p,r in H.get((yy,tm),[]):
            c=clean(n)
            if c and c not in RM.get((yy,tm),[]): ps[c]={'n':c,'p':pos(p),'r':r}
        if len(ps)>=7:
            out[S].append({'team':tm,'rank':rank,'note':['Şampiyon','İkinci','Üçüncü'][rank-1],'players':list(ps.values())}); report['geri_gelen_takım']+=1
        else: report['hala_eksik:'+S+' '+tm]+=1
    out[S].sort(key=lambda t:t['rank'])
# season-level duplicate check
for S,teams in out.items():
    seen={}
    for t in teams:
        for p in list(t['players']):
            if p['n'] in seen and seen[p['n']]!=t['team']:
                dupfix.append(f"{S} {p['n']}: {seen[p['n']]} / {t['team']}")
            else: seen[p['n']]=t['team']
json.dump(out,open('data3.json','w',encoding='utf-8'),ensure_ascii=False)
n=sum(len(v) for v in out.values()); pl=sum(len(t['players']) for v in out.values() for t in v)
print(n,'takım',pl,'oyuncu',dict(report))
print('çift:',dupfix)
short=[(s,t['team'],len(t['players'])) for s,v in out.items() for t in v if len(t['players'])<11]; print('11den az:',short)
nogk=[(s,t['team']) for s,v in out.items() for t in v if not any('GK' in p['p'] for p in t['players'])]; print('kalecisiz:',nogk)
print('2025:',[ (t['team'],[p['n'] for p in t['players']]) for t in out['2025-26']])
