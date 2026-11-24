# -*- coding: utf-8 -*-
"""رسوم الوحدة U08 التعليمية (SVG ← WebP 1024×1536) بأسلوب رسوم U06 وU07 المتجهية نفسه.
الاستعمال: python3 art-sources/U08/sources/build_u08.py [أسماء…]   (بلا أسماء: كلها)
يكتب المصدر في art-sources/U08/sources/<الاسم>.svg والصورة في app/v2/img/<الاسم>.webp، ويُحدّث status.csv وchecksums.json.
الأدوات المشتركة (المسار والدائرة واللوحة ولمّاح والدماغ…) من build_u07.py. لا كتابة ولا أرقام داخل الرسوم.
حين يُستبدل المشهد بتفاعل خاص تُكمّله الصورة ولا تكرّره (مثلاً: صورة طفل يقرأ والضوء يدخل عينه فوق تفاعل «طريق الضوء»).
"""
from pathlib import Path
import math, sys, io, json, hashlib, csv, importlib.util

HERE = Path(__file__).resolve().parent
ART = HERE.parent
REPO = ART.parent.parent
IMG = REPO / 'app' / 'v2' / 'img'
_spec = importlib.util.spec_from_file_location('u07', REPO / 'art-sources' / 'U07' / 'sources' / 'build_u07.py')
u07 = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(u07)
path, circ, ellipse, rect, group, arrow, face, mascot, panel = u07.path, u07.circ, u07.ellipse, u07.rect, u07.group, u07.arrow, u07.face, u07.mascot, u07.panel
brain, boy, magnifier, envelope, head_profile, kidney, drop = u07.brain, u07.boy, u07.magnifier, u07.envelope, u07.head_profile, u07.kidney, u07.drop
C, TEAL, RED, SKIN, SKINS, VES = u07.C, u07.TEAL, u07.RED, u07.SKIN, u07.SKINS, u07.VES
CORAL = '#E8765F'; NERVE = '#F2C14E'; NERVES = '#C9952B'; BLUE = '#3E7BB6'; GREEN = '#2E9E6A'
CEREB = '#C9B3E6'; CEREBS = '#7B5FA8'; STEM = '#F3B27A'; STEMS = '#B0703D'; NIGHT = '#2C3E66'
defs = u07.defs.replace('</defs>', '''<radialGradient id="iris"><stop offset=".35" stop-color="#9C6A3C"/><stop offset="1" stop-color="#5E3A1E"/></radialGradient>
<radialGradient id="irisg"><stop offset=".35" stop-color="#7FB26B"/><stop offset="1" stop-color="#3F7A3A"/></radialGradient>
<radialGradient id="irisb"><stop offset=".35" stop-color="#8CC3E8"/><stop offset="1" stop-color="#3D79A8"/></radialGradient>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#22325A"/><stop offset="1" stop-color="#3D5288"/></linearGradient>
<radialGradient id="alarm"><stop stop-color="#FF8A6B" stop-opacity=".95"/><stop offset="1" stop-color="#FF8A6B" stop-opacity="0"/></radialGradient>
</defs>''')


# ———— أدوات U08 ————
def limb(d, w=62):
    return path(d, stroke=SKINS, w=w + 8) + path(d, stroke=SKIN, w=w)
def kid_front(op=1, x=0, y=0, s=1):
    """طفل من الأمام: الرأس في (512,210)، الجذع 360–780، الساقان إلى 1180."""
    q = limb('M398 390L320 560L292 760') + limb('M626 390L704 560L732 760') + limb('M440 770L430 1170', 74) + limb('M584 770L594 1170', 74)
    q += path('M392 360Q512 336 632 360L662 770Q512 812 362 770Z', '#9ECDE4', '#43687F', 5)
    q += rect(472, 300, 80, 70, SKIN, SKINS, 5, 20) + circ(512, 210, 122, SKIN, SKINS, 5)
    q += path('M392 168Q420 70 512 76Q604 70 632 168Q600 120 512 122Q424 120 392 168Z', '#45312B', '#352724', 3)
    return group(q, x, y, s, extra=f'opacity="{op}"')
def nerve(d, w=7):
    return path(d, stroke=NERVES, w=w + 3) + path(d, stroke=NERVE, w=w)
def brain_side(x, y, s=1, op=1, hi=None):
    """دماغ من الجانب، والوجه إلى اليمين: المخ والمخيخ وجذع الدماغ. hi: ما يُظلَّل."""
    q = path('M-170 40C-200 -40 -150 -140 -40 -150C40 -175 150 -130 175 -40C200 30 150 80 90 80L-110 90C-150 90 -165 70 -170 40Z', '#F4C6CF', '#B5687A', 6)
    q += path('M-120 -60Q-80 -100 -30 -80M0 -120Q20 -70 70 -90M100 -40Q140 -20 130 30M-60 0Q-20 -30 20 0Q60 30 100 10M-140 20Q-100 40 -60 30', stroke='#D88EA0', w=6)
    q += path('M-160 70C-170 120 -120 150 -70 140C-40 132 -40 95 -70 85Z', CEREB, CEREBS, 5) + path('M-150 105Q-110 100 -80 120M-145 125Q-110 125 -85 135', stroke=CEREBS, w=3)
    q += path('M-50 75C-40 120 -45 170 -40 230L0 230C0 170 10 120 20 80Z', STEM, STEMS, 5)
    if hi:
        cols = {'cer': ('#F4C6CF', 'cerebrum'), 'cbl': (CEREB, 'cerebellum'), 'stm': (STEM, 'stem')}
    return group(q, x, y, s, extra=f'opacity="{op}"')
def bell(x, y, s=1, ring=True):
    q = (circ(0, 0, 90, 'url(#alarm)') if ring else '') + path('M-38 20C-38 -30 -26 -48 0 -50C26 -48 38 -30 38 20L48 32H-48Z', '#FFC93C', '#C9952B', 5) + circ(0, 40, 10, '#C9952B') + circ(0, -54, 7, '#C9952B')
    if ring:
        q += path('M-62 -30Q-74 0 -62 30M62 -30Q74 0 62 30M-80 -42Q-96 0 -80 42M80 -42Q96 0 80 42', stroke=RED, w=6)
    return group(q, x, y, s)
def heart(x, y, s=1, fill=RED):
    return group(path('M0 40C-60 0 -70 -40 -40 -55C-20 -64 -5 -50 0 -38C5 -50 20 -64 40 -55C70 -40 60 0 0 40Z', fill, '#A8333B', 5), x, y, s)
def lungs(x, y, s=1):
    return group(ellipse(-48, 0, 40, 70, '#F4A9B8', '#C9788A', 5) + ellipse(48, 0, 40, 70, '#F4A9B8', '#C9788A', 5) + path('M0 -90V-30M0 -30L-30 -10M0 -30L30 -10', stroke='#C9788A', w=8), x, y, s)
def pulse(x, y, w, fast=True, col=RED):
    d = f'M{x} {y}'; step = 70 if fast else 170; xx = x
    while xx + step <= x + w:
        d += f'L{xx + step * .35:.0f} {y}L{xx + step * .45:.0f} {y - 60}L{xx + step * .55:.0f} {y + 40}L{xx + step * .65:.0f} {y}L{xx + step:.0f} {y}'; xx += step
    return path(d, stroke=col, w=6)
def eye_front(x, y, s=1, pr=58, iris='url(#iris)'):
    q = path('M-260 0Q0 -190 260 0Q0 190 -260 0Z', '#FFFFFF', '#8A6A55', 6)
    q += f'<clipPath id="ef{int(x)}{int(y)}"><path d="M-256 0Q0 -186 256 0Q0 186 -256 0Z"/></clipPath>'
    q += f'<g clip-path="url(#ef{int(x)}{int(y)})">' + circ(0, 0, 135, iris, '#4A2E18', 4) + circ(0, 0, pr, '#151515') + circ(-34, -38, 20, '#FFFFFF', extra='opacity=".85"') + '</g>'
    q += path('M-260 0Q0 -190 260 0', stroke='#5A3A2A', w=12)
    for i in range(9):
        t = -0.8 + i * 0.2; px = 260 * t; py = -95 * (1 - t * t) - 2
        q += path(f'M{px:.0f} {py:.0f}l{px * .08:.0f} -34', stroke='#3A2418', w=7)
    q += path('M-230 -170Q0 -260 230 -170', stroke='#5A3A2A', w=22)
    return group(q, x, y, s)
def eye_section(cx, cy, R, lens_ry=.3, disc=False, rays=None, iris_gap=.14):
    """مقطع العين والضوء يأتي من اليمين: القرنية يميناً والعصب البصري يساراً."""
    q = circ(cx, cy, R, '#FDFBF7', '#B8A89A', 7)
    a0, a1 = math.radians(125), math.radians(235)
    q += path(f'M{cx + (R - 10) * math.cos(a0):.0f} {cy - (R - 10) * math.sin(a0):.0f}A{R - 10} {R - 10} 0 0 0 {cx + (R - 10) * math.cos(a1):.0f} {cy - (R - 10) * math.sin(a1):.0f}', stroke=RED, w=16)
    q += path(f'M{cx + R * .88:.0f} {cy - R * .45:.0f}Q{cx + R * 1.22:.0f} {cy} {cx + R * .88:.0f} {cy + R * .45:.0f}', '#E8F5FF', '#7FB8E0', 6, 'fill-opacity=".6"')
    ix = cx + R * .78
    q += path(f'M{ix:.0f} {cy - R * .5:.0f}V{cy - R * iris_gap:.0f}M{ix:.0f} {cy + R * iris_gap:.0f}V{cy + R * .5:.0f}', stroke='#7A5230', w=16)
    q += ellipse(cx + R * .6, cy, R * .12, R * lens_ry, '#CFE8FF', '#6FA6D6', 5)
    q += path(f'M{cx - R + 8:.0f} {cy}L{cx - R - 150:.0f} {cy}', stroke=NERVES, w=34) + path(f'M{cx - R + 8:.0f} {cy}L{cx - R - 150:.0f} {cy}', stroke=NERVE, w=24)
    if disc:
        q += circ(cx - R + 6, cy, 26, '#FFF1B8', '#C9952B', 5)
    for r in (rays or []):
        q += path(r, stroke='#F2A900', w=6, extra='opacity=".9"')
    return q
def tree(x, y, s=1, flip=False):
    return group(rect(-14, 0, 28, 110, '#8B5A2B', rx=6) + circ(0, -30, 70, '#5BB36A', '#3F8A4C', 4) + circ(0, -100, 40, '#5BB36A', '#3F8A4C', 4), x, y, s, 180 if flip else 0)
def book(x, y, s=1, col=CORAL):
    return group(path('M-90 -60L0 -40L90 -60V60L0 80L-90 60Z', '#FFFFFF', '#8A7A68', 5) + path('M0 -40V80', stroke='#8A7A68', w=4) + path('M-70 -30L-20 -20M-70 -5L-20 5M-70 20L-20 30M20 -20L70 -30M20 5L70 -5M20 30L70 20', stroke='#C9BBA8', w=5) + rect(-96, 60, 192, 14, col, rx=6), x, y, s)
def sun(x, y, r=70):
    q = circ(x, y, r, '#FFD56E', '#E3A72F', 5)
    for a in range(0, 360, 45):
        t = math.radians(a); q += path(f'M{x + (r + 20) * math.cos(t):.0f} {y + (r + 20) * math.sin(t):.0f}L{x + (r + 50) * math.cos(t):.0f} {y + (r + 50) * math.sin(t):.0f}', stroke='#E3A72F', w=9)
    return q
def moon(x, y, r=60):
    return path(f'M{x} {y - r}A{r} {r} 0 1 0 {x} {y + r}A{r * .75:.0f} {r * .75:.0f} 0 1 1 {x} {y - r}Z', '#FFF3B0', '#D9B84A', 4)
def star(x, y, r=14, col='#FFE98A'):
    pts = []
    for i in range(10):
        a = math.radians(-90 + i * 36); rr = r if i % 2 == 0 else r * .45
        pts.append(f'{x + rr * math.cos(a):.1f} {y + rr * math.sin(a):.1f}')
    return path('M' + 'L'.join(pts) + 'Z', col, '#D9B84A', 2)
def ear_scene(x, y, s=3):
    """مقطع الأذن من مشهد U08.L03 (viewBox 320×230) مكبَّراً."""
    q = ('<rect x="40" y="40" width="200" height="150" rx="20" fill="#F7EFE6"/>'
         '<path d="M300 40 Q330 110 296 190 Q276 196 270 170 Q286 118 268 70 Q272 42 300 40 Z" fill="#F1C9A5" stroke="#C99A78" stroke-width="2"/>'
         '<path d="M272 104 L196 104 L196 124 L272 124 Z" fill="#FCE3CF" stroke="#C99A78" stroke-width="1.5"/>'
         '<line x1="196" y1="98" x2="196" y2="130" stroke="#9C6B98" stroke-width="5" stroke-linecap="round"/>'
         '<g fill="#E8E1D0" stroke="#9A8F78" stroke-width="1.5"><path d="M190 106 l-10 -4 l-4 8 l10 4 Z"/><path d="M176 110 l-10 0 l0 8 l10 0 Z"/><path d="M164 108 l-8 0 l-2 12 l12 0 Z"/></g>'
         '<g fill="none" stroke="#3FA796" stroke-width="4.5"><ellipse cx="142" cy="68" rx="13" ry="20"/><ellipse cx="160" cy="84" rx="19" ry="9"/><ellipse cx="124" cy="82" rx="8" ry="15" transform="rotate(-35 124 82)"/></g><path d="M142 88 L148 108" stroke="#3FA796" stroke-width="5"/>'
         '<path d="M150 128 m-22 0 a22 22 0 1 0 44 0 a16 16 0 1 0 -32 0 a10 10 0 1 0 20 0 a5 5 0 1 0 -10 0" fill="none" stroke="#E0525B" stroke-width="4"/>'
         '<path d="M128 132 L60 132" stroke="#E2B33C" stroke-width="5" stroke-linecap="round"/>'
         '<path d="M8 104 Q28 86 46 108 Q54 132 44 158 Q26 172 8 156 Z" fill="#F4B8C4" stroke="#C9788A" stroke-width="2"/>')
    return group(q, x, y, s)
def hair_cells(ok=True):
    q = rect(-300, -300, 600, 600, '#FFF7EE', rx=0) + rect(-300, 80, 600, 220, '#F6D7C9', rx=0)
    for i in range(7):
        x = -240 + i * 80
        q += rect(x - 22, 20, 44, 70, '#F2A7A0', '#B5585A', 4, 18)
        for j in range(3):
            if ok:
                q += path(f'M{x - 12 + j * 12} 22L{x - 12 + j * 12 + (j - 1) * 4} -40', stroke='#7E3E46', w=6)
            elif i % 2 == 0:
                q += path(f'M{x - 12 + j * 12} 22Q{x + 10} 10 {x + 30 + j * 6} 18', stroke='#B79A9A', w=6)
    return q
def taste_bud():
    q = rect(-300, -300, 600, 600, '#F9C3C8', rx=0) + path('M-300 -120Q-150 -170 0 -120Q150 -70 300 -120V300H-300Z', '#F29BA6', '#C9586B', 5)
    q += path('M-110 280C-130 120 -90 -60 0 -100C90 -60 130 120 110 280Z', '#FBE2E4', '#C9586B', 5)
    for i, a in enumerate(range(-60, 61, 20)):
        q += path(f'M{a * 1.3:.0f} 270Q{a:.0f} 80 {a * .25:.0f} -80', stroke='#E58A98', w=10)
    q += circ(0, -96, 14, '#FFFFFF', '#C9586B', 4)
    return q
def neuron(x, y, s=1, col='#F4C6CF', stroke='#B5687A', axon=520):
    q = ''
    for a in (150, 190, 230, 120, 260):
        t = math.radians(a); ex, ey = 130 * math.cos(t), 130 * math.sin(t)
        q += path(f'M0 0L{ex:.0f} {ey:.0f}', stroke=stroke, w=14) + path(f'M{ex:.0f} {ey:.0f}l{-30 * math.cos(t - .6):.0f} {-30 * math.sin(t - .6):.0f}M{ex:.0f} {ey:.0f}l{-30 * math.cos(t + .6) * -1:.0f} {30 * math.sin(t + .6):.0f}', stroke=stroke, w=8)
    q += path(f'M40 0L{axon} 0', stroke=stroke, w=18) + path(f'M40 0L{axon} 0', stroke=col, w=9)
    for k in range(4):
        q += rect(90 + k * 105, -16, 70, 32, '#FFF6E6', '#C9A88A', 3, 16)
    for dy in (-40, 0, 40):
        q += path(f'M{axon} 0L{axon + 50} {dy}', stroke=stroke, w=10) + circ(axon + 56, dy, 14, col, stroke, 4)
    q += circ(0, 0, 58, col, stroke, 6) + circ(0, 0, 22, '#C6B3DE', '#8D73B3', 4)
    return group(q, x, y, s)
def bed(x, y, s=1):
    return group(rect(-300, -20, 600, 120, '#C9A27A', '#8A6A4A', 5, 18) + rect(-320, -120, 40, 260, '#A9825C', '#8A6A4A', 5, 12) + rect(280, -60, 40, 200, '#A9825C', '#8A6A4A', 5, 12) + rect(-290, -60, 140, 50, '#FFFFFF', '#B8A89A', 4, 22) + path('M-150 -40Q60 -110 290 -40V20H-150Z', '#8FB9E0', '#4E7AA6', 5), x, y, s)
def sleeper(x, y, s=1):
    q = bed(0, 0) + circ(-220, -80, 58, SKIN, SKINS, 4) + path('M-276 -96Q-250 -150 -200 -140Q-170 -130 -164 -100Q-190 -120 -220 -118Q-250 -118 -276 -96Z', '#45312B', '#352724', 2)
    q += path('M-244 -78q12 8 24 0M-206 -78q12 8 24 0', stroke='#443232', w=4) + path('M-150 -40Q60 -110 290 -40V20H-150Z', '#8FB9E0', '#4E7AA6', 5)
    return group(q, x, y, s)
def phone(x, y, s=1, on=True):
    return group(rect(-45, -80, 90, 160, '#3B3B48', '#22222A', 5, 14) + rect(-36, -66, 72, 126, '#8FD0F5' if on else '#2A2A33', rx=6), x, y, s)
def clock(x, y, s=1):
    q = circ(0, 0, 70, '#FFFFFF', '#8A7A68', 6) + path('M0 0V-44M0 0L32 18', stroke=C, w=8) + circ(0, 0, 7, C)
    for a in range(0, 360, 30):
        t = math.radians(a); q += circ(56 * math.cos(t), 56 * math.sin(t), 4, '#8A7A68')
    return group(q, x, y, s)
def seahorse(x, y, s=1, col='#F2B24B', stroke='#B07A1E'):
    q = path('M0 -120C40 -130 60 -100 50 -70C80 -60 70 -30 50 -30C70 0 60 40 40 70C30 100 0 120 -20 110C-50 100 -40 70 -10 70C10 60 10 30 -10 10C-30 -10 -40 -40 -20 -70C-30 -80 -50 -80 -60 -90C-40 -110 -20 -116 0 -120Z', col, stroke, 5)
    q += circ(20, -95, 7, '#443232') + path('M50 -60L80 -66M48 -20L76 -18M38 20L64 28', stroke=stroke, w=5)
    return group(q, x, y, s)
def calendar(x, y, marks, s=1):
    q = ''
    for i in range(8):
        cx = 380 - i * 108
        q += rect(cx - 46, -46, 92, 92, '#FFFFFF', '#C9BBA8', 4, 14)
        if i == 0:
            q += book(cx, 0, .4)
        if i in marks:
            q += circ(cx, 0, 26, GREEN, '#1F7A50', 4) + path(f'M{cx - 12} 0L{cx - 3} 10L{cx + 14} -10', stroke='#FFFFFF', w=6)
    return group(q, x, y, s)


# ———— U08.L01 الدماغ والأعصاب ————
def l01_e1():
    q = kid_front(.55)
    q += brain(512, 180, .95)
    q += path('M512 270V770', stroke=STEMS, w=34) + path('M512 270V770', stroke=STEM, w=24)
    for y0, ex, ey in [(400, 300, 560), (430, 280, 760), (620, 430, 1170), (640, 440, 950)]:
        q += nerve(f'M512 {y0}Q{(512 + ex) / 2:.0f} {y0 + 40} {ex} {ey}') + nerve(f'M512 {y0}Q{(1536 - 512 - ex) / 2 + 512 - 256:.0f} {y0 + 40} {1024 - ex} {ey}')
    for ex, ey in [(292, 760), (732, 760), (430, 1170), (594, 1170)]:
        for d in (-30, 0, 30):
            q += nerve(f'M{ex} {ey}l{d} 40', 4)
    for yy in (460, 520, 580, 700):
        q += nerve(f'M512 {yy}Q470 {yy + 20} 430 {yy + 10}', 4) + nerve(f'M512 {yy}Q554 {yy + 20} 594 {yy + 10}', 4)
    q += magnifier(800, 1330, 120, rect(-120, -120, 240, 240, '#F6D7C9', rx=0) + nerve('M-120 60Q-20 40 30 -10', 9) + nerve('M30 -10l40 -50M30 -10l60 -10M30 -10l30 40', 6))
    q += mascot(180, 1340, .55)
    return q

def l01_e2():
    q = head_profile(560, 760, 1.7) + group(brain(0, 0, .95), 450, 590) + circ(678, 690, 22, '#FFFFFF', '#443232', 4) + circ(684, 690, 11, '#443232')
    q += path('M330 1236Q460 1170 610 1214L660 1536H290Z', '#9ECDE4', '#43687F', 5)
    q += limb('M600 1240L760 1080L860 960', 56) + ellipse(880, 935, 46, 40, SKIN, SKINS, 5)
    q += circ(880, 380, 80, '#FF9F43', '#C4691C', 6) + path('M812 352Q880 400 948 352M820 420Q880 380 940 420', stroke='#C4691C', w=5)
    q += path('M760 470Q800 440 830 420', stroke='#C9BBA8', w=6, extra='stroke-dasharray="14 14"')
    q += arrow(660, 680, 520, 610, TEAL, 9) + envelope(600, 640, .7)
    q += path('M430 690Q400 960 600 1220', stroke=CORAL, w=9) + arrow(690, 1140, 780, 1052, CORAL, 9) + envelope(440, 920, .7)
    q += nerve('M600 1240L760 1080L860 960', 6)
    q += mascot(170, 1340, .55)
    return q

def pot(x, y, s=1):
    q = rect(-120, -40, 240, 130, '#9AA7B5', '#5F6B78', 6, 24) + rect(-150, -60, 300, 30, '#7D8A98', '#5F6B78', 5, 12) + path('M120 -10H200', stroke='#5F6B78', w=18)
    for dx in (-60, 0, 60):
        q += path(f'M{dx} -80Q{dx - 20} -120 {dx} -150Q{dx + 20} -180 {dx} -210', stroke='#C9C9C9', w=8, extra='opacity=".8"')
    q += path('M-120 90Q-60 130 0 90Q60 130 120 90', stroke='#FF7A3A', w=10)
    return group(q, x, y, s)
def l01_e3():
    q = brain(512, 190, .9) + path('M512 270V1080', stroke=STEMS, w=40) + path('M512 270V1080', stroke=STEM, w=28)
    for yy in range(300, 1080, 60):
        q += rect(486, yy, 52, 40, 'none', '#C9A88A', 3, 10)
    q += pot(820, 1220, .9)
    q += limb('M512 760L640 900L730 1080', 58) + ellipse(748, 1110, 50, 38, SKIN, SKINS, 5)
    q += arrow(740, 1060, 560, 800, TEAL, 10) + arrow(560, 840, 690, 1010, CORAL, 10)
    q += path('M500 740Q470 500 500 300', stroke='#9A9A9A', w=7, extra='stroke-dasharray="16 14"') + arrow(500, 330, 505, 290, '#9A9A9A', 7)
    q += circ(512, 790, 34, '#FFE98A', '#C9952B', 5)
    q += mascot(190, 1330, .55)
    return q

def l01_e4():
    q = head_profile(520, 760, 2.2, ) + group(brain_side(0, 0, 1.25), 470, 560)
    q += panel(1130, 330, 50, 292) + panel(1130, 330, 366, 292) + panel(1130, 330, 682, 292)
    q += path('M790 1180C800 1230 820 1260 828 1290H872C880 1260 900 1230 910 1180A60 60 0 1 0 790 1180Z', '#FFE98A', '#C9952B', 5) + rect(828, 1294, 44, 30, '#9AA7B5', rx=6) + circ(850, 1170, 110, 'url(#glow)')
    q += rect(500, 1300, 0, 0, 'none') + path('M420 1360H620', stroke=CEREBS, w=10) + group(boy(0, 0, .55, jump=True), 450, 1160)
    q += heart(140, 1240, .9) + group(lungs(0, 0, .55), 260, 1250)
    q += path('M682 1130V1460', stroke='none') + rect(682, 1130, 292, 330, 'none', '#F4C6CF', 10, 32) + rect(366, 1130, 292, 330, 'none', CEREB, 10, 32) + rect(50, 1130, 292, 330, 'none', STEM, 10, 32)
    q += mascot(900, 300, .45)
    return q

def l01_e5():
    q = neuron(120, 520, 1.15) + neuron(300, 980, 1.15, '#CFE8FB', '#4E7AA6', 430)
    q += magnifier(800, 1300, 150, rect(-150, -150, 300, 300, '#FFF7EE', rx=0) + circ(-70, -40, 60, '#F4C6CF', '#B5687A', 6) + rect(40, -110, 140, 220, '#CFE8FB', '#4E7AA6', 6, 60)
                    + ''.join(circ(-10 + (i % 3) * 18, -50 + (i // 3) * 22, 7, '#FFC93C', '#C9952B', 2) for i in range(9)))
    q += mascot(170, 1340, .55)
    return q

def l01_e6():
    q = u07.torso(1) + circ(512, 120, 100, '#45312B', '#352724', 4)
    q += path('M512 150V1060', stroke='#FFFFFF', w=6, extra='stroke-dasharray="18 14"')
    q += path('M300 340L512 330V1040Q400 1060 300 1005Z', CORAL, 'none', 0, 'opacity=".28"') + path('M724 340L512 330V1040Q624 1060 724 1005Z', TEAL, 'none', 0, 'opacity=".28"')
    q += path('M512 40C440 40 420 90 420 120C420 170 460 200 512 200Z', TEAL, '#1C6F67', 5) + path('M512 40C584 40 604 90 604 120C604 170 564 200 512 200Z', CORAL, '#A8473A', 5)
    q += path('M470 200C480 260 540 280 640 420', stroke=TEAL, w=10) + path('M554 200C544 260 484 280 384 420', stroke=CORAL, w=10)
    q += arrow(600, 360, 660, 450, TEAL, 10) + arrow(424, 360, 364, 450, CORAL, 10)
    q += group(path('M0 0L-80 120L-100 220', stroke=TEAL, w=0), 0, 0)
    q += mascot(860, 1320, .55)
    return q


# ———— U08.L02 العين ————
def l02_e1():
    q = eye_front(512, 560, 1.4)
    q += panel(1020, 380) + eye_front(220, 1210, .45) + eye_front(512, 1210, .45, iris='url(#irisg)') + eye_front(804, 1210, .45, iris='url(#irisb)')
    q += mascot(870, 260, .5)
    return q

def l02_e2():
    q = rect(120, 980, 784, 30, '#C9A27A', '#8A6A4A', 4, 10) + book(560, 930, 1.2)
    q += group(path('M0 0L60 -120H140L200 0Z', '#FFD56E', '#C9952B', 5) + rect(92, -220, 16, 100, '#8A7A68', rx=6), 760, 560)
    q += circ(860, 520, 120, 'url(#glow)')
    q += head_profile(300, 640, 1.5) + circ(400, 580, 16, '#443232')
    q += path('M860 560L620 880', stroke='#F2A900', w=8, extra='stroke-dasharray="20 14"') + arrow(560, 880, 430, 600, '#F2A900', 9)
    q += magnifier(760, 1300, 150, eye_section(-10, 0, 100, rays=['M150 -40L70 -8L-90 60', 'M150 40L70 8L-90 -60']))
    q += mascot(170, 1340, .5)
    return q

def l02_e3():
    q = panel(80, 640) + panel(780, 640)
    q += sun(810, 230, 70) + eye_front(512, 450, .9, pr=34)
    q += rect(80, 780, 924 - 30, 640, '#2C3E66', rx=32, extra='opacity=".92"') + moon(820, 900, 55) + star(200, 880) + star(320, 950, 10) + eye_front(512, 1140, .9, pr=104)
    q += mascot(150, 600, .45)
    return q

def l02_e4():
    q = eye_section(560, 600, 300, disc=True, rays=['M980 470L800 590L320 760', 'M980 730L800 610L320 440'])
    q += magnifier(300, 1220, 170, rect(-170, -170, 340, 340, '#F7C9C2', rx=0) + ''.join(rect(-160 + i * 34, -150, 16, 70, '#B98BD9', rx=6) + rect(-160 + i * 34, 80, 16, 70, '#B98BD9', rx=6) for i in range(10)) + circ(0, 0, 80, '#FFF1B8', '#C9952B', 5) + nerve('M0 0L-170 0', 20))
    q += path('M300 1050L280 620', stroke='#C9BBA8', w=5, extra='stroke-dasharray="12 12"')
    q += mascot(840, 1320, .55)
    return q

def l02_e5():
    inner = rect(-260, -260, 520, 520, '#F7C9C2', rx=0)
    for i in range(14):
        x = -230 + i * 34
        if i in (3, 7, 11):
            col = {3: '#E34E4B', 7: '#2E9E6A', 11: '#3E7BB6'}[i]
            inner += path(f'M{x - 14} 120L{x} -40L{x + 14} 120Z', col, '#5E3A3A', 3)
        else:
            inner += rect(x - 8, -160, 16, 280, '#B98BD9', '#6E4C93', 3, 8)
    q = magnifier(512, 520, 300, inner)
    q += panel(980, 420, 50, 450) + panel(980, 420, 524, 450)
    q += rect(50, 980, 450, 420, '#3C4660', rx=32) + circ(200, 1180, 60, '#8A8F9C') + rect(300, 1110, 120, 140, '#9DA2AE', rx=12) + moon(420, 1040, 30)
    q += circ(674, 1180, 60, '#FF6B57') + rect(774, 1110, 120, 140, '#2BB3A3', rx=12) + sun(900, 1040, 26) + circ(830, 1320, 30, '#FFC93C')
    q += mascot(160, 230, .45)
    return q

def l02_e6():
    q = panel(70, 600) + panel(720, 600)
    q += eye_section(560, 370, 200, lens_ry=.42) + book(850, 370, .85)
    q += eye_section(560, 1020, 200, lens_ry=.22, rays=['M1000 900L700 1012L392 1110', 'M1000 1130L700 1028L392 940'])
    q += tree(965, 1070, .32) + group(tree(0, 0, .22), 400, 1020, rotate=180)
    q += mascot(150, 1400, .45)
    return q


# ———— U08.L03 الأذن والحواس ————
def l03_e1():
    q = head_profile(380, 720, 1.6) + circ(300, 620, 26, '#F1C9A5', '#C99A78', 4)
    q += group(bell(0, 0, 1.1), 840, 420)
    for r in (80, 140, 200):
        q += path(f'M{840 - r} {420 - r * .6:.0f}Q{840 - r * 1.3:.0f} 420 {840 - r} {420 + r * .6:.0f}', stroke='#7FB8E0', w=8)
    q += magnifier(560, 1180, 230, group(hair_cells(True), 0, 0, .75))
    q += path('M330 650L470 980', stroke='#C9BBA8', w=5, extra='stroke-dasharray="12 12"')
    q += mascot(880, 1360, .5)
    return q

def l03_e2():
    q = ear_scene(32, 60, 3)
    q += group(path('M0 0', stroke='none'), 0, 0)
    q += circ(430, 270, 150, 'none', '#3FA796', 6, 'stroke-dasharray="10 12" opacity=".6"')
    q += group(boy(0, 0, 1.1, jump=True), 380, 860) + path('M300 1300Q512 1380 724 1300', stroke=TEAL, w=8) + arrow(690, 1310, 730, 1290, TEAL, 8)
    q += path('M260 900Q200 960 260 1020M760 900Q820 960 760 1020', stroke=TEAL, w=8)
    q += mascot(880, 1360, .45)
    return q

def l03_e3():
    q = head_profile(380, 640, 1.4)
    q += path('M240 380Q380 230 560 380', stroke='#3B3B48', w=24) + rect(200, 400, 90, 140, '#3B3B48', rx=30) + rect(520, 400, 90, 140, '#3B3B48', rx=30)
    for i, col in enumerate(['#2E9E6A', '#2E9E6A', '#E2B33C', '#E2B33C', '#E0525B']):
        q += rect(700 + i * 52, 560 - i * 50, 40, 60 + i * 50, col, rx=10)
    q += magnifier(280, 1180, 200, group(hair_cells(True), 0, 0, .7)) + magnifier(740, 1180, 200, group(hair_cells(False), 0, 0, .7))
    q += circ(280, 1440, 26, GREEN) + path('M266 1440l10 10l18 -20', stroke='#FFF', w=6) + circ(740, 1440, 26, '#E0525B') + path('M728 1428l24 24M752 1428l-24 24', stroke='#FFF', w=6)
    q += mascot(900, 260, .45)
    return q

def l03_e4():
    q = magnifier(512, 520, 300, taste_bud())
    q += panel(980, 460)
    q += rect(130, 1110, 120, 120, '#FFFFFF', '#C9BBA8', 5, 14)  # مكعب سكر
    q += group(circ(0, 0, 70, '#F4E04D', '#C9A227', 5) + path('M-50 0H50M0 -50V50M-35 -35L35 35M35 -35L-35 35', stroke='#FFF6B0', w=6), 340, 1170)  # ليمونة
    q += group(path('M-40 -60H40L50 60H-50Z', '#FFFFFF', '#8A8A8A', 5) + ''.join(circ(-20 + 20 * i, -70, 6, '#8A8A8A') for i in range(3)), 512, 1180)  # ملّاحة
    q += group(circ(0, 20, 40, '#5BB36A', '#3F8A4C', 4) + circ(-36, -10, 32, '#5BB36A', '#3F8A4C', 4) + circ(36, -10, 32, '#5BB36A', '#3F8A4C', 4) + rect(-12, 50, 24, 50, '#7FB26B', rx=8), 680, 1160)  # بروكلي (مرّ)
    q += group(path('M-80 0H80Q70 80 0 90Q-70 80 -80 0Z', '#FFFFFF', '#8A7A68', 5) + ellipse(0, 0, 80, 18, '#E9B36B', '#8A7A68', 4) + path('M-20 -20q-10 -30 0 -50M20 -20q10 -30 0 -50', stroke='#C9C9C9', w=6), 860, 1180)  # مرق
    q += mascot(880, 1420, .4)
    return q

def l03_e5():
    def skin_zoom(n):
        q = rect(-200, -200, 400, 400, '#F6D7C9', rx=0)
        import random; rnd = random.Random(n)
        for _ in range(n):
            q += circ(rnd.uniform(-180, 180), rnd.uniform(-180, 180), 9, '#FFC93C', '#C9952B', 2)
        return q
    q = group(limb('M120 520L520 520', 120) + ellipse(600, 520, 110, 80, SKIN, SKINS, 6) + limb('M640 470L860 430', 44) + limb('M650 520L880 520', 44), 0, 0)
    q += magnifier(840, 980, 170, skin_zoom(70)) + magnifier(250, 980, 170, skin_zoom(7))
    q += path('M840 810L860 470', stroke='#C9BBA8', w=5, extra='stroke-dasharray="12 12"') + path('M250 810L260 580', stroke='#C9BBA8', w=5, extra='stroke-dasharray="12 12"')
    q += group(path('M-60 -160L-14 60M60 -160L14 60', stroke='#5F6B78', w=12) + circ(-14, 66, 9, '#5F6B78') + circ(14, 66, 9, '#5F6B78') + rect(-80, -190, 160, 40, '#9AA7B5', '#5F6B78', 4, 14), 512, 1330)
    q += mascot(160, 1360, .45)
    return q

def l03_e6():
    q = head_profile(420, 760, 1.8) + group(brain(0, 0, 1.0), 308, 580, extra='opacity=".92"')
    q += path('M650 846C606 846 562 826 562 795C562 768 590 752 616 755C644 760 662 800 650 846Z', '#FCE3CF', '#C99A78', 4)
    q += rect(566, 744, 62, 16, NERVE, NERVES, 4, 8) + nerve('M578 748Q500 710 420 672', 7)
    q += group(path('M-90 0Q-90 -60 0 -60Q90 -60 90 0V40H-90Z', '#E9B36B', '#A9773A', 5) + path('M-60 -30l30 -10M-10 -36l30 -8M40 -30l20 -6', stroke='#A9773A', w=5), 880, 1100)
    q += group(''.join(group(ellipse(0, -30, 16, 32, '#FFFFFF', '#B8B8B8', 3), 0, 0, 1, a) for a in range(0, 360, 72)) + circ(0, 0, 12, '#FFE98A', '#C9A227', 3) + path('M0 30V110', stroke='#5BB36A', w=8), 890, 820)
    for x, y, c in [(840, 1020, 0), (800, 970, 0), (770, 925, 0), (745, 890, 0), (840, 840, 1), (800, 850, 1), (760, 858, 1)]:
        q += circ(x, y, 12, ['#E9B36B', '#F7D6E6'][c], ['#A9773A', '#C98AA8'][c], 3)
    q += arrow(735, 870, 700, 856, '#C9BBA8', 6)
    q += mascot(170, 1360, .5)
    return q


# ———— U08.L04 الخوف ————
def bike(x, y, s=1):
    q = circ(-120, 0, 70, 'none', '#3B3B48', 12) + circ(120, 0, 70, 'none', '#3B3B48', 12) + path('M-120 0L-30 -100H80L120 0M-30 -100L20 0H-120M80 -100L70 -150H40', stroke=CORAL, w=12)
    for i in range(3):
        q += path(f'M{200 + i * 10} {-80 + i * 50}H{300 + i * 40}', stroke='#C9BBA8', w=8)
    return group(q, x, y, s)
def l04_e1():
    q = head_profile(380, 760, 1.7) + circ(270, 600, 30, '#F1C9A5', '#C99A78', 4) + group(brain(0, 0, .9), 280, 590, extra='opacity=".85"')
    q += bell(300, 640, .75) + circ(500, 690, 24, '#FFFFFF', '#443232', 4) + circ(506, 690, 12, '#443232')
    q += bike(760, 360, .9)
    q += arrow(640, 420, 520, 660, '#F2A900', 9) + arrow(640, 470, 330, 610, '#7FB8E0', 7)
    q += mascot(860, 1340, .5)
    return q

def l04_e2():
    q = kid_front(.5)
    q += kidney(452, 690, .32) + kidney(572, 690, .32, flip=True)
    q += group(path('M-40 20L0 -30L40 20Z', '#FFC93C', '#C9952B', 5), 452, 640) + group(path('M-40 20L0 -30L40 20Z', '#FFC93C', '#C9952B', 5), 572, 640)
    q += circ(512, 640, 130, 'url(#glow)')
    q += path('M572 610Q640 520 600 460', stroke=VES, w=26) + path('M572 610Q640 520 600 460', stroke='#F6A3A6', w=8, extra='opacity=".7"')
    for (x, y) in [(600, 560), (618, 520), (606, 485)]:
        q += circ(x, y, 9, '#FFC93C', '#C9952B', 3)
    q += heart(560, 430, .9) + path('M640 400l30 -20M650 440h36M640 480l30 20', stroke=RED, w=7)
    q += mascot(860, 1340, .5)
    return q

def l04_e4():
    q = panel(80, 560) + panel(700, 760)
    q += heart(250, 300, 1.4) + path('M150 240l-30 -20M140 300h-40M150 360l-30 20', stroke=RED, w=7) + pulse(400, 330, 520, True)
    q += group(path('M0 -150C70 -150 90 -90 70 -40C140 -20 160 40 150 120L120 260H-120L-150 120C-160 40 -140 -20 -70 -40C-90 -90 -70 -150 0 -150Z', '#FFF6EA', SKINS, 5) + ellipse(0, 100, 90, 70, '#BFE3FB', '#6FB3EA', 4) + path('M30 -95q20 10 40 0', stroke='#443232', w=5), 330, 1050)
    q += path('M430 920Q560 900 640 940Q720 980 800 950', stroke='#7FB8E0', w=8) + path('M430 960Q540 960 620 990', stroke='#7FB8E0', w=6, extra='opacity=".7"')
    q += heart(800, 1180, .9, '#E88A8A') + pulse(560, 1340, 380, False, '#E88A8A')
    q += mascot(880, 760, .4)
    return q

def l04_e6():
    q = head_profile(420, 520, 1.3) + group(brain_side(0, 0, .8, op=.95), 380, 380)
    q += ellipse(400, 420, 26, 16, '#E34E4B', '#8A2A2A', 4) + circ(400, 420, 70, 'url(#alarm)') + circ(440, 380, 12, '#FFC93C', '#C9952B', 3)
    q += path('M400 560V880', stroke=STEMS, w=30) + path('M400 560V880', stroke=STEM, w=20)
    q += nerve('M400 860Q450 900 520 980', 8)
    q += kidney(560, 1080, .5) + group(path('M-50 24L0 -36L50 24Z', '#FFC93C', '#C9952B', 5), 560, 1000) + circ(560, 1000, 90, 'url(#glow)')
    q += path('M640 1000Q760 900 780 700', stroke=VES, w=28) + path('M640 1000Q760 900 780 700', stroke='#F6A3A6', w=9, extra='opacity=".7"')
    for (x, y) in [(700, 930), (740, 860), (770, 780)]:
        q += circ(x, y, 10, '#FFC93C', '#C9952B', 3)
    q += heart(800, 590, 1.1) + path('M880 540l30 -20M890 590h36M880 640l30 20', stroke=RED, w=7)
    q += mascot(170, 1360, .5)
    return q


# ———— U08.L05 الذاكرة والنوم ————
def l05_e1():
    q = panel(80, 420) + panel(560, 420) + panel(1040, 420)
    q += book(380, 300, .9) + group(eye_front(0, 0, .35), 720, 290) + arrow(640, 300, 500, 300, TEAL, 8)
    q += brain(512, 760, 1.05, glow=True) + moon(820, 680, 40) + star(220, 700) + star(260, 780, 10)
    q += group(boy(0, 0, .9, jump=True), 400, 1060) + path('M780 1100A60 60 0 1 0 700 1100C700 1140 720 1160 724 1180H756C760 1160 780 1140 780 1100Z', '#FFE98A', '#C9952B', 5) + circ(740, 1090, 90, 'url(#glow)')
    q += arrow(512, 500, 512, 560, C, 7) + arrow(512, 980, 512, 1030, C, 7)
    q += mascot(900, 1460, .35)
    return q

def l05_e2():
    X0, X1, Y0, Y1 = 150, 900, 900, 260
    px = lambda t: X1 - t / 7 * (X1 - X0)
    py = lambda r: Y0 - r * (Y0 - Y1)
    def keep(t, revs):
        last, S = 0, .8
        for d in revs:
            if d <= t: last, S = d, S * 2.5
        return .2 + .8 * math.exp(-(t - last) / S)
    def curve(revs):
        d, prev = '', None
        for i in range(281):
            t = 7 * i / 280
            for r in revs:
                if prev is not None and prev < r <= t:
                    d += f' L{px(r):.1f} {py(keep(r - 1e-6, revs)):.1f} L{px(r):.1f} {py(1):.1f}'
            d += (' L' if i else 'M') + f'{px(t):.1f} {py(keep(t, revs)):.1f}'; prev = t
        return d
    q = panel(160, 860) + path(f'M{X1} {Y1 - 30}V{Y0}H{X0 - 30}', stroke='#8A8A8A', w=6)
    q += path(curve([]), stroke='#B9B9B9', w=9, extra='stroke-dasharray="20 16"') + path(curve([1, 3, 6]), stroke=BLUE, w=11)
    for r in (1, 3, 6):
        q += circ(px(r), py(1), 16, GREEN, '#1F7A50', 4)
    q += calendar(512, 1200, {1, 3, 6})
    q += mascot(170, 1400, .45)
    return q

def l05_e3():
    q = rect(0, 0, 1024, 1536, 'url(#sky)', rx=0) + moon(860, 180, 70) + ''.join(star(x, y, r) for x, y, r in [(120, 140, 16), (300, 90, 10), (520, 160, 14), (700, 300, 10), (200, 380, 12)])
    q += sleeper(560, 1140, 1.1)
    q += brain(330, 620, 1.1, glow=True)
    for i, (x, y) in enumerate([(160, 520), (500, 470), (520, 760), (140, 760)]):
        q += circ(x, y, 46, '#FFFFFF', '#C9BBA8', 4, 'opacity=".9"')
    q += group(book(0, 0, .3), 160, 520) + circ(500, 470, 22, '#FF9F43', '#C4691C', 4) + group(tree(0, 0, .22), 520, 770) + star(140, 760, 22)
    q += path('M330 760Q330 900 360 1000', stroke='#FFE98A', w=6, extra='stroke-dasharray="10 14"')
    return q

def l05_e5():
    q = head_profile(420, 720, 1.9) + group(brain_side(0, 0, 1.05, op=.55), 340, 540)
    q += group(path('M-60 0C-60 -40 -10 -50 10 -30C30 -10 20 20 0 20C-20 20 -20 0 -5 -5', stroke='#F2B24B', w=18), 360, 600) + circ(360, 590, 80, 'url(#glow)')
    q += magnifier(740, 1170, 190, rect(-190, -190, 380, 380, '#DFF3F7', rx=0) + seahorse(0, 0, 1.3))
    q += path('M380 640L620 1020', stroke='#C9BBA8', w=5, extra='stroke-dasharray="12 12"')
    q += mascot(170, 1360, .5)
    return q

def l05_e6():
    q = rect(50, 200, 924, 760, 'url(#sky)', rx=32) + moon(880, 290, 50) + sun(150, 300, 50)
    xs = [880 - i * 46 for i in range(17)]
    lv = [0, 2, 3, 3, 2, 0, 1, 3, 2, 0, 1, 2, 1, 0, 1, 0, 0]
    d = 'M' + ' L'.join(f'{x} {450 + l * 120}' for x, l in zip(xs, lv))
    q += path(d, stroke='#FFE98A', w=10)
    for x, l in zip(xs, lv):
        if l == 0 and x not in (880, 144):
            q += group(path('M-24 0q12 10 24 0M4 0q12 10 24 0', stroke='#FFFFFF', w=5) + path('M-30 -26l10 6M30 -26l-10 6', stroke='#FFFFFF', w=4), x, 400)
    q += sleeper(512, 1220, .95)
    q += mascot(880, 1420, .4)
    return q


DIAGRAMS = {
    'U08.L01-E1': l01_e1, 'U08.L01-E2': l01_e2, 'U08.L01-E3': l01_e3, 'U08.L01-E4': l01_e4, 'U08.L01-E5': l01_e5, 'U08.L01-E6': l01_e6,
    'U08.L02-E1': l02_e1, 'U08.L02-E2': l02_e2, 'U08.L02-E3': l02_e3, 'U08.L02-E4': l02_e4, 'U08.L02-E5': l02_e5, 'U08.L02-E6': l02_e6,
    'U08.L03-E1': l03_e1, 'U08.L03-E2': l03_e2, 'U08.L03-E3': l03_e3, 'U08.L03-E4': l03_e4, 'U08.L03-E5': l03_e5, 'U08.L03-E6': l03_e6,
    'U08.L04-E1': l04_e1, 'U08.L04-E2': l04_e2, 'U08.L04-E4': l04_e4, 'U08.L04-E6': l04_e6,
    'U08.L05-E1': l05_e1, 'U08.L05-E2': l05_e2, 'U08.L05-E3': l05_e3, 'U08.L05-E5': l05_e5, 'U08.L05-E6': l05_e6,
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
                    im.convert('RGB').resize((256, 384)).save(Path(preview) / (name + '.png'))
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
