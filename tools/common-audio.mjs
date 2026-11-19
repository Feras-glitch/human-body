// قائمة التسجيل المشتركة (المراجعة 20، ن-20): عبارات الواجهة التي ينطقها التطبيق في كل الدروس («أحسنت!»، «ليس هذا.»،
// «تلميح:»، مقدمات الاختبار…)، مقروءة من جدول SAY في app/v2/engine.js نفسه، فلا تختلف القائمة عما يُنطق.
// تُسجَّل مرة واحدة في app/v2/audio/common/، ويربطها البناء بكل صفحة. يكتبها tools/generate.mjs مع كل درس.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { expand, hasGender } from './text.mjs';
import { literal } from './atlas-names.mjs';
const { audioKey } = createRequire(import.meta.url)('../app/v2/audio-key.js');
const h = (t) => createHash('sha1').update(t.trim()).digest('hex').slice(0, 10);

export function sayTable(root = 'app/v2') {
  return new Function(`return (${literal(readFileSync(`${root}/engine.js`, 'utf8'), 'SAY')})`)();
}

export function commonAudio(root = 'app/v2', out = 'build/common') {
  const SAY = sayTable(root), items = [];
  for (const [key, text] of Object.entries(SAY)) {
    for (const g of hasGender(text) ? ['m', 'f'] : [null]) {
      const t = expand(text, g || 'm', null).trim(), k = g ? `${key}.${g}` : key;
      items.push({ key: k, ...(g ? { gender: g } : {}), hash: h(t), file: `common/${k}.${h(t)}.mp3`, text: t, akey: audioKey(t) });
    }
  }
  mkdirSync(out, { recursive: true });
  writeFileSync(`${out}/audio-manifest.json`, JSON.stringify({ lesson: 'common', count: items.length, words: items.reduce((a, s) => a + s.text.split(/\s+/).length, 0), items: items.map(({ akey, ...x }) => x) }, null, 2) + '\n');
  let R = '# قائمة التسجيل الصوتي — عبارات الواجهة المشتركة\n\nتُسجَّل مرة واحدة لكل الدروس، وتُسمع قبل نص الدرس الذي يليها («أحسنت!» ثم شرح البند). المصدر جدول `SAY` في `app/v2/engine.js`؛ إن تغيّرت عبارة تغيّرت بصمتها فوجب تسجيل جديد. توضع الملفات في `app/v2/audio/` بالأسماء أدناه، ثم `npm run build` (انظر docs/04).\n\n| # | الملف | النص |\n|---|---|---|\n';
  items.forEach((s, i) => { R += `| ${i + 1} | \`${s.file}\`${s.gender ? (s.gender === 'm' ? ' (ولد)' : ' (بنت)') : ''} | ${s.text} |\n`; });
  writeFileSync(`${out}/recording-sheet.md`, R);
  return items;
}

if (import.meta.url === `file://${process.argv[1]}`) console.log('build/common —', commonAudio().length, 'عبارة');
