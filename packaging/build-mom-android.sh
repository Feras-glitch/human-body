#!/usr/bin/env bash
# يبني «妈妈指南» دليل الأم بالصينية تطبيقَ أندرويد مستقلاً عن تطبيق الأطفال (قرار 28 نوفمبر: نسختان من مصدر واحد):
#   معرّف آخر (com.feras.humanbody.mom)، واسم آخر، وأصوله mom/ وحده مع خطوطه (tools/stage-mom.mjs)؛ لا شيء منه في تطبيق الأطفال.
#   الشيفرة نفسها (MainActivity: عرض محلي بلا إنترنت)، وجسر أندرويد للنطق والطباعة.
# الأدوات والمفتاح كما في build-android.sh (ANDROID_JAR وAAPT2 وD8_JAR وSIGNER_JAR، والمفتاح خارج المستودع).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
: "${ANDROID_JAR:?}"; : "${AAPT2:?}"; : "${D8_JAR:?}"; : "${SIGNER_JAR:?}"
AND="$ROOT/packaging/android"
VERSION="$(node -p "require('$ROOT/packaging/desktop/package.json').version")"
VCODE="$(echo "$VERSION" | awk -F. '{print $1*10000+$2*100+$3}')"
B="$ROOT/dist/mom-build"; rm -rf "$B"; mkdir -p "$B"/{assets/www,gen,classes,dex}
OUT="$ROOT/dist/HumanBody-MomGuide-zh-${VERSION}.apk"

( cd "$ROOT" && node tools/build-mom-guide.mjs && node tools/stage-mom.mjs "$B/assets/www" )
cp "$AND/android-bridge.js" "$B/assets/www/android-bridge.js"
for f in "$B"/assets/www/*.html; do sed -i '0,/<head>/s##<head><script src="/www/android-bridge.js"></script>#' "$f"; done

"$AAPT2" compile --dir "$AND/res" -o "$B/res.zip"
"$AAPT2" compile --dir "$ROOT/packaging/mom/res" -o "$B/mom-res.zip"
"$AAPT2" link -o "$B/base.apk" -I "$ANDROID_JAR" --manifest "$AND/AndroidManifest.xml" \
  --rename-manifest-package com.feras.humanbody.mom \
  --min-sdk-version 24 --target-sdk-version 34 --version-code "$VCODE" --version-name "$VERSION-mom" \
  -A "$B/assets" --java "$B/gen" "$B/res.zip" -R "$B/mom-res.zip" --auto-add-overlay

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
