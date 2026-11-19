from build_diagrams import *
import random
random.seed(606)
ROOT=Path(__file__).resolve().parent.parent
SRC=ROOT/'sources'
PINK='#F3A7A6'; GOLD='#F3BD49'; GREEN='#7DAF69'; MILK='#FFF9DB'
def tube(d,col=PINK,w=36):return path(d,stroke='#A96570',w=w+8)+path(d,stroke=col,w=w)
def dots(x,y,n=30,w=240,h=140,colors=None,r=5):
 colors=colors or ['#55AFA3','#E5A64A','#A18EBF','#EB8D87','#74B8D0']
 rng=random.Random(int(x+y+n));return ''.join(circ(x+rng.random()*w,y+rng.random()*h,r,colors[i%len(colors)]) for i in range(n))
def droplet(x,y,s=1,col='#ECF6F3'):
 return group(path('M0 -25C-12 -6 -24 5 -16 18Q0 38 16 18C24 5 12 -6 0 -25Z',col,'#81B0AC',2),x,y,s)
def sugar(x,y,r=8):return circ(x,y,r,GOLD,'#B3842D',1)
def chain(x,y,n=6):return ''.join(sugar(x+i*17,y+math.sin(i)*9,7) for i in range(n))
def cell(x,y,s=1):return group(ellipse(0,0,85,60,'#EBD8E5','#AB839F',4)+ellipse(-22,-5,21,15,'#AE89BA'),x,y,s)
def stomach(x=0,y=0,s=1):
 q=tube('M-22 -195V-74',PINK,36)
 q+=path('M-43 -86C-40 -24 -118 5 -93 68C-67 136 67 152 111 74C151 9 109 -77 65 -88C28 -98 9 -49 -10 -42L-8 -86Z','url(#sac)','#A96570',5)
 q+=path('M-78 55Q-2 98 68 46M-49 78Q14 106 78 69M4 -24Q41 -8 73 -27',stroke='#D98C99',w=5)
 q+=tube('M-78 95Q-134 74 -139 124Q-143 179 -88 184',PINK,25)
 return group(q,x,y,s)
def liver(x=0,y=0,s=1):
 return group(path('M-180 -65Q-90 -125 91 -80Q183 -56 150 -15Q95 6 53 32Q5 15 -55 49Q-125 101 -167 70Q-204 29 -180 -65Z','#A84A45','#713C41',5)+path('M49 -80Q31 -31 53 30',stroke='#D8876A',w=4),x,y,s)
def pancreas(x=0,y=0,s=1):
 q=path('M-115 20Q-158 -40 -98 -51L109 -29Q154 -15 107 3L-70 51Q-108 60 -115 20Z','#EACB8B','#B89460',4)
 for i in range(9):q+=ellipse(-105+i*26,-3+math.sin(i)*12,17,23,'#F3D99A','#CFAD70',2)
 q+=path('M-110 7Q-20 -15 106 -11',stroke='#AD934C',w=5)
 return group(q,x,y,s)
def gall(x=0,y=0,s=1):return group(path('M-6 -35Q5 -69 18 -45L12 -20C60 19 9 72 -21 36Q-43 7 -6 -35Z','#91BC61','#597B43',4),x,y,s)
def gut(x=0,y=0,s=1,micro=False):
 # Continuous inner tube joins terminal ileum to the cecal region on viewer left.
 q=tube('M-35 -185Q-102 -180 -94 -148C-84 -112 119 -163 119 -112C119 -61 -126 -115 -126 -60C-126 -11 129 -60 129 -5C129 40 -125 0 -119 51C-111 99 126 50 116 102C108 148 -99 100 -98 143Q-89 173 -152 175', '#F1B1A1',23)
 q+=tube('M-152 175V-169Q-156 -218 -106 -215H115Q165 -214 163 -165V140Q162 189 78 193Q11 191 17 243V273','#E89896',49)
 for yy in range(-160,161,40):q+=path(f'M-175 {yy}Q-150 {yy+15} -130 {yy}',stroke='#C17C86',w=3)+path(f'M141 {yy}Q164 {yy+15} 185 {yy}',stroke='#C17C86',w=3)
 for x1 in range(-100,141,40):q+=path(f'M{x1} -238Q{x1+15} -215 {x1} -191',stroke='#C17C86',w=3)
 if micro:
  q+=dots(-171,-160,36,29,320,r=4)+dots(-110,-229,35,236,28,r=4)+dots(146,-164,36,28,320,r=4)
 return group(q,x,y,s)
def torso():
 q=path('M416 150H608L615 220Q728 244 772 334L723 1005Q512 1094 301 1005L252 334Q296 244 409 220Z','#F5DEBC','#B68B72',5)
 q+=path('M420 276Q340 350 319 466M604 276Q684 350 705 466',stroke='#E1BE9A',w=15)
 # lower ribs finish above upper abdominal organs
 for k in range(4):q+=path(f'M493 {285+k*37}Q405 {300+k*37} 345 {349+k*37}M531 {285+k*37}Q619 {300+k*37} 679 {349+k*37}',stroke='#FFF5DC',w=13)
 q+=path('M331 500Q512 428 694 500',stroke='#BC9488',w=5)
 return q

def tooth(x,y,s=1,kind='molar',cross=False):
 if kind=='incisor':d='M-37 -45Q0 -61 37 -45L29 18Q15 31 8 80Q0 102 -8 80L-29 18Z'
 elif kind=='canine':d='M-35 -15L0 -65L35 -15L20 35Q0 110 -13 61Z'
 else:d='M-54 -37Q-34 -67 -8 -43Q8 -35 26 -50Q59 -59 59 -24L41 73Q27 112 13 53Q-2 27 -17 64Q-37 109 -44 66Z'
 q=path(d,'#FFFCED','#AC8B75',4)
 if cross:
  q+=path('M-40 -25Q-22 -44 -4 -28Q12 -18 37 -33L27 41Q17 9 3 14Q-15 2 -27 40Z','#F0D698','#D6BA7B',2)
  q+=path('M-17 -10Q0 -22 17 -6L17 23Q4 7 -7 25Z','#E7A3A0','none')
  q+=path('M-13 57L-6 13M25 59L9 10',stroke=RED,w=3)+path('M-7 62L0 15M31 62L14 15',stroke=DARK,w=2)
 return group(q,x,y,s)

def l1e1():
 q=panel(65,1040)+ellipse(512,560,355,370,'#B45D67','#92515E',5)
 for upper in [True,False]:
  for i in range(10):
   x=233+i*62;y=(372 if upper else 738)+(-52 if upper else 52)*math.sin(i/9*math.pi)
   k='incisor' if i in [3,4,5,6] else 'canine' if i in [2,7] else 'molar'
   col='#D2E8E2' if k=='incisor' else '#F8DA8E' if k=='canine' else '#F5C0BA'
   q+=group(ellipse(0,0,29,55,col)+tooth(0,0,.49,k),x,y,1,180 if not upper else 0)
 for x,icon in [(232,'blade'),(512,'hook'),(790,'mill')]:
  q+=circ(x,1260,112,'#F5E2BB','#DEC59F',3)
  if icon=='blade':q+=path(f'M{x-50} 1270L{x+35} 1198L{x+38} 1244L{x-21} 1295Z','#C2D2D0',C,3)+path(f'M{x-50} 1270L{x-77} 1299',stroke='#A67A50',w=20)
  elif icon=='hook':q+=path(f'M{x-30} 1200V1280Q{x-10} 1340 {x+40} 1280',stroke='#BFA45E',w=15)
  else:q+=ellipse(x,1270,66,30,'#B8B2A5',C)+ellipse(x,1253,60,25,'#DDD7C7',C)+circ(x,1253,12,C)
 return q+mascot(885,1003,.5)

def profile(x,y,s=1):
 q=path('M90 380V260Q45 245 36 211L-5 199L25 169Q6 144 28 101Q77 28 176 58Q252 88 242 185Q234 238 195 260V380Z','#F3D3AF','#B58C72',4)
 q+=path('M33 122Q70 112 90 140M22 181L66 185',stroke='#92695C',w=4)+ellipse(56,117,5,8,C)
 return group(q,x,y,s)
def l1e2():
 q=panel(60,1300)+profile(180,80,2.1)
 # profile faces left; three pairs are represented as near side solid and far side dashed mates.
 for x,y,rx,ry in [(580,412,42,62),(477,619,43,29),(391,566,36,20)]:
  q+=ellipse(x+12,y+14,rx,ry,'none','#D29F6D',3,extra='stroke-dasharray="6 7"')+ellipse(x,y,rx,ry,'#E6BE7E','#BA915E',3)
 q+=path('M580 409Q536 460 386 463M477 619Q481 544 396 528M391 566L373 516',stroke='#C09961',w=6)
 q+=path('M286 509Q353 560 425 516','#E9A19F','#B8747D',4)+rect(302,481,73,36,'#EFD5A1','#B68E58',2,10)
 for x,y in [(333,493),(357,512),(383,518)]:q+=droplet(x,y,.4)
 q+=ellipse(339,1048,150,33,'#FFF9E8','#D1B796',3)+rect(286,990,107,43,'#EBD2A2','#AC8958',3,10)
 q+=path('M319 972Q215 884 259 728Q285 637 280 530',stroke='#D4BA92',w=4,extra='stroke-dasharray="8 14"')
 return q+mascot(817,1224,.85)
def l1e3():
 q=''
 for j in range(2):
  x=40+j*483;q+=panel(60,1310,x,461)+profile(x+70,140,1.4)
  q+=tube(f'M{x+182} 585V1120','#AFCDD2',46)+tube(f'M{x+308} 567V1120',PINK,35)
  for y in range(637,1101,54):q+=path(f'M{x+157} {y}H{x+208}',stroke='#86ABB0',w=5)
  q+=tube(f'M{x+172} 432Q{x+267} 432 {x+267} 516Q{x+267} 546 {x+309} 567',PINK,30)
  q+=tube(f'M{x+267} 516Q{x+248} 552 {x+182} 585','#AFCDD2',30)
  if j==0:q+=path(f'M{x+213} 587Q{x+258} 540 {x+239} 502',stroke='#B9A650',w=15)+arrow(x+182,647,x+182,913,'#5DA6C4',8)
  else:q+=path(f'M{x+236} 548Q{x+211} 569 {x+168} 579',stroke='#B9A650',w=15)+ellipse(x+308,739,23,34,'#DAC093','#AE8C60',3)+arrow(x+308,810,x+308,971,GOLD,7)
 return q+mascot(890,1414,.45)
def l1e4():
 q=panel(65,1350)+tooth(501,760,4.3,cross=True)
 # balanced demineralization/remineralization around crown
 q+=path('M253 531Q314 454 414 527',stroke='#D7C58A',w=12)
 q+=dots(253,479,20,150,50,colors=['#A3AA98'],r=7)
 for x,y in [(196,311),(281,293),(367,312)]:q+=rect(x,y,43,41,'#FFFAE9','#CBB99E',3,7)
 q+=arrow(251,387,307,465,'#A5A37B',6)+droplet(263,589,.8)+arrow(259,638,319,681,'#8B9B8D',6)
 q+=droplet(759,470,1.3)+arrow(739,535,681,613,TEAL,7)
 for x,y in [(733,585),(768,626),(703,653)]:q+=sugar(x,y,5)
 q+=path('M287 624L317 641L307 662',stroke='#AE8C60',w=4)
 return q+mascot(847,1307,.65)
def l1e6():
 q=panel(70,1300)+path('M115 630Q512 834 909 630V1110Q512 1311 115 1110Z','#EED0A4','#BC9670',5)
 q+=path('M115 630Q512 834 909 630V733Q512 937 115 733Z','#E3A0A0','#BC7E84',4)
 for i,x in enumerate([185,310,435,560,685,810]):
  q+=tooth(x,610+90*math.sin(i/5*math.pi),.9,kind='incisor' if i in [2,3] else 'canine' if i in [1,4] else 'molar')
  q+=tooth(x,970+75*math.sin(i/5*math.pi),1.15,kind='incisor' if i in [2,3] else 'canine' if i in [1,4] else 'molar')
 q+=arrow(559,950,559,827,TEAL,8)+group(tooth(0,0,.72,'incisor'),561,672,1,-18)
 return q+mascot(842,1302,.75)

def l2e1():
 q=''
 for j in range(3):
  x=180+j*330;yb=390+j*180;q+=panel(200,1020,x-116,232)
  d=f'M{x} 280V{yb-90}Q{x-45} {yb-60} {x} {yb-25}Q{x+28} {yb+45} {x} {yb+100}V1135'
  q+=tube(d,PINK,78)+ellipse(x,yb+38,38,56,'#DDC08A','#AD8D5A',3)
  q+=path(f'M{x-54} {yb-52}H{x+53}',stroke='#BD6374',w=16)+arrow(x,yb+130,x,yb+227,TEAL,7)
  if j<2:q+=arrow(x+140,700,x+184,700,GOLD,6)
 # inverted astronaut symbol
 q+=circ(160,113,60,'#DBEBEC','#88B0BB',3)+group(boy(-100,-80,.26,True),164,115,1,180)
 return q+mascot(841,1380,.65)
def l2e2():
 q=torso()+stomach(585,628,1.4)
 # THREE overlaid muscle-direction swatches on stomach cutaway
 q+=rect(635,598,149,144,'#F8DBBA','#BD8190',3,20)
 for k in range(5):q+=path(f'M{646+k*24} 608V724',stroke='#D59083',w=5)
 for k in range(4):q+=path(f'M647 {619+k*28}H771',stroke='#B66F83',w=4)
 for k in range(4):q+=path(f'M647 {651+k*24}L{695+k*24} 609',stroke='#E7B56C',w=4)
 for x,y in [(558,655),(614,699),(676,670)]:q+=droplet(x,y,.45)
 q+=group(chain(0,0),494,716,1)
 return q+mascot(824,1297,.9)
def l2e3():
 q=panel(80,1270)
 # lumen above continuous mucus layer, epithelium beneath
 q+=rect(122,281,780,325,'#FCF0D9',rx=30)
 q+=path('M122 606Q240 575 340 606T553 606T770 606T902 606V715H122Z','#DCEBD0','#A6C196',4)
 for i in range(12):
  x=122+i*65;q+=rect(x,716,64,160,'#EDB6B4','#B9858D',3,15)+ellipse(x+32,809,14,23,'#B383A3')
 for x,y in [(250,421),(441,470),(676,425),(793,490)]:q+=droplet(x,y,1)+arrow(x,y+45,x,578,'#8AA69F',5)
 q+=path('M122 881H902',stroke='#CDB49A',w=12)
 for x in [285,577,772]:q+=cell(x,1011,.5)+arrow(x,967,x,885,TEAL,6)
 return q+mascot(819,1240,.75)
def l2e5():
 q=panel(70,1350)+stomach(544,654,2)
 q+=ellipse(500,473,48,16,'#DEC56F','#A68E46',6)+ellipse(293,823,32,47,'#DEC56F','#A68E46',6)
 q+=arrow(287,877,303,1000,TEAL,7)+dots(289,920,8,30,100,colors=['#D4B282'],r=7)
 q+=circ(790,298,147,'#F7E4C5','#D6BE9C',3)+tube('M770 198V290Q784 328 815 319',PINK,45)+arrow(788,294,788,221,'#D28C69',6)
 q+=ellipse(790,197,33,14,'#E5CB85','#A68E46',4)+ellipse(800,254,27,48,'#FFD990',extra='opacity=".35"')
 return q+mascot(849,1304,.8)
def l2e6():
 q=''
 # equal thirds are symbolic portions, never a physiological fixed capacity chart
 for i in range(3):
  y=285+i*400;q+=panel(y-180,363)+stomach(353,y,.91)
  q+=circ(700,y-5,112,'#E8D7B9','#C5A77F',3)
  q+=path(f'M700 {y-5}L700 {y-117}A112 112 0 0 1 797 {y+51}Z',[GOLD,'#B8DFEA','#FFFDF4'][i],'none')
 return q+mascot(883,1411,.45)

def duct_map():
 q=pancreas(620,645,1.25)+stomach(641,495,1.05)+liver(403,483,1.08)+gall(373,573,.95)
 q+=tube('M506 598Q451 585 444 655Q440 751 532 747',PINK,30)
 q+=path('M400 512V592L471 624V668M379 577L400 592M722 632Q596 620 471 668',stroke='#758F42',w=9)
 q+=arrow(450,625,471,659,'#758F42',5)+arrow(592,633,506,653,'#BC9D44',5)
 return q
def l3e1():
 q=torso()+duct_map()+gut(511,940,.74)
 q+=path('M485 886Q269 847 286 656Q294 575 380 521',stroke=DARK,w=14)+arrow(311,594,366,538,DARK,6)
 q+=arrow(493,835,478,888,GOLD,6)
 return q+mascot(839,1310,.85)
def l3e2():
 q=panel(60,1300)+pancreas(540,358,2.1)
 q+=tube('M175 650Q211 702 511 694Q848 696 849 836Q854 1028 174 1030',PINK,110)
 q+=path('M315 370Q239 454 330 589V671',stroke='#B49A52',w=12)+arrow(328,555,328,663,'#A58C43',7)
 for x,y,k in [(246,737,0),(471,746,1),(700,749,2)]:
  if k==0:q+=chain(x,y,6)
  elif k==1:q+=path(f'M{x} {y}q-30 -35 2 -48t28 49t36 -5',stroke='#B786B5',w=12)
  else:q+=ellipse(x,y,37,29,'#EFC057','#BC9341',3)
  q+=arrow(x,y+60,x,y+142,TEAL,6)
  for n in range(4):q+=circ(x-30+n*21,y+192,7,[GOLD,'#B786B5','#EFC057'][k])
  q+=path(f'M{x-20} 582l34 30m-34 0l34 -30',stroke='#C3B395',w=4)
 q+=circ(795,1137,84,'#E5EDCF','#C0C99F',3)+droplet(769,1136,.7)+droplet(819,1136,.7)
 return q+mascot(814,1340,.6)
def bottle(x,y,s=1,emulsified=False):
 q=path('M-37 -144V-91Q-87 -69 -85 -19V160Q0 195 85 160V-19Q87 -69 37 -91V-144Z','url(#glass)','#7EAAA9',4)+rect(-41,-157,82,24,'#D6D9CA','#7EAAA9',3,5)
 q+=rect(-76,-9,152,159,'#CEE7E6',rx=5)
 if emulsified:q+=dots(-70,-5,94,137,153,colors=['#EBC053'],r=4)
 else:q+=rect(-76,-43,152,49,'#EBC053',rx=4)
 return group(q,x,y,s)
def l3e3():
 q=panel(70,1350)+bottle(254,790,1.6)+bottle(771,790,1.6,True)+liver(470,250,.65)+gall(473,312,.7)
 q+=path('M479 338Q561 393 749 472',stroke='#92A747',w=7)+droplet(761,499,.8,'#C3C875')+arrow(437,795,569,795,TEAL,8)
 return q+mascot(824,1271,.8)
def l3e4():
 q=torso()+gut(511,923,.62)+liver(415,531,1)
 q+=tube('M474 849Q262 798 300 650Q324 583 384 555',DARK,16)+arrow(319,644,365,580,DARK,6)
 q+=tube('M438 492Q489 405 563 364',RED,16)+heart(566,330,.45)+arrow(483,432,539,378,RED,6)
 q+=circ(748,656,151,'#FAE9D9','#D1AF95',3)+cell(750,649,1.3)+group(chain(0,0),699,646,.7)
 for x,y in [(698,591),(792,716),(685,717)]:q+=sugar(x,y,7)
 q+=arrow(812,680,857,751,GOLD,5)+arrow(638,592,678,616,GOLD,5)
 q+=rect(215,1160,78,31,'#F8E6D0','#A99588',2,15)+arrow(310,1173,386,1173,TEAL,6)+circ(420,1173,22,'#B3C29F')
 return q+mascot(840,1310,.8)
def l3e5():
 q=panel(70,1350)+pancreas(512,313,1.8)
 q+=tube('M296 339Q181 443 214 572', '#C4AE6E',12)+tube('M143 575Q341 648 455 575',PINK,54)
 q+=vessel(505,660,370,63)+arrow(514,382,629,638,TEAL,7)
 for x,y in [(545,457),(573,521),(602,591)]:q+=circ(x,y,10,'#7DAF9C','#518A7B',2)
 q+=cell(645,997,1.55)+arrow(694,762,694,865,TEAL,7)
 q+=path('M508 947L525 1008L504 1022',stroke='#82ACB3',w=9)+arrow(375,1003,499,1003,GOLD,6)
 for x in [370,410,450]:q+=sugar(x,977,8)
 # Respectful small daily-life injection inset, far smaller than main diagram
 q+=rect(127,1140,340,218,'#E6EEDF','#C6D0B9',3,22)+boy(153,1161,.44)+boy(296,1161,.44)+rect(223,1239,12,56,'#D0BBA3','#8C8274',2,4)
 return q+mascot(855,1334,.6)
def l3e6():
 q=panel(80,550)+panel(690,730)
 q+=ellipse(512,309,184,57,'#D8D7C8','#9C9C8E',6)+path('M330 308Q512 594 694 308','#C6C7B5','#9C9C8E',5)
 for y in [346,379,412]:
  for x in range(414,611,35):q+=circ(x,y,6,'#9EAA9C')
 q+=path('M364 225L665 507M665 225L364 507',stroke='#D79885',w=14)
 q+=liver(508,955,1.9)
 for x,y in [(368,926),(533,911),(418,1052),(611,1012)]:q+=cell(x,y,.55)
 q+=sugar(185,900,11)+arrow(220,900,319,924,GOLD,6)+group(chain(0,0),334,927,.6)
 q+=path('M172 1113l23 -23l22 23l-23 23Z','#BA8DAD',C,2)+arrow(227,1114,349,1080,TEAL,6)+circ(403,1075,12,'#AFC59F')+arrow(646,1094,814,1179,DARK,7)
 return q+mascot(870,1337,.6)

def villus(x,y,s=1,lymph=False):
 q=path('M-90 235V-30C-91 -203 -51 -250 0 -252C51 -250 91 -203 90 -30V235Z','#EDB8AE','#A86E7D',5)
 q+=path('M-61 236V-27Q-63 -208 0 -210Q63 -208 61 -27V236',stroke=RED,w=13)
 if lymph:q+=path('M0 236V-99Q0 -146 17 -146',stroke='#BDAF7D',w=24)+path('M0 236V-99Q0 -146 17 -146',stroke=MILK,w=17)
 for y1 in range(-80,215,54):q+=ellipse(-80,y1,8,22,'#F8D8BF','#BF8F8C',2)+ellipse(80,y1,8,22,'#F8D8BF','#BF8F8C',2)
 return group(q,x,y,s)
def l4e1():
 q=torso()+gut(512,759,1.05)
 q+=panel(1130,300)+boy(100,1170,.45)
 d='M340 1210'
 for i in range(8):
  x=340+i*64;d+=f'Q{x+14} 1155 {x+30} 1210T{x+64} 1210'
 q+=tube(d,PINK,12)+arrow(194,1403,872,1403,TEAL,5)
 return q+mascot(855,1054,.5)
def l4e2():
 q=panel(70,1330)+villus(440,651,1.5)
 # lumen is exterior to villus; nutrient arrows cross the epithelial boundary into capillary.
 for x,y in [(207,435),(240,574),(210,720)]:q+=sugar(x,y,10)+arrow(x+14,y,348,y,GOLD,6)
 for x,y in [(704,448),(722,588)]:q+=group(chain(0,0,2),x,y,.65)+arrow(x-12,y,532,y,'#B98AAE',6)
 q+=tube('M349 1005Q332 1138 566 1203',DARK,15)+arrow(432,1154,536,1196,DARK,7)+liver(684,1204,.65)
 return q+mascot(842,1340,.6)
def l4e3():
 q=''
 for x,y,r in [(270,300,207),(726,694,207),(286,1090,207)]:q+=circ(x,y,r,'#FCECD7','#D7BB99',4)
 for i in range(5):q+=path(f'M{128+i*58} 434Q{105+i*58} 185 {158+i*58} 173Q{197+i*58} 191 {184+i*58} 434','#F1B4A8','#BB8490',4)
 for i in range(6):q+=villus(576+i*58,709,.26)
 q+=villus(286,1100,.55)
 for i in range(19):
  a=math.pi+math.pi*i/18;xx=286+66*math.cos(a);yy=1062+103*math.sin(a)
  q+=path(f'M{xx} {yy}L{xx+9*math.cos(a)} {yy+17*math.sin(a)}',stroke='#C99D75',w=3)
 q+=arrow(473,389,543,519,TEAL,7)+arrow(581,850,460,954,TEAL,7)
 q+=rect(598,1119,130,100,'#FFFCF1','#B9B5A5',3,1)+rect(783,1119,130,100,'#E4BA83','#BD9869',3,15)
 for i in range(10):q+=path(f'M{790+i*12} 1119q-12 -20 0 -24q12 4 0 24',stroke='#D6AD77',w=4)
 return q+mascot(840,1378,.6)
def l4e4():
 q=torso()+gut(512,762,1.1,True)
 for x,y in [(306,653),(306,840),(714,670),(714,858),(526,526)]:
  dx=-73 if x<512 else 73;q+=droplet(x+dx,y,.55,'#B9DDE7')+arrow(x,y,x+dx,y,'#6FAFC1',6)
 q+=tube('M209 600V970M814 600V970',DARK,12)
 q+=arrow(531,1110,531,1184,TEAL,8)
 return q+mascot(846,1302,.8)
def l4e6():
 q=panel(70,1350)+villus(513,606,1.7,True)
 for x,y in [(227,363),(227,538)]:q+=sugar(x,y,10)+arrow(x+20,y,397,y,GOLD,6)
 q+=group(chain(0,0,2),215,724,.7)+arrow(267,724,397,724,'#B98AAE',6)
 for y in [360,527,706]:q+=ellipse(816,y,16,11,'#EBC05D','#B99446',2)+arrow(791,y,544,y,'#C4B671',6)
 q+=tube('M410 1007Q373 1133 267 1190',DARK,16)+arrow(376,1108,291,1171,DARK,7)+liver(228,1246,.57)
 q+=tube('M514 1009Q556 1119 697 1199',MILK,18)+arrow(603,1155,692,1201,'#BBAE7A',7)+heart(750,1238,.53)
 return q+mascot(877,1400,.4)
def l4e7():
 q=panel(70,605)+panel(714,700)
 q+='<g opacity=".35">'+rect(195,204,634,355,'#A8C6AA','#6F997E',5,0)+rect(222,229,580,304,'none','#FFFDF0',5,0)+path('M512 229V533M222 381H802M367 229V533M657 229V533',stroke='#FFFDF0',w=4)+'</g>'
 q+=path('M186 1114L396 875H854V1187H186Z','#E9D7B9','#AC9A83',4)
 q+=path('M220 1092L420 906H817V1155H220Z','#E9B7A5','#B78B80',3)
 for i in range(8):q+=path(f'M{241+i*70} 1111Q{270+i*59} 1060 {310+i*58} 952',stroke='#CD9A89',w=6)
 q+=path('M120 1300H740',stroke='#AA977D',w=16)
 for x in range(145,721,25):q+=path(f'M{x} 1293V1280',stroke='#796958',w=3)
 q+=mascot(832,1305,.65)
 return q

def l5e1():
 q=panel(70,360)+panel(477,420)+panel(950,475)
 q+=tooth(263,259,1.5)+dots(212,172,14,85,35,colors=['#A6AAA1'],r=5)+droplet(335,248,.7)
 q+=gut(510,679,.62,True)
 # mother and fully wrapped newborn, dotted contact path
 q+=circ(316,1055,56,'#DDA16E','#9E755C',3)+path('M252 1006Q316 921 379 1006L400 1165H239Z','#D4B1B6','#A6808E',4)+path('M252 1145Q324 1125 390 1165L415 1355H216Z','#91B6AF','#648E88',4)
 q+=ellipse(570,1228,133,62,'#FFEDCC','#C9B28F',4)+circ(489,1206,38,'#DDA16E','#9E755C',3)+face(489,1210,.6)
 q+=circ(316,1058,44,'#DDA16E')+face(316,1061,.9)+path('M286 1182Q367 1237 475 1261M365 1180Q440 1156 513 1184',stroke='#DDA16E',w=22)
 q+=path('M372 1108Q428 1092 459 1164',stroke='#84B0A0',w=4,extra='stroke-dasharray="3 15"')
 return q+mascot(850,1336,.6)
def l5e2():
 q=panel(70,1350)
 for i in range(10):q+=rect(125+i*77,879,76,204,'#EDB6AE','#B88686',3,20)+ellipse(163+i*77,1002,18,24,'#AE86A3')
 q+=dots(135,756,90,720,100,r=8)
 q+=path('M160 382Q290 291 403 371T688 371',stroke='#83AC67',w=16)
 for i in range(5):q+=path(f'M{245+i*77} 350l-27 -52m27 52l28 49',stroke='#8FBF76',w=7)
 q+=arrow(411,422,411,600,TEAL,7)
 for x,y in [(298,666),(444,639),(576,668)]:q+=circ(x,y,8,'#A9BD79')+arrow(x,y+26,x,910,TEAL,5)
 for x,y in [(690,645),(754,681)]:q+=path(f'M{x-12} {y}H{x+12}M{x} {y-12}V{y+12}',stroke=GOLD,w=5)
 q+=circ(834,552,12,'#A1AAA0')+arrow(833,593,833,742,'#A1AAA0',5)+path('M810 723L852 766M852 723L810 766',stroke='#D0A88A',w=6)
 return q+mascot(837,1284,.8)
def plate_food(x,y,healthy=True):
 q=ellipse(x,y,155,90,'#FFFDF1','#C5B79B',4)
 if healthy:
  q+=circ(x-62,y-10,29,'#E09A63','#B27C59',3)+path(f'M{x-65} {y-40}q10 -25 21 -15',stroke=GREEN,w=6)+ellipse(x+38,y+12,60,24,'#D2B789')+dots(x+1,y-2,28,65,25,colors=['#9B764F'],r=3)
  q+=path(f'M{x-35} {y+28}q26 -49 65 -42q24 32 48 36',stroke='#86B378',w=17)
  q+=ellipse(x-12,y-13,27,15,'#AD8F66')
 else:
  q+=rect(x-92,y-34,63,68,'#D9AFA6',rx=6)+ellipse(x-62,y-36,32,9,'#B87C6D')+path(f'M{x-20} {y-40}l42 70l-57 0Z','#EAC15F','#B99B5B',3)+rect(x+56,y-22,50,31,'#F3B4AD',rx=12)
 return q
def l5e3():
 q=panel(70,1350)
 for x,healthy in [(265,True),(761,False)]:
  q+=plate_food(x,352,healthy)+gut(x,886,.8)
  colors=None if healthy else ['#BAB57B','#CDAAA0']
  q+=dots(x-132,743,43 if healthy else 12,20,260,colors,r=5)+dots(x+117,740,40 if healthy else 11,20,266,colors,r=5)+dots(x-90,703,34 if healthy else 10,200,23,colors,r=5)
 return q+mascot(512,1352,.6)
def l5e4():
 q=panel(70,1350)
 for x in [220,512,804]:q+=circ(x,308,118,'#F2E4C9','#D6C29F',3)
 # prescription consultation icon
 q+=circ(190,273,30,'#DDA16E')+path('M156 310H228L241 371H143Z','#F6F7EC','#ADC1BA',3)+rect(231,310,49,47,'#FFFEF4','#B9B79F',2,3)
 # cold icon, medicine crossed
 q+=circ(487,284,37,'#DDA16E')+rect(488,308,33,26,'#FFFEF4','#B9B79F',2,3)+rect(543,282,37,58,'#C3C8B2','#98A08B',2,5)+path('M538 275L585 344M585 275L538 344',stroke='#D09A8C',w=5)
 # prescribed days only, no independent fixed duration
 q+=rect(729,258,150,93,'#FFFEF4','#B9B79F',3,8)
 for i in range(4):q+=rect(739+i*34,278,26,51,'#E2E9CF',rx=3)+path(f'M{744+i*34} 305l6 7l10 -17',stroke=TEAL,w=3)
 for j,n in enumerate([40,10,29]):
  x=215+j*298;q+=gut(x,870,.62)+dots(x-101,756,n,16,210,r=4)+dots(x+91,756,n,16,210,r=4)
  if j<2:q+=arrow(x+126,927,x+164,927,TEAL,5)
 return q+mascot(840,1339,.6)
def l5e5():
 q=torso()+stomach(616,591,.72)+liver(390,556,.69)+gut(512,859,.66)
 # six conceptual stations: mouth represented above torso; food only along gut,
 # glucose leaves villus then liver then muscle via blood (cardiac circuit abbreviated).
 q+=ellipse(512,153,58,25,'#B66F76','#92626D',3)+rect(393,134,63,35,'#E7CC94','#BA9D69',3,9)+tube('M512 177V470Q523 536 588 549',PINK,15)
 q+=path('M423 159L512 159V482Q538 558 625 605L510 741L485 842',stroke=GOLD,w=6)
 q+=circ(756,837,110,'#F8E9D4','#CFB796',3)+villus(756,841,.35)+path('M530 840L659 840',stroke='#CEAF72',w=3,extra='stroke-dasharray="5 8"')
 q+=arrow(726,956,437,608,DARK,7)+path('M425 535Q392 425 311 437Q221 453 233 803',stroke=DARK,w=12)+arrow(233,739,233,799,DARK,6)
 q+=cell(232,904,.7)+group(chain(0,0,3),207,904,.5)+arrow(537,856,619,921,GREEN,6)
 for x,y in [(512,153),(620,597),(506,741),(756,837),(403,551),(232,904)]:q+=circ(x,y,19,'none','#F3CD65',6)
 return q+mascot(851,1300,.8)
def mouse(x,y,s=1):
 q=ellipse(0,0,78,44,'#E3DAC9','#9D9489',3)+ellipse(-66,-18,35,29,'#E3DAC9','#9D9489',3)+ellipse(-52,-49,18,24,'#E5C4B9','#9D9489',3)+circ(-82,-21,5,C)+path('M67 12Q145 55 151 8',stroke='#C9AA9B',w=8)+ellipse(-30,39,25,9,'#C6B6A3')+ellipse(48,39,25,9,'#C6B6A3')
 return group(q,x,y,s)
def l5e6():
 q=panel(70,1320)+rect(95,254,385,470,'url(#glass)','#92AFAC',5,45)+rect(551,254,377,470,'#FBF4DF','#B8AC91',4,32)
 q+=mouse(280,576,1)+ellipse(294,577,39,32,'#E7DDC9','#C1B49E',2)+mouse(728,576,1.07)
 # sealed glove ports, not open hand-holes
 for x in [205,362]:q+=circ(x,339,39,'#CCD6C9','#91A19A',4)+path(f'M{x} 349q-20 32 0 80q24 20 33 -6V368Z','#BFCBBC','#94A18C',3)
 q+=arrow(690,855,361,855,TEAL,7)+dots(448,812,24,180,28,r=5)+mouse(285,1157,1.04)+arrow(282,751,282,1054,TEAL,7)
 return q+mascot(830,1264,.8)

BUILD={
'U06.L01-E1':l1e1,'U06.L01-E2':l1e2,'U06.L01-E3':l1e3,'U06.L01-E4':l1e4,'U06.L01-E6':l1e6,
'U06.L02-E1':l2e1,'U06.L02-E2':l2e2,'U06.L02-E3':l2e3,'U06.L02-E5':l2e5,'U06.L02-E6':l2e6,
'U06.L03-E1':l3e1,'U06.L03-E2':l3e2,'U06.L03-E3':l3e3,'U06.L03-E4':l3e4,'U06.L03-E5':l3e5,'U06.L03-E6':l3e6,
'U06.L04-E1':l4e1,'U06.L04-E2':l4e2,'U06.L04-E3':l4e3,'U06.L04-E4':l4e4,'U06.L04-E6':l4e6,'U06.L04-E7':l4e7,
'U06.L05-E1':l5e1,'U06.L05-E2':l5e2,'U06.L05-E3':l5e3,'U06.L05-E4':l5e4,'U06.L05-E5':l5e5,'U06.L05-E6':l5e6}
if __name__=='__main__':
 b=io.BytesIO()
 with zipfile.ZipFile(b,'w',zipfile.ZIP_DEFLATED) as z:
  for name,fn in BUILD.items():
   webp,data,svg=save(name,fn());z.writestr(webp,data);z.writestr('sources/'+name+'.svg',svg);print(webp,flush=True)
  for f in SRC.glob('*.py'):z.writestr('sources/'+f.name,f.read_bytes())
 p=ROOT/'vector-assets.zip';p.with_suffix('.tmp').write_bytes(b.getvalue());p.with_suffix('.tmp').replace(p)
 with zipfile.ZipFile(p) as z:
  for n in z.namelist():
   if n.endswith('.webp'):
    im=Image.open(io.BytesIO(z.read(n)));im.load();assert im.size==(1024,1536)
 print('VERIFIED',len(BUILD))
