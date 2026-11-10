# Kaynak dosyalar

Oyun parçalara bölünmüş halde `src/` altında durur, `build.py` bunları birleştirip tek dosya `../index.html` üretir (GitHub Pages bunu yayınlar).

## Yapı

- `src/sablon.html` · sayfa iskeleti (üst menü, sekmeler); `/*CSS*/`, `/*JS*/`, `/*DATA*/` yerlerine içerik gömülür
- `src/css/` · stiller, ada göre sırayla birleşir
  `01-temel` · `02-tema-tv` · `03-saha-forma-kulube` · `04-kura` · `05-mac-onu-mac` · `06-surukle-birak` · `07-mobil-duzeltmeler`
- `src/js/` · kod, ada göre sırayla birleşir
  `01-veri-ve-sabitler` (dizilişler, mevkiler) · `02-taktik-tarzlar` · `03-takim-renk-td-hakem` · `04-yardimcilar` · `05-takim-adi` · `06-baslangic` · `07-kadro-kurma` · `08-guc-kimya` · `09-mac-motoru` · `10-turnuva-kadro-moral` · `11-kura-toreni` · `12-mac-onu` · `13-surukle-birak` · `14-penalti-secimi` · `15-mac-ekrani-devre-arasi` · `16-eleme-agaci` · `17-sonuc-paylasim` · `18-basarimlar` · `19-kadrolar-sekmesi` · `20-online-sayac` · `21-siralama` · `22-hata-bildir` · `23-takim-adi-rezervasyon`
- `data4.json` · 137 takımın kadroları, reytingler ve detaylı mevkiler
- `css-izinli-cakismalar.txt` · birden fazla CSS parçasında bilerek tanımlanan sınıflar
- `test/` · mantık testleri (node) + ekran robotu (playwright) + `calistir.sh`
- `firebase-rules.json` · Firebase veritabanı kuralları
- `positions.txt`, `top3.txt`, `raw/`, `parse.py`, `merge.py`, `build2.py` · veri hazırlama

## Çalışma şekli

```
python3 kaynak/build.py          # derle -> index.html (CSS çakışması varsa durur)
bash kaynak/test/calistir.sh     # tüm testler + ekran robotu
```

Kurallar:
1. Değişiklik `gelistirme` dalında yapılır, test sayfasında denenir.
2. `build.py` CSS çakışması bulursa yeni stile parçaya özel bir ad verilir (ör. `sb-…`, `mo-…`).
3. `calistir.sh` "TÜM TESTLER GEÇTİ" demeden `main`'e (canlıya) alınmaz.
4. Ekran robotu bilgisayar ve telefon boyutunda her ekranı gezer, butonların görünür ve tıklanabilir olduğunu ve JavaScript hatası olmadığını kontrol eder. Ekran görüntüleri `/tmp/robot/` altına düşer.
