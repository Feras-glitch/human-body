/* تأليف خاص — U06.L03 «الأعضاء المساعدة: الكبد والبنكرياس والمرارة» */
(() => {
const E = id => LD.explain.find(e => e.id === id);
const F='font-family="IBM Plex Sans Arabic"';

/* 1. الجذب */
const hook={ id:'hook', render(){ need(); return `<div class="scene"><h2>${tx(LD.hook.text)}</h2><div class="row" style="justify-content:center">${buddy(110,'think')}</div>${LD.hook.options.map((o,i)=>`<button class="opt" data-i="${i}">${tx(o)}</button>`).join('')}<div class="fb" id="fb"></div></div>`; },
  after(){ $$('.opt').forEach(b=>b.onclick=()=>{ $$('.opt').forEach(x=>x.classList.add('dim')); b.classList.remove('dim'); b.classList.add('ok'); $('#fb').className='fb ok'; $('#fb').textContent='لنرَ ما الذي يرسلونه، وكيف.'; speak($('#fb').textContent); ok(); }); speak(tx(LD.hook.text)); } };

/* 2. مستكشف الأعضاء الثلاثة ومساراهما (يحل محل E1) */
const ORG={liver:'الكبد: أكبر عضو داخلي، أعلى البطن يميناً؛ يصنع الصفراء ويخزّن السكر ويعالج ما يدخل الدم.',gall:'المرارة: كيس صغير تحت الكبد يخزّن الصفراء ويعصرها عند الأكل.',panc:'البنكرياس: خلف المعدة؛ عصارة تكسّر الأنواع الثلاثة ورسالة إلى الدم.',duct:'الأنبوب المشترك: تلتقي فيه الصفراء وعصارة البنكرياس ويفتح في أول الأمعاء.',portal:'وعاء الدم من الأمعاء إلى الكبد: يمرّ به كل ما امتُص قبل أن يصل القلب.'};
const explorer={ id:'E1', render(){ need(); return `<div class="scene">${sayNar(E('E1').text)}<h2>المس{|ي} الأعضاء والأنابيب: ما الذي يسير في كل أنبوب؟</h2>
  <svg viewBox="0 0 320 270" role="img" aria-label="الكبد والمرارة والبنكرياس وأول الأمعاء" style="width:100%;max-width:340px;display:block;margin:auto;background:#fff;border-radius:18px">
    <path d="M214 148C186 148 168 160 166 186C164 214 180 238 208 242" fill="none" stroke="#D9A07E" stroke-width="24" stroke-linecap="round"/><path d="M214 148C186 148 168 160 166 186C164 214 180 238 208 242" fill="none" stroke="#F3CDB4" stroke-width="19" stroke-linecap="round"/>
    <image href="img/sv-stomach.webp" x="206" y="44" width="104" height="106.4" preserveAspectRatio="none"/><text x="270" y="100" text-anchor="middle" font-size="12" font-weight="600" fill="#7A2A3A" ${F}>المعدة</text>
    <image href="img/sv-pancreas.webp" x="176" y="174" width="134" height="56.6" preserveAspectRatio="none"/>
    <rect class="hot" data-id="panc" x="178" y="176" width="130" height="50" rx="24" fill="#fff" fill-opacity="0.01" style="cursor:pointer"/><text x="250" y="205" text-anchor="middle" font-size="11.5" font-weight="600" fill="#6B4A12" pointer-events="none" ${F}>البنكرياس</text>
    <path class="hot" data-id="portal" d="M196 238C140 234 100 204 98 150" fill="none" stroke="#7B1F1F" stroke-width="6" stroke-dasharray="8 6" stroke-linecap="round" style="cursor:pointer"/>
    <image href="img/sv-liver.webp" x="12" y="8" width="172" height="144" preserveAspectRatio="none"/>
    <path class="hot" data-id="liver" d="M16 24C60 6 130 6 180 22C186 50 176 74 146 82C110 100 70 130 30 150C12 120 10 60 16 24Z" fill="#fff" fill-opacity="0.01" stroke-linejoin="round" style="cursor:pointer"/><text x="84" y="64" text-anchor="middle" font-size="13" font-weight="600" fill="#fff" pointer-events="none" ${F}>الكبد</text>
    <path class="hot" data-id="gall" d="M112 108C124 104 136 112 134 126C132 140 118 146 110 138C104 130 104 114 112 108Z" fill="#6BA368" stroke="#3F7A3C" stroke-width="2" style="cursor:pointer"/>
    <path class="hot" data-id="duct" d="M124 142C128 168 150 184 168 196M200 206C188 206 180 202 168 198" fill="none" stroke="#6BA368" stroke-width="5" stroke-linecap="round" style="cursor:pointer"/>
    <text x="150" y="262" text-anchor="middle" font-size="11.5" font-weight="600" fill="#8A5A3A" ${F}>أول الأمعاء</text></svg>
  <div class="card" id="ot">{ابدأ|ابدئي} بأي جزء.</div><div class="fb" id="fb"></div></div>`; },
  after(){ const seen=new Set(); $$('.hot').forEach(h=>h.onclick=()=>{ const id=h.dataset.id; seen.add(id); $('#ot').textContent=ORG[id]; speak(ORG[id]); h.setAttribute('stroke','#FFD166'); h.setAttribute('stroke-width', id==='duct'||id==='portal'?'9':'4'); if(seen.size===5){ $('#fb').className='fb ok'; $('#fb').textContent='خطان: عصارات إلى الأمعاء، ودم من الأمعاء إلى الكبد. الطعام لا يدخل الكبد.'; award(); ok(); speak($('#fb').textContent); } }); speak(tx(E('E1').text)); } };

/* 3. من يكسّر ماذا؟ (يحل محل E2) */
const BREAK=[['نشا الخبز','البنكرياس (ويبدأ اللعاب)',1],['بروتين البيض','البنكرياس (وتبدأ المعدة)',1],['دهون الزيت','البنكرياس بعد أن تفتّتها الصفراء',1],['حمض المعدة القادم','البنكرياس يهدّئه',1]];
const juice={ id:'E2', render(){ need(); return `<div class="scene">${sayNar(E('E2').text)}<h2>وصلت دفعة من المعدة. المس{|ي} كل شيء فيها لتعرف{|ي} من يكسّره</h2>${BREAK.map((b,i)=>`<button class="opt" data-k="${i}">${b[0]}</button>`).join('')}<div class="fb" id="fb"></div></div>`; },
  after(){ let n=0; $$('[data-k]').forEach(b=>b.onclick=()=>{ if(b.dataset.d) return; b.dataset.d=1; n++; b.classList.add('ok'); $('#fb').className='fb ok'; $('#fb').textContent=BREAK[+b.dataset.k][1]; speak($('#fb').textContent); if(n===4){ award(); ok(); speak('عصارة واحدة لكل شيء، في الوقت المناسب.'); } }); speak(tx(E('E2').text)); } };

/* 4. الصفراء والزيت: محاكي الرجّ (يحل محل E3) */
const bile={ id:'E3', render(){ need(); return `<div class="scene">${sayNar(E('E3').text)}<h2>رجّ{|ي} الزجاجة (اضغط{|ي}) — ثم {أضف|أضيفي} الصفراء ورجّ{|ي} من جديد</h2>
  <svg id="jar" viewBox="0 0 160 200" style="width:150px;display:block;margin:auto;background:#fff;border-radius:18px"><rect x="30" y="20" width="100" height="170" rx="14" fill="#DFEEFB" stroke="#7FB3E6" stroke-width="3"/><g id="oil"><ellipse cx="80" cy="45" rx="45" ry="14" fill="#F7C948"/></g></svg>
  <div class="row" style="justify-content:center"><button class="opt" style="width:auto" id="shake">🫨 رجّ{|ي}</button><button class="opt" style="width:auto;background:#6BA368;color:#fff" id="addb">+ صفراء</button></div><div class="card" id="bt">الزيت طبقة واحدة فوق الماء.</div><div class="fb" id="fb"></div></div>`; },
  after(){ let bileOn=false, shakes=0, big=false; const draw=(drops)=>{ const g=$('#oil'); if(!g) return; if(!drops){ g.innerHTML='<ellipse cx="80" cy="45" rx="45" ry="14" fill="#F7C948"/>'; return; } let s=''; for(let i=0;i<drops;i++){ const x=40+Math.random()*80, y=35+Math.random()*140, r=drops>20?3:7; s+=`<circle cx="${x}" cy="${y}" r="${r}" fill="#F7C948"/>`; } g.innerHTML=s; }; $('#shake').onclick=()=>{ shakes++; if(!bileOn){ draw(8); $('#bt').textContent='قطرات كبيرة… وستعود طبقة واحدة بعد لحظة.'; sceneTimeout(()=>{ if(!bileOn) { draw(0); const b=$('#bt'); if(b) b.textContent='عادت طبقة واحدة: سطح صغير.'; } },1500); } else { big=true; draw(60); $('#bt').textContent='آلاف القطرات الصغيرة تبقى مشتتة: سطح ضخم — جاهزة لعصارة البنكرياس.'; $('#fb').className='fb ok'; $('#fb').textContent='الصفراء لم تهضم الزيت؛ فتّتته فقط. التكسير بعدها للبنكرياس.'; speak($('#fb').textContent); award(); ok(); } }; $('#addb').onclick=()=>{ bileOn=true; $('#addb').classList.add('ok'); $('#bt').textContent='أُضيفت الصفراء. رجّ{|ي} الآن.'; }; speak(tx(E('E3').text)); } };

/* 5. مخزن الكبد: محاكي يوم كامل (يحل محل E4).
   سكر الدم يبقى في مداه طول اليوم: بعد الوجبة يخزّن الكبد الفائض، وبين الوجبات يُطلقه، وحين يقلّ المخزن يصنع الكبد سكراً
   جديداً من مواد أخرى ويستعمل الجسم دهنه. لذلك لا يهبط السكر في النوم ولا في الصيام (كان المحاكي يُنزله حين يفرغ المخزن). نموذج مبسّط لا أرقام قياس */
const liverSim={ id:'E4', render(){ need(); return `<div class="scene">${sayNar(E('E4').text)}<h2>يوم كامل: {أضف|أضيفي} وجبة حين {تشاء|تشائين}، و{اجعل|اجعلي} الساعات تمرّ. راقب{|ي} سكر الدم ومخزن الكبد</h2>
  <div class="card"><svg id="lsv" viewBox="0 0 320 130" role="img" aria-label="سكر الدم خلال اليوم" style="width:100%;max-width:340px;display:block;margin:auto;background:#fff;border-radius:12px">
    <rect x="22" y="22" width="292" height="62" fill="#E6F7F4"/><text x="306" y="18" text-anchor="start" font-size="10" fill="#2B7A6E" ${F}>المدى الطبيعي لسكر الدم</text>
    <line x1="22" y1="112" x2="314" y2="112" stroke="#C9BFA9"/><text x="160" y="126" text-anchor="middle" font-size="10" fill="#7A6E66" ${F}>الساعات ←</text>
    <polyline id="lline" fill="none" stroke="#C0392B" stroke-width="3" stroke-linejoin="round" points=""/><g id="lmeals"></g></svg>
   <div style="margin-top:6px">الساعة: <b id="hh"></b> · سكر الدم: <b id="bs"></b></div>
   <div>مخزن الكبد: <span id="lv" style="display:inline-block;height:12px;background:#B5503C;border-radius:6px;vertical-align:middle;transition:width .3s"></span></div>
   <div class="note" id="src"></div></div>
  <div class="row" style="justify-content:center;flex-wrap:wrap"><button class="opt" style="width:auto;margin:4px" id="hour" type="button">⏳ ساعة تمرّ</button><button class="opt" style="width:auto;margin:4px" id="night" type="button">🌙 نوم الليل (8 ساعات)</button><button class="opt" style="width:auto;margin:4px;background:var(--coral);color:#fff" id="meal" type="button">🍽️ وجبة</button></div><div class="fb" id="fb"></div></div>`; },
  after(){ const START=7; let h=START, st=55, since=3, mode='', seen=new Set(), fin=false; const pts=[]; const meals=[];
    /* سكر الدم (مقياس رسم لا وحدات): بعد الوجبة أعلى قليلاً، وبين الوجبات وسط المدى؛ لا يخرج من المدى أبداً */
    const level=()=> since<=1 ? 30 : since<=2 ? 40 : 52;
    const X=k=>314-k*292/24; /* الزمن يجري من اليمين إلى اليسار كاتجاه القراءة */
    const draw=()=>{ const hh=((h%24)+24)%24; $('#hh').textContent=(hh===0?12:hh>12?hh-12:hh)+(hh<12?' صباحاً':' مساءً');
      $('#lv').style.width=Math.round(st*1.5)+'px'; $('#bs').textContent= since<=2 ? 'في مداه — أعلى قليلاً بعد الوجبة' : 'في مداه';
      $('#src').textContent = mode==='store' ? 'الكبد يخزّن السكر الفائض في خلاياه.' : mode==='release' ? 'الكبد يُطلق من مخزنه قطرة قطرة.' : mode==='make' ? 'المخزن قليل: الكبد يصنع سكراً جديداً من مواد أخرى، والجسم يستعمل دهنه.' : '';
      $('#lline').setAttribute('points', pts.map((v,k)=>`${X(k).toFixed(1)},${v}`).join(' '));
      $('#lmeals').innerHTML = meals.map(k=>`<text x="${X(k).toFixed(1)}" y="104" text-anchor="middle" font-size="12">🍽️</text>`).join(''); };
    const say=(m)=>{ const M={ store:'بعد الوجبة: ارتفع السكر قليلاً، فخزّن الكبد الفائض.', release:'بين الوجبات: الكبد يُطلق من مخزنه، فيبقى السكر في مداه.', make:'قلّ المخزن، والسكر ما زال في مداه: الكبد صار يصنع سكراً جديداً من مواد أخرى، والجسم يستعمل دهنه. لذلك لا يهبط سكرك{|ِ} في النوم ولا في الصيام — لكنك {تجوع|تجوعين}، وجسمك{|ِ} النامي يحتاج وجبته.' }; fb(m==='make'?'':'ok', M[m]); };
    const step=(quiet)=>{ h++; since++; let m;
      if(since<=2){ m='store'; st=Math.min(100, st+14); } else if(st>22){ m='release'; st=Math.max(22, st-7); } else { m='make'; st=Math.max(12, st-1); }
      pts.push(level()); if(pts.length>25){ pts.shift(); for(let q=meals.length-1;q>=0;q--){ if(--meals[q]<0) meals.splice(q,1); } } if(m!==mode){ mode=m; seen.add(m); if(!quiet) say(m); } draw();
      if(!fin && h-START>=24){ fin=true; fb('ok', 'يوم كامل: سكر الدم بقي في مداه طول الوقت. بعد الوجبات خزّن الكبد، وبينها أطلق'+(seen.has('make')?'، وحين قلّ المخزن صنع سكراً جديداً واستعمل الجسم دهنه.':'؛ ولو طال الجوع أكثر لصنع سكراً جديداً.')); award(); ok(); } };
    pts.push(level()); draw();
    $('#hour').onclick=()=>step(false);
    $('#night').onclick=()=>{ for(let k=0;k<8;k++) step(true); if(!fin) say(mode); };
    $('#meal').onclick=()=>{ since=0; meals.push(pts.length-1); st=Math.min(100,st+10); mode=''; fb('ok','وجبة: السكر يدخل الدم من الأمعاء ويمرّ بالكبد.'); draw(); };
    speak(tx(E('E4').text)); } };

/* 6. التجربة */
const X=LD.experiment;
const exp={ id:'exp', render(){ need(); const r=store.get('bilex',{}); return `<div class="scene"><h2>تجربة: ${tx(X.title)}</h2><div class="card" style="background:#FFF3D6"><b>السلامة:</b> ${X.safety.slice(0,2).map(tx).join(' ')}${safetyMore(X,2)}</div><div class="card">${X.steps.map((s,i)=>`<b>${i+1}.</b> ${tx(s)}`).join('<br>')}</div>
  <div class="card"><b>مع الصابون بقي الزيت:</b><div class="row">${['طبقة واحدة','قطرات صغيرة مشتتة','اختفى'].map((o,i)=>`<button class="opt" style="width:auto" data-q="a" data-v="${i}">${o}</button>`).join('')}</div>
  <b>الإسفنجة المعصورة قليلاً قليلاً:</b><div class="row">${['أعطت دفعة واحدة','أعطت دفعات ثم نفدت','لم تعط شيئاً'].map((o,i)=>`<button class="opt" style="width:auto" data-q="b" data-v="${i}">${o}</button>`).join('')}</div>
  <b>أين وجدت{|ِ} كبدك{|ِ}؟</b><div class="row">${['يساراً أسفل البطن','يميناً تحت الأضلاع','في الصدر'].map((o,i)=>`<button class="opt" style="width:auto" data-q="c" data-v="${i}">${o}</button>`).join('')}</div><div class="fb" id="fb"></div></div></div>`; },
  after(){ const r=store.get('bilex',{}); const W={a:'الصفراء تفتّت ولا تهضم؛ الزيت لم يختفِ.',b:'هكذا يُطلق الكبد السكر بين الوجبات.',c:'أكبر عضو داخلي.'}; const chk=()=>{ if(r.a===1&&r.b===1&&r.c===1){ award();ok();}else need();};chk(); $$('[data-q]').forEach(b=>b.onclick=()=>{ const q=b.dataset.q; r[q]=+b.dataset.v; store.set('bilex',r); $$(`[data-q="${q}"]`).forEach(x=>x.classList.remove('ok','bad')); const right=r[q]===1; b.classList.add(right?'ok':'bad'); $('#fb').className='fb '+(right?'ok':'bad'); $('#fb').textContent=(right?'نعم: ':'راقب{|ي} مرة أخرى. ')+W[q]; speak($('#fb').textContent); chk(); }); speak([SAY.experiment, tx(X.title)]); } };

window.CUSTOM={ replace:{ hook, E1:explorer, E2:juice, E3:bile, E4:liverSim, exp } };
})();

