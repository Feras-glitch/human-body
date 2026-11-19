# -*- coding: utf-8 -*-
"""رسوم الوحدة U07 التعليمية (SVG ← WebP 1024×1536) بأسلوب رسوم U06 المتجهية نفسه.
الاستعمال: python3 art-sources/U07/sources/build_u07.py [أسماء…]   (بلا أسماء: كلها)
يكتب المصدر في art-sources/U07/sources/<الاسم>.svg والصورة في app/v2/img/<الاسم>.webp، ويُحدّث status.csv وchecksums.json.
النقش: Chromium (Playwright للبايثون) بدل Inkscape. لا كتابة ولا أرقام داخل الرسوم.
"""
from pathlib import Path
import math, sys, io, json, hashlib, csv
from PIL import Image

HERE = Path(__file__).resolve().parent
ART = HERE.parent
REPO = ART.parent.parent
IMG = REPO / 'app' / 'v2' / 'img'

C = '#61464A'; TEAL = '#239D92'; RED = '#E34E4B'; DARK = '#892D42'
KID = '#B9534F'; KIDS = '#7E2F33'; URINE = '#F2D25C'; URS = '#B8901E'; WATER = '#5DA9E9'; WS = '#2E6AA3'
SKIN = '#F5DEBC'; SKINS = '#B68B72'; VES = '#D9485A'
defs = '''<defs>
<radialGradient id="paper"><stop stop-color="#FFFDF4"/><stop offset="1" stop-color="#FFF1D9"/></radialGradient>
<radialGradient id="rbc"><stop stop-color="#F78A77"/><stop offset=".58" stop-color="#E85B54"/><stop offset="1" stop-color="#BA3947"/></radialGradient>
<radialGradient id="lens"><stop stop-color="#E4F6FF"/><stop offset="1" stop-color="#96D7EE"/></radialGradient>
<radialGradient id="kid"><stop stop-color="#D7726B"/><stop offset=".7" stop-color="#B9534F"/><stop offset="1" stop-color="#9A3E40"/></radialGradient>
<linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#BFE3FB"/><stop offset="1" stop-color="#6FB3EA"/></linearGradient>
<radialGradient id="glow"><stop stop-color="#FFE98A" stop-opacity=".95"/><stop offset="1" stop-color="#FFE98A" stop-opacity="0"/></radialGradient>
</defs>'''


def path(d, fill='none', stroke=C, w=5, extra=''):
    return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round" {extra}/>'
def circ(x, y, r, fill, stroke='none', w=3, extra=''):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{w}" {extra}/>'
def ellipse(x, y, rx, ry, fill, stroke='none', w=3, extra=''):
    return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{fill}" stroke="{stroke}" stroke-width="{w}" {extra}/>'
def rect(x, y, w, h, fill, stroke='none', sw=3, rx=24, extra=''):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>'
def group(s, x=0, y=0, scale=1, rotate=0, flip=False, extra=''):
    sx = -scale if flip else scale
    return f'<g transform="translate({x} {y}) scale({sx} {scale}) rotate({rotate})" {extra}>{s}</g>'
def arrow(x1, y1, x2, y2, color=TEAL, w=7):
    a = math.atan2(y2 - y1, x2 - x1); l = w * 2.8
    ax = x2 - l * math.cos(a - .5); ay = y2 - l * math.sin(a - .5); bx = x2 - l * math.cos(a + .5); by = y2 - l * math.sin(a + .5)
    return path(f'M{x1} {y1}L{x2} {y2}', stroke=color, w=w) + path(f'M{ax:.1f} {ay:.1f}L{x2} {y2}L{bx:.1f} {by:.1f}', stroke=color, w=w)
def face(x, y, s=1):
    return group(ellipse(-19, -6, 8, 12, '#FFFDF3') + ellipse(19, -6, 8, 12, '#FFFDF3') + ellipse(-18, -4, 4, 7, '#443232') + ellipse(18, -4, 4, 7, '#443232') + path('M-15 21Q0 36 15 21', stroke=C, w=4), x, y, s)
def mascot(x=840, y=1370, s=.7):
    q = path('M-25 82L-42 130M15 82L30 130', stroke='#92683E', w=15) + ellipse(-42, 135, 24, 12, TEAL, C) + ellipse(33, 135, 24, 12, TEAL, C)
    q += rect(-15, 25, 30, 77, '#AA764A', C, 4, 12) + path('M-60 15Q-95 30 -92 57M60 15Q90 2 104 -24', stroke=C, w=9) + circ(-92, 57, 10, '#FFD56E', C) + circ(104, -24, 10, '#FFD56E', C)
    q += circ(0, 0, 73, '#FFD56E', C, 5) + circ(0, 0, 60, 'url(#lens)', TEAL, 3) + face(0, 0, 1.3) + path('M-38 -37Q-20 -53 -5 -48', stroke='white', w=8)
    return group(q, x, y, s)
def panel(y, h=390, x=50, w=924):
    return rect(x, y, w, h, '#FFFDF6', '#E9D5B8', 3, 32)
def rbc(x, y, s=1, angle=0):
    q = ellipse(0, 0, 35, 24, 'url(#rbc)', DARK, 2.5) + ellipse(0, 0, 15, 9, '#F8AA91', extra='opacity=".8"') + path('M-22 -10Q-6 -21 16 -13', stroke='#FFCCAA', w=3)
    return group(q, x, y, s, angle)
def dot(x, y, kind, r=11):
    col = {'w': (WATER, WS), 's': ('#FFFFFF', '#8A8A8A'), 'n': ('#C9CFD8', '#737985'), 'u': (URINE, URS)}[kind]
    if kind == 'n':
        return rect(x - r, y - r, 2 * r, 2 * r, col[0], col[1], 2.5, 3)
    return circ(x, y, r, col[0], col[1], 2.5)
def protein(x, y, s=1, angle=0):
    return group(path('M-50 0q12 -26 25 0t25 0t25 0t25 0', stroke='#6D4C9F', w=13), x, y, s, angle)
def drop(x, y, s=1, fill=WATER, stroke=WS):
    return group(path('M0 -34C16 -12 25 2 25 14A25 25 0 0 1 -25 14C-25 2 -16 -12 0 -34Z', fill, stroke, 4) + path('M-10 6Q-12 18 -2 24', stroke='#FFFFFF', w=4, extra='opacity=".7"'), x, y, s)
BEAN = 'M-10 -100C45 -100 70 -60 62 -25C58 -8 38 -6 36 10C34 28 58 34 60 55C64 90 35 102 -5 102C-55 102 -72 50 -72 0C-72 -55 -55 -100 -10 -100Z'
def kidney(x, y, s=1, flip=False, rotate=0, face_on=False):
    q = path(BEAN, 'url(#kid)', KIDS, 5) + path('M-40 -60Q-55 -20 -45 30', stroke='#E99B92', w=7, extra='opacity=".7"')
    if face_on:
        q += face(-12, -5, .9)
    return group(q, x, y, s, rotate, flip)
def torso(op=1):
    return path('M416 150H608L615 220Q728 244 772 334L723 1005Q512 1094 301 1005L252 334Q296 244 409 220Z', SKIN, SKINS, 5, f'opacity="{op}"')
def spine(y0=230, y1=1010):
    q = ''
    y = y0
    while y < y1:
        q += rect(492, y, 40, 30, '#FFF6E6', '#C9A88A', 3, 9)
        y += 36
    return q
def ribs_back():
    q = ''
    for i, y in enumerate([300, 345, 390, 435, 480, 520]):
        sp = 175 - i * 8
        q += path(f'M495 {y}Q{512 - sp} {y + 4} {512 - sp - 40} {y + 70 + i * 6}M529 {y}Q{512 + sp} {y + 4} {512 + sp + 40} {y + 70 + i * 6}', stroke='#E8CFAE', w=15)
    return q
def fist(x, y, s=1):
    q = rect(-60, -45, 120, 95, '#DDA578', '#956B50', 4, 34)
    for i in range(4):
        q += path(f'M{-48 + i * 30} -40Q{-34 + i * 30} -58 {-20 + i * 30} -40', '#E7B48A', '#956B50', 4)
    q += path('M-60 0Q-82 -10 -70 -38Q-58 -50 -40 -30', '#E7B48A', '#956B50', 4)
    return group(q, x, y, s)
def bladder(x, y, fill=.5, s=1):
    ry = 40 + 60 * fill; rx = 60 + 55 * fill
    q = ellipse(0, 0, rx, ry, '#F6E7C6', '#B88A1E', 5)
    level = ry - 2 * ry * fill
    q += f'<clipPath id="bc{int(x)}{int(y)}"><ellipse cx="0" cy="0" rx="{rx - 4}" ry="{ry - 4}"/></clipPath>'
    q += f'<rect x="{-rx}" y="{level:.0f}" width="{2 * rx}" height="{2 * ry}" fill="{URINE}" clip-path="url(#bc{int(x)}{int(y)})"/>'
    q += ellipse(0, 0, rx, ry, 'none', '#B88A1E', 5)
    return group(q, x, y, s)
def brain(x, y, s=1, glow=False):
    q = (circ(0, 0, 120, 'url(#glow)') if glow else '')
    q += path('M-80 10C-110 -10 -100 -60 -60 -66C-50 -100 0 -105 20 -84C50 -100 96 -80 92 -44C120 -26 108 20 76 26C70 56 20 64 0 46C-20 66 -70 56 -80 10Z', '#F4C6CF', '#B5687A', 5)
    q += path('M-50 -40Q-20 -20 -40 10M10 -70Q0 -40 30 -20M40 0Q60 10 70 -10M-10 20Q10 0 0 -20', stroke='#D88EA0', w=5)
    return group(q, x, y, s)
def cup(x, y, s=1, fill='#D8EDFB', level=.75, stroke='#7FA9C8'):
    q = path('M-55 -80L-45 80H45L55 -80Z', '#FFFFFF', stroke, 4, 'opacity=".9"')
    top = 80 - 160 * level
    q += path(f'M{-55 + 10 * (1 - level):.0f} {top:.0f}L-45 78H45L{55 - 10 * (1 - level):.0f} {top:.0f}Z', fill, 'none', 0)
    q += path('M-55 -80L-45 80H45L55 -80', 'none', stroke, 4)
    return group(q, x, y, s)
def boy(x, y, s=1, jump=False):
    q = ''
    if not jump:
        q += rect(35, 245, 174, 22, '#CDA47A', C, 4, 8) + path('M50 260V385M195 260V385M35 245V152', stroke='#977960', w=10)
        q += path('M62 277L121 291L121 351M143 277L187 291L187 351', stroke='#314869', w=36) + ellipse(131, 369, 34, 16, '#3D6379', C) + ellipse(197, 369, 34, 16, '#3D6379', C)
    else:
        q += path('M62 277L58 360M143 277L155 360', stroke='#314869', w=44) + ellipse(47, 369, 34, 16, '#3D6379', C) + ellipse(166, 369, 34, 16, '#3D6379', C)
    q += path('M52 150Q100 126 153 150L174 265Q103 289 33 265Z', '#9ECDE4', '#43687F', 4)
    if jump:
        q += path('M48 169L10 129L-5 88M157 169L195 128L207 88', stroke='#C98D63', w=26)
    else:
        q += path('M45 175L20 225L108 241M155 175L169 232', stroke='#C98D63', w=25)
    q += circ(99, 82, 61, '#DDA16E', '#805238', 3) + ellipse(38, 89, 13, 18, '#DDA16E') + ellipse(161, 89, 13, 18, '#DDA16E')
    for xx, yy in [(43, 43), (58, 22), (84, 18), (107, 17), (135, 23), (154, 43), (125, 46), (69, 44)]:
        q += circ(xx, yy, 21, '#45312B', '#352724', 2)
    q += face(100, 91, 1.25)
    return group(q, x, y, s)
def magnifier(x, y, r, inner, s=1):
    q = f'<clipPath id="mg{int(x)}{int(y)}"><circle cx="0" cy="0" r="{r - 8}"/></clipPath>'
    q += circ(0, 0, r, '#FFFFFF', TEAL, 10) + f'<g clip-path="url(#mg{int(x)}{int(y)})">{inner}</g>' + circ(0, 0, r, 'none', TEAL, 10)
    q += path(f'M{r * .72:.0f} {r * .72:.0f}L{r * 1.12:.0f} {r * 1.12:.0f}', stroke='#8A6D4A', w=26)
    return group(q, x, y, s)


# ———— U07.L01 ————
def l01_e1():
    q = torso() + path('M330 250Q512 300 694 250', stroke='#E9C9A2', w=10)
    q += path('M330 330Q300 360 315 420M694 330Q724 360 709 420', stroke='#E3C29C', w=10)  # لوحا الكتف
    q += ribs_back() + spine()
    q += path('M560 540C620 470 700 470 720 540C700 600 620 610 560 580Z', '#A8645A', 'none', 0, 'opacity=".28"')  # الكبد خلف الأضلاع فوق اليمنى
    q += kidney(432, 640, 1.05) + kidney(594, 676, 1.05, flip=True)
    q += path('M300 700Q280 640 330 600', stroke=TEAL, w=6, extra='stroke-dasharray="4 14"') + path('M724 735Q745 675 694 636', stroke=TEAL, w=6, extra='stroke-dasharray="4 14"')
    q += panel(1110, 330) + fist(330, 1270, 1.35) + path('M455 1270H560', stroke='#C1A37C', w=6, extra='stroke-dasharray="6 12"') + kidney(690, 1270, .95, rotate=90)
    q += mascot(880, 1000, .55)
    return q

def glomerulus(cx, cy, s=1):
    q = ''
    loops = [(-40, -30, 38), (20, -40, 36), (45, 15, 34), (-10, 30, 38), (-48, 18, 30), (10, -5, 30)]
    for x, y, r in loops:
        q += circ(x, y, r, '#F3A39E', VES, 9)
    return group(q, cx, cy, s)
def l01_e2():
    inner = rect(-400, -400, 800, 800, '#FFF7EE', rx=0)
    inner += path('M-330 -40C-200 -60 -150 -40 -120 -20', stroke=VES, w=46) + path('M-330 40C-200 60 -150 40 -120 20', stroke='#B03040', w=36)
    inner += path('M-130 -150C-10 -230 170 -210 210 -60L300 -40L300 40L210 60C170 210 -10 230 -130 150', '#FFF2C9', '#C9A86A', 8)
    inner += glomerulus(0, 0, 2.1)
    for x, y, a in [(-30, -30, 10), (40, -50, -20), (60, 40, 30), (-40, 60, 0)]:
        inner += rbc(x, y, .9, a)
    inner += protein(10, 5, .9, 20) + protein(-50, -5, .8, -40)
    pts = [(150, -120, 'w'), (180, -60, 's'), (230, -10, 'n'), (200, 70, 'u'), (150, 130, 'w'), (260, 30, 'w'), (120, 170, 's'), (240, -90, 'u')]
    for x, y, k in pts:
        inner += dot(x, y, k, 12)
    inner += arrow(120, -40, 170, -60, TEAL, 6) + arrow(115, 60, 170, 90, TEAL, 6) + arrow(260, 0, 340, 0, TEAL, 8)
    q = magnifier(512, 560, 400, inner)
    q += panel(1080, 360) + path('M260 1150Q512 1330 764 1150', '#E9EEF2', '#7A8A96', 7) + path('M260 1150H764', stroke='#7A8A96', w=7)
    for i in range(14):
        q += ellipse(330 + i * 26, 1172 + (i % 3) * 8, 12, 6, '#F3E2B3', '#B79A5C', 2)
    for i, x in enumerate([420, 470, 520, 570, 620]):
        q += drop(x, 1300 + (i % 2) * 22, .55)
    q += path('M764 1150L880 1110', stroke='#7A8A96', w=12)
    q += mascot(150, 1010, .5)
    return q

def l01_e3():
    q = panel(70, 900)
    tube = 'M190 200C420 160 560 260 460 360C360 460 230 420 280 540C330 660 620 560 690 680C760 800 520 840 560 930'
    q += path(tube, stroke='#D9C089', w=58) + path(tube, stroke='#FFF4D3', w=40)
    cap = 'M150 250C420 210 520 300 420 380C320 470 190 450 240 560C290 690 650 600 730 690C810 800 560 860 600 950'
    q += path(cap, stroke=VES, w=12, extra='opacity=".85"')
    cap2 = 'M230 160C430 120 610 230 500 350C400 450 280 400 320 520C370 640 600 520 650 650C720 770 480 820 520 910'
    q += path(cap2, stroke=VES, w=12, extra='opacity=".85"')
    for x, y, tx, ty in [(300, 190, 260, 150), (420, 230, 470, 215), (420, 380, 460, 410), (300, 470, 255, 450), (330, 600, 290, 640), (520, 620, 545, 585), (640, 640, 690, 625), (600, 780, 650, 800)]:
        q += drop(x, y, .45) + arrow(x, y, tx, ty, TEAL, 4)
    for x, y in [(360, 210), (470, 330), (270, 540), (590, 610)]:
        q += circ(x, y, 9, '#FFFFFF', '#8A8A8A', 2.5)
    q += path('M560 930V990', stroke=URINE, w=12) + drop(560, 1010, .6, URINE, URS)
    q += panel(1090, 350)
    q += path('M140 1200H520V1260Q520 1360 420 1360H240Q140 1360 140 1260Z', '#FFFFFF', '#9DB7C9', 6)
    q += path('M150 1220H510V1260Q510 1350 420 1350H240Q150 1350 150 1260Z', 'url(#water)', 'none', 0)
    q += path('M180 1360L170 1395M480 1360L490 1395', stroke='#9DB7C9', w=10)
    q += path('M720 1290h40v-20h-10v-30h-20v30h-10z', '#FFF3B8', URS, 3) + rect(712, 1290, 56, 90, '#FFF3B8', URS, 4, 12) + rect(716, 1320, 48, 56, URINE, rx=8)
    q += mascot(880, 980, .5)
    return q

def liver(x, y, s=1):
    return group(path('M-150 -30C-120 -90 60 -100 150 -60C170 -20 120 40 40 60C-40 80 -150 60 -150 -30Z', '#A8645A', '#6E3B33', 5) + path('M-60 -60Q-20 0 -40 50', stroke='#C88576', w=5), x, y, s)
def plate(x, y, s=1):
    q = ellipse(0, 0, 150, 52, '#FFFFFF', '#B9A88F', 5) + ellipse(0, -4, 110, 34, '#F4EFE6')
    q += path('M-80 -10C-70 -40 -20 -40 -10 -14C-4 4 -40 14 -70 8Z', '#C7834D', '#8A5530', 4) + path('M-12 -14L22 -32', stroke='#F2E8D8', w=10) + circ(26, -34, 8, '#F2E8D8')
    for i in range(7):
        q += ellipse(40 + (i % 4) * 16, -6 + (i // 4) * 14, 9, 6, '#B85C3C', '#7A3A22', 2)
    return group(q, x, y, s)
def l01_e4():
    q = plate(512, 170, 1.1) + arrow(512, 250, 512, 330)
    q += liver(512, 420, 1.15)
    for x, y in [(600, 470), (630, 440), (650, 485)]:
        q += dot(x, y, 'u', 12)
    q += arrow(512, 510, 512, 590)
    q += path('M200 650H824', stroke=VES, w=60) + path('M200 650H824', stroke='#F07A80', w=26, extra='opacity=".6"')
    for x in [300, 400, 520, 640, 740]:
        q += dot(x, 650, 'u', 12)
    q += rbc(350, 640, .6) + rbc(590, 660, .6)
    q += arrow(512, 700, 512, 790)
    q += kidney(420, 930, 1) + kidney(604, 930, 1, flip=True)
    q += path('M455 940Q470 1040 512 1090M569 940Q554 1040 512 1090', stroke='#D9C089', w=14)
    q += path('M512 1090V1150', stroke=URINE, w=12) + drop(512, 1185, .7, URINE, URS)
    q += mascot(820, 1300, .6)
    return q

def gauge(x, y, s=1):
    q = circ(0, 0, 60, '#FFFFFF', C, 5) + path('M-40 20A45 45 0 0 1 40 20', stroke='#9ED9C7', w=10) + path('M0 10L28 -28', stroke=RED, w=7) + circ(0, 10, 7, C)
    q += path('M60 0Q110 10 100 70Q90 110 40 100', stroke='#5E6A75', w=8) + ellipse(40, 104, 26, 18, '#5E6A75')
    return group(q, x, y, s)
def bone(x, y, s=1, angle=0):
    q = path('M-80 -12H80M-80 12H80', stroke='#F2E8D8', w=1) + rect(-80, -16, 160, 32, '#F6EEDD', '#A9977C', 4, 14)
    for cx in (-86, 86):
        q += circ(cx, -16, 20, '#F6EEDD', '#A9977C', 4) + circ(cx, 16, 20, '#F6EEDD', '#A9977C', 4)
    q += rect(-78, -14, 156, 28, '#F6EEDD', rx=12)
    return group(q, x, y, s, angle)
def l01_e5():
    q = path('M512 700V420', stroke='#8A7A68', w=18) + path('M420 710H604', stroke='#8A7A68', w=22)
    q += path('M220 420H804', stroke='#8A7A68', w=14) + circ(512, 420, 18, '#C9B79F', '#8A7A68', 4)
    q += path('M220 420L170 560H270Z', 'none', '#8A7A68', 4) + path('M804 420L754 560H854Z', 'none', '#8A7A68', 4)
    q += path('M140 560Q220 620 300 560Z', '#F4EDE1', '#8A7A68', 5) + path('M724 560Q804 620 884 560Z', '#F4EDE1', '#8A7A68', 5)
    q += drop(220, 530, .9) + group(rect(-30, -30, 60, 60, '#F3F6FA', '#8C96A3', 4, 6) + path('M-30 -30L0 -46L30 -30M30 -30L30 30', stroke='#8C96A3', w=4), 804, 530)
    q += kidney(470, 330, .75) + kidney(554, 330, .75, flip=True)
    q += gauge(220, 900, 1) + rbc(512, 900, 1.6) + bone(800, 900, .9, -20)
    q += boy(330, 1080, .9, jump=True) + circ(650, 1430, 40, '#FFFFFF', C, 5) + path('M620 1420L650 1405L680 1420L670 1450H630Z', '#3A3A3A')
    q += mascot(860, 1300, .5)
    return q

def nephron(x, y, s=1, faint=False):
    op = 'opacity=".25"' if faint else ''
    q = glomerulus(0, 0, .55) + path('M-60 -40C-40 -80 40 -80 60 -40', stroke='#C9A86A', w=8)
    t = 'M50 -30C120 -60 160 0 110 30C60 60 140 100 170 60C200 20 240 60 230 120L230 420Q250 470 270 420L270 170C280 120 330 120 340 170C360 220 300 240 330 290L330 520'
    q += path(t, stroke='#D9C089', w=22) + path(t, stroke='#FFF4D3', w=12)
    q += path('M330 520L330 640', stroke=URINE, w=14)
    q += path('M-10 -60C60 -120 200 -90 250 0C280 60 210 120 240 160L240 440', stroke=VES, w=5, extra='opacity=".7"')
    return group(q, x, y, s, extra=op)
def l01_e6():
    k = 'M-10 -300C140 -300 200 -170 180 -70C170 -20 110 -15 105 30C100 80 170 100 175 160C185 260 100 300 -15 300C-160 300 -210 150 -210 0C-210 -160 -160 -300 -10 -300Z'
    q = group(path(k, 'url(#kid)', KIDS, 7), 330, 640)
    q += group(path('M-10 -250C110 -250 160 -150 140 -70C120 0 120 60 135 150C140 240 80 255 -10 255C-130 255 -170 130 -170 0C-170 -130 -130 -250 -10 -250Z', '#C76A64', 'none', 0), 330, 640)
    for ang in [-60, -25, 10, 45, 80]:
        q += group(path('M0 0L-30 -110L30 -110Z', '#8E3A3D', 'none', 0), 400, 640, 1, ang - 90 + 180)
    q += path('M430 600Q480 640 430 680', '#F3E2D0', '#B79A80', 4) + path('M460 640Q520 700 540 900', stroke='#D9C089', w=26)
    q += path('M150 640H140', stroke='none')
    inner = rect(-300, -300, 600, 600, '#FFF7EE', rx=0)
    for (nx, ny) in [(-250, -220), (-150, 120), (120, -240), (180, 140)]:
        inner += nephron(nx, ny, .45, faint=True)
    inner += nephron(-170, -150, .8)
    q += magnifier(720, 380, 250, inner)
    q += path('M500 520L560 470', stroke=TEAL, w=6, extra='stroke-dasharray="4 14"')
    q += mascot(850, 1250, .6)
    return q


# ———— U07.L02 ————
def l02_e1():
    q = torso() + path('M330 330Q512 380 694 330', stroke='#E9C9A2', w=8)
    # من الأمام: يمين صاحب الجسم على يسار الناظر، فالكلية اليسرى في الرسم (اليمنى في الجسم) أنزل قليلاً
    q += group(kidney(0, 0, .95), 420, 590, extra='opacity=".9"') + group(kidney(0, 0, .95, flip=True), 604, 560, extra='opacity=".9"')
    q += path('M455 610C470 720 450 830 480 930', stroke='#D9B07A', w=16) + path('M569 580C556 700 576 820 545 930', stroke='#D9B07A', w=16)
    q += path('M380 930Q512 870 644 930Q660 1000 512 1010Q364 1000 380 930Z', 'none', '#D7BFA2', 6)  # الحوض
    q += bladder(512, 960, .55, .8)
    q += path('M512 1010V1045', stroke='#D9B07A', w=14)
    q += rect(170, 560, 56, 380, '#FFF3C4', '#C9A44C', 4, 8)
    for i in range(13):
        q += path(f'M170 {580 + i * 28}h{22 if i % 2 else 34}', stroke='#9C7D2F', w=3)
    q += mascot(860, 1250, .6)
    return q

def l02_e2():
    q = panel(80, 1000)
    xs = 512
    for i in range(9):
        y = 150 + i * 95
        squeeze = i == 4
        w = 34 if squeeze else 64
        q += rect(xs - w / 2, y, w, 90, '#E7B8A6', '#A86F5B', 4, 30)
        q += path(f'M{xs - w / 2 - 6} {y + 45}h{w + 12}', stroke='#C58D79', w=5)
    q += ellipse(xs, 150 + 5.6 * 95, 22, 30, URINE, URS, 4)
    q += arrow(640, 520, 640, 700, TEAL, 8) + arrow(384, 520, 384, 700, TEAL, 8)
    q += path('M430 480Q470 520 470 560M594 480Q554 520 554 560', stroke='#A86F5B', w=6)
    q += panel(1130, 300)
    for i in range(6):
        x = 260 + i * 80; w = 34 if i == 3 else 60
        q += rect(x, 1280 - w / 2, 76, w, '#E7B8A6', '#A86F5B', 4, 26)
    q += ellipse(260 + 4.4 * 80, 1280, 26, 18, URINE, URS, 4) + arrow(560, 1350, 700, 1350, TEAL, 6)
    q += mascot(860, 1180, .5)
    return q

def l02_e3():
    q = ''
    for i, (fill, link, glow) in enumerate([(.08, False, False), (.45, True, False), (.85, True, True)]):
        y0 = 80 + i * 470
        q += panel(y0, 430)
        q += bladder(330, y0 + 290, fill, .95)
        q += brain(760, y0 + 120, .8, glow)
        if link:
            q += path(f'M400 {y0 + 220}Q600 {y0 + 220} 720 {y0 + 190}', stroke=RED if glow else '#E58A8A', w=8, extra='stroke-dasharray="14 12"')
    q += mascot(880, 1420, .45)
    return q

def l02_e4():
    q = panel(80, 860)
    q += bladder(512, 420, .7, 1.6)
    q += path('M512 600V760', stroke='#D9B07A', w=26)
    for r, op in [(46, 1), (36, .7)]:
        q += ellipse(512, 640, r + 20, r - 8, 'none', '#B5687A', 14, f'opacity="{op}"')
    q += panel(990, 440)
    q += rect(250, 1060, 200, 300, '#C99A6B', '#7E5A3A', 6, 10) + circ(410, 1220, 12, '#FFD56E', '#7E5A3A', 4) + rect(404, 1225, 12, 26, '#7E5A3A', rx=4)
    q += group(path('M0 0H90M70 0V20M50 0V16', stroke='#C9A227', w=10) + circ(-22, 0, 24, 'none', '#C9A227', 10), 560, 1220)
    q += path('M640 1240Q700 1200 760 1230L800 1250', '#DDA578', '#956B50', 6) + path('M650 1250Q700 1290 760 1260', stroke='#956B50', w=5)
    q += group(rect(-80, -10, 160, 70, 'none', '#D7C4A8', 5, 10) + path('M-80 -10V-60M80 -10V-60M-60 -10V-50M-40 -10V-50M-20 -10V-50M0 -10V-50M20 -10V-50M40 -10V-50M60 -10V-50', stroke='#D7C4A8', w=4), 820, 1380, .8, extra='opacity=".6"')
    q += mascot(150, 900, .45)
    return q

def l02_e5():
    q = rect(80, 760, 864, 30, '#D9BFA0', '#A88B6A', 4, 10)
    cols = ['#FBF9E6', '#F6EDA0', '#F1D55A', '#E0AE3A', '#C27F26']
    for i, c in enumerate(cols):
        q += cup(180 + i * 166, 660, 1.05, c, .72, '#A8B9C6')
    q += group(path('M0 0L80 -30L95 10L20 40Z', '#BFE3FB', WS, 4), 720, 380, 1.2) + path('M806 392Q830 460 812 520', stroke=WATER, w=10) + cup(812, 560, .7, '#D8EDFB', .3)
    q += rect(200, 900, 150, 70, '#FFF4FB', '#C996B4', 4, 30) + circ(240, 890, 14, '#FFFFFF', '#C996B4', 3) + circ(270, 878, 10, '#FFFFFF', '#C996B4', 3)
    q += rect(420, 880, 140, 110, '#BFE7FF', '#6FA6C6', 4, 16) + path('M430 900H550M430 930H550', stroke='#FFFFFF', w=6)
    q += mascot(820, 1180, .6)
    return q

def l02_e7():
    q = panel(80, 1300, 50, 430) + panel(80, 1300, 544, 430)
    q += rect(110, 160, 300, 300, '#D8EEFB', '#9DB7C9', 6, 10) + path('M260 160V460M110 310H410', stroke='#9DB7C9', w=6)
    q += circ(260, 760, 120, '#FFF6D8', '#9DB7C9', 6) + path('M230 645V600H290V645', '#FFFFFF', '#9DB7C9', 5)
    q += f'<clipPath id="fl"><circle cx="260" cy="760" r="112"/></clipPath><rect x="140" y="720" width="240" height="160" fill="{URINE}" clip-path="url(#fl)" opacity=".85"/>'
    q += path('M180 1000H340M200 1040H320', stroke='#C9B79F', w=8)
    q += rect(640, 220, 50, 560, '#FFFFFF', '#9DB7C9', 4, 10)
    for i, c in enumerate(['#F2D25C', '#8FC9A3', '#E7A6C1', '#9EC1E6', '#F0B37E', '#C5A3E0']):
        q += rect(650, 250 + i * 80, 30, 50, c, '#7C8A96', 2, 6)
    q += group(rect(-30, -160, 60, 200, '#5E6A75', C, 4, 12) + rect(-90, 40, 180, 40, '#5E6A75', C, 4, 10) + circ(0, -40, 18, '#BFE7FF', C, 4) + rect(-60, -20, 60, 20, '#8A96A3', C, 3, 6) + path('M30 -150L70 -200', stroke='#5E6A75', w=26), 800, 1000, 1.2)
    q += arrow(440, 620, 600, 620, TEAL, 8)
    q += mascot(860, 1350, .45)
    return q


# ———— U07.L03 ————
def child(x, y, s=1, level=.55, baby=False):
    body = 'M0 -260C55 -260 75 -215 70 -175C65 -140 40 -125 40 -110C110 -95 130 -60 130 20L120 230H70L60 400H-60L-70 230H-120L-130 20C-130 -60 -110 -95 -40 -110C-40 -125 -65 -140 -70 -175C-75 -215 -55 -260 0 -260Z'
    if baby:
        body = 'M0 -170C60 -170 80 -120 70 -85C120 -70 135 -20 130 40L110 170H-110L-130 40C-135 -20 -120 -70 -70 -85C-80 -120 -60 -170 0 -170Z'
    top, bot = (-170, 170) if baby else (-260, 400)
    lv = bot - (bot - top) * level
    cid = f'cl{int(x)}{int(y)}'
    q = path(body, '#FFF6EA', SKINS, 5) + f'<clipPath id="{cid}"><path d="{body}"/></clipPath><rect x="-140" y="{lv:.0f}" width="280" height="{bot - lv + 10:.0f}" fill="url(#water)" clip-path="url(#{cid})" opacity=".85"/>' + path(body, 'none', SKINS, 5)
    return group(q, x, y, s)
def cells_zoom():
    inner = rect(-300, -300, 600, 600, '#FFF7EE', rx=0)
    for cx, cy in [(-150, -150), (0, -170), (150, -140), (-170, 10), (170, 20), (-120, 160), (30, 170), (170, 170)]:
        inner += path(f'M{cx - 70} {cy}C{cx - 70} {cy - 60} {cx + 70} {cy - 60} {cx + 70} {cy}C{cx + 70} {cy + 60} {cx - 70} {cy + 60} {cx - 70} {cy}Z', '#CFE8FB', '#7FA9C8', 5) + circ(cx, cy, 18, '#C6B3DE', '#8D73B3', 3)
    inner += path('M-300 40C-100 0 100 80 300 40', stroke=VES, w=34) + path('M-300 40C-100 0 100 80 300 40', stroke='#F6A3A6', w=12, extra='opacity=".7"')
    return inner
def l03_e1():
    q = child(330, 760, 1.25, .55) + child(780, 1150, .95, .75, baby=True)
    q += magnifier(760, 400, 230, cells_zoom())
    q += path('M380 620L560 520', stroke=TEAL, w=6, extra='stroke-dasharray="4 14"')
    q += mascot(150, 1380, .45)
    return q

def breath(x, y, s=1):
    return group(path('M-60 0C-80 -40 -30 -70 0 -50C20 -80 80 -70 76 -30C110 -20 100 30 60 30H-40C-80 30 -90 10 -60 0Z', '#EEF6FB', '#9DB7C9', 4), x, y, s)
def l03_e2():
    q = path('M512 1100V500', stroke='#8A7A68', w=22) + path('M380 1110H644', stroke='#8A7A68', w=26)
    q += path('M150 500H874', stroke='#8A7A68', w=16) + circ(512, 500, 22, '#C9B79F', '#8A7A68', 4)
    q += path('M200 500L130 700M200 500L270 700M824 500L754 700M824 500L894 700', stroke='#8A7A68', w=4)
    q += path('M100 700Q200 780 300 700Z', '#FDEFD0', '#D9A23A', 5) + path('M724 700Q824 780 924 700Z', '#DCEEFB', '#5DA9E9', 5)
    q += cup(774, 640, .55, '#D8EDFB', .8) + group(ellipse(0, 0, 50, 24, '#FFFFFF', '#B9A88F', 4) + path('M-36 -6A40 30 0 0 1 36 -6Z', '#E85B54', '#2E7D4F', 5), 852, 672) + drop(892, 620, .45)
    q += group(path('M0 -18l6 0 3 -8 8 4 -2 8 6 6 -6 6 2 8 -8 4 -3 -8h-6l-3 8 -8 -4 2 -8 -6 -6 6 -6 -2 -8 8 -4z', '#C9CFD8', '#737985', 2), 892, 590, 1.3)
    q += drop(146, 640, .8, URINE, URS) + drop(206, 660, .35) + drop(231, 640, .3) + breath(236, 600, .55) + path('M276 680q10 -20 0 -40', stroke='#9DB7C9', w=4)
    q += boy(380, 1150, .8)
    q += mascot(880, 1300, .45)
    return q

def head_profile(x, y, s=1):
    q = path('M-150 -60C-150 -200 40 -240 120 -150C170 -90 150 -20 170 20C175 40 150 50 150 70C155 100 130 110 120 130C110 160 60 170 20 160L10 260H-120L-110 120C-160 70 -150 0 -150 -60Z', '#F2C9A2', '#A57B5C', 5)
    q += path('M150 70Q130 90 110 82', stroke='#A57B5C', w=5) + circ(70, -40, 10, '#443232')
    return group(q, x, y, s)
def l03_e3():
    q = head_profile(430, 760, 1.6)
    q += circ(390, 700, 110, 'url(#glow)') + group(brain(0, 0, .9), 330, 600, extra='opacity=".9"') + circ(390, 700, 22, '#FFD56E', '#C9A227', 4)
    q += path('M640 900q20 10 30 0', stroke='#C98A6A', w=6)
    q += circ(760, 420, 70, '#FFFFFF', '#C9B79F', 5) + circ(700, 520, 24, '#FFFFFF', '#C9B79F', 4) + circ(670, 570, 14, '#FFFFFF', '#C9B79F', 3) + cup(760, 420, .45, '#D8EDFB', .8)
    q += circ(180, 200, 70, '#FFD56E', '#E3A72F', 5)
    for a in range(0, 360, 45):
        r = math.radians(a); q += path(f'M{180 + 90 * math.cos(r):.0f} {200 + 90 * math.sin(r):.0f}L{180 + 120 * math.cos(r):.0f} {200 + 120 * math.sin(r):.0f}', stroke='#E3A72F', w=8)
    q += mascot(850, 1300, .55)
    return q

def envelope(x, y, s=1):
    return group(rect(-40, -26, 80, 52, '#FFFFFF', '#8A7A68', 4, 6) + path('M-40 -26L0 6L40 -26', stroke='#8A7A68', w=4), x, y, s)
def l03_e4():
    q = brain(512, 180, 1.1) + circ(512, 250, 16, '#FFD56E', '#C9A227', 4)
    q += path('M512 260C520 420 480 520 512 640', stroke=VES, w=36) + path('M512 260C520 420 480 520 512 640', stroke='#F6A3A6', w=12, extra='opacity=".7"')
    q += envelope(505, 450, 1.1)
    q += kidney(440, 720, .85) + kidney(584, 720, .85, flip=True)
    q += panel(880, 520, 60, 430) + panel(880, 520, 534, 430)
    q += drop(275, 1040, 1.4, '#E0AE3A', '#9A6E1A') + envelope(275, 1220, .9) + arrow(180, 1330, 370, 1330, TEAL, 6)
    q += cup(700, 1010, .7, '#D8EDFB', .85) + cup(800, 1010, .7, '#D8EDFB', .85) + drop(750, 1200, 1.5, '#F6EDA0', '#C9A227')
    q += path('M690 1300L810 1340M810 1300L690 1340', stroke='#C65A5A', w=6) + group(envelope(0, 0, .6), 750, 1320, extra='opacity=".45"')
    q += mascot(150, 600, .45)
    return q

def bottle(x, y, s=1):
    q = rect(-40, -130, 80, 250, '#DCEEFB', WS, 5, 28) + rect(-22, -170, 44, 44, '#7FB3E6', WS, 4, 8) + rect(-36, -40, 72, 150, 'url(#water)', rx=20)
    return group(q, x, y, s)
def l03_e5():
    q = rect(80, 720, 864, 30, '#D9BFA0', '#A88B6A', 4, 10)
    for i in range(7):
        q += cup(150 + i * 118, 640, .62, '#D8EDFB', .8)
    q += group(path('M-150 0C-150 -130 150 -130 150 0V200H-150Z', '#F2A65A', '#A9652A', 6) + rect(-100, 30, 200, 120, '#F7C38A', '#A9652A', 4, 18), 300, 1100, .9)
    q += bottle(330, 1000, .9)
    q += group(rect(-40, -70, 80, 140, '#F59E3C', '#A9652A', 4, 8) + rect(-30, -50, 60, 40, '#FFE1B0', rx=6) + path('M20 -70L40 -110', stroke='#7C7C7C', w=6), 640, 1080) + group(rect(-38, -80, 76, 160, '#D85050', '#8A2A2A', 4, 20) + rect(-38, -20, 76, 40, '#F2F2F2', rx=4), 760, 1080)
    for x in [620, 650, 740, 770, 800]:
        q += rect(x, 950, 28, 28, '#FFFFFF', '#B9B9B9', 3, 5)
    q += path('M580 1180L840 960', stroke='#C65A5A', w=7, extra='opacity=".55"')
    q += circ(860, 300, 60, '#FFD56E', '#E3A72F', 5) + circ(200, 300, 46, '#FFFFFF', C, 5) + path('M175 290L200 270L225 290L215 320H185Z', '#3A3A3A')
    q += group(circ(0, 0, 40, '#FFF27A', '#C9B43A', 5) + path('M0 0L0 -36M0 0L31 -18M0 0L31 18M0 0L0 36M0 0L-31 18M0 0L-31 -18', stroke='#E4D45A', w=4), 512, 520)
    q += mascot(880, 1350, .45)
    return q

def ac_unit(x, y, s=1):
    q = rect(-140, -50, 280, 100, '#F6F8FA', '#8C96A3', 5, 18) + path('M-110 20H110M-110 34H110', stroke='#B9C2CC', w=5) + circ(110, -20, 8, '#8FC9A3')
    q += path('M-80 70q10 30 0 60M0 70q10 30 0 60M80 70q10 30 0 60', stroke='#9EC1E6', w=6)
    return group(q, x, y, s)
def l03_e6():
    cx, cy, R = 512, 640, 330
    pts = [(-90, 'brain'), (0, 'gland'), (90, 'kidney'), (180, 'blood')]
    q = circ(cx, cy, R, 'none', '#E9D5B8', 10, 'stroke-dasharray="2 22"')
    for i, (a, _) in enumerate(pts):
        a1 = math.radians(a + 25); a2 = math.radians(a + 65)
        q += arrow(cx + R * math.cos(a1), cy + R * math.sin(a1), round(cx + R * math.cos(a2)), round(cy + R * math.sin(a2)), TEAL, 9)
    q += brain(cx, cy - R, .8) + circ(cx, cy - R + 50, 12, '#FFD56E', '#C9A227', 4)
    q += circ(cx + R, cy, 60, '#F4C6CF', '#B5687A', 5) + envelope(cx + R, cy + 4, .8)
    q += kidney(cx - 40, cy + R, .55) + kidney(cx + 40, cy + R, .55, flip=True)
    q += drop(cx - R, cy, 1.5, '#9FCBEF', WS)
    q += ac_unit(512, 1250, 1.2)
    q += group(rect(-12, -70, 24, 110, '#FFFFFF', '#8C96A3', 4, 12) + circ(0, 50, 22, '#E85B54', '#8C96A3', 4) + rect(-5, -20, 10, 70, '#E85B54', rx=4), 780, 1250)
    q += mascot(170, 1360, .45)
    return q


DIAGRAMS = {
    'U07.L01-E1': l01_e1, 'U07.L01-E2': l01_e2, 'U07.L01-E3': l01_e3, 'U07.L01-E4': l01_e4, 'U07.L01-E5': l01_e5, 'U07.L01-E6': l01_e6,
    'U07.L02-E1': l02_e1, 'U07.L02-E2': l02_e2, 'U07.L02-E3': l02_e3, 'U07.L02-E4': l02_e4, 'U07.L02-E5': l02_e5, 'U07.L02-E7': l02_e7,
    'U07.L03-E1': l03_e1, 'U07.L03-E2': l03_e2, 'U07.L03-E3': l03_e3, 'U07.L03-E4': l03_e4, 'U07.L03-E5': l03_e5, 'U07.L03-E6': l03_e6,
}


def render(items):
    from playwright.sync_api import sync_playwright
    out = []
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1024, 'height': 1536})
        for name, body in items:
            svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1536" viewBox="0 0 1024 1536">{defs}<rect width="1024" height="1536" fill="url(#paper)"/>{body}</svg>'
            (HERE / (name + '.svg')).write_text(svg, encoding='utf-8')
            pg.set_content(f'<html><body style="margin:0">{svg}</body></html>')
            png = pg.screenshot(clip={'x': 0, 'y': 0, 'width': 1024, 'height': 1536})
            with Image.open(io.BytesIO(png)) as im:
                buf = io.BytesIO(); im.convert('RGB').save(buf, 'WEBP', quality=92, method=6)
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
    names = sys.argv[1:] or list(DIAGRAMS)
    made = render([(n, DIAGRAMS[n]()) for n in names])
    record(made)
    for fn, d in made:
        print(fn, len(d) // 1024, 'KB')
