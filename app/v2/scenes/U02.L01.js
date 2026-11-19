/* تأليف خاص — U02.L01 «الهيكل: دعم وحماية وعظم حي»
   مشاهد تفاعلية تُركَّب فوق المشاهد المولَّدة من المصدر؛ النصوص العلمية تبقى من JSON. */
(() => {
const E = id => LD.explain.find(e => e.id === id);
const BONES = [ // منطقة على خريطة الجسم → العظم الكبير فيها
  { id:'head', bone:'الجمجمة', note:'صندوق العظم حول الدماغ' },
  { id:'chest', bone:'القفص الصدري', note:'12 زوجاً من الأضلاع حول القلب والرئتين' },
  { id:'abdomen', bone:'الحوض', note:'في أسفل البطن؛ يحمل الجذع ويصل الساقين' },
  { id:'upperarm_r', bone:'عظم الذراع (العضد)', note:'من الكتف إلى المرفق' },
  { id:'thigh', bone:'عظم الفخذ', note:'أكبر عظمة في جسمك: من الورك إلى الركبة' },
  { id:'hand_r', bone:'عظام اليد', note:'27 عظمة صغيرة في يد واحدة' },
];

/* ===== 1. الجذب: اختفت العظام! ===== */
const hook = { id:'hook', render(){ need(); return `<div class="scene"><h2>${tx(LD.hook.text)}</h2>
  <div style="text-align:center;position:relative;height:300px"><div id="heroBox" style="display:inline-block;transition:transform .9s cubic-bezier(.5,1.6,.4,1),filter .9s;transform-origin:50% 100%">${hero('stand',200)}</div></div>
  <div class="row" style="justify-content:center"><button class="opt" style="width:auto;background:var(--coral);color:#fff" id="zap">✨ أزِل العظام!</button></div>
  <div class="fb" id="fb"></div></div>`; },
  after(){ speak(tx(LD.hook.text)); $('#zap').onclick=()=>{ const h=$('#heroBox'); h.style.transform='scaleY(.18) scaleX(1.6) translateY(40px)'; h.style.filter='blur(1px)'; $('#zap').disabled=true; sceneTimeout(()=>{ $('#fb').className='fb ok'; $('#fb').innerHTML=tx('كومة على الأرض! بلا عظام لا شكل ولا وقوف. هذا أول عمل للهيكل: <b>الدعم</b>.'); speak('كومة على الأرض! بلا عظام لا شكل ولا وقوف. هذا أول عمل للهيكل: الدعم.'); award(); ok(); },1000); }; } };

/* ===== 2. مستكشف الهيكل: المس{|ي} المنطقة لترى العظم ===== */
const explorer = { id:'explorer', render(){ need(); const found=store.get('bones',[]).filter(k=>BONES.some(b=>b.id===k)); return `<div class="scene"><h2>المس{|ي} كل منطقة لتعرف{|ي} العظم الكبير فيها (${found.length}/${BONES.length})</h2>
  ${bodyMap({side:'front', ids:BONES.map(b=>b.id), size:340})}<div id="boneList" class="row" style="margin-top:8px">${found.map(id=>`<span class="chip done">${BONES.find(b=>b.id===id).bone}</span>`).join('')}</div><div class="fb ok" id="fb" hidden></div></div>`; },
  after(){ const found=new Set(store.get('bones',[]).filter(k=>BONES.some(b=>b.id===k))); if(found.size===BONES.length) ok(); $$('.hot').forEach(h=>{ if(found.has(h.dataset.id)){ h.classList.add('lit'); } h.onclick=()=>{ const b=BONES.find(x=>x.id===h.dataset.id); h.classList.add('lit'); $('#fb').hidden=false; $('#fb').innerHTML=`<b>${b.bone}</b> — ${tx(b.note)}`; speak(b.bone+'. '+tx(b.note)); if(!found.has(b.id)){ found.add(b.id); store.set('bones',[...found]); $('#boneList').innerHTML+=`<span class="chip done">${b.bone}</span>`; if(found.size===BONES.length){ award(); ok(); sceneTimeout(()=>speak('عرفت العظام الكبرى الست. أحسنت!'),1500); } } }; }); speak(tx('المس{|ي} كل منطقة لتعرف العظم الكبير فيها.')); } };

/* ===== 3. الحماية: لعبة المطابقة عظم ↔ عضو ===== */
const PAIRS=[['الجمجمة','الدماغ'],['القفص الصدري','القلب والرئتان'],['العمود الفقري','الحبل الشوكي']];
const protect = { id:'E2', render(){ need(); return `<div class="scene">${sayNar(E('E2').text)}<h2>طابق{|ي}: المس{|ي} العظم ثم العضو الذي يحميه</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div>${shuffle(PAIRS).map(p=>`<button class="opt" data-b="${p[0]}">🦴 ${p[0]}</button>`).join('')}</div><div>${shuffle(PAIRS).map(p=>`<button class="opt" data-o="${p[1]}">${p[1]}</button>`).join('')}</div></div><div class="fb" id="fb"></div></div>`; },
  after(){ let sel=null, done=0, wrong=0, first=true; $$('[data-b]').forEach(b=>b.onclick=()=>{ if(b.classList.contains('ok')) return; $$('[data-b]').forEach(x=>x.classList.remove('dim')); sel=b; b.classList.add('dim'); speak(b.dataset.b); });
    $$('[data-o]').forEach(o=>o.onclick=()=>{ if(!sel||o.classList.contains('ok')) return; const right=PAIRS.some(p=>p[0]===sel.dataset.b&&p[1]===o.dataset.o); if(first){ mark('U02.L01.P1',right); first=false; }
      if(right){ sel.classList.remove('dim'); sel.classList.add('ok'); o.classList.add('ok'); $('#fb').className='fb ok'; $('#fb').textContent=`${sel.dataset.b} يحمي ${o.dataset.o}.`; speak($('#fb').textContent); sel=null; if(++done===3){ award(); ok(); } }
      else { wrong++; noteMiss(); $('#fb').className='fb bad'; $('#fb').textContent='ليس هذا. أين يقع هذا العظم؟ وما العضو الذي داخله؟'; speak($('#fb').textContent); } }); speak(tx(E('E2').text)); } };

/* ===== 4. عدّ{|ي} عظام الأصابع (بعد E3) ===== */
/* ===== هيكل اليد: عظام اليد من Servier Medical Art (CC BY 4.0)؛ السلاميات الأربع عشرة مناطق لمس تُعدّ، وعظام الكف الخمس والرسغ الثماني ظاهرة تحتها ===== */
const handSVG = () => `<svg viewBox="0 0 358 572" role="img" aria-label="عظام اليد" style="width:min(320px,100%);display:block;margin:0 auto"><g transform="rotate(180 179 286)"><image href="img/sv-hand-bones.webp" x="0" y="0" width="358" height="572" preserveAspectRatio="none"/><rect class="seg" data-f="0" data-k="0" x="31.5" y="310.0" width="30" height="95.0" rx="15" transform="rotate(1.8 46.5 357.5)" fill="#FFC93C" fill-opacity="0" stroke="#D9A623" stroke-opacity="0" stroke-width="2" style="cursor:pointer"/><rect class="seg" data-f="0" data-k="1" x="28.5" y="410.0" width="30" height="60.1" rx="15" transform="rotate(2.9 43.5 440.0)" fill="#FFC93C" fill-opacity="0" stroke="#D9A623" stroke-opacity="0" stroke-width="2" style="cursor:pointer"/><rect class="seg" data-f="0" data-k="2" x="27.0" y="472.0" width="30" height="38.0" rx="15" transform="rotate(0.0 42.0 491.0)" fill="#FFC93C" fill-opacity="0" stroke="#D9A623" stroke-opacity="0" stroke-width="2" style="cursor:pointer"/><rect class="seg" data-f="1" data-k="0" x="79.0" y="329.9" width="32" height="92.2" rx="16" transform="rotate(-3.7 95.0 376.0)" fill="#FFC93C" fill-opacity="0" stroke="#D9A623" stroke-opacity="0" stroke-width="2" style="cursor:pointer"/><rect class="seg" data-f="1" data-k="1" x="83.0" y="425.0" width="32" height="70.0" rx="16" transform="rotate(-1.6 99.0 460.0)" fill="#FFC93C" fill-opacity="0" stroke="#D9A623" stroke-opacity="0" stroke-width="2" style="cursor:pointer"/><rect class="seg" data-f="1" data-k="2" x="85.0" y="497.0" width="32" height="51.0" rx="16" transform="rotate(-2.2 101.0 522.5)" fill="#FFC93C" fill-opacity="0" stroke="#D9A623" stroke-opacity="0" stroke-width="2" style="cursor:pointer"/><rect class="seg" data-f="2" data-k="0" x="133.0" y="324.0" width="34" height="104.9" rx="17" transform="rotate(-11.0 150.0 376.5)" fill="#FFC93C" fill-opacity="0" stroke="#D9A623" stroke-opacity="0" stroke-width="2" style="cursor:pointer"/><rect class="seg" data-f="2" data-k="1" x="147.0" y="429.8" width="34" height="80.4" rx="17" transform="rotate(-5.7 164.0 470.0)" fill="#FFC93C" fill-opacity="0" stroke="#D9A623" stroke-opacity="0" stroke-width="2" style="cursor:pointer"/><rect class="seg" data-f="2" data-k="2" x="153.0" y="511.9" width="34" height="56.1" rx="17" transform="rotate(-4.1 170.0 540.0)" fill="#FFC93C" fill-opacity="0" stroke="#D9A623" stroke-opacity="0" stroke-width="2" style="cursor:pointer"/><rect class="seg" data-f="3" data-k="0" x="195.0" y="304.0" width="34" height="102.0" rx="17" transform="rotate(-11.3 212.0 355.0)" fill="#FFC93C" fill-opacity="0" stroke="#D9A623" stroke-opacity="0" stroke-width="2" style="cursor:pointer"/><rect class="seg" data-f="3" data-k="1" x="210.0" y="407.6" width="34" height="70.7" rx="17" transform="rotate(-8.1 227.0 443.0)" fill="#FFC93C" fill-opacity="0" stroke="#D9A623" stroke-opacity="0" stroke-width="2" style="cursor:pointer"/><rect class="seg" data-f="3" data-k="2" x="219.0" y="479.7" width="34" height="50.6" rx="17" transform="rotate(-9.1 236.0 505.0)" fill="#FFC93C" fill-opacity="0" stroke="#D9A623" stroke-opacity="0" stroke-width="2" style="cursor:pointer"/><rect class="seg" data-f="4" data-k="0" x="282.0" y="218.0" width="36" height="85.9" rx="18" transform="rotate(-24.8 300.0 261.0)" fill="#FFC93C" fill-opacity="0" stroke="#D9A623" stroke-opacity="0" stroke-width="2" style="cursor:pointer"/><rect class="seg" data-f="4" data-k="1" x="313.5" y="298.1" width="36" height="50.8" rx="18" transform="rotate(-32.1 331.5 323.5)" fill="#FFC93C" fill-opacity="0" stroke="#D9A623" stroke-opacity="0" stroke-width="2" style="cursor:pointer"/></g></svg>`;

/* ===== عظمة الفخذ مفتوحة، من Servier Medical Art (CC BY 4.0): طرف إسفنجي، جدار صلب، تجويف فيه النخاع والأوعية. كل زر يحيط جزأه بحلقة ===== */
const boneSVG = () => `<svg viewBox="0 0 400 230" role="img" aria-label="عظمة طويلة مفتوحة" style="width:100%;max-width:420px;display:block;margin:0 auto">
    <defs><clipPath id="bone"><rect x="203.4" y="104.1" width="42.5" height="11.9" rx="5"/></clipPath></defs>
    <image href="img/sv-bone.webp" x="6" y="60" width="388" height="89.3" preserveAspectRatio="none"/>
    <g clip-path="url(#bone)"><g id="cells"></g></g>
    <g fill="none" stroke="#D9483B" stroke-width="3" stroke-linejoin="round">
      <rect class="lay" data-k="hard" opacity="0" x="237.9" y="92.1" width="66.6" height="34.4" rx="8"/>
      <rect class="lay" data-k="marrow" opacity="0" x="200.0" y="101.3" width="49.4" height="17.4" rx="8"/>
      <rect class="lay" data-k="vessels" opacity="0" x="109.3" y="101.8" width="91.8" height="23.0" rx="8"/></g>
    <text x="200" y="200" text-anchor="middle" font-size="16" fill="#7A6E66" font-family="IBM Plex Sans Arabic">المس{|ي} الطبقات: الخارج ثم الداخل</text></svg>`;

/* ===== جمجمة الرضيع من الأعلى: الدروز خطوط التحام العظام، واليافوخ فجوة لينة تنغلق ===== */
const skullSVG = () => { const zig=(x1,y1,x2,y2,n,amp)=>{ let d=`M${x1} ${y1}`; const dx=(x2-x1)/n, dy=(y2-y1)/n, L=Math.hypot(dx,dy), nx=-dy/L, ny=dx/L; for(let i=1;i<=n;i++){ const s=i%2?1:-1, mx=x1+dx*(i-.5)+nx*amp*s, my=y1+dy*(i-.5)+ny*amp*s; d+=`Q${mx.toFixed(1)} ${my.toFixed(1)} ${(x1+dx*i).toFixed(1)} ${(y1+dy*i).toFixed(1)}`; } return d; };
  return `<svg viewBox="0 0 300 226" role="img" aria-label="جمجمة من الأعلى" style="width:100%;max-width:340px;display:block;margin:0 auto">
    <path d="M140 14Q150 2 160 14Z" fill="#EBD9B4" stroke="#C9B48A" stroke-width="3" stroke-linejoin="round"/><ellipse cx="70" cy="122" rx="8" ry="16" fill="#EBD9B4" stroke="#C9B48A" stroke-width="3"/><ellipse cx="230" cy="122" rx="8" ry="16" fill="#EBD9B4" stroke="#C9B48A" stroke-width="3"/>
    <path d="M150 14C194 14 226 58 226 116C226 174 194 212 150 212C106 212 74 174 74 116C74 58 106 14 150 14Z" fill="#F3E9D2" stroke="#C9B48A" stroke-width="4"/>
    <path d="M96 60C120 34 180 34 204 60" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="6" stroke-linecap="round"/>
    <g id="sut" stroke="#8A6D1F" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="${zig(82,92,150,78,12,2.2)}"/><path d="${zig(150,78,218,92,12,2.2)}"/><path d="${zig(150,78,150,176,16,2.2)}"/><path d="${zig(150,176,100,200,9,2.2)}"/><path d="${zig(150,176,200,200,9,2.2)}"/></g>
    <path id="font" d="M150 54L168 78L150 104L132 78Z" fill="#E8C9A0" stroke="#8A6D1F" stroke-width="2" stroke-linejoin="round" style="transform-origin:150px 78px;transform-box:view-box"/>
    <text x="150" y="224" text-anchor="middle" font-size="12" fill="#7A6E66" font-family="IBM Plex Sans Arabic">الجمجمة من الأعلى — الوجه إلى أعلى الرسم</text></svg>`; };

const fingers = { id:'fingers', render(){ need(); return `<div class="scene"><h2>كم عظمة في أصابع يدك{|ِ}؟ المس{|ي} كل قطعة من كل إصبع لتعدّها</h2><p class="note">كل قطعة مفصولة بمفصل = عظمة. الإبهام قطعتان، وبقية الأصابع ثلاث.</p>
  ${handSVG()}<div class="big" id="cnt">0</div><div class="fb" id="fb"></div></div>`; },
  after(){ let n=0; $$('.seg').forEach(s=>s.onclick=()=>{ if(s.dataset.d) return; s.dataset.d=1; s.setAttribute('fill-opacity',.6); s.setAttribute('stroke-opacity',1); n++; $('#cnt').textContent=n; speak(String(n)); if(n===14){ $('#fb').className='fb ok'; $('#fb').innerHTML='<b>14</b> عظمة في الأصابع! {أضف|أضيفي} 5 عظام في الكف و8 في الرسغ = <b>27</b> عظمة في يد واحدة. وفي يديك وقدميك معاً 106: أكثر من نصف هيكلك!'; speak('أربع عشرة عظمة في الأصابع. {أضف|أضيفي} خمساً في الكف وثماني في الرسغ: سبعاً وعشرين عظمة في يد واحدة.'); award(); ok(); } }); speak(tx('كم عظمة في أصابع يدك؟ المس{|ي} كل قطعة لتعدها.')); } };

/* ===== 5. العظم حي: طبقات مقطع العظم ===== */
const LAYERS=[{k:'hard',ar:'الطبقة الصلبة',t:'من الخارج: صلبة كالخوذة، تحمل وزنك.',c:'#F3E9D2'},{k:'marrow',ar:'نخاع العظم',t:'نسيج طري في الداخل: مصنع يصنع خلايا الدم كل ثانية.',c:'#E8707A'},{k:'vessels',ar:'الأوعية والأعصاب',t:'دم يدخل ويخرج، وأعصاب تحسّ؛ لذلك الكسر ينزف ويؤلم… ثم يلتئم.',c:'#C0392B'}];
const living = { id:'E4', render(){ need(); return `<div class="scene"><h2>انظر{|ي} داخل العظم: المس{|ي} كل طبقة</h2>
  ${boneSVG()}
  <div class="row" style="justify-content:center">${LAYERS.map(l=>`<button class="opt" style="width:auto;margin:4px;border-right:8px solid ${l.c}" data-k="${l.k}">${l.ar}</button>`).join('')}</div>
  <div class="fb ok" id="fb" hidden></div><div id="txt" hidden>${sayNar(E('E4').text)}</div></div>`; },
  after(){ const seen=new Set(); let timer=null; $$('.opt[data-k]').forEach(b=>b.onclick=()=>{ const l=LAYERS.find(x=>x.k===b.dataset.k); $$('.lay').forEach(x=>{ if(x.dataset.k===l.k) x.setAttribute('opacity',1); }); b.classList.add('ok'); $('#fb').hidden=false; $('#fb').innerHTML=`<b>${l.ar}:</b> ${l.t}`; speak(l.ar+'. '+l.t); seen.add(l.k);
      if(l.k==='marrow' && !timer){ timer=sceneInterval(()=>{ const g=$('#cells'); if(!g){ clearInterval(timer); return; } if(g.children.length>40) g.removeChild(g.firstChild); const c=document.createElementNS('http://www.w3.org/2000/svg','circle'); c.setAttribute('cx',203.4+Math.random()*42.5); c.setAttribute('cy',104.1+Math.random()*11.9); c.setAttribute('r',2.2); c.setAttribute('fill','#B22222'); g.appendChild(c); },120); }
      if(seen.size===3){ $('#txt').hidden=false; award(); ok(); } }); speak(tx('انظر{|ي} داخل العظم: المس{|ي} كل طبقة.')); } };

/* ===== 6. من 300 إلى 206: منزلق النمو (مستوى ب) ===== */
const grow = { id:'E5', render(){ ok(); if(level!=='B') return null; return `<div class="scene"><h2>اسحب{|ي} من الرضيع إلى البالغ وراقب{|ي} عدد العظام</h2>
  ${skullSVG()}
  <input type="range" id="age" min="0" max="18" value="0" style="width:100%"><div class="row" style="justify-content:space-between"><span class="note">رضيع</span><span class="note" id="ageTxt">0 سنة</span><span class="note">بالغ</span></div>
  <div class="big"><span id="nb">~300</span> عظمة</div>${sayNar(E('E5').text)}</div>`; },
  after(){ if(level!=='B'){ return; } const a=$('#age'); const upd=()=>{ const y=+a.value; const n=Math.round(300-(94*Math.min(y,18)/18)); $('#nb').textContent=(y<18?'~':'')+n; $('#ageTxt').textContent=y+' سنة'; /* الدروز تضيق مع التحام العظام ولا تختفي؛ واليافوخ ينغلق قبل سن الثانية */ $('#sut').setAttribute('stroke-width', Math.max(1.6,6-y*0.55)); $('#font').style.transform='scale('+Math.max(0,1-y/2)+')'; }; a.oninput=upd; upd(); speak(tx(E('E5').text)); } };

/* ===== 7. العظم يستجيب: محاكي القوة (مستوى ب) ===== */
const strength = { id:'E6', render(){ ok(); if(level!=='B') return null; return `<div class="scene"><h2>ماذا يقوّي العظم؟ جرّب{|ي}</h2>
  <div class="card"><label>حركة تحمّل العظام كل يوم (قفز، مشي، جري): <b id="mvTxt">30 دقيقة</b></label><input type="range" id="mv" min="0" max="90" value="30" style="width:100%"></div>
  <div class="card"><label>كالسيوم وفيتامين د في الطعام: </label><div class="row"><button class="opt" style="width:auto;margin:0" data-ca="1">🥛 كافٍ</button><button class="opt" style="width:auto;margin:0" data-ca="0">🍬 قليل</button></div></div>
  <div class="card"><label><input type="checkbox" id="space"> 🚀 رائد فضاء (لا وزن يحمّل العظام)</label></div>
  <div class="card"><div class="note">كثافة العظم (تقدير توضيحي لا رقم طبي):</div><div class="bar" style="height:26px"><i id="dens" style="width:50%;background:linear-gradient(90deg,#E8C9A0,#8A6D1F)"></i></div><div id="msg" class="note"></div></div>${sayNar(E('E6').text)}</div>`; },
  after(){ if(level!=='B') return; let ca=1; const upd=()=>{ const mv=+$('#mv').value; $('#mvTxt').textContent=mv+' دقيقة'; let d=30+mv*0.5+ca*20; if($('#space').checked) d-=35; d=Math.max(5,Math.min(100,d)); $('#dens').style.width=d+'%'; $('#msg').textContent = $('#space').checked ? 'بلا وزن لا يُحمَّل العظم فيضعف؛ لذلك يتمرن الرواد ساعتين يومياً بأجهزة شدّ.' : d>70 ? 'عظم قوي يُبنى الآن لعمرك كله.' : d>45 ? 'جيد؛ مزيد من القفز والمشي يقويه أكثر.' : 'العظم يضعف بقلة الحركة أو نقص الكالسيوم.'; }; $('#mv').oninput=upd; $$('[data-ca]').forEach(b=>b.onclick=()=>{ ca=+b.dataset.ca; $$('[data-ca]').forEach(x=>x.classList.toggle('ok',x===b)); upd(); }); $('#space').onchange=upd; upd(); speak(tx(E('E6').text)); } };

/* ===== 8. التجربة: أجسّ هيكلي — قائمة موجّهة ===== */
const X=LD.experiment; const FEEL=[['🙆','الجمجمة','يدك فوق رأسك: صلب. حرّك{|ي} فكك: العظم الوحيد المتحرك في الجمجمة.'],['🫳','الترقوة','تحت العنق من الأمام: عظم أفقي من القص إلى الكتف.'],['🫁','الأضلاع','يداك على جانبي صدرك ونفس عميق: تتحرك.'],['🦵','الرضفة','اجلس{|ي} وأرخِ ساقك: عظمة فوق الركبة تتحرك قليلاً.']];
const exp = { id:'exp', render(){ need(); const d=store.get('felt',[]); const fc=store.get('fingerCount',''); return `<div class="scene"><h2>تجربة: ${tx(X.title)}</h2><div class="card" style="background:#FFF3D6"><b>السلامة:</b> ${X.safety.map(tx).join(' ')}</div>
  ${FEEL.map((f,i)=>`<label class="opt" style="display:flex;gap:10px;align-items:center;${d.includes(i)?'border-color:var(--ok);background:#E8F7EC':''}"><input type="checkbox" data-f="${i}" ${d.includes(i)?'checked':''}><span style="font-size:1.6rem">${f[0]}</span><span><b>${f[1]}</b><br><span class="note">${f[2]}</span></span></label>`).join('')}
  <div class="card"><b>عدّ{|ي} عظام أصابع يدك{|ِ} الخمس على يدك{|ِ} فعلاً:</b> <input type="number" id="fc" min="1" max="30" value="${htmlText(fc)}" style="width:90px;font:inherit;padding:8px;border:2px solid var(--line);border-radius:12px;text-align:center"> عظمة <div class="fb" id="fb"></div></div></div>`; },
  after(){ const chk=()=>{ const d=$$('[data-f]').filter(c=>c.checked).map(c=>+c.dataset.f); store.set('felt',d); const n=+$('#fc').value; store.set('fingerCount',$('#fc').value); if(n){ $('#fb').className='fb '+(n===14?'ok':'bad'); $('#fb').textContent = n===14 ? 'صحيح: 14 (4×3 + 2 للإبهام).' : 'عدّ{|ي} من جديد: كل إصبع ثلاث قطع والإبهام قطعتان. عظم الكف ليس من الإصبع.'; } if(d.length===4 && n===14){ award(); ok(); } }; $$('[data-f]').forEach(c=>c.onchange=chk); $('#fc').oninput=chk; chk(); speak(tx('تجربة: '+X.title+'. '+FEEL.map(f=>f[1]+': '+f[2]).join(' '))); } };

/* مشهد يعود null حين لا ينطبق المستوى → نُسقطه */
/* مشهد للمستوى ب وحده: يُتخطّى في المستوى أ بدل شاشة فارغة */
const nz = sc => ({ ...sc, skip: () => level !== 'B' });

window.CUSTOM = {
  replace: { hook, E2: protect, E4: living, E5: nz(grow), E6: nz(strength), exp },
  after: { E1: [explorer], E3: [fingers] },
  drop: ['U02.L01.P1'],   // لعبة المطابقة تسجّل P1
};
})();

