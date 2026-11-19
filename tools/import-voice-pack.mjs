// يدمج «حزمة صوت» من استوديو جسم الإنسان في المستودع (الطريق الثاني: الحزمة تمر على المطوّر).
//   node tools/import-voice-pack.mjs <حزمة.zip> [--dry]
// لكل تسجيل: يُبحث عن نصه في قوائم التسجيل الحالية (build/<الدرس>/audio-manifest.json وbuild/common/) ببصمته (akey).
//   - وُجد: يُحوَّل إلى mp3 أحادي 64 كيلوبت 44.1 كيلوهرتز، ويُقصّ الصمت الزائد في أوله وآخره، ويُسوّى ارتفاعه،
//     ويوضع باسمه في app/v2/audio/<الملف> (كما تطلبه build-scenes.mjs). ثم: npm run build.
//   - لم يوجد (تغيّر النص بعد التسجيل، أو نص من محتوى آخر): يُترك ويُذكر في التقرير. لا يُسمع تسجيل على غير نصه.
// يحتاج ffmpeg.
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { inflateRawSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
const { audioKey } = createRequire(import.meta.url)('../app/v2/audio-key.js');

const [pack, ...flags] = process.argv.slice(2);
if (!pack || !existsSync(pack)) { console.error('الاستعمال: node tools/import-voice-pack.mjs <حزمة.zip> [--dry]'); process.exit(2); }
const dry = flags.includes('--dry');

function unzip(buf) {
  let e = -1; for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) if (buf.readUInt32LE(i) === 0x06054b50) { e = i; break; }
  if (e < 0) throw new Error('ليس ملف zip');
  const n = buf.readUInt16LE(e + 10); let p = buf.readUInt32LE(e + 16); const out = new Map();
  for (let k = 0; k < n; k++) {
    const method = buf.readUInt16LE(p + 10), csize = buf.readUInt32LE(p + 20), nl = buf.readUInt16LE(p + 28), xl = buf.readUInt16LE(p + 30), cl = buf.readUInt16LE(p + 32), off = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nl); p += 46 + nl + xl + cl;
    const start = off + 30 + buf.readUInt16LE(off + 26) + buf.readUInt16LE(off + 28), raw = buf.subarray(start, start + csize);
    out.set(name, method === 0 ? raw : method === 8 ? inflateRawSync(raw) : null);
  }
  return out;
}

const Z = unzip(readFileSync(pack));
const man = JSON.parse(Z.get('manifest.json').toString('utf8'));
if (man.type !== 'humanbody-voice-pack' || man.version !== 1) { console.error('الملف ليس حزمة صوت من الاستوديو'); process.exit(1); }

const byKey = new Map();
const lists = ['build/common/audio-manifest.json', ...readdirSync('build').map((d) => `build/${d}/audio-manifest.json`)].filter((f, i, a) => existsSync(f) && a.indexOf(f) === i);
for (const f of lists) for (const it of JSON.parse(readFileSync(f, 'utf8')).items) { const k = audioKey(it.text); if (k && !byKey.has(k)) byKey.set(k, it); }

const tmp = mkdtempSync(join(tmpdir(), 'voice-'));
let ok = 0; const stale = [], bad = [];
try {
  for (const e of man.entries) {
    const it = byKey.get(e.akey), data = Z.get(e.name);
    if (!it) { stale.push(`${e.lesson} ${e.key}: «${String(e.text).slice(0, 50)}»`); continue; }
    if (!data || !data.length) { bad.push(e.name); continue; }
    const dest = join('app/v2/audio', it.file);
    if (dry) { ok++; continue; }
    const src = join(tmp, 'in.' + (e.name.split('.').pop() || 'webm'));
    writeFileSync(src, data); mkdirSync(dirname(dest), { recursive: true });
    try {
      execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-af',
        'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.15,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.25,areverse,loudnorm=I=-18:TP=-2:LRA=11',
        '-ac', '1', '-ar', '44100', '-b:a', '64k', dest]);
      ok++;
    } catch { bad.push(e.name); }
  }
} finally { rmSync(tmp, { recursive: true, force: true }); }

console.log(`حزمة ${man.recorder || '؟'} (${man.created || ''}، محتوى ${man.content || '؟'}): ${man.entries.length} تسجيلاً`);
console.log(`${dry ? 'يصلح للدمج' : 'دُمج'}: ${ok}`);
if (stale.length) console.log(`تُرك ${stale.length} لأن نصه تغيّر أو ليس في المحتوى الحالي (يُعاد تسجيله):\n  ` + stale.slice(0, 30).join('\n  ') + (stale.length > 30 ? '\n  …' : ''));
if (bad.length) console.log(`تعذّر ${bad.length}: ${bad.slice(0, 10).join(' ')}`);
if (!dry && ok) console.log('التالي: npm run build ثم node tools/audio-status.mjs');
