/* صفحة «اختبار الدرس» (Uxx.Tyy): بنود التقييم المنفصلة عن التدريب، وسؤال النقل، ثم «عودة الذاكرة» بعد ثلاثة أيام.
   تُبنى على lesson-runtime.js (المشاهد نفسها: اختيار، صح/خطأ ولماذا، ترتيب، تحديد على الجسم، إجابة مفتوحة).
   المحاولة الأولى وحدها تُحسب؛ الأسئلة المفتوحة يقيّمها ولي الأمر في شاشته. */
const readL = (k, d) => { try { const v = Atlas.storage.getItem('atlas:' + LD.lesson + ':' + k); return v ? JSON.parse(v) : d; } catch { return d; } };
const OPEN_TYPES = new Set(['explain_open', 'fix_model', 'compare']);
const forLevel = it => level === 'B' || (it.level || 'A') !== 'B';

function testScore(items) {
  const closed = items.filter(it => forLevel(it) && !OPEN_TYPES.has(it.type));
  const ok = closed.filter(it => progress[it.id]?.firstAttempt === true).length;
  return { ok, n: closed.length, open: items.filter(it => forLevel(it) && OPEN_TYPES.has(it.type)).length };
}

function buildTest(LD) {
  const S = [];
  const lessonDone = () => readL('finished', false);
  const daysSince = () => { const at = readL('finishedAt', null); return at ? Math.floor((Date.now() - at) / 864e5) : -1; };
  const tagLevel = (sc, it) => { if ((it.level || 'A') === 'B') sc.skip = () => level !== 'B'; return sc; };
  const CLOSED = LD.items.filter(it => !OPEN_TYPES.has(it.type));
  const missed = () => CLOSED.filter(it => forLevel(it) && it.alt && progress[it.id]?.firstAttempt === false);
  const altOf = it => ({ ...it.alt, id: it.id + '.alt', objective: it.objective, level: it.level, type: it.alt.type || it.type });

  /* البداية: لا اختبار قبل إنهاء الدرس */
  S.push({ id: 'tgate', noResume: true, render() {
    if (!lessonDone()) { need(); return `<div class="scene"><div class="row" style="justify-content:center">${buddy(110, 'think')}</div><h1>${tx(LD.title)}</h1>${sayBuddy('يُفتح هذا الاختبار بعد أن تُنهي{|ن} الدرس.')}<a class="opt" style="display:block;text-align:center" href="${LD.lesson}.html">إلى الدرس</a></div>`; }
    ok();
    const n = LD.items.filter(forLevel).length + LD.transfer.filter(forLevel).length;
    return `<div class="scene"><div class="row" style="justify-content:center">${buddy(110, 'happy')}</div><h1>${tx(LD.title)}</h1>
      ${sayBuddy(`${arN(n,AR_N.q)} عمّا {تعلّمته|تعلّمتِه}. {أجب|أجيبي} وحدك{|ِ} ودون أن تفتح{|ي} الدرس: <b>المحاولة الأولى هي التي تُحسب</b>، وبعدها {ترى|ترين} الصواب ولماذا.`)}
      <p class="note">آخر سؤال من نوع جديد: موقف لم يُشرح في الدرس، تطبّق{|ين} عليه ما {فهمته|فهمتِه}.</p></div>`;
  }, after() { speak(lessonDone() ? SAY.test_intro : SAY.test_locked); } });

  LD.items.forEach(it => S.push(tagLevel(sceneItem(it), it)));
  LD.transfer.forEach(it => { const sc = sceneOpen({ ...it, prompt: SAY.transfer + ' ' + it.prompt, sayParts: [SAY.transfer, it.prompt] }); S.push(tagLevel(sc, it)); });

  S.push({ id: 'tend', noResume: true, render() {
    ok();
    const sc = testScore([...LD.items, ...LD.transfer]);
    /* النتيجة تُكتب فقط إن أُنهي الدرس وأجاب الطفل عن بنود الاختبار فعلاً */
    if (lessonDone() && LD.items.filter(it => forLevel(it) && !OPEN_TYPES.has(it.type)).every(it => progress[it.id])) {
      store.set('finished', true); if (!store.get('finishedAt', null)) store.set('finishedAt', Date.now());
      store.set('score', { ok: sc.ok, n: sc.n, at: Date.now() });
    }
    const pct = sc.n ? Math.round(sc.ok / sc.n * 100) : 100;
    const days = daysSince();
    return `<div class="scene" style="text-align:center"><div class="row" style="justify-content:center">${buddy(120, pct >= 80 ? 'party' : 'think')}</div><h1>انتهى الاختبار</h1>
      <p class="say">أصبت{|ِ} من أول محاولة في <b>${sc.ok} من ${sc.n}</b> (${pct}%).${sc.open ? ` وكتبت{|ِ} ${arN(sc.open,AR_N.ans,'obl')} يقرؤها ولي أمرك{|ِ}.` : ''}</p>
      ${sayBuddy((pct >= 80 ? 'فهم ثابت. ما أخطأت{|ِ} فيه رأيت{|ِ} صوابه، {فاحفظه|فاحفظيه}.' : 'لا بأس: الأخطاء تخبرنا ماذا نراجع.') + (missed().length ? ' وفي الشاشة التالية محاولة ثانية بأسئلة جديدة عمّا أخطأت{|ِ} فيه، بعد أن {تراجعه|تراجعيه} إن شئت{|ِ}.' : ''))}
      <p class="note">🧠 «عودة الذاكرة» لهذا الدرس ${days >= 3 ? 'متاحة الآن — في الشاشة التالية.' : `تُفتح بعد ${Atlas.days(3 - Math.max(0, days))} من إنهاء الدرس: ما {تتذكره|تتذكرينه} بعد أيام هو ما {تعلّمته|تعلّمتِه} حقاً.`}</p>
      <div class="row" style="justify-content:center;margin-top:12px"><a class="opt" style="width:auto;background:var(--teal);color:#fff" href="index.html">🏠 إلى خريطتي</a><a class="opt" style="width:auto" href="${LD.lesson}.html">↩ إلى الدرس</a></div></div>`;
  }, after() { confetti(); } });

  /* المحاولة الثانية (البند 43): لكل بند مغلق أخطأ فيه الطفل بند بديل عن الهدف نفسه بصياغة جديدة (alt).
     نتيجتها تُحفظ منفصلة (score2)، والمعتمد عند ولي الأمر المحاولة الأولى. */
  const cnt = n => arN(n, AR_N.q, 'obl');
  S.push({ id: 't2gate', noResume: true, skip: () => !missed().length, render() { ok(); const m = missed();
    return `<div class="scene"><div class="row" style="justify-content:center">${buddy(110, 'think')}</div><h2>محاولة ثانية</h2>
      ${sayBuddy(`أخطأت{|ِ} في ${cnt(m.length)}. {راجع|راجعي} فكرتها إن شئت{|ِ}، ثم {أجب|أجيبي} عن أسئلة جديدة عن الأفكار نفسها. نتيجة الاختبار تبقى للمحاولة الأولى؛ وهذه لتعرف{|ي} ما {فهمته|فهمتِه} بعد المراجعة.`)}
      <p class="note">ما أخطأت{|ِ} فيه:</p><ul class="missed">${m.map(it => `<li>${tx(it.prompt)}</li>`).join('')}</ul>
      <a class="opt" style="display:block;text-align:center" href="${LD.lesson}.html">↩ أراجع الدرس أولاً</a></div>`; },
    after() { speak(SAY.retry_intro); } });
  CLOSED.forEach(it => { if (!it.alt) return; const sc = sceneItem(altOf(it)); sc.skip = () => !forLevel(it) || progress[it.id]?.firstAttempt !== false; S.push(sc); });
  S.push({ id: 't2end', noResume: true, skip: () => !missed().length, render() { ok();
    const m = missed(), done = m.filter(it => progress[it.id + '.alt']), good = done.filter(it => progress[it.id + '.alt']?.firstAttempt === true);
    if (done.length === m.length) store.set('score2', { ok: good.length, n: m.length, at: Date.now() });
    return `<div class="scene" style="text-align:center"><div class="row" style="justify-content:center">${buddy(120, good.length === m.length ? 'party' : 'happy')}</div><h2>انتهت المحاولة الثانية</h2>
      <p class="say">${done.length < m.length ? `أجبت{|ِ} عن ${done.length} من ${m.length}.` : `أصبت{|ِ} من أول مرة في <b>${good.length} من ${m.length}</b> من الأسئلة الجديدة.`}</p>
      ${sayBuddy(good.length === m.length && done.length === m.length ? 'المراجعة أثمرت: الفكرة التي أخطأت{|ِ} فيها صارت واضحة.' : 'ما بقي يعود إليك{|ِ} في «عودة الذاكرة» بعد أيام.')}
      <a class="opt" style="width:auto;background:var(--teal);color:#fff" href="index.html">🏠 إلى خريطتي</a></div>`; } });

  /* عودة الذاكرة ثلاث مرات: بعد 3 ثم 7 ثم 21 يوماً من إنهاء الدرس، وبين كل عودة والتي تليها 3 ثم 7 أيام على الأقل.
     الأسئلة نفسها في كل مرة (الاسترجاع المتباعد)، وتُمسح إجابات المرة السابقة حين تبدأ التالية بعد حفظ ما كتبه الطفل في سجلّها. */
  /* عودة الذاكرة قسم مستقل: لا رجوع منها إلى نهاية الاختبار (كان الرجوع يكتب نتيجة اختبار لم يُجرَ) */
  const RDAYS = [3, 7, 21], RGAP = [0, 3, 7], RKEY = ['recall', 'recall2', 'recall3'], RNAME = ['الأولى', 'الثانية', 'الثالثة'];
  const FR = LD.lesson + '.FR';
  const rstate = () => {
    const d = daysSince(), done = RKEY.map(k => store.get(k, null)), k = done.findIndex(r => !r);
    if (k < 0) return { k: 3, done, d, due: false, wait: 0 };
    /* عودة سابقة بتاريخ في المستقبل (ساعة قُدّمت ثم أُعيدت): تُحسب المدة من الآن، فلا تتعلّق العودة التالية (ن-6) */
    const prev = k ? done[k - 1] : null, since = prev && prev.at ? Math.max(0, (Date.now() - prev.at) / 864e5) : Infinity;
    return { k, done, d, due: lessonDone() && d >= RDAYS[k] && since >= RGAP[k], wait: Math.max(RDAYS[k] - Math.max(0, d), Math.ceil(RGAP[k] - since), 1) };
  };
  const past = done => done.map((r, i) => r ? `<div class="lock" style="background:#E6F7F4">✔ العودة ${RNAME[i]}: ${Number(r.ok)} من ${Number(r.n)} بعد ${Atlas.days(r.days)}</div>` : '').join('');
  let roundLive = -1;
  S.push({ id: 'rgate', noResume: true, noBack: true, render() {
    const st = rstate();
    if (st.k === 3) { need(); return `<div class="scene"><div class="row" style="justify-content:center">${buddy(110, 'party')}</div><h2>🧠 عودة الذاكرة: اكتملت العودات الثلاث</h2>${past(st.done)}<a class="opt" style="display:block;text-align:center" href="index.html">🏠 إلى خريطتي</a></div>`; }
    if (!st.due) { need(); return `<div class="scene"><div class="row" style="justify-content:center">${buddy(110, 'think')}</div><h2>🧠 عودة الذاكرة</h2>${past(st.done)}${sayBuddy(lessonDone() ? `العودة ${RNAME[st.k]} تُفتح بعد <b>${Atlas.days(st.wait)}</b>. لماذا ننتظر؟ لأن ما نتذكره بعد أيام هو ما تعلّمناه حقاً.` : 'تُفتح بعد ثلاثة أيام من إنهاء الدرس.')}<a class="opt" style="display:block;text-align:center" href="index.html">🏠 إلى خريطتي</a></div>`; }
    if (st.k > 0 && store.get('recallRound', 0) !== st.k) {
      /* بداية عودة جديدة: احفظ ما كُتب في السابقة ثم امسح إجاباتها ليُجاب من جديد */
      const prev = st.done[st.k - 1], txt = store.get(openKey(FR), '');
      if (prev && typeof txt === 'string' && txt.trim() && prev.text === undefined) store.set(RKEY[st.k - 1], { ...prev, text: txt.slice(0, 4000) });
      for (const it of LD.recall) { delete progress[it.id]; if (store.get(openKey(it.id), '')) store.set(openKey(it.id), ''); }
      for (const it of [...LD.items, ...LD.transfer]) { delete progress[it.id + '.R']; if (store.get(openKey(it.id + '.R'), '')) store.set(openKey(it.id + '.R'), ''); }
      delete progress[FR]; store.set('progress', progress); store.set(openKey(FR), ''); store.set('recallRound', st.k);
      /* وتُمسح علامات «أُنجز» وترتيب الخيارات لبنود العودة: وإلا فُتح «التالي» قبل الإجابة وبقي الصواب في موضعه */
      const ids = [...LD.recall.map(it => it.id), ...[...LD.items, ...LD.transfer].map(it => it.id + '.R'), FR];
      const pas = store.get('passed', {}), ord = store.get('order', {});
      for (const id of ids) { delete pas[id]; delete ord[id]; }
      store.set('passed', pas); store.set('order', ord);
    }
    roundLive = st.k; /* العودة تُسجَّل فقط إن بدأت من هذه البوابة في هذه الجلسة */
    ok();
    return `<div class="scene"><div class="row" style="justify-content:center">${buddy(110, 'happy')}</div><h2>🧠 عودة الذاكرة ${RNAME[st.k]}: ${tx(LD.lessonTitle)}</h2>${past(st.done)}${sayBuddy(`مرّ ${Atlas.days(st.d, 'nom')}. {أجب|أجيبي} دون أن تفتح{|ي} الدرس — ثم اكتب{|ي} ما {تتذكره|تتذكرينه} بكلماتك{|ِ}.`)}</div>`;
  }, after() { speak(SAY.recall_intro); } });

  LD.recall.forEach(it => S.push(tagLevel(sceneItem(it), it)));
  /* ما أخطأ فيه الطفل في اختبار الدرس يعود هنا بمعرّف مستقل (‎.R) فلا يغيّر نتيجة الاختبار ولا يدخل في نتيجة العودة */
  const MISSED = [...LD.items, ...LD.transfer].filter(it => !OPEN_TYPES.has(it.type));
  MISSED.forEach(it => { const sc = sceneItem({ ...it, id: it.id + '.R' }); sc.skip = () => !forLevel(it) || progress[it.id]?.firstAttempt !== false; S.push(sc); });
  S.push(sceneOpen({ id: FR, prompt: `${SAY.recall_free_a} «${LD.lessonTitle}»، ${SAY.recall_free_b}`, sayParts: [SAY.recall_free_a, `«${LD.lessonTitle}»،`, SAY.recall_free_b] }));

  let wrote = false;
  S.push({ id: 'rend', noResume: true, render() {
    ok();
    const sc = testScore(LD.recall), st = rstate();
    wrote = false;
    if (st.due && roundLive === st.k && LD.recall.filter(forLevel).every(it => progress[it.id])) {
      store.set(RKEY[st.k], { ok: sc.ok, n: Math.max(1, sc.n), days: st.d, at: Date.now() }); wrote = true;
    }
    const now = rstate(), r = [...now.done].reverse().find(Boolean) || null, nth = now.done.filter(Boolean).length;
    return `<div class="scene" style="text-align:center"><div class="row" style="justify-content:center">${buddy(120, 'party')}</div><h2>عودة الذاكرة — ${r ? 'تمّت العودة ' + RNAME[nth - 1] : 'لم تكتمل بعد'}</h2>
      ${r ? `<p class="say">تذكّرت{|ِ} من أول محاولة ${r.ok} من ${r.n} بعد ${Atlas.days(r.days)}. ${r.ok === r.n ? 'ذاكرة من حديد!' : 'ما نسيناه نراجعه بسرعة في الدرس — هذا طبيعي.'}</p>` : '<p class="note">{أجب|أجيبي} عن كل الأسئلة السابقة لتكتمل.</p>'}
      ${r ? `<p class="note">${now.k === 3 ? 'اكتملت العودات الثلاث لهذا الدرس.' : `العودة ${RNAME[now.k]} تُفتح بعد ${Atlas.days(now.wait)}: كل عودة تثبّت الذاكرة أكثر.`}</p>` : ''}
      <a class="opt" style="width:auto;background:var(--teal);color:#fff" href="index.html">🏠 إلى خريطتي</a></div>`;
  }, after() { if (wrote) { award(); confetti(); } } });
  return S;
}

/* الرابط ‎#recall يفتح عودة الذاكرة مباشرة */
/* الدخول بلا ‎#recall لا يُستأنف أبداً داخل قسم العودة: من كان موضعه بعد نهاية الاختبار يُعاد إلى شاشة النتيجة، ومنها «التالي» إلى بوابة العودة.
   (كان الاستئناف على شاشة ختام العودة يسجّل عودة جديدة بإجابات السابقة.) */
window.BOOT_HOOK = () => {
  if (location.hash === '#recall') { window.HASH_ENTRY = true; return SCENES.findIndex(s => s.id === 'rgate'); }
  const tend = SCENES.findIndex(s => s.id === 'tend'), at = resumeIndex();
  return at > tend ? tend : null;
};
