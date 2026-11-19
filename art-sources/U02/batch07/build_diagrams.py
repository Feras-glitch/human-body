from pathlib import Path
O=Path(__file__).parent
CREAM='#FFF6E3'; INK='#775C48'; BONE='#F4E5C9'
def path(d,f='none',st=INK,w=5,extra=''):return f'<path d="{d}" fill="{f}" stroke="{st}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round" {extra}/>'
def circ(x,y,r,f,st=INK,w=4):return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{f}" stroke="{st}" stroke-width="{w}"/>'
def ell(x,y,rx,ry,f,st=INK,w=4):return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{f}" stroke="{st}" stroke-width="{w}"/>'
def rect(x,y,w,h,f,rx=24):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{f}" stroke="#DFCDB2" stroke-width="3"/>'
def group(s,x=0,y=0,k=1):return f'<g transform="translate({x} {y}) scale({k})">{s}</g>'
def arrow(d,c='#2BB3A3',w=7):return path(d,'none',c,w,f'marker-end="url(#{c[1:]})"')
def mascot(x=800,y=1330,k=.65):
 s=path('M0 65 L0 170','none','#98663B',35)+circ(0,0,83,'#FFC93C')+circ(0,0,68,'#BFE7FF','#AB7F31')
 for a in [-24,24]:s+=ell(a,-9,15,21,'white','none',0)+ell(a+3,-7,7,13,'#5B3F33','none',0)+circ(a+5,-12,3,'white','none',0)
 s+=path('M-23 30 Q0 57 23 30 Z','#9F554B',INK,3)+path('M-75 30 Q-112 15 -117 -12 M75 30 Q110 50 125 22','none','#6C6254',9)+circ(-117,-19,12,'#FFF7DF')+circ(126,15,12,'#FFF7DF')
 return group(s,x,y,k)
def doc(name,body):
 defs='<defs>'
 for c in ['2BB3A3','E36660','5B97BC','E8B744']:
  defs+=f'<marker id="{c}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1 L9 5 L1 9" fill="none" stroke="#{c}" stroke-width="2"/></marker>'
 defs+='</defs>'
 (O/(name+'.svg')).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1536" viewBox="0 0 1024 1536">{defs}<rect width="1024" height="1536" fill="{CREAM}"/>{body}</svg>')
def tendon(d,highlight=False):
 return path(d,'none','#DBC990',20 if highlight else 17)+path(d,'none','#FFF9E9',10)
def bones(bent=True):
 s=path('M-100 -40 Q-35 -75 0 -27 L-10 105 L-90 205 Q-115 99 -100 -40Z',BONE)
 s+=path('M-11 48 C-23 120 -23 260 -23 349 Q-58 395 -23 415 Q0 428 23 408 Q56 385 24 350 L22 48Z',BONE)+circ(5,14,45,BONE)
 s+=path('M-36 382 Q-1 361 33 385 M-31 405 Q0 425 31 402','none','#B4D7DC',9)
 if bent:
  s+=path('M-35 369 Q-58 412 -26 440 Q-5 453 23 427 L312 238 Q337 240 348 223 L339 206 L308 209 L0 407 Q-17 419 -24 400Z',BONE)
  s+=path('M49 390 Q59 378 70 389 L341 172 Q354 166 367 179 L372 197 Q358 211 342 205 L62 417 Q43 423 40 408Z',BONE)
  s+=ell(52,389,20,12,BONE)
 else:
  s+=path('M-35 369 Q-58 412 -26 441 L-32 758 Q-52 782 -28 795 L-5 793 Q13 779 -5 758 L10 429 Q-17 419 -24 400Z',BONE)
  s+=path('M49 390 Q70 378 76 400 L70 752 Q97 775 70 795 L43 795 Q20 777 41 752 L41 418Z',BONE)+ell(55,391,20,12,BONE)
 return s
def muscles(bent=True,high=False,face=False):
 s=bones(bent)
 # Two biceps heads originate on the scapular region; distal tendon ends on proximal radius.
 s+=tendon('M10 -65 Q48 30 63 111 M-10 -80 Q84 30 73 111',high)
 if bent:
  d='M65 110 C145 143 154 251 73 316 C28 280 19 165 65 110Z';col='#E66C64'
  back='M-84 40 C-119 118 -120 283 -47 367 C-33 280 -46 132 -84 40Z';bc='#EAB4AA'
  ins=(88,375)
 else:
  d='M66 80 C105 150 112 279 66 359 C39 277 37 153 66 80Z';col='#EAB4AA'
  back='M-75 122 C-149 150 -141 256 -54 312 C-15 257 -16 166 -75 122Z';bc='#E66C64'
  ins=(58,460)
 s+=path(back,bc,'#B97770',4)
 s+=tendon('M-84 39 L-86 -13 M-78 77 L-18 99 M-86 105 L-18 156',high)
 s+=tendon(('M-47 367 Q-29 399 -26 430' if bent else 'M-54 312 Q-35 373 -26 430'),high)
 s+=path(d,col,'#AC5E5A',4)
 if bent:s+=tendon('M73 316 Q75 349 88 375',high)
 else:s+=tendon('M66 359 L58 460',high)
 for j in range(4):
  x=51+j*13
  s+=path(f'M{x} {145 if bent else 115} Q{x+38} 218 {x+8} {285 if bent else 324}','none','#F8C3B5',2)
 if face:
  for x in [63,99]:s+=ell(x,208,10,15,'white','none',0)+ell(x+2,210,5,9,'#5E3C35','none',0)
  s+=path('M62 243 Q83 269 106 242','none','#74463E',5)
 return s
# Muscle and tendon overview: one large cutaway, separate resting/contracted comparison.
s=rect(52,55,920,835,'#FFF0DE')+group(muscles(True),370,165,1.37)
s+=arrow('M515 654 Q526 603 523 559','#E36660')
for x,contract in [(80,False),(536,True)]:
 s+=rect(x,937,408,410,'#EAF4EE')
 if contract:d=f'M{x+204} 1010 C{x+303} 1050 {x+304} 1200 {x+204} 1250 C{x+106} 1200 {x+104} 1050 {x+204} 1010Z'
 else:d=f'M{x+204} 978 C{x+247} 1050 {x+247} 1215 {x+204} 1310 C{x+161} 1215 {x+161} 1050 {x+204} 978Z'
 s+=path(d,'#E68476','#A7665C',4)
 s+=tendon(f'M{x+204} {1010 if contract else 978} L{x+204} {970 if contract else 950}')
 s+=tendon(f'M{x+204} {1250 if contract else 1310} L{x+204} {1290 if contract else 1330}')
s+=mascot(867,1430,.45)
doc('U02.L03-E1',s)
# Antagonistic pair, stacked to retain legibility on a phone.
s=rect(48,48,928,666,'#FFEDE2')+group(muscles(True),346,112,1.18)+arrow('M450 552 L434 487','#E36660')
s+=rect(48,752,928,726,'#E8F3F3')+group(muscles(False),520,806,.79)+arrow('M477 1100 L463 1027','#E36660')+mascot(815,1360,.57)
doc('U02.L03-E2',s)
# White/yellow tendons and blue bone-to-bone collateral bands, distinctly separate.
s=rect(50,60,924,1230,'#FFF0DF')+group(muscles(True,True),338,260,1.65)
s+=group(path('M-25 345 Q-57 393 -20 433','none','#8BC4DB',16)+path('M30 353 Q80 375 53 414','none','#8BC4DB',14),338,260,1.65)
s+=mascot(790,1370,.66)
# Color samples retain the distinct mapping without labels.
s+=path('M117 1355 Q215 1318 293 1363','none','#E6BE51',16)+path('M113 1420 Q207 1383 288 1422','none','#8BC4DB',16)
doc('U02.L03-E4',s)
# Elbow comparison to door hinge and separate forearm rotation inset.
s=rect(48,52,928,905,'#FFF1DE')+group(bones(True),340,175,1.45)+arrow('M429 823 Q570 888 686 709')
s+=rect(48,997,438,445,'#E7F2EC')+path('M103 1049 L206 1049 L206 1360 L103 1360Z','#B98752')+path('M213 1078 L413 1134 L413 1370 L213 1344Z','#E6BC83')
for y in [1124,1280]:s+=rect(177,y,68,30,'#B59B67',4)+circ(209,y+15,6,'#F9E5A9')
s+=arrow('M294 1410 Q401 1401 447 1339')
s+=rect(527,997,449,445,'#EAF1FB')
for x in [661,765]:s+=path(f'M{x} 1105 L{x-14} 1320','none',INK,28)+path(f'M{x} 1105 L{x-14} 1320','none',BONE,18)
s+=ell(661,1093,24,13,BONE)+arrow('M622 1071 Q713 1019 802 1075','#5B97BC')+arrow('M808 1341 Q720 1403 626 1352','#5B97BC')
s+=mascot(900,893,.39)
doc('U02.L02-E2',s)
# Ball and shallow socket. Humeral ball remains seated in lateral scapular glenoid.
def shoulder():
 s=path('M-130 -110 Q-37 -151 33 -72 L7 60 L-104 209 Q-164 102 -130 -110Z',BONE)
 s+=path('M27 -78 Q86 -40 33 45','none','#B1D6DA',19)
 s+=path('M63 51 L78 332 Q104 370 74 383 L35 380 Q12 366 36 331 L25 57Z',BONE)+circ(56,0,64,BONE)
 s+=path('M34 -57 Q101 -56 112 0','none','#B1D6DA',12)
 return s
s=rect(48,58,928,755,'#EAF2EB')+group(shoulder(),374,253,1.1)
s+=arrow('M281 184 Q367 113 465 153')+arrow('M499 258 Q536 370 488 454')
s+=ell(771,475,108,27,'#C5D8BD')+circ(770,407,76,'#FFC93C')+path('M663 424 Q770 554 878 424','none','#B5966F',22)
s+=rect(48,854,928,614,'#FFF0E1')
# Smooth external cranium and thin closed sutures: no gaps.
s+=path('M397 978 C272 968 234 1065 270 1164 L284 1227 L350 1260 L365 1325 L442 1325 L467 1269 L524 1249 L525 1211 L554 1195 L523 1166 C552 1053 500 984 397 978Z',BONE)
s+=path('M332 1001 l7 24 -8 24 11 23 -6 25 11 27 -8 28 M276 1093 l24 -7 19 10 20 -6 22 8 22 -10 24 8 19 -9 22 6','none','#BEA88D',3)
s+=mascot(779,1220,.83)
doc('U02.L02-E3',s)
# Knee sagittal simplification, cartilage, joint space and ligaments.
s=rect(48,52,928,1070,'#FFF0DE')
s+=path('M412 155 L527 155 L526 530 Q609 593 574 681 Q550 732 476 716 Q408 740 380 684 Q348 623 408 541Z',BONE)
s+=path('M390 752 Q479 724 575 754 L553 820 L549 1058 L433 1058 L428 821Z',BONE)
s+=path('M367 801 L382 1061','none',INK,30)+path('M367 801 L382 1061','none',BONE,19)
s+=path('M392 681 Q425 726 474 703 Q535 729 571 681','none','#A8D2DD',18)
s+=path('M398 753 Q479 730 565 753','none','#A8D2DD',17)
s+=path('M411 733 Q481 721 550 733','none','#D4EFF0',9)
s+=path('M386 614 Q350 716 405 802 M571 615 Q610 723 565 815','none','#C0D5C7',23)
s+=path('M434 679 L527 785 M528 681 L436 786','none','#D7DFCD',16)
s+=ell(635,638,27,49,BONE)
s+=path('M632 521 Q650 612 626 689 L574 799','none','#EAD8B0',15)
s+=rect(48,1164,440,310,'#E0EFE4')+path('M216 1210 L216 1320 L374 1400','none','#E4AE8D',50)+arrow('M290 1272 Q362 1280 381 1345')
s+=rect(530,1164,446,310,'#E8E6E0')+path('M701 1210 L701 1317 L838 1362','none','#C5C0B4',48)+path('M679 1280 L728 1335','none','#B7B4A9',9)+mascot(901,1360,.44)
doc('U02.L02-E4',s)
print('Created six vector diagrams')
# Spine: discs between vertebral bodies; cord enclosed by posterior arches.
import math
s=rect(48,52,556,1378,'#FFF0E0')+rect(645,52,331,850,'#E9F3F0')
xs=[]
for j in range(15):
 y=170+j*68;x=270+43*math.sin(j/3.1);xs.append((x,y))
 if j<14:s+=rect(x-48,y+43,108,19,'#B4D7DE',9)
 s+=rect(x-50,y,112,45,BONE,13)
 s+=ell(x+103,y+21,58,27,BONE)+ell(x+103,y+21,30,13,CREAM,'#C4AD8F',3)
 s+=path(f'M{x+146} {y+17} l32 8 -32 8Z',BONE,INK,3)
s+=path('M'+ ' L'.join(f'{x+103} {y+21}' for x,y in xs[:11]),'none','#EAC66A',12)
for off in [-12,-6,0,6,12]:
 s+=path(f'M{xs[10][0]+103} {xs[10][1]+21} Q{xs[12][0]+103+off} {xs[12][1]+21} {xs[14][0]+103+off} {xs[14][1]+21}', 'none', '#EAC66A', 2.5)
s+=path('M299 1193 Q332 1170 374 1194 L340 1335 Q325 1356 310 1330Z',BONE)
for y in [1214,1243,1272]:s+=path(f'M304 {y} Q333 {y+9} 359 {y}','none','#BEA88D',3)
# Atlas ring around axis dens, seen obliquely as an enlarged conceptual joint.
s+=ell(807,463,114,55,BONE)+ell(807,463,76,29,CREAM)
s+=path('M749 583 L749 652 L869 652 L869 583 Q844 554 837 554 L837 474 Q837 439 808 439 Q779 439 779 474 L779 554 Q760 560 749 583Z',BONE)
s+=ell(807,463,25,15,BONE)+arrow('M710 382 Q815 326 907 395','#5B97BC')
s+=path('M736 192 Q700 129 746 99 Q789 66 832 99 Q874 124 861 171 L878 191 L857 205 L855 232 L818 245 L805 274 L760 267Z','#EFBD99')
s+=arrow('M724 293 Q788 316 856 279')+mascot(795,1175,.88)
doc('U02.L02-E5',s)
# Shoulder mobility / elbow congruence: identical schema to the individual diagrams.
s=rect(48,54,448,1356,'#E9F4EF')+rect(528,54,448,1356,'#FFF0E1')
s+=group(shoulder(),247,380,.91)+arrow('M112 243 Q230 177 348 232')+arrow('M359 400 Q393 504 351 586')
s+=ell(250,785,135,36,'#D5E3CE')
s+=group(bones(True),699,450,.61)+arrow('M706 772 Q785 818 874 736')
# A small supported push-up story silhouette above the elbow comparison.
s+=path('M614 210 L800 262 L900 312','none','#71B9CF',36)
s+=path('M674 230 L662 349 L624 350 M694 237 L713 350 L748 350','none','#E8B08C',18)
s+=path('M800 262 L898 318 L925 319','none','#456C88',26)
s+=circ(613,205,34,'#E9B592')+path('M583 190 Q601 160 637 188','none','#614538',14)
s+=path('M590 364 L938 364','none','#D2C6AE',5)+mascot(509,1260,.64)
doc('U02.L02-E6',s)
# Friendly biceps character preserves tendon-to-radius insertion and posterior partner.
s=rect(50,60,924,1292,'#FFF0DF')+group(muscles(True,False,True),335,248,1.65)
s+=arrow('M480 862 L471 793','#E36660')+mascot(828,1403,.48)
doc('U02.L03-letter',s)
# Body/model analogy in three cards, one concept per card.
def model(x,y,k=.7,strings=False):
 t=rect(-33,-150,66,235,'#F5E6CB',10)+f'<g transform="translate(0 52) rotate(-65)">{rect(-33,-33,66,220,"#F5E6CB",10)}</g>'+circ(0,52,17,'#E8BA4B')
 if strings:t+=path('M31 -118 L84 54','none','#E36E62',10)+path('M-31 -118 C-136 67 -9 241 129 112','none','#619ECA',10)
 return group(t,x,y,k)
s=''
for y,c in [(54,'#FFF0DD'),(528,'#E8F2EE'),(1002,'#EAF1F9')]:s+=rect(48,y,928,440,c)
s+=path('M240 141 Q218 111 193 132 Q161 161 198 187 L212 360 Q188 389 214 410 Q238 430 258 410 Q286 428 305 399 Q322 377 288 354 L278 188 Q307 171 292 145 Q276 119 250 143Z',BONE)
s+=rect(668,142,100,260,'#F1DFC0',14)
s+=group(bones(True),244,565,.69)+arrow('M258 862 Q343 921 425 835')+model(710,712,.95)+arrow('M750 913 Q822 910 869 850')
s+=group(muscles(True),237,1039,.64)+model(716,1182,.95,True)+mascot(884,1452,.36)
doc('U02.L04-E1',s)
print('Added four vector diagrams')
