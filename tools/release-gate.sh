#!/usr/bin/env bash
# بوابة «الإصدار» (المراجعة 20، القرار 3): لا يُحزم إصدار إلا إذا
#   1) اعتمد المراجع العلمي والمراجع الشرعي كل درس (reviewed:true وscience_reviewed_by يكتبها البشر وحدهم)
#   2) والكتب المطبوعة في build/pdf من المحتوى الحالي نفسه (بصمة المحتوى)
# ما لم يجتزها يُبنى مسودة فقط: BUILD_KIND=draft، ويُوسم «مسودة غير معتمدة» في «عن التطبيق» واسم الملف.
# لا تعدّل هذا الملف لتمرير بناء.
set -uo pipefail
cd "$(dirname "$0")/.."
fail=0
if ! out="$(node tools/validate.mjs --release lessons/*.json 2>&1)"; then
  n="$(printf '%s\n' "$out" | grep -c '^الدرس ')"
  blocked="$(printf '%s\n' "$out" | grep -cE 'لا اعتماد علمي بشري|لم يعتمده مراجع شرعي')"
  echo "✗ اعتماد المراجعين: ${blocked} بنداً من ${n} درساً بلا اعتماد بشري (node tools/validate.mjs --release lessons/*.json للتفاصيل)." >&2
  fail=1
fi
node tools/check-books.mjs >&2 || fail=1
if [ "$fail" != 0 ]; then
  echo 'رُفض بناء الإصدار. للتجربة في البيت ابنِ مسودة: BUILD_KIND=draft' >&2
  exit 1
fi
echo 'بوابة الإصدار: اعتماد المراجعين كامل والكتب من المحتوى الحالي.'
