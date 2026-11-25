الوحدة U08: الدماغ والأعصاب والحواس
63 صورة WebP، 1024×1536، كلها في app/v2/img: 27 رسماً تعليمياً متجهياً (SVG) مبنية بالشيفرة في sources/build_u08.py (تستعمل أدوات build_u07.py المشتركة)، و36 صورة قصصية مولّدة وصلت من صاحب المشروع في 25 نوفمبر 2026 (البرومبتات في prompts/prompts-final-imagegen.json، وما استُعمل فعلاً مع تعليمات التصحيح في prompts/prompts-imagegen-used.json، وحدود كل صورة في model_limits.json كما وصلت مع الحزمة).
الأسماء مطابقة لما يطلبه التطبيق (app/v2/img). مصادر SVG في sources، وstatus.csv وchecksums.json يُحدَّثان مع كل بناء.
النقش بـ Chromium (Playwright) بدل Inkscape. لا كتابة ولا أرقام داخل الصور. معاينة بلا كتابة: build_u08.py --preview=<مجلد>.
حين يُستبدل المشهد بتفاعل خاص تُكمّله الصورة ولا تكرّره.
إن أُعيد توليد صورة قصصية: ضعها في app/v2/img باسمها، وحدّث سطرها في status.csv وchecksums.json (الطريقة imagegen)، ثم npm run build.
