#!/usr/bin/env node
// يركّب ملفات تلاوة الآيات في app/v2/audio/quran ويتحقق من اكتمالها.
// الاستعمال: node tools/quran-audio.mjs [مجلد فيه ملفات باسم SSSAAA.mp3 كما في everyayah.com، مثل 017036.mp3]
// بلا مجلد: يفحص الموجود فقط. يخرج برمز 1 إن نقصت آية من آيات quran/verses.json.
import { readFileSync, readdirSync, copyFileSync, mkdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const V = JSON.parse(readFileSync('quran/verses.json', 'utf8'));
const OUT = 'app/v2/audio/quran';
mkdirSync(OUT, { recursive: true });
const src = process.argv[2];
const isMp3 = (f) => { const b = readFileSync(f); return b.length > 2000 && ((b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33) || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0)); };
if (src) for (const f of readdirSync(src)) {
  const m = f.match(/(\d{3})(\d{3})\.mp3$/i); if (!m) continue;
  const key = `${+m[1]}:${+m[2]}`;
  if (!V[key]) { console.warn('⚠ ليست من آيات المنهج، تُركت:', f); continue; }
  if (!isMp3(join(src, f))) { console.error('✗ ليس ملف mp3 صالحاً:', f); process.exitCode = 1; continue; }
  copyFileSync(join(src, f), join(OUT, `${+m[1]}-${+m[2]}.mp3`)); console.log('✔', f, '→', `${+m[1]}-${+m[2]}.mp3`);
}
let missing = 0, bytes = 0;
for (const k of Object.keys(V)) {
  const f = join(OUT, k.replace(':', '-') + '.mp3');
  if (existsSync(f) && isMp3(f)) bytes += statSync(f).size; else { missing++; console.log('— ناقصة:', `سورة ${V[k].surah_ar} ${V[k].ayah}`, `(${String(V[k].surah_no).padStart(3, '0')}${String(V[k].ayah).padStart(3, '0')}.mp3)`); }
}
console.log(`التلاوات: ${Object.keys(V).length - missing}/${Object.keys(V).length} — ${(bytes / 1048576).toFixed(1)} ميغابايت`);
if (missing) process.exitCode = 1;
