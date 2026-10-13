// node mem_core.test.js <index.html> — tests the pure memory-score core between <MEM-CORE> markers
const fs = require("fs"); const assert = require("assert");
const html = fs.readFileSync(process.argv[2], "utf8");
const m = html.match(/\/\/ <MEM-CORE>([\s\S]*?)\/\/ <\/MEM-CORE>/);
assert(m, "MEM-CORE block not found");
const core = new Function("//" + m[1] + "\nreturn { jarOf, jarInterval, timing, applyReview, migrateCard, knownCard, manualCard, dAdd, JAR_MIN };")();
const { jarOf, timing, applyReview, migrateCard, knownCard, manualCard, dAdd } = core;
let n = 0; const t = (name, fn) => { fn(); n++; console.log("ok -", name); };
const T = "2026-10-11";

t("jar bands", () => {
  assert.deepStrictEqual([0, 4, 5, 14, 15, 29, 30, 49, 50, 99, 100].map(jarOf), [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6]);
});
t("new word, correct: +5 → Hũ 2, due tomorrow", () => {
  const { card, ev } = applyReview(null, true, "card", T);
  assert.strictEqual(card.score, 5); assert.strictEqual(card.box, 2); assert.strictEqual(card.due, "2026-10-12");
  assert.deepStrictEqual([ev.kind, ev.delta, ev.from, ev.to], ["n", 5, 0, 2]);
  assert.strictEqual(card.log.length, 1); assert.ok(card.log[0].startsWith("2026-10-11|+5|n|card|0|2"));
});
t("new word, wrong: score 0, Hũ 1, due today", () => {
  const { card, ev } = applyReview(null, false, "card", T);
  assert.strictEqual(card.score, 0); assert.strictEqual(card.box, 1); assert.strictEqual(card.due, T); assert.strictEqual(card.lapses, 1); assert.strictEqual(ev.kind, "f"); assert.strictEqual(ev.delta, 0); // trừ trên 0 điểm thì ghi 0
});
t("on-time path 5 → 15 → 30 → 50 → 75 → 100 reaches gold", () => {
  let c = null, day = T; const seen = [];
  for (let i = 0; i < 6; i++) { const r = applyReview(c, true, "card", day); c = r.card; seen.push(c.score); day = c.due === "9999-12-31" ? day : c.due; }
  assert.deepStrictEqual(seen, [5, 15, 30, 50, 75, 100]); assert.strictEqual(c.box, 6); assert.strictEqual(c.ok, 5);
});
t("early review: +2, due unchanged rules (rescheduled from today)", () => {
  const c0 = applyReview(null, true, "card", T).card; // due 10-12
  const c1 = applyReview(c0, true, "card", "2026-10-11").card; // same day → practice
  assert.strictEqual(c1.score, 5);
  const c2 = { ...c0, due: "2026-10-20", iv: 7, box: 4, score: 30, last: "2026-10-13" };
  const r = applyReview(c2, true, "card", "2026-10-15");
  assert.strictEqual(r.ev.kind, "e"); assert.strictEqual(r.card.score, 32);
});
t("late review: half gain", () => {
  const c = { box: 3, score: 15, due: "2026-10-01", iv: 3, last: "2026-09-28", seen: 2, lapses: 0, ok: 1, log: [] };
  assert.strictEqual(timing(c, "2026-10-02"), "o"); // 1 day late with iv 3 → grace 1
  const r = applyReview(c, true, "card", "2026-10-05");
  assert.strictEqual(r.ev.kind, "l"); assert.strictEqual(r.ev.delta, 8); assert.strictEqual(r.card.score, 23); assert.strictEqual(r.card.box, 3);
});
t("forget at Hũ 4 (score 40): −15 → 25 falls to Hũ 3", () => {
  const c = { box: 4, score: 40, due: T, iv: 7, last: "2026-10-04", seen: 4, lapses: 0, ok: 3, log: [] };
  const r = applyReview(c, false, "card", T);
  assert.strictEqual(r.card.score, 25); assert.strictEqual(r.card.box, 3); assert.strictEqual(r.card.due, T); assert.deepStrictEqual([r.ev.from, r.ev.to, r.ev.delta], [4, 3, -15]);
});
t("mode weight: ship ×0.5, quiz ×0.7 on gain and penalty", () => {
  const c = { box: 3, score: 20, due: T, iv: 3, last: "2026-10-08", seen: 3, lapses: 0, ok: 2, log: [] };
  assert.strictEqual(applyReview(c, true, "ship", T).ev.delta, 8);   // 15 × .5 = 7.5 → 8
  assert.strictEqual(applyReview(c, true, "quiz", T).ev.delta, 11);  // 15 × .7 = 10.5 → 11
  assert.strictEqual(applyReview(c, false, "ship", T).ev.delta, -8); // −15 × .5
});
t("one scored event per day: second review same day is practice, no change", () => {
  const c = applyReview(null, true, "card", T).card;
  const r = applyReview(c, false, "card", T);
  assert.strictEqual(r.ev.kind, "p"); assert.strictEqual(r.ev.delta, 0); assert.strictEqual(r.card.score, 5); assert.strictEqual(r.card.box, 2);
});
t("forgot today then correct: relearned, no score change, due moves to tomorrow", () => {
  const c = { box: 3, score: 20, due: T, iv: 3, last: "2026-10-08", seen: 3, lapses: 0, ok: 2, log: [] };
  const f = applyReview(c, false, "card", T).card;           // −15 → 5, due today
  const r = applyReview(f, true, "card", T);
  assert.strictEqual(r.ev.kind, "r"); assert.strictEqual(r.ev.delta, 0); assert.strictEqual(r.card.score, f.score);
  assert.strictEqual(r.card.due, "2026-10-12"); assert.strictEqual(r.card.iv, 1);
  const again = applyReview(f, false, "card", T);             // quên tiếp: vẫn đến hạn hôm nay
  assert.strictEqual(again.ev.kind, "p"); assert.strictEqual(again.card.due, T);
  const nw = applyReview(applyReview(null, false, "card", T).card, true, "card", T);  // từ mới sai rồi đúng
  assert.strictEqual(nw.ev.kind, "r"); assert.strictEqual(nw.card.due, "2026-10-12");
});
t("gold is locked", () => {
  const c = { box: 6, score: 100, due: "9999-12-31", iv: 0, last: "2026-09-01", seen: 9, lapses: 0, ok: 6, log: [] };
  const r = applyReview(c, false, "card", T);
  assert.strictEqual(r.ev.kind, "p"); assert.strictEqual(r.card.score, 100); assert.strictEqual(r.card.box, 6);
});
t("log keeps last 30", () => {
  let c = applyReview(null, true, "card", T).card; let day = T;
  for (let i = 0; i < 40; i++) { day = dAdd(day, 1); c = applyReview({ ...c, box: 1, score: 0 }, false, "card", day).card; }
  assert.strictEqual(c.log.length, 30);
});
t("migrate old box cards", () => {
  const c = migrateCard({ box: 4, due: "2026-10-15", seen: 5, lapses: 1, updated: "x" }, T);
  assert.strictEqual(c.score, 30); assert.strictEqual(c.box, 4); assert.strictEqual(c.iv, 7); assert.strictEqual(c.due, "2026-10-15"); assert.strictEqual(c.log[0].split("|")[2], "c");
  const same = migrateCard(c, T); assert.strictEqual(same.log.length, 1);
});
t("known button and manual set", () => {
  const k = knownCard("card", T); assert.strictEqual(k.score, 75); assert.strictEqual(k.box, 5); assert.strictEqual(k.due, dAdd(T, 30));
  const m3 = manualCard(null, 3, T); assert.strictEqual(m3.score, 15); assert.strictEqual(m3.box, 3); assert.strictEqual(m3.due, dAdd(T, 3));
  const g = manualCard(m3, 6, T); assert.strictEqual(g.score, 100); assert.strictEqual(g.box, 6); assert.strictEqual(g.log.length, 2);
});
console.log(`${n} tests passed`);
