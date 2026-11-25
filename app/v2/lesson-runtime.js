/* يبني مشاهد الدرس من بيانات المصدر (LD) على محرك engine.js — الدروس المولَّدة آلياً من lessons/*.json */
/* صورة تعذّر تحميلها: يُسجَّل اسمها على الجهاز (خارج بيانات الأطفال) ليراه ولي الأمر في شاشته */
const PIC = (name, label) => { try{ const k='hb-diag-img', a=JSON.parse(localStorage.getItem(k)||'[]'); if(!a.includes(name)){ a.push(name); localStorage.setItem(k, JSON.stringify(a.slice(-60))); } }catch{} return `<div class="ph" data-pic="${name}">🖼 تعذّر عرض الصورة: ${label||name}</div>`; };
/* الصورة التوضيحية: ارتفاع ثابت (لا قفزة عند التحميل)، ولمسها يكبّرها ملء الشاشة (engine.js) */
/* صورة خانة لم تُولَّد بعد (ليست في LD.imgs) لا تُعرض أصلاً؛ وإطار «تعذّر عرض الصورة» لصورة موجودة تعذّر فتحها فقط */
const pic = (name, label) => (typeof LD!=='undefined' && Array.isArray(LD.imgs) && String(name).startsWith(LD.id+'-') && !LD.imgs.includes(name)) ? '' : `<span class="artw"><img src="img/${name}.webp" alt="" class="art" decoding="async" tabindex="0" role="button" aria-label="تكبير الصورة" onerror="this.parentNode.outerHTML=PIC('${name}','${(label||'').replace(/'/g,'’')}')"></span>`;
const esc = s => String(s||'').replace(/[<>&{}|]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','{':'&#123;','}':'&#125;','|':'&#124;'}[c]));
const hlText = (t, h) => { t=esc(t); if(!h) return t; const i=t.indexOf(esc(h)); return i<0 ? t : t.slice(0,i)+'<mark>'+esc(h)+'</mark>'+t.slice(i+esc(h).length); };
const shuffle = a => { a=[...a]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const openKey = id => 'open_'+id;

/* المستوى: يختاره الطفل في أول درس بالوحدة، ويُورَث في بقيتها */
function inheritLevel(){if(LD.first&&level)return; try{ level = JSON.parse(Atlas.storage.getItem('atlas:'+LESSON.unit+'.L01:level')||'null'); }catch(e){} if(!level && !LD.first) level='A'; if(level) store.set('level',level); }

/* ===== مشاهد الأسئلة ===== */
const whyOf = it => it.feedback_correct || it.explanation || '';
/* نص السؤال المنطوق: أجزاؤه إن رُكّب من عبارة واجهة ونص الدرس (سؤال من عالم آخر، عودة الذاكرة)، فلكل جزء تسجيله */
const sayPrompt = it => it.sayParts ? it.sayParts.map(p=>tx(p)) : tx(it.prompt);
function sceneChoice(it){ return { id:it.id, level:it.level, render(){ need(); return `<div class="scene">${choice({id:it.id, prompt:it.prompt, options:it.options, answer:it.answer, why:whyOf(it), hint:it.feedback_wrong||'', perOption:it.feedback_by_option||null, graded:true})}</div>`; },
  after(){ speak(sayPrompt(it)); } }; }

/* صح/خطأ ولماذا: يختار الطفل، ثم يكتب سببه قبل أن يرى الجواب، ثم يُكشف الجواب وسببه.
   فما يقرؤه ولي الأمر تفسير كتبه الطفل بنفسه لا نسخة من الجواب النموذجي. */
function sceneTrueFalse(it){ const isFalse=/^خطأ/.test(it.answer); const why=it.answer.replace(/^(خطأ|صح|صحيح)[؛;:،,]?\s*/,''); return { id:it.id, level:it.level, render(){ need(); const v=store.get(openKey(it.id),''); return `<div class="scene"><h2>${tx(it.prompt)}</h2>
    <div class="row"><button class="opt" style="width:auto;flex:1" data-v="t">✔ صح</button><button class="opt" style="width:auto;flex:1" data-v="f">✘ خطأ</button></div>
    <div id="whyBox" hidden><p class="note">قبل أن {ترى|تري} الجواب: لماذا اخترت{|ِ} ذلك؟ اكتب{|ي} بكلماتك{|ِ} (يقرؤها ولي أمرك{|ِ} أو معلمك{|ِ}):</p><textarea id="ans" placeholder="لأن…">${esc(v)}</textarea>
    <button class="opt" style="width:auto" id="showAns" disabled>أرني الجواب</button></div><div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after(){ const p0=progress[it.id]; let picked=(p0&&(p0.pick==='t'||p0.pick==='f'))?p0.pick:null;
    const reveal=(say=true)=>{ const right=picked!==null && (picked==='f')===isFalse; $$('[data-v]').forEach(x=>{ x.disabled=true; if((x.dataset.v==='f')===isFalse) x.classList.add('ok'); }); fb(right?'ok':'bad', (right?'أحسنت! ':'الجواب: '+(isFalse?'خطأ':'صح')+'. ')+why, {say}); $('#showAns').hidden=true; ok(); };
    const lock=()=>{ $$('[data-v]').forEach(x=>{ x.disabled=true; x.classList.toggle('picked', x.dataset.v===picked); x.setAttribute('aria-pressed', String(x.dataset.v===picked)); }); $('#whyBox').hidden=false; };
    const chk=()=>{ $('#showAns').disabled = realWords($('#ans').value)<3; };
    if(picked){ lock(); chk(); if(p0.revealed) reveal(false); }
    $$('[data-v]').forEach(b=>b.onclick=()=>{ if(picked) return; picked=b.dataset.v; mark(it.id,(picked==='f')===isFalse,{answered:true,pick:picked}); lock(); chk(); $('#ans').focus(); });
    $('#ans').oninput=e=>{ const v=String(e.target.value).slice(0,TEXT_MAX); store.set(openKey(it.id),v); const p=progress[it.id]||{hints:0,ok:false}; p.text=v; p.answered=true; progress[it.id]=p; store.set('progress',progress); chk(); };
    $('#showAns').onclick=()=>{ const p=progress[it.id]; if(p){ p.revealed=true; store.set('progress',progress); } if(p?.firstAttempt===true) award(); reveal(); };
    speak(sayPrompt(it)); } }; }

/* إجابة مفتوحة (البند 38): لا تُقبل قبل ثلاث كلمات حقيقية (حرفان فأكثر، لا حرف مكرر مثل «ببببب»)؛
   ثم «قارن بإجابة نموذجية» يُقفل ما كُتب ويعرض النموذج، ويقيّم الطفل نفسه (ذكرها كلها/بعضها/لم يذكرها)،
   ويرى ولي الأمر تقييمه بجانب إجابته. البند بلا إجابة نموذجية (اكتب ما تتذكره) يكفيه الشرط الأول. */
const realWords = v => (String(v||'').match(/[ء-يٱ-ۓً-ْA-Za-z]{2,}/g)||[]).map(w=>w.replace(/[ً-ْ]/g,'')).filter(w=>w.length>=2 && !/^(.)\1+$/.test(w)).length;
const SELF = [['2','ذكرتها كلها'],['1','ذكرت بعضها'],['0','لم أذكرها']];
function sceneOpen(it){ const model = typeof it.answer==='string' && it.answer.trim() ? it.answer : null;
  return { id:it.id, level:it.level, render(){ need(); const v=store.get(openKey(it.id),''); return `<div class="scene"><div class="row" style="justify-content:center">${buddy(90,'think')}</div><h2>${tx(it.prompt)}</h2>
    <textarea id="ans" placeholder="أظن أن…">${esc(v)}</textarea><p class="note">اكتب{|ي} بكلماتك{|ِ}، ثلاث كلمات على الأقل${model?'، ثم قارن{|ي} إجابتك{|ِ} بإجابة نموذجية':''}. يقرؤها ولي أمرك{|ِ} أو معلمك{|ِ}.</p>
    ${model?`<button class="opt" style="width:auto" id="cmp" disabled>قارن{|ي} بإجابة نموذجية</button><div id="modelBox" hidden><div class="model"><b>إجابة نموذجية:</b> ${tx(model)}</div><p class="note">هل في إجابتك{|ِ} هذه الفكرة؟</p><div class="row">${SELF.map(([k,l])=>`<button class="opt" style="width:auto;flex:1" data-self="${k}">${l}</button>`).join('')}</div></div>`:''}
    <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after(){ const enough=v=>realWords(v)>=3;
    const save=v=>{ v=String(v).slice(0,TEXT_MAX); store.set(openKey(it.id),v); const p=progress[it.id]||{hints:0,ok:false}; p.text=v; p.answered=true; progress[it.id]=p; store.set('progress',progress); };
    const showModel=()=>{ $('#ans').readOnly=true; $('#ans').classList.add('locked'); $('#cmp').hidden=true; $('#modelBox').hidden=false; };
    const state=()=>{ const v=$('#ans').value; if(!model){ enough(v)?ok():need(); return; } $('#cmp').disabled=!enough(v); progress[it.id]?.self!==undefined ? ok() : need(); };
    const p0=progress[it.id];
    if(model && p0?.compared){ showModel(); if(p0.self!==undefined) $$('[data-self]').forEach(b=>b.classList.toggle('picked',b.dataset.self===String(p0.self))); }
    $('#ans').oninput=e=>{ if($('#ans').readOnly) return; save(e.target.value); state(); };
    if(model){
      $('#cmp').onclick=()=>{ if(!enough($('#ans').value)) return; const p=progress[it.id]||{hints:0,ok:false}; p.compared=true; progress[it.id]=p; store.set('progress',progress); showModel(); state(); };
      $$('[data-self]').forEach(b=>b.onclick=()=>{ const p=progress[it.id]||{hints:0,ok:false}; p.self=+b.dataset.self; progress[it.id]=p; store.set('progress',progress); $$('[data-self]').forEach(x=>x.classList.toggle('picked',x===b));
        fb(p.self===2?'ok':'bad', p.self===2?'إجابتك{|ِ} فيها الفكرة.':p.self===1?'{أكمل|أكملي} في ذهنك{|ِ} ما نقص من الفكرة.':'{اقرأ|اقرئي} الإجابة النموذجية مرة أخرى، ثم {قلها|قوليها} بكلماتك{|ِ}.'); state(); });
    }
    state(); speak(sayPrompt(it)); } }; }

/* ترتيب خطوات: خطآن ثم «أرني الترتيب الصحيح»؛ النجمة للترتيب الصحيح من أول مرة */
/* ترتيب العرض لا يساوي الترتيب الصحيح أبداً (وإلا كان الجواب معروضاً) */
function seqOrder(it){ let o=optionOrder(it.id, it.options.length); if(o.length>1 && o.every((v,k)=>v===it.answer[k])){ o=[...o.slice(1),o[0]]; const all=store.get('order',{}); all[it.id]=o; store.set('order',all); } return o; }
function sceneSequence(it){ return { id:it.id, level:it.level, render(){ need(); const order=seqOrder(it); return `<div class="scene"><h2>${tx(it.prompt)}</h2><p class="note">المس{|ي} الخطوات بالترتيب الصحيح، الأولى فالثانية…</p>
    <div id="pool">${order.map(i=>`<button class="opt" data-i="${i}">${tx(it.options[i])}</button>`).join('')}</div><div id="seq" class="row" style="margin-top:8px"></div><div class="fb" id="fb" role="status" aria-live="polite"></div><button class="opt reveal" id="reveal" hidden>أرني الترتيب الصحيح</button></div>`; },
  after(){ /* عودة بعد ترتيب خاطئ: لا تُعدّ محاولة أولى (ن-16) */ const missed=progress[it.id]?.firstAttempt===false; let picked=[], first=!missed, wrong=missed?1:0; const showSeq=list=>$('#seq').innerHTML=list.map((i,k)=>`<span class="chip done">${k+1}. ${tx(it.options[i])}</span>`).join('');
    const reset=()=>{ picked=[]; $('#seq').innerHTML=''; $$('#pool .opt').forEach(b=>{ b.disabled=false; b.classList.remove('dim'); }); };
    const solved=(say=true)=>{ showSeq(it.answer); $$('#pool .opt').forEach(b=>{ b.disabled=true; b.classList.add('dim'); }); $('#reveal').hidden=true; fb('ok',[SAY.seq_shown, whyOf(it)],{say}); ok(); };
    if(progress[it.id]?.ok || progress[it.id]?.solved || progress[it.id]?.revealed) solved(false);
    $$('#pool .opt').forEach(b=>b.onclick=()=>{ picked.push(+b.dataset.i); b.disabled=true; b.classList.add('dim'); showSeq(picked);
      if(picked.length===it.options.length){ const right=picked.every((v,k)=>v===it.answer[k]), wasFirst=first; if(first){ mark(it.id,right); first=false; } else if(right) mark(it.id,true);
        if(right){ fb('ok',[wasFirst?SAY.seq_right:SAY.seq_right_now, whyOf(it)]); if(progress[it.id]?.firstAttempt===true) award(); ok(); }
        else { wrong++; fb('bad',[SAY.seq_wrong, ...(wrong>=2&&it.feedback_wrong?[SAY.hint, it.feedback_wrong]:[]), SAY.try_again]); if(wrong>=2) $('#reveal').hidden=false; sceneTimeout(reset,1500); } } });
    $('#reveal').onclick=()=>{ mark(it.id,false,{revealed:true}); solved(); };
    speak(sayPrompt(it)); } }; }

/* تحديد على الجسم: ما له منطقة على خريطة الجسم يُلمس، وإلا سؤال اختيار */
const ATLAS = {
  femur:{side:'front',ids:['thigh','thigh_l'],show:['head','chest','abdomen','upperarm_r','forearm_r','thigh','thigh_l','leg','leg_l','foot','foot_l']},
  spine:{side:'back',ids:['back'],show:['b_head','b_neck','back','b_arm_r','b_arm_l','b_legs','b_feet']},
  heart:{side:'front',ids:['chest'],show:['head','neck','chest','abdomen','upperarm_r','thigh','thigh_l']},
  left_ventricle:{side:'front',ids:['chest'],show:['head','neck','chest','abdomen','upperarm_r','thigh','thigh_l']},
  abdomen:{side:'front',ids:['abdomen']}, forearm:{side:'front',ids:['forearm_r','forearm_l']},
  lungs:{side:'front',ids:['chest'],show:['head','neck','chest','abdomen','upperarm_r','thigh','thigh_l']}, lungs_back:{side:'back',ids:['back'],show:['b_head','b_neck','back','b_arm_r','b_arm_l','b_legs','b_feet']},
  kidneys:{side:'back',ids:['back'],show:['b_head','b_neck','back','b_arm_r','b_arm_l','b_legs','b_feet'],q:'حدّد{|ي} موضع الكليتين على رسم الظهر.'},
  nucleus:{cell:true,variant:0,ids:['nucleus']}, membrane:{cell:true,variant:1,ids:['membrane']}, cytoplasm:{cell:true,variant:0,ids:['cytoplasm']}, mitochondria:{cell:true,variant:1,ids:['mitochondria']},
  thigh:{side:'front',ids:['thigh','thigh_l'],show:['head','chest','abdomen','upperarm_r','forearm_r','thigh','thigh_l','leg','leg_l','foot','foot_l'],q:'حدّد{|ي} الفخذ على هذا الرسم.'},
  /* أهداف لا رسم قابلاً للنقر لها بعد في صفحة الاختبار: سؤال اختيار بنص صريح (q) بدل «اضغط على الرسم» */
  diaphragm:{q:'أين يقع الحجاب الحاجز؟',choice:['عضلة قبّية تحت الرئتين بين الصدر والبطن','عضلة في العنق','عضلة في الذراع','غشاء حول القلب'],answer:0},
  pelvis:{q:'أين يقع الحوض؟',choice:['أسفل الجذع، وتتصل به عظمتا الفخذين','أعلى الصدر تحت العنق','حول الدماغ','في الساعد'],answer:0},
  wrist:{q:'أين يقع مفصل الرسغ؟',choice:['بين الساعد واليد','بين العضد والساعد','بين الساق والقدم','في الكتف'],answer:0},
  triceps:{q:'أين تقع العضلة التي تمدّ المرفق؟',choice:['خلف العضد','أمام العضد','في الساعد','في الكتف'],answer:0},
  right_atrium:{q:'أين يقع الأذين الأيمن في القلب؟',choice:['في أعلى القلب، في جانبه الأيمن','في أسفل القلب، في جانبه الأيمن','في أعلى القلب، في جانبه الأيسر','في أسفل القلب، في جانبه الأيسر'],answer:0},
  arteries:{q:'أي وعاء من هذه شريان؟',choice:['وعاء يحمل الدم من القلب إلى الذراع','وعاء يعيد الدم من القدم إلى القلب','وعاء دقيق جداً يحدث فيه التبادل','وعاء يعيد الدم من الرأس إلى القلب'],answer:0},
  wbc:{q:'كيف تميّز{|ين} الخلايا البيضاء في قطرة دم تحت المجهر؟',choice:['أكبر من الحمراء وأقل منها عدداً بكثير','أصغر القطع في القطرة','أقراص حمراء كثيرة جداً','السائل الأصفر حول الخلايا'],answer:0},
  marrow:{q:'أين تُصنع خلايا الدم؟',choice:['في نخاع العظم داخل العظام','في القلب','في الرئتين','في الجلد'],answer:0},
  alveoli:{q:'أين تقع الحويصلات في الرئة؟',choice:['في نهايات أدق الأنابيب، كعناقيد صغيرة','في القصبة الهوائية','حول القلب','في الحجاب الحاجز'],answer:0},
  knee:{choice:['بين الفخذ والساق','بين الساق والقدم','بين العضد والساعد','في الكتف'],answer:0},
  ankle:{choice:['بين الساق والقدم','بين الفخذ والساق','بين الساعد واليد','في الورك'],answer:0},
  plasma:{choice:['السائل الذي تسبح فيه خلايا الدم','الخلايا الحمراء','الصفائح','جدار الوعاء'],answer:0},
};
/* خريطة خلية قابلة للنقر (U05): الغشاء، السيتوبلازم، النواة، الميتوكوندريا */
function cellMap({variant=0,size=340}={}){
  /* الرسم من Servier Medical Art (CC BY 4.0). الشكل الثاني هو الأول مقلوباً 180° حتى لا يحفظ الطفل موضعاً واحداً. المناطق شفافة فوق الصورة */
  const OUT='889,457 890,527 872,595 845,659 811,721 768,777 712,820 642,838 567,822 501,792 448,775 399,767 348,765 294,760 234,752 169,737 116,699 61,655 29,594 10,527 4,457 6,387 17,317 44,251 81,190 122,131 172,77 234,37 307,22 382,37 448,6 519,14 586,33 654,55 706,103 771,134 842,171 886,234 899,311 896,386';
  const IN='851,457 855,522 845,586 825,649 795,709 753,762 697,800 628,809 557,793 497,765 448,748 403,742 357,738 307,735 250,730 189,717 133,687 88,641 56,585 39,522 27,457 35,392 48,327 73,266 113,213 162,171 222,146 288,142 343,133 396,126 448,117 502,120 553,134 601,158 647,184 696,210 747,240 793,282 828,334 847,394';
  const flip=variant%2===1, T=flip?' transform="rotate(180 450 419)"':'';
  const P=flip?{membrane:[450,60],cytoplasm:[400,250],mitochondria:[232,560],nucleus:[591,610]}:{membrane:[450,796],cytoplasm:[500,640],mitochondria:[668,490],nucleus:[309,520]};
  const MITO=[[100,353,36,62,8],[668,390,60,37,12],[654,733,54,26,5]];
  const m=MITO.map(o=>`<ellipse class="zone" cx="${o[0]}" cy="${o[1]}" rx="${o[2]}" ry="${o[3]}" transform="${flip?'rotate(180 450 419) ':''}rotate(${o[4]} ${o[0]} ${o[1]})"/>`).join('');
  const lab=(id,ar)=>{ const [x,y]=P[id], w=ar.length*27+50; return `<g class="label" hidden><rect class="tagbox" x="${x-w/2}" y="${y-40}" width="${w}" height="72" rx="18"/><text class="tag" x="${x}" y="${y+14}" text-anchor="middle" style="font-size:44px">${ar}</text></g>`; };
  return `<div class="body-wrap cell-map" style="position:relative;width:min(${size}px,100%);margin:0 auto;aspect-ratio:900/838"><svg viewBox="-10 -10 920 858" style="width:100%;height:100%;display:block;background:#fbf6ea;border-radius:16px">
    <image href="img/sv-cell.webp" x="0" y="0" width="900" height="838"${T}/>
    <g class="hot" data-id="membrane" data-ar="الغشاء" tabindex="0" role="button" aria-label="الغشاء"><path class="zone" d="M${OUT}Z M${IN}Z" fill-rule="evenodd"${T}/>${lab('membrane','الغشاء')}</g>
    <g class="hot" data-id="cytoplasm" data-ar="السيتوبلازم" tabindex="0" role="button" aria-label="السيتوبلازم"><path class="zone" d="M${IN}Z"${T}/>${lab('cytoplasm','السيتوبلازم')}</g>
    <g class="hot" data-id="mitochondria" data-ar="الميتوكوندريا" tabindex="0" role="button" aria-label="الميتوكوندريا">${m}${lab('mitochondria','الميتوكوندريا')}</g>
    <g class="hot" data-id="nucleus" data-ar="النواة" tabindex="0" role="button" aria-label="النواة"><ellipse class="zone" cx="309" cy="372" rx="90" ry="92"${T}/>${lab('nucleus','النواة')}</g>
  </svg></div>`;
}
function sceneLocate(it){ const a=ATLAS[it.atlas_target];
  /* هدف بلا رسم ولا بديل: لا يُعرض سؤال بلا معنى؛ يُكتب تحذير ويُتخطّى المشهد (والاختبار tests/review-fixes.cjs يمنع وصوله) */
  if(!a){ console.warn('locate_on_atlas بلا هدف معرّف:', it.id, it.atlas_target); return { id:it.id, level:it.level, skip:()=>true, render(){ ok(); return null; } }; }
  if(a.choice) return sceneChoice({...it,prompt:a.q||it.prompt,options:a.choice,answer:a.answer});
  if(a.q) it={...it,prompt:a.q};
  const map = a.cell ? cellMap({variant:a.variant||0}) : bodyMap({side:a.side, ids:a.show||a.ids, size:360});
  return { id:it.id, level:it.level, render(){ need(); return `<div class="scene"><h2>${tx(it.prompt)}</h2>${map}<div class="fb" id="fb" role="status" aria-live="polite"></div><button class="opt reveal" id="reveal" hidden>أرني المكان</button></div>`; },
    after(){ /* عودة بعد لمسة خاطئة: لا تُعدّ محاولة أولى (ن-16) */ const missed=progress[it.id]?.firstAttempt===false; let first=!missed, wrong=missed?1:0; const light=()=>$$('.hot').forEach(h=>{ if(a.ids.includes(h.dataset.id)){ h.classList.add('lit'); h.querySelector('.label')?.removeAttribute('hidden'); } });
      const done_=(msg,say=true)=>{ light(); $('#reveal').hidden=true; fb('ok', [msg, whyOf(it)], {say}); ok(); };
      if(progress[it.id]?.ok || progress[it.id]?.solved || progress[it.id]?.revealed) done_('', false);
      $$('.hot').forEach(h=>h.onclick=()=>{ const right=a.ids.includes(h.dataset.id), wasFirst=first; if(first){ mark(it.id,right); first=false; } else if(right) mark(it.id,true);
        if(right){ done_(wasFirst?SAY.praise:SAY.right_now); if(progress[it.id]?.firstAttempt===true) award(); }
        else { wrong++; fb('bad', h.dataset.ar ? 'ليس هنا — هذا '+h.dataset.ar+'. '+(wrong>=2&&it.feedback_wrong?it.feedback_wrong:SAY.try_place) : [SAY.not_here, wrong>=2&&it.feedback_wrong?it.feedback_wrong:SAY.try_place]); if(wrong>=2) $('#reveal').hidden=false; } });
      $('#reveal').onclick=()=>{ mark(it.id,false,{revealed:true}); done_('هنا. '); };
      speak(sayPrompt(it)); } }; }

/* بند يسأل عن رسم (figure = اسم صورة في img/) يعرض الرسم فوق السؤال */
function sceneItem(it){ const sc=sceneItemBare(it); return it.figure ? withPics(sc,[it.figure]) : sc; }
function sceneItemBare(it){ switch(it.type){ case 'choose': case 'choose_reason': case 'predict': return sceneChoice(it); case 'true_false_why': return sceneTrueFalse(it); case 'explain_open': case 'fix_model': return sceneOpen(it); case 'sequence': return sceneSequence(it); case 'locate_on_atlas': return sceneLocate(it); default: return sceneOpen(it); } }

/* ===== بطاقات المفاهيم: المفهوم يُعرَّف عند أول ذكر له ===== */
function conceptCard(c){ const lv = level==='B' && c.card.B ? `<div class="note" style="margin-top:4px"><b>للمستوى ب:</b> ${tx(c.card.B)}</div>` : ''; return `<div class="card" data-def="${c.id}" style="border-right:6px solid var(--sun)">${termHead(c)}<div style="margin-top:6px">${tx(c.card.A)}</div>${lv}</div>`; }
/* رأس بطاقة المفهوم: العربي، ثم الإنجليزي وزر 🔊 ينطقه بالإنجليزية (تسجيل إن وُجد وإلا القارئ الآلي)، ثم الصيني صغيراً */
const termHead = c => `<span class="chip">${c.term.ar}</span> <bdi class="term-en" dir="ltr" lang="en">${c.term.en}</bdi><button type="button" class="say-en" data-term="${c.id}" aria-label="استمع إلى المصطلح بالإنجليزية: ${c.term.en}">🔊</button>${c.term.zh?` <small class="note" lang="zh">${c.term.zh}</small>`:''}`;
/* البطاقات تُضاف إلى المشهد في أي لحظة (التعريف عند أول ذكر)، فالنقر يُلتقط على مستوى الصفحة */
document.addEventListener('click', e=>{ const b=e.target.closest?.('[data-term]'); if(!b) return; e.preventDefault(); const t=(typeof TERMS!=='undefined'?TERMS:[]).find(x=>x.id===b.dataset.term); if(t) sayTerm(t,'en'); });

/* ===== بناء المشاهد ===== */
function buildScenes(LD){
  const S=[]; const unitFirst = LD.first;
  /* البداية */
  S.push({ id:'start', render(){ if(unitFirst && !level) need(); else ok(); return `<div class="scene">${pic(LD.id+'-title-'+(g()?'girl':'boy'), 'غلاف: '+LD.title)}<h1>${LD.title}</h1>
      <p class="say"><b>{اسم}</b>، ${tx(LD.driving_question)}</p>
      ${unitFirst?`<p class="note">{اختر|اختاري} مستواك{|ِ} في هذه الوحدة:</p><div class="lvl row"><button class="opt" style="width:auto;flex:1" data-l="A" aria-pressed="${level==='A'}">أ · أبدأ</button><button class="opt" style="width:auto;flex:1" data-l="B" aria-pressed="${level==='B'}">ب · أتعمّق</button></div>`:''}</div>`; },
    after(){ $$('.lvl button').forEach(b=>b.onclick=()=>{ level=b.dataset.l; store.set('level',level); $$('.lvl button').forEach(x=>{x.setAttribute('aria-pressed',String(x===b)); x.classList.toggle('ok',x===b);}); ok(); }); speak([tx(LD.title+'.'), tx(LD.driving_question)]); } });
  /* افتتاح شرعي */
  if(LD.faith.opening) S.push(sceneFaith(LD.faith.opening,'opening'));
  /* الجذب */
  if(LD.hook) S.push({ id:'hook', render(){ need(); return `<div class="scene"><div class="row" style="justify-content:center">${buddy(110,'think')}</div><h2>${tx(LD.hook.text)}</h2>${LD.hook.options.map((o,i)=>`<button class="opt" data-i="${i}">${tx(o)}</button>`).join('')}<div class="fb" id="fb"></div></div>`; },
    after(){ $$('.opt').forEach(b=>b.onclick=()=>{ $$('.opt').forEach(x=>x.classList.add('dim')); b.classList.remove('dim'); b.classList.add('ok'); fb('ok',SAY.predict_nice); ok(); }); speak(tx(LD.hook.text)); } });
  /* الشرح + التدريب موزّعاً */
  const E=LD.explain.filter(e=>!(e.level==='B')||true); const P=LD.practice; const introduced=new Set();
  const nE=E.length, nP=P.length;
  E.forEach((e,k)=>{
    const cards=[]; // التعريف يتم ديناميكياً عند أول ذكر (انظر defineOnFirstMention)
    const lvB = e.level==='B';
    S.push({ id:e.id, cards, skip: lvB ? ()=>level!=='B' : undefined, render(){ ok(); if(lvB && level!=='B') return `<div class="scene"><div class="row" style="justify-content:center">${buddy(90,'happy')}</div>${sayBuddy('هذه فكرة للمستوى ب — تستطيع{|ين} قراءتها إن أحببت{|ِ}:')}<div class="say" style="opacity:.85">${tx(e.text)}</div>${cards.map(conceptCard).join('')}</div>`;
        return `<div class="scene">${pic(LD.id+'-'+e.id, 'مشهد '+e.id)}${sayNar(e.text)}${cards.map(conceptCard).join('')}</div>`; }, after(){ speak(tx(e.text)); } });
    /* التدريب بعد مشهده: «after» في المصدر (بعد المشهد الذي يشرح فكرته ومصطلحاته)، وإلا التوزيع بالعدد */
    P.forEach((p,j)=>{ let k0=0; while(k0<nE-1 && Math.ceil((k0+1)*nP/nE)<=j) k0++; const slot = p.after ? E.findIndex(x=>x.id===p.after) : -1; const at = slot<0 ? k0 : slot;
      if(at===k){ const sc=sceneItem(p); if(p.level==='B') sc.skip=()=>level!=='B'; S.push(sc); } });
  });
  /* مفاهيم لم تُذكر في الشرح */
  S.push({ id:'concepts_rest', render(){ ok(); const d=store.get('defs',{}); const rest=LD.concepts.filter(c=>!d[c.id]); if(!rest.length) return `<div class="scene"><div class="row" style="justify-content:center">${buddy(100,'happy')}</div>${sayBuddy('كل كلمات الدرس عرفناها في موضعها. ننتقل!')}</div>`; return `<div class="scene"><h2>كلمات مهمة في هذا الدرس</h2>${rest.map(conceptCard).join('')}</div>`; }, after(){ const d=store.get('defs',{}); const rest=LD.concepts.filter(c=>!d[c.id]); speak(rest.length?[SAY.terms_intro, ...rest.flatMap(c=>[c.term.ar+'.', tx(c.card.A)])]:SAY.terms_known); } });
  /* التجربة */
  const X=LD.experiment; if(X){
    S.push({ id:'exp', render(){ ok(); return `<div class="scene">${pic(LD.id+'-exp','تجربة: '+X.title)}<h2>تجربة: ${tx(X.title)}</h2><div class="card"><b>تحتاج{|ين}:</b> ${X.materials.map(tx).join('، ')}</div>
      <div class="card">${X.steps.map((s,i)=>`<b>${i+1}.</b> ${tx(s)}`).join('<br>')}</div><div class="card" style="background:#FFF3D6"><b>السلامة:</b> ${X.safety.map(tx).join(' ')}</div></div>`; }, after(){ speak([SAY.experiment, tx(X.title+'.'), ...X.steps.map(tx)]); } });
    S.push({ id:'exp_result', render(){ const d=store.get('exp_done',false); if(d) ok(); else need(); return `<div class="scene"><div class="row" style="justify-content:center">${buddy(100,'surprised')}</div><h2>ماذا وجدت{|ِ}؟</h2>${sayBuddy(X.explain)}<div class="card"><b>المتوقع:</b> ${tx(X.expected)}</div>
      <label class="opt" style="display:flex;gap:10px;align-items:center"><input type="checkbox" id="done" ${d?'checked':''}> فعلتُ التجربة وسجّلت ما وجدت في دفتري</label>${X.alternatives?`<p class="note">بديل إن تعذّرت: ${tx(Array.isArray(X.alternatives)?X.alternatives.join('؛ '):X.alternatives)}</p>`:''}</div>`; },
      after(){ $('#done').onchange=e=>{ store.set('exp_done',e.target.checked); if(e.target.checked){award();ok();}else need(); }; speak(tx(X.explain)); } });
  }
  /* التحقق */
  /* أسئلة المستوى ب تُتخطّى تلقائياً في المستوى أ (لا شاشة «نتخطاه») */
  LD.check.forEach(it=>{ const sc=sceneItem(it); if(it.level==='B') sc.skip=()=>level!=='B'; S.push(sc); });
  /* اكتشف الخطأ */
  /* «أين الخطأ؟»: يحكم الطفل أولاً أيّ الجملتين صحيحة (المراجعة 28، ب4)، ثم يرى الصواب */
  if(LD.find_the_error?.length) S.push({ id:'find_error', render(){ need(); return `<div class="scene"><div class="row" style="justify-content:center">${buddy(100,'think')}</div><h2>لمّاح أخطأ في ملاحظاته! في كل واحدة: أيّ الجملتين صحيحة؟</h2>${LD.find_the_error.map((f,i)=>{ const o=[[tx(f.answer),1],[tx(f.error),0]]; if((i+LD.id.length)%2) o.reverse(); return `<div class="card"><b>ملاحظة ${i+1}:</b><div class="row" style="flex-direction:column;align-items:stretch;gap:6px;margin-top:6px">${o.map(([t,v])=>`<button class="opt" style="text-align:start" data-q="fe${i}" data-v="${v}">${t}</button>`).join('')}</div><div class="fb" id="r${i}" hidden></div></div>`; }).join('')}</div>`; },
    after(){ const done=new Set(); $$('[data-q^="fe"]').forEach(b=>b.onclick=()=>{ const i=+b.dataset.q.slice(2); if(done.has(i)) return; const d=$('#r'+i), f=LD.find_the_error[i];
      if(b.dataset.v==='1'){ done.add(i); b.classList.add('ok'); $$(`[data-q="fe${i}"]`).forEach(x=>{ if(x!==b) x.classList.add('dim'); }); d.className='fb ok'; d.hidden=false; d.innerHTML=tx('نعم: '+f.answer); speak(d.textContent); if(done.size===LD.find_the_error.length){ award(); ok(); } }
      else { b.classList.add('bad'); d.className='fb bad'; d.hidden=false; d.innerHTML=tx('هذه ملاحظة لمّاح الخاطئة. {اقرأ|اقرئي} الأخرى.'); speak(d.textContent); } }); speak(SAY.error_intro); } });
  /* أرقام وحجم حقيقي ورسالة العضو والحيوان */
  const nums=[...(LD.numbers||[]),...(LD.true_size||[])]; if(nums.length) S.push({ id:'numbers', render(){ ok(); return `<div class="scene"><h2>🔢 أرقام تدهشك{|ِ}</h2>${nums.map(n=>`<div class="card">${tx(n.text)}</div>`).join('')}${LD.animal?`<h2>🐾 وعند الحيوانات؟</h2><div class="card">${tx(LD.animal.text)}</div>`:''}</div>`; }, after(){ speak(nums.map(n=>tx(n.text))); } });
  if(LD.organ_letter) S.push({ id:'letter', render(){ ok(); return `<div class="scene">${pic(LD.id+'-letter','رسالة من '+LD.organ_letter.from)}<h2>✉️ رسالة من ${tx(LD.organ_letter.from)}</h2><div class="card" style="font-size:1.08rem">${tx(LD.organ_letter.text)}</div></div>`; }, after(){ speak(tx(LD.organ_letter.text)); } });
  /* كيف عرفنا */
  (LD.history||[]).forEach((h,i)=>S.push({ id:'hist'+i, render(){ ok(); return `<div class="scene">${pic(LD.id+'-hist'+(i+1),'علماء: '+h.who)}<h2>كيف عرفنا؟ ${tx(h.who)}</h2><div class="card"><div class="note">${tx(h.origin)} — ${tx(h.where_when)}</div><p><b>ماذا فعل:</b> ${tx(h.did)}</p><p><b>وما لم يفعله:</b> ${tx(h.did_not)}</p><p style="color:var(--teal-d)"><b>درس الطريقة:</b> ${tx(h.method_lesson)}</p></div></div>`; }, after(){ speak([tx(h.who+'.'), tx(h.did), tx(h.method_lesson)]); } }));
  if(LD.how_we_know) S.push({ id:'hwk', render(){ ok(); return `<div class="scene"><div class="row" style="justify-content:center">${buddy(100,'think')}</div>${sayNar(LD.how_we_know.text)}${LD.what_changed?.length?`<div class="card"><b>ما ظُنّ قديماً وتغيّر:</b><br>${LD.what_changed.map(w=>'• '+tx(w)).join('<br>')}</div>`:''}
      <h3 style="font-family:var(--display)">${tx(LD.how_we_know.limit_question)}</h3>${LD.model_limits?.length?`<p class="note">فكّر{|ي} ثم اكتب{|ي}؛ وبعدها انظر{|ي} إلى ما يقوله العلماء.</p>`:''}<textarea id="lim" placeholder="لا يُظهر الرسم…">${esc(store.get('limitAns',''))}</textarea>
      ${LD.model_limits?.length?`<button class="opt" style="width:auto" id="showLim">أرني حدود النموذج</button><div class="card" id="lims" hidden>${LD.model_limits.map(m=>'• '+tx(m)).join('<br>')}</div>`:''}</div>`; },
    after(){ $('#lim').oninput=e=>store.set('limitAns',e.target.value); const b=$('#showLim'); if(b) b.onclick=()=>{ $('#lims').hidden=false; }; speak(tx(LD.how_we_know.text)); } });
  /* ختام شرعي + في حياتي */
  if(LD.faith.closing) S.push(sceneFaith(LD.faith.closing,'closing'));
  if(LD.life?.length) S.push({ id:'life', render(){ ok(); return `<div class="scene">${pic(LD.id+'-life','في حياتي')}<h2>في حياتي</h2>${LD.life.map(l=>`<div class="card"><b>الموقف:</b> ${tx(l.situation)}<br><b>ما أعرفه:</b> ${tx(l.science)}<br><b>ما أفعله:</b> ${tx(l.action)}<br><b>لماذا؟</b> ${tx(l.why)}${(l.verses||[]).map(verseCard).join('')}${(l.cards||[]).map(hadithCard).join('')}<span class="chip" style="margin-top:6px">${tx(l.value)}</span></div>`).join('')}</div>`; },
    /* الآية في بطاقتها لا تُعطى للقارئ الآلي: تُتلى من التسجيل بزرّها؛ ونص الحديث كاملاً يُقرأ مع الشرح */
    after(){ mushafFallback(); $$('#main .vcard').forEach(c=>recite(c.dataset.key, c)); speak([SAY.life_intro, ...LD.life.flatMap(l=>[tx(l.situation), tx(l.action), SAY.why_q, tx(l.why), ...(l.cards||[]).map(c=>tx(hadithSpeech(c)))])]); } });
  if(LD.open_questions?.length) S.push({ id:'open', render(){ ok(); return `<div class="scene"><div class="row" style="justify-content:center">${buddy(100,'surprised')}</div><h2>ما لا يعرفه أحد بعد</h2>${LD.open_questions.map(q=>`<div class="card"><b>❓ ${tx(q.q)}</b><br>${tx(q.why_open)} ربما {تكتشفه|تكتشفينه} أنت{|ِ} يوماً.</div>`).join('')}</div>`; }, after(){ speak(LD.open_questions.flatMap(q=>[tx(q.q), tx(q.why_open)])); } });
  /* الدفتر */
  if(LD.notebook) S.push({ id:'draw', render(){ ok(); return `<div class="scene"><h2>دفتري</h2><p>${tx(LD.notebook.draw)}</p><div class="row">${(LD.notebook.label||[]).map(l=>`<span class="chip">${tx(l)}</span>`).join('')}</div>
      <canvas id="cv" width="500" height="560" style="margin-top:8px"></canvas><div class="row" style="margin-top:8px"><button class="opt" style="width:auto;margin:0" id="clr">🧽 امسح</button></div><p class="note">ثم {اكتب|اكتبي} على الورق: ${tx(LD.notebook.write)}</p></div>`; },
    after(){ sketchPad(); speak(tx(LD.notebook.draw)); } });
  /* المصطلحات */
  S.push({ id:'glossary', render(){ ok(); return `<div class="scene"><div class="row" style="justify-content:center">${buddy(100,'happy')}</div><h2>كلمات تعلمتها اليوم — بثلاث لغات</h2><p class="note">المس{|ي} الكلمة لتسمعها. عربي · English · 中文 (مبسّطة + بينين)</p>
      ${TERMS.map(t=>`<div class="card gloss" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;text-align:center;padding:10px"><button class="opt" style="margin:0;padding:10px 6px;text-align:center;font-family:var(--display);font-size:1.1rem" data-say="ar" data-k="${t.id}">${t.ar}</button><button class="opt" style="margin:0;padding:10px 6px;text-align:center" data-say="en" data-k="${t.id}" dir="ltr">${t.en}</button><button class="opt" style="margin:0;padding:8px 6px;text-align:center;line-height:1.3" data-say="zh" data-k="${t.id}" dir="ltr"><span style="font-size:1.3rem">${t.zh}</span><br><small style="color:var(--muted)">${t.py}</small></button></div>`).join('')}</div>`; },
    after(){ $$('[data-say]').forEach(b=>b.onclick=()=>{ const t=TERMS.find(x=>x.id===b.dataset.k); sayTerm(t,b.dataset.say); b.classList.add('ok'); sceneTimeout(()=>b.classList.remove('ok'),600); }); speak(SAY.trilingual); } });
  /* الختام */
  S.push({ id:'end', resumable:()=>store.get('finished',false)===true, render(){ ok(); const checks=LESSON.check_ids.filter(i=>level==='B'||LESSON.check_levels?.[i]!=='B');const graded=checks.filter(i=>LESSON.check_kinds?.[i]!=='open'); const okc=graded.filter(i=>progress[i]?.firstAttempt===true).length; const opens=checks.length-graded.length; store.set('finished',true); if(!store.get('finishedAt',null)) store.set('finishedAt',Date.now());
      return `<div class="scene" style="text-align:center"><img src="img/s19-badge.webp" alt="" style="width:180px;margin:8px auto;display:block;animation:spin 1.2s ease"><h1>أنهيت{|ِ} «${LD.title}»!</h1><p class="say">${tx(LD.central_fact||'')} </p><p class="say">⭐ ${arN(stars,AR_N.star)} · أصبت{|ِ} من أول محاولة في ${okc} من ${arN(graded.length,AR_N.q,'obl')}${opens?` · وكتبت{|ِ} ${arN(opens,AR_N.ans,'obl')} يقرؤها ولي أمرك{|ِ}`:''}.</p><div class="row" style="justify-content:center">${buddy(120,'party')}</div>
      <div class="row" style="justify-content:center;margin-top:14px"><button class="opt" style="width:auto;background:var(--teal);color:#fff" id="goHome">🏠 إلى خريطتي</button>${LD.next?`<button class="opt" style="width:auto;background:var(--coral);color:#fff" id="goNext">الدرس التالي ←</button>`:''}</div></div>`; },
    after(){ confetti(); $('#goHome').onclick=()=>location.href=LESSON.home; const n=$('#goNext'); if(n) n.onclick=()=>location.href=LD.next+'.html'; speak([SAY.finished, tx(LD.title+'.'), tx(LD.central_fact||'')]); } });
  return S;
}

/* نص شرعي: قرآن بخط المصحف كاملاً مع تظليل، أو حديث كامل براويه مع تظليل */
/* بطاقة حديث من السجل: الراوي وصيغة الأداء، ثم المتن كاملاً؛ وما كان فيه كلام لغير النبي ﷺ يحمل قوسيه في نصه */
const hadithRef = h => `${esc(h.source||h.reference)} — حديث ${esc(h.grade)}${h.grader?'، '+esc(h.grader):''}`;
const hadithCard = h => `<div class="hadith"><div class="lead">${esc(h.lead)}</div><div class="txt">${h.narration?esc(h.text):'«'+esc(h.text)+'»'}</div><div class="ref">${hadithRef(h)}</div></div>`;
const hadithSpeech = h => h.lead+' '+h.text+'.';
/* بطاقة آية كاملة من السجل (لا تُكتب الآية يدوياً في نص الدرس) */
const verseCard = k => { const V=QURAN[k]; if(!V) return ''; return V.smart ? `<div class="verse vcard" data-key="${k}"><div class="lead">قال الله تعالى:</div><div class="txt quran" data-key="${k}" data-plain="${esc(V.text||'')}">${mushaf(V,null)}</div><div class="ref">[سورة ${V.surah_ar}: الآية ${V.ayah}]</div></div>` : `<div class="verse vcard" data-key="${k}"><div class="lead">قال الله تعالى:</div><div class="txt">﴿${esc(V.text)}﴾</div><div class="ref">[سورة ${V.surah_ar}: الآية ${V.ayah}]</div></div>`; };
/* إن لم يُحمَّل خط المصحف تظهر الآية فراغاً أو رموزاً: خط الصفحة (QPC V2) ← خط Hafs Smart ← نص الآية العثماني من السجل
   نفسه بخط احتياطي. لا تُعرض آية ناقصة ولا مشوّهة */
function mushafFallback(){ const qs=$$('#main .quran'); if(!qs.length||!document.fonts?.load) return;
  const loads = fam => document.fonts.load(`1em '${fam}'`).then(fs=>fs.length>0, ()=>false);
  const plain = q => { if(q.dataset.plain){ q.className='txt quran-plain'; q.textContent=q.dataset.plain; } };
  const smart = q => { const v=QURAN[q.dataset.key]; if(!v||!v.smart){ plain(q); return; } q.innerHTML=mushafSmart(v, q.dataset.hl ? q.dataset.hl.split('-').map(Number) : null); loads('KFGQPC Hafs Smart').then(ok=>{ if(!ok) plain(q); }); };
  qs.forEach(q=>{ const sp=q.querySelector('.qcf2'); if(sp) loads(sp.style.fontFamily.split(',')[0].replace(/["']/g,'').trim()).then(ok=>{ if(!ok) smart(q); }); else loads('KFGQPC Hafs Smart').then(ok=>{ if(!ok) plain(q); }); }); }
function sceneFaith(f, kind){ const isQ = f.grade==='قرآن';
  return { id:'faith_'+kind, render(){ ok(); let body='';
    if(isQ){ const V=QURAN[f.quran_key]; body = V&&V.smart ? `<div class="lead">قال الله تعالى:</div><div class="txt quran" data-key="${f.quran_key}" data-hl="${(f.hl_words||[]).join('-')}" data-plain="${esc(V.text||'')}">${mushaf(V, f.hl_words||null)}</div><div class="ref">[سورة ${V.surah_ar}: الآية ${V.ayah}]</div>` : `<div class="lead">قال الله تعالى:</div><div class="txt">${esc(f.text)}</div><div class="ref">[${esc(f.reference)}]</div>`; }
    else { const t=hlText(f.text,f.highlight); body = `<div class="lead">${esc(f.lead||'قال رسول الله ﷺ:')}</div><div class="txt" style="font-size:1.25rem">${f.narration?t:'«'+t+'»'}</div><div class="ref">${hadithRef(f)}</div>`; }
    return `<div class="scene"><div class="verse">${body}<div class="mean"><b>${isQ?'ما معناها لنا اليوم؟':'ما معناه لنا اليوم؟'}</b> ${tx(f.reflection)}</div>${f.concept?`<div class="mean" style="margin-top:8px"><b>المفهوم:</b> ${tx(f.concept)}</div>`:''}</div>${(f.cards||[]).map(hadithCard).join('')}</div>`; },
    after(){ mushafFallback(); const cardsSay=(f.cards||[]).map(c=>tx(hadithSpeech(c)));
      /* الآية لا تُعطى للقارئ الآلي: تُتلى من تسجيل إن وُجد، ثم يُقرأ الشرح وحده */
      if(isQ) recite(f.quran_key, $('#main .verse'), ()=>speak([SAY.meaning_q, tx(f.reflection), ...cardsSay]));
      else speak([tx(f.lead||SAY.prophet_said), tx(QT(f)+'.'), tx(f.reflection), ...cardsSay]); } }; }
const QT = f => f.grade==='قرآن' ? ((QURAN[f.quran_key]||{}).emlaey || f.text) : f.text;

inheritLevel();

/* «أعد أسئلة أتحقق» (من بوابة الإهداء ‎#recheck): تُحفظ نتيجة المحاولة السابقة في السجل، وتُفتح أسئلة
   التحقق من جديد بترتيب خيارات جديد، ويبدأ الطفل من أول سؤال تحقق. نصوصه المكتوبة تبقى. */
window.BOOT_HOOK = () => {
  if (location.hash !== '#recheck') return null;
  try { history.replaceState(null, '', location.pathname + location.search); } catch {}
  const mine = LD.check.filter(it => level === 'B' || (it.level || 'A') !== 'B');
  const closed = mine.filter(it => (LESSON.check_kinds?.[it.id] || 'closed') === 'closed');
  const hist = store.get('attempts', []);
  hist.push({ ok: closed.filter(it => progress[it.id]?.firstAttempt === true).length, n: closed.length, at: Date.now() });
  store.set('attempts', hist.slice(-20));
  const ids = mine.map(it => it.id);
  ids.forEach(i => delete progress[i]); store.set('progress', progress);
  const ord = store.get('order', {}); ids.forEach(i => delete ord[i]); store.set('order', ord);
  /* المشهد قد يحمل رقم السؤال نفسه، أو يكون مشهداً مؤلَّفاً يدوياً يعرض السؤال باسم آخر (الوحدة الأولى) */
  const holds = s => ids.includes(s.id) || ids.some(i => String(s.render).includes("'" + i + "'"));
  const at = SCENES.map((s, n) => holds(s) ? n : -1).filter(n => n >= 0);
  const ps = store.get('passed', {}); ids.forEach(i => delete ps[i]); at.forEach(n => delete ps[SCENES[n].id]); store.set('passed', ps);
  return at.length ? at[0] : null;
};

/* طبقة التأليف الخاص: scenes/<id>.js يعرّف CUSTOM = { replace:{id:scene}, after:{id:[scenes]}, before:{id:[scenes]}, drop:[ids] } */
function withCards(sc, cards){ if(!cards||!cards.length) return sc; const r=sc.render; return { ...sc, render(){ const h=r.call(sc); return h==null? h : h.replace(/<\/div>\s*$/, cards.map(conceptCard).join('')+'</div>'); } }; }
/* صورة المشهد المولَّد تُحفظ حين يُستبدل أو يُحذف وتُعرض في أول مشهد يليه */
const slotImg = id => { const m=id.match(/^hist(\d+)$/); const n=LD.id+'-'+(m?'hist'+(+m[1]+1):id); return (LD.imgs||[]).includes(n) ? n : null; };
function withPics(sc, pics){ if(!pics||!pics.length) return sc; const r=sc.render; return { ...sc, render(){ const h=r.call(sc); if(h==null) return h; const i=h.indexOf('<div class="scene">'); const ps=pics.map(n=>pic(n,'')).join(''); return i<0 ? h : h.slice(0,i+19)+(pics.length>1?`<div class="pics">${ps}</div>`:ps)+h.slice(i+19); } }; }
function applyCustom(S, C){ let out=[], pending=[], pics=[]; const push=sc=>{ let x=sc; if(pending.length) x=withCards(x,pending); if(pics.length) x=withPics(x,pics); out.push(x); pending=[]; pics=[]; };
  const hasOwnPic = sc => /^E\d+$|^exp$|^letter$|^life$|^hist\d+$/.test(sc.id);
  for(const sc of S){ if((C.drop||[]).includes(sc.id)){ pending.push(...(sc.cards||[])); if(hasOwnPic(sc)&&slotImg(sc.id)) pics.push(slotImg(sc.id)); continue; } for(const b of ((C.before||{})[sc.id]||[])) push(b); const rep=(C.replace||{})[sc.id]; if(rep){ pending.push(...(sc.cards||[])); if(hasOwnPic(sc)&&slotImg(sc.id)) pics.push(slotImg(sc.id)); push(rep); } else push(sc); for(const a of ((C.after||{})[sc.id]||[])) push(a); } return out; }
/* ===== التعريف عند أول ذكر: أي مفهوم يظهر نصه في مشهد قبل أن يُعرَّف تُلحق بطاقته بذلك المشهد تلقائياً ===== */
const _norm = t => (t||'').replace(/[\u064B-\u0652\u0640]/g,'');
const _stem = w => _norm(w).replace(/^(ال|بال|وال|فال|كال|لل)/,'');
const FORMS = LD.concepts.map(c=>({c, forms:[c.term.ar, ...(c.term.match||[])].map(_stem).filter(f=>f.length>=3)}));
const SKIP_DEF = new Set(['glossary','end','concepts_rest']);
function defineOnFirstMention(sc){ if(SKIP_DEF.has(sc.id)) return; const host=$('#main .scene'); if(!host) return; const d=store.get('defs',{}); let changed=false;
  for(let round=0; round<1; round++){ const text=_norm([...$('#main').querySelectorAll('*')].filter(e=>!e.closest('[data-def]')).map(e=>[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join(' ')).join(' ')); const toShow=[];
    for(const {c,forms} of FORMS){ const br=((window.CUSTOM||{}).briefDefs||{})[c.id];
      /* تعريف موجز محايد قبل مشهد محدد (درس «التجربة قبل الشرح»): يُعرَّف اللفظ دون أن يُكشف ما سيكتشفه الطفل */
      if(br && idx < SCENES.findIndex(x=>x.id===br.until)){ if(d[c.id]){ delete d[c.id]; changed=true; } if(forms.some(f=>text.includes(f)) && !host.querySelector(`[data-def="${c.id}"]`)) host.insertAdjacentHTML('beforeend', tx(`<div class="card" data-def="${c.id}" data-brief="1" style="border-right:6px solid var(--sun)">${termHead(c)}<div style="margin-top:6px">${br.text}</div></div>`)); continue; }
      if(d[c.id]===sc.id && !host.querySelector(`[data-def="${c.id}"]`)) toShow.push(c); else if(!d[c.id] && forms.some(f=>text.includes(f))){ d[c.id]=sc.id; changed=true; toShow.push(c); } }
    if(!toShow.length) break; host.insertAdjacentHTML('beforeend', tx(toShow.map(conceptCard).join(''))); }
  if(changed) store.set('defs',d); }
const _show = show; show = function(i, dir){ _show(i, dir); defineOnFirstMention(SCENES[idx]); };

