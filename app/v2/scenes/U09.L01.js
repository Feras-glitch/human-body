/* تأليف خاص — U09.L01 «الجلد: درع حي يتجدد» */
(() => {
const E = id => LD.explain.find(e => e.id === id);
const F = 'font-family="IBM Plex Sans Arabic"';
const tap = (el, fn) => { el.onclick = fn; el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }; };
const pill = (s, i) => `<g class="st" data-k="${i}" tabindex="0" role="button" aria-label="${s.lb}" style="cursor:pointer">
  <line x1="${s.ax}" y1="${s.ay}" x2="${s.x}" y2="${s.y}" stroke="#3E7BB6" stroke-width="1.5"/><circle cx="${s.ax}" cy="${s.ay}" r="3.5" fill="#3E7BB6"/>
  <rect x="${s.x - s.w / 2}" y="${s.y - 13}" width="${s.w}" height="26" rx="13" fill="#3E7BB6"/>
  <text class="n" x="${s.x}" y="${s.y + 4.5}" text-anchor="middle" font-size="12.5" font-weight="700" ${F} fill="#fff">${s.lb}</text></g>`;

/* مقطع الجلد طبقة طبقة (يحل محل E2) */
const PARTS = [
  { x: 48, y: 50, w: 70, ax: 104, ay: 58, lb: 'البشرة', ar: 'البشرة: الطبقة الخارجية. أعلاها خلايا ميتة مسطحة تتساقط كل يوم، وتحتها خلايا حية تنقسم وتصعد لتحل محلها.' },
  { x: 48, y: 102, w: 64, ax: 140, ay: 120, lb: 'عصب', ar: 'أعصاب في الأدمة تحسّ، وتخبر الدماغ.' },
  { x: 48, y: 148, w: 70, ax: 104, ay: 140, lb: 'الأدمة', ar: 'الأدمة تحت البشرة، وفيها ألياف تجعل الجلد قوياً يتمدد ويعود.' },
  { x: 48, y: 204, w: 82, ax: 104, ay: 198, lb: 'طبقة الدهن', ar: 'وتحت الطبقتين طبقة دهن تحفظ الدفء.' },
  { x: 312, y: 26, w: 88, ax: 184, ay: 22, lb: 'الشعرة', ar: 'جذر الشعرة في الأدمة، والشعرة تخرج إلى السطح.' },
  { x: 312, y: 104, w: 84, ax: 226, ay: 150, lb: 'غدة عرق', ar: 'غدة عرق ملفوفة في الأدمة، تصل قناتها إلى فتحة صغيرة في السطح.' },
  { x: 312, y: 186, w: 84, ax: 252, ay: 156, lb: 'وعاء دموي', ar: 'أوعية دموية دقيقة تمرّ في الأدمة.' },
];
const FLAKES = [112, 128, 146, 162, 196, 214, 232, 248].map((x, i) => `<rect class="flk" x="${x}" y="${34 + (i % 2) * 2}" width="14" height="5" rx="2" fill="#E9C2A6" stroke="#C99A78" stroke-width="1"/>`).join('');
const LIVE = [108, 122, 136, 150, 164, 192, 206, 220, 234, 248].map(x => `<circle cx="${x + 4}" cy="68" r="5.5" fill="#F2B9A0" stroke="#D48C72" stroke-width="1"/>`).join('');
const FAT = [];
for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) FAT.push(`<circle cx="${114 + c * 26 + r * 13}" cy="${186 + r * 22}" r="12" fill="#FBE29A" stroke="#E2C46A" stroke-width="1.5"/>`);
const skin = inner => `<svg viewBox="0 0 360 240" role="img" aria-label="مقطع في الجلد: البشرة والأدمة وطبقة الدهن، وفيها شعرة وغدة عرق ووعاء دموي وعصب" style="width:100%;max-width:400px;display:block;margin:auto;background:#fff;border-radius:18px">
  <defs><clipPath id="u9cut"><rect x="100" y="30" width="160" height="200" rx="10"/></clipPath></defs>
  <style>.flk{transition:transform 1.2s ease,opacity 1.2s ease}.shed .flk{transform:translateY(-22px);opacity:0}</style>
  <g clip-path="url(#u9cut)">
    <rect x="100" y="172" width="160" height="60" fill="#FFF3C9"/>${FAT.join('')}
    <rect x="100" y="76" width="160" height="96" fill="#F7C6C0"/>
    <g fill="none" stroke="#F0A9A2" stroke-width="1.5"><path d="M104 96 q12 -6 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0"/><path d="M104 134 q12 -6 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0"/></g>
    <path d="M100 160 Q140 100 176 152 Q212 104 260 156" fill="none" stroke="#D9534F" stroke-width="6" stroke-linecap="round"/>
    <path d="M116 172 L132 136 L140 112 M132 136 L120 118 M140 112 L134 92" fill="none" stroke="#E2B33C" stroke-width="3" stroke-linecap="round"/>
    <path d="M226 158 m-10 0 a10 7 0 1 0 20 0 a7 5 0 1 0 -14 0 a4 3 0 1 0 8 0 M226 150 L226 32" fill="none" stroke="#3FA796" stroke-width="3"/>
    <ellipse cx="180" cy="160" rx="8" ry="10" fill="#8C5A3C"/><path d="M180 152 L186 10" stroke="#5B3A26" stroke-width="4" stroke-linecap="round"/>
    <rect x="100" y="40" width="160" height="36" fill="#F6D2B8"/>${LIVE}
    <g class="flks">${FLAKES}</g>
  </g>
  ${inner}
</svg>`;
const layers = { id: 'E2', render() { need(); return `<div class="scene">${sayNar(E('E2').text)}<h2>${tx('افتح{|ي} الجلد بالمجهر: اضغط{|ي} كل اسم لتعرف{|ي} ما هو.')}</h2>
  ${skin(PARTS.map(pill).join(''))}
  <div class="card" id="out" style="min-height:44px"></div><div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { const seen = new Set(); $$('.st').forEach(g => tap(g, () => { const k = +g.dataset.k; seen.add(k); g.querySelector('rect').setAttribute('fill', '#2E9E6A');
      $('#out').innerHTML = tx(PARTS[k].ar);
      if (k === 0) { const fl = $('.flks'); fl.classList.remove('shed'); void fl.getBoundingClientRect(); fl.classList.add('shed'); }
      if (seen.size === PARTS.length) { fb('ok', 'طبقتان وتحتهما الدهن: البشرة تتجدد كلها في نحو أربعة أسابيع، والأدمة تحسّ وتغذّي وتشدّ.'); award(); ok(); } }));
    speak(tx(E('E2').text)); } };

/* التئام الخدش بالترتيب (يحل محل E5) */
const STEPS = [
  'يخرج قليل من الدم',
  'يتخثر الدم فيسدّ الخدش في دقائق',
  'يجفّ الدم المتخثر فيصير قشرة الجرح',
  'تحت القشرة تُبنى خلايا جديدة من الحواف والأسفل',
  'يكتمل الجلد الجديد فتسقط القشرة وحدها',
];
const SHOW = [2, 0, 4, 1, 3];
const NEW = [[146, 112], [174, 112], [152, 100], [168, 100], [160, 116], [148, 86], [172, 86], [160, 94]];
const wound = `<svg viewBox="0 0 320 190" role="img" aria-label="مقطع في جلد الركبة فيه خدش يلتئم" style="width:100%;max-width:360px;display:block;margin:auto;background:#EAF6FF;border-radius:18px">
  <rect x="10" y="96" width="300" height="84" rx="8" fill="#F7C6C0"/><rect x="10" y="70" width="300" height="28" rx="6" fill="#F6D2B8"/>
  <path id="gap" d="M136 70 L160 124 L184 70 Z" fill="#EAF6FF"/>
  <g id="w1"><path d="M146 90 L160 124 L174 90 Z" fill="#D9534F"/><path d="M160 46 q-7 10 0 14 q7 -4 0 -14 Z" fill="#D9534F"/></g>
  <g id="w2"><path d="M138 72 L160 124 L182 72 Z" fill="#B23A3A"/><g stroke="#F3D0D0" stroke-width="1.2"><path d="M144 80 L176 96"/><path d="M176 80 L146 100"/><path d="M150 108 L170 92"/><path d="M152 76 L168 112"/></g></g>
  <g id="w4">${NEW.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="#F2B9A0" stroke="#D48C72"/>`).join('')}</g>
  <path id="w3" d="M130 70 Q160 54 190 70 L184 78 L136 78 Z" fill="#8B5A2B" stroke="#6B4220" stroke-width="2"/>
  <g id="w5"><path d="M136 70 L160 124 L184 70 Z" fill="#F7C6C0"/><rect x="136" y="70" width="48" height="28" fill="#F6D2B8"/><ellipse cx="160" cy="78" rx="20" ry="5" fill="#FBDCCB"/></g>
</svg>`;
const heal = { id: 'E5', render() { need(); return `<div class="scene">${sayNar(E('E5').text)}<h2>${tx('رتّب{|ي} ما يحدث للخدش: اضغط{|ي} الخطوات بالترتيب.')}</h2>
  ${wound}<div>${SHOW.map(k => `<button class="opt st" data-k="${k}">${tx(STEPS[k])}</button>`).join('')}</div>
  <ol class="card" id="steps" style="margin:6px 0;padding-inline-start:22px;min-height:20px"></ol><div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let next = 0;
    const draw = n => { ['w1', 'w2', 'w3', 'w4', 'w5'].forEach((w, i) => { const on = n >= 5 ? i === 4 : i < n; $('#' + w).style.display = on ? '' : 'none'; }); if (n >= 2 && n < 5) $('#w1').style.display = 'none'; };
    draw(0);
    $$('.st').forEach(b => tap(b, () => { const k = +b.dataset.k; if (next >= STEPS.length || k < next) return;
      if (k === next) { b.classList.add('ok'); b.disabled = true; $('#steps').insertAdjacentHTML('beforeend', `<li>${tx(STEPS[k])}</li>`); next++; draw(next);
        if (next === STEPS.length) { fb('ok', 'القشرة سقف فوق ورشة بناء. {اغسل|اغسلي} الخدش بماء وصابون لطيف و{غطّه|غطّيه}، ولا {تنزع|تنزعي} القشرة.'); award(); ok(); } else fb('ok', 'صحيح. وماذا بعد؟'); }
      else { noteMiss(); fb('bad', next === 0 ? 'ابدأ{|ي} من لحظة الخدش نفسها.' : 'ليس بعد. ماذا يحدث بعد: «' + STEPS[next - 1] + '»؟'); } }));
    speak(tx(E('E5').text)); } };

window.CUSTOM = { replace: { E2: layers, E5: heal } };
})();
