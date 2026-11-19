// يحوّل ملفات HTML التي بناها tools/build-pdf.py إلى PDF بمتصفح Playwright.
// الاستعمال: node tools/html2pdf.js [DIR]   (DIR افتراضياً build/pdf، وفيه _list.json)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const dir = process.argv[2] || 'build/pdf';
  const list = JSON.parse(fs.readFileSync(path.join(dir, '_list.json'), 'utf8'));
  const b = await chromium.launch(); const p = await b.newPage();
  for (const f of list) {
    await p.goto('file://' + path.resolve(f));
    await p.evaluate(() => document.fonts.ready);
    const out = f.replace(/\.html$/, '.pdf');
    await p.pdf({ path: out, format: 'A4', printBackground: true, margin: { top: '18mm', bottom: '18mm', left: '16mm', right: '16mm' } });
    console.log(out, Math.round(fs.statSync(out).size / 1024) + 'KB');
  }
  await b.close();
})();
