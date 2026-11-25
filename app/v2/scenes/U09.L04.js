/* تأليف خاص — U09.L04 «اللقاحات، وقضية الوحدة» */
(() => {
const E = id => LD.explain.find(e => e.id === id);

/* لعبة الانتشار على حلقة من عشرين شخصاً متخيَّلاً (يحل محل E2) */
const N = 20, CANT = [7, 13], UNVAX = [0, 1, 19];
const pos = i => { const a = -Math.PI / 2 + 2 * Math.PI * i / N; return [160 + 92 * Math.cos(a), 112 + 92 * Math.sin(a)]; };
const COL = { h: '#FFF6E3', s: '#E0525B', v: '#3E7BB6' };
const ring = `<svg viewBox="0 0 320 224" role="img" aria-label="عشرون شخصاً متخيَّلاً على حلقة، كل شخص يلتقي بجاريه فقط" style="width:100%;max-width:340px;display:block;margin:auto;background:#fff;border-radius:18px">
  <circle cx="160" cy="112" r="92" fill="none" stroke="#E7DCC8" stroke-width="3"/>
  ${Array.from({ length: N }, (_, i) => { const [x, y] = pos(i); return `<g><circle class="ppl" id="p${i}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="11" fill="${COL.h}" stroke="#473C32" stroke-width="2"/>${CANT.includes(i) ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="15" fill="none" stroke="#E2B33C" stroke-width="3.5"/>` : ''}</g>`; }).join('')}
</svg>`;
const dot = (c, ring2) => `<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" style="vertical-align:middle"><circle cx="9" cy="9" r="6" fill="${c}" stroke="#473C32" stroke-width="1.5"/>${ring2 ? '<circle cx="9" cy="9" r="8" fill="none" stroke="#E2B33C" stroke-width="2"/>' : ''}</svg>`;
const spread = { id: 'E2', render() { need(); return `<div class="scene">${sayNar(E('E2').text)}<h2>${tx('لعبة الانتشار: كل شخص يلتقي بجاريه فقط. {شغّل|شغّلي} الجولتين وقارن{|ي}.')}</h2>
  ${ring}
  <div class="note" style="display:flex;flex-wrap:wrap;gap:4px 14px">${[[COL.s, 0, 'مريض'], [COL.v, 0, 'ملقّح: لا يمرض ولا ينقل المرض'], [COL.h, 0, 'غير ملقّح'], [COL.h, 1, 'لا يستطيع التلقح']].map(([c, r, t]) => `<span style="white-space:nowrap">${dot(c, r)} ${tx(t)}</span>`).join('')}</div>
  <div class="card"><div><b>${tx('الجولة:')}</b> <span id="rd"></span></div><div><b>${tx('الأدوار:')}</b> <span id="tn">0</span> — <b>${tx('المرضى:')}</b> <span id="sk">0</span></div><div id="res" class="note"></div></div>
  <button class="opt" id="go" style="text-align:center"></button>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { let round = 0, busy = false, st = []; const go = $('#go'), res = [];
    const paint = () => { st.forEach((s, i) => $('#p' + i).setAttribute('fill', COL[s])); $('#sk').textContent = String(st.filter(s => s === 's').length); };
    const setup = r => { st = Array.from({ length: N }, (_, i) => r === 2 && !UNVAX.includes(i) && !CANT.includes(i) ? 'v' : 'h'); st[0] = 's'; $('#tn').textContent = '0';
      $('#rd').textContent = tx(r === 1 ? 'الأولى: لا أحد ملقّح' : 'الثانية: 15 ملقّحاً متفرقين'); paint(); };
    const label = () => { go.innerHTML = round === 0 ? tx('{شغّل|شغّلي} الجولة الأولى') : round === 1 ? tx('{شغّل|شغّلي} الجولة الثانية') : '✔ ' + tx('انتهت الجولتان'); };
    const run = () => { if (busy || round >= 2) return; busy = true; round++; setup(round); let turns = 0;
      const iv = setInterval(() => { if (!document.body.contains(go)) { clearInterval(iv); return; }
        const nx = st.slice(); st.forEach((s, i) => { if (s !== 's') return; [(i + 1) % N, (i + N - 1) % N].forEach(j => { if (st[j] === 'h') nx[j] = 's'; }); });
        if (nx.every((s, i) => s === st[i])) { clearInterval(iv); busy = false; const sick = st.filter(s => s === 's').length, reached = CANT.some(i => st[i] === 's');
          res.push(sick); $('#res').innerHTML += `<div>${tx(round === 1 ? 'الجولة الأولى:' : 'الجولة الثانية:')} ${sick} ${tx(sick > 10 ? 'مريضاً' : 'مرضى')}${round === 2 ? '، ' + tx(reached ? 'ووصل المرض إلى من لا يستطيع التلقح' : 'ولم يصل المرض إلى من لا يستطيع التلقح') : ''}</div>`;
          label();
          if (round === 1) fb('ok', 'بلا لقاح وجد المرض طريقاً من جار إلى جار حتى مرض الجميع. {شغّل|شغّلي} الجولة الثانية.');
          else { fb('ok', 'توقف المرض عند أول شخص ملقّح، فحُمي معهم من لا يستطيع التلقح: هذه الحماية الجماعية. لكنها في الحقيقة ليست كاملة، فنستمر في غسل الأيدي والعطاس في المرفق.'); award(); ok(); }
          return; }
        st = nx; turns++; $('#tn').textContent = String(turns); paint(); }, 220); };
    go.onclick = run; setup(1); label(); speak(tx(E('E2').text)); } };

/* الإسعاف الأولي: ماذا نفعل وما لا نفعل؟ (يحل محل E4) */
const ACTS = [
  { t: 'زبدة أو معجون أو كريم على الحرق', r: 0, w: 'لا: لا نضع على الحرق زبدة ولا معجوناً ولا كريماً؛ الماء الجاري البارد هو الأول.' },
  { t: 'ماء جارٍ بارد على الحرق 20 دقيقة', r: 1 },
  { t: 'نزع الخاتم أو الكم القريب إن لم يلتصق', r: 1 },
  { t: 'فقء الفقاعات', r: 0, w: 'لا: الفقاعة تغطي الجلد تحتها؛ لا نفقؤها.' },
  { t: 'الضغط على الجرح النازف بقطعة قماش نظيفة', r: 1 },
  { t: 'طلب الكبار فوراً', r: 1 },
];
const aid = { id: 'E4', render() { need(); return `<div class="scene">${sayNar(E('E4').text)}<h2>${tx('احترقت يد أحد بماء ساخن، أو نزف جرح. {اختر|اختاري} الأربعة الصحيحة.')}</h2>
  <div>${ACTS.map((a, i) => `<button class="opt ch" data-i="${i}">${tx(a.t)}</button>`).join('')}</div>
  <div class="fb" id="fb" role="status" aria-live="polite"></div></div>`; },
  after() { const got = new Set(), all = ACTS.filter(a => a.r).length;
    $$('.ch').forEach(b => b.onclick = () => { const a = ACTS[+b.dataset.i]; if (b.classList.contains('ok')) return;
      if (a.r) { b.classList.add('ok'); got.add(+b.dataset.i);
        if (got.size === all) { fb('ok', 'هذا الإسعاف الأولي. ونطلب الإسعاف إن كان الحرق كبيراً أو على الوجه، أو لم يتوقف النزف بعد عشر دقائق.'); award(); ok(); }
        else fb('ok', 'صحيح. وماذا أيضاً؟'); }
      else { noteMiss(); b.classList.add('bad'); fb('bad', a.w); } });
    speak(tx(E('E4').text)); } };

window.CUSTOM = { replace: { E2: spread, E4: aid } };
})();
