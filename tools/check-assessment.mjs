#!/usr/bin/env node
// فحص انحيازات بنك الأسئلة (مراجعة 2026-11-05؛ وبدائل المحاولة الثانية منذ 1.2.0): طفل بلا علم يجب ألا يربح بقاعدة شكلية.
// - لا موضع للجواب الصحيح يتجاوز 40% من بنود الاختيار (الورق؛ والتطبيق يخلط الخيارات أيضاً)
// - «خطأ» لا يتجاوز 65% من بنود صح/خطأ، وكل جواب صح/خطأ يبدأ بـ«صح» أو «خطأ» (ثنائي)
// - الخيار الصحيح ليس الأطول وحده في أكثر من 40% من البنود
// - المراجعة 20، إ-2: خيارات فيها كلمة مطلقة («دائماً، أبداً، فقط، وحده، كل شيء، تماماً») أو خيار جامع
//   («لا شيء، كلها، كلاهما…») قلّما كانت الصحيحة، فيحذفها الطفل المتمرّس. يُعدّ ويُقارن بالمتوقع بالصدفة؛ ومنذ إعادة
//   صياغة 110 خيارات (docs/21) هو خطأ: إن كانت 10 خيارات فأكثر والصحيح منها أقل من نصف المتوقع بالصدفة.
//   وبـ --cues-report يُكتب build/assessment-cues.md بالبنود كلها.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
const MC = new Set(['choose', 'choose_reason', 'predict']);
const clean = (t) => String(t || '').replace(/\{([^{}|]*)\|[^{}]*\}/g, '$1');
const banks = { 'التطبيق (أتدرب وأتحقق)': [], 'اختبار الدرس': [], 'عودة الذاكرة': [], 'بدائل المحاولة الثانية': [] };
const errors = [];
for (const f of readdirSync('lessons').filter((x) => x.endsWith('.json')).sort()) {
  const L = JSON.parse(readFileSync('lessons/' + f, 'utf8'));
  banks['التطبيق (أتدرب وأتحقق)'].push(...L.flow.practice, ...L.flow.check);
  banks['اختبار الدرس'].push(...(L.assessment?.items || []));
  banks['عودة الذاكرة'].push(...(L.assessment?.delayed_recall || []));
  banks['بدائل المحاولة الثانية'].push(...(L.assessment?.items || []).filter((it) => it.alt).map((it) => ({ ...it.alt, id: it.id + '.alt', type: it.alt.type || it.type })));
  for (const it of [...L.flow.practice, ...L.flow.check, ...(L.assessment?.items || []), ...(L.assessment?.items || []).filter((x) => x.alt).map((x) => ({ ...x.alt, id: x.id + '.alt', type: x.alt.type || x.type }))]) {
    if (it.type === 'true_false_why' && !/^(صح|صحيح|خطأ)/.test(String(it.answer))) errors.push(`${it.id}: جواب صح/خطأ غير ثنائي («${String(it.answer).slice(0, 30)}…»)`);
    if (MC.has(it.type) && Array.isArray(it.options) && !(Number.isInteger(it.answer) && it.answer >= 0 && it.answer < it.options.length)) errors.push(`${it.id}: رقم الجواب خارج الخيارات`);
  }
}
for (const [name, items] of Object.entries(banks)) {
  const mc = items.filter((it) => MC.has(it.type) && Array.isArray(it.options) && Number.isInteger(it.answer));
  const pos = {}; let longest = 0;
  for (const it of mc) {
    pos[it.answer] = (pos[it.answer] || 0) + 1;
    const lens = it.options.map((o) => clean(o).length), top = Math.max(...lens);
    if (lens[it.answer] === top && lens.filter((l) => l === top).length === 1) longest++;
  }
  const tf = items.filter((it) => it.type === 'true_false_why');
  const tfFalse = tf.filter((it) => /^خطأ/.test(String(it.answer))).length;
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const maxPos = Math.max(0, ...Object.values(pos));
  console.log(`${name}: اختيار ${mc.length} — أكثر موضع ${pct(maxPos, mc.length)}% — الصحيح هو الأطول ${pct(longest, mc.length)}% | صح/خطأ ${tf.length} — «خطأ» ${pct(tfFalse, tf.length)}%`);
  if (pct(maxPos, mc.length) > 40) errors.push(`${name}: موضع واحد يحمل الجواب في ${pct(maxPos, mc.length)}% (الحد 40%)`);
  if (pct(longest, mc.length) > 40) errors.push(`${name}: الخيار الصحيح هو الأطول في ${pct(longest, mc.length)}% (الحد 40%)`);
  if (tf.length && pct(tfFalse, tf.length) > 65) errors.push(`${name}: «خطأ» جواب ${pct(tfFalse, tf.length)}% من صح/خطأ (الحد 65%)`);
}
/* الدليل الشكلي في كلمات الخيار (إ-2) */
const CUES = {
  'كلمة مطلقة': /دائماً|دائما|أبداً|أبدا|فقط|وحده|وحدها|كل شيء|تماماً/,
  'خيار جامع': /^(لا شيء|لا أحد|كلها|كلّها|كلاهما|كلتاهما|جميعها|كل ما سبق|لا هذا ولا ذاك)/,
};
const opts = (n) => (n === 1 ? 'خيار واحد' : n === 2 ? 'خياران' : n >= 3 && n <= 10 ? `${n} خيارات` : `${n} خياراً`);
const all = Object.values(banks).flat().filter((it) => MC.has(it.type) && Array.isArray(it.options) && Number.isInteger(it.answer));
const report = [];
for (const [name, re] of Object.entries(CUES)) {
  let n = 0, right = 0, chance = 0; const rows = [];
  for (const it of all) it.options.forEach((o, i) => {
    if (!re.test(clean(o))) return;
    n++; chance += 1 / it.options.length; if (i === it.answer) right++;
    rows.push(`| ${it.id} | ${clean(o).replace(/\|/g, '/')} | ${i === it.answer ? 'صحيح' : 'خطأ'} |`);
  });
  const ratio = chance ? right / chance : 1;
  console.log(`دليل «${name}»: ${opts(n)}، الصحيح منها ${right}، والمتوقع بالصدفة ${Math.round(chance)}`);
  if (n >= 10 && ratio < 0.5) errors.push(`دليل «${name}»: الخيار الذي فيه ${name} صحيح في ${right} من ${n} (أقل من نصف المتوقع بالصدفة ${Math.round(chance)}): يحذفه الطفل المتمرّس`);
  report.push(`## ${name}\n\n${opts(n)}، الصحيح منها ${right}، والمتوقع بالصدفة ${Math.round(chance)}.\n\n| البند | الخيار | |\n|---|---|---|\n${rows.join('\n')}\n`);
}
if (process.argv.includes('--cues-report')) {
  mkdirSync('build', { recursive: true });
  writeFileSync('build/assessment-cues.md', '# الدليل الشكلي في كلمات الخيارات (المراجعة 20، إ-2)\n\nيولّده `node tools/check-assessment.mjs --cues-report`. البنود التي فيها الخيار بكلمة مطلقة أو خيار جامع، وهل هو الصحيح.\n\n' + report.join('\n'));
  console.log('كُتب build/assessment-cues.md');
}
for (const e of errors) console.log('  ✗ ' + e);
console.log(errors.length ? `FAIL — ${errors.length}` : 'PASS — بنك الأسئلة بلا انحياز شكلي يتجاوز الحدود');
process.exit(errors.length ? 1 : 0);
