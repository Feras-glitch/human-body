/* تأليف خاص — U08.L05 «الذاكرة والنوم» */
(() => {
const E = id => LD.explain.find(e => e.id === id);
const F = 'font-family="IBM Plex Sans Arabic"';
const BTN = 'style="width:auto;background:var(--card);padding:10px 14px;box-shadow:0 3px 0 var(--line);margin:4px"';

/* منحنى النسيان والمراجعة المتباعدة (يحل محل E2) — رسم توضيحي بلا أرقام */
const X0 = 30, X1 = 300, Y0 = 170, Y1 = 34, DAYS = 7;
const px = t => X1 - (t / DAYS) * (X1 - X0);            /* الزمن يجري من اليمين إلى اليسار كاتجاه القراءة (كما في U06.L03) */
const py = r => Y0 - r * (Y0 - Y1);
const keep = (t, revs) => { let last = 0, S = 0.8; for (const d of revs) { if (d <= t) { last = d; S *= 2.5; } } return 0.2 + 0.8 * Math.exp(-(t - last) / S); };
const path = revs => { let d = ''; const steps = 140; let prev = null;
  for (let i = 0; i <= steps; i++) { const t = DAYS * i / steps; const jump = revs.find(r => prev != null && prev < r && t >= r);
    if (jump != null) d += ` L${px(jump).toFixed(1)} ${py(keep(jump - 1e-6, revs)).toFixed(1)} L${px(jump).toFixed(1)} ${py(1).toFixed(1)}`;
    d += (i ? ' L' : 'M') + px(t).toFixed(1) + ' ' + py(keep(t, revs)).toFixed(1); prev = t; }
  return d; };
const REV = [[1, 'مراجعة بعد يوم'], [3, 'بعد 3 أيام'], [6, 'بعد 6 أيام']];
const curve = { id: 'E2', render() { need(); return `<div class="scene">${sayNar(E('E2').text)}<h2>${tx('الخط الرمادي: ما يبقى بلا مراجعة. {أضف|أضيفي} المراجعات الثلاث، و{انظر|انظري} ماذا يحدث للخط الأزرق.')}</h2>
  <svg viewBox="0 0 320 210" role="img" aria-label="منحنى النسيان: ما يبقى في الذاكرة عبر سبعة أيام، بلا مراجعة ومع مراجعات متباعدة" style="width:100%;max-width:380px;display:block;margin:auto;background:#fff;border-radius:18px">
    <line x1="${X1}" y1="${Y0}" x2="${X0}" y2="${Y0}" stroke="#999" stroke-width="1.5"/><line x1="${X1}" y1="${Y0}" x2="${X1}" y2="${Y1 - 8}" stroke="#999" stroke-width="1.5"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map(d => `<text x="${px(d)}" y="${Y0 + 16}" text-anchor="middle" font-size="11" ${F} fill="#666">${d}</text>`).join('')}
    <text x="${(X0 + X1) / 2}" y="${Y0 + 34}" text-anchor="middle" font-size="12" ${F} fill="#555">الأيام بعد الحفظ ←</text>
    <text x="${X1 + 12}" y="${Y1 - 14}" text-anchor="start" font-size="11" ${F} fill="#555">ما يبقى في الذاكرة</text>
    <path d="${path([])}" fill="none" stroke="#B9B9B9" stroke-width="3" stroke-dasharray="6 5"/>
    <path id="cv" d="${path([])}" fill="none" stroke="#3E7BB6" stroke-width="3.5" stroke-linejoin="round"/>
    <g id="marks"></g>
  </svg>
  <div class="row" style="justify-content:center;flex-wrap:wrap">${REV.map(([d, l], i) => `<button class="tool" data-r="${i}" ${BTN}>${tx(l)}</button>`).join('')}</div>
  <div class="note" style="text-align:center">${tx('رسم توضيحي: سرعة النسيان تختلف من شخص إلى آخر ومن درس إلى آخر.')}</div>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { const revs = new Set();
    $$('[data-r]').forEach(b => b.onclick = () => { const [d] = REV[+b.dataset.r]; if (revs.has(d)) return; revs.add(d); b.disabled = true;
      const list = [...revs].sort((a, c) => a - c); $('#cv').setAttribute('d', path(list));
      $('#marks').innerHTML = list.map(r => `<circle cx="${px(r)}" cy="${py(1)}" r="5" fill="#2E9E6A"/>`).join('');
      if (revs.size === REV.length) { fb('ok', 'كل مراجعة ترفع ما بقي، ويصير النسيان بعدها أبطأ: هذه قوة التباعد. وأقوى المراجعة أن {تسأل|تسألي} نفسك{|ِ} لا أن {تعيد|تعيدي} القراءة.'); award(); ok(); }
      else fb('ok', 'ارتفع الخط بعد المراجعة، ثم صار ينزل أبطأ من قبل.'); });
    speak(tx(E('E2').text)); } };

/* حاسبة النوم (يحل محل E3) */
const clock = (m, night) => { m = ((m % 1440) + 1440) % 1440; const h = Math.floor(m / 60), mm = String(m % 60).padStart(2, '0');
  if (m === 0) return '12:00 منتصف الليل'; const h12 = h > 12 ? h - 12 : h; return h12 + ':' + mm + (night ? (h >= 12 ? ' مساءً' : ' بعد منتصف الليل') : ' صباحاً'); };
const sleep = { id: 'E3', render() { need(); return `<div class="scene">${sayNar(E('E3').text)}<h2>${tx('{احسب|احسبي} ساعات نومك{|ِ}: {حرّك|حرّكي} موعد النوم وموعد الاستيقاظ.')}</h2>
  <div class="card"><label style="display:block">${tx('موعد النوم:')} <b id="bv"></b><input type="range" id="bed" min="1140" max="1440" step="15" style="width:100%" aria-label="موعد النوم"></label>
  <label style="display:block;margin-top:8px">${tx('موعد الاستيقاظ:')} <b id="wv"></b><input type="range" id="wake" min="300" max="510" step="15" style="width:100%" aria-label="موعد الاستيقاظ"></label></div>
  <div class="card" style="text-align:center"><div>${tx('ساعات نومك{|ِ}:')} <b id="hv" style="font-size:1.3em"></b></div>
  <svg viewBox="0 0 320 44" style="width:100%;max-width:340px;display:block;margin:6px auto" aria-hidden="true"><rect x="10" y="16" width="300" height="12" rx="6" fill="#EEE"/><rect x="${310 - 300 * 12 / 14}" y="12" width="${300 * 3 / 14}" height="20" rx="4" fill="#2E9E6A" opacity=".18"/><rect id="bar" x="10" y="16" width="0" height="12" rx="6" fill="#3E7BB6"/><text x="${310 - 300 * 10.5 / 14}" y="42" text-anchor="middle" font-size="10" ${F} fill="#2E9E6A">9–12</text></svg>
  <div id="st"></div></div><div class="note">${tx('الطفل من 6 إلى 12 سنة يحتاج 9 إلى 12 ساعة؛ والموعد الثابت كل يوم يساعد الجسم.')}</div><div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { const r = store.get('sleepx', {}); const seen = { short: false, ok: false }; let fin = false;
    const bed = $('#bed'), wake = $('#wake'); bed.value = r.bed ?? 1260; wake.value = r.wake ?? 390;
    const upd = () => { const b = +bed.value, w = +wake.value, h = (w + 1440 - b) / 60; r.bed = b; r.wake = w; store.set('sleepx', r);
      $('#bv').textContent = clock(b, true); $('#wv').textContent = clock(w, false);
      $('#hv').textContent = (Number.isInteger(h) ? h : h.toFixed(2).replace(/0$/, '')) + ' ساعة';
      const wd = Math.max(4, Math.min(300, 300 * h / 14)); $('#bar').setAttribute('width', wd); $('#bar').setAttribute('x', 310 - wd);
      const good = h >= 9 && h <= 12; $('#bar').setAttribute('fill', good ? '#2E9E6A' : h < 9 ? '#E0525B' : '#E2B33C');
      if (h < 9) seen.short = true; if (good) seen.ok = true;
      $('#st').textContent = good ? tx('هذا يكفي طفلاً في عمرك{|ِ}.') : h < 9 ? tx('أقل من حاجتك{|ِ}: {نم|نامي} أبكر، فالدماغ يثبّت ما {تعلمته|تعلمتِه} في النوم.') : tx('أكثر من المعتاد لعمرك{|ِ}؛ إن كنت{|ِ} {تتعب|تتعبين} كثيراً رغم النوم الطويل {فأخبر|فأخبري} أهلك{|ِ}.');
      if (!fin && seen.short && seen.ok) { fin = true; fb('ok', 'ساعة واحدة من السهر قد تُنقص نومك{|ِ} عن حاجتك{|ِ}؛ والموعد الثابت يحميه.'); award(); ok(); } };
    bed.oninput = upd; wake.oninput = upd; upd(); speak(tx(E('E3').text)); } };

/* التجربة */
const X = LD.experiment;
const NUM = [['rr', 'الكلمات التي {تذكرتها|تذكرتِها} من قائمة إعادة القراءة (من 10):'], ['rt', 'الكلمات التي {تذكرتها|تذكرتِها} من قائمة الاسترجاع (من 10):']];
const Q = [
  { k: 'a', q: 'ما الذي اختلف بين القائمتين؟', o: ['الوقت الذي أخذته كل قائمة', 'طريقة الحفظ'], r: 1, w: 'أربع دقائق لكل قائمة؛ والطريقة وحدها تغيّرت: هذه مقارنة عادلة.' },
  { k: 'b', q: 'لماذا {نمت|نمتِ} في موعدك{|ِ} بين الحفظ والاختبار؟', o: ['لأن النوم يثبّت ما حفظته', 'لأن النوم يمسح القائمتين'], r: 0, w: 'النوم يثبّت القائمتين معاً، فتبقى المقارنة بين الطريقتين.' },
  { k: 'c', q: 'إذا {تذكرت|تذكرتِ} من القائمتين العدد نفسه، ماذا {تكتب|تكتبين}؟', o: ['أغيّر رقماً ليظهر الفرق المتوقع', 'أكتب ما وجدته وأقارن بأرقام الصف'], r: 1, w: 'العالِم يسجّل ما وجده لا ما تمناه؛ وأرقام الصف معاً أوضح من طفل واحد.' },
];
const exp = { id: 'exp', render() { need(); return `<div class="scene"><h2>${tx('تجربة: ' + X.title)}</h2><div class="card" style="background:#FFF3D6"><b>السلامة:</b> ${X.safety.slice(0, 2).map(tx).join(' ')}${safetyMore(X, 2)}</div>
  <div class="card"><b>${tx('تحتاج{|ين}:')}</b> ${X.materials.map(tx).join('، ')}</div><div class="card">${X.steps.map((s, i) => `<b>${i + 1}.</b> ${tx(s)}`).join('<br>')}</div>
  <div class="card">${NUM.map(([id, l]) => `<label style="display:block">${tx(l)} <input type="number" id="${id}" min="0" max="10" style="width:4em"></label>`).join('')}<div id="sum" class="note"></div></div>
  <div class="card">${Q.map(q => `<b>${tx(q.q)}</b><div class="row" style="flex-wrap:wrap">${q.o.map((o, i) => `<button class="opt" style="width:auto" data-q="${q.k}" data-v="${i}">${tx(o)}</button>`).join('')}</div>`).join('')}<div class="fb" id="fb" role="status" aria-live="polite"></div></div></div>`; },
  after() { const r = store.get('memx', {}); const chk = () => { if (Q.every(q => r[q.k] === q.r)) { award(); ok(); } else need(); };
    const sum = () => { const { rr, rt } = r; if (rr == null || rt == null) { $('#sum').textContent = ''; return; }
      $('#sum').textContent = rt > rr ? tx('{تذكرت|تذكرتِ} ' + (rt - rr) + ' كلمات أكثر من قائمة الاسترجاع. {اجمع|اجمعي} أرقامك{|ِ} مع أرقام الصف لتعرف{|ي} هل يتكرر ذلك.')
        : rt === rr ? tx('العدد نفسه هذه المرة. نسجّل ذلك بأمانة، ونقارن بأرقام الصف.')
        : tx('{تذكرت|تذكرتِ} من قائمة إعادة القراءة أكثر هذه المرة. نسجّل ما وجدناه، ونقارن بأرقام الصف؛ فطفل واحد ومرة واحدة لا يكفيان للحكم.'); };
    NUM.forEach(([id]) => { const el = $('#' + id); if (r[id] != null) el.value = r[id]; el.oninput = () => { r[id] = el.value === '' ? null : Math.max(0, Math.min(10, Math.round(+el.value))); store.set('memx', r); sum(); }; });
    Q.forEach(q => { if (r[q.k] != null) $(`[data-q="${q.k}"][data-v="${r[q.k]}"]`)?.classList.add(r[q.k] === q.r ? 'ok' : 'bad'); });
    $$('[data-q]').forEach(b => b.onclick = () => { const q = Q.find(x => x.k === b.dataset.q); r[q.k] = +b.dataset.v; store.set('memx', r); $$(`[data-q="${q.k}"]`).forEach(x => x.classList.remove('ok', 'bad')); const right = r[q.k] === q.r; b.classList.add(right ? 'ok' : 'bad'); if (!right) noteMiss(); fb(right ? 'ok' : 'bad', [right ? 'نعم: ' : 'فكّر{|ي} مرة أخرى. ', q.w]); chk(); });
    sum(); chk(); speak([SAY.experiment, tx(X.title)]); } };

window.CUSTOM = { replace: { E2: curve, E3: sleep, exp } };
})();
