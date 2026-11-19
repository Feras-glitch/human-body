from pathlib import Path
import ast, math
O=Path(__file__).parent
CREAM='#FFF6E3';INK='#775C48';BONE='#F4E5C9';SKIN='#E9B18B'
old=ast.parse((O/'shared_diagrams.py').read_text())
for n in old.body:
 if isinstance(n,(ast.Import,ast.ImportFrom,ast.FunctionDef)):
  exec(compile(ast.Module(body=[n],type_ignores=[]),'<shared>','exec'))
CREAM='#FFF6E3';INK='#775C48';BONE='#F4E5C9';SKIN='#E9B18B'
def linebone(x1,y1,x2,y2,w=15):return path(f'M{x1} {y1} L{x2} {y2}','none',INK,w+4)+path(f'M{x1} {y1} L{x2} {y2}','none',BONE,w)
def hand(joints=False):
 s=''
 for y in [0,13]:
  for x in [-20,-7,7,20]:s+=rect(x-5,y-5,11,11,BONE,4)
 s+=linebone(-19,18,-47,43,7)+linebone(-47,43,-60,61,7)+linebone(-60,61,-68,78,6)
 for x,end,L in [(-18,68,56),(-5,76,65),(9,74,59),(22,64,48)]:
  bx=x*1.7;s+=linebone(x,23,bx,end,7);yy=end
  for f in [.44,.32,.24]:
   nxt=yy+L*f;s+=linebone(bx,yy,bx,nxt,6)
   if joints:s+=circ(bx,yy,5,'#2BB3A3','none',0)
   yy=nxt
 if joints:
  for x in [-20,-7,7,20]:s+=circ(x,7,4,'#2BB3A3','none',0)
 return s

def ribs(organs=False):
 s=''
 if organs:
  s+=path('M-17 146 C-90 135 -125 202 -119 294 Q-80 337 -20 307Z','#E8A2A2','#B07875',3)
  s+=path('M17 146 C90 135 125 202 119 294 Q80 337 20 307Z','#E8A2A2','#B07875',3)
  s+=path('M0 107 L0 170 M0 153 L-35 179 M0 153 L35 179','none','#CEB59E',11)
  s+=group(heart(),30,250,.44)
 for j in range(12):
  y=146+j*15;r=70+35*math.sin(j*math.pi/13)
  if j<7:
   s+=path(f'M-8 {y} C{-r} {y-30} {-r-28} {y+22} -12 {y+31} M8 {y} C{r} {y-30} {r+28} {y+22} 12 {y+31}','none',INK,9)
   s+=path(f'M-8 {y} C{-r} {y-30} {-r-28} {y+22} -12 {y+31} M8 {y} C{r} {y-30} {r+28} {y+22} 12 {y+31}','none',BONE,6)
  else:
   # False/floating lower ribs shorten and do not all attach directly to sternum.
   end=30+(j-7)*11
   s+=path(f'M-8 {y} Q{-r-43} {y-15} {-end} {y+31} M8 {y} Q{r+43} {y-15} {end} {y+31}','none',INK,9)
   s+=path(f'M-8 {y} Q{-r-43} {y-15} {-end} {y+31} M8 {y} Q{r+43} {y-15} {end} {y+31}','none',BONE,6)
 s+=path('M0 148 L0 285','none',INK,18)+path('M0 148 L0 285','none',BONE,12)
 return s

def heart():
 s=path('M-31 -48 C-58 -71 -88 -42 -77 0 C-68 43 -18 96 19 117 C51 86 77 38 55 -17 C39 -52 8 -58 -31 -48Z','#C77B72','#9A5B56',6)
 s+=path('M-25 -39 L-23 -86 Q-18 -116 9 -104 L27 -78','none','#B65A56',25)
 s+=path('M24 -38 L44 -83 M-56 -26 L-76 -58','none','#6D9DB6',15)
 s+=path('M-10 -20 Q27 30 18 80 M-10 17 L-42 33 M10 47 L42 28','none','#E9ADA0',5)
 return s

def skull():
 s=path('M-56 37 C-87 -4 -73 -77 -20 -85 C48 -104 85 -54 65 21 L47 45 L38 72 L-38 72 L-47 45Z',BONE)
 for x in [-25,25]:s+=ell(x,13,17,18,'#D8C4A6','#B8A487',3)
 s+=path('M-8 35 L0 25 L8 35','none','#B8A487',3)+path('M-30 56 Q0 66 30 56','none','#B8A487',3)
 return s

def femur():
 s=path('M-24 4 Q-63 -11 -68 16 Q-77 47 -44 55 L-18 80 L-13 270 Q-42 300 -20 316 Q0 330 13 314 Q36 332 49 309 Q61 288 28 270 L23 83 Q40 61 31 39 Q20 20 6 39 L-24 4Z',BONE)
 s+=circ(-42,18,24,BONE)
 return s

def skeleton(joints=False,jump=False):
 s=skull()
 for y in range(84,473,20):s+=rect(-14,y,28,16,BONE,4)
 s+=path('M-18 118 Q-66 98 -109 135 M18 118 Q66 98 109 135','none',INK,12)+path('M-18 118 Q-66 98 -109 135 M18 118 Q66 98 109 135','none',BONE,8)
 s+=ribs()
 s+=path('M-20 463 Q-64 427 -107 463 L-104 524 Q-67 571 -37 543 L-18 514 L18 514 L37 543 Q67 571 104 524 L107 463 Q64 427 20 463Z',BONE)
 s+=path('M-19 465 L19 465 L0 508Z','#E6D4B6')
 for side in [-1,1]:
  t=linebone(108,141,179,341,20)+linebone(171,351,212,516,10)+linebone(189,345,230,510,9)
  t+=group(hand(joints),224,524,.64)
  t+=circ(108,141,15,BONE)+circ(180,345,13,BONE)
  if jump:t=f'<g transform="rotate(-135 108 141)">{t}</g>'
  leg=group(femur(),54,535,.77)
  low=linebone(67,789,75,1033,17)+linebone(88,789,103,1036,8)+circ(73,787,14,BONE)
  # Seven tarsals, five metatarsals and 14 toe phalanges, schematically arranged.
  for xx,yy in [(74,1046),(89,1046),(105,1046),(70,1061),(85,1061),(100,1061),(114,1061)]:low+=ell(xx,yy,8,7,BONE,INK,2)
  for z in range(5):
   xx=65+z*14;low+=linebone(xx,1073,xx-8,1108,5)
   for q in range(2 if z==0 else 3):low+=linebone(xx-8-q*2,1108+q*9,xx-10-q*2,1117+q*9,4)
  if jump:
   leg+=f'<g transform="rotate(-100 73 787)">{low}</g>'
   t+=f'<g transform="rotate(-35 54 535)">{leg}</g>'
  else:t+=leg+low
  if joints:
   for x,y in [(108,141),(180,345),(224,524),(61,551),(73,787),(89,1048)]:t+=circ(x,y,16,'none','#2BB3A3',7)
  s+=f'<g transform="scale({side} 1)">{t}</g>'
 return s

def hair(girl=False):
 s=''
 if girl:
  s+=path('M-84 15 Q-106 -86 -22 -102 Q62 -119 88 -29 L84 26 Q47 -8 26 -54 Q-11 -16 -84 15Z','#50372C','#50372C',3)
  for side in [-1,1]:
   for j in range(6):s+=ell(side*(77+j*2),46+j*22,15,17,'#50372C','#694735',2)
   s+=ell(side*88,180,15,5,'#E77E9C','#9B5D67',3)
 else:
  for j in range(12):
   a=math.pi+j*math.pi/11;s+=circ(80*math.cos(a),-12+72*math.sin(a),25,'#50372C','#694735',3)
  for x,y in [(-55,-45),(-21,-59),(17,-58),(51,-40),(-72,-8)]:s+=circ(x,y,22,'#50372C','#694735',3)
 return s

def child(girl=False,opacity=1):
 c='#E98FA8' if girl else '#72B7E4';s=''
 for side in [-1,1]:
  t=path('M55 470 L70 787 L84 1034','none','#4D7190',63)+path('M105 160 L180 345 L224 521','none',SKIN,45)
  t+=ell(227,546,24,38,SKIN)+ell(102,1063,57,24,'#E9C3C2' if girl else '#5487AC')
  s+=f'<g transform="scale({side} 1)">{t}</g>'
 s+=path('M-107 132 Q0 89 107 132 L135 239 L100 253 L106 474 Q0 501 -106 474 L-100 253 L-135 239Z',c)
 s+=rect(-78,469,156,85,'#4D7190',13)
 s+=path('M-28 80 L-28 125 Q0 146 28 125 L28 80Z',SKIN)
 s+=ell(-79,7,16,24,SKIN)+ell(79,7,16,24,SKIN)+ell(0,0,80,94,SKIN)
 for x in [-28,28]:
  s+=ell(x,6,18,25,'white',INK,2)+ell(x+2,8,10,17,'#754D39','none',0)+ell(x+4,9,5,11,'#342920','none',0)+circ(x+5,0,4,'white','none',0)
 s+=path('M-46 -30 Q-30 -39 -17 -30 M17 -30 Q30 -39 46 -30','none','#624332',6)
 s+=path('M-19 52 Q0 69 22 51','none','#9B5D4B',4)+path('M-4 26 Q-13 37 2 38','none','#BF8465',3)+hair(girl)
 return f'<g opacity="{opacity}">{s}</g>'

def silhouette():
 s=ell(0,0,85,99,'#EDCAA7','#D0B28E',3)+path('M-22 85 L-22 118 L-113 137 L-124 377 L-111 520 L-113 545 L-129 1049 L-54 1049 L-29 567 L29 567 L54 1049 L129 1049 L113 545 L111 520 L124 377 L113 137 L22 118 L22 85Z','#F6E5CC','#D0B28E',3)
 for side in [-1,1]:s+=f'<g transform="scale({side} 1)">'+path('M113 143 L180 345 L225 530','none','#EDCAA7',54)+ell(225,550,29,40,'#EDCAA7','#D0B28E',2)+'</g>'
 return s

# Full connected skeleton comparison, identical-height figures.
s=group(child(),275,220,.87)+group(silhouette(),720,220,.87)+group(skeleton(),720,220,.87)+mascot(504,1366,.55)
doc('U02.L01-E1',s)
# Joints overview uses exact joint positions on same skeleton template.
s=group(silhouette(),460,210,.94)+group(skeleton(True),460,210,.94)+mascot(840,1350,.62)
s+=group(path('M-26 -44 L26 -44 L26 0 L65 34 L51 57 L25 40 L25 117 L58 191 L31 207 L0 143 L-31 207 L-58 191 L-25 117 L-25 40 L-51 57 L-65 34 L-26 0Z','#BE9667'),180,1130,.7)
doc('U02.L02-E1',s)
# Protection triptych: skull/brain, chest, vertebral canal.
s=''
for y,c in [(50,'#FFF0DE'),(548,'#EAF2ED'),(1046,'#EEF1F8')]:s+=rect(48,y,928,440,c)
head=path('M-68 67 C-125 1 -99 -91 -17 -105 C69 -125 136 -63 115 33 L143 61 L113 80 L109 111 L61 132 L48 158 L-18 158 L-35 105Z','#E8D4B7')
head+=path('M-44 55 C-93 -2 -71 -66 -11 -78 C51 -94 100 -49 88 7 Q83 48 33 64Z','#D6A7AD','#AD7D87',5)
for j in range(5):head+=path(f'M{-43+j*23} -57 q-12 21 5 35 q-15 19 3 35','none','#B88791',3)
s+=group(head,493,216,1.25)+group(ribs(True),511,469,1.48)
for j in range(5):
 y=1118+j*66;s+=rect(290,y,140,46,BONE,12)+ell(500,y+23,80,31,BONE)+ell(500,y+23,45,16,'#FFF6E3','#BDA98D',3)
s+=path('M500 1130 L500 1411','none','#E8BF65',18)+mascot(815,1350,.58)
doc('U02.L01-E2',s)
# Jump: retain full connected skeletal structure, with bent lower legs as small callout.
s=group(path('M-23 86 L-23 117 L-113 143 L-112 446 Q-100 526 -78 551 L78 551 Q100 526 112 446 L113 143 L23 117 L23 86Z','#F6E5CC','#D0B28E',3)+ell(0,0,85,99,'#EDCAA7','#D0B28E',3),500,350,.78)+group(skeleton(False,True),500,350,.78)
s+=path('M255 1211 l-20 33 M745 1211 l20 33','none','#E7B84B',7)+ell(500,1267,184,16,'#E9DFC9','none',0)
s+=circ(188,353,146,'#FFF0DB','#CFA85F',6)+group(femur(),191,232,.7)
s+=circ(822,827,146,'#E9F2EF','#CFA85F',6)+group(hand(),830,744,1.33)+mascot(810,1355,.61)
doc('U02.L01-E3',s)
# Growth stages, with bones increasing in absolute length and plate near distal end.
s=path('M63 1220 L950 1220','none','#E7D8BC',6)
for x,y,k in [(314,684,.46),(536,451,.67),(805,218,.88)]:
 s+=group(child(),x,y,k)
 s+=group(femur(),x+54*k,y+535*k,.77*k)
# Sleeping infant has a proportionally larger head and a soft wrapped body.
s+=ell(174,1159,103,19,'#E4D9C3','none',0)+ell(192,1110,78,42,'#B7D8E2')+circ(104,1096,45,SKIN)
s+=path('M78 1093 Q88 1103 99 1093 M112 1093 Q123 1103 134 1093','none','#8E5C49',3)
s+=linebone(164,1110,195,1131,8)+linebone(184,1090,216,1110,8)
# Infant fontanelle callout shows soft gaps, not a fractured skull.
s+=circ(175,274,133,'#E8F1F5','#C9AB7D',5)
s+=ell(175,271,87,103,'#E8B3A7','#B68D7E',4)
for d in ['M100 234 Q113 179 164 175 L164 243 L140 264Z','M184 175 Q242 182 252 236 L211 264 L184 242Z','M96 255 L137 281 L163 291 L164 366 Q107 354 96 309Z','M254 255 L211 281 L184 291 L184 366 Q243 354 254 309Z']:s+=path(d,BONE,'#B7A389',3)
s+=path('M173 245 L191 272 L174 294 L155 272Z','#E8B3A7','#B68D7E',3)
s+=circ(525,248,142,'#FFF0DE','#C9AB7D',5)+group(femur(),526,134,.67)
s+=path('M515 301 Q538 310 553 300','none','#A8D6DD',13)+path('M484 371 Q499 354 509 327','none','#C7AD84',4)
s+=mascot(847,1378,.55)
doc('U02.L01-E5',s)
# Shoulder character is a conceptual personification, with the shallow socket retained.
s=rect(48,55,928,1290,'#FFF0DF')+group(shoulder(),433,451,1.63)
s+=group(path('M14 -82 Q114 -82 132 0 Q146 65 65 93','none','#D9DDC7',15),433,451,1.63)
for x in [502,548]:s+=ell(x,441,14,21,'white','none',0)+ell(x+2,444,7,13,'#634237','none',0)
s+=path('M502 504 Q526 487 548 504','none','#7C5041',5)
s+=mascot(827,1370,.5)
doc('U02.L02-letter',s)
# Scholars discuss counting, large central skeletal hand is the focal evidence.
s=''
for x,c in [(175,'#DEB2BC'),(505,'#8ABEC6'),(837,'#C5B39B')]:
 s+=rect(x-106,234,212,251,c,36)+ell(x,169,69,81,SKIN)+path(f'M{x-66} 147 Q{x} 60 {x+67} 145','none','#685044',17)
 for dx in [-23,23]:s+=ell(x+dx,173,9,13,'#624236','none',0)
 s+=path(f'M{x-20} 217 Q{x} 228 {x+20} 217','none','#98614D',4)+rect(x-63,377,126,126,'#F2D08B',9)
s+=path('M105 166 Q93 74 175 76 Q258 75 248 166 L266 259 L233 278 L231 181 Q233 114 175 108 Q116 114 119 181 L114 260 L87 241Z','#7CBAB5','#577F7E',4)
s+=path('M795 208 Q837 257 879 208 Q870 271 837 273 Q803 266 795 208Z','#D9D0C0','#B8AC98',3)
for xx in [175,505,837]:
 s+=ell(xx-68,437,14,25,SKIN)+ell(xx+68,437,14,25,SKIN)
s+=rect(48,577,928,830,'#E9F2EC')+group(hand(True),536,701,4.1)+mascot(807,1332,.63)
doc('U02.L02-E7',s)
# Muscle cover composition: clothed hero and separate, magnified schematized arm.
def muscle_cover(girl=False):
 s=group(child(girl),226,370,.78)
 # Replace default right arm with a bent, book-holding gesture foreground.
 s+=path('M131 520 L122 718 L267 603','none','#E98FA8' if girl else '#72B7E4',45)
 s+=ell(269,595,25,33,SKIN)+rect(214,483,99,93,'#78A9B9',6)
 s+=rect(440,156,533,1037,'#FFEFE0')+group(muscles(True),628,337,.85)
 s+=arrow('M703 654 L696 598','#E36660')+mascot(823,1350,.68)
 return s
doc('U02.L03-title-boy',muscle_cover(False))
doc('U02.L03-title-girl',muscle_cover(True))
# Sleeping hero, three detached teaching windows; organs are not moved into wrong body regions.
s=rect(48,52,928,484,'#E9F0F8')
# Separate muscle, stomach-wall and heart callouts.
s+=circ(206,292,126,'#FFF1DE','#CFAE7C',5)+group(muscles(True),172,223,.37)
s+=circ(511,292,126,'#FFF1DE','#CFAE7C',5)
s+=path('M490 200 C480 249 534 249 531 292 C531 332 485 339 461 315 Q441 312 430 328 C487 392 587 361 586 286 C586 221 543 220 526 245 L521 200Z','#EBC1AE','#C8827B',12)
s+=path('M494 220 Q501 252 530 263 C582 319 513 359 466 329','none','#E9959E',12)
s+=circ(816,292,126,'#FFF1DE','#CFAE7C',5)+group(heart(),816,275,.83)
s+=rect(73,588,878,788,'#D5E1EC')+rect(92,716,325,216,'#FFF9EA',40)
s+=group(child(),293,904,.39)
s+=path('M381 922 Q570 815 915 956 L915 1325 L232 1325 Q261 1095 381 922Z','#8CABCA','#587C9B',6)
s+=path('M381 967 Q558 913 858 1037','none','#BDD1E4',8)+mascot(811,1304,.53)
s+=path('M111 630 Q99 676 145 688 Q89 720 72 672 Q62 640 111 630Z','#FFDD84','#D7B565',3)
doc('U02.L03-E3',s)
# Loading/bone density comparison. Same bone outer size; changed internal trabecular network only.
s=rect(48,55,448,1356,'#EAF3E8')+rect(528,55,448,1356,'#E5EDF7')
s+=group(child(),262,249,.45)+path('M121 482 Q64 774 267 838 Q447 803 404 473','none','#CF9E52',7)
s+=circ(141,149,45,'#FFCD55','#D8A745',4)
# Simple food still life.
s+=rect(101,864,343,23,'#C59760',4)+path('M142 887 L142 1007 M402 887 L402 1007','none','#A87A4C',12)
s+=rect(126,787,54,77,'#FFF9E7',8)+ell(285,845,74,21,'#FFF9E7')
s+=path('M233 834 Q225 786 261 793 Q292 785 284 831 M268 833 Q268 780 304 799 L309 837Z','#68A66D','#467B51',3)
s+=ell(337,839,27,12,'#D3B685')+path('M358 839 L378 827 L378 851Z','#D3B685')+ell(301,855,12,6,'#A96E48',INK,2)
# Astronaut floats, angled limbs visibly clear of cabin floor.
s+=rect(562,104,380,470,'#C4D7E5',24)+circ(760,223,78,'#F9F6E9')+ell(760,220,60,57,'#C4DFE7')+ell(760,222,43,43,SKIN)
s+=path('M692 308 Q757 281 821 308 L827 501 L685 501Z','#FFF9EC')
s+=path('M700 335 L618 400 M815 335 L884 310 M716 496 L663 592 L602 612 M790 496 L858 554 L894 539','none','#EEECE2',37)
s+=path('M580 728 L927 728','none','#A9BDC9',6)
for x,dense in [(271,True),(751,False)]:
 s+=circ(x,1140,156,'#FFF1DB','#C8A776',5)
 s+=path(f'M{x-48} 1014 L{x+48} 1014 L{x+55} 1270 L{x-55} 1270Z',BONE)
 s+=path(f'M{x-27} 1033 L{x+27} 1033 L{x+32} 1248 L{x-32} 1248Z','#DFA08B','#B87B67',3)
 for yy in range(1040,1248,26 if dense else 58):
  s+=path(f'M{x-25} {yy} L{x+25} {yy+24} M{x+25} {yy} L{x-25} {yy+24}','none','#F6DDB2',7 if dense else 4)
s+=mascot(512,1362,.48)
doc('U02.L01-E6',s)
print('Created 11 final source diagrams')
