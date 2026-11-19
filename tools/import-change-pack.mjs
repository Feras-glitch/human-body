// يدمج «حزمة تعديلات» من استوديو جسم الإنسان (المحرر والمراجعان) في المستودع.
//   node tools/import-change-pack.mjs <حزمة.json>            يعرض ما سيحدث ولا يغيّر شيئاً
//   node tools/import-change-pack.mjs <حزمة.json> --apply    يطبّق ثم يفحص كل درس تغيّر (validate)، ويتراجع عن الدرس إن فشل
// التعديلات: لكل حقل نصه الأصلي في الحزمة؛ إن لم يطابق ما في الملف الآن (تغيّر بعد التصدير) يُترك «تعارضاً».
//   الحقول المقفلة (نص الآية ومرجعها ودرجتها، ونصوص الأحاديث) تُرفض دائماً، كما في الاستوديو.
// المراجعات: تُكتب في reviews/<الدرس>.json باسم المراجع وتاريخه (الأحدث لكل بند ومراجع).
//   لا تغيّر هذه الأداة علامة reviewed في أي درس: الاعتماد البشري يُثبته صاحب المشروع بنفسه بعد قراءة المراجعات.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { lessonFields, getAt, setAt } from './lesson-fields.mjs';

const [file, ...flags] = process.argv.slice(2);
if (!file || !existsSync(file)) { console.error('الاستعمال: node tools/import-change-pack.mjs <حزمة.json> [--apply]'); process.exit(2); }
const apply = flags.includes('--apply');
const P = JSON.parse(readFileSync(file, 'utf8'));
if (P.type !== 'humanbody-change-pack' || P.version !== 1) { console.error('الملف ليس حزمة تعديلات من الاستوديو'); process.exit(1); }

const byLesson = new Map();
for (const e of P.edits || []) { if (!/^U\d\d\.L\d\d$/.test(e.lesson)) continue; (byLesson.get(e.lesson) || byLesson.set(e.lesson, []).get(e.lesson)).push(e); }
const report = { applied: [], conflict: [], locked: [], invalid: [], failed: [] };

for (const [id, list] of byLesson) {
  const path = `lessons/${id}.json`; if (!existsSync(path)) { list.forEach((e) => report.invalid.push(`${id}: درس غير موجود`)); continue; }
  const before = readFileSync(path, 'utf8'), L = JSON.parse(before);
  const fields = new Map(lessonFields(L).map((f) => [JSON.stringify(f.path), f]));
  let changed = 0;
  for (const e of list) {
    const tag = `${id} ${(e.path || []).join('.')}`;
    const f = fields.get(JSON.stringify(e.path));
    if (!f) { report.invalid.push(`${tag}: ليس حقل نص قابلاً للتعديل`); continue; }
    if (f.lock) { report.locked.push(`${tag}: ${f.lock}`); continue; }
    if (getAt(L, e.path) !== e.old) { report.conflict.push(`${tag}: تغيّر النص في المستودع بعد التصدير`); continue; }
    if (typeof e.new !== 'string' || !e.new.trim()) { report.invalid.push(`${tag}: نص فارغ`); continue; }
    setAt(L, e.path, e.new); changed++;
    report.applied.push(`${tag}\n      قبل: ${e.old}\n      بعد: ${e.new}${e.note ? `\n      السبب: ${e.note}` : ''} (${e.by || P.by})`);
  }
  if (!apply || !changed) continue;
  writeFileSync(path, JSON.stringify(L, null, 2) + '\n');
  try { execFileSync('node', ['tools/validate.mjs', path], { stdio: 'pipe' }); }
  catch (err) {
    writeFileSync(path, before);
    const out = String(err.stdout || '') + String(err.stderr || '');
    report.failed.push(`${id}: رُدّت تعديلاته كلها لأن الفحص فشل:\n      ${out.split('\n').filter((l) => /✗|خطأ|Error/.test(l)).slice(0, 8).join('\n      ')}`);
    report.applied = report.applied.filter((a) => !a.startsWith(id + ' '));
  }
}

const revs = (P.reviews || []).filter((r) => /^U\d\d\.L\d\d$/.test(r.lesson) && ((['sci', 'faith'].includes(r.role) && ['ok', 'fix'].includes(r.verdict)) || (r.role === 'teach' && r.verdict === 'note')));
if (apply && revs.length) {
  mkdirSync('reviews', { recursive: true });
  const by = new Map(); for (const r of revs) (by.get(r.lesson) || by.set(r.lesson, []).get(r.lesson)).push(r);
  for (const [id, list] of by) {
    const f = `reviews/${id}.json`, cur = existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : { lesson: id, note: 'مراجعات بشرية من استوديو جسم الإنسان. لا تُثبت علامة reviewed في الدرس إلا بيد صاحب المشروع.', entries: [] };
    for (const r of list) {
      const k = `${r.role}|${r.by || P.by}|${JSON.stringify(r.path)}`;
      cur.entries = cur.entries.filter((x) => `${x.role}|${x.by}|${JSON.stringify(x.path)}` !== k);
      cur.entries.push({ role: r.role, by: r.by || P.by, at: r.at, path: r.path, verdict: r.verdict, note: r.note || '', text: r.text || '' });
    }
    cur.entries.sort((a, b) => String(a.at).localeCompare(String(b.at)));
    writeFileSync(f, JSON.stringify(cur, null, 2) + '\n');
  }
}

console.log(`حزمة ${P.by || '؟'} (${P.created || ''}، محتوى ${P.content || '؟'}): ${(P.edits || []).length} تعديلاً، ${(P.reviews || []).length} مراجعة`);
const sec = (t, a) => { if (a.length) console.log(`\n${t} (${a.length}):\n  ` + a.join('\n  ')); };
sec(apply ? 'طُبّق' : 'سيُطبَّق', report.applied); sec('تعارض (يُراجع يدوياً)', report.conflict); sec('مقفل (رُفض)', report.locked);
sec('لا يصلح', report.invalid); sec('رُدّ لفشل الفحص', report.failed);
const ok = revs.filter((r) => r.verdict === 'ok').length, tn = revs.filter((r) => r.role === 'teach').length;
console.log(`\nالمراجعات: ${ok} «سليم»، ${revs.length - ok - tn} ملاحظة مراجع، ${tn} ملاحظة معلم${revs.some((r) => r.path === '*') ? '، واعتماد درس كامل' : ''}${apply ? ' → reviews/' : ''}. علامات reviewed لم تُغيَّر.`);
if (apply && report.applied.length) console.log('التالي: npm run build، ثم node tools/generate.mjs للدروس المعدّلة، ثم npm test.');
