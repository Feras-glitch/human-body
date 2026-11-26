/* تأليف خاص — U11.L01 «جسمي فريق واحد: حين أركض» */
(() => {
const E = id => LD.explain.find(e => e.id === id);
const tap = (el, fn) => { el.onclick = fn; el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }; };

/* سلسلة البدء: المس المحطات بالترتيب (يحل محل E1) */
const ST = [
  { x: 160, y: 30, lb: 'الدماغ يقرر', say: 'الدماغ يقرر أن يركض.' },
  { x: 160, y: 98, lb: 'الأعصاب تحمل الرسالة', say: 'الأعصاب تحمل الرسالة إلى الساقين.' },
  { x: 160, y: 178, lb: 'العضلات تنقبض', say: 'العضلات تنقبض وتسحب العظام.' },
];
const body = `<circle cx="160" cy="30" r="20" fill="#F4B8C4" stroke="#C9788A" stroke-width="3"/>
  <rect x="140" y="54" width="40" height="70" rx="16" fill="#E7EEF7" stroke="#8CA5C2" stroke-width="2"/>
  <line x1="160" y1="50" x2="160" y2="160" stroke="#FFC93C" stroke-width="3" stroke-dasharray="6 4"/>
  <rect x="142" y="124" width="14" height="80" rx="7" fill="#F2B6A0" stroke="#C47F66" stroke-width="2"/><rect x="164" y="124" width="14" height="80" rx="7" fill="#F2B6A0" stroke="#C47F66" stroke-width="2"/>`;
const chain = { id: 'E1', render() { need(); return `<div class="scene">${sayNar(E('E1').text)}<h2>${tx('{المس|المسي} محطات البدء بالترتيب: من أين تبدأ الخطوة؟')}</h2>
  <svg viewBox="0 0 320 220" role="img" aria-label="جسم يركض: الدماغ والأعصاب والعضلات" style="width:100%;max-width:340px;display:block;margin:auto;background:#fff;border-radius:18px">${body}
    ${ST.map((s, i) => `<rect class="st" data-k="${i}" tabindex="0" role="button" aria-label="${s.lb}" x="${s.x - 70}" y="${s.y - 18}" width="140" height="36" rx="12" fill="#3E7BB6" fill-opacity=".08" stroke="#3E7BB6" stroke-dasharray="5 4" style="cursor:pointer"/>`).join('')}
  </svg>
  <div class="card" id="out" style="min-height:40px"></div>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let k = 0;
    $$('.st').forEach(r => tap(r, () => { const i = +r.dataset.k; if (i < k) return;
      if (i === k) { r.setAttribute('fill', '#2E9E6A'); r.setAttribute('fill-opacity', '.25'); $('#out').innerHTML += (k ? ' ← ' : '') + tx(ST[i].lb); k++;
        if (k === ST.length) { fb('ok', 'الجهاز العصبي بدأ، والعضلات نفذت: جهازان في خطوة واحدة. والآن ستطلب العضلات أكسجيناً.'); award(); ok(); } else fb('ok', ST[i].say); }
      else { noteMiss(); fb('bad', 'ليس بعد. ما الذي يحدث قبل أن تنقبض العضلة؟'); } }));
    speak(tx(E('E1').text)); } };

/* منزلق الجهد: النبض والتنفس والشعيرات (يحل محل E2) */
const effort = { id: 'E2', render() { need(); return `<div class="scene">${sayNar(E('E2').text)}<h2>${tx('{حرّك|حرّكي} الجهد من الجلوس إلى الجري، و{راقب|راقبي} الفريق.')}</h2>
  <svg viewBox="0 0 320 200" role="img" aria-label="أشرطة النبض والتنفس، وشعيرات في عضلة تنفتح مع الجهد" style="width:100%;max-width:340px;display:block;margin:auto;background:#fff;border-radius:18px">
    <rect x="30" y="20" width="40" height="150" rx="8" fill="#F5F1EA"/><rect id="bp" x="30" y="150" width="40" height="20" rx="8" fill="#E0607E"/>
    <rect x="90" y="20" width="40" height="150" rx="8" fill="#F5F1EA"/><rect id="bb" x="90" y="150" width="40" height="20" rx="8" fill="#4FA3B8"/>
    <circle cx="50" cy="186" r="8" fill="#E0607E"/><circle cx="110" cy="186" r="8" fill="#4FA3B8"/>
    <rect x="160" y="30" width="140" height="140" rx="20" fill="#F2B6A0" stroke="#C47F66" stroke-width="2"/><g id="cap"></g></svg>
  <label style="display:block;margin-top:6px">${tx('الجهد:')} <b id="lv"></b><input type="range" id="eff" min="0" max="100" value="0" style="width:100%" aria-label="الجهد من الجلوس إلى الجري"></label>
  <div class="row" style="justify-content:space-between"><span>${tx('جلوس')}</span><span>${tx('جري')}</span></div>
  <div class="card" style="font-size:.9em">${tx('● الأحمر: النبض. ● الأزرق: التنفس. وعلى اليمين عضلة فيها شعيرات.')}</div>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let fin = false; const caps = Array.from({ length: 12 }, (_, i) => ({ x: 172 + (i % 4) * 30, y: 55 + Math.floor(i / 4) * 45 }));
    const upd = () => { const v = +$('#eff').value / 100, hp = 20 + v * 120, hb = 20 + v * 110;
      $('#bp').setAttribute('y', 170 - hp); $('#bp').setAttribute('height', hp); $('#bb').setAttribute('y', 170 - hb); $('#bb').setAttribute('height', hb);
      const open = Math.round(3 + v * 9); $('#cap').innerHTML = caps.map((c, i) => `<path d="M${c.x} ${c.y}q6 -8 12 0t12 0" fill="none" stroke="${i < open ? '#C0392B' : '#E8C3B6'}" stroke-width="${i < open ? 2 + v * 2 : 1.5}" stroke-linecap="round"/>`).join('');
      $('#lv').textContent = tx(v < .3 ? 'جلوس هادئ' : v < .7 ? 'مشي سريع' : 'جري');
      if (!fin && v >= .95) { fin = true; fb('ok', 'العضلات طلبت أكسجيناً: أسرع النبض والتنفس معاً، وانفتحت في العضلة شعيرات كانت مغلقة. فريق كامل، لا رئتان متعبتان.'); award(); ok(); } };
    $('#eff').oninput = upd; upd(); speak(tx(E('E2').text)); } };

/* ماذا يحدث؟ ومن يردّ؟ (يحل محل E4) */
const PAIRS = [['العضلات صنعت حرارة', 'الجلد: عرق ودم قريب منه'], ['العرق أخرج ماءً', 'الدماغ: عطش، والكليتان تحفظان الماء'], ['العضلات تطلب أكسجيناً', 'الرئتان والقلب يسرعان'], ['أريد أن أركض', 'الدماغ والأعصاب يرسلون الأمر']];
const ORDER = [1, 3, 0, 2];
const team = { id: 'E4', render() { need(); return `<div class="scene">${sayNar(E('E4').text)}<h2>${tx('{اختر|اختاري} ما حدث، ثم الجهاز الذي يردّ عليه.')}</h2>
  <div class="card"><b>${tx('ما حدث:')}</b>${PAIRS.map((p, i) => `<button class="opt" data-s="${i}">${tx(p[0])}</button>`).join('')}</div>
  <div class="card"><b>${tx('من يردّ:')}</b>${ORDER.map(i => `<button class="opt" data-j="${i}">${tx(PAIRS[i][1])}</button>`).join('')}</div>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let s = null, n = 0;
    $$('[data-s]').forEach(b => b.onclick = () => { if (b.classList.contains('ok')) return; $$('[data-s]').forEach(x => x.style.outline = ''); s = +b.dataset.s; b.style.outline = '3px solid #3E7BB6'; });
    $$('[data-j]').forEach(b => b.onclick = () => { if (s === null || b.classList.contains('ok')) return;
      if (+b.dataset.j === s) { b.classList.add('ok'); const a = $(`[data-s="${s}"]`); a.classList.add('ok'); a.style.outline = ''; s = null; n++;
        if (n === PAIRS.length) { fb('ok', 'لكل تغيّر جهاز يردّ عليه، وكلها في جري واحد: هذا هو الفريق.'); award(); ok(); } else fb('ok', 'صحيح. والتالي؟'); }
      else { noteMiss(); $$('[data-s]').forEach(x => x.style.outline = ''); s = null; fb('bad', 'ليس هذا الجهاز. {فكّر|فكّري}: من يُصلح هذا التغيّر؟'); } });
    speak(tx(E('E4').text)); } };

/* التعافي دقيقة بدقيقة (يحل محل E5) */
const PULSE = [150, 125, 110, 102, 98, 95], BR = [40, 32, 27, 24, 22, 21];
const rec = { id: 'E5', render() { need(); return `<div class="scene">${sayNar(E('E5').text)}<h2>${tx('{توقفت|توقفتِ} عن الجري. {استرح|استريحي} دقيقة بعد دقيقة، و{راقب|راقبي} الأرقام.')}</h2>
  <div class="card" style="text-align:center"><b id="mn"></b><br>${tx('النبض في الدقيقة:')} <b id="pv"></b> — ${tx('الأنفاس في الدقيقة:')} <b id="rv"></b></div>
  <svg viewBox="0 0 320 120" role="img" aria-label="النبض ينزل دقيقة بعد دقيقة" style="width:100%;max-width:340px;display:block;margin:auto;background:#fff;border-radius:18px"><polyline id="pl" fill="none" stroke="#E0607E" stroke-width="4" stroke-linecap="round"/><polyline id="rl" fill="none" stroke="#4FA3B8" stroke-width="4" stroke-linecap="round"/></svg>
  <div class="note">${tx('أرقام توضيحية لطفل متخيَّل؛ أرقامك{|ِ} {تقيسها|تقيسينها} في التجربة.')}</div>
  <button class="opt" id="go" style="text-align:center">${tx('دقيقة راحة')}</button>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let k = 0; const go = $('#go');
    const draw = () => { $('#mn').textContent = tx(k ? 'بعد ' + ['', 'دقيقة', 'دقيقتين', 'ثلاث دقائق', 'أربع دقائق', 'خمس دقائق'][k] : 'فور التوقف');
      $('#pv').textContent = PULSE[k]; $('#rv').textContent = BR[k];
      const pts = a => a.slice(0, k + 1).map((v, i) => `${30 + i * 52},${110 - (v - 15) * .65}`).join(' ');
      $('#pl').setAttribute('points', pts(PULSE)); $('#rl').setAttribute('points', pts(BR)); };
    go.onclick = () => { if (k >= 5) return; k++; draw();
      if (k === 5) { go.textContent = '✔ ' + tx('{تعافيت|تعافيتِ}'); fb('ok', 'في خمس دقائق اقترب النبض والتنفس من أرقام الراحة: هذا التعافي. والماء والطعام والنوم يكملونه.'); award(); ok(); }
      else fb('ok', 'ينزل النبض والتنفس شيئاً فشيئاً. {استرح|استريحي} دقيقة أخرى.'); };
    draw(); speak(tx(E('E5').text)); } };

window.CUSTOM = { replace: { E1: chain, E2: effort, E4: team, E5: rec } };
})();
