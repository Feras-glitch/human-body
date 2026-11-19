// حزمة التحديث الموقّعة (استوديو جسم الإنسان، المرحلة 3): تصنعها tools/make-update-pack.mjs، ويثبّتها الغلاف
// (UpdatePack.java في أندرويد، وpackaging/desktop/update.js في ويندوز) بالقواعد نفسها.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync, spawnSync } = require('node:child_process');
const { zipStore } = require('../studio/zip.js');
const UP = require('../packaging/desktop/update.js');

const REPO = path.resolve(__dirname, '..');
const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
const PUB_PEM = publicKey.export({ type: 'spki', format: 'pem' });
const PUB_B64 = publicKey.export({ type: 'spki', format: 'der' }).toString('base64');

async function pack({ base = 'aaaa', files = { 'U01.L01.html': '<p>جديد</p>' }, tamper = null, key = privateKey, extraLine = '' } = {}) {
  const fs_ = Object.entries(files).map(([rel, t]) => ({ rel, data: Buffer.from(t) }));
  const man = ['humanbody-update-pack 1', `base ${base}`, 'content bbbb', 'app 1.3.0-draft', 'created 2026-11-19', ...fs_.map((f) => `file ${crypto.createHash('sha256').update(f.data).digest('hex')} ${f.data.length} ${f.rel}`), extraLine].join('\n') + '\n';
  const sig = crypto.sign('sha256', Buffer.from(man), { key, dsaEncoding: 'der' }).toString('base64');
  if (tamper) fs_[0].data = Buffer.from(tamper);
  const b = zipStore([{ name: 'manifest.txt', data: Buffer.from(man) }, { name: 'manifest.sig', data: Buffer.from(sig) }, ...fs_.map((f) => ({ name: 'www/' + f.rel, data: f.data }))]);
  return Buffer.from(await b.arrayBuffer());
}
const cases = async () => ({
  good: await pack(),
  tampered: await pack({ tamper: '<p>عُدّل بعد التوقيع</p>' }),
  otherKey: await pack({ key: crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' }).privateKey }),
  otherBase: await pack({ base: 'cccc' }),
  traversal: await pack({ files: { '../evil.html': 'x' } }),
  badExt: await pack({ files: { 'run.exe': 'x' } }),
});

test('the public key in UpdatePack.java and main.js packaging is the one in packaging/update-key.pub.pem', () => {
  const pem = fs.readFileSync(path.join(REPO, 'packaging/update-key.pub.pem'), 'utf8').replace(/-----[^-]+-----|\s/g, '');
  const java = fs.readFileSync(path.join(REPO, 'packaging/android/src/com/feras/humanbody/UpdatePack.java'), 'utf8');
  assert.equal(java.match(/static final String PUB = "([^"]+)"/)[1], pem);
  assert.match(fs.readFileSync(path.join(REPO, 'packaging/build-windows.sh'), 'utf8'), /update-key\.pub\.pem/);
});

test('Windows (update.js): installs a signed pack, refuses tampered, foreign, other-version and unsafe packs, and drops a pack for another version', async () => {
  const C = await cases(), dir = fs.mkdtempSync(path.join(os.tmpdir(), 'upd-')), ov = path.join(dir, 'update');
  try {
    const i = UP.install(C.good, 'aaaa', ov, PUB_PEM);
    assert.deepEqual([i.content, i.files], ['bbbb', 1]);
    assert.equal(fs.readFileSync(UP.file(ov, 'U01.L01.html'), 'utf8'), '<p>جديد</p>');
    assert.equal(UP.file(ov, 'U01.L02.html'), null);
    for (const [k, re] of [['tampered', /بصمته/], ['otherKey', /التوقيع/], ['otherBase', /نسخة أخرى/], ['traversal', /مسار/], ['badExt', /مسار/]]) {
      assert.throws(() => UP.install(C[k], 'aaaa', ov, PUB_PEM), re, k);
      assert.equal(fs.readFileSync(UP.file(ov, 'U01.L01.html'), 'utf8'), '<p>جديد</p>', `${k}: الحزمة المثبّتة باقية`);
    }
    assert.ok(UP.current(ov, 'aaaa'));
    assert.equal(UP.current(ov, 'zzzz'), null, 'نسخة أحدث من التطبيق: تُترك الحزمة');
    assert.ok(!fs.existsSync(ov));
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('Android (UpdatePack.java on the JVM): the same rules', async (t) => {
  if (spawnSync('javac', ['-version']).status !== 0) return t.skip('لا javac');
  const C = await cases(), dir = fs.mkdtempSync(path.join(os.tmpdir(), 'updj-'));
  try {
    for (const [k, b] of Object.entries(C)) fs.writeFileSync(path.join(dir, k + '.zip'), b);
    fs.mkdirSync(path.join(dir, 'com/feras/humanbody'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'com/feras/humanbody/T.java'), `package com.feras.humanbody;
import java.io.File; import java.nio.file.Files;
public class T { public static void main(String[] a) throws Exception {
  System.setOut(new java.io.PrintStream(new java.io.FileOutputStream(java.io.FileDescriptor.out), true, "UTF-8"));
  File ov = new File(a[0], "update");
  for (String k : new String[]{"good","tampered","otherKey","otherBase","traversal","badExt"}) {
    try { UpdatePack.Info i = UpdatePack.install(Files.readAllBytes(new File(a[0], k + ".zip").toPath()), "aaaa", ov, a[1]); System.out.println(k + " OK " + i.content + " " + i.files); }
    catch (UpdatePack.Bad b) { System.out.println(k + " BAD " + b.getMessage()); }
  }
  File f = UpdatePack.file(ov, "www/U01.L01.html"); System.out.println("file " + (f == null ? "null" : new String(Files.readAllBytes(f.toPath()), "UTF-8")));
  System.out.println("unsafe " + UpdatePack.file(ov, "www/../update/meta.txt"));
  System.out.println("current " + (UpdatePack.current(ov, "aaaa") != null) + " " + (UpdatePack.current(ov, "zzzz") != null) + " " + ov.exists());
}}`);
    const out = path.join(dir, 'out');
    execFileSync('javac', ['-encoding', 'UTF-8', '-d', out, path.join(REPO, 'packaging/android/src/com/feras/humanbody/UpdatePack.java'), path.join(dir, 'com/feras/humanbody/T.java')], { stdio: 'pipe' });
    const r = execFileSync('java', ['-Dfile.encoding=UTF-8', '-cp', out, 'com.feras.humanbody.T', dir, PUB_B64], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    assert.match(r, /^good OK bbbb 1$/m);
    assert.match(r, /^tampered BAD .*بصمته/m); assert.match(r, /^otherKey BAD .*التوقيع/m); assert.match(r, /^otherBase BAD .*نسخة أخرى/m);
    assert.match(r, /^traversal BAD .*مسار/m); assert.match(r, /^badExt BAD .*مسار/m);
    assert.match(r, /^file <p>جديد<\/p>$/m); assert.match(r, /^unsafe null$/m); assert.match(r, /^current true false false$/m);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('make-update-pack: packs only files changed since the shipped commit, signed and verifiable', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mk-'));
  const key = path.join(dir, 'k.pem'), pub = path.join(dir, 'p.pem'), out = path.join(dir, 'u.zip');
  fs.writeFileSync(key, privateKey.export({ type: 'pkcs8', format: 'pem' })); fs.writeFileSync(pub, PUB_PEM);
  const target = path.join(REPO, 'app/v2/licenses.html'), orig = fs.readFileSync(target);
  try {
    fs.writeFileSync(target, Buffer.concat([orig, Buffer.from('\n<!-- اختبار -->\n')]));
    execFileSync('node', ['tools/make-update-pack.mjs', '--base', 'HEAD', '--out', out], { cwd: REPO, env: { ...process.env, HB_UPDATE_KEY: key, HB_UPDATE_PUB: pub }, stdio: 'pipe' });
    const shipped = JSON.parse(execFileSync('git', ['show', 'HEAD:app/v2/build-info.json'], { cwd: REPO, encoding: 'utf8' })).content;
    const ov = path.join(dir, 'update');
    const i = UP.install(fs.readFileSync(out), shipped, ov, PUB_PEM);
    const dirty = execFileSync('git', ['diff', '--name-only', 'HEAD', '--', 'app/v2'], { cwd: REPO, encoding: 'utf8' }).trim().split('\n').filter((f) => f && f !== 'app/v2/build-info.json');
    assert.equal(i.files, new Set([...dirty, 'app/v2/licenses.html']).size + 1, 'ما تغيّر منذ النسخة المحزومة وbuild-info.json وحده');
    assert.match(fs.readFileSync(UP.file(ov, 'licenses.html'), 'utf8'), /اختبار/);
    assert.equal(JSON.parse(fs.readFileSync(UP.file(ov, 'build-info.json'), 'utf8')).update, true);
  } finally { fs.writeFileSync(target, orig); fs.rmSync(dir, { recursive: true, force: true }); }
});
