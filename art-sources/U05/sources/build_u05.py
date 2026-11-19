import build_diagrams as d
import build_remaining as b
from build_diagrams import *

def mito(x,y,s=1,glow=False,angle=0):
 q=ellipse(0,0,102,61,'#FFDCAF',extra='opacity=".5"') if glow else ''
 q+=path('M-76 -35C-22 -80 61 -56 84 -11C112 39 41 76 -5 47C-48 16 -84 41 -89 -1C-92 -16 -87 -26 -76 -35Z','#F4AB60','#BA7746',3)
 q+=path('M-64 -22C-52 -45 -28 -49 -22 -31L-40 -6Q-44 9 -24 10L0 9Q13 5 3 -11L-3 -20Q-10 -40 11 -34L39 -20Q57 -8 40 3L28 10Q17 22 40 27L65 23',stroke='#C77A3B',w=5)
 return group(q,x,y,s,angle)
def cell(x,y,s=1,face_allowed=False,mitos=5):
 q=path('M-236 -137C-315 -45 -268 133 -145 189C-36 260 183 213 248 84C311 -21 209 -166 71 -192C-69 -225 -170 -215 -236 -137Z','#DFF1F4','#B39170',5)
 q+=path('M-228 -130C-303 -42 -258 125 -140 180C-36 247 174 203 239 79C299 -20 203 -156 69 -182C-65 -215 -164 -205 -228 -130Z','none','#D6C3A0',2)
 q+=ellipse(-20,-25,81,66,'#B69ACF','#8F70B0',3)+ellipse(-37,-35,22,17,'#9270B2')
 coords=[(-143,-105),(139,-95),(-173,61),(76,120),(178,43)]
 for a,(xx,yy) in enumerate(coords[:mitos]):q+=mito(xx,yy,.43,True,a*27-40)
 if face_allowed:q+=face(-18,-23,.9)
 return group(q,x,y,s)
def sugar(x,y,s=1):
 q=path('M-12 -10L8 -15L19 -3L0 3Z','#FFE7A4','#BB9750',1.8)+path('M-12 -10V10L0 18V3Z','#EFC363','#BB9750',1.8)+path('M0 3L19 -3V13L0 18Z','#F9D88B','#BB9750',1.8)
 return group(q,x,y,s)
def energy(x,y,s=1):
 q=circ(0,0,24,'#FFEBC3',extra='opacity=".4"')+path('M0 -16L4 -4L16 0L4 4L0 16L-4 4L-16 0L-4 -4Z','#F5C259','#E5AE3F',2)
 return group(q,x,y,s)
def water(x,y,s=1):return group(path('M0 -20C-3 -7 -18 1 -14 13C-7 28 17 22 16 9C15 -1 5 -9 0 -20Z','#96CDE5','#5D9EB8',2),x,y,s)
def lens_frame(x,y,r):return circ(x,y,r,'#FFFCF1','#D2B56F',5)
def tiles(x,y,cols=4,rows=3,size=70,empty=False):
 q=''
 for j in range(rows):
  for i in range(cols):
   xx=i*size;yy=j*size
   q+=rect(xx,yy,size-4,size-4,'#F7F0DA' if empty else '#DFF0EE','#A79273',3,8)
   if not empty:q+=ellipse(xx+size*.48,yy+size*.47,size*.15,size*.11,'#B59DCE','#8E76A9',1.3)
 return group(q,x,y)
def hex_cork(x,y,s=1):
 q=''
 for row in range(5):
  for col in range(5):
   xx=col*68+(34 if row%2 else 0);yy=row*59
   pts=[(xx+37*math.cos(math.pi/3*k),yy+37*math.sin(math.pi/3*k)) for k in range(6)]
   q+=path('M'+'L'.join(f'{a} {c}' for a,c in pts)+'Z','#F5ECD6','#9A8060',3)
 return group(q,x,y,s)
def muscle_fiber(x,y,s=1):
 q=rect(-155,-33,310,66,'#EAB8A9','#B27C77',3,22)
 for xx in range(-135,150,23):q+=path(f'M{xx} -27V27',stroke='#C78F86',w=3)
 for xx in [-112,-38,48,114]:q+=ellipse(xx,-22,8,4,'#AA8FAF')
 return group(q,x,y,s)
def neuron(x,y,s=1):
 q=path('M-32 -16L-83 -66L-47 -9L-95 18L-37 15L-53 66L-7 28L29 50L25 8L81 25L41 -13L68 -66L17 -28L-5 -72L-13 -29Z','#D6BCE0','#9F83B0',3)
 q+=ellipse(-8,-4,16,13,'#B194C9')+path('M30 18Q94 57 131 32L184 54M184 54L217 31M184 54L223 74',stroke='#AA8BAF',w=7)
 return group(q,x,y,s)
def intestine(x,y,s=1):
 q=path('M-75 -35Q-111 -75 -75 -94H72Q113 -79 79 -47L-66 -21Q-95 -3 -70 12L75 21Q105 43 77 58H-68Q-100 77 -65 91H70',stroke='#D79D89',w=24)
 q+=path('M-75 -35Q-111 -75 -75 -94H72Q113 -79 79 -47L-66 -21Q-95 -3 -70 12L75 21Q105 43 77 58H-68Q-100 77 -65 91H70',stroke='#F6D3B1',w=13)
 return group(q,x,y,s)
def bread(x,y,s=1):return group(path('M-66 50V-34Q-88 -69 -48 -86Q-18 -99 0 -82Q44 -104 69 -71Q89 -50 68 -33V50Z','#EDC284','#AC8050',4)+path('M-47 28V-26Q-63 -55 -35 -62Q-12 -70 0 -57Q30 -75 49 -52Q61 -39 48 -24V28Z','#FBE0A8','#D8AC6F',2),x,y,s)
def food_plate(x,y,s=1):return group(ellipse(0,0,146,93,'#FFFCF1','#A5C3BD',5)+bread(-65,-10,.55)+path('M35 -40Q89 -49 98 -17Q82 14 41 -7Z','#F9CE62','#D5AE50',3)+ellipse(41,39,45,19,'#FFF3D5','#D3BE8D',2)+circ(78,-25,20,'#E9946B','#BC7358',2),x,y,s)
def belly(x=512,y=20,s=.94):
 q=path('M-105 585Q-50 557 9 590L19 624Q-54 651 -105 622Z','#B97460','#98564D',3)+path('M38 590Q94 585 90 622Q84 657 48 652Q27 649 43 628Z','#E3AF9F','#B88177',3)+intestine(0,682,.46)
 return group(q,x,y,s)
def zoom_four():
 q=''
 for x,y,r in [(235,180,112),(704,470,145),(300,800,178),(609,1212,260)]:q+=lens_frame(x,y,r)
 q+=group(b.body_base(0,0),234,82,.145)+rect(610,414,188,105,'#DCA77C','#B27C5C',3,35)
 q+=tiles(178,698,3,4,67)+cell(609,1223,.85)+path('M304 260L609 381M619 576L432 674M403 937L450 1029',stroke=TEAL,w=4,extra='stroke-dasharray="8 12"')+mascot(850,157,.6)
 return q
def cell_detail():
 q=lens_frame(512,708,428)+cell(512,730,1.35)
 q+=sugar(171,561,.85)+arrow(202,573,239,598,TEAL,6)+oxygen(216,607,8)+waste(875,838,9)+arrow(814,824,856,835,'#999DA4',6)
 q+=rect(222,587,35,12,'#C5B38E','#A68B67',2,5)+rect(809,817,35,12,'#C5B38E','#A68B67',2,5)+mascot(838,1312,.75)
 return q
def specialties():
 q=''
 for x,y in [(272,371),(751,371),(272,1046),(751,1046)]:q+=lens_frame(x,y,209)
 q+=rbc(272,371,3.3)+muscle_fiber(751,371,1.1)+neuron(244,1046,1.05)+group(path('M-126 -61L-21 -111L116 -65L143 42L42 109L-102 79Z','#CFE4E6','#9DBDBE',4)+ellipse(0,0,42,25,'#BAA3D0','#947AAE',3),751,1046)
 q+=mascot(515,755,.45)
 return q
def mitochondria_detail():
 q=lens_frame(512,620,401)+circ(512,620,381,'#E8F5F6')
 for x,y,s,a in [(320,409,1.2,-20),(702,469,1,30),(480,683,1.8,10),(335,845,.9,40),(704,814,.9,-25)]:q+=mito(x,y,s,True,a)
 q+=panel(1085,368,x=55,w=914)+muscle_fiber(306,1248,.9)
 for i in range(10):q+=mito(190+(i%5)*54,1210+(i//5)*74,.22,False,i*17)
 q+=ellipse(739,1250,142,106,'#DFEDF0','#A6C6C7',3)
 for x,y in [(695,1213),(790,1242),(715,1313)]:q+=mito(x,y,.3,False,20)
 q+=mascot(844,999,.43)
 return q
def hierarchy():
 q=''
 coords=[(170,1305),(340,1065),(510,825),(680,585),(846,291)]
 for k,(x,y) in enumerate(coords):
  q+=lens_frame(x,y,130 if k<4 else 143)
  if k<4:q+=arrow(x+55,y-142,x+107,y-185,TEAL,7)
 q+=muscle_fiber(170,1305,.65)
 for y in [1025,1065,1105]:q+=muscle_fiber(340,y,.55)
 q+=heart(510,825,.7)+group(b.body_base(0,0)+b.body_vessels(False,x=0,y=0)+b.body_organs(0,0,showlungs=False),680,468,.17)+group(b.body_base(0,0),846,181,.17)
 q+=mascot(100,1031,.48)
 return q
def history_compare():
 q=lens_frame(512,389,293)+lens_frame(512,1107,303)
 q+=hex_cork(347,244,.9)+cell(512,1114,.92)+arrow(512,701,512,782,TEAL,5)+mascot(844,760,.55)
 return q
def food_blood():
 q=panel(60,1410)+b.body_base(621,95,.88)+b.body_vessels(False,False,621,95,.88)+b.body_organs(621,95,.88)+belly(621,95,.88)+food_plate(221,605,.92)
 q+=path('M333 579Q449 553 621 281Q676 447 666 636L622 695L574 643L601 529',stroke='#D5AB49',w=5,extra='stroke-dasharray="3 18"')
 for x,y in [(376,549),(459,461),(520,383),(621,697),(580,657),(614,543),(750,659)]:q+=sugar(x,y,.65)
 q+=mascot(186,1131,.7)
 return q
def respiration_balance():
 q=lens_frame(510,747,414)+circ(510,747,396,'#EBF7F5')+mito(519,740,1.63,True)
 q+=sugar(141,490,1.5)+oxygen(142,1065,24)+arrow(183,520,350,650,'#C9A548',7)+arrow(184,1049,348,825,TEAL,7)
 # Small intermediate products in cytosol distinguish glucose breakdown from direct mitochondrial entry.
 for x,y in [(251,559),(277,587),(308,610)]:q+=sugar(x,y,.45)
 q+=energy(865,429,2.2)+waste(866,753,26)+water(868,1100,1.9)
 for x1,y1,x2,y2,col in [(685,658,826,454,'#E4B44B'),(710,746,825,752,'#969CA3'),(676,829,832,1051,'#6DADC8')]:q+=arrow(x1,y1,x2,y2,col,7)
 q+=mascot(229,1349,.55)
 return q
def candle(x,y,s=1,smoke=False):
 q=rect(-44,0,88,122,'#F1DDA9','#B79B66',3,8)+path('M0 0V-20',stroke=C,w=3)+path('M0 -105C-14 -65 -41 -45 -22 -22C-3 2 36 -23 20 -53Z','#F5BF51','#DFA148',2)
 if smoke:q+=path('M6 -127Q-31 -167 4 -204Q34 -232 2 -265',stroke='#B3AAA1',w=13,extra='opacity=".6"')
 return group(q,x,y,s)
def burn_compare():
 q=panel(60,650)+panel(765,700)+candle(322,385,1.2,True)+cell(510,1105,.95)
 q+=path('M648 551Q704 386 648 203',stroke='#CBA04A',w=7)+arrow(678,245,648,203,'#CBA04A',7)
 for x,y in [(424,273),(456,350)]:q+=waste(x,y,9)
 q+=water(390,273,.75)+water(426,337,.75)
 for x,y in [(746,1022),(772,1070)]:q+=waste(x,y,9)
 q+=water(785,1130,.75)+energy(480,1314,.8)
 q+=path('M766 1377H802V1345H835V1313H868V1281H900V1249',stroke='#C8AE7F',w=6)+mascot(846,738,.4)
 return q
def whole_delivery():
 q=panel(55,1425)+b.body_base(s=.94)+b.body_vessels(False,False,s=.94)+b.body_organs(s=.94)+belly(s=.94)
 q+=path('M508 661L460 603L499 497M547 452L542 481L535 545L536 654L565 820L580 929',stroke='#DEB247',w=4,extra='stroke-dasharray="3 17"')
 for x,y in [(503,654),(470,614),(499,499),(536,600),(567,830)]:q+=sugar(x,y,.45)
 for x,y in [(551,447),(548,469),(536,520),(537,600),(558,794),(577,915)]:q+=oxygen(x,y,5)
 for x,y in [(567,966),(553,866),(522,762),(495,655),(495,533),(490,488),(487,445),(479,419)]:q+=waste(x,y,5)
 q+=lens_frame(803,1066,164)+cell(803,1066,.48)+path('M588 900L687 960',stroke='#CAA76C',w=3,extra='stroke-dasharray="8 10"')+arrow(521,272,571,259,'#76AFC5',5)+waste(561,245,6)+mascot(230,1324,.58)
 return q
def energy_work():
 q=lens_frame(312,756,232)+mito(312,756,1.7,True)
 for y in [333,751,1166]:q+=lens_frame(793,y,154)+arrow(494,756,642,y,'#D7AD51',5)
 q+=muscle_fiber(793,333,.75)+cell(793,751,.4)+neuron(774,1166,.61)
 # Growth/repair is shown as a membrane patch, never an animal cell wall.
 q+=path('M748 698Q762 670 805 674',stroke='#D8B653',w=8)+energy(891,1188,.7)
 for x,y in [(534,645),(583,553),(538,756),(584,756),(534,864),(583,958)]:q+=circ(x,y,11,'#F3CF73','#C9A44E',2)
 q+=mascot(321,1243,.6)
 return q
def eating_station():
 q=panel(55,680)+panel(790,680)+group(b.body_base(0,0)+b.body_organs(0,0)+belly(0,0,1),512,67,.5)+bread(624,176,.35)
 q+=path('M599 174L519 166L516 320L536 368L514 410',stroke='#D0A456',w=6)+sugar(514,415,.6)
 q+=rect(127,963,774,176,'#F4DEB7','#D9BD91',3,15)
 for xx in range(127,890,57):q+=rect(xx,1112,55,50,'#E9C7AA','#BA9479',2,6)
 q+=vessel(137,1263,750,76)
 for x in [260,514,741]:q+=sugar(x,1012,.8)+arrow(x,1041,x,1249,'#C9A148',6)+sugar(x,1296,.6)
 q+=mascot(840,861,.4)
 return q
def oxygen_station():
 q=gas_exchange()+lungs(803,257,.28)+b.profile_head(182,241,.54)+arrow(337,234,510,234,'#7DB5CA',5)
 for x,y in [(369,897),(625,986),(811,841)]:q+=sugar(x,y,.75)
 return q
def pumping_station():
 q=panel(60,1410)+b.four_heart(352,620,.95,False)+ellipse(435,694,60,78,'none','#E3BC62',5)
 q+=b.tube('M378 361Q882 220 882 719V1192',RED,35)+vessel(140,1154,742,78,True)+arrow(821,1194,714,1194,RED,6)
 for x,y in [(844,531),(883,885),(776,1194),(550,1194)]:q+=oxygen(x,y,8)+sugar(x+17,y+18,.6)
 q+=muscle_fiber(515,1393,1.35)+mascot(163,902,.55)
 return q
def crossing_station():
 q=panel(60,1410)+vessel(144,204,740,88)+cell(512,995,1.05)
 for x in [320,627]:q+=sugar(x,249,.6)+oxygen(x+23,252,8)+arrow(x,319,x,733,TEAL,7)
 q+=waste(809,253,9)+path('M704 1060Q790 1011 790 818V323',stroke='#9299A0',w=7)+arrow(790,414,790,323,'#9299A0',7)+waste(704,1060,10)
 q+=path('M326 751Q439 794 517 934M628 745Q628 826 612 951',stroke='#D5B35F',w=4,extra='stroke-dasharray="5 12"')
 q+=energy(673,1147,1.3)+mascot(836,1352,.5)
 return q
def knee_phase(x,y,s=1,bent=False):
 q=path('M-20 -64H20V244Q52 256 44 294Q33 323 0 316Q-40 325 -45 293Q-51 259 -20 244Z','#F7E7C5','#AD9274',4)
 tib=path('M-33 10Q0 -4 35 10L20 290L49 329H-25L-14 288Z','#F7E7C5','#AD9274',4)
 angle=55 if bent else 0
 q+=group(tib,0,316,1,angle)
 q+=path('M44 -53C121 -36 142 129 86 237L57 257C22 140 5 37 44 -53Z' if bent else 'M49 -34C145 -21 153 104 92 178L58 205C9 94 10 8 49 -34Z','#EBA998' if bent else '#E47B69','#B8756B',4)
 q+=path('M64 -25Q81 92 72 219' if bent else 'M62 -12Q95 72 73 170',stroke='#F5C6B5',w=4)
 q+=path('M-74 -27Q-137 122 -67 270',stroke='#D9B0A1',w=34)
 q+=path('M72 224L78 293' if bent else 'M73 186L78 293',stroke='#B69C86',w=19)+path('M72 224L78 293' if bent else 'M73 186L78 293',stroke='#F9F1D9',w=13)
 q+=ellipse(79,312,18,25,'#F7E7C5','#AD9274',3)
 tx,ty=(-27,381) if bent else (38,376)
 q+=path(f'M79 335L{tx} {ty}',stroke='#B69C86',w=15)+path(f'M79 335L{tx} {ty}',stroke='#F9F1D9',w=10)
 if not bent:q+=arrow(112,285,112,206,TEAL,5)
 return group(q,x,y,s)
def knee_station():
 q=panel(60,630)+panel(756,708)+knee_phase(521,204,.68,True)+knee_phase(480,950,.69,False)
 q+=path('M666 1230Q777 1133 694 1006',stroke=TEAL,w=5)+arrow(708,1032,694,1006,TEAL,5)+mascot(850,1395,.4)
 return q
def return_station():
 q=b.dual_circuit(False,True)
 for x,y in [(510,1270),(344,1287),(197,1116),(197,961),(256,745),(439,663),(492,477),(354,332)]:q+=waste(x,y,8)
 q+=lens_frame(196,410,116)+rect(110,411,173,57,'#FAE5D2','#BC8D89',2,12)+path('M111 408H283',stroke='#D4B4AE',w=7)+arrow(196,445,196,337,'#9399A0',6)+waste(196,318,9)
 q+=b.profile_head(173,174,.45)+arrow(270,213,325,211,'#80B9C9',5)
 return q
def glycogen():
 q=panel(55,1420)+b.body_base(s=.94)+b.body_organs(s=.94)+belly(s=.94)+ellipse(220,1171,112,69,'#FFFCF1','#A5C3BD',4)+ellipse(220,1171,77,43,'none','#D0DFD7',3)+clock(815,183,.8)
 for x,y in [(449,595),(447,609),(451,623),(576,863),(585,900),(442,863),(448,900)]:
  for k in range(6):q+=circ(x+8*math.sin(k),y+k*6,4,'#EFC970','#BF9F54',1)
 q+=lens_frame(210,720,115)+path('M150 745Q160 641 264 672L277 755Q207 790 150 745Z','#BE806B','#975D54',3)
 q+=rect(185,694,56,61,'#D9A557','#A17843',2,7)+path('M185 694L162 708V768L185 755Z','#EDCA7D','#A17843',2)
 for xx in [202,220]:
  for k in range(6):q+=circ(xx+5*math.sin(k),705+k*6,3,'#FFE49A')
 q+=path('M319 704L437 618',stroke='#C5AB72',w=3,extra='stroke-dasharray="6 10"')+mascot(825,1323,.55)
 return q
def chain():
 q='';ys=[177,461,745,1029,1313]
 for k,y in enumerate(ys):
  opacity='opacity=".35"' if k>=2 else ''
  qq=circ(510,y,126,'#FFFBEF','#CBB17A',13)
  if k<4:qq+=ellipse(510,y+144,21,45,'none','#AE9774',9)
  if k==0:qq+=bread(465,y,.46)+intestine(565,y,.37)
  elif k==1:qq+=lungs(510,y+21,.49)
  elif k==2:qq+=heart(510,y,.64)
  elif k==3:qq+=cell(510,y,.38)
  else:qq+=knee_phase(510,y-40,.20,False)
  q+=f'<g {opacity}>{qq}</g>'
  if k==2:q+=path(f'M605 {y-85}l-28 30l29 20l-31 30',stroke='#FFF0D7',w=17)
 q+=mascot(802,804,.58)
 return q
def outline_card(x,y,s=1,paths=False):
 q=path('M-20 -107Q0 -137 20 -107Q31 -87 8 -75V-52L53 -42L82 30L65 38L35 -14V82L21 191H3L0 93L-3 191H-21L-35 82V-14L-65 38L-82 30L-53 -42L-8 -52V-75Q-31 -87 -20 -107Z','#FFFDF2','#B29C7A',3)
 for xx,yy in [(0,-86),(0,48),(9,-22),(19,112),(21,150)]:q+=circ(xx,yy,10,'#F0CC73','#C3A25C',2)
 if paths:
  q+=path('M0 -86L0 48L-17 35L3 -26L22 111',stroke='#D6B04A',w=3)+path('M27 -30L9 -22L21 111',stroke='#4CA987',w=3)+path('M18 115L-12 -23L26 -39',stroke='#8F959A',w=3)+path('M23 111L24 147',stroke='#E79B50',w=4)
 return group(q,x,y,s)
def experiment_case():
 q=''
 for x,y in [(45,60),(535,60),(45,790),(535,790)]:q+=panel(y,674,x,444)
 q+=rect(100,128,335,535,'#FFFDF2','#D3BA91',3,8)+outline_card(268,362,1.31)
 q+=rect(589,128,335,535,'#FFFDF2','#D3BA91',3,8)+outline_card(758,362,1.31,True)
 for k,c in enumerate(['#D7AF4B','#4AA285','#92999D','#E79A51']):q+=path(f'M{603+k*70} 689l29 -43',stroke=c,w=13)
 q+=boy(103,956,.86)+boy(343,1044,.55)
 q+=rect(605,937,291,411,'#FFFDF3','#C4AA7A',4,14)
 for k in range(6):q+=rect(651,973+k*56,34,34,'none','#B29B73',3,3)
 q+=mascot(509,767,.4)
 return q

BUILD={
'U05.L01-E1':zoom_four,'U05.L01-E2':cell_detail,'U05.L01-E3':specialties,'U05.L01-E5':mitochondria_detail,'U05.L01-E6':hierarchy,'U05.L01-hist2':history_compare,
'U05.L02-E1':food_blood,'U05.L02-E2':respiration_balance,'U05.L02-E3':burn_compare,'U05.L02-E4':whole_delivery,'U05.L02-E6':energy_work,
'U05.L03-E1':eating_station,'U05.L03-E2':oxygen_station,'U05.L03-E3':pumping_station,'U05.L03-E4':crossing_station,'U05.L03-E5':knee_station,'U05.L03-E6':return_station,'U05.L03-E7':glycogen,'U05.L03-E8':chain,'U05.L03-exp':experiment_case}
if __name__=='__main__':
 buffer=io.BytesIO();names=[]
 with zipfile.ZipFile(buffer,'w',zipfile.ZIP_DEFLATED) as z:
  for name,fn in BUILD.items():
   n,data,svg=save(name,fn());names.append(n)
   with Image.open(io.BytesIO(data)) as im:im.load();assert im.size==(1024,1536)
   z.writestr(n,data);z.writestr('sources/'+name+'.svg',svg)
  for n in ['build_u05.py','build_diagrams.py','build_remaining.py']:z.write(SRC/n,'sources/'+n)
 temp=ROOT/'vector-assets.zip.tmp';temp.write_bytes(buffer.getvalue());temp.replace(ROOT/'vector-assets.zip')
 with zipfile.ZipFile(ROOT/'vector-assets.zip') as z:
  assert z.testzip() is None
  for n in names:
   with Image.open(io.BytesIO(z.read(n))) as im:im.load();assert im.size==(1024,1536)
 (ROOT/'vectors.json').write_text(json.dumps(names,indent=2));print('Exported',len(names),'verified scenes')
