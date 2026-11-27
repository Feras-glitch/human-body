# -*- coding: utf-8 -*-
"""رسوم الدروس السبعة المضافة (الوثيقة 35) — SVG ← WebP 1024×1536 بأسلوب رسوم U07–U11 المتجهية.
الاستعمال: python3 art-sources/ADD/sources/build_add.py [--preview=مجلد] [أسماء…]   (بلا أسماء: كلها)
يكتب المصدر في art-sources/ADD/sources/<الاسم>.svg والصورة في app/v2/img/<الاسم>.webp، ويُحدّث status.csv وchecksums.json.
القواعد: لا كتابة ولا أرقام داخل الرسوم؛ لا حبوب دواء ملونة تشبه الحلوى ولا علب بأسماء؛ لا علامات تجارية؛
القلب بشكله الحقيقي المبسّط لا برمز ♥؛ لا رموز دينية؛ لا رسم لأعضاء تناسلية؛ لا تشريح لحيوان.
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
u11 = _load('u11', REPO / 'art-sources' / 'U11' / 'sources' / 'build_u11.py')
path, circ, ellipse, rect, group, arrow, face, mascot, panel = u07.path, u07.circ, u07.ellipse, u07.rect, u07.group, u07.arrow, u07.face, u07.mascot, u07.panel
rbc, kidney, cup, drop, magnifier, brain, boy = u07.rbc, u07.kidney, u07.cup, u07.drop, u07.magnifier, u07.brain, u07.boy
kid_front, brain_side, lungs, pulse, sun, moon, bed, sleeper, book, tree, clock, eye_front = u08.kid_front, u08.brain_side, u08.lungs, u08.pulse, u08.sun, u08.moon, u08.bed, u08.sleeper, u08.book, u08.tree, u08.clock, u08.eye_front
section, sit_kid, tap, hand, germ, virus, bacterium, wcell = u09.section, u09.sit_kid, u09.tap, u09.hand, u09.germ, u09.virus, u09.bacterium, u09.wcell
ghand, face_round, adult, plate_food, cellc, femur, spine, ball, silh = u10.ghand, u10.face_round, u10.adult, u10.plate_food, u10.cellc, u10.femur, u10.spine, u10.ball, u10.silh
heart_real, phone, person, cloud, scale, thermo_icon = u11.heart_real, u11.phone, u11.person, u11.cloud, u11.scale, u11.thermo_icon
C, TEAL, RED, SKIN, SKINS = u07.C, u07.TEAL, u07.RED, u07.SKIN, u07.SKINS
BLUE, GREEN, CORAL = u08.BLUE, u08.GREEN, u08.CORAL
GREY, GREYS = '#B9BEC4', '#7D848C'
MOM, DAD = u10.MOM, u10.DAD


# ———— أدوات مشتركة ————
def bread(x, y, s=1):
    return group(path('M-90 30Q-100 -60 0 -60Q100 -60 90 30Z', '#E8B66A', '#A8782E', 5) + path('M-50 -30q10 -12 20 0M-10 -36q10 -12 20 0M30 -30q10 -12 20 0', stroke='#C9913E', w=4), x, y, s)

def egg(x, y, s=1):
    return group(ellipse(0, 0, 60, 44, '#FFFFFF', '#C9BBA8', 4) + circ(6, 0, 22, '#FFC93C', '#D9A21E', 3), x, y, s)

def bowl(x, y, s=1, fill='#C0784A', dots='#8A4A2A'):
    q = path('M-90 -10Q-90 70 0 70Q90 70 90 -10Z', '#FFFFFF', '#9FC3D9', 5) + ellipse(0, -10, 90, 22, fill, '#9FC3D9', 4)
    q += ''.join(circ(-50 + k * 20, -12 + (k % 2) * 6, 6, dots) for k in range(6))
    return group(q, x, y, s)

def fish(x, y, s=1, col='#9FC3D9', st='#4E7AA6', gills=False):
    q = path('M-90 0Q-30 -60 50 -10L100 -50V50L50 10Q-30 60 -90 0Z', col, st, 5) + circ(-50, -8, 8, '#2B2B2B')
    if gills:
        q += path('M-28 -26Q-16 0 -28 26', stroke='#E0607E', w=7) + path('M-16 -24Q-4 0 -16 24', stroke='#E0607E', w=5)
    return group(q, x, y, s)

def oil_bottle(x, y, s=1):
    return group(path('M-30 -110H30V-80Q60 -60 60 -20V90Q60 110 40 110H-40Q-60 110 -60 90V-20Q-60 -60 -30 -80Z', '#E6D36A', '#A89A2E', 5) + rect(-22, -140, 44, 34, '#7BBF4A', '#4F8E3C', 4, 8), x, y, s)

def nuts(x, y, s=1):
    return group(''.join(ellipse(-50 + k * 34, (k % 2) * 16, 20, 14, '#C9913E', '#8A5A2B', 3) for k in range(4)), x, y, s)

def apple(x, y, s=1, col='#E85A4F'):
    return group(circ(0, 0, 50, col, '#A8333B', 4) + path('M0 -48q6 -30 20 -36', stroke='#6B4A2B', w=6) + path('M4 -56q30 -20 40 6q-30 8 -40 -6Z', '#7BBF4A', '#4F8E3C', 3), x, y, s)

def carrot(x, y, s=1, a=0):
    return group(path('M-14 -70L14 -70L0 70Z', '#FF9F43', '#C8701E', 4) + path('M-6 -70l-14 -30M0 -70v-34M6 -70l14 -30', stroke='#4F8E3C', w=6), x, y, s, a)

def milk(x, y, s=1):
    return group(path('M-40 -90H40V-60L60 -30V100H-60V-30L-40 -60Z', '#FFFFFF', '#9FC3D9', 5) + rect(-60, 0, 120, 60, '#7FB8E0', rx=0), x, y, s)

def leaf(x, y, s=1, a=0):
    return group(path('M0 60Q-60 0 0 -60Q60 0 0 60Z', '#5BB36A', '#3F8A4C', 4) + path('M0 50V-50', stroke='#3F8A4C', w=4), x, y, s, a)

def spoon(x, y, s=1, full=True):
    return group(ellipse(0, 0, 30, 20, '#FFFFFF' if full else '#E8EEF2', '#B8901E' if full else '#9AA7B4', 4) + path('M0 20V90', stroke='#B8901E' if full else '#9AA7B4', w=7), x, y, s)

def can(x, y, s=1, col='#E0607E'):
    """علبة مشروب بلا علامة تجارية."""
    return group(rect(-50, -100, 100, 200, col, '#8C4A5E', 5, 18) + rect(-50, -100, 100, 24, '#C9C9C9', '#888', 3, 10) + path('M-50 -10H50', stroke='#FFFFFF', w=6, extra='opacity=".6"'), x, y, s)

def label_card(x, y, s=1, rows=5, hi=None):
    """بطاقة ملصق غذائي بخطوط بلا كتابة؛ hi رقم السطر المظلّل."""
    q = rect(-140, -180, 280, 360, '#FFFFFF', '#555', 5, 10) + path('M-120 -130H120', stroke='#555', w=10)
    for k in range(rows):
        yy = -90 + k * 50
        q += path(f'M-120 {yy}H40', stroke='#9AA7B4', w=8) + rect(70, yy - 10, 50, 20, '#9AA7B4', rx=6)
        if hi == k:
            q += rect(-130, yy - 22, 260, 44, 'none', CORAL, 6, 12)
    return group(q, x, y, s)

def ship(x, y, s=1):
    q = path('M-260 0H260L200 90H-200Z', '#A9825C', '#6E4A2B', 6) + rect(-10, -260, 20, 260, '#6E4A2B', rx=6)
    q += path('M10 -240Q140 -160 10 -40Z', '#FFFFFF', '#B8A89A', 5) + path('M-10 -220Q-120 -150 -10 -60Z', '#FFFFFF', '#B8A89A', 5)
    q += path('M-300 110q50 -24 100 0t100 0t100 0t100 0t100 0t100 0', stroke='#7FB8E0', w=8)
    return group(q, x, y, s)

def citrus(x, y, s=1, col='#FFB43C'):
    return group(circ(0, 0, 40, col, '#C8801E', 4) + circ(0, 0, 26, 'none', '#FFFFFF', 3) + path('M0 -26V26M-26 0H26M-18 -18L18 18M18 -18L-18 18', stroke='#FFFFFF', w=2), x, y, s)

def sofa(x, y, s=1):
    return group(rect(-200, -40, 400, 120, '#C08A6A', '#8A5A3A', 5, 24) + rect(-220, -120, 440, 100, '#D7A27E', '#8A5A3A', 5, 30) + rect(-240, -60, 50, 140, '#C08A6A', '#8A5A3A', 5, 20) + rect(190, -60, 50, 140, '#C08A6A', '#8A5A3A', 5, 20), x, y, s)

def tablet(x, y, s=1, glow=True):
    """لوح أو هاتف بشاشة مضيئة بلا شعار."""
    return group(rect(-120, -170, 240, 340, '#2E3A4A', '#1E2732', 6, 26) + rect(-104, -150, 208, 290, '#8FD0F5' if glow else '#2A2A33', rx=12), x, y, s)

def window(x, y, s=1, night=False):
    q = rect(-140, -160, 280, 320, '#1F2F5A' if night else '#BFE7FF', '#8A6A4A', 8, 10) + path('M0 -160V160M-140 0H140', stroke='#8A6A4A', w=8)
    return group(q, x, y, s)

def wheelchair(x, y, s=1, rider=True):
    q = circ(0, 60, 110, 'none', '#43687F', 14) + circ(0, 60, 16, '#43687F') + circ(150, 150, 26, 'none', '#43687F', 10)
    q += path('M-40 -120V40H150V150M-40 -120H-90', stroke='#43687F', w=12)
    if rider:
        q += circ(-10, -230, 50, SKIN, SKINS, 4) + face(-10, -225, 1.0) + path('M-50 -170Q-10 -190 40 -170L60 30H-40Z', '#FFC93C', '#B8862A', 5) + path('M40 20L130 40L150 140', stroke='#4A5C78', w=34)
        q += path('M-30 -140L70 -60', stroke=SKIN, w=24)
    return group(q, x, y, s)

def cane(x, y, s=1, white=True):
    return group(path('M0 -260V240', stroke='#FFFFFF' if white else '#8A5A2B', w=14) + path('M0 140V240', stroke=RED if white else '#8A5A2B', w=14) + path('M0 -260q0 -40 40 -40', stroke='#555' if white else '#8A5A2B', w=14), x, y, s)

def crutch(x, y, s=1):
    return group(path('M-20 -260V230M20 -260V230M-20 -260H20M-20 -40H20', stroke='#9AA7B4', w=10) + rect(-40, -290, 80, 30, '#555', rx=12), x, y, s)

def hearing_aid(x, y, s=1):
    return group(path('M0 -60Q50 -60 50 0Q50 50 10 60', '#E8C9A0', '#9C7A55', 5) + circ(10, 60, 12, '#9C7A55'), x, y, s)

def braille(x, y, s=1, cells=6):
    q = rect(-40 - cells * 40, -70, cells * 80 + 80, 140, '#FFF6DE', '#C9A57A', 4, 14)
    pats = [(1, 0, 1, 1, 0, 0), (1, 1, 0, 0, 1, 0), (1, 0, 0, 1, 1, 1), (0, 1, 1, 0, 1, 0), (1, 1, 1, 0, 0, 1), (1, 0, 1, 0, 1, 1)]
    for c in range(cells):
        cx = -cells * 40 + c * 80 + 20
        for k, on in enumerate(pats[c % 6]):
            q += circ(cx + (k % 2) * 30, -36 + (k // 2) * 36, 11 if on else 5, '#8A6A44' if on else '#E8DCC6')
    return group(q, x, y, s)

def stairs(x, y, s=1, ramp=False):
    q = ''.join(rect(k * 80, -k * 60, 80 * (5 - k), 60, '#D8D2C4', '#8A7A68', 4, 4) for k in range(5))
    if ramp:
        q += path('M-320 0L0 -240V0Z', '#BFE7C4', '#4F8E3C', 5)
    return group(q, x, y, s)

def inhaler(x, y, s=1):
    return group(path('M-30 -90H30V40H90V90H-30Z', '#7FB8E0', '#3E7BB6', 5) + rect(-24, -130, 48, 50, '#3E7BB6', rx=10), x, y, s)

def cabinet(x, y, s=1, locked=True):
    q = rect(-150, -120, 300, 240, '#E9C79A', '#A57A4E', 6, 12) + path('M0 -120V120', stroke='#A57A4E', w=5)
    q += circ(-16, 0, 9, '#8A6A44') + circ(16, 0, 9, '#8A6A44')
    if locked:
        q += rect(-26, 20, 52, 44, '#FFC93C', '#B8862A', 4, 8) + path('M-14 20V6Q0 -14 14 6V20', stroke='#B8862A', w=6)
    return group(q, x, y, s)

def med_box(x, y, s=1, col='#FFFFFF'):
    """علبة دواء بيضاء بشريط وغطاء أمان، بلا اسم ولا حبوب ظاهرة."""
    q = rect(-50, -70, 100, 150, col, '#7FA9C8', 5, 14) + rect(-56, -110, 112, 44, '#E0E6EC', '#7FA9C8', 5, 10)
    q += path('M-56 -96H56M-56 -82H56', stroke='#9FC3D9', w=3) + rect(-36, -20, 72, 50, '#DDF0FB', rx=6)
    return group(q, x, y, s)

def cleaner(x, y, s=1):
    return group(path('M-40 -40H40V120H-40Z', '#9ED6C9', '#3F8A7C', 5) + path('M-20 -40V-90H30L50 -70H20V-40', '#2BB3A3', '#1E7A70', 5), x, y, s)

def dropper(x, y, s=1):
    """أداة القياس (سرنجة فموية مبسطة) بلا تدريج ولا أرقام."""
    return group(rect(-20, -120, 40, 200, '#FFFFFF', '#7FA9C8', 4, 10) + rect(-34, 80, 68, 20, '#7FA9C8', rx=6) + rect(-8, -170, 16, 50, '#7FA9C8', rx=4), x, y, s)

def doctor(x, y, s=1, woman=False):
    q = adult(0, 0, 1, woman) + path('M-70 140L-96 520H96L70 140', '#FFFFFF', '#9FC3D9', 5, extra='opacity=".92"') + path('M-30 160Q0 240 30 160', stroke='#43687F', w=6) + circ(30, 240, 14, '#9FC3D9', '#43687F', 4)
    return group(q, x, y, s)

def paper(x, y, s=1, lines=4):
    q = rect(-120, -160, 240, 320, '#FFFFFF', '#9AA7B4', 5, 10)
    for k in range(lines):
        q += path(f'M-90 {-110 + k * 50}H90', stroke='#C9D3DC', w=8)
    return group(q, x, y, s)

def giraffe_neck(x, y, s=1, n=7, h=60):
    q = ''
    yy = 0
    for i in range(n):
        q += rect(-30, -yy - h, 60, h, '#E8D7B0', '#A88A4E', 4, 10); yy += h + 6
    q += ellipse(10, -yy - 30, 60, 30, '#E9B85C', '#B8862A', 4)
    return group(q, x, y, s)

def heart_box(x, y, n, s=1):
    """قلب مبسط مقسوم إلى حجرات (2 أو 3 أو 4)."""
    q = path('M-90 -60Q0 -110 90 -60Q130 40 0 120Q-130 40 -90 -60Z', '#F4B8C4', '#C9788A', 5)
    if n >= 2: q += path('M-95 0H95', stroke='#C9788A', w=6)
    if n == 3: q += path('M0 -90V0', stroke='#C9788A', w=6)
    if n == 4: q += path('M0 -90V110', stroke='#C9788A', w=6)
    return group(q, x, y, s)

def cow(x, y, s=1):
    q = ellipse(0, 0, 200, 110, '#FFFFFF', '#555', 5) + ellipse(-60, -30, 50, 36, '#555') + ellipse(80, 30, 40, 30, '#555')
    q += path('M-150 90V200M-90 100V200M90 100V200M150 90V200', stroke='#555', w=24)
    q += ellipse(240, -60, 70, 54, '#FFFFFF', '#555', 5) + ellipse(280, -40, 34, 24, '#F4B8C4', '#C9788A', 3) + circ(225, -80, 8, '#2B2B2B') + path('M200 -110l-20 -30M250 -112l10 -34', stroke='#C9A57A', w=8)
    return group(q, x, y, s)

def dog(x, y, s=1):
    q = ellipse(0, 0, 150, 70, '#C9913E', '#8A5A2B', 5) + path('M-110 50V140M-60 60V140M60 60V140M110 50V140', stroke='#8A5A2B', w=22)
    q += circ(170, -50, 60, '#C9913E', '#8A5A2B', 5) + ellipse(225, -40, 30, 20, '#8A5A2B') + circ(240, -46, 10, '#2B2B2B') + circ(160, -64, 8, '#2B2B2B') + path('M130 -90q-20 50 10 70', '#8A5A2B', '#6E4A2B', 4) + path('M-150 -10q-50 -40 -60 -80', stroke='#8A5A2B', w=14)
    return group(q, x, y, s)

def bird(x, y, s=1):
    q = ellipse(0, 0, 70, 50, '#7FB8E0', '#3E7BB6', 5) + circ(60, -40, 34, '#7FB8E0', '#3E7BB6', 5) + path('M90 -40l30 8l-30 8Z', '#FFC93C', '#B8862A', 3) + circ(66, -46, 6, '#2B2B2B')
    q += path('M-20 -10Q-60 -70 -100 -30Q-60 -10 -20 -10Z', '#5E9ACB', '#3E7BB6', 4) + path('M-10 50v30M20 50v30', stroke='#B8862A', w=5)
    return group(q, x, y, s)

def frog(x, y, s=1):
    q = ellipse(0, 0, 90, 60, '#7BBF4A', '#4F8E3C', 5) + circ(-40, -50, 24, '#7BBF4A', '#4F8E3C', 4) + circ(40, -50, 24, '#7BBF4A', '#4F8E3C', 4) + circ(-40, -52, 10, '#2B2B2B') + circ(40, -52, 10, '#2B2B2B')
    q += path('M-80 40q-50 20 -40 50M80 40q50 20 40 50', stroke='#4F8E3C', w=12)
    return group(q, x, y, s)

def cat(x, y, s=1):
    q = ellipse(0, 20, 90, 70, '#C9C3BA', '#7D776E', 5) + circ(0, -70, 56, '#C9C3BA', '#7D776E', 5) + path('M-46 -100l-10 -50l40 26M46 -100l10 -50l-40 26', '#C9C3BA', '#7D776E', 4)
    q += circ(-20, -76, 8, '#2B2B2B') + circ(20, -76, 8, '#2B2B2B') + path('M-8 -56q8 8 16 0', stroke='#7D776E', w=4) + path('M90 40q60 -10 50 -80', stroke='#7D776E', w=14)
    return group(q, x, y, s)

def dish(x, y, s=1, water=True):
    return group(path('M-80 0H80L60 40H-60Z', '#9ECDE4' if water else '#E8B04A', '#43687F', 5) + (ellipse(0, 0, 80, 12, '#BFE7FF') if water else ''), x, y, s)

def senior(x, y, s=1, woman=False, cane_on=False):
    q = adult(0, 0, 1, woman)
    q += path('M-60 -40Q0 -110 60 -40', stroke='#E8E8E8', w=26) if not woman else ''
    q += path('M-34 26h20M14 26h20', stroke='#555', w=5) + circ(-24, 26, 18, 'none', '#555', 4) + circ(24, 26, 18, 'none', '#555', 4)
    if cane_on:
        q += path('M130 300V760', stroke='#8A5A2B', w=14) + path('M130 300q0 -30 -30 -30', stroke='#8A5A2B', w=14)
    return group(q, x, y, s)

def baby(x, y, s=1):
    q = ellipse(0, 40, 90, 60, '#FFE3B3', '#C9A57A', 4) + circ(0, -40, 50, SKIN, SKINS, 4) + face(0, -36, 1.0)
    return group(q, x, y, s)


# ———— U06.L06: ماذا آكل؟ الطبق المتوازن ————
def a_l1():
    q = panel(80, 1360, 50, 924)
    q += circ(512, 300, 170, '#FFF6DE', '#E3B66A', 5) + bread(470, 290, 1.2) + bowl(570, 350, .7, '#F7F2E8', '#E8DCC6')
    q += circ(260, 720, 170, '#F6E1DA', '#C0784A', 5) + egg(210, 700, 1.0) + bowl(300, 780, .7) + fish(250, 640, .6)
    q += circ(764, 720, 170, '#F7F1CF', '#A89A2E', 5) + oil_bottle(720, 720, .9) + nuts(820, 790, .9)
    q += arrow(400, 420, 330, 560, TEAL, 7) + arrow(624, 420, 694, 560, TEAL, 7)
    q += group(kid_front(s=.34), 340, 960)
    return q

def a_l2():
    q = panel(80, 620) + milk(260, 330, 1.2) + leaf(470, 330, 1.3, -20) + leaf(540, 330, 1.1, 20) + femur(800, 380, .5)
    q += arrow(330, 330, 420, 330, TEAL, 6) + arrow(600, 330, 720, 330, TEAL, 6)
    q += panel(740, 700) + bowl(260, 960, 1.1) + leaf(470, 960, 1.2) + rbc(760, 960, 2.4) + arrow(560, 960, 660, 960, TEAL, 6)
    q += drop(260, 1260, 1.6) + group(path('M0 0q30 -40 60 0t60 0t60 0', stroke='#C9913E', w=12) + path('M0 40q30 -40 60 0t60 0t60 0', stroke='#C9913E', w=12), 560, 1240)
    return q

def a_l3():
    q = panel(80, 1360)
    q += circ(512, 640, 360, '#FFFFFF', '#C9BBA8', 8)
    q += path('M512 640L512 280A360 360 0 0 0 512 1000Z', '#DFF1CF', '#C9BBA8', 6)
    q += path('M512 640L512 280A360 360 0 0 1 872 640Z', '#F7E6C4', '#C9BBA8', 6) + path('M512 640L872 640A360 360 0 0 1 512 1000Z', '#F6D9CC', '#C9BBA8', 6)
    q += carrot(330, 520, 1.1, -30) + apple(300, 760, 1.2) + leaf(400, 860, 1.1, 30) + citrus(380, 660, 1.1)
    q += bread(680, 470, 1.0) + egg(690, 800, 1.1) + fish(700, 880, .55)
    q += cup(930, 660, 1.0, level=.85)
    q += mascot(860, 1380, .4)
    return q

def a_l4():
    q = panel(80, 620) + can(260, 370, 1.4)
    for k in range(8):
        q += spoon(480 + (k % 4) * 110, 270 + (k // 4) * 200, 1.1)
    q += path('M460 520H930', stroke='#E0607E', w=8, extra='stroke-dasharray="16 12"')
    q += panel(740, 700) + label_card(330, 1090, 1.1, hi=3) + magnifier(720, 1060, 150, label_card(0, 0, .55, hi=3)) + cup(840, 1330, .8, level=.85)
    return q

def a_l5():
    q = panel(80, 700) + ship(512, 520, 1.3)
    q += panel(820, 620)
    for i in range(6):
        x = 820 - (i % 3) * 300; yy = 980 + (i // 3) * 250
        best = i == 5
        q += person(x - 40, yy + 40, .7, '#9ECDE4', '#43687F') + person(x + 40, yy + 40, .7, '#9ECDE4', '#43687F')
        q += (citrus(x, yy - 70, .9) + citrus(x + 50, yy - 60, .7, '#FFE04A')) if best else group(cup(0, 0, .5, fill='#E8DCC6', level=.6), x, yy - 60)
        if best:
            q += circ(x, yy, 120, 'none', '#2E9E6A', 8)
    return q

def a_l6():
    q = panel(80, 1360) + label_card(330, 520, 1.6, rows=6, hi=1)
    q += group(rect(-160, -40, 320, 80, '#FFFFFF', '#2E9E6A', 6, 20) + rect(-160, -40, 60, 80, '#2E9E6A', rx=20), 330, 1060)
    q += group(rect(-160, -40, 320, 80, '#FFFFFF', '#E0607E', 6, 20) + rect(-160, -40, 220, 80, '#E0607E', rx=20), 330, 1200)
    q += adult(760, 760, .55, woman=True) + group(kid_front(s=.24), 560, 960)
    return q


# ———— U08.L06: مشاعري وجسمي ————
def b_l1():
    q = panel(80, 700)
    moods = ['happy', 'sad', 'worried', 'angry']
    for k, md in enumerate(moods):
        q += face_round(170 + k * 228, 300, 90, md)
    q += panel(820, 620) + brain_side(330, 1040, .75) + u08.nerve('M380 1100C420 1200 520 1240 620 1250', 10)
    q += group(path('M0 0Q-60 60 0 140Q80 200 140 120Q170 40 100 0Q60 -30 0 0Z', '#F4B8A8', '#C47F66', 5) + path('M20 40q30 20 60 0M20 80q30 20 60 0', stroke='#C47F66', w=5), 620, 1180)
    q += arrow(640, 1140, 440, 1080, TEAL, 6)
    return q

def b_l2():
    q = panel(80, 620) + sit_kid(300, 560, .9, flushed=True) + group(path('M-50 -60L0 -100L50 -60', stroke=CORAL, w=10), 300, 220)
    q += arrow(520, 360, 640, 360, TEAL, 8) + sit_kid(800, 560, .9)
    q += panel(740, 700)
    for k in range(4):
        q += path(f'M{200 + k * 30} {1000 - k * 60}q160 -40 320 0', stroke='#7FB8E0', w=10, extra=f'opacity="{.4 + k * .15:.2f}"')
    q += lungs(512, 1150, 1.3) + door_wall(830, 1100)
    return q

def door_wall(x, y):
    return group(rect(-90, -200, 180, 400, '#E9C79A', '#A57A4E', 5, 10) + circ(60, 0, 10, '#B8862A'), x, y)

def b_l3():
    q = panel(80, 1360)
    q += person(260, 380, 1.0) + person(420, 380, 1.0) + face_round(340, 200, 40, 'happy')
    q += person(700, 380, 1.0, '#C9D6A3', '#6E8A3C') + person(860, 380, 1.0, '#C9D6A3', '#6E8A3C')
    q += person(240, 860, .9, '#C9C9C9', '#777') + person(360, 880, .9, '#C9C9C9', '#777') + person(300, 980, .9, '#C9C9C9', '#777')
    q += person(720, 880, .8, '#FFE08A', '#B8862A') + face_round(720, 720, 34, 'sad')
    q += arrow(420, 900, 620, 900, '#E0607E', 8)
    q += adult(780, 1160, .42, woman=True) + group(kid_front(s=.22), 360, 1100) + arrow(520, 1260, 680, 1260, TEAL, 8)
    return q

def b_l4():
    q = panel(80, 1360, 50, 430) + panel(80, 1360, 544, 430)
    q += face_round(265, 420, 150, 'happy') + ''.join(circ(200 + k * 50, 480 + (k % 2) * 20, 6, '#D9A27A') for k in range(4))
    q += tablet(759, 440, 1.2) + face_round(759, 420, 100, 'happy', '#FFF0D8') + circ(759, 420, 100, '#FFFFFF', extra='opacity=".35"')
    q += arrow(420, 440, 600, 440, CORAL, 7)
    q += group(kid_front(s=.32), 100, 760) + ball(760, 1100, 1.6) + leaf(700, 1250, 1.0)
    return q

def b_l5():
    q = panel(80, 1360)
    q += sit_kid(330, 760, 1.1, tired=True) + adult(690, 380, .75, woman=True)
    q += path('M430 520q100 -100 200 -60', stroke=TEAL, w=7, extra='stroke-dasharray="14 10"')
    q += doctor(760, 980, .45)
    q += mascot(200, 1380, .38)
    return q

def b_l6():
    q = panel(80, 1360)
    q += book(512, 380, 2.2, '#2E9E6A')
    q += brain_side(330, 860, .8) + heart_real(700, 860, 1.4)
    q += path('M430 860H600', stroke='#FFC93C', w=10, extra='stroke-dasharray="18 12"')
    q += mascot(860, 1380, .4)
    return q


# ———— U08.L07: الشاشات وجسمي ————
def c_l1():
    q = panel(80, 1360) + sofa(512, 980, 1.3) + sit_kid(512, 960, 1.0, tired=True) + tablet(512, 640, .7)
    q += eye_front(250, 300, .45) + lungs(512, 260, .8) + moon(790, 300, 60)
    q += arrow(260, 380, 420, 560, CORAL, 6) + arrow(790, 380, 620, 560, CORAL, 6)
    return q

def c_l2():
    q = panel(80, 620) + sit_kid(300, 560, .9, tired=True) + tablet(560, 340, .5) + clock(820, 300, 1.0)
    q += panel(740, 700) + group(kid_front(s=.4), 100, 760) + ball(800, 1100, 1.4) + tree(860, 900, 1.0)
    q += arrow(512, 640, 512, 780, TEAL, 8)
    return q

def c_l3():
    q = panel(80, 1360) + tablet(512, 640, 2.1)
    q += path('M512 420V880', stroke='#FFFFFF', w=10, extra='stroke-dasharray="24 18"') + arrow(512, 760, 512, 880, '#FFFFFF', 8)
    for k in range(3):
        q += u08.star(380 + k * 130, 420, 30)
    q += rect(330, 960, 360, 110, '#FFC93C', '#B8862A', 5, 24)
    q += path('M700 300a60 60 0 1 1 -10 -40', stroke='#FFFFFF', w=10) + path('M690 250l10 -30l20 26', stroke='#FFFFFF', w=8)
    q += magnifier(820, 1280, 110, u08.star(0, 0, 40))
    return q

def c_l4():
    q = panel(80, 620)
    q += plate_food(300, 380, 1.4) + group(tablet(0, 0, .45, glow=False) + path('M-70 -100L70 100M70 -100L-70 100', stroke='#E0607E', w=14), 760, 360)
    q += panel(740, 700) + window(260, 1000, .9, night=True) + moon(260, 960, 40) + bed(620, 1120, .7)
    q += group(tablet(0, 0, .35, glow=False), 880, 900) + arrow(820, 930, 720, 930, TEAL, 6)
    q += clock(420, 1300, .8)
    return q

def c_l5():
    q = panel(80, 1360, 50, 430) + panel(80, 1360, 544, 430)
    for k in range(3):
        q += rect(110 + k * 110, 300, 90, 70, '#E9C79A', '#A57A4E', 4, 8) + rect(604 + k * 110, 300, 90, 70, '#E9C79A', '#A57A4E', 4, 8)
    q += sun(759, 200, 60) + tree(860, 520, .9)
    for k in range(6):
        q += group(kid_front(s=.1), 90 + (k % 3) * 120, 500 + (k // 3) * 260)
        q += group(kid_front(s=.1), 590 + (k % 3) * 120, 500 + (k // 3) * 260)
    q += rect(150, 1300 - 39.5 * 8, 180, 39.5 * 8, '#9AA7B4', '#6A7480', 5, 16) + rect(644, 1300 - 30.4 * 8, 180, 30.4 * 8, '#2E9E6A', '#1E6E4A', 5, 16)
    q += path('M110 1310H914', stroke='#C9BBA8', w=8)
    return q

def c_l6():
    q = panel(80, 1360)
    q += scale(512, 300, .9, group(path('M-60 0H60', stroke='#2E9E6A', w=30), 0, -20), group(path('M-60 0H60', stroke='#2E9E6A', w=30), 0, -20) + magnifier(0, -60, 40, ''), -6)
    q += book(300, 1000, 1.5) + magnifier(700, 1000, 140, rect(-140, -140, 280, 280, '#EAF4FB', rx=0) + ''.join(circ(-80 + (k % 4) * 54, -60 + (k // 4) * 60, 12, '#9AA7B4') for k in range(12)))
    return q


# ———— U09.L05: الدواء نافع ومحفوظ ————
def d_l1():
    q = panel(80, 1360) + adult(330, 420, .9, woman=True) + dropper(560, 820, 1.0) + med_box(700, 820, 1.0)
    q += group(kid_front(s=.3), 520, 900)
    q += doctor(820, 300, .38)
    q += arrow(780, 560, 640, 700, TEAL, 6)
    return q

def d_l2():
    q = panel(80, 700) + doctor(250, 260, .55) + paper(620, 420, 1.0) + arrow(400, 420, 480, 420, TEAL, 7)
    q += group(kid_front(s=.18), 760, 300)
    q += panel(820, 620) + med_box(300, 1100, 1.2) + group(kid_front(s=.2), 450, 900) + group(path('M-80 -80L80 80M80 -80L-80 80', stroke='#C0392B', w=16), 760, 1100)
    q += virus(760, 1100, .8)
    return q

def d_l3():
    q = panel(80, 1360)
    q += cabinet(700, 300, 1.2, True) + med_box(650, 290, .6) + cleaner(760, 300, .6)
    q += rect(560, 420, 300, 16, '#A57A4E', rx=6)
    q += baby(260, 1100, 1.4) + path('M260 980V520', stroke=TEAL, w=6, extra='stroke-dasharray="14 12"') + arrow(260, 600, 260, 520, TEAL, 6)
    q += adult(620, 760, .55, woman=True)
    return q

def d_l4():
    q = panel(80, 700)
    q += cup(220, 400, 1.0, fill='#3E2A1E', level=.8) + cup(420, 400, 1.0, fill='#C9913E', level=.8) + can(620, 400, 1.0, '#8C4A5E') + can(820, 400, 1.2, '#2E3A4A')
    q += panel(820, 620) + brain_side(330, 1100, .7) + heart_real(660, 1100, 1.2) + cup(860, 1240, 1.0, level=.9)
    return q

def d_l5():
    q = panel(80, 1360) + book(512, 300, 2.0, '#2E9E6A')
    for k in range(4):
        q += circ(220 + k * 195, 720, 80, '#FFFDF6', '#E9D5B8', 5)
    q += person(220, 760, .5) + clock(415, 720, .7) + ''.join(person(570 + (k % 3) * 30, 690 + (k // 3) * 50, .2) for k in range(6)) + person(805, 760, .5, '#FFC93C', '#B8862A')
    q += arrow(300, 720, 330, 720, TEAL, 5) + arrow(495, 720, 525, 720, TEAL, 5) + arrow(690, 720, 720, 720, TEAL, 5)
    q += mascot(860, 1380, .4)
    return q

def d_l6():
    q = panel(80, 1360, 50, 430) + panel(80, 1360, 544, 430)
    for k in range(5):
        q += person(150 + (k % 3) * 80, 380 + (k // 3) * 200, .55, '#9ECDE4', '#43687F') + person(644 + (k % 3) * 80, 380 + (k // 3) * 200, .55, '#C9D6A3', '#6E8A3C')
    q += med_box(265, 900, .9) + group(rect(-50, -70, 100, 150, '#FFFFFF', '#9AA7B4', 5, 14), 759, 900)
    q += rect(150, 1300 - 200, 180, 200, '#2E9E6A', '#1E6E4A', 5, 16) + rect(644, 1300 - 120, 180, 120, '#9AA7B4', '#6A7480', 5, 16)
    q += path('M110 1310H914', stroke='#C9BBA8', w=8)
    return q


# ———— U10.L04: من البداية إلى الشيخوخة ————
def e_l1():
    q = panel(80, 520) + circ(240, 320, 60, MOM, '#B8462F', 4) + circ(780, 320, 40, DAD, '#2E6AA3', 4)
    q += arrow(320, 320, 420, 320, TEAL, 6) + arrow(720, 320, 620, 320, TEAL, 6) + cellc(512, 320, 1.0)
    q += panel(640, 800) + cellc(200, 900, .8) + cellc(400, 900, .9, split=.8)
    q += ''.join(circ(640 + (k % 3) * 46, 860 + (k // 3) * 46, 22, '#F7E3EC', '#B77B97', 3) for k in range(9))
    q += ellipse(512, 1200, 260, 160, '#FBE3DC', '#D98C8C', 6) + circ(512, 1210, 40, '#F4D3B5', '#B9835F', 3)
    return q

def e_l2():
    q = panel(80, 1360)
    q += ellipse(512, 700, 380, 460, '#FBE3DC', '#D98C8C', 8)
    q += path('M720 300Q620 520 560 700', stroke='#C26D8E', w=16) + ellipse(740, 270, 80, 50, '#E8A2B5', '#B26A80', 5)
    q += ellipse(470, 760, 150, 120, '#F4D3B5', '#B9835F', 4) + circ(380, 620, 100, '#F4D3B5', '#B9835F', 4)
    q += path('M330 610q10 6 20 0M380 610q10 6 20 0', stroke='#8A5A3A', w=4)
    for k in range(4):
        q += path(f'M{150 + k * 10} {300 + k * 40}q-40 -20 -60 0', stroke='#7FB8E0', w=5)
    return q

def e_l3():
    q = panel(80, 1360)
    xs = [140, 300, 470, 650, 860]
    q += baby(xs[0], 1100, .7) + group(kid_front(s=.2), xs[1] - 100, 860) + group(kid_front(s=.27), xs[2] - 140, 760)
    q += adult(xs[3], 760, .55, woman=True) + senior(xs[4], 800, .5, cane_on=True)
    q += path('M90 1300H940', stroke='#C9BBA8', w=8) + arrow(100, 1340, 930, 1340, TEAL, 7)
    return q

def e_l4():
    q = panel(80, 700, 50, 430) + panel(80, 700, 544, 430)
    q += femur(265, 430, .7) + group(femur(0, 0, .7, plates=False), 759, 430) + ''.join(circ(730 + (k % 3) * 30, 330 + (k // 3) * 120, 8, '#FFFFFF', '#E3D6BC', 2) for k in range(9))
    q += panel(820, 620)
    q += eye_front(250, 980, .4) + book(250, 1180, 1.0) + group(path('M-60 0a30 30 0 1 0 60 0a30 30 0 1 0 60 0', stroke='#555', w=6), 210, 1080)
    q += group(path('M0 0q20 -40 40 0t40 0t40 0t40 0', stroke=BLUE, w=8), 560, 1000) + group(path('M0 -90Q80 -90 80 0Q80 60 30 80Q10 100 10 130', '#F4D3B5', '#B9835F', 6) + path('M20 -40Q50 -40 50 0', stroke='#B9835F', w=5), 800, 1150)
    return q

def e_l5():
    q = panel(80, 1360)
    q += senior(330, 420, .65, cane_on=True) + group(kid_front(s=.32), 470, 300)
    q += path('M440 640q60 -40 120 0', stroke=TEAL, w=6, extra='stroke-dasharray="12 10"')
    q += senior(700, 1000, .45, woman=True) + book(560, 1240, .9) + sun(860, 900, 50)
    q += group(rect(-200, -30, 400, 60, '#C08A6A', '#8A5A3A', 5, 20), 260, 1340) + sit_kid(220, 1300, .5)
    return q

def e_l6():
    q = panel(80, 700) + baby(260, 450, 1.4) + group(path('M0 -60V60', stroke='#555', w=10) + ellipse(0, -80, 24, 34, '#FFE3B3', '#C9A57A', 4), 400, 470)
    q += adult(720, 280, .5, woman=True) + path('M640 300q-120 40 -200 120', stroke=MOM, w=6, extra='stroke-dasharray="10 10"') + group(path('M0 0q10 -20 20 0t20 0', stroke=MOM, w=5), 560, 330)
    q += panel(820, 620) + ellipse(512, 1130, 300, 220, '#FBE3DC', '#D98C8C', 6) + circ(640, 1000, 50, '#E8A2B5', '#B26A80', 4) + path('M600 1030Q560 1100 520 1140', stroke='#C26D8E', w=12) + ellipse(480, 1170, 70, 54, '#F4D3B5', '#B9835F', 4)
    return q


# ———— U10.L05: أجسام مختلفة ————
def f_l1():
    q = panel(80, 1360)
    q += wheelchair(270, 470, 1.0) + crutch(560, 500, .8) + hearing_aid(780, 400, 1.6)
    q += group(path('M-60 0Q-40 -80 0 -60Q40 -80 60 0', stroke=SKINS, w=30) + path('M-60 0Q-40 -80 0 -60Q40 -80 60 0', stroke=SKIN, w=22), 300, 1000) + group(path('M-30 0q30 -50 60 0', stroke=SKIN, w=20), 400, 960)
    q += cane(620, 1050, .7) + braille(800, 1200, .7, 3) + group(path('M-50 0a30 30 0 1 0 60 0a30 30 0 1 0 60 0', stroke='#555', w=8), 760, 980)
    return q

def f_l2():
    q = panel(80, 620, 50, 430) + panel(80, 620, 544, 430)
    q += stairs(110, 560, .9) + wheelchair(150, 420, .45) + stairs(640, 560, .7, ramp=True) + wheelchair(610, 470, .4)
    q += panel(740, 700)
    q += braille(330, 960, .9, 4) + door_wall(780, 1000) + group(rect(-60, -40, 120, 80, '#FFC93C', '#B8862A', 4, 10), 780, 900)
    q += path('M200 1250H900', stroke='#BFE7C4', w=40) + mascot(860, 1400, .38)
    return q

def f_l3():
    q = panel(80, 700, 50, 430) + panel(80, 700, 544, 430)
    q += lungs(265, 330, 1.0) + inhaler(265, 600, .9)
    q += group(path('M-80 -40Q0 -80 80 -40Q60 40 0 60Q-60 40 -80 -40Z', '#F2C38E', '#C08A4E', 5), 759, 330) + ''.join(circ(700 + k * 40, 560, 12, '#E85A4F') for k in range(4))
    q += panel(820, 620, 50, 430) + panel(820, 620, 544, 430)
    q += wcell(265, 1080, 1.4) + bowl(265, 1300, .6, '#C9913E', '#8A5A2B')
    q += brain_side(759, 1100, .6) + ''.join(path(f'M{680 + k * 40} 1000l20 -30l-10 30l20 -20', stroke='#FFC93C', w=5) for k in range(4))
    return q

def f_l4():
    q = panel(80, 700) + group(kid_front(s=.26), 120, 160) + sit_kid(700, 620, .8) + inhaler(560, 520, .6)
    q += adult(880, 300, .32, woman=True)
    q += panel(820, 620)
    q += ellipse(400, 1200, 220, 60, '#9ECDE4', '#43687F', 4) + circ(220, 1170, 40, SKIN, SKINS, 4)
    q += adult(780, 1000, .42) + arrow(520, 1100, 640, 1050, TEAL, 7)
    q += group(path('M-40 -40L40 40M40 -40L-40 40', stroke='#C0392B', w=12), 330, 1000) + group(path('M-20 -10v-40h40v40', stroke='#555', w=8), 330, 1000)
    return q

def f_l5():
    q = panel(80, 1360)
    q += wheelchair(280, 760, .9) + group(kid_front(s=.3), 450, 420) + ball(560, 1060, 1.4)
    q += group(kid_front(s=.28), 620, 500)
    q += path('M240 360q60 -60 120 0M520 330q60 -60 120 0', stroke=TEAL, w=6)
    q += mascot(860, 1400, .38)
    return q

def f_l6():
    q = panel(80, 700) + braille(512, 360, 1.6, 6)
    q += group(path('M-80 0Q-40 -60 20 -40L120 -30', stroke=SKINS, w=46) + path('M-80 0Q-40 -60 20 -40L120 -30', stroke=SKIN, w=36), 300, 520)
    q += panel(820, 620) + book(330, 1100, 1.6) + group(kid_front(s=.26), 560, 860)
    return q


# ———— U11.L03: الإنسان والحيوان ————
def g_l1():
    q = panel(80, 1360)
    q += group(kid_front(s=.3), 360, 160) + spine(512, 520, .55)
    q += fish(200, 700, 1.0) + frog(800, 700, 1.0) + bird(220, 1050, 1.2) + cow(700, 1050, .7)
    q += path('M150 900H880', stroke='#E9D5B8', w=6, extra='stroke-dasharray="14 12"')
    return q

def g_l2():
    q = panel(80, 1360)
    q += fish(260, 280, 1.2, gills=True) + heart_box(700, 280, 2, 1.0)
    q += frog(260, 640, 1.2) + heart_box(700, 640, 3, 1.0)
    q += bird(260, 1000, 1.4) + heart_box(700, 1000, 4, 1.0)
    q += group(kid_front(s=.16), 180, 1180) + heart_box(700, 1300, 4, .8)
    return q

def g_l3():
    q = panel(80, 1360, 50, 430) + panel(80, 1360, 544, 430)
    q += giraffe_neck(759, 1300, 1.0, 7, 150) + group(''.join(rect(-26, -k * 40 - 34, 52, 34, '#E8D7B0', '#A88A4E', 4, 8) for k in range(7)) + circ(0, -7 * 40 - 50, 44, SKIN, SKINS, 4), 265, 1300)
    return q

def g_l4():
    q = panel(80, 700) + cow(420, 420, 1.1) + magnifier(820, 280, 110, ''.join(bacterium(-40 + (k % 3) * 40, -30 + (k // 3) * 50, .3, k * 30) for k in range(6)))
    q += panel(820, 620) + group(path('M0 0Q-180 -40 -200 100Q-160 220 0 200Q140 200 150 80Q140 -20 0 0Z', '#CFE7B5', '#6E8A3C', 6), 420, 1050)
    q += circ(700, 960, 56, '#EAD9C6', '#9C7A55', 5) + circ(760, 1080, 56, '#EAD9C6', '#9C7A55', 5) + ellipse(720, 1220, 80, 50, '#EAD9C6', '#9C7A55', 5)
    q += path('M300 900Q200 760 360 720', stroke='#2E9E6A', w=8, extra='stroke-dasharray="14 10"') + arrow(330, 740, 380, 720, '#2E9E6A', 6)
    return q

def g_l5():
    q = panel(80, 700) + cat(320, 430, 1.4) + dish(620, 580, 1.2) + group(kid_front(s=.26), 600, 140)
    q += panel(820, 620) + tap(330, 1060, 1.1) + hand(290, 1200, .9) + hand(370, 1200, .9, 0) + bird(760, 1120, 1.2) + dish(760, 1260, .8)
    return q

def g_l6():
    q = panel(80, 700) + book(330, 400, 2.0, '#C9913E') + book(330, 520, 2.0, '#7FB8E0')
    q += bird(760, 280, 1.0) + fish(760, 470, .8) + cat(760, 640, .6)
    q += panel(820, 620) + dog(330, 1120, 1.0) + magnifier(760, 1080, 150, ''.join(circ(-80 + (k % 6) * 32, -60 + (k // 6) * 40, 9, '#C9913E') for k in range(24)))
    return q


DIAGRAMS = {}
for lid, pre in [('U06.L06', 'a'), ('U08.L06', 'b'), ('U08.L07', 'c'), ('U09.L05', 'd'), ('U10.L04', 'e'), ('U10.L05', 'f'), ('U11.L03', 'g')]:
    for k in range(1, 7):
        DIAGRAMS[f'{lid}-E{k}'] = globals()[f'{pre}_l{k}']

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
