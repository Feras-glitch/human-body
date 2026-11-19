#!/usr/bin/env node
// سجل الآيات quran/verses.json — النص الذكي: بيانات مجمع الملك فهد (Hafs Smart v8) مع خطها HafsSmart_08 (بديل العرض
// الأول)؛ ونص Tanzil العثماني اليونيكودي للبحث والقراءة الآلية والبديل الأخير. لا يُعدَّل أي نص.
// العرض نفسه بخط صفحة المصحف (QPC V2، حقل qpc2): يملؤه tools/qpc2_import.py، ويبقى هنا ما لم يتغير نص الآية.
// الاستعمال: node tools/quran.mjs [17:36 49:6 ...]   ثم لآية جديدة: python3 tools/qpc2_import.py --fonts <مجلد خطوط QCF2>
import { readFileSync, writeFileSync } from 'node:fs';
const K = JSON.parse(readFileSync('quran/kfgqpc/hafs_smart_v8.json','utf8'));
const KM = {}; for (const r of K) KM[`${r.sura_no}:${r.aya_no}`] = r;
const T = {}; for (const l of readFileSync('quran/tanzil/quran-uthmani.txt','utf8').split('\n')) { const m = l.match(/^(\d+)\|(\d+)\|(.*)$/); if (m) T[`${+m[1]}:${+m[2]}`] = m[3].trim(); }
const V = JSON.parse(readFileSync('quran/verses.json','utf8'));
const keys = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(V);
for (const k of keys) { const r = KM[k]; if (!r) { console.error('لا توجد آية', k); continue; }
  const smartWords = r.aya_text.replace(/‏/g,'').trim().split(/\s+/); const em = r.aya_text_emlaey.trim().split(/\s+/);
  const ayahMark = smartWords.length === em.length + 1 ? smartWords.pop() : '';
  V[k] = { surah_ar: r.sura_name_ar.replace(/[ً-ْ]/g,''), surah_no: r.sura_no, ayah: r.aya_no, page: r.page,
    smart: smartWords.join(' '), ayah_mark: ayahMark, emlaey: r.aya_text_emlaey.trim(), text: T[k] || '',
    source: 'مجمع الملك فهد — KFGQPC Hafs Smart v8 (2022) للعرض؛ Tanzil Uthmani v1.1 للبحث والقراءة الآلية', checked_by: V[k]?.checked_by || '', checked_on: V[k]?.checked_on || '',
    ...(V[k]?.qpc2 && V[k].text === T[k] ? { qpc2: V[k].qpc2 } : {}) };
  if (!V[k].qpc2) console.error(`${k}: بلا رموز خط الصفحة — شغّل python3 tools/qpc2_import.py --fonts <مجلد خطوط QCF2>`); }
writeFileSync('quran/verses.json', JSON.stringify(V, null, 2) + '\n');
console.log('تم:', keys.join(' '));
