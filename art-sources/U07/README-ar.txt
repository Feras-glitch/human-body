الوحدة U07: الكليتان والماء
40 صورة WebP، 1024×1536: 18 رسماً تعليمياً متجهياً (SVG) مبنية بالشيفرة في sources/build_u07.py، و22 صورة قصصية مولّدة وصلت من صاحب المشروع في 25 نوفمبر 2026، كلها في app/v2/img (البرومبتات في prompts/prompts-final-imagegen.json، وما استُعمل فعلاً مع تعليمات التصحيح الست في prompts/prompts-imagegen-used.json، والحدود في model_limits.json كما وصلت مع الحزمة).
الأسماء مطابقة لما يطلبه التطبيق (app/v2/img). مصادر SVG في sources، وstatus.csv وchecksums.json يُحدَّثان مع كل بناء.
النقش بـ Chromium (Playwright) بدل Inkscape. لا كتابة ولا أرقام داخل الصور.
إن أُعيد توليد صورة قصصية: ضعها في app/v2/img باسمها، وحدّث سطرها في status.csv وchecksums.json (الطريقة imagegen)، ثم npm run build.
