# تغليف التطبيق: ويندوز وأندرويد

التطبيق نفسه هو `app/v2/` (صفحات HTML تعمل بلا إنترنت؛ الخطوط محلية في `app/v2/fonts/`). هذا المجلد يغلّفه لنظامين، ويُبنى كله **من لينكس بلا Wine ولا Android SDK ولا Gradle**، بأدوات من إصدارات GitHub فقط.

| الملف الناتج (في `dist/`) | ما هو |
|---|---|
| `HumanBody-Windows-<v>[-draft]-Setup.exe` | مُثبِّت ويندوز 10/11 (64 بت) للمستخدم الحالي بلا صلاحيات مدير؛ اختصار على سطح المكتب وفي قائمة ابدأ؛ إزالة من «التطبيقات» |
| `HumanBody-Windows-<v>[-draft]-portable.zip` | النسخة نفسها بلا تثبيت: فكّ الضغط وشغّل `HumanBody.exe` |
| `HumanBody-Android-<v>[-draft].apk` | أندرويد 7 فما فوق (هاتف وتابلت)، موقّع v2+v3 |

## نوعان من البناء (المراجعة 20، القرار 3)
| `BUILD_KIND` | لمن | ما يحدث |
|---|---|---|
| `draft` | التجربة في البيت قبل اعتماد المراجعين | يُبنى، ويوسم **«مسودة غير معتمدة»** في «عن التطبيق» (شاشة ولي الأمر، وقائمة «مساعدة» في ويندوز)، و`-draft` في اسم الملف ورقم الإصدار الظاهر في أندرويد وفي «التطبيقات» بويندوز |
| `release` | النشر | **يُرفض** ما لم يعتمد المراجع العلمي والمراجع الشرعي كل درس (`node tools/validate.mjs --release`) وتكن الكتب المطبوعة في `build/pdf` من المحتوى الحالي (`node tools/check-books.mjs`) — `tools/release-gate.sh` |

النوع إلزامي: سكربت بلا `BUILD_KIND` يتوقف. وكل حزمة تحمل `www/build-info.json`: النوع، والإصدار، و**بصمة المحتوى** (الرقم نفسه على غلاف كتاب المعلم)، والالتزام، وتاريخ البناء. ويرفض السكربتان الحزم إن كان `app/v2` مبنياً من دروس أقدم (`node tools/build-info.mjs --check`؛ الحل `npm run build`).

`bash tools/release.sh draft|release` يشغّل الفحوص كلها بالترتيب (المحتوى، والتوليد بلا فرق عن المستودع، والاختبارات، والمشي الآلي، والمصطلحات، والكتب، وبوابة الإصدار) ثم يحزم ما وُجدت أدواته، ويكتب `dist/SHA256SUMS.txt`.

## ما يحفظه كل نظام
- **ويندوز:** التقدّم والتسجيلات في `%APPDATA%\HumanBodyCurriculum` — يبقى بعد التحديث. عند الإزالة يُسأل ولي الأمر: «لا» (المختار) يبقيه ويعود إن أُعيد التثبيت، و«نعم» يحذفه نهائياً؛ الإزالة الصامتة (`/S`) تبقيه.
- **المُثبِّت لا يُغلق التطبيق قسراً:** إن كان مفتوحاً يطلب إغلاقه أولاً (قد يكون الطفل في منتصف تسجيل أو رسم). ولا يحذف مجلداً بكامله: يكتب قائمة ما ثبّته (`HumanBody.files`)، والتحديث والإزالة يحذفان ما فيها وحده.
- **أندرويد:** داخل بيانات التطبيق — يبقى بعد التحديث **بشرط التوقيع بالمفتاح نفسه**، ويُحذف إن أُزيل التطبيق.

## مفتاح توقيع أندرويد — مهم
**كلمة سر المفتاح تمر في سطر الأوامر** إلى uber-apk-signer (`--ksPass`)، فيراها في قائمة العمليات كل مستخدم آخر على الجهاز وقت البناء: ابنِ على جهاز لا يشاركك فيه أحد، ولا تبنِ على خادم مشترك.

مفتاح التوقيع **لا يُحفظ في المستودع**: يُقرأ عند البناء من `~/.humanbody/humanbody-2026.jks` وبجانبه `keystore.properties`، أو من المتغيّرين `HB_KEYSTORE` و`HB_KEYSTORE_PASS` (انظر `android/signing/README.md`). **كل تحديث يجب أن يُوقَّع بهذا المفتاح نفسه**؛ وإلا رفض أندرويد التثبيت فوق النسخة القديمة. استُبدل المفتاح في 1.1.7 لأن السابق كان في المستودع، فالأجهزة التي ثبّتت 1.1.x تحتاج إعادة تثبيت مرة واحدة بعد نسخة احتياطية.

## الأدوات (تُنزَّل مرة واحدة)
**Electron:** تدعم Electron آخر ثلاثة إصدارات رئيسية فقط، وما خرج من الدعم يحمل Chromium بلا ترقيعات أمنية. في 13 نوفمبر 2026 المدعومة 43 و44 و45 ([endoflife.date/electron](https://endoflife.date/electron))؛ **بُنيت مسودة 1.3.0 بـ Electron 45.3.0** (مدعوم حتى أبريل 2027)، وكانت النسخ حتى 1.2.0 على 33.2.1 الخارج من الدعم منذ أبريل 2025. `build-windows.sh` ينبّه في المسودة ويرفض الإصدار ما دام الإصدار أقل من `ELECTRON_MIN_MAJOR` (43 الآن؛ يُرفع كلما خرج إصدار من الدعم)، ويرفض حزمة تخالف بصمتها البصمة الرسمية المدرجة لإصدارها في `packaging/desktop/electron.sha256` (من `SHASUMS256.txt` في صفحة الإصدار على GitHub)، وينبّه على إصدار غير مدرج ويرفضه في الإصدار. راجعتُ تغييرات Electron 34–45 المعلنة: لا شيء منها يمسّ ما يستعمله `main.js` (أذونات الميكروفون تبقى `media`، والتنزيل ونافذة الحفظ، و`navigationHistory` منذ 32). «عن التطبيق» يكتب رقم Electron.
```bash
DL=~/pkg-tools && mkdir -p $DL && cd $DL
# ويندوز
curl -LO https://github.com/electron/electron/releases/download/v45.3.0/electron-v45.3.0-win32-x64.zip   # أو أحدث إصدار مدعوم
curl -LO https://github.com/ip7z/7zip/releases/download/24.08/7z2408-linux-x64.tar.xz && mkdir 7zip && tar xJf 7z2408-linux-x64.tar.xz -C 7zip
curl -LO https://github.com/electron-userland/electron-builder-binaries/releases/download/nsis-3.0.4.1/nsis-3.0.4.1.7z && ./7zip/7zz x -onsis nsis-3.0.4.1.7z
git clone --depth 1 https://github.com/erocarrera/pefile.git
# أندرويد
curl -LO https://github.com/iBotPeaches/Apktool/releases/download/v2.10.0/apktool_2.10.0.jar && unzip -j apktool_2.10.0.jar prebuilt/linux/aapt2_64 && chmod +x aapt2_64
curl -LO https://github.com/skylot/jadx/releases/download/v1.5.1/jadx-1.5.1.zip && unzip jadx-1.5.1.zip lib/jadx-1.5.1-all.jar   # فيه D8
curl -LO https://github.com/patrickfav/uber-apk-signer/releases/download/v1.3.0/uber-apk-signer-1.3.0.jar
git clone --depth 1 --filter=blob:none --sparse https://github.com/Sable/android-platforms.git && (cd android-platforms && git sparse-checkout set android-34)
```
يلزم أيضاً: Node، وPython 3 مع Pillow، وJDK (javac وkeytool).

**بصمات SHA-256 للأدوات التي بُنيت بها 1.3.0** (وبصمات Electron الرسمية في `packaging/desktop/electron.sha256`) (قابِل بها ما تنزّله قبل تشغيله؛ أداة تختلف بصمتها لا تُستعمل):

| الملف | SHA-256 |
|---|---|
| `electron-v45.3.0-win32-x64.zip` | `b43b532e712a4323f4224627b73808a039c9769fdf7ba1dbc3cb49c1dbfa350b` |
| `nsis-3.0.4.1.7z` | `9877df902530f96357d13a7a31ae2b9df67f48b11ffc9a1700a7c961574ec5fa` |
| `7z2408-linux-x64.tar.xz` | `9b3a2edf0644a2b00b0a39ab6843f426128e4a6f6f98c40f8c02a668e5b5b59b` |
| `apktool_2.10.0.jar` | `c0350abbab5314248dfe2ee0c907def4edd14f6faef1f5d372d3d4abd28f0431` |
| `aapt2_64` (من apktool 2.10.0) | `e9f05c38c1b777d07b3c5a20b1b6ce66e110badc6e31384acd0aae53932b7322` |
| `jadx-1.5.1.zip` | `12fd966431903b8e15c36e5007f19343475be7d8f2a55f082e7a929eeabc937e` |
| `lib/jadx-1.5.1-all.jar` | `dc717e51c08d31a66357933c8d4896755d7c4939745e03aefd02427041f9aa53` |
| `uber-apk-signer-1.3.0.jar` | `e1299fd6fcf4da527dd53735b56127e8ea922a321128123b9c32d619bba1d835` |
| `android-platforms/android-34/android.jar` | `6cea1df3efb77103ac3e2beb9bf4718964b0e0869ab16d39d29d5cbae1c147ad` |
| pefile (git) | الالتزام `58186a92164842cf758822e067bc79c59b3c80d9` |

## البناء
```bash
npm run build   # التطبيق من الدروس الحالية
# ويندوز
BUILD_KIND=draft ELECTRON_ZIP=$DL/electron-v45.3.0-win32-x64.zip NSIS_DIR=$DL/nsis PEFILE_DIR=$DL/pefile packaging/build-windows.sh
# أندرويد
BUILD_KIND=draft ANDROID_JAR=$DL/android-platforms/android-34/android.jar AAPT2=$DL/aapt2_64 \
D8_JAR=$DL/lib/jadx-1.5.1-all.jar SIGNER_JAR=$DL/uber-apk-signer-1.3.0.jar packaging/build-android.sh
```
رقم الإصدار من `desktop/package.json` (يُرفع قبل كل إصدار جديد؛ رقم أندرويد الداخلي يُشتق منه).

## كيف يعمل كل غلاف
- **ويندوز (`desktop/`)**: Electron يفتح `www/index.html`، بقائمة عربية (الرئيسية، رجوع، شاشة ولي الأمر، ملء الشاشة، تكبير)، وإذن الميكروفون وحده مسموح، والتصدير يفتح نافذة حفظ. أيقونة exe تُكتب في خانات الأيقونة الأصلية مباشرة (`set_exe_icon.py`) بلا rcedit.
- **أندرويد (`android/`)**: WebView يقدّم `assets/www` على العنوان المحلي `https://appassets.androidplatform.net/www/` (فيعمل التخزين الدائم والميكروفون والخطوط)، ويُحقن `android-bridge.js` أول كل صفحة ليصل:
  - `speechSynthesis` ← محرك النطق في الجهاز (TextToSpeech، العربية) بصوت مثبّت على الجهاز فقط؛ الصوت الذي يحتاج شبكة لا يُستعمل، لأنه يرسل النص ومعه اسم الطفل خارج الجهاز،
  - `print()` ← خدمة الطباعة في أندرويد،
  - تنزيل ملف التصدير ← نافذة النظام لاختيار المكان (في كل الإصدارات). الملف يبقى بعد إزالة التطبيق. حتى 1.2.0 كان أندرويد 7–9 يحفظه في مجلد التطبيق الخاص، فيُمحى معه.

## النطق الآلي (إلى حين التسجيل البشري)
- **ويندوز:** يحتاج صوتاً عربياً: الإعدادات ← الوقت واللغة ← الكلام ← إضافة أصوات ← العربية.
- **أندرويد:** يحتاج صوتاً عربياً **مثبّتاً على الجهاز** في محرك النطق (Google): الإعدادات ← إمكانية الوصول ← تحويل النص إلى كلام ← تثبيت بيانات الصوت العربية. الصوت الذي يعمل عبر الشبكة لا يُستعمل.

## استوديو جسم الإنسان (للفريق)
`bash packaging/build-studio-android.sh` يبني `dist/HumanBody-Studio-<الإصدار>.apk`: تطبيق مستقل (`com.feras.humanbody.studio`) بالأدوات والمفتاح نفسيهما، أصوله `studio/` وخطوط التطبيق. لا يُوزَّع للأطفال. انظر `docs/24-استوديو-جسم-الإنسان.md`.

## حزمة التحديث الموقّعة
`HB_UPDATE_KEY=<مسار update-signing.pem> node tools/make-update-pack.mjs --base <إيداع النسخة المحزومة>` يصنع `dist/HumanBody-Update-*.zip` يستورده ولي الأمر في أندرويد وويندوز (الوثيقة 24). المفتاح الخاص خارج المستودع، والعام في `packaging/update-key.pub.pem` ومضمَّن في `UpdatePack.java` وينسخه `build-windows.sh` بجانب `main.js`.
