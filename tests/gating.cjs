// درس بإذن ولي الأمر (visibility: parent_unlock، قرار صاحب المشروع 19 و26 نوفمبر 2026):
// لا يظهر في البيت ولا في الوحدة ولا يُفتح برابطه، حتى يأذن ولي الأمر من شاشته لهذا الطفل وحده.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..');
const lessons = fs.readdirSync(path.join(ROOT, 'lessons')).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(fs.readFileSync(path.join(ROOT, 'lessons', f), 'utf8')));
const gated = lessons.filter((L) => L.visibility === 'parent_unlock');

test('gated lessons carry a parent note and are flagged in every built page', { skip: !gated.length && 'لا درس بإذن ولي الأمر بعد' }, () => {
  const home = fs.readFileSync(path.join(ROOT, 'app/v2/index.html'), 'utf8');
  for (const L of gated) {
    assert.ok(L.gate_note && L.gate_note.length >= 20, `${L.id}: gate_note`);
    const page = fs.readFileSync(path.join(ROOT, `app/v2/${L.id}.html`), 'utf8');
    assert.match(page, /"gated":true/, `${L.id}: LESSON.gated`);
    const tpage = fs.readFileSync(path.join(ROOT, `app/v2/${L.id.replace(/\.L(\d{2})$/, '.T$1')}.html`), 'utf8');
    assert.match(tpage, /"gated":true/, `${L.id}: TEST.gated`);
    assert.match(home, new RegExp(`"id":"${L.id.replace('.', '\\.')}"[^}]*"gated":true`), `${L.id}: home flag`);
  }
});

test('a gated lesson is hidden and closed until the guardian unlocks it for this child', { skip: !gated.length && 'لا درس بإذن ولي الأمر بعد' }, async () => {
  const id = gated[0].id;
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined, args: process.env.CI ? ['--no-sandbox', '--disable-dev-shm-usage'] : [] });
  try {
    const p = await browser.newPage();
    const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    const u = (f) => 'file://' + path.join(ROOT, 'app/v2', f);
    const linked = () => p.$$eval('a.lesson', (as, h) => as.some((a) => a.getAttribute('href') === h), id + '.html');
    await p.goto(u('index.html'));
    await p.evaluate(async () => { await Atlas.ready; Atlas.create({ name: 'نور', gender: 'f' }); await Atlas.setPin('7391'); });
    await p.goto(u('index.html')); await p.waitForSelector('#units a.lesson');
    assert.equal(await linked(), false, 'مخفي في البيت');
    await p.goto(u(id + '.html')); await p.waitForURL(/index\.html$/);
    await p.goto(u('review.html')); await p.waitForSelector(`[data-unlock="${id}"]`);
    await p.click(`[data-unlock="${id}"]`);
    await p.waitForFunction((i) => document.querySelector(`[data-unlock="${i}"]`).getAttribute('aria-pressed') === 'true', id);
    await p.goto(u('index.html')); await p.waitForSelector('#units a.lesson');
    assert.equal(await linked(), true, 'يظهر بعد الإذن');
    await p.goto(u(id + '.html')); await p.waitForFunction(() => typeof SCENES !== 'undefined' && document.querySelector('#main .scene'));
    // طفل آخر على الجهاز نفسه لا يرث الإذن
    await p.evaluate(async () => { Atlas.create({ name: 'سالم', gender: 'm' }); });
    await p.goto(u('index.html')); await p.waitForSelector('#units a.lesson');
    assert.equal(await linked(), false, 'الإذن لطفل واحد');
    assert.deepEqual(errs, []);
  } finally { await browser.close(); }
});
