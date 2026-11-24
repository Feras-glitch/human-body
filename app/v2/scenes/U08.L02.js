/* تأليف خاص — U08.L02 «العين: كيف نرى؟» */
(() => {
const E = id => LD.explain.find(e => e.id === id);
const F = 'font-family="IBM Plex Sans Arabic"';
const tap = (el, fn) => { el.onclick = fn; el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }; };

/* مقطع العين من الجانب: الشجرة على اليمين، والضوء يدخل فيتقاطع ويقع مقلوباً على الشبكية، والعصب البصري يخرج إلى الدماغ */
const section = inner => `<svg viewBox="0 0 320 230" role="img" aria-label="مقطع العين: القرنية والبؤبؤ والعدسة والشبكية والعصب البصري إلى الدماغ، والضوء يدخل من شجرة" style="width:100%;max-width:380px;display:block;margin:auto;background:#fff;border-radius:18px">
  <path d="M2 82 Q22 62 40 84 Q48 112 38 138 Q20 158 2 140 Z" fill="#F4B8C4" stroke="#C9788A" stroke-width="2"/>
  <path d="M40 112 L80 112" stroke="#E2B33C" stroke-width="7" stroke-linecap="round"/>
  <circle cx="150" cy="112" r="72" fill="#FDFBF7" stroke="#B8A89A" stroke-width="3"/>
  <path d="M88 64 Q70 112 88 160" fill="none" stroke="#E0525B" stroke-width="6" stroke-linecap="round"/>
  <path d="M214 80 Q236 112 214 144" fill="#E8F5FF" fill-opacity=".6" stroke="#7FB8E0" stroke-width="2.5"/>
  <line x1="206" y1="78" x2="206" y2="102" stroke="#7A5230" stroke-width="5"/><line x1="206" y1="122" x2="206" y2="146" stroke="#7A5230" stroke-width="5"/>
  <ellipse cx="190" cy="112" rx="10" ry="22" fill="#CFE8FF" stroke="#6FA6D6" stroke-width="2"/>
  <g stroke="#F2A900" stroke-width="2" fill="none" opacity=".9"><path d="M298 80 L206 108 L88 146"/><path d="M298 150 L206 116 L88 76"/></g>
  <rect x="294" y="128" width="7" height="26" fill="#8B5A2B"/><circle cx="297" cy="112" r="20" fill="#5BB36A"/><circle cx="297" cy="84" r="9" fill="#5BB36A"/>
  ${inner}
</svg>`;
const STOPS = [
  { x: 254, y: 28, w: 64, ax: 224, ay: 96, lb: 'القرنية', ar: 'يمرّ الضوء في القرنية الشفافة' },
  { x: 262, y: 206, w: 60, ax: 206, ay: 112, lb: 'البؤبؤ', ar: 'يدخل من فتحة البؤبؤ' },
  { x: 170, y: 22, w: 62, ax: 190, ay: 92, lb: 'العدسة', ar: 'تجمعه العدسة' },
  { x: 120, y: 210, w: 66, ax: 86, ay: 140, lb: 'الشبكية', ar: 'يقع على الشبكية فتحوّله رسائل' },
  { x: 76, y: 30, w: 92, ax: 62, ay: 112, lb: 'العصب البصري', ar: 'تسري الرسائل في العصب البصري' },
  { x: 34, y: 176, w: 60, ax: 20, ay: 138, lb: 'الدماغ', ar: 'الدماغ يصنع الصورة' },
];
const pill = (s, i) => `<g class="st" data-k="${i}" tabindex="0" role="button" aria-label="${s.lb}" style="cursor:pointer">
  <line x1="${s.ax}" y1="${s.ay}" x2="${s.x}" y2="${s.y}" stroke="#3E7BB6" stroke-width="1.5"/><circle cx="${s.ax}" cy="${s.ay}" r="3.5" fill="#3E7BB6"/>
  <rect x="${s.x - s.w / 2}" y="${s.y - 13}" width="${s.w}" height="26" rx="13" fill="#3E7BB6"/>
  <text class="n" x="${s.x}" y="${s.y + 4.5}" text-anchor="middle" font-size="12.5" font-weight="700" ${F} fill="#fff">${s.lb}</text></g>`;
const path = { id: 'E2', render() { need(); return `<div class="scene">${sayNar(E('E2').text)}<h2>${tx('اتبع{|ي} الضوء من الشجرة: اضغط{|ي} المحطات بالترتيب حتى يصل إلى الدماغ.')}</h2>
  ${section(STOPS.map(pill).join(''))}
  <ol class="card" id="steps" style="margin:6px 0;padding-inline-start:22px;min-height:20px"></ol><div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let next = 0; $$('.st').forEach(g => tap(g, () => { const k = +g.dataset.k; if (next >= STOPS.length || k < next) return;
      if (k === next) { g.querySelector('rect').setAttribute('fill', '#2E9E6A'); g.querySelector('.n').textContent = (k + 1) + '. ' + STOPS[k].lb; $('#steps').insertAdjacentHTML('beforeend', `<li>${tx(STOPS[k].ar)}</li>`); next++;
        if (next === STOPS.length) { fb('ok', 'هذا طريق الضوء: القرنية، فالبؤبؤ، فالعدسة، فالشبكية، ثم رسائل في العصب البصري إلى الدماغ. ولاحظ{|ي} أن الأشعة تتقاطع فتقع الشجرة على الشبكية مقلوبة.'); award(); ok(); } else fb('ok', STOPS[k].ar); }
      else { noteMiss(); fb('bad', next === 0 ? 'ابدأ{|ي} من حيث يصل الضوء إلى العين أولاً: من المقدمة.' : 'ليس بعد. أين يذهب الضوء بعد «' + STOPS[next - 1].lb + '»؟'); } }));
    speak(tx(E('E2').text)); } };

/* البؤبؤ والضوء (يحل محل E3) */
const pupil = { id: 'E3', render() { need(); return `<div class="scene">${sayNar(E('E3').text)}<h2>${tx('حرّك{|ي} المنزلق من الظلام إلى الضوء القوي، و{راقب|راقبي} البؤبؤ.')}</h2>
  <svg viewBox="0 0 320 170" role="img" aria-label="عين من الأمام يتغير بؤبؤها مع الضوء" style="width:100%;max-width:360px;display:block;margin:auto;border-radius:18px"><rect id="bg" width="320" height="170" rx="18" fill="#222"/>
    <ellipse cx="160" cy="85" rx="120" ry="58" fill="#fff" stroke="#C99A78" stroke-width="3"/><circle cx="160" cy="85" r="46" fill="#7A5230"/><circle cx="160" cy="85" r="44" fill="none" stroke="#5C3B1E" stroke-width="2" stroke-dasharray="3 5"/>
    <circle id="pp" cx="160" cy="85" r="20" fill="#111"/><circle cx="174" cy="70" r="6" fill="#fff" opacity=".8"/></svg>
  <label style="display:block;margin-top:8px">${tx('الضوء:')} <input type="range" id="lt" min="0" max="100" value="50" style="width:100%" aria-label="شدة الضوء"></label>
  <div class="card" id="st"></div></div>`; },
  after() { const seen = { dark: false, bright: false }; let fin = false;
    const upd = () => { const v = +$('#lt').value, r = 34 - v * 0.27; $('#pp').setAttribute('r', r.toFixed(1));
      const g = Math.round(34 + v * 2.1); $('#bg').setAttribute('fill', `rgb(${g},${g},${Math.min(255, g + 10)})`);
      if (v <= 10) seen.dark = true; if (v >= 90) seen.bright = true;
      $('#st').textContent = v <= 25 ? tx('ظلام: اتسع البؤبؤ ليُدخل ضوءاً أكثر.') : v >= 75 ? tx('ضوء قوي: ضاق البؤبؤ ليحمي الشبكية. ولا {تنظر|تنظري} إلى الشمس أبداً: البؤبؤ وحده لا يحميك{|ِ} منها.') : tx('ضوء متوسط: البؤبؤ بين الاتساع والضيق.');
      if (!fin && seen.dark && seen.bright) { fin = true; fb('ok', 'هكذا يعمل البؤبؤ بمنعكس، بلا قرار منك{|ِ}.'); award(); ok(); } };
    $('#lt').oninput = upd; upd(); speak(tx(E('E3').text)); } };

/* البقعة العمياء على الشاشة (يحل محل E4) */
const blind = { id: 'E4', render() { need(); return `<div class="scene">${sayNar(E('E4').text)}<h2>${tx('جرّب{|ي} بقعتك{|ِ} العمياء على الشاشة.')}</h2>
  <div class="card">${tx('{أمسك|أمسكي} الجهاز على بعد ذراعك{|ِ}، و{أغمض|أغمضي} عينك{|ِ} اليسرى، و{انظر|انظري} بعينك{|ِ} اليمنى إلى علامة + وحدها. ثم {قرّب|قرّبي} الجهاز ببطء نحو وجهك{|ِ} ونظرك{|ِ} ثابت على العلامة.')}</div>
  <svg viewBox="0 0 320 110" role="img" aria-label="بطاقة البقعة العمياء: علامة زائد على اليسار ونقطة سوداء على اليمين" style="width:100%;max-width:520px;display:block;margin:auto;background:#fff;border:2px solid #ddd;border-radius:12px">
    <path d="M30 55 H62 M46 39 V71" stroke="#111" stroke-width="6" stroke-linecap="round"/><circle cx="282" cy="55" r="17" fill="#111"/></svg>
  <div class="card"><b>${tx('ماذا حدث للنقطة؟')}</b><div class="row" style="flex-wrap:wrap"><button class="opt" style="width:auto" data-q="obs" data-v="0">${tx('اختفت عند مسافة ثم عادت')}</button><button class="opt" style="width:auto" data-q="obs" data-v="1">${tx('بقيت ظاهرة طوال الوقت')}</button></div>
  <b>${tx('لماذا لا {تلاحظ|تلاحظين} هذه البقعة في يومك{|ِ}؟')}</b><div class="row" style="flex-wrap:wrap"><button class="opt" style="width:auto" data-q="why" data-v="0">${tx('العين الأخرى والدماغ يكملان الصورة')}</button><button class="opt" style="width:auto" data-q="why" data-v="1">${tx('لأنها تختفي حين نكبر')}</button></div>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div></div>`; },
  after() { const r = {}; const chk = () => { if (r.obs != null && r.why === 0) { award(); ok(); } else need(); };
    $$('[data-q="obs"]').forEach(b => b.onclick = () => { r.obs = +b.dataset.v; $$('[data-q="obs"]').forEach(x => x.classList.remove('ok', 'bad')); b.classList.add('ok');
      fb('ok', r.obs === 0 ? 'وقعت صورة النقطة على موضع خروج العصب البصري، ولا خلايا فيه تحسّ الضوء.' : 'لا بأس: {أعد|أعيدي} ببطء أكثر، ونظرك{|ِ} ثابت على العلامة، والعين اليسرى مغمضة؛ وقد {تحتاج|تحتاجين} أن {تقرّب|تقرّبي} أكثر. وعلى الورق أسهل.'); chk(); });
    $$('[data-q="why"]').forEach(b => b.onclick = () => { r.why = +b.dataset.v; $$('[data-q="why"]').forEach(x => x.classList.remove('ok', 'bad')); const right = r.why === 0; b.classList.add(right ? 'ok' : 'bad'); if (!right) noteMiss();
      fb(right ? 'ok' : 'bad', right ? 'نعم: العينان تتداخلان، والدماغ يكمل الجزء الناقص بما حوله.' : 'هي في عين كل إنسان طول العمر. ماذا حدث حين {فتحت|فتحتِ} العينين معاً؟'); chk(); });
    speak(tx(E('E4').text)); } };

/* التجربة */
const X = LD.experiment;
const Q = [
  { k: 'a', q: 'ماذا حدث لبؤبؤك{|ِ} بعد رفع الكفين؟', o: ['كان كبيراً ثم صغر', 'كان صغيراً ثم كبر'], r: 0, w: 'اتسع في الظلام تحت الكفين، ثم ضاق في الضوء خلال ثوانٍ: منعكس.' },
  { k: 'b', q: 'لماذا عادت النقطة حين {فتحت|فتحتِ} العينين؟', o: ['العين الأخرى رأتها، والدماغ جمع الصورتين', 'لأن النقطة تحركت على الورقة'], r: 0, w: 'كل عين تغطي البقعة العمياء للأخرى.' },
];
const exp = { id: 'exp', render() { need(); return `<div class="scene"><h2>${tx('تجربة: ' + X.title)}</h2><div class="card" style="background:#FFF3D6"><b>السلامة:</b> ${X.safety.slice(0, 2).map(tx).join(' ')}${safetyMore(X, 2)}</div>
  <div class="card"><b>${tx('تحتاج{|ين}:')}</b> ${X.materials.map(tx).join('، ')}</div><div class="card">${X.steps.map((s, i) => `<b>${i + 1}.</b> ${tx(s)}`).join('<br>')}</div>
  <div class="card"><label>${tx('المسافة التي اختفت عندها النقطة (سم):')} <input type="number" id="d" min="5" max="80" style="width:5em"></label><div id="dn" class="note"></div></div>
  <div class="card">${Q.map(q => `<b>${tx(q.q)}</b><div class="row" style="flex-wrap:wrap">${q.o.map((o, i) => `<button class="opt" style="width:auto" data-q="${q.k}" data-v="${i}">${tx(o)}</button>`).join('')}</div>`).join('')}<div class="fb" id="fb" role="status" aria-live="polite"></div></div></div>`; },
  after() { const r = store.get('eyex', {}); const chk = () => { if (Q.every(q => r[q.k] === q.r)) { award(); ok(); } else need(); };
    const el = $('#d'); if (r.d != null) el.value = r.d;
    const note = () => { $('#dn').textContent = r.d == null ? '' : tx('سجّلت{|ِ} ' + r.d + ' سم. لو {أبعدت|أبعدتِ} النقطة عن العلامة أكثر، {أتتوقع|أتتوقعين} أن تختفي من مسافة أبعد أم أقرب؟ {جرّب|جرّبي}!'); };
    el.oninput = () => { r.d = el.value === '' ? null : +el.value; store.set('eyex', r); note(); }; note();
    Q.forEach(q => { if (r[q.k] != null) $(`[data-q="${q.k}"][data-v="${r[q.k]}"]`)?.classList.add(r[q.k] === q.r ? 'ok' : 'bad'); });
    $$('[data-q]').forEach(b => b.onclick = () => { const q = Q.find(x => x.k === b.dataset.q); r[q.k] = +b.dataset.v; store.set('eyex', r); $$(`[data-q="${q.k}"]`).forEach(x => x.classList.remove('ok', 'bad')); const right = r[q.k] === q.r; b.classList.add(right ? 'ok' : 'bad'); if (!right) noteMiss(); fb(right ? 'ok' : 'bad', [right ? 'نعم: ' : 'لاحظ{|ي} مرة أخرى. ', q.w]); chk(); });
    chk(); speak([SAY.experiment, tx(X.title)]); } };

window.CUSTOM = { replace: { E2: path, E3: pupil, E4: blind, exp } };
})();
