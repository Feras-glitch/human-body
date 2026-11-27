/* تأليف خاص — U11.L02 «الدخان والجسم كله». بلا صور سجائر مشتعلة ولا أمراض، وبلا أسماء منتجات. */
(() => {
const E = id => LD.explain.find(e => e.id === id);
const tap = (el, fn) => { el.onclick = fn; el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }; };
const sorter = (id, h2, rows, labels, done) => ({ id, render() { need(); return `<div class="scene">${sayNar(E(id).text)}<h2>${tx(h2)}</h2>
  ${rows.map((r, k) => `<div class="card"><div style="margin-bottom:6px">${tx(r.t)}</div><div class="row" style="flex-wrap:wrap;gap:8px">${labels.map((l, v) => `<button class="opt" style="width:auto" data-q="r${k}" data-v="${v}">${tx(l)}</button>`).join('')}</div></div>`).join('')}
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { const got = new Set();
    $$('[data-q]').forEach(b => b.onclick = () => { const k = +b.dataset.q.slice(1), r = rows[k], v = +b.dataset.v; if (got.has(k)) return;
      $$(`[data-q="r${k}"]`).forEach(x => x.classList.remove('ok', 'bad'));
      if (v === r.a) { b.classList.add('ok'); got.add(k); if (got.size === rows.length) { fb('ok', done); award(); ok(); } else fb('ok', r.w); }
      else { b.classList.add('bad'); noteMiss(); fb('bad', r.w); } });
    speak(tx(E(id).text)); } });

/* طريق الدخان في الجسم: المس المحطات بالترتيب (يحل محل E1) */
const ST = [
  { x: 160, y: 118, w: 120, lb: 'الرئتان', say: 'يؤذي الأهداب والحويصلات، ومنها تعبر مواده إلى الدم.' },
  { x: 160, y: 168, w: 140, lb: 'الدم', say: 'الدم يحمل مواد الدخان إلى الجسم كله.' },
  { x: 175, y: 128, w: 44, lb: 'القلب', say: 'القلب يتعب حين يقل الأكسجين، ويسرع بالنيكوتين.' },
  { x: 160, y: 34, w: 70, lb: 'الدماغ', say: 'النيكوتين يصل إلى الدماغ بسرعة.' },
];
const body = `<circle cx="160" cy="34" r="24" fill="#F4E4D4" stroke="#B9835F" stroke-width="2"/><ellipse cx="160" cy="34" rx="15" ry="11" fill="#F4B8C4"/>
  <rect x="118" y="62" width="84" height="130" rx="30" fill="#F4E4D4" stroke="#B9835F" stroke-width="2"/>
  <ellipse cx="141" cy="112" rx="16" ry="26" fill="#F7C6CF" stroke="#C9788A" stroke-width="2"/><ellipse cx="179" cy="112" rx="16" ry="26" fill="#F7C6CF" stroke="#C9788A" stroke-width="2"/>
  <path d="M168 120q7 -8 14 0q4 10 -7 18q-11 -8 -7 -18z" fill="#E0607E"/>
  <path d="M130 168H190" stroke="#C0392B" stroke-width="5" stroke-linecap="round"/><g id="trail"></g>`;
const path = { id: 'E1', render() { need(); return `<div class="scene">${sayNar(E('E1').text)}<h2>${tx('{تتبّع|تتبّعي} الدخان: {المس|المسي} المحطات بالترتيب من الرئتين.')}</h2>
  <svg viewBox="0 0 320 210" role="img" aria-label="جسم فيه الرئتان والقلب والدم والدماغ" style="width:100%;max-width:340px;display:block;margin:auto;background:#fff;border-radius:18px">${body}
  </svg>
  <div class="row" style="flex-wrap:wrap;gap:8px;justify-content:center">${ST.map((s, i) => `<button class="opt st" data-k="${i}" style="width:auto;order:${[2, 0, 3, 1][i]}">${tx(s.lb)}</button>`).join('')}</div>
  <div class="card" id="out" style="min-height:40px"></div>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let k = 0;
    $$('.st').forEach(r => tap(r, () => { const i = +r.dataset.k; if (i < k) return;
      if (i === k) { r.classList.add('ok'); $('#trail').innerHTML += `<circle cx="${ST[i].x}" cy="${ST[i].y}" r="9" fill="#7F8C8D" fill-opacity=".55"/>`; $('#out').innerHTML += (k ? ' ← ' : '') + tx(ST[i].lb); k++;
        if (k === ST.length) { fb('ok', 'دخل من الرئتين، ووصل بالدم إلى القلب والدماغ: لهذا يؤذي التدخين الجسم كله تقريباً.'); award(); ok(); } else fb('ok', ST[i].say); }
      else { noteMiss(); fb('bad', 'ليس بعد. من أين يدخل الدخان أولاً؟ ثم ما الذي يحمله؟'); } }));
    speak(tx(E('E1').text)); } };

/* حلقة الإدمان (يحل محل E3) */
const LOOP = ['يصل النيكوتين إلى الدماغ', 'راحة قصيرة', 'يقل النيكوتين فيطلبه الدماغ', 'يدخّن مرة أخرى'];
const loopSvg = k => LOOP.map((_, i) => { const a = -Math.PI / 2 + i * Math.PI / 2, x = 160 + 70 * Math.cos(a), y = 100 + 70 * Math.sin(a);
  return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="20" fill="${i === k ? '#E0607E' : '#F5F1EA'}" stroke="#8C4A5E" stroke-width="2"/>`; }).join('')
  + `<circle cx="160" cy="100" r="70" fill="none" stroke="#C9BBA8" stroke-width="3" stroke-dasharray="8 6"/>`;
const loop = { id: 'E3', render() { need(); return `<div class="scene">${sayNar(E('E3').text)}<h2>${tx('{اضغط|اضغطي} لتدور حلقة الإدمان، و{اقرأ|اقرئي} كل محطة.')}</h2>
  <svg viewBox="0 0 320 200" role="img" aria-label="حلقة بأربع محطات تدور" style="width:100%;max-width:320px;display:block;margin:auto;background:#fff;border-radius:18px"><g id="lp"></g></svg>
  <div class="card" style="text-align:center"><b id="ls"></b></div>
  <button class="opt" id="go" style="text-align:center">${tx('المحطة التالية')}</button>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let k = 0, n = 0; const go = $('#go');
    const draw = () => { $('#lp').innerHTML = loopSvg(k); $('#ls').textContent = tx(LOOP[k]); };
    go.onclick = () => { if (n >= 4) return; n++; k = n % 4; draw();
      if (n === 4) { go.textContent = '✔ ' + tx('عادت الحلقة'); fb('ok', 'عادت الحلقة إلى أولها، وستدور مرة بعد مرة: هذا الإدمان. ولهذا الأسهل ألا نبدأ، ومن بدأ يحتاج عوناً لا لوماً.'); award(); ok(); }
      else fb('ok', LOOP[k] + '.'); };
    draw(); speak(tx(E('E3').text)); } };

/* صح أم خطأ؟ (يحل محل E4) */
const myths = sorter('E4', 'صح أم خطأ؟', [
  { t: 'الماء في الشيشة ينقّي الدخان.', a: 1, w: 'خطأ: الماء لا يرشّح الدخان، وجلسة الساعة فيها دخان أكثر من سيجارة بكثير.' },
  { t: 'لا قدر آمن من دخان الآخرين.', a: 0, w: 'صح: وهو عند الأطفال يسبب التهابات الصدر والأذن ونوبات الربو.' },
  { t: 'السيجارة الإلكترونية بخار ماء بنكهة.', a: 1, w: 'خطأ: رذاذ فيه في الغالب نيكوتين ومواد سامة.' },
  { t: 'الفحم في الشيشة يُطلق أول أكسيد الكربون.', a: 0, w: 'صح: يُطلقه بكثرة، وهو يقلل الأكسجين في الدم.' },
], ['صح', 'خطأ'], 'الشيشة دخان، والسيجارة الإلكترونية ليست بخار ماء، ودخان الآخرين يؤذي.');

/* أي رد أحسن؟ (يحل محل E5) */
const reply = sorter('E5', 'عُرض عليك{|ِ} الدخان، أو دخّن أحد قربك{|ِ}. هل هذا رد مناسب؟', [
  { t: '«لا، شكراً»، ثم أبتعد مع أصدقاء يحترمون اختياري.', a: 0, w: 'مناسب: «لا» تكفي، والابتعاد حق.' },
  { t: 'أجرّب مرة واحدة كي لا يقولوا إني جبان.', a: 1, w: 'غير مناسب: المرة الأولى قد تبدأ الإدمان، والشجاعة أن أقول لا.' },
  { t: '«أحبك يا خالي، وأرجو أن تدخّن خارج الغرفة».', a: 0, w: 'مناسب: طلب بلطف يحميني ولا يؤذيه.' },
  { t: 'أسخر من عمي أمام الضيوف لأنه يدخّن.', a: 1, w: 'غير مناسب: السخرية تؤذيه ولا تساعده؛ نحب الشخص ونكره ما يؤذيه.' },
], ['مناسب', 'غير مناسب'], 'نقول لا بأدب ونبتعد، ونطلب بلطف ممن نحب، وندعو له.');

window.CUSTOM = { replace: { E1: path, E3: loop, E4: myths, E5: reply } };
})();
