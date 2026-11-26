/* تأليف خاص — U08.L06 «مشاعري وجسمي». لا يُطلب من الطفل أن يحكي شيئاً عن نفسه؛ كل المواقف متخيَّلة. */
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

/* يهدّئ أم يؤذي؟ (يحل محل E2) */
const calm = sorter('E2', 'حين {تغضب|تغضبين}: هل هذا يهدّئ أم يؤذي؟', [
  { t: 'أبتعد قليلاً إلى غرفة أخرى', a: 0, w: 'يهدّئ: الابتعاد يعطي الجسم وقتاً ليهدأ.' },
  { t: 'أرمي الكوب على الأرض', a: 1, w: 'يؤذي: تكسير الأشياء غير مقبول.' },
  { t: 'شهيق إلى أربعة وزفير إلى ستة', a: 0, w: 'يهدّئ: النفَس البطيء يشغّل مكابح الهدوء.' },
  { t: 'أرسم ما أشعر به', a: 0, w: 'يهدّئ: التعبير بالرسم بلا إيذاء.' },
  { t: 'أصرخ في وجه أخي', a: 1, w: 'يؤذي: الصراخ يجرح ولا يحل.' },
], ['يهدّئ', 'يؤذي'], 'التعبير عن الغضب مقبول، والإيذاء لا. ثم {تكلم|تكلمي} مع من {تثق|تثقين} به.');

/* مزاح أم خلاف أم تنمر؟ (يحل محل E3) */
const bully = sorter('E3', 'مزاح، أم خلاف عابر، أم تنمر؟', [
  { t: 'صديقان يتبادلان النكات ويضحكان معاً، ويتوقفان إذا طلب أحدهما', a: 0, w: 'مزاح: الجميع يضحك، ويتوقف إذا طُلب.' },
  { t: 'تخاصم زميلان مرة على دور في اللعب، ثم تصالحا', a: 1, w: 'خلاف عابر: مرة واحدة، ولا قوة غير متكافئة.' },
  { t: 'مجموعة تمنع زميلاً من الجلوس معها كل يوم وتنشر عنه كلاماً', a: 2, w: 'تنمر: إقصاء وشائعات تتكرر؛ يُخبر كبير ليوقفه.' },
  { t: 'ولد أكبر يأخذ طعام ولد أصغر كل صباح', a: 2, w: 'تنمر: أذى يتكرر من الأقوى.' },
  { t: 'ينشر بعضهم صورة زميل في مجموعة الصف ويسخرون منها كل يوم', a: 2, w: 'تنمر على الشاشات: لا نضحك ولا ننشر، ونخبر كبيراً.' },
], ['مزاح', 'خلاف عابر', 'تنمر'], 'التنمر أذى مقصود يتكرر من الأقوى. الشاهد لا يضحك ولا يشارك، بل يأتي بكبير يوقفه.');

/* المرشح يغيّر الصورة لا الوجه (يحل محل E4) */
const faceSvg = f => { const eye = 9 + f * 6, glow = (f * .5).toFixed(2);
  return `<circle cx="0" cy="0" r="62" fill="#F4D3B5" stroke="#B9835F" stroke-width="3"/>
    ${f < .3 ? '<circle cx="-24" cy="20" r="3" fill="#D9A27A"/><circle cx="28" cy="14" r="2.5" fill="#D9A27A"/><circle cx="18" cy="28" r="2" fill="#D9A27A"/>' : ''}
    <ellipse cx="-22" cy="-10" rx="${eye}" ry="${eye}" fill="#FFFFFF" stroke="#333" stroke-width="2"/><ellipse cx="22" cy="-10" rx="${eye}" ry="${eye}" fill="#FFFFFF" stroke="#333" stroke-width="2"/>
    <circle cx="-22" cy="-10" r="5" fill="#333"/><circle cx="22" cy="-10" r="5" fill="#333"/>
    <path d="M-20 28Q0 40 20 28" fill="none" stroke="#A8333B" stroke-width="3"/>
    <circle cx="0" cy="0" r="62" fill="#FFFFFF" opacity="${glow}"/>`; };
const filt = { id: 'E4', render() { need(); return `<div class="scene">${sayNar(E('E4').text)}<h2>${tx('{حرّك|حرّكي} المرشح، و{قارن|قارني} الصورة بالوجه الحقيقي.')}</h2>
  <svg viewBox="0 0 320 180" role="img" aria-label="وجه حقيقي على اليمين، وصورته على الشاشة على اليسار" style="width:100%;max-width:340px;display:block;margin:auto;background:#fff;border-radius:18px">
    <g transform="translate(235 92)">${faceSvg(0)}</g>
    <rect x="12" y="10" width="146" height="164" rx="16" fill="#2E3A4A"/><rect x="20" y="18" width="130" height="148" rx="10" fill="#EAF4FB"/><g id="ph" transform="translate(85 92) scale(.95)"></g></svg>
  <div class="row" style="justify-content:space-between"><span>${tx('الوجه الحقيقي')}</span><span>${tx('صورته على الشاشة')}</span></div>
  <label style="display:block;margin-top:6px">${tx('قوة المرشح')}<input type="range" id="fl" min="0" max="100" value="0" style="width:100%" aria-label="قوة المرشح"></label>
  <div class="card" id="out" style="min-height:40px"></div>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let fin = false;
    const upd = () => { const f = +$('#fl').value / 100; $('#ph').innerHTML = faceSvg(f);
      $('#out').innerHTML = tx(f < .2 ? 'الصورة مثل الوجه.' : f < .7 ? 'اختفت النمشات، وكبرت العينان في الصورة… والوجه الحقيقي؟' : 'الصورة صارت مختلفة جداً، والوجه الحقيقي كما هو.');
      if (!fin && f >= .95) { fin = true; fb('ok', 'المرشح غيّر الصورة على الشاشة، لا الوجه. فلا {تقارن|تقارني} وجهك{|ِ} أو جسمك{|ِ} بصورة معدّلة.'); award(); ok(); } };
    $('#fl').oninput = upd; upd(); speak(tx(E('E4').text)); } };

/* أتصرف بنفسي أم أطلب العون؟ (يحل محل E5) */
const help = sorter('E5', 'هل يكفي أن أتصرف بنفسي، أم أطلب العون من كبير؟', [
  { t: 'غضبت قليلاً لأني خسرت لعبة', a: 0, w: 'أهدّئ نفسي: أتنفس ببطء، وألعب مرة أخرى.' },
  { t: 'حزين منذ أيام ولا أريد أن آكل أو ألعب', a: 1, w: 'أطلب العون: الحزن الطويل يُخبر به كبير، وقد يأخذني إلى الطبيب.' },
  { t: 'زميل يضربني كل يوم في الطريق', a: 1, w: 'أطلب العون: التنمر يوقفه كبير.' },
  { t: 'قلق قليل قبل أول يوم في نادٍ جديد', a: 0, w: 'أهدّئ نفسي: القلق القليل طبيعي، وأتنفس ببطء، وأكلم أمي إن أردت.' },
  { t: 'لا أستطيع النوم من الخوف ليالي كثيرة', a: 1, w: 'أطلب العون: الخوف الذي يمنع النوم أياماً يحتاج كبيراً.' },
], ['أهدّئ نفسي', 'أطلب العون'], 'طلب العون قوة لا ضعف: حين يطول الشعور أو يثقل، أو يؤذيني أحد.');

window.CUSTOM = { replace: { E2: calm, E3: bully, E4: filt, E5: help } };
})();
