# -*- coding: utf-8 -*-
"""رسوم الوحدة U11 التعليمية (SVG ← WebP 1024×1536) بأسلوب رسوم U07–U10 المتجهية نفسه.
الاستعمال: python3 art-sources/U11/sources/build_u11.py [--preview=مجلد] [أسماء…]   (بلا أسماء: كلها)
يكتب المصدر في art-sources/U11/sources/<الاسم>.svg والصورة في app/v2/img/<الاسم>.webp، ويُحدّث status.csv وchecksums.json.
لا كتابة ولا أرقام داخل الرسوم، ولا سجائر ولا دخان يخرج من فم، ولا صور أمراض. القلب بشكله الحقيقي المبسّط لا برمز ♥.
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
u10 = _load('u10', REPO / 'art-sources' / 'U10' / 'sources' / 'build_u10.py')
path, circ, ellipse, rect, group, arrow, face, mascot, panel = u07.path, u07.circ, u07.ellipse, u07.rect, u07.group, u07.arrow, u07.face, u07.mascot, u07.panel
rbc, kidney, cup, drop, magnifier, brain = u07.rbc, u07.kidney, u07.cup, u07.drop, u07.magnifier, u07.brain
kid_front, brain_side, lungs, pulse, sun, moon, bed, sleeper, book = u08.kid_front, u08.brain_side, u08.lungs, u08.pulse, u08.sun, u08.moon, u08.bed, u08.sleeper, u08.book
section, sit_kid, tap, hand, bottle = u09.section, u09.sit_kid, u09.tap, u09.hand, u09.bottle
ghand, face_round, adult, plate_food = u10.ghand, u10.face_round, u10.adult, u10.plate_food
C, TEAL, RED, SKIN, SKINS = u07.C, u07.TEAL, u07.RED, u07.SKIN, u07.SKINS
BLUE, GREEN, CORAL = u08.BLUE, u08.GREEN, u08.CORAL
GREY, GREYS = '#B9BEC4', '#7D848C'
O2 = '#4FA3D9'


# ———— أدوات U11 ————
def heart_real(x, y, s=1):
    """قلب بشكله الحقيقي المبسّط (مخروط مائل) مع أوعيته العليا؛ لا رمز ♥."""
    q = path('M-14 -62V-107H8V-62M8 -61Q10 -119 56 -108Q84 -101 67 -59', stroke=RED, w=20) + path('M-68 -44V-94', stroke='#892D42', w=16)
    q += path('M-57 -58C-90 -45 -81 16 -42 55L10 94C42 78 79 29 78 -13C81 -68 36 -81 9 -58C-15 -82 -43 -72 -57 -58Z', '#E4655C', '#892D42', 5)
    q += path('M8 -48Q-10 8 17 70', stroke='#F3A888', w=4)
    return group(q, x, y, s)


def muscle(x, y, w, h, open_frac=.3, work=False):
    """قطعة عضلة فيها شعيرات: المفتوحة حمراء أثخن، والمغلقة باهتة رفيعة."""
    q = rect(0, 0, w, h, '#F2B6A0', '#C47F66', 5, 30)
    for k in range(4):
        q += path(f'M20 {40 + k * (h - 60) / 3:.0f}H{w - 20}', stroke='#E79C86', w=4)
    n = 12; cols, rows = 4, 3
    for i in range(n):
        cx = 30 + (i % cols) * (w - 60) / (cols - 1) - 30; cy = 50 + (i // cols) * (h - 100) / (rows - 1)
        on = i < round(open_frac * n)
        d = f'M{cx:.0f} {cy:.0f}q15 -16 30 0t30 0'
        q += path(d, stroke='#C0392B' if on else '#E8C3B6', w=9 if on else 3)
    return group(q, x, y)


def cloud(x, y, s=1, col=GREY, st=GREYS, op=.9):
    q = path('M-120 30Q-150 -20 -100 -40Q-90 -90 -30 -80Q0 -120 50 -90Q110 -100 110 -40Q160 -20 130 30Q120 60 60 50Q0 70 -60 50Q-110 60 -120 30Z', col, st, 4)
    return group(q, x, y, s, extra=f'opacity="{op}"')


def person(x, y, s=1, col='#9ECDE4', st='#43687F'):
    """شخص أيقوني بسيط (رأس وجسم)."""
    return group(circ(0, -70, 34, SKIN, SKINS, 4) + path('M-50 60Q-50 -30 0 -30Q50 -30 50 60Z', col, st, 4), x, y, s)


def scale(x, y, s=1, left='', right='', tilt=0):
    """ميزان بكفتين؛ left/right محتوى يوضع فوق الكفتين."""
    q = rect(-12, -10, 24, 220, '#C9A57A', '#8A6A44', 4, 8) + rect(-80, 200, 160, 30, '#C9A57A', '#8A6A44', 4, 10)
    beam = group(path('M-220 0H220', stroke='#8A6A44', w=12) + path('M-220 0L-260 90M-220 0L-180 90M220 0L180 90M220 0L260 90', stroke='#8A6A44', w=4)
                 + path('M-280 90Q-220 130 -160 90Z', '#F2D6AE', '#8A6A44', 4) + path('M160 90Q220 130 280 90Z', '#F2D6AE', '#8A6A44', 4)
                 + group(left, -220, 80) + group(right, 220, 80), 0, 0, 1, tilt)
    return group(q + beam + circ(0, 0, 16, '#FFC93C', '#B8862A', 4), x, y, s)


def phone(x, y, s=1, lines=3):
    q = rect(-110, -200, 220, 400, '#2E3A4A', '#1E2732', 6, 30) + rect(-94, -170, 188, 330, '#EAF4FB', rx=14)
    q += path('M-80 -140H60Q74 -140 74 -126V-40Q74 -26 60 -26H-40L-60 -6L-56 -26H-80Q-94 -26 -94 -40V-126Q-94 -140 -80 -140Z', '#FFFFFF', '#9FC3D9', 4)
    for k in range(lines):
        q += path(f'M-74 {-112 + k * 26}q20 -8 40 0t40 0t40 0', stroke='#9FC3D9', w=5)
    return group(q, x, y, s)


def thermo_icon(x, y, s=1, hot=True):
    q = rect(-16, -90, 32, 130, '#FFFFFF', '#9FC3D9', 4, 16) + circ(0, 60, 32, RED if hot else BLUE, '#9FC3D9', 4)
    q += rect(-7, -60 if hot else 0, 14, 110 if hot else 50, RED if hot else BLUE, rx=7)
    return group(q, x, y, s)


def bed_row(x, y, s=1, n=3):
    q = ''
    for k in range(n):
        q += rect(k * 150, 0, 130, 60, '#FFFFFF', '#C9BBA8', 4, 14) + rect(k * 150, 60, 130, 20, '#B07A4E', '#7A5232', 3, 6) + ellipse(k * 150 + 30, 20, 22, 14, '#FDF0C4', '#D9B860', 3)
    return group(q, x, y, s)


# ———— U11.L01: جسمي فريق واحد ————
TEAM = [('brain', 512, 240), ('lungs', 810, 460), ('heart', 700, 860), ('skin', 324, 860), ('kid', 214, 460)]
def team_icon(kind, x, y, r=110):
    q = circ(x, y, r, '#FFFDF6', '#E9D5B8', 5)
    if kind == 'brain': q += brain_side(x, y + 10, .45)
    if kind == 'lungs': q += lungs(x, y + 20, .9)
    if kind == 'heart': q += heart_real(x, y + 10, .95)
    if kind == 'skin': q += group(section(0, 0, 180, 150, sweat=True, flakes=False), x - 90, y - 75)
    if kind == 'kid': q += kidney(x - 34, y, .45) + kidney(x + 34, y, .45, flip=True)
    return q

def l01_e1():
    q = panel(80, 1000)
    pts = [(x, y) for _, x, y in TEAM]
    for i in range(5):
        x1, y1 = pts[i]; x2, y2 = pts[(i + 1) % 5]
        q += path(f'M{x1} {y1}L{x2} {y2}', stroke='#FFC93C', w=8, extra='stroke-dasharray="18 14"')
    for kind, x, y in TEAM:
        q += team_icon(kind, x, y)
    q += group(kid_front(s=.24), 389, 450)
    q += panel(1120, 330) + u08.nerve('M200 1200C320 1260 420 1330 540 1350', 9) + brain_side(180, 1220, .35) + group(path('M0 0L40 -20L80 30L60 80', stroke=SKINS, w=60) + path('M0 0L40 -20L80 30L60 80', stroke=SKIN, w=48), 560, 1300)
    q += arrow(360, 1260, 470, 1320, TEAL, 7) + mascot(860, 1390, .42)
    return q

def l01_e2():
    q = panel(80, 1360, 50, 430) + panel(80, 1360, 544, 430)
    q += lungs(265, 300, 1.2) + heart_real(265, 560, 1.1) + muscle(105, 820, 320, 420, .25)
    q += lungs(759, 300, 1.5) + heart_real(759, 560, 1.4) + muscle(599, 820, 320, 420, 1.0, work=True)
    q += pulse(110, 720, 300, fast=False) + pulse(604, 720, 300, fast=True)
    q += sit_kid(265, 1340, .6) + group(kid_front(s=.2), 660, 1230)
    return q

def l01_e3():
    q = panel(80, 700) + group(section(0, 0, 820, 560, ves='wide', sweat=True, flakes=False), 102, 150)
    for k in range(5):
        q += path(f'M{200 + k * 150} 140q-10 -20 0 -40', stroke='#BFE7FF', w=6)
    q += panel(820, 620) + sit_kid(330, 1180, 1.3, flushed=True) + thermo_icon(760, 1130, 1.4, hot=True) + sun(780, 920, 70)
    return q

def l01_e4():
    q = panel(80, 560)
    q += group(section(0, 0, 360, 300, sweat=True, flakes=False), 90, 180) + arrow(470, 330, 560, 330, TEAL, 8)
    q += cup(700, 330, 1.4, level=.3) + face_round(880, 250, 50, 'worried')
    q += panel(680, 760)
    q += kidney(380, 900, 1.0) + kidney(640, 900, 1.0, flip=True)
    for k in range(3):
        q += drop(280 + k * 60, 760, .8) + arrow(330 + k * 40, 790, 360 + k * 20, 830, '#5DA9E9', 4)
    shades = ['#FFF6C7', '#FBE58C', '#F2D25C', '#E0B43C', '#C9962A']
    for k, col in enumerate(shades):
        q += rect(170 + k * 140, 1180, 120, 120, col, '#B8901E', 4, 20)
    q += arrow(180, 1340, 830, 1340, CORAL, 7)
    q += cup(880, 1050, .9, level=.85)
    return q

def l01_e5():
    q = panel(80, 520)
    q += pulse(110, 220, 800, fast=True) + pulse(110, 420, 800, fast=False, col='#2E9E6A')
    q += arrow(512, 260, 512, 380, TEAL, 8)
    q += panel(640, 760, 50, 430) + panel(640, 760, 544, 430)
    q += plate_food(240, 900, .9) + cup(380, 1100, .8, level=.8) + drop(150, 1100, 1.1)
    q += sleeper(759, 1000, .7) + moon(860, 760, 50)
    q += mascot(860, 1420, .38)
    return q

def l01_e6():
    q = panel(80, 700)
    q += scale(512, 300, 1.0, thermo_icon(0, -60, .5) + '', drop(0, -40, 1.2), 0)
    q += circ(512, 560, 70, 'none', TEAL, 6, 'stroke-dasharray="14 10"') + path('M470 530a50 50 0 1 1 10 60', stroke=TEAL, w=6) + path('M480 600l-10 -20l22 -2', stroke=TEAL, w=6)
    q += panel(820, 620)
    q += group(rect(-30, -160, 60, 200, '#B8862A', '#7A5A1C', 4, 10) + circ(0, -180, 40, '#E9C79A', '#7A5A1C', 4) + rect(-90, 40, 180, 30, '#7A5A1C', rx=8) + rect(-60, -40, 120, 16, '#C9C9C9', '#555', 3, 4), 260, 1240)
    q += magnifier(680, 1080, 200, rect(-200, -200, 400, 400, '#F2B6A0', rx=0) + ''.join(path(f'M{-170 + (i % 4) * 90} {-140 + (i // 4) * 120}q20 -20 40 0t40 0', stroke='#2B2B2B' if i % 3 != 2 else '#E8C3B6', w=10 if i % 3 != 2 else 4) for i in range(12)))
    return q


# ———— U11.L02: الدخان والجسم كله (بلا سجائر ولا دخان من فم) ————
def body_outline(x, y, s=1, grey_path=False):
    q = circ(0, -330, 80, '#F4E4D4', '#B9835F', 5) + path('M-120 -230Q0 -260 120 -230L150 260Q0 300 -150 260Z', '#F4E4D4', '#B9835F', 5)
    q += ellipse(0, -330, 48, 34, '#F4B8C4', '#C9788A', 4)
    q += ellipse(-50, -100, 50, 90, '#F7C6CF', '#C9788A', 4) + ellipse(50, -100, 50, 90, '#F7C6CF', '#C9788A', 4)
    q += heart_real(30, -40, .7)
    q += path('M-110 120H110', stroke='#C0392B', w=12) + path('M-110 160H110', stroke='#C0392B', w=8, extra='opacity=".6"')
    if grey_path:
        for d in ['M0 -260V-180', 'M-40 -60Q-80 40 -60 120', 'M40 -60Q60 -20 30 -40', 'M60 120Q140 -60 40 -300']:
            q += path(d, stroke=GREYS, w=10, extra='stroke-dasharray="16 12" opacity=".9"')
        for xx, yy in [(-60, 120), (0, 140), (60, 120), (30, -40), (20, -320)]:
            q += circ(xx, yy, 12, GREY, GREYS, 3)
    return group(q, x, y, s)

def l02_e1():
    q = panel(80, 1360) + body_outline(512, 760, 1.7, grey_path=True) + cloud(820, 220, .8, op=.6)
    q += mascot(860, 1400, .4)
    return q

def l02_e2():
    q = panel(80, 1360, 50, 430) + panel(80, 1360, 544, 430)
    for k in range(4):
        y = 300 + k * 260
        q += rbc(265, y, 2.2) + ''.join(circ(265 - 40 + j * 40, y - 40, 16, O2, '#2E6AA3', 3) for j in range(3))
        q += rbc(759, y, 2.2) + circ(719, y - 40, 16, O2, '#2E6AA3', 3) + circ(759, y - 40, 16, GREY, GREYS, 3) + circ(799, y - 40, 16, GREY, GREYS, 3)
    q += cloud(759, 160, .5, op=.7)
    return q

def l02_e3():
    q = panel(80, 760) + brain_side(512, 400, 1.1)
    cx, cy, R = 512, 420, 280
    for k in range(4):
        a1 = -math.pi / 2 + k * math.pi / 2 + .25; a2 = a1 + math.pi / 2 - .5
        x1, y1, x2, y2 = cx + R * math.cos(a1), cy + R * math.sin(a1), cx + R * math.cos(a2), cy + R * math.sin(a2)
        q += path(f'M{x1:.0f} {y1:.0f}A{R} {R} 0 0 1 {x2:.0f} {y2:.0f}', stroke=CORAL, w=10) + circ(x2, y2, 14, CORAL)
    q += panel(880, 560) + heart_real(300, 1160, 1.4) + pulse(470, 1160, 440, fast=True) + group(path('M-60 -20Q0 -40 60 -20M-60 20Q0 0 60 20', stroke='#C0392B', w=12), 690, 1300)
    return q

def l02_e4():
    q = panel(80, 440) + group(kid_front(s=.28), 160, 110) + cloud(680, 300, 1.2, op=.75) + path('M420 300q60 -30 120 0', stroke=GREYS, w=6, extra='stroke-dasharray="12 10"')
    q += panel(550, 440)
    q += rect(150, 640, 240, 280, '#DDF0FB', '#7FA9C8', 5, 20) + ''.join(circ(200 + (k % 4) * 45, 860 - (k // 4) * 60, 14, '#FFFFFF', '#7FA9C8', 3) for k in range(12))
    q += arrow(400, 780, 520, 780, GREYS, 8) + cloud(720, 780, 1.0)
    for k in range(6):
        q += circ(660 + (k % 3) * 60, 760 + (k // 3) * 40, 9, '#555', '#333', 2)
    q += panel(1020, 440)
    for k in range(18):
        q += circ(420 + (k % 6) * 60 + (k // 6) * 20, 1150 + (k // 6) * 70, 16, '#EAF4FB', '#9FC3D9', 3)
    for k in range(7):
        q += circ(440 + k * 55, 1170 + (k % 3) * 60, 7, '#555', '#333', 2)
    q += magnifier(220, 1240, 120, rect(-120, -120, 240, 240, '#EAF4FB', rx=0) + ''.join(circ(-60 + (k % 3) * 60, -50 + (k // 3) * 60, 12, '#555') for k in range(6)))
    return q

def l02_e5():
    q = panel(80, 700) + ghand(300, 400, 1.6, '#FF8A6B', '#B8462F') + group(kid_front(s=.32), 470, 140)
    q += arrow(800, 600, 900, 600, TEAL, 8)
    q += panel(820, 620)
    q += adult(300, 1000, .55) + group(kid_front(s=.26), 480, 960) + path('M560 940q40 -40 80 -10', stroke=TEAL, w=5)
    q += group(rect(-120, -100, 240, 200, '#E9C79A', '#A57A4E', 5, 12) + rect(-90, -70, 180, 140, '#DDF0FB', '#7FA9C8', 4, 8), 780, 1080) + cloud(860, 950, .4, op=.5)
    q += arrow(720, 1000, 860, 920, GREYS, 5)
    return q

def l02_e6():
    q = panel(80, 1360)
    for row in range(2):
        for k in range(6):
            q += person(170 + k * 135, 300 + row * 600, .9, '#9ECDE4' if row == 0 else '#C9D6A3', '#43687F' if row == 0 else '#6E8A3C')
    for k in range(5):
        q += group(rect(-40, -50, 80, 100, '#FFFFFF', '#C9BBA8', 4, 8) + rect(-40, -50, 80, 24, CORAL, rx=6), 200 + k * 160, 640)
    q += arrow(120, 720, 920, 720, CORAL, 7)
    q += mascot(860, 1400, .4)
    return q


# ———— U11.L04: كيف أحكم على معلومة صحية؟ ————
def l03_e1():
    q = panel(80, 620) + phone(320, 390, 1.1) + magnifier(700, 360, 130, rect(-130, -130, 260, 260, '#EAF4FB', rx=0) + ''.join(path(f'M-100 {-60 + k * 40}q25 -10 50 0t50 0t50 0', stroke='#9FC3D9', w=8) for k in range(4)))
    q += panel(740, 700)
    q += person(220, 1000, 1.2) + magnifier(420, 980, 70, circ(0, 0, 40, '#BFE7FF'))
    q += scale(720, 900, .55, person(-30, -20, .5) + person(30, -20, .5), person(-30, -20, .5) + person(30, -20, .5))
    q += group(book(0, 0, 1.0) + path('M60 -40q40 40 0 80', stroke='#555', w=8) + circ(0, 50, 14, '#888'), 330, 1280) + adult(680, 1220, .32, woman=True)
    return q

def septum_heart(x, y, s=1, holes=True):
    q = path('M-120 -110Q0 -160 140 -110Q220 0 110 160Q60 220 10 230Q-40 210 -80 150Q-170 20 -120 -110Z', '#F4B8C4', '#C9788A', 6)
    q += path('M16 -120Q10 40 -6 220', stroke='#C9788A', w=22)
    if holes:
        for k in range(3):
            q += circ(14 - k * 6, -40 + k * 80, 12, '#FFFFFF', '#8C4A5E', 4)
    else:
        q += path('M-60 -100Q0 -300 80 -100', stroke=BLUE, w=8, extra='stroke-dasharray="16 12"') + ellipse(10, -260, 80, 34, '#F4A9B8', '#C9788A', 5)
    return group(q, x, y, s)

def l03_e2():
    q = panel(80, 1360, 50, 430) + panel(80, 1360, 544, 430)
    q += septum_heart(265, 520, 1.1, holes=True) + septum_heart(759, 560, 1.1, holes=False)
    q += book(265, 1000, 1.3) + book(265, 1150, 1.3, '#7FB8E0') + group(path('M-60 0H60', stroke='#C9BBA8', w=6), 265, 1260)
    q += magnifier(759, 1100, 140, septum_heart(0, 40, .45, holes=False))
    q += arrow(420, 300, 600, 300, CORAL, 8)
    return q

def l03_e3():
    q = panel(80, 1360, 50, 430) + panel(80, 1360, 544, 430)
    q += bed_row(70, 260, .9) + bed_row(564, 260, .9)
    q += tap(759, 560, 1.1) + hand(720, 700, .8) + hand(800, 700, .8, 0)
    q += rect(150, 1300 - 18 * 40, 180, 18 * 40, '#E0607E', '#8C4A5E', 5, 16) + rect(644, 1300 - 1.3 * 40, 180, 1.3 * 40, '#2E9E6A', '#1E6E4A', 5, 12)
    q += path('M110 1310H914', stroke='#C9BBA8', w=8)
    return q

def l03_e4():
    q = panel(80, 620)
    q += scale(512, 230, .9, ''.join(person(-60 + k * 40, -10, .38) for k in range(4)), ''.join(person(-60 + k * 40, -10, .38) for k in range(4)))
    q += cup(310, 560, .7, fill='#F7D9A8') + cup(714, 560, .7, fill='#F7D9A8') + group(rect(-50, -30, 100, 60, '#555', rx=10), 310, 560) + group(rect(-50, -30, 100, 60, '#555', rx=10), 714, 560)
    q += panel(740, 700)
    q += person(300, 1000, 1.3) + cup(420, 1060, .6, fill='#F7D9A8') + arrow(470, 1000, 600, 1000, CORAL, 7) + face_round(720, 980, 70, 'happy')
    q += group(path('M-80 -80L80 80M80 -80L-80 80', stroke='#C0392B', w=18), 512, 1290)
    return q

def l03_e5():
    q = panel(80, 520) + phone(512, 330, .95)
    q += arrow(400, 560, 220, 700, TEAL, 7) + arrow(512, 570, 512, 700, TEAL, 7) + arrow(624, 560, 804, 700, TEAL, 7)
    q += panel(640, 800)
    trays = [('#2E9E6A', '#1E6E4A'), ('#E0607E', '#8C4A5E'), ('#FFC93C', '#B8862A')]
    for k, (col, st) in enumerate(trays):
        x = 220 + k * 292
        q += rect(x - 110, 760, 220, 120, col, st, 5, 24)
    q += path('M180 820l30 30l60 -60', stroke='#FFFFFF', w=14) + path('M470 790l80 80M550 790l-80 80', stroke='#FFFFFF', w=14) + magnifier(804, 820, 40, circ(0, 0, 30, '#FFF6DE'))
    q += adult(300, 1180, .4) + group(path('M-40 0q-20 60 30 80q50 -20 30 -80', stroke='#43687F', w=6) + circ(30, 80, 14, '#9FC3D9', '#43687F', 4), 300, 1290)
    q += group(kid_front(s=.22), 520, 1130) + mascot(860, 1400, .4)
    return q

def l03_e6():
    q = panel(80, 660)
    q += sun(760, 380, 110) + path('M100 600H924', stroke='#7BBF4A', w=10)
    q += group(ellipse(0, 0, 90, 70, '#FFFFFF', '#B8862A', 5) + circ(70, -70, 40, '#FFFFFF', '#B8862A', 5) + path('M90 -110l20 -30l10 30l20 -20l0 30', '#E0607E', '#A8333B', 4) + path('M105 -70l40 10l-40 12', '#FFC93C', '#B8862A', 3) + path('M-20 70v50M20 70v50', stroke='#B8862A', w=8), 300, 480)
    q += path('M420 360q40 -30 80 0', stroke='#FF8A6B', w=6) + path('M440 320q50 -40 100 0', stroke='#FF8A6B', w=6)
    q += panel(780, 700)
    for k, x in enumerate([300, 724]):
        q += cup(x, 1080, 1.0, fill='#F7D9A8') + rect(x - 70, 960, 140, 90, '#555', rx=14)
        q += person(x, 1330, .9)
    q += group(path('M-70 0Q0 -40 70 0', stroke='#333', w=18), 300, 1250) + group(path('M-70 0Q0 -40 70 0', stroke='#333', w=18), 724, 1250)
    return q


DIAGRAMS = {
    'U11.L01-E1': l01_e1, 'U11.L01-E2': l01_e2, 'U11.L01-E3': l01_e3, 'U11.L01-E4': l01_e4, 'U11.L01-E5': l01_e5, 'U11.L01-E6': l01_e6,
    'U11.L02-E1': l02_e1, 'U11.L02-E2': l02_e2, 'U11.L02-E3': l02_e3, 'U11.L02-E4': l02_e4, 'U11.L02-E5': l02_e5, 'U11.L02-E6': l02_e6,
    'U11.L04-E1': l03_e1, 'U11.L04-E2': l03_e2, 'U11.L04-E3': l03_e3, 'U11.L04-E4': l03_e4, 'U11.L04-E5': l03_e5, 'U11.L04-E6': l03_e6,
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
