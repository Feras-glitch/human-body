from build_diagrams import *

PURPLE='#9291B5'
def tube(d,color=RED,w=24,inner=True):
 q=path(d,stroke=color,w=w)
 if inner:q+=path(d,stroke='#FFC8B5' if color==RED else '#D6AFBA',w=w*.36)
 return q
def mesh(x,y,w=160,h=80,c1=RED,c2=DARK):
 q=''
 for k in range(5):
  yy=y+k*h/4
  q+=path(f'M{x} {y+h/2}Q{x+w*.3} {yy} {x+w*.5} {yy}',stroke=c1,w=4)+path(f'M{x+w*.5} {yy}Q{x+w*.8} {yy} {x+w} {y+h/2}',stroke=c2,w=4)
 return q
def four_heart(x=512,y=750,s=1,coded=False,flow=True):
 low=PURPLE if coded else '#A45769'
 q=path('M-29 -160V-273M28 -160V-273',stroke='#B95B64',w=41)
 q+=path('M-148 -160C-209 -105 -190 15 -165 84C-117 157 -37 200 41 231C136 183 194 93 185 -5C187 -118 127 -177 67 -173C25 -176 13 -149 0 -138C-30 -165 -94 -189 -148 -160Z','#D67872',DARK,5)
 # Four hollow cavities; uninterrupted central septum remains red.
 q+=rect(-145,-142,103,103,low,'#9F5D6A',3,34)+rect(49,-142,87,103,'#F7BCAC','#B97578',3,30)
 q+=path('M-142 -15H-43L-27 140C-80 120 -137 77 -147 29Z',low,'#9F5D6A',3)
 q+=path('M43 -15H118Q151 47 110 111L52 163L31 85Z','#F7BCAC','#B97578',3)
 # Atrio-ventricular passages and one-way leaflets.
 q+=rect(-120,-54,59,67,low,rx=0)+rect(64,-54,48,67,'#F7BCAC',rx=0)
 q+=path('M-139 -40L-107 -9M-43 -40L-77 -9',stroke='#FFF5D9',w=7)+path('M49 -40L74 -8M131 -40L102 -8',stroke='#FFF5D9',w=7)
 # Separate outflow tracts rise on either side of the solid septum.
 q+=tube('M-73 78Q-27 39 -27 -9V-273',PURPLE if coded else DARK,26)
 q+=tube('M84 90Q27 41 27 -9V-273',RED,26)
 q+=tube('M-232 -102H-146',PURPLE if coded else DARK,27)+tube('M232 -102H136',RED,27)
 q+=path('M-40 -196Q-27 -177 -14 -196M14 -196Q27 -177 40 -196',stroke='#FFF7D8',w=6)
 if flow:
  q+=arrow(-94,-111,-94,63,'#FFF6DA',5)+arrow(88,-111,88,64,'#FFF6DA',5)
  q+=arrow(-27,-16,-27,-161,'#FFF6DA',5)+arrow(27,-16,27,-161,'#FFF6DA',5)
 return group(q,x,y,s)

def body_base(x=512,y=20,s=1,ribs=False):
 q=path('M-48 264V328L-128 350Q-168 365 -184 426L-254 714Q-260 750 -235 753Q-213 757 -206 729L-131 512L-126 727L-91 1193Q-83 1240 -50 1229L-22 779H22L50 1229Q83 1240 91 1193L126 727L131 512L206 729Q213 757 235 753Q260 750 254 714L184 426Q168 365 128 350L48 328V264Z','#DDA578','#966D56',4)
 q+=path('M-128 352L-179 439L-126 477V721Q0 746 126 721V477L179 439L128 352L48 328Q0 368 -48 328Z','#C2DFEA','#83B3C7',4)
 q+=path('M-126 722L-91 1193Q-83 1240 -50 1229L-22 779H22L50 1229Q83 1240 91 1193L126 722Z','#7992AE','#526B8C',4)
 q+=ellipse(-84,1246,55,22,'#536D83',C)+ellipse(84,1246,55,22,'#536D83',C)
 q+=circ(0,174,98,'#DDA578','#966D56',4)+ellipse(-97,185,17,27,'#DDA578')+ellipse(97,185,17,27,'#DDA578')
 for xx,yy,r in [(-82,110,32),(-50,81,34),(-12,76,35),(28,76,35),(65,94,34),(86,120,29),(-38,113,33),(20,108,33)]:q+=circ(xx,yy,r,'#44312C','#352824',2)
 q+=face(0,188,2)
 if ribs:
  for yy in range(415,586,35):q+=path(f'M-8 {yy}Q-67 {yy-13} -112 {yy+5}Q-126 {yy+40} -17 {yy+54}M8 {yy}Q67 {yy-13} 112 {yy+5}Q126 {yy+40} 17 {yy+54}',stroke='#F5E2BD',w=8)
 return group(q,x,y,s)
def body_organs(x=512,y=20,s=1,showlungs=True):
 q=''
 if showlungs:q+=lungs(0,494,.54)
 q+=heart(21,495,.32)
 return group(q,x,y,s)
def body_vessels(only=False,cargo=False,x=512,y=20,s=1):
 q=tube('M25 458Q56 405 78 433Q94 455 25 486V702L72 1115',RED,17)
 for d in ['M25 490V390Q5 360 5 291V238','M25 405Q-98 368 -133 465L-225 708','M25 405Q98 368 133 465L225 708','M25 702L-72 1115']:q+=tube(d,RED,15)
 for a in [(6,354,6,288),(-153,523,-192,629),(153,523,192,629),(-50,887,-64,1040),(50,887,64,1040)]:q+=arrow(*a,RED,5)
 if not only:
  for d in ['M-18 493V699L-90 1115','M-18 699L90 1115','M-18 493V356L-18 238','M-18 493Q-113 402 -149 477L-242 710','M-18 493Q113 402 149 477L242 710']:q+=tube(d,DARK,9)
  for xx,yy,rot in [(-81,1115,0),(81,1115,0),(-235,710,0),(235,710,0),(-6,238,0)]:q+=path(f'M{xx-10} {yy}Q{xx} {yy+27} {xx+10} {yy}',stroke='#B76877',w=4)
  for a in [(-84,1039,-57,885),(84,1039,57,885),(-213,630,-173,523),(213,630,173,523)]:q+=arrow(*a,DARK,4)
 if cargo:
  for xx,yy in [(-167,578),(165,585),(-48,895),(53,908)]:q+=oxygen(xx,yy,6)+ellipse(xx+9,yy+17,4,7,'#EEC75F')
  for xx,yy in [(-182,600),(183,608),(-67,932),(70,949)]:q+=waste(xx,yy,6)
 return group(q,x,y,s)
def circulation_scene(only=False,cargo=False):
 return panel(55,1420)+body_base(s=.97)+body_vessels(only,cargo,s=.97)+body_organs(s=.97,showlungs=False)+mascot(845,1330,.6)
def chest_size(lungfocus=False):
 q=panel(55,1420)+body_base(s=.97,ribs=True)+body_organs(s=.97)
 q+=rect(506,415,13,154,'#F7E9CF',rx=5,extra='opacity=".65"')
 if not lungfocus:
  q+=path('M716 499L729 484Q735 472 749 480L759 477Q774 477 778 490L786 503V531Q767 550 737 544L717 530Z','#DDA578','#95694F',4)
  q+=path('M724 499H772M735 485V503M749 484V503M762 486V503',stroke='#AB795B',w=2)
  q+=path('M570 503H691',stroke='#C7AF88',w=3,extra='stroke-dasharray="7 9"')
 q+=mascot(832,760,.7)
 return q
def squeeze_cycle():
 q=panel(55,650)+panel(775,650)
 for y,s in [(440,.8),(1160,1)]:
  q+=four_heart(340,y,s,False,False)
  q+=ellipse(743,y-40,65 if y==440 else 93,45 if y==440 else 79,'#E56F66','#AB555B',4)
  for a in range(12):q+=circ(700+(a*29)%90,y-65+(a*19)%55,3,'#BA534D')
  q+=path(f'M636 {y+130}L667 {y+18}Q673 {y-13} 694 {y-2}L730 {y+21}L778 {y+16}Q810 {y+20} 793 {y+43}L747 {y+76}L706 {y+143}','#DDA578','#966A50',4)
 if True:
  for xx in [318,362]:q+=arrow(xx,212,xx,144,RED,7)
  q+=arrow(158,1088,226,1088,DARK,7)+arrow(581,1088,512,1088,RED,7)
  q+=path('M721 361Q710 297 683 301M776 361Q818 307 832 338',stroke=SKY,w=7)
 q+=path('M96 663Q5 765 96 872',stroke=TEAL,w=5)+arrow(76,855,96,872,TEAL,5)
 return q
def wrist_pulse():
 q=panel(65,1400)+rect(80,587,864,81,'#C6A581',C,4,12)
 # Left forearm palm-up; thumb side is the lower edge in this horizontal view.
 hand=path('M-270 -65H-75Q-32 -92 16 -71L108 -62Q129 -59 126 -44Q125 -31 109 -31L32 -32L130 -24Q150 -22 148 -8Q147 5 130 5L33 2L123 17Q140 22 135 36Q133 47 116 44L24 23L91 49Q103 56 97 68Q91 79 76 73L-12 39L25 96Q31 110 17 115Q4 121 -9 106L-65 59H-270Z','#DDA578','#966A50',4)
 q+=group(hand,502,514,1.25)
 # Two extended fingertips touch the radial wrist; remaining fingers stay curled.
 q+=path('M270 198L310 307L407 432Q423 454 408 467Q390 477 377 457L300 365L383 482Q396 504 377 512Q362 516 350 497L262 387Q224 378 214 341L180 245Z','#DDA578','#966A50',4)
 q+=path('M251 345Q279 345 291 367M278 322Q302 323 317 346',stroke='#B27E5E',w=3)
 q+=circ(624,1064,222,'#FFFBED','#CFB382',6)
 q+=path('M470 1066H535Q551 1027 569 1066H774',stroke=RED,w=30)+path('M470 1066H535Q551 1027 569 1066H774',stroke='#F8B0A0',w=10)+arrow(573,1149,737,1149,TEAL,6)
 q+=path('M408 517L514 862',stroke=TEAL,w=3,extra='stroke-dasharray="9 11"')+mascot(191,1181,.75)
 return q
def brain_icon(x,y,s=1):
 q=path('M-58 17C-92 -5 -75 -57 -40 -54C-22 -86 22 -76 33 -57C80 -59 97 -8 64 15C35 40 -21 43 -58 17Z','#F3BAA2','#CE8E87',4)
 for d in ['M-40 -49Q-11 -29 -35 -7Q-13 1 -21 29','M1 -62Q24 -36 5 -21Q28 -4 6 29','M39 -47Q21 -33 48 -14Q24 4 53 18']:q+=path(d,stroke='#D7968B',w=4)
 q+=path('M-6 28L-10 64',stroke='#E3A68F',w=14)
 return group(q,x,y,s)
def heart_symbol_comparison():
 q=panel(55,540)+panel(660,805)+rect(112,160,277,259,'#4E6768','#B99972',7,10)
 q+=path('M250 245C191 184 132 263 250 351C368 263 309 184 250 245Z','#E57A70','none')+heart(700,300,1.05)+mascot(489,463,.45)
 q+=body_base(472,664,.56)+body_organs(472,664,.56,False)+brain_icon(472,754,.6)
 q+=arrow(500,790,500,902,'#E6B551',11)+arrow(453,902,453,791,TEAL,4)
 q+=path('M764 845L779 819L800 840L831 819M763 845L732 850M764 845L753 875M812 864L831 882',stroke='#D1A972',w=5)
 return q

def dual_circuit(coded=True,systemic=True,stations=False,glow=False):
 low=PURPLE if coded else DARK
 q=panel(55,1425)
 q+=path('M400 190Q512 105 624 190L690 390L679 990L621 1425H550L512 1065L474 1425H403L345 990L334 390Z','#F2EEE5','#E1D8C5',3)
 q+=lungs(512,330,.7)
 # Pulmonary trunk to both lungs; return joins only the LEFT atrium.
 q+=tube('M492 533V435Q492 411 442 400L352 365',low,25)+tube('M492 435L650 365',low,25)
 q+=mesh(312,285,91,105,low,RED)+mesh(610,285,91,105,low,RED)
 q+=tube('M403 337Q435 444 626 471Q681 490 681 560L584 663',RED,22)+tube('M701 337Q725 411 681 471V560',RED,22)
 q+=arrow(492,518,492,457,low,6)+arrow(681,488,681,551,RED,6)
 if systemic:
  q+=rect(382,1196,265,159,'#E9B49B','#C08B7D',3,30)
  q+=tube('M532 533Q830 472 830 751V1210L647 1270',RED,34)
  q+=mesh(382,1230,265,80,RED,low)
  q+=tube('M382 1270Q196 1324 196 1149V828Q200 720 440 663',low,22)
  q+=arrow(830,901,830,1067,RED,7)+arrow(196,1082,196,917,low,7)
  q+=arrow(426,1326,588,1326,TEAL,5)
 q+=four_heart(512,745,.8,coded)
 if glow:
  q+=ellipse(656,329,88,98,'none','#E6BF59',9)+ellipse(512,1271,159,93,'none','#E6BF59',9)
 if stations:
  for xx,yy,dr in [(656,327,False),(588,659,False),(829,990,False),(512,1271,True),(197,1022,True),(439,659,True),(492,476,True)]:
   q+=rbc(xx,yy,.95,dr)+face(xx,yy,.31)
  for xx,yy in [(646,301),(578,633),(818,964)]:q+=oxygen(xx,yy,7)
 if not stations:q+=mascot(840,1374,.45)
 return q
def sync_ventricles():
 q=dual_circuit(True,False)
 q+=tube('M534 532Q883 426 927 768V1147',RED,38)+arrow(926,893,926,1030,RED,8)
 for x in [363,659]:q+=path(f'M{x} 783l-20 35l20 33M{x+15} 777l-20 35l20 33',stroke='#D7AB66',w=5)
 q+=ellipse(842,1295,66,39,'#F1DBB7','#C5A77D',3)+circ(819,1290,14,RED)+circ(862,1301,14,PURPLE)
 return q
def artery_wall():
 q=panel(50,405)+panel(500,440)+panel(985,480)
 for x,r in [(307,107),(718,121)]:q+=circ(x,253,r,'#CD8C8B',DARK,4)+circ(x,253,r*.78,'#ECC0AF','#BA8581',3)+circ(x,253,r*.49,'#FBE8CE','#D5AD9A',3)
 q+=arrow(459,253,545,253,TEAL,6)
 # Longitudinal leg vein with upward-opening valve cusps and muscle pump.
 q+=rect(414,575,194,291,'#E5AFAD',DARK,3,30)+rect(432,575,158,291,'#F8DACA',DARK,2,25)
 for y in [652,796]:q+=path(f'M433 {y}Q461 {y+25} 489 {y-30}M589 {y}Q561 {y+25} 533 {y-30}',stroke='#F2E6C1',w=9)
 q+=arrow(512,824,512,609,DARK,7)+arrow(284,725,398,725,'#D18D72',9)+arrow(738,725,624,725,'#D18D72',9)
 q+=path('M223 573Q360 690 223 872M801 573Q664 690 801 872',stroke='#E6AF94',w=40)
 q+=heart(510,1262,.75)+tube('M497 1178L409 1059',RED,31)+tube('M532 1175L630 1059',PURPLE,31)
 q+=arrow(478,1141,443,1091,RED,6)+arrow(559,1141,597,1091,PURPLE,6)+mascot(839,1364,.4)
 return q
def vein_light():
 q=panel(60,610)+panel(730,730)+arm_hand(458,316,1.55,90,True)
 q+=rect(118,981,788,305,'#E6B48F','#C18D70',3,20)+rect(118,981,788,51,'#CA8E6B',rx=4)+rect(118,1032,788,64,'#E7BA99',rx=0)
 q+=ellipse(553,1181,233,61,DARK,'#B37580',5)
 for xx in [424,541,663]:q+=rbc(xx,1181,.7,True)
 q+=circ(263,850,44,'#F9D26C','#CCA14D',3)
 # Schematic diffuse shallow blue backscatter, deeper red absorption.
 q+=path('M271 893L338 1007L369 1037L331 995L397 887',stroke='#7BB8D5',w=7)+arrow(352,967,397,887,'#7BB8D5',6)
 q+=path('M296 889L507 1132',stroke=RED,w=7)+path('M507 1132L541 1170',stroke=RED,w=6,extra='opacity=".45"')+path('M541 1170L560 1180',stroke=RED,w=5,extra='opacity=".15"')
 q+=mascot(831,1380,.45)
 return q
def rbc_journey():
 q=dual_circuit(False,True,True,True)
 # Time marks indicate recurrence only; no claim of a fixed one-minute journey.
 for k in range(24):
  a=k*math.pi/12;x=512+456*math.cos(a);y=770+670*math.sin(a)
  q+=path(f'M{x} {y}L{512+444*math.cos(a)} {770+653*math.sin(a)}',stroke='#D7C3A6',w=3)
 return q
def audit_cards():
 q=rect(48,160,928,808,'#E6CE9F','#AD8D63',8,30)
 for x in [80,389,698]:q+=rect(x,204,257,689,'#FFFDF1','#C2A46E',3,12)+circ(x+127,218,10,TEAL)
 q+=group(body_base()+body_organs(showlungs=False),82,282,.24)
 q+=group(closed_loop(),393,324,.245)+group(marrow(),703,324,.245)
 q+=body_base(255,1001,.35)+mascot(807,1259,.85)
 q+=path('M274 1110Q322 1080 290 1059',stroke='#DDA578',w=13)
 return q
def fish_human():
 q=panel(55,620)+panel(745,720)
 q+=ellipse(480,318,313,142,'#E4F0E4','#81ABA4',4)+path('M769 303L889 216V426L769 334Z','#B5DAD3','#81ABA4',4)+circ(236,299,13,C)
 q+=path('M297 243Q257 316 297 385M319 240Q279 316 319 387',stroke='#D39790',w=6)
 # Fish: one atrium and one ventricle in series, then gills, body, return.
 q+=rect(377,412,63,60,'#BB8292',DARK,3,25)+rect(443,405,95,72,'#D97F7B',DARK,3,27)
 q+=tube('M490 405Q474 345 304 316',DARK,16)+tube('M304 268Q448 166 689 280',RED,16)+tube('M721 330Q733 530 406 473',DARK,13)
 q+=mesh(281,268,36,96,DARK,RED)+mesh(678,280,52,96,RED,DARK)
 q+=arrow(430,363,352,338,DARK,5)+arrow(458,203,585,231,RED,5)+arrow(620,488,488,489,DARK,5)
 q+=oxygen(265,247,8)+oxygen(282,224,8)
 q+=lungs(504,931,.47)+four_heart(508,1177,.52,True)
 q+=tube('M494 1034Q425 968 400 933',PURPLE,16)+tube('M582 938Q662 987 555 1125',RED,14)
 q+=tube('M522 1035Q801 985 795 1282Q793 1367 635 1374',RED,20)+mesh(390,1345,245,58,RED,PURPLE)+tube('M390 1374Q224 1376 259 1233Q283 1151 387 1124',PURPLE,14)
 q+=mascot(842,702,.44)
 return q

def muscles_at_leg(x=512,y=20,s=1):
 q=ellipse(76,992,36,106,'#F3B16E','#D49468',3)
 for dx in [-17,0,17]:q+=path(f'M{76+dx} 903Q{64+dx} 991 {76+dx} 1084',stroke='#DB8D59',w=3)
 return group(q,x,y,s)
def integrated_body(cargo=True,control=False,steps=False,mode='exercise'):
 q=panel(55,1420)
 if steps:
  for k in range(4):q+=rect(717+k*39,1438-k*91,190-k*39,90,'#D4C5AD','#B6A58E',3,2)
 else:q+=ellipse(508,1390,360,47,'#DBE5C3')
 q+=body_base(s=.95)+muscles_at_leg(s=.95)+body_vessels(False,cargo,s=.95)+body_organs(s=.95)
 # The pulmonary link terminates at the heart, never at a leg or muscle.
 q+=path('M522 435Q477 429 451 472M581 474Q574 468 554 478',stroke=DARK,w=7)
 for a in [(542,503,554,490),(587,901,606,910),(608,1051,582,1066)]:q+=arrow(*a,TEAL,4)
 for x,y in [(596,922),(600,1025)]:q+=oxygen(x,y,7)+waste(x-29,y+10,6)
 if mode=='exercise':
  q+=ellipse(583,838,32,79,'#F3B16E','#D49468',2,extra='opacity=".7"')
  q+=path('M621 840l23 -18M623 872l30 -2M620 900l24 18M632 977l27 -5M628 1011l28 14',stroke='#D7AC5A',w=4)
 elif mode=='windows':
  q+=rect(382,373,255,229,'none','#D9AD5F',4,52)+circ(584,873,70,'#FFF4D8','#D9AD5F',4)
  q+=ellipse(584,873,35,55,'#EEB18B','#CA8E76',3)+path('M552 843Q584 835 613 843M552 866Q584 858 613 866M552 889Q584 881 613 889',stroke='#CD8F75',w=3)
  q+=path('M537 825V913M628 913V825',stroke=RED,w=8)
  q+=arrow(537,844,559,851,TEAL,4)+oxygen(564,856,5)+waste(608,894,5)+arrow(612,894,628,889,'#8E9299',4)
 elif mode=='oxygen':
  for xx,yy in [(555,453),(551,478),(543,496),(544,546),(536,595),(536,654),(550,741),(566,812),(578,874)]:q+=oxygen(xx,yy,5)
  for xx,yy in [(567,965),(556,876),(535,793),(495,699),(495,604),(495,530),(493,488)]:q+=waste(xx,yy,5)
 if control:
  q+=brain_icon(512,174,.75)+circ(504,220,9,'#F5CB63')
  q+=path('M504 220Q324 339 407 480M504 220Q693 330 555 496',stroke='#D5AA42',w=5)
  q+=arrow(404,457,407,480,'#D5AA42',5)+arrow(564,483,555,498,'#D5AA42',5)
 q+=mascot(843,1296,.55)
 return q

def profile_head(x,y,s=1,brain=False):
 q=path('M80 130C-63 128 -126 37 -106 -68C-90 -171 79 -209 163 -112C194 -74 182 -13 169 28L190 57L155 64L163 87L142 103L139 158L75 180Z','#E4B38E','#9E725A',4)
 q+=path('M-102 -55Q-114 -163 6 -184Q130 -190 165 -109L108 -102Q83 -139 46 -111Q-11 -141 -49 -100Z','#48322B','#352722',3)
 for xx,yy,r in [(-81,-101,25),(-55,-136,27),(-17,-154,28),(21,-157,29),(58,-148,29),(92,-132,28),(130,-108,25)]:q+=circ(xx,yy,r,'#48322B','#352722',2)
 q+=ellipse(139,1,7,12,C)+path('M149 80L162 85',stroke=C,w=4)+ellipse(3,29,22,27,'#DCA482','#9E725A',3)
 if brain:q+=brain_icon(11,-74,.8)
 return group(q,x,y,s)
def airway_profile(cough=False):
 q=panel(60,1410)
 q+=profile_head(366,339,1.05,cough)
 q+=lungs(512,1073,1.14)
 # Anatomical airway is continuous: nostril -> pharynx -> larynx -> trachea.
 d='M560 400Q527 392 486 397Q451 401 453 457L473 520L512 622V850'
 q+=path(d,stroke='#D3948A',w=40)+path(d,stroke='#F6D4BB',w=25)
 for yy in range(650,846,39):q+=path(f'M497 {yy}Q510 {yy+12} 526 {yy}',stroke='#EEE0B6',w=10)
 q+=ellipse(490,568,11,29,'#D38A82','#AF7774',3,extra='transform="rotate(-27 490 568)"')
 for xx in [544,551,558]:q+=path(f'M{xx} 404L{xx-5} 394',stroke='#8C765D',w=2)
 q+=cluster(403,1141,.30)+cluster(619,1138,.30)
 if not cough:
  q+=path(d,stroke='#88C4D8',w=10)+arrow(612,399,558,400,'#72ADC7',7)+arrow(512,715,512,814,'#72ADC7',7)+arrow(512,1011,440,1060,'#72ADC7',6)+arrow(512,1011,584,1060,'#72ADC7',6)
  q+=circ(789,689,104,'#FFFBEB','#DCC4A4',3)+path('M824 630A75 75 0 1 0 824 753',stroke='#C2C1A8',w=23)+path('M824 630L824 753',stroke='#DAA7A0',w=8)
 else:
  q+=circ(493,612,10,'#E5B645')
  q+=circ(369,315,8,'#F4CA5E')
  q+=path('M493 612Q269 492 369 315',stroke='#D8AD43',w=5)+arrow(353,342,369,315,'#D8AD43',5)
  q+=rect(282,1009,39,168,'#E9AE8A','#CC8C71',3,17)+rect(752,1245,39,137,'#E9AE8A','#CC8C71',3,17)
  for yy in range(1027,1168,24):q+=path(f'M288 {yy}L315 {yy+9}',stroke='#C98B70',w=3)
  for yy in range(1260,1375,24):q+=path(f'M758 {yy}L785 {yy+9}',stroke='#C98B70',w=3)
  q+=path('M369 315Q171 728 302 1090M369 315Q887 640 773 1320',stroke='#D8AD43',w=5)
  q+=arrow(296,1062,302,1090,'#D8AD43',5)+arrow(777,1289,773,1320,'#D8AD43',5)
  for x,y in [(492,647),(506,725),(527,812),(480,510)]:q+=ellipse(x,y,7,5,'#AA8F6C')
  for y in [385,414,442]:q+=arrow(558,y,684,y-6,'#79B6CC',6)
  q+=path('M319 1348Q508 1202 708 1348',stroke=RED,w=23)
 q+=mascot(820,1351,.6)
 return q
def breath_torso(x,y,s=1,inhale=False):
 q=path('M-48 -296V-238L-153 -197Q-212 -81 -155 193L-128 335Q0 376 128 335L155 193Q212 -81 153 -197L48 -238V-296Z','#E7BE9A','#B4866A',4)
 q+=lungs(0,0,.83 if inhale else .64)
 if inhale:q+=path('M-153 160Q0 130 153 160L153 179Q0 149 -153 179Z',RED,DARK,3)
 else:q+=path('M-147 176Q0 20 147 176L147 195Q0 42 -147 195Z',RED,DARK,3)
 for yy in [-146,-89,-32,25]:q+=path(f'M-6 {yy}Q-105 {yy-40} -167 {yy+7}M6 {yy}Q105 {yy-40} 167 {yy+7}',stroke='#F8E5C6',w=7)
 q+=profile_head(-55,-360,.62)
 if inhale:
  q+=arrow(130,-340,66,-340,'#79BAD0',8)+arrow(-144,-96,-196,-140,TEAL,6)+arrow(144,-96,196,-140,TEAL,6)+arrow(0,200,0,239,TEAL,7)
  q+=path('M136 221Q205 258 136 334',stroke='#C68D6F',w=4)+arrow(171,280,211,280,TEAL,5)
 else:q+=arrow(65,-340,128,-340,'#79BAD0',7)
 return group(q,x,y,s)
def breathing_pair():
 q=panel(60,695)+panel(804,660)
 q+=breath_torso(490,467,.75,True)+breath_torso(490,1203,.75,False)+mascot(825,767,.44)
 return q
def quiet_expiration():return panel(55,1420)+breath_torso(490,826,1.30,False)+mascot(840,1356,.5)

BUILDERS2={
'U03.L01-E1':lambda:chest_size(False),'U03.L01-E2':squeeze_cycle,'U03.L01-E3':lambda:circulation_scene(False,True),'U03.L01-E4':wrist_pulse,'U03.L01-E5':heart_symbol_comparison,'U03.L01-E6':lambda:panel(55,1420)+four_heart(512,845,1.65)+mascot(835,1375,.45),'U03.L01-E7':sync_ventricles,'U03.L01-E8':lambda:integrated_body(True),
'U03.L02-E1':lambda:circulation_scene(True),'U03.L02-E4':vein_light,'U03.L02-E5':lambda:dual_circuit(True,False),'U03.L02-E6':lambda:dual_circuit(True,True),'U03.L02-E7':artery_wall,'U03.L03-E7':rbc_journey,
'U03.L04-E1':audit_cards,'U03.L04-E2':lambda:dual_circuit(False,True,True,True),'U03.L04-E3':fish_human,
'U04.L01-E1':lambda:chest_size(True),'U04.L01-E2':lambda:airway_profile(False),'U04.L01-E3':breathing_pair,'U04.L01-E4':quiet_expiration,'U04.L01-E5':lambda:integrated_body(True,mode='windows'),'U04.L02-E3':lambda:integrated_body(True,mode='oxygen'),'U04.L03-E2':lambda:airway_profile(True),'U04.L03-E5':lambda:integrated_body(True,True,True)}

if __name__=='__main__':
 output=[];buf=io.BytesIO()
 with zipfile.ZipFile(buf,'w',zipfile.ZIP_DEFLATED) as z:
  for name,fn in BUILDERS2.items():
   filename,data,svg=save(name,fn());output.append(filename)
   with Image.open(io.BytesIO(data)) as check:check.load();assert check.size==(1024,1536)
   z.writestr(filename,data);z.writestr('sources/'+name+'.svg',svg)
  z.write(__file__,'sources/build_remaining.py');z.write(SRC/'build_diagrams.py','sources/build_diagrams.py')
 temp=ROOT/'remaining-assets.zip.tmp';temp.write_bytes(buf.getvalue());temp.replace(ROOT/'remaining-assets.zip')
 with zipfile.ZipFile(ROOT/'remaining-assets.zip') as z:
  assert z.testzip() is None
  for n in output:
   with Image.open(io.BytesIO(z.read(n))) as im:im.load();assert im.size==(1024,1536)
 (ROOT/'remaining-diagrams.json').write_text(json.dumps(output,indent=2))
 print('Exported and verified',len(output),'remaining SVG and WebP scenes')
