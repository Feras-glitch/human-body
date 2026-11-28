// كتاب «妈妈指南» دليل الأم بالصينية PDF: build/pdf/mom-zh.pdf من app/v2/mom.html#all (بعد node tools/build-mom-guide.mjs)
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + path.resolve('app/v2/mom.html') + '#all'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  const out = 'build/pdf/mom-zh.pdf';
  await p.pdf({ path: out, format: 'A4', printBackground: false, margin: { top: '16mm', bottom: '16mm', left: '14mm', right: '14mm' } });
  console.log(out, Math.round(fs.statSync(out).size / 1024) + 'KB'); await b.close();
})();
