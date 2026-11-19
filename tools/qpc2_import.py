# -*- coding: utf-8 -*-
"""خط مصحف المدينة، الإصدار الثاني (QPC V2 / QCF2): خط لكل صفحة، ورمز لكل كلمة.

يملأ حقل qpc2 لكل آية في quran/verses.json من بيانات «QPC V2 Glyphs - Ayah by Ayah» (مكتبة QUL، في
quran/qpc2/)، وينسخ خطوط الصفحات التي فيها آيات المنهاج وحدها إلى app/v2/fonts/qcf2/، ويكتب qcf2.css.

    python3 tools/qpc2_import.py --fonts <مجلد فيه QCF2001.ttf … QCF2604.ttf>   ينسخ ويكتب
    python3 tools/qpc2_import.py --check                                       يتحقق فقط (الاختبارات وCI)

qpc2 = {page, glyphs, words}:
  glyphs  رموز الآية بترتيب القراءة مفصولة بمسافة: كل كلمة رمز، وكل علامة وقف رمز، و«۞» رمز، ورقم الآية آخرها
  words   موضع كل كلمة من كلمات النص الذكي (smart) بين الرموز، فيبقى التظليل بأرقام الكلمات (hl_words) كما هو

يرفض: آية تتجاوز صفحتها (رموز الصفحة الثانية تبدأ من جديد)، أو عدد رموز لا يساوي كلمات نص Tanzil وعلاماته ورقم
الآية، أو كلمات لا تساوي كلمات النص الذكي، أو رمزاً ليس في خط صفحته. لا يُعدَّل رمز ولا خط.
"""
import json, os, sys, shutil, hashlib

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
os.chdir(ROOT)
GLYPHS = 'quran/qpc2/qpc-v2-ayah-by-ayah-glyphs.json'
OUT = 'app/v2/fonts/qcf2'
MARKS = set(chr(c) for c in range(0x06D6, 0x06EE)) | {'۞', '۩'}


def font_name(page):
    return f'QCF2{page:03d}.ttf'


def family(page):
    return f'QCF2_{page:03d}'


def is_mark(tok):
    return all(c in MARKS for c in tok)


def build(v, g):
    glyphs = g['text'].split(' ')
    tanzil = v['text'].split(' ')
    smart = v['smart'].split(' ')
    errs = []
    cps = [ord(c) for c in g['text'] if c != ' ']
    if any(b < a for a, b in zip(cps, cps[1:])):
        errs.append('الآية تتجاوز صفحتها (رموزها تبدأ من جديد)')
    if len(glyphs) != len(tanzil) + 1:
        errs.append(f'{len(glyphs)} رمزاً، ونص Tanzil {len(tanzil)} كلمة وعلامة + رقم الآية')
    words = [i for i, t in enumerate(tanzil) if not is_mark(t)]
    if len(words) != len(smart):
        errs.append(f'{len(words)} كلمة في Tanzil و{len(smart)} في النص الذكي')
    return {'page': g['page_number'], 'glyphs': g['text'], 'words': words}, errs


def cmap(path):
    from fontTools.ttLib import TTFont
    return TTFont(path).getBestCmap()


def main():
    args = sys.argv[1:]
    check = '--check' in args
    fonts = args[args.index('--fonts') + 1] if '--fonts' in args else None
    if not check and not fonts:
        raise SystemExit(__doc__)
    G = json.load(open(GLYPHS, encoding='utf-8'))
    V = json.load(open('quran/verses.json', encoding='utf-8'))
    errs, pages = [], set()
    for k, v in V.items():
        if k not in G:
            errs.append(f'{k}: ليست في بيانات QPC V2'); continue
        q, e = build(v, G[k])
        errs += [f'{k}: {x}' for x in e]
        if check:
            if v.get('qpc2') != q:
                errs.append(f'{k}: حقل qpc2 في السجل لا يطابق البيانات (شغّل tools/qpc2_import.py --fonts …)')
        else:
            v['qpc2'] = q
        pages.add(q['page'])
    for p in sorted(pages):
        src = os.path.join(fonts, font_name(p)) if fonts else os.path.join(OUT, font_name(p))
        if not os.path.exists(src):
            errs.append(f'خط الصفحة {p} غير موجود: {src}'); continue
        cm = cmap(src)
        for k, v in V.items():
            if v.get('qpc2', {}).get('page') == p or (k in G and G[k]['page_number'] == p):
                miss = [hex(ord(c)) for c in G[k]['text'] if c != ' ' and ord(c) not in cm]
                if miss:
                    errs.append(f'{k}: رموز ليست في خط الصفحة {p}: {" ".join(miss)}')
    if check:
        extra = sorted(set(f for f in os.listdir(OUT) if f.endswith('.ttf')) - {font_name(p) for p in pages}) if os.path.isdir(OUT) else []
        if extra:
            errs.append('خطوط صفحات لا آية فيها: ' + ' '.join(extra))
    if errs:
        print('\n'.join('✗ ' + e for e in errs)); raise SystemExit(1)
    if check:
        print(f'QPC V2: {len(V)} آية في {len(pages)} صفحة، كل رمز في خط صفحته'); return
    os.makedirs(OUT, exist_ok=True)
    for f in os.listdir(OUT):
        if f.endswith('.ttf'):
            os.remove(os.path.join(OUT, f))
    sums = []
    for p in sorted(pages):
        shutil.copyfile(os.path.join(fonts, font_name(p)), os.path.join(OUT, font_name(p)))
        sums.append(f"{hashlib.sha256(open(os.path.join(OUT, font_name(p)), 'rb').read()).hexdigest()}  {font_name(p)}")
    css = ('/* مولَّد: tools/qpc2_import.py — خط مصحف المدينة، الإصدار الثاني (مجمع الملك فهد)، خط لكل صفحة فيها آية من المنهاج */\n'
           + ''.join(f"@font-face{{font-family:'{family(p)}';src:url('{font_name(p)}') format('truetype');font-display:block}}\n" for p in sorted(pages)))
    open(os.path.join(OUT, 'qcf2.css'), 'w', encoding='utf-8').write(css)
    open(os.path.join(OUT, 'SHA256SUMS.txt'), 'w', encoding='utf-8').write('\n'.join(sums) + '\n')
    with open('quran/verses.json', 'w', encoding='utf-8') as f:
        json.dump(V, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print(f'QPC V2: {len(V)} آية، {len(pages)} صفحة → {OUT}')


if __name__ == '__main__':
    main()
