// خط مصحف المدينة، الإصدار الثاني (QPC V2) — طلب صاحب المشروع (14 نوفمبر 2026): كل آية بخط صفحتها من المصحف،
// رمز لكل كلمة ولكل علامة وقف ولرقم الآية. يبقى خط Hafs Smart ثم نص الآية العثماني بديلين إن تعذّر خط الصفحة.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');

const REPO = path.resolve(__dirname, '..');
const ROOT = path.join(REPO, 'app/v2');
const FONTS = path.join(ROOT, 'fonts/qcf2');
const ORIGIN = 'https://atlas.test/';
const TYPES = { '.js': 'application/javascript', '.html': 'text/html', '.css': 'text/css', '.webp': 'image/webp', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg' };
const V = JSON.parse(fs.readFileSync(path.join(REPO, 'quran/verses.json'), 'utf8'));
const pad = (p) => String(p).padStart(3, '0');

test('every verse in the registry has its page glyphs, and exactly its page fonts ship with the app, unmodified', () => {
  const pages = new Set();
  for (const [k, v] of Object.entries(V)) {
    assert.ok(v.qpc2, `${k}: بلا qpc2`);
    const g = v.qpc2.glyphs.split(' ');
    assert.equal(g.length, v.text.split(' ').length + 1, `${k}: رمز لكل كلمة وعلامة في نص Tanzil، ورقم الآية آخرها`);
    // علامة وقف لا رمز لها في صفحتها من بيانات QPC V2 تبقى خانة فارغة (النحل 78: «ۙ» بعد «والأفئدة») — ولا يُقبل الفراغ في غير علامة
    const tz = v.text.split(' ');
    assert.ok(g.every((t, i) => [...t].length === 1 || (t === '' && i < tz.length && /^[ۖ-ۭ]+$/.test(tz[i]))), `${k}: كل رمز محرف واحد`);
    assert.equal(v.qpc2.words.length, v.smart.split(' ').length, `${k}: موضع لكل كلمة من النص الذكي`);
    assert.equal(v.qpc2.page, v.page, `${k}: صفحة الخط هي صفحة الآية في المصحف`);
    pages.add(v.qpc2.page);
  }
  const want = [...pages].sort((a, b) => a - b).map((p) => `QCF2${pad(p)}.ttf`);
  assert.deepEqual(fs.readdirSync(FONTS).filter((f) => f.endsWith('.ttf')).sort(), want, 'خط لكل صفحة فيها آية، ولا غيرها');
  const css = fs.readFileSync(path.join(FONTS, 'qcf2.css'), 'utf8');
  for (const p of pages) assert.match(css, new RegExp(`@font-face\\{font-family:'QCF2_${pad(p)}';src:url\\('QCF2${pad(p)}\\.ttf'\\)`));
  // الخطوط كما نُسخت من مصدرها: لا يُعدَّل رمز ولا خط (بصماتها في SHA256SUMS.txt)
  const sums = fs.readFileSync(path.join(FONTS, 'SHA256SUMS.txt'), 'utf8').trim().split('\n').map((l) => l.split(/\s+/));
  assert.deepEqual(sums.map(([, f]) => f), want);
  for (const [h, f] of sums) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(FONTS, f))).digest('hex'), h, f);
  // كل صفحة درس تربط ملف الخطوط
  for (const f of fs.readdirSync(ROOT).filter((x) => /^U\d\d\.L\d\d\.html$/.test(x))) assert.match(fs.readFileSync(path.join(ROOT, f), 'utf8'), /<link rel="stylesheet" href="fonts\/qcf2\/qcf2\.css">/, f);
});

test('qpc2_import --check: the registry matches the QUL glyph data, and every glyph is in its page font', (t) => {
  try { execFileSync('python3', ['-c', 'import fontTools'], { stdio: 'ignore' }); } catch {
    if (process.env.CI) throw new Error('fontTools مطلوب في CI (pip install fonttools)');
    return t.skip('fontTools غير مثبّت');
  }
  assert.match(execFileSync('python3', ['tools/qpc2_import.py', '--check'], { cwd: REPO, encoding: 'utf8' }), /كل رمز في خط صفحته/);
});

let browser;
before(async () => { browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined, args: process.env.CI ? ['--no-sandbox', '--disable-dev-shm-usage'] : [] }); });
after(async () => browser?.close());

async function open(blocked = []) {
  const context = await browser.newContext({ viewport: { width: 420, height: 860 } });
  await context.route(ORIGIN + '**', async (route) => {
    const rel = decodeURIComponent(new URL(route.request().url()).pathname).slice(1) || 'index.html';
    if (blocked.some((b) => rel.endsWith(b))) return route.abort();
    const file = path.resolve(ROOT, rel);
    if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file)) return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>blank</title>' });
    return route.fulfill({ body: fs.readFileSync(file), contentType: TYPES[path.extname(file)] || 'application/octet-stream' });
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(ORIGIN + 'index.html');
  await page.evaluate(() => window.Atlas?.ready);
  await page.evaluate(() => Atlas.create({ name: 'نور', gender: 'f' }).id);
  return { context, page, errors };
}
const go = async (page, url) => { await page.goto(ORIGIN + url); await page.evaluate(() => window.Atlas?.ready); };
const verseScene = (page) => page.evaluate(() => { for (const sc of SCENES.filter((s) => /^faith_/.test(s.id))) { show(SCENES.indexOf(sc)); const q = document.querySelector('#main .quran'); if (q) return q.dataset.key; } return null; });
// كل رمز من خط الصفحة، وما سواه مسافات من Hafs Smart (خط الصفحة لا مسافة فيه؛ والمسافة في آخر السطر لا تُرسم)
const pageFontOnly = (count, page, n) => {
  const fam = `QCF2${pad(page)}`;
  assert.equal(count[fam], n, `رموز الآية كلها من ${fam}: ` + JSON.stringify(count));
  for (const [f, c] of Object.entries(count)) if (f !== fam) assert.ok(f === 'KFGQPC Hafs Smart' && c <= n - 1, 'خط آخر في الآية: ' + JSON.stringify(count));
};
const fontsOf = async (page, selector) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
  const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector });
  const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
  return Object.fromEntries(fonts.map((f) => [f.familyName, f.glyphCount]));
};

test('the app draws each verse in its own Mushaf page font: every glyph from that font, the highlight on the right words, right to left', async () => {
  const { context, page, errors } = await open();
  await go(page, 'U03.L04.html');
  const key = await verseScene(page);
  assert.equal(key, '11:61', 'آية فيها ۞ وعلامات وقف وتظليل');
  await page.evaluate(() => document.fonts.ready);
  const v = V[key], g = v.qpc2.glyphs.split(' ');
  const r = await page.evaluate(() => {
    const q = document.querySelector('#main .quran'), sp = q.querySelector('.qcf2');
    // أول رمزين في السطر الأول: الأول على يمين الثاني
    const w = document.createTreeWalker(sp, NodeFilter.SHOW_TEXT), at = [];
    while (w.nextNode() && at.length < 2) { const n = w.currentNode; for (let i = 0; i < n.data.length && at.length < 2; i++) if (n.data[i] !== ' ') at.push([n, i]); }
    const box = ([n, i]) => { const g = document.createRange(); g.setStart(n, i); g.setEnd(n, i + 1); return g.getBoundingClientRect(); };
    const [a, b] = at.map(box);
    return { hl: q.dataset.hl, fam: getComputedStyle(sp).fontFamily.split(',')[0].replace(/["']/g, '').trim(), marks: [...q.querySelectorAll('mark')].map((m) => m.textContent), text: sp.textContent, rtl: Math.abs(a.top - b.top) < 2 && a.left >= b.right - 1, dir: getComputedStyle(q).direction, bidi: getComputedStyle(q).unicodeBidi };
  });
  assert.equal(r.fam, `QCF2_${pad(v.qpc2.page)}`);
  assert.equal(r.text, g.join(' '), 'رموز الآية كاملة كما في السجل');
  assert.equal(v.text.split(' ')[0], '۞', 'الآية تبدأ بعلامة الحزب، وهي في خط الصفحة رمز كسائر الرموز');
  const [a, b] = r.hl.split('-').map(Number);
  assert.deepEqual(r.marks, v.qpc2.words.slice(a, b + 1).map((i) => g[i]), 'التظليل على رموز الكلمات المظلّلة نفسها');
  assert.deepEqual([r.rtl, r.dir, r.bidi], [true, 'rtl', 'bidi-override'], 'من اليمين إلى اليسار');
  pageFontOnly(await fontsOf(page, '#main .quran .qcf2'), v.qpc2.page, g.length);
  // بطاقة الآية في «في حياتي» بخط صفحتها كذلك
  await go(page, 'U05.L01.html');
  await page.evaluate(() => show(SCENES.findIndex((s) => s.id === 'life')));
  await page.evaluate(() => document.fonts.ready);
  const card = await page.evaluate(() => { const c = document.querySelector('#main .vcard'), sp = c.querySelector('.qcf2'); return { key: c.dataset.key, fam: sp && getComputedStyle(sp).fontFamily.split(',')[0].replace(/["']/g, '').trim() }; });
  assert.equal(card.fam, `QCF2_${pad(V[card.key].qpc2.page)}`);
  pageFontOnly(await fontsOf(page, '#main .vcard .qcf2'), V[card.key].qpc2.page, V[card.key].qpc2.glyphs.split(' ').length);
  assert.deepEqual(errors, []);
  await context.close();
});

test('if the page font cannot load, the verse falls back to Hafs Smart with the same words highlighted, then to the plain Uthmani text', async () => {
  const v = V['11:61'];
  // 1) خط الصفحة لا يُحمَّل: Hafs Smart بالتظليل نفسه
  let { context, page, errors } = await open([`QCF2${pad(v.qpc2.page)}.ttf`]);
  await go(page, 'U03.L04.html');
  assert.equal(await verseScene(page), '11:61');
  await page.waitForFunction(() => !document.querySelector('#main .quran .qcf2'), null, { timeout: 10000 });
  await page.evaluate(() => document.fonts.ready);
  let r = await page.evaluate(() => { const q = document.querySelector('#main .quran'); return { cls: q.className, hl: q.dataset.hl, marks: [...q.querySelectorAll('mark')].map((m) => m.textContent), text: q.textContent }; });
  const w = v.smart.split(' '), [a, b] = r.hl.split('-').map(Number);
  assert.equal(r.cls, 'txt quran');
  assert.equal(r.text, w.join(' ') + ' ' + v.ayah_mark);
  assert.deepEqual(r.marks, w.slice(a, b + 1));
  assert.deepEqual(Object.keys(await fontsOf(page, '#main .quran')), ['KFGQPC Hafs Smart']);
  assert.deepEqual(errors, []);
  await context.close();
  // 2) ولا Hafs Smart: نص الآية العثماني من السجل كاملاً
  ({ context, page, errors } = await open([`QCF2${pad(v.qpc2.page)}.ttf`, 'HafsSmart_08.ttf']));
  await go(page, 'U03.L04.html');
  assert.equal(await verseScene(page), '11:61');
  await page.waitForSelector('#main .quran-plain', { timeout: 10000 });
  r = await page.evaluate(() => document.querySelector('#main .quran-plain').textContent);
  assert.equal(r, v.text);
  assert.deepEqual(errors, []);
  await context.close();
});
