/* استوديو جسم الإنسان — المرحلة 1: المعلق الصوتي.
   يعرض نصوص كل درس جملةً جملة مع سياقها (أين تُقال، وعلى أي سؤال أو خيار تردّ، ولمن: ولد أو بنت)، ويسجّلها،
   ويحفظها على الجهاز (IndexedDB «studio-voice»)، ويصدّر «حزمة صوت» (zip) يستوردها ولي الأمر في تطبيق الطفل أو تُدمج
   في المستودع (tools/import-voice-pack.mjs). كل تسجيل مربوط ببصمة نصه (akey)، فلا يُسمع إلا على نصه. */
(function () {
  'use strict';
  const D = window.STUDIO_DATA || { lessons: [] };
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LS = { get: (k, d) => { try { const v = localStorage.getItem('studio:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } }, set: (k, v) => { try { localStorage.setItem('studio:' + k, JSON.stringify(v)); } catch { /* لا شيء */ } } };
  const toast = (t, ms = 2600) => { const el = $('#toast'); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { el.hidden = true; }, ms); };

  /* ---- التخزين ---- */
  let dbp = null;
  const db = () => dbp || (dbp = new Promise((res, rej) => { const r = indexedDB.open('studio-voice', 2); r.onupgradeneeded = () => { const d = r.result; for (const n of ['rec', 'edits', 'reviews']) if (!d.objectStoreNames.contains(n)) d.createObjectStore(n); }; r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }));
  const txs = (store, mode, fn) => db().then((d) => new Promise((res, rej) => { const t = d.transaction(store, mode), q = fn(t.objectStore(store)); t.oncomplete = () => res(q && q.result); t.onerror = t.onabort = () => rej(t.error || new Error('تعذّر الحفظ')); }));
  const tx = (mode, fn) => txs('rec', mode, fn);
  let have = new Set();
  let edits = new Map(), reviews = new Map();
  const loadAll = (store) => txs(store, 'readonly', (s) => s.getAll()).then((vs) => vs || []);
  const loadKeys = () => Promise.all([tx('readonly', (s) => s.getAllKeys()), loadAll('edits'), loadAll('reviews')]).then(([ks, es, rs]) => {
    have = new Set(ks); edits = new Map(es.map((e) => [e.id, e])); reviews = new Map(rs.map((r) => [r.id, r]));
  });

  /* ---- الحالة ---- */
  const ROLES = [['voice', 'المعلق الصوتي'], ['edit', 'المحرر والمدقق'], ['sci', 'المراجع العلمي'], ['faith', 'المراجع الشرعي'], ['teach', 'المعلم'], ['dev', 'المطور']];
  const st = { role: LS.get('role', 'voice'), q: '', lesson: null, idx: 0, filter: LS.get('filter', 'todo'), gender: LS.get('gender', 'all'), auto: LS.get('auto', true), list: false };
  const lessonById = (id) => D.lessons.find((l) => l.id === id);
  const visible = (L) => L.items.filter((it) => (st.gender === 'all' || !it.g || it.g === st.gender));
  const counts = (L) => { const v = visible(L); return { done: v.filter((i) => have.has(i.akey)).length, all: v.length }; };

  /* ---- الصفحة الأولى: الدروس ---- */
  let home = function () {
    st.lesson = null; stopAll(); $('#homeBtn').hidden = true; $('#title').textContent = 'استوديو جسم الإنسان';
    const total = D.lessons.reduce((s, L) => s + counts(L).all, 0), done = D.lessons.reduce((s, L) => s + counts(L).done, 0);
    $('#main').innerHTML = `
      <div class="card"><div class="row"><label>اسمك (يُكتب في الحزمة): <input type="text" id="who" value="${esc(LS.get('who', ''))}" placeholder="اسم المعلق"></label></div>
        <div class="row" style="margin-top:8px"><span>دورك:</span>${seg('role', ROLES)}</div>
        ${st.role === 'voice' ? `<div class="row" style="margin-top:8px"><span>الصيغة:</span>${seg('gender', [['all', 'الولد والبنت'], ['m', 'الولد فقط'], ['f', 'البنت فقط']])}</div>
        <p class="note">المسجَّل: ${done} من ${total} نصاً. المحتوى ${esc(D.content || '')}.</p>
        <div class="row"><button class="primary" id="expAll">تصدير كل التسجيلات (حزمة صوت)</button></div>` : `
        ${st.role === 'dev' ? devBoard() : ''}<p class="note">${st.role === 'dev' ? 'لوحة المطوّر: حالة كل درس في هذا الجهاز. الحزم تُرسل إلى المطوّر فيدمجها بأدوات المستودع.' : st.role === 'teach' ? 'اكتب ملاحظاتك على أي نص في الدرس: ما رأيته في الصف، وما صعب على الطفل، وما يحتاج مثالاً. تصل إلى المطوّر في «حزمة التعديلات».' : st.role === 'edit' ? 'عدّل أي نص في الدرس؛ يُحفظ التعديل على الجهاز مع النص الأصلي، ثم صدّر «حزمة التعديلات» وأرسلها إلى المطوّر: تمرّ على الفحوص قبل أن تصل إلى الطفل. الآيات ونصوص الأحاديث مقفلة.' : `راجع ${st.role === 'sci' ? 'المحتوى العلمي' : 'النصوص الشرعية وما يتصل بها'} بنداً بنداً: «سليم» أو «ملاحظة». ثم «اعتماد الدرس» إن رأيته سليماً كله. يُسجَّل باسمك وتاريخه، ويصل إلى المطوّر في «حزمة التعديلات».`}</p>
        <p class="note">تعديلات محفوظة: ${edits.size} · مراجعات محفوظة: ${reviews.size}. المحتوى ${esc(D.content || '')}.</p>
        <div class="row"><button class="primary" id="expChanges">تصدير حزمة التعديلات</button></div>`}</div>
      <details class="card"><summary>قبل أن تبدأ: كيف تسجّل جيداً</summary>
        <ul class="note"><li>غرفة هادئة فيها سجاد أو ستائر، والهاتف على بعد شبر من فمك، ثابت لا في يدك.</li>
        <li>اقرأ الجملة كأنك تحكيها لطفل في التاسعة: فصحى ميسّرة، هادئة، نحو 120 كلمة في الدقيقة.</li>
        <li>اضغط «سجّل»، وانتظر نصف ثانية، ثم اقرأ، ثم اسكت نصف ثانية، ثم «أوقف».</li>
        <li>ما كُتب «ولد» يُقرأ للولد، وما كُتب «بنت» يُقرأ للبنت، وما لا وسم له يُقرأ مرة واحدة للجميع.</li>
        <li>اقرأ النص كما هو حرفاً بحرف: أي تعديل يُرسَل إلى المحرر، لا يُرتجل في التسجيل.</li>
        <li>ابدأ بـ«العبارات العامة»: قصيرة وتتكرر في كل الدروس.</li></ul></details>
      ${D.lessons.filter((L) => st.role !== 'dev' && (st.role === 'voice' || L.fields)).map((L) => { const c = st.role === 'voice' ? counts(L) : fieldCounts(L); const p = c.all ? Math.round(c.done / c.all * 100) : 0; return `<button class="card lesson" data-l="${esc(L.id)}" style="width:100%;text-align:right"><div class="t"><b>${esc(L.id === 'common' ? '' : L.id + ' — ')}${esc(L.title)}</b><br><small>${st.role === 'voice' ? `${c.done} من ${c.all}${c.done === c.all && c.all ? ' <span class="done">✓ اكتمل</span>' : ''}` : esc(c.label)}</small><div class="bar"><i style="width:${p}%"></i></div></div><span>←</span></button>`; }).join('')}`;
    $('#who').onchange = (e) => LS.set('who', e.target.value.trim());
    bindSeg(home);
    if ($('#expAll')) $('#expAll').onclick = () => exportPack(null);
    if ($('#expChanges')) $('#expChanges').onclick = exportChanges;
    document.querySelectorAll('[data-l]').forEach((b) => { b.onclick = () => (st.role === 'voice' ? openLesson(b.dataset.l) : openFields(b.dataset.l)); });
  };
  const seg = (k, opts) => `<span class="seg" data-seg="${k}">${opts.map(([v, t]) => `<button data-v="${v}" class="${st[k] === v ? 'on' : ''}">${t}</button>`).join('')}</span>`;
  const bindSeg = (redraw) => document.querySelectorAll('[data-seg]').forEach((s) => s.querySelectorAll('button').forEach((b) => { b.onclick = () => { st[s.dataset.seg] = b.dataset.v; LS.set(s.dataset.seg, b.dataset.v); redraw(); }; }));

  /* ---- الدرس: جملة جملة ---- */
  function openLesson(id) {
    st.lesson = lessonById(id); const v = visible(st.lesson);
    const first = v.findIndex((i) => !have.has(i.akey)); st.idx = first < 0 ? 0 : first; st.list = false; lesson();
  }
  function lesson() {
    const L = st.lesson, v = visible(L), c = counts(L);
    if (st.idx >= v.length) st.idx = Math.max(0, v.length - 1);
    const it = v[st.idx];
    $('#homeBtn').hidden = false; $('#title').textContent = L.id === 'common' ? 'العبارات العامة' : `${L.id} — ${L.title}`;
    const gTag = (g) => g === 'm' ? '<span class="g m">ولد</span>' : g === 'f' ? '<span class="g f">بنت</span>' : '<span class="g n">للجميع</span>';
    $('#main').innerHTML = `
      <div class="row"><span>${c.done} من ${c.all} مسجَّل</span>${seg('gender', [['all', 'الكل'], ['m', 'ولد'], ['f', 'بنت']])}
        <label class="note"><input type="checkbox" id="auto" ${st.auto ? 'checked' : ''}> انتقل بعد الحفظ إلى التالي غير المسجَّل</label>
        <button class="ghost" id="toggleList">${st.list ? 'إخفاء القائمة' : 'كل الجمل'}</button><button class="ghost" id="expL">تصدير حزمة الدرس</button></div>
      ${it ? `<div class="card" id="cur"><div class="row"><span class="section">${esc(it.section)}</span>${gTag(it.g)}<span class="note">${st.idx + 1} / ${v.length}</span>${have.has(it.akey) ? '<span class="done">✓ مسجَّل</span>' : ''}</div>
        ${it.ctx ? `<div class="ctx">${esc(it.ctx)}</div>` : ''}<div class="text">${esc(it.text)}</div></div>` : '<p class="card">لا نصوص بهذه الصيغة.</p>'}
      ${st.list ? `<div class="card">${v.map((x, i) => `<div class="row" style="border-bottom:1px solid var(--line);padding:4px 0"><button class="ghost" data-i="${i}" style="flex:1;text-align:right;min-height:0">${have.has(x.akey) ? '✓ ' : '○ '}${i + 1}. ${esc(x.text.slice(0, 70))}${x.text.length > 70 ? '…' : ''}</button>${x.g ? gTag(x.g) : ''}</div>`).join('')}</div>` : ''}
      <div class="focus"><div class="row">
        <button class="rec" id="rec">● سجّل</button><button id="play" ${it && have.has(it.akey) ? '' : 'disabled'}>▶ استمع</button>
        <button id="del" ${it && have.has(it.akey) ? '' : 'disabled'}>🗑</button><div class="meter"><i id="lvl"></i></div>
        <button id="prev">→ السابق</button><button id="next">التالي ←</button></div></div>`;
    bindSeg(() => { st.idx = 0; lesson(); });
    $('#auto').onchange = (e) => { st.auto = e.target.checked; LS.set('auto', st.auto); };
    $('#toggleList').onclick = () => { st.list = !st.list; lesson(); };
    $('#expL').onclick = () => exportPack(L.id);
    document.querySelectorAll('[data-i]').forEach((b) => { b.onclick = () => { st.idx = +b.dataset.i; st.list = false; lesson(); window.scrollTo(0, 0); }; });
    $('#prev').onclick = () => { if (st.idx > 0) { st.idx--; lesson(); } };
    $('#next').onclick = () => { if (st.idx < v.length - 1) { st.idx++; lesson(); } };
    if (!it) return;
    $('#rec').onclick = () => (rec.on ? stopRec() : startRec(it));
    $('#play').onclick = () => play(it.akey);
    $('#del').onclick = async () => { if (!confirm('حذف تسجيل هذه الجملة؟')) return; await tx('readwrite', (s) => s.delete(it.akey)); have.delete(it.akey); lesson(); };
  }

  /* ---- التسجيل ---- */
  const rec = { on: false, mr: null, chunks: [], stream: null, it: null, raf: 0, ctx: null, t0: 0 };
  async function startRec(it) {
    stopPlay();
    try {
      rec.stream = rec.stream || await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: false, noiseSuppression: true, autoGainControl: true } });
    } catch { toast('التسجيل يحتاج إذن الميكروفون.'); return; }
    const mime = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4', 'audio/webm'].find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || '';
    rec.mr = new MediaRecorder(rec.stream, mime ? { mimeType: mime, audioBitsPerSecond: 48000 } : undefined);
    rec.chunks = []; rec.it = it; rec.on = true; rec.t0 = Date.now();
    rec.mr.ondataavailable = (e) => { if (e.data && e.data.size) rec.chunks.push(e.data); };
    rec.mr.onstop = save;
    rec.mr.start();
    $('#rec').textContent = '■ أوقف'; $('#rec').classList.add('on');
    meter();
  }
  function stopRec() { if (rec.mr && rec.on) { rec.on = false; rec.mr.stop(); } cancelAnimationFrame(rec.raf); }
  async function save() {
    const it = rec.it, L = st.lesson, dur = (Date.now() - rec.t0) / 1000;
    const type = (rec.mr.mimeType || 'audio/webm').split(';')[0];
    const blob = new Blob(rec.chunks, { type });
    if (dur < 0.6 || blob.size < 1500) { toast('التسجيل قصير جداً، أعده.'); lesson(); return; }
    await tx('readwrite', (s) => s.put({ blob, mime: type, lesson: L.id, file: it.file, text: it.text, at: new Date().toISOString(), dur }, it.akey));
    have.add(it.akey);
    if (st.auto) { const v = visible(L); const n = v.findIndex((x, i) => i > st.idx && !have.has(x.akey)); if (n >= 0) st.idx = n; else toast('سُجّلت كل جمل هذا الدرس بهذه الصيغة ✓', 3500); }
    lesson();
  }
  function meter() {
    try {
      rec.ctx = rec.ctx || new (window.AudioContext || window.webkitAudioContext)();
      const an = rec.ctx.createAnalyser(); an.fftSize = 512; rec.ctx.createMediaStreamSource(rec.stream).connect(an);
      const buf = new Uint8Array(an.fftSize);
      const tick = () => { an.getByteTimeDomainData(buf); let m = 0; for (const x of buf) m = Math.max(m, Math.abs(x - 128)); const el = $('#lvl'); if (el) el.style.width = Math.min(100, m / 1.28) + '%'; if (rec.on) rec.raf = requestAnimationFrame(tick); else if (el) el.style.width = '0'; };
      tick();
    } catch { /* المقياس للمساعدة فقط */ }
  }
  let audio = null;
  const stopPlay = () => { if (audio) { audio.pause(); URL.revokeObjectURL(audio.src); audio = null; } };
  async function play(k) { stopPlay(); const r = await tx('readonly', (s) => s.get(k)); if (!r) return; audio = new Audio(URL.createObjectURL(r.blob)); audio.play().catch(() => toast('تعذّر التشغيل.')); }
  const stopAll = () => { stopRec(); stopPlay(); };

  /* ---- المحرر والمراجعان (المرحلة 2) ---- */
  const pkey = (L, p) => `${L.id}|${JSON.stringify(p)}`;
  const rkey = (L, p) => `${st.role}|${L.id}|${JSON.stringify(p)}`;
  const mine = (L) => (L.fields || []).filter((f) => st.role === 'edit' || st.role === 'teach' || (st.role === 'sci' ? f.d === 'sci' : f.d === 'faith'));
  function devBoard() {
    const rows = D.lessons.filter((L) => L.fields).map((L) => {
      const v = L.items.length, rec = L.items.filter((i) => have.has(i.akey)).length;
      const ed = [...edits.values()].filter((e) => e.lesson === L.id).length;
      const rv = (role) => [...reviews.values()].filter((r) => r.lesson === L.id && r.role === role);
      const ok = (role) => rv(role).some((r) => r.path === '*') ? '✓' : rv(role).length || '—';
      return `<tr><td>${esc(L.id)}</td><td>${rec}/${v}</td><td>${ed || '—'}</td><td>${ok('sci')}</td><td>${ok('faith')}</td><td>${rv('teach').length || '—'}</td></tr>`;
    }).join('');
    return `<table style="width:100%;border-collapse:collapse;font-size:14px;margin:8px 0" border="1" cellpadding="4"><tr><th>الدرس</th><th>مسجَّل</th><th>تعديلات</th><th>علمي</th><th>شرعي</th><th>المعلم</th></tr>${rows}</table>`;
  }
  function fieldCounts(L) {
    const fs = mine(L);
    if (st.role === 'edit') { const n = fs.filter((f) => edits.has(pkey(L, f.p))).length; return { done: n, all: fs.length, label: `${fs.length} حقلاً${n ? ` · ${n} معدَّلاً` : ''}` }; }
    if (st.role === 'teach') { const n = fs.filter((f) => reviews.has(rkey(L, f.p))).length; return { done: n, all: fs.length, label: `${n} ملاحظة` }; }
    const r = fs.filter((f) => reviews.has(rkey(L, f.p))).length, whole = reviews.get(rkey(L, '*'));
    return { done: r, all: fs.length, label: `${r} من ${fs.length} بنداً مراجَعاً${whole ? ' · <span class="done">✓ اعتُمد الدرس</span>' : ''}` };
  }
  const balanced = (t) => { let d = 0; for (const c of t) { if (c === '{') d++; else if (c === '}') d--; if (d < 0 || d > 1) return false; } return d === 0; };
  function openFields(id) { st.lesson = lessonById(id); st.q = ''; fieldsView(); }
  function fieldsView() {
    const L = st.lesson, fs = mine(L), role = st.role;
    $('#homeBtn').hidden = false; $('#title').textContent = `${L.id} — ${L.title}`;
    const q = st.q.trim(); const shown = q ? fs.filter((f) => f.t.includes(q) || f.s.includes(q)) : fs;
    const whole = reviews.get(rkey(L, '*'));
    $('#main').innerHTML = `
      <div class="row"><input type="text" id="q" placeholder="ابحث في النصوص أو الأقسام" value="${esc(st.q)}" style="flex:1">
        ${role === 'sci' || role === 'faith' ? `<button class="primary" id="approveAll">${whole ? '✓ اعتُمد الدرس (إلغاء)' : 'اعتماد الدرس كاملاً'}</button>` : ''}</div>
      <p class="note">${shown.length} من ${fs.length}. ${role === 'edit' ? 'صيغة الولد والبنت تُكتب {للولد|للبنت}، مثل: جسمك{|ِ}.' : ''}</p>
      ${shown.slice(0, 400).map((f) => { const i = fs.indexOf(f), e = edits.get(pkey(L, f.p)), r = reviews.get(rkey(L, f.p)); return `<div class="card" data-f="${i}">
        <div class="row"><span class="section">${esc(f.s)}</span>${f.lock ? `<span class="g n">🔒 مقفل</span>` : ''}${e ? '<span class="g m">معدَّل</span>' : ''}${r ? `<span class="g ${r.verdict === 'ok' ? 'm' : 'f'}">${r.verdict === 'ok' ? '✓ سليم' : '✎ ملاحظة'}</span>` : ''}</div>
        ${role === 'edit' && !f.lock ? `<textarea rows="3" style="width:100%;font:inherit;font-size:18px" data-t>${esc(e ? e.new : f.t)}</textarea>
          ${e ? `<div class="ctx">الأصل: ${esc(f.t)}</div>` : ''}<input type="text" data-n placeholder="سبب التعديل (اختياري)" value="${esc(e ? e.note : '')}" style="width:100%">
          <div class="row" style="margin-top:6px"><button class="primary" data-save>حفظ التعديل</button>${e ? '<button data-undo>تراجع إلى الأصل</button>' : ''}</div>`
          : `<div class="text" style="font-size:19px">${esc(e && role !== 'edit' ? e.new : f.t)}</div>${f.lock ? `<div class="ctx">${esc(f.lock)}</div>` : ''}`}
        ${role === 'teach' ? `<input type="text" data-n placeholder="ملاحظة المعلم: ما رآه في الصف، أو ما صعب على الطفل" value="${esc(r ? r.note : '')}" style="width:100%">
          <div class="row" style="margin-top:6px"><button class="primary" data-note>احفظ الملاحظة</button>${r ? '<button data-clear>حذف الملاحظة</button>' : ''}</div>`
          : role !== 'edit' ? `<input type="text" data-n placeholder="ملاحظتك (للتصحيح)" value="${esc(r ? r.note : '')}" style="width:100%">
          <div class="row" style="margin-top:6px"><button class="primary" data-ok>✓ سليم</button><button data-fix>✎ احفظ الملاحظة</button>${r ? '<button data-clear>إلغاء المراجعة</button>' : ''}</div>` : ''}
      </div>`; }).join('')}
      ${shown.length > 400 ? '<p class="note">تظهر أول 400؛ استعمل البحث للوصول إلى غيرها.</p>' : ''}`;
    $('#q').onchange = (e) => { st.q = e.target.value; fieldsView(); };
    if ($('#approveAll')) $('#approveAll').onclick = async () => { const k = rkey(L, '*'); if (whole) { await txs('reviews', 'readwrite', (s) => s.delete(k)); reviews.delete(k); } else { if (!confirm('اعتماد الدرس كاملاً باسمك؟')) return; const v = { id: k, role, lesson: L.id, path: '*', verdict: 'ok', note: '', by: LS.get('who', ''), at: new Date().toISOString() }; await txs('reviews', 'readwrite', (s) => s.put(v, k)); reviews.set(k, v); } fieldsView(); };
    document.querySelectorAll('[data-f]').forEach((card) => {
      const f = fs[+card.dataset.f], ek = pkey(L, f.p), rk = rkey(L, f.p), note = () => (card.querySelector('[data-n]') || {}).value || '';
      const q1 = (sel, fn) => { const b = card.querySelector(sel); if (b) b.onclick = fn; };
      q1('[data-save]', async () => {
        const t = card.querySelector('[data-t]').value.replace(/\r/g, '').trim();
        if (!t) return toast('النص فارغ.'); if (!balanced(t)) return toast('أقواس صيغة الولد والبنت غير متوازنة: {للولد|للبنت}.');
        if (t === f.t) { await txs('edits', 'readwrite', (s) => s.delete(ek)); edits.delete(ek); toast('لا فرق عن الأصل.'); return fieldsView(); }
        const v = { id: ek, lesson: L.id, path: f.p, old: f.t, new: t, note: note(), by: LS.get('who', ''), at: new Date().toISOString() };
        await txs('edits', 'readwrite', (s) => s.put(v, ek)); edits.set(ek, v); toast('حُفظ التعديل.'); fieldsView();
      });
      q1('[data-undo]', async () => { await txs('edits', 'readwrite', (s) => s.delete(ek)); edits.delete(ek); fieldsView(); });
      const review = async (verdict) => { if (verdict !== 'ok' && !note().trim()) return toast('اكتب الملاحظة أولاً.'); const v = { id: rk, role, lesson: L.id, path: f.p, text: f.t, verdict, note: note(), by: LS.get('who', ''), at: new Date().toISOString() }; await txs('reviews', 'readwrite', (s) => s.put(v, rk)); reviews.set(rk, v); fieldsView(); };
      q1('[data-ok]', () => review('ok')); q1('[data-fix]', () => review('fix')); q1('[data-note]', () => review('note'));
      q1('[data-clear]', async () => { await txs('reviews', 'readwrite', (s) => s.delete(rk)); reviews.delete(rk); fieldsView(); });
    });
  }
  async function exportChanges() {
    const who = (LS.get('who', '') || '').trim();
    if (!who) return toast('اكتب اسمك أولاً.');
    if (!edits.size && !reviews.size) return toast('لا تعديلات ولا مراجعات بعد.');
    const strip = ({ id, ...x }) => x;
    const pack = { type: 'humanbody-change-pack', version: 1, created: new Date().toISOString(), by: who, content: D.content || '', edits: [...edits.values()].map(strip), reviews: [...reviews.values()].map(strip) };
    const name = `تعديلات-${who.replace(/\s+/g, '-')}-${pack.created.slice(0, 10)}.json`;
    const blob = new Blob([JSON.stringify(pack, null, 1)], { type: 'application/json' });
    if (window.AndroidApp && window.AndroidApp.saveFile) { const b64 = await new Promise((res) => { const fr = new FileReader(); fr.onload = () => { const x = String(fr.result); res(x.slice(x.indexOf(',') + 1)); }; fr.readAsDataURL(blob); }); window.AndroidApp.saveFile(name, 'application/json', b64); }
    else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000); }
    toast(`صُدّرت ${pack.edits.length} تعديلاً و${pack.reviews.length} مراجعة في ${name}`, 5000);
  }

  /* ---- التصدير: حزمة صوت ---- */
  const extOf = (m) => ({ 'audio/webm': 'webm', 'audio/ogg': 'ogg', 'audio/mp4': 'm4a', 'audio/mpeg': 'mp3', 'audio/wav': 'wav' }[m] || 'webm');
  async function exportPack(lessonId) {
    const who = (LS.get('who', '') || '').trim();
    if (!who) { toast('اكتب اسمك في الصفحة الأولى قبل التصدير.'); if (st.lesson) home(); return; }
    const wanted = new Map();
    for (const L of D.lessons) if (!lessonId || L.id === lessonId) for (const it of L.items) if (have.has(it.akey) && !wanted.has(it.akey)) wanted.set(it.akey, { it, L });
    if (!wanted.size) { toast('لا تسجيلات للتصدير بعد.'); return; }
    toast('جارٍ تجهيز الحزمة…', 60000);
    const files = [], entries = [], enc = new TextEncoder();
    for (const [k, { it, L }] of wanted) {
      const r = await tx('readonly', (s) => s.get(k)); if (!r) continue;
      const name = `rec/${k}.${extOf(r.mime)}`;
      files.push({ name, data: new Uint8Array(await r.blob.arrayBuffer()) });
      entries.push({ akey: k, name, mime: r.mime, lesson: L.id, file: it.file, key: it.key, gender: it.g || '', text: it.text, dur: Math.round(r.dur * 10) / 10 });
    }
    const created = new Date().toISOString();
    const man = { type: 'humanbody-voice-pack', version: 1, created, recorder: who, content: D.content || '', lesson: lessonId || 'all', count: entries.length, entries };
    files.unshift({ name: 'manifest.json', data: enc.encode(JSON.stringify(man, null, 1)) });
    const blob = window.zipStore(files);
    const fname = `صوت-${lessonId || 'كل-الدروس'}-${created.slice(0, 10)}.zip`;
    await saveBlob(fname, blob);
    toast(`صُدّرت ${entries.length} تسجيلاً في ${fname}`, 5000);
  }
  async function saveBlob(name, blob) {
    if (window.AndroidApp && window.AndroidApp.saveFile) {
      const b64 = await new Promise((res) => { const fr = new FileReader(); fr.onload = () => { const s = String(fr.result); res(s.slice(s.indexOf(',') + 1)); }; fr.readAsDataURL(blob); });
      window.AndroidApp.saveFile(name, 'application/zip', b64); return;
    }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
  }

  $('#homeBtn').onclick = () => home();
  const roleChip = () => { const r = ROLES.find((x) => x[0] === st.role); $('#role').textContent = r ? r[1] : ''; };
  const _home = home; home = function () { roleChip(); _home(); };
  window.addEventListener('keydown', (e) => { if (!st.lesson || e.target.tagName === 'INPUT') return; if (e.code === 'Space') { e.preventDefault(); const b = $('#rec'); if (b) b.click(); } if (e.key === 'ArrowLeft') { const b = $('#next'); if (b) b.click(); } if (e.key === 'ArrowRight') { const b = $('#prev'); if (b) b.click(); } });
  loadKeys().then(home, () => { $('#main').innerHTML = '<p class="card">تعذّر فتح مخزن التسجيلات على هذا الجهاز.</p>'; });
  window.__studio = { exportPack, exportChanges, have: () => have, edits: () => edits, reviews: () => reviews, tx };
})();
