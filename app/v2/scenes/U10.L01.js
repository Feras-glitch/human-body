/* تأليف خاص — U10.L01 «كيف أكبر؟» */
(() => {
const E = id => LD.explain.find(e => e.id === id);
const tap = (el, fn) => { el.onclick = fn; el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }; };

/* اقسم الخلايا: واحدة ← اثنتان ← أربع ← ثمانٍ ← ست عشرة (يحل محل E1) */
const cellSvg = (x, y, r) => `<g><circle cx="${x}" cy="${y}" r="${r}" fill="#F7E3EC" stroke="#B77B97" stroke-width="2.5"/><circle cx="${x}" cy="${y}" r="${(r * .36).toFixed(1)}" fill="#C79BC0"/></g>`;
const layout = n => { const cols = Math.ceil(Math.sqrt(n)), rows = Math.ceil(n / cols), r = Math.min(46, 120 / cols); const out = [];
  for (let i = 0; i < n; i++) { const c = i % cols, w = Math.floor(i / cols); out.push(cellSvg(160 + (c - (cols - 1) / 2) * r * 2.3, 110 + (w - (rows - 1) / 2) * r * 2.3, r)); } return out.join(''); };
const NAMES = ['خلية واحدة', 'خليتان', 'أربع خلايا', 'ثماني خلايا', 'ست عشرة خلية'];
const divide = { id: 'E1', render() { need(); return `<div class="scene">${sayNar(E('E1').text)}<h2>${tx('{اقسم|اقسمي} الخلايا: كل ضغطة تقسم كل خلية خليتين.')}</h2>
  <svg id="cells" viewBox="0 0 320 220" role="img" aria-label="خلايا تنقسم" style="width:100%;max-width:340px;display:block;margin:auto;background:#fff;border-radius:18px"></svg>
  <div class="card" style="text-align:center"><b id="cn"></b></div>
  <button class="opt" id="go" style="text-align:center">${tx('{اقسم|اقسمي} الخلايا')}</button>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let k = 0; const go = $('#go');
    const draw = () => { $('#cells').innerHTML = layout(2 ** k); $('#cn').textContent = NAMES[k]; };
    go.onclick = () => { if (k >= 4) return; k++; draw();
      if (k === 4) { go.textContent = '✔ ' + tx('أربع مرات'); fb('ok', 'أربع مرات فقط صارت الخلية الواحدة ست عشرة. وجسمك{|ِ} فيه ملايين الملايين من الخلايا، كلها جاءت بالانقسام.'); award(); ok(); }
      else fb('ok', 'كل خلية نسخت ما فيها ثم انقسمت. {اضغط|اضغطي} مرة أخرى.'); };
    draw(); speak(tx(E('E1').text)); } };

/* أين يطول العظم؟ وكيف يتوقف؟ (يحل محل E2) */
const ZONES = [{ y: 34, lb: 'قرب الطرف العلوي', ok: true }, { y: 120, lb: 'الوسط', ok: false }, { y: 206, lb: 'قرب الطرف السفلي', ok: true }];
const plate = { id: 'E2', render() { need(); return `<div class="scene">${sayNar(E('E2').text)}<h2>${tx('{اضغط|اضغطي} حيث يطول العظم، ثم {حرّك|حرّكي} العمر.')}</h2>
  <svg viewBox="0 0 320 250" role="img" aria-label="عظم الفخذ وصفيحتا النمو" style="width:100%;max-width:340px;display:block;margin:auto;background:#fff;border-radius:18px">
    <g id="bone"><rect id="shaft" x="146" y="44" width="28" height="152" rx="10" fill="#F6EEDC" stroke="#B8A585" stroke-width="3"/>
      <ellipse id="headTop" cx="160" cy="30" rx="34" ry="20" fill="#F6EEDC" stroke="#B8A585" stroke-width="3"/><ellipse id="headBot" cx="160" cy="212" rx="36" ry="18" fill="#F6EEDC" stroke="#B8A585" stroke-width="3"/>
      <rect id="p0" x="134" y="44" width="52" height="8" rx="4" fill="#BFE7F2" stroke="#4FA3B8" stroke-width="2"/><rect id="p2" x="134" y="190" width="52" height="8" rx="4" fill="#BFE7F2" stroke="#4FA3B8" stroke-width="2"/></g>
    ${ZONES.map((z, i) => `<rect class="st" data-k="${i}" tabindex="0" role="button" aria-label="${z.lb}" x="100" y="${z.y - 18}" width="120" height="36" rx="12" fill="#3E7BB6" fill-opacity=".08" stroke="#3E7BB6" stroke-dasharray="5 4" style="cursor:pointer"/>`).join('')}
  </svg>
  <label style="display:block;margin-top:6px">${tx('العمر:')} <b id="ag"></b><input type="range" id="age" min="0" max="100" value="0" style="width:100%" aria-label="العمر من طفل إلى كبير"></label>
  <div class="row" style="justify-content:space-between"><span>${tx('طفل')}</span><span>${tx('كبير')}</span></div>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { const got = new Set(); let old = false, fin = false;
    const check = () => { if (!fin && got.size === 2 && old) { fin = true; fb('ok', 'العظم يطول من صفيحتي النمو قرب طرفيه، وحين تتصلبان في آخر البلوغ يتوقف ازدياد الطول.'); award(); ok(); } };
    $$('.st').forEach(r => tap(r, () => { const z = ZONES[+r.dataset.k];
      if (z.ok) { got.add(+r.dataset.k); r.setAttribute('fill', '#2E9E6A'); r.setAttribute('fill-opacity', '.25'); if (got.size < 2) fb('ok', 'نعم، هنا صفيحة نمو. وأين الأخرى؟'); else if (!old) fb('ok', 'الصفيحتان قرب الطرفين. {حرّك|حرّكي} العمر حتى {تصل|تصلي} إلى الكبير.'); }
      else { noteMiss(); fb('bad', 'الوسط عظم صلب لا يطول منه العظم. {ابحث|ابحثي} قرب الطرفين.'); }
      check(); }));
    const upd = () => { const v = +$('#age').value, L = 152 + v * .5;
      $('#shaft').setAttribute('y', 120 - L / 2); $('#shaft').setAttribute('height', L);
      $('#headTop').setAttribute('cy', 120 - L / 2 - 14); $('#headBot').setAttribute('cy', 120 + L / 2 + 16);
      $('#p0').setAttribute('y', 120 - L / 2); $('#p2').setAttribute('y', 120 + L / 2 - 8);
      const done = v >= 95; ['#p0', '#p2'].forEach(s => { $(s).setAttribute('fill', done ? '#EADCC0' : '#BFE7F2'); $(s).setAttribute('stroke', done ? '#B8A585' : '#4FA3B8'); });
      $('#ag').textContent = tx(v < 30 ? 'طفل صغير' : v < 70 ? 'في عمرك{|ِ}' : v < 95 ? 'في البلوغ' : 'كبير: الصفيحتان صارتا عظماً');
      if (done) old = true; check(); };
    $('#age').oninput = upd; upd(); speak(tx(E('E2').text)); } };

/* صباحاً ومساءً: الأقراص بين الفقرات (يحل محل E5) */
const disc = (y, h) => `<ellipse cx="160" cy="${y}" rx="30" ry="${h / 2}" fill="#A9DDEB" stroke="#3E8FA8" stroke-width="2"/>`;
const spineSvg = sq => { let y = 18, q = ''; const dh = 12 * (1 - .5 * sq); for (let i = 0; i < 7; i++) { q += `<rect x="130" y="${y}" width="60" height="22" rx="7" fill="#F6EEDC" stroke="#B8A585" stroke-width="2"/>`; y += 22; if (i < 6) { q += disc(y + dh / 2, dh); y += dh; } } return { q, top: 18, bottom: y }; };
const dayNight = { id: 'E5', render() { need(); return `<div class="scene">${sayNar(E('E5').text)}<h2>${tx('{اختر|اختاري} الوقت، و{راقب|راقبي} الأقراص بين الفقرات.')}</h2>
  <svg viewBox="0 0 320 240" role="img" aria-label="عمود فقري: فقرات وبينها أقراص" style="width:100%;max-width:340px;display:block;margin:auto;background:#fff;border-radius:18px"><g id="sp"></g><line x1="40" y1="232" x2="280" y2="232" stroke="#C9BBA8" stroke-width="4"/><line id="mk" x1="60" x2="260" stroke="#2BB3A3" stroke-width="3" stroke-dasharray="8 6"/><line id="mk0" x1="60" x2="260" stroke="#FFC93C" stroke-width="2" stroke-dasharray="3 5" opacity="0"/></svg>
  <div class="row" style="justify-content:center;flex-wrap:wrap;gap:8px"><button class="opt ch" style="width:auto" data-t="am">${tx('☀ بعد الاستيقاظ')}</button><button class="opt ch" style="width:auto" data-t="pm">${tx('☾ قبل النوم')}</button></div>
  <div class="card" id="out" style="min-height:40px"></div><div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { const seen = new Set(); let fin = false;
    const draw = t => { const s = spineSvg(t === 'pm' ? 1 : 0), off = 232 - s.bottom; $('#sp').setAttribute('transform', `translate(0 ${off})`); $('#sp').innerHTML = s.q;
      $('#mk').setAttribute('y1', s.top + off); $('#mk').setAttribute('y2', s.top + off);
      const am = spineSvg(0); $('#mk0').setAttribute('y1', am.top + 232 - am.bottom); $('#mk0').setAttribute('y2', am.top + 232 - am.bottom); $('#mk0').setAttribute('opacity', t === 'pm' ? 1 : 0);
      $('#out').innerHTML = tx(t === 'am' ? 'في الصباح: الأقراص ممتلئة بعد الاستلقاء طوال الليل، و{أنت|أنتِ} في أطول طولك{|ِ} في اليوم.' : 'قبل النوم: الأقراص انضغطت قليلاً من الوقوف والمشي، فقصر طولك{|ِ} قليلاً، نحو نصف سنتيمتر في المتوسط. والخط الأصفر علامة الصباح.'); };
    $$('.ch').forEach(b => b.onclick = () => { const t = b.dataset.t; seen.add(t); b.classList.add('ok'); draw(t);
      if (!fin && seen.size === 2) { fin = true; fb('ok', 'ليس نمواً ولا نقصاً: يعود كل ليلة. ولهذا نقيس الطول دائماً في الوقت نفسه من اليوم.'); award(); ok(); } });
    draw('am'); speak(tx(E('E5').text)); } };

window.CUSTOM = { replace: { E1: divide, E2: plate, E5: dayNight } };
})();
