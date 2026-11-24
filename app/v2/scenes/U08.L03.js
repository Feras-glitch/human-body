/* تأليف خاص — U08.L03 «السمع والتوازن والشم والذوق واللمس» */
(() => {
const E = id => LD.explain.find(e => e.id === id);
const F = 'font-family="IBM Plex Sans Arabic"';
const tap = (el, fn) => { el.onclick = fn; el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }; };
const pill = (s, i) => `<g class="st" data-k="${i}" tabindex="0" role="button" aria-label="${s.lb}" style="cursor:pointer">
  <line x1="${s.ax}" y1="${s.ay}" x2="${s.x}" y2="${s.y}" stroke="#3E7BB6" stroke-width="1.5"/><circle cx="${s.ax}" cy="${s.ay}" r="3.5" fill="#3E7BB6"/>
  <rect x="${s.x - s.w / 2}" y="${s.y - 13}" width="${s.w}" height="26" rx="13" fill="#3E7BB6"/>
  <text class="n" x="${s.x}" y="${s.y + 4.5}" text-anchor="middle" font-size="12.5" font-weight="700" ${F} fill="#fff">${s.lb}</text></g>`;

/* مقطع الأذن: الصوت يأتي من اليمين، والدماغ على اليسار */
const ear = inner => `<svg viewBox="0 0 320 230" role="img" aria-label="مقطع الأذن: الأذن الظاهرة والقناة والطبلة والعظيمات والقوقعة والقنوات الهلالية وعصب السمع" style="width:100%;max-width:380px;display:block;margin:auto;background:#fff;border-radius:18px">
  <rect x="40" y="40" width="200" height="150" rx="20" fill="#F7EFE6"/>
  <path d="M300 40 Q330 110 296 190 Q276 196 270 170 Q286 118 268 70 Q272 42 300 40 Z" fill="#F1C9A5" stroke="#C99A78" stroke-width="2"/>
  <path d="M272 104 L196 104 L196 124 L272 124 Z" fill="#FCE3CF" stroke="#C99A78" stroke-width="1.5"/>
  <line x1="196" y1="98" x2="196" y2="130" stroke="#9C6B98" stroke-width="5" stroke-linecap="round"/>
  <g fill="#E8E1D0" stroke="#9A8F78" stroke-width="1.5"><path d="M190 106 l-10 -4 l-4 8 l10 4 Z"/><path d="M176 110 l-10 0 l0 8 l10 0 Z"/><path d="M164 108 l-8 0 l-2 12 l12 0 Z"/></g>
  <g fill="none" stroke="#3FA796" stroke-width="4.5"><ellipse cx="142" cy="68" rx="13" ry="20"/><ellipse cx="160" cy="84" rx="19" ry="9"/><ellipse cx="124" cy="82" rx="8" ry="15" transform="rotate(-35 124 82)"/></g><path d="M142 88 L148 108" stroke="#3FA796" stroke-width="5"/>
  <path d="M150 128 m-22 0 a22 22 0 1 0 44 0 a16 16 0 1 0 -32 0 a10 10 0 1 0 20 0 a5 5 0 1 0 -10 0" fill="none" stroke="#E0525B" stroke-width="4"/>
  <path d="M128 132 L60 132" stroke="#E2B33C" stroke-width="5" stroke-linecap="round"/>
  <path d="M8 104 Q28 86 46 108 Q54 132 44 158 Q26 172 8 156 Z" fill="#F4B8C4" stroke="#C9788A" stroke-width="2"/>
  <g stroke="#7FB8E0" stroke-width="2" fill="none"><path d="M314 102 q-6 12 0 24"/><path d="M306 98 q-8 16 0 32"/></g>
  ${inner}
</svg>`;
const STOPS = [
  { x: 270, y: 22, w: 92, ax: 292, ay: 60, lb: 'الأذن الظاهرة', ar: 'الأذن الظاهرة تلتقط الصوت' },
  { x: 250, y: 212, w: 58, ax: 236, ay: 124, lb: 'القناة', ar: 'يمرّ في قناة الأذن' },
  { x: 196, y: 22, w: 56, ax: 196, ay: 98, lb: 'الطبلة', ar: 'تهتز الطبلة' },
  { x: 180, y: 180, w: 80, ax: 170, ay: 118, lb: 'العظيمات', ar: 'تنقل العظيمات الثلاث الاهتزاز وتقوّيه' },
  { x: 100, y: 196, w: 64, ax: 136, ay: 142, lb: 'القوقعة', ar: 'تحوّله القوقعة إلى رسائل' },
  { x: 76, y: 22, w: 76, ax: 80, ay: 132, lb: 'عصب السمع', ar: 'يحمل عصب السمع الرسائل إلى الدماغ' },
];
const sound = { id: 'E1', render() { need(); return `<div class="scene">${sayNar(E('E1').text)}<h2>${tx('اتبع{|ي} صوت الجرس: اضغط{|ي} المحطات بالترتيب حتى يصل إلى الدماغ.')}</h2>
  ${ear(STOPS.map(pill).join(''))}<div class="note" style="text-align:center">${tx('الأنابيب الخضراء الثلاثة: القنوات الهلالية، للتوازن لا للسمع.')}</div>
  <ol class="card" id="steps" style="margin:6px 0;padding-inline-start:22px;min-height:20px"></ol><div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let next = 0; $$('.st').forEach(g => tap(g, () => { const k = +g.dataset.k; if (next >= STOPS.length || k < next) return;
      if (k === next) { g.querySelector('rect').setAttribute('fill', '#2E9E6A'); g.querySelector('.n').textContent = (k + 1) + '. ' + STOPS[k].lb; $('#steps').insertAdjacentHTML('beforeend', `<li>${tx(STOPS[k].ar)}</li>`); next++;
        if (next === STOPS.length) { fb('ok', 'هذا طريق الصوت: يلتقطه ما تراه من الأذن، لكن السمع يكتمل في أعماقها وفي الدماغ.'); award(); ok(); } else fb('ok', STOPS[k].ar); }
      else { noteMiss(); fb('bad', next === 0 ? 'ابدأ{|ي} من حيث يصل الصوت أولاً: من الخارج.' : 'ليس بعد. أين يذهب الصوت بعد «' + STOPS[next - 1].lb + '»؟'); } }));
    speak(tx(E('E1').text)); } };

/* الاستماع الآمن (يحل محل E3) */
const fmt = h => h >= 1 ? (h >= 10 ? Math.round(h) : h.toFixed(1)) + ' ساعة' : Math.max(1, Math.round(h * 60)) + ' دقيقة';
const volume = { id: 'E3', render() { need(); return `<div class="scene">${sayNar(E('E3').text)}<h2>${tx('حرّك{|ي} منزلق الصوت: كم يُحتمل كل مستوى في اليوم؟')}</h2>
  <input type="range" id="db" min="70" max="110" value="85" style="width:100%" aria-label="شدة الصوت بالديسيبل">
  <div class="card"><div>${tx('شدة الصوت:')} <b id="dv"></b></div><div>${tx('أقصى زمن في اليوم:')} <b id="tv"></b></div>
  <svg viewBox="0 0 320 40" style="width:100%;max-width:340px;display:block;margin:6px auto" aria-hidden="true"><rect x="10" y="14" width="300" height="12" rx="6" fill="#EEE"/><rect id="bar" x="10" y="14" width="0" height="12" rx="6" fill="#2E9E6A"/></svg>
  <div id="st"></div></div><div class="note">${tx('بحسب منظمة الصحة العالمية: 85 ديسيبل حتى ثماني ساعات، و100 ديسيبل ربع ساعة؛ وكل زيادة 3 ديسيبل تنصّف الزمن.')}</div></div>`; },
  after() { const seen = { low: false, high: false }; let fin = false;
    const upd = () => { const d = +$('#db').value, h = 8 / Math.pow(2, (d - 85) / 3); $('#dv').textContent = d + ' ديسيبل';
      $('#tv').textContent = h > 24 ? tx('بلا خطر يُذكر على السمع') : fmt(h);
      const w = Math.max(4, Math.min(300, 300 * Math.min(h, 24) / 24)); $('#bar').setAttribute('width', w); $('#bar').setAttribute('x', 310 - w); $('#bar').setAttribute('fill', h >= 8 ? '#2E9E6A' : h >= 1 ? '#E2B33C' : '#E0525B');
      if (d <= 75) seen.low = true; if (d >= 100) seen.high = true;
      $('#st').textContent = d >= 100 ? tx('صوت الأماكن الصاخبة: دقائق قليلة فقط. {اخفض|اخفضي} الصوت أو {ابتعد|ابتعدي}.') : d >= 88 ? tx('عالٍ: الزمن الآمن يقصر بسرعة.') : '';
      if (!fin && seen.low && seen.high) { fin = true; fb('ok', 'كلما علا الصوت قصر الزمن الآمن كثيراً؛ وخلايا السمع التي تتلف لا تعود.'); award(); ok(); } };
    $('#db').oninput = upd; upd(); speak(tx(E('E3').text)); } };

/* خريطة اللسان على المحك (يحل محل E4) */
const ZONES = [
  { d: 'M160 196 Q120 196 118 168 L202 168 Q200 196 160 196 Z', lb: 'طرف اللسان' },
  { d: 'M92 150 Q90 104 104 72 L130 72 L126 168 L118 168 Q96 166 92 150 Z', lb: 'الجانب الأيمن' },
  { d: 'M228 150 Q230 104 216 72 L190 72 L194 168 L202 168 Q224 166 228 150 Z', lb: 'الجانب الأيسر' },
  { d: 'M104 72 Q108 30 160 28 Q212 30 216 72 L190 72 L130 72 Z', lb: 'مؤخرة اللسان' },
  { d: 'M130 72 L190 72 L194 168 L126 168 Z', lb: 'وسط اللسان' },
];
const tongue = { id: 'E4', render() { need(); return `<div class="scene">${sayNar(E('E4').text)}<h2>${tx('اضغط{|ي} كل منطقة في اللسان: أيّ الطعوم تحسّها؟')}</h2>
  <svg viewBox="0 0 320 210" role="img" aria-label="لسان مقسم أربع مناطق" style="width:100%;max-width:340px;display:block;margin:auto;background:#fff;border-radius:18px">
  <path d="M90 70 Q96 20 160 20 Q224 20 230 70 Q240 150 200 190 Q160 214 120 190 Q80 150 90 70 Z" fill="#F29BA6" stroke="#C9586B" stroke-width="3"/>
  ${ZONES.map((z, i) => `<path class="st" data-k="${i}" tabindex="0" role="button" aria-label="${z.lb}" d="${z.d}" fill="#FFFFFF" fill-opacity=".18" stroke="#fff" stroke-width="2" stroke-dasharray="5 4" style="cursor:pointer"/>`).join('')}
  <line x1="160" y1="40" x2="160" y2="186" stroke="#C9586B" stroke-width="2" opacity=".5"/></svg>
  <div class="card" id="out" style="min-height:44px"></div><div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { const done = new Set(); $$('.st').forEach(p => tap(p, () => { const k = +p.dataset.k; done.add(k); p.setAttribute('fill', '#2E9E6A'); p.setAttribute('fill-opacity', '.35');
      $('#out').innerHTML = `<b>${ZONES[k].lb}:</b> ${tx('حلو، مالح، حامض، مر، لذيذ (أومامي) — الطعوم الخمسة كلها.')}`;
      if (done.size === ZONES.length) { fb('ok', 'كل منطقة فيها براعم تذوق تحسّ الطعوم الخمسة؛ وخريطة اللسان التي في بعض الكتب خطأ.'); award(); ok(); } }));
    speak(tx(E('E4').text)); } };

/* التجربة */
const X = LD.experiment;
const NUM = [['nc', 'الإصابات والأنف مسدود (من 3):', 3], ['no', 'الإصابات والأنف مفتوح (من 3):', 3], ['tf', 'الإصابات على طرف الإصبع (من 10):', 10], ['ta', 'الإصابات على الساعد (من 10):', 10]];
const Q = [
  { k: 'a', q: 'متى {عرفت|عرفتِ} الفاكهة أكثر؟', o: ['والأنف مسدود', 'والأنف مفتوح'], r: 1, w: 'الرائحة تميّز التفاح من الكمثرى؛ واللسان يحسّ حلاوتهما معاً.' },
  { k: 'b', q: 'أين {ميّزت|ميّزتِ} النقطتين أكثر؟', o: ['على طرف الإصبع', 'على ظهر الساعد'], r: 0, w: 'في طرف الإصبع مستقبلات لمس أكثر بكثير.' },
];
const exp = { id: 'exp', render() { need(); return `<div class="scene"><h2>${tx('تجربة: ' + X.title)}</h2><div class="card" style="background:#FFF3D6"><b>السلامة:</b> ${X.safety.slice(0, 2).map(tx).join(' ')}${safetyMore(X, 2)}</div>
  <div class="card"><b>${tx('تحتاج{|ين}:')}</b> ${X.materials.map(tx).join('، ')}</div><div class="card">${X.steps.map((s, i) => `<b>${i + 1}.</b> ${tx(s)}`).join('<br>')}</div>
  <div class="card">${NUM.map(([id, l, m]) => `<label style="display:block">${tx(l)} <input type="number" id="${id}" min="0" max="${m}" style="width:4em"></label>`).join('')}<div id="sum" class="note"></div></div>
  <div class="card">${Q.map(q => `<b>${tx(q.q)}</b><div class="row" style="flex-wrap:wrap">${q.o.map((o, i) => `<button class="opt" style="width:auto" data-q="${q.k}" data-v="${i}">${tx(o)}</button>`).join('')}</div>`).join('')}<div class="fb" id="fb" role="status" aria-live="polite"></div></div></div>`; },
  after() { const r = store.get('sensx', {}); const chk = () => { if (Q.every(q => r[q.k] === q.r)) { award(); ok(); } else need(); };
    const sum = () => { const t = []; if (r.nc != null && r.no != null) t.push(r.no > r.nc ? tx('عرفت{|ِ} الفاكهة أكثر والأنف مفتوح: هذا أثر الرائحة.') : tx('لم يظهر فرق هذه المرة؛ ربما كانت الفاكهتان متشابهتين جداً أو لم يُسدّ الأنف تماماً.'));
      if (r.tf != null && r.ta != null) t.push(r.tf > r.ta ? tx('طرف الإصبع أدق من الساعد: مستقبلات أكثر.') : tx('{أعد|أعيدي} اللمسات على الساعد بالمسافة نفسها، وعيناك{|ِ} مغمضتان.'));
      $('#sum').textContent = t.join(' '); };
    NUM.forEach(([id, , m]) => { const el = $('#' + id); if (r[id] != null) el.value = r[id]; el.oninput = () => { r[id] = el.value === '' ? null : Math.max(0, Math.min(m, Math.round(+el.value))); store.set('sensx', r); sum(); }; });
    Q.forEach(q => { if (r[q.k] != null) $(`[data-q="${q.k}"][data-v="${r[q.k]}"]`)?.classList.add(r[q.k] === q.r ? 'ok' : 'bad'); });
    $$('[data-q]').forEach(b => b.onclick = () => { const q = Q.find(x => x.k === b.dataset.q); r[q.k] = +b.dataset.v; store.set('sensx', r); $$(`[data-q="${q.k}"]`).forEach(x => x.classList.remove('ok', 'bad')); const right = r[q.k] === q.r; b.classList.add(right ? 'ok' : 'bad'); if (!right) noteMiss(); fb(right ? 'ok' : 'bad', [right ? 'نعم: ' : 'لاحظ{|ي} نتائجك{|ِ} مرة أخرى. ', q.w]); chk(); });
    sum(); chk(); speak([SAY.experiment, tx(X.title)]); } };

window.CUSTOM = { replace: { E1: sound, E3: volume, E4: tongue, exp } };
})();
