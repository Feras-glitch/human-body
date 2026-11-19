# -*- coding: utf-8 -*-
"""يبني كتاب المعلم ودفتري الطالب والطالبة لكل وحدة: markdown ← HTML (ثم tools/html2pdf.js ← PDF).

الاستعمال: python3 tools/build-pdf.py [--out DIR] [U01 U02 …]   (بلا وحدات: كل الوحدات في lessons/)

المراجعة 20:
- ن-3: الآية تُطبع بخط التطبيق نفسه: خط مصحف المدينة، الإصدار الثاني (QPC V2)، خط لكل صفحة (app/v2/fonts/qcf2/)،
  من حقل qpc2 في سجل الآيات (رمز لكل كلمة وعلامة ورقم آية)، بلا خط بديل لرموزها: خط غائب يظهر فارغاً في الفحص
  لا رموزاً تُطبع. (المسافات وحدها من خط Hafs Smart، فخط الصفحة لا مسافة فيه.)
  ونص الكتاب بخطوط التطبيق (IBM Plex Sans Arabic، وNoto Sans SC للصينية) لا بخط النظام.
  والمحارف الخاصة اتجاهها في يونيكود من اليسار، فتُفرض عليها الكتابة من اليمين (unicode-bidi: bidi-override) كما في
  صنف .quran في التطبيق؛ بدونه تُطبع الآية مقلوبة الحروف (اكتُشف في توليد 1.3.0 قبل النشر، وصار اختباراً).
- ن-4: الغلاف يحمل بصمة المحتوى (tools/content-hash.mjs) وتاريخ التوليد ورقم الإصدار، والاختبارات تقارن البصمة
  بالمحتوى الحالي، فلا يبقى كتاب مرفق أقدم من التطبيق دون أن يُكتشف.
"""
import json, glob, os, sys, re, subprocess, datetime, markdown

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
os.chdir(ROOT)
QV = json.load(open('quran/verses.json', encoding='utf-8'))
FONTS_DIR = os.path.join(ROOT, 'app', 'v2', 'fonts')
CSS = """
@font-face{font-family:'KFGQPC Hafs Smart';src:url('%(f)s/HafsSmart_08.ttf') format('truetype');font-display:block}
@page { size: A4; margin: 18mm 16mm; }
.q{font-family:'KFGQPC Hafs Smart';font-size:17pt;line-height:2;direction:rtl;unicode-bidi:bidi-override;font-weight:400;font-synthesis:none}
body { font-family: 'IBM Plex Sans Arabic','Noto Sans SC',sans-serif; direction: rtl; font-size: 12pt; line-height: 1.75; color:#222; }
h1 { font-size: 22pt; color:#8a1c23; border-bottom: 2px solid #8a1c23; padding-bottom: 4px; page-break-before: always; }
h1:first-of-type { page-break-before: auto; }
h2 { font-size: 16pt; color:#1f5f5a; margin-top: 18pt; }
h3 { font-size: 13.5pt; margin-top: 12pt; }
table { border-collapse: collapse; width: 100%%; margin: 8pt 0; font-size: 10.5pt; page-break-inside: avoid; }
th, td { border: 1px solid #bbb; padding: 4pt 6pt; vertical-align: top; }
th { background: #f1e7d6; }
blockquote { border-right: 4px solid #1f5f5a; margin: 8pt 0; padding: 4pt 10pt; background: #f6f3ec; }
code { font-family: monospace; font-size: 10pt; direction: ltr; unicode-bidi: embed; }
.cover { text-align:center; padding-top: 30%%; page-break-after: always; }
.cover h1 { border:0; font-size: 30pt; page-break-before: auto; }
.cover .motto { color:#8a1c23; font-size: 16pt; }
.cover .meta { color:#666; font-size: 11pt; margin-top: 30pt; }
.draw { border: 1px dashed #999; height: 140mm; margin: 6pt 0; }
"""


def fonts_url(out):
    # مسار نسبي من مجلد الإخراج إلى خطوط التطبيق: ملف HTML المرفق لا يحمل مساراً خاصاً بجهاز من بناه
    return os.path.relpath(FONTS_DIR, os.path.abspath(out)).replace(os.sep, '/')


def content_hash():
    return subprocess.run(['node', 'tools/content-hash.mjs'], capture_output=True, text=True, check=True).stdout.strip()


def version():
    try:
        return json.load(open('packaging/desktop/package.json', encoding='utf-8'))['version']
    except Exception:
        return '—'


def md2html(text):
    html = markdown.markdown(text, extensions=['tables'])

    def smart(m):
        v = QV.get(m.group(1))
        if not v:
            raise SystemExit('آية غير موجودة في السجل: ' + m.group(1))
        q = v.get('qpc2')
        if not q:
            raise SystemExit('آية بلا رموز QPC V2 في السجل: ' + m.group(1) + ' (tools/qpc2_import.py)')
        # خط مصحف المدينة، الإصدار الثاني: رمز لكل كلمة وعلامة ورقم آية، بخط صفحتها كما في التطبيق
        g = q['glyphs'].split(' ')
        hl = m.group(2)
        if hl:
            a, b = [int(x) for x in hl.split('-')]
            for i in range(a, min(b, len(q['words']) - 1) + 1):
                g[q['words'][i]] = '<mark>' + g[q['words'][i]] + '</mark>'
        fam = 'QCF2_%03d' % q['page']
        # رقم الآية (آخر رمز) لا ينفصل عن آخر كلمة
        body = ' '.join(g[:-1]) + '\u00a0' + g[-1]
        return ('<span class="q" lang="ar" data-key="' + m.group(1) + '" data-page="' + str(q['page']) + '" style="font-family:\'' + fam
                + '\',\'KFGQPC Hafs Smart\'">' + body + '</span>')
    return re.sub(r'<span class="q" data-key="([^"]+)"(?: data-hl="([^"]+)")?>[^<]*</span>', smart, html)


def unit_lessons(unit):
    return sorted(glob.glob(f'build/{unit}.L*/'))


def build(unit, kind, out, stamp):
    parts = []
    title = {'teacher': 'كتاب المعلم', 'student-boy': 'دفتر الأطلس — طالب', 'student-girl': 'دفتر الأطلس — طالبة'}[kind]
    first = json.load(open(sorted(glob.glob(f'lessons/{unit}.L*.json'))[0], encoding='utf-8'))
    cover = (f"<div class='cover'><h1>الأطلس الحي</h1><div class='motto'>علمٌ يُنتفع به · تعلّم · افهم · طبّق · انشر</div>"
             f"<h2>{unit} · {first['unit']['title']}</h2><h3>{title}</h3>"
             f"<div class='meta'>مسودة للمراجعة · الإصدار {stamp['version']} · بصمة المحتوى <span class='fp' dir='ltr'>{stamp['hash']}</span> · {stamp['date']}<br>"
             "النص القرآني برواية حفص بالرسم العثماني من مجمع الملك فهد لطباعة المصحف الشريف بخط صفحات مصحف المدينة، الإصدار الثاني (QPC V2؛ رموز الآيات من مكتبة QUL)، ونص Tanzil (tanzil.net) للبحث · "
             "النصوص الشرعية بانتظار اعتماد المراجع الشرعي<br>البصمة نفسها في «عن التطبيق»: إن اختلفت فالكتاب والتطبيق من نسختين مختلفتين.</div></div>")
    for d in unit_lessons(unit):
        f = os.path.join(d, kind + '.md')
        if os.path.exists(f):
            t = open(f, encoding='utf-8').read().replace('[ مساحة الرسم ]', '<div class="draw"></div>')
            parts.append(md2html(t))
    html = (f"<!doctype html><html lang='ar' dir='rtl'><head><meta charset='utf-8'>"
            f"<link rel='stylesheet' href='{fonts_url(out)}/app-fonts.css'><link rel='stylesheet' href='{fonts_url(out)}/qcf2/qcf2.css'>"
            f"<style>{CSS % {'f': fonts_url(out)}}</style></head>"
            f"<body data-content-hash='{stamp['hash']}'>{cover}{''.join(parts)}</body></html>")
    os.makedirs(out, exist_ok=True)
    hp = os.path.join(out, f'{unit}-{kind}.html')
    open(hp, 'w', encoding='utf-8').write(html)
    return hp


if __name__ == '__main__':
    args = sys.argv[1:]
    out = 'build/pdf'
    if '--out' in args:
        i = args.index('--out')
        out = args[i + 1]
        del args[i:i + 2]
    units = args or sorted({os.path.basename(f)[:3] for f in glob.glob('lessons/U*.json')})
    stamp = {'hash': content_hash(), 'version': version(), 'date': datetime.date.today().isoformat()}
    built = [build(u, k, out, stamp) for u in units for k in ['teacher', 'student-boy', 'student-girl']]
    json.dump(built, open(os.path.join(out, '_list.json'), 'w'))
    print('\n'.join(built))
