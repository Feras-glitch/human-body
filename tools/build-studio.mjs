// بيانات «استوديو جسم الإنسان» (المرحلة 1: المعلق الصوتي): قوائم التسجيل كما يولّدها generate.mjs
// (build/<الدرس>/audio-manifest.json والقائمة المشتركة build/common/)، ومع كل نص بصمته (app/v2/audio-key.js)
// وسياقه من ملف الدرس: أين يُقال، وعلى أي سؤال أو خيار يردّ. تُكتب في studio/data.js.
//   node tools/build-studio.mjs
// القرآن ليس في قوائم التسجيل أصلاً (التلاوة لها طريقها)، فلا يصل إلى الاستوديو.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { lessonFields } from './lesson-fields.mjs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { audioKey } = require('../app/v2/audio-key.js');

const J = (p) => JSON.parse(readFileSync(p, 'utf8'));
const ids = readdirSync('lessons').filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort();
const clip = (t, n = 140) => { t = String(t || '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n) + '…' : t; };
const plain = (t) => String(t || '').replace(/\{([^|{}]*)\|([^|{}]*)\}/g, '$1').replace(/\{اسم\}،?\s*/g, '');

function findById(o, id) {
  if (!o || typeof o !== 'object') return null;
  if (o.id === id) return o;
  for (const k in o) { const r = findById(o[k], id); if (r) return r; }
  return null;
}

const SECTION = [
  [/^title$/, 'عنوان الدرس'],
  [/^driving_question$/, 'سؤال الدرس الكبير'],
  [/^hook$/, 'الافتتاح'],
  [/^central_fact$/, 'الحقيقة الكبرى في الدرس'],
  [/^explain\.(\w+)$/, (m) => `الشرح ${m[1]}`],
  [/^experiment\.title$/, 'التجربة: عنوانها'],
  [/^experiment\.step(\d+)$/, (m) => `التجربة: الخطوة ${m[1]}`],
  [/^experiment\.safety(\d+)$/, (m) => `التجربة: تنبيه سلامة ${m[1]}`],
  [/^experiment\.explain$/, 'التجربة: لماذا حدث ذلك'],
  [/^notebook$/, 'دفتري (نشاط كتابي أو رسم)'],
  [/^how_we_know$/, 'كيف عرفنا؟'],
  [/^how_we_know\.limit$/, 'كيف عرفنا؟ — سؤال حدود النموذج'],
  [/^organ_letter$/, 'رسالة على لسان العضو'],
  [/^history\.(\d+)\.(who|did|method)$/, (m) => `علماء حضارتنا ${m[1]}: ${{ who: 'الاسم', did: 'ماذا فعل', method: 'طريقته' }[m[2]]}`],
  [/^life\.(\d+)\.(situation|action|why)$/, (m) => `في حياتي ${m[1]}: ${{ situation: 'الموقف', action: 'ماذا أفعل', why: 'لماذا' }[m[2]]}`],
  [/^open\.(\d+)\.(q|why)$/, (m) => `سؤال مفتوح ${m[1]}${m[2] === 'why' ? ': لماذا ما زال مفتوحاً' : ''}`],
  [/^faith\.(opening|closing)\.(lead|text|reflection)$/, (m) => `${m[1] === 'opening' ? 'افتتاح' : 'ختام'} الإيمان: ${{ lead: 'سند الحديث', text: 'متن الحديث', reflection: 'التأمل' }[m[2]]}`],
  [/^number\./, 'أرقام مدهشة'],
  [/^size\./, 'الحجم الحقيقي'],
  [/^scene\./, 'جملة يقولها لمّاح أو الراوي في مشهد'],
  [/^hadith\./, 'حديث نبوي: متنه كما في سجل الأحاديث، يُقرأ بتأنٍّ وضبط ولا تُغيَّر منه كلمة'],
];

function describe(L, key) {
  const base = key.replace(/\.(m|f)$/, '');
  const c = base.match(/^concept\.(.+)\.def$/);
  if (c) { const t = (L.concepts || []).find((x) => x.id === c[1]); return { section: `تعريف المصطلح «${t ? t.term.ar : c[1]}»` }; }
  const it = base.match(/^item\.(.+?)((?:\.(?:alt|atlas|hint|why|opt\d+))*)$/);
  if (it) {
    const q = findById(L, it[1]) || {};
    const parts = it[2].split('.').filter(Boolean);
    const alt = parts.includes('alt'), Q = alt ? (q.alt || {}) : q;
    const level = /\.A\d+\./.test(it[1]) ? 'سؤال التقويم' : /\.C\d+$/.test(it[1]) ? 'سؤال التحقق' : 'سؤال التدريب';
    const head = `${level}${alt ? ' (المحاولة الثانية)' : ''}`;
    const ctx = Q.prompt ? `السؤال: ${clip(plain(Q.prompt))}` : '';
    const opt = parts.find((p) => /^opt\d+$/.test(p));
    if (opt) { const n = +opt.slice(3), o = (Q.options || [])[n]; return { section: `${head}: ردّ حين يختار الطفل خياراً خاطئاً`, ctx: `${ctx}${o != null ? `\nالخيار الخاطئ: «${clip(plain(typeof o === 'string' ? o : o.text || o.label || ''))}»` : ''}` }; }
    if (parts.includes('hint')) return { section: `${head}: تلميح`, ctx };
    if (parts.includes('why')) return { section: `${head}: شرح الجواب الصحيح بعد الإجابة`, ctx };
    if (parts.includes('atlas')) return { section: `${head}: السؤال على خريطة الجسم` };
    return { section: `${head}: نص السؤال` };
  }
  for (const [re, lab] of SECTION) { const m = base.match(re); if (m) return { section: typeof lab === 'function' ? lab(m) : lab }; }
  return { section: base };
}

const SAY_SECTION = 'عبارة عامة في الواجهة (تُسمع في كل الدروس قبل نص الدرس أو بعده)';
const lessons = [];
const pack = (lesson, title, unit, items, L) => ({
  id: lesson, title, unit,
  items: items.map((x) => {
    const d = L ? describe(L, x.key) : { section: SAY_SECTION };
    return { akey: audioKey(x.text), file: x.file, key: x.key, g: x.gender || '', text: x.text, section: d.section, ctx: d.ctx || '' };
  }).filter((x) => x.akey),
});
if (existsSync('build/common/audio-manifest.json')) lessons.push(pack('common', 'العبارات العامة (سجّلها أولاً: تتكرر في كل الدروس)', '', J('build/common/audio-manifest.json').items, null));
for (const id of ids) {
  const mf = `build/${id}/audio-manifest.json`; if (!existsSync(mf)) continue;
  const L = J(`lessons/${id}.json`);
  const P = pack(id, L.title.ar, L.unit.title?.ar || L.unit.id || '', J(mf).items, L);
  // للمحرر والمراجعين (المرحلة 2): حقول النص في ملف الدرس بمساراتها
  P.fields = lessonFields(L).map((f) => ({ p: f.path, t: f.text, s: f.section, d: f.domain, ...(f.lock ? { lock: f.lock } : {}) }));
  lessons.push(P);
}
const n = lessons.reduce((s, l) => s + l.items.length, 0);
const content = (() => { try { return J('app/v2/build-info.json').content; } catch { return ''; } })();
writeFileSync('studio/data.js', `/* مولَّد: tools/build-studio.mjs — لا يُعدَّل يدوياً */\nwindow.STUDIO_DATA = ${JSON.stringify({ content, lessons })};\n`);
console.log(`studio/data.js: ${lessons.length} قائمة، ${n} نصاً للتسجيل، ${lessons.reduce((s, l) => s + (l.fields || []).length, 0)} حقلاً للتحرير`);
