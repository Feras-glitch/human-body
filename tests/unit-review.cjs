const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/* مراجعة الوحدة (قرار 28 نوفمبر): آخر درس في كل وحدة يحمل unit_review يربط دروسها كلها (عدا درس الإذن)، وغيره لا يحمله */
const dir = path.join(__dirname, '../lessons');
const all = fs.readdirSync(dir).filter(f => /^U\d{2}\.L\d{2}\.json$/.test(f)).sort().map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
const units = [...new Set(all.map(L => L.unit.id))];
const braces = t => (String(t).match(/\{[^}]*\}/g) || []).every(m => m.split('|').length === 2);

test('the last lesson of every unit carries a unit review that links all its lessons', () => {
  for (const u of units) {
    const ls = all.filter(L => L.unit.id === u), last = ls[ls.length - 1];
    for (const L of ls.slice(0, -1)) assert.ok(!L.unit_review, `${L.id}: unit_review في غير آخر درس`);
    const R = last.unit_review; assert.ok(R, `${last.id}: لا مراجعة للوحدة`);
    const want = ls.filter(L => L.visibility !== 'parent_unlock').map(L => L.id);
    assert.deepEqual(R.links.map(l => l.lesson), want, `${last.id}: الروابط`);
    const q = R.question; assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length, `${last.id}: الجواب`);
    for (const t of [R.text, ...R.links.map(l => l.idea), q.prompt, ...q.options, q.why]) {
      assert.ok(braces(t), `${last.id}: علامات {مذكر|مؤنث} في «${t}»`);
      assert.ok(!/[﴿﴾«»]/.test(t.replace(/قال لمّاح: «[^»]*»|قال إعلان: «[^»]*»/g, '')), `${last.id}: نص مقتبس في المراجعة`);
    }
  }
});

test('unit review reaches the lesson page', () => {
  for (const L of all.filter(x => x.unit_review)) {
    const html = fs.readFileSync(path.join(__dirname, `../app/v2/${L.id}.html`), 'utf8');
    assert.ok(html.includes('"unit_review":'), `${L.id}: لم تصل المراجعة إلى الصفحة`);
  }
});
