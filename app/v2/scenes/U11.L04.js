/* تأليف خاص — U11.L04 «كيف أحكم على معلومة صحية؟ علماء أخطؤوا». الرسائل متخيَّلة، بلا أسماء منتجات. */
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

/* حاجز القلب عبر الزمن: المس المحطات بالترتيب (يحل محل E2) */
const TL = [
  { lb: 'جالينوس: في الحاجز ثقوب', holes: true },
  { lb: 'ابن سينا ينقل القول في القانون', holes: true },
  { lb: 'ابن النفيس: الحاجز صلب، والدم يمر بالرئة', holes: false },
];
const heart = holes => `<path d="M112 46Q160 24 214 44Q246 92 196 156Q172 186 150 192Q132 180 118 150Q94 100 112 46Z" fill="#F4B8C4" stroke="#C9788A" stroke-width="3"/>
  <path d="M162 48Q160 120 152 186" fill="none" stroke="#C9788A" stroke-width="12" stroke-linecap="round"/>${holes ? [85, 115, 145].map(y => `<circle cx="${160 - (y - 48) * .07}" cy="${y}" r="5" fill="#fff" stroke="#8C4A5E" stroke-width="2"/>`).join('') : ''}
  ${holes ? '' : `<path d="M130 60Q160 0 200 56" fill="none" stroke="#3E7BB6" stroke-width="4" stroke-dasharray="7 5"/><ellipse cx="164" cy="22" rx="30" ry="12" fill="#BFE7F2" stroke="#4FA3B8" stroke-width="2"/>`}`;
const septum = { id: 'E2', render() { need(); return `<div class="scene">${sayNar(E('E2').text)}<h2>${tx('{المس|المسي} محطات القصة بالترتيب، و{راقب|راقبي} الحاجز.')}</h2>
  <svg viewBox="0 0 320 210" role="img" aria-label="قلب بحاجز بين جانبيه" style="width:100%;max-width:320px;display:block;margin:auto;background:#fff;border-radius:18px"><g id="hrt">${heart(true)}</g></svg>
  ${TL.map((t, i) => `<button class="opt st" data-k="${i}">${tx(t.lb)}</button>`).join('')}
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let k = 0;
    $$('.st').forEach(b => tap(b, () => { const i = +b.dataset.k; if (i < k) return;
      if (i === k) { b.classList.add('ok'); $('#hrt').innerHTML = heart(TL[i].holes); k++;
        if (k === TL.length) { fb('ok', 'بقي الخطأ قروناً في الكتب، وصحّحه الدليل لا الشهرة. والسهم الأزرق طريق الدم إلى الرئة ثم إلى الجانب الآخر.'); award(); ok(); }
        else fb('ok', i === 0 ? 'هذا قول جالينوس. ومن نقله؟' : 'نقله ابن سينا في كتاب دُرِّس قروناً. ومن صحّحه؟'); }
      else { noteMiss(); fb('bad', 'ليس بعد. من قال القول أولاً؟'); } }));
    speak(tx(E('E2').text)); } };

/* جناح زيملفايس قبل التطهير وبعده (يحل محل E3) */
const RATE = [18.27, 1.27];
const ward = { id: 'E3', render() { need(); return `<div class="scene">${sayNar(E('E3').text)}<h2>${tx('{اضغط|اضغطي} لتطهير الأيدي، و{قارن|قارني} وفيات الأمهات في الجناح قبل وبعد.')}</h2>
  <svg viewBox="0 0 320 180" role="img" aria-label="عمود الوفيات في جناح زيملفايس قبل تطهير الأيدي وبعده" style="width:100%;max-width:340px;display:block;margin:auto;background:#fff;border-radius:18px">
    <line x1="20" y1="160" x2="300" y2="160" stroke="#C9BBA8" stroke-width="3"/><g id="bars"></g></svg>
  <div class="card" style="text-align:center"><b id="mo"></b></div>
  <button class="opt" id="go" style="text-align:center">${tx('{طهّر|طهّري} الأيدي')}</button>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let k = 0; const go = $('#go');
    const draw = () => { $('#bars').innerHTML = RATE.slice(0, k + 1).map((r, i) => `<rect x="${190 - i * 100}" y="${160 - r * 7}" width="44" height="${r * 7}" rx="6" fill="${i ? '#2E9E6A' : '#E0607E'}"/>`).join('');
      $('#mo').textContent = tx(k ? 'قبل التطهير نحو 18 من كل مئة أم، وبعده نحو 1 (سنة 1848)' : 'قبل تطهير الأيدي: نحو 18 من كل مئة أم (سنة 1847)'); };
    go.onclick = () => { if (k >= 1) return; k = 1; draw(); go.textContent = '✔ ' + tx('نقصت الوفيات');
      fb('ok', 'مقارنة واحدة غيّر فيها شيئاً واحداً، فنقصت الوفيات كثيراً. ومع هذا الدليل رفض أكثر الأطباء الفكرة: الحكم للدليل لا لعدد الرافضين.'); award(); ok(); };
    draw(); speak(tx(E('E3').text)); } };

/* عادلة أم لا؟ (يحل محل E4) */
const fair = sorter('E4', 'هل هذه مقارنة عادلة؟', [
  { t: 'عشرون طفلاً يشربون الشراب، وعشرون مثلهم يشربون شراباً يشبهه بلا مادته، ولا يعرف أحد ماذا شرب.', a: 0, w: 'عادلة: مجموعتان متشابهتان لا تختلفان إلا في الشراب.' },
  { t: 'أحمد شرب الشراب فشُفي من الزكام.', a: 1, w: 'غير عادلة: شخص واحد بلا مقارنة، والزكام يشفى وحده.' },
  { t: 'مجموعة تشرب الشراب وتنام مبكراً، ومجموعة لا تشربه وتسهر.', a: 1, w: 'غير عادلة: اختلفتا في شيئين، فلا نعرف أيهما السبب.' },
  { t: 'جناحان متشابهان في مستشفى: في أحدهما يطهّر الأطباء أيديهم، وفي الآخر لا.', a: 0, w: 'عادلة: هذه مقارنة زيملفايس.' },
], ['عادلة', 'غير عادلة'], 'المقارنة العادلة: مجموعتان متشابهتان لا تختلفان إلا في الشيء الذي نختبره.');

/* مختبر الرسائل (يحل محل E5) */
const lab = sorter('E5', 'مختبر الرسائل: {احكم|احكمي} على كل رسالة.', [
  { t: '«شراب منزلي يشفي كل الأمراض في يوم واحد. أرسلها لعشرة أشخاص!»', a: 1, w: 'لا أصدّق: وعد كامل سريع، بلا من قال ولا كيف عرف، ويطلب النشر.' },
  { t: '«توصي منظمة الصحة العالمية الأطفال بساعة حركة في اليوم»، والرابط إلى صفحتها.', a: 0, w: 'أصدّق: جهة صحية معروفة، ويمكن الرجوع إلى صفحتها.' },
  { t: 'مقطع يقول إن النوم بعد العشاء يوقف النمو، ولم يذكر من أين عرف.', a: 2, w: 'أتحقق أولاً: لا نعرف كيف عرف؛ نسأل الطبيب أو جهة صحية.' },
  { t: '«خلطة أعشاب طبيعية للأطفال بدل الدواء؛ جرّبها جارنا فتحسن ابنه».', a: 1, w: 'لا أصدّق: قصة شخص واحد ليست دليلاً، والطبيعي ليس آمناً بالضرورة، والدواء من الطبيب.' },
  { t: 'جهة صحية تقول: غسل اليدين بالماء والصابون عشرين ثانية يقلل انتقال الجراثيم.', a: 0, w: 'أصدّق: جهة صحية، وله دليل {عرفته|عرفتِه} في درس الدفاع.' },
], ['أصدّق', 'لا أصدّق', 'أتحقق أولاً'], 'ثلاث رسائل من خمس لا تذكر كيف عرفت. قبل أن {تنشر|تنشري}: من قال؟ كيف عرف؟ هل قورن؟ ماذا يقول أهل العلم؟');

window.CUSTOM = { replace: { E2: septum, E3: ward, E4: fair, E5: lab } };
})();
