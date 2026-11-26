#!/usr/bin/env node
// يبني صفحة البيت: app/v2/index.html — عنوان كل درس وبنوده من lessons/*.json وحدها (المراجعة 20، ن-15):
// كانت لدرسَي U01 عناوين وقوائم بنود يدوية قديمة («مهمة الطبيب الصغير»، 6 بنود من 10).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { safeJSON } from './safe-json.mjs';
// صورة العنوان وحدها تختلف في درسَي U01 (رُسمتا قبل تسمية الصور بمعرّف الدرس)
const IMG = { 'U01.L01': 'img/s01-title-boy.webp', 'U01.L02': 'img/l2-s01-title-boy.webp' };
const ids = readdirSync('lessons').filter(f => f.endsWith('.json')).map(f => f.replace('.json', '')).sort();
const list = ids.map(id => {
  const L = JSON.parse(readFileSync(`lessons/${id}.json`, 'utf8'));
  const items = [...L.flow.practice, ...L.flow.check];
  return { id, title: L.title.ar, unit: L.unit.id, unitTitle: L.unit.title, ...(L.visibility === 'parent_unlock' ? { gated: true } : {}), check_ids: items.map(i => i.id),
    check_levels: Object.fromEntries(items.map(i => [i.id, i.level || 'A'])), v2: true, img: IMG[id] || `img/${id}-title-boy.webp` };
});
const tpl = readFileSync('app/v2/index-template.html', 'utf8');
writeFileSync('app/v2/index.html', tpl.replace('/*__LESSONS__*/', safeJSON(list)));
console.log('app/v2/index.html —', list.length, 'دروس');
