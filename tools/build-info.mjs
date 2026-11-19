#!/usr/bin/env node
// معلومات البناء (المراجعة 20، ن-11 وم-5): نوعه، والإصدار، وبصمة المحتوى، والالتزام.
//   dev      ما في المستودع (يولّده npm run build)
//   draft    مسودة للعائلة: محتوى لم يعتمده المراجعون؛ يُكتب ذلك في «عن التطبيق» وفي اسم الملف
//   release  إصدار: لا يُبنى إلا بعد اعتماد المراجعين وتطابق الكتب (packaging/build-*.sh)
// الاستعمال: node tools/build-info.mjs [DIR] [KIND]   (يُشغَّل من جذر المستودع؛ DIR افتراضياً app/v2)
//            node tools/build-info.mjs --check      هل بُني app/v2 من الدروس الحالية؟ (تشغّله سكربتات الحزم قبل النسخ)
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { contentHash } from './content-hash.mjs';

if (process.argv[2] === '--check') {
  let built = null;
  try { built = JSON.parse(readFileSync('app/v2/build-info.json', 'utf8')).content; } catch {}
  const now = contentHash();
  if (built !== now) {
    console.error(`التطبيق المبني (app/v2) من محتوى ${built || 'غير معروف'} والدروس الآن ${now}: شغّل npm run build قبل الحزم.`);
    process.exit(1);
  }
  process.exit(0);
}
const dir = process.argv[2] || 'app/v2';
const kind = process.argv[3] || 'dev';
if (!['dev', 'draft', 'release'].includes(kind)) { console.error('نوع بناء غير معروف: ' + kind); process.exit(2); }
const version = JSON.parse(readFileSync('packaging/desktop/package.json', 'utf8')).version;
const info = { kind, version, content: contentHash() };
if (kind !== 'dev') {
  try {
    const dirty = execSync('git status --porcelain', { encoding: 'utf8' }).trim() ? '+' : '';
    info.commit = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim() + dirty;
  } catch {}
  info.built = new Date().toISOString().slice(0, 10);
}
writeFileSync(`${dir}/build-info.js`, `/* مولَّد: tools/build-info.mjs — لا يُعدَّل يدوياً */\nwindow.BUILD_INFO = ${JSON.stringify(info)};\n`);
writeFileSync(`${dir}/build-info.json`, JSON.stringify(info) + '\n');
console.log(`${dir}/build-info.js —`, JSON.stringify(info));
