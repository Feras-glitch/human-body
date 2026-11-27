/* تأليف خاص — U06.L06 «ماذا آكل؟ الطبق المتوازن». بلا «طعام جيد وطعام سيئ»، وبلا أوزان ولا سعرات. */
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

/* أكثر ما في هذا الطعام (يحل محل E1) */
const nutri = sorter('E1', 'ما أكثر ما يعطيه كل طعام لجسمك{|ِ}؟', [
  { t: 'الخبز والأرز', a: 0, w: 'نشويات: يكسرها الجسم إلى سكر للطاقة.' },
  { t: 'العدس والبيض', a: 1, w: 'بروتين: يبني العضلات ويجددها.' },
  { t: 'زيت الزيتون والمكسرات', a: 2, w: 'دهون: طاقة مخزونة، ومنها أغشية الخلايا.' },
  { t: 'الدجاج والسمك', a: 1, w: 'بروتين: يبني ويجدد.' },
  { t: 'المعكرونة والبطاطس', a: 0, w: 'نشويات: طاقة.' },
], ['طاقة (نشويات)', 'بناء (بروتين)', 'دهون'], 'لكل مادة غذائية عمل، ولا يعطيها كلها طعام واحد.');

/* ابنِ طبقك (يحل محل E3) */
const FOODS = [['جزر وخيار', 'نصف الطبق: خضار'], ['برتقالة', 'نصف الطبق: فاكهة'], ['خبز أسمر', 'ربع: حبوب'], ['عدس', 'ربع: بروتين']];
const ORD = [2, 0, 3, 1];
const SEC = ['M160 110L160 20A90 90 0 0 0 70 110Z', 'M160 110L70 110A90 90 0 0 0 160 200Z', 'M160 110L160 20A90 90 0 0 1 250 110Z', 'M160 110L250 110A90 90 0 0 1 160 200Z'];
const COL = ['#7BBF4A', '#FF9F43', '#E3B66A', '#C0784A'];
const plate = { id: 'E3', render() { need(); return `<div class="scene">${sayNar(E('E3').text)}<h2>${tx('{اختر|اختاري} طعاماً، ثم مكانه في الطبق.')}</h2>
  <svg viewBox="0 0 320 220" role="img" aria-label="طبق مقسوم: نصف للخضار والفاكهة، وربع للحبوب، وربع للبروتين" style="width:100%;max-width:320px;display:block;margin:auto;background:#fff;border-radius:18px">
    <circle cx="160" cy="110" r="100" fill="#F5F1EA" stroke="#C9BBA8" stroke-width="4"/>${SEC.map((d, i) => `<path id="sec${i}" d="${d}" fill="#FFFFFF" stroke="#C9BBA8" stroke-width="3"/>`).join('')}
    <rect x="276" y="70" width="30" height="70" rx="8" fill="#DDF0FB" stroke="#7FA9C8" stroke-width="3"/></svg>
  <div class="card"><b>${tx('الطعام:')}</b>${FOODS.map((f, i) => `<button class="opt" data-s="${i}">${tx(f[0])}</button>`).join('')}</div>
  <div class="card"><b>${tx('مكانه:')}</b>${ORD.map(i => `<button class="opt" data-j="${i}">${tx(FOODS[i][1])}</button>`).join('')}</div>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let s = null, n = 0;
    $$('[data-s]').forEach(b => b.onclick = () => { if (b.classList.contains('ok')) return; $$('[data-s]').forEach(x => x.style.outline = ''); s = +b.dataset.s; b.style.outline = '3px solid #3E7BB6'; });
    $$('[data-j]').forEach(b => b.onclick = () => { if (s === null || b.classList.contains('ok')) return;
      if (+b.dataset.j === s) { b.classList.add('ok'); const a = $(`[data-s="${s}"]`); a.classList.add('ok'); a.style.outline = ''; $('#sec' + s).setAttribute('fill', COL[s]); s = null; n++;
        if (n === FOODS.length) { fb('ok', 'نصفه خضار وفاكهة، وربعه حبوب، وربعه بروتين، والماء بجانبه: طبق متوازن.'); award(); ok(); } else fb('ok', 'صحيح. والتالي؟'); }
      else { noteMiss(); $$('[data-s]').forEach(x => x.style.outline = ''); s = null; fb('bad', 'ليس هذا مكانه. {فكّر|فكّري}: ماذا يعطي هذا الطعام؟'); } });
    speak(tx(E('E3').text)); } };

/* ملاعق السكر من الملصق (يحل محل E4) */
const sugar = { id: 'E4', render() { need(); return `<div class="scene">${sayNar(E('E4').text)}<h2>${tx('{حرّك|حرّكي} غرامات السكر على الملصق، و{عُدّ|عُدّي} الملاعق.')}</h2>
  <svg viewBox="0 0 320 120" role="img" aria-label="ملاعق صغيرة من السكر، وخط حدّ اليوم" style="width:100%;max-width:340px;display:block;margin:auto;background:#fff;border-radius:18px"><g id="sp"></g><line x1="${300 - 6 * 28}" y1="12" x2="${300 - 6 * 28}" y2="108" stroke="#E0607E" stroke-width="3" stroke-dasharray="6 5"/></svg>
  <label style="display:block;margin-top:6px">${tx('السكر في الحصة:')} <b id="gv"></b><input type="range" id="sg" min="0" max="40" step="4" value="0" style="width:100%" aria-label="غرامات السكر"></label>
  <div class="card" id="out" style="min-height:40px"></div>
  <div class="note">${tx('الخط الأحمر: حدّ السكر المضاف في اليوم كله لمن في عمرك{|ِ}، أقل من ست ملاعق صغيرة.')}</div>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let fin = false;
    const upd = () => { const g = +$('#sg').value, n = Math.round(g / 4);
      $('#sp').innerHTML = Array.from({ length: n }, (_, i) => { const x = 300 - (i % 10) * 28 - 14, y = i < 10 ? 40 : 84; return `<ellipse cx="${x}" cy="${y}" rx="11" ry="8" fill="#FFFFFF" stroke="#B8901E" stroke-width="2"/><line x1="${x}" y1="${y + 8}" x2="${x}" y2="${y + 26}" stroke="#B8901E" stroke-width="3"/>`; }).join('');
      $('#gv').textContent = g + ' ' + tx('غراماً');
      $('#out').innerHTML = tx(`نحو ${n} ${n === 1 ? 'ملعقة' : n === 2 ? 'ملعقتين' : n <= 10 ? 'ملاعق' : 'ملعقة'} صغيرة.`) + (n >= 6 ? ' ' + tx('هذا حدّ اليوم كله أو أكثر، في مشروب واحد!') : '');
      if (!fin && g >= 32) { fin = true; fb('ok', 'كل أربعة غرامات نحو ملعقة. علبة فيها 32 غراماً تعطيك{|ِ} ثماني ملاعق: أكثر من حدّ اليوم كله. الماء لا سكر فيه.'); award(); ok(); } };
    $('#sg').oninput = upd; upd(); speak(tx(E('E4').text)); } };

/* تجربة ليند: علاج بعد علاج (يحل محل E5) */
const TR = ['عصير تفاح مخمر', 'خل', 'ماء بحر', 'شراب حامض', 'ماء شعير', 'برتقال وليمون'];
const lind = { id: 'E5', render() { need(); return `<div class="scene">${sayNar(E('E5').text)}<h2>${tx('{اضغط|اضغطي} لترى كل زوج من البحارة وعلاجه.')}</h2>
  <svg viewBox="0 0 320 170" role="img" aria-label="ستة أزواج من البحارة، لكل زوج علاج" style="width:100%;max-width:340px;display:block;margin:auto;background:#fff;border-radius:18px"><g id="pairs"></g></svg>
  <div class="card" style="text-align:center"><b id="tr"></b></div>
  <button class="opt" id="go" style="text-align:center">${tx('الزوج التالي')}</button>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let k = 0; const go = $('#go');
    const draw = () => { $('#pairs').innerHTML = TR.map((_, i) => { const x = 270 - (i % 3) * 105, y = i < 3 ? 45 : 120, on = i < k, best = on && i === 5;
        return [0, 1].map(j => `<circle cx="${x - 14 + j * 28}" cy="${y - 14}" r="11" fill="#F4E4D4" stroke="#B9835F" stroke-width="2" opacity="${on ? 1 : .35}"/><rect x="${x - 24 + j * 28}" y="${y - 2}" width="20" height="26" rx="8" fill="${best ? '#2E9E6A' : on ? '#9ECDE4' : '#E8E8E8'}" opacity="${on ? 1 : .5}"/>`).join(''); }).join('');
      $('#tr').textContent = tx(k ? `الزوج ${['', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'][k]}: ${TR[k - 1]}` : 'اثنا عشر بحاراً مرضهم في المرحلة نفسها'); };
    go.onclick = () => { if (k >= 6) return; k++; draw();
      if (k === 6) { go.textContent = '✔ ' + tx('قارنّا الأزواج'); fb('ok', 'صاحبا البرتقال والليمون (باللون الأخضر) تحسنا أسرع من الجميع، وعاد أحدهما إلى العمل بعد ستة أيام. مقارنة عادلة كشفت نقص الغذاء.'); award(); ok(); }
      else fb('ok', 'تحسّن قليل أو لا تحسّن. {اضغط|اضغطي} للزوج التالي.'); };
    draw(); speak(tx(E('E5').text)); } };

window.CUSTOM = { replace: { E1: nutri, E3: plate, E4: sugar, E5: lind } };
})();
