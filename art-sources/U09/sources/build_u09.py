# -*- coding: utf-8 -*-
"""رسوم الوحدة U09 التعليمية (SVG ← WebP 1024×1536) بأسلوب رسوم U06–U08 المتجهية نفسه.
الاستعمال: python3 art-sources/U09/sources/build_u09.py [--preview=مجلد] [أسماء…]   (بلا أسماء: كلها)
يكتب المصدر في art-sources/U09/sources/<الاسم>.svg والصورة في app/v2/img/<الاسم>.webp، ويُحدّث status.csv وchecksums.json.
الأدوات المشتركة من build_u07.py وbuild_u08.py. لا كتابة ولا أرقام داخل الرسوم، ولا تشبيه حربي للخلايا (M18): كرات لطيفة بلا أسلحة.
"""
from pathlib import Path
import math, sys, io, json, hashlib, csv, importlib.util

HERE = Path(__file__).resolve().parent
ART = HERE.parent
REPO = ART.parent.parent
IMG = REPO / 'app' / 'v2' / 'img'
def _load(name, p):
    sp = importlib.util.spec_from_file_location(name, p); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m
u07 = _load('u07', REPO / 'art-sources' / 'U07' / 'sources' / 'build_u07.py')
u08 = _load('u08', REPO / 'art-sources' / 'U08' / 'sources' / 'build_u08.py')
path, circ, ellipse, rect, group, arrow, face, mascot, panel = u07.path, u07.circ, u07.ellipse, u07.rect, u07.group, u07.arrow, u07.face, u07.mascot, u07.panel
rbc, brain, magnifier, boy, drop = u07.rbc, u07.brain, u07.magnifier, u07.boy, u07.drop
kid_front, brain_side, sun, moon = u08.kid_front, u08.brain_side, u08.sun, u08.moon
C, TEAL, RED, SKIN, SKINS = u07.C, u07.TEAL, u07.RED, u07.SKIN, u07.SKINS
NERVE, NERVES, BLUE, GREEN, CORAL = u08.NERVE, u08.NERVES, u08.BLUE, u08.GREEN, u08.CORAL
EPI, EPIS, BAS = '#F7D9BE', '#C99A7E', '#F1C3A0'
DER, DERS, FAT, FATS = '#F6C7C3', '#C98A86', '#FBE7A8', '#D9B860'
MEL = '#6B4226'; WCELL = '#F4F1FF'; WCS = '#8E84C2'; GERM = '#86C96B'; GERMS = '#4F8E3C'; VIR = '#B07CD8'; VIRS = '#6E3FA0'
defs = u08.defs.replace('</defs>', '''<linearGradient id="hot" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#FFD3A1"/><stop offset="1" stop-color="#FFF1D9"/></linearGradient>
<linearGradient id="cold" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#CFE8FA"/><stop offset="1" stop-color="#F2F9FF"/></linearGradient>
<radialGradient id="warm"><stop stop-color="#FF8A6B" stop-opacity=".55"/><stop offset="1" stop-color="#FF8A6B" stop-opacity="0"/></radialGradient>
<radialGradient id="shield"><stop offset=".7" stop-color="#BFE7FF" stop-opacity="0"/><stop offset="1" stop-color="#7FC8EE" stop-opacity=".55"/></radialGradient>
</defs>''')


# ———— أدوات U09 ————
def section(x, y, w=760, h=620, ves='normal', sweat=False, hair_up=False, mel=.25, flakes=True, melcells=0, bumps=False, thick=1.0, scar=False):
    """مقطع جلد: البشرة (خلايا مسطحة فوق ومستديرة تحت) ثم الأدمة ثم طبقة الدهن. الإحداثيات من (x,y) يساراً أعلى."""
    he = h * .2 * thick; hd = h * .5; hf = h - he - hd
    q = rect(0, 0, w, h, FAT, FATS, 4, 18)
    q += rect(0, 0, w, he + hd, DER, DERS, 4, 18)
    for i in range(int(w // 46)):  # الدهن: كرات
        for j in range(2):
            q += circ(30 + i * 46 + (j * 23), he + hd + 28 + j * (hf - 56) / 1.4, 20, '#FDF0C4', FATS, 2)
    for k in range(5):  # ألياف الأدمة
        yy = he + 40 + k * hd / 5.5
        q += path(f'M20 {yy:.0f}' + ''.join(f'q30 -14 60 0t60 0' for _ in range(int(w / 120))), stroke='#E9A9A4', w=3)
    # البشرة
    q += rect(0, 0, w, he, EPI, EPIS, 4, 14)
    nb = int(w // 52)
    for i in range(nb):  # خلايا القاعدة المستديرة
        cx = 26 + i * 52
        q += circ(cx, he - 26, 22, BAS, EPIS, 2.5) + circ(cx, he - 26, 7, '#C98A6A')
        if mel and (i % max(1, int(1 / max(mel, .01)))) == 0:
            for t in range(int(3 + mel * 8)):
                q += circ(cx - 12 + (t * 7) % 24, he - 44 + (t * 5) % 10, 3.5, MEL)
    if melcells:  # الخلايا الصانعة للميلانين (نجمية) بعدد ثابت
        for i in range(melcells):
            cx = w * (i + .5) / melcells
            q += group(path('M0 -14L6 -4L18 -6L9 4L14 16L0 9L-14 16L-9 4L-18 -6L-6 -4Z', '#8A5A3A', '#4E3020', 2), cx, he - 8)
    rows = max(1, int(he / 40) - 1)
    for r in range(rows):  # خلايا مسطحة فوقها
        yy = 12 + r * (he - 60) / max(1, rows)
        for i in range(int(w // 70)):
            q += ellipse(35 + i * 70 + (r % 2) * 35, yy + 8, 32, 8 + r * 2, '#FBE6D2', EPIS, 2)
    if flakes:
        for fx, fy, a in [(.18, -26, -12), (.4, -42, 8), (.66, -22, -6), (.83, -50, 14)]:
            q += group(ellipse(0, 0, 26, 6, '#FBE6D2', EPIS, 2), w * fx, fy, 1, a)
    # وعاء دموي (عروة)
    vw = {'normal': 14, 'wide': 26, 'narrow': 6}[ves]
    vx = w * .28
    q += path(f'M{vx - 40:.0f} {he + hd}C{vx - 40:.0f} {he + 60:.0f} {vx + 40:.0f} {he + 60:.0f} {vx + 40:.0f} {he + hd}', stroke='#A8333B', w=vw + 6) + path(f'M{vx - 40:.0f} {he + hd}C{vx - 40:.0f} {he + 60:.0f} {vx + 40:.0f} {he + 60:.0f} {vx + 40:.0f} {he + hd}', stroke=RED, w=vw)
    # عصب
    nx = w * .5
    q += path(f'M{nx:.0f} {he + hd}C{nx - 20:.0f} {he + hd * .6:.0f} {nx + 30:.0f} {he + hd * .4:.0f} {nx + 10:.0f} {he + 30:.0f}M{nx + 6:.0f} {he + hd * .45:.0f}l-46 -40', stroke=NERVES, w=10) + path(f'M{nx:.0f} {he + hd}C{nx - 20:.0f} {he + hd * .6:.0f} {nx + 30:.0f} {he + hd * .4:.0f} {nx + 10:.0f} {he + 30:.0f}M{nx + 6:.0f} {he + hd * .45:.0f}l-46 -40', stroke=NERVE, w=6)
    # غدة عرق ملتفة وقناتها
    gx = w * .72; gy = he + hd - 50
    coil = ''.join(f'<circle cx="{gx + math.cos(t / 2) * 26:.0f}" cy="{gy + math.sin(t / 2) * 16:.0f}" r="12" fill="#FFF7E8" stroke="#7FA9C8" stroke-width="5"/>' for t in range(12))
    q += coil + path(f'M{gx:.0f} {gy - 20:.0f}C{gx - 20:.0f} {gy - 90:.0f} {gx + 20:.0f} {he + 40:.0f} {gx:.0f} 0', stroke='#7FA9C8', w=7)
    if sweat:
        for k, (dx, dy) in enumerate([(0, -40), (-60, -70), (50, -90), (-20, -130)]):
            q += drop(gx + dx, dy, .7 - k * .08)
        q += path(f'M{gx - 80:.0f} -170q16 -18 0 -36t0 -36M{gx:.0f} -190q16 -18 0 -36t0 -36M{gx + 70:.0f} -170q16 -18 0 -36t0 -36', stroke='#9CC8EA', w=6)
    # بصيلة شعرة وعضلتها
    hx = w * .9
    ang = -30 if hair_up else -60
    q += path(f'M{hx - 30:.0f} {he + hd - 40:.0f}L{hx - 5:.0f} {he * .5:.0f}', '#F8E3CF', EPIS, 26) + path(f'M{hx - 30:.0f} {he + hd - 40:.0f}L{hx - 5:.0f} {he * .5:.0f}', stroke='#5A4030', w=6)
    q += group(path(f'M0 0L{140 * math.cos(math.radians(ang)):.0f} {140 * math.sin(math.radians(ang)):.0f}', stroke='#5A4030', w=7), hx - 5, 0)
    q += path(f'M{hx - 22:.0f} {he + hd * .55:.0f}L{hx - 80:.0f} {he + 18:.0f}', stroke='#C96B6B', w=12 if hair_up else 8)
    q += ellipse(hx - 46, he + hd * .55, 18, 12, '#FFE9A8', '#C9A040', 3)
    if bumps:
        q += path(f'M{hx - 60:.0f} 0Q{hx - 10:.0f} -34 {hx + 40:.0f} 0', '#F7D9BE', EPIS, 4)
    if scar:
        q += path(f'M{w * .1:.0f} 0L{w * .25:.0f} {he + hd * .7:.0f}L{w * .4:.0f} 0Z', '#FBEDEA', '#D9B3AE', 3)
        for k in range(5):
            q += path(f'M{w * .14 + k * 14:.0f} {20 + k * 8}L{w * .2 + k * 10:.0f} {he + hd * .5:.0f}', stroke='#E6C7C2', w=4)
    return group(q, x, y)

def germ(x, y, s=1, col=GERM, st=GERMS, face_on=True, angle=0):
    q = path('M-40 -10C-50 -40 -20 -56 0 -46C20 -60 52 -40 44 -12C62 6 46 40 18 40C2 56 -30 50 -36 30C-58 22 -58 -2 -40 -10Z', col, st, 4)
    for a in range(0, 360, 60):
        r = math.radians(a)
        q += circ(52 * math.cos(r), 50 * math.sin(r), 7, col, st, 3)
    if face_on:
        q += circ(-12, -6, 6, '#FFFFFF') + circ(12, -6, 6, '#FFFFFF') + circ(-11, -5, 3, '#333') + circ(13, -5, 3, '#333') + path('M-10 14Q0 6 10 14', stroke='#333', w=3)
    return group(q, x, y, s, angle)

def virus(x, y, s=1):
    q = ''
    for a in range(0, 360, 30):
        r = math.radians(a)
        q += path(f'M{30 * math.cos(r):.0f} {30 * math.sin(r):.0f}L{46 * math.cos(r):.0f} {46 * math.sin(r):.0f}', stroke=VIRS, w=5) + circ(48 * math.cos(r), 48 * math.sin(r), 6, '#E3A6F2', VIRS, 2)
    q += circ(0, 0, 32, VIR, VIRS, 4) + circ(-10, -8, 4, '#FFFFFF') + circ(10, -8, 4, '#FFFFFF') + path('M-8 8Q0 2 8 8', stroke='#FFFFFF', w=3)
    return group(q, x, y, s)

def bacterium(x, y, s=1, angle=0):
    q = path('M60 0q30 -14 50 6t40 0', stroke=GERMS, w=4) + rect(-70, -30, 140, 60, GERM, GERMS, 4, 30)
    q += circ(-30, -6, 6, '#FFFFFF') + circ(-8, -6, 6, '#FFFFFF') + circ(-29, -5, 3, '#333') + circ(-7, -5, 3, '#333') + path('M-30 12Q-19 4 -8 12', stroke='#333', w=3)
    return group(q, x, y, s, angle)

def wcell(x, y, s=1, inner=''):
    """خلية بيضاء لطيفة (لا جندي ولا سلاح): كرة غير منتظمة ونواة مفصّصة ووجه."""
    q = path('M-80 -10C-90 -60 -40 -92 0 -82C46 -96 92 -56 84 -8C98 40 56 84 8 80C-40 96 -94 56 -80 -10Z', WCELL, WCS, 5)
    q += path('M-34 -40C-50 -20 -40 4 -20 0C-4 -4 4 14 20 10C38 6 40 -20 26 -32C12 -46 -14 -54 -34 -40Z', '#D9D2F7', WCS, 3) + inner
    q += face(0, 30, .9)
    return group(q, x, y, s)

def antibody(x, y, s=1, angle=0, col='#2E9E6A'):
    q = path('M0 40V0L-28 -34M0 0L28 -34', stroke=col, w=10) + circ(-30, -36, 9, col) + circ(30, -36, 9, col)
    return group(q, x, y, s, angle)

def hand(x, y, s=1, angle=0, col=SKIN, st=SKINS):
    q = path('M-50 60V-10C-50 -30 -34 -36 -26 -20V-60C-26 -82 -4 -82 -4 -60V-74C-4 -96 18 -96 18 -74V-60C18 -82 40 -82 40 -60V-20C40 -40 62 -40 62 -18V30C62 70 30 96 -6 96C-34 96 -50 82 -50 60Z', col, st, 5)
    return group(q, x, y, s, angle)

def tap(x, y, s=1, flow=True):
    q = rect(-20, -90, 120, 34, '#B9C4CE', '#6E7C88', 4, 12) + rect(70, -100, 34, 120, '#B9C4CE', '#6E7C88', 4, 12) + rect(-34, -60, 40, 50, '#B9C4CE', '#6E7C88', 4, 10)
    if flow:
        q += rect(-26, -12, 24, 240, '#BFE3FB', '#6FB3EA', 3, 12, 'opacity=".9"')
    return group(q, x, y, s)

def clock(x, y, r=60):
    q = circ(0, 0, r, '#FFFFFF', C, 6)
    for i in range(12):
        a = math.radians(i * 30)
        q += circ(r * .78 * math.cos(a), r * .78 * math.sin(a), 4, C)
    q += path(f'M0 0L0 {-r * .6:.0f}M0 0L{r * .45:.0f} 0', stroke=C, w=6)
    return group(q, x, y)

def tree(x, y, s=1):
    return group(rect(-18, 0, 36, 220, '#9A6A44', '#6E4A2E', 4, 8) + circ(0, -20, 120, '#8CCB7A', '#5E9A4E', 5) + circ(-80, 30, 80, '#8CCB7A', '#5E9A4E', 5) + circ(80, 30, 80, '#8CCB7A', '#5E9A4E', 5), x, y, s)

def snow(x, y, s=1, col='#7FB8E0'):
    q = ''.join(path(f'M0 0L{40 * math.cos(math.radians(a)):.0f} {40 * math.sin(math.radians(a)):.0f}', stroke=col, w=7) for a in range(0, 360, 60))
    return group(q, x, y, s)

def dial(x, y, s=1, angle=0):
    """قرص ضبط بلا أرقام: نصف دائرة أزرق ← أحمر ومؤشر."""
    q = path('M-90 0A90 90 0 0 1 0 -90', stroke='#7FB8E0', w=22) + path('M0 -90A90 90 0 0 1 90 0', stroke=CORAL, w=22)
    q += group(path('M0 0L0 -74', stroke=C, w=9), 0, 0, 1, angle) + circ(0, 0, 14, C)
    return group(q, x, y, s)

def bottle(x, y, s=1):
    return group(rect(-26, -70, 52, 140, '#BFE3FB', '#4C8FC2', 4, 18) + rect(-16, -92, 32, 26, TEAL, C, 3, 6) + rect(-26, -20, 52, 40, '#FFFFFF', 'none', 0, 4, 'opacity=".55"'), x, y, s)

def sit_kid(x, y, s=1, girl=False, flushed=False, tired=False):
    """طفل جالس على الأرض بسيط."""
    shirt = '#F49AC1' if girl else '#9ECDE4'
    q = path('M-60 120L-120 140M60 120L120 140', stroke='#314869', w=44) + ellipse(-130, 146, 30, 14, '#3D6379', C) + ellipse(130, 146, 30, 14, '#3D6379', C)
    q += path('M-70 -30Q0 -56 70 -30L80 120Q0 140 -80 120Z', shirt, '#43687F', 4)
    q += circ(0, -100, 64, '#DDA16E', '#805238', 3) + face(0, -92, 1.2)
    if girl:
        q += path('M-62 -120Q0 -190 62 -120', '#3A2A24', '#352724', 3) + path('M-62 -110q-18 40 -6 80M62 -110q18 40 6 80', stroke='#3A2A24', w=16)
    else:
        for xx, yy in [(-50, -140), (-26, -160), (0, -166), (26, -160), (50, -140)]:
            q += circ(xx, yy, 22, '#45312B', '#352724', 2)
    if flushed:
        q += circ(-34, -80, 14, '#F08A7E', extra='opacity=".7"') + circ(34, -80, 14, '#F08A7E', extra='opacity=".7"')
    if tired:
        q += path('M-30 -190q15 -20 30 0t30 0', stroke='#8E84C2', w=5) + path('M-40 -210a20 12 0 1 0 40 0a10 6 0 1 0 -20 0', stroke='#8E84C2', w=4)
    return group(q, x, y, s)

def ring(cx, cy, R, kinds, r=30):
    """دائرة أشخاص: kinds قائمة من 'red' و'blue' و'grey' و'empty'."""
    col = {'red': (RED, '#A8333B'), 'blue': ('#5DA9E9', '#2E6AA3'), 'grey': ('#E9E2D6', '#9A8F80'), 'empty': ('#FFFFFF', '#C9BBA8')}
    q = circ(cx, cy, R, 'none', '#E9D5B8', 4, 'stroke-dasharray="10 10"')
    n = len(kinds)
    for i, k in enumerate(kinds):
        a = -math.pi / 2 + 2 * math.pi * i / n
        x, y = cx + R * math.cos(a), cy + R * math.sin(a)
        q += circ(x, y, r, *col[k], 4)
        q += circ(x - 8, y - 4, 4, '#333') + circ(x + 8, y - 4, 4, '#333') + path(f'M{x - 8:.0f} {y + 9:.0f}Q{x:.0f} {y + (3 if k == "red" else 15):.0f} {x + 8:.0f} {y + 9:.0f}', stroke='#333', w=3)
        if k == 'grey':
            q += circ(x, y, r + 14, 'url(#shield)')
    return q


# ———— U09.L01: الجلد ————
def l01_e1():
    q = kid_front(x=-40, y=60, s=.62) + path('M200 180Q280 150 360 200', stroke=TEAL, w=6, extra='stroke-dasharray="10 12"')
    q += circ(275, 330, 210, 'url(#glow)', extra='opacity=".35"')
    q += arrow(470, 520, 600, 640)
    q += rect(560, 640, 360, 640, '#F7D9BE', '#C99A7E', 6, 40) + path('M600 700h280M600 760h280M600 820h280', stroke='#E9C5A6', w=5)  # الجلد مفروداً
    q += rect(540, 1270, 400, 40, '#B07A4E', '#7A5232', 4, 10) + rect(540, 610, 30, 700, '#B07A4E', '#7A5232', 4, 10) + rect(910, 610, 30, 700, '#B07A4E', '#7A5232', 4, 10)
    q += rect(580, 660, 120, 70, '#FFFFFF', '#C9BBA8', 4, 30)
    q += mascot(190, 1300, .7)
    return q

def l01_e2():
    q = hand(200, 380, 1.4, -10) + magnifier(560, 280, 150, rect(-150, -150, 300, 300, DER, rx=0) + rect(-150, -150, 300, 90, EPI, rx=0))
    q += path('M250 330L420 300', stroke='#C9BBA8', w=5, extra='stroke-dasharray="12 12"') + path('M600 420L560 580', stroke='#C9BBA8', w=5, extra='stroke-dasharray="12 12"')
    q += section(130, 620, 780, 700, flakes=True)
    for k in range(3):  # الخلايا تصعد
        q += arrow(170 + k * 260, 760, 170 + k * 260, 660, TEAL, 6)
    q += mascot(860, 1420, .45)
    return q

def l01_e3():
    q = panel(80, 440) + section(120, 230, 520, 260, flakes=False)
    for x in [180, 300, 420, 540]:
        q += germ(x, 150, .5) + path(f'M{x} 190l-14 20M{x} 190l14 20', stroke='#9A8F80', w=4)
    q += drop(700, 300, 1.2) + path('M640 380L760 380', stroke=TEAL, w=8) + drop(760, 470, .9) + path('M700 520l40 -40', stroke=RED, w=6)
    q += panel(560, 420) + hand(260, 790, 1.2, 20) + rect(380, 690, 130, 170, '#FFFFFF', '#C9BBA8', 5, 20) + path('M410 680q10 -30 0 -50M450 680q10 -30 0 -50', stroke=CORAL, w=6)
    q += path('M300 770C380 760 420 860 560 870C660 880 700 820 780 820', stroke=NERVES, w=12) + path('M300 770C380 760 420 860 560 870C660 880 700 820 780 820', stroke=NERVE, w=7) + brain(840, 800, .7, glow=True)
    q += panel(1020, 400) + rect(120, 1180, 780, 140, FAT, FATS, 4, 20)
    for i in range(14):
        q += circ(160 + i * 54, 1250, 22, '#FDF0C4', FATS, 2)
    q += circ(500, 1100, 50, '#FF8A6B', '#C9573F', 5) + path('M500 1150v20', stroke='#C9573F', w=6) + path('M430 1180q70 30 140 0', stroke='#E8B04A', w=6)
    q += mascot(880, 1360, .45)
    return q

def l01_e4():
    q = sun(512, 150, 70)
    for x in range(180, 900, 90):
        q += path(f'M{x} 230L{x} 420', stroke='#FFC93C', w=6, extra='stroke-dasharray="16 12"')
    q += section(70, 430, 420, 420, mel=.15, melcells=4, flakes=False) + section(534, 430, 420, 420, mel=1.0, melcells=4, flakes=False)
    for x, stop in [(150, 520), (260, 560), (370, 500), (620, 455), (730, 455), (850, 455)]:
        q += path(f'M{x} 420L{x} {stop}', stroke='#FFB020', w=6)
    q += hand(280, 1010, .9, 0, '#F2D3B3', '#B68B72') + hand(745, 1010, .9, 0, '#8A5A3A', '#5E3A22') + path('M380 1010h264', stroke=TEAL, w=6, extra='stroke-dasharray="14 12"')
    q += panel(1150, 330)
    q += group(ellipse(0, 40, 120, 24, '#E8B04A', '#B8862A', 4) + path('M-60 40Q-60 -40 0 -40Q60 -40 60 40', '#FFC93C', '#B8862A', 4), 210, 1300)
    q += group(path('M-130 0Q0 -110 130 0Z', CORAL, '#B8462F', 5) + path('M0 -40V150', stroke='#7A5232', w=8), 512, 1290)
    q += group(path('M-70 -60L-110 0L-80 20L-60 -10V110H60V-10L80 20L110 0L70 -60Q0 -80 -70 -60Z', '#9ECDE4', '#43687F', 5), 810, 1310)
    return q

def l01_e5():
    cells = []
    for i, (yy) in enumerate([110, 450, 790, 1130]):
        q = panel(yy, 310) + rect(90, yy + 150, 844, 120, DER, DERS, 3, 10) + rect(90, yy + 110, 844, 40, EPI, EPIS, 3, 10)
        cells.append(q)
    q = ''.join(cells)
    q += path('M380 260L640 260L600 300L420 300Z', '#FBE6D2', '#D98880', 4) + drop(470, 230, .5, RED, '#A8333B') + drop(560, 220, .4, RED, '#A8333B')
    q += path('M380 600L640 600L600 640L420 640Z', '#F0A3A0', '#A8333B', 4)
    for k in range(9):
        q += path(f'M{400 + k * 26} 600l20 40M{620 - k * 26} 600l-20 40', stroke='#A8333B', w=3) + rbc(410 + k * 26, 620, .35)
    q += path('M370 930Q510 880 650 930L610 970H410Z', '#8B4A3A', '#5E2E22', 5) + circ(330, 960, 60, 'url(#warm)') + circ(690, 960, 60, 'url(#warm)')
    for x in [440, 520, 590]:
        q += wcell(x, 1010, .25)
    q += path('M380 1250Q510 1180 640 1240', '#8B4A3A', '#5E2E22', 5, 'transform="rotate(-8 510 1230)"') + rect(380, 1265, 260, 30, '#F6D0BC', EPIS, 3, 8)
    for k in range(4):
        q += arrow(400 + k * 70, 1330, 420 + k * 70, 1285, TEAL, 5)
    q += group(rect(-110, -40, 220, 80, '#F6D6B0', '#B68B72', 4, 30) + rect(-40, -36, 80, 72, '#FFFFFF', '#D9C3A8', 3, 10), 830, 1300, .8)
    return q

def l01_e6():
    q = panel(80, 520) + section(110, 160, 360, 380, thick=.6, flakes=True) + section(554, 120, 360, 440, thick=1.8, flakes=True)
    q += group(path('M-40 -100C-80 -60 -70 40 -40 90C-20 110 40 110 50 80C70 20 60 -60 20 -100Z', '#F2D3B3', SKINS, 5), 740, 690, .9)
    q += group(path('M-80 0Q0 -40 80 0Q60 40 0 40Q-60 40 -80 0Z', '#F2D3B3', SKINS, 5), 290, 650)
    q += panel(780, 300)
    for k in range(5):
        x = 150 + k * 170
        q += ellipse(x, 930, 60 - k * 4, 40 - k * 6, ['#F1C3A0', '#F4CFAE', '#F7DCBF', '#F9E5C8', '#F5E7B0'][k], EPIS, 3) + (circ(x, 930, 10, '#C98A6A') if k < 3 else '')
        if k < 4:
            q += arrow(x + 50, 930, x + 115, 930, TEAL, 5)
    q += panel(1120, 350) + section(110, 1170, 800, 300, scar=True, flakes=False)
    q += mascot(880, 1380, .38)
    return q


# ———— U09.L02: الحرارة ————
def l02_e1():
    q = rect(0, 0, 512, 1536, 'url(#hot)', rx=0) + rect(512, 0, 512, 1536, 'url(#cold)', rx=0)
    q += sun(150, 170, 70) + snow(880, 170, 1.2) + snow(760, 300, .6) + snow(940, 380, .5)
    q += head_big(512, 640)
    q += arrow(420, 860, 250, 1040, CORAL) + arrow(604, 860, 774, 1040, BLUE)
    q += group(path('M-30 -40q20 -30 0 -60', stroke='#9CC8EA', w=7) + drop(0, 10, 1.1), 230, 1160)
    q += group(path('M-60 -20l20 -20l20 20l20 -20l20 20l20 -20', stroke=BLUE, w=8) + path('M-60 30l20 -20l20 20l20 -20l20 20l20 -20', stroke=BLUE, w=8), 790, 1160)
    q += mascot(512, 1400, .5)
    return q

def head_big(x, y):
    q = circ(0, 0, 230, SKIN, SKINS, 6) + brain(0, -40, 1.3) + circ(0, 90, 60, 'url(#glow)') + dial(0, 120, .55, 0)
    return group(q, x, y)

def l02_e2():
    q = rect(50, 60, 924, 300, 'url(#hot)', rx=32) + sun(860, 170, 60) + sit_kid(300, 210, .75, flushed=True)
    q += section(110, 560, 800, 620, ves='wide', sweat=True)
    for k in range(4):
        q += path(f'M{200 + k * 180} 1250q14 -20 0 -40t0 -40', stroke=CORAL, w=7)
    q += mascot(880, 1390, .45)
    return q

def l02_e3():
    q = rect(50, 60, 924, 300, 'url(#cold)', rx=32) + snow(860, 170, 1.1) + snow(740, 260, .6)
    q += group(sit_kid(0, 0, 1) + path('M-150 -60l-20 -16M-150 0l-24 0M150 -60l20 -16M150 0l24 0', stroke=BLUE, w=6), 300, 210, .75)
    q += section(110, 470, 800, 560, ves='narrow', hair_up=True, bumps=True, flakes=False)
    q += panel(1080, 300) + group(path('M-120 -60Q-160 0 -120 60H120Q160 0 120 -60Z', '#F3B27A', '#B0703D', 5) + path('M-100 -20l20 -20l20 20l20 -20l20 20l20 -20l20 20l20 -20l20 20l20 -20', stroke=CORAL, w=6), 300, 1230)
    q += group(path('M-90 -90L-130 0L-100 20L-80 -10V110H80V-10L100 20L130 0L90 -90Q0 -110 -90 -90Z', '#5DA9E9', '#2E6AA3', 5), 720, 1230)
    for dx, dy in [(-40, 0), (20, 40), (40, -30), (-20, 60)]:
        q += circ(720 + dx, 1230 + dy, 10, '#FF8A6B', extra='opacity=".7"')
    return q

def l02_e4():
    q = head_big(300, 330)
    q = group(circ(0, 0, 230, SKIN, SKINS, 6) + brain(0, -40, 1.3) + circ(0, 90, 60, 'url(#glow)') + dial(0, 120, .55, 50), 300, 330)
    q += germ(720, 200, .7) + virus(860, 330, .7) + wcell(740, 430, .6)
    q += rect(150, 720, 724, 360, '#BFE7FF', '#7FA9C8', 5, 60) + sit_kid(512, 760, .7) + rect(160, 840, 704, 240, '#F49A8C', '#C9573F', 5, 50)
    q += circ(512, 880, 140, 'url(#warm)') + path('M330 760l-20 -14M690 760l20 -14', stroke=BLUE, w=6)
    q += group(u07.cup(0, 0, .9, '#D8EDFB'), 860, 1000)
    q += mascot(180, 1350, .5)
    return q

def l02_e5():
    q = rect(50, 60, 924, 700, 'url(#hot)', rx=32) + sun(860, 180, 80)
    q += path('M120 700Q300 640 500 700', stroke='#E8B04A', w=8) + tree(300, 380, 1)
    q += ellipse(300, 720, 220, 40, '#E9D5B8', extra='opacity=".7"') + sit_kid(320, 620, .55, tired=True)
    q += bottle(430, 640, .7) + arrow(760, 600, 560, 640, CORAL)
    q += group(sit_kid(0, 0, 1, flushed=True), 820, 560, .45)
    q += panel(860, 300)
    for k, x in enumerate([200, 400, 600, 800]):
        q += circ(x, 1000, 80, '#FFFDF6', '#E9D5B8', 4)
    q += group(tree(0, 0, .35), 200, 1000) + bottle(400, 1000, .8) + group(path('M-50 20Q-60 -40 0 -40Q60 -40 50 20Z', '#FFFFFF', '#9ECDE4', 4), 600, 1010) + group(kid_front(s=.16), 760, 900)
    q += mascot(880, 1420, .45)
    return q

def l02_e6():
    q = head_big_side(512, 420)
    sites = [(200, 1000), (420, 1000), (620, 1000), (820, 1000)]
    for i, (x, y) in enumerate(sites):
        q += circ(x, y, 90, '#FFFDF6', '#E9D5B8', 4)
    q += group(path('M-40 0Q0 30 40 0', stroke=C, w=6) + rect(-8, -50, 16, 60, '#FFFFFF', C, 3, 6), 200, 1000)
    q += group(path('M-20 -50C40 -60 50 40 0 50C-30 50 -20 10 0 0', '#F2D3B3', SKINS, 5) + rect(10, -10, 50, 14, '#FFFFFF', C, 3, 6), 420, 1000)
    q += group(path('M-60 0Q0 -60 60 0', '#F2D3B3', SKINS, 5) + rect(-25, -40, 50, 20, '#FFFFFF', C, 3, 8), 620, 1020)
    q += group(path('M-50 -40Q0 -60 50 -40L40 40H-40Z', '#9ECDE4', '#43687F', 4) + rect(30, -10, 50, 14, '#FFFFFF', C, 3, 6), 820, 1000)
    q += rect(240, 1180, 540, 220, '#FFFFFF', '#C9BBA8', 5, 20)
    for r in range(6):
        q += path(f'M270 {1210 + r * 32}' + ''.join(f'l{12} {(-6 if k % 2 else 6)}' for k in range(38)), stroke='#9A8F80', w=3)
    return q

def head_big_side(x, y):
    q = u07.head_profile(0, 0, 2.2) if hasattr(u07, 'head_profile') else ''
    q += group(brain_side(0, 0, 1.2, op=.9), -40, -60) + circ(-30, 40, 46, 'url(#glow)') + circ(-30, 40, 16, CORAL, '#B8462F', 3)
    return group(q, x, y)


# ———— U09.L03: الدفاع ————
def l03_e1():
    q = panel(80, 620) + circ(512, 390, 260, '#FDE8D8', '#D9A58A', 6) + circ(512, 390, 80, '#E8B9A0', '#B98068', 4)
    q += bacterium(260, 620, 1.1, -15) + virus(700, 600, .55) + virus(760, 660, .4)
    q += panel(740, 640) + circ(300, 1060, 200, '#FDE8D8', '#D9A58A', 6) + circ(300, 1060, 60, '#E8B9A0', '#B98068', 4)
    q += virus(160, 900, .6) + arrow(200, 940, 250, 980, VIRS, 6)
    for k, (dx, dy) in enumerate([(-40, 120), (40, 120), (100, 40), (-110, 30), (0, -100)]):
        q += virus(300 + dx, 1060 + dy, .35)
    q += arrow(520, 1060, 640, 1060, VIRS)
    for k, (dx, dy) in enumerate([(0, 0), (80, -70), (130, 40), (40, 110), (190, -20)]):
        q += virus(700 + dx, 1060 + dy, .45)
    return q

def l03_e2():
    q = group(kid_front(s=1), -10, 40, 1.02)
    q += path('M380 260Q512 130 644 260', stroke=TEAL, w=10, extra='stroke-dasharray="20 14" opacity=".6"')
    q += magnifier(840, 260, 130, rect(-130, -130, 260, 260, '#F6C7C3', rx=0) + ''.join(path(f'M{-120 + k * 30} 130Q{-110 + k * 30} 60 {-100 + k * 30} 40', stroke='#C98A86', w=6) for k in range(9)) + path('M-130 -40Q0 -10 130 -60', '#C9E7A6', '#6E9A4E', 5) + germ(-20, -80, .45))
    q += path('M560 230L720 250', stroke='#C9BBA8', w=5, extra='stroke-dasharray="12 12"')
    q += group(drop(0, 0, .8), 470, 230) + path('M470 260v40', stroke='#6FB3EA', w=6)
    q += magnifier(200, 640, 120, rect(-120, -120, 240, 240, '#F7C4A8', rx=0) + ''.join(circ(-60 + k * 40, -20 + (k % 2) * 50, 12, '#FFE98A', '#C9952B', 3) for k in range(5)) + germ(10, 40, .45, '#B9B9B9', '#7A7A7A'))
    q += path('M330 660L470 620', stroke='#C9BBA8', w=5, extra='stroke-dasharray="12 12"')
    q += group(path('M-40 -20L40 20', stroke=RED, w=12) + germ(30, -40, .4), 430, 1040)
    q += hand(700, 340, .7, -30) + germ(720, 280, .35)
    return q

def l03_e3():
    q = group(hand(0, 0, 1.6, 0), 220, 360) + path('M210 210L250 300', stroke='#8B5A2B', w=14) + circ(230, 250, 70, 'url(#warm)')
    q += path('M300 300L470 520', stroke='#C9BBA8', w=5, extra='stroke-dasharray="12 12"')
    q += rect(90, 520, 844, 780, DER, DERS, 5, 40) + rect(90, 520, 844, 110, EPI, EPIS, 5, 30)
    q += path('M480 480L540 760', stroke='#8B5A2B', w=26)
    for (x, y) in [(470, 740), (560, 700), (610, 800)]:
        q += germ(x, y, .35)
    q += path('M120 1150C300 1080 700 1080 900 1150', stroke='#A8333B', w=96) + path('M120 1150C300 1080 700 1080 900 1150', stroke=RED, w=80)
    for x in range(160, 900, 110):
        q += rbc(x, 1120 + (x % 3) * 10, .6)
    q += wcell(300, 1000, .55) + arrow(340, 960, 420, 860, TEAL) + wcell(450, 850, .55, germ(0, -10, .3)) + wcell(700, 880, .55, germ(10, -6, .3)) + arrow(650, 1000, 690, 940, TEAL)
    q += circ(520, 760, 260, 'url(#warm)')
    q += mascot(880, 1390, .45)
    return q

def l03_e4():
    q = panel(80, 620) + wcell(240, 330, 1.1)
    for k in range(6):
        a = -50 + k * 22
        q += antibody(420 + k * 50, 260 + (k % 2) * 80, .8, a)
    q += group(path('M-60 -40L-30 -60L0 -40L30 -60L60 -40V40H-60Z', GERM, GERMS, 4), 820, 340) + antibody(820, 260, 1, 180)
    q += path('M770 260h100', stroke='#2E9E6A', w=4, extra='stroke-dasharray="8 8"')
    q += panel(740, 640)
    for k in range(3):
        q += sun(130 + k * 130, 850, 22) + moon(130 + k * 130, 940, 20)
    q += sit_kid(300, 1150, .6, tired=True)
    q += path('M512 780V1320', stroke='#E9D5B8', w=4, extra='stroke-dasharray="12 12"')
    q += wcell(700, 900, .7) + circ(720, 860, 34, 'none', C, 4) + circ(680, 860, 34, 'none', C, 4)
    q += sun(860, 860, 30) + group(kid_front(s=.28), 600, 1000)
    q += antibody(860, 1100, .9) + antibody(800, 1150, .9, -30) + germ(840, 1220, .45)
    return q

def l03_e5():
    q = ''
    pos = [(200, 260), (512, 260), (824, 260), (350, 680), (674, 680)]
    for i, (x, y) in enumerate(pos):
        q += circ(x, y, 150, '#FFFDF6', '#E9D5B8', 4)
    q += tap(200, 200, .6) + hand(170, 330, .55, 15) + rect(250, 300, 50, 30, '#F49AC1', '#C25A8A', 3, 10)
    q += hand(470, 260, .6, 20) + hand(560, 260, .6, -20, SKIN, SKINS)
    for k in range(8):
        q += circ(470 + (k * 23) % 90, 220 + (k * 37) % 90, 12, '#FFFFFF', '#BFD8EA', 2)
    q += hand(824, 270, .7) + path('M790 210l20 70M830 200l0 80M860 210l-10 70', stroke='#FFFFFF', w=8)
    q += tap(350, 610, .6) + hand(330, 730, .55, 10)
    q += rect(600, 620, 150, 120, '#F49AC1', '#C25A8A', 4, 16) + hand(660, 700, .5, -10)
    q += group(path('M-50 -80H50L10 0L50 80H-50L-10 0Z', '#FFE9A8', '#C9952B', 5) + path('M-30 60H30L0 20Z', '#E8B04A'), 512, 900)
    q += panel(1040, 380)
    q += group(rect(-80, -30, 160, 60, '#F49A8C', '#C9573F', 4, 30) + rect(0, -30, 80, 60, '#FFFFFF', '#C9573F', 4, 30), 260, 1230)
    q += arrow(360, 1170, 480, 1130, GREEN) + bacterium(580, 1120, .6) + path('M700 1120l30 30l60 -70', stroke=GREEN, w=12)
    q += arrow(360, 1290, 480, 1330, RED) + virus(580, 1330, .7) + path('M660 1330l30 30l60 -70', stroke='none', w=0)
    q += path('M700 1290l70 70M770 1290l-70 70', stroke=RED, w=12)
    return q

def l03_e6():
    q = panel(80, 400) + wcell(230, 280, .9) + arrow(340, 280, 450, 280, TEAL) + circ(560, 280, 110, '#FDE8D8', '#D9A58A', 5) + virus(560, 280, .5) + path('M480 200l160 160M640 200l-160 160', stroke=RED, w=10, extra='opacity=".5"')
    q += panel(520, 400) + wcell(230, 720, .9) + arrow(340, 720, 450, 720, TEAL) + wcell(560, 720, 1.0)
    for k in range(6):
        q += antibody(700 + (k % 3) * 80, 640 + (k // 3) * 140, .8, -20 + k * 10)
    q += panel(960, 420) + wcell(300, 1170, .9) + circ(330, 1130, 34, 'none', C, 4) + circ(270, 1130, 34, 'none', C, 4)
    q += rect(520, 1040, 340, 260, '#FFFFFF', '#C9BBA8', 5, 20) + germ(600, 1110, .4) + virus(760, 1110, .4) + bacterium(690, 1230, .4)
    q += mascot(880, 1420, .4)
    return q


# ———— U09.L04: اللقاحات ————
def l04_e1():
    q = panel(80, 420) + group(kid_front(s=.32), 60, 130) + germ(420, 200, .6)
    for k in range(3):
        q += sun(560 + k * 130, 190, 22) + moon(560 + k * 130, 290, 20)
    q += panel(540, 420) + group(path('M-40 -80H40V60Q0 100 -40 60Z', '#FFFFFF', '#7FA9C8', 5) + germ(0, -10, .4, '#C9E7B6', '#8AB27A', False), 170, 750)
    q += arrow(250, 750, 330, 750, TEAL) + wcell(450, 740, .7) + arrow(540, 740, 620, 740, TEAL)
    for k in range(5):
        q += antibody(680 + (k % 3) * 70, 680 + (k // 3) * 110, .7, -15 + k * 8)
    q += wcell(880, 760, .5) + circ(900, 740, 22, 'none', C, 3) + circ(860, 740, 22, 'none', C, 3)
    q += panel(1000, 440) + germ(220, 1200, .7) + antibody(310, 1150, .8, -60) + antibody(300, 1250, .8, -120) + antibody(200, 1110, .8, 0)
    q += group(kid_front(s=.32), 560, 1040) + group(path('M-40 0l40 -60l40 60', stroke=TEAL, w=10), 900, 1160)
    return q

def l04_e2():
    top = ['red'] * 20
    bot = ['blue', 'blue', 'red', 'red', 'red', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'grey', 'blue', 'blue', 'empty', 'blue', 'blue', 'blue', 'blue', 'blue']
    q = panel(70, 680) + ring(512, 410, 270, top) + panel(780, 680) + ring(512, 1120, 270, bot)
    q += germ(512, 410, .6) + group(sit_kid(0, 0, 1), 512, 1150, .4)
    q += circ(512, 1080, 90, 'url(#shield)')
    return q

def l04_e3():
    q = path('M100 760H924', stroke='#C9BBA8', w=8, extra='stroke-dasharray="20 14"')
    q += circ(220, 760, 150, '#FFFDF6', '#E9D5B8', 5) + group(rect(-80, -60, 160, 110, '#F5E6C4', '#B8862A', 5, 10) + path('M0 -60V50', stroke='#B8862A', w=4) + ''.join(path(f'M{-66} {-40 + k * 18}h56M10 {-40 + k * 18}h56', stroke='#C9A040', w=3) for k in range(5)) + path('M70 -90L110 -140', stroke='#7A5232', w=8), 220, 760)
    q += circ(512, 760, 150, '#FFFDF6', '#E9D5B8', 5) + group(path('M-90 30Q-100 -40 -40 -50H50Q80 -50 90 -20V40H-90Z', '#FFFFFF', '#5E4A3A', 5) + circ(-40, -10, 18, '#7A5A44') + circ(30, 10, 22, '#7A5A44') + path('M-70 40V95M-40 40V95M40 40V95M70 40V95', stroke='#5E4A3A', w=10) + path('M-90 -20Q-130 0 -120 50', stroke='#5E4A3A', w=6) + ellipse(118, -36, 40, 30, '#FFFFFF', '#5E4A3A', 5) + ellipse(140, -26, 16, 12, '#F4B8B8', '#5E4A3A', 3) + path('M100 -62l-14 -20M130 -64l8 -22', stroke='#5E4A3A', w=6) + circ(110, -44, 5, '#333') + ellipse(0, 52, 22, 12, '#F4B8B8', '#5E4A3A', 3), 500, 760, .9)
    q += circ(804, 760, 150, '#FFFDF6', '#E9D5B8', 5) + circ(804, 760, 100, '#BFE7FF', '#5DA9E9', 5) + path('M720 740Q760 700 800 740T880 740M730 790Q780 770 820 800T880 790', '#8CCB7A', '#5E9A4E', 4) + circ(804, 760, 125, 'url(#shield)')
    q += arrow(380, 760, 400, 760) + arrow(670, 760, 690, 760)
    q += mascot(880, 1400, .45)
    return q

def l04_e4():
    q = panel(80, 640) + tap(400, 280, 1.3) + hand(430, 520, 1.1, -10) + circ(450, 520, 40, '#F49A8C', extra='opacity=".6"') + clock(780, 300, 90)
    q += panel(760, 360) + group(rect(-90, -50, 180, 100, '#FFE58A', '#C9A040', 5, 16), 230, 940) + group(rect(-30, -70, 60, 140, '#FFFFFF', '#7FA9C8', 5, 14) + rect(-30, -70, 60, 30, '#5DA9E9', 'none', 0, 10), 470, 940)
    q += path('M150 870l160 140M310 870l-160 140M410 870l120 140M530 870l-120 140', stroke=RED, w=12)
    q += group(path('M-60 -80C-70 -40 -60 60 -40 100H40C60 60 70 -40 60 -80Z', '#F2D3B3', SKINS, 5) + rect(-60, -20, 120, 60, '#FFFFFF', '#C9BBA8', 4, 12) + hand(30, -40, .6, -40), 770, 940)
    q += panel(1160, 300) + group(rect(-60, -110, 120, 220, '#3E4E66', '#26303F', 5, 24) + rect(-46, -86, 92, 140, '#BFE7FF', 'none', 0, 8) + circ(0, 80, 12, '#FFFFFF'), 300, 1310, .9) + group(path('M-120 40V-20Q-120 -60 -80 -60H80Q120 -60 120 -20V40Z', '#FFFFFF', RED, 6) + rect(-30, -50, 60, 40, RED, rx=6) + circ(-70, 50, 26, '#3E4E66') + circ(70, 50, 26, '#3E4E66'), 680, 1320)
    return q

def l04_e6():
    pos = [(270, 340), (754, 340), (270, 940), (754, 940)]
    q = ''.join(circ(x, y, 220, '#FFFDF6', '#E9D5B8', 5) for x, y in pos)
    q += germ(270, 340, 1.1, '#C9E7B6', '#8AB27A', False) + path('M230 330q12 10 24 0M290 330q12 10 24 0', stroke='#333', w=4) + path('M330 240q20 -16 40 0q-20 16 -40 0', stroke='#8E84C2', w=4)
    q += germ(754, 340, 1.1, '#D6D6D6', '#8A8A8A', False) + path('M720 320l16 16M736 320l-16 16M772 320l16 16M788 320l-16 16', stroke='#555', w=4)
    for a in range(0, 360, 60):
        r = math.radians(a)
        q += group(path('M0 -20L0 20', stroke=VIRS, w=8) + circ(0, -24, 9, '#E3A6F2', VIRS, 3), 270 + 90 * math.cos(r), 940 + 90 * math.sin(r), 1, a + 90)
    q += group(rect(-80, -100, 160, 200, '#FFF6DE', '#B8862A', 5, 14) + ''.join(path(f'M-56 {-70 + k * 30}' + ''.join(f'q8 -10 16 0' for _ in range(7)), stroke='#C9A040', w=4) for k in range(5)), 700, 940) + arrow(790, 940, 860, 940, TEAL) + virus(900, 1000, .35)
    q += mascot(512, 1380, .5)
    return q


DIAGRAMS = {
    'U09.L01-E1': l01_e1, 'U09.L01-E2': l01_e2, 'U09.L01-E3': l01_e3, 'U09.L01-E4': l01_e4, 'U09.L01-E5': l01_e5, 'U09.L01-E6': l01_e6,
    'U09.L02-E1': l02_e1, 'U09.L02-E2': l02_e2, 'U09.L02-E3': l02_e3, 'U09.L02-E4': l02_e4, 'U09.L02-E5': l02_e5, 'U09.L02-E6': l02_e6,
    'U09.L03-E1': l03_e1, 'U09.L03-E2': l03_e2, 'U09.L03-E3': l03_e3, 'U09.L03-E4': l03_e4, 'U09.L03-E5': l03_e5, 'U09.L03-E6': l03_e6,
    'U09.L04-E1': l04_e1, 'U09.L04-E2': l04_e2, 'U09.L04-E3': l04_e3, 'U09.L04-E4': l04_e4, 'U09.L04-E6': l04_e6,
}


def render(items, preview=None):
    from playwright.sync_api import sync_playwright
    from PIL import Image
    out = []
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1024, 'height': 1536})
        for name, body in items:
            svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1536" viewBox="0 0 1024 1536">{defs}<rect width="1024" height="1536" fill="url(#paper)"/>{body}</svg>'
            pg.set_content(f'<html><body style="margin:0">{svg}</body></html>')
            png = pg.screenshot(clip={'x': 0, 'y': 0, 'width': 1024, 'height': 1536})
            with Image.open(io.BytesIO(png)) as im:
                if preview:
                    im.convert('RGB').resize((341, 512)).save(Path(preview) / (name + '.png'))
                    continue
                buf = io.BytesIO(); im.convert('RGB').save(buf, 'WEBP', quality=92, method=6)
            (HERE / (name + '.svg')).write_text(svg, encoding='utf-8')
            data = buf.getvalue(); (IMG / (name + '.webp')).write_bytes(data)
            out.append((name + '.webp', data))
        b.close()
    return out


def record(made):
    st = ART / 'status.csv'
    rows = {}
    if st.exists():
        for r in csv.DictReader(st.open(encoding='utf-8-sig')):
            rows[r['filename']] = r
    for fn, data in made:
        rows[fn] = {'filename': fn, 'method': 'SVG', 'width': '1024', 'height': '1536', 'sha256': hashlib.sha256(data).hexdigest()}
    with st.open('w', encoding='utf-8-sig', newline='') as f:
        w = csv.DictWriter(f, ['filename', 'method', 'width', 'height', 'sha256']); w.writeheader()
        for k in sorted(rows):
            w.writerow(rows[k])
    ck = ART / 'checksums.json'
    cur = json.loads(ck.read_text(encoding='utf-8')) if ck.exists() else {}
    for fn, data in made:
        cur[fn] = {'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}
    ck.write_text(json.dumps(dict(sorted(cur.items())), ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
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
