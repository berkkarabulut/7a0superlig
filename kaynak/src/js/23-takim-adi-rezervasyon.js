// ---------- takım adı rezervasyonu ----------
async function reserveName(full){
  const key = nameKey(full), mine = store.get("myNames", []);
  if (mine.includes(key)) return true;
  const db = await fb(), ref = db.ref("names/"+key);
  const s = await ref.once("value"); if (s.exists()) return false;
  await ref.set({ n: full, t: TS() }); store.set("myNames", [...mine, key]); return true;
}
if (typeof location!=="undefined" && location.protocol.startsWith("http")) setTimeout(startPresence, 300);
