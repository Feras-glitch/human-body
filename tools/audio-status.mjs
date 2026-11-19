#!/usr/bin/env node
// تقرير حالة التسجيل: لكل درس، ولعبارات الواجهة المشتركة (common)، ما سُجّل في app/v2/audio/<الدرس>/ وما ينقص وما تغيّر نصه (بصمة مختلفة)
// نطق المصطلحات (term.<id>.<ar|en|zh>.mp3) لا يُعدّ ملفاً قديماً
import { readFileSync, existsSync, readdirSync } from 'node:fs';
const ids = [...readdirSync('lessons').filter(f => f.endsWith('.json')).map(f => f.replace('.json', '')).sort(), 'common'];
let tot = 0, have = 0, stale = 0;
for (const id of ids) {
  const mf = `build/${id}/audio-manifest.json`; if (!existsSync(mf)) continue;
  const m = JSON.parse(readFileSync(mf, 'utf8'));
  const dir = `app/v2/audio/${id}`; const files = existsSync(dir) ? readdirSync(dir) : [];
  const wanted = new Set(m.items.map(i => i.file.replace(/^.*\//, '').replace(/\.mp3$/, '')));
  const ok = m.items.filter(i => files.some(n => n.startsWith(i.file.replace(/^.*\//, '').replace(/\.mp3$/, '') + '.'))).length;
  const orphan = files.filter(n => !/^term\./.test(n) && ![...wanted].some(w => n.startsWith(w + '.')));
  tot += m.items.length; have += ok; stale += orphan.length;
  console.log(`${id}: ${ok}/${m.items.length} مسجّل (${m.words} كلمة)${orphan.length ? `؛ ${orphan.length} ملفاً قديماً تغيّر نصه: ${orphan.slice(0,3).join(', ')}` : ''}`);
}
console.log(`الإجمالي: ${have}/${tot} نصاً مسجّلاً، ${stale} ملفاً قديماً`);
