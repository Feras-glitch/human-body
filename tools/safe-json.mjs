// تضمين بيانات في <script> داخل صفحة HTML: «</script» أو «<!--» في نص درس لا يكسر الصفحة ولا يُنفَّذ ما بعده
// (المراجعة 20، ن-7). تهريب < ومحرفي فاصل السطر داخل سلاسل JSON صالح في JavaScript.
export const safeJSON = (v) => JSON.stringify(v).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
