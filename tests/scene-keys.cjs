// كل مفتاح تحفظه المشاهد (store.get/store.set) معروف في مخطط state.js،
// وإلا تُرك خارج النسخة الاحتياطية ورُفض عند الاستعادة (وُجد في U07: kidx وurinx وwtrx).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

test('scene store keys: every key a scene saves is known to the backup schema', () => {
  const src = fs.readFileSync(path.join(ROOT, 'app/v2/state.js'), 'utf8');
  const known = new Set();
  for (const m of src.matchAll(/^\s{4}([a-zA-Z0-9_]+): \(/gm)) known.add(m[1]);
  for (const m of src.matchAll(/for \(const k of \[([^\]]+)\]\)/g)) for (const x of m[1].matchAll(/'([^']+)'/g)) known.add(x[1]);
  const files = ['scenes', ''].flatMap((d) => fs.readdirSync(path.join(ROOT, 'app/v2', d)).filter((f) => f.endsWith('.js')).map((f) => path.join(ROOT, 'app/v2', d, f)));
  const missing = new Set();
  for (const f of files) {
    const s = fs.readFileSync(f, 'utf8');
    for (const m of s.matchAll(/store\.(?:get|set)\('([A-Za-z0-9_]+)'/g)) if (!known.has(m[1]) && !m[1].startsWith('open_')) missing.add(`${m[1]} (${path.basename(f)})`);
  }
  assert.deepEqual([...missing], [], 'مفاتيح لا يعرفها المخطط');
});
