# -*- coding: utf-8 -*-
"""برومبتات الصور القصصية للدروس السبعة المضافة (يولّدها صاحب المشروع). يكتب:
art-sources/ADD/prompts/prompts-final-imagegen.json و art-sources/ADD/prompts/الصور-القصصية-للنسخ.md
الاستعمال: python3 art-sources/ADD/sources/prompts_add.py
"""
from pathlib import Path
import json, importlib.util

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / 'prompts'
_sp = importlib.util.spec_from_file_location('p10', HERE.parent.parent / 'U10' / 'sources' / 'prompts_u10.py'); p10 = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(p10)
STYLE, BOY, GIRL, LAM, END, RB, RG, RL = p10.STYLE, p10.BOY, p10.GIRL, p10.LAM, p10.END, p10.RB, p10.RG, p10.RL
NEG = p10.NEG + ", brand names, logos, colorful pills or capsules, candy-like medicine, medicine names, syringes with needles, diseased organs, gore, mocking faces, crosses or religious symbols, valentine heart symbol"
NOTXT = ' MUST: no text, no letters, no numbers anywhere.'

def title(kid, who):
    return {
     'U06.L06': f"Title scene for a lesson about the balanced plate. {kid} sits at a family table smiling at a large round plate: half colorful vegetables and fruit (carrot sticks, cucumber, an orange, grapes), a quarter brown bread and bulgur, a quarter lentils and a boiled egg, with a glass of water beside it. {LAM} holds a small fork like a flag. MUST: no calorie or weight symbols; no 'good/bad food' signs; food looks appetizing." + NOTXT,
     'U08.L06': f"Title scene for a lesson about feelings and the body. {kid} sits on a cushion in a cozy room, one hand on {who} chest, taking a slow calm breath; around the child float four soft round bubbles with simple faces: happy, sad, worried and angry, all gentle and friendly. {LAM} breathes slowly beside the child with eyes closed. MUST: all feelings shown as normal and gentle, none scary." + NOTXT,
     'U08.L07': f"Title scene for a lesson about screens and the body. {kid} stands up from a sofa stretching {who} arms high, a tablet with a plain glowing screen lying switched off on the cushion behind; through the window a sunny park with a ball and trees waits. {LAM} points happily toward the window. MUST: the screen shows only soft color, no app logos; balanced, not scolding." + NOTXT,
     'U09.L05': f"Title scene for a lesson about using and storing medicine safely. {kid} stands in a kitchen beside {who} mother (headscarf) who reads the plain label of a small white medicine box with a measuring cup; a high wooden cupboard with a small yellow lock is open above them. {LAM} gives a thumbs-up from the top of the cupboard. MUST: no pills visible, no candy-like medicine, no names on boxes." + NOTXT,
     'U10.L04': f"Title scene for a lesson about the human life journey. {kid} walks along a gentle curving path with the family: a baby in a stroller pushed by the mother (headscarf), the father, and a smiling grandmother and grandfather walking slowly with a cane; behind them a soft rainbow-colored ribbon shows the life stages as simple silhouettes from baby to elder. {LAM} carries a small flower for the grandmother. MUST: warm and respectful; elders dignified." + NOTXT,
     'U10.L05': f"Title scene for a lesson about different bodies and friendship. In a school yard {kid} laughs and plays a ball game with three classmates: one uses a wheelchair, one wears a small hearing aid, and one wears glasses and holds a white cane folded at her side. Everyone is having fun together as equals. {LAM} cheers holding a ball. MUST: respectful, joyful, no pity; assistive devices drawn accurately." + NOTXT,
     'U11.L03': f"Title scene for a lesson comparing human and animal bodies. {kid} kneels in a garden giving water in a bowl to a thirsty cat; nearby a cow grazes behind a fence, a small bird sits on a branch, a goldfish swims in a round pond, and a giraffe peeks over a far wall. Soft see-through windows show a simple realistic heart in the child and in the bird. {LAM} holds a watering can. MUST: kind to animals; no dissection; heart not a ♥ symbol." + NOTXT,
    }

ITEMS = {
 'U06.L06': [
  ('exp', [RB, RL], f"Experiment page: 2×2 grid of rounded cards. (1) {BOY} draws a big empty plate divided into half and two quarters on paper. (2) He places paper cutouts of vegetables, fruit, bread and lentils in the right parts. (3) He reads the back of a plain drink can together with his father, the label showing only lines and bars. (4) A notebook with an empty table of blank boxes. {LAM} holds a teaspoon.", 'طبق ورقي مقسوم؛ ملصق بخطوط فقط؛ لا سعرات؛ بلا كتابة.'),
  ('letter', [RL], f"Letter scene: a friendly cartoon stomach character with a kind face sits at a small desk writing a letter with only wavy lines; around it, friendly food characters wave: a carrot, an apple, a loaf of bread, an egg and a glass of water. {LAM} sits on the desk.", 'المعدة شخصية لطيفة؛ أطعمة متنوعة؛ لا «جيد/سيئ».'),
  ('life', [RG, RL], f"Everyday-life scene at a school canteen: {GIRL} chooses a bottle of water and an orange from a counter instead of a sugary can, smiling; her friend next to her does the same. {LAM} gives a thumbs-up. MUST: no one is shamed; the cans have no brands.", 'اختيار الماء والفاكهة بلا تعيير أحد؛ بلا علامات.'),
  ('hist1', [RL], f"Historical scene on a wooden sailing ship's deck in 1747: a Scottish naval doctor in an 18th-century coat and tricorn hat kneels beside twelve sailors resting in six pairs on hammocks; each pair has a different cup or bowl; the last pair holds oranges and lemons and looks clearly happier. {LAM} holds a lemon. MUST: no blood, no gore; gentle cartoon, not a portrait.", 'ستة أزواج؛ زوج البرتقال والليمون أسعد؛ لا دم.'),
 ],
 'U08.L06': [
  ('exp', [RG, RL], f"Experiment page: 2×2 grid. (1) {GIRL} sits and places one hand on her belly, breathing in slowly. (2) She breathes out slowly with soft wavy air lines. (3) She draws a simple feeling-face in a notebook. (4) A notebook with an empty table of blank boxes. {LAM} counts on its fingers.", 'تنفس بطيء؛ لا أرقام.'),
  ('letter', [RL], f"Letter scene: a friendly cartoon brain character and a friendly cartoon tummy character sit side by side writing one letter together with only wavy lines; a soft string of light connects them. {LAM} hugs a cushion.", 'الدماغ والأمعاء صديقان؛ الرسالة بلا كتابة.'),
  ('life', [RB, RL], f"Everyday-life scene in a school corridor: two boys tease a smaller boy who sits sadly against a wall; {BOY} does not laugh, walks to the sad boy and kindly invites him, while a girl goes to call the teacher who is coming. {LAM} stands next to the sad boy. MUST: the bullies are not drawn as monsters; no hitting shown; hopeful.", 'لا ضرب؛ البطل لا يضحك ويأتي بكبير؛ جو أمل.'),
  ('hist1', [RL], f"Historical scene in a 9th-century scholar's room in Balkh: a Muslim scholar with a turban and a gentle beard writes in a large book with a reed pen; on the page are two simple drawings side by side: a body outline and a soft cloud-shaped mind bubble, balanced. Oil lamp and bookshelves. {LAM} reads along. MUST: no writing in the book, only drawings and wavy lines; no religious symbols.", 'رسم بدن ونفس متوازنين؛ بلا كتابة.'),
 ],
 'U08.L07': [
  ('exp', [RB, RL], f"Experiment page: 2×2 grid. (1) {BOY} colors a big circle divided into 24 slices with blue, yellow, red and green crayons. (2) He compares two circles side by side. (3) He writes three family rules as icons on a paper (plate with no screen, moon with no screen, ball). (4) A notebook with an empty table. {LAM} holds a crayon.", 'دائرة يوم بألوان؛ قواعد بأيقونات؛ بلا أرقام.'),
  ('letter', [RL], f"Letter scene: two friendly cartoon eye characters with long lashes sit on a windowsill writing a letter with only wavy lines, looking out at a far green tree; a tablet lies switched off beside them. {LAM} points to the far tree.", 'العينان تنظران بعيداً؛ الشاشة مطفأة.'),
  ('life', [RG, RL], f"Everyday-life scene at bedtime: {GIRL} places a phone in a small basket on a hallway shelf outside her bedroom, and walks to bed holding a paper book; the bedroom is dim and cozy with a night light. Her mother smiles from the doorway. {LAM} yawns. MUST: the phone screen is off.", 'الهاتف خارج الغرفة؛ كتاب ورقي.'),
  ('hist1', [RL], f"Historical scene: a schoolyard in Guangzhou, China around 2011: Chinese first-grade children play outdoors under the sun during an extra outdoor class while a teacher watches; in the foreground a Chinese ophthalmologist in a white coat checks a child's eyes with a simple eye chart made only of shapes. {LAM} plays with the children. MUST: the eye chart has only shapes, no letters; gentle cartoon, not portraits.", 'لوحة نظر بأشكال لا حروف؛ لعب خارج الصف.'),
 ],
 'U09.L05': [
  ('exp', [RB, RL], f"Experiment page: 2×2 grid. (1) {BOY} draws a top-view map of his home. (2) He sticks green and red dots on places with his mother. (3) The mother puts a medicine box into a high locked cupboard while the boy watches (he does not touch it). (4) A notebook with an empty table. {LAM} holds a green dot.", 'الكبير يحرك الدواء؛ الطفل لا يلمسه؛ بلا أسماء.'),
  ('letter', [RL], f"Letter scene: a friendly cartoon liver character with a kind face sits at a desk writing a letter with only wavy lines; beside it a glass of water and a small plain white box on a high shelf. {LAM} waters a plant.", 'الكبد شخصية لطيفة؛ لا حبوب.'),
  ('life', [RG, RL], f"Everyday-life scene at a sports club: teammates hold plain cans; {GIRL} holds her water bottle up proudly and drinks water after practice, explaining kindly to a friend who then takes a water bottle too. {LAM} carries a water bottle. MUST: cans have no brands.", 'قارورة ماء؛ علب بلا علامات.'),
  ('hist1', [RL], f"Historical scene around the year 1012 in a Persian physician's study: a scholarly physician with a turban writes in a large book with a reed pen; on the table are dried herbs in plain clay jars and a small balance; the open page shows simple drawings: one patient icon, a little clock, many patient icons, and a person icon. {LAM} weighs a leaf on the balance. MUST: no writing in the book; no religious symbols; gentle cartoon, not a portrait.", 'أيقونات بلا كتابة؛ أعشاب في جرار بلا أسماء.'),
 ],
 'U10.L04': [
  ('exp', [RG, RL], f"Experiment page: 2×2 grid. (1) {GIRL} draws a long paper ribbon starting with a tiny dot and then a baby. (2) She glues picture cards along the ribbon: child, teen, adult, elder. (3) She politely listens to her grandmother telling a story. (4) A notebook with an empty table. {LAM} holds a glue stick.", 'شريط عمر؛ احترام الجدة؛ بلا كتابة.'),
  ('letter', [RL], f"Letter scene: a friendly cartoon bone character (a long white bone with a kind face) sits at a desk writing a letter with only wavy lines; next to it a small bone character and a gentle older bone character with tiny reading glasses. {LAM} hands it a glass of milk.", 'عظام بأعمار مختلفة؛ بلا كتابة.'),
  ('life', [RB, RL], f"Everyday-life scene on a city bus: {BOY} stands up and offers his seat to an elderly man with a cane who smiles gratefully; other passengers smile. {LAM} holds the hand rail.", 'القيام للكبير؛ جو احترام.'),
  ('hist1', [RL], f"Historical scene in a 1980 university lab in North Carolina, USA: a newborn baby lies comfortably in a soft bassinet wearing small headphones and sucking a pacifier connected by a thin wire to a simple machine with lights (no numbers); a researcher in a 1980s sweater watches calmly beside the mother who smiles. {LAM} listens with a tiny headphone. MUST: the baby is safe and calm; no text or numbers on the machine.", 'المولود هادئ؛ لهاية وسماعة؛ بلا أرقام.'),
 ],
 'U10.L05': [
  ('exp', [RG, RL], f"Experiment page: 2×2 grid. (1) {GIRL} and a classmate walk a school corridor and put a red sticker by stairs without a ramp. (2) They put a green sticker by a ramp. (3) She touches a card of raised dots with her eyes closed while a friend holds her other hand. (4) A notebook with an empty table. {LAM} holds a green sticker.", 'ملصقات عوائق وعون؛ بطاقة نقاط بارزة.'),
  ('letter', [RL], f"Letter scene: a friendly cartoon fingertip-skin character with a kind face reads a page of raised dots by touch, sitting at a desk; beside it a small hearing-aid character and a friendly wheel character wave. {LAM} claps.", 'القراءة باللمس؛ بلا كتابة.'),
  ('life', [RB, RL], f"Everyday-life scene in a classroom: a classmate who walks with a crutch enters; {BOY} smiles and asks if she would like help carrying her bag, and she nods; other children make space. {LAM} holds the door. MUST: respectful, no pity faces.", 'السؤال قبل العون؛ بلا شفقة.'),
  ('hist1', [RL], f"Historical scene in a Paris school for blind youth around 1824: a 15-year-old French boy with closed eyes sits at a wooden desk pressing small dots into thick paper with a pointed tool and a metal slate, feeling them with his fingertips, smiling; other students listen. {LAM} feels the dots too. MUST: gentle cartoon, not a portrait; no letters, only dots.", 'نقاط بارزة فقط؛ لا حروف.'),
 ],
 'U11.L03': [
  ('exp', [RB, RL], f"Experiment page: 2×2 grid. (1) {BOY} fills a big comparison table with four picture columns: a child, a fish, a bird, a cow. (2) He builds hearts from small blocks: two blocks, three blocks, four blocks. (3) He stacks seven small blocks and seven tall blocks side by side (a neck and a giraffe neck). (4) He washes his hands with soap after feeding a class pet turtle. {LAM} holds a block.", 'مكعبات الحجرات والفقرات؛ غسل اليدين؛ بلا أرقام.'),
  ('letter', [RL], f"Letter scene: a friendly realistic-shaped cartoon heart character (NOT a ♥ symbol) sits at a desk writing a letter with only wavy lines; around it smaller heart characters belonging to a fish, a frog and a bird wave from little picture frames. {LAM} holds a water dish for a bird.", 'قلب بشكله لا ♥؛ قلوب حيوانات صغيرة.'),
  ('life', [RG, RL], f"Everyday-life scene at the school gate on a hot day: a cat rests panting in the shade; {GIRL} watches as the school guard places a bowl of water near it; she keeps a safe distance and smiles. {LAM} fans the cat with a leaf.", 'رحمة مع سلامة؛ لا تمسك القطة.'),
  ('hist1', [RL], f"Historical scene in 9th-century Basra: an elderly Arab scholar with a turban sits in a garden courtyard writing in a large book with a reed pen while watching ants, birds and a cat closely; a magnifying-style round window shows ants carrying grain. Palm trees and a canal. {LAM} watches the ants. MUST: no writing in the book; no religious symbols; gentle cartoon, not a portrait.", 'مشاهدة دقيقة للحيوان؛ بلا كتابة.'),
 ],
}

CHK_TITLE = {'U06.L06': 'طبق متوازن وماء؛ بلا سعرات؛ بلا كتابة.', 'U08.L06': 'أربعة مشاعر لطيفة؛ تنفس هادئ.', 'U08.L07': 'شاشة مطفأة وحركة؛ بلا شعارات.',
             'U09.L05': 'خزانة عالية مقفلة؛ لا حبوب؛ علبة بلا اسم.', 'U10.L04': 'أجيال الأسرة؛ احترام الكبار.', 'U10.L05': 'لعب متساوٍ؛ أدوات عون دقيقة؛ بلا شفقة.',
             'U11.L03': 'رحمة بالحيوان؛ القلب بشكله؛ لا تشريح.'}

def items():
    P = []
    def add(name, lesson, refs, prompt, check):
        P.append({'name': name, 'lesson': lesson, 'refs': refs, 'prompt': STYLE + '\n\n' + prompt + END, 'negative': NEG, 'check': check})
    tb, tg = title(BOY, 'his'), title(GIRL, 'her')
    for lid in ITEMS:
        add(f'{lid}-title-boy.webp', lid, [RB, RL], tb[lid], CHK_TITLE[lid])
        add(f'{lid}-title-girl.webp', lid, [RG, RL], tg[lid], 'كما في غلاف الولد.')
        for slot, refs, pr, chk in ITEMS[lid]:
            add(f'{lid}-{slot}.webp', lid, refs, pr + NOTXT, chk)
    return P

if __name__ == '__main__':
    P = items()
    OUT.mkdir(parents=True, exist_ok=True)
    data = {'unit': 'ADD', 'style': STYLE, 'negative': NEG,
            'pending_imagegen': {p['name']: {k: p[k] for k in ('lesson', 'refs', 'prompt', 'negative', 'check')} for p in P}}
    (OUT / 'prompts-final-imagegen.json').write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    TT = {'title-boy': 'غلاف (ولد)', 'title-girl': 'غلاف (بنت)', 'exp': 'التجربة', 'letter': 'الرسالة', 'life': 'في حياتي', 'hist1': 'علماء 1'}
    md = [f'# برومبتات الصور القصصية — الدروس السبعة المضافة ({len(P)} صورة)', '',
          '**طريقة العمل:**',
          '1. لكل صورة: أرفق صور المرجع المذكورة (البطل والبطلة ولمّاح)، ثم الصق البرومبت كما هو.',
          '2. المقاس عمودي **1024×1536**. بلا أي كتابة أو أرقام داخل الصورة.',
          '3. احفظ كل صورة **بالاسم المكتوب فوقها بالضبط**، ثم أرسلها مضغوطة.',
          '4. راجع سطر «تحقق» تحت كل صورة. في درس الدواء: لا حبوب ملونة ولا أسماء أدوية.', '',
          f'**Negative prompt:** `{NEG}`', '']
    for i, p in enumerate(P, 1):
        slot = p['name'].split('-', 1)[1].replace('.webp', '')
        md += [f"## {i}. `{p['name']}` — {p['lesson']} {TT.get(slot, slot)}", f"**أرفق:** {'، '.join(p['refs'])}", '', '```', p['prompt'], '```', f"**تحقق:** {p['check']}", '']
    (OUT / 'الصور-القصصية-للنسخ.md').write_text('\n'.join(md), encoding='utf-8')
    print(len(P), 'برومبت')
