#!/usr/bin/env node
// هل الكتب المرفقة (build/pdf) من المحتوى الحالي نفسه؟ (المراجعة 20، ن-4)
// لكل وحدة: كتاب المعلم ودفترا الطالب والطالبة، HTML وPDF، وبصمة المحتوى في HTML تساوي بصمة الدروس الآن.
// node tools/check-books.mjs          يخرج بخطأ إن نقص كتاب أو اختلفت البصمة (بوابة الإصدار)
// node tools/check-books.mjs --warn   ينبّه فقط (التطوير اليومي)
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { contentHash } from './content-hash.mjs';

const warn = process.argv.includes('--warn');
const hash = contentHash();
const units = [...new Set(readdirSync('lessons').filter((f) => /^U\d\d\.L\d\d\.json$/.test(f)).map((f) => f.slice(0, 3)))].sort();
const problems = [];
for (const u of units) {
  for (const k of ['teacher', 'student-boy', 'student-girl']) {
    const h = `build/pdf/${u}-${k}.html`, p = `build/pdf/${u}-${k}.pdf`;
    if (!existsSync(h) || !existsSync(p)) { problems.push(`${u}-${k}: غير موجود`); continue; }
    const m = readFileSync(h, 'utf8').match(/data-content-hash='([0-9a-f]+)'/);
    if (!m) problems.push(`${u}-${k}: بلا بصمة محتوى (بُني قبل 1.3.0)`);
    else if (m[1] !== hash) problems.push(`${u}-${k}: بصمته ${m[1]} والمحتوى الآن ${hash}`);
    if (statSync(p).mtimeMs + 5000 < statSync(h).mtimeMs) problems.push(`${u}-${k}: PDF أقدم من HTML (لم يُشغَّل tools/html2pdf.js)`);
  }
}
if (!problems.length) { console.log(`الكتب المطبوعة من المحتوى الحالي (${hash})، ${units.length} وحدات.`); process.exit(0); }
console.log((warn ? 'تنبيه' : 'خطأ') + ': الكتب المطبوعة لا تطابق المحتوى الحالي:\n- ' + problems.join('\n- ') +
  '\nأعد بناءها: for f in lessons/*.json; do node tools/generate.mjs $f; done && python3 tools/build-pdf.py && node tools/html2pdf.js');
process.exit(warn ? 0 : 1);
