#!/usr/bin/env bash
# يبني «استوديو جسم الإنسان» (المرحلة 1: المعلق الصوتي) تطبيقَ أندرويد مستقلاً عن تطبيق الطفل:
#   معرّف آخر (com.feras.humanbody.studio)، واسم آخر، وأصوله studio/ وحده مع خطوط التطبيق.
#   الشيفرة نفسها (MainActivity: عرض محلي بلا إنترنت، وإذن الميكروفون، وحفظ الملف بنافذة النظام).
# الأدوات والمفتاح كما في build-android.sh (ANDROID_JAR وAAPT2 وD8_JAR وSIGNER_JAR، والمفتاح خارج المستودع).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
: "${ANDROID_JAR:?}"; : "${AAPT2:?}"; : "${D8_JAR:?}"; : "${SIGNER_JAR:?}"
AND="$ROOT/packaging/android"
VERSION="$(node -p "require('$ROOT/packaging/desktop/package.json').version")"
VCODE="$(echo "$VERSION" | awk -F. '{print $1*10000+$2*100+$3}')"
B="$ROOT/dist/studio-build"; rm -rf "$B"; mkdir -p "$B"/{assets/www,gen,classes,dex}
OUT="$ROOT/dist/HumanBody-Studio-${VERSION}.apk"

( cd "$ROOT" && node tools/build-studio.mjs )
cp "$ROOT"/studio/*.html "$ROOT"/studio/*.js "$ROOT"/studio/*.css "$B/assets/www/"
mkdir -p "$B/assets/www/fonts" && cp "$ROOT"/app/v2/fonts/app-fonts.css "$ROOT"/app/v2/fonts/noto-sans-sc.css "$ROOT"/app/v2/fonts/IBMPlexSansArabic-*.ttf "$ROOT"/app/v2/fonts/OFL-IBMPlexSansArabic.txt "$B/assets/www/fonts/"
# app-fonts.css يستورد خط الصينية؛ الاستوديو لا يحتاجه
sed -i "/noto-sans-sc.css/d" "$B/assets/www/fonts/app-fonts.css"; rm -f "$B/assets/www/fonts/noto-sans-sc.css"

"$AAPT2" compile --dir "$AND/res" -o "$B/res.zip"
"$AAPT2" compile --dir "$ROOT/packaging/studio/res" -o "$B/studio-res.zip"
"$AAPT2" link -o "$B/base.apk" -I "$ANDROID_JAR" --manifest "$AND/AndroidManifest.xml" \
  --rename-manifest-package com.feras.humanbody.studio \
  --min-sdk-version 24 --target-sdk-version 34 --version-code "$VCODE" --version-name "$VERSION-studio" \
  -A "$B/assets" --java "$B/gen" "$B/res.zip" -R "$B/studio-res.zip" --auto-add-overlay

javac -nowarn -source 1.8 -target 1.8 -bootclasspath "$ANDROID_JAR" -classpath "$ANDROID_JAR" -d "$B/classes" \
  $(find "$AND/src" "$B/gen" -name '*.java')
java -cp "$D8_JAR" com.android.tools.r8.D8 --release --min-api 24 --lib "$ANDROID_JAR" --output "$B/dex" $(find "$B/classes" -name '*.class')
( cd "$B/dex" && zip -q -j "$B/base.apk" classes.dex )

KS="${HB_KEYSTORE:-$HOME/.humanbody/humanbody-2026.jks}"; PROPS="${HB_KEYSTORE_PROPS:-$HOME/.humanbody/keystore.properties}"
case "$(cd "$(dirname "$KS")" 2>/dev/null && pwd -P)" in "$(cd "$ROOT" && pwd -P)"*) echo 'المفتاح داخل المستودع؛ انقله خارجه.' >&2; exit 1;; esac
[ -f "$KS" ] || { echo "لم أجد مفتاح التوقيع في $KS." >&2; exit 1; }
PASS="${HB_KEYSTORE_PASS:-$( [ -f "$PROPS" ] && grep '^password=' "$PROPS" | cut -d= -f2- )}"
java -jar "$SIGNER_JAR" -a "$B/base.apk" -o "$B/signed" --ks "$KS" --ksAlias humanbody --ksPass "$PASS" --ksKeyPass "$PASS" --allowResign >/dev/null
mv "$B"/signed/*.apk "$OUT"
java -jar "$SIGNER_JAR" -a "$OUT" --onlyVerify | grep -E "VERIFY" | head -2
ls -la "$OUT"
