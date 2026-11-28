// حقول النص في ملف الدرس كما يراها الاستوديو (المحرر والمراجعان) وأداة دمج حزم التعديلات.
// كل حقل: مساره في ملف الدرس (مصفوفة مفاتيح)، ونصه، والقسم بالعربية، والمجال (علمي أو شرعي)، وهل هو مقفل.
// المقفل لا يُعدَّل من الاستوديو أبداً: نص الآية ومرجعها ودرجتها (من سجل الآيات المعتمد وحده)، وكل ما يحدد نصاً شرعياً.
// والمستبعد لا يظهر أصلاً: سجل التغييرات والروابط والناشرون ومعرّفات الربط.

const AR = /[؀-ۿ]/;
const SKIP = new Set(['id', 'changelog', 'publisher', 'url', 'version', 'matn_note', 'quran_key', 'hadith_key', 'key', 'image', 'img', 'file']);
const TOP = {
  title: 'عنوان الدرس', driving_question: 'سؤال الدرس الكبير', scope: 'نطاق الدرس', objectives: 'أهداف الدرس', concepts: 'المصطلحات',
  science: 'المحتوى العلمي', misconceptions: 'التصورات الخاطئة', experiment: 'التجربة', flow: 'مسار الدرس', organ_letter: 'رسالة العضو',
  passport: 'جواز المعرفة', find_the_error: 'اكتشف الخطأ', true_size: 'الحجم الحقيقي', history: 'علماء حضارتنا', faith: 'الإيمان',
  assessment: 'التقويم', teacher: 'دليل المعلم', sources: 'المصادر', life_application: 'في حياتي', unit: 'الوحدة', unit_review: 'مراجعة الوحدة',
};
const FLOW = { hook: 'الافتتاح', explain: 'الشرح', practice: 'التدريب', check: 'التحقق', notebook: 'دفتري', how_we_know: 'كيف عرفنا' };

export const domainOf = (path) => (path[0] === 'faith' || (path[0] === 'life_application' && path.includes('quran')) ? 'faith' : 'sci');

export function lockOf(L, path) {
  if (path[0] === 'faith' && ['text', 'reference', 'grade', 'usage'].includes(path[path.length - 1])) return 'نص شرعي من السجل المعتمد: يُعدَّل في السجل لا في الدرس';
  if (path[0] === 'faith' && path[1] === 'values') return null;
  if (path.includes('highlight')) return 'تظليل كلمات الآية: من نص الآية نفسه';
  if (path[0] === 'concepts' && ['en', 'zh'].includes(path[path.length - 1])) return null;
  return null;
}

export function sectionOf(L, path) {
  const top = TOP[path[0]] || path[0];
  if (path[0] === 'concepts' && typeof path[1] === 'number') { const c = L.concepts[path[1]]; return `${top}: «${c?.term?.ar || ''}»`; }
  if (path[0] === 'flow' && path[1]) {
    const f = FLOW[path[1]] || path[1];
    if (typeof path[2] === 'number') { const x = L.flow[path[1]][path[2]]; return `${top}: ${f} ${x && x.id ? x.id.split('.').pop() : path[2] + 1}`; }
    return `${top}: ${f}`;
  }
  if (path[0] === 'faith' && path[1]) return `${top}: ${{ opening: 'الافتتاح', closing: 'الختام', values: 'القيم' }[path[1]] || path[1]}`;
  if (typeof path[1] === 'number') return `${top} ${path[1] + 1}`;
  return top;
}

/** حقول النص العربية في الدرس */
export function lessonFields(L) {
  const out = [];
  (function walk(o, path) {
    if (typeof o === 'string') {
      if (!AR.test(o)) return;
      out.push({ path, text: o, section: sectionOf(L, path), domain: domainOf(path), lock: lockOf(L, path) || '' });
      return;
    }
    if (!o || typeof o !== 'object') return;
    if (Array.isArray(o)) { o.forEach((v, i) => walk(v, [...path, i])); return; }
    for (const k of Object.keys(o)) { if (SKIP.has(k) || k === 'reviewed') continue; walk(o[k], [...path, k]); }
  })(L, []);
  return out;
}

export const getAt = (o, path) => path.reduce((x, k) => (x == null ? undefined : x[k]), o);
export function setAt(o, path, v) { const last = path[path.length - 1]; const parent = getAt(o, path.slice(0, -1)); if (parent == null || !(last in parent)) throw new Error('مسار غير موجود'); parent[last] = v; }
