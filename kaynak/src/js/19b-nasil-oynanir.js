// ---------- nasıl oynanır (ayrıntılı, 3 dil) ----------
// Metin her dilde ayrı yazılı; DOM çevirmeni bu bölüme dokunmaz (sözlükte karşılığı olmayan cümleler aynen kalır).
function howData(){
  const P = r => price(r);
  const tr = [
    ["amac","🎯 Amaç",`<p>Süper Lig 7-0'da 1980'den bugüne her sezon ligi ilk 3'te bitiren takımların oyuncularıyla kendi kadronu kurar, 7 maçlık bir turnuvaya çıkarsın. Hedef: <b>7 maç, 7 galibiyet</b>, mümkünse kalende tek gol görmeden. Sonucun bir skor gibi yazılır: kazandığın maç sayısı - kazanamadığın maç sayısı. 7'nin 7'sini kazanırsan 7-0 yapmış olursun.</p>
      <ol><li>Ana sayfadan bir mod seç.</li><li>Diziliş ve oyun tarzını belirle, 11'ini ve yedeklerini kur.</li><li>Kurayı çek, grubu geç, eleme turlarını kazan, kupayı kaldır.</li></ol>`],
    ["modlar","🎮 Oyun modları",`<p><b>🎮 Tek oyunculu:</b> Sınırsız oyun. İstediğin kadar kur, istediğin kadar dene. Günün en iyi sonucun "Tek oyunculu" sıralamasına yazılır.</p>
      <p><b>🗓️ Günün meydan okuması:</b> O gün herkese aynı takım sırası gelir ve herkesin ${DAILY_BUDGET} M bütçesi vardır. Her oyuncunun reytingine göre bir fiyatı var: 95'lik bir oyuncu ${P(95)} M, 90'lık ${P(90)} M, 85'lik ${P(85)} M, 80 ve altı 1 M. Yıldızlarla dolu bir kadro kuramazsın, bütçeyi akıllı dağıtman gerekir. Günde sadece ilk oyunun sayılır, sonrakiler sıralamaya girmez. Her gün oynarsan 🔥 seri tutarsın, bir gün atlarsan seri bozulur.</p>
      <p><b>🏟️ Gerçek takımla oyna:</b> Bir sezonun gerçek kadrosunu seçersin (örneğin 1998-99 Galatasaray). En uygun diziliş ve ilk 11 otomatik kurulur, kalanlar yedeğe geçer. İstersen dizilişi, tarzı ve 11'i değiştirirsin. Rakiplerin diğer sezonların gerçek kadrolarıdır. Kadrosu eksik birkaç takım şimdilik kilitli. Sonuçların ayrı "Gerçek takım" sıralamasında, hangi takımla oynadığınla birlikte görünür.</p>
      <p><b>🧠 Bu kadro hangi sezon?:</b> Günlük bilgi yarışması. Bir takımın 11'ini görürsün, hangi sezonun hangi takımı olduğunu bulursun. 5 soru var, ipucu olarak sırası ve teknik direktörünün baş harfleri verilir. Günde bir kez sayılır, sonra istediğin kadar pratik yapabilirsin.</p>
      <p><b>📖 Almanak modu:</b> Tek oyunculu ve meydan okumada açabileceğin zor mod. Reytingler gizlenir, oyuncuları sadece adı ve mevkisiyle seçersin. Futbol hafızana güveniyorsan tam sana göre.</p>`],
    ["kadro","🧩 Kadro kurma",`<p>Önce dizilişini (9 seçenek: 4-3-3, 4-4-2, 3-5-2, 4-2-3-1 vb.) ve oyun tarzını seçersin. Sonra kura başlar: her çekilişte bir <b>sezon-takım</b> gelir, o takımdan <b>bir oyuncu</b> alırsın.</p>
      <ul><li>Oyuncuya dokununca sahada oynayabileceği yerler yanar, hangisine koyacağını sen seçersin.</li>
      <li><b>Kendi mevkisinde</b> oynayan oyuncu tam reytingle oynar. <b>Yakın bir mevkiye</b> de koyabilirsin (stoperi sağ beke, kanadı forvete gibi) ama oyuncu ${OFFPOS} reyting kaybeder ve takımın hücum ile savunması ${TEAM_OFF} puan düşer. Sahada bu oyuncuların formasında turuncu <b>!</b> işareti çıkar.</li>
      <li>Gelen takımdan işine yarayan kimse yoksa ya da beğenmezsen <b>yeniden çek</b>ebilirsin. Kadro başına ${REROLLS} hakkın var. Kura sadece işine yarayacak oyuncusu olan takımları getirir.</li>
      <li>Aynı oyuncuyu bir kez alabilirsin, başka bir sezonla tekrar gelirse seçilemez.</li>
      <li>Reytingi <b>${LEGEND} ve üstü</b> olan oyuncular efsanedir, formaları altın ışıkla parlar.</li>
      <li>11'i tamamlayınca <b>7 yedek</b> seçersin (1 kaleci, 2 defans, 2 orta saha, 2 forvet). İstersen yedeksiz de devam edebilirsin ama kırmızı kart ya da sakatlıkta 10 kişi kalırsın.</li></ul>
      <p><b>Reyting rozetleri:</b> altın 90+ · pembe 87-89 · turkuaz 84-86 · mavi 80-83 · gri 80 altı.</p>`],
    ["kimya","⚗️ Kimya",`<p>Birbirini tanıyan oyuncular daha iyi oynar. Aynı sezon-takımdan gelen oyuncular, aynı kulüpten 3 ve üstü oyuncu ve efsane ikililer (Hagi ile Hakan Şükür; Metin, Ali ve Feyyaz; Sneijder ile Drogba; Alex ile Tuncay gibi) takımına bonus verir. Toplam kimya en fazla <b>+5</b> olur. Kadro kurarken sağ alttaki kimya satırından neyin bonus verdiğini görürsün.</p>`],
    ["taktik","📋 Diziliş ve oyun tarzı",`<p>7 oyun tarzı var: ⚖️ Dengeli, 🎯 Topa sahip ol, ⚡ Önde baskı, 🏹 Kontra atak, 🪽 Kanat oyunu, 🚀 Uzun top, 🚌 Otobüsü çek.</p>
      <ul><li><b>Tarzlar birbirini yener:</b> kontra atak önde basana, önde baskı topa sahip olana, uzun top önde basana karşı etkilidir; kanat oyunu ve topa sahip olmak otobüsü çeken takımı açar. Maç önünde rakibin tarzını görürsün; senin tarzın avantajlıysa ✓, dezavantajlıysa ⚠ işareti çıkar.</li>
      <li><b>Tarz kadrona uymalı:</b> topa sahip olmak güçlü orta saha, kanat oyunu iyi kanatlar ve bekler, kontra ve uzun top iyi forvet ister.</li>
      <li><b>Önde baskı</b> çok etkilidir ama 60. dakikadan sonra takımı yorar.</li>
      <li>Rakiplerin de bir tarzı vardır, çoğu teknik direktörüne göre.</li></ul>`],
    ["hazir","✅ 11'in hazır ekranı",`<p>Kadro bitince turnuvadan önce son kez bakarsın. Bir oyuncuya, sonra yer değiştireceği oyuncuya <b>dokunarak</b> 11 içinde yer değiştirebilir ya da yedekten birini 11'e alabilirsin. Burada <b>maç hızını</b> da seçersin: Yavaş, Normal, Hızlı ya da Anında. "Anında"da maçlar beklemeden oynanır ama devre arası atlanır.</p>`],
    ["turnuva","🏆 Turnuva",`<ul><li><b>Grup kurası:</b> Üç torba var: şampiyonlar, ikinciler, üçüncüler. Her torbadan bir takım senin grubuna düşer. Topları tek tek çekebilir ya da kurayı atlayabilirsin.</li>
      <li><b>Grup:</b> 4 takımlı grupta 3 maç oynarsın. Galibiyet 3, beraberlik 1 puan. İlk 2'ye girersen gruptan çıkarsın.</li>
      <li><b>Eleme:</b> Son 16 kurası çekilir, sonra çeyrek final, yarı final ve final. Eleme ağacını maç ekranında takip edersin.</li>
      <li><b>Uzatma ve penaltı:</b> Eleme maçı berabere biterse 30 dakika uzatma oynanır. Yine eşitlik olursa oyun durur, <b>penaltıcılarını sen sıralarsın</b>.</li>
      <li>Her maçın bir hakemi, her rakibin bir teknik direktörü vardır.</li></ul>`],
    ["macono","🗣️ Maç önü",`<ul><li><b>Takım konuşması:</b> Her maçtan önce takımına 4 konuşmadan birini yaparsın (🧘 sakin olun, 🔥 sahada ölün, 🤝 size güveniyorum, ☝️ rakibi küçümsemeyin). Konuşmanın etkisi rakibin gücüne göre değişir: oyuncuların morali yükselir ya da düşer, moral reytinge yansır. Favori olduğun maçta "sahada ölün" demek ters tepebilir.</li>
      <li><b>Kadro değişikliği:</b> Her maçtan önce 11'ini yeniden ayarlayabilirsin. Yedeği sahadaki oyuncunun üstüne sürükle ya da önce birine sonra diğerine dokun. Değişikliğin takım gücünü nasıl etkilediğini anında görürsün.</li>
      <li><b>Cezalı ve sakat:</b> Kırmızı kart gören oyuncu sonraki maçta cezalıdır, sakatlanan oyuncu 1-2 maç yoktur. Böyle bir oyuncu 11'indeyse maç önünde uyarı çıkar; yerine birini koymadan maça çıkamazsın, istersen tek tuşla otomatik değiştirirsin.</li></ul>`],
    ["mac","⚽ Maç ve devre arası",`<p>Maçlar dakika dakika oynanır. Sahada iki takımı birlikte görürsün: rakip üstte, sen alttasın. Anlatımda goller, kurtarışlar, direkten dönen toplar, ofsaytlar, sarı ve kırmızı kartlar, sakatlıklar ve penaltılar düşer. Reyting, diziliş ve tarz sonucu belirler ama futbol bu, sürpriz her zaman olabilir.</p>
      <p><b>Devre arası</b> oyun durur ve şunları yapabilirsin:</p>
      <ul><li>Oyun tarzını değiştirmek,</li><li>Anlayışı seçmek: Aynen devam, Hücuma geç (+2 hücum, -2 savunma) ya da Skoru koru (-2 hücum, +2 savunma),</li>
      <li>Oyuncu değiştirmek: kulübedeki oyuncuyu sahadakinin üstüne sürüklersin. Maç başına en fazla <b>${MAXSUBS} değişiklik</b> hakkın var.</li></ul>
      <p>Hazır olunca büyük sarı <b>"İkinci yarıyı başlat"</b> butonuna basarsın. Maç içinde yapılan değişiklikler kalıcı değildir; bir sonraki maça senin kurduğun 11 ile çıkılır.</p>`],
    ["sonuc","🏁 Sonuç ve paylaşım",`<p>Turnuva bitince sonucun skor gibi yazılır (örneğin 5-2). Penaltıyla kazanılan eleme maçları galibiyet sayılır, elenirsen kalan maçlar kayıp sayılır. Sonuç ekranından görsel olarak paylaşabilir, <b>⚔️ Arkadaşına meydan oku</b> linkiyle arkadaşına aynı kurayı ve aynı dizilişi gönderip "aynı takımlarla sen kaç yaparsın?" diyebilirsin.</p>`],
    ["siralama","📊 Sıralamalar",`<ul><li><b>🗓️ Günün meydan okuması:</b> Herkesin günün ilk oyunu sıralanır. Sıralama: galibiyet, averaj, atılan gol, sonra harcanan bütçe (az olan önde).</li>
      <li><b>🎮 Tek oyunculu:</b> Her takımın günün en iyi sonucu yazılır.</li>
      <li><b>🏟️ Gerçek takım:</b> Gerçek kadrolarla oynananların günlük tablosu, kim hangi takımla oynamış görünür.</li>
      <li><b>👑 Haftalık lig:</b> Pazartesiden bugüne meydan okuma galibiyetlerin toplanır. Pazar gecesi liderde kalan haftanın şampiyonu olur.</li></ul>
      <p>Bugünün ve dünün tablosuna bakabilirsin. Takım adın sıralamada görünür; küfür, hakaret ya da ırk, din veya etnik köken içeren adlar kabul edilmez.</p>`],
    ["profil","🏅 Profil, albüm ve başarımlar",`<ul><li><b>Profil:</b> Kaç turnuva oynadın, kaç şampiyonluğun ve kaç 7-0'ın var, en iyi sonucun, en çok kullandığın oyuncular, golcülerin, diziliş ve tarzların.</li>
      <li><b>📒 Efsaneler albümü:</b> Kadronda oynattığın her efsane (${LEGEND}+) albümüne girer. Hepsini toplamaya çalış.</li>
      <li><b>Başarımlar:</b> Şampiyon, Yenilmez, 7-0, Kalede kilit (gol yemeden 7-0), Almanakçı, Cimri, Anadolu kartalı, 80'ler çocuğu, Tek forma, Mütevazı ve daha fazlası.</li></ul>`],
    ["diger","⚙️ Ayarlar ve diğerleri",`<ul><li><b>Ayarlar (⚙️):</b> Tema (TV, Klasik, Gece), dil (Türkçe, English, Español) ve ses.</li>
      <li><b>Davet et (📨):</b> Siteyi arkadaşlarına WhatsApp'tan, X'ten ya da linkle gönder.</li>
      <li><b>Kadrolar sekmesi:</b> Bütün sezonların kadrolarını, reytingleri ve mevkileriyle incele. Yanlış gördüğün bir şey varsa oradan <b>bildir</b>.</li>
      <li><b>BETA:</b> Site deneme sürümünde. Üstteki BETA etiketine tıklayıp hata, öneri ya da fikrini yazabilirsin; hepsini okuyoruz.</li>
      <li>Siteyi telefonuna uygulama gibi ekleyebilirsin, ana sayfada "Ana ekrana ekle" butonu çıkar.</li></ul>
      <p class="mut">Kadrolar her sezon ligi ilk 3'te bitiren takımlardan gelir. Reytingler oyun için hazırlanmış nostaljik ve öznel değerlerdir, resmi bir kaynağa dayanmaz.</p>`],
  ];
  if (LANG==="tr") return tr;
  const en = [
    ["amac","🎯 The goal",`<p>In Süper Lig 7-0 you build your own squad from players of every team that finished in the top 3 of the Turkish Süper Lig from 1980 to today, then take it into a 7-match tournament. The goal: <b>7 matches, 7 wins</b>, ideally without conceding a single goal. Your result reads like a score: matches won - matches not won. Win all 7 and you've gone 7-0.</p>
      <ol><li>Pick a mode on the home page.</li><li>Choose a formation and playing style, build your XI and subs.</li><li>Do the draw, get out of the group, win the knockouts, lift the cup.</li></ol>`],
    ["modlar","🎮 Game modes",`<p><b>🎮 Solo:</b> Unlimited play. Build and retry as often as you like. Your best result of the day goes on the Solo table.</p>
      <p><b>🗓️ Daily Challenge:</b> Everyone gets the same team order that day and a ${DAILY_BUDGET} M budget. Every player has a price based on rating: a 95 costs ${P(95)} M, a 90 costs ${P(90)} M, an 85 costs ${P(85)} M, 80 and below cost 1 M. You can't stack stars, so spend wisely. Only your first game of the day counts. Play every day to keep your 🔥 streak alive.</p>
      <p><b>🏟️ Play with a real team:</b> Pick a real squad from a season (e.g. 1998-99 Galatasaray). The best formation and XI are set up automatically and the rest go to the bench; you can change formation, style and lineup. Your opponents are real squads from other seasons. A few incomplete squads are locked for now. Results go on a separate "Real team" table showing which team you used.</p>
      <p><b>🧠 Which season is this squad?:</b> A daily quiz. You see a team's XI and guess the team and season. 5 questions; the hint shows its league position and the coach's initials. Counts once a day, then you can practise as much as you like.</p>
      <p><b>📖 Almanac mode:</b> A hard mode for Solo and the Daily Challenge. Ratings are hidden and you pick players by name and position only.</p>`],
    ["kadro","🧩 Building your squad",`<p>First choose a formation (9 options: 4-3-3, 4-4-2, 3-5-2, 4-2-3-1, etc.) and a playing style. Then the draw starts: each draw brings a <b>season-team</b> and you take <b>one player</b> from it.</p>
      <ul><li>Tap a player to light up the spots he can play; you choose where he goes.</li>
      <li>A player in his <b>own position</b> plays at full rating. You can also use a <b>nearby position</b> (a centre-back at right-back, a winger up front) but he loses ${OFFPOS} rating and your team loses ${TEAM_OFF} attack and defence. These players get an orange <b>!</b> on their shirt.</li>
      <li>If nobody useful comes up, <b>re-draw</b>. You get ${REROLLS} re-draws per squad. The draw only brings teams with at least one player you can use.</li>
      <li>You can take each player only once, even if he shows up again in another season.</li>
      <li>Players rated <b>${LEGEND}+</b> are legends; their shirts glow gold.</li>
      <li>After the XI you pick <b>7 subs</b> (1 GK, 2 DF, 2 MF, 2 FW). You can skip them, but a red card or injury will leave you with 10 men.</li></ul>
      <p><b>Rating badges:</b> gold 90+ · pink 87-89 · teal 84-86 · blue 80-83 · grey under 80.</p>`],
    ["kimya","⚗️ Chemistry",`<p>Players who know each other play better. Players from the same season-team, 3+ players from the same club and legendary duos (Hagi & Hakan Şükür; Metin, Ali & Feyyaz; Sneijder & Drogba; Alex & Tuncay…) give your team a bonus, up to <b>+5</b> in total. The chemistry line under the pitch shows what's giving you a bonus.</p>`],
    ["taktik","📋 Formation and style",`<p>7 styles: ⚖️ Balanced, 🎯 Possession, ⚡ High press, 🏹 Counter-attack, 🪽 Wing play, 🚀 Long ball, 🚌 Park the bus.</p>
      <ul><li><b>Styles beat each other:</b> counter-attack and long ball beat the high press, the high press beats possession, wing play and possession break down a parked bus. Before the match you see the opponent's style; ✓ means you have the edge, ⚠ means they do.</li>
      <li><b>The style must suit your squad:</b> possession needs a strong midfield, wing play needs good wingers and full-backs, counter and long ball need good forwards.</li>
      <li>The <b>high press</b> is strong but tires your team after the 60th minute.</li>
      <li>Opponents have a style too, mostly based on their coach.</li></ul>`],
    ["hazir","✅ Your XI is ready",`<p>One last look before the tournament. <b>Tap</b> a player, then the player to swap with, to move players around or bring someone in from the bench. You also choose the <b>match speed</b> here: Slow, Normal, Fast or Instant. On Instant matches play out straight away but half-time is skipped.</p>`],
    ["turnuva","🏆 The tournament",`<ul><li><b>Group draw:</b> three pots: champions, runners-up, third places. One team from each pot joins your group. Draw the balls one by one or skip.</li>
      <li><b>Group stage:</b> 3 matches in a group of 4. Win 3 points, draw 1. Finish top 2 to go through.</li>
      <li><b>Knockouts:</b> Round of 16 draw, then quarter-final, semi-final and final. Follow the bracket on the match screen.</li>
      <li><b>Extra time and penalties:</b> a drawn knockout goes to 30 minutes of extra time. Still level? The game stops and <b>you order your penalty takers</b>.</li>
      <li>Every match has a referee and every opponent has a coach.</li></ul>`],
    ["macono","🗣️ Before the match",`<ul><li><b>Team talk:</b> before each match you give one of 4 talks (🧘 stay calm, 🔥 give everything, 🤝 I believe in you, ☝️ don't underestimate them). The effect depends on how strong the opponent is: morale goes up or down and morale affects ratings. Telling favourites to "give everything" can backfire.</li>
      <li><b>Lineup changes:</b> rearrange your XI before every match. Drag a sub onto a player or tap one then the other; you see the effect on team strength instantly.</li>
      <li><b>Suspensions and injuries:</b> a red card means a one-match ban, an injury keeps a player out for 1-2 matches. If such a player is in your XI you get a warning and can't kick off until he's replaced; one tap does it for you.</li></ul>`],
    ["mac","⚽ The match and half-time",`<p>Matches are played minute by minute. You see both teams on one pitch: the opponent at the top, you at the bottom. The commentary shows goals, saves, shots off the post, offsides, yellow and red cards, injuries and penalties. Ratings, formation and style decide the result, but it's football; upsets happen.</p>
      <p>At <b>half-time</b> the game stops and you can:</p>
      <ul><li>change your playing style,</li><li>choose a mentality: Keep going, Go for it (+2 attack, -2 defence) or Protect the lead (-2 attack, +2 defence),</li>
      <li>make substitutions by dragging a sub onto a player. Up to <b>${MAXSUBS} subs</b> per match.</li></ul>
      <p>When ready, hit the big yellow <b>"Start the second half"</b> button. In-match changes aren't permanent; the next match starts with the XI you set.</p>`],
    ["sonuc","🏁 Result and sharing",`<p>When the tournament ends your result reads like a score (e.g. 5-2). Knockout wins on penalties count as wins; if you're knocked out, the remaining matches count as losses. Share your result as an image, or send a <b>⚔️ challenge link</b> with the same draw and formation: "same teams, what can you do?"</p>`],
    ["siralama","📊 Rankings",`<ul><li><b>🗓️ Daily Challenge:</b> everyone's first game of the day. Order: wins, goal difference, goals scored, then budget spent (less is better).</li>
      <li><b>🎮 Solo:</b> each team's best result of the day.</li>
      <li><b>🏟️ Real team:</b> daily table for real squads, showing which team each player used.</li>
      <li><b>👑 Weekly league:</b> Daily Challenge wins from Monday to today. Whoever leads on Sunday night is champion of the week.</li></ul>
      <p>You can see today's and yesterday's tables. Your team name is shown publicly; names with swearing, insults or references to race, religion or ethnicity aren't allowed.</p>`],
    ["profil","🏅 Profile, album and achievements",`<ul><li><b>Profile:</b> tournaments played, titles, 7-0s, best result, most-used players, top scorers, formations and styles.</li>
      <li><b>📒 Legends album:</b> every legend (${LEGEND}+) you play with goes into your album. Collect them all.</li>
      <li><b>Achievements:</b> Champion, Unbeaten, 7-0, Clean sheet 7-0, Almanac, Penny-pincher, Anatolian eagle, 80s kid, One shirt, Underdog and more.</li></ul>`],
    ["diger","⚙️ Settings and more",`<ul><li><b>Settings (⚙️):</b> theme (TV, Classic, Night), language (Türkçe, English, Español) and sound.</li>
      <li><b>Invite (📨):</b> send the site to friends via WhatsApp, X or a link.</li>
      <li><b>Squads tab:</b> browse every season's squads with ratings and positions. Spot a mistake? <b>Report</b> it there.</li>
      <li><b>BETA:</b> the site is in beta. Tap the BETA tag at the top to send bugs, suggestions or ideas; we read them all.</li>
      <li>Add the site to your phone's home screen like an app; an "Add to home screen" button appears on the home page.</li></ul>
      <p class="mut">Squads come from teams that finished in the top 3 each season. Ratings are nostalgic, subjective values made for the game, not from an official source.</p>`],
  ];
  if (LANG==="en") return en;
  return [
    ["amac","🎯 El objetivo",`<p>En Süper Lig 7-0 armas tu plantilla con jugadores de todos los equipos que terminaron entre los 3 primeros de la Süper Lig turca desde 1980 hasta hoy, y la llevas a un torneo de 7 partidos. El objetivo: <b>7 partidos, 7 victorias</b>, a ser posible sin encajar ni un gol. Tu resultado se lee como un marcador: partidos ganados - partidos no ganados. Si ganas los 7, has hecho 7-0.</p>
      <ol><li>Elige un modo en la portada.</li><li>Elige formación y estilo, arma tu once y tus suplentes.</li><li>Haz el sorteo, supera el grupo, gana las eliminatorias y levanta la copa.</li></ol>`],
    ["modlar","🎮 Modos de juego",`<p><b>🎮 Solo:</b> juego ilimitado. Arma y vuelve a intentarlo cuantas veces quieras. Tu mejor resultado del día va a la tabla Solo.</p>
      <p><b>🗓️ Reto del día:</b> ese día todos reciben el mismo orden de equipos y ${DAILY_BUDGET} M de presupuesto. Cada jugador tiene un precio según su valoración: uno de 95 cuesta ${P(95)} M, uno de 90 ${P(90)} M, uno de 85 ${P(85)} M, y los de 80 o menos 1 M. Solo cuenta tu primera partida del día. Juega cada día para mantener tu 🔥 racha.</p>
      <p><b>🏟️ Juega con un equipo real:</b> elige la plantilla real de una temporada (p. ej. Galatasaray 1998-99). La mejor formación y el once se arman solos y el resto va al banquillo; puedes cambiarlo todo. Tus rivales también son plantillas reales. Algunas plantillas incompletas están bloqueadas por ahora. Los resultados van a una tabla aparte, "Equipo real".</p>
      <p><b>🧠 ¿De qué temporada es esta plantilla?:</b> quiz diario. Ves el once de un equipo y adivinas equipo y temporada. 5 preguntas; la pista muestra su posición y las iniciales del entrenador. Cuenta una vez al día y luego puedes practicar.</p>
      <p><b>📖 Modo almanaque:</b> modo difícil para Solo y el Reto del día. Las valoraciones se ocultan y eliges solo por nombre y posición.</p>`],
    ["kadro","🧩 Armar la plantilla",`<p>Primero elige formación (9 opciones) y estilo de juego. Luego empieza el sorteo: cada vez sale una <b>temporada-equipo</b> y tomas <b>un jugador</b> de ella.</p>
      <ul><li>Toca a un jugador y se iluminan los puestos donde puede jugar; tú eliges dónde va.</li>
      <li>En su <b>propia posición</b> juega con toda su valoración. En una <b>posición cercana</b> pierde ${OFFPOS} puntos y tu equipo pierde ${TEAM_OFF} de ataque y defensa; su camiseta lleva un <b>!</b> naranja.</li>
      <li>Si no sale nadie útil, <b>vuelve a sortear</b>: tienes ${REROLLS} intentos por plantilla.</li>
      <li>Cada jugador solo puede elegirse una vez.</li>
      <li>Los jugadores de <b>${LEGEND}+</b> son leyendas y su camiseta brilla en oro.</li>
      <li>Después del once eliges <b>7 suplentes</b> (1 POR, 2 DEF, 2 MED, 2 DEL). Sin suplentes, una roja o una lesión te deja con 10.</li></ul>
      <p><b>Insignias:</b> oro 90+ · rosa 87-89 · turquesa 84-86 · azul 80-83 · gris menos de 80.</p>`],
    ["kimya","⚗️ Química",`<p>Jugadores de la misma temporada-equipo, 3 o más del mismo club y dúos legendarios (Hagi y Hakan Şükür; Metin, Ali y Feyyaz; Sneijder y Drogba; Alex y Tuncay…) dan un bonus a tu equipo, hasta <b>+5</b> en total.</p>`],
    ["taktik","📋 Formación y estilo",`<p>7 estilos: ⚖️ Equilibrado, 🎯 Posesión, ⚡ Presión alta, 🏹 Contraataque, 🪽 Juego por bandas, 🚀 Balón largo, 🚌 Autobús.</p>
      <ul><li><b>Los estilos se ganan entre sí:</b> el contraataque y el balón largo superan a la presión alta, la presión alta a la posesión, las bandas y la posesión rompen el autobús. Antes del partido ves el estilo rival: ✓ ventaja tuya, ⚠ ventaja suya.</li>
      <li><b>El estilo debe encajar con tu plantilla:</b> la posesión pide un buen centro del campo, las bandas buenos extremos y laterales, el contraataque y el balón largo buenos delanteros.</li>
      <li>La <b>presión alta</b> cansa a tu equipo después del minuto 60.</li></ul>`],
    ["hazir","✅ Tu once está listo",`<p>Último vistazo antes del torneo. <b>Toca</b> un jugador y luego el jugador por el que lo cambias para mover posiciones o meter a un suplente. Aquí eliges también la <b>velocidad</b>: Lenta, Normal, Rápida o Instantánea (en Instantánea se salta el descanso).</p>`],
    ["turnuva","🏆 El torneo",`<ul><li><b>Sorteo de grupos:</b> tres bombos: campeones, subcampeones y terceros. Un equipo de cada bombo cae en tu grupo.</li>
      <li><b>Fase de grupos:</b> 3 partidos en un grupo de 4. Victoria 3 puntos, empate 1. Los 2 primeros pasan.</li>
      <li><b>Eliminatorias:</b> sorteo de octavos, luego cuartos, semifinal y final.</li>
      <li><b>Prórroga y penaltis:</b> si una eliminatoria acaba en empate hay 30 minutos de prórroga; si sigue igual, <b>tú ordenas a los lanzadores</b>.</li></ul>`],
    ["macono","🗣️ Antes del partido",`<ul><li><b>Charla:</b> antes de cada partido eliges una de 4 charlas. Su efecto depende de la fuerza del rival: la moral sube o baja y afecta a las valoraciones.</li>
      <li><b>Cambios en el once:</b> reorganiza tu once antes de cada partido arrastrando o tocando.</li>
      <li><b>Sanciones y lesiones:</b> una roja es un partido de sanción, una lesión 1-2 partidos. Si están en tu once, no puedes empezar hasta sustituirlos (un toque lo hace por ti).</li></ul>`],
    ["mac","⚽ El partido y el descanso",`<p>Los partidos se juegan minuto a minuto, con los dos equipos en el mismo campo: el rival arriba, tú abajo. En el <b>descanso</b> puedes cambiar el estilo, elegir mentalidad (Seguir igual, Ir al ataque +2/-2, Proteger el resultado -2/+2) y hacer cambios arrastrando suplentes al campo, hasta <b>${MAXSUBS}</b> por partido. Luego pulsa el gran botón amarillo <b>"Empezar la segunda parte"</b>. Los cambios durante el partido no son permanentes.</p>`],
    ["sonuc","🏁 Resultado y compartir",`<p>Tu resultado se lee como un marcador (p. ej. 5-2). Las victorias en penaltis cuentan como victorias; si te eliminan, los partidos restantes cuentan como derrotas. Compártelo como imagen o envía un <b>⚔️ enlace de reto</b> con el mismo sorteo y formación.</p>`],
    ["siralama","📊 Clasificaciones",`<ul><li><b>🗓️ Reto del día:</b> primera partida del día de cada uno. Orden: victorias, diferencia de goles, goles a favor y presupuesto gastado.</li>
      <li><b>🎮 Solo:</b> el mejor resultado del día de cada equipo.</li>
      <li><b>🏟️ Equipo real:</b> tabla diaria con plantillas reales.</li>
      <li><b>👑 Liga semanal:</b> victorias del Reto del día de lunes a hoy; el líder del domingo por la noche es el campeón de la semana.</li></ul>
      <p>Los nombres con insultos o referencias a raza, religión u origen étnico no están permitidos.</p>`],
    ["profil","🏅 Perfil, álbum y logros",`<ul><li><b>Perfil:</b> torneos, títulos, 7-0, mejor resultado, jugadores más usados, goleadores, formaciones y estilos.</li>
      <li><b>📒 Álbum de leyendas:</b> cada leyenda (${LEGEND}+) con la que juegas entra en tu álbum.</li>
      <li><b>Logros:</b> Campeón, Invicto, 7-0, Portería a cero, Almanaque y muchos más.</li></ul>`],
    ["diger","⚙️ Ajustes y más",`<ul><li><b>Ajustes (⚙️):</b> tema, idioma y sonido.</li><li><b>Invitar (📨):</b> envía el sitio por WhatsApp, X o enlace.</li>
      <li><b>Pestaña Plantillas:</b> consulta todas las plantillas y <b>reporta</b> errores.</li>
      <li><b>BETA:</b> toca la etiqueta BETA para enviar fallos o ideas.</li></ul>
      <p class="mut">Las valoraciones son valores nostálgicos y subjetivos creados para el juego.</p>`],
  ];
}
function renderHow(){
  const secs = howData(), title = LANG==="en" ? "How to play" : LANG==="es" ? "Cómo jugar" : "Nasıl oynanır";
  $("how").innerHTML = `<h1>${title}</h1>
    <div class="howtoc">${secs.map(([id,t])=>`<a href="#" onclick="document.getElementById('how-${id}').scrollIntoView({behavior:'smooth',block:'start'});return false">${t}</a>`).join("")}</div>
    ${secs.map(([id,t,body])=>`<div class="card howsec" id="how-${id}"><h3>${t}</h3>${body}</div>`).join("")}`;
}
