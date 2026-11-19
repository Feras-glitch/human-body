// اختبارات المراجعة 20 (المهندس الخصم، 13 نوفمبر 2026): كل ما أعاد المراجع إنتاجه صار اختباراً هنا مع إصلاحه.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '../app/v2');
const ORIGIN = 'https://atlas.test/';
const TYPES = { '.js': 'application/javascript', '.html': 'text/html', '.css': 'text/css', '.webp': 'image/webp', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg' };
let browser;
before(async () => {
  browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,
    args: process.env.CI ? ['--no-sandbox', '--disable-dev-shm-usage'] : [],
  });
});
after(async () => browser?.close());

async function open({ init, viewport = { width: 420, height: 860 } } = {}) {
  const context = await browser.newContext({ viewport, acceptDownloads: true });
  const external = [];
  await context.route('**/*', async (route) => {
    const u = new URL(route.request().url());
    if (u.origin + '/' !== ORIGIN) { external.push(u.href); return route.abort(); }
    const rel = decodeURIComponent(u.pathname).slice(1) || 'index.html';
    const file = path.resolve(ROOT, rel);
    if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
    return route.fulfill({ body: fs.readFileSync(file), contentType: TYPES[path.extname(file)] || 'application/octet-stream' });
  });
  if (init) await context.addInitScript(init);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(ORIGIN + 'index.html');
  return { context, page, errors, external };
}
const go = async (page, url) => {
  await page.goto(ORIGIN + url);
  await page.evaluate(() => window.Atlas?.ready);
  // صفحات الدروس: ينتظر أول مشهد يرسمه boot() حتى لا يرسم فوق ما يفعله الاختبار
  if (/\.(L|T)\d\d\.html$/.test(url)) await page.waitForFunction(() => document.querySelector('#main .scene, #main .card'));
};
const child = (page, name = 'نور', gender = 'f') => page.evaluate(([n, g]) => Atlas.create({ name: n, gender: g }).id, [name, gender]);
const sha = (page, payload) => page.evaluate(async (p) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(p)))), (x) => x.toString(16).padStart(2, '0')).join(''), payload);

/* ===== ن-1: قفل ولي الأمر ===== */

test('ن-1: the multiplication question is gone; a child who opens the gate cannot reset the PIN without the written code', async () => {
  const { context, page, errors } = await open();
  await child(page, 'سلمى', 'f');
  await page.evaluate(async () => { await Atlas.setPin('7391'); Atlas.lock(); });
  await go(page, 'review.html');
  await page.click('#forgotPin');
  const box = await page.locator('#resetBox').innerText();
  assert.doesNotMatch(box, /×|ناتج/);
  assert.equal(await page.locator('#resetQ').count(), 0);
  await page.fill('#recCode', '1234');
  await page.click('#recGo');
  await page.waitForFunction(() => document.querySelector('#resetMsg').textContent);
  assert.equal(await page.evaluate(() => Atlas.hasPin()), true);
  assert.equal(await page.locator('#main').isVisible(), false);
  assert.deepEqual(errors, []);
  await context.close();
});

test('ن-1: a legacy account (PIN without recovery code) gets one on the next unlock, shown once', async () => {
  const { context, page } = await open();
  await child(page);
  await page.evaluate(async () => { await Atlas.setPin('2468'); const r = JSON.parse(localStorage.getItem('atlas:accounts:v1')); delete r.profiles[0].recovery; localStorage.setItem('atlas:accounts:v1', JSON.stringify(r)); Atlas.lock(); });
  await go(page, 'review.html');
  await page.fill('#guardianPin', '2468');
  await page.click('#guardianGo');
  await page.waitForSelector('#recoveryBox', { state: 'visible' });
  const code = await page.locator('#recShow').innerText();
  await page.check('#recDone');
  await page.click('#recCont');
  assert.equal(await page.locator('#main').isVisible(), true);
  // المرة التالية لا يظهر شيء، والرمز المعروض يفتح «نسيت الرمز»
  await page.click('#lockGuardian');
  await page.fill('#guardianPin', '2468');
  await page.click('#guardianGo');
  await page.waitForSelector('#main', { state: 'visible' });
  assert.equal(await page.locator('#recoveryBox').isVisible(), false);
  await page.evaluate(() => Atlas.lock());
  await page.evaluate((c) => Atlas.recoverPin(c), code);
  assert.equal(await page.evaluate(() => Atlas.hasPin()), false);
  await context.close();
});

test('ن-1: restored accounts on a new device take the first PIN chosen there, with one recovery code for all', async () => {
  const { context, page } = await open();
  await child(page, 'عمر', 'm');
  await child(page, 'سارة', 'f');
  await page.evaluate(() => Atlas.setPin('5555'));
  let all;
  all = await page.evaluate(async () => { let out; Atlas.download = (_n, v) => (out = v); await Atlas.rescueDownload(); return out; });
  await context.close();
  const fresh = await open();
  const res = await fresh.page.evaluate((t) => Atlas.restore(t), JSON.stringify(all));
  assert.equal(res, 2);
  const ps = await fresh.page.evaluate(() => Atlas.profiles().map((p) => [p.name, p.hasPin, p.pendingGuardian]));
  assert.deepEqual(ps.map(([, pin, pend]) => [pin, pend]), [[false, true], [false, true]]);
  const code = await fresh.page.evaluate(async () => (await Atlas.setPin('8080')).recovery);
  assert.ok(code);
  const after = await fresh.page.evaluate(() => Atlas.profiles().map((p) => [p.hasPin, p.pendingGuardian]));
  assert.deepEqual(after, [[true, false], [true, false]]);
  // الرمز نفسه ورمز الاستعادة نفسه للحساب الآخر
  await fresh.page.evaluate(async (c) => { const other = Atlas.profiles().find((p) => p.id !== Atlas.active().id); Atlas.select(other.id); await Atlas.unlock('8080'); Atlas.lock(); await Atlas.recoverPin(c); }, code);
  await fresh.context.close();
});

/* ===== ن-5: لا بصمة للرمز في أي نسخة ===== */

test('ن-5: full, all-children and raw copies carry no PIN or recovery hash', async () => {
  const { context, page } = await open();
  await child(page);
  const out = await page.evaluate(async () => {
    await Atlas.setPin('5820');
    Atlas.storage.setItem('atlas:U01.L01:stars', '2');
    const full = await Atlas.backup();
    let all; Atlas.download = (_n, v) => (all = v);
    await Atlas.rescueDownload();
    // نسخة خام: من قائمة تالفة
    const reg = localStorage.getItem('atlas:accounts:v1');
    localStorage.setItem('atlas:accounts:v1', reg.slice(0, -1));
    return { full, all, reg };
  });
  const text = JSON.stringify([out.full, out.all]);
  assert.doesNotMatch(text, /guardian|recovery|"hash"/);
  await go(page, 'index.html');
  const raw = await page.evaluate(async () => { let r; Atlas.download = (_n, v) => (r = v); await Atlas.rescueDownload(); return r; });
  assert.equal(raw.format, 'atlas-raw');
  assert.doesNotMatch(JSON.stringify(raw), /guardian|recovery|pinfails/);
  assert.match(raw.data['atlas:accounts:v1'], /نور/, 'القائمة الخام باقية بأسماء الأطفال');
  await context.close();
});

/* ===== ن-9: إجابة طويلة جداً ===== */

test('ن-9: answer boxes stop at 2000 characters, and a huge old answer is trimmed into the backup instead of dropping the lesson', async () => {
  const { context, page } = await open();
  await child(page);
  await go(page, 'U03.L02.html');
  const max = await page.evaluate(() => { const i = SCENES.findIndex((s) => /P3$/.test(String(s.id))); show(i); return document.querySelector('#main textarea')?.maxLength; });
  assert.equal(max, 2000);
  const r = await page.evaluate(async () => {
    const long = 'نص '.repeat(9000); // 27000 محرف من نسخة قديمة بلا حدّ
    Atlas.storage.setItem('atlas:U03.L02:open_U03.L02.P3', JSON.stringify(long));
    Atlas.storage.setItem('atlas:U03.L02:progress', JSON.stringify({ 'U03.L02.P1': { ok: true, hints: 0, firstAttempt: true }, 'U03.L02.P3': { ok: false, hints: 0, answered: true, text: long } }));
    await Atlas.setPin('1234');
    const b = await Atlas.backup();
    return { data: b.payload.profiles[0].data, trimmed: Atlas.backupTrimmed(), skipped: Atlas.backupSkipped(), banner: document.getElementById('atlas-status')?.textContent || '' };
  });
  assert.ok(r.data['atlas:U03.L02:progress'], 'التقدّم في النسخة');
  assert.equal(JSON.parse(r.data['atlas:U03.L02:progress'])['U03.L02.P1'].firstAttempt, true);
  assert.equal(JSON.parse(r.data['atlas:U03.L02:progress'])['U03.L02.P3'].text.length, 20000);
  assert.deepEqual(r.skipped, []);
  assert.deepEqual(r.trimmed.sort(), ['atlas:U03.L02:open_U03.L02.P3', 'atlas:U03.L02:progress'].sort());
  assert.match(r.banner, /U03\.L02: progress/);
  await context.close();
});

/* ===== ن-13: الاستعادة ===== */

test('ن-13: on a device with children, restore is only from the open parent screen, and imported approvals need a new approval', async () => {
  const { context, page } = await open();
  await child(page, 'سلمى', 'f');
  await go(page, 'index.html');
  await page.evaluate(() => accounts());
  assert.equal(await page.locator('#restoreHome').isVisible(), false);
  assert.equal(await page.locator('#restoreHint').isVisible(), true);
  const payload = { profiles: [{ profile: { name: 'سلمى', gender: 'f' }, data: {
    'atlas:U01.unit:ded': JSON.stringify({ idea: 0, title: 'الوصف الدقيق للموضع', who: 'أخي', text: 'نص الإهداء' }),
    'atlas:U01.unit:approval': JSON.stringify({ ok: true, at: 1 }),
    'atlas:U01.T01:score': JSON.stringify({ ok: 9, n: 9, at: 1 }),
  } }] };
  const file = JSON.stringify({ format: 'atlas-backup', version: 1, payload, sha256: await sha(page, payload) });
  await assert.rejects(page.evaluate((t) => Atlas.restore(t), file), /من شاشة ولي الأمر/);
  assert.equal(await page.evaluate(() => Atlas.profiles().length), 1);
  await page.evaluate(() => Atlas.setPin('1234'));
  assert.equal(await page.evaluate((t) => Atlas.restore(t), file), 1);
  const ap = await page.evaluate(() => JSON.parse(Atlas.storage.getItem('atlas:U01.unit:approval')));
  assert.deepEqual([ap.ok, ap.imported], [false, true]);
  await go(page, 'index.html');
  assert.doesNotMatch(await page.locator('body').innerText(), /مكتبة إهداءاتي/);
  // الحساب المستعاد أخذ رمز من استعاده
  assert.equal(await page.evaluate(() => Atlas.hasPin()), true);
  await page.evaluate(() => Atlas.unlock('1234'));
  await go(page, 'review.html#U01');
  await page.waitForSelector('#main', { state: 'visible' });
  assert.match(await page.locator('#main').innerText(), /الاعتماد لا ينتقل مع النسخة/);
  assert.match(await page.locator('#main').innerText(), /هذا الحساب مستعاد من نسخة احتياطية/);
  await context.close();
});

/* ===== ن-16: المحاولة الأولى ===== */

test('ن-16: after a miss, leaving and coming back keeps the miss: no «أحسنت!», the tried wrong option stays disabled', async () => {
  const { context, page, errors } = await open();
  await child(page);
  await go(page, 'U03.L02.html');
  const r = await page.evaluate(async () => {
    const wait = () => new Promise((res) => setTimeout(res, 40));
    const i = SCENES.findIndex((s) => String(s.id) === 'U03.L02.P1'); show(i); await wait();
    const it = LD.practice.find((x) => x.id === 'U03.L02.P1');
    const wrong = [...document.querySelectorAll('.opt[data-i]')].find((b) => +b.dataset.i !== it.answer);
    const wi = +wrong.dataset.i; wrong.click(); await wait();
    show(i - 1); await wait(); show(i); await wait();
    const disabled = document.querySelector('.opt[data-i="' + wi + '"]').disabled;
    document.querySelector('.opt[data-i="' + it.answer + '"]').click(); await wait();
    return { disabled, fb: document.querySelector('#fb').innerText, stored: JSON.parse(Atlas.storage.getItem('atlas:U03.L02:progress'))['U03.L02.P1'] };
  });
  assert.equal(r.disabled, true);
  assert.match(r.fb, /^صحيح الآن/);
  assert.equal(r.stored.firstAttempt, false);
  assert.equal(r.stored.solved, true);
  assert.deepEqual(errors, []);
  await context.close();
});

test('ن-16: an older tab answering right does not overwrite a miss recorded by another tab', async () => {
  const { context, page: A } = await open();
  await A.evaluate(() => { Atlas.create({ name: 'نور', gender: 'f' }); Atlas.storage.setItem('atlas:U03.L01:finished', 'true'); Atlas.storage.setItem('atlas:U03.L01:finishedAt', JSON.stringify(Date.now())); });
  const B = await context.newPage();
  await go(A, 'U03.T01.html');
  await go(B, 'U03.T01.html');
  const item = await A.evaluate(() => LD.items.find((i) => ['choose', 'choose_reason', 'predict'].includes(i.type)));
  for (const P of [A, B]) await P.evaluate(async (id) => { show(SCENES.findIndex((s) => s.id === id)); await new Promise((r) => setTimeout(r, 60)); }, item.id);
  await A.click(`.opt[data-i]:not([data-i="${item.answer}"])`);
  const afterA = await A.evaluate((id) => JSON.parse(Atlas.storage.getItem('atlas:U03.T01:progress'))[id], item.id);
  assert.equal(afterA.firstAttempt, false);
  await B.click(`.opt[data-i="${item.answer}"]`);
  const afterB = await B.evaluate((id) => JSON.parse(Atlas.storage.getItem('atlas:U03.T01:progress'))[id], item.id);
  assert.equal(afterB.firstAttempt, false, 'المخزَّن يبقى «أخطأ أول مرة»');
  assert.equal(afterB.solved, true);
  assert.match(await B.locator('#fb').innerText(), /^صحيح الآن/, 'والصفحة القديمة لا تقول «أحسنت»');
  await context.close();
});

/* ===== ن-18: متصفح يمنع التخزين ===== */

test('ن-18: when the browser denies storage, the app still loads and says progress will not be kept', async () => {
  const deny = () => {
    const thrower = { get() { throw new DOMException('denied', 'SecurityError'); } };
    Object.defineProperty(window, 'localStorage', thrower);
    Object.defineProperty(window, 'sessionStorage', thrower);
  };
  const { context, page, errors } = await open({ init: deny });
  assert.equal(await page.evaluate(() => typeof Atlas), 'object');
  assert.match(await page.locator('#atlas-status').innerText(), /يمنع حفظ البيانات/);
  // يمكن إنشاء حساب والتعلّم في الجلسة
  await page.evaluate(() => Atlas.create({ name: 'نور', gender: 'f' }));
  assert.equal(await page.evaluate(() => Atlas.profiles().length), 1);
  assert.deepEqual(errors.filter((e) => !/localStorage|sessionStorage|denied/i.test(e)), []);
  await context.close();
});

/* ===== ن-6: ساعة الجهاز ===== */

test('ن-6: a clock that went back is detected and shown to the parent, and recall rounds stamped in the future are flagged', async () => {
  const { context, page } = await open();
  await child(page);
  const DAY = 864e5;
  await page.evaluate((DAY) => {
    // جلسة «في المستقبل» سُجّلت فيها عودة، ثم أُعيدت الساعة
    localStorage.setItem('atlas:accounts:clock', JSON.stringify({ last: Date.now() + 21 * DAY, events: [] }));
    Atlas.storage.setItem('atlas:U03.L01:finished', 'true');
    Atlas.storage.setItem('atlas:U03.L01:finishedAt', JSON.stringify(Date.now() - 1 * DAY));
    Atlas.storage.setItem('atlas:U03.T01:recall', JSON.stringify({ ok: 2, n: 4, days: 21, at: Date.now() + 20 * DAY }));
  }, DAY);
  await go(page, 'index.html');
  const ev = await page.evaluate(() => Atlas.clockEvents());
  assert.equal(ev.length, 1);
  await page.evaluate(() => Atlas.setPin('1234'));
  await go(page, 'review.html#U03');
  await page.waitForSelector('#main', { state: 'visible' });
  const t = await page.locator('#main').textContent();
  assert.match(t, /رجعت ساعة الجهاز إلى الوراء مرة واحدة/, 'كشف واحد لا يتكرر مع كل فتح');
  assert.match(t, /سُجّلت هذه العودة وساعة الجهاز متقدمة/);
  assert.match(t, /بعد 21 يوماً/, 'صيغة العدد');
  // العودة الثانية لا تتعلّق بتاريخ في المستقبل: تُحسب مدتها من الآن
  await go(page, 'U03.T01.html');
  const gate = await page.evaluate(() => { const i = SCENES.findIndex((s) => s.id === 'rgate'); show(i); return document.querySelector('#main').innerText; });
  // كانت تنتظر 20 يوماً فوق المدة (من تاريخ العودة في المستقبل)؛ الآن: 7 أيام من إنهاء الدرس، و3 من الآن على الأقل
  const m = gate.match(/تُفتح بعد (\d+) أيام/);
  assert.ok(m && +m[1] <= 7, gate);
  await context.close();
});

/* ===== ن-18: صيغ العدد ===== */

test('ن-18: day counts read as Arabic numerals with the right noun form', async () => {
  const { context, page } = await open();
  const r = await page.evaluate(() => [0, 1, 2, 3, 10, 11, 21, 100, 103, 111].map((n) => Atlas.days(n)).concat(Atlas.days(2, 'nom')));
  assert.deepEqual(r, ['أقل من يوم', 'يوم واحد', 'يومين', '3 أيام', '10 أيام', '11 يوماً', '21 يوماً', '100 يوم', '103 أيام', '111 يوماً', 'يومان']);
  for (const f of ['test-runtime.js', 'review.html', 'unit-template.html']) {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    assert.doesNotMatch(src, /\} (يوم|أيام)\b|\$\{[^}]*\} يوم[ :<'`]/, f + ': عدد يُطبع مع اسم ثابت');
  }
  await context.close();
});

/* ===== إ-3: النطق بصوت على الجهاز فقط ===== */

test('إ-3: reading aloud uses an on-device voice only; with only a network Arabic voice it stays silent and says why', async () => {
  const voices = (fake) => {
    window.__utt = [];
    Object.defineProperty(speechSynthesis, 'getVoices', { value: () => fake, configurable: true });
    window.SpeechSynthesisUtterance = function (t) { this.text = t; this.voice = null; this.lang = ''; };
    speechSynthesis.speak = (u) => window.__utt.push({ text: u.text, voice: u.voice && u.voice.name });
  };
  const run = async (list) => {
    const { context, page } = await open({ init: `(${voices.toString()})(${JSON.stringify(list)})` });
    await child(page);
    await go(page, 'U03.L02.html');
    await page.evaluate(() => { voice('نص تجريبي'); });
    const out = await page.evaluate(() => window.__utt);
    await context.close();
    return out;
  };
  const net = await run([{ name: 'Google العربية', lang: 'ar-SA', localService: false }, { name: 'Local English', lang: 'en-US', localService: true }]);
  assert.deepEqual(net, []);
  const local = await run([{ name: 'Google العربية', lang: 'ar-SA', localService: false }, { name: 'Microsoft Hoda', lang: 'ar-EG', localService: true }]);
  assert.equal(local.length, 1);
  assert.equal(local[0].voice, 'Microsoft Hoda');
});

/* ===== ن-14: الإتاحة والشاشة الصغيرة ===== */

test('ن-14: at 320 px no glossary or option scene scrolls sideways; speakers are separate named buttons; the back button has a name', async () => {
  const { context, page } = await open({ viewport: { width: 320, height: 640 } });
  await child(page);
  for (const [id, scene] of [['U04.L02', 'glossary'], ['U06.L05', 'glossary'], ['U03.L01', 'E5']]) {
    await go(page, id + '.html');
    const over = await page.evaluate(async (sid) => { const i = SCENES.findIndex((s) => String(s.id) === sid); show(i); await new Promise((r) => setTimeout(r, 80)); return document.documentElement.scrollWidth - innerWidth; }, scene);
    assert.ok(over <= 0, `${id} ${scene}: +${over}px`);
  }
  await go(page, 'U03.L02.html');
  const a = await page.evaluate(async () => { show(SCENES.findIndex((s) => s.id === 'U03.L02.P1')); await new Promise((r) => setTimeout(r, 60));
    const o = document.querySelector('#main button.opt[data-i]');
    return { inside: o.querySelectorAll('[role=button],button').length, sibling: o.previousElementSibling?.matches('button.say1'), label: o.previousElementSibling?.getAttribute('aria-label'), text: o.innerText.trim(), back: document.getElementById('backBtn').getAttribute('aria-label') }; });
  assert.equal(a.inside, 0);
  assert.equal(a.sibling, true);
  assert.equal(a.label, 'استمع إلى: ' + a.text);
  assert.equal(a.back, 'السابق');
  await context.close();
});

test('ن-18: a quote mark the child types comes back as typed, not «&quot;», however often the page is reopened', async () => {
  const { context, page } = await open();
  await child(page);
  const typed = 'سأشرب الماء "كل يوم"';
  const reopen = async () => { await go(page, 'U06.L05.html'); await page.evaluate(async () => { show(SCENES.findIndex((s) => s.id === 'exp')); await new Promise((r) => setTimeout(r, 80)); }); };
  await reopen();
  await page.fill('#ch', typed);
  await page.dispatchEvent('#ch', 'input');
  for (let i = 0; i < 2; i++) { await reopen(); assert.equal(await page.inputValue('#ch'), typed); await page.dispatchEvent('#ch', 'input'); }
  await context.close();
});
