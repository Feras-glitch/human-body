/* تأليف خاص — U08.L07 «الشاشات وجسمي». لا اسم تطبيق ولا لعبة؛ ولا هاتف في يد الطفل في الرسوم؛ ولا لوم للطفل أو الأهل. */
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

/* ساعة الجلوس: ماذا يحدث كلما طال الجلوس؟ (يحل محل E2) */
const bar = (x, y, w, f, c) => `<rect x="${x}" y="${y}" width="${w}" height="14" rx="7" fill="#EEE"/><rect x="${x + w * (1 - f)}" y="${y}" width="${w * f}" height="14" rx="7" fill="${c}"/>`;
const sit = { id: 'E2', render() { need(); return `<div class="scene">${sayNar(E('E2').text)}<h2>${tx('{حرّك|حرّكي} مدة الجلوس، ثم {اضغط|اضغطي} «أقوم وأتحرك».')}</h2>
  <svg viewBox="0 0 320 150" role="img" aria-label="أشرطة لتعب العين وسكون العضلات تطول كلما طال الجلوس" style="width:100%;max-width:340px;display:block;margin:auto;background:#fff;border-radius:18px"><circle cx="300" cy="30" r="9" fill="#E0607E"/><circle cx="300" cy="90" r="9" fill="#F2A541"/><g id="bars"></g></svg>
  <div class="note">${tx('الشريط الوردي: تعب العين. الشريط البرتقالي: سكون العضلات. والأشرطة للتوضيح لا للقياس.')}</div>
  <label style="display:block;margin-top:6px">${tx('مدة الجلوس:')} <b id="mv"></b><input type="range" id="mn" min="0" max="120" step="10" value="0" style="width:100%" aria-label="دقائق الجلوس"></label>
  <button class="opt" id="go" style="text-align:center">${tx('أقوم وأتحرك')}</button>
  <div class="card" id="out" style="min-height:40px"></div>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let peak = 0, fin = false; const go = $('#go');
    const upd = () => { const m = +$('#mn').value, f = Math.min(1, m / 120); peak = Math.max(peak, m);
      $('#bars').innerHTML = bar(20, 46, 280, f, '#E0607E') + bar(20, 106, 280, f, '#F2A541');
      $('#mv').textContent = m + ' ' + tx('دقيقة');
      $('#out').innerHTML = tx(m < 20 ? 'العين والعضلات بخير.' : m < 60 ? 'مرّت عشرون دقيقة أو أكثر: حان وقت 20-20-20 والحركة.' : 'جلوس طويل: العين متعبة والعضلات ساكنة منذ وقت.'); };
    $('#mn').oninput = upd;
    go.onclick = () => { if (fin) return;
      if (peak < 60) { fb('bad', '{حرّك|حرّكي} المدة أولاً لترى ماذا يحدث في الجلوس الطويل.'); return; }
      fin = true; $('#mn').value = 0; upd(); go.textContent = '✔ ' + tx('قمت وتحركت');
      fb('ok', 'دقيقتان من الحركة ونظرة إلى بعيد أراحتا العين وحرّكتا العضلات. الجلوس الطويل يُكسر بالحركة.'); award(); ok(); };
    upd(); speak(tx(E('E2').text)); } };

/* صيد الحيل (يحل محل E3) */
const tricks = sorter('E3', 'في تطبيق متخيَّل: هل هذه حيلة تطيل البقاء، أم شيء يساعد على التوقف؟', [
  { t: 'المقطع التالي يبدأ وحده بعد ثلاث ثوانٍ', a: 0, w: 'حيلة: التشغيل التلقائي يقرر عنك{|ِ}.' },
  { t: 'رسالة: «لعبت نصف ساعة، هل تريد أن ترتاح؟»', a: 1, w: 'يساعد: تذكير بالوقت.' },
  { t: 'نجمة جديدة كلما شاهدت مقطعاً آخر', a: 0, w: 'حيلة: مكافأة سريعة تدعو إلى مرة أخرى.' },
  { t: 'الصفحة تنزل وتنزل ولا تنتهي', a: 0, w: 'حيلة: التمرير بلا نهاية.' },
  { t: 'المرحلة تنتهي ويظهر زر «انتهيت»', a: 1, w: 'يساعد: نهاية واضحة.' },
  { t: 'عرض شراء يظهر فجأة وسط اللعب', a: 0, w: 'حيلة: إعلانات وعروض شراء.' },
], ['حيلة تطيل البقاء', 'يساعد على التوقف'], 'صعوبة التوقف ليست ضعفاً منك{|ِ}؛ إنها حيل مدروسة. وإن {عرفتها|عرفتِها} سهل أن {تغلبها|تغلبيها}.');

/* قواعد خطة الشاشات (يحل محل E4) */
const plan = sorter('E4', 'هل تصلح هذه القاعدة لخطة الشاشات في بيتنا؟', [
  { t: 'لا شاشة على مائدة الطعام', a: 0, w: 'تصلح: نتحدث معاً.' },
  { t: 'الهاتف بجانب الوسادة طوال الليل', a: 1, w: 'لا تصلح: الهاتف خارج غرفة النوم ليلاً.' },
  { t: 'نطفئ الشاشات قبل النوم بساعة', a: 0, w: 'تصلح: ليأتي النوم أسرع.' },
  { t: 'ساعة لعب وحركة كل يوم، خارج البيت إن أمكن', a: 0, w: 'تصلح: للعضلات والعين.' },
  { t: 'الشاشة بدل اللعب مع الأصدقاء', a: 1, w: 'لا تصلح: اللعب والحركة جزء من اليوم.' },
], ['تصلح', 'لا تصلح'], 'خطة الشاشات اتفاق في البيت، يلتزم به الكبار والصغار معاً، والشاشة فيها نفع إذا توازنت.');

/* تجربة المدارس في الصين (يحل محل E5) */
const school = { id: 'E5', render() { need(); return `<div class="scene">${sayNar(E('E5').text)}<h2>${tx('{اضغط|اضغطي} لتنتقل ثلاث سنوات، و{قارن|قارني} المجموعتين.')}</h2>
  <svg viewBox="0 0 320 170" role="img" aria-label="مجموعتان من المدارس؛ عمود قصر النظر في مدارس اللعب خارج الصف أقصر بعد ثلاث سنوات" style="width:100%;max-width:340px;display:block;margin:auto;background:#fff;border-radius:18px">
    <line x1="20" y1="140" x2="300" y2="140" stroke="#999" stroke-width="2"/><g id="cols"></g>
    <circle cx="230" cy="158" r="7" fill="#2E9E6A"/><circle cx="90" cy="158" r="7" fill="#9AA7B4"/></svg>
  <div class="note"><span style="color:#2E9E6A">●</span> ${tx('الأخضر: ست مدارس فيها حصة لعب خارج الصف.')}<br><span style="color:#9AA7B4">●</span> ${tx('الرمادي: ست مدارس بقيت كما هي.')}<br>${tx('ارتفاع العمود: كم طفلاً من كل مئة أصيب بقصر النظر.')}</div>
  <div class="card" style="text-align:center"><b id="yr"></b></div>
  <button class="opt" id="go" style="text-align:center">${tx('بعد ثلاث سنوات')}</button>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let y = 0; const go = $('#go'), A = [0, 30.4], B = [0, 39.5];
    const draw = () => { const h = v => v * 2.6;
      $('#cols').innerHTML = `<rect x="200" y="${140 - h(A[y])}" width="60" height="${h(A[y])}" rx="6" fill="#2E9E6A"/><rect x="60" y="${140 - h(B[y])}" width="60" height="${h(B[y])}" rx="6" fill="#9AA7B4"/>`;
      $('#yr').textContent = tx(y ? `بعد ${'ثلاث سنوات'}` : 'البداية: أطفال الصف الأول'); };
    go.onclick = () => { if (y >= 1) return; y = 1; draw();
      if (y === 1) { go.textContent = '✔ ' + tx('قارنّا بعد ثلاث سنوات'); fb('ok', 'بعد ثلاث سنوات: نحو 30 من كل مئة في مدارس اللعب خارج الصف، ونحو 40 من كل مئة في الأخرى.'); award(); ok(); }
    };
    draw(); speak(tx(E('E5').text)); } };

window.CUSTOM = { replace: { E2: sit, E3: tricks, E4: plan, E5: school } };
})();
