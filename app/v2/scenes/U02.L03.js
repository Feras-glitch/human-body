/* تأليف خاص — U02.L03 «العضلات تسحب ولا تدفع» */
(() => {
const E = id => LD.explain.find(e => e.id === id);
/* ذراع يمنى بمنظر جانبي (الوجه إلى يمين الصورة). a: 0 ممدودة … 130 مثنية. bulk: حجم العضلة (1 عادي).
   الأمامية (ذات الرأسين): تنشأ من لوح الكتف فوق المفصل، ووترها السفلي يرتكز على عظم الكعبرة تحت المرفق.
   الخلفية (ثلاثية الرؤوس): تنشأ من لوح الكتف تحت المفصل ومن ظهر العضد، ووترها يرتكز على نتوء الزند خلف المرفق. */
const ARM={S:[120,64],E:[120,206]};
const armSVG = (id, {labels=true, max=270}={}) => `<svg id="${id}" class="armfig" viewBox="0 0 320 396" role="img" aria-label="ذراع بعضلة أمامية وعضلة خلفية" style="width:100%;max-width:${max}px;display:block;margin:auto">
  <path d="M74 0C60 44 56 130 62 396H170C182 262 184 128 162 62C152 32 144 12 142 0Z" fill="#FBEBDD"/>
  <path class="uskin" fill="#F6D3B1" stroke="#DDA47A" stroke-width="2" stroke-linejoin="round"/>
  <path d="M94 32C106 26 124 27 134 33C138 38 138 46 134 50L128 49C120 44 110 47 107 54L104 90C99 93 94 90 94 84Z" fill="#FBF4DF" stroke="#CDB98C" stroke-width="2" stroke-linejoin="round"/>
  <g stroke-linecap="round"><path d="M120 66V204" stroke="#CDB98C" stroke-width="16"/><path d="M120 66V204" stroke="#FBF4DF" stroke-width="12"/>
    <circle cx="120" cy="64" r="14" fill="#FBF4DF" stroke="#CDB98C" stroke-width="2"/><path d="M110 204H130" stroke="#CDB98C" stroke-width="20"/><path d="M110 204H130" stroke="#FBF4DF" stroke-width="16"/></g>
  <image class="tri-img" href="img/sv-muscle-1h.webp" x="-111.5" y="0" width="223" height="870" preserveAspectRatio="none"/>
  <g class="fore">
    <path d="M118 181C150 175 196 184 232 191L232 221C196 229 150 235 118 231C103 223 103 189 118 181Z" fill="#F6D3B1" stroke="#DDA47A" stroke-width="2" stroke-linejoin="round"/>
    <g class="hand" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <path d="M256 216L277 224" stroke="#DDA47A" stroke-width="13"/><path d="M256 216L277 224" stroke="#F6D3B1" stroke-width="9"/><path d="M258 212L286 219" stroke="#DDA47A" stroke-width="14"/><path d="M258 212L286 219" stroke="#F6D3B1" stroke-width="10"/><path d="M259 207L292 211" stroke="#DDA47A" stroke-width="14.5"/><path d="M259 207L292 211" stroke="#F6D3B1" stroke-width="10.5"/>
      <path d="M230 191C244 187 256 189 264 193L266 219C256 224 244 223 230 221Z" fill="#F6D3B1" stroke="#DDA47A" stroke-width="2"/>
      <path d="M260 200L295 200" stroke="#DDA47A" stroke-width="15"/><path d="M260 200L295 200" stroke="#F6D3B1" stroke-width="11"/><path d="M242 195L268 182" stroke="#DDA47A" stroke-width="16"/><path d="M242 195L268 182" stroke="#F6D3B1" stroke-width="12"/>
      <path d="M291 198.500h5M266 180l4-2" stroke="#FBEDE2" stroke-width="5"/><path d="M262 194q3 6 0 12" stroke="#DDA47A" stroke-width="1.5"/>
    </g>
    <g stroke-linecap="round"><path d="M104 216H228" stroke="#CDB98C" stroke-width="11"/><path d="M104 216H228" stroke="#FBF4DF" stroke-width="7.5"/><path d="M130 198H228" stroke="#CDB98C" stroke-width="10"/><path d="M130 198H228" stroke="#FBF4DF" stroke-width="6.5"/>
      <circle cx="146" cy="196" r="4.5" fill="#FBF4DF" stroke="#CDB98C" stroke-width="2"/></g>
  </g>
  <image class="bi-img" href="img/sv-muscle-2h.webp" x="-130" y="0" width="260" height="955" preserveAspectRatio="none"/>
  <circle cx="120" cy="206" r="5" fill="#FFD766" stroke="#D9A623" stroke-width="2"/>
  ${labels?`<g font-family="IBM Plex Sans Arabic" font-size="14.5" font-weight="600" fill="#A8322A"><text class="bi-l" x="238" y="40" text-anchor="middle">العضلة الأمامية</text><path class="bi-ll" stroke="#A8322A" stroke-width="1.5" fill="none"/><text class="tri-l" x="54" y="176" text-anchor="middle">العضلة الخلفية</text><path class="tri-ll" stroke="#A8322A" stroke-width="1.5" fill="none"/></g>`:''}
</svg>`;
function setArm(id, a, bulk=1){ const s=document.getElementById(id); if(!s) return; a=Math.max(0,Math.min(130,+a||0)); s.dataset.a=a; s.dataset.bulk=bulk;
  const k=a/130, deg=90-a, r=deg*Math.PI/180, c=Math.cos(r), sn=Math.sin(r), [ex,ey]=ARM.E, Q=s.querySelector.bind(s);
  /* الساعد مرسوم أفقياً عند المرفق ثم يُدار: نقطة (x,y) منه بعد الدوران */
  const loc=(x,y)=>[ex+(x-ex)*c-(y-ey)*sn, ey+(x-ex)*sn+(y-ey)*c];
  Q('.fore').setAttribute('transform',`rotate(${deg} ${ex} ${ey})`);
  /* عضلة من صورة: تُمدّ من المنشأ إلى المرتكز، وتثخن حين تقصر. الرسمان من Servier Medical Art (CC BY 4.0) */
  const place=(sel,P0,P1,w,iw,ih,kk)=>{ const dx=P1[0]-P0[0], dy=P1[1]-P0[1], L=Math.hypot(dx,dy), ang=Math.atan2(dy,dx)*180/Math.PI-90, el=Q(sel);
    el.setAttribute('transform',`translate(${P0[0].toFixed(1)} ${P0[1].toFixed(1)}) rotate(${ang.toFixed(2)}) scale(${(w/iw).toFixed(4)} ${(L/ih).toFixed(4)})`); el.style.filter=`saturate(${(.75+.5*kk).toFixed(2)}) brightness(${(1.1-.12*kk).toFixed(2)})`;
    const n=[-dy/L,dx/L]; return { M:[(P0[0]+P1[0])/2,(P0[1]+P1[1])/2], n, w }; };
  /* الأمامية (ذات الرأسين): من لوح الكتف فوق المفصل إلى الكعبرة تحت المرفق */
  const bins=loc(146,196), bi=place('.bi-img',[137,44],bins,(40+20*k)*bulk,260,955,k);
  /* الخلفية: من لوح الكتف تحت المفصل إلى نتوء الزند خلف المرفق */
  const tins=loc(106,216), tr=place('.tri-img',[99,80],tins,(46-14*k)*bulk,223,870,1-k);
  /* الجلد يتبع انتفاخ العضلتين */
  const front=bi.M[0]+bi.w*.5+6, back=tr.M[0]-tr.w*.5-6;
  Q('.uskin').setAttribute('d',`M84 72C74 40 100 22 124 24C150 26 164 48 156 76Q${(2*front-151).toFixed(1)} ${bi.M[1].toFixed(1)} 146 200Q120 216 96 200Q${(2*back-90).toFixed(1)} ${tr.M[1].toFixed(1)} 84 72Z`);
  if(Q('.bi-l')){ Q('.bi-l').setAttribute('opacity',.6+.4*k); Q('.tri-l').setAttribute('opacity',1-.4*k); Q('.bi-ll').setAttribute('d',`M212 46L${(bi.M[0]+bi.w*.3).toFixed(1)} ${(bi.M[1]-10).toFixed(1)}`); Q('.tri-ll').setAttribute('d',`M70 162L${(tr.M[0]-tr.w*.3).toFixed(1)} ${tr.M[1].toFixed(1)}`); } }
function animArm(id, to, {ms=560, bulk, onstep}={}){ const s=document.getElementById(id); if(!s) return; const from=+s.dataset.a||0, b0=+s.dataset.bulk||1, b1=bulk??b0; cancelAnimationFrame(s._raf||0);
  if(typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches){ setArm(id,to,b1); onstep&&onstep(to); return; }
  const t0=performance.now(); const step=t=>{ if(!document.contains(s)) return; const p=Math.min(1,(t-t0)/ms), e=p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2; const a=from+(to-from)*e; setArm(id,a,b0+(b1-b0)*e); onstep&&onstep(a); if(p<1) s._raf=requestAnimationFrame(step); }; s._raf=requestAnimationFrame(step); }

/* 1. الجذب */
const hook={ id:'hook', render(){ need(); return `<div class="scene"><h2>${tx(LD.hook.text)}</h2>${armSVG('a1')}
  <div class="row" style="justify-content:center"><button class="opt" style="width:auto" id="bend">⬅ اسحب{|ي} الأمامية</button><button class="opt" style="width:auto" id="ext">اسحب{|ي} الخلفية ➡</button><button class="opt" style="width:auto" id="push">ادفع بالأمامية</button></div><div class="fb" id="fb"></div>
  ${LD.hook.options.map((o,i)=>`<button class="opt" data-i="${i}">${tx(o)}</button>`).join('')}</div>`; },
  after(){ let a=0; setArm('a1',0); $('#bend').onclick=()=>{ a=130; animArm('a1',a); $('#fb').className='fb ok'; $('#fb').textContent='الأمامية قصرت فسحبت الساعد: انثنى.'; speak($('#fb').textContent); }; $('#ext').onclick=()=>{ a=0; animArm('a1',a); $('#fb').className='fb ok'; $('#fb').textContent='الخلفية قصرت فسحبت الساعد من الخلف: امتد.'; speak($('#fb').textContent); }; $('#push').onclick=()=>{ $('#a1').style.transform='translateX(4px)'; sceneTimeout(()=>$('#a1').style.transform='',150); $('#fb').className='fb bad'; $('#fb').textContent='لا شيء يحدث! العضلة لا تدفع — تنقبض وتسحب فقط.'; speak($('#fb').textContent); };
    $$('.opt[data-i]').forEach(b=>b.onclick=()=>{ $$('.opt[data-i]').forEach(x=>x.classList.add('dim')); b.classList.remove('dim'); b.classList.add('ok'); ok(); speak('توقع جميل. لنفهم كيف.'); }); speak(tx(LD.hook.text)); } };

/* 2. محاكي الزوج المتقابل (يحل محل E1 وE2) */
const pair={ id:'E1', render(){ need(); return `<div class="scene">${sayNar(E('E1').text)}${armSVG('a2')}<input type="range" id="ang" min="0" max="130" value="0" style="width:100%"><div class="row" style="justify-content:space-between"><span class="note">ممدودة: الخلفية تعمل</span><span class="note">مثنية: الأمامية تعمل</span></div><div class="card" id="st"></div>${sayNar(E('E2').text)}</div>`; },
  after(){ let mn=130,mx=0; setArm('a2',0); $('#ang').oninput=e=>{ const a=+e.target.value; setArm('a2',a); mn=Math.min(mn,a); mx=Math.max(mx,a); $('#st').innerHTML = a>65 ? '<b>الأمامية</b> تنقبض (أقصر وأثخن) وتسحب — <b>الخلفية</b> مرتخية.' : '<b>الخلفية</b> تنقبض وتسحب — <b>الأمامية</b> مرتخية.'; if(mn<10&&mx>120) ok(); }; speak(tx(E('E1').text+' '+E('E2').text)); } };

/* 3. ثلاثة أنواع من العضلات: أين؟ وهل أتحكم فيها؟ */
const TYPES=[{k:'skel',ar:'عضلة الذراع',where:'upperarm_r',t:'هيكلية',ctrl:true,note:'تحرك العظام؛ تأمرها فتطيع.'},{k:'smooth',ar:'عضلات جدار المعدة والأمعاء',where:'abdomen',t:'ملساء',ctrl:false,note:'تعمل وحدها بلا أمر منك.'},{k:'card',ar:'عضلة القلب',where:'chest',t:'قلبية',ctrl:false,note:'تنقبض بلا توقف، نائماً أو مستيقظاً.'}];
const types={ id:'E3', render(){ need(); return `<div class="scene">${sayNar(E('E3').text)}<h2>المس{|ي} المكان على جسمك{|ِ} ثم {أجب|أجيبي}: هل تتحكم{|ين} فيها؟</h2>${bodyMap({side:'front',ids:['upperarm_r','chest','abdomen'],size:300})}<div id="q"></div><div class="fb" id="fb"></div></div>`; },
  after(){ const done=new Set(); let first=true; $$('.hot').forEach(h=>h.onclick=()=>{ const ty=TYPES.find(t=>t.where===h.dataset.id); h.classList.add('lit'); $('#q').innerHTML=`<div class="card"><b>${ty.ar}</b> — عضلة <b>${ty.t}</b>. هل تأمرها أنت؟ <div class="row"><button class="opt" style="width:auto" data-c="1">نعم، أتحكم فيها</button><button class="opt" style="width:auto" data-c="0">لا، تعمل وحدها</button></div></div>`; speak(ty.ar+'. عضلة '+ty.t+'. هل تأمرها أنت؟'); $$('[data-c]').forEach(b=>b.onclick=()=>{ const right=(b.dataset.c==='1')===ty.ctrl; if(right){ done.add(ty.k); $('#fb').className='fb ok'; $('#fb').textContent='صحيح. '+ty.note; if(done.size===3){ award(); ok(); } } else { noteMiss(); $('#fb').className='fb bad'; $('#fb').textContent='فكّر: هل تستطيع أن توقفها أو تبدأها بإرادتك؟'; } speak($('#fb').textContent); }); }); speak(tx(E('E3').text)); } };

/* 4. (ب) الضمور والنمو */
const use={ id:'E5', render(){ ok(); if(level!=='B') return `<div class="scene"><div class="row" style="justify-content:center">${buddy(100,'happy')}</div>${sayBuddy('فكرة للمستوى ب: العضلة تقوى بالاستعمال وتضمر بتركه.')}</div>`;
  return `<div class="scene">${sayNar(E('E5').text)}<h2>جرّب{|ي}: ماذا يحدث للعضلة؟</h2><div class="row"><button class="opt" style="width:auto" data-m="cast">🩹 جبيرة 6 أسابيع</button><button class="opt" style="width:auto" data-m="train">🏃 استعمال منتظم + نوم</button><button class="opt" style="width:auto" data-m="stop">🛋 توقف طويل</button></div>
  ${armSVG('a5',{labels:false,max:230})}<div class="fb ok" id="fb"></div></div>`; },
  after(){ if(level!=='B') return; const M={cast:[.62,'ضمرت: لم تُستعمل ستة أسابيع فخرجت أنحف. تعود بالاستعمال التدريجي.'],train:[1.35,'قويت وكبرت: الجهد ثم الراحة والنوم هما وقت البناء.'],stop:[.7,'تضمر — ولا تتحول دهناً؛ نسيجان مختلفان.']}; setArm('a5',60,1); $$('[data-m]').forEach(b=>b.onclick=()=>{ const [w,t]=M[b.dataset.m]; animArm('a5',60,{bulk:w,ms:700}); $('#fb').textContent=t; speak(t); }); speak(tx(E('E5').text)); } };

/* 5. صورة النموذج الخاطئ قبل C1 */
const wrongPic={ id:'wrong_pic', render(){ ok(); return `<div class="scene"><h2>انظر{|ي} إلى رسم زميلك{|ِ} جيداً</h2><div style="position:relative">${armSVG('a6',{labels:false})}<svg viewBox="0 0 320 396" style="position:absolute;inset:0;width:100%;max-width:270px;margin:auto;display:block;pointer-events:none"><defs><marker id="ar" markerUnits="userSpaceOnUse" markerWidth="16" markerHeight="16" refX="8" refY="8" orient="auto"><path d="M0 0L16 8L0 16z" fill="#D9483B"/></marker></defs><path d="M150 150L176 262" stroke="#D9483B" stroke-width="6" stroke-linecap="round" marker-end="url(#ar)"/><text x="160" y="16" text-anchor="middle" font-size="15" font-weight="600" fill="#A8322A" font-family="IBM Plex Sans Arabic">«العضلة تدفع الساعد ليمتد»</text></svg></div>${sayBuddy('سهم أحمر من العضلة الأمامية «يدفع» الساعد. تذكّر{|ي} ما {جرّبته|جرّبتِه} بيدك{|ِ} في بداية الدرس… ثم اكتب{|ي} الخطأ في الشاشة التالية.')}</div>`; }, after(){ setArm('a6',18); speak('انظر{|ي} إلى رسم زميلك جيداً: سهم أحمر من العضلة الأمامية يدفع الساعد. ما الخطأ؟'); } };

/* 6. التجربة الموجّهة */
const X=LD.experiment; const STEPS=[['✋','كفي على مقدمة العضد وأثني المرفق رافعاً كتاباً','تثخن الأمامية وتقصر'],['🤚','كفي خلف العضد وأمدّ الذراع ضد مقاومة','تنقبض الخلفية'],['🦶','أجسّ الوتر خلف الكاحل وأرفع كعبي','يشتد الوتر لأن عضلة الساق تسحبه'],['🫁','كفي على بطني وأتنفس','عضلة التنفس تعمل وحدها وتطيعني حين آمرها']];
const exp={ id:'exp', render(){ need(); const d=store.get('felt',[]); const a=store.get('fill',{}); return `<div class="scene"><h2>تجربة: ${tx(X.title)}</h2><div class="card" style="background:#FFF3D6"><b>السلامة:</b> ${X.safety.slice(0,2).map(tx).join(' ')}${safetyMore(X,2)}</div><div class="card"><b>تحتاج{|ين}:</b> ${X.materials.map(tx).join('، ')}</div>
  ${STEPS.map((s,i)=>`<label class="opt" style="display:flex;gap:10px;align-items:center"><input type="checkbox" data-f="${i}" ${d.includes(i)?'checked':''}><span style="font-size:1.5rem">${s[0]}</span><span><b>${s[1]}</b><br><span class="note">ماذا أحسّ؟ ${s[2]}</span></span></label>`).join('')}
  <div class="card"><b>سجّل{|ي}:</b> في الثني تعمل <select data-k="bend"><option value="">…</option><option value="f" ${a.bend==='f'?'selected':''}>العضلة الأمامية</option><option value="b" ${a.bend==='b'?'selected':''}>العضلة الخلفية</option></select>، وفي المدّ تعمل <select data-k="ext"><option value="">…</option><option value="f" ${a.ext==='f'?'selected':''}>العضلة الأمامية</option><option value="b" ${a.ext==='b'?'selected':''}>العضلة الخلفية</option></select><div class="fb" id="fb"></div></div></div>`; },
  after(){ const chk=()=>{ const d=$$('[data-f]').filter(c=>c.checked).map(c=>+c.dataset.f); store.set('felt',d); const a={bend:$('[data-k=bend]').value, ext:$('[data-k=ext]').value}; store.set('fill',a); if(a.bend&&a.ext){ const right=a.bend==='f'&&a.ext==='b'; $('#fb').className='fb '+(right?'ok':'bad'); $('#fb').textContent=right?'صحيح: كل حركة بسحب عضلة من جهتها.':'راجع ما أحسسته تحت كفك: أيّهما ثخنت عند الثني؟'; if(right&&d.length===4){ award(); ok(); } } }; $$('[data-f]').forEach(c=>c.onchange=chk); $$('select').forEach(s=>s.onchange=chk); chk(); speak([SAY.experiment, tx(X.title)]); } };

window.CUSTOM={ replace:{ hook, E1:pair, E3:types, E5:use, exp }, before:{ 'U02.L03.C1':[wrongPic] }, drop:['E2'] };
})();

