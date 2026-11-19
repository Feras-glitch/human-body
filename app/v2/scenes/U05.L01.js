/* تأليف خاص — U05.L01 «الخلية: اللبنة الحية التي لا تراها» */
(() => {
const E = id => LD.explain.find(e => e.id === id);
const F='font-family="IBM Plex Sans Arabic"';

/* 1. الجذب: كم لبنة في بيت؟ */
const hook={ id:'hook', render(){ need(); return `<div class="scene"><h2>${tx(LD.hook.text)}</h2><div class="row" style="justify-content:center">${buddy(110,'think')}</div>${LD.hook.options.map((o,i)=>`<button class="opt" data-i="${i}">${tx(o)}</button>`).join('')}<div class="fb" id="fb"></div></div>`; },
  after(){ $$('.opt').forEach(b=>b.onclick=()=>{ $$('.opt').forEach(x=>x.classList.add('dim')); b.classList.remove('dim'); b.classList.add('ok'); $('#fb').className='fb ok'; $('#fb').textContent='سنكبّر حتى نرى اللبنة بأعيننا.'; speak($('#fb').textContent); ok(); }); speak(tx(LD.hook.text)); } };

/* 2. التكبير: من الجسم إلى الخلية (يحل محل E1) */
const zoom={ id:'E1', render(){ need(); return `<div class="scene">${sayNar(E('E1').text)}<h2>كبّر{|ي} أربع مرات حتى {ترى|تري} اللبنة</h2>
  <svg id="zs" viewBox="0 0 320 240" style="width:100%;max-width:340px;display:block;margin:auto;background:#fff;border-radius:18px"></svg>
  <div class="row" style="justify-content:center"><button class="opt" style="width:auto;background:var(--coral);color:#fff" id="zoomBtn">🔍 كبّر</button></div><div class="card" id="zt"></div></div>`; },
  after(){ const L=[
    [`<rect x="130" y="20" width="60" height="60" rx="30" fill="#F4C9A8"/><rect x="110" y="85" width="100" height="110" rx="20" fill="#7FB3E6"/><rect x="120" y="195" width="30" height="40" fill="#5A7BA8"/><rect x="170" y="195" width="30" height="40" fill="#5A7BA8"/>`,'جسمك كله. ×1'],
    [`<rect x="60" y="30" width="200" height="180" rx="30" fill="#F4C9A8"/><path d="M90 60 q80 -20 160 10 M90 120 q80 -20 160 10 M90 180 q80 -20 160 10" stroke="#E0A080" stroke-width="3" fill="none"/>`,'قطعة من جلد ذراعك. ×10'],
    [`<rect width="320" height="240" fill="#F8E3CF"/>${Array.from({length:7},(_,j)=>Array.from({length:8},(_,i)=>{ const x=-14+i*46+(j%2?23:0)+((i*7+j*5)%5-2), y=4+j*38+((i*3+j*11)%5-2); return `<path d="M${x} ${y+12}l22 -12l22 12v24l-22 12l-22 -12z" fill="#FBEBDD" stroke="#D99A78" stroke-width="2.4" stroke-linejoin="round"/><ellipse cx="${x+22+((i+j)%3-1)*3}" cy="${y+24+((i*2+j)%3-1)*3}" rx="6" ry="5" fill="#B9766A" opacity=".75"/>`; }).join('')).join('')}`,'الجلد مبنيّ من قطع صغيرة متلاصقة — لا يراها إلا المجهر. ×400'],
    [`<image href="img/sv-cell.webp" x="48" y="14" width="228" height="212"/><path d="M196 22 L226 12" stroke="#5a5a8a" stroke-width="1.4"/><text x="252" y="16" text-anchor="middle" font-size="12" fill="#3d3d78" ${F} paint-order="stroke" stroke="#fff" stroke-width="4" stroke-linejoin="round">الغشاء</text><text x="126" y="150" text-anchor="middle" font-size="13" fill="#7a0f45" ${F} paint-order="stroke" stroke="#fff" stroke-width="4" stroke-linejoin="round">النواة</text><text x="196" y="190" text-anchor="middle" font-size="12" fill="#6b5a10" ${F} paint-order="stroke" stroke="#fff" stroke-width="4" stroke-linejoin="round">السيتوبلازم</text>`,'خلية واحدة: اللبنة الحية. غشاء يحيط، وسائل هلامي، ونواة في الوسط. ×2000']];
    let i=0; const show=()=>{ $('#zs').innerHTML=L[i][0]; $('#zt').textContent=L[i][1]; speak(L[i][1]); }; show(); $('#zoomBtn').onclick=()=>{ if(i<3){ i++; show(); if(i===3){ $('#zoomBtn').disabled=true; award(); ok(); } } }; } };

/* 3. مستكشف الخلية: المس{|ي} كل جزء (يحل محل E2) */
const PARTS={membrane:'الغشاء: الجدار الرقيق الذي يحيط بالخلية ويقرر ما يدخل وما يخرج.',cytoplasm:'السيتوبلازم: السائل الهلامي الذي تسبح فيه الأجزاء وتحدث فيه أعمال كثيرة.',nucleus:'النواة: تحفظ تعليمات بناء الخلية وعملها (DNA) — كدفتر وصفات، لا كدماغ يفكر.',mitochondria:'الميتوكوندريا: محطات إطلاق الطاقة؛ هنا تُطلق الخلية الطاقة المخزونة في الغذاء — الدرس القادم.'};
const explorer={ id:'E2', render(){ need(); return `<div class="scene">${sayNar(E('E2').text)}<h2>المس{|ي} الأجزاء الأربعة في الخلية</h2>${cellMap({variant:0,size:320})}<div class="card" id="pt">{ابدأ|ابدئي} بأي جزء.</div><div class="fb" id="fb"></div></div>`; },
  after(){ const seen=new Set(); $$('.hot').forEach(h=>h.onclick=()=>{ const id=h.dataset.id; h.classList.add('lit'); h.querySelector('.label')?.removeAttribute('hidden'); $('#pt').textContent=PARTS[id]; speak(PARTS[id]); seen.add(id); if(seen.size===4){ $('#fb').className='fb ok'; $('#fb').textContent='عرفت{|ِ} الأجزاء الأربعة. أغلب خلايا جسمك{|ِ} فيها هذه الأجزاء — وفي المشهد التالي خلية تخلّت عن نواتها.'; award(); ok(); } }); speak(tx(E('E2').text)); } };

/* 4. خلايا متخصصة: صِل الشكل بالعمل (يحل محل E3) */
const CELLS=[['🔴 قرص مقعّر بلا نواة','تحمل الأكسجين — خلية الدم الحمراء'],['🧵 خيط طويل','تنقبض وتسحب — خلية العضلة'],['🌳 جسم بأذرع طويلة','ترسل إشارات — الخلية العصبية'],['🧱 مسطّحة متلاصقة','تغطي وتحمي — خلية الجلد']];
const special={ id:'E3', render(){ need(); const sh=[...CELLS.keys()].sort(()=>Math.random()-.5); return `<div class="scene">${sayNar(E('E3').text)}<h2>كل خلية شكلها يناسب عملها: {اختر|اختاري} الشكل ثم عمله</h2>
  <div class="row" id="shapes">${CELLS.map((c,i)=>`<button class="opt" style="width:48%" data-s="${i}">${c[0]}</button>`).join('')}</div><div class="row" id="jobs">${sh.map(i=>`<button class="opt" style="width:48%;background:#FFF3D6" data-j="${i}">${CELLS[i][1]}</button>`).join('')}</div><div class="fb" id="fb"></div></div>`; },
  after(){ let s=null, n=0; $$('[data-s]').forEach(b=>b.onclick=()=>{ if(b.classList.contains('ok')) return; $$('[data-s]').forEach(x=>x.classList.remove('sel')); b.classList.add('sel'); s=+b.dataset.s; }); $$('[data-j]').forEach(b=>b.onclick=()=>{ if(s===null||b.classList.contains('ok')) return; if(+b.dataset.j===s){ b.classList.add('ok'); $(`[data-s="${s}"]`).classList.add('ok'); $(`[data-s="${s}"]`).classList.remove('sel'); n++; $('#fb').className='fb ok'; $('#fb').textContent='صحيح: '+CELLS[s][1]; s=null; if(n===4){ award(); ok(); speak('أربعة أشكال لأربعة أعمال؛ وكلها تبدأ من الأجزاء الثلاثة نفسها.'); } } else { noteMiss(); $('#fb').className='fb bad'; $('#fb').textContent='فكّر{|ي}: ماذا يناسب هذا الشكل؟'; } speak($('#fb').textContent); }); speak(tx(E('E3').text)); } };

/* 5. التجربة: أبني خلية — قائمة تحقق{|ي} */
const X=LD.experiment;
const exp={ id:'exp', render(){ need(); const r=store.get('cellmodel',{}); const Q=[['الكيس يمثل','الغشاء','النواة','السيتوبلازم'],['الجيلي يمثل','السيتوبلازم','الغشاء','النواة'],['حبة العنب تمثل','النواة','الغشاء','الميتوكوندريا'],['حبات الأرز تمثل','الميتوكوندريا','النواة','الغشاء']];
  return `<div class="scene"><h2>تجربة: ${tx(X.title)}</h2><div class="card" style="background:#FFF3D6"><b>السلامة:</b> ${X.safety.slice(0,2).map(tx).join(' ')}${safetyMore(X,2)}</div><div class="card">${X.steps.slice(0,5).map((s,i)=>`<b>${i+1}.</b> ${tx(s)}`).join('<br>')}</div>
  <div class="card"><b>ماذا يمثل كل شيء في نموذجك{|ِ}؟</b>${Q.map((q,qi)=>`<div style="margin-top:6px">${q[0]}: <div class="row">${[1,2,3].map(k=>`<button class="opt" style="width:auto" data-q="${qi}" data-v="${k}">${q[k]}</button>`).join('')}</div></div>`).join('')}<div class="fb" id="fb"></div></div></div>`; },
  after(){ const r=store.get('cellmodel',{}); const chk=()=>{ if([0,1,2,3].every(i=>r[i]===1)){ award();ok();}else need();};chk(); $$('[data-q]').forEach(b=>b.onclick=()=>{ const q=b.dataset.q; r[q]=+b.dataset.v; store.set('cellmodel',r); $$(`[data-q="${q}"]`).forEach(x=>x.classList.remove('ok','bad')); const right=r[q]===1; b.classList.add(right?'ok':'bad'); $('#fb').className='fb '+(right?'ok':'bad'); $('#fb').textContent=right?'صحيح. ما الذي لا يُظهره النموذج؟ أن الخلية حية وتعمل.':'راجع{|ي} الأجزاء الأربعة.'; speak($('#fb').textContent); chk(); }); speak([SAY.experiment, tx(X.title)]); } };

/* 6. (ب) من الخلية إلى الجسم: رتّب{|ي} المستويات (يحل محل E6) */
const LEVELS=['خلية','نسيج','عضو','جهاز','جسم'];
const levelsB={ id:'E6', render(){ ok(); if(level!=='B') return `<div class="scene">${sayBuddy('للمستوى ب: الخلايا المتشابهة تصنع نسيجاً، والأنسجة عضواً، والأعضاء جهازاً.')}</div>`;
  const sh=[...LEVELS].sort(()=>Math.random()-.5); return `<div class="scene">${sayNar(E('E6').text)}<h2>رتّب{|ي} من الأصغر إلى الأكبر</h2><div class="row" id="pool">${sh.map(l=>`<button class="opt" style="width:auto" data-l="${l}">${l}</button>`).join('')}</div><div class="card" id="seq" style="min-height:40px"></div><div class="fb" id="fb"></div></div>`; },
  after(){ if(level!=='B') return; const got=[]; $$('[data-l]').forEach(b=>b.onclick=()=>{ if(b.disabled) return; const exp=LEVELS[got.length]; if(b.dataset.l===exp){ got.push(exp); b.disabled=true; b.classList.add('ok'); $('#seq').textContent=got.join(' ← '); if(got.length===5){ $('#fb').className='fb ok'; $('#fb').textContent='خلية ← نسيج ← عضو ← جهاز ← جسم. مثال: خلية عضلية ← نسيج عضلي ← القلب ← الجهاز الدوري ← أنت.'; speak($('#fb').textContent); award(); } } else { noteMiss(); $('#fb').className='fb bad'; $('#fb').textContent='ما الأصغر الذي لم يُوضَع بعد؟'; speak($('#fb').textContent); } }); speak(tx(E('E6').text)); } };

window.CUSTOM={ replace:{ hook, E1:zoom, E2:explorer, E3:special, E6:levelsB, exp } };
})();

