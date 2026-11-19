#!/usr/bin/env node
// مدقّق درس — بلا اعتماديات. يفحص القالب والقواعد الملزمة في الوثيقة 01.
// الاستعمال: node tools/validate.mjs lessons/U03.L01.json
import {readFileSync,existsSync}from'node:fs';import{spawnSync}from'node:child_process';import{schemaErrors}from'./schema-lite.mjs';

const release=process.argv.includes('--release'),paths=process.argv.slice(2).filter(p=>p!=='--release');if(paths.length>1){let bad=false;for(const p of paths){const r=spawnSync(process.execPath,[process.argv[1],p,...(release?['--release']:[])],{stdio:'inherit'});if(r.status!==0)bad=true;}process.exit(bad?1:0);}const path=paths[0];
if (!path) { console.error('الاستعمال: node tools/validate.mjs <lesson.json>'); process.exit(2); }
const L = JSON.parse(readFileSync(path, 'utf8'));
const errors = [], warnings = [];
const E = (m) => errors.push(m), W = (m) => warnings.push(m);

// —— 0. الحقول المطلوبة
for (const k of ['id','unit','title','version','scope','objectives','science','misconceptions','experiment','flow','assessment','sources'])
  if (!(k in L)) E(`حقل مطلوب مفقود: ${k}`);
if (!/^U\d{2}\.L\d{2}$/.test(L.id || '')) E(`معرّف الدرس غير صالح: ${L.id}`);
if (!L.version?.science_reviewed_on) E('version.science_reviewed_on مفقود');
for (const k of ['central_fact','facts','teacher_background','allowed_simplifications','how_we_know','model_limits'])
  if (!(k in (L.science || {}))) E(`science.${k} مفقود`);
for (const k of ['hook','explain','practice','check','notebook','how_we_know'])
  if (!(k in (L.flow || {}))) E(`flow.${k} مفقود`);
for (const k of ['items','rubrics','delayed_recall','transfer'])
  if (!(k in (L.assessment || {}))) E(`assessment.${k} مفقود`);
for (const k of ['title','materials','steps','safety','expected','explain'])
  if (!(k in (L.experiment || {}))) E(`experiment.${k} مفقود`);

const objIds = new Set((L.objectives || []).map(o => o.id));
const srcIds = new Set((L.sources || []).map(s => s.id));
const allItems = [
  ...(L.flow?.practice || []), ...(L.flow?.check || []),
  ...(L.assessment?.items || []), ...(L.assessment?.delayed_recall || []),
  ...(L.assessment?.transfer || []), ...(L.assessment?.class_diagnostic || []),
];
const itemIds = new Set(allItems.map(i => i.id));
const rubricIds = new Set((L.assessment?.rubrics || []).map(r => r.for));

// —— الأهداف
for (const o of L.objectives || []) {
  if (!o.id?.startsWith(L.id + '.O')) E(`هدف بمعرّف لا يتبع الدرس: ${o.id}`);
  if (!['A','B'].includes(o.level)) E(`مستوى غير صالح في ${o.id}`);
  if (!o.evidence) E(`الهدف ${o.id} بلا دليل ملاحظة`);
}

// —— القاعدة 2: كل حقيقة لها مصدر موجود
for (const f of L.science?.facts || []) {
  if (!f.source?.length) E(`الحقيقة ${f.id} بلا مصدر`);
  for (const s of f.source || []) if (!srcIds.has(s)) E(`الحقيقة ${f.id} تشير إلى مصدر غير معرّف: ${s}`);
  if (f.objective && !objIds.has(f.objective)) E(`الحقيقة ${f.id} تشير إلى هدف غير موجود: ${f.objective}`);
}
for (const s of L.sources || []) if (!s.url || s.url === 'TBD') W(`المصدر ${s.id} بلا رابط نهائي — يُستكمل قبل النشر`);

for(const s of L.sources||[])if(s.verification_status==='page_comparison_pending')W(`المصدر ${s.id}: مقابلة الصفحات لم تكتمل`);if(release&&!L.version?.science_reviewed_by)W('لا اعتماد علمي بشري باسم المراجع');
// —— القاعدة 3: التصورات الخاطئة
for (const m of L.misconceptions || []) {
  if (!/^M\d{2}$/.test(m.ref || '')) E(`تصور خاطئ بمعرّف غير صالح: ${m.ref}`);
  if (!itemIds.has(m.diagnostic_item)) E(`التصور ${m.ref} يشير إلى بند تشخيص غير موجود: ${m.diagnostic_item}`);
  if (!m.child_says || !m.teacher_response) E(`التصور ${m.ref} يفتقد child_says أو teacher_response`);
}

// —— البنود: الهدف موجود، الصيغة صالحة، المعيار موجود
const types = new Set(['locate_on_atlas','choose','choose_reason','sequence','fix_model','explain_open','predict','true_false_why','compare']);
for (const it of allItems) {
  if (!objIds.has(it.objective)) E(`البند ${it.id} يشير إلى هدف غير موجود: ${it.objective}`);
  if (!types.has(it.type)) E(`البند ${it.id} بنوع غير معروف: ${it.type}`);
  if (it.rubric && !rubricIds.has(it.rubric)) E(`البند ${it.id} يشير إلى معيار غير موجود: ${it.rubric}`);
  if (['explain_open','true_false_why','compare'].includes(it.type) && !it.rubric) W(`البند ${it.id} مفتوح بلا معيار تصحيح`);
  if (['choose','choose_reason','sequence','predict'].includes(it.type) && !it.options?.length) E(`البند ${it.id} يحتاج options`);
  if (it.type === 'locate_on_atlas' && !it.atlas_target) E(`البند ${it.id} يحتاج atlas_target`);
}

// —— المراجعة 20 (ن-8): المخطط schema/lesson.schema.json يُطبَّق فعلاً (كان التعريف الآلي للقالب لا يستعمله شيء)
{ const S = JSON.parse(readFileSync(new URL('../schema/lesson.schema.json', import.meta.url), 'utf8'));
  for (const e of schemaErrors(S, L)) E('المخطط: ' + e); }
// —— (ن-8) جواب يمكن أن يُحلّ: اختيار برقم داخل الخيارات، وترتيب هو تبديل كامل للخيارات (كان [0,0,0,0,0] يمر)
const DIAG = new Set((L.assessment?.class_diagnostic || []).map((x) => x.id));
for (const it of [...allItems, ...(L.assessment?.items || []).filter(x => x.alt).map(x => ({ ...x.alt, id: x.id + '.alt', type: x.alt.type || x.type }))]) {
  const n = it.options?.length, inRange = (v) => Number.isInteger(v) && v >= 0 && v < n;
  // «اختر كل ما تظنه صحيحاً» في التشخيص الصفي (ورقي يديره المعلم): الجواب قائمة أرقام خيارات بلا تكرار
  const multi = DIAG.has(it.id) && Array.isArray(it.answer) && it.answer.length > 0 && new Set(it.answer).size === it.answer.length && it.answer.every(inRange);
  if (['choose','choose_reason','predict'].includes(it.type) && n && !(inRange(it.answer) || multi)) E(`البند ${it.id}: الجواب ليس رقم خيار موجود (${JSON.stringify(it.answer)})${Array.isArray(it.answer) ? ' — الاختيار المتعدد في التشخيص الصفي وحده' : ''}`);
  if (it.type === 'sequence' && n && !(Array.isArray(it.answer) && it.answer.length === n && [...it.answer].sort((a, b) => a - b).every((v, i) => v === i))) E(`البند ${it.id}: جواب الترتيب ليس تبديلاً كاملاً للخيارات (${JSON.stringify(it.answer)})`);
}
// —— (ن-7) نص الدرس يُعرض في الصفحة HTML: لا وسم فيه («<» يليه حرف أو / أو !)، ولا «</script» الذي يكسر الصفحة.
//      علامة «>» أو «<» بمعنى «أكبر/أصغر من» مسموحة
{ const walk = (v, p) => { if (typeof v === 'string') { if (/<[A-Za-z!/?]/.test(v)) E(`${p}: وسم HTML في نص الدرس («${v.match(/<[^ ]{0,20}/)[0]}…»)`); } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${p}[${i}]`)); else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, p ? `${p}.${k}` : k); };
  walk(L, ''); }

// —— القاعدة 4: ≥3 بنود تقييم بأنواع مختلفة لكل هدف + استرجاع مؤجل واحد على الأقل للدرس
for (const o of L.objectives || []) {
  const its = (L.assessment?.items || []).filter(i => i.objective === o.id);
  const kinds = new Set(its.map(i => i.type));
  if (its.length < 3) E(`الهدف ${o.id} له ${its.length} بند تقييم فقط (المطلوب ≥3)`);
  if (kinds.size < 2) W(`الهدف ${o.id}: بنود التقييم من نوع واحد؛ يُفضَّل التنويع`);
}
if (!(L.assessment?.delayed_recall || []).length) E('لا بنود استرجاع مؤجل');
if (!(L.assessment?.transfer || []).length) E('لا بنود نقل');

// —— القاعدة 5: التحقق لا يعيد نص التدريب أو الشرح
const explainText = (L.flow?.explain || []).map(e => e.text).join('\n');
for (const c of L.flow?.check || []) {
  for (const p of L.flow?.practice || []) if (p.prompt === c.prompt) E(`بند التحقق ${c.id} يكرر بند التدريب ${p.id}`);
}

// —— القاعدة 1 (تقريب آلي): مصطلحات المفاهيم الأساسية يجب أن تظهر في الشرح قبل التدريب
for (const c of L.concepts || []) {
  if (c.priority === 'core' && ![c.term.ar, ...(c.term.match || [])].some(t => explainText.includes(t)))
    W(`المفهوم الأساسي «${c.term.ar}» لا يظهر في نصوص الشرح`);
  if (!c.atlas?.layer || !c.atlas?.element) E(`المفهوم ${c.id} غير مربوط بعنصر في الأطلس`);
  for (const k of ['ar','en','zh','pinyin']) if (!c.term?.[k]) E(`المفهوم ${c.id} ينقصه المصطلح ${k} (D06)`);
}

// —— سلامة الألفاظ (المبدأ 9): ألفاظ ممنوعة في نصوص الطفل لإيحائها العامي
const lexBanned = ['عضوي','عضوك','عضوكِ','عضوه','عضوها','عضوّي'];
const childTexts = [];
const collect = (o) => { if (typeof o === 'string') childTexts.push(o); else if (Array.isArray(o)) o.forEach(collect); else if (o && typeof o === 'object') Object.values(o).forEach(collect); };
collect(L.flow); collect(L.experiment); collect(L.assessment); collect((L.concepts||[]).map(c=>c.card)); collect(L.title); collect(L.driving_question);
for (const t of childTexts) for (const w of lexBanned) if (new RegExp(`(^|[^\\p{L}])${w}([^\\p{L}]|$)`, 'u').test(t)) E(`لفظ ممنوع في نص الطفل («${w}»): ${t.slice(0,60)}…`);

// —— علماء حضارتنا (D12): ما فعل وما لم يفعل ومصدر
for (const h of L.history || []) {
  for (const k of ['who','where_when','did','did_not','method_lesson']) if (!h[k]) E(`history «${h.who||'?'}»: الحقل ${k} مفقود`);
  if (!h.source?.length) E(`history «${h.who}» بلا مصدر`);
  for (const s of h.source || []) if (!srcIds.has(s)) E(`history «${h.who}» يشير إلى مصدر غير معرّف: ${s}`);
}
// —— الطبقة القيمية (D11): مرجع ودرجة واستعمال غير إثباتي
const proofWords = ['يثبت','أثبت','إعجاز','سبق العلم','اكتشف العلم ما قاله','دليل علمي'];
for (const [k, f] of Object.entries(L.faith || {})) {
  if (k === 'values') continue;
  if (!f.reference || !f.grade || !f.usage) E(`faith.${k}: المرجع أو الدرجة أو الاستعمال مفقود`);
  if(f.grading_review_required)W(`faith.${k}: تعارض تخريج يحتاج المراجع الشرعي`);
  if (f.reviewed !== true) W(`faith.${k}: لم يعتمده مراجع شرعي بعد — لا يُنشر`);
  for (const w of proofWords) if ((f.text + ' ' + (f.reflection||'')).includes(w)) E(`faith.${k}: صيغة إثبات علمي ممنوعة («${w}»)`);
}

// —— ترميز المخاطبة: أقواس متوازنة وصيغة صالحة

// D25: النص القرآني من السجل فقط
// لا اقتباس من القرآن أقل من آية كاملة: كل ما بين ﴿ ﴾ في أي حقل يجب أن يطابق آية كاملة من السجل
(function(){ let V=null; try{ V=JSON.parse(readFileSync('quran/verses.json','utf8')); }catch(e){ return; }
  const norm=t=>(t||'').replace(/[\u064B-\u0652\u0670\u0640]/g,'').replace(/\{[^}]*\}/g,'').replace(/\s+/g,' ').trim();
  const full=new Set(Object.values(V).flatMap(v=>[norm(v.emlaey),norm(v.text)]));
  const walk=(o,path)=>{ if(typeof o==='string'){ for(const m of o.matchAll(/﴿([^﴾]*)﴾/g)) if(!full.has(norm(m[1]))) E(`${path}: اقتباس قرآني ليس آية كاملة من السجل: ﴿${m[1].slice(0,40)}﴾`); if((o.match(/﴿/g)||[]).length!==(o.match(/﴾/g)||[]).length) E(`${path}: قوسا آية غير متوازنين`); }
    else if(Array.isArray(o)) o.forEach((v,i)=>walk(v,`${path}[${i}]`)); else if(o&&typeof o==='object') for(const k of Object.keys(o)) walk(o[k],path?path+'.'+k:k); };
  walk(L,''); })();
// لفظ قرآني بلا أقواس: ثلاث كلمات متتالية من آية في السجل خارج ﴿ ﴾ (القارئ الآلي ينطق ما ليس بين القوسين).
// يُستثنى نص الآية نفسه في حقول الإيمان وحقول التظليل الداخلية.
(function(){ let V=null; try{ V=JSON.parse(readFileSync('quran/verses.json','utf8')); }catch(e){ return; }
  const norm=t=>(t||'').replace(/[\u064B-\u0652\u0670\u0640]/g,'').replace(/[^\u0621-\u064A ]/g,' ').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/\s+/g,' ').trim();
  const grams=new Map(); for(const [k,v] of Object.entries(V)){ const w=norm(v.emlaey).split(' '); for(let i=0;i+2<w.length;i++) grams.set(w.slice(i,i+3).join(' '),k); }
  const walk=(o,path)=>{ if(typeof o==='string'){ const w=norm(o.replace(/﴿[^﴾]*﴾/g,' ').replace(/\{([^|}]*)\|[^}]*\}/g,'$1')).split(' ');
      for(let i=0;i+2<w.length;i++){ const g=w.slice(i,i+3).join(' '); if(grams.has(g)){ E(`${path}: لفظ من الآية ${grams.get(g)} خارج ﴿ ﴾ («${g}»): اعرض الآية كاملة من السجل أو أحِل إليها بلا لفظها`); break; } }
      /* متن منقول عن النبي ﷺ لا تدخله علامة التذكير والتأنيث */
      if(/(النبي|رسول الله|ﷺ)[^«»]{0,40}«[^»]*\{[^»]*»/.test(o)) E(`${path}: علامة {مذكر|مؤنث} داخل متن حديث بين « »`); }
    else if(Array.isArray(o)) o.forEach((v,i)=>walk(v,`${path}[${i}]`));
    else if(o&&typeof o==='object') for(const k of Object.keys(o)){ if(k==='highlight'||k==='hl_words') continue; if((k==='text')&&o.quran_key) continue; walk(o[k],path?path+'.'+k:k); } };
  walk(L,''); })();
(function(){ let V=null; try{ V=JSON.parse(readFileSync('quran/verses.json','utf8')); }catch(e){ W('تعذر قراءة quran/verses.json'); return; }
  for (const pos of ['opening','closing']) { const t=L.faith?.[pos]; if(!t || t.grade!=='قرآن') continue;
    if(!t.quran_key) { E(`faith.${pos}: آية بلا quran_key (D25)`); continue; }
    const v=V[t.quran_key]; if(!v||!v.text){ E(`faith.${pos}: المفتاح ${t.quran_key} غير موجود في السجل`); continue; }
    if(t.text!==v.text) E(`faith.${pos}: يجب عرض الآية كاملة كما في السجل (${t.quran_key}) — لا اقتطاع`);
    if(t.hl_words){ const em=v.emlaey.split(/\s+/); const [a,b]=t.hl_words; if(!(a>=0&&b>=a&&b<em.length)) E(`faith.${pos}: مدى التظليل خارج الآية`); else if(t.highlight && t.highlight!==em.slice(a,b+1).join(' ')) E(`faith.${pos}: نص التظليل لا يطابق كلمات الآية ${a}–${b}`); } }
  /* خط مصحف المدينة، الإصدار الثاني (QPC V2): كل آية يعرضها الدرس لها رموز صفحتها في السجل وخط صفحتها في التطبيق */
  const used=new Set([...['opening','closing'].map(p=>L.faith?.[p]).filter(t=>t?.grade==='قرآن'&&t.quran_key).map(t=>t.quran_key), ...(L.life_application||[]).flatMap(a=>a.quran||[])]);
  for (const k of used) { const v=V[k]; if(!v?.text) continue; const q=v.qpc2;
    if(!q){ E(`الآية ${k} بلا رموز خط صفحتها (qpc2): python3 tools/qpc2_import.py --fonts <مجلد خطوط QCF2>`); continue; }
    if(q.words.length!==v.smart.split(' ').length || q.glyphs.split(' ').length!==v.text.split(' ').length+1) E(`الآية ${k}: رموز qpc2 لا تطابق كلماتها (python3 tools/qpc2_import.py --check)`);
    /* خط الصفحة في التطبيق (يُتخطى في نسخة من الدروس بلا التطبيق؛ والاختبارات وqpc2_import --check تفحصه دائماً) */
    if(existsSync('app/v2/fonts/qcf2') && !existsSync(`app/v2/fonts/qcf2/QCF2${String(q.page).padStart(3,'0')}.ttf`)) E(`الآية ${k}: خط صفحتها ${q.page} غير موجود في app/v2/fonts/qcf2/`); }
  for (const pos of ['opening','closing']) { const t=L.faith?.[pos]; if(!t || t.grade==='قرآن') continue; if(t.highlight && !t.text.includes(t.highlight)) E(`faith.${pos}: التظليل ليس جزءاً من نص الحديث`); if(t.full_verified===false) W(`faith.${pos}: متن الحديث يحتاج مقابلة حرفية على المصدر (${t.reference})`); if(t.text.includes('…')) E(`faith.${pos}: حديث مقتطع (…) — يُعرض كاملاً`); } })();
(function(){ const walk=(o,path)=>{ if(typeof o==='string'){ if((o.match(/\{/g)||[]).length!==(o.match(/\}/g)||[]).length) E(`أقواس غير متوازنة في ${path}: ${o.slice(0,50)}…`); for(const m of o.matchAll(/\{([^{}]*)\}/g)) if(m[1]!=='اسم' && !m[1].includes('|')) E(`ترميز غير صالح ${m[0]} في ${path}`); } else if(Array.isArray(o)) o.forEach((v,i)=>walk(v,`${path}[${i}]`)); else if(o&&typeof o==='object') for(const [k,v] of Object.entries(o)) walk(v,`${path}.${k}`); }; walk(L,'lesson'); })();

// —— الدفعة 6 (الوثيقة 19): ردّ خاص بكل خيار خاطئ (41)، وسؤال «عودة الذاكرة» لكل هدف (39)، وبند بديل لكل بند مغلق في الاختبار (43).
// اكتمل المحتوى في الدروس الـ21 (الإصدار 1.2.0)، فالنقص خطأ يمنع النشر. ولكتابة درس جديد على مراحل: LAX_COVERAGE=1 يجعله تحذيراً.
(function(){ const A=L.assessment||{}, OPEN=new Set(['explain_open','fix_model','compare']), CHO=new Set(['choose','choose_reason','predict']);
  const COV = process.env.LAX_COVERAGE==='1' ? W : E;
  const optCheck=(it,path)=>{ if(!CHO.has(it.type)||!Array.isArray(it.options)||!Number.isInteger(it.answer)) return;
    if(it.answer<0||it.answer>=it.options.length) E(`${path}: الإجابة خارج الخيارات`);
    const fb=it.feedback_by_option||{};
    for(const k of Object.keys(fb)){ if(+k===it.answer) E(`${path}: ردّ خاص على الخيار الصحيح`); if(+k>=it.options.length) E(`${path}: ردّ لخيار غير موجود (${k})`); if(!String(fb[k]).trim()) E(`${path}: ردّ فارغ للخيار ${k}`); }
    const miss=it.options.map((_,i)=>i).filter(i=>i!==it.answer&&!(fb[i]&&String(fb[i]).trim()));
    if(miss.length) COV(`${path}: خيارات خاطئة بلا ردّ خاص بها: ${miss.join('، ')}`);
    if(!it.explanation) COV(`${path}: بلا شرح للجواب (explanation)`); };
  const lists=[['flow.practice',L.flow?.practice],['flow.check',L.flow?.check],['assessment.items',A.items],['assessment.delayed_recall',A.delayed_recall]];
  for(const [nm,arr] of lists) (arr||[]).forEach(it=>optCheck(it,`${nm} ${it.id}`));
  const recObj=new Set((A.delayed_recall||[]).map(d=>d.objective));
  for(const o of L.objectives||[]) if(!recObj.has(o.id)) COV(`${o.id}: هدف بلا سؤال في «عودة الذاكرة»`);
  const CLOSED=['locate_on_atlas','choose','choose_reason','predict','sequence','true_false_why'];
  for(const it of A.items||[]){ if(OPEN.has(it.type)) continue; const a=it.alt, path=`assessment.items ${it.id}.alt`;
    if(!a){ COV(`${it.id}: بند مغلق في الاختبار بلا بند بديل (alt)`); continue; }
    if(typeof a!=='object'||Array.isArray(a)){ E(`${path}: ليس كائناً`); continue; }
    if(a.id||a.objective) E(`${path}: لا يُكتب له id ولا objective (يرثهما من البند)`);
    const t=a.type||it.type; if(!CLOSED.includes(t)) E(`${path}: نوع غير مغلق (${t})`);
    if(!a.prompt||!String(a.prompt).trim()) E(`${path}: بلا سؤال`);
    if(a.prompt&&a.prompt.trim()===String(it.prompt).trim()) E(`${path}: السؤال نفسه لا بديل`);
    if(a.answer===undefined) E(`${path}: بلا إجابة`);
    if(t==='locate_on_atlas'&&!a.atlas_target) E(`${path}: تحديد على الجسم بلا atlas_target`);
    if(['choose','choose_reason','predict'].includes(t)){ if(!Array.isArray(a.options)||a.options.length<3) E(`${path}: أقل من ثلاثة خيارات`);
      if(Array.isArray(it.options)&&Array.isArray(a.options)&&a.options.length===it.options.length&&a.options.every(x=>it.options.includes(x))&&a.options[a.answer]===it.options[it.answer]) E(`${path}: الخيارات نفسها والجواب نفسه`);
      optCheck({...a,type:t},path); }
    if(t==='sequence'&&(!Array.isArray(a.options)||!Array.isArray(a.answer)||a.answer.length!==a.options.length)) E(`${path}: ترتيب بلا خيارات أو إجابة كاملة`);
    if(t==='true_false_why'&&!/^(صح|صحيح|خطأ)/.test(String(a.answer))) E(`${path}: إجابة صح/خطأ لا تبدأ بالحكم`); }
})();

// —— سجل الأحاديث: كل نص نبوي يُعرض من hadith/registry.json بمتنه كاملاً؛ ولا يُقتبس منه جزء بين « »
(function(){ let H=null; try{ H=JSON.parse(readFileSync('hadith/registry.json','utf8')); }catch(e){ E('تعذر قراءة hadith/registry.json'); return; }
  let QV={}; try{ QV=JSON.parse(readFileSync('quran/verses.json','utf8')); }catch(e){}
  const used=new Set();
  const need=(k,path)=>{ const h=H[k]; if(!h||k==='_meta'){ E(`${path}: الحديث ${k} غير موجود في سجل الأحاديث`); return null; } used.add(k); return h; };
  for (const pos of ['opening','closing']) { const t=L.faith?.[pos]; if(!t) continue;
    if(t.grade!=='قرآن'){ if(!t.hadith_key){ E(`faith.${pos}: حديث بلا hadith_key — يُربط بسجل الأحاديث`); }
      else { const h=need(t.hadith_key,`faith.${pos}`); if(h){ if(t.text!==h.text) E(`faith.${pos}: المتن يخالف السجل (${t.hadith_key})`); if(t.reference!==h.source) E(`faith.${pos}: المرجع «${t.reference}» يخالف السجل «${h.source}»`); if(t.grade!==h.grade) E(`faith.${pos}: الدرجة «${t.grade}» تخالف السجل «${h.grade}»`); } } }
    for (const k of t.hadith||[]) need(k,`faith.${pos}.hadith`); }
  (L.life_application||[]).forEach((a,i)=>{ for (const k of a.hadith||[]) need(k,`life_application[${i}].hadith`);
    for (const k of a.quran||[]) if(!QV[k]?.text) E(`life_application[${i}].quran: الآية ${k} غير موجودة في السجل`); });
  for (const k of used){ const h=H[k]; for (const f of ['lead','text','source','grade']) if(!h[f]) E(`سجل الأحاديث ${k}: الحقل ${f} مفقود`);
    if(/…|\.\.\./.test(h.text)) E(`سجل الأحاديث ${k}: متن مقتطع (…)`); if(!h.checked?.url) W(`سجل الأحاديث ${k}: لم يُذكر موضع المقابلة`);
    if(h.narration && !/«[^»]+»/.test(h.text) && !/ﷺ/.test(h.text)) W(`سجل الأحاديث ${k}: رواية بلا كلام نبوي ظاهر`); }
  /* اقتباس بين « » بعد ذكر النبي ﷺ أو الحديث يجب أن يكون متناً كاملاً من السجل (لا جزءاً منه) */
  const norm=t=>(t||'').replace(/[ً-ْٰـ]/g,'').replace(/[«»"'“”،,.؛;:!?؟—–\-()]/g,' ').replace(/\{([^|}]*)\|[^}]*\}/g,'$1').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/\s+/g,' ').trim();
  const full=new Set(Object.entries(H).filter(([k,h])=>k!=='_meta'&&!h.narration).map(([k,h])=>norm(h.text)));
  const walk=(o,path)=>{ if(typeof o==='string'){ const hits=[...o.matchAll(/(ﷺ|النبي|رسول الله|الحديث)[^«»﴿﴾]{0,70}«([^»]*)»/g)].map(m=>m[2]).concat([...o.matchAll(/«([^»]*)»\s*\((?:رواه )?(?:البخاري|مسلم|أبو داود|الترمذي|ابن ماجه|النسائي|أحمد)/g)].map(m=>m[1]));
      for(const q of new Set(hits)) if(!full.has(norm(q))) E(`${path}: اقتباس من حديث ليس متناً كاملاً من السجل: «${q.slice(0,40)}» — يُكتب المعنى بلا علامتي تنصيص، والمتن كاملاً ببطاقة (hadith)`); }
    else if(Array.isArray(o)) o.forEach((v,i)=>walk(v,`${path}[${i}]`));
    else if(o&&typeof o==='object') for(const k of Object.keys(o)){ if(k==='highlight'||k==='hl_words') continue; if(k==='text'&&(o.quran_key||o.hadith_key)) continue; walk(o[k],path?path+'.'+k:k); } };
  walk(L,'');
  /* الآية لا تُكتب يدوياً في نص الدرس خارج كتلة الإيمان: تُعرض من السجل ببطاقة (quran: [...]) */
  const walkQ=(o,path)=>{ if(typeof o==='string'){ if(o.includes('﴿')) E(`${path}: آية مكتوبة في نص الدرس — تُعرض كاملة من السجل ببطاقة (quran)`); }
    else if(Array.isArray(o)) o.forEach((v,i)=>walkQ(v,`${path}[${i}]`)); else if(o&&typeof o==='object') for(const k of Object.keys(o)) walkQ(o[k],path?path+'.'+k:k); };
  for (const k of Object.keys(L)) if(k!=='faith') walkQ(L[k],k);
})();

// —— «في حياتي» (D16)
if (!(L.life_application||[]).length) W('لا حقل «في حياتي» — مطلوب في كل درس (D16)');
for (const a of L.life_application||[]) { for (const k of ['situation','science','action','value']) if (!a[k]) E(`«في حياتي»: الحقل ${k} مفقود`); if (!a.why) W(`«في حياتي» (${a.situation.slice(0,30)}…): بلا شرح «لماذا» للطفل`); }

// —— السلامة
if (!(L.experiment?.safety || []).length) E('التجربة بلا تعليمات سلامة');
const banned = ['حبس النفس للتحدي', 'النظر إلى الشمس', 'تذوق مواد مجهولة'];
for (const s of L.experiment?.steps || []) for (const b of banned) if (s.includes(b)) E(`خطوة تجربة ممنوعة: ${b}`);

// —— المستوى B يُبنى فوق A
const levels = new Set((L.objectives || []).map(o => o.level));
if (levels.has('B') && !levels.has('A')) E('أهداف مستوى ب بلا أهداف مستوى أ');

// —— النتيجة
const stats = {
  objectives: objIds.size, facts: (L.science?.facts || []).length, concepts: (L.concepts || []).length,
  misconceptions: (L.misconceptions || []).length, practice: (L.flow?.practice || []).length,
  check: (L.flow?.check || []).length, assessment: (L.assessment?.items || []).length,
  delayed: (L.assessment?.delayed_recall || []).length, transfer: (L.assessment?.transfer || []).length,
  sources: srcIds.size,
};
console.log(`\nالدرس ${L.id} — ${L.title?.ar}`);
console.log(Object.entries(stats).map(([k, v]) => `${k}=${v}`).join('  '));
for (const w of warnings) console.log('  ⚠ ' + w);
for (const e of errors) console.log('  ✗ ' + e);
console.log(errors.length ? `\nFAIL — ${errors.length} خطأ، ${warnings.length} تحذير` : `\nPASS — 0 خطأ، ${warnings.length} تحذير`);
if(release&&warnings.length)console.error('RELEASE BLOCKED');process.exit(errors.length||(release&&warnings.length)?1:0);

