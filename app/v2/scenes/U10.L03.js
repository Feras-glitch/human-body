/* تأليف خاص — U10.L03 «جسمي أمانة: الخصوصية والحدود». القاعدة والفعل الآمن وحدهما؛ لا وصف لإيذاء. */
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

/* آمن أم لا؟ (يحل محل E2) */
const safe = sorter('E2', '{اقرأ|اقرئي} كل موقف: آمن أم غير آمن؟', [
  { t: 'الطبيب يفحص أذنك{|ِ} لأنها تؤلمك{|ِ}، وأمك{|ِ} معك{|ِ}.', a: 0, w: 'آمن: فحص لسبب صحي وأحد الوالدين حاضر.' },
  { t: 'شخص يطلب أن يرى أجزاءك{|ِ} الخاصة ويقول إنها لعبة.', a: 1, w: 'غير آمن: لا لعبة في الأجزاء الخاصة. لا، ابتعد، أخبر.' },
  { t: 'أبوك{|ِ} يساعد أخاك{|ِ} الصغير في الاستحمام.', a: 0, w: 'آمن: مساعدة طفل صغير يحتاجها في النظافة.' },
  { t: 'شخص يرسل إليك{|ِ} صورة لأجزاء خاصة ويقول: لا تخبر أحداً.', a: 1, w: 'غير آمن: لا أحد يريك صوراً كهذه، وطلب الكتمان علامة. أخبر{|ي} كبيراً موثوقاً.' },
  { t: 'صديقك{|ِ} يصافحك{|ِ} بعد المباراة.', a: 0, w: 'آمن: مصافحة وتحية.' },
], ['آمن', 'غير آمن'], 'القاعدة: لا أحد يرى أجزاءك{|ِ} الخاصة أو يلمسها، إلا للنظافة أو العلاج بحضور الأهل؛ وإن أزعجك{|ِ} شيء فأخبر{|ي}.');

/* مفاجأة أم سر مزعج؟ (يحل محل E4) */
const secret = sorter('E4', 'مفاجأة سعيدة، أم سر مزعج لا يُكتم؟', [
  { t: 'هدية نخبئها لجدتك{|ِ} حتى عيدها.', a: 0, w: 'مفاجأة: تُكشف قريباً ويفرح بها الجميع.' },
  { t: 'شخص أعطاك{|ِ} حلوى وقال: لا تخبر أمك أنني دخلت غرفتك.', a: 1, w: 'سر مزعج: هدية مع طلب كتمان. أخبر{|ي} كبيراً موثوقاً.' },
  { t: 'حفلة صغيرة لصديقك{|ِ} يوم نجاحه.', a: 0, w: 'مفاجأة سعيدة تُكشف في يومها.' },
  { t: 'شخص {تعرفه|تعرفينه} قال: هذا سرنا، وإن أخبرت أحداً ستُعاقب.', a: 1, w: 'سر مزعج، ولو كان شخصاً {تعرفه|تعرفينه}: التهديد علامة. أخبر{|ي} كبيراً موثوقاً، ولن {تكون|تكوني} في مشكلة.' },
], ['مفاجأة', 'سر مزعج'], 'المفاجأة تُكتم قليلاً ثم تُكشف؛ والسر المزعج لا وعد فيه، {ولا تُلام|ولا تُلامين} أبداً.');

/* يد الأمان (يحل محل E5) */
const FING = ['الإبهام', 'السبابة', 'الوسطى', 'البنصر', 'الخنصر'];
const hand = { id: 'E5', render() { need(); const r = store.get('safex', {}); return `<div class="scene">${sayNar(E('E5').text)}<h2>${tx('مع ولي أمرك{|ِ}: {اكتب|اكتبي} على كل إصبع اسم كبير {تثق|تثقين} به.')}</h2>
  <svg viewBox="0 0 220 220" aria-hidden="true" style="width:100%;max-width:240px;display:block;margin:auto"><path d="M60 210L60 120Q40 104 34 78Q40 64 56 80L70 100L70 40Q82 26 94 40L94 100L94 26Q108 12 122 26L122 100L122 36Q136 22 150 36L150 104L150 64Q162 50 174 64L174 160Q170 200 130 214Z" fill="#E9B48F" stroke="#B9835F" stroke-width="4"/></svg><div class="card" style="text-align:center"><b>${tx('في وسط الكف: لا، ابتعد، أخبر.')}</b></div>
  <div class="card">${FING.map((f, i) => `<label style="display:block;margin:4px 0">${f}: <input type="text" id="n${i}" maxlength="30" value="${(r['n' + i] || '').replace(/[<>"&]/g, '')}" style="width:60%"></label>`).join('')}</div>
  <div class="note">${tx('الأسماء تبقى على هذا الجهاز وحده. {اختر|اختاري} واحداً على الأقل خارج البيت.')}</div>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { const r = store.get('safex', {}); let fin = false;
    const chk = () => { const n = FING.filter((_, i) => ($('#n' + i).value || '').trim().length >= 2).length;
      if (!fin && n >= 3) { fin = true; fb('ok', 'إن لم يسمعك{|ِ} الأول فالثاني، حتى يسمعك{|ِ} أحد. {علّق|علّقي} يدك{|ِ} المرسومة حيث {تراها|ترينها}.'); award(); ok(); } };
    FING.forEach((_, i) => { const el = $('#n' + i); el.oninput = () => { r['n' + i] = el.value.slice(0, 30); store.set('safex', r); chk(); }; });
    chk(); speak(tx(E('E5').text)); } };

window.CUSTOM = { replace: { E2: safe, E4: secret, E5: hand } };
})();
