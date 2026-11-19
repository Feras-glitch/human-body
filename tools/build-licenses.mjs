#!/usr/bin/env node
// صفحة «المصادر والرخص» (المراجعة 20، ن-17): app/v2/licenses.html من licenses/credits.json ونصوص الرخص في licenses/.
// تُحزم مع التطبيق، فتصل نصوص الرخص كاملة مع كل نسخة (ومنها إشعار Tanzil الذي تشترط شروطه إرفاقه)،
// وتفتحها «عن التطبيق» في شاشة ولي الأمر وقائمة «مساعدة» في ويندوز.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const credits = JSON.parse(readFileSync('licenses/credits.json', 'utf8'));
const files = [...new Set(credits.map((c) => c.file).filter(Boolean))];
for (const f of files) if (!existsSync(`licenses/${f}`)) throw new Error(`licenses/${f} غير موجود`);

const rows = credits.map((c) => `<li><b>${esc(c.what)}:</b> ${esc(c.who)}.<br><span class="lic">${esc(c.license)}${c.url ? ` — <span dir="ltr">${esc(c.url.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</span>` : ''}${c.file ? ` — <a href="#${esc(c.file)}">النص الكامل</a>` : ''}</span></li>`).join('\n');
const texts = files.map((f) => `<details id="${esc(f)}"><summary>${esc(f)}</summary><pre dir="ltr">${esc(readFileSync(`licenses/${f}`, 'utf8').replace(/^﻿/, ''))}</pre></details>`).join('\n');

const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8"><meta name="color-scheme" content="light only">
<meta http-equiv="Content-Security-Policy" content="object-src 'none'; base-uri 'none'; form-action 'none'">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- مولَّد: tools/build-licenses.mjs من licenses/ — لا يُعدَّل يدوياً -->
<title>المصادر والرخص</title>
<link rel="stylesheet" href="fonts/app-fonts.css">
<style>
:root{--bg:#FFF6E3;--card:#fff;--ink:#2A2422;--muted:#5F544D;--line:#F0E3CF;--teal-d:#155E56}
body{margin:0;background:var(--bg);color:var(--ink);font-family:'IBM Plex Sans Arabic','Noto Sans SC',sans-serif;line-height:1.75}
main{max-width:860px;margin:0 auto;padding:16px}
h1{font-family:'Baloo Bhaijaan 2','IBM Plex Sans Arabic',sans-serif;color:var(--teal-d);margin:8px 0 4px}
ul{background:var(--card);border-radius:18px;padding:12px 30px 12px 16px;box-shadow:0 3px 0 var(--line)}
li{margin:8px 0}
.lic{color:var(--muted);font-size:.92rem}
details{background:var(--card);border-radius:14px;margin:8px 0;padding:8px 12px;box-shadow:0 2px 0 var(--line)}
summary{cursor:pointer;font-weight:600}
pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:.8rem;line-height:1.5;text-align:left}
a{color:var(--teal-d)}
</style>
</head>
<body><main>
<p><a href="index.html">العودة للحسابات</a> · <a href="review.html">شاشة ولي الأمر</a></p>
<h1>المصادر والرخص</h1>
<p>يعمل التطبيق بلا إنترنت؛ العناوين أدناه للإحالة إلى المصادر لا روابط تُفتح منه.</p>
<ul>
${rows}
</ul>
<h2>نصوص الرخص كاملة</h2>
${texts}
</main></body></html>
`;
writeFileSync('app/v2/licenses.html', html);
console.log('app/v2/licenses.html —', credits.length, 'مصادر،', files.length, 'نصوص رخص');
