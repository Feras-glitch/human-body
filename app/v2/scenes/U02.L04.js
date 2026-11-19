/* تأليف خاص — U02.L04 «قضية الوحدة: أبني ذراعاً تتحرك» */
(() => {
const E = id => LD.explain.find(e => e.id === id);
/* ذراع ورقية: شريطان ودبوس وخيطان */
const paperArm = (id) => `<svg id="${id}" viewBox="0 0 320 220" style="width:100%;max-width:340px;display:block;margin:auto">
  <rect x="20" y="95" width="130" height="30" rx="6" fill="#F6E7C8" stroke="#B89B6A" stroke-width="3"/>
  <g class="fore" style="transform-origin:150px 110px;transition:transform .5s"><rect x="150" y="97" width="130" height="26" rx="6" fill="#F6E7C8" stroke="#B89B6A" stroke-width="3"/><circle class="tf" cx="170" cy="97" r="5" fill="#2BB3A3"/><circle class="tb" cx="170" cy="123" r="5" fill="#2BB3A3"/></g>
  <path class="sf" d="M40 95 L170 97" stroke="#E8707A" stroke-width="4" fill="none"/><path class="sb" d="M40 125 L170 123" stroke="#F4A6A0" stroke-width="4" fill="none"/>
  <circle cx="40" cy="95" r="5" fill="#2BB3A3"/><circle cx="40" cy="125" r="5" fill="#2BB3A3"/>
  <circle cx="150" cy="110" r="8" fill="#FFC93C" stroke="#D9A623" stroke-width="3"/>
  <text x="85" y="80" text-anchor="middle" font-size="13" fill="#A8322A" font-family="IBM Plex Sans Arabic">الخيط الأمامي (عضلة)</text><text x="85" y="150" text-anchor="middle" font-size="13" fill="#A8322A" font-family="IBM Plex Sans Arabic">الخيط الخلفي (عضلة)</text><text x="60" y="200" text-anchor="middle" font-size="12" fill="#1E8F82" font-family="IBM Plex Sans Arabic">● موضع الإلصاق = وتر</text></svg>`;
function setPaper(id,a){ const s=$('#'+id); s.querySelector('.fore').style.transform=`rotate(${-a}deg)`; const r=-a*Math.PI/180; const px=150+20*Math.cos(r)+ -13*Math.sin(r), py=110+20*Math.sin(r)+ -13*Math.cos(r); const qx=150+20*Math.cos(r)+13*Math.sin(r), qy=110+20*Math.sin(r)+13*Math.cos(r); s.querySelector('.sf').setAttribute('d',`M40 95 L${px} ${py}`); s.querySelector('.sb').setAttribute('d',`M40 125 L${qx} ${qy}`); s.querySelector('.sf').setAttribute('stroke-width', a>60?7:4); s.querySelector('.sb').setAttribute('stroke-width', a>60?4:7); }

/* 1. الجذب */
const hook={ id:'hook', render(){ need(); return `<div class="scene"><h2>${tx(LD.hook.text)}</h2>${LD.hook.options.map((o,i)=>`<button class="opt" data-i="${i}">${tx(o)}</button>`).join('')}<div class="fb" id="fb"></div></div>`; },
  after(){ $$('.opt').forEach(b=>b.onclick=()=>{ $$('.opt').forEach(x=>x.classList.add('dim')); b.classList.remove('dim'); b.classList.add('ok'); $('#fb').className='fb ok'; $('#fb').textContent='سنبنيها أولاً على الشاشة، ثم بالورق بيدك.'; speak($('#fb').textContent); ok(); }); speak(tx(LD.hook.text)); } };

/* 2. القواعد الثلاث (تحل محل E1) */
const RULES=[['🦴','العظم صلب يدعم','لا ينثني هو نفسه؛ الثني عند المفصل.'],['🔗','المفصل يحدد اتجاه الحركة','رزّي: اتجاه واحد. كروي: اتجاهات كثيرة.'],['💪','العضلة تسحب بالوتر ولا تدفع','لذلك تعمل أزواجاً متقابلة.']];
const rules={ id:'E1', render(){ need(); return `<div class="scene">${sayNar(E('E1').text)}<h2>المس{|ي} القواعد الثلاث {لتتذكرها|لتتذكريها}</h2>${RULES.map((r,i)=>`<button class="opt" data-k="${i}" style="display:flex;gap:10px;align-items:center"><span style="font-size:1.6rem">${r[0]}</span><span><b>${r[1]}</b><br><span class="note" id="r${i}" hidden>${r[2]}</span></span></button>`).join('')}</div>`; },
  after(){ const s=new Set(); $$('[data-k]').forEach(b=>b.onclick=()=>{ b.classList.add('ok'); $('#r'+b.dataset.k).hidden=false; s.add(b.dataset.k); speak(RULES[b.dataset.k][1]+'. '+RULES[b.dataset.k][2]); if(s.size===3) ok(); }); speak(tx(E('E1').text)); } };

/* 3. محاكي الذراع الورقية */
const sim={ id:'sim', render(){ need(); return `<div class="scene"><h2>ابنِ{|ي} الذراع على الشاشة أولاً</h2>${paperArm('pa')}
  <div class="row" style="justify-content:center"><button class="opt" style="width:auto" id="pf">اسحب{|ي} الخيط الأمامي</button><button class="opt" style="width:auto" id="pb">اسحب{|ي} الخيط الخلفي</button><button class="opt" style="width:auto" id="pp">ادفع بالخيط الأمامي</button><button class="opt" style="width:auto" id="one">أزل الخيط الخلفي</button></div><div class="fb" id="fb"></div></div>`; },
  after(){ setPaper('pa',0); const seen=new Set(); let oneString=false; const say=(c,t)=>{ $('#fb').className='fb '+c; $('#fb').textContent=t; speak(t); }; const chk=()=>{ if(seen.size>=3) ok(); };
    $('#pf').onclick=()=>{ setPaper('pa',110); seen.add('f'); say('ok','الخيط الأمامي قصر فسُحب موضع الإلصاق وانثنى الساعد عند المفصل.'); chk(); };
    $('#pb').onclick=()=>{ if(oneString){ say('bad','لا خيط خلفي! الساعد يبقى مثنياً — بخيط واحد لا عودة. هذا سبب الزوج.'); seen.add('o'); chk(); return; } setPaper('pa',0); seen.add('b'); say('ok','الخيط الخلفي سحب من الخلف فامتد الساعد. الأمامي ارتخى.'); chk(); };
    $('#pp').onclick=()=>{ const s=$('#pa .sf'); s.setAttribute('d', s.getAttribute('d').replace('M40 95','M40 95 q30 25 60 0 t60 0 ').replace(/L.*$/,'')); sceneTimeout(()=>setPaper('pa', $('#pa .fore').style.transform.includes('-110')?110:0),700); seen.add('p'); say('bad','الخيط يرتخي ويتجعد ولا يدفع شيئاً! العضلة مثله: تسحب فقط.'); chk(); };
    $('#one').onclick=()=>{ oneString=true; $('#pa .sb').setAttribute('opacity',.15); say('bad','الآن النموذج بخيط واحد. جرّب{|ي}: اسحب{|ي} الأمامي ثم حاول المدّ.'); };
    speak('ابن الذراع على الشاشة أولاً: اسحب{|ي} الخيط الأمامي، ثم الخلفي، ثم حاول الدفع.'); } };

/* 4. اكتشف{|ي} الأخطاء الخمسة (قبل C1) */
const ERRS=[{x:95,y:60,ar:'سهم «دفع» من العضلة',fix:'العضلة تسحب ولا تدفع.'},{x:95,y:160,ar:'لا عضلة خلفية',fix:'كل مفصل يحتاج زوجاً متقابلاً.'},{x:150,y:110,ar:'المرفق مرسوم يدور كالكتف',fix:'المرفق مفصل رزّي: اتجاه واحد.'},{x:60,y:110,ar:'الوتر موصول بعظم واحد فقط',fix:'العضلة تصل عظمين عبر المفصل.'},{x:230,y:110,ar:'عظم مصمت بلا شيء داخله',fix:'العظم حي: فيه نخاع وأوعية.'}];
const find5={ id:'find5', render(){ need(); const f=store.get('found5',[]).filter(i=>Number.isInteger(i)&&i>=0&&i<5); return `<div class="scene"><h2>نموذج زميلك{|ِ} فيه خمسة أخطاء. المس{|ي} كل خطأ (${f.length}/5)</h2>
  <svg viewBox="0 30 320 160" style="width:100%;max-width:400px;display:block;margin:auto;background:#fff;border-radius:18px"><rect x="20" y="95" width="130" height="30" rx="6" fill="#F6E7C8" stroke="#B89B6A" stroke-width="3"/><circle cx="150" cy="110" r="22" fill="none" stroke="#B89B6A" stroke-width="2" stroke-dasharray="4 3"/><path d="M128 110a22 22 0 1 1 44 0" fill="none" stroke="#D9483B" stroke-width="3" marker-end="url(#a2)"/><rect x="150" y="97" width="130" height="26" rx="6" fill="#F6E7C8" stroke="#B89B6A" stroke-width="3"/><path d="M40 95q30-25 60 0" stroke="#E8707A" stroke-width="7" fill="none"/><path d="M70 70l40 15" stroke="#D9483B" stroke-width="5" marker-end="url(#a2)"/><defs><marker id="a2" markerUnits="userSpaceOnUse" markerWidth="14" markerHeight="14" refX="7" refY="7" orient="auto"><path d="M0 0L14 7L0 14z" fill="#D9483B"/></marker></defs>
  ${ERRS.map((e,i)=>`<circle class="err" data-i="${i}" cx="${e.x}" cy="${e.y}" r="22" fill="${f.includes(i)?'rgba(155,215,122,.5)':'rgba(255,201,60,.18)'}" stroke="${f.includes(i)?'#2E9E5B':'#D9A623'}" stroke-dasharray="${f.includes(i)?'0':'5 4'}" stroke-width="3" style="cursor:pointer"/>`).join('')}</svg>
  <div class="fb" id="fb"></div><div id="list">${f.map(i=>`<div class="card">✘ ${ERRS[i].ar} → <b>${ERRS[i].fix}</b></div>`).join('')}</div></div>`; },
  after(){ const f=new Set(store.get('found5',[]).filter(i=>Number.isInteger(i)&&i>=0&&i<5)); if(f.size===5) ok(); $$('.err').forEach(c=>c.onclick=()=>{ const i=+c.dataset.i; if(f.has(i)) return; f.add(i); store.set('found5',[...f]); c.setAttribute('fill','rgba(155,215,122,.6)'); c.setAttribute('stroke','#2E9E5B'); $('#fb').className='fb ok'; $('#fb').textContent=ERRS[i].ar+' → '+ERRS[i].fix; speak($('#fb').textContent); $('#list').innerHTML+=`<div class="card">✘ ${ERRS[i].ar} → <b>${ERRS[i].fix}</b></div>`; if(f.size===5){ award(); ok(); } }); speak('نموذج زميلك فيه خمسة أخطاء. المس{|ي} كل خطأ.'); } };

/* 5. التجربة: البناء الحقيقي */
const X=LD.experiment;
const exp={ id:'exp', render(){ need(); const d=store.get('built',{}); return `<div class="scene"><h2>الآن بالورق: ${tx(X.title)}</h2><div class="card" style="background:#FFF3D6"><b>السلامة:</b> ${X.safety.slice(0,2).map(tx).join(' ')}${safetyMore(X,2)}</div><div class="card"><b>تحتاج{|ين}:</b> ${X.materials.map(tx).join('، ')}</div><div class="card">${X.steps.slice(0,6).map((s,i)=>`<b>${i+1}.</b> ${tx(s)}`).join('<br>')}</div>
  <div class="card"><b>ماذا حدث حين سحبت{|ِ} الخيط الأمامي؟</b><div class="row">${['انثنى الساعد','امتد الساعد','لا شيء'].map((o,i)=>`<button class="opt" style="width:auto" data-q="a" data-v="${i}">${o}</button>`).join('')}</div>
  <b>وحين حاولت{|ِ} الدفع بالخيط؟</b><div class="row">${['امتد','لم ينجح؛ الخيط ارتخى','انثنى أكثر'].map((o,i)=>`<button class="opt" style="width:auto" data-q="b" data-v="${i}">${o}</button>`).join('')}</div><div class="fb" id="fb"></div></div>
  <label class="opt" style="display:flex;gap:10px"><input type="checkbox" id="done" ${d.done?'checked':''}> بنيتها فعلاً وكتبت تحتها ما يُظهره نموذجي وما لا يُظهره</label>${X.steps[6]?`<p class="note">${tx(X.steps[6])}</p>`:''}</div>`; },
  after(){ const d=store.get('built',{}); const chk=()=>{ if(d.a===0&&d.b===1&&d.done){ award(); ok(); } }; $$('[data-q]').forEach(b=>b.onclick=()=>{ d[b.dataset.q]=+b.dataset.v; store.set('built',d); $$(`[data-q="${b.dataset.q}"]`).forEach(x=>x.classList.remove('ok','bad')); const right=(b.dataset.q==='a'&&d.a===0)||(b.dataset.q==='b'&&d.b===1); b.classList.add(right?'ok':'bad'); $('#fb').className='fb '+(right?'ok':'bad'); $('#fb').textContent=right?'نعم — كما في جسمك تماماً.':'جرّب{|ي} مرة أخرى بيدك وراقب الخيط.'; speak($('#fb').textContent); chk(); }); $('#done').onchange=e=>{ d.done=e.target.checked; store.set('built',d); chk(); }; chk(); speak(tx('الآن بالورق: '+X.title)); } };

window.CUSTOM={ replace:{ hook, E1:rules, exp }, after:{ E1:[sim] }, before:{ 'U02.L04.C1':[find5] } };
})();

