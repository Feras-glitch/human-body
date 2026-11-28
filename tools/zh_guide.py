#!/usr/bin/env python3
"""دليل الأم بالصينية (قرار 28 نوفمبر): يكتب lessons/zh/<id>.json من نص صيني مؤلَّف، مع بصمة النص العربي لكل حقل.
الاستعمال من سكربت تأليف:  from zh_guide import write;  write('U01.L01', dict(title=..., point=..., obj=[...], do=..., safety=[...],
  explain=..., mis=[(says, answer), ...], dinner=(q, listen)))
البصمة: sha1 للنص العربي كما هو بصيغتيه (تغيير صيغة البنت وحدها يُكتشف أيضاً)، بلا {اسم}، والمسافات موحّدة؛ أول 10 خانات. tools/build-mom-guide.mjs يحسبها بالطريقة نفسها
فيعلّم الحقل «يحتاج تحديثاً» إن تغيّر العربي بعد الترجمة."""
import hashlib, json, re, sys
def norm(t): return re.sub(r'\s+', ' ', (t or '').replace('{اسم}', '')).strip()
def h(t): return hashlib.sha1(norm(t).encode('utf-8')).hexdigest()[:10]
def sources(L):
    e = L['experiment']; f = L['flow']
    return dict(title=L['title']['ar'], point=L['science']['central_fact'],
        obj=[o['statement'] for o in L['objectives']],
        do=e['title'] + ' ' + ' '.join(e['steps']), safety=list(e['safety']),
        explain=' '.join(x['text'] for x in f['explain']),
        mis=[m['child_says'] + ' ' + m['teacher_response'] for m in L['misconceptions']],
        dinner=L['dinner']['q'] + ' ' + L['dinner']['listen'])
def cq(s):
    """علامات التنصيص الصينية: "…" ← “…”"""
    if s.count('"') % 2: return s
    out, o = [], True
    for ch in s:
        if ch == '"': out.append('“' if o else '”'); o = not o
        else: out.append(ch)
    return ''.join(out)
def write(lid, g, root='.'):
    g = {k: (cq(v) if isinstance(v, str) else [cq(x) if isinstance(x, str) else tuple(cq(y) for y in x) for x in v] if isinstance(v, list) else tuple(cq(y) for y in v)) for k, v in g.items()}
    L = json.load(open(f'{root}/lessons/{lid}.json', encoding='utf-8')); S = sources(L)
    for k in ('obj', 'safety', 'mis'):
        if len(g[k]) != len(S[k]): sys.exit(f'{lid}: {k} = {len(g[k])} والأصل {len(S[k])}')
    out = {'id': lid,
        'title': {'src': h(S['title']), 'zh': g['title']}, 'point': {'src': h(S['point']), 'zh': g['point']},
        'objectives': [{'src': h(s), 'zh': z} for s, z in zip(S['obj'], g['obj'])],
        'do': {'src': h(S['do']), 'zh': g['do']}, 'safety': [{'src': h(s), 'zh': z} for s, z in zip(S['safety'], g['safety'])],
        'explain': {'src': h(S['explain']), 'zh': g['explain']},
        'misconceptions': [{'src': h(s), 'says': a, 'answer': b} for s, (a, b) in zip(S['mis'], g['mis'])],
        'dinner': {'src': h(S['dinner']), 'q': g['dinner'][0], 'listen': g['dinner'][1]}}
    open(f'{root}/lessons/zh/{lid}.json', 'w', encoding='utf-8').write(json.dumps(out, ensure_ascii=False, indent=1) + '\n')
    print(lid, 'ok')
