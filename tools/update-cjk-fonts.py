from pathlib import Path
import re,json,shutil
r=Path(__file__).resolve().parents[1];package=r/'node_modules/@fontsource/noto-sans-sc';css=(package/'400.css').read_text();chars={ord(c) for p in (r/'lessons').glob('*.json') for item in json.loads(p.read_text())['concepts'] for c in item['term']['zh'] if ord(c)>127};needed=[];covered=set()
for face in re.findall(r'@font-face\s*\{.*?\}',css,re.S):
 ranges=re.search(r'unicode-range:\s*([^;]+)',face)
 if not ranges:continue
 def hit(cp):
  for item in ranges[1].split(','):
   q=item.strip().replace('U+','');a,b=q.split('-') if '-' in q else (q,q)
   lo=int(a.replace('?','0'),16);hi=int(b.replace('?','F'),16)
   if lo<=cp<=hi:return True
  return False
 hits={cp for cp in chars if hit(cp)}
 if not hits:continue
 filename=re.search(r'url\(\./files/([^)]*\.woff2)\)',face)[1];shutil.copyfile(package/'files'/filename,r/'app/v2/fonts'/filename);face=re.sub(r'src:.*?;',"src: url('./"+filename+"') format('woff2');",face,flags=re.S);needed.append(face);covered|=hits
assert chars==covered,'Missing CJK glyph coverage'
(r/'app/v2/fonts/noto-sans-sc.css').write_text('/* Noto Sans SC, Fontsource OFL; current curriculum shards. */\n'+'\n'.join(needed)+'\n');shutil.copyfile(package/'LICENSE',r/'app/v2/fonts/OFL-NotoSansSC.txt')
p=r/'app/v2/fonts/app-fonts.css';s=p.read_text();p.write_text(s if "@import url('noto-sans-sc.css');" in s else "@import url('noto-sans-sc.css');\n"+s)
for p in [r/'app/v2/engine.css',r/'app/v2/index-template.html']:
 s=p.read_text().replace('"IBM Plex Sans Arabic",system-ui','"IBM Plex Sans Arabic","Noto Sans SC",system-ui');p.write_text(s)
print('CJK characters',len(chars),'covered',len(covered),'font shards',len(needed))
