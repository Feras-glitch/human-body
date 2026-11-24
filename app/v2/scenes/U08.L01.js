/* تأليف خاص — U08.L01 «الدماغ والأعصاب: شبكة الرسائل» */
(() => {
const E = id => LD.explain.find(e => e.id === id);
const F = 'font-family="IBM Plex Sans Arabic"';
const tap = (el, fn) => { el.onclick = fn; el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }; };

/* جسم بسيط من الأمام: رأس فيه الدماغ، وحبل شوكي، وذراع ممدودة نحو الكرة */
const body = inner => `<svg viewBox="0 0 320 300" role="img" aria-label="طفل يمد يده نحو كرة: العين والدماغ والأعصاب وعضلات اليد" style="width:100%;max-width:340px;display:block;margin:auto;background:#fff;border-radius:18px">
  <circle cx="120" cy="62" r="40" fill="#F1C9A5" stroke="#C99A78" stroke-width="2"/>
  <path d="M92 48 Q120 18 150 46 Q158 64 140 74 Q120 80 100 72 Q86 62 92 48 Z" fill="#F4B8C4" stroke="#C9788A" stroke-width="2"/>
  <circle cx="142" cy="74" r="5" fill="#2b2b2b"/>
  <path d="M96 104 L144 104 L156 232 L84 232 Z" fill="#9CC9F0" stroke="#5E8DB8" stroke-width="2"/>
  <line x1="120" y1="80" x2="120" y2="226" stroke="#E2B33C" stroke-width="5" stroke-linecap="round"/>
  <path d="M144 112 L222 120 L268 128" fill="none" stroke="#F1C9A5" stroke-width="16" stroke-linecap="round"/>
  <path d="M122 118 Q170 112 222 118 L262 126" fill="none" stroke="#E2B33C" stroke-width="3" stroke-dasharray="6 4"/>
  <path d="M146 76 Q150 90 128 92" fill="none" stroke="#E2B33C" stroke-width="3" stroke-dasharray="6 4"/>
  <circle cx="294" cy="110" r="16" fill="#FF6B57" stroke="#B5402F" stroke-width="2"/><path d="M280 104 Q294 116 308 104" fill="none" stroke="#fff" stroke-width="2"/>
  ${inner}
</svg>`;
const STOPS = [
  { x: 150, y: 74, ar: 'العين ترى الكرة' },
  { x: 140, y: 92, ar: 'رسالة في عصب إلى الدماغ' },
  { x: 116, y: 46, ar: 'الدماغ يقرر: أمسكها!' },
  { x: 200, y: 116, ar: 'أمر في عصب إلى الذراع' },
  { x: 262, y: 128, ar: 'عضلات اليد تنقبض' },
];
const path = { id: 'E2', render() { need(); return `<div class="scene">${sayNar(E('E2').text)}<h2>${tx('الكرة قادمة! اضغط{|ي} محطات الرسالة بالترتيب من أولها إلى آخرها.')}</h2>
  ${body(STOPS.map((s, i) => `<g class="st" data-k="${i}" tabindex="0" role="button" aria-label="${s.ar}" style="cursor:pointer"><circle cx="${s.x}" cy="${s.y}" r="13" fill="#3E7BB6" opacity=".9"/><text class="n" x="${s.x}" y="${s.y + 4}" text-anchor="middle" font-size="12" font-weight="700" ${F} fill="#fff">؟</text></g>`).join(''))}
  <ol class="card" id="steps" style="margin:6px 0;padding-inline-start:22px;min-height:20px"></ol><div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let next = 0; $$('.st').forEach(g => tap(g, () => { const k = +g.dataset.k; if (next >= STOPS.length || k < next) return;
      if (k === next) { g.querySelector('circle').setAttribute('fill', '#2E9E6A'); g.querySelector('.n').textContent = String(k + 1); $('#steps').insertAdjacentHTML('beforeend', `<li>${tx(STOPS[k].ar)}</li>`); next++;
        if (next === STOPS.length) { fb('ok', 'هذه رحلة الرسالة: حاسة، ثم عصب إلى الدماغ، ثم قرار، ثم عصب إلى العضلة، ثم حركة. كلها في أقل من ثانية!'); award(); ok(); } else fb('ok', STOPS[k].ar); }
      else { noteMiss(); fb('bad', next === 0 ? 'ابدأ{|ي} من حيث تدخل الرسالة: من العين.' : 'ليس بعد. ما المحطة التي تلي «' + STOPS[next - 1].ar + '»؟'); } }));
    speak(tx(E('E2').text)); } };

/* منعكس أم قرار؟ (يحل محل E3) */
const ACTS = [
  { k: 'a', t: 'سحب اليد عن قدر ساخن', r: 0, w: 'منعكس: الحبل الشوكي يردّ قبل أن يحسّ الدماغ بالحرارة.' },
  { k: 'b', t: 'اختيار جواب في الاختبار', r: 1, w: 'قرار: الدماغ يفكر ويوازن قبل أن يأمر اليد.' },
  { k: 'c', t: 'الرمش حين تقترب ذبابة من العين', r: 0, w: 'منعكس يحمي العين، ويصعب منعه.' },
  { k: 'd', t: 'رمي الكرة إلى زميل', r: 1, w: 'قرار: نختار متى نرمي وإلى من.' },
  { k: 'e', t: 'ارتفاع الساق بعد ضربة خفيفة تحت الركبة', r: 0, w: 'منعكس الركبة: يحدث وحده بلا قرار.' },
  { k: 'f', t: 'رفع اليد لأسأل المعلم', r: 1, w: 'قرار: نقرر أن نسأل ثم نرفع اليد.' },
];
const sort = { id: 'E3', render() { need(); return `<div class="scene">${sayNar(E('E3').text)}<h2>${tx('منعكس أم قرار؟ اختر{|ي} لكل حركة.')}</h2>
  <div class="card">${ACTS.map(a => `<div style="margin:6px 0"><b>${tx(a.t)}</b><div class="row" style="flex-wrap:wrap">${['منعكس', 'قرار'].map((o, i) => `<button class="opt" style="width:auto" data-q="${a.k}" data-v="${i}">${o}</button>`).join('')}</div></div>`).join('')}
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div></div>`; },
  after() { const r = store.get('rflx', {}); const chk = () => { if (ACTS.every(a => r[a.k] === a.r)) { award(); ok(); } else need(); };
    ACTS.forEach(a => { if (r[a.k] != null) $(`[data-q="${a.k}"][data-v="${r[a.k]}"]`)?.classList.add(r[a.k] === a.r ? 'ok' : 'bad'); });
    $$('[data-q]').forEach(b => b.onclick = () => { const a = ACTS.find(x => x.k === b.dataset.q); r[a.k] = +b.dataset.v; store.set('rflx', r); $$(`[data-q="${a.k}"]`).forEach(x => x.classList.remove('ok', 'bad')); const right = r[a.k] === a.r; b.classList.add(right ? 'ok' : 'bad'); if (!right) noteMiss(); fb(right ? 'ok' : 'bad', [right ? 'نعم. ' : 'فكّر{|ي} مرة أخرى: هل يحدث قبل أن {تقرر|تقرري}؟ ', right ? a.w : '']); chk(); });
    chk(); speak(tx(E('E3').text)); } };

/* سرعة الرسالة (يحل محل E5، المستوى ب) */
const speed = { id: 'E5', render() { need(); return `<div class="scene">${sayNar(E('E5').text)}<h2>${tx('حرّك{|ي} المنزلق: كم تأخذ رسالة من إصبع قدمك{|ِ} إلى دماغك{|ِ}؟ (نحو 1.2 متر)')}</h2>
  <input type="range" id="v" min="1" max="120" value="60" style="width:100%" aria-label="سرعة الرسالة في العصب بالمتر في الثانية">
  <div class="card"><div>${tx('سرعة العصب:')} <b id="vv"></b></div><div>${tx('زمن الرسالة:')} <b id="tt"></b></div>
  <svg viewBox="0 0 320 40" style="width:100%;max-width:340px;display:block;margin:6px auto" aria-hidden="true"><rect x="10" y="14" width="300" height="12" rx="6" fill="#EEE"/><rect id="bar" x="10" y="14" width="0" height="12" rx="6" fill="#E2B33C"/></svg>
  <div id="st" style="margin-top:4px"></div></div></div>`; },
  after() { const seen = { slow: false, fast: false }; let fin = false;
    const upd = () => { const v = +$('#v').value, t = 1.2 / v; $('#vv').textContent = v + ' متراً في الثانية';
      $('#tt').textContent = t >= 1 ? t.toFixed(1) + ' ثانية' : Math.round(t * 1000) + ' جزءاً من ألف من الثانية';
      const w = Math.min(300, 300 * t / 1.2); $('#bar').setAttribute('width', w); $('#bar').setAttribute('x', 310 - w);
      if (v <= 2) seen.slow = true; if (v >= 100) seen.fast = true;
      $('#st').textContent = v >= 70 ? tx('عصب سريع، كأعصاب اللمس والحركة: الرسالة تصل قبل أن {ترمش|ترمشي}.') : v <= 3 ? tx('عصب بطيء، كبعض أعصاب الألم والحرارة: لذلك {تحس|تحسين} باللمسة أولاً ثم بالألم.') : '';
      if (!fin && seen.slow && seen.fast) { fin = true; fb('ok', 'سريعة جداً، لكن لها زمن دائماً. وفي العصب البطيء يتأخر الألم ثانية أو أكثر.'); award(); ok(); } };
    $('#v').oninput = upd; upd(); speak(tx(E('E5').text)); } };

/* التجربة */
const X = LD.experiment;
const Q = [
  { k: 'a', q: 'بعد الضربة الخفيفة تحت الركبة: هل ارتفعت ساقك{|ِ} وحدها؟', o: ['نعم، وحدها', 'لا، رفعتها أنا'], r: 0, w: 'ترتفع وحدها لأنه منعكس. إن لم تتحرك فجرّب{|ي} ضربة أدق تحت عظمة الركبة، وساقك{|ِ} مرتخية.' },
  { k: 'b', q: 'أيّ المسكين أخذ وقتاً أطول؟', o: ['المسك البسيط', 'المسك بقرار «الآن أو لا»'], r: 1, w: 'المسك بقرار أطول غالباً: الدماغ يحتاج وقتاً ليقرر.' },
  { k: 'c', q: 'من أمر الساق أن ترتفع؟', o: ['الدماغ بعد تفكير', 'الحبل الشوكي مباشرة'], r: 1, w: 'الحبل الشوكي ردّ مباشرة: هذا طريق المنعكس.' },
];
const exp = { id: 'exp', render() { need(); return `<div class="scene"><h2>${tx('تجربة: ' + X.title)}</h2><div class="card" style="background:#FFF3D6"><b>السلامة:</b> ${X.safety.slice(0, 2).map(tx).join(' ')}${safetyMore(X, 2)}</div>
  <div class="card"><b>${tx('تحتاج{|ين}:')}</b> ${X.materials.map(tx).join('، ')}</div><div class="card">${X.steps.map((s, i) => `<b>${i + 1}.</b> ${tx(s)}`).join('<br>')}</div>
  <div class="card"><label>${tx('الرقم الأوسط في المسك البسيط (سم):')} <input type="number" id="m1" min="0" max="30" style="width:5em"></label><br><label>${tx('الرقم الأوسط في المسك بقرار (سم):')} <input type="number" id="m2" min="0" max="30" style="width:5em"></label><div id="dif" class="note"></div></div>
  <div class="card">${Q.map(q => `<b>${tx(q.q)}</b><div class="row" style="flex-wrap:wrap">${q.o.map((o, i) => `<button class="opt" style="width:auto" data-q="${q.k}" data-v="${i}">${tx(o)}</button>`).join('')}</div>`).join('')}<div class="fb" id="fb" role="status" aria-live="polite"></div></div></div>`; },
  after() { const r = store.get('nrvx', {}); const chk = () => { if (Q.every(q => r[q.k] === q.r)) { award(); ok(); } else need(); };
    const show = () => { const a = r.m1, b = r.m2; if (a == null || b == null) { $('#dif').textContent = ''; return; }
      $('#dif').textContent = b > a ? tx('سقطت المسطرة ' + (b - a) + ' سم أكثر حين احتجت{|ِ} أن {تقرر|تقرري}: هذا وقت القرار.') : tx('لم يظهر فرق هذه المرة. {أعد|أعيدي} المحاولات و{خذ|خذي} الرقم الأوسط؛ الفرق صغير وقد يختفي في محاولة واحدة.'); };
    ['m1', 'm2'].forEach(id => { const el = $('#' + id); if (r[id] != null) el.value = r[id]; el.oninput = () => { const v = el.value === '' ? null : +el.value; r[id] = v; store.set('nrvx', r); show(); }; });
    Q.forEach(q => { if (r[q.k] != null) $(`[data-q="${q.k}"][data-v="${r[q.k]}"]`)?.classList.add(r[q.k] === q.r ? 'ok' : 'bad'); });
    $$('[data-q]').forEach(b => b.onclick = () => { const q = Q.find(x => x.k === b.dataset.q); r[q.k] = +b.dataset.v; store.set('nrvx', r); $$(`[data-q="${q.k}"]`).forEach(x => x.classList.remove('ok', 'bad')); const right = r[q.k] === q.r; b.classList.add(right ? 'ok' : 'bad'); if (!right) noteMiss(); fb(right ? 'ok' : 'bad', [right ? 'نعم: ' : 'لاحظ{|ي} مرة أخرى. ', q.w]); chk(); });
    show(); chk(); speak([SAY.experiment, tx(X.title)]); } };

window.CUSTOM = { replace: { E2: path, E3: sort, E5: speed, exp } };
})();
