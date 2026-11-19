// استوديو جسم الإنسان، المرحلة 2: المحرر والمراجعان ← «حزمة تعديلات» ← المستودع (عبر الفحوص).
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');

const REPO = path.resolve(__dirname, '..');
const ORIGIN = 'https://studio.test/';
const TYPES = { '.js': 'application/javascript', '.html': 'text/html', '.css': 'text/css', '.ttf': 'font/ttf' };

let browser;
before(async () => { execFileSync('node', ['tools/build-studio.mjs'], { cwd: REPO }); browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined, args: process.env.CI ? ['--no-sandbox'] : [] }); });
after(async () => browser?.close());

async function studio() {
  const context = await browser.newContext({ viewport: { width: 420, height: 860 }, acceptDownloads: true });
  await context.route(ORIGIN + '**', (route) => {
    const rel = decodeURIComponent(new URL(route.request().url()).pathname).slice(1) || 'index.html';
    const file = rel.startsWith('fonts/') ? path.join(REPO, 'app/v2', rel) : path.join(REPO, 'studio', rel);
    if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
    return route.fulfill({ body: fs.readFileSync(file), contentType: TYPES[path.extname(file)] || 'application/octet-stream' });
  });
  const page = await context.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  page.on('dialog', (d) => d.accept());
  await page.goto(ORIGIN + 'index.html');
  return { context, page, errors };
}

test('studio editor and reviewers: edit a text, review items and approve a lesson, then export one change pack', async () => {
  const { context, page, errors } = await studio();
  await page.fill('#who', 'فريق التجربة'); await page.dispatchEvent('#who', 'change');
  // المحرر
  await page.click('[data-seg="role"] [data-v="edit"]');
  await page.click('[data-l="U01.L01"]');
  await page.fill('#q', 'لو أراد طبيب'); await page.dispatchEvent('#q', 'change');
  const card = page.locator('[data-f]').first();
  await card.locator('[data-t]').fill('لو أراد طبيب أن يعرف مكان ألم في جسمك{|ِ} بكلمات دقيقة، كيف يفعل؟');
  await card.locator('[data-n]').fill('أوضح للطفل');
  await card.locator('[data-save]').click();
  await page.waitForFunction(() => window.__studio.edits().size === 1);
  // صيغة غير متوازنة تُرفض في الاستوديو نفسه
  await page.locator('[data-f]').first().locator('[data-t]').fill('جسمك{|ِ');
  await page.locator('[data-f]').first().locator('[data-save]').click();
  assert.equal(await page.evaluate(() => window.__studio.edits().size), 1);
  // الآية مقفلة: لا مربع تحرير لها
  await page.fill('#q', ''); await page.dispatchEvent('#q', 'change');
  const locked = await page.evaluate(() => [...document.querySelectorAll('[data-f]')].filter((c) => c.textContent.includes('🔒')).every((c) => !c.querySelector('[data-t]')));
  assert.ok(locked);
  // المراجع العلمي
  await page.click('#homeBtn'); await page.click('[data-seg="role"] [data-v="sci"]');
  await page.click('[data-l="U01.L01"]');
  const size = (n) => page.waitForFunction((k) => window.__studio.reviews().size === k, n);
  await page.locator('[data-f]').first().locator('[data-ok]').click(); await size(1);
  await page.locator('[data-f]').nth(1).locator('[data-n]').fill('الصياغة تحتاج دقة');
  await page.locator('[data-f]').nth(1).locator('[data-fix]').click(); await size(2);
  await page.click('#approveAll');
  await page.waitForFunction(() => window.__studio.reviews().size === 3);
  // المعلم: ملاحظة على نص
  await page.click('#homeBtn'); await page.click('[data-seg="role"] [data-v="teach"]');
  await page.click('[data-l="U01.L01"]');
  await page.locator('[data-f]').nth(2).locator('[data-n]').fill('الأطفال احتاجوا مثالاً من الملعب');
  await page.locator('[data-f]').nth(2).locator('[data-note]').click();
  await size(4);
  // المطوّر: لوحة الحالة
  await page.click('#homeBtn'); await page.click('[data-seg="role"] [data-v="dev"]');
  assert.match(await page.locator('table').textContent(), /U01\.L01/);
  // التصدير
  await page.click('[data-seg="role"] [data-v="edit"]');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#expChanges')]);
  const P = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
  assert.equal(P.type, 'humanbody-change-pack'); assert.equal(P.by, 'فريق التجربة');
  assert.equal(P.edits.length, 1); assert.deepEqual(P.edits[0].path, ['driving_question']);
  assert.equal(P.reviews.filter((r) => r.role === 'sci').length, 3);
  assert.ok(P.reviews.some((r) => r.role === 'teach' && r.verdict === 'note' && /الملعب/.test(r.note)));
  assert.ok(P.reviews.some((r) => r.path === '*' && r.verdict === 'ok'));
  fs.writeFileSync(path.join(REPO, 'build', '.change-pack.json'), JSON.stringify(P));
  assert.deepEqual(errors, []);
  await context.close();
});

test('repo import: good edits are applied and validated, locked/conflicting/breaking ones are refused, reviews recorded without touching reviewed', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cp-'));
  try {
    for (const d of ['lessons', 'tools', 'quran', 'hadith', 'schema', 'package.json', 'app/v2/audio-key.js']) if (fs.existsSync(path.join(REPO, d))) fs.cpSync(path.join(REPO, d), path.join(tmp, d), { recursive: true });
    const L = JSON.parse(fs.readFileSync(path.join(tmp, 'lessons/U01.L01.json'), 'utf8'));
    const L2 = JSON.parse(fs.readFileSync(path.join(tmp, 'lessons/U02.L01.json'), 'utf8'));
    const P = JSON.parse(fs.readFileSync(path.join(REPO, 'build', '.change-pack.json'), 'utf8'));
    P.edits.push(
      { lesson: 'U02.L01', path: ['faith', 'opening', 'text'], old: L2.faith.opening.text, new: 'نص آخر', by: 'x' },             // مقفل
      { lesson: 'U01.L01', path: ['title', 'ar'], old: 'عنوان قديم لم يعد موجوداً', new: 'عنوان', by: 'x' },                      // تعارض
      { lesson: 'U02.L01', path: ['driving_question'], old: L2.driving_question, new: L2.driving_question + ' <b>x</b>', by: 'x' }, // يكسر الفحص
    );
    const pf = path.join(tmp, 'pack.json'); fs.writeFileSync(pf, JSON.stringify(P));
    const dry = execFileSync('node', ['tools/import-change-pack.mjs', pf], { cwd: tmp, encoding: 'utf8' });
    assert.match(dry, /سيُطبَّق \(2\)/); assert.equal(JSON.parse(fs.readFileSync(path.join(tmp, 'lessons/U01.L01.json'), 'utf8')).driving_question, L.driving_question, 'العرض وحده لا يغيّر شيئاً');
    const out = execFileSync('node', ['tools/import-change-pack.mjs', pf, '--apply'], { cwd: tmp, encoding: 'utf8' });
    assert.match(out, /طُبّق \(1\)/); assert.match(out, /مقفل \(رُفض\) \(1\)/); assert.match(out, /تعارض .*\(1\)/); assert.match(out, /رُدّ لفشل الفحص \(1\)/);
    const A = JSON.parse(fs.readFileSync(path.join(tmp, 'lessons/U01.L01.json'), 'utf8'));
    assert.match(A.driving_question, /أن يعرف مكان ألم/);
    assert.equal(JSON.parse(fs.readFileSync(path.join(tmp, 'lessons/U02.L01.json'), 'utf8')).driving_question, L2.driving_question, 'الدرس الذي فشل فحصه رُدّ كما كان');
    assert.deepEqual(JSON.stringify(A).match(/"reviewed":(true|false)/g), JSON.stringify(L).match(/"reviewed":(true|false)/g), 'علامات reviewed كما هي');
    const R = JSON.parse(fs.readFileSync(path.join(tmp, 'reviews/U01.L01.json'), 'utf8'));
    assert.equal(R.entries.length, 4); assert.ok(R.entries.every((e) => e.by === 'فريق التجربة'));
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); fs.rmSync(path.join(REPO, 'build', '.change-pack.json'), { force: true }); }
});
