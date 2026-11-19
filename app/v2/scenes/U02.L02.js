/* تأليف خاص — U02.L02 «المفاصل: حيث تلتقي العظام» */
(() => {
const E = id => LD.explain.find(e => e.id === id);
/* ===== أدوات رسم العظام: كل شكل يُرسم مرتين (حدّ ثم لون) فتلتحم الأجزاء في عظمة واحدة ===== */
const BONE={fill:'#FBF4DF',line:'#B9A372'};
const bones=(items,{fill=BONE.fill,line=BONE.line}={})=>{ const pass=(c,extra)=>items.map(it=>it[0]==='L'?`<path d="M${it[1]} ${it[2]}L${it[3]} ${it[4]}" stroke="${c}" stroke-width="${it[5]+extra}" stroke-linecap="round" fill="none"/>`:it[0]==='C'?`<ellipse cx="${it[1]}" cy="${it[2]}" rx="${it[3]+extra/2}" ry="${(it[4]||it[3])+extra/2}" fill="${c}"/>`:it[0]==='R'?`<path d="${it[1]}" stroke="${c}" stroke-width="${it[2]+extra}" stroke-linecap="round" fill="none"/>`:`<path d="${it[1]}" fill="${c}" stroke="${c}" stroke-width="${extra}" stroke-linejoin="round"/>`).join(''); return pass(line,3.2)+pass(fill,0); };
/* هيكل عظمي أمامي بمفاصل تُلمس. الرسم من Servier Medical Art (CC BY 4.0) بخلفية شفافة؛ المفاصل المعلَّمة على يمين الهيكل، أي يسار الصورة */
const JOINTS=[{k:'shoulder',ar:'الكتف',x:82,y:148,type:'ball'},{k:'elbow',ar:'المرفق',x:61,y:276,type:'hinge'},{k:'wrist',ar:'الرسغ',x:36,y:380,type:'other'},{k:'hip',ar:'الورك',x:114,y:356,type:'ball'},{k:'knee',ar:'الركبة',x:126,y:531,type:'hinge'},{k:'ankle',ar:'الكاحل',x:136,y:704,type:'other'},{k:'skull',ar:'عظام الجمجمة (ملتحمة)',x:157,y:24,type:'fixed'}];
const figure = (ids) => `<svg viewBox="0 0 314.5 748.5" role="img" aria-label="هيكل عظمي ومفاصله" style="width:min(270px,100%);display:block;margin:0 auto" id="fig"><image href="img/sv-skeleton.webp" x="0" y="0" width="314.5" height="748.5" preserveAspectRatio="none"/>
  ${JOINTS.filter(j=>!ids||ids.includes(j.k)).map(j=>`<g class="jt" data-k="${j.k}" data-ar="${j.ar}" aria-label="${j.ar}" style="cursor:pointer"><circle cx="${j.x}" cy="${j.y}" r="20" fill="#FFC93C" fill-opacity=".45" stroke="#D9A623" stroke-width="3.5"/><circle cx="${j.x}" cy="${j.y}" r="4" fill="#D9A623" style="pointer-events:none"/></g>`).join('')}</svg>`;

/* ===== مفصل كروي: رأس مستدير في تجويف (الكتف). id: مجموعة العظم الدوّار ===== */
const ballJoint=(gid,{w=200,mark=false}={})=>`<svg viewBox="0 -38 220 226" style="width:${w}px;max-width:100%;display:block;margin:auto">
  ${bones([['P','M28 20C52 14 78 26 84 48C70 46 58 56 56 75C58 94 70 104 84 102C78 124 52 136 28 130C16 100 16 50 28 20Z']])}
  <path d="M84 48C68 50 60 62 60 75C60 88 68 100 84 102" fill="none" stroke="#9CC9E8" stroke-width="5" stroke-linecap="round"/>
  <g id="${gid}" style="transform-origin:86px 75px;transform-box:view-box">${bones([['L',92,75,186,75,15],['C',86,75,23],['C',190,75,11,13]])}<path d="M72 66A16 16 0 0 1 86 56" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>${mark?'<ellipse id="mk" cx="150" cy="75" rx="5" ry="7" fill="#7A4E00"/>':''}</g></svg>`;
/* ===== مفصل رزّي: بكرة تدور حول محور واحد (المرفق والركبة). الثابت يساراً، والدوّار id ===== */
const hingeJoint=(gid,{w=200,pin=true}={})=>`<svg viewBox="0 -34 220 150" style="width:${w}px;max-width:100%;display:block;margin:auto">
  <g id="${gid}" style="transform-origin:104px 75px;transform-box:view-box">${bones([['L',118,75,196,75,14],['C',200,75,10,12],['P','M104 51C120 51 130 62 130 75C130 88 120 99 104 99C112 92 114 84 114 75C114 66 112 58 104 51Z']])}</g>
  ${bones([['L',22,75,96,75,15],['C',18,75,11,13],['C',104,75,17]])}
  <circle cx="104" cy="75" r="17" fill="none" stroke="#9CC9E8" stroke-width="3.5" stroke-dasharray="26 81" stroke-dashoffset="13"/>
  ${pin?'<circle cx="104" cy="75" r="4.5" fill="#D9A623" stroke="#A67C12" stroke-width="1.5"/>':''}</svg>`;
/* ===== مفاصل حقيقية متحركة: قطع من رسوم Servier Medical Art (CC BY 4.0) فُصلت عظمةً عظمة وتدور حول مركز المفصل المقيس من الرسم نفسه ===== */
/* المرفق (مقطع جانبي): العضد ثابت، والزند والكعبرة يدوران حول مركز بكرة العضد. 0 = ممدود، والسالب ثني (كالرسم التخطيطي) */
const realHinge=(gid,{w=230}={})=>`<svg viewBox="-290 240 1230 1190" role="img" aria-label="مقطع في المرفق: طرف العضد المستدير يدور في تجويف الزند" style="width:${w}px;max-width:100%;display:block;margin:auto">
  <circle cx="241" cy="734" r="150" fill="#8E1238"/>
  <g id="${gid}" style="transform-origin:241px 734px;transform-box:view-box"><image href="img/sv-elbow-b.webp" x="0" y="0" width="1100" height="1240" transform="rotate(90 241 734)"/></g>
  <image href="img/sv-elbow-a.webp" x="0" y="0" width="1100" height="1240"/></svg>`;
/* الورك: الحوض ثابت ورأس الفخذ الكروي في تجويفه؛ الفخذ يدور حول مركز الرأس */
const realBall=(gid,{w=230,mark=false}={})=>`<svg viewBox="0 0 1200 1420" role="img" aria-label="مفصل الورك: رأس عظم الفخذ الكروي في تجويف الحوض" style="width:${w}px;max-width:100%;display:block;margin:auto">
  <image href="img/sv-hip-pelvis.webp" x="0" y="0" width="870" height="1323"/>
  <g id="${gid}" style="transform-origin:549px 865px;transform-box:view-box"><image href="img/sv-hip-femur.webp" x="184" y="96" width="900" height="1300"/>${mark?'<ellipse id="mk" cx="479" cy="1240" rx="20" ry="26" fill="#7A4E00"/>':''}</g></svg>`;
/* ===== الركبة من الجانب (مقطع): عظم الفخذ ثابت، والساق بهلالَيها تدور حول مركز لقمة الفخذ، والرضفة تنزلق معها لأن رباطها لا يتمدد. setKnee يحرّكها ===== */
const KC=[235,725];
const kneeSVG=()=>`<svg id="knee" viewBox="-390 330 1010 1040" role="img" aria-label="مقطع جانبي في الركبة: عظم الفخذ والساق والرضفة والأربطة" style="width:270px;max-width:100%;display:block;margin:auto">
  <g id="kn" style="transform-origin:${KC[0]}px ${KC[1]}px;transform-box:view-box"><image href="img/sv-knee-t.webp" x="0" y="0" width="590" height="1461"/></g>
  <image href="img/sv-knee-f.webp" x="0" y="0" width="590" height="1461"/>
  <g fill="none" stroke-linecap="round" stroke-linejoin="round"><path class="qt" stroke="#AEB9BF" stroke-width="20"/></g>
  <g id="kp" style="transform-origin:${KC[0]}px ${KC[1]}px;transform-box:view-box"><image href="img/sv-knee-p.webp" x="0" y="0" width="590" height="1461"/></g>
  <g id="lig" fill="none" stroke="#2BB3A3" stroke-width="16" stroke-linecap="round"><path class="l1"/><path class="l2"/></g></svg>`;
/* نصف قطر السطح الأمامي لعظم الفخذ من مركز اللقمة، كل 5° من ‎-75° (مقيس من الرسم): عليه يلتف وتر العضلة */
const KFR=[312,286,269,255,247,242,243,241,239,236,231,227,223,219,216,212,210,207,204,202,199,197,195,192,190,188,186,185,184,184,183,184,185,187];
function setKnee(deg, over){ const s=document.getElementById('knee'); if(!s) return; const th=deg*.7, ph=th*.85; /* الزاوية المرسومة أقل من المنزلق حتى لا تتداخل العظمتان في المقطع */
  const R=(p,d)=>{ const r=d*Math.PI/180, c=Math.cos(r), sn=Math.sin(r), x=p[0]-KC[0], y=p[1]-KC[1]; return [KC[0]+x*c-y*sn, KC[1]+x*sn+y*c]; }, f=p=>p[0].toFixed(1)+' '+p[1].toFixed(1);
  s.querySelector('#kn').style.transform=`rotate(${th}deg)`; s.querySelector('#kp').style.transform=`rotate(${ph}deg)`; const col=over?'#D9483B':'#2BB3A3';
  /* رباط الرضفة: من قطبها السفلي إلى مقدمة الساق؛ والرباط الجانبي قرب محور الدوران فطوله شبه ثابت */
  s.querySelector('.l1').setAttribute('d',`M${f(R([505,742],ph))}L${f(R([478,1100],th))}`); s.querySelector('.l2').setAttribute('d',`M${KC[0]} ${KC[1]}L${f(R([225,1050],th))}`);
  /* وتر العضلة فوق الرضفة: يلتف على مقدمة اللقمة كلما نزلت الرضفة */
  const top=R([470,494],ph), a1=-43.4+ph; let d=''; for(let a=-75; a<a1-6; a+=5){ const i=(a+75)/5, rr=KFR[Math.min(KFR.length-1,Math.round(i))]+13, q=a*Math.PI/180; d+=(d?'L':'M')+`${(KC[0]+rr*Math.cos(q)).toFixed(1)} ${(KC[1]+rr*Math.sin(q)).toFixed(1)}`; } d+='L'+f(top); s.querySelector('.qt').setAttribute('d',d);
  s.querySelectorAll('#lig path').forEach(p=>p.setAttribute('stroke',col)); }

/* 1. الجذب: جرّب{|ي} الكتف ثم المرفق */
const hook={ id:'hook', render(){ need(); return `<div class="scene"><h2>${tx(LD.hook.text)}</h2>
  <div class="card"><b>الكتف</b> — {أدر|أديري}: <input type="range" id="sh" min="0" max="360" value="0" style="width:100%">${ballJoint('arm1',{w:170})}</div>
  <div class="card"><b>المرفق</b> — اثنِ{|ي}: <input type="range" id="el" min="0" max="360" value="0" style="width:100%">${hingeJoint('arm2',{w:170})}<div class="note" id="elMsg"></div></div>
  ${LD.hook.options.map((o,i)=>`<button class="opt" data-i="${i}">${tx(o)}</button>`).join('')}<div class="fb" id="fb"></div></div>`; },
  after(){ $('#sh').oninput=e=>{ $('#arm1').style.transform=`rotate(${-e.target.value}deg)`; }; $('#el').oninput=e=>{ const v=Math.min(+e.target.value,145); $('#arm2').style.transform=`rotate(${-v}deg)`; $('#elMsg').textContent = +e.target.value>145 ? 'توقّف! المرفق لا يدور أكثر من هذا — ينثني ويمتد فقط.' : ''; };
    $$('.opt[data-i]').forEach(b=>b.onclick=()=>{ $$('.opt[data-i]').forEach(x=>x.classList.add('dim')); b.classList.remove('dim'); b.classList.add('ok'); $('#fb').className='fb ok'; $('#fb').textContent='توقّع جميل. الجواب في شكل المفصل نفسه — لنرَ.'; speak($('#fb').textContent); ok(); }); speak(tx(LD.hook.text)); } };

/* 2. مستكشف المفاصل (بعد E1): المس{|ي} كل مفصل */
const explorer={ id:'explorer', render(){ need(); const f=store.get('joints',[]).filter(k=>JOINTS.some(j=>j.k===k)); return `<div class="scene"><h2>المس{|ي} كل مفصل على الهيكل وجده على جسمك{|ِ} (${f.length}/${JOINTS.length})</h2>${figure()}<div class="fb ok" id="fb" hidden></div><div class="row" id="list">${f.map(k=>`<span class="chip done">${JOINTS.find(j=>j.k===k).ar}</span>`).join('')}</div></div>`; },
  after(){ const f=new Set(store.get('joints',[]).filter(k=>JOINTS.some(j=>j.k===k))); if(f.size===JOINTS.length) ok(); $$('.jt').forEach(j=>j.onclick=()=>{ j.querySelector('circle').setAttribute('fill','#9BD77A'); $('#fb').hidden=false; $('#fb').textContent=j.dataset.ar; speak(j.dataset.ar+'. حرّكه على جسمك الآن.'); if(!f.has(j.dataset.k)){ f.add(j.dataset.k); store.set('joints',[...f]); $('#list').innerHTML+=`<span class="chip done">${j.dataset.ar}</span>`; if(f.size===JOINTS.length){ award(); ok(); } } }); speak(tx('المس{|ي} كل مفصل على الهيكل وجده على جسمك.')); } };

/* 3. محاكي نوعي المفصل (يحل محل E2 وE3) */
const sim={ id:'E2', render(){ need(); return `<div class="scene"><h2>جرّب{|ي} النوعين بيدك{|ِ}</h2>
  <div class="card"><b>مفصل رزّي (كالباب) — المرفق والركبة</b>${realHinge('h2')}<input type="range" id="hg" min="0" max="140" value="0" style="width:100%"><div class="note">هذا مرفق حقيقي في مقطع جانبي: طرف العضد المستدير يدور في تجويف يحتضنه. اتجاه واحد فقط: ينثني ويمتد.</div></div>
  <div class="card"><b>مفصل كروي — الكتف والورك</b>${realBall('b2',{mark:true})}<div class="note">هذا مفصل الورك: رأس عظم الفخذ كرة في تجويف الحوض.</div><div class="row"><span class="note">ارفع{|ي}</span><input type="range" id="ba" min="-20" max="100" value="0" style="flex:1"></div><div class="row"><span class="note">دوّر{|ي}</span><input type="range" id="br" min="0" max="360" value="0" style="flex:1"></div><div class="note">كل الاتجاهات، ودوران حول محور العظم (راقب{|ي} العلامة).</div></div>
  ${sayNar(E('E2').text)}${sayNar(E('E3').text)}<p class="note">حرّك{|ي} المنزلقات الثلاثة ثم تابع{|ي}.</p></div>`; },
  after(){ const used=new Set(); const chk=k=>{ used.add(k); if(used.size===3) ok(); }; $('#hg').oninput=e=>{ $('#h2').style.transform=`rotate(${-e.target.value}deg)`; chk('h'); }; /* الدوران حول محور العظم: الذراع لا تقصر؛ العلامة على سطحها تلتف حوله (تختفي خلفه وتعود) */
  const b=()=>{ $('#b2').style.transform=`rotate(${-$('#ba').value}deg)`; const t=$('#br').value*Math.PI/180, mk=$('#mk'); mk.setAttribute('cx', 479+62*Math.sin(t)); mk.setAttribute('rx', 5+15*Math.abs(Math.cos(t))); mk.style.opacity=Math.cos(t)>=0?1:.25; }; $('#ba').oninput=()=>{b();chk('a')}; $('#br').oninput=()=>{b();chk('r')}; speak(tx(E('E2').text+' '+E('E3').text)); } };

/* 4. P1/C1: تحديد مفصل على الهيكل */
const locate=(id,k,prompt,wrong)=>({ id, render(){ need(); return `<div class="scene"><h2>${tx(prompt)}</h2>${figure()}<div class="fb" id="fb"></div></div>`; },
  after(){ let first=true; $$('.jt').forEach(j=>j.onclick=()=>{ const right=j.dataset.k===k; const wasFirst=first; if(first){ mark(id,right); first=false; } if(right){ j.querySelector('circle').setAttribute('fill','#9BD77A'); $('#fb').className='fb ok'; $('#fb').textContent=(wasFirst?'أحسنت! ':'صحيح الآن. ')+'هذا '+j.dataset.ar+'.'; award(); ok(); } else { noteMiss(); $('#fb').className='fb bad'; $('#fb').textContent='هذا '+j.dataset.ar+'. '+tx(wrong); } speak($('#fb').textContent); }); speak(tx(prompt)); } });

/* 5. الأربطة: لعبة المدى الآمن (تحل محل E4) */
const range={ id:'E4', render(){ need(); return `<div class="scene"><h2>الركبة: أي حركة آمنة، وأي حركة تمزّق الأربطة؟</h2>
  ${kneeSVG()}
  <p class="note">اثنِ{|ي} الركبة بالمنزلق إلى آخرها، ثم جرّب{|ي} الحركات الثلاث التي لا تصنعها الركبة.</p><input type="range" id="kg" min="0" max="150" value="0" style="width:100%" aria-label="ثني الركبة">
  <div class="row" style="justify-content:center;flex-wrap:wrap"><button class="opt" style="width:auto;margin:4px" type="button" data-bad="hyper">↩ مدّ أبعد من الاستقامة</button><button class="opt" style="width:auto;margin:4px" type="button" data-bad="side">↔ ثني إلى الجانب</button><button class="opt" style="width:auto;margin:4px" type="button" data-bad="twist">⟲ لفّ والقدم ثابتة</button></div>
  <svg id="kfront" viewBox="0 0 160 200" role="img" aria-label="الساق من الأمام" style="width:130px;display:block;margin:4px auto" hidden><rect x="58" y="6" width="44" height="88" rx="20" fill="#F3E3C3" stroke="#B89A5C" stroke-width="3"/><g id="kshin" style="transform-origin:80px 100px;transition:transform .5s"><rect x="62" y="104" width="36" height="86" rx="16" fill="#F3E3C3" stroke="#B89A5C" stroke-width="3"/><path id="ktw" d="M48 150 A34 12 0 1 0 112 150" fill="none" stroke="#D9483B" stroke-width="4" marker-end="url(#ka)" opacity="0"/></g><line id="kl1" x1="58" y1="84" x2="62" y2="118" stroke="#2BB3A3" stroke-width="6" stroke-linecap="round"/><line id="kl2" x1="102" y1="84" x2="98" y2="118" stroke="#2BB3A3" stroke-width="6" stroke-linecap="round"/><defs><marker id="ka" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0 0L8 4L0 8z" fill="#D9483B"/></marker></defs></svg>
  <div class="fb" id="fb"></div><div class="card"><b>الركبة الحقيقية من الجانب (مقطع)</b><svg viewBox="-340 0 1200 1090" role="img" aria-label="مقطع في الركبة" style="width:min(320px,100%);display:block;margin:6px auto"><image href="img/sv-knee.webp" x="0" y="0" width="440" height="1090"/><path d="M-30 380L150 470" stroke="#6b5a2a" stroke-width="3"/><circle cx="150" cy="470" r="7" fill="#6b5a2a"/><text x="-40" y="395" text-anchor="start" font-size="50" fill="#3a2f14" font-family="inherit">عظم الفخذ</text><path d="M-30 930L170 900" stroke="#6b5a2a" stroke-width="3"/><circle cx="170" cy="900" r="7" fill="#6b5a2a"/><text x="-40" y="945" text-anchor="start" font-size="50" fill="#3a2f14" font-family="inherit">عظم الساق</text><path d="M470 540L186 650" stroke="#6b5a2a" stroke-width="3"/><circle cx="186" cy="650" r="7" fill="#6b5a2a"/><text x="480" y="535" text-anchor="end" font-size="50" fill="#3a2f14" font-family="inherit">غضروف أملس</text><path d="M470 720L190 700" stroke="#6b5a2a" stroke-width="3"/><circle cx="190" cy="700" r="7" fill="#6b5a2a"/><text x="480" y="735" text-anchor="end" font-size="50" fill="#3a2f14" font-family="inherit"><tspan x="480">سائل زلق:</tspan><tspan x="480" dy="54">طبقة رقيقة</tspan></text><path d="M470 900L392 840" stroke="#6b5a2a" stroke-width="3"/><circle cx="392" cy="840" r="7" fill="#6b5a2a"/><text x="480" y="915" text-anchor="end" font-size="50" fill="#3a2f14" font-family="inherit">رباط</text></svg></div>${sayNar(E('E4').text)}</div>`; },
  after(){ let deep=false; const tried=new Set(); setKnee(0,false);
    const front=(mode)=>{ const sv=$('#kfront'); if(!sv) return; sv.hidden=!(mode==='side'||mode==='twist'); $('#kshin').style.transform = mode==='side' ? 'rotate(-18deg)' : ''; $('#ktw').setAttribute('opacity', mode==='twist'?1:0);
      $('#kl1').setAttribute('stroke', mode==='side'||mode==='twist'?'#D9483B':'#2BB3A3'); $('#kl2').setAttribute('stroke', mode==='twist'?'#D9483B':'#2BB3A3'); };
    const check=()=>{ if(deep && tried.size){ ok(); } };
    /* الثني كله آمن، حتى الثني الكامل (الجلوس على العقبين في الصلاة وضع يومي) */
    $('#kg').oninput=e=>{ const v=+e.target.value; setKnee(v,false); front(null); $$('[data-bad]').forEach(x=>x.classList.remove('bad'));
      if(v>=140){ deep=true; fb('ok','ثني كامل، وهو آمن: هكذا {تجلس|تجلسين} على عقبيك{|ِ} في الصلاة. الأربطة (الخضراء) تمسك العظمتين في كل الثني، والغضروف الأملس يمنع الاحتكاك.'); }
      else if(v>=10) { const f=$('#fb'); f.className='fb ok'; f.textContent='حركة آمنة: الركبة تنثني وتمتد في اتجاه واحد.'; }
      check(); };
    /* الخطر في الحركة التي لا تصنعها الركبة: المدّ بعد الاستقامة، والثني إلى الجانب، واللفّ والقدم ثابتة */
    const MSG={ hyper:'خطر! مدّ الركبة أبعد من الاستقامة يشدّ الأربطة خلفها وفي وسطها حتى تتمزق — كما يحدث في سقطة على ساق مستقيمة.',
      side:'خطر! الركبة لا تنثني إلى الجانب: الرباط الجانبي يُشدّ حتى يتمزق — كما يحدث حين تُضرب الركبة من جانبها في اللعب.',
      twist:'خطر! لفّ الركبة والقدم ثابتة على الأرض يشدّ الأربطة داخل الركبة — من أشهر إصابات الملاعب. لذلك لا نُجبر مفصلاً أبداً، لا في اللعب ولا في المزاح.' };
    $$('[data-bad]').forEach(b=>b.onclick=()=>{ const m=b.dataset.bad; tried.add(m); $$('[data-bad]').forEach(x=>x.classList.toggle('bad', x===b)); $('#kg').value=0;
      if(m==='hyper'){ setKnee(-14,true); front(null); } else { setKnee(0,true); front(m); }
      fb('bad', MSG[m]); check(); }); speak(tx(E('E4').text)); } };

/* 6. (ب) اعدّ مفاصل يدك بتعريفين — يحل محل E7 */
const defs={ id:'E7', skip:()=>level!=='B', render(){ ok(); if(level!=='B') return `<div class="scene"><div class="row" style="justify-content:center">${buddy(100,'happy')}</div>${sayBuddy('فكرة للمستوى ب: كم مفصلاً في اليد؟ يعتمد على التعريف. تستطيع{|ين} رفع مستواك{|ِ} من أول درس في الوحدة.')}</div>`;
  return `<div class="scene">${sayNar(E('E7').text)}<h2>جرّب{|ي}: كم مفصلاً في يدك{|ِ}؟</h2>
  <label class="opt" style="display:flex;gap:10px"><input type="radio" name="d" value="a" checked> التعريف 1: المفاصل التي أثنيها بوضوح</label><label class="opt" style="display:flex;gap:10px"><input type="radio" name="d" value="b"> التعريف 2: كل التقاء بين عظمتين</label>
  <div class="card"><div id="calc"></div><div class="big" id="tot"></div></div><p class="note">كلا الرقمين صحيح — بتعريفه. قبل الجدال في الرقم نتفق على التعريف.</p></div>`; },
  after(){ if(level!=='B'){ return; } const upd=()=>{ const b=$('input[name=d]:checked').value==='b'; $('#calc').innerHTML = b ? 'بين عظام الأصابع 9 + قاعدة الأصابع 5 + الرسغ 1 + وصلات عظام الرسغ الثماني بينها وبين الكف أكثر من 10' : 'بين عظام الأصابع 9 + قاعدة الأصابع 5 + الرسغ 1'; $('#tot').textContent = b ? 'أكثر من 25' : '15'; }; $$('input[name=d]').forEach(r=>r.onchange=upd); upd(); speak(tx(E('E7').text)); } };

/* 7. التجربة: جدول مسح المفاصل */
const X=LD.experiment; const ROWS=[['المرفق','hinge'],['الكتف','ball'],['الركبة','hinge'],['الورك','ball'],['الإصبع (المفصل الأوسط)','hinge'],['عظام الجمجمة','fixed']]; const T={hinge:'ينثني في اتجاه واحد',ball:'يدور في اتجاهات كثيرة',fixed:'لا يتحرك'};
const exp={ id:'exp', render(){ need(); const r=store.get('survey',{}); return `<div class="scene"><h2>تجربة: ${tx(X.title)}</h2><div class="card" style="background:#FFF3D6"><b>السلامة:</b> ${X.safety.map(tx).join(' ')}</div><p>حرّك{|ي} كل مفصل على جسمك{|ِ} فعلاً، ثم {صنّفه|صنّفيه}:</p>
  ${ROWS.map(([ar,k],i)=>`<div class="card"><b>${ar}</b><div class="row" style="margin-top:6px">${Object.entries(T).map(([t,l])=>`<button class="opt" style="width:auto;margin:2px;padding:8px 10px;font-size:.95rem ${r[i]===t?';border-color:var(--teal);background:#E6F7F4':''}" data-r="${i}" data-t="${t}">${l}</button>`).join('')}</div><div class="fb" id="f${i}"></div></div>`).join('')}</div>`; },
  after(){ const r=store.get('survey',{}); const chk=()=>{ if(ROWS.every((row,i)=>r[i]===row[1])){ award();ok();}else need();};chk(); $$('[data-r]').forEach(b=>b.onclick=()=>{ const i=+b.dataset.r; r[i]=b.dataset.t; store.set('survey',r); $$(`[data-r="${i}"]`).forEach(x=>x.classList.remove('ok')); const right=b.dataset.t===ROWS[i][1]; b.classList.add(right?'ok':'bad'); sceneTimeout(()=>b.classList.remove('bad'),800); $('#f'+i).className='fb '+(right?'ok':'bad'); $('#f'+i).textContent=right?'صحيح.':'حرّكه مرة أخرى وراقب: هل يدور أم ينثني فقط أم لا يتحرك؟'; speak($('#f'+i).textContent); chk(); }); speak(tx('تجربة: '+X.title+'. حرك{|ي} كل مفصل على جسمك فعلاً ثم صنفه.')); } };

window.CUSTOM={ replace:{ hook, E2:sim, E4:range, E7:defs, exp, 'U02.L02.P1':locate('U02.L02.P1','knee','اضغط{|ي} على مفصل الركبة.','الركبة في منتصف الرِّجل، بين الفخذ والساق.'), 'U02.L02.C1':locate('U02.L02.C1','ankle','اضغط{|ي} على مفصل الكاحل.','الكاحل حيث تلتقي الساق بالقدم.') }, after:{ E1:[explorer] }, drop:['E3'] };
})();

