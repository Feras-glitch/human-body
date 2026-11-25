/* تأليف خاص — U09.L03 «الدفاع: كيف يمنع جسمي الميكروبات؟» */
(() => {
const E = id => LD.explain.find(e => e.id === id);
const tap = (el, fn) => { el.onclick = fn; el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }; };

/* البلعميات تبتلع الميكروبات عند الشظية (يحل محل E3) */
const GERMS = [[118, 70, '#7BBF4A'], [196, 62, '#9C6BC4'], [146, 104, '#7BBF4A'], [214, 104, '#9C6BC4']];
const START = [[120, 182], [200, 182]];
const wcell = (i, [x, y]) => `<g class="wc" id="wc${i}" style="transition:transform .7s ease;transform:translate(${x}px,${y}px)"><circle r="15" fill="#F7F4FC" stroke="#B9A9D6" stroke-width="2"/><path d="M-6 -2 q4 -6 8 0 q4 6 8 0" fill="none" stroke="#8E79C2" stroke-width="3" stroke-linecap="round"/></g>`;
const germ = ([x, y, c], i) => `<g class="bub" data-g="${i}" tabindex="0" role="button" aria-label="ميكروب" style="cursor:pointer;transform-box:fill-box;transform-origin:center;transition:transform .5s ease .5s,opacity .5s ease .5s">
  <rect x="${x - 9}" y="${y - 5}" width="18" height="10" rx="5" fill="${c}" stroke="#4E7A2E" stroke-width="1"/><circle cx="${x}" cy="${y}" r="16" fill="transparent"/></g>`;
const engulf = { id: 'E3', render() { need(); return `<div class="scene">${sayNar(E('E3').text)}<h2>${tx('دخلت شظية ومعها ميكروبات. {اضغط|اضغطي} الوعاء الدموي أولاً، ثم كل ميكروب.')}</h2>
  <svg viewBox="0 0 320 220" role="img" aria-label="مكان الشظية تحت الجلد، وفيه ميكروبات، ووعاء دموي تخرج منه خلايا بيضاء" style="width:100%;max-width:360px;display:block;margin:auto;background:#fff;border-radius:18px">
    <rect x="10" y="10" width="300" height="200" rx="14" fill="#F7C6C0"/><rect id="red" x="10" y="10" width="300" height="200" rx="14" fill="#E0525B" opacity="0"/>
    <rect x="10" y="10" width="300" height="26" rx="10" fill="#F6D2B8"/>
    <path d="M150 -4 L176 4 L170 92 L158 92 Z" fill="#B07A45" stroke="#7A5230" stroke-width="2"/>
    <g class="bub" id="vs" data-v="1" tabindex="0" role="button" aria-label="الوعاء الدموي" style="cursor:pointer"><path id="vsp" d="M10 184 Q160 160 310 184" fill="none" stroke="#D9534F" stroke-width="14" stroke-linecap="round"/></g>
    ${GERMS.map(germ).join('')}${START.map((p, i) => wcell(i, p)).join('')}
  </svg>
  <div class="note" style="text-align:center">${tx('الخلايا البيضاء هنا كبيرة ليسهل رؤيتها؛ وهي في الحقيقة أصغر من أن تراها العين.')}</div>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let open = false, n = 0;
    tap($('#vs'), () => { if (open) return; open = true; $('#vs').dataset.done = '1'; $('#vsp').setAttribute('stroke-width', 22); $('#red').setAttribute('opacity', .28);
      $('#wc0').style.transform = 'translate(110px,150px)'; $('#wc1').style.transform = 'translate(210px,150px)';
      fb('ok', 'جاء دم أكثر، فاحمرّ المكان وانتفخ ودفئ، وخرجت معه البلعميات. {اضغط|اضغطي} الميكروبات.'); });
    $$('[data-g]').forEach(g => tap(g, () => { if (g.dataset.done) return;
      if (!open) { noteMiss(); fb('bad', 'أولاً: {اضغط|اضغطي} الوعاء الدموي ليأتي بدم أكثر وخلايا بيضاء.'); return; }
      const [x, y] = GERMS[+g.dataset.g]; g.dataset.done = '1'; $('#wc' + (n % 2)).style.transform = `translate(${x}px,${y}px)`; g.style.transform = 'scale(.2)'; g.style.opacity = '0'; n++;
      if (n === GERMS.length) { fb('ok', 'أحاطت البلعميات بكل ميكروب فابتلعته وهضمته. فإن زاد الاحمرار وانتشر، أو ظهر صديد، أو اشتد الألم، {فأخبر|فأخبري} الكبار.'); award(); ok(); }
      else fb('ok', 'ابتلعته خلية بيضاء. والباقي؟'); }));
    speak(tx(E('E3').text)); } };

/* المفتاح والقفل: الجسم المضاد يناسب ميكروباً واحداً (يحل محل E4) */
const SH = {
  tri: (x, y, f, r = 8) => `<path d="M${x - r} ${y + r * .7} L${x} ${y - r} L${x + r} ${y + r * .7} Z" fill="${f}"/>`,
  sq: (x, y, f, r = 8) => `<rect x="${x - r * .8}" y="${y - r * .8}" width="${r * 1.6}" height="${r * 1.6}" fill="${f}"/>`,
  ci: (x, y, f, r = 8) => `<circle cx="${x}" cy="${y}" r="${r * .85}" fill="${f}"/>`,
};
const KINDS = [['tri', '#7BBF4A'], ['sq', '#9C6BC4'], ['ci', '#E88B3C']];
const abSvg = k => `<svg viewBox="0 0 64 64" width="60" height="60" aria-hidden="true"><path d="M32 60 L32 36 L16 18 M32 36 L48 18" fill="none" stroke="#2BB3A3" stroke-width="6" stroke-linecap="round"/>${SH[k](16, 12, '#2BB3A3', 9)}${SH[k](48, 12, '#2BB3A3', 9)}</svg>`;
const gmSvg = (k, c) => `<svg viewBox="0 0 64 76" width="60" height="72" aria-hidden="true"><circle cx="32" cy="50" r="24" fill="${c}"/>${SH[k](32, 31, '#fff', 10)}<g class="att" opacity="0"><path d="M32 22 L32 4" stroke="#2BB3A3" stroke-width="6" stroke-linecap="round"/>${SH[k](32, 31, '#2BB3A3', 9)}</g></svg>`;
const AB_ORDER = [1, 2, 0], GM_ORDER = [2, 0, 1];
const keys = { id: 'E4', render() { need(); return `<div class="scene">${sayNar(E('E4').text)}<h2>${tx('{اختر|اختاري} جسماً مضاداً، ثم الميكروب الذي يناسبه كما يناسب المفتاح قفله.')}</h2>
  <div class="card"><b>${tx('أجسام مضادة:')}</b><div class="row" style="justify-content:space-around">${AB_ORDER.map(i => `<button class="opt" style="width:auto;text-align:center" data-s="${KINDS[i][0]}" aria-label="جسم مضاد">${abSvg(KINDS[i][0])}</button>`).join('')}</div></div>
  <div class="card"><b>${tx('ميكروبات:')}</b><div class="row" style="justify-content:space-around">${GM_ORDER.map(i => `<button class="opt" style="width:auto;text-align:center" data-j="${KINDS[i][0]}" aria-label="ميكروب">${gmSvg(KINDS[i][0], KINDS[i][1])}</button>`).join('')}</div></div>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let sel = null, n = 0;
    $$('[data-s]').forEach(b => b.onclick = () => { if (b.classList.contains('ok')) return; $$('[data-s]').forEach(x => x.style.outline = ''); sel = b; b.style.outline = '3px solid #3E7BB6'; });
    $$('[data-j]').forEach(g => g.onclick = () => { if (g.classList.contains('ok')) return;
      if (!sel) { fb('bad', '{اختر|اختاري} جسماً مضاداً أولاً.'); return; }
      if (sel.dataset.s === g.dataset.j) { sel.classList.add('ok'); g.classList.add('ok'); sel.style.outline = ''; g.querySelector('.att').setAttribute('opacity', 1); sel = null; n++;
        if (n === KINDS.length) { fb('ok', 'كل جسم مضاد التصق بميكروبه وحده فجعله غير ضار. والجسم يتذكر: إن جاء الميكروب نفسه مرة أخرى صنعه فوراً.'); award(); ok(); }
        else fb('ok', 'يناسبه تماماً، فالتصق به.'); }
      else { noteMiss(); sel.style.outline = ''; sel = null; fb('bad', 'لا يناسبه. كل جسم مضاد يناسب ميكروباً واحداً بعينه.'); } });
    speak(tx(E('E4').text)); } };

/* غسل اليدين 20 ثانية (يحل محل E5) */
const ZONES = [
  { lb: 'الكفّان', d: '<ellipse cx="80" cy="128" rx="34" ry="30"/>' },
  { lb: 'ما بين الأصابع', d: '<path d="M66 94 l0 -26 M82 92 l0 -28 M98 94 l0 -26" stroke-width="8" stroke-linecap="round"/>' },
  { lb: 'ظهر اليد', d: '<ellipse cx="240" cy="128" rx="34" ry="30"/>' },
  { lb: 'تحت الأظفار', d: '<g><circle cx="214" cy="52" r="7"/><circle cx="230" cy="38" r="7"/><circle cx="246" cy="34" r="7"/><circle cx="262" cy="46" r="7"/></g>' },
];
const hand = (cx, flip) => `<g transform="translate(${cx} 0) scale(${flip ? -1 : 1} 1) translate(${-cx} 0)"><path d="M${cx - 38} 160 L${cx - 38} 108 Q${cx - 50} 92 ${cx - 54} 76 Q${cx - 50} 68 ${cx - 40} 78 L${cx - 30} 92 L${cx - 30} 52 Q${cx - 22} 42 ${cx - 14} 52 L${cx - 14} 88 L${cx - 14} 40 Q${cx - 6} 30 ${cx + 2} 40 L${cx + 2} 88 L${cx + 2} 44 Q${cx + 10} 34 ${cx + 18} 44 L${cx + 18} 92 L${cx + 18} 58 Q${cx + 26} 50 ${cx + 34} 58 L${cx + 34} 130 Q${cx + 30} 160 ${cx + 10} 166 Z" fill="#E9B48F" stroke="#B9835F" stroke-width="2"/></g>`;
const wash = { id: 'E5', render() { need(); return `<div class="scene">${sayNar(E('E5').text)}<h2>${tx('{ابدأ|ابدئي} العدّ، و{افرك|افركي} كل منطقة حتى يكتمل العدّ.')}</h2>
  <svg viewBox="0 0 320 180" role="img" aria-label="يدان: باطن اليد وظهرها، والمناطق التي تُفرك" style="width:100%;max-width:360px;display:block;margin:auto;background:#EAF6FF;border-radius:18px">
    ${hand(80, false)}${hand(240, true)}
    ${ZONES.map((z, i) => `<g class="st" data-k="${i}" tabindex="0" role="button" aria-label="${z.lb}" style="cursor:pointer" fill="#FFFFFF" fill-opacity=".25" stroke="#3E7BB6" stroke-dasharray="4 3" stroke-width="2">${z.d}</g>`).join('')}
  </svg>
  <div class="row" style="flex-wrap:wrap;justify-content:center;gap:6px">${ZONES.map((z, i) => `<span class="pill" id="zl${i}" style="padding:4px 10px;border-radius:12px;background:#EEE">${tx(z.lb)}</span>`).join('')}</div>
  <button class="opt" id="go" style="text-align:center">${tx('{ابدأ|ابدئي} العدّ: 20 ثانية')}</button>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { const got = new Set(); let secs = 0, iv = null, timeDone = false, fin = false; const go = $('#go');
    const check = () => { if (fin) return; if (timeDone && got.size === ZONES.length) { fin = true; fb('ok', 'عشرون ثانية وكل المناطق: هكذا يفكّ الصابون الدهن فيأخذ الماء الميكروبات. ثم {اشطف|اشطفي} و{جفّف|جفّفي}.'); award(); ok(); }
      else if (timeDone) fb('bad', 'انتهى العدّ، وبقيت مناطق لم {تفركها|تفركيها} بعد.'); };
    go.onclick = () => { if (iv || timeDone) return; secs = 0; go.textContent = '20';
      iv = setInterval(() => { if (!document.body.contains(go)) { clearInterval(iv); return; } secs++; go.textContent = String(20 - secs);
        if (secs >= 20) { clearInterval(iv); timeDone = true; go.textContent = '✔ ' + tx('20 ثانية'); check(); } }, 1000); };
    $$('.st').forEach(g => tap(g, () => { const k = +g.dataset.k; got.add(k); g.setAttribute('fill', '#7FC8F0'); g.setAttribute('fill-opacity', '.6'); $('#zl' + k).style.background = '#BFE7FF';
      if (timeDone) check(); else if (got.size === ZONES.length) fb('ok', iv ? '{استمر|استمري} في الفرك حتى يكتمل العدّ.' : '{ابدأ|ابدئي} العدّ: الفرك يحتاج 20 ثانية.'); else fb('ok', ZONES[k].lb); }));
    speak(tx(E('E5').text)); } };

window.CUSTOM = { replace: { E3: engulf, E4: keys, E5: wash } };
})();
