/* تأليف خاص — U10.L05 «أجسام مختلفة». لغة محترمة؛ بلا اسم دواء؛ لا يُشار إلى طفل بعينه. */
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

/* أداة العون وما تعين عليه (يحل محل E1) */
const tools = pairs('E1', '{صِل|صِلي} كل أداة عون بما تعين عليه.',
  ['الكرسي المتحرك', 'سماعة الأذن', 'العصا البيضاء', 'لغة الإشارة', 'طريقة برايل'],
  ['التنقل لمن يصعب عليه المشي', 'سماع الأصوات لمن ضعف سمعه', 'معرفة الطريق لمن لا يرى', 'الكلام باليدين والوجه', 'القراءة بأطراف الأصابع'],
  'الأداة:', 'ما تعين عليه:', [2, 4, 0, 3, 1], 'أداة العون جزء من صاحبها، فلا نلمسها بلا إذنه.');

/* عائق أم عون؟ (يحل محل E2) */
const barrier = sorter('E2', 'في المدرسة: هل هذا عائق أم عون؟', [
  { t: 'منحدر بجانب الدرج', a: 1, w: 'عون: يصعد الكرسي المتحرك والعربات.' },
  { t: 'حقائب مكدسة في الممر', a: 0, w: 'عائق: لمن يستعمل كرسياً أو عصا بيضاء.' },
  { t: 'لوحة على الباب بطريقة برايل', a: 1, w: 'عون: يعرف من لا يرى أين هو.' },
  { t: 'جرس المدرسة صوت فقط بلا ضوء', a: 0, w: 'عائق: لمن لا يسمع؛ الضوء يعين.' },
  { t: 'معلم يتكلم ووجهه إلى الصف', a: 1, w: 'عون: يقرأ من ضعف سمعه شفتيه ووجهه.' },
], ['عائق', 'عون'], 'الإعاقة تكبر بالعوائق وتصغر بالعون. وما نصلحه ينفع الجميع.');

/* الحالة والجهاز (يحل محل E3) */
const conds = pairs('E3', '{صِل|صِلي} كل حالة بما يحدث في الجسم.',
  ['الربو', 'السكري من النوع الأول', 'الحساسية الشديدة', 'الصرع'],
  ['تنتفخ مجاري الهواء وتضيق', 'البنكرياس لا يصنع رسالة ضبط السكر', 'جهاز الدفاع يرد رداً شديداً على طعام', 'نوبات من اضطراب رسائل الدماغ'],
  'الحالة:', 'ما يحدث:', [3, 1, 0, 2], 'لكل حالة جهاز، ولكل صاحب حالة خطة من طبيبه. وكلها لا تُعدي.');

/* أفعل أم لا أفعل؟ (يحل محل E4) */
const aid = sorter('E4', 'في موقف طارئ مع زميل: أفعل أم لا أفعل؟', [
  { t: 'زميل في نوبة صرع: أنادي كبيراً فوراً', a: 0, w: 'أفعل: الكبير يعرف ما يلزم.' },
  { t: 'زميل في نوبة صرع: أضع شيئاً في فمه', a: 1, w: 'لا أفعل: قد يؤذي أسنانه أو يبلعه.' },
  { t: 'زميلة يصفر صدرها: أبقى {هادئاً|هادئةً} وأساعدها على بخاخها', a: 0, w: 'أفعل: الهدوء يعين، والبخاخ يعمل بسرعة.' },
  { t: 'صديق عنده حساسية من طعام: أعطيه من طعامي ليجربه', a: 1, w: 'لا أفعل: لا نشاركه الطعام.' },
  { t: 'زميل في نوبة: أصوّره بالهاتف', a: 1, w: 'لا أفعل: نحفظ كرامته وخصوصيته.' },
], ['أفعل', 'لا أفعل'], 'هدوء، وكبير فوراً، ولا شيء في الفم، ولا إمساك، ولا تصوير. وهذه الحالات لا تُعدي.');

/* باحترام؟ (يحل محل E5) */
const respect = sorter('E5', 'هل هذا تصرف باحترام؟', [
  { t: 'أسأل: «هل تريد عوناً؟» قبل أن أدفع الكرسي', a: 0, w: 'باحترام: قد لا يحتاج عوناً.' },
  { t: 'أكلم مرافق زميلتي بدلاً منها', a: 1, w: 'ليس باحترام: أكلمها هي.' },
  { t: 'أقول: «يا مسكين!» كلما رأيته', a: 1, w: 'ليس باحترام: الشفقة الجارحة تؤذي.' },
  { t: 'نعدّل قواعد اللعبة ليلعب الجميع', a: 0, w: 'باحترام: اللعب للجميع.' },
  { t: 'أتعلم منه إشارات بلغة الإشارة', a: 0, w: 'باحترام: أتعرف على لغته.' },
], ['باحترام', 'ليس باحترام'], 'نسأل، ونكلمه هو، ولا نسخر ولا نشفق شفقة جارحة، ونلعب معاً.');

window.CUSTOM = { replace: { E1: tools, E2: barrier, E3: conds, E4: aid, E5: respect } };
})();
