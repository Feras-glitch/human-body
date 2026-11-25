الوحدة U09: الجلد والدفاع والحرارة واللقاحات
49 صورة WebP، 1024×1536، في app/v2/img: 23 رسماً تعليمياً متجهياً (SVG) مبنية بالشيفرة في sources/build_u09.py (تستعمل أدوات build_u07.py وbuild_u08.py المشتركة)، و26 صورة قصصية تنتظر التوليد من صاحب المشروع (البرومبتات في prompts/الصور-القصصية-للنسخ.md وprompts/prompts-final-imagegen.json، ومولّدها sources/prompts_u09.py).
الأسماء مطابقة لما يطلبه التطبيق (app/v2/img). مصادر SVG في sources، وstatus.csv وchecksums.json يُحدَّثان مع كل بناء.
النقش بـ Chromium (Playwright) بدل Inkscape. لا كتابة ولا أرقام داخل الصور. معاينة بلا كتابة: build_u09.py --preview=<مجلد>.
حتى تصل الصور القصصية لا تُعرض خاناتها (pic في lesson-runtime.js لا تعرض صورة خانة لم تُولَّد).
بعد توليد صورة قصصية: ضعها في app/v2/img باسمها، وأضف سطرها في status.csv وchecksums.json (الطريقة imagegen)، ثم npm run build.
