#!/usr/bin/env node
// يبني build/index.html من قائمة الدروس المبنية
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
// استعمال: node tools/build-index.mjs [U01] [out.html] — تصفية بوحدة (لعدة بلا إنترنت) ومسار إخراج اختياري
const unit = process.argv[2] || null; const outPath = process.argv[3] || 'build/index.html';
const ids = readdirSync('build').filter(d => /^U\d{2}\.L\d{2}$/.test(d) && (!unit || d.startsWith(unit))).sort();
const list = ids.map(id => { const L = JSON.parse(readFileSync(`lessons/${id}.json`,'utf8')); const checks=[...L.flow.practice,...L.flow.check].map(i=>i.id); return { id, title: L.title.ar, unit: L.unit.id, unitTitle: L.unit.title, check_ids: checks, concepts: (L.concepts||[]).map(c=>c.term.ar) }; });
const tpl = readFileSync('app/index-template.html','utf8');
writeFileSync(outPath, tpl.replace('/*__LESSONS__*/', JSON.stringify(list)));
console.log(outPath, '—', list.length, 'دروس');
