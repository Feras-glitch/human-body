/* Scene-bound recording: permission requests, tracks and encoders share one lifecycle. */
/* معدل مناسب للكلام: نحو 24 كيلوبت/ثانية (الافتراضي في Chromium أعلى بكثير فيملأ مساحة التخزين).
   إن رفض المتصفح الخيار نعود إلى إعداداته. */
const SPEECH_BITRATE = 24000;
/* وعد يكتمل حين يُحفظ تسجيل قُطع بمغادرة المشهد */
var recSaving = Promise.resolve();

function makeRecorder(stream, mime) {
  const opts = {
    audioBitsPerSecond: SPEECH_BITRATE
  };
  if (mime) opts.mimeType = mime;
  try {
    return new MediaRecorder(stream, opts);
  } catch {
    return mime ? new MediaRecorder(stream, {
      mimeType: mime
    }) : new MediaRecorder(stream);
  }
}

function attachRecorder({
  button,
  player,
  timer,
  seconds = 90,
  onSaved
}) {
  let rec = null,
    stream = null,
    pending = false,
    valid = true,
    leaving = false,
    saved = () => {},
    tick;
  const b = document.querySelector(button),
    a = document.querySelector(player),
    label = document.querySelector(timer);
  const tracks = () => {
    stream?.getTracks().forEach(t => t.stop());
    stream = null
  };
  /* إخفاء الصفحة أثناء التسجيل (حوار إذن، تبديل تطبيق، قفل الشاشة): نوقف التسجيل ونحفظ ما سُجّل بدل إهماله */
  const onHide = () => {
    if (document.hidden && rec?.state === 'recording') {
      b.disabled = true;
      try {
        rec.stop();
      } catch {}
    }
  };
  document.addEventListener('visibilitychange', onHide);
  onSceneLeave(() => {
    document.removeEventListener('visibilitychange', onHide);
    clearInterval(tick);
    /* غادر الطفل المشهد والتسجيل جارٍ: نوقفه ونحفظ ما سُجّل بصمت بدل رميه.
       recSaving يُنتظر قبل مغادرة الصفحة (زر الرئيسية). */
    if (rec?.state === 'recording') {
      leaving = true;
      recSaving = new Promise((res) => {
        saved = res;
        setTimeout(res, 3000);
      });
      try {
        rec.stop()
      } catch {
        saved()
      }
    } else {
      valid = false;
      tracks();
    }
    a?.pause()
  });
  if (a) a.onplay = () => {
    if (pending || rec?.state === 'recording') a.pause()
  };
  b.onclick = async () => {
    if (pending) return;
    if (rec?.state === 'recording') {
      b.disabled = true;
      rec.stop();
      return
    }
    pending = true;
    b.disabled = true;
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') throw new Error(
        'unsupported');
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      if (!valid) {
        tracks();
        return
      }
      stopPlayback();
      const mime = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'].find(m => MediaRecorder
        .isTypeSupported(m));
      rec = makeRecorder(stream, mime);
      const chunks = [],
        start = Date.now();
      rec.ondataavailable = e => {
        if (e.data.size) chunks.push(e.data)
      };
      rec.onerror = () => {
        clearInterval(tick);
        tracks();
        if (valid) {
          label.textContent = 'تعذر التسجيل؛ أعد المحاولة';
          b.disabled = false;
          b.classList.remove('stop')
        }
      };
      rec.onstop = () => {
        clearInterval(tick);
        tracks();
        if (!valid) return;
        const blob = new Blob(chunks, {
          type: rec.mimeType
        });
        rec = null;
        if (leaving) {
          valid = false;
          if (!blob.size) return saved();
          const fl = new FileReader();
          fl.onerror = () => saved();
          fl.onload = () => {
            try {
              onSaved(fl.result)
            } catch {}
            saved()
          };
          fl.readAsDataURL(blob);
          return
        }
        if (!blob.size) {
          label.textContent = 'التسجيل فارغ';
          b.disabled = false;
          return
        }
        const fr = new FileReader();
        fr.onerror = () => {
          if (valid) {
            label.textContent = 'تعذر حفظ التسجيل';
            b.disabled = false
          }
        };
        fr.onload = async () => {
          if (!valid) return;
          try {
            if (onSaved(fr.result) === false) throw new Error('not saved');
            // التسجيل يُحفظ في مخزن الجهاز: لا نقول «تم» قبل أن يتأكد الحفظ فعلاً
            if (!(await Atlas.storage.flush())) throw new Error('not saved');
            if (!valid) return;
            a.src = fr.result;
            a.hidden = false;
            label.textContent = document.hidden ? 'تم حفظ ما سُجّل قبل أن تُغلق الشاشة' : 'تم حفظ التسجيل'
          } catch {
            if (!valid) return;
            label.textContent = 'لم يُحفظ التسجيل؛ تحقق من المساحة وصدّر بياناتك';
            Atlas.error(label.textContent)
          }
          b.textContent = '🎙 سجّل من جديد';
          b.classList.remove('stop');
          b.disabled = false
        };
        fr.readAsDataURL(blob)
      };
      rec.start();
      b.classList.add('stop');
      b.textContent = '⏹ أوقف';
      b.disabled = false;
      tick = sceneInterval(() => {
        const n = Math.floor((Date.now() - start) / 1000);
        label.textContent = n + ' ث';
        if (n >= seconds && rec?.state === 'recording') {
          b.disabled = true;
          rec.stop()
        }
      }, 500)
    } catch {
      tracks();
      if (valid) {
        label.textContent = 'لم نصل إلى الميكروفون — اكتب شرحك أو أعد المحاولة';
        b.disabled = false
      }
    } finally {
      pending = false
    }
  }
}
