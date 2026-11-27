/* تأليف خاص — U10.L04 «من البداية إلى الشيخوخة». مفتوح للجميع: البداية خلية من الأم وخلية من الأب، بلا كيفية اللقاء. لا أرقام ولا كتابة داخل الرسوم. */
(() => {
const E = id => LD.explain.find(e => e.id === id);
const sorter = (id, h2, rows, labels, done) => ({ id, render() { need(); return `<div class="scene">${sayNar(E(id).text)}<h2>${tx(h2)}</h2>
  ${rows.map((r, k) => `<div class="card"><div style="margin-bottom:6px">${tx(r.t)}</div><div class="row" style="flex-wrap:wrap;gap:8px">${labels.map((l, v) => `<button class="opt" style="width:auto" data-q="r${k}" data-v="${v}">${tx(l)}</button>`).join('')}</div></div>`).join('')}
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { const got = new Set();
    $$('[data-q]').forEach(b => b.onclick = () => { const k = +b.dataset.q.slice(1), r = rows[k], v = +b.dataset.v; if (got.has(k)) return;
      $$(`[data-q="r${k}"]`).forEach(x => x.classList.remove('ok', 'bad'));
      if (v === r.a) { b.classList.add('ok'); got.add(k); if (got.size === rows.length) { fb('ok', done); award(); ok(); } else fb('ok', r.w); }
      else { b.classList.add('bad'); noteMiss(); fb('bad', r.w); } });
    speak(tx(E(id).text)); } });
/* أزواج: اختر من العمود الأول ثم ما يناسبه من الثاني */
const pairs = (id, h2, left, right, A, B, order, done) => ({ id, render() { need(); return `<div class="scene">${sayNar(E(id).text)}<h2>${tx(h2)}</h2>
  <div class="card"><b>${tx(A)}</b>${left.map((f, i) => `<button class="opt" data-s="${i}">${tx(f)}</button>`).join('')}</div>
  <div class="card"><b>${tx(B)}</b>${order.map(i => `<button class="opt" data-j="${i}">${tx(right[i])}</button>`).join('')}</div>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let s = null, n = 0;
    $$('[data-s]').forEach(b => b.onclick = () => { if (b.classList.contains('ok')) return; $$('[data-s]').forEach(x => x.style.outline = ''); s = +b.dataset.s; b.style.outline = '3px solid #3E7BB6'; });
    $$('[data-j]').forEach(b => b.onclick = () => { if (s === null || b.classList.contains('ok')) return;
      if (+b.dataset.j === s) { b.classList.add('ok'); const a = $(`[data-s="${s}"]`); a.classList.add('ok'); a.style.outline = ''; s = null; n++;
        if (n === left.length) { fb('ok', done); award(); ok(); } else fb('ok', 'صحيح. والتالي؟'); }
      else { noteMiss(); $$('[data-s]').forEach(x => x.style.outline = ''); s = null; fb('bad', 'ليس هذا. {فكّر|فكّري} مرة أخرى.'); } });
    speak(tx(E(id).text)); } });

/* من خلية إلى مولود (يحل محل E1) */
const ST = ['خلية واحدة اجتمعت فيها خلية من الأم وخلية من الأب', 'تنقسم: خليتان، ثم أربع، ثم كثير', 'جنين صغير في الرحم', 'جنين أكبر يتصل بأمه، ويكبر شهراً بعد شهر', 'مولود'];
const drawStage = k => {
  if (k === 0) return '<circle cx="160" cy="80" r="16" fill="#F6C7B6" stroke="#C0784A" stroke-width="3"/><circle cx="160" cy="80" r="5" fill="#C0784A"/>';
  if (k === 1) return [[-14, -10], [14, -10], [-14, 12], [14, 12], [0, 0]].map(([x, y]) => `<circle cx="${160 + x}" cy="${80 + y}" r="12" fill="#F6C7B6" stroke="#C0784A" stroke-width="2"/>`).join('');
  const womb = '<ellipse cx="160" cy="82" rx="92" ry="66" fill="#FBE3DC" stroke="#D98C8C" stroke-width="4"/>';
  if (k === 2) return womb + '<circle cx="160" cy="82" r="14" fill="#F4D3B5" stroke="#B9835F" stroke-width="2"/><circle cx="152" cy="74" r="7" fill="#F4D3B5" stroke="#B9835F" stroke-width="2"/>';
  if (k === 3) return womb + '<path d="M232 50Q200 70 176 92" fill="none" stroke="#C26D8E" stroke-width="5"/><ellipse cx="156" cy="94" rx="30" ry="22" fill="#F4D3B5" stroke="#B9835F" stroke-width="2"/><circle cx="132" cy="72" r="18" fill="#F4D3B5" stroke="#B9835F" stroke-width="2"/>';
  return '<ellipse cx="170" cy="98" rx="50" ry="30" fill="#DDF0FB" stroke="#7FA9C8" stroke-width="3"/><circle cx="118" cy="82" r="24" fill="#F4D3B5" stroke="#B9835F" stroke-width="2"/><path d="M110 86Q118 92 126 86" fill="none" stroke="#A8333B" stroke-width="2"/>'; };
const grow = { id: 'E1', render() { need(); return `<div class="scene">${sayNar(E('E1').text)}<h2>${tx('{اضغط|اضغطي} لترى الرحلة من خلية إلى مولود.')}</h2>
  <svg viewBox="0 0 320 160" role="img" aria-label="مراحل النمو قبل الولادة" style="width:100%;max-width:340px;display:block;margin:auto;background:#fff;border-radius:18px"><g id="stg"></g></svg>
  <div class="card" style="text-align:center"><b id="cap"></b></div>
  <button class="opt" id="go" style="text-align:center">${tx('المرحلة التالية')}</button>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let k = 0; const go = $('#go');
    const draw = () => { $('#stg').innerHTML = drawStage(k); $('#cap').textContent = tx(ST[k]); };
    go.onclick = () => { if (k >= ST.length - 1) return; k++; draw();
      if (k === ST.length - 1) { go.textContent = '✔ ' + tx('وُلد بعد نحو تسعة أشهر'); fb('ok', 'من خلية واحدة لا تُرى، إلى مولود بعد نحو أربعين أسبوعاً. هكذا بدأ كل واحد منا.'); award(); ok(); }
      else fb('ok', '{اضغط|اضغطي} للمرحلة التالية.'); };
    draw(); speak(tx(E('E1').text)); } };

/* مراحل العمر (يحل محل E3) */
const stages = pairs('E3', '{صِل|صِلي} كل مرحلة بما يميزها.',
  ['الرضاعة', 'الطفولة', 'البلوغ', 'الرشد', 'الشيخوخة'],
  ['يتعلم أن يجلس ويحبو ويمشي', 'يطول كل سنة ويتعلم كثيراً', 'تغيرات في الجسم وطفرة طول', 'يتوقف الطول، ويعمل ويرعى غيره', 'يتغير العظم والعضلة والعين والأذن شيئاً فشيئاً'],
  'المرحلة:', 'ما يميزها:', [3, 0, 4, 2, 1], 'خمس مراحل، وحدودها تقريبية، والناس يختلفون فيها.');

/* ما يتغير، وكيف أعين (يحل محل E4) */
const helps = pairs('E4', '{صِل|صِلي} كل تغير في الكبر بما يعين عليه.',
  ['العين يصعب عليها القريب', 'سماع الأصوات الحادة يضعف', 'العضلة أضعف والعظم أخف', 'المفاصل أيبس', 'الإحساس بالحر والبرد يقل'],
  ['نظارة القراءة وضوء جيد', 'أكلمه بوضوح ووجهي إليه', 'نمشي معاً كل يوم', 'أحمل عنه الثقيل وأفسح له الطريق', 'أتأكد أن ماء الشرب والغسل دافئ لا ساخن'],
  'التغير:', 'ما يعين:', [2, 4, 0, 3, 1], 'لكل تغير عون. والحركة من أفضل ما يبطئ ضعف العظم والعضلة.');

/* برّ أم لا؟ (يحل محل E5) */
const birr = sorter('E5', 'هل هذا من البر بالكبار؟', [
  { t: 'أقوم لكبير عن مقعدي في الحافلة', a: 0, w: 'برّ: الوقوف الطويل يتعبه.' },
  { t: 'أضحك حين يمشي جدي ببطء', a: 1, w: 'ليس براً: لا نسخر من ضعف.' },
  { t: 'أسمع قصة جدتي عن صغرها، وأسألها', a: 0, w: 'برّ: يفرحها، وأتعلم منها.' },
  { t: 'أقول: «هو كبير، لا يفهم الهاتف»', a: 1, w: 'ليس براً: الكبار يتعلمون، ولا نحكم بالعمر.' },
  { t: 'أعلّم جاري الكبير كيف يتصل بابنه بالفيديو', a: 0, w: 'برّ: علّمته بصبر.' },
], ['برّ', 'ليس براً'], 'نعين الكبار ونحترمهم، ونتعلم منهم، ولا نحكم على أحد بعمره.');

window.CUSTOM = { replace: { E1: grow, E3: stages, E4: helps, E5: birr } };
})();
