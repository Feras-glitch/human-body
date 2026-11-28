#!/usr/bin/env python3
"""ضغط الصور الكبيرة في app/v2/img (قرار 28 نوفمبر: جودة WebP 80 للصور 1024×1536).
يُشغَّل بعد تركيب صور جديدة: python3 tools/compress-images.py
لا يمسّ صورة مضغوطة من قبل (بصمتها في art-sources/compressed-q80.txt) ولا الصور الأصغر، فلا تتراكم خسارة الضغط.
ويحدّث bytes وsha256 في art-sources/*/checksums.json لما ضغطه."""
import glob, hashlib, io, json, os
from PIL import Image
SIZE, Q, LOG = (1024, 1536), 80, 'art-sources/compressed-q80.txt'
sha = lambda d: hashlib.sha256(d).hexdigest()
done = {l.split()[0] for l in open(LOG) if l.strip() and not l.startswith('#')}
changed = {}
for f in sorted(glob.glob('app/v2/img/*.webp')):
    im = Image.open(f)
    if im.size != SIZE or sha(open(f, 'rb').read()) in done: continue
    b = io.BytesIO(); im.convert('RGB').save(b, 'WEBP', quality=Q, method=6); d = b.getvalue()
    if len(d) >= os.path.getsize(f): continue
    open(f + '.tmp', 'wb').write(d); os.replace(f + '.tmp', f)
    changed[os.path.basename(f)] = {'bytes': len(d), 'sha256': sha(d)}
for c in glob.glob('art-sources/*/checksums.json'):
    j = json.load(open(c)); hit = [k for k in j if k in changed]
    if hit:
        for k in hit: j[k] = changed[k]
        open(c, 'w').write(json.dumps(j, ensure_ascii=False, indent=2) + '\n')
if changed: open(LOG, 'a').write(''.join(f"{v['sha256']}  {k}\n" for k, v in changed.items()))
print(f'ضُغطت {len(changed)} صورة')
