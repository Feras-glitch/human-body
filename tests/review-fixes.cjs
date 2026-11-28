// اختبارات إصلاحات المراجعة الخصمية (2026-11-05): مخزن الوسائط، المخطط، الرمز، البوابة، الرجوع، التذكير والتأنيث، صح/خطأ، الخلط، صفحة الاختبار.
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
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', ...(process.env.CI ? ['--no-sandbox', '--disable-dev-shm-usage'] : [])],
  });
});
after(async () => browser?.close());

async function open() {
  const context = await browser.newContext({ viewport: { width: 420, height: 860 }, acceptDownloads: true });
  await context.route(ORIGIN + '**', async (route) => {
    const rel = decodeURIComponent(new URL(route.request().url()).pathname).slice(1) || 'index.html';
    const file = path.resolve(ROOT, rel);
    if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file)) return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>blank</title>' });
    return route.fulfill({ body: fs.readFileSync(file), contentType: TYPES[path.extname(file)] || 'application/octet-stream' });
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(ORIGIN + 'index.html');
  return { context, page, errors };
}
const go = async (page, url) => { await page.goto(ORIGIN + url); await page.evaluate(() => window.Atlas?.ready); };
const child = (page, name = 'نور', gender = 'f') => page.evaluate(([n, g]) => Atlas.create({ name: n, gender: g }).id, [name, gender]);
const b64 = (n) => { let s = ''; const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'; for (let i = 0; i < n; i++) s += c[(i * 7919) % 64]; return s; };

test('recordings go to IndexedDB: three children with large recordings fit, and backups still carry the audio', async () => {
  const { context, page, errors } = await open();
  const audio = 'data:audio/webm;codecs=opus;base64,' + b64(1_700_000);
  for (const name of ['دلال', 'فرح', 'كريم']) {
    await child(page, name, name === 'دلال' ? 'f' : 'm');
    const ok = await page.evaluate(async (a) => {
      Atlas.storage.setItem('atlas:U01.unit:ded', JSON.stringify({ idea: 0, who: 'أمي', audio: a }));
      return Atlas.storage.flush();
    }, audio);
    assert.equal(ok, true, 'recording saved for ' + name);
  }
  // localStorage يحمل مراجع قصيرة فقط
  const total = await page.evaluate(() => Object.keys(localStorage).reduce((n, k) => n + localStorage.getItem(k).length, 0));
  assert.ok(total < 100_000, 'localStorage stays small: ' + total);
  // القراءة المتزامنة تعيد التسجيل كاملاً، والنسخة الاحتياطية تحمله
  await go(page, 'index.html');
  assert.equal(JSON.parse(await page.evaluate(() => Atlas.storage.getItem('atlas:U01.unit:ded'))).audio, audio);
  const backup = await page.evaluate(async () => { await Atlas.setPin('2468'); return Atlas.backup(); });
  assert.equal(JSON.parse(backup.payload.profiles[0].data['atlas:U01.unit:ded']).audio, audio);
  // والاستعادة تعيده إلى المخزن لا إلى localStorage
  const before = await page.evaluate(() => Object.keys(localStorage).length);
  await page.evaluate(async (b) => { await Atlas.restore(JSON.stringify(b)); }, backup);
  assert.equal(JSON.parse(await page.evaluate(() => Atlas.storage.getItem('atlas:U01.unit:ded'))).audio, audio);
  assert.ok((await page.evaluate(() => Object.keys(localStorage).length)) > before);
  assert.ok(!(await page.evaluate(() => Object.values(localStorage).some((v) => v.includes('data:audio')))), 'no inline audio');
  assert.deepEqual(errors, []);
  await context.close();
});

test('restore rejects unknown keys, out-of-range values and markup in numeric fields', async () => {
  const { context, page } = await open();
  await child(page);
  await page.evaluate(() => Atlas.setPin('1234')); // الاستعادة على جهاز فيه حساب من شاشة ولي الأمر (المراجعة 20، ن-13)
  const pack = (data) => page.evaluate(async (d) => {
    const payload = { profiles: [{ profile: { name: 'س', gender: 'm' }, data: d }] };
    const h = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(payload)))), (x) => x.toString(16).padStart(2, '0')).join('');
    try { await Atlas.restore(JSON.stringify({ format: 'atlas-backup', version: 1, payload, sha256: h })); return 'ok'; } catch (e) { return e.message; }
  }, data);
  assert.match(await pack({ 'atlas:U01.unit:recall': JSON.stringify({ ok: '<img src=x onerror=alert(1)>', n: 3, days: 4 }) }), /غير صالحة/);
  assert.match(await pack({ 'atlas:U03.L04:found5': JSON.stringify([99, 'x<y']) }), /غير صالحة/);
  assert.match(await pack({ 'atlas:U01.L01:mystery': '1' }), /غير معروف/);
  assert.match(await pack({ 'atlas:U03.L01:pulse': JSON.stringify({ rest: '<img src=x onerror=alert(1)>', move: 1, recover: 1 }) }), /غير صالحة/);
  assert.match(await pack({ 'atlas:U04.L01:breaths': JSON.stringify({ rest: 20, move: 30, recover: '<b>x</b>' }) }), /غير صالحة/);
  assert.equal(await pack({ 'atlas:U01.L01:stars': '3', 'atlas:U01.T01:score': JSON.stringify({ ok: 5, n: 7, at: 1 }) }), 'ok');
  await context.close();
});

test('a raw copy with a child id "__proto__" does not pollute Object.prototype', async () => {
  const { context, page } = await open();
  await child(page);
  const polluted = await page.evaluate(async () => {
    try { await Atlas.restore(JSON.stringify({ format: 'atlas-raw', data: { 'atlas:user:__proto__:U01.L01:stars': '2', 'atlas:user:__proto__:polluted': 'true' } })); } catch {}
    return ({}).polluted !== undefined || ({})['atlas:polluted'] !== undefined;
  });
  assert.equal(polluted, false);
  await context.close();
});

test('wrong PINs are throttled, and the all-children copy needs a PIN that opens every protected child', async () => {
  const { context, page } = await open();
  await child(page, 'أ', 'm');
  await page.evaluate(() => Atlas.setPin('1111'));
  await child(page, 'ب', 'f');
  await page.evaluate(() => Atlas.setPin('2222'));
  // الرمز الثاني لا يفتح الطفل الأول: لا نسخة لكل الأطفال
  await assert.rejects(page.evaluate(() => Atlas.rescueDownload()), /يفتح حسابات كل الأطفال/);
  // خمس محاولات خاطئة ثم انتظار
  await page.evaluate(() => Atlas.lock());
  for (let i = 0; i < 5; i++) await assert.rejects(page.evaluate(() => Atlas.unlock('0000')), /غير صحيح/);
  await assert.rejects(page.evaluate(() => Atlas.unlock('2222')), /انتظر/);
  await context.close();
});

test('going back or reloading keeps a finished scene open, and hiding the page keeps typed text', async () => {
  const { context, page, errors } = await open();
  await child(page);
  await go(page, 'U02.L01.html');
  // أول سؤال اختيار: إجابة صحيحة
  const k = await page.evaluate(() => SCENES.findIndex((s) => document && s.id && /\.P\d$/.test(s.id) && LD.practice.find((p) => p.id === s.id && ['choose', 'choose_reason', 'predict'].includes(p.type))));
  await page.evaluate((k) => show(k), k);
  await page.waitForTimeout(30);
  await page.evaluate(() => { const it = LD.practice.find((p) => p.id === SCENES[idx].id); document.querySelector(`.opt[data-i="${it.answer}"]`).click(); });
  assert.equal(await page.evaluate(() => document.querySelector('#nextBtn').disabled), false);
  await page.evaluate(() => show(idx + 1, 1));
  await page.evaluate(() => show(idx - 1, -1));
  await page.waitForTimeout(30);
  assert.equal(await page.evaluate(() => document.querySelector('#nextBtn').disabled), false, 'back keeps it open');
  await page.reload(); await page.evaluate(() => window.Atlas?.ready); await page.waitForTimeout(50);
  assert.equal(await page.evaluate(() => document.querySelector('#nextBtn').disabled), false, 'reload keeps it open');
  // نص مكتوب لا يضيع بإخفاء الصفحة
  const o = await page.evaluate(() => SCENES.findIndex((s) => [...LD.check, ...LD.practice].some((c) => c.id === s.id && c.type === 'explain_open' && (c.level || 'A') === 'A')));
  if (o >= 0) {
    await page.evaluate((o) => show(o), o);
    await page.fill('#ans', 'نص لم يُحفظ بعد');
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
    assert.equal(await page.inputValue('#ans'), 'نص لم يُحفظ بعد');
  }
  assert.deepEqual(errors, []);
  await context.close();
});

test('feedback written after an interaction never shows gender markers to a girl', async () => {
  const { context, page, errors } = await open();
  await child(page, 'ليلى', 'f');
  await go(page, 'U05.L01.html');
  await page.evaluate(() => { const e = document.createElement('p'); e.id = 'probe'; document.querySelector('#main').append(e); e.textContent = 'فكّر{|ي}: جرّب{|ي} مرة أخرى'; });
  await page.waitForTimeout(20);
  assert.equal(await page.textContent('#probe'), 'فكّري: جرّبي مرة أخرى');
  await context.close();
  assert.deepEqual(errors, []);
});

test('true/false asks for the reason before revealing the answer; options keep their shuffled order', async () => {
  const { context, page, errors } = await open();
  await child(page);
  await go(page, 'U06.L01.html');
  const k = await page.evaluate(() => SCENES.findIndex((s) => LD.check.some((c) => c.id === s.id && c.type === 'true_false_why')));
  await page.evaluate((k) => show(k), k);
  await page.click('[data-v="t"]');
  assert.equal(await page.isVisible('#whyBox'), true);
  assert.equal(await page.isDisabled('#showAns'), true);
  assert.equal((await page.textContent('#fb')).trim(), '', 'no answer before the reason');
  await page.fill('#ans', 'لأن الهضم يبدأ بالمضغ واللعاب');
  await page.click('#showAns');
  assert.match(await page.textContent('#fb'), /صح|أحسنت/);
  // ترتيب الخيارات ثابت بعد إعادة التحميل
  const c = await page.evaluate(() => SCENES.findIndex((s) => LD.practice.some((p) => p.id === s.id && p.type === 'choose')));
  await page.evaluate((c) => show(c), c);
  const order1 = await page.evaluate(() => [...document.querySelectorAll('.opt[data-i]')].map((b) => b.dataset.i).join());
  await page.reload(); await page.evaluate(() => window.Atlas?.ready);
  await page.evaluate((c) => show(c), c);
  assert.equal(await page.evaluate(() => [...document.querySelectorAll('.opt[data-i]')].map((b) => b.dataset.i).join()), order1);
  assert.deepEqual(errors, []);
  await context.close();
});

test('dedication gate (D22): locked below 80% of check items, re-check resets them, approval is tied to the recording', async () => {
  const { context, page, errors } = await open();
  await child(page);
  await page.evaluate(() => {
    for (const id of ['U01.L01', 'U01.L02']) Atlas.storage.setItem('atlas:' + id + ':finished', 'true');
    const wrong = {}; for (const i of ['U01.L01.C1', 'U01.L01.C2', 'U01.L01.C3', 'U01.L01.C4']) wrong[i] = { ok: false, firstAttempt: false, hints: 1 };
    Atlas.storage.setItem('atlas:U01.L01:progress', JSON.stringify(wrong));
  });
  await go(page, 'U01.unit.html');
  assert.equal(await page.evaluate(() => SCENES[idx].id), 'gate');
  assert.equal(await page.evaluate(() => document.querySelector('#nextBtn').disabled), true);
  assert.match(await page.textContent('#main'), /راجع\S* الدرس و\S+ أسئلة «أتحقق»/);
  // إعادة أسئلة التحقق تحفظ المحاولة وتمسح الإجابات
  await go(page, 'U01.L01.html#recheck');
  const st = await page.evaluate(() => ({ att: store.get('attempts', []), pr: store.get('progress', {}), at: SCENES[idx].id }));
  assert.equal(st.att.length, 1);
  assert.equal(st.pr['U01.L01.C1'], undefined);
  // اعتماد ولي الأمر مرتبط بالتسجيل نفسه
  await page.evaluate(async () => {
    const right = {}; for (const id of ['U01.L01', 'U01.L02']) { const L = id === 'U01.L01' ? ['C1', 'C2', 'C3', 'C4', 'C5'] : ['C1', 'C2', 'C3', 'C4']; L.forEach((c) => (right[id + '.' + c] = { ok: true, firstAttempt: true, hints: 0 })); Atlas.storage.setItem('atlas:' + id + ':progress', JSON.stringify(Object.fromEntries(Object.entries(right).filter(([k]) => k.startsWith(id))))); }
    Atlas.storage.setItem('atlas:U01.unit:ded', JSON.stringify({ idea: 0, title: 'فكرة', who: 'أخي', text: 'شرح طويل بما يكفي للفكرة' }));
    await Atlas.setPin('1357');
  });
  await go(page, 'review.html#U01');
  await page.click('#approve');
  await go(page, 'index.html');
  assert.match(await page.textContent('#home'), /مكتبة إهداءاتي/);
  await page.evaluate(() => Atlas.storage.setItem('atlas:U01.unit:ded', JSON.stringify({ idea: 0, title: 'فكرة', who: 'أخي', text: 'شرح مختلف بعد الاعتماد' })));
  await go(page, 'index.html');
  assert.doesNotMatch(await page.textContent('#home'), /مكتبة إهداءاتي/);
  assert.deepEqual(errors, []);
  await context.close();
});

test('lesson test page opens only after the lesson and records a first-attempt score', async () => {
  const { context, page, errors } = await open();
  await child(page);
  await go(page, 'U02.T01.html');
  assert.equal(await page.evaluate(() => SCENES[idx].id), 'tgate');
  assert.equal(await page.evaluate(() => document.querySelector('#nextBtn').disabled), true);
  await page.evaluate(() => Atlas.storage.setItem('atlas:U02.L01:finished', 'true'));
  await go(page, 'U02.T01.html');
  assert.equal(await page.evaluate(() => document.querySelector('#nextBtn').disabled), false);
  // نهاية الاختبار دون إجابة: لا نتيجة تُكتب
  await page.evaluate(() => show(SCENES.findIndex((s) => s.id === 'tend')));
  assert.equal(await page.evaluate(() => store.get('score', null)), null);
  // بعد الإجابة (خطأ) عن كل بند مغلق: تُكتب النتيجة
  await page.evaluate(() => { LD.items.filter((it) => forLevel(it) && !OPEN_TYPES.has(it.type)).forEach((it) => mark(it.id, false)); show(SCENES.findIndex((s) => s.id === 'tend')); });
  const sc = await page.evaluate(() => store.get('score', null));
  assert.ok(sc && sc.n > 0 && sc.ok === 0);
  assert.deepEqual(errors, []);
  await context.close();
});

test('feminine forms are whole words: no suffix appended after an attached pronoun or tanween', () => {
  // «تراه{|ينه}» كانت تعطي البنت «تراهينه»، و«تعلمته{|ِ}» «تعلمتهِ»، و«هادئاً{|ة}» «هادئاًة».
  // الصواب علامة للكلمة كلها: {تراه|ترينه}، {تعلمته|تعلمتِه}، {هادئاً|هادئةً}.
  const BAD = /(?:ه|ها|هما|ني)\{\|(?:ِ|[^{}|]*(?:ه|ها|هما|ني))\}|اً\{\||ًا\{\||ى\{\|ين?\}|ي\{\|ين?\}|َ\{\|ِ\}|ٍ\{\|/g;
  // الأمر من الفعل الأجوف يتغير جذعه في المؤنث: «اختر» ← «اختاري» لا «اختري»، «قل» ← «قولي» لا «قلي»، «قس» ← «قيسي»
  const HOLLOW = /(?<![\u0600-\u06FF])(?:و|ف)?(?:أجب|أدر|أضف|أعد|اختر|قل|تقل|سر|قس|نم|عد|قم|كن|زد|صم|خف|تخف|أرد|أطل|أزل|أقم)\{\|ي\}/g;
  const files = [
    ...fs.readdirSync(path.join(__dirname, '../lessons')).filter(f => f.endsWith('.json')).map(f => path.join(__dirname, '../lessons', f)),
    ...fs.readdirSync(path.join(ROOT, 'scenes')).filter(f => f.endsWith('.js')).map(f => path.join(ROOT, 'scenes', f)),
    ...['engine.js', 'lesson-runtime.js', 'test-runtime.js', 'unit-template.html', 'index-template.html', 'review.html'].map(f => path.join(ROOT, f)),
  ];
  const found = [];
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    for (const m of src.matchAll(BAD)) found.push(path.basename(f) + ': ' + m[0]);
    for (const m of src.matchAll(HOLLOW)) found.push(path.basename(f) + ': ' + m[0]);
    // ضمير المفعول في صيغة المؤنث وحدها: «دوّر{|يها}» تعطي الولد «دوّر» بلا مفعول
    for (const m of src.matchAll(/([ء-ْ]+)\{\|[^{}|]*(ه|ها|هما|ني)\}/g)) {
      if (!m[1].replace(/[ً-ْ]/g, '').endsWith(m[2])) found.push(path.basename(f) + ': ' + m[0]);
    }
  }
  assert.deepEqual(found, []);
  // والمحرك يطبّقها كما يُتوقع
  const gsub = (t, girl) => t.replace(/\{([^{}|]*)\|([^{}]*)\}/g, (m, a, b) => girl ? b : a);
  assert.equal(gsub('ما {تراه|ترينه} وما {تعلمته|تعلمتِه}', true), 'ما ترينه وما تعلمتِه');
  assert.equal(gsub('ما {تراه|ترينه} وما {تعلمته|تعلمتِه}', false), 'ما تراه وما تعلمته');
});

/* ===== ما وجده التحقق المستقل (2026-11-05) ===== */

test('a backup with reaction-time readings typed as text (as 1.1.6 saved them) restores', async () => {
  const { context, page } = await open();
  await child(page);
  await page.evaluate(() => Atlas.setPin('1234')); // الاستعادة على جهاز فيه حساب من شاشة ولي الأمر (ن-13)
  const res = await page.evaluate(async () => {
    const payload = { profiles: [{ profile: { name: 'س', gender: 'm' }, data: { 'atlas:U01.L02:readings': JSON.stringify(['12', '15', '', '١٤']) } }] };
    const h = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(payload)))), (x) => x.toString(16).padStart(2, '0')).join('');
    try { await Atlas.restore(JSON.stringify({ format: 'atlas-backup', version: 1, payload, sha256: h })); return 'ok'; } catch (e) { return e.message; }
  });
  assert.equal(res, 'ok');
  await context.close();
});

test('the U01 dedication gate counts only questions the child answers by choosing', async () => {
  // U01.L02.C2 صح/خطأ في بيانات الدرس، لكن مشهده المؤلَّف يدوياً سؤال مكتوب: لا يدخل نسبة البوابة
  const unit = fs.readFileSync(path.join(ROOT, 'U01.unit.html'), 'utf8');
  assert.match(unit, /"U01\.L02\.C2","level":"A","open":true/);
  const lesson = fs.readFileSync(path.join(ROOT, 'U01.L02.html'), 'utf8');
  assert.match(lesson, /"U01\.L02\.C2":"open"/);
  // و«المقارنة» تُعرض نصاً مكتوباً فهي مفتوحة في الاختبار وفي شاشة ولي الأمر
  assert.match(fs.readFileSync(path.join(ROOT, 'test-runtime.js'), 'utf8'), /OPEN_TYPES = new Set\(\[[^\]]*'compare'/);
});

test('#recheck opens the first check question even in hand-written U01 scenes', async () => {
  const { context, page, errors } = await open();
  await child(page);
  await go(page, 'U01.L01.html#recheck');
  const at = await page.evaluate(() => ({ idx, id: SCENES[idx].id, holds: String(SCENES[idx].render).includes("'U01.L01.C1'") || SCENES[idx].id === 'U01.L01.C1' }));
  const first = await page.evaluate(() => SCENES.findIndex((s) => ['U01.L01.C1', 'U01.L01.C2', 'U01.L01.C3', 'U01.L01.C4'].some((i) => s.id === i || String(s.render).includes("'" + i + "'"))));
  assert.equal(at.idx, first, 'lands on the first scene holding a check question, got ' + at.id);
  assert.deepEqual(errors, []);
  await context.close();
});

test('Back from the scene after a skipped level-B scene goes back past it', async () => {
  const { context, page, errors } = await open();
  await child(page);
  await go(page, 'U02.L01.html');
  const k = await page.evaluate(() => { level = 'A'; return SCENES.findIndex((s, i) => i > 0 && s.skip?.() && !SCENES[i - 1].skip?.()); });
  assert.ok(k > 0, 'lesson has a level-B scene');
  await page.evaluate((k) => show(k + 1), k);
  const after = await page.evaluate(() => idx);
  await page.evaluate(() => show(idx - 1, -1));
  const back = await page.evaluate(() => idx);
  assert.ok(back < k, `back from ${after} landed on ${back}, not before the skipped ${k}`);
  assert.deepEqual(errors, []);
  await context.close();
});

test('«forgot PIN» needs the written recovery code, clears the lockout, and is shown to the parent with any approval made after it', async () => {
  const { context, page } = await open();
  await child(page);
  const code = await page.evaluate(async () => (await Atlas.setPin('1111')).recovery);
  assert.match(code, /^[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/);
  // يُحفظ بصمة لا نصاً (المراجعة 20، ن-1)
  assert.ok(!(await page.evaluate(() => localStorage.getItem('atlas:accounts:v1'))).includes(code.replace(/-/g, '')));
  await page.evaluate(() => Atlas.lock());
  for (let i = 0; i < 5; i++) await assert.rejects(page.evaluate(() => Atlas.unlock('0000')), /غير صحيح/);
  // سؤال الضرب القديم لم يعد طريقاً: رمز الاستعادة الخاطئ يُرفض ويتباطأ بعد 3 أخطاء
  for (let i = 0; i < 3; i++) await assert.rejects(page.evaluate(() => Atlas.recoverPin('2222-3333-4444')), /غير صحيح/);
  await assert.rejects(page.evaluate((c) => Atlas.recoverPin(c), code), /انتظر/);
  await page.evaluate(() => { const f = JSON.parse(localStorage.getItem('atlas:accounts:pinfails')); for (const k of Object.keys(f)) if (k.startsWith('rec:')) f[k].until = 0; localStorage.setItem('atlas:accounts:pinfails', JSON.stringify(f)); });
  // يُقبل بأحرف صغيرة وبلا شرطات
  await page.evaluate((c) => Atlas.recoverPin(c.toLowerCase().replace(/-/g, ' ')), code);
  assert.equal(await page.evaluate(() => Atlas.hasPin() || Atlas.hasRecovery()), false);
  const again = await page.evaluate(async () => (await Atlas.setPin('2222')).recovery); // كان يرمي «انتظر» لأن العدّاد بقي
  assert.ok(again && again !== code, 'رمز استعادة جديد بعد إعادة التعيين');
  assert.equal(await page.evaluate(() => Atlas.guardianUnlocked()), true);
  assert.ok(await page.evaluate(() => Atlas.profiles()[0].pinResetAt));
  await go(page, 'review.html');
  assert.match(await page.locator('#main').innerText(), /أُعيد تعيين رمز ولي الأمر/);
  await context.close();
});

test('without a recovery code, a reset can only be requested: it waits 3 days in plain sight and the PIN cancels it', async () => {
  const { context, page } = await open();
  await child(page, 'سلمى', 'f');
  // حساب من قبل 1.3.0: رمز بلا رمز استعادة
  await page.evaluate(async () => { await Atlas.setPin('1111'); const r = JSON.parse(localStorage.getItem('atlas:accounts:v1')); delete r.profiles[0].recovery; localStorage.setItem('atlas:accounts:v1', JSON.stringify(r)); Atlas.lock(); });
  await go(page, 'review.html');
  await page.click('#forgotPin');
  assert.equal(await page.locator('#recWay').isVisible(), false, 'لا خانة لرمز استعادة غير موجود');
  assert.match(await page.locator('#waitTxt').innerText(), /3 أيام/);
  await page.click('#waitGo');
  assert.match(await page.locator('#waitTxt').innerText(), /تُتاح في/);
  assert.equal(await page.evaluate(() => Atlas.hasPin()), true);
  await assert.rejects(page.evaluate(() => Atlas.completeReset()), /لم تنقضِ/);
  // الطلب ظاهر في صفحة الحسابات
  await go(page, 'index.html');
  await page.evaluate(() => accounts());
  assert.match(await page.locator('#resetNotes').innerText(), /طُلبت إعادة تعيين رمز ولي الأمر لحساب سلمى/);
  // ولي الأمر يفتح برمزه: يُلغى الطلب، ويُعطى رمز استعادة يُعرض مرة واحدة
  await go(page, 'review.html');
  await page.fill('#guardianPin', '1111');
  await page.click('#guardianGo');
  await page.waitForSelector('#recoveryBox', { state: 'visible' });
  assert.equal(await page.evaluate(() => Atlas.resetRequest()), null);
  assert.equal(await page.evaluate(() => Atlas.hasRecovery()), true);
  // طلب جديد بعد 3 أيام يحذف الرمز
  await page.evaluate(() => { Atlas.lock(); Atlas.requestReset(); const r = JSON.parse(localStorage.getItem('atlas:accounts:v1')); r.profiles[0].resetRequestedAt = new Date(Date.now() - 73 * 3600e3).toISOString(); localStorage.setItem('atlas:accounts:v1', JSON.stringify(r)); });
  await go(page, 'review.html');
  await page.click('#forgotPin');
  await page.click('#waitGo');
  assert.equal(await page.evaluate(() => Atlas.hasPin()), false);
  assert.ok(await page.locator('#confirmLabel').isVisible(), 'يطلب رمزاً جديداً');
  await context.close();
});

test('when the media store is unavailable and the device is full, a failed re-recording keeps the old one', async () => {
  const context = await browser.newContext({ viewport: { width: 420, height: 860 } });
  await context.addInitScript(() => { indexedDB.open = () => { throw new Error('no idb'); }; });
  await context.route(ORIGIN + '**', (route) => {
    const rel = decodeURIComponent(new URL(route.request().url()).pathname).slice(1) || 'index.html';
    const file = path.resolve(ROOT, rel);
    return fs.existsSync(file) ? route.fulfill({ body: fs.readFileSync(file), contentType: TYPES[path.extname(file)] || 'text/html' }) : route.fulfill({ status: 404, body: '' });
  });
  const page = await context.newPage();
  await page.goto(ORIGIN + 'index.html');
  await child(page);
  const res = await page.evaluate(async () => {
    const k = 'atlas:U01.unit:ded';
    Atlas.storage.setItem(k, JSON.stringify({ idea: 0, audio: 'data:audio/webm;base64,' + 'A'.repeat(3000) }));
    const first = await Atlas.storage.flush();
    // الجهاز ممتلئ: التسجيل الجديد لا مكان له
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, v) { if (String(v).includes('BBBB')) throw new DOMException('full', 'QuotaExceededError'); return set.call(this, key, v); };
    try { Atlas.storage.setItem(k, JSON.stringify({ idea: 0, audio: 'data:audio/webm;base64,' + 'B'.repeat(3000) })); } catch {}
    const second = await Atlas.storage.flush();
    Storage.prototype.setItem = set;
    const raw = Object.keys(localStorage).filter((x) => x.endsWith('U01.unit:ded')).map((x) => localStorage.getItem(x))[0] || '';
    return { first, second, kept: raw.includes('AAAA'), raw: raw.slice(0, 50) };
  });
  assert.equal(res.first, true, 'first recording saved inline');
  assert.equal(res.second, false, 'flush reports the failure');
  assert.ok(res.kept, 'old recording kept: ' + res.raw);
  await context.close();
});

test('small drawn targets accept a tap within a 44px box, and the neck zone is large enough on a phone', async () => {
  const context = await browser.newContext({ viewport: { width: 360, height: 740 } });
  await context.route(ORIGIN + '**', (route) => {
    const rel = decodeURIComponent(new URL(route.request().url()).pathname).slice(1) || 'index.html';
    const file = path.resolve(ROOT, rel);
    return fs.existsSync(file) ? route.fulfill({ body: fs.readFileSync(file), contentType: TYPES[path.extname(file)] || 'text/html' }) : route.fulfill({ status: 404, body: '' });
  });
  const page = await context.newPage();
  await page.goto(ORIGIN + 'index.html');
  await child(page);
  // محطة صغيرة في U05.L03: لمسة على بعد 16 بكسل من مركزها تصلها
  await go(page, 'U05.L03.html');
  await page.evaluate(() => { for (let i = 0; i < SCENES.length; i++) { show(i); if (document.querySelector('#main .st')) return; } });
  await page.waitForTimeout(300);
  const pt = await page.evaluate(() => {
    const all = [...document.querySelectorAll('#main .st')].map((e) => { const r = e.getBoundingClientRect(); return { e, cx: r.left + r.width / 2, cy: r.top + r.height / 2, s: Math.min(r.width, r.height) }; });
    // نقطة على بعد 16 بكسل من أول محطة، أقرب إليها منها إلى غيرها، وليست على محطة
    for (const t of all) for (const [dx, dy] of [[0, -16], [16, 0], [-16, 0], [0, 16], [12, -12], [-12, 12]]) {
      const x = t.cx + dx, y = t.cy + dy, d = (o) => Math.hypot(x - o.cx, y - o.cy);
      if (all.every((o) => o === t || d(o) > d(t) + 2) && !document.elementFromPoint(x, y)?.closest('.st')) {
        window.__hit = 0; t.e.addEventListener('click', () => window.__hit++);
        return { x, y, size: Math.round(t.s) };
      }
    }
    return null;
  });
  assert.ok(pt.size < 44, 'station is drawn smaller than 44px');
  await page.mouse.click(pt.x, pt.y);
  assert.equal(await page.evaluate(() => window.__hit), 1, 'near tap reaches the station');
  // العنق في خريطة الجسم الأمامية
  await go(page, 'U01.L01.html');
  await page.evaluate(() => show(SCENES.findIndex((s) => String(s.render).includes('bodyMap('))));
  await page.waitForTimeout(800);
  const neck = await page.evaluate(() => { const r = document.querySelector('.hot[data-id=neck] .zone').getBoundingClientRect(); return { w: r.width, h: r.height }; });
  assert.ok(neck.w >= 44 && neck.h >= 44, `neck ${Math.round(neck.w)}x${Math.round(neck.h)}`);
  await context.close();
});

/* ===== الصور والرسوم (2026-11-11) ===== */

test('every «locate» exercise has a drawing or a real question — never a raw key as an option', () => {
  const src = fs.readFileSync(path.join(ROOT, 'lesson-runtime.js'), 'utf8');
  const atlas = src.slice(src.indexOf('const ATLAS = {'), src.indexOf('/* خريطة خلية'));
  const missing = [];
  for (const f of fs.readdirSync(path.join(__dirname, '../lessons')).filter((x) => /^U\d\d\.L\d\d\.json$/.test(x))) {
    const L = JSON.parse(fs.readFileSync(path.join(__dirname, '../lessons', f), 'utf8'));
    for (const it of [...L.flow.practice, ...L.flow.check, ...L.assessment.items, ...(L.assessment.delayed_recall || [])]) {
      if (it.type === 'locate_on_atlas' && !new RegExp('(^|[\\s,{])' + it.atlas_target + ':\\{').test(atlas)) missing.push(it.id + ' → ' + it.atlas_target);
      if (it.figure && !fs.existsSync(path.join(ROOT, 'img', it.figure + '.webp'))) missing.push(it.id + ' figure ' + it.figure);
    }
  }
  assert.deepEqual(missing, []);
});

test('illustrations enlarge on tap, and the drawing pad has colours, undo and an undoable clear', async () => {
  const { context, page, errors } = await open();
  await child(page);
  await go(page, 'U03.L01.html');
  await page.evaluate(() => { level = 'B'; show(SCENES.findIndex((s) => s.id === 'E6')); });
  await page.waitForSelector('img.art');
  await page.evaluate(() => document.querySelector('img.art').decode());
  await page.click('img.art');
  assert.equal(await page.locator('.zoom img').count(), 1);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.zoom').count(), 0);
  await page.evaluate(() => show(SCENES.findIndex((s) => s.id === 'draw')));
  const cv = page.locator('#cv');
  await cv.scrollIntoViewIfNeeded();
  const b = await cv.boundingBox();
  const stroke = async (y) => { await page.mouse.move(b.x + 30, b.y + y); await page.mouse.down(); await page.mouse.move(b.x + 160, b.y + y + 20, { steps: 4 }); await page.mouse.up(); };
  await stroke(40);
  await page.click('[data-ink="#C0392B"]');
  await stroke(120);
  const two = await page.evaluate(() => store.get('drawing', '').length);
  await page.click('[data-undo]');
  const one = await page.evaluate(() => store.get('drawing', '').length);
  assert.ok(one > 0 && one < two, 'undo removes the last stroke only');
  await page.click('#clr');
  assert.equal(await page.evaluate(() => store.get('drawing', null)), null);
  await page.click('[data-undo]');
  assert.equal(await page.evaluate(() => store.get('drawing', '').length), one, 'clear can be undone');
  assert.deepEqual(errors, []);
  await context.close();
});

test('pulse readings reach the page as numbers only, and a drawing reference with no stored drawing does not loop', async () => {
  const { context, page, errors } = await open();
  await child(page);
  await go(page, 'U03.L01.html');
  // قيمة ملغّمة كُتبت مباشرة في التخزين (متجاوزة مخطط الاستعادة)
  await page.evaluate(() => { window.__x = 0; store.set('pulse', { rest: '<img src=x onerror="window.__x=1">', move: 120, recover: 90 }); show(SCENES.findIndex((s) => s.id === 'exp')); });
  await page.waitForTimeout(300);
  assert.equal(await page.evaluate(() => window.__x), 0);
  assert.equal(await page.locator('#main img[src="x"]').count(), 0);
  await page.evaluate(() => { store.set('pulse', { rest: '80', move: 120, recover: 90 }); show(idx); });
  assert.match(await page.locator('#cmp').innerText(), /راحة 80/);
  // مرجع رسم بلا رسم في المخزن
  await page.evaluate(() => {
    const k = Object.keys(localStorage).find((x) => x.endsWith(':U03.L01:stars')) || '';
    window.__n = 0; const s0 = show; show = function (...a) { window.__n++; return s0.apply(this, a); };
    Atlas.storage.setItem('atlas:U03.L01:drawing', JSON.stringify('data:image/png;base64,' + 'A'.repeat(5000)));
  });
  await page.evaluate(() => Atlas.storage.flush());
  await page.evaluate(async () => {
    const db = await new Promise((r) => { const q = indexedDB.open('atlas-media'); q.onsuccess = () => r(q.result); });
    await new Promise((r) => { const t = db.transaction('media', 'readwrite'); t.objectStore('media').clear(); t.oncomplete = r; });
  });
  await page.reload();
  await page.evaluate(() => window.Atlas?.ready);
  await page.evaluate(() => { window.__n = 0; const s0 = show; show = function (...a) { window.__n++; return s0.apply(this, a); }; show(SCENES.findIndex((s) => s.id === 'draw')); });
  await page.waitForTimeout(1500);
  const n = await page.evaluate(() => window.__n);
  assert.ok(n <= 3, 'scene re-rendered ' + n + ' times');
  assert.equal(await page.locator('#cv').evaluate((c) => getComputedStyle(c).pointerEvents), 'auto');
  assert.deepEqual(errors, []);
  await context.close();
});

test('#recall cannot be used to walk back into the test or to write a result, and does not move the resume point', async () => {
  const { context, page, errors } = await open();
  await child(page);
  await go(page, 'U02.T01.html#recall');
  assert.equal(await page.evaluate(() => SCENES[idx].id), 'rgate');
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('#backBtn')).visibility), 'hidden');
  await page.evaluate(() => document.querySelector('#backBtn').click());
  assert.equal(await page.evaluate(() => SCENES[idx].id), 'rgate');
  assert.equal(await page.evaluate(() => store.get('finished', null)), null);
  assert.equal(await page.evaluate(() => store.get('score', null)), null);
  assert.equal(await page.evaluate(() => store.get('scene', null)), null);
  await go(page, 'U02.unit.html#recall');
  await page.evaluate(() => document.querySelector('#backBtn').click());
  assert.equal(await page.evaluate(() => SCENES[idx].id), 'recall');
  assert.equal(await page.evaluate(() => store.get('finished', null)), null);
  assert.deepEqual(errors, []);
  await context.close();
});

test('an answer corrected after a first mistake is recorded as solved, without counting as a first-attempt success', async () => {
  const { context, page } = await open();
  await child(page);
  await go(page, 'U02.L01.html');
  const r = await page.evaluate(() => { mark('x.1', false); mark('x.1', true); return progress['x.1']; });
  assert.equal(r.solved, true);
  assert.equal(r.ok, false);
  assert.equal(r.firstAttempt, false);
  await context.close();
});

test('a new recording is whole in localStorage until IndexedDB has it, then becomes a reference', async () => {
  const { context, page } = await open();
  await child(page);
  await go(page, 'U02.L01.html');
  const audio = 'data:audio/webm;base64,' + b64(60000);
  const before = await page.evaluate((a) => {
    Atlas.storage.setItem('atlas:U02.L01:teach', JSON.stringify({ audio: a }));
    const k = Object.keys(localStorage).find((x) => x.endsWith(':U02.L01:teach'));
    return localStorage.getItem(k).includes('base64');
  }, audio);
  assert.equal(before, true, 'no reference is written before the media is durable');
  await page.evaluate(() => Atlas.storage.flush());
  const after = await page.evaluate(() => { const k = Object.keys(localStorage).find((x) => x.endsWith(':U02.L01:teach')); return localStorage.getItem(k); });
  assert.match(after, /atlas-media:/);
  assert.equal(await page.evaluate(() => JSON.parse(Atlas.storage.getItem('atlas:U02.L01:teach')).audio.length), audio.length);
  await context.close();
});

test('the parent can delete a child account: needs the unlocked parent screen and the typed name; it waits 30 days in the trash, comes back with its PIN, and only a purge removes data and media', async () => {
  const { context, page } = await open();
  await child(page, 'سلمى', 'f');
  await child(page, 'نور', 'f');
  await page.evaluate(async (a) => { await Atlas.setPin('2468'); Atlas.storage.setItem('atlas:U02.L01:teach', JSON.stringify({ audio: a })); await Atlas.storage.flush(); }, 'data:audio/webm;base64,' + b64(60000));
  await page.evaluate(() => Atlas.lock());
  await assert.rejects(page.evaluate(() => Atlas.remove('نور')), /رمز/);
  await page.evaluate(() => Atlas.unlock('2468'));
  await assert.rejects(page.evaluate(() => Atlas.remove('غير')), /لا يطابق/);
  const left = await page.evaluate(() => Atlas.remove('نور'));
  assert.equal(left, 1);
  const state = () => page.evaluate(async () => {
    const db = await new Promise((r) => { const q = indexedDB.open('atlas-media'); q.onsuccess = () => r(q.result); });
    const n = await new Promise((r) => { const q = db.transaction('media').objectStore('media').count(); q.onsuccess = () => r(q.result); });
    return { names: Atlas.profiles().map((p) => p.name).sort(), trash: Atlas.trash().map((t) => [t.name, t.hasPin]), keys: Object.keys(localStorage).filter((k) => k.includes('U02.L01')).length, media: n };
  });
  // الحذف نقل إلى «المحذوفات»: البيانات والتسجيل كما هما (المراجعة 20، ن-1)
  assert.deepEqual(await state(), { names: ['سلمى'], trash: [['نور', true]], keys: 1, media: 1 });
  const id = await page.evaluate(() => Atlas.trash()[0].id);
  await assert.rejects(page.evaluate((id) => Atlas.undelete(id, '0000'), id), /غير صحيح/);
  await page.evaluate((id) => Atlas.undelete(id, '2468'), id);
  assert.deepEqual(await state(), { names: ['سلمى', 'نور'], trash: [], keys: 1, media: 1 });
  assert.equal(await page.evaluate(async (id) => { Atlas.select(id); await Atlas.ready; return JSON.parse(Atlas.storage.getItem('atlas:U02.L01:teach')).audio.length; }, id), 'data:audio/webm;base64,'.length + b64(60000).length);
  // الحذف النهائي الآن يحتاج الرمز نفسه، ثم يزول كل شيء
  await page.evaluate(async () => { await Atlas.unlock('2468'); await Atlas.remove('نور'); });
  await assert.rejects(page.evaluate((id) => Atlas.purge(id, '1111'), id), /غير صحيح/);
  await page.evaluate((id) => Atlas.purge(id, '2468'), id);
  assert.deepEqual(await state(), { names: ['سلمى'], trash: [], keys: 0, media: 0 });
  // ما مضى عليه 30 يوماً في المحذوفات يُحذف نهائياً عند فتح التطبيق
  await child(page, 'ريم', 'f');
  await page.evaluate(async (a) => { await Atlas.setPin('1357'); Atlas.storage.setItem('atlas:U02.L01:teach', JSON.stringify({ audio: a })); await Atlas.storage.flush(); await Atlas.remove('ريم'); }, 'data:audio/webm;base64,' + b64(60000));
  assert.equal((await state()).keys, 1);
  await page.evaluate(() => { const r = JSON.parse(localStorage.getItem('atlas:accounts:v1')); r.trash[0].deletedAt = new Date(Date.now() - 31 * 864e5).toISOString(); localStorage.setItem('atlas:accounts:v1', JSON.stringify(r)); });
  await go(page, 'index.html');
  await page.evaluate(() => Atlas.ready);
  assert.deepEqual(await state(), { names: ['سلمى'], trash: [], keys: 0, media: 0 });
  await context.close();
});

test('on a phone, a task below the fold shows the «activity below» cue while Next is disabled, and the footer is opaque', async () => {
  const { context, page, errors } = await open();
  await page.setViewportSize({ width: 360, height: 640 });
  await child(page);
  await go(page, 'U03.L01.html');
  const r = await page.evaluate(async () => {
    const out = [];
    for (let i = 0; i < SCENES.length; i++) {
      show(i); await new Promise((res) => setTimeout(res, 30)); updateCue();
      const t = cueTarget(); const cue = document.querySelector('.cue');
      const lim = document.querySelector('footer').getBoundingClientRect().top - 24;
      if (!done && t && t.getBoundingClientRect().top > lim && cue.hidden) out.push(SCENES[i].id);
    }
    return { missing: out, bg: getComputedStyle(document.querySelector('footer')).backgroundImage };
  });
  assert.deepEqual(r.missing, []);
  assert.equal(r.bg, 'none');
  assert.deepEqual(errors, []);
  await context.close();
});

test('memory recall runs three spaced rounds (3, 7, 21 days) and keeps each round separately', async () => {
  const { context, page, errors } = await open();
  await child(page);
  const DAY = 864e5;
  const setTimes = async (fin, prevKey, prevAgo) => { await go(page, 'index.html'); return page.evaluate(([fin, prevKey, prevAgo, DAY]) => {
    Atlas.storage.setItem('atlas:U01.L02:finished', 'true');
    Atlas.storage.setItem('atlas:U01.L02:finishedAt', JSON.stringify(Date.now() - fin * DAY));
    if (prevKey) { const k = 'atlas:U01.T02:' + prevKey, r = JSON.parse(Atlas.storage.getItem(k)); r.at = Date.now() - prevAgo * DAY; Atlas.storage.setItem(k, JSON.stringify(r)); }
  }, [fin, prevKey, prevAgo, DAY]); };
  const round = async (text) => {
    await go(page, 'U01.T02.html#recall');
    assert.equal(await page.evaluate(() => SCENES[idx].id), 'rgate');
    assert.equal(await page.locator('#nextBtn').isDisabled(), false);
    // بداية كل عودة: لا إجابات محفوظة من السابقة
    assert.equal(await page.evaluate(() => LD.recall.some((it) => progress[it.id])), false);
    await page.evaluate((text) => {
      for (const it of LD.recall) mark(it.id, true);
      store.set(openKey(LD.lesson + '.FR'), text);
      show(SCENES.findIndex((s) => s.id === 'rend'), 1);
    }, text);
  };
  const get = (k) => page.evaluate((k) => store.get(k, null), k);

  await setTimes(4);
  await round('الأولى: أتذكر');
  assert.equal((await get('recall')).days, 4);
  assert.equal(await get('recall2'), null);

  // بعد يوم واحد فقط من العودة الأولى: الثانية مقفلة ولو مرّ 8 أيام على الدرس
  await setTimes(8, 'recall', 1);
  await go(page, 'U01.T02.html#recall');
  await page.waitForFunction(() => typeof idx !== 'undefined' && SCENES[idx]?.id === 'rgate' && document.querySelector('#main h2')); await page.waitForTimeout(200);
  assert.equal(await page.locator('#nextBtn').isDisabled(), true);
  await page.evaluate(() => show(SCENES.findIndex((s) => s.id === 'rend'), 1));
  assert.equal(await get('recall2'), null);

  await setTimes(8, 'recall', 4);
  // الخريطة تعرض بطاقة العودة الثانية حين يحين موعدها
  await go(page, 'index.html');
  assert.match(await page.locator('a[href="U01.T02.html#recall"]').first().innerText(), /عودة الذاكرة الثانية/);
  // فتح صفحة الاختبار بلا #recall (استئناف) لا يسجّل العودة الثانية من تلقاء نفسه
  await go(page, 'U01.T02.html');
  await page.waitForFunction(() => typeof idx !== 'undefined' && document.querySelector('#main .scene'));
  assert.notEqual(await page.evaluate(() => SCENES[idx].id), 'rend');
  await page.evaluate(() => show(SCENES.findIndex((s) => s.id === 'rend'), 1));
  assert.equal(await get('recall2'), null);
  // بداية العودة الثانية: بنودها غير محلولة فزر «التالي» مقفل عند أول بند
  await go(page, 'index.html'); await go(page, 'U01.T02.html#recall');
  await page.waitForFunction(() => typeof idx !== 'undefined' && SCENES[idx]?.id === 'rgate' && document.querySelector('#main h2'));
  await page.evaluate(() => show(idx + 1, 1));
  assert.equal(await page.evaluate((id) => !!store.get('passed', {})[id], await page.evaluate(() => SCENES[idx].id)), false);
  assert.equal(await page.locator('#nextBtn').isDisabled(), true);
  await go(page, 'index.html');
  await round('الثانية: أتذكر');
  assert.equal((await get('recall2')).days, 8);
  assert.equal((await get('recall')).text, 'الأولى: أتذكر');
  assert.equal((await get('recall')).days, 4);

  await setTimes(22, 'recall2', 8);
  await round('الثالثة: أتذكر');
  assert.equal((await get('recall3')).days, 22);
  assert.equal((await get('recall2')).text, 'الثانية: أتذكر');

  // اكتملت الثلاث: لا عودة رابعة، والخريطة لا تعرض بطاقة
  await go(page, 'index.html');
  await go(page, 'U01.T02.html#recall');
  await page.waitForFunction(() => typeof idx !== 'undefined' && SCENES[idx]?.id === 'rgate' && document.querySelector('#main h2')); await page.waitForTimeout(200);
  assert.equal(await page.locator('#nextBtn').isDisabled(), true);
  assert.match(await page.locator('#main').innerText(), /اكتملت العودات الثلاث/);
  await go(page, 'index.html');
  assert.equal(await page.locator('a[href="U01.T02.html#recall"]').count(), 0);
  await go(page, 'review.html');
  assert.deepEqual(errors, []);
  await context.close();
});

test('the Quran is never sent to the speech engine: only a parent or developer recording is played', async () => {
  const { context, page, errors } = await open();
  await context.addInitScript(() => {
    window.__said = [];
    const S = window.SpeechSynthesisUtterance;
    window.SpeechSynthesisUtterance = function (t) { window.__said.push(String(t)); return new S(t); };
  });
  await child(page);
  await go(page, 'U04.L02.html');
  // 1) ما بين ﴿ ﴾ يُحذف من النطق أينما ورد
  await page.evaluate(() => { __said.length = 0; speak('قال الله: ﴿وإن تعدّوا نعمة الله لا تحصوها﴾. اليوم عددنا.'); });
  let said = await page.evaluate(() => __said.join(' | '));
  assert.doesNotMatch(said, /تعدّوا|تحصوها|﴿/);
  assert.match(said, /اليوم عددنا/);
  // 2) مشهد الآية: الآية مكتوبة، والقارئ الآلي يقرأ الشرح وحده
  const found = await page.evaluate(async () => { for (const sc of SCENES.filter((s) => /^faith_/.test(s.id))) { __said.length = 0; show(SCENES.indexOf(sc)); if (document.querySelector('#main .quran, #main .quran-plain')) return sc.id; } return null; });
  assert.ok(found, 'U04.L02 يجب أن يحوي مشهد آية');
  // لا قراءة تلقائية عند فتح المشهد: لا تلاوة ولا نطق آلي حتى يضغط الطفل
  await page.waitForSelector('#main .recite button');
  said = await page.evaluate(() => __said.join(' | '));
  assert.equal(said, '', 'لا شيء يُقرأ عند فتح مشهد الآية');
  assert.equal(await page.evaluate(() => !audioEl), true, 'لا تلاوة تلقائية');
  // ▶ يشغّل التلاوة المرفقة من ملفها، ولا تُعطى الآية للقارئ الآلي
  await page.evaluate((q) => document.querySelector(q).click(), '#main .recite button');
  assert.equal(await page.evaluate(() => !!audioEl && /audio\/quran\/16-18\.mp3$/.test(audioEl.src)), true);
  assert.equal(await page.evaluate(() => __said.length), 0);
  // 🔊 يقرأ الشرح وحده بلا الآية
  await page.click('#spkBtn');
  said = await page.evaluate(() => __said.join(' | '));
  assert.match(said, /ما معناها لنا اليوم/);
  assert.doesNotMatch(said, /قال الله تعالى|تعدوا|تحصوها/);
  // آية بلا أي مصدر: تُعرض مكتوبة مع سطر التنبيه، ولا نطق آلي لها
  assert.equal(await page.evaluate(async () => await QuranAudio.source('1:1')), null);
  // 3) بعد أن يرفع ولي الأمر تلاوة: يظهر زر الاستماع
  const key = await page.evaluate(async () => {
    const k = Object.keys(QURAN)[0];
    const wav = new Blob([await (await fetch('audio/quran/16-18.mp3')).arrayBuffer()], { type: 'audio/mpeg' });
    await QuranAudio.put(k, wav);
    // ملف صوتي بالاسم فقط (لا يُشغَّل) يُرفض ولا يحجب التلاوة المرفقة
    await assert_rejects(() => QuranAudio.put(k, new Blob([new Uint8Array(4096)], { type: 'audio/wav' })));
    await assert_rejects(() => QuranAudio.put(k, new Blob(['x'], { type: 'text/plain' })));
    await assert_rejects(() => QuranAudio.put('bad', wav));
    async function assert_rejects(f) { let ok = false; try { await f(); } catch { ok = true; } if (!ok) throw new Error('expected rejection'); }
    return k;
  });
  assert.equal(await page.evaluate(async (k) => (await QuranAudio.source(k)).from, key), 'parent');
  // 4) شاشة ولي الأمر تعرض الآيات وحالتها، والحذف يحتاج فتح القفل
  await page.evaluate(() => Atlas.setPin('2468'));
  await go(page, 'review.html');
  await page.evaluate(() => Atlas.unlock('2468'));
  await page.evaluate(() => render());
  await page.waitForSelector('#quranList .qrow', { state: 'attached' });
  const rows = await page.locator('#quranList .qrow').count();
  assert.equal(rows, await page.evaluate(() => Object.keys(QURAN).length));
  await page.evaluate(() => { document.getElementById('adv').open = true; document.getElementById('quranBox').open = true; });
  assert.match(await page.locator(`#quranList .qrow[data-k="${key}"]`).innerText(), /تلاوة رفعتَها/);
  await page.locator(`#quranList .qrow[data-k="${key}"] [data-del]`).click();
  await page.waitForFunction((k) => !document.querySelector(`#quranList .qrow[data-k="${k}"] [data-del]`), key);
  assert.equal(await page.evaluate(async (k) => await QuranAudio.parent(k), key), null);
  // بعد حذف ما رفعه ولي الأمر تعود الآية إلى التلاوة المرفقة بالتطبيق
  assert.equal(await page.evaluate(async (k) => (await QuranAudio.source(k)).from, key), 'app');
  assert.deepEqual(errors, []);
  await context.close();
});

test('heart lesson trial: prediction and hypothesis are saved, shown back, and reach the parent screen', async () => {
  const { context, page, errors } = await open();
  await child(page);
  await go(page, 'U03.L01.html');
  const order = await page.evaluate(() => SCENES.map((s) => s.id));
  const at = (id) => order.indexOf(id);
  assert.ok(at('hook') < at('exp') && at('exp') < at('compare') && at('compare') < at('E1') && at('E8') < at('exp_result') && at('exp_result') < at('U03.L01.C1'), order.join(' '));
  await page.evaluate(() => show(SCENES.findIndex((s) => s.id === 'hook')));
  assert.equal(await page.locator('#nextBtn').isDisabled(), true);
  assert.equal(await page.locator('#run').count(), 0); // لا عرض يكشف الجواب قبل التوقّع
  // قبل الشرح: «القلب» يُعرَّف تعريفاً محايداً، والبطاقة التي تقول ماذا يفعل مؤجَّلة إلى أول مشهد شرح
  const pre = await page.evaluate(() => { const out = []; const e1 = SCENES.findIndex((s) => s.id === 'E1'); for (let i = 0; i < e1; i++) { show(i, 1); out.push([SCENES[i].id, !!document.querySelector('#main [data-def="heart"][data-brief]'), !!document.querySelector('#main [data-def="heart"]:not([data-brief])')]); } show(SCENES.findIndex((s) => s.id === 'hook')); return out; });
  assert.ok(pre.some((x) => x[1]), 'تعريف موجز يظهر قبل الشرح: ' + JSON.stringify(pre));
  assert.ok(pre.every((x) => !x[2]), 'لا بطاقة كاملة قبل الشرح: ' + JSON.stringify(pre));
  await page.locator('.opt[data-i="2"]').click();
  assert.equal(await page.evaluate(() => store.get('predict', null)), 2);
  // قياس لا يُظهر زيادة: لا يُسأل «لماذا زاد؟»، بل يُفحص القياس — إعادة أو أرقام مرجعية
  await page.evaluate(() => { store.set('pulse', { rest: 84, move: 86, recover: 84 }); show(SCENES.findIndex((s) => s.id === 'compare')); });
  assert.match(await page.locator('#main').innerText(), /لم يُظهر زيادة واضحة/);
  assert.equal(await page.locator('[data-h]').count(), 0);
  assert.equal(await page.locator('#nextBtn').isDisabled(), true);
  await page.locator('#back').click();
  assert.equal(await page.evaluate(() => SCENES[idx].id), 'exp');
  // مخرج لمن لم يجد نبضه: بدائل ثم أرقام طفل آخر، موسومة بأنها ليست قياسه
  await page.locator('#nopulse').click();
  await page.locator('#useref').click();
  assert.equal(await page.evaluate(() => store.get('pulseAlt', null)), true);
  assert.equal(await page.locator('#nextBtn').isDisabled(), false);
  await page.evaluate(() => show(SCENES.findIndex((s) => s.id === 'compare')));
  assert.match(await page.locator('#main').innerText(), /أرقام سالم/);
  await page.evaluate(() => { show(SCENES.findIndex((s) => s.id === 'E1')); });
  assert.equal(await page.locator('#main [data-def="heart"]:not([data-brief])').count(), 1);
  await page.evaluate(() => { store.set('pulseAlt', false); store.set('pulse', { rest: 84, move: 128, recover: 92 }); show(SCENES.findIndex((s) => s.id === 'compare')); });
  assert.match(await page.locator('#main').innerText(), /دقات أبطأ/);
  assert.match(await page.locator('#main').innerText(), /خالف توقّع/);
  assert.equal(await page.locator('#nextBtn').isDisabled(), true);
  await page.locator('[data-h="1"]').click();
  assert.equal(await page.evaluate(() => store.get('hypo', null)), 1);
  await page.evaluate(() => show(SCENES.findIndex((s) => s.id === 'exp_result')));
  assert.match(await page.locator('#main').innerText(), /لأن القلب تعب/);
  assert.match(await page.locator('#main').innerText(), /القلب لم يتعب/);
  await page.evaluate(() => mark('U03.L01.P1', true)); // الدرس يظهر لولي الأمر بعد أول إجابة
  // قائمة الفرضيات في شاشة ولي الأمر تطابق قائمة الدرس
  const fs2 = require('node:fs'), path2 = require('node:path');
  const src = fs2.readFileSync(path2.join(ROOT, 'scenes/U03.L01.js'), 'utf8'), rev = fs2.readFileSync(path2.join(ROOT, 'review.html'), 'utf8');
  const list = (t, name) => JSON.stringify(eval(t.match(new RegExp('const ' + name + ' ?= ?(\\[[^\\]]*\\])'))[1]));
  assert.equal(list(src, 'HYP'), list(rev, 'HYPO'));
  await page.evaluate(() => Atlas.setPin('2468'));
  await go(page, 'review.html#U03');
  await page.evaluate(() => Atlas.unlock('2468'));
  await page.evaluate(() => { render(); document.querySelectorAll('details.les').forEach((d) => d.open = true); });
  const txt = await page.locator('#body').innerText();
  assert.match(txt, /توقّعه قبل القياس: «دقات أبطأ»/);
  assert.match(txt, /راحة 84، بعد الحركة 128/);
  assert.match(txt, /فرضيته في السبب: «لأن القلب تعب»/);
  assert.deepEqual(errors, []);
  await context.close();
});

test('moving real joints: elbow, hip and knee pieces rotate about the measured centres', async () => {
  const { context, page, errors } = await open();
  await child(page);
  await go(page, 'U02.L02.html');
  await page.evaluate(() => show(SCENES.findIndex((s) => s.id === 'E2')));
  const set = (sel, v) => page.evaluate(([sel, v]) => { const e = document.querySelector(sel); e.value = v; e.dispatchEvent(new Event('input')); }, [sel, v]);
  assert.equal(await page.locator('#h2 image[href="img/sv-elbow-b.webp"]').count(), 1);
  assert.equal(await page.locator('#b2 image[href="img/sv-hip-femur.webp"]').count(), 1);
  await set('#hg', 90);
  assert.equal(await page.evaluate(() => document.querySelector('#h2').style.transform), 'rotate(-90deg)');
  assert.equal(await page.evaluate(() => document.querySelector('#h2').style.transformOrigin), '241px 734px');
  await set('#ba', 60); await set('#br', 90);
  assert.equal(await page.evaluate(() => document.querySelector('#b2').style.transform), 'rotate(-60deg)');
  assert.equal(await page.locator('#nextBtn').isDisabled(), false);
  await page.evaluate(() => show(SCENES.findIndex((s) => s.id === 'E4')));
  const len = () => page.evaluate(() => { const g = (c) => document.querySelector('#knee .' + c).getAttribute('d').match(/-?[\d.]+/g).map(Number); const [a, b, c, d] = g('l2'); return Math.hypot(c - a, d - b); });
  await set('#kg', 0); const l0 = await len();
  await set('#kg', 120); const l1 = await len();
  assert.ok(Math.abs(l0 - l1) < 1, `الرباط الجانبي عند محور الدوران لا يتغير طوله: ${l0} ← ${l1}`);
  assert.equal(await page.evaluate(() => document.querySelector('#kn').style.transform), 'rotate(84deg)');
  assert.equal(await page.evaluate(() => document.querySelector('#knee .l1').getAttribute('stroke')), '#2BB3A3');
  // الثني كله آمن حتى آخره: المنزلق ينتهي عند 150 والأربطة تبقى خضراء، والتالي ينتظر تجربة حركة لا تصنعها الركبة
  await set('#kg', 190);
  assert.equal(await page.evaluate(() => document.querySelector('#kg').value), '150');
  assert.equal(await page.evaluate(() => document.querySelector('#kn').style.transform), 'rotate(105deg)');
  assert.equal(await page.evaluate(() => document.querySelector('#knee .l1').getAttribute('stroke')), '#2BB3A3');
  assert.match(await page.locator('#fb').innerText(), /آمن/);
  assert.equal(await page.locator('#nextBtn').isDisabled(), true);
  // الخطر: المدّ بعد الاستقامة، والثني إلى الجانب، واللفّ والقدم ثابتة
  await page.evaluate((q) => document.querySelector(q).click(), '[data-bad="hyper"]');
  assert.match(await page.evaluate(() => document.querySelector('#kn').style.transform), /^rotate\(-/);
  assert.equal(await page.evaluate(() => document.querySelector('#knee .l1').getAttribute('stroke')), '#D9483B');
  assert.match(await page.locator('#fb').innerText(), /خطر/);
  await page.evaluate((q) => document.querySelector(q).click(), '[data-bad="side"]');
  assert.equal(await page.evaluate(() => document.querySelector('#kfront').hidden), false);
  assert.equal(await page.evaluate(() => document.querySelector('#kshin').style.transform), 'rotate(-18deg)');
  await page.evaluate((q) => document.querySelector(q).click(), '[data-bad="twist"]');
  assert.equal(await page.evaluate(() => document.querySelector('#kl2').getAttribute('stroke')), '#D9483B');
  assert.equal(await page.locator('#nextBtn').isDisabled(), false);
  assert.deepEqual(errors, []);
  await context.close();
});

test('every verse in the registry ships with a recitation file', () => {
  const V = JSON.parse(fs.readFileSync(path.join(ROOT, '../../quran/verses.json'), 'utf8'));
  for (const k of Object.keys(V)) {
    const f = path.join(ROOT, 'audio/quran', k.replace(':', '-') + '.mp3');
    assert.ok(fs.existsSync(f), 'تلاوة ناقصة: ' + k);
    const b = fs.readFileSync(f);
    assert.ok(b.length > 20000 && ((b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33) || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0)), 'ليس mp3 صالحاً: ' + k);
  }
});

test('a lesson resumes on the same scene by id, never on the closing scene of an unfinished lesson', async () => {
  const { context, page, errors } = await open();
  await child(page);
  await go(page, 'U03.L01.html');
  const info = await page.evaluate(() => { const i = SCENES.findIndex((s) => s.id === 'E2'); show(i, 1); return { i, end: SCENES.findIndex((s) => s.id === 'end'), sid: store.get('sceneId', null) }; });
  assert.equal(info.sid, 'E2');
  // ترتيب المشاهد تغيّر بين إصدارين: الرقم القديم يشير إلى مشهد آخر، والمعرّف يعيد إلى المشهد نفسه
  await page.evaluate((n) => store.set('scene', n), info.i + 5);
  await go(page, 'index.html'); await go(page, 'U03.L01.html');
  await page.waitForFunction(() => typeof idx !== 'undefined' && document.querySelector('#main .scene'));
  assert.equal(await page.evaluate(() => SCENES[idx].id), 'E2');
  // موضع محفوظ على مشهد الختام والدرس لم يكتمل: لا يُفتح الختام
  await page.evaluate(() => { store.set('sceneId', 'end'); store.set('finished', false); });
  await go(page, 'index.html'); await go(page, 'U03.L01.html');
  await page.waitForFunction(() => typeof idx !== 'undefined' && document.querySelector('#main .scene'));
  assert.notEqual(await page.evaluate(() => SCENES[idx].id), 'end');
  assert.deepEqual(errors, []);
  await context.close();
});

test('a backup leaves out values that restore would reject, so the file always restores', async () => {
  const { context, page, errors } = await open();
  await child(page);
  await go(page, 'index.html');
  const res = await page.evaluate(async () => {
    await Atlas.setPin('2468');
    Atlas.storage.setItem('atlas:U03.L01:stars', '2');
    Atlas.storage.setItem('atlas:U03.L01:pulse', JSON.stringify({ rest: -5 })); // قراءة سالبة: لا تجتاز فحص الاستعادة
    const b = await Atlas.backup();
    const skipped = Atlas.backupSkipped();
    const n = await Atlas.restore(JSON.stringify(b));
    return { skipped, n, stars: Atlas.storage.getItem('atlas:U03.L01:stars'), pulse: Atlas.storage.getItem('atlas:U03.L01:pulse') };
  });
  assert.deepEqual(res.skipped, ['atlas:U03.L01:pulse']);
  assert.equal(res.n, 1);
  assert.equal(res.stars, '2');
  assert.equal(res.pulse, null);
  await context.close();
});

test('the validator rejects verse wording outside the verse marks, gender markers inside a hadith, partial hadith quotes and hand-typed verses', () => {
  const { execFileSync } = require('node:child_process');
  const os = require('node:os');
  const repo = path.resolve(__dirname, '..');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'val-'));
  fs.cpSync(path.join(repo, 'lessons'), path.join(tmp, 'lessons'), { recursive: true });
  for (const d of ['tools', 'quran', 'hadith', 'schema', 'package.json']) if (fs.existsSync(path.join(repo, d))) fs.cpSync(path.join(repo, d), path.join(tmp, d), { recursive: true });
  fs.symlinkSync(path.join(repo, 'node_modules'), path.join(tmp, 'node_modules'));
  const run = () => { try { execFileSync('node', ['tools/validate.mjs', ...fs.readdirSync(path.join(tmp, 'lessons')).filter((x) => x.endsWith('.json')).map((x) => 'lessons/' + x)], { cwd: tmp, stdio: 'pipe' }); return ''; } catch (e) { return String(e.stdout) + String(e.stderr); } };
  assert.equal(run(), '');
  const f = path.join(tmp, 'lessons/U03.L01.json'), orig = fs.readFileSync(f, 'utf8');
  const L = JSON.parse(orig); L.flow.hook.text += ' وإن تعدوا نعمة الله لا تحصوها'; fs.writeFileSync(f, JSON.stringify(L, null, 2));
  assert.notEqual(run(), '');
  const L2 = JSON.parse(orig); L2.flow.hook.text += ' قال النبي ﷺ: «كل{|ي} بيمينك{|ِ}»'; fs.writeFileSync(f, JSON.stringify(L2, null, 2));
  assert.notEqual(run(), '');
  // جزء من حديث بين «» بعد ذكر النبي ﷺ أو قبل الإحالة إلى مصدره يُرفض؛ والمتن الكامل من السجل يُقبل
  const L3 = JSON.parse(orig); L3.life_application[0].why += ' قال النبي ﷺ: «الطهور شطر الإيمان».'; fs.writeFileSync(f, JSON.stringify(L3, null, 2));
  assert.match(run(), /ليس متناً كاملاً/);
  const L3b = JSON.parse(orig); L3b.life_application[0].why += ' «الدين النصيحة» (مسلم 55).'; fs.writeFileSync(f, JSON.stringify(L3b, null, 2));
  assert.match(run(), /ليس متناً كاملاً/);
  const L4 = JSON.parse(orig); L4.life_application[0].why += ' قال النبي ﷺ: «ما أنزل الله داء إلا أنزل له شفاء».'; fs.writeFileSync(f, JSON.stringify(L4, null, 2));
  assert.equal(run(), '');
  // مفتاح حديث غير موجود، وآية مكتوبة يدوياً خارج كتلة الإيمان، ومتن الختام يخالف السجل
  const L5 = JSON.parse(orig); L5.life_application[0].hadith = ['bukhari:0']; fs.writeFileSync(f, JSON.stringify(L5, null, 2));
  assert.match(run(), /غير موجود في سجل الأحاديث/);
  const L6 = JSON.parse(orig); L6.life_application[0].why += ' ﴿وفي أنفسكم أفلا تبصرون﴾'; fs.writeFileSync(f, JSON.stringify(L6, null, 2));
  assert.match(run(), /آية مكتوبة في نص الدرس/);
  const L7 = JSON.parse(orig); L7.faith.closing.text = L7.faith.closing.text.replace('فإن لجسدك عليك حقا،', ''); fs.writeFileSync(f, JSON.stringify(L7, null, 2));
  assert.match(run(), /المتن يخالف السجل/);
  // الدفعة 6: خيار خاطئ بلا ردّ، وهدف بلا سؤال عودة، وبند مغلق بلا بديل — أخطاء
  const L8 = JSON.parse(orig); const it8 = L8.assessment.items.find((x) => x.type === 'choose' && x.feedback_by_option);
  delete it8.feedback_by_option[Object.keys(it8.feedback_by_option)[0]]; fs.writeFileSync(f, JSON.stringify(L8, null, 2));
  assert.match(run(), /خيارات خاطئة بلا ردّ/);
  const L9 = JSON.parse(orig); const o9 = L9.assessment.delayed_recall[0].objective; L9.assessment.delayed_recall = L9.assessment.delayed_recall.filter((d) => d.objective !== o9); fs.writeFileSync(f, JSON.stringify(L9, null, 2));
  assert.match(run(), /هدف بلا سؤال في «عودة الذاكرة»/);
  const L10 = JSON.parse(orig); delete L10.assessment.items.find((x) => x.alt).alt; fs.writeFileSync(f, JSON.stringify(L10, null, 2));
  assert.match(run(), /بلا بند بديل/);
  const L11 = JSON.parse(orig); const it11 = L11.assessment.items.find((x) => x.alt && x.type === 'choose'); it11.alt.prompt = it11.prompt; fs.writeFileSync(f, JSON.stringify(L11, null, 2));
  assert.match(run(), /السؤال نفسه لا بديل/);
  fs.writeFileSync(f, orig);
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('the parent screen never reports «no mistakes» or a mastery verdict for questions the child has not answered', async () => {
  const { context, page, errors } = await open();
  await child(page);
  await go(page, 'index.html');
  await page.evaluate(() => Atlas.setPin('2468'));
  await go(page, 'review.html');
  // درس له أربعة بنود «أتحقق» مغلقة على الأقل في المستوى أ، ودرس له أقل
  const plan = await page.evaluate(() => {
    const closedA = (L) => L.checks.filter((c) => c.level !== 'B' && !c.open).map((c) => c.id);
    const big = REVIEW.find((L) => closedA(L).length >= 4), small = REVIEW.find((L) => closedA(L).length < 4 && L.unit !== big.unit);
    return { big: big.id, unit: big.unit, checks: closedA(big), small: small.id, sunit: small.unit };
  });
  const view = async (unit) => {
    await go(page, 'index.html');
    await go(page, 'review.html#' + unit);
    await page.evaluate(() => Atlas.unlock('2468'));
    await page.evaluate(() => { render(); document.querySelectorAll('details.les').forEach((d) => d.open = true); });
    return page.locator('#body').innerText();
  };
  // بدأ الدرس ولم يُجب عن شيء
  await page.evaluate(([a, b]) => { Atlas.storage.setItem(`atlas:${a}:scene`, '5'); Atlas.storage.setItem(`atlas:${b}:scene`, '5'); }, [plan.big, plan.small]);
  let txt = await view(plan.unit);
  assert.match(txt, /لم يُجب عن أي سؤال بعد/);
  assert.doesNotMatch(txt, /لا أخطاء في المحاولة الأولى/);
  assert.match(txt, new RegExp(`أجاب عن 0 من ${plan.checks.length} — لا حكم قبل أن يُكملها`));
  assert.doesNotMatch(txt, /— متقن|— دون 80%/);
  assert.match(txt, /—\nصواب من أول محاولة \(0 من 0 أجاب عنها؛ بقي \d+\)/);
  // بند واحد صحيح من أول محاولة: لا حكم بعد
  await page.evaluate(([l, id]) => Atlas.storage.setItem(`atlas:${l}:progress`, JSON.stringify({ [id]: { ok: true, firstAttempt: true } })), [plan.big, plan.checks[0]]);
  txt = await view(plan.unit);
  assert.match(txt, new RegExp(`أجاب عن 1 من ${plan.checks.length} — لا حكم`));
  assert.doesNotMatch(txt, /لم يُجب عن أي سؤال بعد/);
  // البنود كلها مجابة: يظهر الحكم
  await page.evaluate(([l, ids]) => { const p = {}; ids.forEach((id) => { p[id] = { ok: true, firstAttempt: true }; }); Atlas.storage.setItem(`atlas:${l}:progress`, JSON.stringify(p)); }, [plan.big, plan.checks]);
  txt = await view(plan.unit);
  assert.match(txt, new RegExp(`أتحقق: ${plan.checks.length}/${plan.checks.length} — متقن`));
  // أقل من أربعة بنود: لا حكم بالإتقان أصلاً
  txt = await view(plan.sunit);
  assert.match(txt, /بنود أقل من أن يُحكم بها/);
  assert.doesNotMatch(txt, /0\/0 — متقن/);
  assert.deepEqual(errors, []);
  await context.close();
});

test('in a verse scene 🔊 reads only the explanation, ▶ plays the recitation, and a parent file that fails to play falls back to the bundled recitation', async () => {
  const { context, page, errors } = await open();
  await context.addInitScript(() => {
    window.__said = [];
    const S = window.SpeechSynthesisUtterance;
    window.SpeechSynthesisUtterance = function (t) { window.__said.push(String(t)); return new S(t); };
  });
  await child(page);
  await go(page, 'U04.L02.html');
  const verseScene = async () => page.evaluate(() => { for (const sc of SCENES.filter((s) => /^faith_/.test(s.id))) { show(SCENES.indexOf(sc)); if (document.querySelector('#main .quran, #main .quran-plain')) return sc.id; } return null; });
  // مشهد قبله، ثم مشهد الآية: 🔊 يقرأ شرح مشهد الآية لا شرح المشهد السابق، ولا يشغّل التلاوة
  await page.evaluate(() => { show(1); __said.length = 0; });
  assert.ok(await verseScene());
  await page.waitForSelector('#main .recite button');
  await page.click('#spkBtn');
  const said = await page.evaluate(() => __said.join(' | '));
  assert.match(said, /ما معناها لنا اليوم/);
  assert.doesNotMatch(said, /تعدوا|تحصوها/);
  assert.equal(await page.evaluate(() => !audioEl), true, '🔊 لا يشغّل التلاوة');
  await page.evaluate((q) => document.querySelector(q).click(), '#main .recite button');
  assert.equal(await page.evaluate(() => !!audioEl && /audio\/quran\/16-18\.mp3$/.test(audioEl.src)), true, '▶ يشغّل التلاوة المرفقة');
  // ملف ولي أمر محفوظ ثم تعطّل: ▶ يرجع إلى تلاوة التطبيق ويشغّلها
  await page.evaluate(async () => {
    await QuranAudio.parent('16:18'); // يُنشئ القاعدة بمخططها
    await new Promise((res, rej) => { const r = indexedDB.open('atlas-quran', 1); r.onsuccess = () => { const db = r.result, t = db.transaction('audio', 'readwrite'); t.objectStore('audio').put(new Blob([new Uint8Array(4096)], { type: 'audio/wav' }), '16:18'); t.oncomplete = () => { db.close(); res(); }; t.onerror = () => rej(t.error); }; r.onerror = () => rej(r.error); });
  });
  assert.equal(await page.evaluate(async () => (await QuranAudio.source('16:18')).from), 'parent');
  await page.evaluate(() => { if (audioEl) audioEl.pause(); show(0); __said.length = 0; });
  assert.ok(await verseScene());
  await page.waitForSelector('#main .recite button');
  await page.evaluate(() => { __said.length = 0; });
  await page.evaluate((q) => document.querySelector(q).click(), '#main .recite button');
  await page.waitForFunction(() => !!audioEl && /audio\/quran\/16-18\.mp3$/.test(audioEl.src), null, { timeout: 10000 });
  await page.waitForTimeout(600);
  assert.equal(await page.evaluate(() => !!audioEl && /audio\/quran\/16-18\.mp3$/.test(audioEl.src) && !audioEl.paused), true, 'التلاوة البديلة مستمرة');
  assert.equal(await page.evaluate(() => __said.length), 0, 'لا نطق آلي فوق التلاوة البديلة');
  assert.deepEqual(errors.filter((e) => !/play\(\)|NotSupportedError|no supported source/i.test(e)), []);
  await context.close();
});

/* ===== الدفعات 3–5 من الوثيقة 19 (12 نوفمبر 2026) ===== */
const spy = (context) => context.addInitScript(() => {
  window.__utt = [];
  const S = window.SpeechSynthesisUtterance;
  window.SpeechSynthesisUtterance = function (t) { const u = new S(t); window.__utt.push(u); return u; };
});
const saidText = (page) => page.evaluate(() => __utt.map((u) => u.text).join(' | '));

test('reading policy: a scene opens silently, 🔊 reads it, every option has its own speaker that does not choose it, and feedback is spoken', async () => {
  const { context, page, errors } = await open();
  await spy(context);
  await child(page);
  await go(page, 'U02.L03.html');
  // مشهد شرح: لا نطق عند الفتح، و🔊 يقرأ نص المشهد
  const e = await page.evaluate(() => SCENES.findIndex((s) => LD.explain.some((x) => x.id === s.id) && !CUSTOM.replace?.[s.id]));
  await page.evaluate((k) => { __utt.length = 0; show(k); }, e);
  await page.waitForTimeout(300);
  assert.equal(await saidText(page), '', 'لا قراءة تلقائية عند فتح المشهد');
  await page.click('#spkBtn');
  assert.ok((await saidText(page)).length > 20, '🔊 يقرأ المشهد');
  // سؤال اختيار: سماعة لكل خيار، تقرأ الخيار ولا تختاره
  const qs = await page.evaluate(() => SCENES.map((s, k) => [s.id, k]).filter(([id]) => LD.practice.some((p) => p.id === id && p.type === 'choose') && !CUSTOM.replace?.[id]).map(([, k]) => k));
  assert.ok(qs.length >= 2);
  await page.evaluate((k) => { __utt.length = 0; show(k); }, qs[0]);
  await page.waitForTimeout(300);
  assert.equal(await saidText(page), '', 'لا يُقرأ السؤال ولا الخيارات عند الفتح');
  const opts = await page.locator('#main button.opt[data-i]').count();
  assert.ok(opts >= 2);
  assert.equal(await page.locator('#main .optrow:has(> button.opt[data-i]) > button.say1').count(), opts, 'سماعة بجانب كل خيار، زراً مستقلاً لا داخل الخيار (المراجعة 20، ن-14)');
  assert.equal(await page.locator('#main button.opt .say1').count(), 0);
  const text = await page.evaluate(() => { const b = document.querySelector('#main button.opt[data-i]'); b.parentElement.querySelector('.say1').click(); return b.innerText.trim(); });
  assert.ok((await saidText(page)).includes(text.slice(0, 12)), 'السماعة تقرأ الخيار');
  assert.equal(await page.evaluate(() => progress[SCENES[idx].id]), undefined, 'السماعة لا تختار');
  assert.equal(await page.evaluate(() => document.querySelectorAll('#main .opt.ok, #main .opt.bad').length), 0);
  // الردّ على الإجابة يُقرأ تلقائياً؛ والنجمة لا تُعطى بعد خطأ
  const before = await page.evaluate(() => stars);
  await page.evaluate(() => { __utt.length = 0; const p = LD.practice.find((x) => x.id === SCENES[idx].id); [...document.querySelectorAll('#main button.opt[data-i]')].find((b) => +b.dataset.i !== p.answer).click(); });
  await page.waitForFunction(() => __utt.length > 0);
  assert.match(await saidText(page), /ليس هذا/);
  await page.evaluate(() => { const p = LD.practice.find((x) => x.id === SCENES[idx].id); document.querySelector(`#main button.opt[data-i="${p.answer}"]`).click(); });
  // بعد خطأ: «صحيح الآن» لا «أحسنت» (البند 36)
  assert.match(await saidText(page), /صحيح الآن/);
  assert.doesNotMatch(await saidText(page), /أحسنت/);
  assert.equal(await page.evaluate(() => stars), before, 'لا نجمة بعد خطأ في المشهد');
  // إجابة صحيحة من أول محاولة: نجمة
  await page.evaluate((k) => show(k), qs[1]);
  await page.waitForTimeout(100);
  await page.evaluate(() => { __utt.length = 0; const p = LD.practice.find((x) => x.id === SCENES[idx].id); document.querySelector(`#main button.opt[data-i="${p.answer}"]`).click(); });
  assert.match(await saidText(page), /أحسنت/, 'المديح للإصابة من أول محاولة');
  assert.equal(await page.evaluate(() => stars), before + 1);
  assert.deepEqual(errors, []);
  await context.close();
});

test('stars: a miss noted in an activity blocks its star, even after leaving and coming back', async () => {
  const { context, page, errors } = await open();
  await child(page);
  await go(page, 'U02.L03.html');
  const s0 = await page.evaluate(() => stars);
  await page.evaluate(() => { show(2); noteMiss(); award(); });
  assert.equal(await page.evaluate(() => stars), s0);
  await page.evaluate(() => { show(3); show(2); award(); });
  assert.equal(await page.evaluate(() => stars), s0, 'الخطأ محفوظ للمشهد');
  await page.evaluate(() => { show(3); award(); });
  assert.equal(await page.evaluate(() => stars), s0 + 1, 'مشهد بلا خطأ يعطي نجمته');
  assert.deepEqual(errors, []);
  await context.close();
});

test('a new term shows its English name with a speaker that reads the English term only', async () => {
  const { context, page, errors } = await open();
  await spy(context);
  await child(page);
  await go(page, 'U03.L01.html');
  const id = await page.evaluate(() => { for (let k = 0; k < SCENES.length; k++) { show(k); const b = document.querySelector('#main [data-term]'); if (b) return b.dataset.term; } return null; });
  assert.ok(id, 'مشهد فيه بطاقة مصطلح');
  const en = await page.evaluate((i) => TERMS.find((t) => t.id === i).en, id);
  assert.equal(await page.locator(`#main [data-term="${id}"]`).first().evaluate((b) => b.previousElementSibling?.textContent), en);
  await page.evaluate((i) => { __utt.length = 0; document.querySelector(`#main [data-term="${i}"]`).click(); }, id);
  assert.deepEqual(await page.evaluate(() => __utt.map((u) => ({ text: u.text, lang: u.lang }))), [{ text: en, lang: 'en-US' }]);
  assert.deepEqual(errors, []);
  await context.close();
});

test('liver day: blood sugar stays in range all day, the liver makes new sugar when its store runs low, and the day completes', async () => {
  const { context, page, errors } = await open();
  await child(page);
  await go(page, 'U06.L03.html');
  await page.evaluate(() => show(SCENES.findIndex((s) => s.id === 'E4')));
  assert.equal(await page.locator('#nextBtn').isDisabled(), true);
  await page.evaluate(() => document.getElementById('night').click());
  await page.evaluate(() => document.getElementById('night').click());
  assert.match(await page.locator('#src').innerText(), /يصنع سكراً جديداً/);
  await page.evaluate(() => document.getElementById('night').click());
  const ys = await page.evaluate(() => document.getElementById('lline').getAttribute('points').trim().split(/\s+/).map((p) => +p.split(',')[1]));
  assert.ok(ys.length >= 20 && ys.every((y) => y >= 22 && y <= 84), 'السكر داخل المدى: ' + ys.join(' '));
  assert.match(await page.locator('#fb').innerText(), /بقي في مداه/);
  assert.equal(await page.locator('#nextBtn').isDisabled(), false);
  assert.deepEqual(errors, []);
  await context.close();
});

test('hadith come from the registry in full with their narrator; a verse in «in my life» is a full registry card that is recited, never spoken', async () => {
  const H = JSON.parse(fs.readFileSync(path.join(ROOT, '../../hadith/registry.json'), 'utf8'));
  const { context, page, errors } = await open();
  await spy(context);
  await child(page);
  await go(page, 'U05.L01.html');
  await page.evaluate(() => { __utt.length = 0; show(SCENES.findIndex((s) => s.id === 'life')); });
  await page.waitForSelector('#main .vcard[data-key="51:21"] .recite button');
  assert.equal((await page.locator('#main .vcard .lead').innerText()).trim(), 'قال الله تعالى:');
  assert.equal((await page.locator('#main .hadith .lead').first().innerText()).trim(), H['muslim:intro-5'].lead);
  assert.equal((await page.locator('#main .hadith .txt').first().innerText()).trim(), '«' + H['muslim:intro-5'].text + '»');
  assert.equal(await saidText(page), '');
  assert.equal(await page.evaluate(() => !audioEl), true, 'لا تلاوة تلقائية');
  await page.click('#spkBtn');
  const s = await saidText(page);
  assert.match(s, /كفى بالمرء كذباً/);
  assert.match(s, /صلى الله عليه وسلم/);
  assert.doesNotMatch(s, /أنفسكم|تبصرون|ﷺ/);
  // رواية فيها كلام الصحابي: الراوي مسمّى، ولا تسبقها «قال رسول الله ﷺ» مرة ثانية
  await go(page, 'U03.L01.html');
  await page.evaluate(() => show(SCENES.findIndex((s) => s.id === 'faith_closing')));
  assert.equal((await page.locator('#main .verse .lead').first().innerText()).trim(), H['bukhari:1975'].lead);
  assert.match((await page.locator('#main .verse .txt').first().innerText()).trim(), /^قال لي رسول الله/);
  // كل بطاقة حديث في «في حياتي» في كل الدروس من السجل بمتنها الكامل
  for (const f of fs.readdirSync(path.join(ROOT, '../../lessons')).filter((x) => x.endsWith('.json'))) {
    const L = JSON.parse(fs.readFileSync(path.join(ROOT, '../../lessons', f), 'utf8'));
    for (const a of L.life_application || []) for (const k of a.hadith || []) assert.ok(H[k]?.text && !/…/.test(H[k].text), f + ': ' + k);
  }
  assert.deepEqual(errors, []);
  await context.close();
});

test('teacher books: a hadith opening is never printed as a verse, cards carry the full text, the rub el hizb sits outside the brackets, and no verse goes to the voice recorder', () => {
  const { execFileSync } = require('node:child_process');
  const os = require('node:os');
  const repo = path.resolve(__dirname, '..');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gen-'));
  // المولّد يقرأ من شيفرة التطبيق ما يعرضه في بنود «حدّد على الجسم» (المراجعة 20، إ-1)، وبصمة النص المسموع وعبارات الواجهة (ن-20)
  for (const d of ['tools', 'quran', 'hadith', 'lessons', 'package.json', 'app/v2/lesson-runtime.js', 'app/v2/engine.js', 'app/v2/audio-key.js', 'app/v2/scenes']) fs.cpSync(path.join(repo, d), path.join(tmp, d), { recursive: true });
  for (const id of ['U04.L01', 'U05.L01', 'U03.L04', 'U05.L03']) execFileSync('node', ['tools/generate.mjs', `lessons/${id}.json`], { cwd: tmp, stdio: 'pipe' });
  const read = (id, f) => fs.readFileSync(path.join(tmp, 'build', id, f), 'utf8');
  const t1 = read('U04.L01', 'teacher.md');
  assert.match(t1, /^\*\*افتتاح:\*\* عن ابن عباس رضي الله عنهما قال: قال النبي ﷺ: «نعمتان/m);
  assert.doesNotMatch(t1, /سورة البخاري|﴿نعمتان/);
  const t2 = read('U05.L01', 'teacher.md');
  assert.match(t2, /- \*\*الآية:\*\* قال الله تعالى: .*﴿وَفِىٓ أَنفُسِكُمْ/);
  assert.match(t2, /- \*\*الحديث:\*\* عن أبي هريرة رضي الله عنه، عن النبي ﷺ قال: «كفى بالمرء كذباً أن يحدّث بكل ما سمع» \(مسلم، المقدمة 5، حديث صحيح\)/);
  const t3 = read('U03.L04', 'teacher.md');
  assert.doesNotMatch(t3, /﴿۞/);
  assert.match(t3, /۞ ﴿وَإِلَىٰ ثَمُودَ/);
  const V = JSON.parse(fs.readFileSync(path.join(repo, 'quran/verses.json'), 'utf8'));
  for (const id of ['U03.L04', 'U05.L03']) { const r = read(id, 'recording-sheet.md'); for (const v of Object.values(V)) assert.ok(!r.includes(v.text), id + ': نص آية في قائمة التسجيل'); }
  // وفي قوائم المستودع كلها، والقائمة المشتركة: لا آية بنصها العثماني ولا الإملائي
  for (const d of fs.readdirSync(path.join(repo, 'build')).filter((x) => fs.existsSync(path.join(repo, 'build', x, 'recording-sheet.md')))) {
    const r = fs.readFileSync(path.join(repo, 'build', d, 'recording-sheet.md'), 'utf8');
    for (const [k, v] of Object.entries(V)) assert.ok(!(v.text && r.includes(v.text)) && !(v.emlaey && r.includes(v.emlaey)), `${d}: الآية ${k} في قائمة التسجيل`);
  }
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('the hinge joint is «الرزّي» everywhere a child or teacher reads it', () => {
  const repo = path.resolve(__dirname, '..');
  const bad = /المفصل المفصلي|مفصل مفصلي|المفصّلي/;
  for (const d of ['lessons', 'app/v2/scenes']) for (const f of fs.readdirSync(path.join(repo, d)).filter((x) => /\.(json|js)$/.test(x))) {
    const s = fs.readFileSync(path.join(repo, d, f), 'utf8');
    assert.doesNotMatch(s.replace(/"changelog"[\s\S]*?\]/, ''), bad, d + '/' + f);
  }
  assert.match(fs.readFileSync(path.join(repo, 'lessons/U02.L02.json'), 'utf8'), /الرزّي/);
});

test('tapping the middle of a short option chooses it; only the speaker at its edge reads it', async () => {
  const { context, page, errors } = await open();
  await spy(context);
  await child(page);
  await go(page, 'U05.L02.html');
  await page.evaluate(() => show(SCENES.findIndex((s) => s.id === 'exp')));
  const short = page.locator('[data-q="b"][data-v="1"]');
  const spkLoc = short.locator('xpath=..').locator('> .say1');
  assert.equal(await spkLoc.count(), 1);
  await page.evaluate(() => { __utt.length = 0; });
  await short.click();
  assert.match(await short.getAttribute('class'), /\bok\b/, 'لمسة الوسط تختار');
  const box = await short.boundingBox(), spk = await spkLoc.boundingBox();
  assert.ok(spk.x + spk.width < box.x + box.width / 2 || spk.x > box.x + box.width / 2, 'السماعة في نصف الخيار لا في وسطه');
  await page.evaluate(() => { __utt.length = 0; document.querySelector('[data-q="c"][data-v="0"]').parentElement.querySelector('.say1').click(); });
  assert.equal(await page.locator('[data-q="c"][data-v="0"]').getAttribute('class'), 'opt has-say', 'السماعة لا تختار');
  assert.match(await saidText(page), /زاد واحد فقط/);
  assert.deepEqual(errors, []);
  await context.close();
});

test('glossary words and drawing tools get no extra speaker: a glossary word is itself read in its own language', async () => {
  const { context, page, errors } = await open();
  await spy(context);
  await child(page);
  await go(page, 'U02.L03.html');
  await page.evaluate(() => show(SCENES.findIndex((s) => s.id === 'glossary')));
  assert.equal(await page.locator('#main .optrow:has([data-say]) .say1').count(), 0);
  await page.evaluate(() => { __utt.length = 0; document.querySelector('#main [data-say="en"]').click(); });
  assert.equal(await page.evaluate(() => __utt[0]?.lang), 'en-US');
  await page.evaluate(() => show(SCENES.findIndex((s) => s.id === 'draw')));
  assert.equal(await page.locator('#main .optrow:has([data-erase]) .say1').count(), 0);
  assert.deepEqual(errors, []);
  await context.close();
});

test('an open answer needs three real words, then a comparison with the model answer (text locked) and a self-rating that the parent sees', async () => {
  const { context, page, errors } = await open();
  await child(page);
  await go(page, 'U02.L03.html');
  const k = await page.evaluate(() => SCENES.findIndex((s) => s.id === 'U02.L03.C1'));
  assert.ok(k >= 0);
  await page.evaluate((k) => show(k), k);
  const id = await page.evaluate(() => SCENES[idx].id);
  await page.fill('#ans', 'ببببببب ججججج سسسس');
  assert.equal(await page.isDisabled('#cmp'), true, 'حروف مكررة ليست كلمات');
  assert.equal(await page.isDisabled('#nextBtn'), true);
  await page.fill('#ans', 'العظم حي لأنه ينمو');
  assert.equal(await page.isDisabled('#cmp'), false);
  assert.equal(await page.isDisabled('#nextBtn'), true, 'لا انتقال قبل المقارنة');
  await page.evaluate(() => document.querySelector('#cmp').click());
  assert.equal(await page.evaluate(() => document.querySelector('#ans').readOnly), true, 'ما كُتب يُقفل بعد رؤية النموذج');
  assert.equal(await page.isVisible('#modelBox'), true);
  assert.equal(await page.isDisabled('#nextBtn'), true, 'التقييم الذاتي قبل الانتقال');
  await page.evaluate(() => document.querySelector('[data-self="1"]').click());
  assert.equal(await page.isDisabled('#nextBtn'), false);
  assert.equal(await page.evaluate((i) => progress[i].self, id), 1);
  // بعد إعادة الفتح: النص مقفل والتقييم محفوظ
  await page.reload(); await page.evaluate(() => window.Atlas?.ready);
  await page.evaluate((k) => show(k), k);
  assert.equal(await page.evaluate(() => document.querySelector('#ans').readOnly), true);
  assert.equal(await page.isDisabled('#nextBtn'), false);
  // شاشة ولي الأمر تعرض تقييمه بجانب إجابته
  await page.evaluate(async () => { await Atlas.setPin('1357'); });
  await go(page, 'review.html#U02');
  assert.match(await page.textContent('body'), /بعد مقارنة إجابته بالنموذج قال إنه ذكر بعضها/);
  assert.deepEqual(errors, []);
  await context.close();
});

test('second attempt: after the test, only the missed closed items come back as new alternate items; its score is kept apart', async () => {
  const { context, page, errors } = await open();
  await child(page);
  await go(page, 'U01.T01.html');
  await page.evaluate(() => Atlas.storage.setItem('atlas:U01.L01:finished', 'true'));
  await go(page, 'U01.T01.html');
  // كل البنود المغلقة من المستوى أ: الأول خطأ والباقي صواب
  const ids = await page.evaluate(() => { const c = LD.items.filter((it) => forLevel(it) && !OPEN_TYPES.has(it.type)); c.forEach((it, k) => mark(it.id, k !== 0)); return c.map((it) => it.id); });
  await page.evaluate(() => show(SCENES.findIndex((s) => s.id === 'tend')));
  assert.match(await page.textContent('#main'), /محاولة ثانية/);
  const sc = await page.evaluate(() => store.get('score', null));
  assert.equal(sc.ok, ids.length - 1);
  // بوابة المحاولة الثانية لا تُتخطّى، وفيها البند الذي أخطأ فيه وحده
  const g = await page.evaluate(() => SCENES.findIndex((s) => s.id === 't2gate'));
  assert.equal(await page.evaluate((g) => SCENES[g].skip(), g), false);
  await page.evaluate((g) => show(g), g);
  assert.equal(await page.locator('#main .missed li').count(), 1);
  // المشاهد البديلة: البند الأول وحده
  const alts = await page.evaluate(() => SCENES.filter((s) => /\.alt$/.test(s.id) && !s.skip()).map((s) => s.id));
  assert.deepEqual(alts, [ids[0] + '.alt']);
  // البديل غير الأصل، ونتيجته محفوظة منفصلة ولا تغيّر نتيجة الاختبار
  await page.evaluate((id) => show(SCENES.findIndex((s) => s.id === id)), alts[0]);
  const it = await page.evaluate((id) => LD.items.find((x) => x.id === id), ids[0]);
  assert.notEqual(await page.textContent('#main h2'), it.prompt);
  await page.evaluate((id) => mark(id, true), alts[0]);
  await page.evaluate(() => show(SCENES.findIndex((s) => s.id === 't2end')));
  assert.deepEqual(await page.evaluate(() => { const s = store.get('score2', null); return s && { ok: s.ok, n: s.n }; }), { ok: 1, n: 1 });
  assert.deepEqual(await page.evaluate(() => store.get('score', null).ok), ids.length - 1);
  assert.deepEqual(errors, []);
  await context.close();
});
