/* تأليف خاص — U07.L03 «الماء في جسمي: الميزان والعطش» */
(() => {
const E = id => LD.explain.find(e => e.id === id);
const F = 'font-family="IBM Plex Sans Arabic"';
const T = 'paint-order="stroke" stroke="#fff" stroke-width="3.5" stroke-linejoin="round"';

/* 1. ميزان الماء (يحل محل E2): ضع{|ي} كل طريق في كفته. الأوزان نسبية للرسم لا أرقام */
const IN = [['🥤', 'الشراب', 3.5], ['🥗', 'ماء الطعام', 1.5], ['⚙️', 'ماء يصنعه الجسم', 0.5]];
const OUT = [['🚽', 'البول', 3], ['💦', 'العرق', 1], ['😮‍💨', 'النفَس', 0.75], ['🖐️', 'الجلد بلا عرق ظاهر', 0.5], ['🧻', 'البراز', 0.25]];
const scale = { id: 'E2', render() { need(); return `<div class="scene">${sayNar(E('E2').text)}<h2>${tx('ضع{|ي} كل طريق في كفته من الميزان: اضغط{|ي} عليها كلها.')}</h2>
  <svg viewBox="0 0 300 150" role="img" aria-label="ميزان بكفتين: الدخول والخروج" style="width:100%;max-width:340px;display:block;margin:auto;background:#fff;border-radius:18px">
    <path d="M150 140 L150 46" stroke="#7a6a5a" stroke-width="6"/><path d="M120 142 h60" stroke="#7a6a5a" stroke-width="8" stroke-linecap="round"/>
    <g id="beam" style="transform-origin:150px 46px;transition:transform .6s"><path d="M40 46 H260" stroke="#7a6a5a" stroke-width="6" stroke-linecap="round"/>
      <path d="M260 46 l-40 46 h80 z" fill="#DCEEFB" stroke="#5DA9E9" stroke-width="2"/><path d="M40 46 l-40 46 h80 z" fill="#FDEFD0" stroke="#D9A23A" stroke-width="2"/>
      <text id="inN" x="260" y="86" text-anchor="middle" font-size="13">·</text><text id="outN" x="40" y="86" text-anchor="middle" font-size="13">·</text></g>
    <g font-size="11.5" font-weight="700" ${F} ${T}><text x="250" y="20" text-anchor="middle" fill="#2e6aa3">يدخل</text><text x="50" y="20" text-anchor="middle" fill="#8a5a10">يخرج</text></g>
  </svg>
  <div class="row" style="gap:8px;align-items:flex-start"><div style="flex:1"><b>${tx('يدخل')}</b>${IN.map(([e, n], i) => `<button class="opt bub" data-side="in" data-i="${i}" style="display:block;width:100%;margin:4px 0">${e} ${n}</button>`).join('')}</div>
  <div style="flex:1"><b>${tx('يخرج')}</b>${OUT.map(([e, n], i) => `<button class="opt bub" data-side="out" data-i="${i}" style="display:block;width:100%;margin:4px 0">${e} ${n}</button>`).join('')}</div></div>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let a = 0, b = 0, n = 0; const all = IN.length + OUT.length;
    $$('.bub').forEach(x => x.onclick = () => { if (x.dataset.done) return; x.dataset.done = 1; x.classList.add('ok'); n++;
      const side = x.dataset.side, it = (side === 'in' ? IN : OUT)[+x.dataset.i]; if (side === 'in') a += it[2]; else b += it[2];
      $('#inN').textContent = IN.filter((_, i) => $(`[data-side="in"][data-i="${i}"]`).dataset.done).map(v => v[0]).join(''); $('#outN').textContent = OUT.filter((_, i) => $(`[data-side="out"][data-i="${i}"]`).dataset.done).map(v => v[0]).join('');
      $('#beam').style.transform = `rotate(${Math.max(-14, Math.min(14, (a - b) * 3))}deg)`;
      if (n === all) { fb('ok', 'الكفتان متقاربتان: ما يدخل يساوي ما يخرج تقريباً. هذا هو توازن الماء. وانتبه{|ي}: النفَس والجلد يُخرجان ماءً لا نراه.'); award(); ok(); }
      else speak(it[1]); });
    speak(tx(E('E2').text)); } };

/* 2. الميزان يعمل (يحل محل E4): جرّب{|ي} الحر ثم الشرب، وراقب{|ي} العطش والرسالة والبول */
const COL = ['#FBF9E6', '#F6EDA0', '#F1D55A', '#E0AE3A', '#C27F26'];
const balance = { id: 'E4', render() { need(); return `<div class="scene">${sayNar(E('E4').text)}<h2>${tx('جرّب{|ي}: ساعة لعب في الحر، ثم كوبا ماء. ماذا يفعل الدماغ والكليتان؟')}</h2>
  <div class="card"><div>${tx('ماء الجسم:')}</div><svg viewBox="0 0 300 26" style="width:100%" aria-hidden="true"><rect x="0" y="4" width="300" height="18" rx="9" fill="#eee"/><rect id="wl" x="0" y="4" width="150" height="18" rx="9" fill="#5DA9E9" style="transition:all .5s"/><line x1="120" y1="0" x2="120" y2="26" stroke="#666" stroke-dasharray="3 3"/><line x1="180" y1="0" x2="180" y2="26" stroke="#666" stroke-dasharray="3 3"/></svg>
  <div class="note">${tx('بين الخطين: النطاق المناسب')}</div>
  <div style="margin-top:6px">${tx('العطش:')} <b id="th"></b></div><div>${tx('رسالة الدماغ إلى الكليتين:')} <b id="ms"></b></div><div>${tx('البول:')} <b id="ur"></b> <span id="uc" style="display:inline-block;width:26px;height:16px;border-radius:5px;vertical-align:middle;border:1px solid #bbb"></span></div></div>
  <div class="row" style="justify-content:center;flex-wrap:wrap;gap:6px"><button class="opt tool" style="width:auto" data-a="play">${tx('☀️ ساعة لعب في الحر')}</button><button class="opt tool" style="width:auto" data-a="drink">${tx('🥤 كوبا ماء')}</button><button class="opt tool" style="width:auto" data-a="sleep">${tx('🌙 ليلة نوم')}</button></div>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let w = 150; const tried = new Set();
    const upd = () => { $('#wl').setAttribute('width', w); $('#wl').setAttribute('x', 300 - w); const low = w < 140, high = w > 160;
      $('#th').textContent = low ? 'نعم، يجفّ الفم' : 'لا'; $('#ms').textContent = low ? 'أعيدا ماءً أكثر' : high ? 'متوقفة' : 'قليلة';
      $('#ur').textContent = low ? 'قليل غامق' : high ? 'كثير فاتح' : 'معتاد'; $('#uc').style.background = COL[low ? (w < 125 ? 4 : 3) : high ? 0 : 1]; };
    const SAYA = { play: 'فقدت{|ِ} ماءً بالعرق والنفَس: نقص ماء الجسم، فأشعرك{|ِ} الدماغ بالعطش، وأرسل إلى الكليتين: أعيدا ماءً أكثر. فقلّ البول وغمق.',
      drink: 'دخل الماء إلى الدم: توقفت الرسالة، فأخرجت الكليتان الزائد، فكثر البول وفتح لونه بعد قليل.',
      sleep: 'في النوم لا نشرب ونتنفس ونعرق قليلاً، فيصبح بول الصباح أغمق؛ كوب ماء في الصباح يعيد الميزان.' };
    $$('.tool').forEach(t => t.onclick = () => { const a = t.dataset.a; w = Math.max(105, Math.min(195, w + (a === 'play' ? -24 : a === 'drink' ? 30 : -10))); tried.add(a); upd(); fb('ok', SAYA[a]);
      if (tried.has('play') && tried.has('drink')) { award(); ok(); } });
    upd(); speak(tx(E('E4').text)); } };

/* 3. أكوابي اليوم (يحل محل E5) */
const DR = [['💧', 'ماء', 0], ['🥛', 'حليب', 0], ['🧃', 'عصير معلّب', 1], ['🥤', 'مشروب غازي', 1]];
const cups = { id: 'E5', render() { need(); return `<div class="scene">${sayNar(E('E5').text)}<h2>${tx('خطّط{|ي} شرب يوم مدرسي: املأ{|ي} سبعة أكواب.')}</h2>
  <div class="card"><div id="row" style="font-size:1.8rem;letter-spacing:4px;min-height:2.4rem;text-align:center"></div><div class="note" style="text-align:center">${tx('الهدف لمن هو أكبر من ثماني سنوات: نحو 7 إلى 8 أكواب؛ ولمن هو في الثامنة: نحو 5.')}</div><div>${tx('سكر مضاف:')} <b id="sg">—</b></div></div>
  <div class="row" style="justify-content:center;flex-wrap:wrap;gap:6px">${DR.map(([e, n], i) => `<button class="opt tool" style="width:auto" data-i="${i}">${e} ${n}</button>`).join('')}</div>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { const got = []; let fin = false;
    $$('.tool').forEach(t => t.onclick = () => { if (fin) return; const d = DR[+t.dataset.i]; got.push(d); $('#row').textContent = got.map(x => x[0]).join(' ');
      const s = got.filter(x => x[2]).length; $('#sg').textContent = s ? '🍬'.repeat(Math.min(s * 2, 12)) + (s >= 2 ? ' — كثير' : '') : 'لا شيء';
      if (d[2]) fb('bad', 'فيه ماء، لكن فيه سكراً كثيراً. الماء أفضل للعطش اليومي.'); else fb('ok', d[1] === 'ماء' ? 'الماء يروي بلا سكر.' : 'الحليب فيه ماء وغذاء، وهو مع الطعام أطيب.');
      if (got.length >= 7) { fin = true; const water = got.filter(x => x[1] === 'ماء').length; fb('ok', water >= 4 ? 'سبعة أكواب أكثرها ماء: يوم موفّق! وتوزّعها على اليوم أفضل من شربها مرة واحدة.' : 'سبعة أكواب، لكن الماء فيها قليل. في الغد {اجعل|اجعلي} أكثرها ماءً.'); award(); ok(); } });
    speak(tx(E('E5').text)); } };

/* 4. التجربة */
const X = LD.experiment;
const Q = [
  { k: 'a', q: 'ماذا ظهر على المرآة الباردة بعد نفَسك{|ِ}؟', o: ['لا شيء', 'ضباب أو قطرات صغيرة', 'غبار'], r: 1, w: 'في النفَس بخار ماء، يتكثف على السطح البارد.' },
  { k: 'b', q: 'جدار الكيس بعد عشر دقائق:', o: ['جاف كما هو', 'عليه رذاذ ماء'], r: 1, w: 'من الجلد يخرج ماء ولو لم نشعر بعرق.' },
];
const exp = { id: 'exp', render() { need(); const r = store.get('wtrx', {}); return `<div class="scene"><h2>${tx('تجربة: ' + X.title)}</h2><div class="card" style="background:#FFF3D6"><b>السلامة:</b> ${X.safety.slice(0, 2).map(tx).join(' ')}${safetyMore(X, 2)}</div>
  <div class="card"><b>${tx('تحتاج{|ين}:')}</b> ${X.materials.map(tx).join('، ')}</div><div class="card">${X.steps.map((s, i) => `<b>${i + 1}.</b> ${tx(s)}`).join('<br>')}</div>
  <div class="card">${Q.map(q => `<b>${tx(q.q)}</b><div class="row" style="flex-wrap:wrap">${q.o.map((o, i) => `<button class="opt" style="width:auto" data-q="${q.k}" data-v="${i}">${tx(o)}</button>`).join('')}</div>`).join('')}
  <b>${tx('عدد أكوابك{|ِ} اليوم:')}</b> <input type="number" id="nc" min="0" max="30" value="${htmlText(r.nc || '')}" style="width:70px"> <b>${tx('حجم كوبك{|ِ} (مل):')}</b> <input type="number" id="cs" min="0" max="1000" value="${htmlText(r.cs || '')}" style="width:80px"> <span id="tot" class="note"></span>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div></div>`; },
  after() { const r = store.get('wtrx', {}); const chk = () => { if (Q.every(q => r[q.k] === q.r) && r.nc > 0 && r.cs > 0) { award(); ok(); } else need(); };
    const tot = () => { $('#tot').textContent = r.nc > 0 && r.cs > 0 ? '= ' + (r.nc * r.cs) + ' مل' : ''; };
    Q.forEach(q => { if (r[q.k] != null) $(`[data-q="${q.k}"][data-v="${r[q.k]}"]`)?.classList.add(r[q.k] === q.r ? 'ok' : 'bad'); });
    $$('[data-q]').forEach(b => b.onclick = () => { const q = Q.find(x => x.k === b.dataset.q); r[q.k] = +b.dataset.v; store.set('wtrx', r); $$(`[data-q="${q.k}"]`).forEach(x => x.classList.remove('ok', 'bad')); const right = r[q.k] === q.r; b.classList.add(right ? 'ok' : 'bad'); if (!right) noteMiss(); fb(right ? 'ok' : 'bad', [right ? 'نعم: ' : 'لاحظ{|ي} مرة أخرى. ', q.w]); chk(); });
    for (const k of ['nc', 'cs']) $('#' + k).oninput = e => { r[k] = +e.target.value; store.set('wtrx', r); tot(); chk(); };
    tot(); chk(); speak([SAY.experiment, tx(X.title)]); } };

window.CUSTOM = { replace: { E2: scale, E4: balance, E5: cups, exp } };
})();
