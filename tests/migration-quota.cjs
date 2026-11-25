// اختبارات الترحيل قرب حد التخزين، وانقطاعه واستئنافه، ونسخة الإنقاذ، ونسيان رمز ولي الأمر، وحجم التسجيل.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '../app/v2');
const ORIGIN = 'https://atlas.test/';
const TYPES = {
  '.js': 'application/javascript', '.html': 'text/html', '.css': 'text/css',
  '.webp': 'image/webp', '.ttf': 'font/ttf', '.woff2': 'font/woff2',
};
let browser;

before(async () => {
  browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,
    args: [
      '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream',
      ...(process.env.CI ? ['--no-sandbox', '--disable-dev-shm-usage'] : []),
    ],
  });
});
after(async () => browser?.close());

/** سياق جديد يقدّم التطبيق من https://atlas.test/ (أصل آمن كما في أندرويد). */
async function open({ failRegistryWrites = false } = {}) {
  const context = await browser.newContext({ viewport: { width: 420, height: 860 }, acceptDownloads: true });
  await context.route(ORIGIN + '**', async (route) => {
    const rel = decodeURIComponent(new URL(route.request().url()).pathname).slice(1) || 'index.html';
    const file = path.resolve(ROOT, rel);
    if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file)) {
      return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>blank</title>' });
    }
    return route.fulfill({ body: fs.readFileSync(file), contentType: TYPES[path.extname(file)] || 'application/octet-stream' });
  });
  if (failRegistryWrites) {
    // محاكاة انقطاع الترحيل: أي كتابة لسجل الحسابات تفشل كما لو امتلأت المساحة أو أُغلق التطبيق قبلها
    await context.addInitScript(() => {
      const real = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k, v) {
        if (this === localStorage && k === 'atlas:accounts:v1' && sessionStorage.getItem('test:failRegistry') === '1') {
          throw new DOMException('simulated', 'QuotaExceededError');
        }
        return real.call(this, k, v);
      };
    });
  }
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(ORIGIN + 'blank');
  return { context, page, errors };
}

/** بيانات طفل من النسخة السابقة: تقدّم ودرسان منتهيان وتسجيلا إهداء كبيران بالمعدل الافتراضي القديم. */
async function seedLegacy(page, { audioChars = 1_700_000 } = {}) {
  return page.evaluate((audioChars) => {
    localStorage.clear();
    const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));
    set('atlas:profile', { name: 'سارة', gender: 'f' });
    set('atlas:U02.L01:finished', true);
    set('atlas:U02.L01:level', 'A');
    set('atlas:U02.L01:progress', { 'U02.L01.P1': { ok: false }, 'U02.L01.C1': { ok: true } });
    set('atlas:U02.L01:open_U02.L01.C3', 'العظم حي لأنه ينمو ويلتئم');
    set('atlas:U02.L02:finished', true);
    set('atlas:questions', [{ text: 'لماذا نتثاءب؟', date: '2026-10-28' }]);
    const b64 = (n) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      let s = '';
      for (let i = 0; i < n; i++) s += chars[(i * 7919) % 64];
      return s;
    };
    const audio = 'data:audio/webm;codecs=opus;base64,' + b64(audioChars);
    set('atlas:U01.unit:ded', { idea: 1, who: 'جدتي', audio });
    set('atlas:U02.unit:ded', { idea: 0, who: 'أمي', audio });
    const snapshot = {};
    let total = 0;
    for (const k of Object.keys(localStorage)) {
      snapshot[k] = localStorage.getItem(k);
      total += k.length + snapshot[k].length;
    }
    return { snapshot, total };
  }, audioChars);
}

const storageTotal = (page) =>
  page.evaluate(() => Object.keys(localStorage).reduce((n, k) => n + k.length + localStorage.getItem(k).length, 0));

/**
 * كل مفاتيح localStorage بقيمها المنطقية: الوسائط المنقولة إلى IndexedDB تُعاد إلى مكانها، فالمقارنة
 * تثبت أن شيئاً لم يضع ولم يتغير، أيّاً كان مكان حفظه.
 */
const allKeys = (page) =>
  page.evaluate(async () => {
    await (window.Atlas?.ready || Promise.resolve());
    await (window.Atlas?.storage?.flush?.() || Promise.resolve());
    const media = await new Promise((resolve) => {
      const rq = indexedDB.open('atlas-media', 1);
      rq.onupgradeneeded = () => rq.result.createObjectStore('media');
      rq.onerror = () => resolve({});
      rq.onsuccess = () => {
        const db = rq.result;
        const out = {};
        const t = db.transaction('media');
        const c = t.objectStore('media').openCursor();
        c.onsuccess = () => {
          const r = c.result;
          if (r) {
            out[r.key] = r.value;
            r.continue();
          }
        };
        t.oncomplete = () => {
          db.close();
          resolve(out);
        };
      };
    });
    const fix = (t) =>
      t && t.includes('atlas-media:')
        ? JSON.stringify(JSON.parse(t), (k, v) => (typeof v === 'string' && v.startsWith('atlas-media:') ? media[v.slice(12)] ?? v : v))
        : t;
    const o = {};
    for (const k of Object.keys(localStorage)) o[k] = fix(localStorage.getItem(k));
    return o;
  });

test('legacy child near the storage limit migrates in place without duplicating data', async () => {
  const { context, page, errors } = await open();
  const { snapshot, total } = await seedLegacy(page);
  assert.ok(total > 3_000_000, 'legacy data must exceed half of the ~5M-character quota');

  await page.goto(ORIGIN + 'index.html');
  assert.equal(await page.evaluate(() => Atlas.status().mode), 'ok');
  assert.match(await page.locator('body').innerText(), /سارة/);
  const after = await allKeys(page);
  for (const [k, v] of Object.entries(snapshot)) assert.equal(after[k], v, 'legacy key changed: ' + k);
  assert.ok((await storageTotal(page)) - total < 2000, 'migration must not copy data');
  // التسجيلات الكبيرة انتقلت إلى IndexedDB: localStorage صار أخف بكثير
  assert.ok((await storageTotal(page)) < total / 4, 'media must move out of localStorage');

  // البيانات القديمة تُقرأ وتُكتب عبر الحساب الجديد في مكانها
  assert.equal(await page.evaluate(() => Atlas.storage.getItem('atlas:U01.unit:ded')), snapshot['atlas:U01.unit:ded']);
  await page.goto(ORIGIN + 'U02.L03.html');
  assert.ok(await page.evaluate(() => typeof SCENES !== 'undefined' && SCENES.length > 10));
  await page.evaluate(() => Atlas.storage.setItem('atlas:U02.L03:level', '"B"'));
  assert.equal(await page.evaluate(() => localStorage.getItem('atlas:U02.L03:level')), '"B"');
  assert.deepEqual(errors, []);
  await context.close();
});

test('interrupted migration keeps the app usable, loses nothing, and resumes on the next open', async () => {
  const { context, page, errors } = await open({ failRegistryWrites: true });
  const { snapshot, total } = await seedLegacy(page);
  await page.evaluate(() => sessionStorage.setItem('test:failRegistry', '1'));

  // ثلاث مرات فتح متتالية والترحيل يفشل في كل مرة
  for (let i = 0; i < 3; i++) {
    await page.goto(ORIGIN + 'index.html');
    assert.equal(await page.evaluate(() => Atlas.status().mode), 'rescue');
    assert.match(await page.locator('body').innerText(), /سارة/, 'the child must not disappear');
    assert.ok(await page.locator('#atlas-status button').isVisible(), 'rescue button visible');
    assert.equal(await page.evaluate(() => localStorage.getItem('atlas:accounts:v1')), null);
  }
  // التعلّم ممكن أثناء الفشل، والجديد يُحفظ في مكانه
  await page.goto(ORIGIN + 'U02.L03.html');
  assert.ok(await page.evaluate(() => typeof SCENES !== 'undefined' && SCENES.length > 10));
  await page.evaluate(() => Atlas.storage.setItem('atlas:U02.L03:finished', 'true'));
  assert.ok((await storageTotal(page)) - total < 200, 'repeated failures must not grow storage');

  // زال سبب الفشل: الفتح التالي يُتمّ الترحيل
  await page.evaluate(() => sessionStorage.removeItem('test:failRegistry'));
  await page.goto(ORIGIN + 'index.html');
  assert.equal(await page.evaluate(() => Atlas.status().mode), 'ok');
  const reg = JSON.parse(await page.evaluate(() => localStorage.getItem('atlas:accounts:v1')));
  assert.equal(reg.profiles.length, 1);
  assert.equal(reg.profiles[0].name, 'سارة');
  const logical = await allKeys(page);
  for (const [k, v] of Object.entries(snapshot)) assert.equal(logical[k], v, 'lost or changed: ' + k);
  assert.equal(await page.evaluate(() => Atlas.storage.getItem('atlas:U02.L03:finished')), 'true');
  assert.deepEqual(errors, []);
  await context.close();
});


/** قائمة تالفة جزئياً: الطفل القديم في atlas: وطفل ثانٍ (عمر) في مساحته الخاصة. */
async function seedCorrupt(page) {
  await seedLegacy(page, { audioChars: 2000 });
  await page.evaluate(() => {
    localStorage.setItem('atlas:user:uomar1:U03.L01:finished', 'true');
    localStorage.setItem('atlas:user:uomar1:U03.L01:level', '"A"');
    localStorage.setItem('atlas:accounts:v1', '{"version":1,"activeId":"uomar1","profiles":[{"id":"uomar1","name":"عمر","gender":"m"},{"id":"x');
  });
  return allKeys(page);
}

test('HB11-01: a corrupted account list keeps every page working and can be repaired without losing a key', async () => {
  const { context, page, errors } = await open();
  const before = await seedCorrupt(page);
  await page.goto(ORIGIN + 'index.html');
  assert.equal(await page.evaluate(() => Atlas.status().mode), 'rescue');
  assert.equal(await page.evaluate(() => Atlas.status().registryCorrupt), true);
  // الطفل القديم ظاهر وقابل للاختيار، والإنشاء والاستعادة مخفيان، ولوحة الإصلاح ظاهرة
  assert.ok(await page.locator('#repairBox').isVisible());
  assert.ok(await page.locator('#newAccount').isHidden());
  assert.ok(await page.locator('#restoreHome').isHidden());
  await page.locator('#accountList button', { hasText: 'سارة' }).click();
  await page.waitForSelector('#home', { state: 'visible' });
  // الدرس يعمل ويكتب في مكان الطفل القديم دون لمس القائمة التالفة
  await page.goto(ORIGIN + 'U02.L01.html');
  assert.ok(await page.evaluate(() => typeof SCENES !== 'undefined' && SCENES.length > 10));
  await page.evaluate(() => Atlas.storage.setItem('atlas:U02.L01:level', '"B"'));
  assert.equal(await page.evaluate(() => localStorage.getItem('atlas:U02.L01:level')), '"B"');
  await page.goto(ORIGIN + 'review.html');
  await page.goto(ORIGIN + 'U02.unit.html');
  // لا إنشاء طفل فوق قائمة تالفة
  await page.goto(ORIGIN + 'index.html');
  await assert.rejects(page.evaluate(() => Atlas.create({ name: 'ليلى', gender: 'f' })), /تالفة/);
  assert.equal(await page.evaluate(() => localStorage.getItem('atlas:accounts:v1')), before['atlas:accounts:v1']);
  // نسخة إنقاذ خام من اللوحة
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('#rescueHome')]);
  const raw = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
  assert.equal(raw.format, 'atlas-raw');
  assert.equal(raw.data['atlas:user:uomar1:U03.L01:finished'], 'true');
  // الإصلاح
  await page.click('#repairAccounts');
  assert.match(await page.locator('#accountMsg').innerText(), /أُصلحت القائمة: 2/);
  assert.equal(await page.evaluate(() => Atlas.status().mode), 'ok');
  assert.ok(await page.locator('#repairBox').isHidden());
  assert.ok(await page.locator('#newAccount').isVisible());
  const names = await page.evaluate(() => Atlas.profiles().map((p) => p.name));
  assert.deepEqual(names.sort(), ['سارة', 'عمر'].sort());
  const after = await allKeys(page);
  for (const [k, v] of Object.entries(before)) {
    if (k === 'atlas:accounts:v1' || k === 'atlas:U02.L01:level') continue;
    assert.equal(after[k], v, 'lost or changed: ' + k);
  }
  const backupKey = Object.keys(after).find((k) => k.startsWith('atlas:accounts:corrupt:'));
  assert.equal(after[backupKey], before['atlas:accounts:v1'], 'broken list kept for inspection');
  const omar = await page.evaluate(() => Atlas.profiles().find((p) => p.name === 'عمر').id);
  await page.evaluate((id) => Atlas.select(id), omar);
  assert.equal(await page.evaluate(() => Atlas.storage.getItem('atlas:U03.L01:finished')), 'true');
  assert.deepEqual(errors, []);
  await context.close();
});

test('HB11-02: creating a child while the list cannot be saved changes nothing, then works once space returns', async () => {
  const { context, page, errors } = await open({ failRegistryWrites: true });
  await seedLegacy(page, { audioChars: 2000 });
  await page.goto(ORIGIN + 'index.html'); // ترحيل ناجح أولاً
  const reg0 = await page.evaluate(() => localStorage.getItem('atlas:accounts:v1'));
  const active0 = await page.evaluate(() => Atlas.active().id);
  const keys0 = await allKeys(page);
  await page.evaluate(() => sessionStorage.setItem('test:failRegistry', '1'));
  await page.goto(ORIGIN + 'index.html');
  await assert.rejects(page.evaluate(() => Atlas.create({ name: 'عمر', gender: 'm' })), /لم يتغير شيء/);
  assert.equal(await page.evaluate(() => Atlas.active().id), active0);
  assert.equal(await page.evaluate(() => Atlas.profiles().length), 1);
  assert.deepEqual(await allKeys(page), keys0, 'no orphan keys');
  // عبر الواجهة أيضاً: يبقى الطفل نفسه بعد التنقل
  await page.goto(ORIGIN + 'U02.L03.html');
  assert.equal(await page.evaluate(() => Atlas.active().id), active0);
  assert.equal(await page.evaluate(() => localStorage.getItem('atlas:accounts:v1')), reg0);
  // زال الفشل: الإنشاء ينجح
  await page.evaluate(() => sessionStorage.removeItem('test:failRegistry'));
  await page.goto(ORIGIN + 'index.html');
  await page.evaluate(() => Atlas.create({ name: 'عمر', gender: 'm' }));
  assert.equal(await page.evaluate(() => Atlas.profiles().length), 2);
  assert.equal(await page.evaluate(() => Atlas.active().name), 'عمر');
  assert.deepEqual(errors, []);
  await context.close();
});

/** نسخة احتياطية صحيحة البصمة من حسابات مُعطاة. */
const makeBackup = (page, profiles) =>
  page.evaluate(async (profiles) => {
    const payload = { profiles };
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(payload)));
    const sha256 = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
    return JSON.stringify({ format: 'atlas-backup', version: 1, createdAt: '2026-10-30', payload, sha256 });
  }, profiles);

test('HB11-03: a failed or invalid restore leaves no phantom child and a retry succeeds', async () => {
  const { context, page, errors } = await open({ failRegistryWrites: true });
  await seedLegacy(page, { audioChars: 2000 });
  await page.goto(ORIGIN + 'index.html');
  const good = { profile: { name: 'عمر', gender: 'm' }, data: { 'atlas:U03.L01:finished': 'true' } };
  const bad = { profile: { name: 'ليلى', gender: 'x' }, data: {} };
  // الاستعادة على جهاز فيه حساب تكون من شاشة ولي الأمر مفتوحة (المراجعة 20، ن-13)
  await page.evaluate(() => Atlas.setPin('1234'));
  const keys0 = await allKeys(page);
  const state = () => page.evaluate(() => ({ n: Atlas.profiles().length, active: Atlas.active().id }));
  const s0 = await state();

  // حساب ثانٍ غير صالح في ملف متعدد الحسابات
  const mixed = await makeBackup(page, [good, bad]);
  await assert.rejects(page.evaluate((t) => Atlas.restore(t), mixed), /حساب غير صالح/);
  assert.deepEqual(await state(), s0);
  assert.deepEqual(await allKeys(page), keys0);

  // فشل الكتابة، في الوضع العادي ثم في وضع الإنقاذ
  const ok = await makeBackup(page, [good]);
  await page.evaluate(() => sessionStorage.setItem('test:failRegistry', '1'));
  await page.goto(ORIGIN + 'index.html');
  await assert.rejects(page.evaluate((t) => Atlas.restore(t), ok), /مساحة التخزين/);
  assert.deepEqual(await state(), s0);
  assert.deepEqual(await allKeys(page), keys0);
  await page.evaluate(() => localStorage.removeItem('atlas:accounts:v1'));
  await page.goto(ORIGIN + 'index.html');
  assert.equal(await page.evaluate(() => Atlas.status().mode), 'rescue');
  const before = await allKeys(page);
  await assert.rejects(page.evaluate((t) => Atlas.restore(t), ok));
  await assert.rejects(page.evaluate((t) => Atlas.restore(t), mixed), /حساب غير صالح/);
  assert.equal(await page.evaluate(() => Atlas.profiles().length), 1);
  assert.deepEqual(await allKeys(page), before);

  // زال الفشل: المحاولة نفسها تنجح (بعد فتح شاشة ولي الأمر للقائمة المرحَّلة من جديد)
  await page.evaluate(() => sessionStorage.removeItem('test:failRegistry'));
  await page.goto(ORIGIN + 'index.html');
  await assert.rejects(page.evaluate((t) => Atlas.restore(t), ok), /من شاشة ولي الأمر/);
  await page.evaluate(() => Atlas.setPin('1234'));
  assert.equal(await page.evaluate((t) => Atlas.restore(t), ok), 1);
  assert.equal(await page.evaluate(() => Atlas.profiles().length), 2);
  assert.deepEqual(errors, []);
  await context.close();
});

test('a raw rescue copy taken from a corrupted list restores every child on another device', async () => {
  const { context, page } = await open();
  const before = await seedCorrupt(page);
  await page.goto(ORIGIN + 'index.html');
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('#atlas-status button')]);
  const text = fs.readFileSync(await download.path(), 'utf8');
  assert.equal(JSON.parse(text).format, 'atlas-raw');
  await context.close();

  const fresh = await open();
  await fresh.page.goto(ORIGIN + 'index.html');
  const res = await fresh.page.evaluate((t) => Atlas.restore(t), text);
  assert.equal(res.restored ?? res, 2);
  const profiles = await fresh.page.evaluate(() => Atlas.profiles());
  assert.deepEqual(profiles.map((p) => p.name).sort(), ['سارة', 'عمر'].sort());
  const sara = profiles.find((p) => p.name === 'سارة');
  assert.equal(sara.gender, 'f');
  await fresh.page.evaluate((id) => Atlas.select(id), sara.id);
  for (const k of ['atlas:U01.unit:ded', 'atlas:U02.L01:progress', 'atlas:U02.L01:open_U02.L01.C3', 'atlas:questions']) {
    assert.equal(await fresh.page.evaluate((k) => Atlas.storage.getItem(k), k), before[k], k);
  }
  await fresh.page.evaluate((id) => Atlas.select(id), profiles.find((p) => p.name === 'عمر').id);
  assert.equal(await fresh.page.evaluate(() => Atlas.storage.getItem('atlas:U03.L01:finished')), 'true');
  await fresh.context.close();
});

test('HB111-01: two windows recovering from a failed save never drop an account, in either order', async () => {
  for (const order of [['a', 'z'], ['z', 'a']]) {
    const { context, page: a, errors } = await open({ failRegistryWrites: true });
    await seedLegacy(a, { audioChars: 2000 });
    const z = await context.newPage();
    z.on('pageerror', (e) => errors.push(e.message));
    await z.goto(ORIGIN + 'blank');
    for (const p of [a, z]) {
      await p.evaluate(() => sessionStorage.setItem('test:failRegistry', '1'));
      await p.goto(ORIGIN + 'index.html');
      assert.equal(await p.evaluate(() => Atlas.status().mode), 'rescue');
    }
    for (const p of [a, z]) await p.evaluate(() => sessionStorage.removeItem('test:failRegistry'));
    const tabs = { a, z };
    const [first, second] = order.map((k) => tabs[k]);
    const omar = await first.evaluate(() => {
      const q = Atlas.create({ name: 'عمر', gender: 'm' });
      Atlas.storage.setItem('atlas:U01.L01:notes', JSON.stringify('تقدم عمر'));
      return q.id;
    });
    // النافذة الثانية (دون إعادة فتح) تتبنّى القائمة المحفوظة بدل قائمتها المؤقتة
    await second.waitForTimeout(300);
    await second.waitForLoadState();
    assert.equal(await second.evaluate(() => Atlas.status().mode), 'ok');
    assert.deepEqual((await second.evaluate(() => Atlas.profiles().map((p) => p.name))).sort(), ['سارة', 'عمر'].sort());
    await second.evaluate(() => Atlas.create({ name: 'كريم', gender: 'm' }));
    const reg = JSON.parse(await second.evaluate(() => localStorage.getItem('atlas:accounts:v1')));
    assert.deepEqual(reg.profiles.map((p) => p.name).sort(), ['سارة', 'عمر', 'كريم'].sort(), order.join('→'));
    assert.ok(reg.profiles.some((p) => p.id === omar), 'Omar keeps his id');
    assert.equal(await second.evaluate((id) => localStorage.getItem('atlas:user:' + id + ':U01.L01:notes'), omar), '"تقدم عمر"');
    // سارة القديمة واحدة لا اثنتان، ومساحتها هي نفسها
    assert.equal(reg.profiles.filter((p) => p.ns === 'atlas:').length, 1);
    const names = await second.evaluate(async () => {
      let v;
      Atlas.download = (_n, x) => (v = x);
      await Atlas.rescueDownload();
      return v.payload.profiles.map((p) => p.profile.name);
    });
    assert.deepEqual(names.sort(), ['سارة', 'عمر', 'كريم'].sort());
    assert.deepEqual(errors, []);
    await context.close();
  }
});

test('HB111-01: a window whose list is stale refuses to save, changes nothing, and succeeds on retry', async () => {
  const { context, page: a, errors } = await open();
  await seedLegacy(a, { audioChars: 2000 });
  await a.goto(ORIGIN + 'index.html');
  const z = await context.newPage();
  await z.goto(ORIGIN + 'index.html');
  // نجعل قراءة z للقائمة متأخرة خطوة: يكتب a بين قراءة z وحفظه
  const out = await z.evaluate(() => {
    const before = localStorage.getItem('atlas:accounts:v1');
    const realGet = Storage.prototype.getItem;
    let armed = true;
    Storage.prototype.getItem = function (k) {
      const v = realGet.call(this, k);
      if (armed && this === localStorage && k === 'atlas:accounts:v1') {
        armed = false;
        const r = JSON.parse(v);
        r.profiles.push({ id: 'uother1', name: 'عمر', gender: 'm', photo: '' });
        localStorage.setItem(k, JSON.stringify(r)); // «نافذة أخرى» تحفظ بعد قراءتنا مباشرة
      }
      return v;
    };
    let error = '';
    try {
      Atlas.create({ name: 'كريم', gender: 'm' });
    } catch (e) {
      error = e.message;
    }
    const after = JSON.parse(localStorage.getItem('atlas:accounts:v1'));
    const unchanged = !after.profiles.some((p) => p.name === 'كريم') && after.profiles.some((p) => p.id === 'uother1');
    Storage.prototype.getItem = realGet;
    Atlas.create({ name: 'كريم', gender: 'm' }); // إعادة المحاولة
    return { error, unchanged, names: Atlas.profiles().map((p) => p.name) };
  });
  assert.match(out.error, /نافذة أخرى/);
  assert.ok(out.unchanged, 'rejected save wrote nothing');
  assert.deepEqual(out.names.sort(), ['سارة', 'عمر', 'كريم'].sort());
  assert.deepEqual(errors, []);
  await context.close();
});

/** قائمة حسابات بترتيب حقول مختلف وأسماء فيها اقتباسات، ثم يُحذف آخر محرف منها فتتلف. */
const brokenList = (activeFirst) => {
  const kids = [
    { id: 'ukid1', name: 'عمر "الصغير"', gender: 'm' },
    { gender: 'f', name: 'سارة \\ ليلى', id: 'ukid2' },
    { name: 'كريم', id: 'ukid3', gender: 'm', guardian: { salt: 'uabc', hash: 'a'.repeat(64) } },
  ];
  return JSON.stringify({ version: 1, activeId: activeFirst ? 'ukid1' : 'ukid3', profiles: kids }).slice(0, -1);
};
const kidData = { ukid1: 'بيانات عمر', ukid2: 'بيانات سارة', ukid3: 'بيانات كريم' };
const kidNames = { ukid1: ['عمر "الصغير"', 'm'], ukid2: ['سارة \\ ليلى', 'f'], ukid3: ['كريم', 'm'] };

async function seedBroken(page, text, data = kidData) {
  await page.evaluate(({ text, data }) => {
    localStorage.clear();
    for (const [id, v] of Object.entries(data)) localStorage.setItem('atlas:user:' + id + ':U01.L01:notes', JSON.stringify(v));
    localStorage.setItem('atlas:accounts:v1', text);
  }, { text, data });
}

test('HB111-02: repair and raw restore keep each name and gender with its own child', async () => {
  for (const activeFirst of [true, false]) {
    const { context, page, errors } = await open();
    await seedBroken(page, brokenList(activeFirst));
    await page.goto(ORIGIN + 'index.html');
    const [download] = await Promise.all([page.waitForEvent('download'), page.click('#rescueHome')]);
    const raw = fs.readFileSync(await download.path(), 'utf8');
    await page.click('#repairAccounts');
    const repaired = await page.evaluate(() => Atlas.profiles());
    assert.equal(repaired.length, 3);
    for (const p of repaired) {
      assert.deepEqual([p.name, p.gender], kidNames[p.id], 'repair ' + p.id);
      assert.equal(p.unverified, false);
      await page.evaluate((id) => Atlas.select(id), p.id);
      assert.equal(await page.evaluate(() => Atlas.storage.getItem('atlas:U01.L01:notes')), JSON.stringify(kidData[p.id]));
    }
    // النسخة الخام إلى جهاز جديد
    const fresh = await open();
    await fresh.page.goto(ORIGIN + 'index.html');
    assert.deepEqual(await fresh.page.evaluate((t) => Atlas.restore(t), raw), { restored: 3, skipped: 0, temporary: 0 });
    for (const p of await fresh.page.evaluate(() => Atlas.profiles())) {
      await fresh.page.evaluate((id) => Atlas.select(id), p.id);
      const notes = JSON.parse(await fresh.page.evaluate(() => Atlas.storage.getItem('atlas:U01.L01:notes')));
      const id = Object.keys(kidData).find((k) => kidData[k] === notes);
      assert.deepEqual([p.name, p.gender], kidNames[id], 'raw ' + id);
    }
    await fresh.context.close();
    assert.deepEqual(errors, []);
    await context.close();
  }
});

test('HB111-02: a child whose record cannot be read gets an explicit temporary identity, never a neighbour\'s', async () => {
  const { context, page, errors } = await open();
  // سجل الطفل الثاني مقطوع وسط اسمه، والطفل الأول نشط ومعرّف الثاني يظهر قبله في activeId
  const text = '{"version":1,"activeId":"ukid2","profiles":[{"id":"ukid1","name":"عمر","gender":"m"},{"id":"ukid2","gender":"f","name":"سا';
  await seedBroken(page, text, { ukid1: 'بيانات عمر', ukid2: 'بيانات سارة' });
  await page.goto(ORIGIN + 'index.html');
  await page.click('#repairAccounts');
  const ps = await page.evaluate(() => Atlas.profiles());
  const two = ps.find((p) => p.id === 'ukid2');
  assert.notEqual(two.name, 'عمر');
  assert.match(two.name, /طفل مستعاد/);
  assert.equal(two.unverified, true);
  assert.match(await page.locator('#accountList').innerText(), /اسم مؤقت/);
  assert.deepEqual([ps.find((p) => p.id === 'ukid1').name, ps.find((p) => p.id === 'ukid1').unverified], ['عمر', false]);
  // ولي الأمر يصحح الاسم والجنس فتزول العلامة
  await page.evaluate(() => {
    Atlas.select('ukid2');
    Atlas.update({ name: 'سارة', gender: 'f' });
  });
  const fixed = await page.evaluate(() => Atlas.profiles().find((p) => p.id === 'ukid2'));
  assert.deepEqual([fixed.name, fixed.gender, fixed.unverified], ['سارة', 'f', false]);
  assert.deepEqual(errors, []);
  await context.close();
});

test('HB112-01: a well-formed list with a damaged record goes to rescue instead of breaking the pages', async () => {
  const damaged = [
    [null],
    [{ id: 'ukid1' }],
    [{ id: 'ukid1', name: 'عمر', gender: 'x' }],
    [{ id: 'ukid1', name: 'عمر', gender: 'm' }, { id: 'ukid1', name: 'عمر', gender: 'm' }],
  ];
  for (const withLegacy of [true, false]) {
    for (const profiles of damaged) {
      const { context, page, errors } = await open();
      await page.evaluate(({ profiles, withLegacy }) => {
        localStorage.clear();
        if (withLegacy) {
          localStorage.setItem('atlas:profile', JSON.stringify({ name: 'سارة', gender: 'f' }));
          localStorage.setItem('atlas:U01.L01:finished', 'true');
        }
        localStorage.setItem('atlas:user:ukid1:U01.L01:notes', JSON.stringify('بيانات عمر'));
        localStorage.setItem('atlas:accounts:v1', JSON.stringify({ version: 1, activeId: 'damaged', profiles }));
      }, { profiles, withLegacy });
      const before = await allKeys(page);
      const label = JSON.stringify(profiles) + (withLegacy ? ' +legacy' : '');
      await page.goto(ORIGIN + 'index.html');
      assert.equal(await page.evaluate(() => Atlas.status().registryCorrupt), true, label);
      assert.equal(await page.evaluate(() => Atlas.status().mode), 'rescue', label);
      assert.ok(await page.locator('#repairBox').isVisible(), label);
      assert.ok(await page.locator('#atlas-status').isVisible(), label);
      if (withLegacy) {
        await page.locator('#accountList button', { hasText: 'سارة' }).click();
        await page.goto(ORIGIN + 'U01.L01.html');
        await page.waitForTimeout(150);
        assert.match(page.url(), /U01\.L01\.html$/, 'legacy child can still learn: ' + label);
        await page.goto(ORIGIN + 'index.html');
      }
      const mid = await allKeys(page);
      for (const [k, v] of Object.entries(before)) assert.equal(mid[k], v, 'nothing lost before repair: ' + label + ' ' + k);
      await page.click('#repairAccounts');
      assert.equal(await page.evaluate(() => Atlas.status().mode), 'ok', label);
      const after = await allKeys(page);
      for (const [k, v] of Object.entries(before)) if (k !== 'atlas:accounts:v1') assert.equal(after[k], v, label + ' ' + k);
      const kept = Object.keys(after).find((k) => k.startsWith('atlas:accounts:corrupt:'));
      assert.equal(after[kept], before['atlas:accounts:v1'], 'damaged text kept: ' + label);
      const ps = await page.evaluate(() => Atlas.profiles());
      assert.equal(ps.length, withLegacy ? 2 : 1, label);
      const omar = ps.find((p) => p.id === 'ukid1');
      await page.evaluate(() => Atlas.select('ukid1'));
      assert.equal(await page.evaluate(() => Atlas.storage.getItem('atlas:U01.L01:notes')), '"بيانات عمر"', label);
      // سجل غير صالح لا يُوثق باسمه: إما اسمه الصالح أو هوية مؤقتة صريحة
      if (omar.name === 'عمر') assert.equal(omar.gender, 'm', label);
      else assert.equal(omar.unverified, true, label);
      assert.deepEqual(errors, [], label);
      await context.close();
    }
  }
});

test('HB112-02: an unconfirmed identity stays marked through full and all-children backups until edited', async () => {
  const { context, page, errors } = await open();
  await page.goto(ORIGIN + 'index.html');
  const flags = await page.evaluate(async () => {
    const out = {};
    const raw = { format: 'atlas-raw', data: {
      'atlas:accounts:v1': '{"version":1,"activeId":"kid","profiles":[{"id":"kid","name":"مقطوع',
      'atlas:user:kid:U01.L01:notes': JSON.stringify('بيانات طفل مجهول الهوية'),
    } };
    await Atlas.restore(JSON.stringify(raw));
    const temp = Atlas.profiles()[0];
    out.raw = temp.unverified;
    Atlas.select(temp.id);
    await Atlas.setPin('1234'); // إعداد الرمز ليس تأكيداً للهوية
    out.afterPin = Atlas.profiles()[0].unverified;
    const full = await Atlas.backup();
    out.exported = full.payload.profiles[0].profile.unverified;
    await Atlas.restore(JSON.stringify(full));
    out.fullRestore = Atlas.profiles().map((p) => p.unverified);
    if (Atlas.hasPin()) await Atlas.unlock('1234');
    let all;
    Atlas.download = (_n, v) => (all = v);
    await Atlas.rescueDownload();
    await Atlas.restore(JSON.stringify(all));
    out.allRestore = Atlas.profiles().map((p) => p.unverified);
    // تعديل ولي الأمر للاسم والجنس هو التأكيد الوحيد
    Atlas.update({ name: 'سلمى', gender: 'f' });
    out.edited = Atlas.profiles().find((p) => p.id === Atlas.active().id).unverified;
    if (Atlas.hasPin() && !Atlas.guardianUnlocked()) await Atlas.unlock('1234');
    const confirmed = await Atlas.backup();
    await Atlas.restore(JSON.stringify(confirmed));
    out.editedRestore = Atlas.profiles().filter((p) => p.name === 'سلمى').map((p) => p.unverified);
    out.notes = Atlas.storage.getItem('atlas:U01.L01:notes');
    return out;
  });
  assert.equal(flags.raw, true);
  assert.equal(flags.afterPin, true);
  assert.equal(flags.exported, true);
  assert.deepEqual(flags.fullRestore, [true, true]);
  assert.deepEqual(flags.allRestore, [true, true, true, true]);
  assert.equal(flags.edited, false);
  assert.deepEqual(flags.editedRestore, [false, false]);
  assert.equal(flags.notes, '"بيانات طفل مجهول الهوية"');
  await page.goto(ORIGIN + 'index.html');
  await page.evaluate(() => Atlas.lock());
  await page.goto(ORIGIN + 'index.html');
  if (await page.locator('#switchAccount').isVisible()) await page.click('#switchAccount');
  const labels = await page.locator('#accountList').innerText();
  assert.equal((labels.match(/اسم مؤقت/g) || []).length, 3); // أربعة مؤقتة أُكّد واحد منها
  // ملف بقيمة غير منطقية للعلامة يُرفض
  const bad = await page.evaluate(async () => {
    const payload = { profiles: [{ profile: { name: 'x', gender: 'm', unverified: 'yes' }, data: {} }] };
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(payload)));
    const sha256 = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
    try {
      await Atlas.restore(JSON.stringify({ format: 'atlas-backup', version: 1, payload, sha256 }));
      return 'accepted';
    } catch (e) {
      return e.message;
    }
  });
  assert.match(bad, /حساب غير صالح/);
  assert.deepEqual(errors, []);
  await context.close();
});

/** طفلان بمساحتين خاصتين (بلا طفل قديم): عمر مؤكد، وطفل مؤقت لم يؤكده ولي الأمر. */
async function seedTwoKids(page) {
  return page.evaluate(async () => {
    localStorage.clear();
    // الاستعادة أولاً والجهاز بلا حسابات: على جهاز فيه حساب تحتاج شاشة ولي الأمر مفتوحة (المراجعة 20، ن-13)
    await Atlas.restore(JSON.stringify({ format: 'atlas-raw', data: {
      'atlas:accounts:v1': '{"version":1,"profiles":[{"id":"kid","name":"مقطوع',
      'atlas:user:kid:U01.L01:notes': JSON.stringify('بيانات المؤقت'),
    } }));
    Atlas.create({ name: 'عمر', gender: 'm' });
    Atlas.storage.setItem('atlas:U01.L01:notes', JSON.stringify('بيانات عمر'));
    return Atlas.profiles().map((p) => [p.name, p.unverified]);
  });
}

/** ملف خام ينزّله التطبيق نفسه. */
async function appRaw(page) {
  const [d] = await Promise.all([page.waitForEvent('download'), page.evaluate(() => Atlas.rescueDownload())]);
  const text = fs.readFileSync(await d.path(), 'utf8');
  assert.equal(JSON.parse(text).format, 'atlas-raw');
  return text;
}

/** يستعيد نصاً في جهاز جديد ويعيد لكل طفل: الاسم والجنس والعلامة والملاحظة. */
async function restoreFresh(text) {
  const fresh = await open();
  await fresh.page.goto(ORIGIN + 'index.html');
  const res = await fresh.page.evaluate(async (t) => {
    const result = await Atlas.restore(t);
    const kids = [];
    for (const p of Atlas.profiles()) {
      Atlas.select(p.id);
      kids.push({ name: p.name, gender: p.gender, unverified: p.unverified, notes: Atlas.storage.getItem('atlas:U01.L01:notes') });
    }
    return { result, kids };
  }, text);
  res.errors = fresh.errors;
  await fresh.context.close();
  return res;
}

const byNotes = (kids) => Object.fromEntries(kids.map((k) => [JSON.parse(k.notes), [k.name, k.gender, k.unverified]]));

test('HB113-01: the raw rescue file from a list with damaged records restores every valid child on a new device', async () => {
  const damages = {
    'null first': (r) => r.profiles.unshift(null),
    'null last': (r) => r.profiles.push(null),
    'incomplete record': (r) => r.profiles.splice(1, 0, { id: 'ughost' }),
    'number record': (r) => r.profiles.unshift(7),
  };
  for (const [label, damage] of Object.entries(damages)) {
    const { context, page, errors } = await open();
    await page.goto(ORIGIN + 'index.html');
    await seedTwoKids(page);
    await page.evaluate((src) => {
      const r = JSON.parse(localStorage.getItem('atlas:accounts:v1'));
      new Function('r', src)(r);
      localStorage.setItem('atlas:accounts:v1', JSON.stringify(r));
    }, `(${damage.toString()})(r)`);
    await page.goto(ORIGIN + 'index.html');
    assert.equal(await page.evaluate(() => Atlas.status().registryCorrupt), true, label);
    const source = await allKeys(page);
    const raw = await appRaw(page);
    assert.deepEqual(await allKeys(page), source, 'source unchanged: ' + label);
    const res = await restoreFresh(raw);
    assert.deepEqual(res.result, { restored: 2, skipped: 0, temporary: 1 }, label);
    assert.deepEqual(byNotes(res.kids), {
      'بيانات عمر': ['عمر', 'm', false],
      'بيانات المؤقت': ['طفل مستعاد 1', 'm', true],
    }, label);
    assert.deepEqual([...errors, ...res.errors], [], label);
    await context.close();
  }
});

test('HB113-02: an unconfirmed identity survives repair, raw restore and chained backups until the guardian edits it', async () => {
  const { context, page, errors } = await open();
  await page.goto(ORIGIN + 'index.html');
  assert.deepEqual((await seedTwoKids(page)).sort(), [['عمر', false], ['طفل مستعاد 1', true]].sort());
  // غلاف القائمة تالف، وسجلا الطفلين كاملان
  await page.evaluate(() => localStorage.setItem('atlas:accounts:v1', localStorage.getItem('atlas:accounts:v1').slice(0, -1)));
  await page.goto(ORIGIN + 'index.html');
  const raw = await appRaw(page);
  assert.ok(JSON.parse(raw).data['atlas:accounts:v1'].includes('"unverified":true'));

  // 1) الاستعادة الخام على جهاز جديد
  const restored = await restoreFresh(raw);
  assert.deepEqual(byNotes(restored.kids), {
    'بيانات عمر': ['عمر', 'm', false],
    'بيانات المؤقت': ['طفل مستعاد 1', 'm', true],
  });

  // 2) الإصلاح على الجهاز نفسه، ثم النسخ المتعاقبة
  await page.click('#repairAccounts');
  const chain = await page.evaluate(async () => {
    const out = {};
    const guard = async () => {
      if (!Atlas.hasPin()) await Atlas.setPin('1234'); // الرمز ليس تأكيداً للهوية
      else if (!Atlas.guardianUnlocked()) await Atlas.unlock('1234');
    };
    const temp = Atlas.profiles().find((p) => p.name === 'طفل مستعاد 1');
    out.repaired = Atlas.profiles().map((p) => [p.name, p.unverified]);
    Atlas.select(temp.id);
    await guard();
    const full = await Atlas.backup();
    await Atlas.restore(JSON.stringify(full));
    let all;
    Atlas.download = (_n, v) => (all = v);
    await guard();
    await Atlas.rescueDownload();
    await Atlas.restore(JSON.stringify(all));
    out.afterBackups = Atlas.profiles().map((p) => [p.name, p.unverified]);
    // التأكيد: تعديل ولي الأمر للاسم والجنس
    Atlas.select(temp.id);
    Atlas.update({ name: 'سلمى', gender: 'f' });
    await guard();
    const confirmed = await Atlas.backup();
    await Atlas.restore(JSON.stringify(confirmed));
    Atlas.download = (_n, v) => (all = v);
    await guard();
    await Atlas.rescueDownload();
    await Atlas.restore(JSON.stringify(all));
    out.salma = Atlas.profiles().filter((p) => p.name === 'سلمى').map((p) => p.unverified);
    out.stillTemp = Atlas.profiles().filter((p) => p.name === 'طفل مستعاد 1').map((p) => p.unverified);
    return out;
  });
  assert.deepEqual(chain.repaired.sort(), [['عمر', false], ['طفل مستعاد 1', true]].sort());
  assert.ok(chain.afterBackups.filter(([n]) => n === 'طفل مستعاد 1').every(([, u]) => u === true));
  assert.ok(chain.afterBackups.filter(([n]) => n === 'عمر').every(([, u]) => u === false));
  assert.ok(chain.salma.length >= 3 && chain.salma.every((u) => u === false), JSON.stringify(chain.salma));
  assert.ok(chain.stillTemp.length >= 1 && chain.stillTemp.every((u) => u === true));
  assert.deepEqual(errors, []);
  await context.close();
});

test('HB113-02: raw metadata with an ambiguous confirmation state is never treated as confirmed', async () => {
  const cases = {
    'wrong type': '{"version":1,"profiles":[{"id":"k1","name":"ليلى","gender":"f","unverified":"no"}]}',
    'duplicate flag': '{"version":1,"profiles":[{"id":"k1","name":"ليلى","gender":"f","unverified":false,"unverified":true}]}',
    'cut before flag': '{"version":1,"profiles":[{"id":"k1","name":"ليلى","gender":"f","pho',
    'cut inside true': '{"version":1,"profiles":[{"id":"k1","name":"ليلى","gender":"f","unverified":tr',
  };
  for (const [label, reg] of Object.entries(cases)) {
    const res = await restoreFresh(JSON.stringify({ format: 'atlas-raw', data: {
      'atlas:accounts:v1': reg, 'atlas:user:k1:U01.L01:notes': JSON.stringify('بيانات ليلى'),
    } }));
    assert.deepEqual(byNotes(res.kids), { 'بيانات ليلى': ['ليلى', 'f', true] }, label);
  }
  // سجل كامل بلا علامة (أنشأه ولي الأمر) يبقى مؤكداً
  const ok = await restoreFresh(JSON.stringify({ format: 'atlas-raw', data: {
    'atlas:accounts:v1': '{"version":1,"profiles":[{"id":"k1","name":"ليلى","gender":"f"}',
    'atlas:user:k1:U01.L01:notes': JSON.stringify('بيانات ليلى'),
  } }));
  assert.deepEqual(byNotes(ok.kids), { 'بيانات ليلى': ['ليلى', 'f', false] });
});

test('rescue copy of all children restores recordings and progress exactly', async () => {
  const { context, page } = await open();
  const { snapshot } = await seedLegacy(page, { audioChars: 50_000 });
  await page.goto(ORIGIN + 'index.html');
  await page.evaluate(() => {
    const first = Atlas.active().id;
    Atlas.create({ name: 'عمر', gender: 'm' });
    Atlas.storage.setItem('atlas:U03.L01:finished', 'true');
    Atlas.select(first);
  });
  const [download] = await Promise.all([page.waitForEvent('download'), page.evaluate(() => Atlas.rescueDownload())]);
  const text = fs.readFileSync(await download.path(), 'utf8');
  assert.equal(JSON.parse(text).format, 'atlas-backup');
  await page.evaluate(() => Atlas.setPin('1234')); // الاستعادة على جهاز فيه حسابات من شاشة ولي الأمر (ن-13)
  assert.equal(await page.evaluate((t) => Atlas.restore(t), text), 2);
  const restored = await page.evaluate(() => Atlas.profiles().filter((p) => p.restoredAt).map((p) => p.name));
  assert.deepEqual(restored.sort(), ['سارة', 'عمر'].sort());
  const sara = await page.evaluate(() => Atlas.profiles().find((p) => p.restoredAt && p.name === 'سارة').id);
  await page.evaluate((id) => Atlas.select(id), sara);
  for (const k of ['atlas:U01.unit:ded', 'atlas:U02.L01:progress', 'atlas:U02.L01:open_U02.L01.C3', 'atlas:questions']) {
    assert.equal(await page.evaluate((k) => Atlas.storage.getItem(k), k), snapshot[k], k);
  }
  await context.close();
});

test('forgotten guardian PIN can be reset from the gate with the recovery code without touching the child data', async () => {
  const { context, page, errors } = await open();
  await seedLegacy(page, { audioChars: 5000 });
  await page.goto(ORIGIN + 'index.html');
  const code = await page.evaluate(async () => {
    const { recovery } = await Atlas.setPin('2468');
    Atlas.storage.setItem('atlas:U02:rubric', JSON.stringify({ 'U02.L01.draw': { score: 2, signature: 'x' } }));
    Atlas.lock();
    return recovery;
  });
  const before = await page.evaluate(() => Atlas.storage.keys().map((k) => [k, Atlas.storage.getItem(k)]));
  await page.goto(ORIGIN + 'review.html');
  await page.click('#forgotPin');
  assert.equal(await page.locator('#recWay').isVisible(), true);
  await page.fill('#recCode', 'AAAA-BBBB-CCCC');
  await page.click('#recGo');
  await page.waitForFunction(() => document.querySelector('#resetMsg').textContent);
  assert.match(await page.locator('#resetMsg').innerText(), /غير صحيح/);
  assert.equal(await page.evaluate(() => Atlas.hasPin()), true);
  await page.fill('#recCode', code);
  await page.click('#recGo');
  await page.waitForFunction(() => !Atlas.hasPin());
  assert.ok(await page.locator('#confirmLabel').isVisible(), 'asks for a new PIN');
  const afterKeys = await page.evaluate(() => Atlas.storage.keys().map((k) => [k, Atlas.storage.getItem(k)]));
  assert.deepEqual(afterKeys.sort(), before.sort());
  await page.fill('#guardianPin', '1357');
  await page.fill('#guardianConfirm', '1357');
  await page.click('#guardianGo');
  await page.waitForSelector('#recoveryBox', { state: 'visible' });
  assert.notEqual(await page.locator('#recShow').innerText(), code);
  await page.check('#recDone');
  await page.click('#recCont');
  await page.waitForSelector('#main', { state: 'visible', timeout: 10000 });
  await page.evaluate(() => { document.getElementById('adv').open = true; }); // الأدوات التقنية مطوية في «أدوات متقدمة» (قرار 25 نوفمبر)
  assert.match(await page.locator('#usage').innerText(), /%/);
  assert.deepEqual(errors, []);
  await context.close();
});
test('speech bitrate keeps recordings several times smaller than the browser default', async () => {
  const { context, page } = await open();
  await page.evaluate(() => localStorage.setItem('atlas:profile', JSON.stringify({ name: 'نور', gender: 'f' })));
  await page.goto(ORIGIN + 'U03.L04.html');
  const sizes = await page.evaluate(async () => {
    const measure = async (make) => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = make(stream);
      const chunks = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.start();
      await new Promise((r) => setTimeout(r, 4000));
      await new Promise((r) => { rec.onstop = r; rec.stop(); });
      stream.getTracks().forEach((t) => t.stop());
      const url = await new Promise((r) => {
        const fr = new FileReader();
        fr.onload = () => r(fr.result);
        fr.readAsDataURL(new Blob(chunks, { type: rec.mimeType }));
      });
      return { charsPerSecond: Math.round(url.length / 4), valid: !!Atlas.audioSource(url) };
    };
    const mime = 'audio/webm;codecs=opus';
    return {
      speech: await measure((s) => makeRecorder(s, mime)),
      browserDefault: await measure((s) => new MediaRecorder(s, { mimeType: mime })),
    };
  });
  console.log('recording size (base64 chars per second):', JSON.stringify(sizes));
  assert.ok(sizes.speech.valid, 'saved recording must pass validation');
  assert.ok(sizes.speech.charsPerSecond < 6000, '≈24 kbit/s ≈ 4000 chars/s');
  assert.ok(sizes.browserDefault.charsPerSecond > 3 * sizes.speech.charsPerSecond);
  // تسجيل الإهداء بحده الأقصى (90 ثانية) يبقى أقل من 10% من سعة التخزين
  assert.ok(sizes.speech.charsPerSecond * 90 < 0.1 * 5 * 1024 * 1024);
  await context.close();
});
