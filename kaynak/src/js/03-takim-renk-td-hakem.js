const SPEEDS = { "Yavaş": 220, "Normal": 140, "Hızlı": 50, "Anında": 0 };
const IS_WEB = typeof location!=="undefined" && location.protocol.startsWith("http") && !/claudeusercontent|claude\.ai/.test(location.host);
const SITE = IS_WEB ? (location.host+location.pathname).replace(/\/(index\.html)?$/,"") : "7a0superlig.com";
const SITE_URL = "https://"+SITE+"/";
const COLORS = { "Galatasaray":["#a90432","#fdb912"], "Fenerbahçe":["#163962","#ffed00"], "Beşiktaş":["#111111","#ffffff"], "Trabzonspor":["#7b1e3a","#6cace4"],
  "Başakşehir":["#ed6b1f","#1a2b58"], "Samsunspor":["#e30613","#ffffff"], "Bursaspor":["#00873e","#ffffff"], "Konyaspor":["#00843d","#ffffff"], "Adanaspor":["#f58220","#ffffff"],
  "Malatyaspor":["#ffd200","#111111"], "Gaziantepspor":["#d71920","#111111"], "Gençlerbirliği":["#d71920","#111111"], "Sivasspor":["#e30613","#ffffff"] };
const kitC = team => COLORS[team] || ["#6b4f86","#ffffff"];
const kit = team => { const c=kitC(team); return `<span class="kit" style="--c1:${c[0]};--c2:${c[1]}"></span>`; };
// sezon sonu teknik direktörü (bilinmeyenler boş)
const COACH = {
 "1986-87|Samsunspor":"Milorad Mitrović","1989-90|Trabzonspor":"Urbain Braems","2004-05|Trabzonspor":"Ziya Doğan / Şenol Güneş",
 "1980-81|Trabzonspor":"Özkan Sümer","1980-81|Galatasaray":"Brian Birch",
 "1981-82|Beşiktaş":"Đorđe Milić","1981-82|Trabzonspor":"Ahmet Suat Özyazıcı","1981-82|Fenerbahçe":"Friedel Rausch",
 "1982-83|Fenerbahçe":"Branko Stanković","1982-83|Trabzonspor":"Ahmet Suat Özyazıcı","1982-83|Galatasaray":"Özkan Sümer",
 "1983-84|Trabzonspor":"Ahmet Suat Özyazıcı","1983-84|Fenerbahçe":"Branko Stanković","1983-84|Galatasaray":"Tomislav Ivić",
 "1984-85|Fenerbahçe":"Todor Veselinović","1984-85|Beşiktaş":"Branko Stanković","1984-85|Trabzonspor":"İlyas Akçay",
 "1985-86|Beşiktaş":"Branko Stanković","1985-86|Galatasaray":"Jupp Derwall",
 "1986-87|Galatasaray":"Jupp Derwall","1986-87|Beşiktaş":"Miloš Milutinović",
 "1987-88|Galatasaray":"Mustafa Denizli","1987-88|Beşiktaş":"Gordon Milne",
 "1988-89|Fenerbahçe":"Todor Veselinović","1988-89|Beşiktaş":"Gordon Milne","1988-89|Galatasaray":"Mustafa Denizli",
 "1989-90|Beşiktaş":"Gordon Milne","1989-90|Fenerbahçe":"Todor Veselinović",
 "1990-91|Beşiktaş":"Gordon Milne","1990-91|Galatasaray":"Mustafa Denizli","1990-91|Trabzonspor":"Özkan Sümer",
 "1991-92|Beşiktaş":"Gordon Milne","1991-92|Fenerbahçe":"Jozef Vengloš","1991-92|Galatasaray":"Mustafa Denizli",
 "1992-93|Galatasaray":"Karl-Heinz Feldkamp","1992-93|Beşiktaş":"Gordon Milne","1992-93|Trabzonspor":"Georges Leekens",
 "1993-94|Galatasaray":"Reinhard Hollmann","1993-94|Fenerbahçe":"Holger Osieck","1993-94|Trabzonspor":"Şenol Güneş",
 "1994-95|Beşiktaş":"Christoph Daum","1994-95|Trabzonspor":"Şenol Güneş","1994-95|Galatasaray":"Müfit Erkasap",
 "1995-96|Fenerbahçe":"Carlos Alberto Parreira","1995-96|Trabzonspor":"Şenol Güneş","1995-96|Beşiktaş":"Christoph Daum",
 "1996-97|Galatasaray":"Fatih Terim","1996-97|Beşiktaş":"Rasim Kara","1996-97|Fenerbahçe":"Todor Veselinović",
 "1997-98|Galatasaray":"Fatih Terim","1997-98|Fenerbahçe":"Otto Barić","1997-98|Trabzonspor":"Ali Kemal Denizci",
 "1998-99|Galatasaray":"Fatih Terim","1998-99|Beşiktaş":"John Toshack","1998-99|Fenerbahçe":"Joachim Löw",
 "1999-00|Galatasaray":"Fatih Terim","1999-00|Beşiktaş":"Hans-Peter Briegel","1999-00|Gaziantepspor":"Sakıp Özberk",
 "2000-01|Fenerbahçe":"Mustafa Denizli","2000-01|Galatasaray":"Mircea Lucescu",
 "2001-02|Galatasaray":"Mircea Lucescu","2001-02|Fenerbahçe":"Werner Lorant","2001-02|Beşiktaş":"Christoph Daum",
 "2002-03|Beşiktaş":"Mircea Lucescu","2002-03|Galatasaray":"Fatih Terim","2002-03|Gençlerbirliği":"Ersun Yanal",
 "2003-04|Fenerbahçe":"Christoph Daum","2003-04|Trabzonspor":"Ziya Doğan","2003-04|Beşiktaş":"Mircea Lucescu",
 "2004-05|Fenerbahçe":"Christoph Daum","2004-05|Galatasaray":"Gheorghe Hagi",
 "2005-06|Galatasaray":"Eric Gerets","2005-06|Fenerbahçe":"Christoph Daum","2005-06|Beşiktaş":"Jean Tigana",
 "2006-07|Fenerbahçe":"Zico","2006-07|Beşiktaş":"Jean Tigana","2006-07|Galatasaray":"Eric Gerets",
 "2007-08|Galatasaray":"Cevat Güler","2007-08|Fenerbahçe":"Zico","2007-08|Beşiktaş":"Ertuğrul Sağlam",
 "2008-09|Beşiktaş":"Mustafa Denizli","2008-09|Sivasspor":"Bülent Uygun","2008-09|Trabzonspor":"Ersun Yanal",
 "2009-10|Bursaspor":"Ertuğrul Sağlam","2009-10|Fenerbahçe":"Christoph Daum","2009-10|Galatasaray":"Frank Rijkaard",
 "2010-11|Fenerbahçe":"Aykut Kocaman","2010-11|Trabzonspor":"Şenol Güneş","2010-11|Bursaspor":"Ertuğrul Sağlam",
 "2011-12|Galatasaray":"Fatih Terim","2011-12|Fenerbahçe":"Aykut Kocaman","2011-12|Trabzonspor":"Şenol Güneş",
 "2012-13|Galatasaray":"Fatih Terim","2012-13|Fenerbahçe":"Aykut Kocaman","2012-13|Beşiktaş":"Samet Aybaba",
 "2013-14|Fenerbahçe":"Ersun Yanal","2013-14|Galatasaray":"Roberto Mancini","2013-14|Beşiktaş":"Slaven Bilić",
 "2014-15|Galatasaray":"Hamza Hamzaoğlu","2014-15|Fenerbahçe":"İsmail Kartal","2014-15|Beşiktaş":"Slaven Bilić",
 "2015-16|Beşiktaş":"Şenol Güneş","2015-16|Fenerbahçe":"Vítor Pereira","2015-16|Konyaspor":"Aykut Kocaman",
 "2016-17|Beşiktaş":"Şenol Güneş","2016-17|Başakşehir":"Abdullah Avcı","2016-17|Fenerbahçe":"Dick Advocaat",
 "2017-18|Galatasaray":"Fatih Terim","2017-18|Fenerbahçe":"Aykut Kocaman","2017-18|Başakşehir":"Abdullah Avcı",
 "2018-19|Galatasaray":"Fatih Terim","2018-19|Başakşehir":"Abdullah Avcı","2018-19|Beşiktaş":"Şenol Güneş",
 "2019-20|Başakşehir":"Okan Buruk","2019-20|Trabzonspor":"Hüseyin Çimşir","2019-20|Beşiktaş":"Sergen Yalçın",
 "2020-21|Beşiktaş":"Sergen Yalçın","2020-21|Galatasaray":"Fatih Terim","2020-21|Fenerbahçe":"Emre Belözoğlu",
 "2021-22|Trabzonspor":"Abdullah Avcı","2021-22|Fenerbahçe":"İsmail Kartal","2021-22|Konyaspor":"İlhan Palut",
 "2022-23|Galatasaray":"Okan Buruk","2022-23|Fenerbahçe":"Jorge Jesus","2022-23|Beşiktaş":"Şenol Güneş",
 "2023-24|Galatasaray":"Okan Buruk","2023-24|Fenerbahçe":"İsmail Kartal","2023-24|Trabzonspor":"Abdullah Avcı",
 "2024-25|Galatasaray":"Okan Buruk","2024-25|Fenerbahçe":"José Mourinho","2024-25|Samsunspor":"Thomas Reis",
 "2025-26|Galatasaray":"Okan Buruk","2025-26|Fenerbahçe":"Zeki Murat Göle","2025-26|Trabzonspor":"Fatih Tekke"
};
const coachOf = t => COACH[t.season+"|"+t.team] || "";
// hakemler: [ad, ilk sezon yılı, son sezon yılı] (yaklaşık aktif dönem)
const REFS = [["Yusuf Namoğlu",1978,1990],["Erman Toroğlu",1980,1992],["Necmi Temizel",1980,1990],["Sadık Deda",1980,1993],["İhsan Türe",1982,1993],["Talat Tokat",1980,1991],["Burhan Koç",1980,1990],
 ["Hilmi Ok",1985,1996],["Ahmet Çakar",1988,1998],["Metin Tokat",1990,2003],["Oğuz Sarvan",1990,2002],["Mustafa Çulcu",1991,2003],["Muhittin Boşat",1992,2002],["İbrahim Aksoy",1993,2003],["Serdar Tatlı",1996,2005],
 ["Selçuk Dereli",2000,2011],["Kuddusi Müftüoğlu",2000,2008],["Cüneyt Çakır",2001,2018],["Bülent Yıldırım",2003,2018],["Cem Papila",2002,2012],["Mustafa Kamil Abitoğlu",2003,2013],["Hüseyin Göçek",2005,2021],
 ["Fırat Aydınus",2005,2018],["Bülent Demirlek",2006,2016],["Serkan Çınar",2008,2013],["Halis Özkahya",2010,2022],["Ali Palabıyık",2010,2023],["Zorbay Küçük",2010,2023],["Mete Kalkavan",2010,2025],
 ["Ümit Öztürk",2011,2025],["Halil Umut Meler",2014,2026],["Volkan Bayarslan",2013,2026],["Arda Kardeşler",2015,2026],["Abdulkadir Bitigen",2015,2026],["Yaşar Kemal Uğurlu",2015,2026],["Atilla Karaoğlan",2017,2026],["Ali Şansalan",2016,2026]];
function pickRef(season){ const y=+season.slice(0,4)+1; const c=REFS.filter(([,a,b])=>a<=y+2&&b>=y-2); return rnd(c.length?c:REFS)[0]; }
const BENCH_SLOTS = ["BGK","BDF","BDF","BMF","BMF","BFW","BFW"];
const MAXSUBS = 5;
// zorluk eğrisi: grupta biraz destek, elemelerde turnuva baskısı (+ bize, - rakibe)
let STAGE_BOOST = [3.2,3.2,3.2,-0.9,-1.6,-2.3,-3];
const TALKS = [
  {t:"Sakin olun, kendi oyunumuzu oynayalım", e:"🧘", fx:{fav:[.4,.55,.05],even:[.4,.52,.08],dog:[.28,.6,.12]}},
  {t:"Bu maçı kazanmak zorundayız, sahada ölün!", e:"🔥", big:true, fx:{fav:[.25,.4,.35],even:[.45,.35,.2],dog:[.6,.25,.15]}},
  {t:"Size güveniyorum, bu ligin en iyisi sizsiniz", e:"🤝", fx:{fav:[.2,.45,.35],even:[.42,.43,.15],dog:[.55,.35,.1]}},
  {t:"Rakibi sakın küçümsemeyin, konsantrasyon!", e:"☝️", fx:{fav:[.55,.4,.05],even:[.35,.55,.1],dog:[.15,.5,.35]}},
];


