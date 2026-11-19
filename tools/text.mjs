// ترميز نصوص الطفل: {ذكر|أنثى} للتذكير والتأنيث، {اسم} لاسم الطفل.
// expand(text, gender:'m'|'f', name|null) — name=null يحذف عبارة النداء كلها (للتسجيل الصوتي).
export function expand(text, gender = 'm', name = null) {
  let t = text;
  if (name) t = t.replace(/\{اسم\}/g, name);
  else t = t.replace(/،?\s*يا \{اسم\}/g, '').replace(/\{اسم\}،\s*/g, '').replace(/\{اسم\}/g, '');
  t = t.replace(/\{([^{}|]*)\|([^{}|]*)\}/g, (_, m, f) => gender === 'f' ? f : m);
  return t;
}
export const hasGender = (t) => /\{[^{}|]*\|[^{}|]*\}/.test(t);
export const hasName = (t) => /\{اسم\}/.test(t);
