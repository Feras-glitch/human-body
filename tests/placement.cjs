const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/* «من أين أبدأ؟»: سؤالان من كل وحدة، من بنود الدروس نفسها، بترتيب الوحدات، ولا شيء من درس الإذن */
test('placement page carries two lesson items per unit, in unit order', () => {
  const html = fs.readFileSync(path.join(__dirname, '../app/v2/placement.html'), 'utf8');
  const m = html.match(/const UNITS = (\[.*?\]) ;\n/s); assert.ok(m, 'UNITS');
  const units = JSON.parse(m[1]);
  const lessons = fs.readdirSync(path.join(__dirname, '../lessons')).filter(f => f.endsWith('.json'));
  const unitIds = [...new Set(lessons.map(f => f.slice(0, 3)))].sort();
  assert.deepEqual(units.map(u => u.id), unitIds);
  for (const u of units) {
    assert.equal(u.qs.length, 2, u.id);
    for (const q of u.qs) {
      const iid = q.id.replace(/^P\./, ''), lid = iid.split('.').slice(0, 2).join('.');
      assert.ok(lid.startsWith(u.id + '.'), q.id);
      const L = JSON.parse(fs.readFileSync(path.join(__dirname, `../lessons/${lid}.json`), 'utf8'));
      assert.notEqual(L.visibility, 'parent_unlock', q.id);
      const it = L.assessment.items.find(i => i.id === iid);
      assert.ok(it && it.prompt === q.prompt && it.answer === q.answer, q.id);
    }
  }
});
