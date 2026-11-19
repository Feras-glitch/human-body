// «حزمة التحديث» الموقّعة في نسخة ويندوز — نظير UpdatePack.java حرفاً بحرف (القواعد نفسها، والمفتاح العام نفسه).
// تُثبَّت في مجلد المستخدم (update/)، وتُقدَّم ملفاتها على ملفات www المحزومة عبر protocol.handle('file') في main.js.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

const EXT = new Set(['html', 'js', 'css', 'json', 'webp', 'png', 'jpg', 'svg', 'mp3', 'ogg', 'webm', 'm4a', 'ttf', 'woff2', 'txt']);
const MAX_TOTAL = 300 * 1048576, MAX_FILES = 6000;
class Bad extends Error {}

function unzip(buf) {
  let e = -1; for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) if (buf.readUInt32LE(i) === 0x06054b50) { e = i; break; }
  if (e < 0) throw new Bad('الملف ليس حزمة تحديث (ليس zip سليماً).');
  const n = buf.readUInt16LE(e + 10); let p = buf.readUInt32LE(e + 16); const out = new Map(); let total = 0;
  if (n > MAX_FILES) throw new Bad('الحزمة فيها ملفات أكثر من المسموح.');
  for (let k = 0; k < n; k++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Bad('الملف ليس حزمة تحديث (ليس zip سليماً).');
    const method = buf.readUInt16LE(p + 10), csize = buf.readUInt32LE(p + 20), nl = buf.readUInt16LE(p + 28), xl = buf.readUInt16LE(p + 30), cl = buf.readUInt16LE(p + 32), off = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nl); p += 46 + nl + xl + cl;
    const start = off + 30 + buf.readUInt16LE(off + 26) + buf.readUInt16LE(off + 28), raw = buf.subarray(start, start + csize);
    const data = method === 0 ? raw : method === 8 ? zlib.inflateRawSync(raw) : null;
    if (!data) throw new Bad('طريقة ضغط غير مدعومة.');
    total += data.length; if (total > MAX_TOTAL) throw new Bad('الحزمة أكبر من المسموح.');
    out.set(name, data);
  }
  return out;
}

const safePath = (p) => !!p && !p.startsWith('/') && !p.includes('..') && !p.includes('\\') && /^[A-Za-z0-9._/-]+$/.test(p) && p.lastIndexOf('.') > 0 && EXT.has(p.slice(p.lastIndexOf('.') + 1).toLowerCase());
const rm = (d) => { try { fs.rmSync(d, { recursive: true, force: true }); } catch { /* لا شيء */ } };

function install(buf, shipped, overlay, pubPem) {
  const z = unzip(Buffer.from(buf));
  const man = z.get('manifest.txt'), sig = z.get('manifest.sig');
  if (!man || !sig) throw new Bad('الملف ليس حزمة تحديث موقّعة.');
  let ok = false;
  try { ok = crypto.verify('sha256', man, { key: crypto.createPublicKey(pubPem), dsaEncoding: 'der' }, Buffer.from(sig.toString('utf8').trim(), 'base64')); } catch { ok = false; }
  if (!ok) throw new Bad('التوقيع غير صحيح: الحزمة ليست من المطوّر، أو عُدّل فيها شيء.');
  const lines = man.toString('utf8').split('\n');
  if ((lines[0] || '').trim() !== 'humanbody-update-pack 1') throw new Bad('نوع الحزمة غير معروف.');
  const info = { base: '', content: '', app: '', created: '', files: 0 }, files = [];
  for (const l of lines.slice(1)) {
    const t = l.trim(); if (!t) continue; const p = t.split(' ');
    if (p[0] === 'file' && p.length >= 4) files.push({ sha: p[1], size: +p[2], path: p.slice(3).join(' ') });
    else if (p[0] in info && p[0] !== 'files') info[p[0]] = p.slice(1).join(' ');
  }
  if (info.base !== shipped) throw new Bad(`الحزمة مبنية على نسخة أخرى من التطبيق (${info.base})، وهذه النسخة ${shipped}. اطلب حزمة لهذه النسخة.`);
  const tmp = overlay + '.tmp'; rm(tmp);
  for (const f of files) {
    if (!safePath(f.path)) { rm(tmp); throw new Bad('مسار غير مسموح في الحزمة: ' + f.path); }
    const data = z.get('www/' + f.path);
    if (!data || data.length !== f.size || crypto.createHash('sha256').update(data).digest('hex') !== f.sha) { rm(tmp); throw new Bad('ملف في الحزمة لا يطابق بصمته: ' + f.path); }
    const out = path.join(tmp, 'www', f.path); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, data);
  }
  info.files = files.length;
  fs.mkdirSync(tmp, { recursive: true });
  fs.writeFileSync(path.join(tmp, 'meta.txt'), `base ${info.base}\ncontent ${info.content}\napp ${info.app}\ncreated ${info.created}\nfiles ${info.files}\n`);
  rm(overlay); fs.renameSync(tmp, overlay);
  return info;
}

function current(overlay, shipped) {
  let txt; try { txt = fs.readFileSync(path.join(overlay, 'meta.txt'), 'utf8'); } catch { return null; }
  const info = { base: '', content: '', app: '', created: '', files: 0 };
  for (const l of txt.split('\n')) { const [k, ...v] = l.trim().split(' '); if (k in info) info[k] = k === 'files' ? +v.join(' ') : v.join(' '); }
  if (info.base !== shipped) { rm(overlay); return null; }
  return info;
}

/** ملف الحزمة المقابل لملف www (المسار النسبي داخل www) إن وُجد */
function file(overlay, rel) { if (!safePath(rel)) return null; const f = path.join(overlay, 'www', rel); try { return fs.statSync(f).isFile() ? f : null; } catch { return null; } }

module.exports = { install, current, file, safePath, Bad };
