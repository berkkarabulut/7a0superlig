// ---------- açılış ----------
applyTheme();
applyI18nData();
readChallengeFromUrl();
if (getTeam()) renderStart(); else renderNameScreen(false);
updateHeaderName();
paintSoundBtn();
startI18n();
setTimeout(()=>showConsent(false), 1200);
if (typeof location!=="undefined" && location.protocol.startsWith("http")) { setTimeout(startPresence, 300); if (IS_WEB){ setTimeout(trackVisit, 900); registerPWA(); } }
if (typeof location!=="undefined" && /[?&]istatistik/.test(location.search)) setTimeout(()=>renderStats(), 400);
