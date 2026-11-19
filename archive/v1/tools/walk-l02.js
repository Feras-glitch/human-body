const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 420, height: 860 } });
  const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/favicon|webp|ERR_FILE/.test(m.text())) errors.push(m.text()); });
  const url = 'file://' + path.resolve('app/v2/U01.L02.html');
  await p.goto(url);
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('atlas:profile', JSON.stringify({ name: 'نور', gender: 'f' })); localStorage.setItem('atlas:U01.L01:level', '"B"'); });
  await p.goto(url);
  const seen = [];
  for (let i = 0; i < 40; i++) {
    const id = await p.evaluate(() => SCENES[idx].id); seen.push(id);
    const html = await p.innerHTML('#main');
    if (/\{[^}]*\|[^}]*\}|\{اسم\}/.test(html)) errors.push('leak in ' + id);
    // interact
    if (id === 'hook') await p.click('.opt[data-i="2"]');
    if (id === 'sort') { for (const [i, k] of [[0, 'see'], [1, 'guess'], [2, 'see'], [3, 'guess']]) { await p.click(`.stmt[data-i="${i}"]`); await p.click(`[data-c="${k}"]`); } }
    if (id === 'readings') { await p.fill('[data-r="0"]', '18'); await p.fill('[data-r="1"]', '25'); await p.fill('[data-r="2"]', '21'); }
    if (id === 'q_median') await p.click('.opt[data-i="1"]');
    if (id === 'q_once') await p.fill('#ans', 'لا، لأن مرة واحدة قد تكون صدفة');
    if (id === 'tools') for (let t = 0; t < 4; t++) await p.click(`.tool[data-t="${t}"]`);
    if (id === 'q_tool') await p.click('.opt[data-i="2"]');
    if (id === 'q_germs') await p.click('.opt[data-i="1"]');
    if (id === 'q_fair') await p.click('.opt[data-i="1"]');
    if (id === 'q_fix') await p.fill('#ans', 'الخلل أنها غيرت شيئين: الموسيقى والوقت');
    if (id === 'q_obs') await p.click('.opt[data-i="0"]');
    const disabled = await p.evaluate(() => document.querySelector('#nextBtn').disabled);
    if (disabled) errors.push('next still disabled at ' + id);
    const last = await p.evaluate(() => idx === SCENES.length - 1);
    if (last) break;
    await p.click('#nextBtn'); await p.waitForTimeout(60);
  }
  const prog = await p.evaluate(() => JSON.parse(localStorage.getItem('atlas:U01.L02:progress')));
  const med = await p.evaluate(() => JSON.parse(localStorage.getItem('atlas:U01.L02:median')));
  console.log('scenes', seen.length, seen.join(' > '));
  console.log('median', med, 'progress', Object.keys(prog).map(k => k + ':' + (prog[k].ok ? 'ok' : prog[k].answered ? 'ans' : 'x')).join(' '));
  console.log('errors', errors);
  await p.screenshot({ path: '/tmp/claude-0/-home-claude/a51e5673-ca22-5cdb-9c75-fd92f385ca7b/scratchpad/l02-end.png' });
  await b.close();
})();
