#!/usr/bin/env node
// «妈妈指南» دليل الأم بالصينية (قرار 28 نوفمبر): mom/mom-data.js من lessons/zh/<id>.json وlessons/zh/faith.json وملفات الدروس.
// كل حقل مترجم يحمل بصمة نصه العربي (tools/zh_guide.py)؛ إن تغيّر العربي بعد الترجمة يُعلَّم الحقل «待更新» في الصفحة ويُعدّ هنا.
// المصطلحات من الدرس نفسه (عربي، صيني، بنين). النص الشرعي لا يظهر إلا ما أقرّه صاحب المشروع (status: approved).
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { safeJSON } from './safe-json.mjs';

const norm = t => String(t || '').replace(/\{اسم\}/g, '').replace(/\s+/g, ' ').trim();
const h = t => createHash('sha1').update(norm(t), 'utf8').digest('hex').slice(0, 10);
const J = p => JSON.parse(readFileSync(p, 'utf8'));
const ids = readdirSync('lessons').filter(f => /^U\d{2}\.L\d{2}\.json$/.test(f)).map(f => f.slice(0, -5)).sort();
const UNITS = J('lessons/zh/units.json'), F = J('lessons/zh/faith.json'), V = J('quran/verses.json'), HD = J('hadith/registry.json');
const missing = [], stale = [], pending = new Set();

function faithOf(L) {
  const keys = [];
  const add = (k, kind) => { if (k && !keys.some(x => x.k === k)) keys.push({ k, kind }); };
  for (const pos of ['opening', 'closing']) {
    const c = L.faith?.[pos]; if (!c) continue;
    add(c.quran_key, 'q'); add(c.hadith_key, 'h'); for (const k of c.hadith || []) add(k, 'h');
  }
  for (const a of L.life_application || []) { for (const k of a.quran || []) add(k, 'q'); for (const k of a.hadith || []) add(k, 'h'); }
  const out = [];
  for (const { k, kind } of keys) {
    const t = kind === 'q' ? F.quran[k] : F.hadith[k];
    if (!t || t.status !== 'approved') { pending.add(k); continue; }
    if (kind === 'q') { const v = V[k]; out.push({ kind, ar: `سورة ${v.surah_ar}، الآية ${v.ayah}`, ref: `《${F.surah_zh[v.surah_no]}》第${v.ayah}节`, zh: t.zh, src: t.source, ...(t.note ? { note: t.note } : {}) }); }
    else { const r = HD[k]; out.push({ kind, ar: `${r.source} (${r.grade})`, ref: t.source, zh: t.zh, src: t.kind || '大意' }); }
  }
  return out;
}

const lessons = [];
for (const id of ids) {
  const L = J(`lessons/${id}.json`); const p = `lessons/zh/${id}.json`;
  if (!existsSync(p)) { missing.push(id); continue; }
  const Z = J(p), e = L.experiment, f = L.flow, st = [];
  const chk = (name, src, z) => { if (h(src) !== z.src) st.push(name); return z; };
  chk('title', L.title.ar, Z.title); chk('point', L.science.central_fact, Z.point);
  L.objectives.forEach((o, i) => Z.objectives[i] ? chk('objectives', o.statement, Z.objectives[i]) : st.push('objectives'));
  chk('do', e.title + ' ' + e.steps.join(' '), Z.do);
  e.safety.forEach((s, i) => Z.safety[i] ? chk('safety', s, Z.safety[i]) : st.push('safety'));
  chk('explain', f.explain.map(x => x.text).join(' '), Z.explain);
  L.misconceptions.forEach((m, i) => Z.misconceptions[i] ? chk('misconceptions', m.child_says + ' ' + m.teacher_response, Z.misconceptions[i]) : st.push('misconceptions'));
  chk('dinner', L.dinner.q + ' ' + L.dinner.listen, Z.dinner);
  if (L.objectives.length !== Z.objectives.length || e.safety.length !== Z.safety.length || L.misconceptions.length !== Z.misconceptions.length) st.push('count');
  const stl = [...new Set(st)]; if (stl.length) stale.push(`${id}: ${stl.join(', ')}`);
  lessons.push({ id, unit: L.unit.id, ar: L.title.ar, zh: Z.title.zh, gated: L.visibility === 'parent_unlock' || undefined,
    point: Z.point.zh, objectives: Z.objectives.map((o, i) => ({ zh: o.zh.replace(/^（B级）/, ''), b: L.objectives[i]?.level === 'B' || undefined })),
    terms: L.concepts.map(c => ({ ar: c.term.ar, zh: c.term.zh, py: c.term.pinyin || '', en: c.term.en || '' })),
    do: Z.do.zh, safety: Z.safety.map(s => s.zh), explain: Z.explain.zh,
    mis: Z.misconceptions.map(m => ({ says: m.says, answer: m.answer })), dinner: { q: Z.dinner.q, listen: Z.dinner.listen },
    faith: faithOf(L), stale: stl.length ? stl : undefined });
}
const units = Object.entries(UNITS).map(([id, zh]) => ({ id, zh, ar: J(`lessons/${ids.find(i => i.startsWith(id + '.'))}.json`).unit.title }));
writeFileSync('mom/mom-data.js', '/* مولَّد: node tools/build-mom-guide.mjs — لا يُحرَّر يدوياً */\nconst MOM = ' + safeJSON({ units, lessons }) + ';\n');
console.log(`mom/mom-data.js — ${lessons.length}/${ids.length} درساً بالصينية${missing.length ? '، ينقص: ' + missing.join(' ') : ''}؛ نصوص شرعية تنتظر الإقرار: ${pending.size}${stale.length ? '\n  ترجمة تحتاج تحديثاً: ' + stale.join(' | ') : ''}`);
