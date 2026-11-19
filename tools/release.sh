#!/usr/bin/env bash
# فحص ما قبل الحزم وحزمه (المراجعة 20، م-5): كل الفحوص بالترتيب، ويقف عند أول فشل.
#   bash tools/release.sh draft     مسودة للتجربة في البيت (توسم «مسودة غير معتمدة»؛ الكتب تنبيه لا مانع)
#   bash tools/release.sh release   إصدار: يُرفض ما لم يعتمد المراجعون كل درس وتطابق الكتب المحتوى
# الحزم نفسها تُبنى إن وُجدت أدواتها في البيئة (انظر packaging/README.md):
#   أندرويد: ANDROID_JAR وAAPT2 وD8_JAR وSIGNER_JAR (والمفتاح خارج المستودع)   ويندوز: ELECTRON_ZIP وNSIS_DIR وPEFILE_DIR
set -euo pipefail
cd "$(dirname "$0")/.."
KIND="${1:-}"
case "$KIND" in draft|release) ;; *) echo 'الاستعمال: bash tools/release.sh draft|release' >&2; exit 2 ;; esac
step() { printf '\n== %s\n' "$1"; }

step 'المحتوى: المخطط والقواعد وبنك الأسئلة'
npm run -s validate
step 'خط المصحف: رموز كل آية من بياناتها، وكل رمز في خط صفحتها'
python3 tools/qpc2_import.py --check
step 'التوليد: التطبيق والكتب من الدروس نفسها، ولا فرق عما في المستودع'
npm run -s build >/dev/null
for f in lessons/*.json; do node tools/generate.mjs "$f" >/dev/null; done
if ! git diff --quiet -- app/v2 build ':!build/pdf'; then
  git diff --stat -- app/v2 build ':!build/pdf' >&2
  echo 'ما في المستودع لا يطابق ما تولّده الدروس: راجع الفرق والتزم به ثم أعد.' >&2; exit 1
fi
step 'الاختبارات'
npm test --silent
step 'المشي الآلي في كل الدروس والاختبارات'
node tools/walk-gen.js --fast
node tools/walk-gen.js --fast --tests
step 'المصطلحات: لا مصطلح قبل تعريفه'
npm run -s test:terms
step 'الكتب المطبوعة من المحتوى الحالي'
if [ "$KIND" = release ]; then node tools/check-books.mjs; else node tools/check-books.mjs --warn; fi
[ "$KIND" = release ] && { step 'بوابة الإصدار'; bash tools/release-gate.sh; }

step "الحزم ($KIND)"
built=0
if [ -n "${ANDROID_JAR:-}" ] && [ -n "${AAPT2:-}" ] && [ -n "${D8_JAR:-}" ] && [ -n "${SIGNER_JAR:-}" ]; then
  BUILD_KIND="$KIND" bash packaging/build-android.sh; built=1
else echo 'أندرويد: تخطٍّ (اضبط ANDROID_JAR وAAPT2 وD8_JAR وSIGNER_JAR)'; fi
if [ -n "${ELECTRON_ZIP:-}" ] && [ -n "${NSIS_DIR:-}" ] && [ -n "${PEFILE_DIR:-}" ]; then
  BUILD_KIND="$KIND" bash packaging/build-windows.sh; built=1
else echo 'ويندوز: تخطٍّ (اضبط ELECTRON_ZIP وNSIS_DIR وPEFILE_DIR)'; fi
# بصمات حزم هذا البناء وحدها (لا الإصدارات القديمة الباقية في dist/)
V="$(node -p "require('./packaging/desktop/package.json').version")$([ "$KIND" = draft ] && echo -draft || true)"
[ "$built" = 1 ] && (cd dist && ls "HumanBody-Android-$V.apk" "HumanBody-Windows-$V-portable.zip" "HumanBody-Windows-$V-Setup.exe" 2>/dev/null | xargs -r sha256sum | tee SHA256SUMS.txt)
echo; echo "تم ($KIND)."
