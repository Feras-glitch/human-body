/* اختبارات غلافي التوزيع: جسر أندرويد (android-bridge.js) وغلاف ويندوز (Electron main.js).
   لا جهاز ولا Electron هنا: الجسر يُشغَّل في Chromium مع AndroidApp مزيّف، وmain.js يُحمَّل مع وحدة electron مزيّفة. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const Module = require('module');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');

const BRIDGE = fs.readFileSync(path.join(__dirname, '../packaging/android/android-bridge.js'), 'utf8');

test('Android bridge: speech, Arabic voice check, print and file export go through AndroidApp', async (t) => {
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.addInitScript(() => {
    window.__calls = [];
    window.AndroidApp = {
      speak: (t, l, r) => window.__calls.push(['speak', t, l, r]),
      stop: () => window.__calls.push(['stop']),
      isSpeaking: () => false,
      ttsArabic: () => window.__arabic !== false,
      print: () => window.__calls.push(['print']),
      saveFile: (name, type, b64) => window.__calls.push(['save', name, type, b64]),
    };
  });
  await page.addInitScript(BRIDGE);
  await page.route('https://bridge.test/', (r) => r.fulfill({ body: '<!doctype html><meta charset="utf-8"><body></body>', contentType: 'text/html' }));
  await page.goto('https://bridge.test/');
  const r = await page.evaluate(async () => {
    const u = new SpeechSynthesisUtterance('مرحبا');
    u.lang = 'ar-SA';
    let started = false;
    u.onstart = () => (started = true);
    speechSynthesis.speak(u);
    speechSynthesis.cancel();
    const voices = speechSynthesis.getVoices().map((v) => v.lang);
    window.__arabic = false;
    const none = speechSynthesis.getVoices().length;
    print();
    const a = document.createElement('a');
    a.download = 'atlas-backup.json';
    a.href = 'data:application/json;base64,' + btoa('{"x":1}');
    document.body.append(a);
    a.click();
    await new Promise((res) => setTimeout(res, 300));
    return { calls: window.__calls, started, voices, none };
  });
  assert.deepEqual(r.calls[0], ['speak', 'مرحبا', 'ar-SA', 1]);
  assert.deepEqual(r.calls[1], ['stop']);
  assert.equal(r.started, true);
  assert.deepEqual(r.voices, ['ar']);
  assert.equal(r.none, 0, 'no Arabic voice → engine sees no voice and shows its note');
  assert.ok(r.calls.some((c) => c[0] === 'print'));
  const save = r.calls.find((c) => c[0] === 'save');
  assert.ok(save, 'download link goes to AndroidApp.saveFile');
  assert.equal(save[1], 'atlas-backup.json');
  assert.equal(Buffer.from(save[3], 'base64').toString(), '{"x":1}');
});

test('Electron wrapper: isolation on, microphone only from local pages, outside links leave the window', async () => {
  const mainPath = path.join(__dirname, '../packaging/desktop/main.js');
  const WWW = path.join(path.dirname(mainPath), 'www');
  const seen = { prefs: null, perm: null, check: null, nav: null, open: null, external: [] };
  let ready;
  const fake = {
    app: {
      setName() {}, setAppUserModelId() {}, requestSingleInstanceLock: () => true, quit() {}, on() {},
      getVersion: () => '0', getPath: () => '/tmp',
      whenReady: () => new Promise((r) => (ready = r)),
    },
    BrowserWindow: class {
      constructor(o) {
        seen.prefs = o.webPreferences;
        this.webContents = {
          setWindowOpenHandler: (f) => (seen.open = f),
          on: (ev, f) => { if (ev === 'will-navigate') seen.nav = f; },
          getURL: () => '',
        };
      }
      once() {} on() {} loadFile() {} loadURL(u) { seen.loaded = u; }
    },
    Menu: { setApplicationMenu() {}, buildFromTemplate: () => ({}) },
    shell: { openExternal: (u) => seen.external.push(u) },
    dialog: {},
    session: { defaultSession: { setPermissionRequestHandler: (f) => (seen.perm = f), setPermissionCheckHandler: (f) => (seen.check = f), on() {} } },
    ipcMain: { handle: (n, f) => { (seen.ipc = seen.ipc || {})[n] = f; } },
    protocol: { handle: () => { seen.intercepted = true; }, unhandle: () => { seen.intercepted = false; } },
    net: {},
  };
  const load = Module._load;
  Module._load = function (req, ...rest) { return req === 'electron' ? fake : load.call(this, req, ...rest); };
  try {
    delete require.cache[require.resolve(mainPath)];
    require(mainPath);
  } finally {
    Module._load = load;
  }
  ready();
  await new Promise((r) => setImmediate(r));

  // حزمة التحديث الموقّعة: لا اعتراض لتحميل الملفات بلا حزمة مثبّتة، والتثبيت من شاشة ولي الأمر وحدها
  assert.ok(!seen.intercepted);
  assert.match(seen.prefs.preload, /preload\.js$/);
  const from = (u) => ({ senderFrame: { url: u } });
  assert.deepEqual(await seen.ipc['hb-update-install'](from(pathToFileURL(path.join(WWW, 'U01.L01.html')).href), new Uint8Array(4)), { ok: false, error: 'غير مسموح.' });
  assert.equal((await seen.ipc['hb-update-install'](from(pathToFileURL(path.join(WWW, 'review.html')).href), new Uint8Array(4))).ok, false);
  assert.equal(seen.prefs.contextIsolation, true);
  assert.equal(seen.prefs.sandbox, true);
  assert.notEqual(seen.prefs.nodeIntegration, true);

  const local = pathToFileURL(path.join(WWW, 'U03.L01.html')).href;
  const wc = (u) => ({ getURL: () => u });
  const ask = (u, perm, details) => new Promise((r) => seen.perm(wc(u), perm, r, details));
  assert.equal(await ask(local, 'media', { mediaTypes: ['audio'] }), true);
  assert.equal(await ask(local, 'media', { mediaTypes: ['video'] }), false);
  assert.equal(await ask(local, 'media', { mediaTypes: ['audio', 'video'] }), false);
  assert.equal(await ask(local, 'geolocation', {}), false);
  assert.equal(await ask('https://example.com/', 'media', { mediaTypes: ['audio'] }), false);
  assert.equal(await ask(pathToFileURL('/etc/x.html').href, 'media', { mediaTypes: ['audio'] }), false);
  assert.equal(seen.check(wc(local), 'media', null, { mediaType: 'audio' }), true);
  assert.equal(seen.check(wc(local), 'media', null, { mediaType: 'video' }), false);

  let prevented = false;
  seen.nav({ preventDefault: () => (prevented = true) }, 'https://example.com/');
  assert.equal(prevented, true);
  assert.deepEqual(seen.external, ['https://example.com/']);
  prevented = false;
  seen.nav({ preventDefault: () => (prevented = true) }, local);
  assert.equal(prevented, false, 'local lesson pages open in the window');
  prevented = false;
  seen.nav({ preventDefault: () => (prevented = true) }, pathToFileURL(path.join(WWW, '..', 'main.js')).href);
  assert.equal(prevented, true, 'files outside www/ are refused');
  assert.deepEqual(seen.open({ url: 'https://example.com/a' }), { action: 'deny' });
});
