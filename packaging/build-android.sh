#!/usr/bin/env bash
# يبني APK أندرويد بلا Android SDK ولا Gradle (كل الأدوات من إصدارات GitHub — انظر packaging/README.md)
#   ANDROID_JAR  android.jar (API 34)            AAPT2   aapt2 (من apktool: prebuilt/linux/aapt2_64)
#   D8_JAR       jar فيه com.android.tools.r8.D8 (jadx-*-all.jar)
#   SIGNER_JAR   uber-apk-signer-*.jar (توقيع v1/v2/v3 + zipalign)
# مفتاح التوقيع: packaging/android/signing/ — يُنشأ أول مرة ويجب الاحتفاظ به
# (التحديث فوق نسخة مثبتة يتطلب المفتاح نفسه، وإلا لزم حذف التطبيق فيضيع تقدّم الطفل).
#
# نوع البناء إلزامي (المراجعة 20، القرار 3):
#   BUILD_KIND=draft    مسودة للتجربة في البيت: «مسودة غير معتمدة» في «عن التطبيق» وفي اسم الملف ورقم الإصدار
#   BUILD_KIND=release  إصدار: يُرفض ما لم يعتمد المراجعون كل درس وتطابق الكتب المحتوى (tools/release-gate.sh)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
case "${BUILD_KIND:-}" in
  draft) TAG='-draft' ;;
  release) bash "$ROOT/tools/release-gate.sh" || exit 1; TAG='' ;;
  *) echo 'اضبط BUILD_KIND=draft (مسودة غير معتمدة للتجربة) أو BUILD_KIND=release (إصدار؛ يُرفض دون اعتماد المراجعين).' >&2; exit 2 ;;
esac
( cd "$ROOT" && node tools/build-info.mjs --check )
: "${ANDROID_JAR:?}"; : "${AAPT2:?}"; : "${D8_JAR:?}"; : "${SIGNER_JAR:?}"
AND="$ROOT/packaging/android"
VERSION="$(node -p "require('$ROOT/packaging/desktop/package.json').version")"
VCODE="${VERSION_CODE:-$(echo "$VERSION" | awk -F. '{print $1*10000+$2*100+$3}')}"
B="$ROOT/dist/android-build"; rm -rf "$B"; mkdir -p "$B"/{assets,gen,classes,dex}
OUT="$ROOT/dist/HumanBody-Android-${VERSION}${TAG}.apk"

# 1) الأصول: نسخة من التطبيق + جسر أندرويد محقون أول كل صفحة
( cd "$ROOT/app/v2" && tar cf - --exclude='*-template.html' . ) | ( mkdir -p "$B/assets/www" && cd "$B/assets/www" && tar xf - )
cp "$AND/android-bridge.js" "$B/assets/www/android-bridge.js"
( cd "$ROOT" && node tools/build-info.mjs "$B/assets/www" "$BUILD_KIND" )
python3 - "$B/assets/www" <<'PY'
import sys, re, os
tag = '<script src="/www/android-bridge.js"></script>'
n_files = 0
for d, _, fs in os.walk(sys.argv[1]):
    for name in fs:
        if not name.endswith('.html'): continue
        f = os.path.join(d, name); s = open(f, encoding='utf-8').read()
        if tag in s: continue
        s2, n = re.subn(r'(<head[^>]*>)', lambda m: m.group(1) + tag, s, count=1)
        if not n: s2 = tag + s
        open(f, 'w', encoding='utf-8').write(s2); n_files += 1
print('bridge injected into', n_files, 'pages')
PY

# 2) الموارد والبيان
"$AAPT2" compile --dir "$AND/res" -o "$B/res.zip"
"$AAPT2" link -o "$B/base.apk" -I "$ANDROID_JAR" --manifest "$AND/AndroidManifest.xml" \
  --min-sdk-version 24 --target-sdk-version 34 --version-code "$VCODE" --version-name "$VERSION$TAG" \
  -A "$B/assets" -0 webp --java "$B/gen" "$B/res.zip"

# 3) الشيفرة: javac ← d8
javac -nowarn -source 1.8 -target 1.8 -bootclasspath "$ANDROID_JAR" -classpath "$ANDROID_JAR" -d "$B/classes" \
  $(find "$AND/src" "$B/gen" -name '*.java')
java -cp "$D8_JAR" com.android.tools.r8.D8 --release --min-api 24 --lib "$ANDROID_JAR" --output "$B/dex" $(find "$B/classes" -name '*.class')
( cd "$B/dex" && zip -q -j "$B/base.apk" classes.dex )

# 4) التوقيع والمحاذاة
# مفتاح التوقيع لا يُحفظ في المستودع أبداً (من يملكه يستطيع توقيع تحديث مزيف).
# يُقرأ من خارج المستودع: HB_KEYSTORE (المسار) وHB_KEYSTORE_PASS (كلمة السر)،
# أو من الملفين الافتراضيين في ~/.humanbody/ (humanbody-2026.jks وkeystore.properties).
KS="${HB_KEYSTORE:-$HOME/.humanbody/humanbody-2026.jks}"; PROPS="${HB_KEYSTORE_PROPS:-$HOME/.humanbody/keystore.properties}"
case "$(cd "$(dirname "$KS")" 2>/dev/null && pwd -P)" in "$(cd "$ROOT" && pwd -P)"*) echo 'المفتاح داخل المستودع؛ انقله خارجه.' >&2; exit 1;; esac
if [ ! -f "$KS" ]; then
  echo "لم أجد مفتاح التوقيع في $KS. ضع الملف هناك (أو اضبط HB_KEYSTORE). لا تُنشئ مفتاحاً جديداً لتحديث تطبيق مثبَّت." >&2
  exit 1
fi
PASS="${HB_KEYSTORE_PASS:-$( [ -f "$PROPS" ] && grep '^password=' "$PROPS" | cut -d= -f2- )}"
[ -n "$PASS" ] || { echo 'اضبط HB_KEYSTORE_PASS أو ضع keystore.properties بجانب المفتاح.' >&2; exit 1; }
java -jar "$SIGNER_JAR" -a "$B/base.apk" -o "$B/signed" --ks "$KS" --ksAlias humanbody --ksPass "$PASS" --ksKeyPass "$PASS" --allowResign >/dev/null
mv "$B"/signed/*.apk "$OUT"
java -jar "$SIGNER_JAR" -a "$OUT" --onlyVerify | grep -E "VERIFY|signature|scheme" | head -6
ls -la "$OUT"
