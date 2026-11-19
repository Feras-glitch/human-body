/* تأليف خاص — U05.L03 «قضية الوحدة: من لقمة الخبز إلى القفزة» */
(() => {
const E = id => LD.explain.find(e => e.id === id);
const F='font-family="IBM Plex Sans Arabic"';

/* 1. الجذب */
const hook={ id:'hook', render(){ need(); return `<div class="scene"><h2>${tx(LD.hook.text)}</h2><div class="row" style="justify-content:center">${buddy(110,'think')}</div>${LD.hook.options.map((o,i)=>`<button class="opt" data-i="${i}">${tx(o)}</button>`).join('')}<div class="fb" id="fb"></div></div>`; },
  after(){ $$('.opt').forEach(b=>b.onclick=()=>{ $$('.opt').forEach(x=>x.classList.add('dim')); b.classList.remove('dim'); b.classList.add('ok'); $('#fb').className='fb ok'; $('#fb').textContent='لنتتبع اللقمة محطةً محطة، كما يتتبع المحقق الأثر.'; speak($('#fb').textContent); ok(); }); speak(tx(LD.hook.text)); } };

/* 2. خريطة المحطات السبع: تُبنى عبر E1–E6 (مشهد واحد تفاعلي يحل محل E1، وتُحذف E2–E6 فيها نصوصها) */
const ST=[
  {id:'E1',n:'الفم والأمعاء',x:160,y:60,c:'#D9485A',note:'الخبز يصير سكراً ويدخل الدم'},
  {id:'E2',n:'الرئة',x:230,y:95,c:'#2BB3A3',note:'الأكسجين يدخل الدم'},
  {id:'E3',n:'القلب',x:160,y:120,c:'#7B1F1F',note:'يدفع السكر والأكسجين إلى الساق'},
  {id:'E4',n:'خلية العضلة',x:150,y:220,c:'#f2a65a',note:'سكر + أكسجين ← طاقة (+ثاني أكسيد الكربون وحرارة)'},
  {id:'E5',n:'العضلة والركبة',x:175,y:260,c:'#7FB3E6',note:'تنقبض فتسحب العظم — قفزة!'},
  {id:'E6',n:'الزفير',x:90,y:95,c:'#8A6D1F',note:'ثاني أكسيد الكربون يعود بالدم إلى الرئة ويخرج'}];
const stations={ id:'E1', render(){ need(); return `<div class="scene"><h2>تتبّع{|ي} اللقمة: اضغط{|ي} المحطة التالية في كل مرة</h2>
  <div class="row" style="align-items:flex-start"><svg viewBox="0 0 320 300" style="width:46%;max-width:200px;background:#fff;border-radius:18px"><rect x="130" y="10" width="60" height="60" rx="30" fill="#F4C9A8"/><rect x="110" y="75" width="100" height="120" rx="20" fill="#EEE"/><rect x="118" y="195" width="34" height="95" rx="10" fill="#DDD"/><rect x="168" y="195" width="34" height="95" rx="10" fill="#DDD"/>
    ${ST.map((s,i)=>`<g class="st" data-k="${i}" style="cursor:pointer"><circle cx="${s.x}" cy="${s.y}" r="16" fill="${s.c}" opacity=".35"/><text x="${s.x}" y="${s.y+5}" text-anchor="middle" font-size="12" fill="#fff" ${F}>${i+1}</text></g>`).join('')}</svg>
  <div style="flex:1;min-width:150px"><div class="card" id="stx"><b>{ابدأ|ابدئي} بالمحطة 1.</b></div></div></div><div class="fb" id="fb"></div></div>`; },
  after(){ let k=0; const lit=i=>{ const g=$(`.st[data-k="${i}"] circle`); if(g) g.setAttribute('opacity','1'); }; $$('.st').forEach(g=>g.onclick=()=>{ const i=+g.dataset.k; if(i!==k){ noteMiss(); $('#fb').className='fb bad'; $('#fb').textContent='ليس بعد؛ أين اللقمة الآن؟ المحطة '+(k+1); speak($('#fb').textContent); return; } lit(i); const s=ST[i]; $('#stx').innerHTML=`<b>${i+1}. ${s.n}</b> — ${s.note}<div class="say" style="margin-top:6px">${tx(E(s.id).text)}</div>`; $('#fb').className='fb'; $('#fb').textContent=''; speak(tx(E(s.id).text)); k++; if(k===ST.length){ $('#fb').className='fb ok'; $('#fb').textContent='سبع محطات، خمسة أجهزة، لقمة واحدة.'; award(); ok(); } }); speak('تتبع اللقمة من الفم إلى القفزة'); } };

/* 3. فحص النموذج الخاطئ: خمسة أخطاء */
const FE=LD.find_the_error;
const WRONG=[['الطعام يذهب من المعدة إلى الرئة ليحترق',true],['الأكسجين يدخل الدم في الرئة',false],['الهواء يحمل الطاقة',true],['الرئة تنفخ الهواء في العضلة مباشرة',true],['القلب يدفع الدم إلى الساق',false],['العضلة تدفع العظم فتقفز',true],['ثاني أكسيد الكربون يخرج من المعدة',true],['الخلية تطلق الطاقة من السكر بالأكسجين',false]];
const inspect={ id:'find_error', render(){ need(); return `<div class="scene"><h2>نموذج زميل{ك|تكِ} فيه خمسة أخطاء. المس{|ي} الجمل الخاطئة فقط</h2>${WRONG.map((w,i)=>`<button class="opt err" data-i="${i}">${w[0]}</button>`).join('')}<div class="fb" id="fb"></div></div>`; },
  after(){ let found=0, miss=0; const FIX={0:'الطعام يصير سكراً في الأمعاء ويدخل الدم؛ الإطلاق في الخلية.',2:'الطاقة في السكر؛ الهواء يعطي الأكسجين الذي يُطلقها.',3:'لا هواء خارج الرئة؛ الأكسجين ينتقل بالدم.',5:'العضلة تسحب فقط عبر الوتر.',6:'يعود بالدم إلى الرئة ويخرج مع الزفير.'}; $$('.err').forEach(b=>b.onclick=()=>{ if(b.dataset.d) return; b.dataset.d=1; const i=+b.dataset.i; if(WRONG[i][1]){ found++; b.classList.add('ok'); $('#fb').className='fb ok'; $('#fb').textContent=`خطأ ${found}/5 — الصواب: `+FIX[i]; } else { miss++; noteMiss(); b.classList.add('bad'); $('#fb').className='fb bad'; $('#fb').textContent='هذه صحيحة! راجع{|ي} الرحلة.'; } speak($('#fb').textContent); if(found===5){ mark('U05.L03.FE', miss<=1); award(); ok(); speak('وجدت الأخطاء الخمسة. كل خطأ كان تصوراً شائعاً صحّحناه في وحدة سابقة.'); } }); speak('ابحث{|ي} عن خمسة أخطاء'); } };

/* 4. سبب واحد لثلاث ملاحظات (قبل find_error، بعد E6) */
const one={ id:'one_cause', render(){ need(); return `<div class="scene"><h2>بعد القفزات: لهاث، نبض سريع، دفء. اسحب{|ي} الثلاثة إلى سببها</h2><div class="row">${['لهاث','نبض سريع','دفء'].map(o=>`<button class="opt" style="width:auto" data-o="${o}">${o}</button>`).join('')}</div>
  <div class="row">${['الهواء ساخن','القلب تعب','خلايا العضلات طلبت طاقة أكثر'].map((c,i)=>`<button class="opt" style="background:#FFF3D6" data-c="${i}">${c}</button>`).join('')}</div><div class="fb" id="fb"></div></div>`; },
  after(){ let sel=null, n=0; $$('[data-o]').forEach(b=>b.onclick=()=>{ if(b.classList.contains('ok')) return; $$('[data-o]').forEach(x=>x.classList.remove('sel')); b.classList.add('sel'); sel=b; }); $$('[data-c]').forEach(c=>c.onclick=()=>{ if(!sel) return; if(c.dataset.c==='2'){ sel.classList.remove('sel'); sel.classList.add('ok'); n++; $('#fb').className='fb ok'; $('#fb').textContent={'لهاث':'أكسجين أكثر وثاني أكسيد كربون أكثر → تنفس أسرع.','نبض سريع':'نقل أسرع للسكر والأكسجين.','دفء':'جزء من الطاقة يخرج حرارة.'}[sel.dataset.o]; sel=null; if(n===3){ award(); ok(); speak('ثلاث ملاحظات، سبب واحد.'); } } else { noteMiss(); $('#fb').className='fb bad'; $('#fb').textContent='من الذي يطلب؟ الخلايا العاملة.'; } speak($('#fb').textContent); }); speak('ثلاث ملاحظات وسبب واحد'); } };

/* 5. التجربة: أعلّمها لغيري — قائمة التحقق */
const X=LD.experiment; const CK=['من أين السكر','من أين الأكسجين','من ينقلهما','أين تُطلَق الطاقة','كيف تتحرك العضلة','إلى أين يذهب ثاني أكسيد الكربون'];
const exp={ id:'exp', render(){ need(); const r=store.get('teach5',{}); return `<div class="scene"><h2>تجربة: ${tx(X.title)}</h2><div class="card" style="background:#FFF3D6"><b>السلامة:</b> ${X.safety.slice(0,2).map(tx).join(' ')}${safetyMore(X,2)}</div><div class="card">${X.steps.slice(0,6).map((s,i)=>`<b>${i+1}.</b> ${tx(s)}`).join('<br>')}</div>
  <div class="card"><b>بعد أن شرحت{|ِ} لغيرك{|ِ}، ضع{|ي} ✓ على ما {ذكرته|ذكرتِه}:</b>${CK.map((c,i)=>`<label style="display:block;margin:6px 0"><input type="checkbox" data-k="${i}" ${r[i]?'checked':''}> ${c}</label>`).join('')}<div class="big" id="sc"></div><div class="fb" id="fb"></div></div></div>`; },
  after(){ const r=store.get('teach5',{}); const upd=()=>{ const n=CK.filter((_,i)=>r[i]).length; $('#sc').textContent=n+' / 6'; if(n>=5){ $('#fb').className='fb ok'; $('#fb').textContent='شرح كامل. من استطاع أن يشرح فقد فهم.'; award(); ok(); } else { $('#fb').className='fb'; $('#fb').textContent=n?'أكمل{|ي} ما نقص ثم اشرح{|ي} من جديد.':''; } }; upd(); $$('[data-k]').forEach(c=>c.onchange=()=>{ r[c.dataset.k]=c.checked; store.set('teach5',r); upd(); }); speak([SAY.experiment, tx(X.title)]); } };

/* 6. (ب) ماذا لو تعطّلت حلقة؟ (يحل محل E8) */
const BREAK=[['لا طعام يوماً كاملاً','المخزون يكفي ساعات، ثم يصنع الكبد سكراً من مواد أخرى: السكر في مداه، لكن الجسم يجوع ويتعب'],['هواء قليل الأكسجين (جبل عالٍ)','طاقة أقل بسرعة: دوار وتعب رغم الطعام'],['قلب ضعيف','نقل أقل: تعب من جهد قليل'],['عصب الساق مصاب','وقود وأكسجين موجودان ولا قفزة']];
const brk={ id:'E8', render(){ ok(); if(level!=='B') return `<div class="scene">${sayBuddy('للمستوى ب: السلسلة بقوة أضعف حلقاتها؛ تعطّل محطة يُضعف الحركة كلها.')}</div>`;
  return `<div class="scene">${sayNar(E('E8').text)}<h2>{اختر|اختاري} العطل ثم توقّع{|ي} النتيجة</h2>${BREAK.map((b,i)=>`<div class="card" style="padding:8px"><b>✕ ${b[0]}</b><div class="row">${BREAK.map((o,k)=>`<button class="opt" style="width:auto;font-size:.85em" data-q="${i}" data-v="${k}">${o[1]}</button>`).join('')}</div></div>`).join('')}<div class="fb" id="fb"></div></div>`; },
  after(){ if(level!=='B') return; const done=new Set(); $$('[data-q]').forEach(b=>b.onclick=()=>{ const q=+b.dataset.q; $$(`[data-q="${q}"]`).forEach(x=>x.classList.remove('ok','bad')); const right=+b.dataset.v===q; if(!right) noteMiss(); b.classList.add(right?'ok':'bad'); if(right) done.add(q); $('#fb').className='fb '+(right?'ok':'bad'); $('#fb').textContent=right?'صحيح.':'أي حلقة ضعفت؟ وماذا كانت تعطي؟'; speak($('#fb').textContent); if(done.size===4){ award(); speak('السلسلة بقوة أضعف حلقاتها، ولذلك نرعى كل حلقة.'); } }); speak(tx(E('E8').text)); } };

window.CUSTOM={ replace:{ hook, E1:stations, find_error:inspect, E8:brk, exp }, drop:['E2','E3','E4','E5','E6'], before:{ find_error:[one] } };
})();
