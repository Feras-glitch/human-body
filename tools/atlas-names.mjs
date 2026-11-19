// ما يراه الطفل في بنود «حدّد على الجسم» (locate_on_atlas)، مقروءاً من شيفرة التطبيق نفسها لا من نسخة ثانية:
// خريطة الأهداف ATLAS في app/v2/lesson-runtime.js، وأسماء مناطق الجسم REGIONS في app/v2/engine.js،
// وأسماء أجزاء الخلية من رسمها. يستعمله كتاب المعلم ليطبع ما يُسأل في التطبيق وجوابه بالعربية (المراجعة 20، إ-1).
import { readFileSync } from 'node:fs';

/** يقتطع كائناً حرفياً يبدأ بعد `const NAME = ` بموازنة الأقواس، متجاوزاً ما داخل النصوص والتعليقات. */
export function literal(src, name) {
  const at = src.indexOf(`const ${name} = {`);
  if (at < 0) throw new Error(`لم يُعثر على ${name}`);
  let i = src.indexOf('{', at), depth = 0, q = null;
  const start = i;
  for (; i < src.length; i++) {
    const c = src[i], n = src[i + 1];
    if (q) { if (c === '\\') { i++; continue; } if (c === q) q = null; continue; }
    if (c === '/' && n === '*') { i = src.indexOf('*/', i + 2) + 1; continue; }
    if (c === '/' && n === '/') { i = src.indexOf('\n', i); continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return src.slice(start, i + 1);
  }
  throw new Error(`${name} غير مكتمل`);
}

export function atlasData(root = 'app/v2') {
  const rt = readFileSync(`${root}/lesson-runtime.js`, 'utf8');
  const en = readFileSync(`${root}/engine.js`, 'utf8');
  const ATLAS = new Function(`return (${literal(rt, 'ATLAS')})`)();
  const REGIONS = new Function(`return (${literal(en, 'REGIONS')})`)();
  const CELL = Object.fromEntries([...rt.matchAll(/data-id="(\w+)" data-ar="([^"]+)"/g)].map((m) => [m[1], m[2]]));
  return { ATLAS, REGIONS, CELL };
}

/** بنود يستبدلها مشهد مؤلَّف يدوياً في app/v2/scenes/<الدرس>.js (window.CUSTOM.replace) فلا تمر بخريطة ATLAS. */
export function customReplaced(lessonId, root = 'app/v2') {
  let src = '';
  try { src = readFileSync(`${root}/scenes/${lessonId}.js`, 'utf8'); } catch { return new Set(); }
  const m = src.match(/replace\s*:\s*\{([^}]*)\}/);
  return new Set(m ? [...m[1].matchAll(/'(U\d\d\.[LT]\d\d\.[A-Z]+\d+[a-z]?)'\s*:/g)].map((x) => x[1]) : []);
}
/** أسماء أهداف المشاهد المؤلَّفة يدوياً (رسم القلب مثلاً) */
const TARGET_AR = { left_ventricle: 'البطين الأيسر', right_atrium: 'الأذين الأيمن', right_ventricle: 'البطين الأيمن', left_atrium: 'الأذين الأيسر',
  knee: 'مفصل الركبة', plasma: 'طبقة البلازما' };

/** البند كما يعرضه التطبيق: السؤال، والخيارات إن كان سؤال اختيار، والجواب نصاً عربياً. */
export function locateView(it, data, custom = false) {
  if (custom) {
    if (!TARGET_AR[it.atlas_target]) throw new Error(`لا اسم عربياً لهدف المشهد الخاص ${it.atlas_target} (${it.id}): أضفه إلى TARGET_AR`);
    return { prompt: it.prompt, answer: TARGET_AR[it.atlas_target], how: 'يلمسه الطفل على رسم خاص بهذا البند' };
  }
  const a = data.ATLAS[it.atlas_target];
  if (!a) throw new Error(`هدف ${it.atlas_target} (${it.id}) ليس في ATLAS: لا يعرف التطبيق كيف يسأله`);
  const prompt = a.q || it.prompt;
  if (a.choice) return { prompt, options: a.choice, answer: a.answer, how: 'سؤال اختيار' };
  const names = [...new Set(a.ids.map((id) => data.REGIONS[id]?.ar || data.CELL[id] || id))];
  return { prompt, answer: names.join(' أو '), how: a.cell ? 'يلمسه الطفل على رسم الخلية' : 'يلمسه الطفل على رسم الجسم' };
}
