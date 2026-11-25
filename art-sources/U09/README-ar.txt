الوحدة U09: الجلد والدفاع والحرارة واللقاحات
49 صورة WebP، 1024×1536، في app/v2/img: 23 رسماً تعليمياً متجهياً (SVG) مبنية بالشيفرة في sources/build_u09.py (تستعمل أدوات build_u07.py وbuild_u08.py المشتركة)، و26 صورة قصصية مولّدة (imagegen) سلّمها صاحب المشروع ورُوجعت بصرياً (البرومبتات المطلوبة في prompts/الصور-القصصية-للنسخ.md وprompts/prompts-final-imagegen.json ومولّدها sources/prompts_u09.py، والمستعملة فعلاً في prompts/prompts-imagegen-used.json، وحدود النموذج في model_limits.json).
تنقيح محلي واحد: U09.L03-hist1 أُزيل منها برج كاتدرائية في منظر النافذة (سماء وأسطح بيوت بديلة) التزاماً بقاعدة لا رموز دينية في الصور.
الأسماء مطابقة لما يطلبه التطبيق (app/v2/img). مصادر SVG في sources، وstatus.csv وchecksums.json يُحدَّثان مع كل بناء.
النقش بـ Chromium (Playwright) بدل Inkscape. لا كتابة ولا أرقام داخل الصور. معاينة بلا كتابة: build_u09.py --preview=<مجلد>.
الصور الـ49 كلها مثبّتة؛ status.csv وchecksums.json يغطيانها (SVG وimagegen).
