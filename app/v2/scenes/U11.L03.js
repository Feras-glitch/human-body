/* تأليف خاص — U11.L03 «الإنسان والحيوان». بلا تشريح ولا أذى لحيوان؛ لا أرقام ولا كتابة داخل الرسوم. */
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
/* ثدييات أم لا؟ (يحل محل E1) */
const mam = sorter('E1', 'هل هذا الحيوان من الثدييات؟', [
  { t: 'البقرة', a: 0, w: 'نعم: ترضع صغارها.' },
  { t: 'السمكة', a: 1, w: 'لا: من الفقاريات، لكنها لا ترضع صغارها.' },
  { t: 'الدلفين', a: 0, w: 'نعم: يرضع صغاره ويتنفس الهواء.' },
  { t: 'العصفور', a: 1, w: 'لا: من الطيور.' },
  { t: 'الإنسان', a: 0, w: 'نعم: الإنسان من الثدييات.' },
], ['من الثدييات', 'ليس منها'], 'الثدييات ترضع صغارها، وكلها من الفقاريات ذات العمود الفقري.');

/* حجرات القلب (يحل محل E2) */
const hearts = sorter('E2', 'كم حجرة في قلب كل منها؟', [
  { t: 'السمكة', a: 0, w: 'حجرتان: أذين وبطين.' },
  { t: 'الضفدع', a: 1, w: 'ثلاث: أذينان وبطين.' },
  { t: 'العصفور', a: 2, w: 'أربع: مثلك{|ِ}.' },
  { t: 'البقرة', a: 2, w: 'أربع: من الثدييات.' },
  { t: 'الإنسان', a: 2, w: 'أربع: أذينان وبطينان.' },
], ['حجرتان', 'ثلاث', 'أربع'], 'القلب يضخ الدم في كلها، وحجراته تختلف: حجرتان، ثم ثلاث، ثم أربع.');

/* سبع فقرات (يحل محل E3) */
const neckSvg = f => { const h = 8 + f * 14; let y = 212, out = '';
  for (let i = 0; i < 7; i++) { y -= h + 3; out += `<rect x="214" y="${y}" width="30" height="${h}" rx="5" fill="#E8D7B0" stroke="#A88A4E" stroke-width="2"/>`; }
  let y2 = 212; for (let i = 0; i < 7; i++) { y2 -= 11; out += `<rect x="78" y="${y2}" width="26" height="8" rx="3" fill="#E8D7B0" stroke="#A88A4E" stroke-width="2"/>`; }
  return out + `<ellipse cx="229" cy="${y - 10}" rx="22" ry="11" fill="#E9B85C"/><circle cx="91" cy="${y2 - 14}" r="13" fill="#F4D3B5" stroke="#B9835F" stroke-width="2"/>`; };
const neck = { id: 'E3', render() { need(); return `<div class="scene">${sayNar(E('E3').text)}<h2>${tx('{حرّك|حرّكي} طول الفقرة، و{عُدّ|عُدّي} فقرات العنقين.')}</h2>
  <svg viewBox="0 0 320 220" role="img" aria-label="عنق إنسان على اليسار وعنق زرافة على اليمين، في كل منهما سبع فقرات" style="width:100%;max-width:340px;display:block;margin:auto;background:#fff;border-radius:18px"><g id="nk"></g></svg>
  <div class="note">${tx('على اليمين عنق الزرافة، وعلى اليسار عنق الإنسان.')}</div>
  <label style="display:block;margin-top:6px">${tx('طول فقرة الزرافة')}<input type="range" id="vl" min="0" max="100" value="0" style="width:100%" aria-label="طول فقرة الزرافة"></label>
  <div class="card" id="out" style="min-height:40px"></div>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let fin = false;
    const upd = () => { const f = +$('#vl').value / 100; $('#nk').innerHTML = neckSvg(f);
      $('#out').innerHTML = tx(f < .5 ? 'سبع فقرات هنا، وسبع هناك.' : 'طال العنق كثيراً… وما زال عدد الفقرات سبعاً!');
      if (!fin && f >= .95) { fin = true; fb('ok', 'سبع فقرات في العنقين؛ الفرق في طول الفقرة لا في عددها.'); award(); ok(); } };
    $('#vl').oninput = upd; upd(); speak(tx(E('E3').text)); } };

/* رحلة العشب في البقرة (يحل محل E4) */
const STEPS = ['تقطع البقرة العشب وتبلعه بعد مضغ قليل', 'يصل إلى الكرش، أكبر أجزاء المعدة، وفيه ملايين الكائنات الدقيقة', 'تعيده إلى فمها لتمضغه مرة ثانية: هذا الاجترار', 'يمضي إلى بقية أجزاء المعدة، ثم إلى الأمعاء'];
const cow = { id: 'E4', render() { need(); return `<div class="scene">${sayNar(E('E4').text)}<h2>${tx('{اضغط|اضغطي} لتتبع العشب في البقرة.')}</h2>
  <svg viewBox="0 0 320 150" role="img" aria-label="معدة البقرة بأربعة أجزاء" style="width:100%;max-width:340px;display:block;margin:auto;background:#fff;border-radius:18px">
    <circle cx="290" cy="40" r="16" fill="#F4E4D4" stroke="#B9835F" stroke-width="2"/><path d="M276 46Q240 60 210 70" fill="none" stroke="#B9835F" stroke-width="4"/>
    <ellipse id="p1" cx="170" cy="85" rx="52" ry="40" fill="#EAD9C6" stroke="#9C7A55" stroke-width="3"/>
    <circle id="p2" cx="105" cy="60" r="16" fill="#EAD9C6" stroke="#9C7A55" stroke-width="3"/><circle id="p3" cx="80" cy="95" r="16" fill="#EAD9C6" stroke="#9C7A55" stroke-width="3"/><ellipse id="p4" cx="45" cy="115" rx="22" ry="14" fill="#EAD9C6" stroke="#9C7A55" stroke-width="3"/>
    <g id="dots"></g></svg>
  <div class="card" style="text-align:center"><b id="cs"></b></div>
  <button class="opt" id="go" style="text-align:center">${tx('الخطوة التالية')}</button>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let k = 0; const go = $('#go');
    const draw = () => { $('#cs').textContent = tx(STEPS[k]);
      $('#p1').setAttribute('fill', k >= 1 ? '#CFE7B5' : '#EAD9C6'); ['#p2', '#p3', '#p4'].forEach(p => $(p).setAttribute('fill', k >= 3 ? '#CFE7B5' : '#EAD9C6'));
      $('#dots').innerHTML = k >= 1 ? Array.from({ length: 14 }, (_, i) => `<circle cx="${140 + (i % 7) * 10}" cy="${72 + Math.floor(i / 7) * 22}" r="2.5" fill="#5B8A3C"/>`).join('') : '';
      if (k === 2) $('#dots').innerHTML += '<path d="M200 60Q250 20 282 34" fill="none" stroke="#2E9E6A" stroke-width="3" stroke-dasharray="5 4"/>'; };
    go.onclick = () => { if (k >= STEPS.length - 1) return; k++; draw();
      if (k === STEPS.length - 1) { go.textContent = '✔ ' + tx('عرفنا رحلة العشب'); fb('ok', 'الكائنات الدقيقة في الكرش تهضم من العشب ما لا تهضمه البقرة وحدها. ومعدتنا بسيطة، فلا نهضم العشب.'); award(); ok(); }
      else fb('ok', '{اضغط|اضغطي} للخطوة التالية.'); };
    draw(); speak(tx(E('E4').text)); } };

/* رحمة وصحة (يحل محل E5) */
const care = sorter('E5', 'هل هذا رحمة بالحيوان وحفظ للصحة معه؟', [
  { t: 'أضع ماء لعصفوري كل صباح', a: 0, w: 'نعم: الحيوان يعطش مثلنا.' },
  { t: 'أشد ذيل القطة لأرى ماذا تفعل', a: 1, w: 'لا: هذا يؤذيها، وقد تخدشني.' },
  { t: 'أغسل يدي بالماء والصابون بعد اللعب مع الكلب', a: 0, w: 'نعم: قد يحمل ميكروبات وهو يبدو سليماً.' },
  { t: 'أترك أخي الصغير وحده مع كلب لا يعرفه', a: 1, w: 'لا: الصغار دون الخامسة يكون معهم كبير.' },
  { t: 'أنظف قفص العصفور مع كبير، ثم أغسل يدي', a: 0, w: 'نعم: نظافة له، وصحة لي.' },
], ['رحمة وصحة', 'ليس كذلك'], 'نطعم الحيوان ونسقيه ولا نؤذيه، ونغسل أيدينا بعد لمسه.');

window.CUSTOM = { replace: { E1: mam, E2: hearts, E3: neck, E4: cow, E5: care } };
})();
