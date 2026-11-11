// ---------- açılış ----------
applyTheme();
applyI18nData();
readChallengeFromUrl();
if (myTeamBad()){ store.set("team", null); S.badNameMsg = "Takım adın kurallarımıza uymadığı için silindi, yeni bir ad seç."; renderNameScreen(false); }
else if (getTeam()) renderStart(); else renderNameScreen(false);
updateHeaderName();
paintSoundBtn();
startI18n();
setTimeout(()=>showConsent(false), 1200);
if (typeof location!=="undefined" && location.protocol.startsWith("http")) { setTimeout(startPresence, 300); if (IS_WEB){ setTimeout(trackVisit, 900); registerPWA(); } }
if (typeof location!=="undefined" && /[?&]istatistik/.test(location.search)) setTimeout(()=>renderStats(), 400);
