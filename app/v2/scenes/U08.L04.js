/* تأليف خاص — U08.L04 «ماذا يحدث في جسمي حين أخاف؟» */
(() => {
const E = id => LD.explain.find(e => e.id === id);
const F = 'font-family="IBM Plex Sans Arabic"';
const tap = (el, fn) => { el.onclick = fn; el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }; };
const pill = (s, i) => `<g class="st" data-k="${i}" tabindex="0" role="button" aria-label="${s.lb}" style="cursor:pointer">
  <line x1="${s.ax}" y1="${s.ay}" x2="${s.x}" y2="${s.y}" stroke="#3E7BB6" stroke-width="1.5"/><circle cx="${s.ax}" cy="${s.ay}" r="3.5" fill="#3E7BB6"/>
  <rect x="${s.x - s.w / 2}" y="${s.y - 13}" width="${s.w}" height="26" rx="13" fill="#3E7BB6"/>
  <text class="n" x="${s.x}" y="${s.y + 4.5}" text-anchor="middle" font-size="12.5" font-weight="700" ${F} fill="#fff">${s.lb}</text></g>`;

/* جسم طفل من الأمام: القلب إلى يسار الجسم (يمين الناظر)، والكبد إلى يمينه */
const body = inner => `<svg viewBox="0 0 320 300" role="img" aria-label="جسم طفل من الأمام: الدماغ والعينان والفم والرئتان والقلب والكبد والمعدة والكليتان والغدتان فوقهما وعضلات الفخذ وجلد الساعد" style="width:100%;max-width:380px;display:block;margin:auto;background:#fff;border-radius:18px">
  <g fill="#F6D2B4" stroke="#C99A78" stroke-width="2">
    <path d="M114 98 Q98 100 94 120 L82 186 Q80 196 90 198 Q98 198 100 188 L112 132 Z"/>
    <path d="M206 98 Q222 100 226 120 L238 186 Q240 196 230 198 Q222 198 220 188 L208 132 Z"/>
    <path d="M124 204 L122 286 Q122 294 132 294 Q142 294 142 286 L152 212 Z"/>
    <path d="M196 204 L198 286 Q198 294 188 294 Q178 294 178 286 L168 212 Z"/>
    <path d="M112 96 Q160 84 208 96 L204 200 Q160 214 116 200 Z"/>
    <rect x="151" y="76" width="18" height="16" rx="4"/>
    <circle cx="160" cy="48" r="32"/>
  </g>
  <path d="M134 40 Q136 20 160 18 Q184 20 186 40 Q172 34 160 36 Q148 34 134 40 Z" fill="#F4B8C4" stroke="#C9788A" stroke-width="1.5"/>
  <g fill="#fff" stroke="#8A6A55" stroke-width="1.2"><ellipse cx="148" cy="52" rx="7" ry="5"/><ellipse cx="172" cy="52" rx="7" ry="5"/></g>
  <g fill="#2B2B2B"><circle cx="148" cy="52" r="3.6"/><circle cx="172" cy="52" r="3.6"/></g>
  <path d="M152 66 Q160 70 168 66" fill="none" stroke="#B5655B" stroke-width="2" stroke-linecap="round"/>
  <g fill="#F4A9B8" stroke="#C9788A" stroke-width="1.5"><ellipse cx="141" cy="124" rx="15" ry="24"/><ellipse cx="179" cy="124" rx="15" ry="24"/></g>
  <path d="M170 146 C156 136 158 124 166 124 C170 124 171 128 172 130 C173 128 175 124 179 124 C186 124 188 136 170 146 Z" fill="#E0525B" stroke="#A8333B" stroke-width="1.2"/>
  <ellipse cx="139" cy="162" rx="22" ry="10" fill="#B8654A" opacity=".85"/>
  <path d="M168 156 Q190 152 192 166 Q192 178 176 176 Q166 174 168 164 Z" fill="#F0A35E" stroke="#C47A35" stroke-width="1.2"/>
  <g fill="#C9586B"><ellipse cx="144" cy="190" rx="6" ry="9"/><ellipse cx="176" cy="190" rx="6" ry="9"/></g>
  <g fill="#E2B33C" stroke="#B08720" stroke-width="1"><path d="M138 182 L144 174 L150 182 Z"/><path d="M170 182 L176 174 L182 182 Z"/></g>
  <ellipse cx="132" cy="236" rx="8" ry="20" fill="#E58A7E" opacity=".7"/>
  <g fill="#C99A78"><circle cx="226" cy="170" r="1.6"/><circle cx="230" cy="176" r="1.6"/><circle cx="225" cy="180" r="1.6"/><circle cx="231" cy="184" r="1.6"/><circle cx="227" cy="164" r="1.6"/></g>
  ${inner}
</svg>`;
const PARTS = [
  { x: 48, y: 22, w: 60, ax: 152, ay: 30, lb: 'الدماغ', ch: 'جرس الإنذار يرنّ', why: 'فيرسل الأمر في الأعصاب إلى الجسم كله.' },
  { x: 272, y: 30, w: 62, ax: 172, ay: 52, lb: 'البؤبؤ', ch: 'يتسع', why: 'ليدخل ضوء أكثر {فترى|فتري} الخطر.' },
  { x: 48, y: 74, w: 50, ax: 156, ay: 67, lb: 'الفم', ch: 'يجف', why: 'لأن اللعاب يقلّ حين يتباطأ الهضم.' },
  { x: 48, y: 120, w: 64, ax: 132, ay: 118, lb: 'الرئتان', ch: 'التنفس يسرع', why: 'ليدخل أكسجين أكثر للعضلات.' },
  { x: 272, y: 108, w: 56, ax: 172, ay: 134, lb: 'القلب', ch: 'يسرع ويدق بقوة', why: 'ليدفع دماً أكثر إلى العضلات.' },
  { x: 48, y: 166, w: 56, ax: 128, ay: 162, lb: 'الكبد', ch: 'يُخرج سكراً من مخزنه', why: 'طاقة للعضلات.' },
  { x: 272, y: 154, w: 58, ax: 184, ay: 164, lb: 'المعدة', ch: 'الهضم يتباطأ', why: 'فيتجه الجهد إلى الحركة، {وتحسّ|وتحسّين} بشيء غريب في بطنك{|ِ}.' },
  { x: 272, y: 246, w: 64, ax: 178, ay: 180, lb: 'الغدتان', ch: 'تطلقان الأدرينالين في الدم', why: 'وهو الذي يسرّع هذا كله في ثوانٍ.' },
  { x: 48, y: 246, w: 62, ax: 132, ay: 236, lb: 'العضلات', ch: 'تشتد', why: 'مستعدة للجري أو الدفاع.' },
  { x: 272, y: 200, w: 52, ax: 230, ay: 176, lb: 'الجلد', ch: 'تظهر القشعريرة', why: 'عضلات صغيرة عند أصل كل شعرة تنقبض فتقف الشعرات.' },
];
const changes = { id: 'E2', render() { need(); return `<div class="scene">${sayNar(E('E2').text)}<h2>${tx('رنّ الإنذار! اضغط{|ي} كل جزء في الجسم: ماذا يتغير فيه؟ ولماذا؟')}</h2>
  ${body(PARTS.map(pill).join(''))}
  <ul class="card" id="steps" style="margin:6px 0;padding-inline-start:22px;min-height:20px"></ul><div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { const done = new Set(); $$('.st').forEach(g => tap(g, () => { const k = +g.dataset.k; if (done.has(k)) return; done.add(k);
      g.querySelector('rect').setAttribute('fill', '#2E9E6A'); const p = PARTS[k];
      $('#steps').insertAdjacentHTML('beforeend', `<li><b>${p.lb}:</b> ${tx(p.ch)} — ${tx(p.why)}</li>`);
      if (done.size === PARTS.length) { fb('ok', 'هذه كلها معاً في ثوانٍ: استجابة الخطر، تجهز الجسم ليهرب أو يدافع.'); award(); ok(); }
      else fb('ok', [p.lb + ': ' + p.ch + '. ', 'بقي ' + (PARTS.length - done.size) + '.']); }));
    speak(tx(E('E2').text)); } };

/* مكابح الهدوء: تنفّس موجَّه (يحل محل E4) */
const CYC = 3;
const breathe = { id: 'E4', render() { need(); return `<div class="scene">${sayNar(E('E4').text)}<h2>${tx('{ساعد|ساعدي} المكابح: ثلاث أنفاس بطيئة. {اضغط|اضغطي} «شهيق» و{عُدّ|عُدّي} إلى 4، ثم «زفير» و{عُدّ|عُدّي} إلى 6.')}</h2>
  <svg viewBox="0 0 320 200" role="img" aria-label="دائرة تكبر مع الشهيق وتصغر مع الزفير" style="width:100%;max-width:340px;display:block;margin:auto;background:#fff;border-radius:18px">
    <circle cx="160" cy="100" r="86" fill="none" stroke="#DCEFE9" stroke-width="2" stroke-dasharray="4 6"/>
    <circle id="orb" cx="160" cy="100" r="34" fill="#7FC8B6" opacity=".85" style="transition:r 4s ease-in-out"/>
    <text id="cnt" x="160" y="108" text-anchor="middle" font-size="26" font-weight="700" ${F} fill="#fff"></text>
  </svg>
  <div class="row" style="justify-content:center;gap:10px;flex-wrap:wrap;margin:8px 0">
    <button class="tool" id="bin" style="width:auto;background:var(--card);padding:12px 18px;box-shadow:0 3px 0 var(--line)">${tx('شهيق من الأنف')}</button>
    <button class="tool" id="bout" style="width:auto;background:var(--card);padding:12px 18px;box-shadow:0 3px 0 var(--line)">${tx('زفير طويل من الفم')}</button>
  </div>
  <div class="card" style="text-align:center"><span id="cy"></span></div>
  <div class="note">${tx('ليست سباقاً: {خذ|خذي} وقتك{|ِ}. وإن {أحسست|أحسستِ} بدوار {فتنفّس|فتنفّسي} كعادتك{|ِ}.')}</div>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let phase = 'in', cyc = 0, tmr = null; const orb = $('#orb'), cnt = $('#cnt');
    const show = () => { $('#cy').textContent = cyc >= CYC ? tx('ثلاث أنفاس بطيئة: أحسنت{|ِ}.') : tx('النَّفَس ' + (cyc + 1) + ' من ' + CYC); };
    const count = n => { clearInterval(tmr); let i = 1; cnt.textContent = '1'; tmr = setInterval(() => { i++; if (i > n) { clearInterval(tmr); cnt.textContent = ''; } else cnt.textContent = String(i); }, 1000); };
    const go = (ph, r, sec) => { orb.style.transition = `r ${sec}s ease-in-out`; orb.setAttribute('r', r); orb.style.r = r + 'px'; count(sec); };
    tap($('#bin'), () => { if (cyc >= CYC) return; if (phase !== 'in') { fb('bad', 'بعد الشهيق يأتي الزفير الطويل: {اضغط|اضغطي} «زفير».'); return; }
      phase = 'out'; go('in', 80, 4); fb('ok', 'شهيق بطيء من الأنف… 1، 2، 3، 4.'); });
    tap($('#bout'), () => { if (cyc >= CYC) return; if (phase !== 'out') { fb('bad', 'نبدأ بالشهيق: {اضغط|اضغطي} «شهيق» أولاً.'); return; }
      phase = 'in'; cyc++; go('out', 34, 6); show();
      if (cyc >= CYC) { fb('ok', 'الزفير الطويل البطيء يساعد مكابح الهدوء في جسمك{|ِ}. {جرّبه|جرّبيه} حين {تخاف|تخافين} أو {تغضب|تغضبين}، ومعه كلام مع كبير {تثق|تثقين} به.'); award(); ok(); }
      else fb('ok', 'زفير طويل من الفم… حتى 6. والآن شهيق مرة أخرى.'); });
    show(); speak(tx(E('E4').text)); } };

/* قضية «المقلب المرعب»: مزاح أم ترويع؟ (يحل محل E5) */
const CASES = [
  { k: 'a', q: 'لغز مضحك {تقوله|تقولينه} على العشاء، فيضحك الجميع.', r: 0, w: 'يضحك منه الجميع، ولا يفزع به أحد.' },
  { k: 'b', q: 'القفز صارخاً على أختك{|ِ} من خلف الباب في الظلام.', r: 1, w: 'يطلق في جسمها إنذاراً كاملاً، وقد تسقط أو تصطدم بشيء.' },
  { k: 'c', q: 'إخفاء حقيبة صديقك{|ِ} ليظن أنه أضاعها، ثم {تضحك|تضحكين}.', r: 1, w: 'يشبه ما في الحديث: أخذ بعضهم حبل صاحبهم وهو نائم ففزع، فنهى النبي ﷺ عن ترويع المسلم.' },
  { k: 'd', q: 'تقليد صوت قطة لأخيك{|ِ} الصغير وهو يراك{|ِ} ويضحك.', r: 0, w: 'هو يراك{|ِ} ويعرف أنها لعبة؛ لا فزع فيها.' },
  { k: 'e', q: 'التلويح بالمقص نحو وجه صديقك{|ِ} وأنت{|ِ} {تضحك|تضحكين}.', r: 1, w: 'الإشارة إلى الأخ بشيء حاد ولو مزاحاً نهى عنها النبي ﷺ، واليد قد تزلّ.' },
  { k: 'f', q: 'رسالة لصديقك{|ِ} تقول إن قطّه ضاع، ثم تكتب{|ين} بعدها: أمزح!', r: 1, w: 'الخبر المخيف الكاذب يفزعه، وهو كذب أيضاً ولو قلنا بعده: أمزح.' },
];
const OPT = ['مزاح لطيف', 'ترويع'];
const prank = { id: 'E5', render() { need(); return `<div class="scene">${sayNar(E('E5').text)}<h2>${tx('مزاح أم ترويع؟ {احكم|احكمي} على كل موقف.')}</h2>
  <div class="card">${CASES.map(c => `<div style="margin:8px 0"><b>${tx(c.q)}</b><div class="row" style="flex-wrap:wrap">${OPT.map((o, i) => `<button class="opt" style="width:auto" data-q="${c.k}" data-v="${i}">${o}</button>`).join('')}</div></div>`).join('')}</div>
  <div class="card" id="sum" hidden><b>${tx('الحكم:')}</b> ${tx('نهى النبي ﷺ أن يروّع المسلم أخاه ولو مزاحاً، والأذى ممنوع مع كل إنسان.')}<br><b>${tx('الأثر:')}</b> ${tx('إنذار كامل في جسم المفزوع، وقد يسقط أو يتأذى.')}<br><b>${tx('الحكمة:')}</b> ${tx('المزاح الجميل يضحك منه الجميع؛ والذي يفزع به أحد ليس مزاحاً.')}</div>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { const r = {}; const chk = () => { if (CASES.every(c => r[c.k] === c.r)) { $('#sum').hidden = false; award(); ok(); } };
    $$('[data-q]').forEach(b => b.onclick = () => { const c = CASES.find(x => x.k === b.dataset.q); r[c.k] = +b.dataset.v;
      $$(`[data-q="${c.k}"]`).forEach(x => x.classList.remove('ok', 'bad')); const right = r[c.k] === c.r; b.classList.add(right ? 'ok' : 'bad'); if (!right) noteMiss();
      fb(right ? 'ok' : 'bad', [right ? 'نعم: ' : 'فكّر{|ي} مرة أخرى: ', c.w]); chk(); });
    speak(tx(E('E5').text)); } };

/* التجربة */
const X = LD.experiment;
const NUM = [['p0', 'نبض الراحة:'], ['j1', 'بعد القفز (1):'], ['n1', 'بعد دقيقتين بتنفس عادي:'], ['j2', 'بعد القفز (2):'], ['s1', 'بعد دقيقتين بتنفس بطيء:']];
const Q = [
  { k: 'a', q: 'ما الشيء الوحيد الذي {غيّرته|غيّرتِه} بين الطريقتين؟', o: ['مدة القفز', 'طريقة التنفس'], r: 1, w: 'نثبّت القفز والجلوس والعدّ، ونغيّر التنفس وحده: هذه مقارنة عادلة.' },
  { k: 'b', q: 'لماذا {رفعت|رفعتِ} النبض بالقفز لا بإخافة أحد؟', o: ['لأن الترويع منهي عنه وقد يؤذي', 'لأن الخوف لا يرفع النبض'], r: 0, w: 'الخوف يرفع النبض فعلاً، لكننا لا نروّع أحداً؛ والقفز يرفعه بلا أذى.' },
  { k: 'c', q: 'إذا لم يظهر فرق في مرة واحدة، ماذا {تفعل|تفعلين}؟', o: ['أغيّر الأرقام لتشبه المتوقع', 'أكتب ما وجدت وأعيد التجربة أياماً'], r: 1, w: 'العالِم يسجّل ما وجده لا ما تمناه.' },
];
const exp = { id: 'exp', render() { need(); return `<div class="scene"><h2>${tx('تجربة: ' + X.title)}</h2><div class="card" style="background:#FFF3D6"><b>السلامة:</b> ${X.safety.slice(0, 2).map(tx).join(' ')}${safetyMore(X, 2)}</div>
  <div class="card"><b>${tx('تحتاج{|ين}:')}</b> ${X.materials.map(tx).join('، ')}</div><div class="card">${X.steps.map((s, i) => `<b>${i + 1}.</b> ${tx(s)}`).join('<br>')}</div>
  <div class="card"><div class="note">${tx('نبضات في الدقيقة (العدد في 30 ثانية × 2):')}</div>${NUM.map(([id, l]) => `<label style="display:block">${tx(l)} <input type="number" id="${id}" min="30" max="220" style="width:5em"></label>`).join('')}<div id="sum" class="note"></div></div>
  <div class="card">${Q.map(q => `<b>${tx(q.q)}</b><div class="row" style="flex-wrap:wrap">${q.o.map((o, i) => `<button class="opt" style="width:auto" data-q="${q.k}" data-v="${i}">${tx(o)}</button>`).join('')}</div>`).join('')}<div class="fb" id="fb" role="status" aria-live="polite"></div></div></div>`; },
  after() { const r = store.get('fearx', {}); const chk = () => { if (Q.every(q => r[q.k] === q.r)) { award(); ok(); } else need(); };
    const sum = () => { const { p0, j1, n1, j2, s1 } = r; if ([p0, j1, n1, j2, s1].some(v => v == null)) { $('#sum').textContent = ''; return; }
      const d1 = n1 - p0, d2 = s1 - p0;
      $('#sum').textContent = (j1 <= p0 || j2 <= p0) ? tx('لم يرتفع النبض بعد القفز؟ {عُدّ|عُدّي} فوراً بعد القفز، {واقفز|واقفزي} دقيقة كاملة.')
        : d2 < d1 ? tx('بعد التنفس البطيء كان نبضك{|ِ} أقرب إلى نبض الراحة بـ' + (d1 - d2) + ' نبضة في الدقيقة. {أعد|أعيدي} التجربة يوماً آخر قبل أن {تحكم|تحكمي}.')
        : d2 === d1 ? tx('لم يظهر فرق هذه المرة. نسجّل ذلك بأمانة، ونعيد التجربة أياماً ونقارن.')
        : tx('كان النبض بعد التنفس العادي أقرب إلى الراحة هذه المرة. نسجّل ما وجدناه بأمانة؛ والفرق قد يتغير من يوم إلى يوم.'); };
    NUM.forEach(([id]) => { const el = $('#' + id); if (r[id] != null) el.value = r[id]; el.oninput = () => { r[id] = el.value === '' ? null : Math.max(30, Math.min(220, Math.round(+el.value))); store.set('fearx', r); sum(); }; });
    Q.forEach(q => { if (r[q.k] != null) $(`[data-q="${q.k}"][data-v="${r[q.k]}"]`)?.classList.add(r[q.k] === q.r ? 'ok' : 'bad'); });
    $$('[data-q]').forEach(b => b.onclick = () => { const q = Q.find(x => x.k === b.dataset.q); r[q.k] = +b.dataset.v; store.set('fearx', r); $$(`[data-q="${q.k}"]`).forEach(x => x.classList.remove('ok', 'bad')); const right = r[q.k] === q.r; b.classList.add(right ? 'ok' : 'bad'); if (!right) noteMiss(); fb(right ? 'ok' : 'bad', [right ? 'نعم: ' : 'فكّر{|ي} مرة أخرى. ', q.w]); chk(); });
    sum(); chk(); speak([SAY.experiment, tx(X.title)]); } };

window.CUSTOM = { replace: { E2: changes, E4: breathe, E5: prank, exp } };
})();
