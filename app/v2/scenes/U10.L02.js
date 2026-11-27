/* تأليف خاص — U10.L02 «تغيّرات قادمة: البلوغ» (بإذن ولي الأمر). لا رسم لتفاصيل الجسم: صور ظلية بالطول وحده. */
(() => {
const E = id => LD.explain.find(e => e.id === id);

/* زر البدء في الدماغ (يحل محل E1) */
const sil = (x, h, on) => { const r = h * .11; return `<g opacity="${on ? 1 : .25}"><circle cx="${x}" cy="${200 - h + r}" r="${r}" fill="#BFE7F2" stroke="#4FA3B8" stroke-width="2"/><path d="M${x - h * .16} ${200 - h + 2.3 * r}Q${x} ${200 - h + 2 * r} ${x + h * .16} ${200 - h + 2.3 * r}L${x + h * .2} 200H${x - h * .2}Z" fill="#BFE7F2" stroke="#4FA3B8" stroke-width="2"/></g>`; };
const HS = [70, 86, 102, 118, 130];
const start = { id: 'E1', render() { need(); return `<div class="scene">${sayNar(E('E1').text)}<h2>${tx('{اضغط|اضغطي} زر البدء في الدماغ، و{راقب|راقبي} التغيّر خطوة خطوة.')}</h2>
  <svg viewBox="0 0 320 220" role="img" aria-label="الدماغ يرسل هرمونات، والجسم يكبر خطوة خطوة" style="width:100%;max-width:340px;display:block;margin:auto;background:#fff;border-radius:18px">
    <ellipse cx="60" cy="40" rx="42" ry="30" fill="#F4B8C4" stroke="#C9788A" stroke-width="3"/><circle id="pit" cx="72" cy="70" r="8" fill="#FFC93C" stroke="#B8862A" stroke-width="2"/>
    <g id="msg"></g><line x1="20" y1="200" x2="300" y2="200" stroke="#C9BBA8" stroke-width="3"/><g id="sils"></g></svg>
  <div class="card" style="text-align:center"><b id="st"></b></div>
  <button class="opt" id="go" style="text-align:center">${tx('{اضغط|اضغطي} زر البدء')}</button>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let k = 0; const go = $('#go');
    const STEPS = ['قبل البلوغ', 'الدماغ يرسل الهرمونات', 'طفرة النمو', 'تغيّرات كل جنس', 'سنوات حتى يكتمل'];
    const draw = () => { $('#sils').innerHTML = HS.map((h, i) => sil(120 + i * 40, h, i <= k)).join(''); $('#pit').setAttribute('fill', k ? '#FFDD55' : '#FFC93C');
      $('#msg').innerHTML = k ? Array.from({ length: k }, (_, i) => `<circle cx="${92 + i * 22}" cy="${78 + i * 8}" r="5" fill="#FFC93C"/>`).join('') : ''; $('#st').textContent = tx(STEPS[k]); };
    go.onclick = () => { if (k >= 4) return; k++; draw();
      if (k === 4) { go.textContent = '✔ ' + tx('خطوة خطوة'); fb('ok', 'البلوغ سنوات، من سنتين إلى خمس، يبدؤها الدماغ في موعده؛ ولكل طفل موعده.'); award(); ok(); }
      else { go.textContent = tx('الخطوة التالية'); fb('ok', STEPS[k]); } };
    draw(); speak(tx(E('E1').text)); } };

/* لكل تغيّر عنايته (يحل محل E2) */
const PAIRS = [['رائحة العرق أقوى', 'استحمام يومي بصابون لطيف'], ['حبوب في الوجه', 'غسل الوجه بلطف، وبلا عصر'], ['شعر دهني', 'غسل الشعر بماء دافئ وقليل من الصابون'], ['العرق في الملابس', 'ملابس نظيفة كل يوم']];
const ORDER = [2, 0, 3, 1];
const care = { id: 'E2', render() { need(); return `<div class="scene">${sayNar(E('E2').text)}<h2>${tx('{اختر|اختاري} التغيّر، ثم العناية التي تناسبه.')}</h2>
  <div class="card"><b>${tx('التغيّر:')}</b>${PAIRS.map((p, i) => `<button class="opt" data-s="${i}">${tx(p[0])}</button>`).join('')}</div>
  <div class="card"><b>${tx('العناية:')}</b>${ORDER.map(i => `<button class="opt" data-j="${i}">${tx(PAIRS[i][1])}</button>`).join('')}</div>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let s = null, n = 0;
    $$('[data-s]').forEach(b => b.onclick = () => { if (b.classList.contains('ok')) return; $$('[data-s]').forEach(x => x.style.outline = ''); s = +b.dataset.s; b.style.outline = '3px solid #3E7BB6'; });
    $$('[data-j]').forEach(b => b.onclick = () => { if (s === null || b.classList.contains('ok')) return;
      if (+b.dataset.j === s) { b.classList.add('ok'); const a = $(`[data-s="${s}"]`); a.classList.add('ok'); a.style.outline = ''; s = null; n++;
        if (n === PAIRS.length) { fb('ok', 'هذه ليست قلة نظافة ولا عيباً: هرمونات تعمل؛ والعناية اليومية تخففها.'); award(); ok(); } else fb('ok', 'صحيح. والتالي؟'); }
      else { noteMiss(); $$('[data-s]').forEach(x => x.style.outline = ''); s = null; fb('bad', 'ليست هذه عنايته. {فكّر|فكّري}: ما الذي يخفف هذا التغيّر؟'); } });
    speak(tx(E('E2').text)); } };

window.CUSTOM = { replace: { E1: start, E2: care } };
})();
