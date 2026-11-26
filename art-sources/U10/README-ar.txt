الوحدة U10: النمو والبلوغ والخصوصية والحدود
صور الدرس U10.L01 «كيف أكبر؟»: 6 رسوم تعليمية متجهية (SVG) مبنية بالشيفرة في sources/build_u10.py (تستعمل أدوات build_u07.py وbuild_u08.py وbuild_u09.py المشتركة)، و6 صور قصصية تنتظر التوليد من صاحب المشروع (البرومبتات في prompts/الصور-القصصية-للنسخ.md وprompts/prompts-final-imagegen.json، ومولّدها sources/prompts_u10.py).
الأسماء مطابقة لما يطلبه التطبيق (app/v2/img). مصادر SVG في sources، وstatus.csv وchecksums.json يُحدَّثان مع كل بناء.
النقش بـ Chromium (Playwright). لا كتابة ولا أرقام داخل الصور، ولا رسم لأعضاء تناسلية في أي صورة. معاينة بلا كتابة: build_u10.py --preview=<مجلد>.
حتى تصل الصور القصصية لا تُعرض خاناتها (pic في lesson-runtime.js لا تعرض صورة خانة لم تُولَّد).
بعد توليد صورة قصصية: ضعها في app/v2/img باسمها، وأضف سطرها في status.csv وchecksums.json (الطريقة imagegen)، ثم npm run build.
