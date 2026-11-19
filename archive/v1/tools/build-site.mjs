// Wrap each build/<id>/app.html into a standalone page for publishing (build/site/<id>.html)
import fs from 'node:fs'; import path from 'node:path';
const head = '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><style>[hidden]{display:none!important}img{max-width:100%}</style></head><body>\n';
fs.mkdirSync('build/site', {recursive:true});
for (const id of fs.readdirSync('lessons').filter(f=>f.endsWith('.json')).map(f=>f.replace('.json',''))) {
  const src = path.join('build', id, 'app.html');
  if (!fs.existsSync(src)) continue;
  fs.writeFileSync(path.join('build/site', id + '.html'), head + fs.readFileSync(src, 'utf8') + '\n</body></html>');
  console.log('site', id);
}
