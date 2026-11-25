// كل درس يحمل سؤال «اسأله على العشاء» لولي الأمر بعلامات تذكير وتأنيث سليمة، ويصل إلى بيانات شاشة ولي الأمر (قرار 25 نوفمبر 2026)
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');

test('every lesson has a dinner question with balanced gender markers, carried into review data', () => {
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'app/v2/review-data.js'), 'utf8') + ';this.R=REVIEW;', ctx);
  const byId = Object.fromEntries(ctx.R.map((l) => [l.id, l]));
  const files = fs.readdirSync(path.join(ROOT, 'lessons')).filter((f) => f.endsWith('.json'));
  assert.ok(files.length >= 29);
  for (const f of files) {
    const L = JSON.parse(fs.readFileSync(path.join(ROOT, 'lessons', f), 'utf8'));
    assert.ok(L.dinner && L.dinner.q && L.dinner.listen, `${L.id}: dinner`);
    for (const t of [L.dinner.q, L.dinner.listen]) {
      const stripped = t.replace(/\{[^|{}]*\|[^{}]*\}/g, '');
      assert.ok(!/[{}]/.test(stripped), `${L.id}: علامة تذكير وتأنيث غير مكتملة في «${t}»`);
    }
    assert.deepEqual(byId[L.id].dinner, L.dinner, `${L.id}: review-data`);
  }
});
