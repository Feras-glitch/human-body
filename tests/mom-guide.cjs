const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

/* 妈妈指南 دليل الأم بالصينية (قرار 28 نوفمبر): لكل درس ترجمة كاملة ببصمات مطابقة للعربي الحالي، والنص الشرعي لا يظهر قبل الإقرار */
const root = path.join(__dirname, '..');
const J = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const norm = t => String(t || '').replace(/\{اسم\}/g, '').replace(/\s+/g, ' ').trim();
const h = t => crypto.createHash('sha1').update(norm(t), 'utf8').digest('hex').slice(0, 10);
const ids = fs.readdirSync(path.join(root, 'lessons')).filter(f => /^U\d{2}\.L\d{2}\.json$/.test(f)).map(f => f.slice(0, -5)).sort();

test('every lesson has a complete Chinese mom guide matching the current Arabic', () => {
  const stale = [];
  for (const id of ids) {
    const p = `lessons/zh/${id}.json`; assert.ok(fs.existsSync(path.join(root, p)), `${id}: لا دليل صيني`);
    const L = J(`lessons/${id}.json`), Z = J(p), e = L.experiment;
    assert.equal(Z.objectives.length, L.objectives.length, `${id}: الأهداف`);
    assert.equal(Z.safety.length, e.safety.length, `${id}: السلامة`);
    assert.equal(Z.misconceptions.length, L.misconceptions.length, `${id}: التصورات`);
    const pairs = [[L.title.ar, Z.title], [L.science.central_fact, Z.point], [e.title + ' ' + e.steps.join(' '), Z.do],
      [L.flow.explain.map(x => x.text).join(' '), Z.explain], [L.dinner.q + ' ' + L.dinner.listen, Z.dinner],
      ...L.objectives.map((o, i) => [o.statement, Z.objectives[i]]), ...e.safety.map((s, i) => [s, Z.safety[i]]),
      ...L.misconceptions.map((m, i) => [m.child_says + ' ' + m.teacher_response, Z.misconceptions[i]])];
    for (const [src, z] of pairs) { if (h(src) !== z.src) stale.push(id); }
    for (const z of [Z.title, Z.point, Z.do, Z.explain, ...Z.objectives, ...Z.safety]) assert.ok(/[一-鿿]/.test(z.zh), `${id}: نص بلا صينية`);
  }
  assert.deepEqual([...new Set(stale)], [], 'ترجمة قديمة: عُدّل العربي بعد الترجمة');
});

test('mom page carries only approved scripture translations, and is built from the current data', () => {
  const F = J('lessons/zh/faith.json');
  const js = fs.readFileSync(path.join(root, 'app/v2/mom-data.js'), 'utf8');
  const MOM = JSON.parse(js.slice(js.indexOf('{'), js.lastIndexOf('}') + 1));
  assert.equal(MOM.lessons.length, ids.length);
  const approved = new Set([...Object.values(F.quran), ...Object.values(F.hadith)].filter(t => t.status === 'approved').map(t => t.zh));
  for (const l of MOM.lessons) for (const f of l.faith) assert.ok(approved.has(f.zh), `${l.id}: نص شرعي لم يُقرّ`);
  for (const t of [...Object.values(F.quran), ...Object.values(F.hadith)]) assert.ok(['pending', 'approved'].includes(t.status));
});
