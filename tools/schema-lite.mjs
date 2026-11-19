// مدقّق JSON Schema صغير بلا اعتماديات، بما يستعمله schema/lesson.schema.json وحده:
// type، enum، pattern، required، properties، patternProperties، additionalProperties، items، minItems، $ref (داخلي).
// format وdescription وtitle للتوثيق ولا تُفحص. (المراجعة 20، ن-8: كان المخطط لا يستعمله شيء.)
export function schemaErrors(schema, data) {
  const errs = [];
  const resolve = (ref) => {
    if (!ref.startsWith('#/')) throw new Error('مرجع خارجي غير مدعوم: ' + ref);
    return ref.slice(2).split('/').reduce((o, k) => o[k.replace(/~1/g, '/').replace(/~0/g, '~')], schema);
  };
  const isType = (t, v) => t === 'object' ? v !== null && typeof v === 'object' && !Array.isArray(v)
    : t === 'array' ? Array.isArray(v) : t === 'integer' ? Number.isInteger(v)
    : t === 'number' ? typeof v === 'number' && Number.isFinite(v) : t === 'null' ? v === null : typeof v === t;
  function walk(s, v, p) {
    if (!s || typeof s !== 'object') return;
    if (s.$ref) return walk(resolve(s.$ref), v, p);
    if (s.type) {
      const ts = Array.isArray(s.type) ? s.type : [s.type];
      if (!ts.some((t) => isType(t, v))) { errs.push(`${p}: نوعه ليس ${ts.join(' أو ')}`); return; }
    }
    if (s.enum && !s.enum.some((e) => JSON.stringify(e) === JSON.stringify(v))) errs.push(`${p}: «${v}» ليس من القائمة ${JSON.stringify(s.enum)}`);
    if (s.pattern && typeof v === 'string' && !new RegExp(s.pattern, 'u').test(v)) errs.push(`${p}: لا يطابق ${s.pattern}`);
    if (Array.isArray(v)) {
      if (s.minItems != null && v.length < s.minItems) errs.push(`${p}: أقل من ${s.minItems} عناصر`);
      if (s.items) v.forEach((x, i) => walk(s.items, x, `${p}[${i}]`));
    } else if (v && typeof v === 'object') {
      for (const r of s.required || []) if (!(r in v)) errs.push(`${p}: ينقصه «${r}»`);
      const props = s.properties || {};
      const pats = Object.entries(s.patternProperties || {}).map(([k, x]) => [new RegExp(k, 'u'), x]);
      for (const [k, x] of Object.entries(v)) {
        let known = false;
        if (Object.prototype.hasOwnProperty.call(props, k)) { walk(props[k], x, `${p}.${k}`); known = true; }
        for (const [re, ps] of pats) if (re.test(k)) { walk(ps, x, `${p}.${k}`); known = true; }
        if (!known && s.additionalProperties === false) errs.push(`${p}: حقل غير معرّف «${k}»`);
        else if (!known && s.additionalProperties && typeof s.additionalProperties === 'object') walk(s.additionalProperties, x, `${p}.${k}`);
      }
    }
  }
  walk(schema, data, '$');
  return errs;
}
