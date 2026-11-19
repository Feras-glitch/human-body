// يمشي في درس مولَّد مشهداً مشهداً ويتفاعل حتى ينتهي؛ يطبع الأخطاء والتسريبات
const { chromium } = require('playwright'); const path = require('path');
const fs=require('fs');const ids=process.argv.slice(2).filter(x=>!x.startsWith('--'));if(!ids.length)ids.push(...fs.readdirSync('lessons').filter(f=>f.endsWith('.json')).map(f=>f.slice(0,-5)).sort());
/* ‎--tests: يمشي صفحات «اختبار الدرس» (Uxx.Tyy) بدل الدروس، بعد تعليم الدرس منتهياً قبل أربعة أيام (لتُفتح عودة الذاكرة) */
const TESTS=process.argv.includes('--tests'); if(TESTS) for(let i=0;i<ids.length;i++) ids[i]=ids[i].replace(/\.L(\d{2})$/,'.T$1');const selectedLevel=(process.argv.find(x=>x.startsWith('--level='))||'--level=A').split('=')[1];if(!['A','B'].includes(selectedLevel))throw new Error('invalid level');const results=[];let failed=false;
(async () => {
  const b = await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,args:process.env.CI?['--no-sandbox','--disable-dev-shm-usage']:[]}); const page = await b.newPage({ viewport: { width: 420, height: 860 } });
  if(process.argv.includes('--fast')){await page.clock.install();const wait=page.waitForTimeout.bind(page);page.waitForTimeout=async ms=>{await page.clock.runFor(ms);await wait(5);};}
  for (const id of ids) for (const gender of ['m','f']) {
    const errors = []; const h = e => errors.push(e.message + (process.env.STACK ? ' @ ' + String(e.stack||'').split('\n').slice(1,3).join(' ') : '')); page.on('pageerror', h);
    const url = 'file://' + path.resolve(`app/v2/${id}.html`);
    await page.goto(url); await page.evaluate((g) => { Atlas.create({name:'نور',gender:g}); }, gender);
    if(TESTS){ const lid=id.replace(/\.T(\d{2})$/,'.L$1'); await page.evaluate(l=>{ Atlas.storage.setItem('atlas:'+l+':finished','true'); Atlas.storage.setItem('atlas:'+l+':finishedAt',JSON.stringify(Date.now()-4*864e5)); },lid); }
    await page.goto(url);await page.evaluate(()=>window.Atlas?.ready);await page.evaluate(l=>{level=l;store.set('level',l);},selectedLevel);
    const seen = []; let stuck = null;
    for (let i = 0; i < 80; i++) {
      const sid = await page.evaluate(() => SCENES[idx].id); seen.push(sid);
      const html = await page.innerHTML('#main'); if (/\{[^{}]*\|[^{}]*\}|\{اسم\}/.test(html)) errors.push('leak@' + sid); if (/undefined|\[object/.test(html)) errors.push('undefined@' + sid);
      for (let t = 0; t < 12; t++) {
        if (!(await page.evaluate(() => document.querySelector('#nextBtn').disabled))) break;
        const lvl = await page.$('.lvl button'); if (lvl) { await lvl.click(); continue; }
        if (await page.$('#pool') && !(await page.$$('#pool .opt:not([disabled])')).length && !(await page.$('#reveal:visible'))) { await page.waitForTimeout(1600); continue; }
        const rv = await page.$('#reveal:visible'); if (rv) { await rv.click(); await page.waitForTimeout(30); continue; }
        const seqPool = await page.$$('#pool .opt:not([disabled])'); if (seqPool.length) { const sorted = []; for (const el of seqPool) sorted.push([+(await el.getAttribute('data-i')), el]); sorted.sort((a, b) => a[0] - b[0]); await sorted[0][1].click(); await page.waitForTimeout(30); continue; }
        // U06 widgets
        const u6 = async (sel) => { const el = await page.$(sel); if (el) { try { await el.click(); } catch (e) {} await page.waitForTimeout(25); return true; } return false; };
        if (await page.$('#chew')) { await u6('#skip'); await page.waitForTimeout(50); }
        const rings = await page.$$('.ring'); if (rings.length) { const order = []; for (const r of rings) order.push([+(await r.getAttribute('data-i')), r]); order.sort((a, b) => a[0] - b[0]); for (let pass = 0; pass < 2; pass++) { for (const [, r] of order) { await r.evaluate(e => e.dispatchEvent(new MouseEvent('click', { bubbles: true }))); await page.waitForTimeout(25); } await page.waitForTimeout(1000); if (pass === 0) await u6('#flip'); } if (!(await page.evaluate(() => document.querySelector('#nextBtn').disabled))) break; continue; }
        if (await page.$('#sw')) { await u6('#sw'); await page.waitForTimeout(1700); await u6('#lg'); await page.waitForTimeout(1700); continue; }
        if (await page.$('#acid')) { await u6('#acid'); for (let j = 0; j < 13; j++) await u6('#sq'); continue; }
        if (await page.$('#bite')) { for (let j = 0; j < 10; j++) await u6('#bite'); await u6('#stop'); continue; }
        if (await page.$('#addb')) { await u6('#addb'); await u6('#shake'); continue; }
        if (await page.$('#hour')) { await u6('#meal'); for (let j = 0; j < 15; j++) { if (j === 7) await u6('#meal'); await u6('#hour'); } continue; }
        const txts = await page.$$('#main input[type=text]'); if (txts.length) { for (const ti of txts) { await ti.fill('تفاحة بقشرها كل يوم'); } }
        const pairs = [['[data-s]','[data-j]'],['[data-o]','[data-c]']]; let didPair = false;
        for (const [sa, ta] of pairs) { const srcs = await page.$$(sa + ':not(.ok)'); const tgts = await page.$$(ta + ':not(.ok)'); if (!srcs.length || !tgts.length) continue; didPair = true;
          for (const sEl of srcs) { for (const tEl of await page.$$(ta + ':not(.ok)')) { try { await sEl.click(); await tEl.click(); } catch (e) {} await page.waitForTimeout(30); if (await sEl.evaluate(e => e.classList.contains('ok'))) break; } } }
        if (didPair) { if (!(await page.evaluate(() => document.querySelector('#nextBtn').disabled))) break; continue; }
        const hots = await page.$$('.hot'); if (hots.length) { for (const z of hots) { await z.evaluate(e => e.dispatchEvent(new MouseEvent('click', { bubbles: true }))); await page.waitForTimeout(30); for (const c of await page.$$('[data-c]')) { await c.click(); await page.waitForTimeout(30); } if (!(await page.evaluate(() => document.querySelector('#nextBtn').disabled))) break; } continue; }
        const jts = await page.$$('.jt'); if (jts.length) { for (const z of jts) { await z.evaluate(e => e.dispatchEvent(new MouseEvent('click', { bubbles: true }))); if (!(await page.evaluate(() => document.querySelector('#nextBtn').disabled))) break; } if (!(await page.evaluate(() => document.querySelector('#nextBtn').disabled))) continue; }
        const rngs = await page.$$('#main input[type=range]'); if (rngs.length && t < 2) { for (const r of rngs) await r.evaluate(e => { for (const v of [e.min, Math.round((+e.min + +e.max) / 2), e.max]) { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); } e.value = Math.round((+e.min + +e.max) / 2); e.dispatchEvent(new Event('input', { bubbles: true })); }); continue; }
        const rr = await page.$$('button[data-r]:not(.ok)'); if (rr.length) { const doneRows = new Set(); for (const b of rr) { const row = await b.getAttribute('data-r'); if (doneRows.has(row)) continue; await b.click(); await page.waitForTimeout(40); if (await b.evaluate(e => e.classList.contains('ok'))) doneRows.add(row); } continue; }
        const sq = await page.$('#sq'); if (sq) { for (let k = 0; k < 10; k++) await sq.click(); continue; }
        const real = await page.$('[data-s="real"]:not(.ok)'); if (real) { await real.click(); continue; }
        const chs = await page.$$('.ch'); if (chs.length) { for (const z of chs) { await z.evaluate(e => e.dispatchEvent(new MouseEvent('click', { bubbles: true }))); if (!(await page.evaluate(() => document.querySelector('#nextBtn').disabled))) break; } if (!(await page.evaluate(() => document.querySelector('#nextBtn').disabled))) continue; }
        const dtok = await page.$('[data-t="ok"]:not(.ok)'); if (dtok) { await dtok.click(); continue; }
        const starts = await page.$$('[data-start]'); if (starts.length) { for (const st of starts) { const k = await st.getAttribute('data-start'); await st.click(); const tap = await page.$(`[data-tap="${k}"]`); for (let j = 0; j < (k === 'move' ? 30 : 18); j++) { await tap.click(); await page.waitForTimeout(20); } /* مدة العدّ تُقرأ من عدّاد الزر نفسه (15 أو 30 أو 60 ثانية) */ const secs = +(((await st.textContent()) || '').match(/\d+/) || [15])[0]; await page.waitForTimeout((secs + 1.5) * 1000); } continue; }
        const go = await page.$('#go:not([disabled])'); if (go && !(await page.evaluate(() => document.querySelector('#go').textContent.includes('✔')))) { for (let j = 0; j < 8; j++) { const g2 = await page.$('#go:not([disabled])'); if (!g2 || await page.evaluate(() => document.querySelector('#go').textContent.includes('✔'))) break; await g2.click(); await page.waitForTimeout(3000); } continue; }
        const bubs = await page.$$('.bub:not([data-done])'); if (bubs.length) { for (const z of bubs) await z.evaluate(e => e.dispatchEvent(new MouseEvent('click', { bubbles: true }))); continue; }
        const peek = await page.$('#peek'); if (peek) { await peek.click(); continue; }
        for (const i of ['#spin', '#send', '#net_b', '#trip', '#nx']) { const el = await page.$(i + ':not([disabled])'); if (el) { await el.click(); await page.waitForTimeout(900); } }
        const cells = await page.$$('.cell'); if (cells.length) { for (const tt of ['rbc', 'wbc', 'plt']) { const z = await page.$(`.cell[data-t="${tt}"]`); await z.evaluate(e => e.dispatchEvent(new MouseEvent('click', { bubbles: true }))); } continue; }
        const layer = await page.$('.layer[data-l="plasma"]'); if (layer) { await layer.evaluate(e => e.dispatchEvent(new MouseEvent('click', { bubbles: true }))); continue; }
        const dqq = await page.$('[data-qq]:not(.ok)'); if (dqq) { await dqq.click(); const k = await page.$('[data-k="1"]'); if (k) await k.click(); const ta2 = await page.$('#txt'); if (ta2) await ta2.fill('شرحي: القلب يدفع الدم والعضلات تحتاج أكسجيناً أكثر'); continue; }
        const bs = await page.$$('[data-b]:not(.ok)'); if (bs.length) { for (const bb of bs) { await bb.click(); for (const oo of await page.$$('[data-o]:not(.ok)')) { await oo.click(); if (await bb.evaluate(e => e.classList.contains('ok'))) break; } } continue; }
        if (await page.$('[data-o]')) { for (let j = 0; j < 3; j++) { const cur = await page.$$('[data-o]'); if (!cur.length) break; try { await cur[j % cur.length].click(); } catch (e) {} await page.waitForTimeout(650); } continue; }
        const zb = await page.$('#zoomBtn:not([disabled])'); if (zb) { await zb.click(); await page.waitForTimeout(100); continue; }
        const mols = await page.$$('.mol:not([data-d])'); if (mols.length) { for (const z of mols) await z.evaluate(e => e.dispatchEvent(new MouseEvent('click', { bubbles: true }))); continue; }
        for (const i of ['#dust1', '#dust2', '#clean', '#smoke']) { const el = await page.$(i); if (el) { await el.click(); await page.waitForTimeout(1500); } }
        const dp = await page.$$('[data-p][data-v="1"]'); if (dp.length) { for (const b of dp) await b.click(); const ta3 = await page.$('#chg'); if (ta3) await ta3.fill('سأفتح نافذة غرفة الجلوس'); const cb3 = await page.$('#elbow:not(:checked)'); if (cb3) await cb3.check(); continue; }
        const sts = await page.$$('.st'); if (sts.length) { for (const z of sts) await z.evaluate(e => e.dispatchEvent(new MouseEvent('click', { bubbles: true }))); continue; }
        const hold = await page.$('#hold'); if (hold) { await hold.click(); await page.waitForTimeout(100); }
        const errs = await page.$$('.err'); if (errs.length) { for (const z of errs) await z.evaluate(e => e.dispatchEvent(new MouseEvent('click', { bubbles: true }))); if (!(await page.evaluate(() => document.querySelector('#nextBtn').disabled))) continue; }
        const dq = await page.$$('[data-q]'); if (dq.length) { const qs = [...new Set(await Promise.all(dq.map(b => b.getAttribute('data-q'))))]; for (const q of qs) { for (const b of await page.$$(`[data-q="${q}"]`)) { await b.click(); await page.waitForTimeout(40); if (await b.evaluate(e => e.classList.contains('ok'))) break; } } for (const cb of await page.$$('#main input[type=checkbox]:not(:checked)')) await cb.check(); for (const [k, el] of (await page.$$('#main input[type=number]')).entries()) await el.fill(String(14 + k * 4)); continue; }
        const ids = ['#pf', '#pb', '#pp', '#bend', '#ext', '#push', '#zap']; for (const i of ids) { const el = await page.$(i + ':not([disabled])'); if (el) { await el.click(); await page.waitForTimeout(50); } }
        const segs = await page.$$('.seg:not([data-d])'); if (segs.length) { for (const z of segs) await z.evaluate(e => e.dispatchEvent(new MouseEvent('click', { bubbles: true }))); continue; }
        const sels = await page.$$('#main select'); if (sels.length && t < 3) { await sels[0].selectOption('f'); if (sels[1]) await sels[1].selectOption('b'); continue; }
        const stm = await page.$$('.stmt:not(.done)'); if (stm.length) { await stm[0].click(); const c = await page.$$('[data-c]'); await c[t % 2].click(); continue; }
        const dc = await page.$$('[data-c]:not(.ok)'); if (dc.length && (await page.$$('.hot')).length === 0) { for (const b of dc) { await b.click(); await page.waitForTimeout(30); } continue; }
        const tf=await page.$$('[data-v]:not([disabled])');if(tf.length&&await page.$('#whyBox')){ await tf[t % 2].click(); await page.fill('#ans','لأن هذا نموذج، وشرحي يربط السبب بالنتيجة.'); await page.click('#showAns'); continue; }
        if(tf.length){ await tf[t % 2].click(); continue; }
        const cbs = await page.$$('#main input[type=checkbox]:not(:checked)'); if (cbs.length) { for (const cb of cbs) await cb.check(); continue; }
        const inp = await page.$$('#main input[type=number]'); if (inp.length) { for (const [k, el] of inp.entries()) { const mn = +(await el.getAttribute('min') || 0); await el.fill(String(mn >= 50 ? 130 - k * 2 : 14 + k * 4)); } continue; }
        const opts = await page.$$('#main .opt:visible:not(.dim):not([data-say]):not([disabled]):not(.ok)'); if (opts.length) { await opts[t % opts.length].click(); await page.waitForTimeout(950); continue; }
        const ta = await page.$('#main textarea'); if (ta) { if (!(await ta.evaluate((e) => e.readOnly))) await ta.fill('إجابتي بكلماتي: لأن العظم حي وينمو ويلتئم'); const cmp = await page.$('#cmp:not([hidden]):not([disabled])'); if (cmp) await cmp.click(); const sf = await page.$('#modelBox:not([hidden]) [data-self="2"]'); if (sf) await sf.click(); if (cmp || sf) await page.waitForTimeout(30); continue; }
        const tool = await page.$$('.tool'); if (tool.length) { for (const x of tool) await x.click(); continue; }
        break;
      }
      { const seenText = await page.innerText('#main'); if (/\{[^{}]*\|[^{}]*\}|\{اسم\}/.test(seenText)) errors.push('leak-after@' + sid); }
      if (await page.evaluate(() => document.querySelector('#nextBtn').disabled)) { await page.waitForTimeout(1300); if (await page.evaluate(() => document.querySelector('#nextBtn').disabled)) { stuck = sid; break; } }
      if (await page.evaluate(() => idx === SCENES.length - 1)) break;
      await page.click('#nextBtn'); await page.waitForTimeout(40);
    }
    const prog = await page.evaluate((id) => JSON.parse(Atlas.storage.getItem(`atlas:${id}:progress`) || '{}'), id);
    if (TESTS) { const r = await page.evaluate(id => Atlas.storage.getItem(`atlas:${id}:recall`), id); if (!r) errors.push('recall-not-recorded'); }
    const fin = await page.evaluate((id) => Atlas.storage.getItem(`atlas:${id}:finished`), id);
    const alts=seen.filter(x=>/\.alt$/.test(x)).length;results.push({id,gender,level:selectedLevel,scenes:seen.length,alts,finished:fin,stuck,errors:[...new Set(errors)]});if(stuck||fin!=='true'||errors.length)failed=true;
    console.log(`${id} [${gender}] scenes=${seen.length}${TESTS ? ' alts=' + alts : ''} finished=${fin} progress=${Object.keys(prog).length}${stuck ? ' STUCK@' + stuck : ''} errors=${JSON.stringify([...new Set(errors)].filter(e => !/ERR_TUNNEL|Failed to load/.test(e)))}`);
    page.off('pageerror', h);
  }
  await b.close();const o=process.argv.find(x=>x.startsWith('--json='));if(o)fs.writeFileSync(o.slice(7),JSON.stringify(results,null,2));process.exitCode=failed?1:0;
})().catch(e=>{console.error(e);process.exitCode=1});

