#!/usr/bin/env node
// بصمة المحتوى (المراجعة 20، ن-4 وفكرة م-5): ما يُبنى منه التطبيق والكتب — الدروس وسجلا الآيات والأحاديث.
// تُطبع على غلاف كل كتاب وتظهر في «عن التطبيق»؛ إن اختلفتا فالكتاب والتطبيق من نسختين مختلفتين.
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

export function contentHash(root = '.') {
  const h = createHash('sha256');
  const files = [...readdirSync(`${root}/lessons`).filter((f) => f.endsWith('.json')).sort().map((f) => `lessons/${f}`),
    'quran/verses.json', 'hadith/registry.json'];
  for (const f of files) {
    h.update(f + '\n');
    h.update(readFileSync(`${root}/${f}`));
    h.update('\n');
  }
  return h.digest('hex').slice(0, 10);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) console.log(contentHash());
