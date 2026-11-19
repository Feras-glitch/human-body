/* جسر أندرويد — يُحقن أول كل صفحة في نسخة الـAPK فقط.
   يسد ما لا يدعمه WebView: النطق (speechSynthesis)، والطباعة، وتنزيل ملف التصدير. */
(function () {
  var A = window.AndroidApp;
  if (!A) return;

  function Utterance(text) {
    this.text = text || ''; this.lang = 'ar'; this.rate = 1; this.pitch = 1; this.volume = 1;
    this.voice = null; this.onstart = null; this.onend = null; this.onerror = null;
  }
  var synth = {
    pending: false, paused: false, onvoiceschanged: null,
    get speaking() { try { return A.isSpeaking(); } catch (e) { return false; } },
    speak: function (u) {
      try { A.speak(String(u && u.text || ''), String(u && u.lang || 'ar'), Number(u && u.rate || 1)); } catch (e) {}
      if (u && typeof u.onstart === 'function') { try { u.onstart({}); } catch (e) {} }
    },
    cancel: function () { try { A.stop(); } catch (e) {} },
    pause: function () { try { A.stop(); } catch (e) {} },
    resume: function () {},
    getVoices: function () {
      try { return A.ttsArabic() ? [{ name: 'Android', lang: 'ar', voiceURI: 'android-ar', localService: true, default: true }] : []; }
      catch (e) { return []; }
    },
    addEventListener: function () {}, removeEventListener: function () {}
  };
  try { Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: Utterance, configurable: true, writable: true }); } catch (e) { window.SpeechSynthesisUtterance = Utterance; }
  try { Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true }); } catch (e) { window.speechSynthesis = synth; }

  window.print = function () { try { A.print(); } catch (e) {} };

  function saveLink(a) {
    var name = a.getAttribute('download') || 'file';
    fetch(a.href).then(function (r) { return r.blob(); }).then(function (b) {
      var fr = new FileReader();
      fr.onload = function () { var s = String(fr.result); A.saveFile(name, b.type || 'application/octet-stream', s.slice(s.indexOf(',') + 1)); };
      fr.readAsDataURL(b);
    });
  }
  var isLocalData = function (h) { return /^(data|blob):/.test(h || ''); };
  var origClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    if (this.hasAttribute('download') && isLocalData(this.href)) { saveLink(this); return; }
    return origClick.call(this);
  };
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[download]') : null;
    if (a && isLocalData(a.href)) { e.preventDefault(); saveLink(a); }
  }, true);
})();
