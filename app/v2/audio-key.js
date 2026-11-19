/* بصمة النص المسموع (D09، المراجعة 20 ن-20): مفتاح تسجيل بشري في window.AUDIO.
   المصدر الوحيد للحساب: يحمّله التطبيق قبل engine.js، وتحمّله أداة البناء (tools/build-scenes.mjs) لتربط
   كل نص في قائمة التسجيل (build/<الدرس>/audio-manifest.json) بملفه في app/v2/audio/<الدرس>/.
   - عبارة النداء بالاسم تُحذف كما في نص التسجيل (tools/text.mjs: expand بلا اسم)، فالاسم لا يُسجَّل
   - يُبقي الحروف والأرقام وحدها: لا يؤثر وسم ولا ترقيم ولا تشكيل ولا مسافة
   - تغيّر حرف في النص يغيّر البصمة، فلا يُسمع تسجيل نص قديم أبداً */
(function (root) {
  var ENT = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };
  function audioKey(t) {
    var s = String(t || '').replace(/<bdi data-raw>[^<]*<\/bdi>/g, '{اسم}');
    s = s.replace(/،?\s*يا \{اسم\}/g, '').replace(/\{اسم\}،\s*/g, '').replace(/\{اسم\}/g, '');
    s = s.replace(/<[^>]*>/g, ' ').replace(/&(amp|lt|gt|quot|#39|nbsp);/g, function (m) { return ENT[m]; });
    s = s.replace(/[^\p{L}\p{N}]/gu, '');
    if (!s) return '';
    var h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return ('0000000' + h.toString(16)).slice(-8) + '.' + s.length.toString(36);
  }
  root.audioKey = audioKey;
  if (typeof module !== 'undefined' && module.exports) module.exports = { audioKey: audioKey };
})(typeof window !== 'undefined' ? window : globalThis);
