#!/usr/bin/env node
// يحقن quran/verses.json في صفحات v2 (مكان /*__QURAN__*/{}) — يُشغَّل قبل النشر
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { safeJSON } from './safe-json.mjs';
const V = JSON.parse(readFileSync('quran/verses.json','utf8'));
const empty = Object.entries(V).filter(([k,v])=>!v.text).map(([k])=>k);
for (const f of readdirSync('app/v2').filter(f=>/^U\d{2}\.L\d{2}\.html$/.test(f)||f==='engine.js'||f==='review.html')) {
  const p='app/v2/'+f; let s=readFileSync(p,'utf8');
  s = s.replace(/const QURAN = \/\*__QURAN__\*\/\{[^\n]*\};/, 'const QURAN = /*__QURAN__*/' + safeJSON(V) + ';');
  writeFileSync(p, s); console.log('quran →', f);
}
if (empty.length) console.warn('⚠ آيات بلا نص بعد (تُملأ من المصحف):', empty.join(' '));
