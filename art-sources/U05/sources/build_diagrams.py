from pathlib import Path
import math,random,json,subprocess,io,zipfile
from PIL import Image
ROOT=Path(__file__).resolve().parent.parent
SRC=ROOT/'sources'
random.seed(28)
C='#61464A'; TEAL='#239D92'; RED='#E34E4B'; DARK='#892D42'; SKY='#BFE7FF'
defs='''<defs>
<radialGradient id="paper"><stop stop-color="#FFFDF4"/><stop offset="1" stop-color="#FFF1D9"/></radialGradient>
<radialGradient id="rbc"><stop stop-color="#F78A77"/><stop offset=".58" stop-color="#E85B54"/><stop offset="1" stop-color="#BA3947"/></radialGradient>
<radialGradient id="sac"><stop stop-color="#FFF3EE"/><stop offset=".75" stop-color="#FAC6CB"/><stop offset="1" stop-color="#E899AB"/></radialGradient>
<linearGradient id="glass" x2="1" y2="1"><stop stop-color="#E8F9FE" stop-opacity=".8"/><stop offset="1" stop-color="#AADCEC" stop-opacity=".18"/></linearGradient>
<radialGradient id="lens"><stop stop-color="#E4F6FF"/><stop offset="1" stop-color="#96D7EE"/></radialGradient>
</defs>'''
def path(d,fill='none',stroke=C,w=5,extra=''):
 return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round" {extra}/>'
def circ(x,y,r,fill,stroke='none',w=3,extra=''):
 return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{w}" {extra}/>'
def ellipse(x,y,rx,ry,fill,stroke='none',w=3,extra=''):
 return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{fill}" stroke="{stroke}" stroke-width="{w}" {extra}/>'
def rect(x,y,w,h,fill,stroke='none',sw=3,rx=24,extra=''):
 return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>'
def group(s,x=0,y=0,scale=1,rotate=0):
 return f'<g transform="translate({x} {y}) scale({scale}) rotate({rotate})">{s}</g>'
def arrow(x1,y1,x2,y2,color=TEAL,w=7):
 a=math.atan2(y2-y1,x2-x1);l=w*2.8
 ax=x2-l*math.cos(a-.5);ay=y2-l*math.sin(a-.5);bx=x2-l*math.cos(a+.5);by=y2-l*math.sin(a+.5)
 return path(f'M{x1} {y1}L{x2} {y2}',stroke=color,w=w)+path(f'M{ax} {ay}L{x2} {y2}L{bx} {by}',stroke=color,w=w)
def face(x,y,s=1):
 return group(ellipse(-19,-6,8,12,'#FFFDF3')+ellipse(19,-6,8,12,'#FFFDF3')+ellipse(-18,-4,4,7,'#443232')+ellipse(18,-4,4,7,'#443232')+path('M-15 21Q0 36 15 21',stroke=C,w=4),x,y,s)
def mascot(x=840,y=1370,s=.7):
 q=path('M-25 82L-42 130M15 82L30 130',stroke='#92683E',w=15)+ellipse(-42,135,24,12,TEAL,C)+ellipse(33,135,24,12,TEAL,C)
 q+=rect(-15,25,30,77,'#AA764A',C,4,12)+path('M-60 15Q-95 30 -92 57M60 15Q90 2 104 -24',stroke=C,w=9)+circ(-92,57,10,'#FFD56E',C)+circ(104,-24,10,'#FFD56E',C)
 q+=circ(0,0,73,'#FFD56E',C,5)+circ(0,0,60,'url(#lens)',TEAL,3)+face(0,0,1.3)+path('M-38 -37Q-20 -53 -5 -48',stroke='white',w=8)
 return group(q,x,y,s)
def panel(y,h=390,x=50,w=924):return rect(x,y,w,h,'#FFFDF6','#E9D5B8',3,32)
def rbc(x,y,s=1,dark=False,angle=0):
 q=ellipse(0,0,35,24,DARK if dark else 'url(#rbc)',DARK,2.5)+ellipse(0,0,15,9,'#B8404B' if dark else '#F8AA91',extra='opacity=".8"')+path('M-22 -10Q-6 -21 16 -13',stroke='#FFCCAA',w=3)
 return group(q,x,y,s,angle)
def platelet(x,y,s=1,angle=0):
 return group(path('M-11 -3L-5 -10L2 -6L10 -9L13 0L6 5L3 12L-4 6L-12 6Z','#F4D49C','#B58A60',2),x,y,s,angle)
def wbc(x,y,s=1,engulf=False):
 d='M-62 0C-80 -42 -26 -75 18 -58C52 -75 87 -31 58 14C65 63 10 78 -29 57C-66 58 -74 24 -62 0Z'
 q=path(d,'#F9F2FA','#BD9DC3',4)+ellipse(-24,-6,19,29,'#AC83B5')+ellipse(10,12,22,23,'#AC83B5')+ellipse(29,-16,18,22,'#AC83B5')+path('M-12 9L1 12M18 2L26 -3',stroke='#AC83B5',w=8)
 if engulf:q+=path('M45 -45Q91 -55 85 -10Q69 10 56 -2',fill='#FAF4FA',stroke='#BD9DC3',w=4)+rect(64,-37,11,25,'#7BAE80',rx=5)
 return group(q,x,y,s)
def oxygen(x,y,r=9):return circ(x,y,r,'#67BE9D','#268A76',2)
def waste(x,y,r=8):return circ(x,y,r,'#ADB0B4','#767980',2)
def vessel(x,y,w=740,h=90,exchange=False):
 q=rect(0,0,w,h,'#FCE9DC',DARK,3,rx=35)
 for pos in range(0,int(w)-65,64):
  q+=rect(pos+7,-11,61,19,'#F9DED7','#B28B91',2,10)+rect(pos+7,h-9,61,19,'#F9DED7','#B28B91',2,10)
  q+=ellipse(pos+36,-2,8,3,'#B391A3')+ellipse(pos+36,h+1,8,3,'#B391A3')
 for pos in range(46,int(w)-30,90):q+=rbc(pos,h/2,.8,dark=False)
 if exchange:
  for pos in range(140,int(w)-60,210):q+=arrow(pos,20,pos,-73,TEAL,5)+oxygen(pos,-90)+arrow(pos+70,h+70,pos+70,h-6,'#8F9297',5)+waste(pos+70,h+90)
 return group(q,x,y)
def lungs(x,y,s=1):
 q=path('M-25 -140C-88 -164 -172 -50 -163 82C-161 133 -53 140 -28 105Z','url(#sac)','#BF7180',5)+path('M24 -140C86 -160 154 -35 145 65C143 121 74 133 37 96L23 34Z','url(#sac)','#BF7180',5)
 q+=path('M0 -198V-72M0 -72L-63 -18M0 -72L61 -15',stroke='#C97781',w=15)
 for d in ['M-63 -18L-107 26M-63 -18L-69 65M61 -15L104 23M61 -15L67 62','M-107 26L-124 71M-69 65L-98 94M104 23L118 70M67 62L93 91']:q+=path(d,stroke='#D99098',w=8)
 return group(q,x,y,s)
def sac(x,y,s=1,net=True,damaged=False):
 q=path('M-30 -89V-145H30V-89C102 -78 143 -10 114 67C93 133 -67 143 -113 76C-154 2 -118 -76 -30 -89Z','url(#sac)','#CF8090',4)
 if net:
  for k in [-70,-25,25,70]:q+=path(f'M{k} -83C{k-65} -10 {k+65} 60 {k} 105',stroke=RED,w=4)
  for k in [-50,-4,42,83]:q+=path(f'M-108 {k}Q0 {k+40} 110 {k}',stroke=DARK,w=3)
 if damaged:q+=path('M-65 -49L-27 -30L-50 2L-10 8L-19 45L36 20L54 60','#84777D','#6E6168',5)
 return group(q,x,y,s)
def cluster(x,y,s=1,damaged=False):
 q=path('M0 -125V-55M0 -55L-66 -7M0 -55L66 -7M0 -55V45',stroke='#CD8B96',w=16)
 for k,(a,b) in enumerate([(-77,0),(0,6),(77,0),(-87,65),(-20,84),(55,81),(107,52)]):q+=group(sac(0,0,.37,True,damaged and k>3),a,b)
 return group(q,x,y,s)
def heart(x,y,s=1):
 q=path('M-14 -62V-107H8V-62M8 -61Q10 -119 56 -108Q84 -101 67 -59',stroke=RED,w=20)+path('M-68 -44V-94',stroke=DARK,w=16)
 q+=path('M-57 -58C-90 -45 -81 16 -42 55L10 94C42 78 79 29 78 -13C81 -68 36 -81 9 -58C-15 -82 -43 -72 -57 -58Z','#E4655C',DARK,5)
 q+=path('M8 -48Q-10 8 17 70M12 9L54 26M8 -12L-39 16',stroke='#F3A888',w=4)
 return group(q,x,y,s)
def boy(x,y,s=1,jump=False):
 q=''
 if not jump:
  q+=rect(35,245,174,22,'#CDA47A',C,4,8)+path('M50 260V385M195 260V385M35 245V152',stroke='#977960',w=10)
  q+=path('M62 277L121 291L121 351M143 277L187 291L187 351',stroke='#314869',w=36)+ellipse(131,369,34,16,'#3D6379',C)+ellipse(197,369,34,16,'#3D6379',C)
 else:q+=path('M62 277L58 360M143 277L155 360',stroke='#314869',w=44)+ellipse(47,369,34,16,'#3D6379',C)+ellipse(166,369,34,16,'#3D6379',C)
 q+=path('M52 150Q100 126 153 150L174 265Q103 289 33 265Z','#9ECDE4','#43687F',4)
 if jump:q+=path('M48 169L10 129L-5 88M157 169L195 128L207 88',stroke='#C98D63',w=26)
 else:q+=path('M45 175L20 225L108 241M155 175L169 232',stroke='#C98D63',w=25)
 q+=circ(99,82,61,'#DDA16E','#805238',3)+ellipse(38,89,13,18,'#DDA16E')+ellipse(161,89,13,18,'#DDA16E')
 for xx,yy in [(43,43),(58,22),(84,18),(107,17),(135,23),(154,43),(125,46),(69,44)]:q+=circ(xx,yy,21,'#45312B','#352724',2)
 q+=face(100,91,1.25)
 return group(q,x,y,s)
def clock(x,y,s=1):return group(circ(0,0,45,'#FFF8DF',C,4)+path('M0 0V-25M0 0L23 12',stroke=C,w=5)+circ(0,0,4,C),x,y,s)
def save(name,body):
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1536" viewBox="0 0 1024 1536">{defs}<rect width="1024" height="1536" fill="url(#paper)"/>{body}</svg>'
 p=SRC/(name+'.svg');p.write_text(svg)
 png=subprocess.run(['inkscape',str(p),'--export-type=png','--export-filename=-'],stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=True).stdout
 with Image.open(io.BytesIO(png)) as im:
  im.load()
  out=io.BytesIO();im.convert('RGB').save(out,'WEBP',quality=96,method=6)
  b=out.getvalue();tmp=ROOT/(name+'.webp.tmp');tmp.write_bytes(b);tmp.replace(ROOT/(name+'.webp'))
 return name+'.webp',b,svg

def capillary_letter():
 q=panel(60,650)+panel(750,600)
 # A thick artery stays closed. Exchange is restricted to the single-cell capillary below.
 q+=path('M150 360Q480 190 865 360',stroke='#BD5359',w=160)+path('M150 360Q480 190 865 360',stroke='#F7C9BE',w=80)
 q+=face(500,290,1.5)
 for x in [200,370,550,730]:q+=rbc(x,310-45*math.sin((x-150)/700*math.pi),1)
 q+=vessel(136,1010,750,84,True)
 for x,y in [(218,875),(425,1214),(659,875)]:q+=ellipse(x,y,69,52,'#D6BFDA','#A98CB4',3)+ellipse(x-8,y,20,15,'#B496C1')
 q+=face(848,1055,.75)+path('M110 830Q80 1030 110 1230',stroke='#514347',w=115)
 q+=mascot(840,1425,.5)
 return q
def tube_lab():
 q=ellipse(510,1400,385,45,'#E6D6BE')+rect(100,1085,824,37,'#C1D8D9',C,4,10)
 q+=rect(155,124,320,270,'#C8E4E5',C,5,70)+ellipse(315,132,160,65,'#EDF7F4',C,5)+ellipse(315,132,112,43,'#BCD4D2',C,3)
 for k in range(6):
  a=k*math.pi/3;q+=ellipse(315+75*math.cos(a),132+23*math.sin(a),16,9,'#8EADA9')
 q+=path('M180 104L151 39Q294 -23 444 57L455 110','#E4F1E9',C,5)
 # Liquid layers use approximately 55% plasma, under 1% buffy coat, remaining red cells.
 for x,separated in [(352,False),(650,True)]:
  q+=path(f'M{x-70} 575V1240Q{x} 1330 {x+70} 1240V575Z','url(#glass)','#7AABB9',6)
  if separated:
   q+=path(f'M{x-58} 963V1236Q{x} 1306 {x+58} 1236V963Z',DARK,'none')+rect(x-58,674,116,281,'#F8DB83',rx=0)+rect(x-58,955,116,8,'#FFFBEF',rx=0)
  else:q+=path(f'M{x-58} 674V1236Q{x} 1306 {x+58} 1236V674Z',DARK,'none')
  q+=ellipse(x,575,70,18,'#EDF8F4','#7AABB9',4)+path(f'M{x-44} 633V1197',stroke='white',w=8)
 q+=mascot(825,520,.75)
 return q
def micro_rbc():
 q=panel(55,1425)+vessel(135,710,755,100)
 q+=lungs(300,300,.7)+rect(595,1090,250,180,'#E5A58D',C,4,35)
 for k in range(5):q+=path(f'M610 {1120+30*k}Q720 {1090+30*k} 830 {1120+30*k}',stroke='#C77F72',w=5)
 for x in [200,340,480]:q+=rbc(x,462,1)+oxygen(x-8,438)+arrow(x,520,x,660,TEAL,6)
 for x in [595,705,815]:q+=rbc(x,992,1,True)+oxygen(x,1036)+arrow(x,860,x,935,DARK,6)+arrow(x,1049,x,1090,TEAL,5)
 q+=mascot(370,742,.4)+arrow(165,881,850,881,RED,8)
 q+=path('M130 1100C85 1160 52 1198 68 1252C98 1320 193 1300 199 1244C203 1198 160 1150 130 1100Z','#E88275',DARK,4)
 for x,y in [(102,1220),(151,1236),(131,1260)]:q+=rbc(x,y,.45)
 return q
def immune():
 q=rect(50,70,924,1395,'#FBEDD1','#EAD8B6',3,55)
 for j in range(8):
  for i in range(5):
   x=145+185*i+(25 if j%2 else 0);y=175+159*j
   if (280<x<610 and 415<y<800) or (480<x<900 and 940<y<1240):continue
   q+=rbc(x,y,1.05,angle=(-20+i*12))
 q+=wbc(426,620,1.65,True)+wbc(715,1100,1.45)
 q+=rect(571,549,16,35,'#6DAB80',rx=8)+rect(536,575,13,26,'#6DAB80',rx=7)
 q+=circ(863,1035,24,'#98C2CB','#557A8D',3)
 for a in range(0,360,45):q+=circ(863+22*math.cos(math.radians(a)),1035+22*math.sin(math.radians(a)),4,'#4C7C8F')
 return q
def wound_detail(y,stage=3,sc=1):
 q=rect(0,10,800,120,'#EAC0A0',rx=0)+rect(0,0,800,25,'#D49870',rx=4)+rect(0,130,800,120,'#FAF0E2',rx=0)
 q+=rect(0,144,800,76,'#F9D9D1',DARK,3,30)
 q+=path('M0 143H367M435 143H800',stroke='#C98C97',w=14)+path('M0 222H800',stroke='#C98C97',w=14)
 for x in [80,200,570,705]:q+=rbc(x,183,.65,angle=-12)
 q+=path('M368 143L382 27H421L435 143','#F0C3AA','none')
 for k in range({1:5,2:17,3:27,4:24}[stage]):q+=platelet(375+(k*17)%59,139-(k*13)%44,.5,k*19)
 if stage>=2:
  q+=path('M337 98Q290 130 308 165M460 96Q506 124 488 160',stroke='#E8BC62',w=3)
  q+=platelet(266,183,.5)+platelet(503,185,.5)
 if stage>=3:
  q+=rbc(399,95,.5)+rbc(416,118,.4)
  for k in range(6):q+=path(f'M361 {80+k*12}L440 {101+k*8}M{366+k*12} 76L{382+k*9} 155',stroke='#FFF6C7',w=2.5)
 if stage==4:
  q+=path('M367 21Q394 -2 431 20L423 40H379Z','#9F6C4E','#805542',3)
  q+=path('M371 63Q400 40 429 63',stroke='#EAA4AA',w=15)+path('M370 143H433',stroke='#C98C97',w=12)
  for x in range(374,429,13):q+=ellipse(x,61,7,10,'#F4BBC0','#C9838D',1.5)
 return group(q,112,y,sc)
def wound_two():
 q=panel(75,460)+panel(600,760)
 # A single fingertip with a small dry scab, no open or bleeding injury.
 q+=path('M225 490V270Q225 164 350 163Q475 164 475 270V490','#DFAD86','#966A51',5)+rect(267,206,167,115,'#F4CEB2','#BF9279',3,52)
 q+=path('M329 356Q349 341 375 358L369 371L339 372Z','#9F6C4E','#805542',3)
 q+=circ(645,302,132,'url(#glass)','#D4B16C',9)+path('M460 366L534 358M734 408L791 468',stroke='#C5A16A',w=12)
 q+=path('M645 437L512 830',stroke=TEAL,w=3,extra='stroke-dasharray="9 10"')+wound_detail(878,4)+mascot(836,715,.6)
 return q
def wound_four():
 q=''
 for k in range(4):
  y=45+k*365;q+=panel(y,325)+wound_detail(y+47,k+1)
  if k<3:q+=arrow(515,y+335,515,y+356,TEAL,5)
 q+=mascot(896,1380,.34)
 return q
def marrow():
 q=panel(55,1420)
 q+=path('M230 310C150 335 116 254 167 218C203 192 247 213 263 250L288 281Q332 252 361 294Q383 327 351 368L322 425L322 1055L390 1132Q426 1210 362 1240Q330 1245 299 1210L278 1188L253 1211Q187 1260 150 1204Q125 1172 165 1132L236 1050L236 425L250 358Z','#F5E3B9','#A78666',6)
 q+=path('M258 389H313V1074H258Z','#EBCB78','#C7A05F',3)+ellipse(285,327,85,62,'#DF9A93','#B97579',3)+ellipse(285,1137,85,62,'#DF9A93','#B97579',3)
 for cy in [327,1137]:
  for k in range(30):
   a=k*2.4;r=18+((k*17)%52);q+=path(f'M{285+r*math.cos(a)} {cy+r*.7*math.sin(a)}l16 10l-10 18',stroke='#F1CFB2',w=5)
 q+=path('M348 329C471 328 493 606 550 670L905 850',stroke='#B97579',w=43)+path('M348 329C471 328 493 606 550 670L905 850',stroke='#F9DFCE',w=30)
 for x,y in [(376,350),(449,453),(480,565),(579,685),(705,750),(849,817)]:q+=rbc(x,y,.6)
 q+=wbc(628,710,.5)+wbc(805,795,.5)
 for x,y in [(500,610),(658,723),(742,777),(884,831)]:q+=platelet(x,y,.5)
 q+=circ(737,1160,150,'#FFF8E7','#E8D4B7',3)+heart(737,1148,.7)+path('M353 348L584 343',stroke='#D8BE91',w=3,extra='stroke-dasharray="8 12"')+mascot(770,350,.7)
 return q
def pleura():
 q=panel(60,675)+panel(785,680)
 # Longitudinal trachea with the posterior gaps visible, plus transverse C inset.
 q+=path('M186 170V597Q275 653 365 597V170','#F7D8BE','#B79579',4)
 for yy in range(204,600,70):q+=path(f'M189 {yy}Q264 {yy+37} 335 {yy+5}',stroke='#F7EDC9',w=28)+path(f'M189 {yy}Q264 {yy+37} 335 {yy+5}',stroke='#B9BAA2',w=3)
 q+=path('M682 230A126 126 0 1 0 682 446',stroke='#B9BAA2',w=48)+path('M682 230A126 126 0 1 0 682 446',stroke='#F5EDCC',w=34)+path('M682 230L682 446',stroke='#D9A19B',w=13)
 q+=path('M342 410L504 342',stroke='#C1B69C',w=3,extra='stroke-dasharray="9 10"')
 # The two pleural layers are adjacent with only a hairline fluid film.
 q+=path('M216 1024C341 848 607 865 697 1118C762 1306 538 1382 293 1333Z','url(#sac)','#BB7E91',4)
 q+=path('M213 1023C337 842 613 860 703 1116C770 1314 538 1388 289 1340',stroke='#D7A5B3',w=6)
 q+=path('M205 1018C331 832 623 850 712 1113C783 1325 535 1398 282 1349',stroke='#B2DDE1',w=5)
 q+=path('M198 1015C326 823 632 839 720 1111C795 1335 533 1410 276 1357',stroke='#C79CA7',w=6)
 q+=path('M180 1000C300 787 660 811 752 1103C830 1364 536 1453 266 1388',stroke='#E3C8AD',w=25)
 q+=arrow(822,1110,822,1250,TEAL,6)+arrow(875,1250,875,1110,TEAL,6)+mascot(844,650,.45)
 return q
def zoom_sacs():
 q=panel(55,405)+panel(510,405)+panel(965,500)
 q+=lungs(410,313,.7)+circ(514,342,57,'none',TEAL,4,extra='stroke-dasharray="8 8"')
 q+=path('M555 376L712 556',stroke=TEAL,w=4,extra='stroke-dasharray="8 10"')+cluster(459,713,1.3)+circ(583,805,53,'none',TEAL,4,extra='stroke-dasharray="8 8"')
 q+=path('M610 844L726 1015',stroke=TEAL,w=4,extra='stroke-dasharray="8 10"')+sac(455,1254,1.1)+mascot(829,1328,.5)
 return q
def gas_exchange():
 q=panel(65,1400)
 # Expanded cross-section of the alveolar lumen over the adjacent capillary.
 q+=path('M145 717V317Q510 102 879 317V717Z','#FDEFEA','#D9A8AC',4)
 q+=rect(145,717,734,14,'#F5C6CE','#C98A9C',2,2)+rect(145,737,734,14,'#F6DACB','#B69A96',2,2)
 for xx in [230,470,720]:q+=ellipse(xx,724,22,4,'#CE9BAD')+ellipse(xx+55,744,20,4,'#BB9D9E')
 q+=rect(145,755,734,280,'#FBE5D5','#B97682',3,30)
 for xx in [230,500,750]:q+=rbc(xx,908,1.7)
 for xx in [269,554]:
  q+=oxygen(xx,542,15)+arrow(xx,576,xx,833,TEAL,9)+oxygen(xx+8,888,12)
 for xx in [400,699]:q+=waste(xx,984,14)+arrow(xx,873,xx,590,'#92979F',9)+waste(xx,542,13)
 q+=mascot(805,1269,.8)
 return q
def hemoglobin():
 q=panel(70,575)+panel(780,645)+lungs(235,280,.48)+rect(100,1010,225,200,'#E6AA92',C,4,30)
 for yy in range(1030,1200,30):q+=path(f'M121 {yy}Q200 {yy-15} 308 {yy}',stroke='#C47B6F',w=5)
 q+=path('M659 521C951 604 899 705 667 853',stroke='#F2C3BA',w=90)+path('M659 521C951 604 899 705 667 853',stroke=DARK,w=3)
 for y,dark in [(380,False),(1090,True)]:
  q+=rbc(610,y,4,dark)
  # Four linked faint hemoglobin subunits, each with an iron-colored central point.
  for dx,dy in [(-31,-22),(25,-22),(-31,23),(25,23)]:q+=circ(610+dx,y+dy,24,'#F4B29B',extra='opacity=".4"')+circ(610+dx,y+dy,4,'#A55F3E')
 for xx,yy in [(391,250),(439,281),(456,220)]:q+=oxygen(xx,yy,12)+arrow(xx,yy+18,520,341,TEAL,5)
 for xx,yy in [(393,1210),(447,1243),(424,1300)]:q+=oxygen(xx,yy,12)+arrow(525,1152,xx,yy-16,TEAL,5)
 q+=mascot(811,1393,.45)
 return q
def surface_area():
 q=panel(70,565)+panel(690,420)+panel(1160,300)
 # Same outer envelope: a smooth empty bag versus many separated small sacs.
 q+=ellipse(270,360,149,201,'#F5B8BB','#C28A98',4)+path('M253 158V110H288V158','#E8AAAD','#C28A98',4)
 q+=rect(561,158,296,402,'none','#E2D0B5',3,80,extra='stroke-dasharray="9 10"')
 for row in range(7):
  for col in range(5):q+=ellipse(596+52*col,196+53*row,25,25,'url(#sac)','#C28A98',2)
 q+=rect(128,823,240,125,'#9BCFC8',TEAL,4,12)+path('M128 858H369M128 895H369',stroke='#D9F4DF',w=6)
 q+=rect(533,737,334,287,'#9BCFC8',TEAL,4,12)
 for xx in range(555,860,48):q+=path(f'M{xx} 750V1011',stroke='#D9F4DF',w=5)
 for yy in range(765,1005,48):q+=path(f'M545 {yy}H855',stroke='#D9F4DF',w=5)
 q+=cluster(326,1310,.72,True)+path('M830 1210Q721 1160 660 1203Q638 1239 558 1239',stroke='#B6AFAC',w=35,extra='opacity=".55"')+mascot(832,1390,.4)
 return q
def ciliated(x,y,w=760,damaged=False):
 q=rect(0,170,w,115,'#EAC3B6','#B78B8B',3,rx=9)
 for xx in range(0,w,62):q+=rect(xx,170,61,113,'#F3D7C7','#BD9594',2,8)+ellipse(xx+30,235,10,19,'#CA9BA7')
 # Upward in this longitudinal airway view means toward the mouth/outlet at TOP.
 q+=rect(0,116 if not damaged else 76,w,28 if not damaged else 66,'#DCE7BA','#B4C08B',2,15,extra='opacity=".85"')
 for xx in range(15,w-20,22):
  if not damaged:q+=path(f'M{xx} 171Q{xx+2} 142 {xx+20} 136',stroke='#8D8F77',w=4)
  else:q+=path(f'M{xx} 171Q{xx+13} 161 {xx+24} 167',stroke='#A7A092',w=4)
 for xx,yy in [(65,113),(210,120),(349,107),(540,119),(679,102)]:q+=ellipse(xx,yy,9,6,'#AA8E6D')
 for xx in [130,438,622]:q+=rect(xx,116,17,7,'#86AF8C',rx=4)
 return group(q,x,y)
def cilia_one():
 q=panel(65,1400)
 # Rotate the epithelial strip, so the ciliary sweep is literally UPWARD.
 q+='<g transform="translate(50 1330) scale(2.8 1.1) rotate(-90)">'+ciliated(0,0,1060)+'</g>'
 for yy in [360,650,940]:q+=arrow(250,yy+120,250,yy-70,TEAL,9)
 q+=mascot(793,1302,.65)+path('M838 1220L866 1155',stroke='#A3794C',w=7)+path('M841 1157L879 1166',stroke='#CBA455',w=16)
 return q
def smoke_compare():
 q=panel(55,650)+panel(755,700)
 q+='<g transform="translate(120 645) scale(2.2 1.1) rotate(-90)">'+ciliated(0,0,450)+'</g>'
 q+='<g transform="translate(120 1340) scale(2.2 1.1) rotate(-90)">'+ciliated(0,0,450,True)+'</g>'
 q+=arrow(181,480,181,205,TEAL,8)
 q+=circ(774,1139,143,'#FFF9EC','#D6BFA8',3)+cluster(774,1139,.62,True)
 q+=path('M806 812Q666 766 565 849Q525 878 423 867',stroke='#B2ADAA',w=40,extra='opacity=".5"')
 # Faded waterpipe icon, nobody using it.
 q+=group(path('M-20 18L-35 94Q0 121 35 94L20 18Z','#D9D0C3','#B4A591',4)+path('M0 18V-57M-22 -57H22M18 22Q80 6 81 79',stroke='#B4A591',w=7)+circ(0,25,110,'none','#D7877F',6),790,450,.65)
 return q
def capillary_zoom():
 q=panel(40,360)+panel(440,340)+panel(825,650)
 q+=path('M180 207H840',stroke='#C45D62',w=140)+path('M180 207H840',stroke='#F8DCD1',w=67)
 for xx in [260,440,620,790]:q+=rbc(xx,207,.8)
 for yy in [525,608,691]:q+=path(f'M199 608Q382 607 484 {yy}H835',stroke='#D0787E',w=22)+path(f'M199 608Q382 607 484 {yy}H835',stroke='#F9E5D7',w=13)
 q+=path('M508 320V488M508 725V865',stroke=TEAL,w=3,extra='stroke-dasharray="8 12"')+vessel(160,1100,715,78,True)
 q+=path('M90 950Q62 1125 90 1350',stroke='#504447',w=98)
 for x,y in [(287,970),(558,1310)]:q+=ellipse(x,y,90,54,'#D8C4DD','#A58FB0',3)
 q+=mascot(836,1375,.38)
 return q
def closed_loop():
 q=panel(60,1405)+heart(512,260,1)
 q+=path('M480 160C180 103 164 427 190 759L268 1050',stroke='#CF5B60',w=62)+path('M480 160C180 103 164 427 190 759L268 1050',stroke='#F7B8A7',w=28)
 q+=path('M744 1047L827 752C865 418 813 147 558 161',stroke=DARK,w=35)+path('M744 1047L827 752C865 418 813 147 558 161',stroke='#D9A0A1',w=20)
 for i in range(6):
  yy=1050+i*48;q+=path(f'M268 1050C320 {yy-20} 349 {yy} 393 {yy}S652 {yy+14} 744 1047',stroke=RED if i<3 else DARK,w=7)
 for xx,yy in [(405,1090),(603,1230),(490,1310)]:q+=ellipse(xx,yy,55,35,'#DBC3DE','#B093B8',3)
 q+=arrow(174,567,186,707,RED,8)+arrow(835,707,843,555,DARK,8)+arrow(424,1057,595,1064,TEAL,7)+mascot(650,724,.7)
 return q
def bottle_exp():
 q=''
 for x,y in [(45,60),(535,60),(45,785),(535,785)]:q+=panel(y,680,x,444)
 q+=boy(138,210,.95)+clock(401,165,.65)+boy(624,190,.95,True)+boy(138,935,.95)+clock(405,895,.65)
 # Airtight chamber, open breathing tube, membrane pulled downward.
 q+=path('M660 935V1010L598 1060V1328H921V1060L860 1010V935Z','url(#glass)','#70A4AF',5)
 q+=rect(657,947,207,25,'#DDCBB3','#9F8D78',3,8)
 q+=path('M760 902V1054',stroke='#D4A6A3',w=24)+path('M760 902V1054',stroke='#FFF3E3',w=13)
 q+=path('M760 1040C697 1040 671 1124 695 1177C713 1237 809 1237 829 1177C852 1114 823 1040 760 1040Z','#ED7168','#A34F56',4)
 q+=path('M599 1326Q760 1470 920 1326','#FFD575','#C89D3B',6)
 q+=arrow(760,841,760,918,TEAL,5)+arrow(759,1246,759,1350,TEAL,7)
 q+=path('M720 1457L733 1397Q747 1383 756 1399L760 1430L767 1395Q780 1384 789 1398L802 1457','#DEA779','#A97857',4)
 q+=mascot(513,763,.42)
 return q
def arm_hand(x,y,s=1,rotation=0,veins=True):
 q=path('M-47 -200L-42 -47Q-63 -16 -48 18L-23 41V104Q-22 122 -10 116V55H-4V132Q0 146 13 132V52H20V123Q24 137 34 121V44H41V104Q49 117 57 100V8L91 -24Q98 -39 85 -43L48 -20L46 -200Z','#DDA578','#956B50',4)
 if veins:
  q+=path('M4 -165V-5L3 51M4 -17L-24 17M4 -14L32 22M3 51L-9 89M3 51L27 91',stroke='#8E9EAB',w=5,extra='opacity=".65"')
 return group(q,x,y,s,rotation)
def vein_exp():
 q=panel(55,425)+panel(525,425)+panel(995,465)
 q+=boy(117,115,.76)+arm_hand(656,268,.93,0,True)
 q+=arrow(866,157,866,353,'#C1A37C',5)
 q+=boy(117,585,.76)+arm_hand(656,779,.93,180,False)
 q+=arrow(866,875,866,635,'#C1A37C',5)
 q+=arm_hand(490,1204,1.1,90,True)
 # Static gentle contact only; no misleading directional milking arrow.
 q+=path('M555 1045V1177Q555 1199 538 1199Q521 1198 521 1177V1090L500 1071','#DDA578','#956B50',4)
 q+=mascot(833,1361,.45)
 return q

