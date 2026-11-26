# -*- coding: utf-8 -*-
"""برومبتات الصور القصصية للوحدة U09 (يولّدها صاحب المشروع). يكتب:
art-sources/U10/prompts/prompts-final-imagegen.json و art-sources/U10/prompts/الصور-القصصية-للنسخ.md
الاستعمال: python3 art-sources/U10/sources/prompts_u10.py
"""
from pathlib import Path
import json

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / 'prompts'
STYLE = ("Warm children's picture-book illustration, soft rounded cartoon style for ages 8–12, thick clean outlines, flat colors with gentle soft shading, "
         "cheerful warm palette (cream background #FFF6E3, coral #FF6B57, teal #2BB3A3, sunny yellow #FFC93C, sky blue #BFE7FF), friendly expressive faces with big round eyes, "
         "Egyptian/Arab children, modest everyday clothes, no text, no letters, no logos, no watermark, high resolution, consistent character design. Vertical portrait image, 1024×1536.")
BOY = "the hero boy (match the attached reference exactly: short dark curly hair, warm brown skin, light-blue t-shirt, dark-blue jeans, blue sneakers)"
GIRL = "the hero girl (match the attached reference exactly: dark hair in two braids, warm brown skin, pink long-sleeved top, dark-blue jeans, pink sneakers)"
LAM = "Lammah (match the attached reference: a living magnifying glass with a sky-blue lens face, golden rim, a short wooden handle as its body, thin arms with white cartoon gloves, short legs with teal sneakers)"
END = " No text, no letters, no numbers anywhere in the image."
NEG = "text, letters, numbers, captions, labels, watermark, logos, realistic photo, horror, creepy, extra fingers, deformed hands, anatomically wrong organs, genitals, toilet, blood, gore, dark background, needles pointing at faces, weapons, soldiers, crosses, religious symbols"
RB, RG, RL = 'مرجع-البطل-ولد.png', 'مرجع-البطلة-بنت.png', 'مرجع-لماح.png'

BONE_WIN = ("A soft round see-through window on the child's thigh shows the long thigh bone inside, cream-colored, with two thin glowing light-blue bands near its two ends "
            "(the growth plates) and tiny sparkles at those bands only.")
def title(kid, who):
    return {
      'L02': f"Title scene for a lesson about the years of growing up (puberty), gentle and modest. {kid} stands at the start of a winding garden path made of round stepping stones that climb gently uphill toward a bright horizon; along the path stand soft see-through silhouettes of the same child at older ages, each a little taller, all fully clothed in modest everyday clothes, the last one a young teenager. Above the child's head a small soft window shows the brain with one tiny glowing spot at its base sending little golden sparkles down the path. {LAM} walks beside the child holding a small lantern. MUST: no body details at all, only height differences; all figures fully and modestly clothed; calm, hopeful mood; no text or numbers on the stones.",
      'L03': f"Title scene for a lesson about privacy and body safety, calm and reassuring. {kid} stands in a cozy home hallway and gently knocks on a closed bedroom door with one hand, while holding up the other open palm toward the viewer; each of the five fingertips has a tiny round glowing bubble with a friendly face inside: a mother in a headscarf, a father, a grandmother, a teacher, and an aunt. {LAM} stands beside the child making a polite 'wait' gesture at the door. MUST: everyone modestly dressed; the door is closed; warm, safe mood; no text, no letters on the door.",
      'L01': f"Title scene for a lesson about how children grow. {kid} stands straight with {who} back against a wooden door frame at home, smiling, while {LAM} stands on a small step stool and holds a flat hardcover book level on top of {who} head to mark the height. On the door frame there are several short colored pencil lines at different heights (older marks, lower down) — no numbers, no writing. {BONE_WIN} On a small shelf nearby: a framed photo of a tiny baby. MUST: the marks are only colored lines; the growth-plate bands are near the two ends of the bone, not in the middle; modest clothes; no numbers anywhere.",
    }

def items():
    P = []
    def add(name, refs, prompt, check, lesson=None):
        P.append({'name': name, 'lesson': lesson or name[:7], 'refs': refs, 'prompt': STYLE + '\n\n' + prompt + END, 'negative': NEG, 'check': check})
    tb, tg = title(BOY, 'his'), title(GIRL, 'her')
    chk_title = {'L01': 'علامات على إطار الباب خطوط ملونة بلا أرقام؛ نافذة الفخذ تُظهر العظم وشريطين مضيئين قرب طرفيه لا في وسطه؛ صورة رضيع في إطار.',
                 'L02': 'لا تفاصيل جسم إطلاقاً، فرق الطول وحده؛ كل الصور الظلية بملابس محتشمة؛ لا أرقام على الحجارة.',
                 'L03': 'الباب مغلق والطفل يطرقه؛ خمس فقاعات على أطراف الأصابع بوجوه كبار موثوقين؛ ملابس محتشمة؛ بلا كتابة.'}
    for L in ['L01', 'L02', 'L03']:
        add(f'U10.{L}-title-boy.webp', [RB, RL], tb[L], chk_title[L])
        add(f'U10.{L}-title-girl.webp', [RG, RL], tg[L], 'كما في غلاف الولد.')
    # ———— U10.L01 ————
    add('U10.L01-exp.webp', [RG, RL], f"Experiment page: a 2×2 grid of four rounded cards on a cream background. (1) Morning: {GIRL} in modest long pajamas, just woken up (a soft sunrise in the window), stands barefoot with her back and heels against a wall with a long strip of paper tape on it; a grown-up's hand holds a flat hardcover book level on top of her head and marks a short line on the tape with a pencil. (2) Evening (moon and stars in the window): the same measurement again; the new pencil line is a little lower than the morning line. (3) Close-up of the paper tape with the two short lines, a tiny gap between them, and a measuring tape beside them with plain tick marks only. (4) A notebook with an empty table of blank boxes and a pencil. {LAM} holds a little sun and moon badge. MUST: the evening line is slightly LOWER than the morning line; no numbers on the tape or anywhere; she stands on the floor, not on a chair.", 'خط المساء أدنى قليلاً من خط الصباح؛ شريط القياس بعلامات بلا أرقام؛ الكبير يمسك الكتاب؛ لا كرسي.')
    add('U10.L01-letter.webp', [RL], f"Letter scene: a cute small character that is a growth plate — a soft light-blue rounded band of cartilage with a big friendly face — sitting near the top end of a friendly cream-colored thigh bone like on a balcony; tiny round cartilage cells line up beside it like little building blocks becoming bone. It writes a letter with only wavy lines. A crescent moon and a small pillow float nearby (it works most while the child sleeps), plus a tiny plate with vegetables and a small ball. {LAM} holds a ruler with plain tick marks only. MUST: the band is near the END of the bone, not the middle; the letter and ruler have no numbers or writing.", 'الصفيحة قرب طرف العظم لا وسطه؛ القمر والوسادة؛ الرسالة والمسطرة بلا كتابة ولا أرقام.')
    add('U10.L01-life.webp', [RB, RL], f"Everyday-life scene in a school morning line-up in the yard: a few boys laugh and point at a short classmate; {BOY} walks over, stands beside the short classmate with a friendly hand on his shoulder, and speaks calmly to the laughing boys, who start to look sorry; the classmates are of different heights and skin tones. {LAM} stands between them holding a little heart. MUST: the short classmate is not crying in a humiliating way, just a bit sad and then relieved; nobody is hit or pushed; no text.", 'الزميل القصير حزين قليلاً ثم مطمئن؛ البطل يقف بجانبه بهدوء؛ لا ضرب ولا دفع؛ بلا كتابة.')
    add('U10.L01-hist1.webp', [RL], f"Historical scene in Kairouan, Tunisia, around the year 950: a gentle physician with a neat beard, a white turban and a long robe sits on a low cushion in a bright courtyard with horseshoe arches and a small fountain; a young mother in a modest dress and headscarf holds a happy baby on her lap while the physician watches the baby kindly and writes in a large book with a reed pen; on a low table: a small cup of milk, a few dates and a jar of herbs. {LAM} peeks over the book. MUST: the book shows only wavy lines, no writing; gentle cartoon figures, not portraits; no religious symbols on the buildings.", 'الكتاب خطوط بلا كتابة؛ أقواس قيروانية ونافورة؛ لا رموز دينية؛ رضيع سعيد.')
    # ———— U10.L02 (بإذن ولي الأمر) ————
    add('U10.L02-exp.webp', [RG, RL], f"Experiment page: a 2×2 grid of four rounded cards on a cream background. (1) {GIRL} draws a long straight horizontal line with a ruler on a long sheet of paper, with evenly spaced small tick marks (no numbers). (2) With a coral pencil she draws a long band above the line starting near the left; with a teal pencil a second band below the line starting a little later to the right. (3) She places a small yellow star sticker on the line, smiling. (4) A notebook with an empty table of blank boxes and a pencil. {LAM} holds the ruler. MUST: the bands are simple colored strips, no body drawings at all; tick marks without numbers; no text.", 'شريطان ملونان فقط بلا رسوم أجسام؛ علامات بلا أرقام؛ نجمة على الخط؛ بلا كتابة.')
    add('U10.L02-letter.webp', [RL], f"Letter scene: a friendly cartoon brain character with a big kind face sits in a cozy armchair writing a letter with only wavy lines; at the base of the brain a tiny pea-sized glowing round character (the pituitary gland) waves and holds a little golden key. Small golden sparkles float from it like gentle messages. {LAM} reads the letter over its shoulder. MUST: no body parts other than the brain; the letter has only wavy lines; no text.", 'الدماغ شخصية لطيفة، وفي قاعه غدة صغيرة بحجم حبة البازلاء؛ الرسالة خطوط متموجة بلا كتابة.')
    add('U10.L02-life.webp', [RB, RL], f"Everyday-life scene in a bright classroom: a boy classmate (about 13, modest school clothes) stands reading aloud from a book, looking a little embarrassed with a small wobbly squiggle near his mouth showing his voice cracked; two boys at the back start to giggle, but {BOY} turns around and calmly gestures to them to stop, then gives the reader an encouraging thumbs-up; the kind teacher nods. {LAM} holds a little heart. MUST: no one is humiliated; the giggling stops; no text on the board or book (only wavy lines).", 'زميل تشقق صوته؛ البطل يوقف الضحك ويشجعه؛ لا إهانة؛ السبورة والكتاب بلا كتابة.')
    add('U10.L02-hist1.webp', [RL], f"Historical scene in an English physiology laboratory in 1902: two scientists in Edwardian dark suits with neat moustaches — one tall with a short beard, one slimmer — stand at a wooden lab bench with glass beakers, tubes and a small dripping funnel, looking with surprise and delight at a drop of clear liquid falling into a beaker; tall windows and wooden cabinets. {LAM} peeks from behind a beaker. MUST: no animals, no surgery, no blood visible; gentle cartoon figures, not portraits; no text on labels.", 'لا حيوانات ولا جراحة ولا دم؛ زجاجيات مختبر؛ ملصقات بلا كتابة.')
    # ———— U10.L03 ————
    add('U10.L03-exp.webp', [RB, RL], f"Experiment page: a 2×2 grid of four rounded cards on a cream background. (1) {BOY} traces around his own open hand with a pencil on white paper. (2) His father (modest clothes, short beard) sits beside him at the table, both smiling, as the boy colors each finger of the traced hand a different color with a tiny round face doodle on each fingertip. (3) In the palm of the drawn hand three bold simple symbols: a raised stop hand, an arrow walking away, and a speech bubble — no letters. (4) The finished hand drawing pinned on a bedroom wall. {LAM} holds colored pencils. MUST: no text or letters anywhere, only simple symbols and doodle faces; warm family mood.", 'يد مرسومة بأصابع ملونة ووجوه صغيرة؛ رموز بسيطة في الكف بلا حروف؛ الأب بجانبه؛ بلا كتابة.')
    add('U10.L03-letter.webp', [RL], f"Letter scene: a friendly glowing outline of a child figure (simple, fully clothed shape, like a soft paper cut-out filled with gentle light) sits on a cushion writing a letter with only wavy lines; around it float three small icons: a heart, a closed door with a little knocker, and an open hand. {LAM} sits beside it and listens. MUST: the figure is simple and fully clothed; no body details; the letter has only wavy lines; no text.", 'شخصية ظلية مضيئة بسيطة بملابس؛ قلب وباب مغلق ويد مفتوحة؛ الرسالة بلا كتابة.')
    add('U10.L03-life.webp', [RB, RL], f"Everyday-life scene in a school corridor beside the sports changing-room door after a football match: all the boys are fully dressed in their school clothes and carrying sports bags; one boy holds up a phone camera toward the closed changing-room door with a mischievous grin, while {BOY} steps in front of him, raising a calm open palm to say 'no', and points toward a teacher walking down the corridor. {LAM} covers the phone lens with its glove. MUST: everyone fully dressed; the changing-room door is closed; nothing inside is visible; no text.", 'الجميع بملابسهم كاملة؛ باب الغرفة مغلق؛ البطل يمنع التصوير؛ لماح يغطي العدسة؛ بلا كتابة.')
    add('U10.L03-hist1.webp', [RL], f"Historical scene in a madrasa courtyard in Baghdad around the year 1095: a calm, wise scholar with a white turban and a grey beard sits on a carpet under an arched portico, kindly speaking to a small group of attentive boys sitting in a half circle; one boy holds a wooden writing board; nearby a few other boys play with a ball in the sunny courtyard after their lesson. {LAM} sits among the boys listening. MUST: gentle cartoon figures, not portraits; no text on the board (only wavy lines); no religious symbols on the walls.", 'أطفال يتعلمون وآخرون يلعبون بعد الدرس؛ اللوح خطوط بلا كتابة؛ لا رموز دينية.')
    return P

if __name__ == '__main__':
    P = items()
    OUT.mkdir(parents=True, exist_ok=True)
    data = {'unit': 'U10', 'style': STYLE, 'negative': NEG,
            'pending_imagegen': {p['name']: {k: p[k] for k in ('lesson', 'refs', 'prompt', 'negative', 'check')} for p in P}}
    (OUT / 'prompts-final-imagegen.json').write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    TT = {'title-boy': 'غلاف (ولد)', 'title-girl': 'غلاف (بنت)', 'exp': 'التجربة', 'letter': 'الرسالة', 'life': 'في حياتي', 'hist1': 'علماء 1', 'hist2': 'علماء 2'}
    md = ['# برومبتات الصور القصصية — الوحدة U10 «النمو والبلوغ والخصوصية والحدود» (%s)' % (f'{len(P)} صور' if 3 <= len(P) <= 10 else f'{len(P)} صورة'), '',
          '**طريقة العمل:**',
          '1. لكل صورة: أرفق في أداة التوليد صور المرجع المذكورة (مرجع البطل والبطلة ولمّاح، كما في U07 وU08)، ثم الصق البرومبت كما هو؛ فيه وصف الأسلوب الموحّد في أوله.',
          '2. المقاس عمودي **1024×1536**. بلا أي كتابة أو أرقام داخل الصورة.',
          '3. احفظ كل صورة **بالاسم المكتوب فوقها بالضبط** (WebP أو PNG، وأنا أحوّل)، ثم أرسلها مضغوطة في ملف واحد أو أرفقها هنا.',
          '4. قبل أن تقبل الصورة، راجع سطر «تحقق» تحتها.', '',
          f'**Negative prompt (إن كانت الأداة تقبله):** `{NEG}`', '']
    for i, p in enumerate(P, 1):
        slot = p['name'].split('-', 1)[1].replace('.webp', '')
        md += [f"## {i}. `{p['name']}` — {p['lesson']} {TT.get(slot, slot)}", f"**أرفق:** {'، '.join(p['refs'])}", '', '```', p['prompt'], '```', f"**تحقق:** {p['check']}", '']
    (OUT / 'الصور-القصصية-للنسخ.md').write_text('\n'.join(md), encoding='utf-8')
    print(len(P), 'برومبت')
