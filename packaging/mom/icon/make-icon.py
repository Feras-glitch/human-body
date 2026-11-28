#!/usr/bin/env python3
# أيقونة «妈妈指南» دليل الأم (اختيار صاحب المشروع «أ»، 29 نوفمبر 2026):
# أيقونة تطبيق الأطفال نفسها بخلفية وردية داكنة بدل الفيروزية، وفي زاويتها شارة كتاب مفتوح (badge.png من badge.svg).
# الإخراج: icon-1024.png هنا، وpackaging/mom/res/mipmap-*/ic_launcher.png التي تحل محل أيقونة الأطفال في build-mom-android.sh.
# الاستعمال: python3 packaging/mom/icon/make-icon.py  (يحتاج badge.png؛ يُرسم من badge.svg بـ Chromium عند غيابه)
import os, sys
import numpy as np
from PIL import Image
H = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(H, '../../..'))
badge = os.path.join(H, 'badge.png')
if not os.path.exists(badge):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1024, 'height': 1024})
        pg.goto('file://' + os.path.join(H, 'badge.svg')); pg.screenshot(path=badge, omit_background=True); b.close()
a = np.array(Image.open(os.path.join(ROOT, 'packaging/icon/icon-1024.png')).convert('RGBA')).astype(int)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
teal = (g > r + 40) & (b > r + 30) & (r < 140)
yy, xx = np.mgrid[0:1024, 0:1024]
shoes = (yy > 740) & (yy < 900) & (xx > 290) & (xx < 710)   # الحذاء يبقى فيروزياً
lens = ((xx - 570) ** 2 + (yy - 335) ** 2) < 195 ** 2        # زجاج العدسة يبقى أزرق
m = teal & ~shoes & ~lens
out = a.copy()
for c, v in zip(range(3), (0xC8, 0x5A, 0x6E)):
    out[..., c] = np.where(m, np.clip(v + (a[..., 1] - 0xb3) // 2, 0, 255), a[..., c])
im = Image.fromarray(out.astype('uint8')); im.alpha_composite(Image.open(badge).convert('RGBA'))
im.save(os.path.join(H, 'icon-1024.png'))
for d, s in {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}.items():
    p = os.path.join(ROOT, f'packaging/mom/res/mipmap-{d}'); os.makedirs(p, exist_ok=True)
    im.resize((s, s), Image.LANCZOS).save(os.path.join(p, 'ic_launcher.png'), optimize=True)
print('icon-1024.png + 5 mipmaps')
