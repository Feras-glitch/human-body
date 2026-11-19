/* تأليف خاص — U03.L04 «قضية الوحدة: أفحص نموذج الدورة الدموية» */
(() => {
const E = id => LD.explain.find(e => e.id === id);
/* النموذج الخاطئ: خمسة أخطاء على رسم واحد */
const ERRS=[{x:160,y:150,ar:'القلب مرسوم في البطن',fix:'القلب في الصدر خلف عظم القص.'},{x:245,y:95,ar:'سهم «أكسجين» من الشريان الكبير إلى العضلة',fix:'التبادل في الشعيرات رقيقة الجدار لا في الشريان الكبير.'},{x:75,y:120,ar:'«دم أزرق» على الوريد',fix:'الدم أحمر داكن؛ الأزرق علامة على الدم القليل الأكسجين فقط.'},{x:110,y:175,ar:'سهم «يصنع الدم» من القلب',fix:'الدم يُصنع في نخاع العظم؛ القلب يدفعه.'},{x:160,y:35,ar:'حلقة واحدة لا تمر بالرئتين',fix:'لا بد من حلقة الرئتين ليأخذ الدم الأكسجين.'}];
const wrongModel = (found) => `<svg viewBox="0 0 320 220" style="width:100%;max-width:360px;display:block;margin:auto;background:#fff;border-radius:18px">
  <path d="M160 10q-60 0-90 60l0 80q20 50 90 60q70-10 90-60v-80q-30-60-90-60z" fill="#FBE6D0" stroke="#C98B5E" stroke-width="2"/>
  <rect x="120" y="50" width="80" height="40" rx="8" fill="#F6C9D0" opacity=".35"/><text x="160" y="75" text-anchor="middle" font-size="11" fill="#999" font-family="IBM Plex Sans Arabic">(الرئتان مهملتان)</text>
  <path d="M145 140q-15 0-15 15q0 20 30 30q30-10 30-30q0-15-15-15z" fill="#D9485A"/>
  <path d="M160 140 v-60 q0-20 20-20 h40 q25 0 25 25 v60 q0 25-25 25 h-20" fill="none" stroke="#C0392B" stroke-width="5" marker-end="url(#m3)"/><path d="M160 185 v10 q0 15-15 15 h-50 q-25 0-25-25 v-60 q0-25 25-25 h20" fill="none" stroke="#3B6BA5" stroke-width="5" marker-end="url(#m3)"/>
  <text x="70" y="125" text-anchor="middle" font-size="11" fill="#3B6BA5" font-family="IBM Plex Sans Arabic">دم أزرق</text><text x="250" y="90" text-anchor="middle" font-size="11" fill="#C0392B" font-family="IBM Plex Sans Arabic">أكسجين → عضلة</text><text x="110" y="180" text-anchor="middle" font-size="11" fill="#A8322A" font-family="IBM Plex Sans Arabic">يصنع الدم</text>
  <defs><marker id="m3" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="12" refX="6" refY="6" orient="auto"><path d="M0 0L12 6L0 12z" fill="#555"/></marker></defs>
  ${ERRS.map((e,i)=>`<circle class="err" data-i="${i}" cx="${e.x}" cy="${e.y}" r="24" fill="${found.includes(i)?'rgba(155,215,122,.5)':'rgba(255,201,60,.15)'}" stroke="${found.includes(i)?'#2E9E5B':'#D9A623'}" stroke-dasharray="${found.includes(i)?'0':'5 4'}" stroke-width="3" style="cursor:pointer"/>`).join('')}</svg>`;

/* 1. الجذب: اعرض{|ي} النموذج */
const hook={ id:'hook', render(){ need(); return `<div class="scene"><h2>${tx(LD.hook.text)}</h2>${wrongModel([])}${LD.hook.options.map((o,i)=>`<button class="opt" data-i="${i}">${tx(o)}</button>`).join('')}</div>`; },
  after(){ $$('.opt').forEach(b=>b.onclick=()=>{ $$('.opt').forEach(x=>x.classList.add('dim')); b.classList.remove('dim'); b.classList.add('ok'); ok(); speak('سنراجع أولاً ما نعرفه، ثم نفتش.'); }); speak(tx(LD.hook.text)); } };

/* 2. رحلة الكريّة مع تسمية الوعاء (يحل محل E2) */
const STAGES=[['شعيرات الرئتين','شعيرة'],['يسار القلب',null],['إلى الساق','شريان'],['داخل عضلة الساق','شعيرة'],['عائدة إلى القلب','وريد'],['يمين القلب',null]];
const journey={ id:'E2', render(){ need(); return `<div class="scene">${sayNar(E('E2').text)}<h2>في كل مرحلة: ما نوع الوعاء؟</h2><div id="stage" class="card"></div><div class="row" id="opts"></div><div class="fb" id="fb"></div><div class="row" id="trail"></div></div>`; },
  after(){ let i=0; const show=()=>{ if(i>=STAGES.length){ $('#stage').innerHTML='<b>عادت إلى الرئتين: حلقة كاملة. التبادل في موضعين فقط: شعيرات الرئتين وشعيرات العضلة.</b>'; $('#opts').innerHTML=''; award(); ok(); speak('حلقة كاملة. التبادل في موضعين فقط.'); return; } const [ar,ans]=STAGES[i]; $('#stage').innerHTML=`<b>${i+1}. ${ar}</b>`; if(!ans){ $('#opts').innerHTML=`<button class="opt" style="width:auto" id="nx">القلب يدفع ← تابع</button>`; $('#nx').onclick=()=>{ $('#trail').innerHTML+=`<span class="chip done">${ar}</span>`; i++; show(); }; speak(ar); return; } $('#opts').innerHTML=['شريان','شعيرة','وريد'].map(o=>`<button class="opt" style="width:auto" data-o="${o}">${o}</button>`).join(''); speak(ar+'. ما نوع الوعاء؟'); $$('[data-o]').forEach(b=>b.onclick=()=>{ const right=b.dataset.o===ans; if(!right) noteMiss(); $('#fb').className='fb '+(right?'ok':'bad'); $('#fb').textContent=right?'صحيح.':(ans==='شعيرة'?'هنا يحدث التبادل؛ أي وعاء جداره طبقة واحدة؟':ans==='شريان'?'يحمل الدم بعيداً عن القلب…':'يعيد الدم إلى القلب…'); speak($('#fb').textContent); if(right){$$('#opts button').forEach(x=>x.disabled=true);$('#trail').innerHTML+=`<span class="chip done">${ar} (${ans})</span>`; i++; sceneTimeout(show,500); } }); }; show(); } };

/* 3. المفتش: اكتشف{|ي} الأخطاء الخمسة (قبل C1) */
const find5={ id:'find5', render(){ need(); const f=store.get('found5',[]).filter(i=>Number.isInteger(i)&&i>=0&&i<5); return `<div class="scene"><h2>أنت{|ِ} المفتش{|ة}: المس{|ي} كل خطأ (${f.length}/5)</h2>${wrongModel(f)}<div class="fb" id="fb"></div><div id="list">${f.map(i=>`<div class="card">✘ ${ERRS[i].ar} → <b>${ERRS[i].fix}</b></div>`).join('')}</div></div>`; },
  after(){ const f=new Set(store.get('found5',[]).filter(i=>Number.isInteger(i)&&i>=0&&i<5)); if(f.size===5) ok(); $$('.err').forEach(c=>c.onclick=()=>{ const i=+c.dataset.i; if(f.has(i)) return; f.add(i); store.set('found5',[...f]); c.setAttribute('fill','rgba(155,215,122,.5)'); c.setAttribute('stroke','#2E9E5B'); c.removeAttribute('stroke-dasharray'); $('#fb').className='fb ok'; $('#fb').textContent=ERRS[i].ar+' → '+ERRS[i].fix; speak($('#fb').textContent); $('#list').innerHTML+=`<div class="card">✘ ${ERRS[i].ar} → <b>${ERRS[i].fix}</b></div>`; if(f.size===5){ award(); ok(); } }); speak('أنت المفتش: المس{|ي} كل خطأ في الرسم.'); } };

/* 4. التجربة: أعلّم شخصاً آخر — بتسجيل صوتي */
const X=LD.experiment; const QS=['لماذا يدق القلب أسرع عند الركض؟','لماذا تبدو الأوردة زرقاء؟','لماذا يتوقف الجرح الصغير وحده؟'];
const teach={ id:'exp', render(){ need(); const d=store.get('teach',{}); return `<div class="scene"><h2>${tx(X.title)}</h2><div class="card" style="background:#FFF3D6"><b>السلامة:</b> ${X.safety.slice(0,2).map(tx).join(' ')}${safetyMore(X,2)}</div><div class="card">${X.steps.slice(0,4).map((s,i)=>`<b>${i+1}.</b> ${tx(s)}`).join('<br>')}</div>
  <p><b>{اختر|اختاري} سؤالك{|ِ}:</b></p>${QS.map((q,i)=>`<button class="opt ${d.q===i?'ok':''}" data-qq="${i}">${q}</button>`).join('')}
  <div class="card"><b>سجّل{|ي} شرحك{|ِ} (دقيقتان)</b><div class="rec" style="display:flex;gap:10px;align-items:center;justify-content:center;margin:8px 0"><button class="opt" style="width:auto;background:var(--coral);color:#fff" id="recBtn">🎙 {ابدأ|ابدئي} التسجيل</button><span id="timer" class="note"></span></div><audio id="play" controls ${d.audio?'':'hidden'} src="${htmlText(d.audio||'')}" style="width:100%"></audio><p class="note">أو اكتب{|ي} شرحك{|ِ}:</p><textarea id="txt">${htmlText(d.text||'')}</textarea></div>
  <div class="card"><b>السؤال الذي سألك{|ِ} إياه:</b><input type="text" id="asked" value="${htmlText(d.asked||'')}" placeholder="سألني…" style="width:100%;font:inherit;padding:10px;border:2px solid var(--line);border-radius:12px"><div class="row" style="margin-top:6px"><button class="opt" style="width:auto ${d.knew===1?';border-color:var(--teal)':''}" data-k="1">عرفت الجواب</button><button class="opt" style="width:auto ${d.knew===0?';border-color:var(--teal)':''}" data-k="0">قلت: لا أعرف بعد، سأبحث</button></div></div></div>`; },
  after(){ const d=store.get('teach',{}); const chk=()=>{ if(d.q!=null && (d.audio||(d.text||'').trim().length>15) && d.knew!=null){ award();ok();}else need();};chk();
    $$('[data-qq]').forEach(b=>b.onclick=()=>{ d.q=+b.dataset.qq; store.set('teach',d); $$('[data-qq]').forEach(x=>x.classList.remove('ok')); b.classList.add('ok'); chk(); });
    $$('[data-k]').forEach(b=>b.onclick=()=>{ d.knew=+b.dataset.k; store.set('teach',d); $$('[data-k]').forEach(x=>x.style.borderColor=''); b.style.borderColor='var(--teal)'; if(d.knew===0) speak('«لا أعرف بعد» جواب عالِم. ما الدرس الذي ستبحث فيه؟'); chk(); });
    $('#txt').oninput=e=>{ d.text=e.target.value; store.set('teach',d); chk(); }; $('#asked').oninput=e=>{ d.asked=e.target.value; store.set('teach',d); };
    attachRecorder({button:'#recBtn',player:'#play',timer:'#timer',seconds:150,onSaved(data){d.audio=data;d.recordedAt=Date.now();if(!store.set('teach',d))return false;chk();return true;}});
    speak(tx(X.title+'. {اختر|اختاري} سؤالك واشرحه لشخص لم يدرس الوحدة.')); } };

window.CUSTOM={ replace:{ hook, E2:journey, exp:teach }, before:{ 'U03.L04.C1':[find5] } };
})();

