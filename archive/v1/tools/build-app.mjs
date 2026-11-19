#!/usr/bin/env node
// يحقن بيانات الدرس المولَّدة في قالب التطبيق → build/<id>/app.html
// سياسة الصوت D09: يُفعَّل التسجيل البشري فقط إذا وُجد ملف يطابق بصمة النص في audio/<id>/؛ وإلا يُحذف المفتاح ويقرأ التطبيق بالقارئ الآلي.
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, copyFileSync } from 'node:fs';
const id = process.argv[2] || 'U03.L01';
const data = JSON.parse(readFileSync(`build/${id}/app-data.json`, 'utf8'));
const dir = `audio/${id}`;
const present = existsSync(dir) ? new Set(readdirSync(dir)) : new Set();
let hit = 0, miss = 0;
const audio = {};
for (const [k, f] of Object.entries(data.audio || {})) {
  const base = f.replace(/^.*\//, '').replace(/\.mp3$/, '');
  const found = [...present].find(n => n.startsWith(base + '.'));
  if (found) { audio[k] = `${id}/${found}`; hit++; } else miss++;
}
data.audio = audio;
if (hit) { mkdirSync(`build/${id}/audio/${id}`, { recursive: true }); for (const f of Object.values(audio)) copyFileSync(`audio/${f}`, `build/${id}/audio/${f}`); }
const tpl = readFileSync('app/template.html', 'utf8');
const html = tpl.replace('/*__DATA__*/', JSON.stringify(data).replace(/<\/script/gi, '<\\/script'));
writeFileSync(`build/${id}/app.html`, html);
console.log(`build/${id}/app.html — ${(html.length/1024).toFixed(0)} KB — صوت بشري: ${hit} موجود، ${miss} بالقارئ الآلي`);
