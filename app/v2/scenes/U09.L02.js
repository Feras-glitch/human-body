/* تأليف خاص — U09.L02 «الحرارة: كيف يبقى جسمي دافئاً لا حاراً؟» */
(() => {
const E = id => LD.explain.find(e => e.id === id);

/* قرص الجو: الجلد يتغير وحرارة الداخل ثابتة (يحل محل E3) */
const HAIRS = [130, 190, 250];
const dial = { id: 'E3', render() { need(); return `<div class="scene">${sayNar(E('E3').text)}<h2>${tx('حرّك{|ي} الجو من البرد إلى الحر، و{راقب|راقبي} الجلد.')}</h2>
  <svg id="sk" viewBox="0 0 320 190" role="img" aria-label="مقطع في الجلد يتغير مع برودة الجو وحرارته" style="width:100%;max-width:360px;display:block;margin:auto;background:#fff;border-radius:18px">
    <style>@keyframes u9shiv{0%,100%{transform:translateX(0)}25%{transform:translateX(-2px)}75%{transform:translateX(2px)}}#sk.shiv #body{animation:u9shiv .18s linear infinite}#sk *{transition:all .35s}</style>
    <rect id="air" x="0" y="0" width="320" height="56" fill="#DCEFFF"/>
    <g id="body">
      <rect x="10" y="56" width="300" height="34" fill="#F6D2B8"/><rect id="derm" x="10" y="90" width="300" height="64" fill="#F7C6C0"/><rect x="10" y="154" width="300" height="30" fill="#FFF3C9"/>
      <path id="vs" d="M10 120 Q80 96 160 120 T310 120" fill="none" stroke="#D9534F" stroke-width="7" stroke-linecap="round"/>
      ${HAIRS.map(x => `<g class="hair" data-x="${x}"><ellipse cx="${x}" cy="140" rx="6" ry="8" fill="#8C5A3C"/><path class="sh" d="M${x} 134 L${x + 30} 34" stroke="#5B3A26" stroke-width="3.5" stroke-linecap="round"/><path class="bump" d="M${x - 14} 56 q14 -14 28 0" fill="#F6D2B8" stroke="#E3B497" opacity="0"/></g>`).join('')}
      <g id="swt" opacity="0">${[70, 160, 230].map(x => `<path d="M${x} 144 L${x} 58" stroke="#3FA796" stroke-width="2.5"/><circle cx="${x}" cy="146" r="7" fill="none" stroke="#3FA796" stroke-width="2.5"/><path d="M${x} 38 q-6 9 0 13 q6 -4 0 -13 Z" fill="#7FC8F0"/>`).join('')}</g>
    </g>
  </svg>
  <input type="range" id="heat" min="0" max="100" value="50" style="width:100%" aria-label="حرارة الجو من البرد الشديد إلى الحر الشديد">
  <div class="row" style="justify-content:space-between"><span>${tx('بارد جداً')}</span><span>${tx('حار جداً')}</span></div>
  <div class="card"><div><b>${tx('الجو:')}</b> <span id="wx"></span></div><div><b>${tx('حرارة داخل جسمك{|ِ}:')}</b> ${tx('قريبة من 37 درجة')}</div><ul id="st" style="margin:6px 0;padding-inline-start:20px"></ul></div>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { const seen = { cold: false, hot: false }; let fin = false;
    const upd = () => { const v = +$('#heat').value, cold = v < 40, hot = v > 60;
      $('#air').setAttribute('fill', v < 15 ? '#BFD9F5' : v < 40 ? '#DCEFFF' : v <= 60 ? '#EAF6FF' : v <= 85 ? '#FFE9B8' : '#FFD27A');
      $('#vs').setAttribute('stroke-width', cold ? 3 : hot ? 12 : 7); $('#vs').setAttribute('stroke', cold ? '#C4706C' : '#D9534F');
      $('#derm').setAttribute('fill', cold ? '#F5D3CF' : hot ? '#F4AFA8' : '#F7C6C0');
      $$('.hair').forEach(g => { const x = +g.dataset.x; g.querySelector('.sh').setAttribute('d', cold ? `M${x} 134 L${x + 4} 24` : `M${x} 134 L${x + 30} 34`); g.querySelector('.bump').setAttribute('opacity', cold ? 1 : 0); });
      $('#swt').setAttribute('opacity', hot ? (v > 85 ? 1 : .6) : 0);
      $('#sk').classList.toggle('shiv', v < 15);
      $('#wx').textContent = tx(v < 15 ? 'بارد جداً' : v < 40 ? 'بارد' : v <= 60 ? 'معتدل' : v <= 85 ? 'حار' : 'حار جداً');
      const L = v < 40 ? ['أوعية الجلد تضيق: دم أقل قرب السطح، فيبقى الدفء في الداخل ويبدو الجلد شاحباً.', 'تقف الشعرات ويقشعر الجلد، فيُحبس قليل من الهواء الدافئ.']
        : v <= 60 ? ['الجو معتدل: لا يحتاج الجسم إلى جهد كبير.']
        : ['أوعية الجلد تتسع: دم أكثر قرب السطح، فيخرج دفؤه ويحمرّ الجلد.', 'غدد العرق تُخرج العرق، فيتبخر ويبرّد الجلد.'];
      if (v < 15) L.push('الارتجاف: عضلاتك{|ِ} تنقبض بسرعة مرة بعد مرة فتصنع حرارة.');
      if (v > 85) L.push('{اشرب|اشربي} ماءً، و{استرح|استريحي} في الظل.');
      $('#st').innerHTML = L.map(s => `<li>${tx(s)}</li>`).join('');
      if (v < 15) seen.cold = true; if (v > 85) seen.hot = true;
      if (!fin && seen.cold && seen.hot) { fin = true; fb('ok', 'تغيّر الجو كثيراً، وبقيت حرارة داخلك{|ِ} قريبة من 37: الجلد يعمل بأمر منظّم الحرارة في دماغك{|ِ}.'); award(); ok(); } };
    $('#heat').oninput = upd; upd(); speak(tx(E('E3').text)); } };

/* الإنهاك الحراري: ماذا نفعل؟ (يحل محل E5) */
const ACTS = [
  { t: 'إكمال اللعب في الشمس حتى ينتهي الشوط', r: 0, w: 'لا: الجسم متعب من حرّ أكثر مما يستطيع تبريده، فاللعب يزيده.' },
  { t: 'الانتقال إلى الظل أو مكان بارد', r: 1 },
  { t: 'شرب الماء', r: 1 },
  { t: 'لبس ملابس ثقيلة داكنة', r: 0, w: 'لا: الملابس الثقيلة تحبس الدفء؛ الأنسب في الحر ملابس فاتحة واسعة.' },
  { t: 'الراحة', r: 1 },
  { t: 'إخبار كبير فوراً', r: 1 },
];
const help = { id: 'E5', render() { need(); return `<div class="scene">${sayNar(E('E5').text)}<h2>${tx('لعب أحد أصدقائك{|ِ} طويلاً في شمس الظهر، فأحسّ بدوار وصداع، وجلده شاحب يتعرق. {اختر|اختاري} الأربعة الصحيحة.')}</h2>
  <div>${ACTS.map((a, i) => `<button class="opt ch" data-i="${i}">${tx(a.t)}</button>`).join('')}</div>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { const got = new Set(), need4 = ACTS.filter(a => a.r).length;
    $$('.ch').forEach(b => b.onclick = () => { const a = ACTS[+b.dataset.i]; if (b.classList.contains('ok')) return;
      if (a.r) { b.classList.add('ok'); got.add(+b.dataset.i);
        if (got.size === need4) { fb('ok', 'أحسنت{|ِ} الاختيار. وإن صار أحد مشوشاً لا يعرف أين هو، فاطلبوا الإسعاف. والوقاية أسهل: الشرب قبل اللعب وفي أثنائه، وراحة في الظل.'); award(); ok(); }
        else fb('ok', 'صحيح. وماذا أيضاً؟'); }
      else { noteMiss(); b.classList.add('bad'); fb('bad', a.w); } });
    speak(tx(E('E5').text)); } };

window.CUSTOM = { replace: { E3: dial, E5: help } };
})();
