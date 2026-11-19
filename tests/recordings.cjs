// التسجيل البشري (D09، المراجعة 20 ن-20): ملف في app/v2/audio/<الدرس>/ يطابق بصمة النص المسموع يُشغَّل بدل القارئ الآلي،
// وملف نص تغيّر لا يُربط، وملف متعذّر يعود منه إلى القارئ الآلي. يُبنى الدرس في نسخة مؤقتة فيها تسجيل تجريبي.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');

const REPO = path.resolve(__dirname, '..');
const { audioKey } = require(path.join(REPO, 'app/v2/audio-key.js'));
const man = JSON.parse(fs.readFileSync(path.join(REPO, 'build/U03.L01/audio-manifest.json'), 'utf8'));
const hookF = man.items.find((i) => i.key === 'hook.f');
const hookM = man.items.find((i) => i.key === 'hook.m');
const e2 = man.items.find((i) => i.key.startsWith('explain.E2'));
const common = JSON.parse(fs.readFileSync(path.join(REPO, 'build/common/audio-manifest.json'), 'utf8'));
const praiseF = common.items.find((i) => i.key === 'praise.f');
const notThisF = common.items.find((i) => i.key === 'not_this');
// بند اختيار في U03.L01 يعرضه التطبيق بمشهده العام، ولشرحه وردّ خيار خاطئ فيه نص في القائمة
const L = JSON.parse(fs.readFileSync(path.join(REPO, 'lessons/U03.L01.json'), 'utf8'));
const CUSTOM = fs.readFileSync(path.join(REPO, 'app/v2/scenes/U03.L01.js'), 'utf8');
const item = [...L.flow.practice, ...L.flow.check].find((it) => ['choose', 'choose_reason'].includes(it.type) && !CUSTOM.includes(`'${it.id}'`) && it.feedback_by_option && Object.keys(it.feedback_by_option).length && (it.feedback_correct || it.explanation));
const whyKey = `item.${item.id}.${item.feedback_correct ? 'ok' : 'why'}`;
const whyRec = man.items.find((i) => i.key === whyKey || i.key === whyKey + '.f');
const wrongI = +Object.keys(item.feedback_by_option)[0];
const optRec = man.items.find((i) => i.key === `item.${item.id}.opt${wrongI}` || i.key === `item.${item.id}.opt${wrongI}.f`);
let tmp, browser;

before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hb-rec-'));
  for (const d of ['lessons', 'tools', 'hadith', 'quran', 'app', 'packaging/desktop']) fs.cpSync(path.join(REPO, d), path.join(tmp, d), { recursive: true });
  for (const d of ['build/U03.L01', 'build/common']) { fs.mkdirSync(path.join(tmp, d), { recursive: true }); fs.copyFileSync(path.join(REPO, d, 'audio-manifest.json'), path.join(tmp, d, 'audio-manifest.json')); }
  const dir = path.join(tmp, 'app/v2/audio/U03.L01'), cdir = path.join(tmp, 'app/v2/audio/common');
  fs.mkdirSync(dir, { recursive: true }); fs.mkdirSync(cdir, { recursive: true });
  // تسجيلات تجريبية (لا تُشغَّل فعلاً): افتتاح البنت وشرح البند وردّ خيار خاطئ ببصمة النص الحالي، وشرح E2 ببصمة نص قديم،
  // ونطق مصطلح؛ ومن العبارات المشتركة «أحسنتِ!» وحدها، لا «ليس هذا.»
  for (const name of [hookF.file, whyRec.file, optRec.file, `U03.L01/${e2.key}.0000000000.mp3`, 'U03.L01/term.heart.zh.mp3', praiseF.file]) fs.writeFileSync(path.join(tmp, 'app/v2/audio', name), 'ID3');
  execFileSync('node', ['tools/build-scenes.mjs'], { cwd: tmp, stdio: 'pipe' });
  browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined, args: process.env.CI ? ['--no-sandbox'] : [] });
});
after(async () => { await browser?.close(); if (tmp) fs.rmSync(tmp, { recursive: true, force: true }); });

// يسجّل ما يُشغَّل من ملفات وما يُقرأ بالقارئ الآلي، بلا صوت حقيقي
const FAKE = `
  window.__played = []; window.__tts = [];
  const RealAudio = window.Audio;
  window.Audio = function (src) { const a = { src, onended: null, onerror: null, pause() {}, play() { window.__played.push(src); setTimeout(() => window.__failAudio ? (a.onerror && a.onerror()) : (a.onended && a.onended()), 5); return Promise.resolve(); } }; return a; };
  const fakeVoice = { name: 'ar', lang: 'ar-SA', localService: true, default: true };
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { getVoices: () => [fakeVoice], speak: (u) => window.__tts.push(u.text), cancel() {}, pause() {}, resume() {} } });
  window.SpeechSynthesisUtterance = function (t) { this.text = t; };
`;

async function lessonAs(gender, { failAudio = false } = {}) {
  const ctx = await browser.newContext();
  await ctx.addInitScript(FAKE + (failAudio ? 'window.__failAudio = true;' : ''));
  const page = await ctx.newPage();
  await page.goto('file://' + path.join(tmp, 'app/v2/index.html'));
  await page.evaluate((g) => { Atlas.create({ name: 'نور', gender: g }); }, gender);
  await page.goto('file://' + path.join(tmp, 'app/v2/U03.L01.html'));
  await page.waitForFunction(() => typeof SCENES !== 'undefined' && document.querySelector('#main .scene'));
  return { ctx, page };
}
const showScene = (page, id) => page.evaluate((s) => show(SCENES.findIndex((x) => x.id === s)), id);

test('ن-20: the build maps only recordings whose fingerprint matches the current text (an old text\'s file is left out)', () => {
  const html = fs.readFileSync(path.join(tmp, 'app/v2/U03.L01.html'), 'utf8');
  const map = JSON.parse(html.match(/window\.AUDIO = (\{.*?\});/)[1]);
  assert.deepEqual(map, { [audioKey(hookF.text)]: 'audio/' + hookF.file, [audioKey(whyRec.text)]: 'audio/' + whyRec.file, [audioKey(optRec.text)]: 'audio/' + optRec.file,
    [audioKey(praiseF.text)]: 'audio/' + praiseF.file, 'term.heart.zh': 'audio/U03.L01/term.heart.zh.mp3' });
  assert.match(fs.readFileSync(path.join(tmp, 'app/v2/U03.T01.html'), 'utf8'), /window\.AUDIO = \{"/, 'صفحة الاختبار تحمل الخريطة نفسها');
  // في المستودع لا تسجيلات بعد: الخريطة فارغة في كل صفحة
  for (const f of fs.readdirSync(path.join(REPO, 'app/v2')).filter((x) => /^U\d\d\.[LT]\d\d\.html$/.test(x))) {
    assert.match(fs.readFileSync(path.join(REPO, 'app/v2', f), 'utf8'), /<script src="audio-key\.js"><\/script>[\s\S]*window\.AUDIO = \{\};/, f);
  }
});

test('ن-20: a girl hears the human recording of the hook (her name is not in it); a boy, with no recording for his form, hears the synthetic voice', async () => {
  assert.match(fs.readFileSync(path.join(REPO, 'lessons/U03.L01.json'), 'utf8'), /"text": "\{اسم\}، تخيّل/, 'الافتتاح يبدأ بنداء الاسم');
  let { ctx, page } = await lessonAs('f');
  await showScene(page, 'hook');
  await page.click('#spkBtn');
  assert.deepEqual(await page.evaluate(() => window.__played), ['audio/' + hookF.file]);
  assert.deepEqual(await page.evaluate(() => window.__tts), []);
  await ctx.close();

  ({ ctx, page } = await lessonAs('m'));
  assert.notEqual(audioKey(hookM.text), audioKey(hookF.text));
  await showScene(page, 'hook');
  await page.click('#spkBtn');
  assert.deepEqual(await page.evaluate(() => window.__played), []);
  const said = await page.evaluate(() => window.__tts);
  assert.equal(said.length, 1);
  assert.match(said[0], /نور\s*، تخيّل أنك ركضت/);
  await ctx.close();
});

test('ن-20: a recording that fails to load falls back to the synthetic voice for the same text', async () => {
  const { ctx, page } = await lessonAs('f', { failAudio: true });
  await showScene(page, 'hook');
  await page.click('#spkBtn');
  await page.waitForFunction(() => window.__tts.length === 1);
  assert.deepEqual(await page.evaluate(() => window.__played), ['audio/' + hookF.file]);
  assert.match((await page.evaluate(() => window.__tts))[0], /تخيّلي أنكِ ركضتِ/);
  await ctx.close();
});

test('ن-20: the recording key ignores markup, punctuation, diacritics and the vocative name, and changes with any word', () => {
  const t = 'هذا الصدر، ويحميه القفص الصدري.';
  assert.equal(audioKey('<p>هذا  الصدر ويحميه القفص الصدري</p>'), audioKey(t));
  assert.equal(audioKey('<bdi data-raw>سارة</bdi>، ' + t), audioKey(t));
  assert.equal(audioKey(t + ' يا <bdi data-raw>سارة</bdi>'), audioKey(t));
  assert.equal(audioKey('هَذَا الصَّدْرُ، وَيَحْمِيهِ القَفَصُ الصَّدْرِيُّ'), audioKey(t));
  assert.notEqual(audioKey('هذا الصدر، ويحميه القفص الضلعي.'), audioKey(t));
  assert.equal(audioKey('…'), '');
});

test('ن-20: a composed reply plays its recorded parts in order (shared «أحسنتِ!» then the item\'s own explanation); a part with no recording sends the whole reply to the synthetic voice', async () => {
  const { ctx, page } = await lessonAs('f');
  await showScene(page, item.id);
  await page.click(`.opt[data-i="${item.answer}"]`);
  await page.waitForFunction(() => window.__played.length >= 2);
  assert.deepEqual(await page.evaluate(() => window.__played), ['audio/' + praiseF.file, 'audio/' + whyRec.file]);
  assert.deepEqual(await page.evaluate(() => window.__tts), []);
  await ctx.close();

  // «ليس هذا.» لم تُسجَّل: الرد كله بالقارئ الآلي، ولو سُجّل ردّ الخيار نفسه
  const b = await lessonAs('f');
  await showScene(b.page, item.id);
  await b.page.click(`.opt[data-i="${wrongI}"]`);
  await b.page.waitForFunction(() => window.__tts.length === 1);
  assert.deepEqual(await b.page.evaluate(() => window.__played), []);
  assert.match((await b.page.evaluate(() => window.__tts))[0], /^ليس هذا\. /);
  await b.ctx.close();
});

test('ن-20: the recording lists hold every spoken part: shared phrases from the engine\'s own table in both forms, per-option replies, second-chance items, atlas questions, and fixed custom-scene lines', async () => {
  const engine = fs.readFileSync(path.join(REPO, 'app/v2/engine.js'), 'utf8');
  const SAY = new Function('return ' + engine.match(/const SAY = (\{[\s\S]*?\n\});/)[1])();
  for (const [k, t] of Object.entries(SAY)) {
    const keys = common.items.filter((i) => i.key === k || i.key.startsWith(k + '.')).map((i) => i.key);
    assert.deepEqual(keys, /\{[^{}]*\|[^{}]*\}/.test(t) ? [k + '.m', k + '.f'] : [k], k);
  }
  assert.equal(common.items.find((i) => i.key === 'test_intro.f').text, 'اختبار قصير. أجيبي وحدكِ، والمحاولة الأولى هي التي تُحسب.');
  assert.ok(optRec, 'ردّ الخيار الخاطئ في قائمة الدرس');
  const all = (id) => JSON.parse(fs.readFileSync(path.join(REPO, 'build', id, 'audio-manifest.json'), 'utf8')).items;
  assert.ok(all('U03.L01').some((i) => /^item\.U03\.L01\.[A-Z]\d[a-z.]*\.alt$|^item\.U03\.L01\.A\d\.[a-z]\.alt(\.[mf])?$/.test(i.key)), 'بنود المحاولة الثانية');
  assert.ok(all('U01.L01').some((i) => /\.atlas(\.[mf])?$/.test(i.key) && /^حدّد/.test(i.text)), 'سؤال خريطة الجسم');
  assert.ok(all('U03.L01').some((i) => i.key.startsWith('scene.') && /لُب\. دُب/.test(i.text)), 'سطر ثابت من المشهد المؤلَّف');
  assert.ok(!all('U03.L01').some((i) => /\(بعد [^)]*\)/.test(i.text)), 'عودة الذاكرة بلا «(بعد…)» كما يُنطق');
  const sheet = fs.readFileSync(path.join(REPO, 'build/U03.L01/recording-sheet.md'), 'utf8');
  assert.match(sheet, /U03\.L01\/term\.heart\.ar\.mp3/);
});
