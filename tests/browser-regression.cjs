const {
  test,
  before,
  after
} = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require(
'node:path'), {
  chromium
} = require('playwright');
const root = path.resolve(__dirname, '../app/v2');
let browser;
before(async () => browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,
  args: process.env.CI ? ['--no-sandbox', '--disable-dev-shm-usage'] : []
}));
after(async () => browser?.close());
async function fresh(seed) {
  const context = await browser.newContext({
    viewport: {
      width: 420,
      height: 860
    }
  });
  await context.route('https://atlas.test/**', async r => {
    const p = path.resolve(root, decodeURIComponent(new URL(r.request().url()).pathname).slice(1) ||
      'index.html');
    if (!p.startsWith(root + path.sep)) return r.abort();
    try {
      await r.fulfill({
        body: fs.readFileSync(p),
        contentType: {
          '.js': 'application/javascript',
          '.html': 'text/html',
          '.css': 'text/css',
          '.webp': 'image/webp',
          '.ttf': 'font/ttf',
          '.woff2': 'font/woff2'
        } [path.extname(p)] || 'application/octet-stream'
      })
    } catch {
      await r.fulfill({
        status: 404,
        body: 'missing'
      })
    }
  });
  if (seed) await context.addInitScript(seed);
  const page = await context.newPage(),
    errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('https://atlas.test/index.html');
  return {
    context,
    page,
    errors,
    close: () => context.close()
  }
}
const create = p => p.evaluate(() => Atlas.create({
    name: 'نور',
    gender: 'f'
  })),
  go = (p, file) => p.goto('https://atlas.test/' + file);
async function fixture(fn, seed) {
  const x = await fresh(seed);
  try {
    await fn(x)
  } finally {
    await x.close()
  }
}

test('legacy migration retains originals and isolates two children', () => fixture(async ({
  page: p
}) => {
  const r = await p.evaluate(() => {
    const first = Atlas.active().id,
      old = Atlas.storage.getItem('atlas:U01.L01:progress'),
      raw = localStorage.getItem('atlas:U01.L01:progress');
    Atlas.create({
      name: 'ثان',
      gender: 'f'
    });
    const empty = Atlas.storage.getItem('atlas:U01.L01:progress');
    Atlas.storage.setItem('atlas:U01.L01:stars', '5');
    Atlas.select(first);
    return {
      old,
      raw,
      empty,
      current: Atlas.storage.getItem('atlas:U01.L01:progress'),
      count: Atlas.profiles().length
    }
  });
  assert.equal(r.old, r.raw);
  assert.equal(r.current, r.old);
  assert.equal(r.empty, null);
  assert.equal(r.count, 2)
}, () => {
  if (!localStorage.getItem('atlas:accounts:v1')) {
    localStorage.setItem('atlas:profile', JSON.stringify({
      name: 'قديم',
      gender: 'm'
    }));
    localStorage.setItem('atlas:U01.L01:progress', '{"q":{"ok":true}}')
  }
}));

test('full backup preserves audio, drawing and grades and rejects tampering', () => fixture(async ({
  page: p
}) => {
  await create(p);
  const r = await p.evaluate(async () => {
    await Atlas.setPin('1234');
    Atlas.storage.setItem('atlas:U01.L01:drawing', '"data:image/png;base64,AA=="');
    Atlas.storage.setItem('atlas:U01.unit:ded', JSON.stringify({
      audio: 'data:audio/webm;codecs=opus;base64,AA==',
      text: 'شرح'
    }));
    Atlas.storage.setItem('atlas:U01:rubric', '{"q":2}');
    const b = await Atlas.backup(),
      bad = JSON.parse(JSON.stringify(b));
    bad.payload.profiles[0].profile.name = 'changed';
    let rejected = false;
    try {
      await Atlas.restore(JSON.stringify(bad))
    } catch {
      rejected = true
    }
    const unchanged = Atlas.profiles().length === 1;
    await Atlas.restore(JSON.stringify(b));
    return {
      rejected,
      unchanged,
      count: Atlas.profiles().length,
      drawing: JSON.parse(Atlas.storage.getItem('atlas:U01.L01:drawing')),
      audio: JSON.parse(Atlas.storage.getItem('atlas:U01.unit:ded')).audio,
      grade: JSON.parse(Atlas.storage.getItem('atlas:U01:rubric')).q,
      locked: !Atlas.guardianUnlocked()
    }
  });
  assert.deepEqual(r, {
    rejected: true,
    unchanged: true,
    count: 2,
    drawing: 'data:image/png;base64,AA==',
    audio: 'data:audio/webm;codecs=opus;base64,AA==',
    grade: 2,
    locked: true
  })
}));

test('quota failure rolls back import without a partial account', () => fixture(async ({
  page: p
}) => {
  await create(p);
  const r = await p.evaluate(async () => {
    await Atlas.setPin('1234');
    Atlas.storage.setItem('atlas:U01.L01:stars', '3');
    Atlas.storage.setItem('atlas:U01.L01:scene', '2');
    const b = JSON.stringify(await Atlas.backup()),
      before = Object.keys(localStorage).sort(),
      original = Storage.prototype.setItem;
    let n = 0;
    Storage.prototype.setItem = function(k, v) {
      if (k.startsWith('atlas:user:') && ++n === 2) throw new DOMException('full',
      'QuotaExceededError');
      return original.call(this, k, v)
    };
    let rejected = false;
    try {
      await Atlas.restore(b)
    } catch {
      rejected = true
    } finally {
      Storage.prototype.setItem = original
    }
    return {
      rejected,
      same: JSON.stringify(before) === JSON.stringify(Object.keys(localStorage).sort()),
      count: Atlas.profiles().length
    }
  });
  assert.deepEqual(r, {
    rejected: true,
    same: true,
    count: 1
  })
}));

test('guardian gate rejects incorrect PIN and handles unknown unit hash', () => fixture(async ({
  page: p,
  errors
}) => {
  await create(p);
  await go(p, 'review.html#unknown');
  assert.equal(await p.locator('#main').isVisible(), false);
  await p.fill('#guardianPin', '1234');
  await p.fill('#guardianConfirm', '1234');
  await p.click('#guardianGo');
  await p.waitForFunction(() => Atlas.guardianUnlocked());
  // رمز الاستعادة يظهر مرة واحدة، ولا تُفتح الشاشة قبل أن يؤكد ولي الأمر أنه كتبه (المراجعة 20، ن-1)
  await p.waitForSelector('#recoveryBox', { state: 'visible' });
  assert.match(await p.locator('#recShow').innerText(), /^[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/);
  assert.equal(await p.locator('#main').isVisible(), false);
  assert.equal(await p.locator('#recCont').isDisabled(), true);
  await p.check('#recDone');
  await p.click('#recCont');
  assert.equal(await p.locator('#recShow').innerText(), '', 'الرمز لا يبقى في الصفحة');
  assert.equal(await p.locator('#main').isVisible(), true);
  assert.equal(await p.evaluate(() => cur), 'U01');
  await p.click('#lockGuardian');
  await p.fill('#guardianPin', '0000');
  await p.click('#guardianGo');
  await p.waitForFunction(() => document.querySelector('#guardianMsg').textContent);
  assert.equal(await p.locator('#main').isVisible(), false);
  assert.deepEqual(errors, [])
}));

test('editing an answer invalidates its manual grade', () => fixture(async ({
  page: p
}) => {
  await create(p);
  await p.evaluate(async () => {
    await Atlas.setPin('1234');
    Atlas.storage.setItem('atlas:U01.L01:open_C3', '"الإجابة الأولى"')
  });
  await go(p, 'review.html');
  const selector = '[data-k="U01.L01.C3"][data-n="2"]';
  await p.locator(selector).click();
  assert.equal(await p.locator(selector).getAttribute('aria-pressed'), 'true');
  await p.evaluate(() => Atlas.storage.setItem('atlas:U01.L01:open_C3', '"إجابة جديدة"'));
  await p.reload();
  // مغادرة شاشة ولي الأمر (ومنها إعادة التحميل) تقفلها
  assert.equal(await p.evaluate(() => Atlas.guardianUnlocked()), false);
  await p.fill('#guardianPin', '1234');
  await p.click('#guardianGo');
  assert.equal(await p.locator(selector).getAttribute('aria-pressed'), 'false')
}));

test('saved open answers and dedication inputs remain literal text', () => fixture(async ({
  page: p,
  errors
}) => {
  await create(p);
  await go(p, 'U01.L01.html');
  await p.evaluate(() => {
    store.set('open_C3', '</textarea><img id="injected">');
    show(SCENES.findIndex(x => x.id === 'q_open'))
  });
  assert.equal(await p.locator('#injected').count(), 0);
  assert.match(await p.locator('#ans').inputValue(), /injected/);
  await p.evaluate(() => {
    for (const id of ['U01.L01', 'U01.L02']) Atlas.storage.setItem('atlas:' + id + ':finished', 'true');
    Atlas.storage.setItem('atlas:U01.unit:ded', JSON.stringify({
      who: '"><img id="injected">',
      plan: '</textarea><img id="injected">',
      text: '</textarea><img id="injected">'
    }))
  });
  await go(p, 'U01.unit.html');
  for (const id of ['who', 'prep', 'record', 'cert']) {
    await p.evaluate(id => show(SCENES.findIndex(x => x.id === id)), id);
    assert.equal(await p.locator('#injected').count(), 0)
  }
  assert.deepEqual(errors, [])
}));

test('repeated clicks cannot inflate delayed recall score', () => fixture(async ({
  page: p,
  errors
}) => {
  await create(p);
  await p.evaluate(() => {
    Atlas.storage.setItem('atlas:U01.L02:finished', 'true');
    Atlas.storage.setItem('atlas:U01.L02:finishedAt', JSON.stringify(Date.now() - 4 * 864e5))
  });
  // عودة الذاكرة في صفحة اختبار الدرس؛ كل سؤال: الجواب الصحيح يُضغط عشر مرات
  await go(p, 'U01.T02.html#recall');
  assert.equal(await p.evaluate(() => SCENES[idx].id), 'rgate');
  const ids = await p.evaluate(() => LD.recall.filter(it => (it.level || 'A') !== 'B').map(it => it.id));
  for (const id of ids) {
    await p.evaluate(() => show(idx + 1, 1));
    await p.waitForTimeout(50);
    await p.evaluate(() => {
      const it = LD.recall.find(x => x.id === SCENES[idx].id);
      if (it.type === 'locate_on_atlas') {
        const a = ATLAS[it.atlas_target];
        if (a && !a.choice) { const h = [...document.querySelectorAll('.hot')].find(h => a.ids.includes(h.dataset.id)); for (let n = 0; n < 10; n++) h.click(); return; }
        const b = document.querySelector('.opt[data-i="' + (a ? a.answer : 0) + '"]'); for (let n = 0; n < 10; n++) b.click(); return;
      }
      const b = document.querySelector('.opt[data-i="' + it.answer + '"]');
      for (let n = 0; n < 10; n++) b.click();
    });
  }
  await p.evaluate(() => show(SCENES.findIndex(s => s.id === 'rend'), 1));
  const r = await p.evaluate(() => store.get('recall', null));
  assert.equal(r.ok, ids.length);
  assert.equal(r.n, ids.length);
  assert.equal(await p.evaluate(() => store.get('stars', 0)) <= ids.length + 1, true);
  assert.deepEqual(errors, [])
}));

test('late microphone permission and scene timers cannot leak after navigation', () => fixture(async ({
  page: p,
  errors
}) => {
  await create(p);
  await go(p, 'U03.L04.html');
  await p.evaluate(() => {
    window.stopped = 0;
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: () => new Promise(resolve => window.resolveMic = () => resolve({
          getTracks: () => [{
            stop: () => window.stopped++
          }]
        }))
      }
    });
    show(SCENES.findIndex(s => s.id === 'exp'))
  });
  await p.click('#recBtn');
  await p.evaluate(() => {
    sceneTimeout(() => window.timerLeaked = true, 50);
    show(0);
    resolveMic()
  });
  await p.waitForTimeout(100);
  assert.equal(await p.evaluate(() => stopped), 1);
  assert.equal(await p.evaluate(() => !!window.timerLeaked), false);
  assert.deepEqual(errors, [])
}));

test('recording persists audio and releases the microphone on navigation', () => fixture(async ({
  page: p,
  errors
}) => {
  await create(p);
  await go(p, 'U03.L04.html');
  await p.evaluate(() => {
    window.stopped = 0;
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: async () => ({
          getTracks: () => [{
            stop: () => window.stopped++
          }]
        })
      }
    });
    window.MediaRecorder = class {
      static isTypeSupported() {
        return true
      }
      constructor(s, o) {
        this.mimeType = o?.mimeType || 'audio/webm';
        this.state = 'inactive'
      }
      start() {
        this.state = 'recording'
      }
      stop() {
        if (this.state === 'inactive') return;
        this.state = 'inactive';
        this.ondataavailable({
          data: new Blob(['sample'], {
            type: this.mimeType
          })
        });
        setTimeout(() => this.onstop(), 0)
      }
    };
    show(SCENES.findIndex(s => s.id === 'exp'))
  });
  await p.click('#recBtn');
  await p.waitForFunction(() => document.querySelector('#recBtn').classList.contains('stop'));
  await p.click('#recBtn');
  await p.waitForFunction(() => store.get('teach', {}).audio);
  assert.match(await p.evaluate(() => store.get('teach', {}).audio), /^data:audio\//);
  assert.equal(await p.evaluate(() => stopped), 1);
  await p.click('#recBtn');
  await p.waitForFunction(() => document.querySelector('#recBtn').classList.contains('stop'));
  await p.evaluate(() => show(0));
  await p.waitForTimeout(30);
  assert.equal(await p.evaluate(() => stopped), 2);
  assert.deepEqual(errors, [])
}));

test('all 21 lessons render every scene for both genders and levels', () => fixture(async ({
  page: p,
  errors
}) => {
  await create(p);
  let count = 0;
  const files = fs.readdirSync(root).filter(x => /^U\d\d\.L\d\d\.html$/.test(x));
  for (const file of files) {
    await go(p, file);
    for (const gender of ['m', 'f'])
      for (const lv of ['A', 'B']) count += await p.evaluate(({
        gender,
        lv
      }) => {
        profile.gender = gender;
        level = lv;
        for (let i = 0; i < SCENES.length; i++) {
          show(i);
          // لا علامة تذكير أو تأنيث ظاهرة في أي مشهد، للجنسين والمستويين
          if (/\{[^{}|]*\|[^{}]*\}/.test(document.querySelector('#main').innerText)) throw new Error('marker in ' + LESSON.id + ' scene ' + SCENES[i].id + ' ' + gender + lv);
        }
        return SCENES.length
      }, {
        gender,
        lv
      })
  }
  assert.equal(files.length, 21);
  // العدد يتغير مع المحتوى؛ المهم أن كل درس عُرض كاملاً بلا خطأ (نحو 30 مشهداً × 4 تشغيلات لكل درس)
  assert.ok(count >= 21 * 4 * 20, 'rendered ' + count);
  assert.deepEqual(errors, []);
  console.log('RENDERED', count)
}));

test('account picker creates edits and switches accounts through UI', () => fixture(async ({
  page: p,
  errors
}) => {
  await p.click('#newAccount');
  await p.fill('#nm', 'كريم');
  await p.click('[data-g="m"]');
  await p.click('#go');
  await p.click('#chg');
  await p.fill('#nm', 'كريم أحمد');
  await p.click('#go');
  assert.equal(await p.evaluate(() => Atlas.profiles().length), 1);
  await p.click('#switchAccount');
  await p.click('#newAccount');
  await p.fill('#nm', 'فرح');
  await p.click('[data-g="f"]');
  await p.click('#go');
  assert.equal(await p.evaluate(() => Atlas.profiles().length), 2);
  await p.click('#switchAccount');
  await p.locator('#accountList button').filter({
    hasText: 'كريم أحمد'
  }).click();
  assert.match(await p.locator('#hello').innerText(), /كريم أحمد/);
  assert.deepEqual(errors, [])
}));

test('invalid data shapes are rejected despite a valid checksum', () => fixture(async ({
  page: p
}) => {
  await create(p);
  const r = await p.evaluate(async () => {
    await Atlas.setPin('1234');
    const b = await Atlas.backup();
    b.payload.profiles[0].data['atlas:U01.L01:progress'] = '"invalid"';
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(b
      .payload)));
    b.sha256 = Array.from(new Uint8Array(hash), x => x.toString(16).padStart(2, '0')).join('');
    let rejected = false;
    try {
      await Atlas.restore(JSON.stringify(b))
    } catch {
      rejected = true
    }
    return {
      rejected,
      count: Atlas.profiles().length
    }
  });
  assert.deepEqual(r, {
    rejected: true,
    count: 1
  })
}));

test('cell diagram stays colored and supports Enter selection', () => fixture(async ({
  page: p,
  errors
}) => {
  await create(p);
  await go(p, 'U05.L01.html');
  await p.evaluate(() => {
    level = 'B';
    show(SCENES.findIndex(s => s.id === 'U05.L01.C2'))
  });
  /* الخلية صورة (Servier) والمناطق شفافة فوقها: لا تلوين يكشف الجواب */
  assert.equal(await p.locator('.cell-map image').count(), 1);
  assert.equal(await p.locator('.cell-map [data-id="nucleus"] .zone').evaluate(e => getComputedStyle(e).fill),
    'rgba(255, 255, 255, 0)');
  await p.locator('.cell-map [data-id="membrane"]').focus();
  await p.keyboard.press('Enter');
  assert.equal(await p.locator('#nextBtn').isDisabled(), false);
  assert.deepEqual(errors, [])
}));
