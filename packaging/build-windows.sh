#!/usr/bin/env bash
# يبني نسخة ويندوز من لينكس بلا Wine: مجلد محمول (zip) + مُثبِّت (Setup.exe)
# المتطلبات (كلها من إصدارات GitHub — انظر packaging/README.md):
#   ELECTRON_ZIP  electron-vX-win32-x64.zip
#   NSIS_DIR      مجلد NSIS المستخرج من electron-builder-binaries (فيه linux/makensis)
#   PEFILE_DIR    مجلد مكتبة pefile (لتغيير أيقونة exe)
#
# نوع البناء إلزامي (المراجعة 20، القرار 3):
#   BUILD_KIND=draft    مسودة للتجربة في البيت: «مسودة غير معتمدة» في «عن التطبيق» وفي أسماء الملفات والمُثبِّت
#   BUILD_KIND=release  إصدار: يُرفض ما لم يعتمد المراجعون كل درس وتطابق الكتب المحتوى (tools/release-gate.sh)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
case "${BUILD_KIND:-}" in
  draft) TAG='-draft' ;;
  release) bash "$ROOT/tools/release-gate.sh" || exit 1; TAG='' ;;
  *) echo 'اضبط BUILD_KIND=draft (مسودة غير معتمدة للتجربة) أو BUILD_KIND=release (إصدار؛ يُرفض دون اعتماد المراجعين).' >&2; exit 2 ;;
esac
( cd "$ROOT" && node tools/build-info.mjs --check )
: "${ELECTRON_ZIP:?}"; : "${NSIS_DIR:?}"; : "${PEFILE_DIR:?}"
# ن-12: Electron خارج الدعم = Chromium بلا ترقيعات أمنية. تدعم Electron آخر ثلاثة إصدارات رئيسية فقط؛
# الحد الأدنى هنا يُحدَّث من https://endoflife.date/electron (في 12 نوفمبر 2026: المدعومة 43 و44 و45، وينتهي دعم 43 في 5 يناير 2027).
ELECTRON_MIN_MAJOR="${ELECTRON_MIN_MAJOR:-43}"
EV="$(unzip -p "$ELECTRON_ZIP" version 2>/dev/null | tr -d 'v\r\n' || true)"
if [ -z "$EV" ] || [ "${EV%%.*}" -lt "$ELECTRON_MIN_MAJOR" ]; then
  MSG="Electron ${EV:-غير معروف} خارج الدعم الأمني (المطلوب ${ELECTRON_MIN_MAJOR} فما فوق؛ آخرها electron-v45.x-win32-x64.zip من إصدارات Electron على GitHub)."
  [ "$BUILD_KIND" = release ] && { echo "✗ $MSG" >&2; exit 1; }
  echo "⚠ $MSG المسودة تُبنى به؛ الإصدار يُرفض." >&2
fi
# الحزمة هي الرسمية؟ بصمتها تطابق المدرج لإصدارها في packaging/desktop/electron.sha256
ESUM="$(sha256sum "$ELECTRON_ZIP" | cut -d' ' -f1)"
EPIN="$(awk -v v="$EV" '$1==v{print $2}' "$ROOT/packaging/desktop/electron.sha256")"
if [ -n "$EPIN" ] && [ "$EPIN" != "$ESUM" ]; then echo "✗ بصمة electron-v$EV لا تطابق البصمة الرسمية المدرجة: الحزمة معدّلة أو تالفة." >&2; exit 1; fi
if [ -z "$EPIN" ]; then
  MSG="Electron $EV غير مدرج في packaging/desktop/electron.sha256: أضف بصمته الرسمية من SHASUMS256.txt."
  [ "$BUILD_KIND" = release ] && { echo "✗ $MSG" >&2; exit 1; }
  echo "⚠ $MSG" >&2
fi
echo "Electron $EV ($ESUM)"
VERSION="$(node -p "require('$ROOT/packaging/desktop/package.json').version")"
OUT="$ROOT/dist"; APP="$OUT/HumanBody"
rm -rf "$APP" && mkdir -p "$APP"

# 1) Electron
unzip -q "$ELECTRON_ZIP" -d "$APP"
mv "$APP/electron.exe" "$APP/HumanBody.exe"
rm -f "$APP/resources/default_app.asar"
find "$APP/locales" -name '*.pak' ! -name 'ar.pak' ! -name 'en-US.pak' -delete
python3 "$ROOT/packaging/desktop/set_exe_icon.py" "$APP/HumanBody.exe" "$ROOT/packaging/icon/icon-1024.png" "$PEFILE_DIR"

# 2) التطبيق
RES="$APP/resources/app"; mkdir -p "$RES/www"
cp "$ROOT/packaging/desktop/main.js" "$ROOT/packaging/desktop/preload.js" "$ROOT/packaging/desktop/update.js" "$ROOT/packaging/update-key.pub.pem" "$ROOT/packaging/desktop/package.json" "$ROOT/packaging/icon/app.ico" "$RES/"
( cd "$ROOT/app/v2" && tar cf - --exclude='*-template.html' . ) | ( cd "$RES/www" && tar xf - )
( cd "$ROOT" && node tools/build-info.mjs "$RES/www" "$BUILD_KIND" )

# 3) قائمة ما يثبّته المُثبِّت (ن-19): التحديث والإزالة يحذفان ما فيها وحده، لا مجلد التثبيت بكامله.
#    المُثبِّت يقرأها بترميز ANSI، فأسماء الملفات لاتينية فقط.
LIST="$OUT/HumanBody.files"
if ( cd "$APP" && find . | LC_ALL=C grep -qP '[^\x00-\x7F]' ); then echo 'اسم ملف غير لاتيني في الحزمة: المُثبِّت لا يقرؤه من قائمته.' >&2; exit 1; fi
( cd "$APP"
  find . -type f | sed 's#^\./##' | LC_ALL=C sort | sed 's#/#\\#g; s#^#F #'
  echo 'F Uninstall.exe'
  find . -mindepth 1 -type d | sed 's#^\./##' | awk -F/ '{print NF"\t"$0}' | LC_ALL=C sort -t"$(printf '\t')" -k1,1nr -k2 | cut -f2- | sed 's#/#\\#g; s#^#D #'
) | sed 's/$/\r/' > "$LIST"

# 4) المحمولة (zip) والمُثبِّت
( cd "$OUT" && rm -f "HumanBody-Windows-${VERSION}${TAG}-portable.zip" && zip -qr -9 "HumanBody-Windows-${VERSION}${TAG}-portable.zip" HumanBody )
NSISDIR="$NSIS_DIR" "$NSIS_DIR/linux/makensis" -INPUTCHARSET UTF8 -V2 -DSRC="$APP" -DVERSION="$VERSION" \
  -DTAG="$TAG" -DLIST="$LIST" -DOUT="$OUT/HumanBody-Windows-${VERSION}${TAG}-Setup.exe" "$ROOT/packaging/desktop/installer.nsi"
ls -la "$OUT"/*"${VERSION}${TAG}"*.zip "$OUT"/*"${VERSION}${TAG}"*.exe
