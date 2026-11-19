/* تأليف خاص — U07.L02 «طريق البول: الحالبان والمثانة والعاصرة» */
(() => {
const E = id => LD.explain.find(e => e.id === id);
const F = 'font-family="IBM Plex Sans Arabic"';
const T = 'paint-order="stroke" stroke="#fff" stroke-width="3.5" stroke-linejoin="round"';
const tap = (el, fn) => { el.onclick = fn; el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }; };

/* 1. أنت{|ِ} الحالب (يحل محل E2): اعصر{|ي} القطعة فوق القطرة لتدفعها موجةً موجةً */
const SEG = [66, 100, 134, 168, 202];
const ureter = { id: 'E2', render() { need(); return `<div class="scene">${sayNar(E('E2').text)}<h2>${tx('أنت{|ِ} عضلات الحالب. اضغط{|ي} على القطعة التي فيها قطرة البول لتعصرها، قطعة بعد قطعة.')}</h2>
  <svg id="ur" viewBox="0 0 220 320" role="img" aria-label="كلية في الأعلى، وحالب ينزل إلى المثانة في الأسفل" style="width:100%;max-width:260px;display:block;margin:auto;background:#fff;border-radius:18px;transition:transform 1s">
    <ellipse cx="110" cy="36" rx="34" ry="24" fill="#B34A4A" stroke="#7A2A2A" stroke-width="2"/>
    <ellipse cx="110" cy="282" rx="58" ry="30" fill="#F3D27A" stroke="#B88A1E" stroke-width="2.5"/>
    <g font-size="11.5" font-weight="600" ${F} ${T}><text x="176" y="40" text-anchor="middle" fill="#7A2A2A">الكلية</text><text x="190" y="252" text-anchor="middle" fill="#7a5a10">المثانة</text><text x="166" y="160" text-anchor="middle" fill="#6b4a3a">الحالب</text></g>
    ${SEG.map((y, i) => `<rect class="seg" data-i="${i}" tabindex="0" role="button" aria-label="قطعة ${i + 1} من الحالب" x="98" y="${y}" width="24" height="34" rx="9" fill="#E7B8A6" stroke="#A86F5B" stroke-width="2" style="cursor:pointer;transform-box:fill-box;transform-origin:center;transition:transform .35s"/>`).join('')}
    <circle id="drop" cx="110" cy="83" r="8" fill="#F2D856" stroke="#B88A1E" stroke-width="2" style="transition:cy .5s"/>
  </svg><div class="fb" id="fb" role="status" aria-live="polite"></div><div class="row" style="justify-content:center"><button class="opt" style="width:auto" id="lie" hidden>${tx('{اقلب|اقلبي} الجسم')}</button></div></div>`; },
  after() { let pos = 0; const drop = $('#drop');
    $$('.seg').forEach(s => tap(s, () => { const i = +s.dataset.i; if (s.dataset.d) return;
      if (i !== pos) { noteMiss(); fb('bad', 'اعصر{|ي} القطعة التي فيها القطرة الآن، لا قطعة أبعد.'); return; }
      s.dataset.d = 1; s.style.transform = 'scaleX(.45)'; setTimeout(() => { s.style.transform = ''; }, 380); pos++;
      drop.setAttribute('cy', pos < SEG.length ? SEG[pos] + 17 : 268);
      if (pos === SEG.length) { fb('ok', 'وصل البول إلى المثانة بموجات من عضلات الحالب، لا بثقله. ولهذا يصل ونحن مستلقون.'); $('#lie').hidden = false; award(); ok(); } }));
    $('#lie').onclick = () => { $('#ur').style.transform = 'rotate(90deg) scale(.85)'; fb('ok', 'ولو كان الجسم مستلقياً أو مقلوباً لعملت الموجات نفسها.'); };
    speak(tx(E('E2').text)); } };

/* 2. المثانة تمتلئ (يحل محل E3): منزلق الامتلاء والإشارة المبكرة والباب */
const fill = { id: 'E3', render() { need(); return `<div class="scene">${sayNar(E('E3').text)}<h2>${tx('حرّك{|ي} المنزلق: كم امتلأت المثانة؟ وراقب{|ي} الإشارة إلى الدماغ.')}</h2>
  <svg viewBox="0 0 260 230" role="img" aria-label="الدماغ في الأعلى، والمثانة في الأسفل، وبينهما خط الإشارة" style="width:100%;max-width:300px;display:block;margin:auto;background:#fff;border-radius:18px">
    <path d="M90 50 q-26 -6 -20 -26 q8 -18 34 -14 q16 -12 36 0 q26 -6 34 14 q6 20 -20 26 z" fill="#F4C6CF" stroke="#B5687A" stroke-width="2"/>
    <path id="sig" d="M130 56 L130 128" stroke="#ccc" stroke-width="4" stroke-dasharray="6 5"/>
    <ellipse id="bl" cx="130" cy="178" rx="34" ry="20" fill="#F3D27A" stroke="#B88A1E" stroke-width="3" style="transition:all .3s"/>
    <circle id="ring" cx="130" cy="222" r="7" fill="none" stroke="#B5687A" stroke-width="5"/>
    <g font-size="11" font-weight="600" ${F} ${T}><text x="222" y="34" text-anchor="middle" fill="#8a3f52">الدماغ</text><text x="222" y="140" text-anchor="middle" fill="#7a5a10">المثانة</text><text x="186" y="226" text-anchor="middle" fill="#8a3f52">العاصرة</text></g>
  </svg>
  <input type="range" id="lvl" min="0" max="100" value="10" style="width:100%" aria-label="امتلاء المثانة">
  <div class="card" id="st" role="status" aria-live="polite"></div>
  <div class="row" style="justify-content:center"><button class="opt" style="width:auto" id="toilet" hidden>${tx('وصلت{|ِ} إلى الحمام: {افتح|افتحي} الباب')}</button></div><div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let reached = false, said = 0; const upd = () => { const v = +$('#lvl').value; const bl = $('#bl'); bl.setAttribute('rx', 34 + v * 0.34); bl.setAttribute('ry', 20 + v * 0.16);
      const on = v >= 30; $('#sig').setAttribute('stroke', on ? '#D9485A' : '#ccc');
      $('#st').innerHTML = tx(v < 30 ? 'المثانة تتمدد بهدوء، ولا إشارة بعد.' : v < 90 ? 'إشارة أولى إلى الدماغ: بدأت أمتلئ. تستطيع{|ين} أن تُكمل{|ي} ما بيدك{|ِ} قليلاً ثم تذهب{|ي}.' : 'ممتلئة تقريباً: حان الوقت. لا {تكتم|تكتمي} أكثر.');
      if (on && said < 1) { said = 1; speak(tx('إشارة أولى إلى الدماغ: بدأت أمتلئ.')); }
      if (v >= 90 && !reached) { reached = true; $('#toilet').hidden = false; } };
    $('#lvl').oninput = upd; upd();
    $('#toilet').onclick = () => { if (!reached) return; $('#toilet').disabled = true; $('#ring').setAttribute('r', 13); $('#lvl').value = 0; $('#lvl').disabled = true; upd();
      fb('ok', 'أمر الدماغ بأمرين معاً: انفتحت العاصرة، وانقبضت عضلة المثانة فخرج البول. ثم نتطهّر ونغسل أيدينا.'); award(); ok(); };
    speak(tx(E('E3').text)); } };

/* 3. لوحة ألوان البول (يحل محل E5) */
const SW = [['#FBF9E6', 'شفاف تقريباً'], ['#F6EDA0', 'أصفر فاتح كالقش'], ['#F1D55A', 'أصفر'], ['#E0AE3A', 'أصفر غامق'], ['#C27F26', 'كهرماني غامق']];
const QA = { a: { ok: [0, 1], q: 'أيّ لون يقول غالباً: شربتُ كفايتي؟', yes: 'نعم: الفاتح الوفير علامة غالباً على شرب كافٍ.', no: 'هذا اللون يقول إن الجسم يحتاج ماءً أكثر.' },
  b: { ok: [2, 3, 4], q: 'وأيّ لون يقول: أحتاج ماءً؟', yes: 'نعم: كلما غمق اللون احتاج الجسم ماءً أكثر. فإن رأيت{|ِ} لوناً بنياً أو أحمر، أو شعرت{|ِ} بألم، {أخبر|أخبري} أهلك{|ِ}.', no: 'هذا لون من شرب كفايته غالباً.' } };
const chart = { id: 'E5', render() { need(); return `<div class="scene">${sayNar(E('E5').text)}<h2>${tx('لوحة ألوان البول')}</h2>
  ${Object.entries(QA).map(([k, q]) => `<div class="card"><b>${tx(q.q)}</b><div class="row" style="flex-wrap:wrap;gap:6px">${SW.map(([c, n], i) => `<button class="opt" style="width:auto;background:${c};color:#3a2a10;border:2px solid #d9c38a" data-q="${k}" data-v="${i}">${n}</button>`).join('')}</div></div>`).join('')}
  <div class="fb" id="fb" role="status" aria-live="polite"></div><p class="note">${tx('اللوحة دليل لا حكم: بعض الأطعمة والفيتامينات والأدوية تغيّر اللون، والألوان تختلف قليلاً على الشاشات.')}</p></div>`; },
  after() { const got = {}; $$('[data-q]').forEach(b => b.onclick = () => { const k = b.dataset.q, q = QA[k], v = +b.dataset.v, right = q.ok.includes(v);
      $$(`[data-q="${k}"]`).forEach(x => { x.classList.remove('ok', 'bad'); x.style.boxShadow = ''; }); b.classList.add(right ? 'ok' : 'bad'); b.style.boxShadow = `0 0 0 4px ${right ? '#2E9E5B' : '#D9485A'}`; if (!right) noteMiss(); fb(right ? 'ok' : 'bad', right ? q.yes : q.no);
      if (right) got[k] = 1; if (got.a && got.b) { award(); ok(); } });
    speak(tx(E('E5').text)); } };

/* 4. التجربة */
const X = LD.experiment;
const Q = [
  { k: 'a', q: 'الكرة في الجورب المرفوع إلى الأعلى:', o: ['سقطت إلى الأسفل', 'تقدمت إلى الأعلى بالعصر', 'بقيت مكانها مهما عصرت'], r: 1, w: 'العصر يدفعها ولو إلى الأعلى: هكذا يدفع الحالب البول بموجات.' },
  { k: 'b', q: 'البالون وعنقه مغلق بالملقط:', o: ['خرج الماء منه', 'بقي ممتلئاً'], r: 1, w: 'العاصرة باب: لا يخرج البول حتى نقرر.' },
  { k: 'c', q: 'أي كوب يقول: شربتُ كفايتي؟', o: ['كوب القطرة الواحدة', 'كوب العشر قطرات'], r: 0, w: 'الفاتح يقول غالباً إننا شربنا كفايتنا.' },
];
const exp = { id: 'exp', render() { need(); return `<div class="scene"><h2>${tx('تجربة: ' + X.title)}</h2><div class="card" style="background:#FFF3D6"><b>السلامة:</b> ${X.safety.slice(0, 2).map(tx).join(' ')}${safetyMore(X, 2)}</div>
  <div class="card"><b>${tx('تحتاج{|ين}:')}</b> ${X.materials.map(tx).join('، ')}</div><div class="card">${X.steps.map((s, i) => `<b>${i + 1}.</b> ${tx(s)}`).join('<br>')}</div>
  <div class="card">${Q.map(q => `<b>${tx(q.q)}</b><div class="row" style="flex-wrap:wrap">${q.o.map((o, i) => `<button class="opt" style="width:auto" data-q="${q.k}" data-v="${i}">${tx(o)}</button>`).join('')}</div>`).join('')}<div class="fb" id="fb" role="status" aria-live="polite"></div></div></div>`; },
  after() { const r = store.get('urinx', {}); const chk = () => { if (Q.every(q => r[q.k] === q.r)) { award(); ok(); } else need(); };
    Q.forEach(q => { if (r[q.k] != null) $(`[data-q="${q.k}"][data-v="${r[q.k]}"]`)?.classList.add(r[q.k] === q.r ? 'ok' : 'bad'); });
    $$('[data-q]').forEach(b => b.onclick = () => { const q = Q.find(x => x.k === b.dataset.q); r[q.k] = +b.dataset.v; store.set('urinx', r); $$(`[data-q="${q.k}"]`).forEach(x => x.classList.remove('ok', 'bad')); const right = r[q.k] === q.r; b.classList.add(right ? 'ok' : 'bad'); if (!right) noteMiss(); fb(right ? 'ok' : 'bad', [right ? 'نعم: ' : 'لاحظ{|ي} مرة أخرى. ', q.w]); chk(); });
    chk(); speak([SAY.experiment, tx(X.title)]); } };

window.CUSTOM = { replace: { E2: ureter, E3: fill, E5: chart, exp } };
})();
