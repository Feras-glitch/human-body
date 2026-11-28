#!/usr/bin/env node
// يبني صفحة «من أين أبدأ؟» (اختبار تحديد المستوى الاختياري، قرار 28 نوفمبر): app/v2/placement.html
// سؤالان من كل وحدة، من بنود تقويم الدروس نفسها (اختيار، المستوى أ) بلا نص جديد. الصفحة تقترح وحدة البداية ولا تُلزم.
import { readFileSync, writeFileSync } from 'node:fs';
import { safeJSON } from './safe-json.mjs';

const PICK = {
  U01: ['U01.L01.A2.a', 'U01.L02.A1.a'], U02: ['U02.L01.A1.a', 'U02.L03.A1.b'], U03: ['U03.L01.A2.a', 'U03.L02.A2.a'],
  U04: ['U04.L01.A2.a', 'U04.L02.A1.a'], U05: ['U05.L01.A1.a', 'U05.L02.A1.a'], U06: ['U06.L02.A2.b', 'U06.L06.A1.a'],
  U07: ['U07.L01.A3.a', 'U07.L03.A1.a'], U08: ['U08.L01.A2.b', 'U08.L02.A1.a'], U09: ['U09.L01.A1.a', 'U09.L03.A2.a'],
  U10: ['U10.L01.A1.a', 'U10.L04.A2.a'], U11: ['U11.L02.A1.b', 'U11.L04.A1.a'],
};
const lesson = id => JSON.parse(readFileSync(`lessons/${id}.json`, 'utf8'));
const units = Object.entries(PICK).map(([u, ids]) => {
  const first = lesson(`${u}.L01`);
  const qs = ids.map(iid => {
    const L = lesson(iid.split('.').slice(0, 2).join('.'));
    if (L.visibility === 'parent_unlock') throw new Error(`placement: ${iid} من درس بإذن ولي الأمر`);
    const it = L.assessment.items.find(i => i.id === iid);
    if (!it || it.type !== 'choose' || it.level !== 'A' || !Number.isInteger(it.answer) || !it.options?.length) throw new Error(`placement: البند ${iid} ليس اختياراً من المستوى أ`);
    return { id: 'P.' + iid, prompt: it.prompt, options: it.options, answer: it.answer, why: it.explanation || it.feedback_correct || '', perOption: it.feedback_by_option || null };
  });
  return { id: u, title: first.unit.title, first: first.id, qs };
});
const tpl = readFileSync('app/v2/placement-template.html', 'utf8');
writeFileSync('app/v2/placement.html', tpl.replace('/*__PLACEMENT__*/', safeJSON(units)));
console.log('app/v2/placement.html —', units.length, 'وحدة،', units.reduce((a, u) => a + u.qs.length, 0), 'سؤالاً');
