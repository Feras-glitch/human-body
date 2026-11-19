// الكتب المطبوعة تطابق التطبيق (المراجعة 20، الدفعة 8): لا علامة تذكير وتأنيث خام، ولا معرّف داخلي جواباً،
// والآية بخط المصحف نفسه الذي في التطبيق، وبصمة المحتوى على الغلاف.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');

const REPO = path.resolve(__dirname, '..');
const RAW = /\{[^{}]*\|[^{}]*\}/;
const lessons = fs.readdirSync(path.join(REPO, 'lessons')).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', ''));

test('ن-10: generated books have no raw {m|f} markers; the teacher book writes both forms and student books one', () => {
  for (const id of lessons) {
    for (const f of ['teacher.md', 'student-boy.md', 'student-girl.md', 'student.md']) {
      const t = fs.readFileSync(path.join(REPO, 'build', id, f), 'utf8');
      const m = t.match(RAW);
      assert.equal(m, null, `${id}/${f}: ${m && m[0]}`);
    }
  }
  const teacher = fs.readFileSync(path.join(REPO, 'build/U02.L02/teacher.md'), 'utf8');
  assert.match(teacher, /تحسم\/تحسمين/);
  assert.match(teacher, /نصوص الطفل مكتوبة هنا بالصيغتين/);
  assert.match(fs.readFileSync(path.join(REPO, 'build/U02.L01/student-girl.md'), 'utf8'), /جسّيه/);
  assert.doesNotMatch(fs.readFileSync(path.join(REPO, 'build/U02.L01/student-boy.md'), 'utf8'), /جسّيه/);
});

test('إ-1: answer keys for «locate on the body» items name the place in Arabic, as the app asks it', () => {
  for (const id of lessons) {
    const t = fs.readFileSync(path.join(REPO, 'build', id, 'teacher.md'), 'utf8');
    const bad = t.match(/الإجابة:\*\* [a-z_][a-z_0-9]*\s*(\(|$)/m);
    assert.equal(bad, null, `${id}: ${bad && bad[0]}`);
  }
  const u01 = fs.readFileSync(path.join(REPO, 'build/U01.L01/teacher.md'), 'utf8');
  assert.match(u01, /\*\*U01\.L01\.A1\.a\*\*[^\n]*\n[^\n]*\n> \*\*الإجابة:\*\* الفخذ/);
  // بند يسأله التطبيق سؤال اختيار يُطبع بخياراته كما في التطبيق
  const u02 = fs.readFileSync(path.join(REPO, 'build/U02.L03/teacher.md'), 'utf8');
  assert.match(u02, /أين تقع العضلة التي تمدّ المرفق؟\n\s+أ\. خلف العضد/);
});

test('ن-3: the PDF builder sets every verse in the app\'s own Mushaf page font (QPC V2), with no fallback for its glyphs, right to left', async () => {
  // يُبنى داخل build/ كما تُبنى الكتب المرفقة (build/pdf)، فالمسار إلى الخطوط نسبي داخل المستودع
  const out = fs.mkdtempSync(path.join(REPO, 'build', '.pdf-test-'));
  execFileSync('python3', ['tools/build-pdf.py', '--out', out, 'U01'], { cwd: REPO });
  const html = path.join(out, 'U01-teacher.html');
  const text = fs.readFileSync(html, 'utf8');
  assert.doesNotMatch(text, /file:\/\/|url\('\/|href='\//, 'لا مسار مطلق خاص بجهاز');
  assert.match(text, /href='\.\.\/\.\.\/app\/v2\/fonts\/qcf2\/qcf2\.css'/);
  assert.match(text, /src:url\('\.\.\/\.\.\/app\/v2\/fonts\/HafsSmart_08\.ttf'\)/);
  const hash = execFileSync('node', ['tools/content-hash.mjs'], { cwd: REPO, encoding: 'utf8' }).trim();
  assert.match(text, new RegExp(`data-content-hash='${hash}'`));
  const V = JSON.parse(fs.readFileSync(path.join(REPO, 'quran/verses.json'), 'utf8'));
  // التظليل على الكلمات نفسها التي يظلّلها التطبيق: أرقام الكلمات (hl_words) ← رموزها في خط الصفحة
  const [, key, a, b] = fs.readFileSync(path.join(REPO, 'build/U01.L02/teacher.md'), 'utf8').match(/<span class="q" data-key="([^"]+)" data-hl="(\d+)-(\d+)">/);
  const span = text.match(new RegExp(`<span class="q" lang="ar" data-key="${key}"[^>]*>(.*?)</span>`))[1];
  const g = V[key].qpc2.glyphs.split(' ');
  assert.deepEqual([...span.matchAll(/<mark>(.*?)<\/mark>/g)].map((m) => m[1]), V[key].qpc2.words.slice(+a, +b + 1).map((i) => g[i]));
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined, args: process.env.CI ? ['--no-sandbox'] : [] });
  try {
    const page = await browser.newPage();
    await page.goto('file://' + html);
    await page.evaluate(() => document.fonts.ready);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
    const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
    const { nodeIds } = await cdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: 'span.q' });
    assert.ok(nodeIds.length >= 2, 'آيات في كتاب المعلم');
    for (const nodeId of nodeIds) {
      const { attributes } = await cdp.send('DOM.getAttributes', { nodeId });
      const key = attributes[attributes.indexOf('data-key') + 1];
      const q = V[key].qpc2;
      // رموز الآية كلها (كلماتها وعلاماتها ورقمها) بخط صفحتها، وما سواها مسافات من Hafs Smart (خط الصفحة لا مسافة فيه،
      // والمسافة في آخر السطر لا تُرسم)
      const n = q.glyphs.split(' ').length, fam = 'QCF2' + String(q.page).padStart(3, '0');
      const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
      const count = Object.fromEntries(fonts.map((f) => [f.familyName, f.glyphCount]));
      assert.equal(count[fam], n, `خطوط الآية ${key}: ` + JSON.stringify(count));
      for (const [f, c] of Object.entries(count)) if (f !== fam) assert.ok(f === 'KFGQPC Hafs Smart' && c <= n - 1, `خطوط الآية ${key}: ` + JSON.stringify(count));
    }
    // ترتيب الحروف: أول حرف في الآية على اليمين وآخرها على اليسار. محارف الخط الخاصة اتجاهها من اليسار،
    // وبلا bidi-override تُطبع الآية مقلوبة الحروف (وُجد في توليد 1.3.0)
    const order = await page.$$eval('span.q', (els) => els.map((el) => {
      const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); const nodes = []; while (w.nextNode()) if (w.currentNode.data.trim()) nodes.push(w.currentNode);
      const first = nodes[0], last = nodes[nodes.length - 1], li = last.data.trimEnd().length - 1, fi = first.data.length - first.data.trimStart().length;
      const r = (n, i) => { const g = document.createRange(); g.setStart(n, i); g.setEnd(n, i + 1); return g.getBoundingClientRect(); };
      const a = r(first, fi), b = r(last, li);
      return { key: el.dataset.key, rtl: a.right > b.left, dir: getComputedStyle(el).direction, bidi: getComputedStyle(el).unicodeBidi };
    }));
    for (const o of order) assert.deepEqual(o, { key: o.key, rtl: true, dir: 'rtl', bidi: 'bidi-override' }, 'ترتيب حروف الآية ' + o.key);
  } finally {
    await browser.close();
    fs.rmSync(out, { recursive: true, force: true });
  }
});
