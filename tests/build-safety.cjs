// المراجعة 20، الدفعة 10: ما يمر من الدروس إلى الصفحات، ونوع البناء.
// - المدقّق يرفض وسوم HTML في نص الدرس وجواباً لا يمكن حلّه، والمخطط يصف الدروس الحالية كلها
// - البيانات المضمَّنة في الصفحات لا تغلق وسم <script> ولا تكسر JavaScript (safeJSON)، وكل صفحة بسياسة CSP
// - كل بناء يحمل نوعه وبصمة محتواه، و«الإصدار» يُرفض دون اعتماد المراجعين
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const REPO = path.resolve(__dirname, '..');
const run = (cmd, args, opts = {}) => spawnSync(cmd, args, { cwd: REPO, encoding: 'utf8', ...opts });
const lesson = (id) => JSON.parse(fs.readFileSync(path.join(REPO, 'lessons', id + '.json'), 'utf8'));
function validateVariant(mutate) {
  const L = lesson('U01.L01');
  mutate(L);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hb-val-'));
  const f = path.join(dir, 'U01.L01.json');
  fs.writeFileSync(f, JSON.stringify(L));
  try { return run(process.execPath, ['tools/validate.mjs', f]); } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

test('ن-8: the validator rejects HTML in lesson text, an out-of-range choice and an impossible sequence', () => {
  const ok = validateVariant(() => {});
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);

  const tag = validateVariant((L) => { L.flow.practice[0].prompt += ' <img src=x onerror=alert(1)>'; });
  assert.equal(tag.status, 1);
  assert.match(tag.stdout, /وسم HTML في نص الدرس/);
  const close = validateVariant((L) => { L.flow.check[0].explain = '</script><script>alert(1)</script>'; });
  assert.equal(close.status, 1);
  assert.match(close.stdout, /وسم HTML/);
  // «أصغر من» في الرياضيات ليست وسماً
  const lt = validateVariant((L) => { L.flow.practice[0].prompt += ' (3 < 5)'; });
  assert.equal(lt.status, 0, lt.stdout);

  const L = lesson('U01.L01');
  const choice = [...L.flow.practice, ...L.flow.check].find((it) => ['choose', 'choose_reason', 'predict'].includes(it.type));
  const range = validateVariant((X) => { [...X.flow.practice, ...X.flow.check].find((it) => it.id === choice.id).answer = choice.options.length; });
  assert.equal(range.status, 1);
  assert.match(range.stdout, new RegExp(choice.id.replace(/\./g, '\\.') + '.*(ليس رقم خيار|خارج الخيارات)'));
  // «اختر كل ما…» قائمة أجوبة: في التشخيص الصفي الورقي وحده (U03.L01.Q2)، لا في بنود التطبيق
  const multi = validateVariant((X) => { [...X.flow.practice, ...X.flow.check].find((it) => it.id === choice.id).answer = [0, 1]; });
  assert.equal(multi.status, 1);
  assert.match(multi.stdout, /الاختيار المتعدد في التشخيص الصفي وحده/);
  assert.equal(run(process.execPath, ['tools/validate.mjs', 'lessons/U03.L01.json']).status, 0, 'U03.L01.Q2 تشخيص صفي متعدد الأجوبة');

  const seqLesson = fs.readdirSync(path.join(REPO, 'lessons')).filter((f) => f.endsWith('.json')).map((f) => lesson(f.slice(0, -5)))
    .find((X) => [...X.flow.practice, ...X.flow.check].some((it) => it.type === 'sequence'));
  const seq = [...seqLesson.flow.practice, ...seqLesson.flow.check].find((it) => it.type === 'sequence');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hb-val-'));
  try {
    const bad = JSON.parse(JSON.stringify(seqLesson));
    [...bad.flow.practice, ...bad.flow.check].find((it) => it.id === seq.id).answer = seq.options.map(() => 0);
    const f = path.join(dir, seqLesson.id + '.json');
    fs.writeFileSync(f, JSON.stringify(bad));
    const r = run(process.execPath, ['tools/validate.mjs', f]);
    assert.equal(r.status, 1);
    assert.match(r.stdout, /ليس تبديلاً كاملاً/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('ن-8: the lesson schema describes every current lesson, and catches an unknown objective kind or a hadith grade the lessons may not use', async () => {
  const { schemaErrors } = await import(path.join(REPO, 'tools/schema-lite.mjs'));
  const S = JSON.parse(fs.readFileSync(path.join(REPO, 'schema/lesson.schema.json'), 'utf8'));
  for (const f of fs.readdirSync(path.join(REPO, 'lessons')).filter((x) => x.endsWith('.json'))) {
    assert.deepEqual(schemaErrors(S, lesson(f.slice(0, -5))), [], f);
  }
  const L = lesson('U01.L01');
  L.objectives[0].kind = 'not_a_kind';
  assert.ok(schemaErrors(S, L).some((e) => /kind/.test(e)), 'نوع هدف غير معروف');
  const H = lesson(fs.readdirSync(path.join(REPO, 'lessons')).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5))
    .find((id) => ['opening', 'closing'].some((k) => /^(صحيح|حسن)/.test(lesson(id).faith?.[k]?.grade || ''))));
  const k = ['opening', 'closing'].find((x) => /^(صحيح|حسن)/.test(H.faith[x].grade));
  H.faith[k].grade = 'ضعيف';
  assert.ok(schemaErrors(S, H).some((e) => /grade/.test(e)), 'درجة حديث لا تُقبل في الدرس');
});

test('ن-7: embedded data cannot close the <script> tag or break JavaScript, and every page carries the CSP', async () => {
  const { safeJSON } = await import(path.join(REPO, 'tools/safe-json.mjs'));
  const v = { a: '</script><script>alert(1)</script>', b: 'سطر\u2028فاصل\u2029فقرة', c: '<!-- x -->' };
  const s = safeJSON(v);
  assert.doesNotMatch(s, /</);
  assert.doesNotMatch(s, new RegExp('[\\u2028\\u2029]'));
  assert.deepEqual(JSON.parse(s), v);
  assert.deepEqual(new Function('return ' + s)(), v, 'يُقرأ كما هو داخل <script>');

  const pages = fs.readdirSync(path.join(REPO, 'app/v2')).filter((f) => /\.html$/.test(f) && !/-template\.html$/.test(f));
  assert.ok(pages.length > 40);
  for (const f of pages) {
    const t = fs.readFileSync(path.join(REPO, 'app/v2', f), 'utf8');
    assert.match(t, /<meta http-equiv="Content-Security-Policy" content="object-src 'none'; base-uri 'none'; form-action 'none'">/, f);
    // بيانات الدرس المضمَّنة بلا «<» خام: لا نص في درس يغلق الوسم الذي هو فيه
    for (const m of t.matchAll(/const (LESSON|TERMS|LD) = (\{.*?\}|\[.*?\]);\n/gs)) assert.doesNotMatch(m[2], /</, `${f}: ${m[1]}`);
  }
});

test('م-5: every build carries its kind and content fingerprint; packaging needs a kind and refuses a release without reviewer approval', () => {
  const info = JSON.parse(fs.readFileSync(path.join(REPO, 'app/v2/build-info.json'), 'utf8'));
  const hash = run('node', ['tools/content-hash.mjs']).stdout.trim();
  assert.equal(info.kind, 'dev');
  assert.equal(info.content, hash, 'شغّل npm run build');
  assert.equal(info.version, JSON.parse(fs.readFileSync(path.join(REPO, 'packaging/desktop/package.json'), 'utf8')).version);
  assert.match(fs.readFileSync(path.join(REPO, 'app/v2/build-info.js'), 'utf8'), new RegExp(`window\\.BUILD_INFO = .*"content":"${hash}"`));
  assert.equal(run('node', ['tools/build-info.mjs', '--check']).status, 0);

  // نوع مسودة في مجلد مؤقت: الالتزام والتاريخ يُكتبان
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hb-bi-'));
  try {
    assert.equal(run('node', ['tools/build-info.mjs', dir, 'draft']).status, 0);
    const d = JSON.parse(fs.readFileSync(path.join(dir, 'build-info.json'), 'utf8'));
    assert.equal(d.kind, 'draft');
    assert.match(d.built, /^\d{4}-\d\d-\d\d$/);
    assert.notEqual(run('node', ['tools/build-info.mjs', dir, 'beta']).status, 0, 'نوع غير معروف');
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }

  const env = { ...process.env, BUILD_KIND: '' };
  for (const s of ['packaging/build-android.sh', 'packaging/build-windows.sh']) {
    const none = run('bash', [s], { env });
    assert.equal(none.status, 2, s);
    assert.match(none.stderr, /BUILD_KIND=draft/);
    const rel = run('bash', [s], { env: { ...process.env, BUILD_KIND: 'release' } });
    assert.equal(rel.status, 1, s);
    assert.match(rel.stderr, /رُفض بناء الإصدار/);
    assert.match(rel.stderr, /بلا اعتماد بشري/);
  }
});

test('م-5: the parent screen says which build this is and shows the same fingerprint as the books', async () => {
  const { chromium } = require('playwright');
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined, args: process.env.CI ? ['--no-sandbox'] : [] });
  try {
    const page = await browser.newPage();
    await page.goto('file://' + path.join(REPO, 'app/v2/index.html'));
    await page.evaluate(async () => { await Atlas.ready; Atlas.create({ name: 'نور', gender: 'f' }); await Atlas.setPin('7391'); });
    await page.goto('file://' + path.join(REPO, 'app/v2/review.html'));
    await page.waitForSelector('#about');
    assert.equal(await page.textContent('#buildKind'), 'نسخة تطوير (من المستودع)');
    assert.equal(await page.textContent('#buildHash'), run('node', ['tools/content-hash.mjs']).stdout.trim());
  } finally { await browser.close(); }
});

test('ن-17: every package carries the sources and full license texts, reachable from «About»', () => {
  const lic = fs.readFileSync(path.join(REPO, 'app/v2/licenses.html'), 'utf8');
  assert.match(lic, /PLEASE DO NOT REMOVE OR CHANGE THIS COPYRIGHT BLOCK/, 'إشعار Tanzil كما هو');
  assert.match(lic, /tanzil\.net/);
  assert.match(lic, /King Fahd Glorious Quran Printing Complex/);
  assert.equal((lic.match(/SIL Open Font License, Version 1\.1/g) || []).length, 3, 'رخص الخطوط الثلاثة');
  assert.match(lic, /المنشاوي[\s\S]*قيد التحقق/);
  // خطوط صفحات المصحف (QPC V2): مصدرها وجدول أسمائها كما في ملفاتها (لا نص رخصة فيها)، وشروطها قيد التحقق
  const qcf2 = lic.match(/<details id="KFGQPC-QCF2\.txt">[\s\S]*?<\/details>/)[0];
  for (const t of ['mustafa0x/qpc-fonts', 'Test Font, KFGQPC', 'KFGQPC TEST', 'qul.tarteel.ai']) assert.ok(qcf2.includes(t), t);
  assert.match(lic.match(/<li><b>خط عرض الآيات:<\/b>[^\n]*<\/li>/)[0], /QPC V2[\s\S]*قيد التحقق/);
  assert.match(lic, /<li><b>رموز الآيات في خط الصفحة:<\/b>[^\n]*qul\.tarteel\.ai/);
  assert.match(lic, /CC BY 4\.0/);
  for (const c of JSON.parse(fs.readFileSync(path.join(REPO, 'licenses/credits.json'), 'utf8'))) assert.ok(lic.includes(c.what), c.what);
  const review = fs.readFileSync(path.join(REPO, 'app/v2/review.html'), 'utf8');
  assert.match(review, /<a href="licenses\.html">المصادر والرخص كاملة<\/a>/);
  assert.match(fs.readFileSync(path.join(REPO, 'packaging/desktop/main.js'), 'utf8'), /label: 'المصادر والرخص', click: go\('licenses\.html'\)/);
});

test('ن-19: the Windows installer never force-closes the app in front of a parent, removes only what it installed, and asks before deleting children\'s data', () => {
  const nsi = fs.readFileSync(path.join(REPO, 'packaging/desktop/installer.nsi'), 'utf8');
  const code = nsi.split('\n').filter((l) => !/^\s*;/.test(l)).join('\n');
  assert.doesNotMatch(code, /RMDir \/r "\$INSTDIR"\s*$/m, 'لا حذف لمجلد التثبيت بكامله');
  assert.equal((code.match(/taskkill \/F/g) || []).length, 1, 'الإغلاق القسري في فرع الصمت وحده');
  assert.match(code, /IfSilent silent[\s\S]*MB_RETRYCANCEL[\s\S]*silent:[\s\S]*taskkill \/F/);
  assert.match(code, /MB_YESNO\|MB_ICONQUESTION\|MB_DEFBUTTON2 "هل تحذف أيضاً تقدّم الأطفال[\s\S]*\/SD IDNO IDNO kept\s*\n\s*RMDir \/r "\$APPDATA\\HumanBodyCurriculum"/);
  assert.match(code, /File "\/oname=HumanBody\.files" "\$\{LIST\}"/);
  const win = fs.readFileSync(path.join(REPO, 'packaging/build-windows.sh'), 'utf8');
  assert.match(win, /ELECTRON_MIN_MAJOR="\$\{ELECTRON_MIN_MAJOR:-4[3-9]\}"/);
  // ن-12: Electron مدعوم، وحزمته الرسمية ببصمتها
  assert.match(fs.readFileSync(path.join(REPO, 'packaging/desktop/electron.sha256'), 'utf8'), /^45\.3\.0 b43b532e712a4323f4224627b73808a039c9769fdf7ba1dbc3cb49c1dbfa350b$/m);
  assert.match(win, /EPIN" != "\$ESUM"[\s\S]*exit 1/);
  assert.match(win, /-DLIST="\$LIST"/);
});
