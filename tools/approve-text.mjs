#!/usr/bin/env node
// اعتماد نص شرعي بعد المراجعة البشرية: node tools/approve-text.mjs U03.L01 closing "اسم المراجع" [ملاحظة]
import { readFileSync, writeFileSync } from 'node:fs';
const [id, pos, by, note] = process.argv.slice(2);
if (!id || !['opening','closing'].includes(pos) || !by) { console.error('الاستعمال: approve-text.mjs <U##.L##> <opening|closing> "<اسم المراجع>" [ملاحظة]'); process.exit(1); }
const p = `lessons/${id}.json`; const L = JSON.parse(readFileSync(p, 'utf8'));
const t = L.faith?.[pos]; if (!t) { console.error('لا نص في هذا الموضع'); process.exit(1); }
t.reviewed = true; t.reviewed_by = by; t.reviewed_on = new Date().toISOString().slice(0,10); if (note) t.review_note = note;
L.version.changelog = L.version.changelog || []; L.version.changelog.push(`${t.reviewed_on} — اعتماد شرعي (${pos}): ${by}${note ? ' — ' + note : ''}`);
writeFileSync(p, JSON.stringify(L, null, 2) + '\n');
console.log(`${id}.${pos} معتمد — ${by} — ${t.reviewed_on}. أعد التوليد: node tools/generate.mjs ${p}`);
