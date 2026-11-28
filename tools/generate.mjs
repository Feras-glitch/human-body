#!/usr/bin/env node
// مولّد المخرجات — بلا اعتماديات.
// node tools/generate.mjs lessons/U03.L01.json  →  build/U03.L01/teacher.md, student.md, app-data.json
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { expand, hasGender, hasName } from './text.mjs';
import { atlasData, locateView, customReplaced } from './atlas-names.mjs';
import { createRequire } from 'node:module';
import { commonAudio } from './common-audio.mjs';
const { audioKey } = createRequire(import.meta.url)('../app/v2/audio-key.js');

const path = process.argv[2];
const L = JSON.parse(readFileSync(path, 'utf8'));
const out = join('build', L.id);
mkdirSync(out, { recursive: true });

/* كتاب المعلم: النص يبقى بعلامتيه حتى آخر التوليد، ثم تُكتب كل كلمة بصيغتيها «عُدّ/عُدّي» (المراجعة 20، ن-10؛ قرارك 13 نوفمبر) */
const X = (t) => typeof t === 'string' ? t.replace(/\{اسم\}/g, '[الاسم]') : t;
const MK = /\{([^{}|]*)\|([^{}|]*)\}/g;
const both = (t) => t.replace(/\{اسم\}/g, '[الاسم]').replace(/(?:[\p{L}\p{M}\u0640]|\{[^{}|]*\|[^{}|]*\})+/gu, (w) => {
  if (!w.includes('{')) return w;
  const m = w.replace(MK, (_, a) => a), f = w.replace(MK, (_, a, b) => b);
  return m === f ? m : m + '/' + f;
});
const ATL = atlasData();
const CUSTOM = customReplaced(L.id);
const lv = (x) => x === 'A' ? 'أ (8–9)' : x === 'B' ? 'ب (10–12)' : '';
const byObj = (arr, oid) => arr.filter(i => i.objective === oid);
const src = (ids = []) => ids.map(i => `[${i}]`).join('');
const ABJAD = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح'];
const optList = (it) => (it.options || []).map((o, i) => `   ${ABJAD[i] ?? i + 1}. ${o}`).join('\n');
const ansText = (it) => {
  if (Array.isArray(it.answer) && it.options) return it.answer.map(i => it.options[i]).join(' ← ');
  if (typeof it.answer === 'number' && it.options) return it.options[it.answer];
  return String(it.answer);
};
let G = X;
const itemBlock = (it, withKey) => {
  // «حدّد على الجسم»: ما يعرضه التطبيق فعلاً (سؤاله وخياراته)، والجواب اسم المنطقة بالعربية لا معرّفها الداخلي (إ-1)
  const loc = it.type === 'locate_on_atlas' ? locateView(it, ATL, CUSTOM.has(it.id)) : null;
  if (loc) it = { ...it, prompt: loc.prompt, options: loc.options, answer: loc.answer };
  let s = `**${it.id}** (${it.type}، هدف ${it.objective.split('.').pop()}${it.level ? '، مستوى ' + lv(it.level) : ''})\n${G(it.prompt)}\n`;
  if (it.options?.length) s += optList(it) + '\n';
  if (withKey) {
    s += `> **الإجابة:** ${ansText(it)}${loc && !loc.options ? ` (${loc.how})` : ''}`;
    if (it.rubric) s += ` — المعيار ${it.rubric}`;
    if (it.detects) s += ` — يكشف ${it.detects}`;
    if (it.feedback_wrong) s += `\n> **تلميح عند الخطأ:** ${G(it.feedback_wrong)}`;
    if (it.explanation || it.feedback_correct) s += `\n> **لماذا (يراه الطفل بعد الإجابة):** ${G(it.explanation || it.feedback_correct)}`;
    // ردّ كل خيار خاطئ (الدفعة 6، البند 41): يسمعه الطفل بعد «ليس هذا.»
    const fbo = it.feedback_by_option || {}, ks = Object.keys(fbo).map(Number).filter((k) => Number.isInteger(k)).sort((x, y) => x - y);
    if (ks.length) { s += `\n> **ردّ كل خيار خاطئ:**`; for (const k of ks) s += `\n> - ${ABJAD[k] ?? k + 1}: ${G(fbo[k])}`; }
    s += '\n';
  }
  return s + '\n';
};
// بديل المحاولة الثانية (البند 43): يرث المعرّف والهدف والمستوى، وقد يغيّر النوع
const altBlock = (it) => it.alt ? `> **بديل المحاولة الثانية** (يظهر في التطبيق بعد الاختبار لمن أخطأ في ${it.id} أول مرة):\n\n` + itemBlock({ ...it.alt, id: it.id + '.alt', objective: it.objective, level: it.level, type: it.alt.type || it.type }, true) : '';

// ============ كتاب المعلم ============
let T = `# ${L.id} — ${L.title.ar}\n*علمٌ يُنتفع به*\n`;
T += `**الوحدة:** ${L.unit.id} ${L.unit.title} | **إصدار المحتوى:** ${L.version.content} | **آخر مراجعة علمية:** ${L.version.science_reviewed_on} | **الحصة:** ${L.duration_min?.classroom ?? 45} دقيقة\n\n`;
T += `> **السؤال المحرّك:** ${L.driving_question}\n\n`;

T += `## 1. الأهداف\n\n| المعرّف | المستوى | ما يثبته الطفل | كيف نلاحظه |\n|---|---|---|---|\n`;
for (const o of L.objectives) T += `| ${o.id.split('.').pop()} | ${lv(o.level)} | ${o.statement} | ${o.evidence} |\n`;

T += `\n## 2. النطاق\n\n**المتطلبات السابقة:**\n`;
for (const p of L.scope.prerequisites) T += `- ${p.ref}${p.hard ? ' (شرط)' : ''} — ${p.why}\n`;
T += `\n**ما يفتحه هذا الدرس:** ${L.scope.opens.join('؛ ')}\n\n**المعرفة المؤجلة (لا تُدرَّس هنا ولا يُسأل عنها الطفل):**\n\n| ما | لماذا | إلى أين |\n|---|---|---|\n`;
for (const d of L.scope.deferred) T += `| ${d.what} | ${d.why} | ${d.to} |\n`;

T += `\n## 3. المادة العلمية\n\n**الحقيقة المركزية:** ${L.science.central_fact}\n\n### الحقائق المطلوبة\n\n| # | المستوى | الحقيقة | المصدر |\n|---|---|---|---|\n`;
for (const f of L.science.facts) T += `| ${f.id} | ${lv(f.level)} | ${f.text} | ${src(f.source)} |\n`;
if (L.science.numbers?.length) { T += `\n### أرقام ومقاييس\n`; for (const n of L.science.numbers) T += `- ${n.text} ${src(n.source)}\n`; }
T += `\n### خلفية للمعلم (أعمق بدرجة واحدة)\n\n${L.science.teacher_background}\n\n### التبسيطات المسموحة\n`;
for (const s of L.science.allowed_simplifications) T += `- ${s}\n`;
T += `\n### كيف عرفنا؟ (يُروى للطلاب)\n`;
for (const h of L.science.how_we_know) T += `- ${h.text} ${src(h.source)}\n`;
if (L.science.what_changed?.length) { T += `\n### ما كان يُعتقد وتغيّر\n`; for (const w of L.science.what_changed) T += `- ${w}\n`; }
T += `\n### حدود النموذج (ما لا يُظهره رسم الدرس)\n`;
for (const m of L.science.model_limits) T += `- ${m}\n`;
if (L.science.animal_comparison) T += `\n### المقارنة مع الحيوان\n${L.science.animal_comparison.text} ${src(L.science.animal_comparison.source)}\n`;
if (L.science.open_questions?.length) { T += `\n### ما لا يعرفه أحد بعد (أسئلة مفتوحة حقيقية)\n`; for (const q of L.science.open_questions) T += `- **${q.q}** — ${q.why_open}\n`; T += `\n> تُقال للطفل كما هي: «لا أحد يعرف بعد» جملة صادقة ومحفّزة، لا نقص في المعلم.\n`; }
T += `\n### دقيقة الدهشة (اختر واحدة لافتتاح الحصة أو ختامها)\n`;
for (const n of (L.science.numbers || []).slice(0, 3)) T += `- 🔢 ${n.text}\n`;
if (L.science.animal_comparison) T += `- 🐾 ${L.science.animal_comparison.text.split(/[.؟!]/)[0]}.\n`;
for (const q of L.science.open_questions || []) T += `- ❓ ${q.q}\n`;
T += `- 🧪 ${L.experiment.expected}\n`;

T += `\n## 4. إنذارات التصورات الخاطئة\n\n| المعرّف | ما سيقوله الطفل | ردّ المعلم | بند الكشف |\n|---|---|---|---|\n`;
for (const m of L.misconceptions) T += `| ${m.ref} | «${m.child_says}» | ${m.teacher_response} | ${m.diagnostic_item} |\n`;

T += `\n## 5. التجربة: ${L.experiment.title}\n\n**المواد:** ${L.experiment.materials.join('، ')}\n\n**الخطوات:**\n`;
L.experiment.steps.forEach((s, i) => T += `${i + 1}. ${X(s)}\n`);
T += `\n**السلامة (تُقرأ قبل البدء):**\n`; for (const s of L.experiment.safety) T += `- ⚠ ${X(s)}\n`;
T += `\n**المتوقع:** ${L.experiment.expected}\n\n**التفسير (يُقدَّم بعد التجربة لا قبلها):** ${X(L.experiment.explain)}\n\n**ما يدوّنه الطفل:** ${L.experiment.record}\n`;
if (L.experiment.alternatives?.length) { T += `\n**بدائل:**\n`; for (const a of L.experiment.alternatives) T += `- ${a}\n`; }

T += `\n## 6. خطة التدريس — حصتان (الأصل)\n\nالدرس يُدرَّس في حصتين؛ لا يُحشر في واحدة. المهم الفائدة لا القالب.\n\n| الحصة | المدة | المحتوى |\n|---|---|---|\n| الأولى: العلم | 45 د | الافتتاح القيمي (دقيقتان) والسؤال المحرّك؛ التجربة كاملة بقواعد سلامتها؛ الشرح على الأطلس؛ تفسير التجربة بعد الشرح؛ التدريب ثم التحقق |\n| الثانية: الفهم والحياة | 30–45 د | دفتر الأطلس (رسم من الذاكرة)؛ كيف عرفنا وعلماء حضارتنا؛ الطبقة القيمية بشرحها (المفهوم، الدرجة، الأثر، الفهم الخاطئ)؛ «في حياتي» بسببه؛ رسالة من أعضاء جسمي؛ جواز سفر جسمي؛ الاسترجاع المؤجل إن حان؛ الإهداء عند اكتمال الوحدة |\n\n**ملحق: الحصة الواحدة (45 د) لمن اضطر** — تُختصر الحصة الثانية إلى الدفتر والطبقة القيمية في 10 دقائق ويُؤجل الباقي إلى البيت:\n\n| الدقائق | النشاط |\n|---|---|\n`;
for (const p of L.teacher?.lesson_plan_45 || []) T += `| ${p.minutes} | ${p.activity} |\n`;

T += `\n## 7. نص الشرح (ما يُقال على السبورة / يسمعه الطفل في التطبيق)\n\n`;
T += `**الافتتاح (لا يُحتسب):** ${X(L.flow.hook.text)}${L.flow.hook.options ? ' — ' + L.flow.hook.options.join(' / ') : ''}\n\n`;
for (const e of L.flow.explain) T += `**${e.id}** (مستوى ${lv(e.level)}؛ على الأطلس: ${e.atlas?.highlight?.join('، ') || '—'}${e.atlas?.animate ? '، حركة: ' + e.atlas.animate : ''})\n${X(e.text)}\n\n`;
T += `**كيف عرفنا؟** ${X(L.flow.how_we_know.text)}\n\n**سؤال حدود النموذج:** ${X(L.flow.how_we_know.limit_question)}\n`;
T += `\n> نصوص الطفل مكتوبة هنا بالصيغتين، للطالب ثم للطالبة: «عُدّ/عُدّي». والتطبيق يخاطب كل طفل بصيغته تلقائياً. [الاسم] = اسم الطفل.\n`;

T += `\n## 8. التدريب ثم التحقق — مع مفاتيح الإجابة\n\n### تدريب بإرشاد\n`;
for (const it of L.flow.practice) T += itemBlock(it, true);
T += `### تحقق بمثال جديد\n`;
for (const it of L.flow.check) T += itemBlock(it, true);

T += `## 9. دفتر الأطلس\n\n- **ارسم:** ${X(L.flow.notebook.draw)}\n- **سمِّ:** ${L.flow.notebook.label.join('، ')}\n- **اكتب:** ${L.flow.notebook.write}\n`;

const HL = (t, h) => h && t.includes(h) ? t.replace(h, `**${h}**`) : t;
const QV = (()=>{ try { return JSON.parse(readFileSync('quran/verses.json','utf8')); } catch(e){ return {}; } })();
/* سجل الأحاديث: المتن كاملاً براويه ودرجته؛ المعنى في نص الدرس بلا علامتي تنصيص */
const HD = (()=>{ try { return JSON.parse(readFileSync('hadith/registry.json','utf8')); } catch(e){ return {}; } })();
const HQ = (h) => `${h.lead} ${h.narration ? h.text : '«' + h.text + '»'} (${h.source}، حديث ${h.grade}${h.grader ? '، ' + h.grader : ''})`;
const HK = (k) => { const h = HD[k]; if (!h || k === '_meta') throw new Error('حديث غير موجود في السجل: ' + k); return h; };
const faithH = (f) => f.hadith_key ? { ...HK(f.hadith_key), text: f.text } : { lead: 'قال رسول الله ﷺ:', text: f.text, source: f.reference, grade: f.grade };
const SURA = (k) => { const v = QV[k]; return v ? `[سورة ${v.surah_ar}: الآية ${v.ayah}]` : `[${k}]`; };
/* علامة ربع الحزب ۞ ليست من الآية: تُكتب قبل القوسين لا داخلهما */
const AYA = (it) => { const v = QV[it.quran_key]; const t = HL(it.text, it.highlight); const hz = /^۞\s*/.test(t) ? '۞ ' : ''; const body = t.replace(/^۞\s*/, ''); if(!v) return `${hz}﴿${body}﴾`; return `<span class="q" data-key="${it.quran_key}"${it.hl_words?` data-hl="${it.hl_words.join('-')}"`:''}>${hz}﴿${body}﴾</span>`; };
const extras = (E) => {
  let x = '';
  if (L.organ_letter) x += `\n### رسالة من أعضاء جسمي — ${L.organ_letter.from}\n\n> ${E(L.organ_letter.text)}\n`;
  if (L.passport?.length) { x += `\n### جواز سفر جسمي\n\n| البند | المدخلات | الحساب | الوحدة | ملاحظة |\n|---|---|---|---|---|\n`; for (const q of L.passport) x += `| ${E(q.label)} | ${(q.inputs||[]).join('، ') || '—'} | ${E(q.formula)} | ${q.unit} | ${E(q.note||'')} |\n`; }
  if (L.find_the_error?.length) { x += `\n### ابحث عن الخطأ\n\n| # | الخطأ المقصود في الرسم | الصواب |\n|---|---|---|\n`; L.find_the_error.forEach((f, i) => x += `| ${i + 1} | ${f.error} | ${f.answer} |\n`); }
  if (L.true_size?.length) { x += `\n### اصنعه بحجمه الحقيقي\n`; for (const t of L.true_size) x += `- ${E(t.text)}\n`; }
  if (L.unit_review) { const u = L.unit_review; x += `\n### مراجعة الوحدة: كيف ترتبط دروسها\n\n> ${E(u.text)}\n\n| الدرس | فكرته |\n|---|---|\n`; for (const l of u.links) x += `| ${l.lesson} | ${E(l.idea)} |\n`; x += `\n**سؤال جامع (لا يُحتسب):** ${E(u.question.prompt)}\n${u.question.options.map((o, i) => `   ${ABJAD[i] ?? i + 1}. ${E(o)}`).join('\n')}\n> **الإجابة:** ${E(u.question.options[u.question.answer])} — ${E(u.question.why)}\n`; }
  if (L.life_application?.length) {
    x += `\n### في حياتي — الحكمة والأثر\n`;
    for (const a of L.life_application) x += `\n**الموقف:** ${E(a.situation)}\n\n- **ما يحدث في الجسم:** ${E(a.science)}\n- **ما أفعله:** ${E(a.action)}\n${a.why ? `- **لماذا:** ${E(a.why)}\n` : ''}${(a.quran||[]).map(k => `- **الآية:** قال الله تعالى: ${AYA({ quran_key: k, text: QV[k]?.text || '' })} ${SURA(k)}\n`).join('')}${(a.hadith||[]).map(k => `- **الحديث:** ${HQ(HK(k))}\n`).join('')}- **القيمة:** ${E(a.value)}${a.reference ? ` *(${a.reference})*` : ''}\n`;
  }
  if (L.history?.length) { x += `\n### علماء حضارتنا وتاريخ العلم\n\n| من | من أين ومتى | ما فعله بالضبط | ما لم يفعله | درس المنهج |\n|---|---|---|---|---|\n`; for (const h of L.history) x += `| ${h.who} | ${h.origin ? h.origin + '؛ ' : ''}${h.where_when} | ${h.did} | ${h.did_not} | ${h.method_lesson} |\n`; }
  if (L.faith) {
    x += `\n### الطبقة القيمية والإيمانية (غاية · قيمة · تفكر — لا إثبات علمي)\n`;
    const FQ = (lbl, c) => c.grade === 'قرآن'
      ? `\n**${lbl}:** قال الله تعالى: ${AYA(c)} [سورة ${c.reference.replace(/ (\d+)$/, ': الآية $1')}] — ${E(c.reflection||'')}${c.reviewed ? '' : ' *[بانتظار اعتماد المراجع الشرعي]*'}\n`
      : (() => { const h = faithH(c); const t = HL(c.text, c.highlight); return `\n**${lbl}:** ${h.lead} ${h.narration ? t : '«' + t + '»'} (${h.source}، حديث ${h.grade}${h.grader ? '، ' + h.grader : ''}${c.level ? '، ' + c.level : ''})${c.full_verified===false?' *[المتن يُقابَل حرفياً على المصدر]*':''} — ${E(c.reflection||'')}${c.reviewed ? '' : ' *[بانتظار اعتماد المراجع الشرعي]*'}\n`; })();
    for (const [lbl, c] of [['افتتاح', L.faith.opening], ['ختام', L.faith.closing]]) { if (!c) continue; x += FQ(lbl, c);
      if (c.concept) x += `\n- **المفهوم للطفل:** ${E(c.concept)}\n`; if (c.body_effect) x += `- **ما يحدث في الجسم:** ${E(c.body_effect)}\n`; if (c.avoid) x += `- **فهم خاطئ يُمنع:** ${E(c.avoid)}\n`;
      for (const k of c.hadith || []) x += `- **الحديث:** ${HQ(HK(k))}\n`; }
    if (L.faith.values?.length) x += `\n**القيم:** ${L.faith.values.join('؛ ')}\n`;
  }
  return x;
};
T += `## 9ب. الإثراء\n` + extras(X) + `\n`;
T += `\n## 10. التقييم — مفاتيح الإجابة ومعايير التصحيح\n\n`;
for (const o of L.objectives) {
  T += `### الهدف ${o.id.split('.').pop()} — ${o.statement}\n`;
  for (const it of byObj(L.assessment.items, o.id)) T += itemBlock(it, true) + altBlock(it);
}
T += `### استرجاع مؤجل — ثلاث عودات (بعد 3 أيام، ثم 7، ثم 21 يوماً من إنهاء الدرس)\n\nتُعاد هذه البنود في كل عودة دون فتح الدرس، ومعها في التطبيق ما أخطأ فيه الطفل في اختبار الدرس، ثم يكتب ما يتذكره بكلماته.\n\n`; for (const it of L.assessment.delayed_recall) T += itemBlock(it, true);
T += `### نقل إلى سياق جديد\n`; for (const it of L.assessment.transfer) T += itemBlock(it, true);
if (L.assessment.class_diagnostic?.length) { T += `### تشخيص قبلي للصف (قبل الدرس، بلا درجات)\n`; for (const it of L.assessment.class_diagnostic) T += itemBlock(it, true); }
T += `### معايير التصحيح\n\n| المعيار | 0 | 1 | 2 |\n|---|---|---|---|\n`;
for (const r of L.assessment.rubrics) T += `| ${r.for} | ${r.levels['0']} | ${r.levels['1']} | ${r.levels['2']} |\n`;

T += `\n## 11. أسئلة الطلاب المتوقعة\n\n`;
for (const q of L.teacher?.expected_questions || []) T += `**س: ${q.q}**\nج: ${q.a}\n\n`;
if (L.teacher?.differentiation) T += `## 12. التنويع\n\n- **المتعثر:** ${L.teacher.differentiation.struggling}\n- **المتقدم:** ${L.teacher.differentiation.advanced}\n- **الإتاحة:** ${L.teacher.differentiation.accessibility}\n\n`;
if (L.teacher?.kit?.length) T += `**يُضاف إلى عُدّة المعلم:** ${L.teacher.kit.join('، ')}\n\n`;

T += `## 13. المصادر\n\n`;
for (const s of L.sources) T += `- **[${s.id}]** ${s.title} — ${s.publisher}. ${s.url} (اطُّلع عليه ${s.accessed}). *${s.used_for}*\n`;
writeFileSync(join(out, 'teacher.md'), both(T));

// ============ ورقة الطالب (دفتر الأطلس) — نسختان: ولد / بنت ============
for (const g of ['m', 'f']) {
  const E = (t) => expand(t, g, '________');
  G = E;
  let S = `# ${L.id} — ${L.title.ar}\n\n*اعرفْ نفسَك، وانفعْ غيرَك*\n\n**اسمي:** ________    **سؤال اليوم:** ${E(L.driving_question)}\n\n`;
  S += `## تجربتي: ${L.experiment.title}\n\n`;
  L.experiment.steps.forEach((t, i) => S += `${i + 1}. ${E(t)}\n`);
  S += `\n**قواعد السلامة:**\n`; for (const t of L.experiment.safety) S += `- ${E(t)}\n`;
  S += `\n| راحة | بعد الحركة | بعد الراحة |\n|---|---|---|\n| ______ | ______ | ______ |\n\nلاحظت أن: ______________________________________________\n\n`;
  S += `## أرقام تدهشني\n`; for (const n of L.science.numbers || []) S += `- ${E(n.text)}\n`;
  S += `\n## أرسم من الذاكرة\n\n${E(L.flow.notebook.draw)}\n\n[ مساحة الرسم ]\n\n\n\n\n**أسمّي:** ${L.flow.notebook.label.join(' · ')}\n\n**أكتب:** ${E(L.flow.notebook.write)}\n\n`;
  S += `## كيف عرفنا؟\n\n${E(L.flow.how_we_know.text)}\n\n**${E(L.flow.how_we_know.limit_question)}**\n\n______________________________________________\n\n`;
  S += `## أتحقق من فهمي\n\n`;
  for (const it of L.flow.check) S += itemBlock(it, false);
  S += `## اختبار الدرس\n\n`;
  for (const o of L.objectives) for (const it of byObj(L.assessment.items, o.id)) S += itemBlock(it, false);
  S += `## عودة الذاكرة: بعد 3 أيام، ثم 7، ثم 21 يوماً\n\n`; for (const it of L.assessment.delayed_recall) S += itemBlock(it, false);
  S += `## أفكّر أبعد\n\n`; for (const it of L.assessment.transfer) S += itemBlock(it, false);
  S += extras(E).replace(/^### /gm, '## ');
  if (L.history?.length) {
    const yr = (t) => { const m = (t||'').match(/\d{3,4}/); return m ? +m[0] : 9999; };
    const rows = L.history.flatMap(h => (h.who.includes('معاً') ? [] : [h])).sort((a,b)=>yr(a.where_when)-yr(b.where_when));
    S += `## خط الزمن: كيف وصلت المعرفة إلينا\n\n| متى | من | ماذا أضاف |\n|---|---|---|\n`;
    for (const h of rows) S += `| ${h.where_when} | ${h.who} | ${h.did} |\n`;
    S += `| اليوم | أنا | تجربتي: ${L.experiment.title} — ما لاحظته: ______________________ |\n\n`;
  }
  if (L.science.open_questions?.length) {
    S += `## ما لا يعرفه أحد بعد\n\n`;
    for (const q of L.science.open_questions) S += `**${E(q.q)}**\n\n${E(q.why_open)}\n\n`;
    S += `**سؤالي أنا الذي لم يُجب عنه الدرس:** ______________________________________________\n\n*(انقله إلى صندوق الأسئلة المؤجلة في التطبيق، وسنعود إليه في موضعه.)*\n\n`;
  }
  S += `## بطاقات المفاهيم\n\n| عربي | English | 中文 | Pinyin | المعنى |\n|---|---|---|---|---|\n`;
  for (const c of L.concepts) S += `| ${c.term.ar} | ${c.term.en} | ${c.term.zh} | ${c.term.pinyin} | ${c.card?.A || c.card?.B || ''} |\n`;
  // كل ما بقي بعلامتيه (الخيارات، العناوين، المسرد…) يُكتب بصيغة هذا الدفتر (ن-10)
  S = expand(S, g, '________');
  writeFileSync(join(out, g === 'm' ? 'student-boy.md' : 'student-girl.md'), S);
  if (g === 'm') writeFileSync(join(out, 'student.md'), S);
}
G = X;

// ============ قائمة التسجيل الصوتي (D09) ============
const h = (t) => createHash('sha1').update(t.trim()).digest('hex').slice(0, 10);
/* قائمة التسجيل (D09، المراجعة 20 ن-20): كل ما يطلب التطبيق نطقه من نصوص الدرس، جزءاً جزءاً كما يُنطق (عنوان الدرس
   وسؤاله، والشرح، والبنود وردودها لكل خيار، والتجربة، والعالِم، وحياتي، والأسئلة المفتوحة، والنصوص الشرعية…)،
   ونصوص المشاهد المؤلَّفة يدوياً الثابتة. عبارات الواجهة («أحسنت!»، «ليس هذا.»…) في قائمة مشتركة واحدة: build/common/.
   التطبيق يربط الملف بالنص ببصمة النص المسموع (app/v2/audio-key.js)، فنص مكرر يُسجَّل مرة واحدة */
const spoken = [], seenText = new Set();
const add = (key, text) => {
  if (!text || !String(text).trim()) return;
  for (const g of hasGender(text) ? ['m', 'f'] : [null]) {
    const t = expand(text, g || 'm', null).trim(), seen = (g || '') + '|' + audioKey(t);
    if (!t || !audioKey(t) || seenText.has(seen)) continue;
    seenText.add(seen);
    const k = g ? `${key}.${g}` : key;
    spoken.push({ key: k, ...(g ? { gender: g } : {}), hash: h(t), file: `${L.id}/${k}.${h(t)}.mp3`, text: t });
  }
};
const SCI = L.science || {};
add('title', L.title.ar);
add('driving_question', L.driving_question);
add('hook', L.flow.hook.text);
for (const e of L.flow.explain) add(`explain.${e.id}`, e.text);
for (const c of L.concepts || []) add(`concept.${c.id}.def`, c.card?.A);
add('experiment.title', L.experiment.title);
L.experiment.steps.forEach((t, i) => add(`experiment.step${i + 1}`, t));
L.experiment.safety.forEach((t, i) => add(`experiment.safety${i + 1}`, t));
add('experiment.explain', L.experiment.explain);
const stripRecall = (t) => (t || '').replace(/\(بعد [^)]{1,20}\)\s*/, '');
const RECALL = new Set((L.assessment.delayed_recall || []).map((d) => d.id));
const addItem = (key, it) => {
  const spokenQ = (t) => RECALL.has(it.id) ? stripRecall(t) : t;
  add(key, spokenQ(it.prompt));
  /* «حدّد على الجسم» يسأله التطبيق بسؤال خريطة الجسم (ATLAS) لا بنص البند */
  if (it.type === 'locate_on_atlas' && !CUSTOM.has(it.id.replace(/\.alt$/, ''))) add(`${key}.atlas`, spokenQ(locateView(it, ATL).prompt));
  if (it.feedback_wrong) add(`${key}.hint`, it.feedback_wrong);
  if (it.feedback_correct) add(`${key}.ok`, it.feedback_correct);
  if (it.explanation) add(`${key}.why`, it.explanation);
  for (const [i, t] of Object.entries(it.feedback_by_option || {})) add(`${key}.opt${i}`, t);
};
for (const it of allItemsList()) { addItem(`item.${it.id}`, it); if (it.alt) addItem(`item.${it.id}.alt`, { ...it.alt, id: it.id + '.alt' }); }
add('notebook', L.flow.notebook.draw);
add('how_we_know', SCI.how_we_know?.[0]?.text || L.flow.how_we_know.text);
add('how_we_know.limit', L.flow.how_we_know.limit_question);
if (L.organ_letter) add('organ_letter', L.organ_letter.text);
if (L.unit_review) { add('unit_review', L.unit_review.text); L.unit_review.links.forEach((l, i) => add(`unit_review.${i + 1}`, l.idea)); add('unit_review.q', L.unit_review.question.prompt); add('unit_review.why', L.unit_review.question.why); }
(L.history || []).forEach((x, i) => { add(`history.${i + 1}.who`, x.who); add(`history.${i + 1}.did`, x.did); add(`history.${i + 1}.method`, x.method_lesson); });
const addHadith = (k) => { const hh = HK(k); add(`hadith.${k}`, hh.lead + ' ' + hh.text + '.'); };
(L.life_application || []).forEach((a, i) => { add(`life.${i + 1}.situation`, a.situation); add(`life.${i + 1}.action`, a.action); add(`life.${i + 1}.why`, a.why); (a.hadith || []).forEach(addHadith); });
(SCI.open_questions || []).forEach((q, i) => { add(`open.${i + 1}.q`, q.q); add(`open.${i + 1}.why`, q.why_open); });
/* الآية لا تُسجَّل بصوت الراوي: تُتلى من تلاوة المنشاوي المرفقة أو ملف ولي الأمر؛ يُسجَّل الشرح وحده */
for (const pos of ['opening', 'closing']) { const c = L.faith?.[pos]; if (!c) continue;
  if (c.grade !== 'قرآن') { const lead = faithH(c).lead; if (lead !== 'قال رسول الله ﷺ:') add(`faith.${pos}.lead`, lead); add(`faith.${pos}.text`, c.text + '.'); }
  add(`faith.${pos}.reflection`, c.reflection); (c.hadith || []).forEach(addHadith); }
for (const n of SCI.numbers || []) add(`number.${h(n.text)}`, n.text);
for (const n of L.true_size || []) add(`size.${h(n.text)}`, n.text);
add('central_fact', SCI.central_fact);
for (const t of sceneLiterals(L.id)) add(`scene.${h(t)}`, t);
function allItemsList() { return [...L.flow.practice, ...L.flow.check, ...L.assessment.items, ...L.assessment.delayed_recall, ...L.assessment.transfer]; }
/* نصوص المشهد المؤلَّف يدوياً (app/v2/scenes/<الدرس>.js) التي ينطقها كما هي: speak('…') وspeak(tx('…')) وfb('…','…') */
function sceneLiterals(id) {
  let js = ''; try { js = readFileSync(`app/v2/scenes/${id}.js`, 'utf8'); } catch { return []; }
  const re = /\b(?:speak\(\s*(?:tx\(\s*)?|fb\(\s*'[a-z]*'\s*,\s*)(['`])((?:\\.|(?!\1)[^\\\n])*)\1\s*\)/g;
  return [...js.matchAll(re)].filter((m) => !(m[1] === '`' && m[2].includes('${'))).map((m) => m[2].replace(/\\(.)/g, '$1'));
}
writeFileSync(join(out, 'audio-manifest.json'), JSON.stringify({ lesson: L.id, version: L.version.content, count: spoken.length, words: spoken.reduce((a, s) => a + s.text.split(/\s+/).length, 0), items: spoken }, null, 2));
let R = `# قائمة التسجيل الصوتي — ${L.id} (إصدار ${L.version.content})\n\nالنصوص الموجَّهة للطفل تُسجَّل مرتين (صيغة الولد وصيغة البنت)؛ عبارات النداء بالاسم تُحذف من التسجيل ويقرؤها القارئ الآلي إن لزم.\n\n${spoken.length} نصاً، نحو ${spoken.reduce((a, s) => a + s.text.split(/\s+/).length, 0)} كلمة. اسم الملف يحمل بصمة النص؛ إن تغيّر النص تغيّرت البصمة ووجب تسجيل جديد. توضع الملفات في \`app/v2/audio/\` بالأسماء أدناه، ثم \`npm run build\` (انظر docs/04).\n\n| # | الملف | النص |\n|---|---|---|\n`;
spoken.forEach((s, i) => R += `| ${i + 1} | \`${s.file}\`${s.gender ? (s.gender==='m'?' (ولد)':' (بنت)') : ''} | ${s.text} |\n`);
R += `\n## نطق المصطلحات بثلاث لغات\n\nيُسمع من زر اللغة في مسرد الدرس، والعربي منه أيضاً قبل تعريف المصطلح. الإنجليزي والصيني بصوت من يتقنهما (docs/04).\n\n| الملف | النص |\n|---|---|\n`;
for (const c of L.concepts || []) R += `| \`${L.id}/term.${c.id}.ar.mp3\` | ${c.term.ar} |\n| \`${L.id}/term.${c.id}.en.mp3\` | ${c.term.en} |\n| \`${L.id}/term.${c.id}.zh.mp3\` | ${c.term.zh}${c.term.pinyin ? ' (' + c.term.pinyin + ')' : ''} |\n`;
writeFileSync(join(out, 'recording-sheet.md'), R);
commonAudio();

// ============ بيانات التطبيق ============
const app = {
  id: L.id, title: L.title, unit: L.unit, driving_question: L.driving_question, version: L.version,
  levels: { A: L.objectives.filter(o => o.level === 'A').map(o => o.id), B: L.objectives.filter(o => o.level === 'B').map(o => o.id) },
  objectives: L.objectives, concepts: L.concepts, numbers: L.science.numbers, model_limits: L.science.model_limits, open_questions: L.science.open_questions || [],
  misconceptions: L.misconceptions.map(m => ({ ref: m.ref, remedy: m.remedy, item: m.diagnostic_item })),
  experiment: L.experiment, flow: L.flow,
  assessment: { items: L.assessment.items, delayed_recall: L.assessment.delayed_recall, transfer: L.assessment.transfer, rubrics: L.assessment.rubrics },
  deferred: L.scope.deferred, prerequisites: L.scope.prerequisites,
  history: L.history || [], faith: L.faith || null, life_application: L.life_application || [],
  organ_letter: L.organ_letter || null, passport: L.passport || [], find_the_error: L.find_the_error || [], true_size: L.true_size || [],
  ...(L.unit_review ? { unit_review: L.unit_review } : {}),
  audio: Object.fromEntries(spoken.map(s => [s.key, s.file])),
  has_gendered_text: true,
};
writeFileSync(join(out, 'app-data.json'), JSON.stringify(app, null, 2));

console.log(`تم التوليد في ${out}/: teacher.md، student-boy.md، student-girl.md، app-data.json، audio-manifest.json (${spoken.length} نصاً)، recording-sheet.md`);
