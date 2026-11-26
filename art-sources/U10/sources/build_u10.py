# -*- coding: utf-8 -*-
"""رسوم الوحدة U10 التعليمية (SVG ← WebP 1024×1536) بأسلوب رسوم U07–U09 المتجهية نفسه.
الاستعمال: python3 art-sources/U10/sources/build_u10.py [--preview=مجلد] [أسماء…]   (بلا أسماء: كلها)
يكتب المصدر في art-sources/U10/sources/<الاسم>.svg والصورة في app/v2/img/<الاسم>.webp، ويُحدّث status.csv وchecksums.json.
الأدوات المشتركة من build_u07.py وbuild_u08.py وbuild_u09.py. لا كتابة ولا أرقام داخل الرسوم، ولا رسم لأعضاء تناسلية في أي صورة.
"""
from pathlib import Path
import math, sys, importlib.util

HERE = Path(__file__).resolve().parent
ART = HERE.parent
REPO = ART.parent.parent
def _load(name, p):
    sp = importlib.util.spec_from_file_location(name, p); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m
u07 = _load('u07', REPO / 'art-sources' / 'U07' / 'sources' / 'build_u07.py')
u08 = _load('u08', REPO / 'art-sources' / 'U08' / 'sources' / 'build_u08.py')
u09 = _load('u09', REPO / 'art-sources' / 'U09' / 'sources' / 'build_u09.py')
path, circ, ellipse, rect, group, arrow, face, mascot, panel = u07.path, u07.circ, u07.ellipse, u07.rect, u07.group, u07.arrow, u07.face, u07.mascot, u07.panel
rbc, brain, magnifier, boy, drop = u07.rbc, u07.brain, u07.magnifier, u07.boy, u07.drop
kid_front, brain_side, sun, moon = u08.kid_front, u08.brain_side, u08.sun, u08.moon
C, TEAL, RED, SKIN, SKINS = u07.C, u07.TEAL, u07.RED, u07.SKIN, u07.SKINS
BLUE, GREEN, CORAL = u08.BLUE, u08.GREEN, u08.CORAL
defs = u09.defs
BONE, BONES, CART, CARTS = '#F6EEDC', '#B8A585', '#BFE7F2', '#4FA3B8'
MOM, DAD = '#FF8A6B', '#4FA3D9'


# ———— أدوات U10 ————
def cellc(x, y, s=1, nuc=True, split=0):
    """خلية مستديرة بنواة؛ split بين 0 و1: تتخصّر لتنقسم."""
    if split:
        w = 90 * s; pinch = 1 - .55 * split
        q = path(f'M{-w} 0C{-w} {-70 * s} {-w * .2} {-70 * s * pinch} 0 {-60 * s * pinch}C{w * .2} {-70 * s * pinch} {w} {-70 * s} {w} 0C{w} {70 * s} {w * .2} {70 * s * pinch} 0 {60 * s * pinch}C{-w * .2} {70 * s * pinch} {-w} {70 * s} {-w} 0Z', '#F7E3EC', '#B77B97', 4)
        q += circ(-w * .5, 0, 22 * s, '#C79BC0', '#8E5E86', 3) + circ(w * .5, 0, 22 * s, '#C79BC0', '#8E5E86', 3)
        return group(q, x, y)
    q = circ(0, 0, 62 * s, '#F7E3EC', '#B77B97', 4)
    if nuc:
        q += circ(0, 0, 22 * s, '#C79BC0', '#8E5E86', 3)
    return group(q, x, y)


def femur(x, y, s=1, plates=True, glow=False):
    """عظم الفخذ عمودياً: رأس مستدير أعلى، ولقمتان أسفل؛ صفيحتا النمو شريطان قرب الطرفين."""
    q = path('M-40 -330C-40 -390 -110 -410 -120 -360C-130 -320 -90 -300 -60 -290L-38 -260L-30 300C-80 320 -90 380 -40 390C-10 395 0 370 0 360C0 370 10 395 40 390C90 380 80 320 30 300L36 -270C60 -300 70 -330 40 -350C10 -370 -40 -360 -40 -330Z', BONE, BONES, 5)
    if plates:
        col, st = (CART, CARTS)
        q += path('M-62 -268Q0 -250 50 -276', stroke=st, w=16) + path('M-62 -268Q0 -250 50 -276', stroke=col, w=9)
        q += path('M-36 280Q0 296 34 280', stroke=st, w=16) + path('M-36 280Q0 296 34 280', stroke=col, w=9)
        if glow:
            q += circ(0, -266, 70, 'url(#glow)', extra='opacity=".6"') + circ(0, 286, 60, 'url(#glow)', extra='opacity=".6"')
    else:
        q += path('M-62 -268Q0 -250 50 -276', stroke='#E3D6BC', w=4) + path('M-36 280Q0 296 34 280', stroke='#E3D6BC', w=4)
    return group(q, x, y, s)


def chromo(x, y, s=1, col=MOM, st='#B8462F', angle=0):
    """كروموسوم على شكل حرف X مبسّط."""
    q = path('M-14 -60Q-4 -30 -6 0Q-4 30 -14 60', stroke=st, w=22) + path('M-14 -60Q-4 -30 -6 0Q-4 30 -14 60', stroke=col, w=15)
    q += path('M14 -60Q4 -30 6 0Q4 30 14 60', stroke=st, w=22) + path('M14 -60Q4 -30 6 0Q4 30 14 60', stroke=col, w=15)
    q += circ(0, 0, 9, '#FFFFFF', st, 3)
    return group(q, x, y, s, angle)


def adult(x, y, s=1, woman=False):
    """كبير من الأمام بثياب محتشمة؛ المرأة بحجاب."""
    q = path('M-70 120Q0 96 70 120L96 520Q0 560 -96 520Z', '#B9D8C8' if woman else '#9ECDE4', '#43687F', 5)
    q += path('M-60 520L-56 760M60 520L56 760', stroke='#4A5C78' if not woman else '#7D6A9E', w=44) if not woman else path('M-92 500L-110 760H110L92 500Z', '#B9D8C8', '#43687F', 5)
    q += path('M-70 140L-120 330M70 140L120 330', stroke=SKIN, w=34)
    q += rect(-26, 60, 52, 60, SKIN, SKINS, 4, 18) + circ(0, 0, 78, SKIN, SKINS, 5)
    if woman:
        q += path('M-96 30Q-100 -100 0 -104Q100 -100 96 30Q96 90 60 130H-60Q-96 90 -96 30Z', '#E8A2B5', '#B26A80', 5) + circ(0, 4, 64, SKIN, SKINS, 4)
    else:
        q += path('M-80 -20Q-70 -96 0 -98Q70 -96 80 -20Q60 -60 0 -62Q-60 -60 -80 -20Z', '#45312B', '#352724', 3)
    q += face(0, 10, 1.6)
    return group(q, x, y, s)


def door_marks(x, y, h, marks):
    """باب بعلامات طول بألوان؛ marks قائمة ارتفاعات نسبية من 0 إلى 1."""
    q = rect(0, 0, 220, h, '#E9C79A', '#A57A4E', 5, 12) + rect(20, 20, 180, h - 40, '#F2D6AE', '#C9A57A', 3, 10) + circ(190, h / 2, 10, '#B8862A')
    cols = ['#FF8A6B', '#FFC93C', '#2BB3A3', '#7FB8E0', '#B07CD8']
    for i, m in enumerate(marks):
        yy = h - 30 - m * (h - 80)
        q += path(f'M30 {yy:.0f}H130', stroke=cols[i % len(cols)], w=8)
    return group(q, x, y)


def spine(x, y, s=1, squash=0.0):
    """عمود فقري جانبي مبسّط: فقرات بينها أقراص؛ squash بين 0 و1 يضغط الأقراص."""
    q = ''
    yy = 0
    for i in range(9):
        q += rect(-60, yy, 120, 64, BONE, BONES, 4, 14) + path(f'M60 {yy + 20}l44 10l-44 14', BONE, BONES, 4)
        yy += 64
        dh = 26 * (1 - .55 * squash)
        if i < 8:
            q += ellipse(0, yy + dh / 2, 62, dh / 2, '#A9DDEB', '#3E8FA8', 4)
            yy += dh
    return group(q, x, y, s)


def bed_kid(x, y, s=1):
    q = rect(-200, 40, 400, 90, '#B07A4E', '#7A5232', 5, 14) + rect(-190, 0, 380, 60, '#FFFFFF', '#C9BBA8', 4, 24) + rect(-180, -10, 110, 50, '#FDF0C4', '#D9B860', 4, 20)
    q += circ(-124, -20, 46, SKIN, SKINS, 4) + path('M-164 -40Q-150 -80 -124 -72Q-98 -80 -84 -44', '#45312B', '#352724', 3) + path('M-140 -16q8 6 16 0M-116 -16q8 6 16 0', stroke='#333', w=4)
    q += path('M-80 0Q60 -40 190 10L190 50H-80Z', '#9ECDE4', '#43687F', 5)
    return group(q, x, y, s)


def plate_food(x, y, s=1):
    q = ellipse(0, 0, 130, 46, '#FFFFFF', '#C9BBA8', 5) + ellipse(0, -6, 100, 32, '#F7F2E8')
    q += circ(-44, -10, 22, '#7BBF4A', '#4F8E3C', 3) + circ(-10, -18, 18, '#E85A4F', '#A8333B', 3) + ellipse(36, -10, 34, 16, '#E8B04A', '#B8862A', 3)
    q += rect(150, -110, 50, 110, '#FFFFFF', '#9FC3D9', 4, 10) + rect(154, -70, 42, 66, '#F4F7FA')
    return group(q, x, y, s)


def ball(x, y, s=1):
    return group(circ(0, 0, 50, '#FF8A6B', '#B8462F', 4) + path('M-50 0Q0 -24 50 0M-50 0Q0 24 50 0M0 -50Q-24 0 0 50', stroke='#FFFFFF', w=5), x, y, s)


# ———— U10.L01: كيف أكبر؟ ————
def l01_e1():
    q = panel(80, 560)
    q += cellc(200, 360, .9) + arrow(280, 360, 340, 360) + cellc(440, 360, .9, split=.8) + arrow(540, 360, 600, 360)
    for dx, dy in [(-60, -60), (60, -60), (-60, 60), (60, 60)]:
        q += cellc(760 + dx, 360 + dy, .5)
    for k in range(3):  # البداية: نسخ ما في النواة
        q += circ(200 - 16 + k * 16, 360, 6, '#8E5E86')
    q += panel(700, 700)
    q += group(kid_front(s=.28), 150, 1060) + arrow(390, 1220, 470, 1220)
    q += group(kid_front(s=.52), 380, 780)
    q += path('M150 1395H900', stroke='#C9BBA8', w=6)
    q += mascot(850, 1380, .5)
    return q


def l01_e2():
    q = panel(80, 1360, 50, 430) + panel(80, 1360, 544, 430)
    q += femur(265, 760, 1.25, plates=True, glow=True)
    for yy, dy in [(330, -1), (1170, 1)]:
        q += arrow(390, yy, 390, yy + dy * 90, TEAL, 7)
    q += magnifier(760, 420, 150, rect(-150, -150, 300, 300, BONE, rx=0) + ''.join(rect(-120 + c * 60, -130 + r * 34, 44, 26, CART, CARTS, 3, 10) for c in range(4) for r in range(4)) + rect(-150, 20, 300, 130, '#EADCC0', BONES, 3, 0))
    q += path('M330 390L620 400', stroke='#C9BBA8', w=5, extra='stroke-dasharray="12 12"')
    q += femur(760, 1060, .75, plates=False)
    q += mascot(880, 1400, .42)
    return q


def l01_e3():
    q = panel(80, 520)
    q += brain_side(330, 330, .85) + circ(400, 420, 20, '#FFC93C', '#B8862A', 4) + circ(400, 420, 60, 'url(#glow)')
    q += path('M410 440C520 520 640 520 760 430', stroke='#E85A4F', w=26) + path('M410 440C520 520 640 520 760 430', stroke='#F3A39D', w=14)
    for t in [.25, .5, .75]:
        bx = 410 + (760 - 410) * t; by = 440 + 70 * math.sin(math.pi * t)
        q += circ(bx, by, 11, '#FFC93C', '#B8862A', 3)
    q += femur(840, 330, .42, plates=True, glow=True)
    q += panel(640, 380) + bed_kid(400, 860, 1.1) + moon(820, 760, 70)
    for k in range(3):
        q += circ(560 + k * 60, 760 - k * 30, 10 + k * 3, '#FFFFFF', '#9FC3D9', 3)
    q += panel(1060, 380) + plate_food(300, 1280, 1.0) + ball(720, 1260, 1.2) + path('M650 1350q70 30 140 0', stroke='#C9BBA8', w=5)
    return q


def l01_e4():
    q = panel(80, 700)
    q += adult(230, 250, .62, woman=True) + adult(794, 250, .62)
    for i, (xx, col, st) in enumerate([(360, MOM, '#B8462F'), (664, DAD, '#2E6AA3')]):
        q += chromo(xx, 520, .9, col, st)
    q += arrow(380, 600, 470, 650, '#B8462F', 6) + arrow(644, 600, 554, 650, '#2E6AA3', 6)
    q += chromo(482, 690, .8, MOM, '#B8462F') + chromo(542, 690, .8, DAD, '#2E6AA3')
    q += panel(820, 580)
    q += door_marks(130, 870, 500, [.15, .32, .5, .66, .8])
    q += door_marks(400, 870, 500, [.1, .2, .42, .7, .74])
    q += door_marks(670, 870, 500, [.2, .35, .46, .56, .68])
    q += mascot(880, 1410, .4)
    return q


def l01_e5():
    q = panel(80, 1360, 50, 430) + panel(80, 1360, 544, 430)
    q += sun(265, 200, 60) + moon(759, 200, 54)
    hm, he = 9 * 64 + 8 * 26, 9 * 64 + 8 * 26 * .45
    q += spine(265, 1330 - hm, 1.0, squash=0) + spine(759, 1330 - he, 1.0, squash=1)
    q += path(f'M110 {1330 - hm}H914', stroke=TEAL, w=6, extra='stroke-dasharray="14 12"') + path('M110 1340H914', stroke='#C9BBA8', w=8)
    q += arrow(850, 1330 - hm, 850, 1330 - he, CORAL, 6)
    q += mascot(512, 1400, .42)
    return q


def l01_e6():
    q = panel(80, 760)
    for r in range(4):
        for c in range(6):
            n = r * 6 + c
            if n >= 23:
                continue
            cx, cy = 150 + c * 145, 220 + r * 170
            q += chromo(cx - 22, cy, .55, MOM, '#B8462F') + chromo(cx + 22, cy, .55, DAD, '#2E6AA3')
    q += panel(880, 560)
    cols = ['#FF8A6B', '#FFC93C', '#2BB3A3', '#7FB8E0', '#B07CD8', '#7BBF4A']
    q += path('M140 1380H900M140 1380V940', stroke=C, w=5)
    for i, col in enumerate(cols):
        d = f'M150 {1350 - i * 4}C350 {1180 - i * 6} 600 {1040 - i * 5} 890 {980 - i * 4}'
        q += path(d, stroke=col, w=7)
    q += mascot(860, 1420, .38)
    return q


DIAGRAMS = {
    'U10.L01-E1': l01_e1, 'U10.L01-E2': l01_e2, 'U10.L01-E3': l01_e3, 'U10.L01-E4': l01_e4, 'U10.L01-E5': l01_e5, 'U10.L01-E6': l01_e6,
}

render = u09.render
def record(made):
    u09.ART_SAVE = u09.ART
    u09.ART = ART
    try:
        u09.record(made)
    finally:
        u09.ART = u09.ART_SAVE

if __name__ == '__main__':
    u09.HERE = HERE
    args = sys.argv[1:]
    preview = None
    if args and args[0].startswith('--preview='):
        preview = args.pop(0).split('=', 1)[1]
    names = args or list(DIAGRAMS)
    made = render([(n, DIAGRAMS[n]()) for n in names], preview)
    if not preview:
        record(made)
        for fn, d in made:
            print(fn, len(d) // 1024, 'KB')
