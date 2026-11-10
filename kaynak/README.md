# Kaynak dosyalar

- `template.html` · oyunun kodu (`/*DATA*/` yerine veri gömülür)
- `data4.json` · 137 takımın kadroları, reytingler ve detaylı mevkiler
- `positions.txt` · oyuncu başına detaylı mevkiler (GK RB CB LB DM CM AM RM LM RW LW ST)
- `top3.txt` · 1980-81'den 2025-26'ya her sezonun ilk 3'ü (kaynaktan doğrulandı)
- `raw/nft.txt` · kaynaktan doğrulanmış kadrolar
- `raw/know_*.txt` · elle yazılan kadrolar
- `parse.py`, `merge.py`, `build2.py` · veri hazırlama scriptleri

Oyunu yeniden üretmek:

```
python3 -c "import json;t=open('kaynak/template.html',encoding='utf-8').read();d=json.load(open('kaynak/data4.json',encoding='utf-8'));open('index.html','w',encoding='utf-8').write(t.replace('/*DATA*/',json.dumps(d,ensure_ascii=False)))"
```
