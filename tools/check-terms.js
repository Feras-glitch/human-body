// فحص «لا مصطلح قبل تعريفه»: يعرض كل درس مشهداً مشهداً (بالمستوى ب) ويبلّغ عن أي مفهوم ظهر نصه قبل بطاقة تعريفه
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const ids = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync('lessons').filter(f => f.endsWith('.json')).map(f => f.replace('.json', '')).sort();
const norm = t => t.replace(/[ً-ْـ]/g, '');            // إزالة التشكيل والتطويل
const stem = w => norm(w).replace(/^(ال|بال|وال|فال|كال|لل)/, '');      // جذع بسيط
(async () => {
  const b = await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,args:process.env.CI?['--no-sandbox','--disable-dev-shm-usage']:[]}); const p = await b.newPage(); let total = 0;
  for (const id of ids) {
    const L = JSON.parse(fs.readFileSync(`lessons/${id}.json`, 'utf8'));
    const url = 'file://' + path.resolve(`app/v2/${id}.html`); await p.goto(url);
    await p.evaluate(() => { Atlas.create({name:'نور',gender:'f'}); }); await p.goto(url);
    await p.evaluate((u) => { level = 'B'; store.set('level', 'B'); Atlas.storage.setItem(`atlas:${u}.L01:level`, '"B"'); }, L.unit.id);
    const n = await p.evaluate(() => SCENES.length); const scenes = [];
    for (let i = 0; i < n; i++) { await p.evaluate(k => show(k), i); const sid = await p.evaluate(() => SCENES[idx].id); const text = norm(await p.$eval('#main', e => [...e.querySelectorAll('*')].filter(x => !x.closest('[data-def]')).map(x => [...x.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ')).join(' '))); const defs = await p.$$eval('[data-def]', els => els.map(e => e.dataset.def)); scenes.push({ sid, text, defs }); }
    const probs = [];
    for (const c of L.concepts) {
      const forms = [c.term.ar, ...(c.term.match || [])].map(stem).filter(f => f.length >= 3);
      const defAt = scenes.findIndex(s => s.defs.includes(c.id));
      const useAt = scenes.findIndex((s, k) => k !== defAt && s.sid !== 'glossary' && s.sid !== 'end' && forms.some(f => s.text.includes(f)));
      if (defAt < 0) probs.push(`  ✘ ${c.term.ar}: لا بطاقة تعريف في المسار (يظهر أول مرة في «${useAt >= 0 ? scenes[useAt].sid : '—'}»)`);
      else if (useAt >= 0 && useAt < defAt) probs.push(`  ✘ ${c.term.ar}: ذُكر في «${scenes[useAt].sid}» (#${useAt + 1}) قبل تعريفه في «${scenes[defAt].sid}» (#${defAt + 1})`);
    }
    total += probs.length; console.log(`${id} — ${probs.length ? probs.length + ' ملاحظة' : '✔ سليم'}`); probs.forEach(x => console.log(x));
  }
  await b.close(); process.exit(total ? 1 : 0);
})();

