// يصنع «حزمة تحديث» موقّعة لتطبيق الطفل (استوديو جسم الإنسان، المرحلة 3): ملفات app/v2 التي تغيّرت منذ النسخة المحزومة.
//   node tools/make-update-pack.mjs --base <إيداع النسخة المحزومة> [--kind draft|release] [--out ملف.zip]
// المفتاح الخاص خارج المستودع: HB_UPDATE_KEY=<مسار PEM> (المفتاح العام في packaging/update-key.pub.pem، ومضمَّن في
// UpdatePack.java وmain.js). الحزمة تراكمية: كل ما تغيّر منذ «base»، فتحلّ محل أي حزمة سابقة.
// قبلها: npm run build وتوليد الدروس والاختبارات (release.sh). والإصدار (release) يمرّ على بوابة الإصدار.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash, sign, createPublicKey, verify } from 'node:crypto';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { zipStore } = require('../studio/zip.js');

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const base = arg('--base'), kind = arg('--kind', 'draft');
if (!base || !['draft', 'release'].includes(kind)) { console.error('الاستعمال: node tools/make-update-pack.mjs --base <إيداع> [--kind draft|release] [--out ملف.zip]'); process.exit(2); }
const keyPath = process.env.HB_UPDATE_KEY;
if (!keyPath || !existsSync(keyPath)) { console.error('اضبط HB_UPDATE_KEY على مسار المفتاح الخاص (خارج المستودع).'); process.exit(2); }
if (require('node:path').resolve(keyPath).startsWith(process.cwd() + '/')) { console.error('المفتاح الخاص داخل المستودع؛ انقله خارجه.'); process.exit(1); }
if (kind === 'release') execFileSync('bash', ['tools/release-gate.sh'], { stdio: 'inherit' });
execFileSync('node', ['tools/build-info.mjs', '--check'], { stdio: 'inherit' });

const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 1 << 28 });
const baseContent = JSON.parse(git('show', `${base}:app/v2/build-info.json`)).content;
const baseTree = new Map(git('ls-tree', '-r', base, '--', 'app/v2').trim().split('\n').filter(Boolean).map((l) => { const [meta, p] = l.split('\t'); return [p, meta.split(' ')[2]]; }));
const now = git('ls-files', '--', 'app/v2').trim().split('\n').filter(Boolean);
const info = JSON.parse(readFileSync('app/v2/build-info.json', 'utf8'));
const { safePath } = require('../packaging/desktop/update.js'); // القاعدة نفسها في UpdatePack.java
const files = [];
for (const p of now) {
  if (p === 'app/v2/build-info.json') continue;
  if (!safePath(p.slice('app/v2/'.length))) { console.log(`يُترك (لا يحمّله التطبيق): ${p}`); continue; } // مثل audio/quran/README.md
  const blob = git('hash-object', p).trim();
  if (baseTree.get(p) === blob) continue;
  files.push({ rel: p.slice('app/v2/'.length), data: readFileSync(p) });
}
const version = JSON.parse(readFileSync('packaging/desktop/package.json', 'utf8')).version;
files.push({ rel: 'build-info.json', data: Buffer.from(JSON.stringify({ kind, version, content: info.content, update: true, base: baseContent })) });
if (files.length === 1 && info.content === baseContent) { console.error('لا تغيير منذ النسخة المحزومة.'); process.exit(1); }
for (const f of files) if (!/^[A-Za-z0-9._/-]+$/.test(f.rel)) { console.error(`مسار لا يقبله التطبيق: ${f.rel}`); process.exit(1); }

const created = new Date().toISOString();
const manifest = ['humanbody-update-pack 1', `base ${baseContent}`, `content ${info.content}`, `app ${version}${kind === 'draft' ? '-draft' : ''}`, `created ${created}`,
  ...files.map((f) => `file ${createHash('sha256').update(f.data).digest('hex')} ${f.data.length} ${f.rel}`)].join('\n') + '\n';
const key = readFileSync(keyPath, 'utf8');
const sig = sign('sha256', Buffer.from(manifest), { key, dsaEncoding: 'der' }).toString('base64');
const pub = readFileSync(process.env.HB_UPDATE_PUB || 'packaging/update-key.pub.pem', 'utf8'); // HB_UPDATE_PUB للاختبارات وحدها
if (!verify('sha256', Buffer.from(manifest), { key: createPublicKey(pub), dsaEncoding: 'der' }, Buffer.from(sig, 'base64'))) { console.error('المفتاح الخاص لا يطابق المفتاح العام في packaging/update-key.pub.pem'); process.exit(1); }

const out = arg('--out', `dist/HumanBody-Update-${info.content}${kind === 'draft' ? '-draft' : ''}.zip`);
mkdirSync(require('node:path').dirname(out), { recursive: true });
const blob = zipStore([{ name: 'manifest.txt', data: Buffer.from(manifest) }, { name: 'manifest.sig', data: Buffer.from(sig) }, ...files.map((f) => ({ name: 'www/' + f.rel, data: f.data }))]);
blob.arrayBuffer().then((ab) => {
  writeFileSync(out, Buffer.from(ab));
  console.log(`${out}: ${files.length} ملفاً، من المحتوى ${baseContent} إلى ${info.content} (${kind})`);
});
