/* تأليف خاص — U07.L01 «الكليتان: مصفاتان تعيدان ما ينفع» */
(() => {
const E = id => LD.explain.find(e => e.id === id);
const F = 'font-family="IBM Plex Sans Arabic"';
const T = 'paint-order="stroke" stroke="#fff" stroke-width="3.5" stroke-linejoin="round"';
/* النقر واللوحة معاً: كل عنصر قابل للمس يعمل أيضاً بزر الإدخال والمسافة */
const tap = (el, fn) => { el.onclick = fn; el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }; };

/* 1. أين كليتاك؟ (يحل محل E1): رسم ظهر طفل من الخلف وثلاثة أشرطة للمس */
const ZONES = [
  { y: 82, h: 44, ar: 'أعلى الظهر عند لوحَي الكتف', ok: 0, why: 'هنا لوحا الكتف وخلفهما الرئتان. الكليتان أسفل من ذلك.' },
  { y: 140, h: 48, ar: 'تحت آخر ضلع، على جانبي العمود الفقري', ok: 1, why: '' },
  { y: 196, h: 40, ar: 'أسفل الظهر عند الحوض', ok: 0, why: 'هنا عظم الحوض. الكليتان أعلى منه، تحت آخر ضلع.' },
];
const back = () => `<svg viewBox="0 0 240 290" role="img" aria-label="ظهر طفل من الخلف: العمود الفقري والأضلاع" style="width:100%;max-width:300px;display:block;margin:auto;background:#fff;border-radius:18px">
  <circle cx="120" cy="34" r="25" fill="#F1C9A5"/><rect x="108" y="56" width="24" height="16" fill="#F1C9A5"/>
  <path d="M62 74 Q120 64 178 74 L186 236 Q120 250 54 236 Z" fill="#F7DCC3" stroke="#C99A78" stroke-width="2"/>
  <path d="M62 78 L30 170 L44 176 L70 104 M178 78 L210 170 L196 176 L170 104" fill="#F1C9A5" stroke="#C99A78" stroke-width="2"/>
  <line x1="120" y1="72" x2="120" y2="238" stroke="#9C7A5B" stroke-width="5" stroke-dasharray="7 4" stroke-linecap="round"/>
  ${[96, 110, 124, 138].map((y, i) => `<path d="M120 ${y} Q${92 - i * 2} ${y + 6} ${70 - i} ${y + 16} M120 ${y} Q${148 + i * 2} ${y + 6} ${170 + i} ${y + 16}" fill="none" stroke="#B5917A" stroke-width="2.2"/>`).join('')}
  <path d="M120 148 Q96 154 78 168 M120 148 Q144 154 162 168" fill="none" stroke="#8E6A52" stroke-width="2.6"/>
  <g id="kid" opacity="0" style="transition:opacity .8s">
    <ellipse cx="98" cy="166" rx="12" ry="20" fill="#B34A4A" stroke="#7A2A2A" stroke-width="2"/><ellipse cx="142" cy="174" rx="12" ry="20" fill="#B34A4A" stroke="#7A2A2A" stroke-width="2"/>
    <path d="M104 162 q4 4 0 8 M136 170 q-4 4 0 8" stroke="#F7DCC3" stroke-width="3" fill="none"/>
    <g font-size="10.5" font-weight="600" ${F} ${T} fill="#5a1f1f"><text x="58" y="200" text-anchor="middle">اليسرى</text><text x="184" y="208" text-anchor="middle">اليمنى (أنزل قليلاً)</text></g>
  </g>
  ${ZONES.map((z, i) => `<g class="st" data-k="${i}" tabindex="0" role="button" aria-label="${z.ar}" style="cursor:pointer"><rect x="58" y="${z.y}" width="124" height="${z.h}" rx="10" fill="#7FB3E6" opacity=".16" stroke="#3E7BB6" stroke-dasharray="5 4"/><circle cx="196" cy="${z.y + z.h / 2}" r="10" fill="#3E7BB6"/><text x="196" y="${z.y + z.h / 2 + 4}" text-anchor="middle" font-size="12" font-weight="700" fill="#fff" ${F}>${i + 1}</text></g>`).join('')}
</svg>`;
const spot = { id: 'E1', render() { need(); return `<div class="scene">${sayNar(E('E1').text)}<h2>${tx('هذا ظهر طفل من الخلف. اضغط{|ي} على المكان الذي تختبئ فيه الكليتان.')}</h2>${back()}
  <div class="row" style="justify-content:center;flex-wrap:wrap;gap:6px;margin-top:6px">${ZONES.map((z, i) => `<span class="chip" style="font-size:.85rem">${i + 1}. ${z.ar}</span>`).join('')}</div>
  <p class="note">${tx('ننظر إلى الظهر من الخلف، فيمين الطفل في الرسم على يمينك{|ِ}.')}</p><div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let found = false; $$('.st').forEach(g => tap(g, () => { if (found) return; const z = ZONES[+g.dataset.k];
      if (z.ok) { found = true; $('#kid').setAttribute('opacity', '1'); g.querySelector('rect').setAttribute('opacity', '.05'); fb('ok', 'نعم! تحت آخر ضلع، على جانبي العمود الفقري: كليتان بحجم القبضة، واليمنى أنزل قليلاً لأن الكبد فوقها.'); award(); ok(); }
      else { noteMiss(); g.querySelector('rect').setAttribute('fill', '#E58B8B'); fb('bad', z.why); } }));
    speak(tx(E('E1').text)); } };

/* 2. أنت{|ِ} المصفاة (يحل محل E2): ما يعبر وما يبقى */
const BITS = [[32, 62, 'ماء', 'w', 1], [84, 46, 'سكر', 's', 1], [136, 64, 'ملح', 'n', 1], [186, 46, 'يوريا', 'u', 1], [240, 60, 'خلية حمراء', 'r', 0], [282, 50, 'بروتين كبير', 'p', 0]];
const SAYS = { w: 'الماء يعبر المصفاة.', s: 'السكر صغير ذائب: يعبر — وسيعود كله تقريباً إلى الدم بعد قليل.', n: 'الملح ذائب صغير: يعبر.', u: 'اليوريا صغيرة: تعبر، وهي فضلة ستخرج في البول.', r: 'الخلية الحمراء كبيرة على ثقوب المصفاة: تبقى في الدم.', p: 'البروتين الكبير لا يعبر: يبقى في الدم.' };
const filter = { id: 'E2', render() { need(); return `<div class="scene">${sayNar(E('E2').text)}<h2>${tx('أنت{|ِ} مصفاة الكلية. اضغط{|ي} على كل شيء في الدم: ماذا يعبر؟')}</h2>
  <svg viewBox="0 0 320 230" role="img" aria-label="مصفاة الكلية: فوقها الدم وتحتها السائل المرشَّح" style="width:100%;max-width:340px;display:block;margin:auto;background:#fff;border-radius:18px">
    <rect x="0" y="0" width="320" height="118" fill="#FBE3E3"/><rect x="0" y="126" width="320" height="104" fill="#FFF8DC"/>
    <g font-size="11" font-weight="600" ${F} ${T}><text x="312" y="16" text-anchor="start" fill="#8a1f2f">الدم في الكبة</text><text x="312" y="222" text-anchor="start" fill="#7a5a10">السائل المرشَّح</text></g>
    <line x1="0" y1="122" x2="320" y2="122" stroke="#8a6d5a" stroke-width="7" stroke-dasharray="14 5"/>
    ${BITS.map(([x, y, t, k, okk]) => `<g class="mol" data-ok="${okk}" data-k="${k}" tabindex="0" role="button" aria-label="${t}" data-to="translate(0px,${168 - y}px)" style="cursor:pointer;transition:transform .9s ease-in">${okk ? `<circle cx="${x}" cy="${y}" r="9" fill="${k === 'u' ? '#C9A227' : k === 'w' ? '#5DA9E9' : k === 's' ? '#F2F2F2' : '#BFC7D5'}" stroke="#555" stroke-width="1.5"/>` : k === 'r' ? `<ellipse cx="${x}" cy="${y}" rx="19" ry="15" fill="#D9485A" stroke="#8a1f2f" stroke-width="2"/>` : `<path d="M${x - 20} ${y} q10 -18 20 0 q10 18 20 0" stroke="#6D4C9F" stroke-width="7" fill="none" stroke-linecap="round"/>`}<text x="${x}" y="${y + (okk ? 24 : 32)}" text-anchor="middle" font-size="11" font-weight="600" fill="#2A2422" ${F} ${T}>${t}</text></g>`).join('')}
  </svg><div class="fb" id="fb" role="status" aria-live="polite"></div><div class="card" id="sum" hidden></div></div>`; },
  after() { let n = 0; $$('.mol').forEach(m => tap(m, () => { if (m.dataset.d) return; m.dataset.d = 1; const k = m.dataset.k;
      if (m.dataset.ok === '1') { n++; m.style.transform = m.dataset.to; fb('ok', SAYS[k]); }
      else { noteMiss(); m.style.transform = 'translateY(-8px)'; setTimeout(() => { m.style.transform = ''; }, 500); fb('bad', SAYS[k]); }
      if (n === 4 && $('#sum').hidden) { $('#sum').hidden = false; $('#sum').innerHTML = tx('عبر الماء والسكر والملح واليوريا: هذا هو <b>الترشيح</b>. وعند الكبير يُرشَّح هكذا نحو 150 إلى 180 لتراً في اليوم، وتبقى الخلايا والبروتينات الكبيرة في الدم.'); award(); ok(); } }));
    speak(tx(E('E2').text)); } };

/* 3. كم تعيد الكليتان؟ (يحل محل E3): منزلق إعادة الامتصاص */
const reab = { id: 'E3', render() { need(); return `<div class="scene">${sayNar(E('E3').text)}<h2>${tx('حرّك{|ي} المنزلق: من كل 100 لتر رُشِّحت، كم {تعيد|تعيدين} إلى الدم؟')}</h2>
  <input type="range" id="back" min="0" max="99" value="0" style="width:100%" aria-label="كم لتراً يعود إلى الدم من كل 100">
  <svg viewBox="0 0 320 70" style="width:100%;max-width:340px;display:block;margin:6px auto;background:#fff;border-radius:12px" aria-hidden="true"><rect x="10" y="20" width="300" height="30" rx="8" fill="#F2D856"/><rect id="bk" x="10" y="20" width="0" height="30" rx="8" fill="#5DA9E9"/>
    <g font-size="11" font-weight="600" ${F} ${T}><text x="312" y="14" text-anchor="start" fill="#2e6aa3">يعود إلى الدم</text><text x="10" y="66" text-anchor="end" fill="#7a5a10">يصير بولاً</text></g></svg>
  <div class="card"><div>${tx('يعود إلى الدم:')} <b id="bv"></b></div><div>${tx('البول في اليوم (من نحو 150 لتراً):')} <b id="uv"></b></div><div id="st" style="margin-top:4px"></div></div></div>`; },
  after() { let fin = false; const upd = () => { if (fin) return; const v = +$('#back').value, urine = 150 * (100 - v) / 100;
      $('#bk').setAttribute('width', 3 * v); $('#bk').setAttribute('x', 310 - 3 * v); $('#bv').textContent = v + ' من كل 100 لتر'; $('#uv').textContent = (urine >= 10 ? Math.round(urine) : urine.toFixed(1)) + ' لتر';
      if (v >= 98) { fin = true; $('#back').disabled = true; $('#st').className = 'fb ok'; $('#st').innerHTML = tx('هذا ما تفعله كليتاك{|ِ}: يعود نحو 99 من كل 100، ويبقى لتر أو لتران بولاً في اليوم. هذه <b>إعادة الامتصاص</b>.'); speak(tx('هذا ما تفعله كليتاك{|ِ}: يعود نحو 99 من كل 100، ويبقى لتر أو لتران بولاً في اليوم.')); award(); ok(); }
      else $('#st').textContent = urine > 30 ? tx('لو خرج هذا كله لفقد الجسم ماءه في ساعات. {أعد|أعيدي} أكثر!') : 'ما زال كثيراً: الجسم يحتاج ماءه وسكّره.'; };
    $('#back').oninput = upd; upd(); speak(tx(E('E3').text)); } };

/* 4. التجربة */
const X = LD.experiment;
const Q = [
  { k: 'a', q: 'ماذا عبر المصفاة إلى الكوب؟', o: ['حبات الأرز', 'الماء الملوّن', 'لا شيء'], r: 1, w: 'الماء وما ذاب فيه عبر، وبقي الأرز الكبير فوقها: هكذا تبقى خلايا الدم.' },
  { k: 'b', q: 'من المئة حبة، كم بقي لصحن «البول»؟', o: ['حبة واحدة', 'خمسون', 'تسع وتسعون'], r: 0, w: 'تعود تسع وتسعون إلى الدم، وتبقى واحدة للبول.' },
  { k: 'c', q: 'أين وجدت{|ِ} الكليتين بيديك{|ِ}؟', o: ['أسفل البطن من الأمام', 'الظهر تحت آخر ضلع'], r: 1, w: 'في الظهر تحت آخر ضلع، على جانبي العمود الفقري.' },
];
const exp = { id: 'exp', render() { need(); return `<div class="scene"><h2>${tx('تجربة: ' + X.title)}</h2><div class="card" style="background:#FFF3D6"><b>السلامة:</b> ${X.safety.slice(0, 2).map(tx).join(' ')}${safetyMore(X, 2)}</div>
  <div class="card"><b>${tx('تحتاج{|ين}:')}</b> ${X.materials.map(tx).join('، ')}</div><div class="card">${X.steps.map((s, i) => `<b>${i + 1}.</b> ${tx(s)}`).join('<br>')}</div>
  <div class="card">${Q.map(q => `<b>${tx(q.q)}</b><div class="row" style="flex-wrap:wrap">${q.o.map((o, i) => `<button class="opt" style="width:auto" data-q="${q.k}" data-v="${i}">${tx(o)}</button>`).join('')}</div>`).join('')}<div class="fb" id="fb" role="status" aria-live="polite"></div></div></div>`; },
  after() { const r = store.get('kidx', {}); const chk = () => { if (Q.every(q => r[q.k] === q.r)) { award(); ok(); } else need(); };
    Q.forEach(q => { if (r[q.k] != null) $(`[data-q="${q.k}"][data-v="${r[q.k]}"]`)?.classList.add(r[q.k] === q.r ? 'ok' : 'bad'); });
    $$('[data-q]').forEach(b => b.onclick = () => { const q = Q.find(x => x.k === b.dataset.q); r[q.k] = +b.dataset.v; store.set('kidx', r); $$(`[data-q="${q.k}"]`).forEach(x => x.classList.remove('ok', 'bad')); const right = r[q.k] === q.r; b.classList.add(right ? 'ok' : 'bad'); if (!right) noteMiss(); fb(right ? 'ok' : 'bad', [right ? 'نعم: ' : 'لاحظ{|ي} مرة أخرى. ', q.w]); chk(); });
    chk(); speak([SAY.experiment, tx(X.title)]); } };

window.CUSTOM = { replace: { E1: spot, E2: filter, E3: reab, exp } };
})();
