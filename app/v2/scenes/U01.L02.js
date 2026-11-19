/* تأليف خاص — U01.L02 (منقول من التأليف اليدوي الأول فوق المولّد) */
(() => {
const EXTRA_TERMS = [
  {id:'observe',ar:'ملاحظة',en:'observation',zh:'观察',py:'guānchá'},{id:'guess',ar:'تخمين',en:'guess',zh:'猜测',py:'cāicè'},
  {id:'measure',ar:'قياس',en:'measurement',zh:'测量',py:'cèliáng'},{id:'median',ar:'الرقم الأوسط',en:'the middle number (median)',zh:'中位数',py:'zhōngwèishù'},
  {id:'fair',ar:'مقارنة عادلة',en:'fair test',zh:'公平测试',py:'gōngpíng cèshì'},{id:'tool',ar:'أداة',en:'instrument',zh:'仪器',py:'yíqì'},
  {id:'ruler',ar:'مسطرة',en:'ruler',zh:'尺子',py:'chǐzi'},{id:'reaction',ar:'زمن ردّ الفعل',en:'reaction time',zh:'反应时间',py:'fǎnyìng shíjiān'},
  {id:'second',ar:'ثانية',en:'second',zh:'秒',py:'miǎo'},{id:'cm',ar:'سنتيمتر',en:'centimetre',zh:'厘米',py:'límǐ'},
  {id:'microscope',ar:'المجهر',en:'microscope',zh:'显微镜',py:'xiǎnwēijìng'},{id:'xray',ar:'الأشعة السينية',en:'X-ray',zh:'X光',py:'X guāng'},
  {id:'steth',ar:'السماعة الطبية',en:'stethoscope',zh:'听诊器',py:'tīngzhěnqì'},{id:'ultra',ar:'الموجات فوق الصوتية',en:'ultrasound',zh:'超声波',py:'chāoshēngbō'},
  {id:'light',ar:'الضوء',en:'light',zh:'光',py:'guāng'},{id:'eye',ar:'العين',en:'eye',zh:'眼睛',py:'yǎnjing'},{id:'brain',ar:'الدماغ',en:'brain',zh:'大脑',py:'dànǎo'},{id:'cell',ar:'الخلية',en:'cell',zh:'细胞',py:'xìbāo'}
];
for(const t of EXTRA_TERMS) if(!TERMS.some(x=>x.id===t.id)) TERMS.push(t);
/* صور الدرس الثاني — ما لم يُولَّد بعد يظهر مكانه مربع «صورة قادمة» */
const PIC = (name, label) => `<div class="ph" data-pic="${name}">🖼 صورة قادمة: ${label}</div>`;
const pic = (name,label,cls='art') => `<img src="img/${name}.webp" alt="" class="${cls}" style="border-radius:22px;max-height:48vh;object-fit:contain" onerror="this.outerHTML=PIC('${name}','${label}')">`;
/* جدول المسطرة: المسافة (سم) → الزمن (ث) = √(2d/g) */
const tFromCm = d => Math.sqrt(2*d/981);
/* المستوى يُورَث من الدرس الأول في الوحدة نفسها */
if(!level){ try{ level = JSON.parse(Atlas.storage.getItem('atlas:U01.L01:level')||'null') || 'A'; }catch(e){ level='A'; } store.set('level',level); }
const H = [

/* 0 */ { id:'start', render(){ ok(); return `<div class="scene">${pic('l2-s01-title-'+(g()?'girl':'boy'),'العنوان: سباق المسطرة')}
    <h1>سباق ردّ الفعل</h1>
    <p class="say"><b>{اسم}</b>، سامي شُفي، وعاد يتحدّى: <b>«أنا أسرع منك{|ِ}!»</b> هل هو محق؟ اليوم لن نتخاصم… سنقيس.</p></div>`; },
  after(){ speak(tx('سامي شُفي وعاد يتحدى: أنا أسرع منك! هل هو محق؟ اليوم لن نتخاصم، سنقيس.')); } },

/* 1 — التوقع (لا يُحتسب) */
{ id:'hook', render(){ need(); return `<div class="scene"><div class="row" style="justify-content:center">${buddy(110,'think')}</div>
    <h2>سامي يقول إنه أسرع منك{|ِ} في ردّ الفعل. كيف تعرف{|ين} إن كان محقاً؟</h2>
    ${['أصدّقه؛ هو صديقي','نتسابق مرة واحدة','نقيس عدة مرات بطريقة عادلة','لا أعرف بعد'].map((o,i)=>`<button class="opt" data-i="${i}">${o}</button>`).join('')}<div class="fb" id="fb"></div></div>`; },
  after(){ const fb={0:'الصداقة لا تقيس السرعة! نحتاج إلى طريقة.',1:'مرة واحدة قد تكون صدفة. هل تكفي؟ سنرى.',2:'هذا ما يفعله العلماء بالضبط. هيا نتعلم كيف.',3:'جواب شجاع. العالم يقول «لا أعرف بعد» ثم يبحث.'}; $$('.opt').forEach(b=>b.onclick=()=>{ $$('.opt').forEach(x=>x.classList.add('dim')); b.classList.remove('dim'); b.classList.add('ok'); $('#fb').className='fb ok'; $('#fb').textContent=fb[b.dataset.i]; speak(fb[b.dataset.i]); ok(); }); speak(tx('سامي يقول إنه أسرع منك في رد الفعل. كيف تعرف إن كان محقاً؟')); } },

/* 2 — ملاحظة أم تخمين: لعبة فرز */
{ id:'sort', render(){ need(); return `<div class="scene">${pic('l2-s02-hand-raised','طفل يرفع يده في الصف')}
    ${sayBuddy('قبل أن نقيس، كلمتان مهمتان. انظر{|ي} إلى الصورة: «اليد مرفوعة» — هذا شيء <b>أراه</b>: <b>ملاحظة</b>. «يريد أن يسأل» — هذا شيء <b>أظنه</b>: <b>تخمين</b>. العالم يفصل بينهما دائماً.')}
    <h2>افرز{|ي}: المس{|ي} كل جملة ثم {اختر|اختاري}: أراها أم أظنها؟</h2>
    <div id="stmts">${[['اليد مرفوعة','see'],['يريد أن يسأل','guess'],['الطفل ينظر إلى الأرض','see'],['الطفل حزين','guess']].map((s,i)=>`<button class="stmt" data-i="${i}" data-k="${s[1]}">${s[0]}</button>`).join('')}</div>
    <div class="sort" style="margin-top:8px"><div class="bin"><h4>👁 أراها (ملاحظة)</h4><div id="binSee"></div></div><div class="bin"><h4>💭 أظنها (تخمين)</h4><div id="binGuess"></div></div></div>
    <div class="row" id="choose" hidden style="margin-top:8px"><span class="note">«<b id="cur"></b>» — </span><button class="opt" style="width:auto;margin:0" data-c="see">👁 أراها</button><button class="opt" style="width:auto;margin:0" data-c="guess">💭 أظنها</button></div>
    <div class="fb" id="fb"></div></div>`; },
  after(){ let sel=null, first=true, done=0, wrong=0; $$('.stmt').forEach(b=>b.onclick=()=>{ if(b.classList.contains('done')) return; sel=b; $('#cur').textContent=b.textContent; $('#choose').hidden=false; });
    $$('[data-c]').forEach(c=>c.onclick=()=>{ if(!sel) return; const right=sel.dataset.k===c.dataset.c; if(first){ mark('U01.L02.P1',right); first=false; }
      if(right){ sel.classList.add('done'); $('#'+(c.dataset.c==='see'?'binSee':'binGuess')).innerHTML+=`<div class="chip done" style="margin:3px">${sel.textContent}</div>`; $('#fb').className='fb ok'; $('#fb').textContent='صحيح!'; done++; $('#choose').hidden=true; sel=null; if(done===4){ award(); ok(); speak('ممتاز! تفرق الآن بين ما تراه وما تظنه.'); } }
      else { wrong++; noteMiss(); $('#fb').className='fb bad'; $('#fb').textContent = c.dataset.c==='see' ? 'هل تراه بعينك فعلاً؟ أم تفسّره؟' : 'انظر{|ي} إلى الصورة: هذا شيء تراه.'; speak($('#fb').textContent); } });
    speak(tx('افرز: المس{|ي} كل جملة ثم {اختر|اختاري}: أراها أم أظنها؟')); } },

/* 3 — القياس: رقم على الملاحظة */
{ id:'measure_word', render(){ ok(); return `<div class="scene">${pic('l2-s03-ruler-drop','إسقاط المسطرة بين الإصبعين')}
    ${sayBuddy('والملاحظة تصير أقوى حين نضع عليها <b>رقماً</b>. «المسطرة سقطت كثيراً» كلام ضعيف؛ «سقطت 18 سنتيمتراً» هذا <b>قياس</b>. والقياس يحتاج إلى <b>أداة</b>: اليوم أداتنا مسطرة.')}
    ${sayNar('كيف تقيس المسطرة سرعتك{|ِ}؟ بين أن {ترى|تري} المسطرة تتحرك وأن {تمسكها|تمسكينها} يمرّ زمن قصير جداً: الضوء يدخل العين، وإشارة تذهب إلى الدماغ، وإشارة تعود إلى اليد. هذا هو <b>زمن ردّ الفعل</b>. أنت{|ِ} لا {تحسّه|تحسّينه}… لكن المسطرة تقيسه: كلما سقطت أكثر كان زمنك{|ِ} أطول.')}</div>`; },
  after(){ speak(tx('الملاحظة تصير أقوى حين نضع عليها رقماً. المسطرة سقطت 18 سنتيمتراً: هذا قياس. بين أن ترى المسطرة تتحرك وأن تمسكها يمر زمن قصير جداً: هذا زمن رد الفعل. المسطرة تقيسه: كلما سقطت أكثر كان زمنك أطول.')); } },

/* 4 — التجربة: الخطوات */
{ id:'exp', render(){ ok(); return `<div class="scene"><h2>تجربة: أقيس زمن ردّ فعلي</h2>
    <div class="card"><b>تحتاج{|ين}:</b> مسطرة 50 سم أو متراً خشبياً (مسطرة 30 سم قد تكون قصيرة)، وشخصاً يساعدك{|ِ}.</div>
    <div class="card"><b>1.</b> اجلس{|ي} وضع{|ي} مرفقك{|ِ} على الطاولة، وافتح{|ي} الإبهام والسبابة قليلاً.<br><b>2.</b> يمسك مساعدك{|ِ} المسطرة عمودياً، والصفر بين إصبعيك{|ِ} دون أن {تلمسها|تلمسيها}.<br><b>3.</b> دون إنذار يُفلتها… وأنت{|ِ} {تمسكها|تمسكينها} بأسرع ما تستطيع{|ين}. {اقرأ|اقرئي} الرقم عند إصبعيك{|ِ}.<br><b>4.</b> مرتان للتدريب بلا تسجيل، ثم <b>ثلاث مرات</b> نسجّلها.</div>
    <div class="safety" style="background:#FFF3D6;border-radius:16px;padding:10px 14px"><b>قاعدتان:</b> المسطرة تُفلت ولا تُرمى، وبعيداً عن الوجه. ولا نقارن الأطفال ببعضهم بصوت عالٍ؛ كلٌّ يقارن نفسه بنفسه.</div>
    ${sayBuddy('إن {أفلتَّ|أفلتِّ} المسطرة كلها فلا بأس! اكتب{|ي} «أكثر من طول المسطرة» — هذا قياس أيضاً.')}</div>`; },
  after(){ speak(tx('تجربة: أقيس زمن رد فعلي. اجلس{|ي} وضع مرفقك على الطاولة وافتح{|ي} الإبهام والسبابة قليلاً. يمسك مساعدك المسطرة والصفر بين إصبعيك. دون إنذار يفلتها وأنت تمسكها بأسرع ما تستطيع. مرتان للتدريب ثم ثلاث مرات نسجلها.')); } },

/* 5 — تسجيل القراءات الثلاث */
{ id:'readings', render(){ need(); const r=store.get('readings',['','','']); return `<div class="scene"><div class="row" style="justify-content:center">${buddy(100,'happy')}</div><h2>سجّل{|ي} قراءاتك{|ِ} الثلاث (بالسنتيمتر)</h2>
    <div class="readings">${[0,1,2].map(i=>`<div><div class="note" style="text-align:center">المحاولة ${i+1}</div><input type="number" min="1" max="100" data-r="${i}" value="${htmlText(r[i])}" placeholder="سم"></div>`).join('')}</div>
    <p class="note" style="margin-top:6px">{أفلتَّ|أفلتِّ} المسطرة كلها؟ اكتب{|ي} طول المسطرة وضع{|ي} علامة: <label><input type="checkbox" id="over"> أكثر من ذلك</label></p>
    <div id="res"></div></div>`; },
  after(){ const upd=()=>{ const v=$$('[data-r]').map(i=>+i.value).filter(x=>x>0); store.set('readings',$$('[data-r]').map(i=>i.value)); if(v.length===3){ const s=[...v].sort((a,b)=>a-b); const med=s[1]; const t=tFromCm(med); store.set('median',med); store.set('rt',t);
      $('#res').innerHTML=`<div class="card"><div class="note">رتّبناها: ${s.join(' · ')}</div><div class="note">الرقم الأوسط:</div><div class="big">${med} سم</div><div class="note">زمن ردّ فعلك{|ِ} ≈</div><div class="big">${t.toFixed(2)} ثانية</div><div class="note">${$('#over').checked?'(أو أكثر — المسطرة أقصر من زمنك، وهذا طبيعي عند كثير من الأطفال)':''} عند الأطفال غالباً بين ربع ثانية وثلث ثانية. رقمك{|ِ} يخصّك{|ِ} وحدك{|ِ}؛ لا يُقارَن بأحد.</div></div>`; $('#res').innerHTML=tx($('#res').innerHTML); if(!done){ award(); ok(); } } else $('#res').innerHTML=''; };
    $$('[data-r]').forEach(i=>i.oninput=upd); $('#over').onchange=upd; upd(); speak(tx('سجل{|ي} قراءاتك الثلاث بالسنتيمتر.')); } },

/* 6 — لماذا ثلاث مرات؟ الرقم الأوسط */
{ id:'median', render(){ ok(); const r=store.get('readings',[]).filter(Boolean); return `<div class="scene"><div class="row" style="justify-content:center">${buddy(100,'think')}</div>
    ${sayBuddy('لاحظت{|ِ}؟ الأرقام الثلاثة ليست متساوية'+(r.length===3?' ('+r.join('، ')+')':'')+'. هل أنت{|ِ} ثلاثة أشخاص؟ لا! القياس يتأثر بأشياء صغيرة كثيرة: انتباهك{|ِ}، يد المساعد، لحظة الإفلات.')}
    ${sayNar('لذلك لا نكتفي بمحاولة واحدة — قد تكون صدفة. نكرر <b>ثلاث مرات</b> ونأخذ <b>الرقم الأوسط</b>: نرتّب الأرقام من الأصغر إلى الأكبر، ونختار الذي في المنتصف. هو أقرب الأرقام إليك{|ِ}.')}</div>`; },
  after(){ speak(tx('الأرقام الثلاثة ليست متساوية. هل أنت ثلاثة أشخاص؟ لا. القياس يتأثر بأشياء صغيرة كثيرة. لذلك نكرر ثلاث مرات ونأخذ الرقم الأوسط: نرتب الأرقام ونختار الذي في المنتصف.')); } },

/* 7 — تحقق{|ي}: الرقم الأوسط */
{ id:'q_median', render(){ need(); return `<div class="scene">${choice({id:'U01.L02.P2', prompt:'قراءات سامي: 14، 22، 17. ما رقمه؟', options:['14','17','22','53 (نجمعها)'], answer:1, why:'نرتّبها: 14، 17، 22 — الأوسط 17. ولا نجمعها!'})}</div>`; }, after(){ speak('قراءات سامي: أربعة عشر، اثنان وعشرون، سبعة عشر. ما رقمه؟'); } },

/* 8 — تحقق{|ي}: قياس واحد لا يكفي (مفتوح) */
{ id:'q_once', render(){ need(); const v=store.get('open_C2',''); return `<div class="scene"><h2>قاسوا نبض سارة <b>مرة واحدة</b> فكان 120، فقالوا: «نبضها دائماً 120». هل هذا صحيح؟ ولماذا؟</h2>
    <textarea id="ans" placeholder="أظن أن…">${htmlText(v)}</textarea><p class="note">اكتب{|ي} بكلماتك{|ِ}؛ يقرؤها ولي أمرك{|ِ} أو معلمك{|ِ}.</p></div>`; },
  after(){ $('#ans').oninput=e=>{ store.set('open_C2',e.target.value); mark('U01.L02.C2',false,{text:e.target.value,answered:true}); progress['U01.L02.C2'].hints=0; store.set('progress',progress); if(e.target.value.trim().length>6)ok();else need(); }; if(store.get('open_C2','').length>6) ok(); speak(tx('قاسوا نبض سارة مرة واحدة فكان مئة وعشرين، فقالوا نبضها دائماً مئة وعشرون. هل هذا صحيح؟ ولماذا؟')); } },

/* 9 — أدوات ترى ما لا نراه */
{ id:'tools', render(){ need(); const T=[['🔬','المجهر','يكبّر الصغير جداً فنرى الخلايا — مثل جراثيم على يدك{|ِ} لا {تراها|ترينها} عينك{|ِ}.'],['🩻','الأشعة السينية (أشعة إكس)','تمرّ عبر الجلد وتوقفها العظام، فنرى العظم دون أن نفتح شيئاً.'],['🩺','السماعة الطبية','تنقل صوت القلب والرئتين إلى أذن الطبيب.'],['🤰','الموجات فوق الصوتية','أصوات لا نسمعها ترتدّ من داخل الجسم، فنرى الجنين في بطن أمه.']];
    return `<div class="scene">${pic('l2-s04-tools','أربع أدوات: مجهر، أشعة، سماعة، موجات فوق صوتية')}
    ${sayBuddy('وبعض ما نريد أن نعرفه <b>لا تراه العين</b> أصلاً. فصنع الناس أدوات تكشفه. المس{|ي} كل أداة لتعرف{|ي} ماذا تكشف.')}
    ${T.map((t,i)=>`<button class="tool" data-t="${i}"><span class="ic">${t[0]}</span><span><b>${t[1]}</b><br><span class="note" id="td${i}" hidden>${t[2]}</span></span></button>`).join('')}
    <p class="note">الأداة لا تصنع الحقيقة؛ تكشفها. وما لا نراه قد يكون موجوداً.</p></div>`; },
  after(){ const seen=new Set(); $$('.tool').forEach(b=>b.onclick=()=>{ b.classList.add('on'); const d=$('#td'+b.dataset.t); d.hidden=false; seen.add(b.dataset.t); speak(tx(b.querySelector('b').textContent+'. '+d.textContent)); if(seen.size===4){ award(); ok(); } }); speak(tx('بعض ما نريد أن نعرفه لا تراه العين أصلاً. المس{|ي} كل أداة لتعرف ماذا تكشف.')); } },

/* 10 — تحقق{|ي} أدوات */
{ id:'q_tool', render(){ need(); return `<div class="scene">${choice({id:'U01.L02.P3', prompt:'أي أداة تُظهر عظام اليد دون فتحها؟', options:['المجهر','السماعة','الأشعة السينية','المسطرة'], answer:2, why:'الأشعة السينية تمرّ عبر الجلد وتوقفها العظام.'})}</div>`; }, after(){ speak('أي أداة تظهر عظام اليد دون فتحها؟'); } },

/* 11 — تحقق{|ي}: ما لا أراه */
{ id:'q_germs', render(){ need(); return `<div class="scene">${pic('l2-s05-hand-germs','يد نظيفة بالعين، وبالمجهر عليها جراثيم')}${choice({id:'U01.L02.C3', prompt:'لا نرى الجراثيم على أيدينا. إذن…', options:['هي غير موجودة','قد تكون موجودة وأصغر من أن تراها العين','موجودة فقط عند المرضى'], answer:1, why:'العين لا ترى ما يصغر عن عُشر مليمتر؛ الجراثيم أصغر بكثير. لذلك نغسل أيدينا وإن بدت نظيفة.'})}</div>`; }, after(){ speak('لا نرى الجراثيم على أيدينا. إذن؟'); } },

/* 12 — المقارنة العادلة (مستوى ب؛ في أ مختصرة) */
{ id:'fair', render(){ ok(); return `<div class="scene">${pic('l2-s06-fair-test','مقارنة غير عادلة: صباح مرتاح مقابل ليل متعب')}
    ${sayBuddy('سامي قاس يده صباحاً وهو مرتاح، وأنت{|ِ} قست{|ِ} ليلاً وأنت{|ِ} متعب{|ة}. فمن الأسرع؟ <b>لا نعرف!</b> تغيّر شيئان معاً: الشخص… والوقت.')}
    ${sayNar('<b>المقارنة العادلة</b> تغيّر شيئاً واحداً فقط وتثبّت كل ما عداه: المسطرة نفسها، الوقت نفسه، الجلسة نفسها، وعدد المحاولات نفسه. عندها فقط نعرف ما سبب الفرق.')}
    ${level==='B' ? sayNar('جرّب{|ي} بنفسك{|ِ}: كرر{|ي} التجربة باليد الأخرى الآن، بالمسطرة نفسها وعلى الطاولة نفسها. هل الفرق واضح، أم هو ضمن اختلاف المحاولات؟') : ''}</div>`; },
  after(){ speak(tx('سامي قاس صباحاً وهو مرتاح، وأنت قست ليلاً وأنت متعب. فمن الأسرع؟ لا نعرف! تغير شيئان معاً. المقارنة العادلة تغير شيئاً واحداً فقط وتثبت كل ما عداه.')); } },

/* 13 — تحقق{|ي} المقارنة العادلة */
{ id:'q_fair', render(){ need(); return `<div class="scene">${choice({id:'U01.L02.P4', prompt:'قاس أحمد يده اليمنى بمسطرة 30 سم، ويده اليسرى بمسطرة 50 سم. هل المقارنة عادلة؟', options:['نعم','لا؛ تغيّر شيئان: اليد والمسطرة','نعم، لأن اليد هي المهم'], answer:1, why:'لنقارن اليدين يجب أن تكون المسطرة نفسها وكل شيء آخر نفسه.'})}</div>`; }, after(){ speak('قاس أحمد يده اليمنى بمسطرة ثلاثين، ويده اليسرى بمسطرة خمسين. هل المقارنة عادلة؟'); } },

/* 14 — تحقق{|ي} مفتوح (ب): أصلح تجربة ليلى */
{ id:'q_fix', render(){ if(level!=='B'){ ok(); return `<div class="scene"><div class="row" style="justify-content:center">${buddy(110,'party')}</div>${sayBuddy('أحسنت{|ِ}! في المستوى ب سؤال إضافي عن إصلاح تجربة. تستطيع{|ين} رفع المستوى من الصفحة الرئيسية متى شئت{|ِ}.')}</div>`; }
    need(); const v=store.get('open_C4',''); return `<div class="scene"><h2>أرادت ليلى أن تعرف: هل تجعلها الموسيقى أسرع؟ قاست <b>بلا موسيقى صباحاً بعد النوم</b>، و<b>مع الموسيقى ليلاً وهي متعبة</b>. ما الخلل؟ وكيف تصلحه؟</h2>
    <textarea id="ans" placeholder="الخلل أن… والصواب أن…">${htmlText(v)}</textarea></div>`; },
  after(){ if(level!=='B'){ speak(tx('أحسنت!')); return; } $('#ans').oninput=e=>{ store.set('open_C4',e.target.value); mark('U01.L02.C4',false,{text:e.target.value,answered:true}); progress['U01.L02.C4'].hints=0; store.set('progress',progress); if(e.target.value.trim().length>8)ok();else need(); }; if(store.get('open_C4','').length>8) ok(); speak(tx('أرادت ليلى أن تعرف هل تجعلها الموسيقى أسرع. قاست بلا موسيقى صباحاً بعد النوم، ومع الموسيقى ليلاً وهي متعبة. ما الخلل؟')); } },

/* 15 — تحقق{|ي} C1 */
{ id:'q_obs', render(){ need(); return `<div class="scene">${pic('l2-s07-girl-bag','طفلة تحمل حقيبة')}${choice({id:'U01.L02.C1', prompt:'صورة لطفلة تحمل حقيبة. أي وصف <b>ملاحظة</b> (شيء نراه)؟', options:['تحمل حقيبة','ذاهبة إلى المدرسة','تحب المدرسة','متأخرة'], answer:0, why:'الحقيبة نراها؛ الباقي تخمين.'})}</div>`; }, after(){ speak('صورة لطفلة تحمل حقيبة. أي وصف ملاحظة؟'); } },

/* 16 — كيف عرفنا: ابن الهيثم */
{ id:'history', render(){ ok(); return `<div class="scene">${pic('l2-s08-ibn-alhaytham','ابن الهيثم في غرفة مظلمة بثقب وضوء مصابيح')}
    <h2>كيف عرفنا؟ العالِم الذي لم يصدّق الكتب</h2>
    ${sayNar('قبل ألف سنة في القاهرة، سأل <b>ابن الهيثم</b>: هل نرى لأن أشعة تخرج من أعيننا، أم لأن الضوء يدخل إليها؟ كان العلماء قبله منقسمين. لم يكتفِ بالجدل؛ <b>صمّم{|ي} تجربة</b>: غرفة مظلمة بثقب صغير، وخارجها مصابيح. دخل ضوء كل مصباح من الثقب ووقع في موضعه على الحائط في خط مستقيم، ولم يختلط بغيره.')}
    ${sayNar('وكتب في كتاب آخر: طالب الحق يفحص ما في الكتب ويختبره ولا يسلّم به. ثم أجاب: <b>الضوء يدخل العين</b>. الاختبار يحسم ما لا يحسمه الكلام.')}
    ${sayBuddy('هذا بالضبط ما {فعلته|فعلتِه} اليوم مع سامي: لم تصدّق{|ي} ولم تكذّب{|ي}… قست{|ِ}!')}
    <h3 style="font-family:var(--display)">سؤال لك{|ِ}: ما الذي <b>لا</b> يستطيع جدول المسطرة أن يخبرك{|ِ} به عن ردّ فعلك{|ِ}؟</h3>
    <textarea id="lim" placeholder="مثلاً: لا يخبرني لماذا…">${htmlText(store.get('limitAns',''))}</textarea></div>`; },
  after(){ $('#lim').oninput=e=>store.set('limitAns',e.target.value); speak(tx('قبل ألف سنة في القاهرة سأل ابن الهيثم: هل نرى لأن أشعة تخرج من أعيننا أم لأن الضوء يدخل إليها؟ صمم{|ي} تجربة: غرفة مظلمة بثقب صغير وخارجها مصابيح. ثم أجاب: الضوء يدخل العين. الاختبار يحسم ما لا يحسمه الكلام.')); } },

/* 17 — الآية والحديث */
{ id:'verse', render(){ ok(); const V=QURAN['49:6']; return `<div class="scene"><div class="verse"><div class="lead">قال الله تعالى:</div>
    <div class="txt quran">${V&&V.smart?mushaf(V,[7,7]):'[نص الآية من المصحف]'}</div><div class="ref">[سورة الحجرات: الآية 6]</div>
    <div class="mean"><b>ما معناها لنا اليوم؟</b> إذا جاءنا خبر، لا نصدّقه فوراً ولا نكذّبه: <b>نتبيّن</b>. واليوم تعلّمنا كيف نتبيّن: نلاحظ، ونقيس، ونكرر، ونقارن بعدل.</div></div>
    <div class="verse" style="margin-top:12px"><div class="lead">عن أبي هريرة رضي الله عنه، عن النبي ﷺ قال:</div><div class="txt" style="font-size:1.3rem">«كفى بالمرء كذباً أن يحدّث بكل ما سمع»</div><div class="ref">مسلم، المقدمة 5 — حديث صحيح</div>
    <div class="mean">من ينقل كل ما يسمعه دون أن يتثبّت، فقد شارك في نشر الخطأ. العالم الصغير يقول: «لم أتحقق بعد».</div></div></div>`; },
  after(){ recite('49:6', $('#main .verse'), ()=>speak('وعن أبي هريرة رضي الله عنه، عن النبي صلى الله عليه وسلم قال: كفى بالمرء كذباً أن يحدّث بكل ما سمع. رواه مسلم.')); } },

/* 18 — في حياتي */
{ id:'life', render(){ ok(); return `<div class="scene">${pic('l2-s09-crying-friend','زميل يبكي وطفل يقترب منه بلطف')}<h2>في حياتي</h2>
    <div class="card"><b>الموقف:</b> رأيت زميلاً يبكي.<br><b>ما أراه:</b> يبكي (ملاحظة). <b>سببه:</b> لا أعرفه حتى أسأل (تخمين).<br><b>ما أفعله:</b> لا أنشر سبباً خمّنته، ولا أحكم على أحد من نظرة؛ أسأله بلطف أو أخبر بالغاً.<br><b>لماذا؟</b> ما في قلب الناس لا تراه العين. قد يكون متعباً، أو مريضاً، أو تذكّر{|ي} شيئاً. إن خمّنت ونشرت تخميني فقد أظلمه، وهو في حاجة إلى من يسأله لا من يحكم عليه. والله نهانا أن نتبع ما ليس لنا به علم.</div>
    <div class="card"><b>الموقف:</b> سمعت خبراً عن زميل.<br><b>ما أفعله:</b> أتبيّن قبل أن أصدّق أو أنقل: من رأى؟ ومتى؟<br><b>لماذا؟</b> الخبر ينتقل من فم إلى فم ويتغيّر في كل مرة، كما تتغيّر القياسات إن أخذناها مرة واحدة. والخبر الخاطئ عن إنسان قد يؤذيه، ولا نستطيع إرجاع الكلمة بعد خروجها.</div></div>`; },
  after(){ speak(tx('في حياتي. رأيت زميلاً يبكي: يبكي ملاحظة، وسببه تخمين لا أعرفه حتى أسأل. لا أنشر سبباً خمنته. وإذا سمعت خبراً عن زميل أتبين قبل أن أصدق أو أنقل.')); } },

/* 19 — ما لا يعرفه أحد بعد + رسالة المسطرة */
{ id:'open', render(){ ok(); const med=store.get('median',null), rt=store.get('rt',null); return `<div class="scene"><div class="row" style="justify-content:center">${buddy(100,'surprised')}</div>
    <h2>ما لا يعرفه أحد بعد</h2><div class="card"><b>❓ كيف يقيس الدماغ الزمن القصير جداً (أجزاء الثانية) بلا ساعة داخله؟</b><br>لا توجد «ساعة» واحدة في الدماغ؛ هناك أفكار كثيرة ولا إجابة متفق عليها بعد. ربما تكتشفها أنت{|ِ} يوماً.</div>
    <h2>رسالة من المسطرة</h2><div class="card" style="font-size:1.05rem">أنا مسطرة عادية. لا أرى ولا أفكر. لكني اليوم قست شيئاً لا {تحسّه|تحسّينه} أنت{|ِ}: الزمن بين أن {ترى|تري} وأن تمسك{|ي}. ${med?`سقطتُ ${med} سنتيمتراً، فعرفنا أنك{|ِ} تحتاج{|ين} نحو ${rt.toFixed(2)} ثانية.`:''} الأرقام لا تجامل؛ لذلك يحبها العلماء.</div>
    <div class="card"><b>🔢 رقم يدهشك{|ِ}:</b> لو كان ردّ فعل سائق السيارة ربع ثانية فقط، لقطعت سيارته بسرعة 60 كم/س نحو 4 أمتار قبل أن يضغط الفرامل. وفي الواقع يحتاج نحو ثانية كاملة ليلاحظ ويقرر ويحرّك قدمه: أكثر من 15 متراً! لذلك لا نعبر الطريق أمام سيارة قريبة أبداً.</div></div>`; },
  after(){ speak(tx('ما لا يعرفه أحد بعد: كيف يقيس الدماغ الزمن القصير جداً بلا ساعة داخله؟ لا إجابة متفق عليها بعد. ورقم يدهشك: السائق يحتاج نحو ثانية كاملة ليلاحظ ويقرر ويحرك قدمه، أكثر من خمسة عشر متراً. لذلك لا نعبر الطريق أمام سيارة قريبة أبداً.')); } },

/* 20 — دفتري */
{ id:'draw', render(){ ok(); return `<div class="scene"><h2>دفتري: ارسم{|ي} جدول تجربتك{|ِ} وأداتين تكشفان ما لا تراه العين</h2>
    <canvas id="cv" width="500" height="520"></canvas>
    <div class="row" style="margin-top:8px"><button class="opt" style="width:auto;margin:0" id="clr">🧽 امسح</button><span class="note">ثم أكمل{|ي} على الورق: «لم تكفِ محاولة واحدة لأن ______».</span></div></div>`; },
  after(){ sketchPad(); speak(tx('ارسم{|ي} جدول تجربتك وأداتين تكشفان ما لا تراه العين.')); } },

/* 21 — المصطلحات */
{ id:'glossary', render(){ ok(); return `<div class="scene"><div class="row" style="justify-content:center">${buddy(100,'happy')}</div><h2>كلمات تعلمتها اليوم — بثلاث لغات</h2>
    <p class="note">المس{|ي} الكلمة لتسمعها. عربي · English · 中文 (مبسّطة + بينين)</p>
    ${TERMS.map(t=>`<div class="card" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;text-align:center;padding:10px">
      <button class="opt" style="margin:0;padding:10px 6px;text-align:center;font-family:var(--display);font-size:1.1rem" data-say="ar" data-k="${t.id}">${t.ar}</button>
      <button class="opt" style="margin:0;padding:10px 6px;text-align:center" data-say="en" data-k="${t.id}" dir="ltr">${t.en}</button>
      <button class="opt" style="margin:0;padding:8px 6px;text-align:center;line-height:1.3" data-say="zh" data-k="${t.id}" dir="ltr"><span style="font-size:1.3rem">${t.zh}</span><br><small style="color:var(--muted)">${t.py}</small></button></div>`).join('')}</div>`; },
  after(){ $$('[data-say]').forEach(b=>b.onclick=()=>{ const t=TERMS.find(x=>x.id===b.dataset.k); sayTerm(t,b.dataset.say); b.classList.add('ok'); sceneTimeout(()=>b.classList.remove('ok'),600); }); speak(tx('كلمات تعلمتها اليوم بثلاث لغات. المس{|ي} الكلمة لتسمعها.')); } },

/* 22 — الختام: اكتملت الوحدة */
{ id:'end', render(){ ok(); const okc=LESSON.check_ids.filter(i=>progress[i]&&(progress[i].ok||progress[i].answered)).length; store.set('finished',true); if(!store.get('finishedAt',null)) store.set('finishedAt',Date.now());
  return `<div class="scene" style="text-align:center"><img src="img/s19-badge.webp" alt="" style="width:200px;margin:8px auto;display:block;animation:spin 1.2s ease"><h1>أنهيت{|ِ} سباق ردّ الفعل!</h1>
    <p class="say">صرت{|ِ} تعرف{|ين} الفرق بين ما {تراه|ترينه} وما {تظنه|تظنينه}، ولماذا نقيس ثلاث مرات، وكيف تكون المقارنة عادلة. ${stars} نجمة · ${okc} من ${LESSON.check_ids.length} مهام محلولة.</p>
    <div class="row" style="justify-content:center">${buddy(120,'party')}</div>
    ${sayBuddy('وبهذا <b>اكتملت الوحدة الأولى</b>! في الصفحة الرئيسية ينتظرك{|ِ} شيء جديد: <b>إهداء الوحدة</b> — تختار{|ين} فكرة واحدة {وتعلّمها|وتعلّمينها} لطفل آخر بصوتك{|ِ}. وبعد ثلاثة أيام أسئلة سريعة للذاكرة.')}
    <div class="row" style="justify-content:center;margin-top:14px"><button class="opt" style="width:auto;background:var(--teal);color:#fff" id="goHome">🏠 إلى خريطتي وإهداء الوحدة</button></div></div>`; },
  after(){ confetti(); $('#goHome').onclick=()=>location.href=LESSON.home; speak(tx('أنهيت سباق رد الفعل! وبهذا اكتملت الوحدة الأولى. في الصفحة الرئيسية ينتظرك إهداء الوحدة.')); } },

];
const by = Object.fromEntries(H.map(s=>[s.id,s]));
const pick = ids => ids.map(i=>by[i]);
window.CUSTOM = {
  replace: { start: by.start, hook: by.hook, life: by.life, draw: by.draw, hist0: by.history, glossary: by.glossary, open: by.open },
  after: { hook: pick(['sort','measure_word','exp','readings','median','q_median','q_once','tools','q_tool','q_germs','fair','q_fair','q_fix','q_obs']) },
  drop: ['E1','E2','E3','E4','U01.L02.P1','U01.L02.P2','U01.L02.P3','U01.L02.P4','U01.L02.C1','U01.L02.C2','U01.L02.C3','U01.L02.C4','exp','exp_result','numbers','letter']
};
})();

