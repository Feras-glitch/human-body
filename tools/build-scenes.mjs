#!/usr/bin/env node
// يولّد صفحات الدروس بالأسلوب الجديد (مشاهد) من lessons/*.json — إلا الدروس المؤلَّفة يدوياً
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { safeJSON } from './safe-json.mjs';
import { createRequire } from 'node:module';
const { audioKey } = createRequire(import.meta.url)('../app/v2/audio-key.js');
/* التسجيلات البشرية (D09، المراجعة 20 ن-20): ما وُجد ملفه في app/v2/audio/<الدرس>/ من قائمة التسجيل
   (build/<الدرس>/audio-manifest.json يولّدها generate.mjs) يُربط ببصمة نصه، ونطق المصطلحات term.<id>.<ar|en|zh>.mp3.
   لا ملف ← لا مفتاح ← القارئ الآلي. ملف نص تغيّر لا يُربط: بصمته غير بصمة النص الحالي */
const filesIn=dir=>existsSync(dir)?new Set(readdirSync(dir)):new Set();
function mapManifest(map, mf, files, label){
  if(!files.size || !existsSync(mf)) return;
  for(const it of JSON.parse(readFileSync(mf,'utf8')).items){
    if(!files.has(it.file.split('/').pop())) continue;
    const k=audioKey(it.text);
    if(map[k] && map[k]!=='audio/'+it.file) console.warn(`⚠ ${label}: نصان بالبصمة نفسها (${map[k]} و${it.file})`);
    map[k]='audio/'+it.file; } }
/* عبارات الواجهة المشتركة (build/common، app/v2/audio/common) تصلح لكل صفحة */
const COMMON={}; mapManifest(COMMON, 'build/common/audio-manifest.json', filesIn('app/v2/audio/common'), 'common');
function audioMap(id, L){
  const files=filesIn(`app/v2/audio/${id}`), map={...COMMON};
  mapManifest(map, `build/${id}/audio-manifest.json`, files, id);
  /* نطق المصطلح: زر اللغة في المسرد، والعربي منه أيضاً جزءاً قبل تعريفه */
  for(const f of files){ const m=f.match(/^term\.(.+)\.(ar|en|zh)\.mp3$/); if(!m) continue; map[`term.${m[1]}.${m[2]}`]=`audio/${id}/${f}`;
    const c=m[2]==='ar' && (L?.concepts||[]).find(c=>c.id===m[1]); if(c) map[audioKey(c.term.ar)]=`audio/${id}/${f}`; }
  const n=Object.keys(map).length; if(n) console.log(`${id}: ${n} تسجيلاً بشرياً`);
  return map;
}
const HAND = new Set([]);
const ids = readdirSync('lessons').filter(f=>f.endsWith('.json')).map(f=>f.replace('.json','')).sort();
const all = Object.fromEntries(ids.map(id=>[id, JSON.parse(readFileSync(`lessons/${id}.json`,'utf8'))]));
/* سجل الأحاديث: كل نص نبوي يُعرض من السجل بمتنه كاملاً وراويه ودرجته */
const HAD = JSON.parse(readFileSync('hadith/registry.json','utf8'));
const hadithOf = k => { const h=HAD[k]; if(!h||k==='_meta') throw new Error('حديث غير موجود في hadith/registry.json: '+k); return { key:k, lead:h.lead, text:h.text, narration:!!h.narration, source:h.source, grade:h.grade, grader:h.grader||'' }; };
const faithLD = f => { if(!f) return null; const o={...f}; if(f.hadith_key){ const h=hadithOf(f.hadith_key); Object.assign(o,{ lead:h.lead, narration:h.narration, source:h.source, grade:h.grade, grader:h.grader }); } o.cards=(f.hadith||[]).map(hadithOf); return o; };
const lifeLD = l => ({ ...l, cards:(l.hadith||[]).map(hadithOf), verses:l.quran||[] });
const HEAD = (title) => `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8"><meta name="color-scheme" content="light only">
<meta http-equiv="Content-Security-Policy" content="object-src 'none'; base-uri 'none'; form-action 'none'">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<script src="state.js"></script>
<title>${title}</title>
<link rel="stylesheet" href="fonts/app-fonts.css">
<link rel="stylesheet" href="engine.css">
<link rel="stylesheet" href="fonts/qcf2/qcf2.css">
</head>
<body>
<div id="app">
  <header>
    <button class="home" id="homeBtn" title="خريطتي"><img src="img/ui-home.webp" alt="خريطتي" style="width:30px"></button>
    <div class="bar"><i id="barFill"></i></div>
    <span class="stars"><img src="img/ui-star.webp" alt="" style="width:18px;vertical-align:-3px"> <span id="starsTxt">0</span></span>
  </header>
  <main id="main"></main>
  <footer><div class="fwrap">
    <button class="back" id="backBtn" title="السابق" aria-label="السابق">→</button>
    <button class="next" id="nextBtn">التالي</button>
    <button class="spk" id="spkBtn" title="اسمع"><img src="img/ui-speaker.webp" alt="اسمع" style="width:28px"></button>
  </div></footer>
</div>
<div class="confetti" id="confetti"></div>
`;
let made=0;
const OPEN = new Set(['explain_open','fix_model','compare']);
/* بند يعرضه مشهد مؤلَّف يدوياً كسؤال مكتوب (mark(id,false,{text…})) يُعامَل مفتوحاً وإن كان نوعه في الدرس مغلقاً */
const sceneSrc = id => existsSync(`app/v2/scenes/${id}.js`) ? readFileSync(`app/v2/scenes/${id}.js`,'utf8') : '';
const writtenInScene = (src, itemId) => new RegExp(`mark\\('${itemId.replace(/\./g,'\\.')}',\\s*false,\\s*\\{\\s*text`).test(src);
const kindOf = (src, i) => OPEN.has(i.type) || writtenInScene(src, i.id) ? 'open' : 'closed';
const stripRecall = t => (t||'').replace(/\(بعد [^)]{1,20}\)\s*/,'');
const testId = id => id.replace(/\.L(\d{2})$/, '.T$1');
for(const id of ids){ if(HAND.has(id)) continue; const L=all[id]; const unit=L.unit.id;
  const unitIds = ids.filter(i=>i.startsWith(unit+'.')); const k=unitIds.indexOf(id); const next = unitIds[k+1]||null;
  const items=[...L.flow.practice,...L.flow.check];
  const LESSON={ id, unit, title:L.title.ar, next: next?next+'.html':'index.html', home:'index.html', check_ids:items.map(i=>i.id),check_levels:Object.fromEntries(items.map(i=>[i.id,i.level||'A'])), check_kinds:Object.fromEntries(items.map(i=>[i.id,kindOf(sceneSrc(id),i)])) };
  const TERMS=L.concepts.map(c=>({id:c.id, ar:c.term.ar, en:c.term.en, zh:c.term.zh, py:c.term.pinyin||''}));
  const sci=L.science||{};
  const LD={ id, first: k===0, title:L.title.ar, driving_question:L.driving_question, central_fact:sci.central_fact, next,
    hook:L.flow.hook, explain:L.flow.explain, practice:L.flow.practice, check:L.flow.check, concepts:L.concepts, experiment:L.experiment||null,
    find_the_error:L.find_the_error||[], numbers:sci.numbers||[], true_size:L.true_size||[], animal:sci.animal_comparison||null, organ_letter:L.organ_letter||null,
    history:L.history||[], how_we_know:(sci.how_we_know&&sci.how_we_know[0])?{text:sci.how_we_know[0].text, limit_question:L.flow.how_we_know?.limit_question||''}:(L.flow.how_we_know||null),
    what_changed:sci.what_changed||[], model_limits:sci.model_limits||[], faith:{opening:faithLD(L.faith?.opening), closing:faithLD(L.faith?.closing)}, life:(L.life_application||[]).map(lifeLD),
    open_questions:sci.open_questions||[], notebook:L.flow.notebook||null,
    imgs: readdirSync('app/v2/img').filter(f=>f.startsWith(id+'-')&&f.endsWith('.webp')).map(f=>f.replace('.webp','')) };
  const AUDIO = audioMap(id, L);
  const html = HEAD(L.title.ar) + `<script src="audio-key.js"></script>
<script>
const LESSON = ${safeJSON(LESSON)};
const TERMS = ${safeJSON(TERMS)};
window.AUDIO = ${safeJSON(AUDIO)};
</script>
<script src="engine.js"></script>
<script src="recording.js"></script>
<script>
const LD = ${safeJSON(LD)};
</script>
<script src="lesson-runtime.js"></script>
${existsSync(`app/v2/scenes/${id}.js`)?`<script src="scenes/${id}.js"></script>`:''}
<script>const SCENES = applyCustom(buildScenes(LD), window.CUSTOM||{}); boot();</script>
</body>
</html>
`;
  writeFileSync(`app/v2/${id}.html`, html); made++;
  /* صفحة اختبار الدرس: بنود التقييم والنقل وعودة الذاكرة */
  const A=L.assessment||{}; const tid=testId(id);
  const TEST={ id:tid, lesson:id, unit, title:'اختبار: '+L.title.ar, home:'index.html', next:'index.html', check_ids:[] };
  const TD={ id:tid, lesson:id, first:false, title:'اختبار: '+L.title.ar, lessonTitle:L.title.ar, concepts:[], check:[],
    items:(A.items||[]), transfer:(A.transfer||[]), recall:(A.delayed_recall||[]).map(d=>({...d, prompt:stripRecall(d.prompt)})) };
  writeFileSync(`app/v2/${tid}.html`, HEAD(TEST.title) + `<script src="audio-key.js"></script>
<script>
const LESSON = ${safeJSON(TEST)};
const TERMS = [];
window.AUDIO = ${safeJSON(AUDIO)};
</script>
<script src="engine.js"></script>
<script>
const LD = ${safeJSON(TD)};
</script>
<script src="lesson-runtime.js"></script>
<script src="test-runtime.js"></script>
<script>const SCENES = buildTest(LD); boot();</script>
</body>
</html>
`);
}
/* بيانات شاشة ولي الأمر لكل الدروس */
const plainQ = t => (t||'').replace(/\{[^}]*\}/g,m=>m.includes('|')?m.split('|')[0].slice(1):'').replace(/\{اسم\}/g,'');
const anchors = L => Object.fromEntries((L.assessment?.rubrics||[]).map(r=>[r.for, ['0','1','2'].map(k=>r.levels?.[k]||'')]));
const REVIEW = ids.map(id=>{ const L=all[id]; const items=[...L.flow.practice,...L.flow.check]; const closed=items.filter(i=>!['true_false_why','explain_open','fix_model','compare'].includes(i.type)).map(i=>({id:i.id,level:i.level||'A',label:plainQ(i.prompt)}));
  const open=items.filter(i=>['true_false_why','explain_open','fix_model','compare'].includes(i.type)).map(i=>({id:i.id,level:i.level||'A',key:id.startsWith('U01.')?'open_'+i.id.split('.').pop():'open_'+i.id,q:plainQ(i.prompt),model:plainQ(i.answer),graded:i.type==='true_false_why',rubric:i.rubric||'R1'}));
  const A=L.assessment||{};
  const titem = i => ({id:i.id,level:i.level||'A',label:stripRecall(plainQ(i.prompt)),open:OPEN.has(i.type),tf:i.type==='true_false_why',model:OPEN.has(i.type)||i.type==='true_false_why'?plainQ(i.answer):'',rubric:i.rubric||'R1'});
  return { id, test:testId(id), unit:L.unit.id, unitTitle:L.unit.title, title:L.title.ar,
    checks:L.flow.check.map(i=>({id:i.id,level:i.level||'A',open:kindOf(sceneSrc(id),i)==='open'})),
    closed, open, drawTitle:(L.flow.notebook?.draw||'').slice(0,80), anchors:anchors(L),
    testItems:(A.items||[]).map(titem), transfer:(A.transfer||[]).map(titem), recall:(A.delayed_recall||[]).map(titem),
    objectives:(L.objectives||[]).map(o=>o.statement), hookOptions:(L.flow.hook?.options||[]).map(plainQ), dinner:L.dinner||null }; });
writeFileSync('app/v2/review-data.js', 'const REVIEW = '+JSON.stringify(REVIEW)+';\nconst IMG_ALL = '+JSON.stringify(readdirSync('app/v2/img').filter(f=>f.endsWith('.webp')).map(f=>f.replace('.webp','')))+';\n');
console.log('scenes:', made, 'دروس مولَّدة؛ review-data:', REVIEW.length);

/* صفحات الوحدات: الإهداء + عودة الذاكرة */
const U01_IDEAS=[
 {l:'الدرس 1',t:'الوصف الدقيق للموضع',s:'نقول «فوق المرفق» و«أسفل الركبة» بدل «هنا» — لماذا يحتاج الطبيب إلى ذلك؟'},
 {l:'الدرس 1',t:'اليمين واليسار من جهة صاحب الجسم',s:'يمين صديقك هو يسارك عندما يواجهك. جرّبها بالمصافحة.'},
 {l:'الدرس 1',t:'ثلاثة أخطاء مشهورة عن الجسم',s:'مثل: «الأطفال أصغر من البالغين في كل شيء» — الرأس دليل أن هذا خطأ.'},
 {l:'الدرس 2',t:'ملاحظة أم تخمين؟',s:'«يبكي» أراه، «حزين» أظنه. علّمها بصورة واحدة وثلاث جمل.'},
 {l:'الدرس 2',t:'تجربة المسطرة',s:'قِس زمن ردّ فعل أخيك ثلاث مرات وخذ الرقم الأوسط. اشرح لماذا ثلاث.'},
 {l:'الدرس 2',t:'المقارنة العادلة',s:'لتقارن شيئين غيّر شيئاً واحداً فقط. مثال: اليد اليمنى واليسرى بالمسطرة نفسها.'}];
const clean = t => (t||'').replace(/\{([^|}]*)\|[^}]*\}/g,'$1').replace(/\{اسم\}/g,'');
const tpl = readFileSync('app/v2/unit-template.html','utf8');
const units=[...new Set(ids.map(i=>i.split('.')[0]))];
for(const u of units){ const ls=ids.filter(i=>i.startsWith(u+'.')); const title=all[ls[0]].unit.title;
  const ideas = u==='U01' ? U01_IDEAS : ls.flatMap((id,i)=>{ const L=all[id]; const cs=L.concepts.filter(c=>c.priority==='core').slice(0,2); return cs.map(c=>({l:`الدرس ${i+1}`, t:c.term.ar, s:clean(c.card.A)})); });
  const data={ id:u, title, lessons: ls.map(id=>({id, test:testId(id), title:all[id].title.ar, checks:all[id].flow.check.map(i=>({id:i.id,level:i.level||'A',open:kindOf(sceneSrc(id),i)==='open'}))})), ideas };
  writeFileSync(`app/v2/${u}.unit.html`, tpl.replace(/\/\*__UNIT_TITLE__\*\//g,title).replace(/\/\*__UNIT__\*\//g,u).replace('/*__UNIT_DATA__*/',safeJSON(data)));
}
console.log('unit pages:', units.join(' '));

