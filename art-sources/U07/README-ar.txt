الوحدة U07: الكليتان والماء
40 صورة WebP، 1024×1536: 18 رسماً تعليمياً متجهياً (SVG) مبنية بالشيفرة في sources/build_u07.py، و22 صورة قصصية تنتظر التوليد (prompts/prompts-final-imagegen.json والوثيقة 26).
الأسماء مطابقة لما يطلبه التطبيق (app/v2/img). مصادر SVG في sources، وstatus.csv وchecksums.json يُحدَّثان مع كل بناء.
النقش بـ Chromium (Playwright) بدل Inkscape. لا كتابة ولا أرقام داخل الصور.
بعد توليد الصور القصصية: ضعها في app/v2/img بأسمائها، وأضف سطرها في status.csv بطريقة imagegen، ثم npm run build.
