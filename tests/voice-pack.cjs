// استوديو جسم الإنسان، المرحلة 1 (المعلق الصوتي): التسجيل في الاستوديو ← حزمة صوت ← تطبيق الطفل أو المستودع.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');
const { zipStore } = require('../studio/zip.js');
const { audioKey } = require('../app/v2/audio-key.js');

const REPO = path.resolve(__dirname, '..');
const ORIGIN = 'https://atlas.test/';
const TYPES = { '.js': 'application/javascript', '.html': 'text/html', '.css': 'text/css', '.webp': 'image/webp', '.ttf': 'font/ttf', '.json': 'application/json' };
const man = (id) => JSON.parse(fs.readFileSync(path.join(REPO, `build/${id}/audio-manifest.json`), 'utf8'));

let browser;
before(async () => { browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined, args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required', ...(process.env.CI ? ['--no-sandbox'] : [])] }); });
after(async () => browser?.close());

async function site(root, extra = {}) {
  const context = await browser.newContext({ viewport: { width: 420, height: 860 }, acceptDownloads: true });
  await context.route(ORIGIN + '**', (route) => {
    const rel = decodeURIComponent(new URL(route.request().url()).pathname).slice(1) || 'index.html';
    const file = extra[rel] || path.resolve(root, rel);
    if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
    return route.fulfill({ body: fs.readFileSync(file), contentType: TYPES[path.extname(file)] || 'application/octet-stream' });
  });
  return context;
}

test('studio data: every recording-list text is there with its key and context, and no verse text', () => {
  execFileSync('node', ['tools/build-studio.mjs'], { cwd: REPO });
  global.window = {}; delete require.cache[require.resolve('../studio/data.js')]; require('../studio/data.js');
  const D = global.window.STUDIO_DATA;
  const L = D.lessons.find((l) => l.id === 'U01.L01'), M = man('U01.L01');
  assert.equal(L.items.length, M.items.length);
  for (const it of L.items) assert.equal(it.akey, audioKey(it.text));
  const opt = L.items.find((i) => /\.opt\d+$/.test(i.key));
  assert.match(opt.section, /خياراً خاطئاً/); assert.match(opt.ctx, /السؤال: .+\nالخيار الخاطئ: «.+»/);
  assert.ok(D.lessons[0].id === 'common' && D.lessons[0].items.length > 20, 'العبارات العامة أولاً');
  const V = JSON.parse(fs.readFileSync(path.join(REPO, 'quran/verses.json'), 'utf8'));
  const all = D.lessons.flatMap((l) => l.items.map((i) => i.text)).join('\n');
  for (const v of Object.values(V)) assert.ok(!all.includes(v.emlaey), 'لا آية في الاستوديو');
});

test('studio: records a sentence with the microphone, keeps it, and exports a voice pack', async () => {
  const context = await site(path.join(REPO, 'studio'), { 'fonts/app-fonts.css': path.join(REPO, 'app/v2/fonts/app-fonts.css') });
  const page = await context.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(ORIGIN + 'index.html');
  await page.fill('#who', 'معلق تجريبي'); await page.dispatchEvent('#who', 'change');
  await page.click('[data-l="common"]');
  const first = await page.locator('#cur .text').textContent();
  await page.click('#rec'); await page.waitForTimeout(1300); await page.click('#rec');
  await page.waitForFunction(() => window.__studio.have().size === 1);
  assert.notEqual(await page.locator('#cur .text').textContent(), first, 'انتقل إلى التالي غير المسجَّل');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#expL')]);
  const zip = fs.readFileSync(await dl.path());
  const out = path.join(REPO, 'build', '.voice-test.zip'); fs.writeFileSync(out, zip);
  const z = execFileSync('python3', ['-c', 'import zipfile,sys,json;z=zipfile.ZipFile(sys.argv[1]);assert z.testzip() is None;m=json.loads(z.read("manifest.json"));print(json.dumps(m))', out], { encoding: 'utf8' });
  const m = JSON.parse(z);
  assert.equal(m.type, 'humanbody-voice-pack'); assert.equal(m.recorder, 'معلق تجريبي'); assert.equal(m.entries.length, 1);
  assert.equal(m.entries[0].text.trim(), first.trim()); assert.equal(m.entries[0].akey, audioKey(m.entries[0].text));
  assert.deepEqual(errors, []);
  await context.close();
});

test('kids app: the parent imports a voice pack, and the lesson plays the human recording instead of the reader', async () => {
  // حزمة فيها تسجيل لنص يقوله الدرس عند فتحه (سؤال الافتتاح بصيغة البنت)، ومدخلات فاسدة تُترك
  const M = man('U01.L02'); const it = M.items.find((i) => i.key === 'hook.f') || M.items.find((i) => i.key === 'title');
  const wav = fs.readFileSync(path.join(__dirname, 'fixtures/tone.webm')); // نغمة opus/webm صغيرة (CI بلا ffmpeg)
  const entries = [{ akey: audioKey(it.text), name: 'rec/a.webm', mime: 'audio/webm', lesson: 'U01.L02', file: it.file, text: it.text },
    { akey: '../../etc', name: 'rec/b.webm', mime: 'audio/webm' }, { akey: 'deadbeef.1', name: 'rec/c.exe', mime: 'application/x-msdownload' }];
  const zip = zipStore([{ name: 'manifest.json', data: Buffer.from(JSON.stringify({ type: 'humanbody-voice-pack', version: 1, created: '2026-11-16', recorder: 'اختبار', entries })) }, { name: 'rec/a.webm', data: wav }, { name: 'rec/b.webm', data: wav }, { name: 'rec/c.exe', data: wav }]);
  const pack = path.join(REPO, 'build', '.voice-kids.zip'); fs.writeFileSync(pack, Buffer.from(await zip.arrayBuffer()));
  const context = await site(path.join(REPO, 'app/v2'));
  const page = await context.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(ORIGIN + 'index.html'); await page.evaluate(() => window.Atlas?.ready);
  await page.evaluate(() => Atlas.create({ name: 'نور', gender: 'f' }).id);
  const r = await page.evaluate(async (b64) => { const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)); return VoicePack.importPack(new File([bytes], 'p.zip', { type: 'application/zip' })); }, fs.readFileSync(pack).toString('base64'));
  assert.deepEqual([r.added, r.skipped], [1, 2]);
  await page.goto(ORIGIN + 'U01.L02.html'); await page.evaluate(() => window.Atlas?.ready); await page.evaluate(() => VoicePack.ready);
  const got = await page.evaluate((t) => { const raw = t; return { has: VoicePack.has(audioKey(raw)) }; }, it.text);
  assert.ok(got.has);
  // المحرك يختار التسجيل المستورد للنص نفسه، ويشغّله من المخزن
  const played = await page.evaluate((t) => new Promise((res) => { const A = window.Audio; window.Audio = function (src) { const a = new A(src); res(String(src)); return a; }; voice(t, [t]); setTimeout(() => res(null), 3000); }), it.text);
  assert.match(played || '', /^blob:/, 'شُغّل التسجيل المستورد');
  // ونص آخر بلا تسجيل يبقى للقارئ الآلي
  assert.equal(await page.evaluate(() => recordingFor('نص لم يسجله أحد')), null);
  assert.deepEqual(errors, []);
  await context.close();
});

test('repo import: a voice pack is merged under the recording-list file names, and stale texts are left out', () => {
  const M = man('U01.L01'); const it = M.items[0];
  const opus = fs.readFileSync(path.join(__dirname, 'fixtures/tone.webm'));
  const entries = [{ akey: audioKey(it.text), name: 'rec/1.webm', mime: 'audio/webm', lesson: 'U01.L01', key: it.key, file: it.file, text: it.text },
    { akey: audioKey('نص قديم تغيّر'), name: 'rec/2.webm', mime: 'audio/webm', lesson: 'U01.L01', key: 'x', text: 'نص قديم تغيّر' }];
  const { zipStore: zs } = require('../studio/zip.js');
  return zs([{ name: 'manifest.json', data: Buffer.from(JSON.stringify({ type: 'humanbody-voice-pack', version: 1, entries })) }, { name: 'rec/1.webm', data: opus }, { name: 'rec/2.webm', data: opus }]).arrayBuffer().then((ab) => {
    const p = path.join(REPO, 'build', '.voice-repo.zip'); fs.writeFileSync(p, Buffer.from(ab));
    const out = execFileSync('node', ['tools/import-voice-pack.mjs', p, '--dry'], { cwd: REPO, encoding: 'utf8' });
    assert.match(out, /يصلح للدمج: 1/); assert.match(out, /تُرك 1/);
    fs.rmSync(p); for (const f of ['.voice-test.zip', '.voice-kids.zip']) fs.rmSync(path.join(REPO, 'build', f), { force: true });
  });
});
