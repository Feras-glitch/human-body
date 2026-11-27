/* محرّك دروس «رحلة داخل جسمي» v2 — يُحمَّل بعد تعريف LESSON وTERMS، وقبل تعريف SCENES ثم boot() */

/* ============================ البيانات ============================ */
/* الآية بخط مصحف المدينة، الإصدار الثاني (QPC V2): خط لكل صفحة (fonts/qcf2/)، ورمز لكل كلمة ولكل علامة وقف ولرقم
   الآية، كما في المصحف المطبوع. التظليل بأرقام الكلمات نفسها (qpc2.words يربطها بالرموز). وإن تعذّر خط الصفحة
   عُرضت الآية بخط KFGQPC Hafs Smart (mushafSmart)، وإن تعذّر هو أيضاً فنصها العثماني (mushafFallback) */
const mushafSmart = (v, hl) => { const w=v.smart.split(' '); if(hl){ const [a,b]=hl; for(let i=a;i<=b&&i<w.length;i++) w[i]='<mark>'+w[i]+'</mark>'; } return w.join(' ') + (v.ayah_mark?' '+v.ayah_mark:''); };
const qcfFamily = p => 'QCF2_' + String(p).padStart(3,'0');
const mushaf = (v, hl) => { if(!v.qpc2) return mushafSmart(v, hl); const g=v.qpc2.glyphs.split(' ');
  if(hl){ const [a,b]=hl; for(let i=a;i<=b&&i<v.qpc2.words.length;i++){ const j=v.qpc2.words[i]; g[j]='<mark>'+g[j]+'</mark>'; } }
  return `<span class="qcf2" style="font-family:'${qcfFamily(v.qpc2.page)}','KFGQPC Hafs Smart'">${g.join(' ')}</span>`; };
const QURAN = /*__QURAN__*/{"17:36":{"surah_ar":"الإسراء","surah_no":17,"ayah":36,"page":285,"smart":"               ","ayah_mark":"","emlaey":"ولا تقف ما ليس لك به علم إن السمع والبصر والفؤاد كل أولئك كان عنه مسئولا","text":"وَلَا تَقْفُ مَا لَيْسَ لَكَ بِهِۦ عِلْمٌ ۚ إِنَّ ٱلسَّمْعَ وَٱلْبَصَرَ وَٱلْفُؤَادَ كُلُّ أُو۟لَـٰٓئِكَ كَانَ عَنْهُ مَسْـُٔولًۭا","source":"مجمع الملك فهد — KFGQPC Hafs Smart v8 (2022) للعرض؛ Tanzil Uthmani v1.1 للبحث والقراءة الآلية","checked_by":"","checked_on":"","qpc2":{"page":285,"glyphs":"ﲾ ﲿ ﳀ ﳁ ﳂ ﳃ ﳄ ﳅ ﳆ ﳇ ﳈ ﳉ ﳊ ﳋ ﳌ ﳍ ﳎ ﳏ","words":[0,1,2,3,4,5,6,8,9,10,11,12,13,14,15,16]}},"49:13":{"surah_ar":"الحجرات","surah_no":49,"ayah":13,"page":517,"smart":"                   ","ayah_mark":"","emlaey":"ياأيها الناس إنا خلقناكم من ذكر وأنثى وجعلناكم شعوبا وقبائل لتعارفوا إن أكرمكم عند الله أتقاكم إن الله عليم خبير","text":"يَـٰٓأَيُّهَا ٱلنَّاسُ إِنَّا خَلَقْنَـٰكُم مِّن ذَكَرٍۢ وَأُنثَىٰ وَجَعَلْنَـٰكُمْ شُعُوبًۭا وَقَبَآئِلَ لِتَعَارَفُوٓا۟ ۚ إِنَّ أَكْرَمَكُمْ عِندَ ٱللَّهِ أَتْقَىٰكُمْ ۚ إِنَّ ٱللَّهَ عَلِيمٌ خَبِيرٌۭ","source":"مجمع الملك فهد — KFGQPC Hafs Smart v8 (2022) للعرض؛ Tanzil Uthmani v1.1 للبحث والقراءة الآلية","checked_by":"","checked_on":"","qpc2":{"page":517,"glyphs":"ﱥ ﱦ ﱧ ﱨ ﱩ ﱪ ﱫ ﱬ ﱭ ﱮ ﱯ ﱰ ﱱ ﱲ ﱳ ﱴ ﱵ ﱶ ﱷ ﱸ ﱹ ﱺ ﱻ","words":[0,1,2,3,4,5,6,7,8,9,10,12,13,14,15,16,18,19,20,21]}},"30:22":{"surah_ar":"الروم","surah_no":30,"ayah":22,"page":406,"smart":"            ","ayah_mark":"","emlaey":"ومن آياته خلق السموات والأرض واختلاف ألسنتكم وألوانكم إن في ذلك لآيات للعالمين","text":"وَمِنْ ءَايَـٰتِهِۦ خَلْقُ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضِ وَٱخْتِلَـٰفُ أَلْسِنَتِكُمْ وَأَلْوَٰنِكُمْ ۚ إِنَّ فِى ذَٰلِكَ لَـَٔايَـٰتٍۢ لِّلْعَـٰلِمِينَ","source":"مجمع الملك فهد — KFGQPC Hafs Smart v8 (2022) للعرض؛ Tanzil Uthmani v1.1 للبحث والقراءة الآلية","checked_by":"","checked_on":"","qpc2":{"page":406,"glyphs":"ﲏ ﲐ ﲑ ﲒ ﲓ ﲔ ﲕ ﲖ ﲗ ﲘ ﲙ ﲚ ﲛ ﲜ ﲝ","words":[0,1,2,3,4,5,6,7,9,10,11,12,13]}},"49:6":{"surah_ar":"الحجرات","surah_no":49,"ayah":6,"page":516,"smart":"                ","ayah_mark":"","emlaey":"ياأيها الذين آمنوا إن جاءكم فاسق بنبإ فتبينوا أن تصيبوا قوما بجهالة فتصبحوا على ما فعلتم نادمين","text":"يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ إِن جَآءَكُمْ فَاسِقٌۢ بِنَبَإٍۢ فَتَبَيَّنُوٓا۟ أَن تُصِيبُوا۟ قَوْمًۢا بِجَهَـٰلَةٍۢ فَتُصْبِحُوا۟ عَلَىٰ مَا فَعَلْتُمْ نَـٰدِمِينَ","source":"مجمع الملك فهد — KFGQPC Hafs Smart v8 (2022) للعرض؛ Tanzil Uthmani v1.1 للبحث والقراءة الآلية","checked_by":"","checked_on":"","qpc2":{"page":516,"glyphs":"ﱏ ﱐ ﱑ ﱒ ﱓ ﱔ ﱕ ﱖ ﱗ ﱘ ﱙ ﱚ ﱛ ﱜ ﱝ ﱞ ﱟ ﱠ","words":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]}},"95:4":{"surah_ar":"التين","surah_no":95,"ayah":4,"page":597,"smart":"     ","ayah_mark":"","emlaey":"لقد خلقنا الإنسان في أحسن تقويم","text":"لَقَدْ خَلَقْنَا ٱلْإِنسَـٰنَ فِىٓ أَحْسَنِ تَقْوِيمٍۢ","source":"مجمع الملك فهد — KFGQPC Hafs Smart v8 (2022) للعرض؛ Tanzil Uthmani v1.1 للبحث والقراءة الآلية","checked_by":"","checked_on":"","qpc2":{"page":597,"glyphs":"ﱥ ﱦ ﱧ ﱨ ﱩ ﱪ ﱫ","words":[0,1,2,3,4,5]}},"67:2":{"surah_ar":"الملك","surah_no":67,"ayah":2,"page":562,"smart":"          ","ayah_mark":"","emlaey":"الذي خلق الموت والحياة ليبلوكم أيكم أحسن عملا وهو العزيز الغفور","text":"ٱلَّذِى خَلَقَ ٱلْمَوْتَ وَٱلْحَيَوٰةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًۭا ۚ وَهُوَ ٱلْعَزِيزُ ٱلْغَفُورُ","source":"مجمع الملك فهد — KFGQPC Hafs Smart v8 (2022) للعرض؛ Tanzil Uthmani v1.1 للبحث والقراءة الآلية","checked_by":"","checked_on":"","qpc2":{"page":562,"glyphs":"ﱋ ﱌ ﱍ ﱎ ﱏ ﱐ ﱑ ﱒ ﱓ ﱔ ﱕ ﱖ ﱗ","words":[0,1,2,3,4,5,6,7,9,10,11]}},"5:32":{"surah_ar":"المائدة","surah_no":5,"ayah":32,"page":113,"smart":"                                       ","ayah_mark":"","emlaey":"من أجل ذلك كتبنا على بني إسرائيل أنه من قتل نفسا بغير نفس أو فساد في الأرض فكأنما قتل الناس جميعا ومن أحياها فكأنما أحيا الناس جميعا ولقد جاءتهم رسلنا بالبينات ثم إن كثيرا منهم بعد ذلك في الأرض لمسرفون","text":"مِنْ أَجْلِ ذَٰلِكَ كَتَبْنَا عَلَىٰ بَنِىٓ إِسْرَٰٓءِيلَ أَنَّهُۥ مَن قَتَلَ نَفْسًۢا بِغَيْرِ نَفْسٍ أَوْ فَسَادٍۢ فِى ٱلْأَرْضِ فَكَأَنَّمَا قَتَلَ ٱلنَّاسَ جَمِيعًۭا وَمَنْ أَحْيَاهَا فَكَأَنَّمَآ أَحْيَا ٱلنَّاسَ جَمِيعًۭا ۚ وَلَقَدْ جَآءَتْهُمْ رُسُلُنَا بِٱلْبَيِّنَـٰتِ ثُمَّ إِنَّ كَثِيرًۭا مِّنْهُم بَعْدَ ذَٰلِكَ فِى ٱلْأَرْضِ لَمُسْرِفُونَ","source":"مجمع الملك فهد — KFGQPC Hafs Smart v8 (2022) للعرض؛ Tanzil Uthmani v1.1 للبحث والقراءة الآلية","checked_by":"","checked_on":"","qpc2":{"page":113,"glyphs":"ﱁ ﱂ ﱃ ﱄ ﱅ ﱆ ﱇ ﱈ ﱉ ﱊ ﱋ ﱌ ﱍ ﱎ ﱏ ﱐ ﱑ ﱒ ﱓ ﱔ ﱕ ﱖ ﱗ ﱘ ﱙ ﱚ ﱛ ﱜ ﱝ ﱞ ﱟ ﱠ ﱡ ﱢ ﱣ ﱤ ﱥ ﱦ ﱧ ﱨ ﱩ ﱪ","words":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,28,29,30,31,32,33,34,35,36,37,38,39,40]}},"51:21":{"surah_ar":"الذاريات","surah_no":51,"ayah":21,"page":521,"smart":"   ","ayah_mark":"","emlaey":"وفي أنفسكم أفلا تبصرون","text":"وَفِىٓ أَنفُسِكُمْ ۚ أَفَلَا تُبْصِرُونَ","source":"مجمع الملك فهد — KFGQPC Hafs Smart v8 (2022) للعرض؛ Tanzil Uthmani v1.1 للبحث والقراءة الآلية","checked_by":"","checked_on":"","qpc2":{"page":521,"glyphs":"ﲒ ﲓ ﲔ ﲕ ﲖ ﲗ","words":[0,1,3,4]}},"49:11":{"surah_ar":"الحجرات","surah_no":49,"ayah":11,"page":516,"smart":"                                      ","ayah_mark":"","emlaey":"ياأيها الذين آمنوا لا يسخر قوم من قوم عسى أن يكونوا خيرا منهم ولا نساء من نساء عسى أن يكن خيرا منهن ولا تلمزوا أنفسكم ولا تنابزوا بالألقاب بئس الاسم الفسوق بعد الإيمان ومن لم يتب فأولئك هم الظالمون","text":"يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ لَا يَسْخَرْ قَوْمٌۭ مِّن قَوْمٍ عَسَىٰٓ أَن يَكُونُوا۟ خَيْرًۭا مِّنْهُمْ وَلَا نِسَآءٌۭ مِّن نِّسَآءٍ عَسَىٰٓ أَن يَكُنَّ خَيْرًۭا مِّنْهُنَّ ۖ وَلَا تَلْمِزُوٓا۟ أَنفُسَكُمْ وَلَا تَنَابَزُوا۟ بِٱلْأَلْقَـٰبِ ۖ بِئْسَ ٱلِٱسْمُ ٱلْفُسُوقُ بَعْدَ ٱلْإِيمَـٰنِ ۚ وَمَن لَّمْ يَتُبْ فَأُو۟لَـٰٓئِكَ هُمُ ٱلظَّـٰلِمُونَ","source":"مجمع الملك فهد — KFGQPC Hafs Smart v8 (2022) للعرض؛ Tanzil Uthmani v1.1 للبحث والقراءة الآلية","checked_by":"","checked_on":"","qpc2":{"page":516,"glyphs":"ﲷ ﲸ ﲹ ﲺ ﲻ ﲼ ﲽ ﲾ ﲿ ﳀ ﳁ ﳂ ﳃ ﳄ ﳅ ﳆ ﳇ ﳈ ﳉ ﳊ ﳋ ﳌ ﳍ ﳎ ﳏ ﳐ ﳑ ﳒ ﳓ ﳔ ﳕ ﳖ ﳗ ﳘ ﳙ ﳚ ﳛ ﳜ ﳝ ﳞ ﳟ ﳠ ﳡ","words":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,23,24,25,26,27,28,30,31,32,33,34,36,37,38,39,40,41]}},"11:61":{"surah_ar":"هود","surah_no":11,"ayah":61,"page":228,"smart":"                          ","ayah_mark":"","emlaey":"وإلى ثمود أخاهم صالحا قال ياقوم اعبدوا الله ما لكم من إله غيره هو أنشأكم من الأرض واستعمركم فيها فاستغفروه ثم توبوا إليه إن ربي قريب مجيب","text":"۞ وَإِلَىٰ ثَمُودَ أَخَاهُمْ صَـٰلِحًۭا ۚ قَالَ يَـٰقَوْمِ ٱعْبُدُوا۟ ٱللَّهَ مَا لَكُم مِّنْ إِلَـٰهٍ غَيْرُهُۥ ۖ هُوَ أَنشَأَكُم مِّنَ ٱلْأَرْضِ وَٱسْتَعْمَرَكُمْ فِيهَا فَٱسْتَغْفِرُوهُ ثُمَّ تُوبُوٓا۟ إِلَيْهِ ۚ إِنَّ رَبِّى قَرِيبٌۭ مُّجِيبٌۭ","source":"مجمع الملك فهد — KFGQPC Hafs Smart v8 (2022) للعرض؛ Tanzil Uthmani v1.1 للبحث والقراءة الآلية","checked_by":"","checked_on":"","qpc2":{"page":228,"glyphs":"ﲺ ﲻ ﲼ ﲽ ﲾ ﲿ ﳀ ﳁ ﳂ ﳃ ﳄ ﳅ ﳆ ﳇ ﳈ ﳉ ﳊ ﳋ ﳌ ﳍ ﳎ ﳏ ﳐ ﳑ ﳒ ﳓ ﳔ ﳕ ﳖ ﳗ ﳘ ﳙ","words":[1,2,3,4,6,7,8,9,10,11,12,13,14,16,17,18,19,20,21,22,23,24,25,27,28,29,30]}},"16:18":{"surah_ar":"النحل","surah_no":16,"ayah":18,"page":269,"smart":"         ","ayah_mark":"","emlaey":"وإن تعدوا نعمة الله لا تحصوها إن الله لغفور رحيم","text":"وَإِن تَعُدُّوا۟ نِعْمَةَ ٱللَّهِ لَا تُحْصُوهَآ ۗ إِنَّ ٱللَّهَ لَغَفُورٌۭ رَّحِيمٌۭ","source":"مجمع الملك فهد — KFGQPC Hafs Smart v8 (2022) للعرض؛ Tanzil Uthmani v1.1 للبحث والقراءة الآلية","checked_by":"","checked_on":"","qpc2":{"page":269,"glyphs":"ﱜ ﱝ ﱞ ﱟ ﱠ ﱡ ﱢ ﱣ ﱤ ﱥ ﱦ ﱧ","words":[0,1,2,3,4,5,7,8,9,10]}},"3:191":{"surah_ar":"آل عمران","surah_no":3,"ayah":191,"page":75,"smart":"                    ","ayah_mark":"","emlaey":"الذين يذكرون الله قياما وقعودا وعلى جنوبهم ويتفكرون في خلق السموات والأرض ربنا ما خلقت هذا باطلا سبحانك فقنا عذاب النار","text":"ٱلَّذِينَ يَذْكُرُونَ ٱللَّهَ قِيَـٰمًۭا وَقُعُودًۭا وَعَلَىٰ جُنُوبِهِمْ وَيَتَفَكَّرُونَ فِى خَلْقِ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضِ رَبَّنَا مَا خَلَقْتَ هَـٰذَا بَـٰطِلًۭا سُبْحَـٰنَكَ فَقِنَا عَذَابَ ٱلنَّارِ","source":"مجمع الملك فهد — KFGQPC Hafs Smart v8 (2022) للعرض؛ Tanzil Uthmani v1.1 للبحث والقراءة الآلية","checked_by":"","checked_on":"","qpc2":{"page":75,"glyphs":"ﲅ ﲆ ﲇ ﲈ ﲉ ﲊ ﲋ ﲌ ﲍ ﲎ ﲏ ﲐ ﲑ ﲒ ﲓ ﲔ ﲕ ﲖ ﲗ ﲘ ﲙ ﲚ","words":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]}},"2:172":{"surah_ar":"البقرة","surah_no":2,"ayah":172,"page":26,"smart":"             ","ayah_mark":"","emlaey":"ياأيها الذين آمنوا كلوا من طيبات ما رزقناكم واشكروا لله إن كنتم إياه تعبدون","text":"يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ كُلُوا۟ مِن طَيِّبَـٰتِ مَا رَزَقْنَـٰكُمْ وَٱشْكُرُوا۟ لِلَّهِ إِن كُنتُمْ إِيَّاهُ تَعْبُدُونَ","source":"مجمع الملك فهد — KFGQPC Hafs Smart v8 (2022) للعرض؛ Tanzil Uthmani v1.1 للبحث والقراءة الآلية","checked_by":"","checked_on":"","qpc2":{"page":26,"glyphs":"ﱭ ﱮ ﱯ ﱰ ﱱ ﱲ ﱳ ﱴ ﱵ ﱶ ﱷ ﱸ ﱹ ﱺ ﱻ","words":[0,1,2,3,4,5,6,7,8,9,10,11,12,13]}},"7:31":{"surah_ar":"الأعراف","surah_no":7,"ayah":31,"page":154,"smart":"              ","ayah_mark":"","emlaey":"يابني آدم خذوا زينتكم عند كل مسجد وكلوا واشربوا ولا تسرفوا إنه لا يحب المسرفين","text":"۞ يَـٰبَنِىٓ ءَادَمَ خُذُوا۟ زِينَتَكُمْ عِندَ كُلِّ مَسْجِدٍۢ وَكُلُوا۟ وَٱشْرَبُوا۟ وَلَا تُسْرِفُوٓا۟ ۚ إِنَّهُۥ لَا يُحِبُّ ٱلْمُسْرِفِينَ","source":"مجمع الملك فهد — KFGQPC Hafs Smart v8 (2022) للعرض؛ Tanzil Uthmani v1.1 للبحث والقراءة الآلية","checked_by":"","checked_on":"","qpc2":{"page":154,"glyphs":"ﱁ ﱂ ﱃ ﱄ ﱅ ﱆ ﱇ ﱈ ﱉ ﱊ ﱋ ﱌ ﱍ ﱎ ﱏ ﱐ ﱑ ﱒ","words":[1,2,3,4,5,6,7,8,9,10,11,13,14,15,16]}},"80:24":{"surah_ar":"عبس","surah_no":80,"ayah":24,"page":585,"smart":"   ","ayah_mark":"","emlaey":"فلينظر الإنسان إلى طعامه","text":"فَلْيَنظُرِ ٱلْإِنسَـٰنُ إِلَىٰ طَعَامِهِۦٓ","source":"مجمع الملك فهد — KFGQPC Hafs Smart v8 (2022) للعرض؛ Tanzil Uthmani v1.1 للبحث والقراءة الآلية","checked_by":"","checked_on":"","qpc2":{"page":585,"glyphs":"ﲢ ﲣ ﲤ ﲥ ﲦ","words":[0,1,2,3]}},"56:68":{"surah_ar":"الواقعة","surah_no":56,"ayah":68,"page":536,"smart":"   ","ayah_mark":"","emlaey":"أفرأيتم الماء الذي تشربون","text":"أَفَرَءَيْتُمُ ٱلْمَآءَ ٱلَّذِى تَشْرَبُونَ","source":"مجمع الملك فهد — KFGQPC Hafs Smart v8 (2022) للعرض؛ Tanzil Uthmani v1.1 للبحث والقراءة الآلية","checked_by":"","checked_on":"","qpc2":{"page":536,"glyphs":"ﲟ ﲠ ﲡ ﲢ ﲣ","words":[0,1,2,3]}},"16:78":{"surah_ar":"النحل","surah_no":16,"ayah":78,"page":275,"smart":"              ","ayah_mark":"","emlaey":"والله أخرجكم من بطون أمهاتكم لا تعلمون شيئا وجعل لكم السمع والأبصار والأفئدة لعلكم تشكرون","text":"وَٱللَّهُ أَخْرَجَكُم مِّنۢ بُطُونِ أُمَّهَـٰتِكُمْ لَا تَعْلَمُونَ شَيْـًۭٔا وَجَعَلَ لَكُمُ ٱلسَّمْعَ وَٱلْأَبْصَـٰرَ وَٱلْأَفْـِٔدَةَ ۙ لَعَلَّكُمْ تَشْكُرُونَ","source":"مجمع الملك فهد — KFGQPC Hafs Smart v8 (2022) للعرض؛ Tanzil Uthmani v1.1 للبحث والقراءة الآلية","checked_by":"","checked_on":"","qpc2":{"page":275,"glyphs":"ﲱ ﲲ ﲳ ﲴ ﲵ ﲶ ﲷ ﲸ ﲹ ﲺ ﲻ ﲼ ﲽ  ﲾ ﲿ ﳀ","words":[0,1,2,3,4,5,6,7,8,9,10,11,12,14,15]}},"78:9":{"surah_ar":"النبإ","surah_no":78,"ayah":9,"page":582,"smart":"  ","ayah_mark":"","emlaey":"وجعلنا نومكم سباتا","text":"وَجَعَلْنَا نَوْمَكُمْ سُبَاتًۭا","source":"مجمع الملك فهد — KFGQPC Hafs Smart v8 (2022) للعرض؛ Tanzil Uthmani v1.1 للبحث والقراءة الآلية","checked_by":"","checked_on":"","qpc2":{"page":582,"glyphs":"ﱟ ﱠ ﱡ ﱢ","words":[0,1,2]}},"24:58":{"surah_ar":"النور","surah_no":24,"ayah":58,"page":357,"smart":"                                                ","ayah_mark":"","emlaey":"ياأيها الذين آمنوا ليستأذنكم الذين ملكت أيمانكم والذين لم يبلغوا الحلم منكم ثلاث مرات من قبل صلاة الفجر وحين تضعون ثيابكم من الظهيرة ومن بعد صلاة العشاء ثلاث عورات لكم ليس عليكم ولا عليهم جناح بعدهن طوافون عليكم بعضكم على بعض كذلك يبين الله لكم الآيات والله عليم حكيم","text":"يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ لِيَسْتَـْٔذِنكُمُ ٱلَّذِينَ مَلَكَتْ أَيْمَـٰنُكُمْ وَٱلَّذِينَ لَمْ يَبْلُغُوا۟ ٱلْحُلُمَ مِنكُمْ ثَلَـٰثَ مَرَّٰتٍۢ ۚ مِّن قَبْلِ صَلَوٰةِ ٱلْفَجْرِ وَحِينَ تَضَعُونَ ثِيَابَكُم مِّنَ ٱلظَّهِيرَةِ وَمِنۢ بَعْدِ صَلَوٰةِ ٱلْعِشَآءِ ۚ ثَلَـٰثُ عَوْرَٰتٍۢ لَّكُمْ ۚ لَيْسَ عَلَيْكُمْ وَلَا عَلَيْهِمْ جُنَاحٌۢ بَعْدَهُنَّ ۚ طَوَّٰفُونَ عَلَيْكُم بَعْضُكُمْ عَلَىٰ بَعْضٍۢ ۚ كَذَٰلِكَ يُبَيِّنُ ٱللَّهُ لَكُمُ ٱلْـَٔايَـٰتِ ۗ وَٱللَّهُ عَلِيمٌ حَكِيمٌۭ","source":"مجمع الملك فهد — KFGQPC Hafs Smart v8 (2022) للعرض؛ Tanzil Uthmani v1.1 للبحث والقراءة الآلية","checked_by":"","checked_on":"","qpc2":{"page":357,"glyphs":"ﲜ ﲝ ﲞ ﲟ ﲠ ﲡ ﲢ ﲣ ﲤ ﲥ ﲦ ﲧ ﲨ ﲩ ﲪ ﲫ ﲬ ﲭ ﲮ ﲯ ﲰ ﲱ ﲲ ﲳ ﲴ ﲵ ﲶ ﲷ ﲸ ﲹ ﲺ ﲻ ﲼ ﲽ ﲾ ﲿ ﳀ ﳁ ﳂ ﳃ ﳄ ﳅ ﳆ ﳇ ﳈ ﳉ ﳊ ﳋ ﳌ ﳍ ﳎ ﳏ ﳐ ﳑ ﳒ ﳓ","words":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,15,16,17,18,19,20,21,22,23,24,25,26,27,29,30,31,33,34,35,36,37,38,40,41,42,43,44,46,47,48,49,50,52,53,54]}},"24:59":{"surah_ar":"النور","surah_no":24,"ayah":59,"page":358,"smart":"                  ","ayah_mark":"","emlaey":"وإذا بلغ الأطفال منكم الحلم فليستأذنوا كما استأذن الذين من قبلهم كذلك يبين الله لكم آياته والله عليم حكيم","text":"وَإِذَا بَلَغَ ٱلْأَطْفَـٰلُ مِنكُمُ ٱلْحُلُمَ فَلْيَسْتَـْٔذِنُوا۟ كَمَا ٱسْتَـْٔذَنَ ٱلَّذِينَ مِن قَبْلِهِمْ ۚ كَذَٰلِكَ يُبَيِّنُ ٱللَّهُ لَكُمْ ءَايَـٰتِهِۦ ۗ وَٱللَّهُ عَلِيمٌ حَكِيمٌۭ","source":"مجمع الملك فهد — KFGQPC Hafs Smart v8 (2022) للعرض؛ Tanzil Uthmani v1.1 للبحث والقراءة الآلية","checked_by":"","checked_on":"","qpc2":{"page":358,"glyphs":"ﱁ ﱂ ﱃ ﱄ ﱅ ﱆ ﱇ ﱈ ﱉ ﱊ ﱋ ﱌ ﱍ ﱎ ﱏ ﱐ ﱑ ﱒ ﱓ ﱔ ﱕ ﱖ","words":[0,1,2,3,4,5,6,7,8,9,10,12,13,14,15,16,18,19,20]}},"4:29":{"surah_ar":"النساء","surah_no":4,"ayah":29,"page":83,"smart":"                      ","ayah_mark":"","emlaey":"ياأيها الذين آمنوا لا تأكلوا أموالكم بينكم بالباطل إلا أن تكون تجارة عن تراض منكم ولا تقتلوا أنفسكم إن الله كان بكم رحيما","text":"يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ لَا تَأْكُلُوٓا۟ أَمْوَٰلَكُم بَيْنَكُم بِٱلْبَـٰطِلِ إِلَّآ أَن تَكُونَ تِجَـٰرَةً عَن تَرَاضٍۢ مِّنكُمْ ۚ وَلَا تَقْتُلُوٓا۟ أَنفُسَكُمْ ۚ إِنَّ ٱللَّهَ كَانَ بِكُمْ رَحِيمًۭا","source":"مجمع الملك فهد — KFGQPC Hafs Smart v8 (2022) للعرض؛ Tanzil Uthmani v1.1 للبحث والقراءة الآلية","checked_by":"","checked_on":"","qpc2":{"page":83,"glyphs":"ﱙ ﱚ ﱛ ﱜ ﱝ ﱞ ﱟ ﱠ ﱡ ﱢ ﱣ ﱤ ﱥ ﱦ ﱧ ﱨ ﱩ ﱪ ﱫ ﱬ ﱭ ﱮ ﱯ ﱰ ﱱ ﱲ","words":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,16,17,18,20,21,22,23,24]}}};
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
/* ما يكتبه الطفل في مربع واحد: 2000 محرف حدّاً (المراجعة 20، ن-9). مربعات الصفحة تحمل الحدّ نفسه (show) */
const TEXT_MAX=2000;
const store={get(k,d){try{const v=Atlas.storage.getItem('atlas:'+LESSON.id+':'+k);return v?JSON.parse(v):d}catch{return d}},set(k,v){try{ if(typeof v==='string' && /^open_/.test(k) && v.length>TEXT_MAX) v=v.slice(0,TEXT_MAX); if(k==='progress' && v && typeof v==='object') v=mergeProgress(v); Atlas.storage.setItem('atlas:'+LESSON.id+':'+k,JSON.stringify(v));return true}catch{Atlas.error('لم يُحفظ التغيير؛ تحقق من مساحة الجهاز وصدّر نسخة احتياطية');return false}}};
/* التقدّم يُكتب كاملاً من ذاكرة الصفحة؛ ونافذة أخرى للدرس نفسه قد سجّلت بنوداً بعد أن فُتحت هذه (المراجعة 20، ن-16).
   قبل كل كتابة: بند في المخزن لم تعرفه هذه الصفحة قط يُضم ولا يُمحى، و«أخطأ أول مرة» في المخزن لا يصير «أصاب أول مرة»،
   والخيارات الخاطئة المجرَّبة تُجمع. ما حذفته هذه الصفحة عمداً (إعادة الدرس أو جولة عودة جديدة) لا يُعاد. */
let progressSeen=null;
function mergeProgress(v){ let disk={}; try{ disk=JSON.parse(Atlas.storage.getItem('atlas:'+LESSON.id+':progress')||'{}')||{}; }catch{}
  if(!progressSeen) progressSeen=new Set();
  for(const id of Object.keys(disk)){ const d=disk[id]; if(!d||typeof d!=='object') continue;
    if(!(id in v)){ if(!progressSeen.has(id)) v[id]=d; continue; }
    const m=v[id]; if(!m||typeof m!=='object') continue;
    if(d.firstAttempt===false && m.firstAttempt===true){ m.firstAttempt=false; m.ok=false; }
    if(Array.isArray(d.wrong)) m.wrong=[...new Set([...(Array.isArray(m.wrong)?m.wrong:[]),...d.wrong])].filter(Number.isInteger).slice(0,20); }
  for(const id of Object.keys(v)) progressSeen.add(id);
  return v; }
let profile = null; try{ profile = JSON.parse(Atlas.storage.getItem('atlas:profile')||'null') }catch(e){}
let level = store.get('level', null);
let progress = store.get('progress', {});
progressSeen = new Set(Object.keys(progress||{}));
let stars = store.get('stars', 0);
const g = () => profile?.gender==='f';
const nm = () => profile?.name || 'يا بطل';
/* نص مخاطب: {ذكر|أنثى} و{اسم} */
/* نص من الطفل أو من التخزين يُعرض كما هو: تُهرَّب الأقواس والخط العمودي أيضاً فلا تعدّها tx علامة تذكير */
const htmlText = t => String(t??'').replace(/[&<>"'{}|]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','{':'&#123;','}':'&#125;','|':'&#124;'}[c]));
const gsub = t => String(t??'').replace(/\{([^{}|]*)\|([^{}]*)\}/g, (m,a,b)=> g()?b:a);
/* العدد والمعدود: arN(n, AR_N.q, 'obl') — 1 واحد، 2 مثنى (رفع أو نصب وجر)، 3–10 جمع، 0 و11 فما فوق مفرد منصوب أو جمع */
const AR_N = { q:['سؤال واحد','سؤالان','سؤالين','أسئلة','سؤالاً'], star:['نجمة واحدة','نجمتان','نجمتين','نجوم','نجمة'], ans:['إجابة واحدة','إجابتان','إجابتين','إجابات','إجابة'] };
const arN = (n, f, c) => { n = +n || 0; const m = n % 100; return n === 0 ? '0 ' + f[3] : n === 1 ? f[0] : n === 2 ? (c === 'obl' ? f[2] : f[1]) : (m >= 3 && m <= 10) ? n + ' ' + f[3] : n + ' ' + f[4]; };
const tx = t => gsub((t||'').replace(/\{اسم\}/g, () => '<bdi data-raw>'+htmlText(nm())+'</bdi>'));
/* سطور السلامة: يظهر أهمها في بطاقة التجربة، والبقية في قائمة تُفتح — لا يُخفى سطر سلامة أبداً */
const safetyMore = (X, n) => { const rest=((X&&X.safety)||[]).slice(n); return rest.length ? `<details class="safety-more" style="margin-top:6px"><summary>${tx('قواعد سلامة أخرى ('+rest.length+') — {اقرأها|اقرئيها} مع ولي أمرك{|ِ}')}</summary><ul style="margin:6px 18px 0;padding:0">${rest.map(r=>`<li>${tx(r)}</li>`).join('')}</ul></details>` : ''; };

/* ============================ الرسوم ============================ */
/* الطفل البطل: رأس كبير، عينان مستديرتان، ابتسامة. ولد/بنت. pose: stand | phone | arms (ذراعان ممدودتان) | back */
function hero(pose='stand', size=220){
  const girl = g(); const hairC = '#4A2E1E';
  const hair = girl
    ? `<path d="M60 70c0-38 30-55 60-55s60 17 60 55v55c0 8-10 10-14 4l-6-30H80l-6 30c-4 6-14 4-14-4z" fill="${hairC}"/>`
    : `<path d="M62 78c-2-40 28-62 58-62s60 22 58 62c-12-14-30-22-58-22s-46 8-58 22z" fill="${hairC}"/>`;
  const face = `<ellipse cx="120" cy="92" rx="52" ry="56" fill="var(--skin)"/>
    <circle cx="100" cy="92" r="7" fill="#2A2422"/><circle cx="140" cy="92" r="7" fill="#2A2422"/>
    <circle cx="102" cy="89" r="2.5" fill="#fff"/><circle cx="142" cy="89" r="2.5" fill="#fff"/>
    <path d="M100 118q20 16 40 0" stroke="#2A2422" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="82" cy="110" r="7" fill="#FF9E8E" opacity=".6"/><circle cx="158" cy="110" r="7" fill="#FF9E8E" opacity=".6"/>`;
  const shirt = girl ? '#F06292' : 'var(--shirt)';
  let arms = `<path d="M78 170l-30 60" stroke="var(--skin)" stroke-width="22" stroke-linecap="round"/><path d="M162 170l30 60" stroke="var(--skin)" stroke-width="22" stroke-linecap="round"/>`;
  if(pose==='arms') arms = `<path d="M70 165L8 160" stroke="var(--skin)" stroke-width="22" stroke-linecap="round"/><path d="M170 165l62-5" stroke="var(--skin)" stroke-width="22" stroke-linecap="round"/>`;
  if(pose==='phone') arms = `<path d="M78 170l-30 60" stroke="var(--skin)" stroke-width="22" stroke-linecap="round"/><path d="M162 175l-6-80" stroke="var(--skin)" stroke-width="22" stroke-linecap="round"/><rect x="148" y="60" width="26" height="46" rx="7" fill="#2A2422"/><rect x="152" y="66" width="18" height="30" rx="3" fill="#BFE7FF"/>`;
  const bodyP = `<rect x="80" y="148" width="80" height="100" rx="26" fill="${shirt}"/>
    <path d="M92 245l-6 70" stroke="#3B6BA5" stroke-width="30" stroke-linecap="round"/><path d="M148 245l6 70" stroke="#3B6BA5" stroke-width="30" stroke-linecap="round"/>
    <ellipse cx="82" cy="322" rx="22" ry="12" fill="#2A2422"/><ellipse cx="158" cy="322" rx="22" ry="12" fill="#2A2422"/>`;
  const face2 = pose==='back' ? `<ellipse cx="120" cy="92" rx="52" ry="56" fill="var(--skin)"/><path d="M62 78c-2-40 28-62 58-62s60 22 58 62v40H62z" fill="${hairC}"/>` : hair+face;
  return `<svg viewBox="0 0 240 340" width="${size}" height="${size*340/240}" aria-hidden="true">${bodyP}${arms}${face2}</svg>`;
}
/* الرفيق «لمّاح»: مكبّر مرسوم بعينين */
function buddy(size=110, mood='happy'){
  const mouth = mood==='think' ? `<path d="M60 86q10-6 20 0" stroke="#2A2422" stroke-width="4" fill="none" stroke-linecap="round"/>` : `<path d="M58 84q12 14 24 0" stroke="#2A2422" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 140 160" width="${size}" height="${size*160/140}" aria-hidden="true" class="${mood==='happy'?'wiggle':''}">
    <path d="M96 108l32 40" stroke="#D9A623" stroke-width="16" stroke-linecap="round"/>
    <circle cx="70" cy="70" r="56" fill="var(--sun)"/><circle cx="70" cy="70" r="44" fill="#DDF6FF"/>
    <circle cx="56" cy="64" r="7" fill="#2A2422"/><circle cx="84" cy="64" r="7" fill="#2A2422"/><circle cx="58" cy="61" r="2.5" fill="#fff"/><circle cx="86" cy="61" r="2.5" fill="#fff"/>
    ${mouth}<path d="M40 44q10-10 22-6" stroke="#2A2422" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
}
/* الطبيب (يُرى في الهاتف) */
function doctor(size=120){
  return `<svg viewBox="0 0 200 200" width="${size}" height="${size}" aria-hidden="true">
    <circle cx="100" cy="100" r="96" fill="var(--sky)"/>
    <rect x="52" y="120" width="96" height="80" rx="20" fill="#fff"/><path d="M100 122v40" stroke="var(--teal)" stroke-width="4"/>
    <ellipse cx="100" cy="88" rx="40" ry="44" fill="var(--skin)"/><path d="M60 80c0-30 20-46 40-46s40 16 40 46c-10-10-24-16-40-16s-30 6-40 16z" fill="#6B6B6B"/>
    <circle cx="86" cy="90" r="5" fill="#2A2422"/><circle cx="114" cy="90" r="5" fill="#2A2422"/><path d="M88 108q12 10 24 0" stroke="#2A2422" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M70 130q0 30 30 36q30-6 30-36" stroke="#2A2422" stroke-width="4" fill="none"/><circle cx="100" cy="170" r="8" fill="#2A2422"/></svg>`;
}

/* ===== صور مولَّدة (تحلّ محل الرسوم البرمجية) ===== */
const IMG = 'img/';
const heroImg = () => g() ? 'hero-girl' : 'hero-boy';
function hero(pose='stand', size=220){ const n={stand:1,arms:2,phone:3,back:4}[pose]||1; return `<img src="${IMG}${heroImg()}-${n}.webp" alt="" style="height:${Math.round(size*1.4)}px;max-width:100%;object-fit:contain">`; }
function buddy(size=110, mood='happy'){ const n={happy:1,think:2,surprised:3,party:4}[mood]||1; return `<img src="${IMG}lammah-${n}.webp" alt="لمّاح" class="${mood==='happy'?'wiggle':''}" style="height:${size}px;max-width:100%;object-fit:contain">`; }
function doctor(size=120){ return `<img src="${IMG}doctor-2.webp" alt="الطبيبة" style="height:${size}px;object-fit:contain">`; }
const scenePic = (name, cls='art') => `<img src="${IMG}${name}.webp" alt="" class="${cls}" style="border-radius:22px;max-height:52vh;object-fit:contain">`;

/* خريطة الجسم التفاعلية: مناطق قابلة للمس. side: front|back */
const REGIONS = {
  head:{ar:'الرأس', d:'M512 30a210 215 0 1 1 0 430a210 215 0 1 1 0-430z', lx:512, ly:250},
  /* العنق ضيق في الرسم: منطقة لمسه تمتد إلى أسفل الذقن وفتحة القميص حتى تبلغ نحو 44 بكسل على الهاتف */
  neck:{ar:'العنق', d:'M405 380h220v145H405z', lx:515, ly:452},
  chest:{ar:'الصدر', d:'M330 525h365v164H330z', lx:512, ly:600},
  abdomen:{ar:'البطن', d:'M350 690h330v160H350z', lx:512, ly:775},
  upperarm_r:{ar:'العضد', d:'M325 478L395 585L290 735L210 695z', lx:300, ly:610},
  forearm_r:{ar:'الساعد', d:'M290 735L210 695L130 800L215 835z', lx:215, ly:760},
  hand_r:{ar:'اليد', d:'M60 795L245 785L240 975L75 950z', lx:150, ly:880},
  upperarm_l:{ar:'العضد', d:'M699 478L629 585L734 735L814 695z', lx:724, ly:610},
  forearm_l:{ar:'الساعد', d:'M734 735L814 695L894 800L809 835z', lx:809, ly:760},
  hand_l:{ar:'اليد', d:'M964 795L779 785L784 975L949 950z', lx:874, ly:880},
  thigh:{ar:'الفخذ', d:'M355 850h150v250H355z', lx:430, ly:975},
  thigh_l:{ar:'الفخذ', d:'M519 850h150v250H519z', lx:594, ly:975},
  leg:{ar:'الساق', d:'M330 1100h150v240H330z', lx:405, ly:1220},
  leg_l:{ar:'الساق', d:'M544 1100h150v240H544z', lx:619, ly:1220},
  foot:{ar:'القدم', d:'M255 1340h230v160H255z', lx:370, ly:1420},
  foot_l:{ar:'القدم', d:'M545 1340h235v160H545z', lx:662, ly:1420},
  /* الخلف: نسب مئوية على صورة الظهر (viewBox 0 0 100 150) */
  b_head:{ar:'الرأس', d:'M22 0h56v40H22z', lx:50, ly:20, back:true},
  b_neck:{ar:'العنق', d:'M38 40h24v5H38z', lx:50, ly:43, back:true},
  back:{ar:'الظهر', d:'M22 45h56v36H22z', lx:50, ly:63, back:true},
  b_arm_r:{ar:'الذراع', d:'M0 48h22v50H0z', lx:11, ly:73, back:true},
  b_arm_l:{ar:'الذراع', d:'M78 48h22v50H78z', lx:89, ly:73, back:true},
  b_legs:{ar:'الرِّجل', d:'M22 81h56v57H22z', lx:50, ly:110, back:true},
  b_feet:{ar:'القدم', d:'M15 138h70v12H15z', lx:50, ly:144, back:true},
};
function bodyMap({side='front', ids, size=400}={}){
  const front=['head','neck','chest','abdomen','upperarm_r','forearm_r','hand_r','upperarm_l','forearm_l','hand_l','thigh','thigh_l','leg','leg_l','foot','foot_l'];
  const backIds=['b_head','b_neck','back','b_arm_r','b_arm_l','b_legs','b_feet'];
  const list = ids || (side==='front' ? front : backIds);
  const img = side==='front' ? `${IMG}s04-bodymap-${g()?'girl':'boy'}.webp` : `${IMG}${heroImg()}-4.webp`;
  const vb = side==='front' ? '0 0 1024 1536' : '0 0 100 150';
  const fs = side==='front' ? 40 : 6, pad = side==='front' ? 70 : 10, bh = side==='front' ? 56 : 8;
  const hots = list.map(id => { const r=REGIONS[id]; return `<g class="hot" data-id="${id}" data-ar="${r.ar}" tabindex="0" role="button" aria-label="${r.ar}"><path class="zone" d="${r.d}"/><g class="label" hidden><rect class="tagbox" x="${r.lx-pad}" y="${r.ly-bh/2}" width="${pad*2}" height="${bh}" rx="${bh/4}"/><text class="tag" x="${r.lx}" y="${r.ly+fs*0.35}" text-anchor="middle" style="font-size:${fs}px">${r.ar}</text></g></g>`; }).join('');
  return `<div class="body-wrap" style="position:relative;width:min(${size}px,100%);margin:0 auto"><img src="${img}" alt="" style="width:100%;display:block"><svg viewBox="${vb}" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%">${hots}</svg></div>`;
}

/* ============================ الصوت ============================ */
let audioEl=null, lastText='', lastRaw=[], opening=false;
/* سياسة القراءة الآلية (قرار 12 نوفمبر 2026): لا يُقرأ شيء تلقائياً حين يُفتح المشهد — لا شرح ولا سؤال ولا تلاوة.
   ما يطلب المشهد نطقه أثناء فتحه (opening) يصير نص زر 🔊 العام بدل أن يُنطق. التغذية الراجعة والتنبيهات (ما يأتي ردّاً
   على فعل الطفل) تُقرأ تلقائياً. ولكل خيار زر 🔊 خاص به (optionSpeakers). */
const cleanSpeech = t => { const d=document.createElement('textarea'); d.innerHTML=gsub(String(t||'').replace(/\{اسم\}/g,()=>nm())).replace(/<[^>]*>/g,' '); return d.value.replace(/﴿[^﴾]*﴾/g,' … ').replace(/ﷺ/g,' صلى الله عليه وسلم'); /* القرآن لا يُقرأ بالقارئ الآلي: ما بين ﴿ ﴾ يُحذف من النطق ويبقى مكتوباً */ };
/* صوت على الجهاز نفسه فقط: الصوت الشبكي (localService=false) يرسل النص ومعه اسم الطفل خارج الجهاز (المراجعة 20، إ-3).
   بلا صوت محلي للغة لا نطق، وتظهر لافتة تثبيت الصوت العربي */
const localVoice = code => { try{ const c=String(code).toLowerCase().slice(0,2); return speechSynthesis.getVoices().find(v=>v.localService!==false && String(v.lang).replace('_','-').toLowerCase().startsWith(c)) || null; }catch{ return null; } };
/* القائمة تُحمَّل في الخلفية في Chromium: تُطلب مبكراً، وما دامت فارغة يُترك الاختيار للنظام كما كان */
const voicesKnown = () => { try{ return speechSynthesis.getVoices().length>0; }catch{ return false; } };
try{ if('speechSynthesis' in window) speechSynthesis.getVoices(); }catch{}
/* التسجيل البشري أولاً (D09، المراجعة 20 ن-20): window.AUDIO (يكتبه tools/build-scenes.mjs) يربط بصمة النص المسموع
   (audio-key.js) بملفه في audio/<الدرس>/. لا ملف للبصمة ← القارئ الآلي. تعذّر الملف ← القارئ الآلي للنص نفسه.
   اسم الطفل لا يُسجَّل: التسجيل بلا عبارة النداء */
/* عبارات الواجهة المنطوقة: مصدر واحد يقرؤه tools/generate.mjs فيضعها في قائمة التسجيل المشتركة (build/common/)،
   فتُسجَّل مرة واحدة وتُسمع قبل نص الدرس الذي يليها («أحسنت!» ثم شرح البند). علامات التذكير والتأنيث كما في الدروس */
const SAY = {
  praise:'أحسنت{|ِ}!', right_now:'صحيح الآن.', answer_is:'الصواب:', not_this:'ليس هذا.', think_again:'فكّر{|ي} مرة أخرى.',
  hint:'تلميح:', look_rest:'انظر{|ي} إلى ما بقي من خيارات.',
  seq_shown:'الترتيب الصحيح.', seq_right:'ترتيب صحيح!', seq_right_now:'الترتيب صحيح الآن.', seq_wrong:'ليس هذا الترتيب.', try_again:'جرّب{|ي} من جديد.',
  not_here:'ليس هنا.', try_place:'جرّب{|ي} مكاناً آخر.', predict_nice:'توقّع جميل. لنكتشف الجواب معاً في هذا الدرس.',
  terms_intro:'كلمات مهمة في هذا الدرس:', terms_known:'كل كلمات الدرس عرفناها في موضعها.', experiment:'تجربة:',
  error_intro:'لمّاح أخطأ في ملاحظاته. في كل ملاحظة جملتان: {اختر|اختاري} الصحيحة.',
  life_intro:'في حياتي.', why_q:'لماذا؟', trilingual:'كلمات {تعلمتها|تعلمتِها} اليوم بثلاث لغات.', finished:'أنهيت{|ِ}',
  meaning_q:'ما معناها لنا اليوم؟', prophet_said:'قال رسول الله ﷺ:',
  test_intro:'اختبار قصير. {أجب|أجيبي} وحدك{|ِ}، والمحاولة الأولى هي التي تُحسب.', test_locked:'يُفتح هذا الاختبار بعد أن {تنهي|تنهين} الدرس.',
  retry_intro:'محاولة ثانية بأسئلة جديدة عمّا أخطأت{|ِ} فيه.', recall_intro:'عودة الذاكرة. {أجب|أجيبي} دون أن تفتح{|ي} الدرس.',
  transfer:'🌍 سؤال من عالم آخر:', recall_free_a:'دون أن تفتح{|ي} الدرس: اكتب{|ي} ثلاثة أشياء {تتذكرها|تتذكرينها} من', recall_free_b:'ولماذا هي مهمة.'
};
/* ما يُنطق نص أو أجزاء (عبارة واجهة، ثم نص من الدرس…): لكل جزء تسجيله إن وُجد. تُشغَّل التسجيلات متتابعة إن وُجدت
   كلها، وإلا قرأ القارئ الآلي النص كاملاً، فلا يختلط صوتان في جملة واحدة */
const partsOf = t => (Array.isArray(t) ? t : [t]).map(p => p==null ? '' : String(p)).filter(p => p.trim());
/* تسجيل مستورد من حزمة صوت (VoicePack في state.js، من استوديو جسم الإنسان) مقدَّم على المحزوم مع التطبيق: هو الأحدث */
const recordingFor = raw => { try{ const A=window.AUDIO||{}, VP=window.VoicePack, k=typeof audioKey==='function' ? audioKey(raw) : ''; if(!k) return null; if(VP && VP.has(k)) return 'idb:'+k; return A[k] || null; }catch{ return null; } };
const recordingsFor = raws => { const fs=(raws||[]).map(recordingFor); return fs.length && fs.every(Boolean) ? fs : null; };
function playFile(file, fallback, onEnd){ if(audioEl){audioEl.pause();audioEl=null} if('speechSynthesis' in window) speechSynthesis.cancel();
  if(String(file).startsWith('idb:')){ const tok={}; audioEl={pause(){ tok.dead=true; }}; const me=audioEl;
    window.VoicePack.url(file.slice(4)).then(u=>{ if(tok.dead||audioEl!==me) return; audioEl=null; if(u) playFile(u, fallback, onEnd); else fallback(); }, ()=>{ if(!tok.dead&&audioEl===me){ audioEl=null; fallback(); } }); return; }
  const a=new Audio(file); audioEl=a; a.onended=()=>{ if(audioEl===a){ audioEl=null; if(onEnd) onEnd(); } };
  const fail=()=>{ if(audioEl!==a) return; audioEl=null; fallback(); }; a.onerror=fail; const p=a.play(); if(p && p.catch) p.catch(e=>{ if(!e || e.name!=='AbortError') fail(); }); }
function playFiles(files, fallback){ let k=0; const next=()=>{ if(k<files.length) playFile(files[k++], fallback, next); }; next(); }
function tts(t){ if(audioEl){audioEl.pause();audioEl=null} if(!('speechSynthesis' in window)) return; speechSynthesis.cancel(); const v=localVoice('ar'); if(!v && voicesKnown()) return; const u=new SpeechSynthesisUtterance(t); u.lang='ar'; if(v) u.voice=v; u.rate=.92; speechSynthesis.speak(u); }
function voice(t, raws){ if(!t) return; const fs=raws ? recordingsFor(Array.isArray(raws) ? raws : [raws]) : null; if(fs){ playFiles(fs, ()=>tts(t)); return; } tts(t); }
function speak(t){ if(recordingActive()) return; const parts=partsOf(t), raws=parts.map(p=>gsub(p)), text=cleanSpeech(parts.join(' ')); if(opening){ if(text.trim()){ lastText=text; lastRaw=raws; } return; } voice(text, raws); }
/* زر 🔊 العام: يقرأ نص المشهد (ما طلب المشهد نطقه عند فتحه، وإلا عنوانه وشرحه الظاهران) */
const sceneSpeech = () => [...$$('#main .scene h1, #main .scene h2, #main .scene .say')].map(e=>e.innerText.trim()).filter(Boolean).join('. ');
$('#spkBtn').onclick = () => { if(recordingActive()) return; if(lastText) voice(cleanSpeech(lastText), lastRaw); else { const s=sceneSpeech(); voice(cleanSpeech(s), [s]); } };
/* زر 🔊 لكل خيار: زر مستقل عند حافة الخيار لا داخله — زر داخل زر لا يصله قارئ الشاشة ولا مفتاح Tab، ويُقرأ اسم
   الخيار مرتين (المراجعة 20، ن-14). الخيار يُلف بغلاف .optrow يأخذ ما كان للخيار من تمدد في الصف. نقرة السماعة تنطق ولا تختار */
const SAY_SKIP=/^(▶|↻|↩|⏱|🏠|🔍|🧽|💓|🌬|✔|✘|أرني|لم أجد|ابدأ|أعد)/;
function optionSpeakers(){ $$('#main button.opt, #main .stmt').forEach(b=>{ /* أزرار النطق (المصطلحات بلغاتها) وأدوات الرسم ليست خيارات */ if(b.id || b.classList.contains('reveal') || b.matches('[data-say],[data-erase]') || b.parentElement?.classList.contains('optrow')) return;
    if(b.matches('button') && ![...b.attributes].some(x=>x.name.startsWith('data-') && !/^data-(start|tap|say|w|l|term|bad)$/.test(x.name))) return;
    const text=(b.innerText||'').replace(/\s+/g,' ').trim(); if(text.length<2 || SAY_SKIP.test(text)) return;
    const wrap=document.createElement('div'); wrap.className='optrow';
    if(b.style.flex){ wrap.style.flex=b.style.flex; b.style.flex=''; } if(b.style.width==='auto' && getComputedStyle(b.parentElement).display.includes('flex')) wrap.style.minWidth='0';
    b.replaceWith(wrap); wrap.append(b);
    const s=document.createElement('button'); s.type='button'; s.className='say1'; s.setAttribute('aria-label','استمع إلى: '+text);
    s.addEventListener('click', e=>{ e.stopPropagation(); e.preventDefault(); if(!recordingActive()) voice(cleanSpeech(text)); });
    wrap.insertBefore(s, b); b.classList.add('has-say'); }); }
/* تلاوة آية: تسجيل ولي الأمر أو ملف المطوّر فقط (QuranAudio في state.js)، ولا قارئ آلي، ولا تشغيل تلقائي: تُتلى حين يضغط الطفل
   «استمع إلى التلاوة». then يعطي زر 🔊 العام شرح المشهد (يُستدعى أثناء فتح المشهد فلا يُنطق). ملف ولي الأمر إن تعطّل
   يُرجَع منه إلى الملف المرفق بالتطبيق ويُشغَّل */
function recite(key, host, then){ const at=idx, live=()=>idx===at;
  if(then) then();
  if(!host || !window.QuranAudio || recordingActive()) return;
  const row=document.createElement('div'); row.className='recite'; row.style.cssText='margin:8px 0;text-align:center'; (host.querySelector('.ref')||host).insertAdjacentElement('afterend',row);
  const none=()=>{ if(!live()) return; row.innerHTML='<span class="note">لا تلاوة مسجّلة لهذه الآية بعد. تُضاف من شاشة ولي الأمر.</span>'; };
  const start=(src, now=false)=>{ if(!live()) return; if(!src){ none(); return; }
    row.innerHTML=tx('<button class="opt" style="width:auto;margin:0" type="button">▶ استمع{|ي} إلى التلاوة</button>');
    const play=()=>{ if(!live() || recordingActive()) return; if(audioEl){ audioEl.pause(); } if('speechSynthesis' in window) speechSynthesis.cancel(); const a=new Audio(src.url); audioEl=a;
      a.onended=()=>{ if(audioEl===a) audioEl=null; };
      /* تعذّر الملف: ملف ولي الأمر يُرجَع منه إلى الملف المرفق ويُشغَّل، والمرفق المتعذّر يُعامَل كغيابه. خطأ عنصر استُبدل لا يُلتفت إليه */
      a.onerror=()=>{ if(audioEl!==a) return; audioEl=null; if(!live()) return; if(src.from==='parent') QuranAudio.shipped(key).then(u=>start(u?{url:u,from:'app'}:null, true), none); else none(); };
      a.play().catch(()=>{}); };
    row.querySelector('button').onclick=play; if(now) play(); };
  QuranAudio.source(key).then(s=>start(s), none); }



/* نطق مصطلح: تسجيل بشري إن وُجد (audio/<lesson>/term.<id>.<lang>.mp3) وإلا القارئ الآلي بلغة المصطلح */
function sayTerm(t, lang){if(recordingActive())return; const file = (window.AUDIO||{})[`term.${t.id}.${lang}`]; const text = lang==='ar'?t.ar:lang==='en'?t.en:t.zh; const code = lang==='ar'?'ar':lang==='en'?'en-US':'zh-CN';
  if(file){ playFile(file, ()=>ttsLang(text,code)); return; }
  if(audioEl){audioEl.pause();audioEl=null} if('speechSynthesis' in window) speechSynthesis.cancel();
  ttsLang(text,code); }
function ttsLang(text,code){if(recordingActive())return; if(!('speechSynthesis' in window)) return; const v=localVoice(code); if(!v && voicesKnown()) return; const u=new SpeechSynthesisUtterance(text); u.lang=code; if(v) u.voice=v; u.rate=.85; speechSynthesis.speak(u); }

let sceneVersion=0;const sceneTimers=new Set(),sceneIntervals=new Set(),sceneFrames=new Set(),sceneCleanups=new Set();
function sceneTimeout(fn,ms){const v=sceneVersion,t=setTimeout(()=>{sceneTimers.delete(t);if(v===sceneVersion)fn()},ms);sceneTimers.add(t);return t}
function sceneInterval(fn,ms){const v=sceneVersion,t=setInterval(()=>{if(v===sceneVersion)fn()},ms);sceneIntervals.add(t);return t}
function sceneFrame(fn){const v=sceneVersion,t=requestAnimationFrame(x=>{sceneFrames.delete(t);if(v===sceneVersion)fn(x)});sceneFrames.add(t);return t}
function onSceneLeave(fn){sceneCleanups.add(fn)}
function stopPlayback(){if(audioEl){audioEl.pause();audioEl=null}if('speechSynthesis'in window)speechSynthesis.cancel();document.querySelectorAll('audio,video').forEach(a=>a.pause())}
function recordingActive(){return !!document.querySelector('#recBtn.stop')}
function leaveScene(){sceneVersion++;sceneMiss=false;sceneMarks.clear();sceneTimers.forEach(clearTimeout);sceneTimers.clear();sceneIntervals.forEach(clearInterval);sceneIntervals.clear();sceneFrames.forEach(cancelAnimationFrame);sceneFrames.clear();sceneCleanups.forEach(f=>{try{f()}catch{}});sceneCleanups.clear();stopPlayback()}
/* إخفاء الصفحة (حوار إذن الميكروفون في أندرويد، أو تبديل التطبيق) يوقف الأصوات فقط: لا يُعاد بناء المشهد
   فلا يضيع نص لم يُحفظ ولا تسجيل جارٍ (المسجّل يحفظ ما سُجّل بنفسه). مغادرة الصفحة فعلاً تنظّف كل شيء. */
/* الزمن الفعلي: كل 15 ثانية والصفحة ظاهرة والطفل تفاعل في آخر دقيقتين (المراجعة 28، أ3) */
let lastAct=Date.now(); if(typeof document!=='undefined'&&document.addEventListener) ['pointerdown','keydown','scroll'].forEach(e=>document.addEventListener(e,()=>{lastAct=Date.now()},{passive:true,capture:true}));
if(typeof setInterval==='function') setInterval(()=>{ try{ if(typeof LESSON==='undefined'||document.hidden||Date.now()-lastAct>120000) return; store.set('activeMs', (+store.get('activeMs',0)||0)+15000); }catch{} },15000);
window.addEventListener('pagehide',leaveScene);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPlayback()});
/* ============================ المشاهد ============================ */
const sayBuddy = t => `<div class="say buddy"><span class="who">لمّاح</span>${tx(t)}</div>`;
const sayNar = t => `<div class="say">${tx(t)}</div>`;
let done = false;           // هل اكتمل تفاعل المشهد الحالي؟
let rendering = false;      // ok() أثناء رسم المشهد لا يعني أن الطفل أنجز شيئاً
function need(){ done=false; $('#nextBtn').disabled=true; cueSoon(); }
/* إشارة «النشاط في الأسفل»: حين يكون «التالي» معطّلاً وأول عنصر يُطلب من الطفل تحت الشاشة، تأخذ مكان «التالي» في الشريط نفسه (قرار 25 نوفمبر)؛ و#nextBtn يبقى معطّلاً كما هو */
const CUE_SEL='.opt:not([disabled]),.hot,.jt,.st,.err,.ring,.cell,.layer,.seg,.mol,.bub,.ch,.stmt,input:not([type=hidden]),textarea,canvas,[data-start]:not([disabled]),[data-tap]:not([disabled]),.scene button:not([disabled])';
let cueEl=null, cueRaf=0;
function cueTarget(){ for(const e of $$('#main '+CUE_SEL.split(',').join(',#main '))){ const r=e.getBoundingClientRect(); if(r.width&&r.height) return e; } return null; }
function updateCue(){ cueRaf=0; const f=document.querySelector('footer .fwrap'); if(!f) return; if(!cueEl){ cueEl=document.createElement('button'); cueEl.className='next cue'; cueEl.type='button'; cueEl.textContent='↓ النشاط في الأسفل'; cueEl.hidden=true; const nb=$('#nextBtn'); if(nb) nb.after(cueEl); else f.appendChild(cueEl); cueEl.onclick=()=>{ const t=cueTarget(); if(t) t.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}); }; }
  let show_=false; if(!done){ const t=cueTarget(); if(t){ const lim=(document.querySelector('footer')?.getBoundingClientRect().top||innerHeight)-24; show_=t.getBoundingClientRect().top>lim; } } cueEl.hidden=!show_; f.classList.toggle('cueOn',show_); }
function cueSoon(){ if(typeof requestAnimationFrame==='undefined'||cueRaf) return; cueRaf=requestAnimationFrame(updateCue); }
if(typeof addEventListener!=='undefined'){ addEventListener('scroll',cueSoon,{passive:true}); addEventListener('resize',cueSoon); }
/* المشهد الذي أنجزه الطفل مرة يبقى منجَزاً: الرجوع أو إعادة التحميل لا يغلقان «التالي» من جديد */
function ok(){ done=true; $('#nextBtn').disabled=false; cueSoon(); const sid=SCENES[idx]?.id; if(sid && !rendering && !SCENES[idx].noResume){ const p=store.get('passed',{}); if(!p[sid]){ p[sid]=true; store.set('passed',p); } } }
/* رسالة التغذية الراجعة: تمر دائماً بالتذكير والتأنيث، وتُعرض نصاً مرئياً وتُنطق معاً */
function fb(kind, text, {el='#fb', say=true}={}){ const box=typeof el==='string'?$(el):el; const parts=partsOf(text), h=tx(parts.join(' ')); if(box){ box.className='fb '+(kind||''); box.hidden=false; box.innerHTML=h; /* الردّ قد يقع تحت الشاشة على الهاتف */ try{ box.scrollIntoView({block:'nearest',behavior:'smooth'}); }catch{} } if(say) speak(parts.map(p=>tx(p))); return h; }
/* النجمة لمن أصاب من أول محاولة (قرار 12 نوفمبر 2026): مشهد أخطأ فيه الطفل مرة — بند مقيَّم أخطأه أول مرة، أو نشاط
   سُجّل فيه خطأ بـnoteMiss() — لا يعطي نجمة، ولو أكمله بعد ذلك أو عاد إليه. الأنشطة التي لا خطأ فيها (محاكيات) تعطي نجمتها بالإكمال */
let sceneMiss=false; const sceneMarks=new Set();
function noteMiss(){ sceneMiss=true; const sid=SCENES[idx]?.id; if(!sid) return; const m=store.get('missed',{}); if(!m[sid]){ m[sid]=true; store.set('missed',m); } }
function award(n=1){const rewards=store.get('rewards',{}),sid=SCENES[idx]?.id;if(!sid||rewards[sid])return; if(sceneMiss || store.get('missed',{})[sid] || [...sceneMarks].some(id=>progress[id]?.firstAttempt===false)) return;rewards[sid]=true;if(!store.set('rewards',rewards))return;stars+=n; store.set('stars',stars); $('#starsTxt').textContent=stars; confetti(); }
function confetti(){ const c=$('#confetti'); c.innerHTML=''; const cols=['#FF6B57','#2BB3A3','#FFC93C','#9BD77A','#BFE7FF']; for(let i=0;i<26;i++){ const s=document.createElement('i'); s.style.left=Math.random()*100+'%'; s.style.background=cols[i%cols.length]; s.style.animationDelay=(Math.random()*.4)+'s'; c.appendChild(s);} sceneTimeout(()=>c.innerHTML='',1800); }
function mark(id, okv, extra={}){ sceneMarks.add(id); if(progress[id]===undefined){ const d=store.get('progress',{})[id]; if(d&&typeof d==='object') progress[id]=d; } const p=progress[id]||{hints:0,ok:false}; if(p.firstAttempt===undefined){ if(p.ok || p.hints>0) p.firstAttempt=!!p.ok; else { p.firstAttempt=!!okv; p.ok=!!okv; if(!okv) p.hints=(p.hints||0)+1; } } /* solved = أصاب ولو بعد خطأ؛ ok وfirstAttempt يبقيان للمحاولة الأولى */ if(okv) p.solved=true; Object.assign(p,extra); progress[id]=p; store.set('progress',progress); }
/* ترتيب خيارات ثابت لكل بند وطفل: يُخلط مرة ويُحفظ، فلا يتعلم الطفل «الجواب هو الثاني» ولا يتغير الترتيب عند الرجوع.
   الخيار الجامع («كل ما سبق»، «لا شيء…»، «كلاهما») يبقى آخراً. */
const LAST_OPT=/^(كل|جميع|لا شيء|لا أحد|كلاهما|كلتاهما|لا هذا ولا ذاك|لا أعرف|لا يمكن)/;
function optionOrder(id, n, options=[]){ const all=store.get('order',{}); let o=all[id]; if(Array.isArray(o)&&o.length===n&&new Set(o).size===n&&o.every(x=>Number.isInteger(x)&&x>=0&&x<n)) return o;
  const fixed=[...Array(n).keys()].filter(i=>LAST_OPT.test(String(options[i]||'').replace(/[{].*?[}]/g,'').trim())); const free=[...Array(n).keys()].filter(i=>!fixed.includes(i));
  for(let i=free.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [free[i],free[j]]=[free[j],free[i]]; }
  o=[...free,...fixed]; all[id]=o; store.set('order',all); return o; }
/* سؤال اختيار — سلّم من ثلاث درجات بعد الخطأ: «ليس هذا» مع ما يخص الخيار المختار ← التلميح ← «أرني الصواب ولماذا».
   المحاولة الأولى وحدها تُسجَّل، والنجمة للإصابة من أول محاولة فقط. */
function choice({id, prompt, options, answer, why, hint, perOption, graded=true}){
  const order=optionOrder(id, options.length, options);
  const html = `<h2>${tx(prompt)}</h2>${order.map(i=>`<button class="opt" data-i="${i}">${tx(options[i])}</button>`).join('')}<div class="fb" id="fb" role="status" aria-live="polite"></div><button class="opt reveal" id="reveal" hidden>أرني الصواب ولماذا</button>`;
  sceneTimeout(()=>{ let first=true, wrong=0; const prev=progress[id];
    const finish=(msg,say=true)=>{ $$('.opt[data-i]').forEach(x=>{ x.disabled=true; if(+x.dataset.i===answer) x.classList.add('ok'); }); fb('ok', [msg, why||''], {say}); ok(); };
    const shown=()=>SAY.answer_is+' «'+options[answer]+'».';
    $('#reveal').onclick=()=>{ if(graded) mark(id,false,{revealed:true}); finish(shown()); $('#reveal').hidden=true; };
    if(prev && (prev.ok || prev.revealed || prev.solved)) finish(shown(), false);
    else { /* عودة إلى سؤال أخطأ فيه من قبل (خرج ثم رجع): لا يُعدّ ما بعدها محاولة أولى، فلا «أحسنت»، وتبقى الخيارات
              الخاطئة التي جرّبها معطّلة (المراجعة 20، ن-16) */
      const missed = graded ? prev?.firstAttempt===false : !!store.get('missed',{})[SCENES[idx]?.id];
      if(missed){ first=false; const tried = graded ? (Array.isArray(prev.wrong) ? prev.wrong : Number.isInteger(prev.choice) ? [prev.choice] : []) : [];
        tried.forEach(i=>{ const b=$('.opt[data-i="'+i+'"]'); if(b && i!==answer && !b.disabled){ b.classList.add('bad'); b.disabled=true; wrong++; } });
        if(wrong>=2) $('#reveal').hidden=false; } }
    $$('.opt[data-i]').forEach(b=>b.onclick=()=>{ const i=+b.dataset.i; const right = i===answer; if(graded && first){ mark(id,right,{choice:i}); } else if(graded && right){ mark(id,true); /* solved بعد خطأ، والمحاولة الأولى كما هي */ }
      /* المحاولة الأولى كما في المخزن: نافذة أخرى قد سجّلت خطأً قبل هذه (ن-16) */ const wasFirst = graded ? (first && progress[id]?.firstAttempt===true) : first; first=false;
      /* المديح للإصابة من أول محاولة؛ بعد خطأ يبقى الصواب وحده فلا «أحسنت» (البند 36) */
      if(right){ finish(wasFirst ? SAY.praise : SAY.right_now); if(graded ? progress[id]?.firstAttempt===true : wasFirst) award(); return; }
      wrong++; b.classList.add('bad'); b.disabled=true;
      /* الخيار الخاطئ يُحفظ ليبقى معطّلاً إن عاد الطفل إلى المشهد؛ والسؤال غير المقيَّم يعلَّم مشهده «أخطأ فيه» */
      if(graded && progress[id]){ const p=progress[id]; p.wrong=[...new Set([...(Array.isArray(p.wrong)?p.wrong:[]), i])]; store.set('progress',progress); } else if(!graded) noteMiss();
      const own=perOption&&perOption[i];
      if(wrong===1) fb('bad',[SAY.not_this, own||SAY.think_again]);
      else { fb('bad',[SAY.not_this, own||'', ...(hint?[SAY.hint, hint]:[SAY.look_rest])]); $('#reveal').hidden=false; }
    }); },0);
  return html;
}

/* ============================ المحرك ============================ */
let idx = 0;
function show(i, dir=1){leaveScene();{const cf=document.getElementById('confetti'); if(cf) cf.innerHTML='';}idx=Math.max(0,Math.min(Number.isFinite(+i)?Math.floor(+i):0,SCENES.length-1));
  /* مشهد لا يخص هذا الطفل (سؤال للمستوى ب وهو في المستوى أ): يُتخطّى بدل شاشة فارغة */
  while(SCENES[idx]?.skip?.() && idx+dir>=0 && idx+dir<SCENES.length) idx+=dir;
  /* دخول من رابط جانبي (‎#recall): لا يغيّر موضع الاستئناف */ if(!window.HASH_ENTRY){ store.set('scene',idx); store.set('sceneId',String(SCENES[idx].id)); } const sc=SCENES[idx]; rendering=true; try{ $('#main').innerHTML=tx(sc.render()); } catch(e){ /* مشهد تعطّل: لا يُحبس الطفل فيه عند كل فتح */ console.error(e); rendering=false; if(!window.HASH_ENTRY){ store.set('scene',Math.max(0,idx-1)); store.set('sceneId',String(SCENES[Math.max(0,idx-1)].id)); } $('#main').innerHTML='<div class="scene"><div class="card" role="alert">تعذّر فتح هذه الصفحة من الدرس. عُد خطوة إلى الوراء أو إلى الخريطة، وأخبر أهلك.</div></div>'; $('#backBtn').style.visibility=idx?'visible':'hidden'; return; } finally { rendering=false; }
  lastText=''; lastRaw=[]; opening=true; try{ sc.after && sc.after(); } finally { opening=false; } optionSpeakers();
  /* مربع كتابة بلا حدّ: 2000 محرف (ن-9) */ $$('#main textarea:not([maxlength]),#main input[type=text]:not([maxlength])').forEach(t=>{ t.maxLength=TEXT_MAX; }); if(!sc.noResume && store.get('passed',{})[sc.id]) ok();
  /* كل عنصر تفاعلي مرسوم يُبلغ بلوحة المفاتيح (Enter/مسافة تضغطه) */
  $$('#main .jt,#main .st,#main .err,#main .ring,#main .cell,#main .layer,#main .seg,#main .mol,#main .bub,#main .ch,#main .stmt,#main .hot').forEach(e=>{ if(!e.hasAttribute('tabindex')) e.setAttribute('tabindex','0'); if(!e.hasAttribute('role')) e.setAttribute('role','button'); });
  $('#barFill').style.width=(idx/(SCENES.length-1)*100)+'%'; $('#starsTxt').textContent=stars; $('#backBtn').style.visibility = (idx&&!sc.noBack)?'visible':'hidden'; $('#nextBtn').hidden = idx===SCENES.length-1; window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}); $('#main').focus?.({preventScroll:true}); setTimeout(cueSoon,450); }
$('#nextBtn').onclick=()=>{ if(!done) return; show(idx+1, 1); };
$('#backBtn').onclick=()=>{ if(SCENES[idx]?.noBack) return; show(idx-1, -1); };
$('#homeBtn').onclick=()=>{leaveScene(); /* تسجيل قُطع بالمغادرة يُحفظ أولاً */ Promise.resolve(typeof recSaving!=='undefined'?recSaving:0).then(()=>{location.href=LESSON.home;});};
/* موضع الاستئناف يُحفظ بمعرّف المشهد لا برقمه: تحديث يغيّر عدد المشاهد لا يقفز بالطفل فوق أسئلة ولا يفتح له مشهد الختام.
   الرقم القديم (بلا معرّف) يُقبل مرة واحدة إن كان داخل الطول؛ ومشهد ختامي لم يُبلغ فعلاً (resumable يعيد false) لا يُستأنف عليه */
function resumeIndex(){ const sid=store.get('sceneId',null); let i=typeof sid==='string'?SCENES.findIndex(s=>String(s.id)===sid):-1;
  if(i<0){ const n=store.get('scene',0); i=(sid==null && Number.isInteger(n) && n>=0 && n<SCENES.length)?n:0; }
  if(SCENES[i]?.resumable && !SCENES[i].resumable()) i=0; return i; }
/* تبدأ الصفحة بعد تحميل وسائط الطفل (التسجيلات والرسوم) من مخزن الجهاز */
/* درس بإذن ولي الأمر (visibility: parent_unlock): لا يُفتح إلا إن أذن له ولي الأمر من شاشته */
function lessonOpen(id){ try{ const u=JSON.parse(Atlas.storage.getItem('atlas:unlocked')||'{}')||{}; return typeof u[id]==='number'; }catch(e){ return false; } }
function boot(){if(!profile){location.replace('index.html');return Promise.resolve();} if(LESSON.gated && !lessonOpen(LESSON.lesson||LESSON.id)){location.replace('index.html');return Promise.resolve();} const go=()=>{ const h=window.BOOT_HOOK?.(); idx=Number.isInteger(h)&&h>=0 ? h : resumeIndex(); show(idx); }; return (window.Atlas?.ready||Promise.resolve()).then(go,go); }



document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[role=button]:not(button)')){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});

/* ============================ شبكة أمان للتذكير والتأنيث ============================
   أي علامة {مذكر|مؤنث} تصل إلى الشاشة من أي مسار (رسالة تُكتب بعد تفاعل الطفل مثلاً) تُستبدل فور ظهورها،
   فلا تُرى الأقواس ولا يقرؤها القارئ الآلي. ما كتبه الطفل (داخل [data-raw] أو حقول الإدخال) لا يُمس. */
(function(){ const M=/\{[^{}|]*\|[^{}]*\}|\{اسم\}/;
  const fixText=n=>{ const t=n.nodeValue; if(t&&t.includes('{')&&M.test(t)&&!n.parentElement?.closest('[data-raw],textarea,input,script,style')) n.nodeValue=gsub(t.replace(/\{اسم\}/g,()=>nm())); };
  const fixEl=el=>{ if(el.closest?.('[data-raw],script,style')) return; const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT); const list=[]; let x; while((x=w.nextNode())) list.push(x); list.forEach(fixText);
    [el,...el.querySelectorAll('[placeholder],[aria-label],[title]')].forEach(e=>['placeholder','aria-label','title'].forEach(a=>{ const v=e.getAttribute?.(a); if(v&&M.test(v)) e.setAttribute(a,gsub(v.replace(/\{اسم\}/g,()=>nm()))); })); };
  const main=document.getElementById?.('main'); if(!main||typeof MutationObserver==='undefined') return;
  new MutationObserver(ms=>{ for(const m of ms){ if(m.type==='characterData') fixText(m.target); else m.addedNodes.forEach(n=>n.nodeType===3?fixText(n):n.nodeType===1&&fixEl(n)); } }).observe(main,{subtree:true,childList:true,characterData:true});
})();

/* ============================ فحص الصوت العربي ============================
   إن لم يكن على الجهاز صوت عربي للقراءة الآلية تظهر لافتة واحدة بخطوات تثبيته بدل صمت بلا تفسير. */
/* قراءات العدّ المحفوظة: أرقام فقط. أي قيمة أخرى (من نسخة احتياطية معدّلة مثلاً) تُهمل ولا تصل إلى الصفحة */
function nums(o){ const r={}; if(o&&typeof o==='object') for(const k of Object.keys(o)){ const v=o[k]; if(k==='audio') r[k]=v; else if((typeof v==='number'||typeof v==='string')&&v!==''&&Number.isFinite(Number(v))) r[k]=Number(v); } return r; }
/* لوح الرسم المشترك (دفتري): ألوان، ممحاة، تراجع؛ النقطة تُرسم؛ «امسح» يُتراجع عنه؛ ولا يُرسم فوق رسم محفوظ لم يُحمَّل بعد */
function sketchPad({key='drawing'}={}){ const cv=$('#cv'), clr=$('#clr'); if(!cv) return; const c=cv.getContext('2d'); const saved=store.get(key,null);
  /* مرجع إلى رسم لم يُحمَّل: نحمّله مرة واحدة. إن بقي مرجعاً بعدها فالرسم مفقود من المخزن؛ نبدأ بلوح فارغ بدل إعادة المشهد بلا نهاية */
  if(saved && Atlas.storage.pendingMedia?.(saved)){ const tried=sketchPad.tried||(sketchPad.tried=new Set()), tk=LESSON.id+':'+key;
    if(!tried.has(tk)){ tried.add(tk); cv.style.pointerEvents='none'; cv.style.opacity='.5'; Atlas.storage.load('atlas:'+LESSON.id+':'+key).then(()=>{ if(document.contains(cv)) show(idx); }); return; } }
  if(saved && !Atlas.storage.pendingMedia?.(saved)){ const im=new Image(); im.onload=()=>c.drawImage(im,0,0); im.src=saved; }
  const INK=[['#2A2422','أسود'],['#C0392B','أحمر'],['#2F6DB5','أزرق'],['#2E8B57','أخضر']]; let color=INK[0][0], erase=false, dr=false, moved=false; const undo=[];
  const bar=document.createElement('div'); bar.className='row pad-tools'; bar.setAttribute('role','toolbar'); bar.setAttribute('aria-label','أدوات الرسم');
  bar.innerHTML=INK.map(([h,n],i)=>`<button type="button" class="sw${i?'':' on'}" data-ink="${h}" style="background:${h}" aria-label="${n}" aria-pressed="${!i}"></button>`).join('')+'<button type="button" class="opt tool" data-erase aria-pressed="false">🩹 ممحاة</button><button type="button" class="opt tool" data-undo disabled>↩ تراجع</button>';
  cv.before(bar);
  const pick=b=>{ bar.querySelectorAll('[data-ink],[data-erase]').forEach(x=>{ x.classList.remove('on'); x.setAttribute('aria-pressed','false'); }); b.classList.add('on'); b.setAttribute('aria-pressed','true'); };
  const snap=()=>{ try{ undo.push(c.getImageData(0,0,cv.width,cv.height)); if(undo.length>8) undo.shift(); bar.querySelector('[data-undo]').disabled=false; }catch{} };
  const blank=()=>{ const d=c.getImageData(0,0,cv.width,cv.height).data; for(let i=3;i<d.length;i+=4) if(d[i]) return false; return true; };
  const save=()=>store.set(key, blank()?null:cv.toDataURL());
  bar.onclick=e=>{ const b=e.target.closest('button'); if(!b) return;
    if(b.dataset.ink){ color=b.dataset.ink; erase=false; pick(b); } else if('erase' in b.dataset){ erase=true; pick(b); }
    else if('undo' in b.dataset){ const d=undo.pop(); if(d){ c.putImageData(d,0,0); save(); } b.disabled=!undo.length; } };
  const pos=e=>{ const r=cv.getBoundingClientRect(); return [(e.clientX-r.left)*cv.width/r.width,(e.clientY-r.top)*cv.height/r.height]; };
  const pen=()=>{ c.lineCap='round'; c.lineJoin='round'; c.globalCompositeOperation=erase?'destination-out':'source-over'; c.lineWidth=erase?26:5; c.strokeStyle=color; c.fillStyle=color; };
  cv.onpointerdown=e=>{ if(e.button) return; snap(); dr=true; moved=false; try{ cv.setPointerCapture(e.pointerId); }catch{} const [x,y]=pos(e); pen(); c.beginPath(); c.moveTo(x,y); e.preventDefault(); };
  cv.onpointermove=e=>{ if(!dr) return; const [x,y]=pos(e); moved=true; c.lineTo(x,y); c.stroke(); e.preventDefault(); };
  const end=e=>{ if(!dr) return; dr=false; if(!moved){ const [x,y]=pos(e); c.beginPath(); c.arc(x,y,c.lineWidth/2,0,7); c.fill(); } c.globalCompositeOperation='source-over'; save(); };
  cv.onpointerup=end; cv.onpointercancel=end;
  if(clr) clr.onclick=()=>{ if(blank()) return; snap(); c.clearRect(0,0,cv.width,cv.height); save(); };
}

/* تكبير الصورة التوضيحية: لمسة (أو Enter) على img.art تعرضها ملء الشاشة؛ لمسة أخرى أو Esc تغلقها */
(function(){ if(typeof document==='undefined'||!document.addEventListener) return;
  const close=()=>{ const z=document.querySelector('.zoom'); if(z){ z.remove(); z._from?.focus?.(); } };
  const open=im=>{ close(); const z=document.createElement('div'); z.className='zoom'; z.setAttribute('role','dialog'); z.setAttribute('aria-label','الصورة مكبّرة'); z._from=im;
    const big=document.createElement('img'); big.src=im.currentSrc||im.src; big.alt=''; const x=document.createElement('button'); x.type='button'; x.textContent='✕'; x.setAttribute('aria-label','إغلاق');
    z.append(big,x); z.onclick=close; document.body.appendChild(z); x.focus(); };
  document.addEventListener('click',e=>{ const im=e.target.closest?.('img.art'); if(im&&im.naturalWidth) open(im); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') close(); else if((e.key==='Enter'||e.key===' ')&&e.target.matches?.('img.art')){ e.preventDefault(); open(e.target); } });
})();

/* لمسة قريبة تكفي: الأهداف الصغيرة في الرسوم (محطات، خلايا، صفائح، جزيئات…) تقبل لمسة على بعد يكمل
   منطقة 44×44 بكسل حولها؛ ويُختار الأقرب إن تقاربت. لا يمس ما لُمس مباشرة ولا الأزرار. */
(function(){ if(typeof document==='undefined'||!document.addEventListener) return;
  const SMALL='.jt,.st,.cell,.mol,.seg,.ring,.layer,.bub', MIN=44;
  const SKIP=SMALL+',button,a,input,textarea,select,label,canvas,.hot,.opt,.chip,[data-i],[data-o],[data-c],[data-j],[data-s],[data-k],[data-b],[data-p],[data-r],[data-t],[data-q],[data-qq]';
  document.addEventListener('click',e=>{ if(!e.isTrusted||e.button) return; const main=document.getElementById('main'); if(!main||!main.contains(e.target)||e.target.closest?.(SKIP)) return;
    let best=null, bd=Infinity;
    for(const el of main.querySelectorAll(SMALL)){ const r=el.getBoundingClientRect(); if(!r.width&&!r.height) continue; if(getComputedStyle(el).pointerEvents==='none') continue;
      const cx=r.left+r.width/2, cy=r.top+r.height/2, hw=Math.max(r.width,MIN)/2, hh=Math.max(r.height,MIN)/2;
      if(Math.abs(e.clientX-cx)>hw||Math.abs(e.clientY-cy)>hh) continue; const d=Math.hypot(e.clientX-cx,e.clientY-cy); if(d<bd){ bd=d; best=el; } }
    if(best){ e.stopPropagation(); e.preventDefault(); best.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,clientX:e.clientX,clientY:e.clientY})); }
  },true);
})();

(function(){ let shown=false; const note=()=>{ if(shown) return; shown=true; try{ if(sessionStorage.getItem('atlas:ttsNote')) return; sessionStorage.setItem('atlas:ttsNote','1'); }catch{}
    const d=document.createElement('div'); d.className='tts-note'; d.setAttribute('role','status');
    d.innerHTML='<b>لا يوجد صوت عربي للقراءة الآلية على هذا الجهاز</b>، فزر 🔊 لن ينطق. لتثبيته: '+(window.AndroidApp?'الإعدادات ← النظام ← اللغة والإدخال ← تحويل النص إلى كلام ← المحرك المفضّل ← تثبيت بيانات الصوت ← العربية.':'في ويندوز: الإعدادات ← الوقت واللغة ← الكلام ← إضافة أصوات ← العربية. ثم أعد فتح التطبيق.')+' <button type="button">حسناً</button>';
    d.querySelector('button').onclick=()=>d.remove(); document.getElementById('app')?.prepend(d); };
  const check=()=>{ try{ if(window.AndroidApp){ if(AndroidApp.ttsReady()&&!AndroidApp.ttsArabic()) note(); return; } if(!('speechSynthesis' in window)) return note(); const vs=speechSynthesis.getVoices(); if(vs.length&&!localVoice('ar')) note(); }catch{} };
  if(typeof setTimeout!=='function'||!document.getElementById) return; setTimeout(check,2500); try{ speechSynthesis?.addEventListener?.('voiceschanged',check); }catch{}
})();
