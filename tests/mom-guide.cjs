const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

/* 妈妈指南 دليل الأم بالصينية: تطبيق مستقل من المصدر نفسه (قرار 28 نوفمبر). لا يمسّ تطبيق الأطفال، ولا يوقفه:
   الترجمة القديمة أو الناقصة تُطبع تنبيهاً هنا ولا تُفشل الاختبار. */
const root = path.join(__dirname, '..');
const J = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const norm = t => String(t || '').replace(/\{اسم\}/g, '').replace(/\s+/g, ' ').trim();
const h = t => crypto.createHash('sha1').update(norm(t), 'utf8').digest('hex').slice(0, 10);
const ids = fs.readdirSync(path.join(root, 'lessons')).filter(f => /^U\d{2}\.L\d{2}\.json$/.test(f)).map(f => f.slice(0, -5)).sort();

test('the kids app carries nothing of the mom guide', () => {
  const dir = path.join(root, 'app/v2');
  for (const f of fs.readdirSync(dir)) {
    assert.ok(!/^(mom|guide-zh)/.test(f), `app/v2/${f}: ملف من دليل الأم في تطبيق الأطفال`);
    if (/\.(html|js)$/.test(f)) assert.doesNotMatch(fs.readFileSync(path.join(dir, f), 'utf8'), /mom\.html|guide-zh\.html|妈妈指南/, `app/v2/${f}: رابط إلى دليل الأم`);
  }
});

test('mom guide translations: report what needs updating (never blocks the kids app)', () => {
  const missing = [], stale = [];
  for (const id of ids) {
    const p = `lessons/zh/${id}.json`; if (!fs.existsSync(path.join(root, p))) { missing.push(id); continue; }
    const L = J(`lessons/${id}.json`), Z = J(p), e = L.experiment;
    const pairs = [[L.title.ar, Z.title], [L.science.central_fact, Z.point], [e.title + ' ' + e.steps.join(' '), Z.do],
      [L.flow.explain.map(x => x.text).join(' '), Z.explain], [L.dinner.q + ' ' + L.dinner.listen, Z.dinner],
      ...L.objectives.map((o, i) => [o.statement, Z.objectives[i]]), ...e.safety.map((s, i) => [s, Z.safety[i]]),
      ...L.misconceptions.map((m, i) => [m.child_says + ' ' + m.teacher_response, Z.misconceptions[i]])];
    if (pairs.some(([src, z]) => !z || h(src) !== z.src)) stale.push(id);
  }
  if (missing.length || stale.length) console.log(`# دليل الأم: ينقص ${missing.join(' ') || '—'}؛ يحتاج تحديثاً ${stale.join(' ') || '—'}`);
  assert.ok(true);
});

test('mom guide shows only approved scripture translations', () => {
  const F = J('lessons/zh/faith.json');
  for (const t of [...Object.values(F.quran), ...Object.values(F.hadith)]) assert.ok(['pending', 'approved'].includes(t.status));
  const js = fs.readFileSync(path.join(root, 'mom/mom-data.js'), 'utf8');
  const MOM = JSON.parse(js.slice(js.indexOf('{'), js.lastIndexOf('}') + 1));
  const approved = new Set([...Object.values(F.quran), ...Object.values(F.hadith)].filter(t => t.status === 'approved').map(t => t.zh));
  for (const l of MOM.lessons) for (const f of l.faith) assert.ok(approved.has(f.zh), `${l.id}: نص شرعي لم يُقرّ`);
});

test('mom app has its own launcher icon in every density, different from the kids icon', () => {
  for (const d of ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi']) {
    const mom = path.join(root, `packaging/mom/res/mipmap-${d}/ic_launcher.png`);
    assert.ok(fs.existsSync(mom), `missing mom icon: ${d}`);
    const kid = fs.readFileSync(path.join(root, `packaging/android/res/mipmap-${d}/ic_launcher.png`));
    assert.notDeepEqual(fs.readFileSync(mom), kid, `mom icon equals kids icon: ${d}`);
  }
});
