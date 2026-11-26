/*
 * حسابات الأطفال المحلية (بلا إنترنت).
 *
 * التخزين: كل حساب له «مساحة أسماء» (ns) يُضاف إليها المفتاح المنطقي:
 *   - الحساب المُرحَّل من النسخة السابقة يبقى على مفاتيحه الأصلية (ns = 'atlas:')
 *     فلا تُنسخ بياناته ولا تتضاعف — الترحيل كتابة سجل الحسابات وحده (عملية واحدة ذرّية).
 *   - كل حساب جديد أو مُستعاد: ns = 'atlas:user:<id>:'.
 *
 * لا يرمي هذا الملف خطأً عند التحميل أبداً: إن تعذّر الترحيل أو كان السجل تالفاً
 * يعمل التطبيق في «وضع الإنقاذ» برسالة واضحة وزر لتنزيل نسخة من كل البيانات،
 * ويُعاد الترحيل تلقائياً في الفتح التالي دون أي تغيير في البيانات القديمة.
 *
 * قاعدة الكتابة: كل تغيير في قائمة الحسابات يُبنى على نسخة مستقلة ويُحفظ أولاً؛
 * لا تتغير الحالة في الذاكرة (الحساب النشط أو القائمة) إلا بعد نجاح الحفظ الدائم.
 * السجل التالف لا يُكتب فوقه أبداً إلا بإجراء «إصلاح» صريح يحفظ نصه الأصلي جانباً.
 */
(function (root) {
  'use strict';

  /*
   * متصفح يمنع التخزين (خصوصية صارمة أو صفحة محلية): قراءة localStorage نفسها ترمي. لا ينهار التطبيق:
   * يعمل من مخزن في الذاكرة، وتظهر رسالة بأن التقدّم لن يُحفظ (المراجعة 20، ن-18).
   * المخزن البديل كائن مفاتيحه هي البيانات ودواله غير قابلة للعدّ، فيعمل Object.keys كما مع localStorage.
   */
  function memoryStore() {
    const s = {};
    const own = (k) => Object.prototype.hasOwnProperty.call(s, k);
    Object.defineProperties(s, {
      getItem: { value: (k) => (own(String(k)) ? s[String(k)] : null) },
      setItem: { value: (k, v) => { s[String(k)] = String(v); } },
      removeItem: { value: (k) => { delete s[String(k)]; } },
      key: { value: (i) => Object.keys(s)[i] ?? null },
      clear: { value: () => Object.keys(s).forEach((k) => delete s[k]) },
      length: { get: () => Object.keys(s).length },
    });
    return s;
  }
  let storageDenied = false;
  const native = (() => {
    try {
      const ls = root.localStorage;
      ls.getItem('atlas:accounts:v1');
      return ls;
    } catch {
      storageDenied = true;
      return memoryStore();
    }
  })();
  const session = (() => {
    try {
      const ss = root.sessionStorage;
      ss.getItem('atlas:guardian');
      return ss;
    } catch {
      return memoryStore();
    }
  })();
  const REG = 'atlas:accounts:v1';
  const USER_PREFIX = 'atlas:user:';
  const LEGACY_NS = 'atlas:';
  const LEGACY_PROFILE = 'atlas:profile';
  const PIN_FAILS = 'atlas:accounts:pinfails'; // عدّاد المحاولات الخاطئة لرمز ولي الأمر
  // تقدير محافظ لسعة localStorage في Chromium/WebView (نحو 5 ملايين محرف لكل أصل)
  const QUOTA_CHARS = 5 * 1024 * 1024;

  // ---------- أدوات ----------
  function parse(text, fallback) {
    try {
      return text == null ? fallback : JSON.parse(text);
    } catch {
      return fallback;
    }
  }
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const newId = () =>
    'u' + (root.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2));
  const goodId = (x) => typeof x === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(x);
  const hex = (buf) => Array.from(new Uint8Array(buf), (x) => x.toString(16).padStart(2, '0')).join('');

  // ---------- الحالة ----------
  const status = { mode: 'ok', reason: '', message: '' }; // mode: ok | rescue — reason: quota | corrupt
  let memoryRegistry = null; // سجل للقراءة فقط في الذاكرة حين يتعذّر حفظه أو قراءته
  let registryCorrupt = false; // السجل المحفوظ تالف: يُمنع الكتابة فوقه

  function nsOf(profile) {
    return profile.ns === LEGACY_NS ? LEGACY_NS : USER_PREFIX + profile.id + ':';
  }

  function isReserved(key) {
    return key === LEGACY_PROFILE || key.startsWith('atlas:accounts:') || key === REG || key.startsWith(USER_PREFIX);
  }

  function physical(profile, logicalKey) {
    if (!profile || !goodId(profile.id)) throw new Error('حساب غير صالح');
    if (typeof logicalKey !== 'string' || !logicalKey.startsWith('atlas:') || isReserved(logicalKey)) {
      throw new Error('مفتاح غير صالح');
    }
    return nsOf(profile) + logicalKey.slice(6);
  }

  /**
   * سجل حساب صالح بكل ما تستهلكه الواجهة؛ أي سجل غير ذلك يجعل القائمة كلها «تالفة» فتدخل
   * مسار الإنقاذ والإصلاح بدل أن تُقبل ثم تتعطل الصفحات.
   */
  function validProfile(p) {
    if (!p || typeof p !== 'object' || Array.isArray(p)) return false;
    if (!goodId(p.id) || typeof p.name !== 'string' || !p.name.trim() || p.name.length > 80) return false;
    if (p.gender !== 'm' && p.gender !== 'f') return false;
    if (p.ns !== undefined && p.ns !== LEGACY_NS) return false;
    if (p.photo !== undefined && typeof p.photo !== 'string') return false;
    if (p.unverified !== undefined && typeof p.unverified !== 'boolean') return false;
    if (p.guardian !== undefined &&
        (!p.guardian || typeof p.guardian.salt !== 'string' || typeof p.guardian.hash !== 'string')) return false;
    // رمز الاستعادة (المراجعة 20، ن-1): بصمته وحدها، ولا يُحفظ الرمز نفسه
    if (p.recovery !== undefined &&
        (!p.recovery || typeof p.recovery.salt !== 'string' || typeof p.recovery.hash !== 'string')) return false;
    if (p.resetRequestedAt !== undefined && typeof p.resetRequestedAt !== 'string') return false;
    if (p.pendingGuardian !== undefined && typeof p.pendingGuardian !== 'boolean') return false;
    return true;
  }

  /** حساب في «المحذوفات»: يبقى بياناته 30 يوماً ثم يُحذف نهائياً (المراجعة 20، ن-1). */
  const TRASH_DAYS = 30;
  const validTrashed = (t) => validProfile(t) && typeof t.deletedAt === 'string' && Number.isFinite(Date.parse(t.deletedAt));

  function readRegistry() {
    const text = native.getItem(REG);
    if (text === null) return null;
    const r = parse(text, null);
    const trash = Array.isArray(r?.trash) ? r.trash : [];
    const all = Array.isArray(r?.profiles) ? [...r.profiles, ...trash] : [];
    const ok = r?.version === 1 && Array.isArray(r.profiles) && r.profiles.length <= 200 &&
      r.profiles.every(validProfile) &&
      (r.trash === undefined || (Array.isArray(r.trash) && r.trash.length <= 200 && r.trash.every(validTrashed))) &&
      new Set(all.map((p) => p.id)).size === all.length &&
      all.filter((p) => p.ns === LEGACY_NS).length <= 1 &&
      (r.activeId === null || r.activeId === undefined || goodId(r.activeId));
    if (!ok) throw new Error('قائمة الحسابات تالفة');
    if (!r.profiles.some((p) => p.id === r.activeId)) r.activeId = null; // حساب نشط محذوف: يُختار من الصفحة
    return r;
  }

  /**
   * النص المحفوظ الذي بُنيت عليه كل نسخة من القائمة. الحفظ يُرفض إن تغيّر النص على القرص بعدها
   * (نافذة أخرى حفظت قائمة أحدث)، فلا تُكتب قائمة قديمة فوق حساب أُنشئ في مكان آخر.
   */
  const baseOf = new WeakMap();
  const withBase = (r, text) => (baseOf.set(r, text), r);

  /**
   * قائمة الذاكرة (وضع الإنقاذ) مؤقتة: متى وُجدت على القرص قائمة صالحة حفظتها نافذة أخرى صارت هي
   * المرجع، ويُعاد ربط الطفل القديم بحسابه فيها (مساحته atlas: نفسها).
   */
  function adoptDisk() {
    let disk;
    try {
      disk = readRegistry();
    } catch {
      return false; // ما زالت تالفة
    }
    if (!disk) return false; // ما زال الحفظ متعذراً
    const was = memoryRegistry.profiles.find((p) => p.id === bound);
    memoryRegistry = null;
    registryCorrupt = false;
    if (bound && !disk.profiles.some((p) => p.id === bound)) {
      const same = was?.ns === LEGACY_NS ? disk.profiles.find((p) => p.ns === LEGACY_NS) : null;
      bound = same ? same.id : null;
    }
    leaveRescue();
    return true;
  }

  /** نسخة مستقلة من قائمة الحسابات الحالية (تعديلها لا يغيّر شيئاً حتى تُحفظ). */
  function registry() {
    if (memoryRegistry && !adoptDisk()) return withBase(clone(memoryRegistry), native.getItem(REG));
    const text = native.getItem(REG);
    try {
      return withBase(readRegistry() || { version: 1, activeId: null, profiles: [] }, text);
    } catch {
      // تلفت القائمة أثناء الجلسة (من نافذة أخرى مثلاً)
      registryCorrupt = true;
      memoryRegistry = { version: 1, activeId: null, profiles: [] };
      return withBase(clone(memoryRegistry), text);
    }
  }

  /** يرفض حفظ قائمة بُنيت على نص لم يعد هو المحفوظ. */
  function checkBase(next) {
    if (baseOf.has(next) && baseOf.get(next) !== native.getItem(REG)) {
      registry(); // نتبنّى القائمة الأحدث لتنجح إعادة المحاولة
      throw new Error('تغيّرت قائمة الحسابات في نافذة أخرى. لم يتغير شيء؛ أعد المحاولة.');
    }
  }

  /** يحفظ القائمة الجديدة؛ يرمي خطأً دون أي تغيير إن تعذّر. */
  function commit(next) {
    if (registryCorrupt) {
      throw new Error('قائمة الحسابات تالفة؛ اضغط «إصلاح قائمة الحسابات» أولاً. لم يتغير شيء.');
    }
    checkBase(next);
    try {
      native.setItem(REG, JSON.stringify(next));
    } catch {
      throw new Error('لم يُحفظ؛ مساحة التخزين غير كافية. لم يتغير شيء.');
    }
    if (memoryRegistry) {
      memoryRegistry = null; // صارت القائمة محفوظة: انتهى وضع الإنقاذ بسبب المساحة
      leaveRescue();
    }
  }

  /** كتابة مجموعة مفاتيح مع السجل؛ تُلغى كلها إن فشل أي منها. */
  function transaction(entries, r) {
    if (!registryCorrupt) checkBase(r);
    const before = entries.map(([k]) => [k, native.getItem(k)]);
    const oldReg = native.getItem(REG);
    try {
      if (registryCorrupt) throw new Error('corrupt');
      for (const [k, v] of entries) native.setItem(k, v);
      native.setItem(REG, JSON.stringify(r));
    } catch (e) {
      if (e.message === 'corrupt') {
        throw new Error('قائمة الحسابات تالفة؛ اضغط «إصلاح قائمة الحسابات» أولاً. لم يتغير شيء.');
      }
      for (const [k, v] of before.reverse()) {
        try {
          v === null ? native.removeItem(k) : native.setItem(k, v);
        } catch {}
      }
      try {
        oldReg === null ? native.removeItem(REG) : native.setItem(REG, oldReg);
      } catch {}
      throw new Error('لم يتم الحفظ؛ مساحة التخزين غير كافية. البيانات السابقة محفوظة.');
    }
    if (memoryRegistry) {
      memoryRegistry = null;
      leaveRescue();
    }
  }

  // ---------- رسائل ظاهرة ----------
  function showBanner(message, withRescue) {
    const display = () => {
      let box = root.document.getElementById('atlas-status');
      if (!box) {
        box = root.document.createElement('div');
        box.id = 'atlas-status';
        box.setAttribute('role', 'alert');
        box.style.cssText =
          'position:fixed;bottom:0;inset-inline:0;z-index:99999;background:#fff0c2;color:#542b00;' +
          'padding:14px;text-align:center;font:inherit;box-shadow:0 -2px 8px rgba(0,0,0,.15)';
        root.document.body.append(box);
      }
      box.textContent = message;
      if (withRescue) {
        const btn = root.document.createElement('button');
        btn.type = 'button';
        btn.textContent = 'تنزيل نسخة إنقاذ من كل البيانات';
        btn.style.cssText = 'margin-inline-start:10px;padding:6px 12px;border-radius:10px;border:0;' +
          'background:#542b00;color:#fff;cursor:pointer';
        btn.onclick = () => api.rescueDownload();
        box.append(' ', btn);
      }
    };
    if (root.document?.body) display();
    else root.document?.addEventListener('DOMContentLoaded', display, { once: true });
  }

  function error(message) {
    showBanner(message, status.mode === 'rescue');
  }

  function enterRescue(reason, message) {
    status.mode = 'rescue';
    status.reason = reason;
    status.message = message;
    showBanner(message, true);
  }

  function leaveRescue() {
    status.mode = 'ok';
    status.reason = '';
    status.message = '';
    root.document?.getElementById('atlas-status')?.remove();
  }

  /** ملف الطفل من النسخة السابقة (atlas:profile) إن وُجد وكان صالحاً. */
  function legacyProfile() {
    const legacy = parse(native.getItem(LEGACY_PROFILE), null);
    if (!legacy || typeof legacy.name !== 'string') return null;
    return {
      id: 'legacy',
      name: legacy.name.trim().slice(0, 80) || 'طفلي',
      gender: legacy.gender === 'f' ? 'f' : 'm',
      photo: '',
      ns: LEGACY_NS,
    };
  }

  // ---------- الترحيل من النسخة السابقة (ملف طفل واحد) ----------
  function migrateLegacy() {
    let current;
    try {
      current = readRegistry();
    } catch {
      // قائمة تالفة: لا نكتب فوقها. نشغّل ملف الطفل القديم (إن وُجد) للقراءة والتعلّم من الذاكرة.
      registryCorrupt = true;
      const legacy = legacyProfile();
      memoryRegistry = { version: 1, activeId: legacy ? legacy.id : null, profiles: legacy ? [legacy] : [] };
      enterRescue(
        'corrupt',
        'قائمة الحسابات تالفة. لم يُحذف شيء' + (legacy ? '، ويمكن لـ' + legacy.name + ' متابعة التعلّم' : '') +
        '. نزّل نسخة إنقاذ، ثم اضغط «إصلاح قائمة الحسابات» في صفحة الحسابات.'
      );
      return;
    }
    if (current) return; // مُرحَّل من قبل
    const legacy = legacyProfile();
    if (!legacy) return; // جهاز جديد
    legacy.id = newId();
    const r = { version: 1, activeId: legacy.id, profiles: [legacy], legacyMigrated: true };
    try {
      native.setItem(REG, JSON.stringify(r)); // العملية الوحيدة: ذرّية
    } catch {
      // المساحة ممتلئة حتى عن بضع مئات من المحارف: نعمل من الذاكرة ونعيد المحاولة في الفتح التالي
      memoryRegistry = r;
      enterRescue(
        'quota',
        'مساحة التخزين ممتلئة. تقدّم ' + legacy.name + ' محفوظ كما هو ويمكن متابعة التعلّم، ' +
        'لكن لا يمكن إضافة طفل أو تعديل البيانات حتى تتوفر مساحة. نزّل نسخة إنقاذ ثم احذف تسجيلات قديمة.'
      );
    }
  }

  let bound = null;
  migrateLegacy();
  try {
    bound = registry().activeId;
  } catch {
    bound = null;
  }
  /*
   * حارس الساعة (المراجعة 20، ن-6): آخر وقت رآه التطبيق لا يتراجع. إن وُجدت الساعة أقدم منه بأكثر من 10 دقائق
   * فقد قُدّمت ثم أُعيدت (أو أُرجعت): يُسجَّل ذلك ليراه ولي الأمر بجانب نتائج «عودة الذاكرة». يُحفظ للجهاز كله
   * (مفتاح محجوز لا يدخل النسخ).
   */
  const CLOCK = 'atlas:accounts:clock';
  (function clockGuard() {
    try {
      const now = Date.now();
      const c = parse(native.getItem(CLOCK), null) || {};
      const last = Number.isFinite(c.last) ? c.last : 0;
      const events = Array.isArray(c.events) ? c.events.filter((e) => e && Number.isFinite(e.at) && Number.isFinite(e.from)).slice(-20) : [];
      const back = last && now < last - 600000;
      if (back) events.push({ at: now, from: last });
      // بعد الكشف تُعدّ الساعة الحالية هي الصحيحة، فلا يُسجَّل الرجوع نفسه مع كل فتح.
      // والكتابة مرة في الساعة على الأكثر: الرجوع الذي يهمّ أيام لا دقائق
      if (back || !last || now > last + 3600000) native.setItem(CLOCK, JSON.stringify({ last: back ? now : Math.max(last, now), events }));
    } catch {}
  })();
  if (storageDenied) {
    status.storage = 'memory';
    showBanner('هذا المتصفح يمنع حفظ البيانات لهذه الصفحة، فلن يُحفظ التقدّم بعد إغلاقها. ' +
      'افتح التطبيق المثبَّت، أو اسمح للمتصفح بحفظ بيانات المواقع ثم أعد فتح الصفحة.', false);
  }
  const active = () => {
    try {
      return registry().profiles.find((p) => p.id === bound) || null;
    } catch {
      return null;
    }
  };

  // ---------- مخزن الوسائط (IndexedDB) ----------
  /*
   * التسجيلات والرسوم كبيرة (مئات آلاف المحارف)، وسعة localStorage نحو 5 ملايين محرف للجهاز كله.
   * لذلك تُحفظ الوسائط في IndexedDB، ويبقى في localStorage مرجع قصير مكانها: "atlas-media:<معرّف>".
   * المعرّف ثابت لكل (مفتاح، موضع) فيُكتب التسجيل الجديد فوق القديم دون بقايا.
   * القراءة تبقى متزامنة: تُحمَّل وسائط الطفل النشط إلى الذاكرة قبل أن تبدأ الصفحة (Atlas.ready).
   * إن لم يتوفر IndexedDB (أو فشل الحفظ فيه) تُحفظ الوسيطة داخل localStorage كما كانت من قبل.
   * النسخ الاحتياطية تحمل الوسائط نفسها كما كانت، فالنسخ القديمة والجديدة متوافقة.
   */
  const MEDIA_REF = 'atlas-media:';
  const MEDIA_MIN = 2000; // الوسيطة الأقصر من هذا تبقى في مكانها
  const mediaCache = new Map(); // للقراءة المتزامنة
  const mediaStored = new Map(); // ما تأكّد حفظه في IndexedDB بمحتواه نفسه (لا نعيد كتابته)
  const mediaPending = new Set();
  let mediaDB = null;
  function isMediaRef(v) {
    return typeof v === 'string' && /^atlas-media:m[a-z0-9]{6,40}$/.test(v);
  }
  const isMediaData = (v) => typeof v === 'string' && v.length >= MEDIA_MIN && /^data:(audio|image)\//.test(v) &&
    (!!audioSource(v) || !!imageSource(v));
  function mediaId(key, path) {
    const t = key + '|' + path;
    let a = 2166136261,
      b = 5381;
    for (let i = 0; i < t.length; i++) {
      a = Math.imul(a ^ t.charCodeAt(i), 16777619);
      b = Math.imul(b, 33) ^ t.charCodeAt(i);
    }
    return 'm' + (a >>> 0).toString(36) + (b >>> 0).toString(36) + t.length.toString(36);
  }
  function openMedia() {
    if (mediaDB) return mediaDB;
    mediaDB = new Promise((resolve) => {
      try {
        if (!root.indexedDB) return resolve(null);
        const rq = root.indexedDB.open('atlas-media', 1);
        rq.onupgradeneeded = () => rq.result.createObjectStore('media');
        rq.onsuccess = () => resolve(rq.result);
        rq.onerror = rq.onblocked = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
    return mediaDB;
  }
  /** عملية واحدة على المخزن؛ تُرفض إن لم يتوفر IndexedDB أو فشل الحفظ (الامتلاء مثلاً). */
  function mediaTx(mode, fn) {
    return openMedia().then((db) => {
      if (!db) throw new Error('no-indexeddb');
      return new Promise((resolve, reject) => {
        const t = db.transaction('media', mode);
        const out = fn(t.objectStore('media'));
        t.oncomplete = () => resolve(out);
        t.onerror = t.onabort = () => reject(t.error || new Error('indexeddb'));
      });
    });
  }
  const refsIn = (text) => (typeof text === 'string' ? [...text.matchAll(/atlas-media:(m[a-z0-9]{6,40})/g)].map((m) => m[1]) : []);
  /** يستبدل كل وسيطة كبيرة في القيمة بمرجع؛ يعيد النص الجديد وما يجب حفظه في المخزن. */
  function externalize(key, text) {
    const puts = [];
    if (typeof text !== 'string' || !/data:(audio|image)\//.test(text)) return { text, puts };
    let v;
    try {
      v = JSON.parse(text);
    } catch {
      return { text, puts };
    }
    const walk = (x, path) => {
      if (isMediaData(x)) {
        const id = mediaId(key, path);
        puts.push([id, x]);
        return MEDIA_REF + id;
      }
      if (Array.isArray(x)) return x.map((y, i) => walk(y, path + '/' + i));
      if (isObj(x)) {
        const o = {};
        for (const k of Object.keys(x)) o[k] = walk(x[k], path + '/' + k);
        return o;
      }
      return x;
    };
    const out = walk(v, '');
    return puts.length ? { text: JSON.stringify(out), puts } : { text, puts };
  }
  /** يعيد الوسائط من الذاكرة إلى مكانها؛ المرجع غير المحمَّل يبقى كما هو فلا يُمحى عند إعادة الحفظ. */
  function hydrate(text, lookup = (id) => mediaCache.get(id)) {
    if (typeof text !== 'string' || !text.includes(MEDIA_REF)) return text;
    let v;
    try {
      v = JSON.parse(text);
    } catch {
      return text;
    }
    const walk = (x) => {
      if (isMediaRef(x)) return lookup(x.slice(MEDIA_REF.length)) ?? x;
      if (Array.isArray(x)) return x.map(walk);
      if (isObj(x)) {
        const o = {};
        for (const k of Object.keys(x)) o[k] = walk(x[k]);
        return o;
      }
      return x;
    };
    return JSON.stringify(walk(v));
  }
  async function loadMedia(ids) {
    const need = [...new Set(ids)].filter((id) => !mediaCache.has(id));
    if (!need.length) return;
    await mediaTx('readonly', (st) => {
      for (const id of need) {
        const rq = st.get(id);
        rq.onsuccess = () => {
          if (typeof rq.result === 'string') {
            mediaCache.set(id, rq.result);
            mediaStored.set(id, rq.result);
          }
        };
      }
    });
  }
  /** نص قيمة بكل وسائطها (للنسخ الاحتياطية)؛ ما تعذّر تحميله يصير null بدل مرجع لا يُستعاد. */
  let mediaMissed = 0; // وسائط تعذّر تحميلها أثناء تجهيز نسخة احتياطية
  async function hydrateFull(text) {
    const ids = refsIn(text);
    if (!ids.length) return text;
    try {
      await loadMedia(ids);
    } catch {}
    const out = hydrate(text);
    if (!out.includes(MEDIA_REF)) return out;
    mediaMissed += refsIn(out).length;
    return hydrate(out, () => null);
  }
  /** يُنبّه إن خرجت النسخة ناقصة بدل أن تبدو كاملة. */
  function warnMissed() {
    const n = mediaMissed;
    mediaMissed = 0;
    if (n) error(`تنبيه: تعذّرت قراءة ${n} من التسجيلات أو الرسوم، فلم تدخل هذه النسخة. لا تحذف التطبيق؛ أعد فتحه ثم خذ النسخة مرة أخرى.`);
    return n;
  }
  function trackMedia(p) {
    mediaPending.add(p);
    p.finally(() => mediaPending.delete(p));
    return p;
  }
  /** نقل الوسائط القديمة المحفوظة داخل localStorage إلى IndexedDB (مرة واحدة، مفتاحاً مفتاحاً). */
  async function migrateMedia() {
    if (!(await openMedia())) return;
    for (const k of Object.keys(native)) {
      if (!k.startsWith('atlas:') || k === REG || k === LEGACY_PROFILE || k.startsWith('atlas:accounts:')) continue;
      const text = native.getItem(k);
      if (!text || text.length < MEDIA_MIN || !/data:(audio|image)\//.test(text)) continue;
      const ext = externalize(k, text);
      if (!ext.puts.length) continue;
      try {
        await mediaTx('readwrite', (st) => ext.puts.forEach(([id, d]) => st.put(d, id)));
      } catch {
        return; // المخزن غير متاح: تبقى البيانات كما هي
      }
      ext.puts.forEach(([id, d]) => (mediaCache.set(id, d), mediaStored.set(id, d)));
      try {
        if (native.getItem(k) === text) native.setItem(k, ext.text); // النص الجديد أقصر دائماً
      } catch {}
    }
  }
  async function preloadActive() {
    const p = active();
    if (!p) return;
    const ns = nsOf(p);
    const ids = [];
    for (const k of Object.keys(native)) {
      if (k.startsWith(ns) && (ns !== LEGACY_NS || !isReserved(k))) ids.push(...refsIn(native.getItem(k)));
    }
    if (ids.length) await loadMedia(ids);
  }

  // ---------- التخزين حسب الحساب النشط ----------
  const storage = {
    getItem(k) {
      const p = active();
      if (!p) return null;
      if (k === LEGACY_PROFILE) {
        return JSON.stringify({ id: p.id, name: p.name, gender: p.gender, photo: p.photo || '' });
      }
      return hydrate(native.getItem(physical(p, k)));
    },
    /** القيمة بعد تحميل وسائطها من المخزن (حين لم تُحمَّل قبل بدء الصفحة على جهاز بطيء). */
    async load(k) {
      const p = active();
      if (!p) return null;
      try {
        await loadMedia(refsIn(native.getItem(physical(p, k))));
      } catch {}
      return storage.getItem(k);
    },
    /** هل القيمة مرجع وسيطة لم تُحمَّل بعد؟ (لا يُكتب فوقها قبل تحميلها) */
    pendingMedia(v) {
      return typeof v === 'string' && v.includes(MEDIA_REF);
    },
    setItem(k, v) {
      const p = active();
      if (!p) throw new Error('اختر حساب الطفل');
      if (k === LEGACY_PROFILE) {
        const value = JSON.parse(v);
        const next = registry();
        const q = next.profiles.find((x) => x.id === p.id);
        q.name = String(value.name || '').trim().slice(0, 80) || q.name;
        q.gender = value.gender === 'f' ? 'f' : 'm';
        if (value.photo !== undefined) q.photo = validPhoto(value.photo);
        delete q.unverified; // عدّل ولي الأمر الاسم والجنس: تأكدت الهوية
        commit(next);
        return;
      }
      const key = physical(p, k);
      const text = String(v);
      const prev = native.getItem(key);
      const ext = externalize(key, text);
      const puts = ext.puts.filter(([id, d]) => mediaStored.get(id) !== d); // لم يتغير التسجيل: لا كتابة
      // وسيطة جديدة: تُكتب كاملة في localStorage أولاً، ويحلّ المرجع محلها بعد أن تثبت في IndexedDB.
      // فإن غادر الطفل الصفحة قبل ثبوتها بقي التسجيل كاملاً ولا يبقى مرجع إلى لا شيء. وإن ضاق المكان كُتب المرجع مباشرة.
      let inline = false;
      if (puts.length) {
        try {
          native.setItem(key, text);
          inline = true;
        } catch {}
      }
      if (!inline) {
        try {
          native.setItem(key, ext.text);
        } catch (e) {
          error('لم يُحفظ التغيير: مساحة الجهاز غير كافية. صدّر نسخة احتياطية واحذف تسجيلات قديمة.');
          throw e;
        }
      }
      ext.puts.forEach(([id, d]) => mediaCache.set(id, d));
      const keep = new Set(refsIn(ext.text));
      const stale = refsIn(prev).filter((id) => !keep.has(id));
      if (puts.length || stale.length) {
        stale.forEach((id) => (mediaCache.delete(id), mediaStored.delete(id)));
        trackMedia(
          mediaTx('readwrite', (st) => {
            puts.forEach(([id, d]) => st.put(d, id));
            stale.forEach((id) => st.delete(id));
          }).then(
            () => {
              puts.forEach(([id, d]) => mediaStored.set(id, d));
              if (inline && native.getItem(key) === text) {
                try {
                  native.setItem(key, ext.text);
                } catch {}
              }
              return true;
            },
            () => {
              if (inline) return true; // الوسيطة محفوظة كاملة في مكانها
              // تعذّر المخزن: نحفظ الوسيطة داخل localStorage كما كانت، ما لم تُكتب قيمة أحدث بعدها
              if (!puts.length || native.getItem(key) !== ext.text) return true;
              try {
                native.setItem(key, text);
                return true;
              } catch {
                // لا مكان للجديد: تبقى القيمة السابقة كما كانت بدل مرجع إلى لا شيء
                try {
                  if (prev === null) native.removeItem(key);
                  else native.setItem(key, prev);
                } catch {}
                error('لم يُحفظ التسجيل أو الرسم: مساحة الجهاز غير كافية. بقي المحفوظ السابق كما هو. صدّر نسخة احتياطية.');
                return false;
              }
            }
          )
        );
      }
    },
    /** ينتظر حفظ الوسائط الجارية؛ يعيد true إن حُفظ كل شيء. */
    async flush() {
      const r = await Promise.all([...mediaPending]);
      return r.every(Boolean);
    },
    removeItem(k) {
      const p = active();
      if (!p) return;
      const key = physical(p, k);
      const stale = refsIn(native.getItem(key));
      native.removeItem(key);
      if (stale.length) trackMedia(mediaTx('readwrite', (st) => stale.forEach((id) => st.delete(id))).then(() => true, () => true));
    },
    /** المفاتيح المنطقية للحساب النشط. */
    keys() {
      const p = active();
      if (!p) return [];
      const ns = nsOf(p);
      return Object.keys(native)
        .filter((k) => k.startsWith(ns) && (ns !== LEGACY_NS || !isReserved(k)))
        .map((k) => 'atlas:' + k.slice(ns.length));
    },
  };

  // ---------- التحقق من الوسائط والبيانات المستعادة ----------
  const imageSource = (v) =>
    typeof v === 'string' && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(v) ? v : '';
  const audioSource = (v) =>
    typeof v === 'string' &&
    /^data:audio\/(webm|mp4|ogg|mpeg|wav|x-wav)(?:;codecs=[A-Za-z0-9.,-]+)?;base64,[A-Za-z0-9+/=]+$/.test(v)
      ? v
      : '';

  function validPhoto(v) {
    if (!v) return '';
    if (!imageSource(v) || v.length > 700000) throw new Error('الصورة غير صالحة أو كبيرة جدًا');
    return v;
  }

  function validMedia(v, depth = 0) {
    if (!v || typeof v !== 'object') return;
    if (depth > 8) throw new Error('بيانات متداخلة أكثر من اللازم'); // لا رسالة خطأ إنجليزية من تجاوز المكدس
    for (const [k, x] of Object.entries(v)) {
      if (['__proto__', 'constructor', 'prototype'].includes(k)) throw new Error('مفتاح محظور');
      if (k === 'audio' && x && !audioSource(x)) throw new Error('تسجيل غير صالح');
      validMedia(x, depth + 1);
    }
  }

  /*
   * مخطط صريح لكل مفتاح محفوظ. أي مفتاح غير معروف يُرفض، وكل قيمة تُفحص بنوعها ومداها، فلا تصل
   * إلى الصفحات قيمة «صالحة الشكل» تُعطّلها أو نص يُدرج في الصفحة على أنه شيفرة.
   */
  const BAD_KEYS = ['__proto__', 'constructor', 'prototype'];
  const isObj = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);
  const isInt = (x, lo, hi) => Number.isInteger(x) && x >= lo && x <= hi;
  const isNum = (x) => typeof x === 'number' && Number.isFinite(x) && x >= 0;
  const isStr = (x, max = 20000) => typeof x === 'string' && x.length <= max;
  /** بيانات نشاط عامة: قيم بسيطة وكائنات ومصفوفات صغيرة، والنص الطويل لا يُقبل إلا وسائط صالحة. */
  function plain(v, depth = 0) {
    if (depth > 5) return false;
    if (v === null || typeof v === 'boolean' || (typeof v === 'number' && Number.isFinite(v))) return true;
    if (typeof v === 'string') return v.length <= 20000 || !!imageSource(v) || !!audioSource(v) || isMediaRef(v);
    if (Array.isArray(v)) return v.length <= 300 && v.every((x) => plain(x, depth + 1));
    if (isObj(v)) {
      const ks = Object.keys(v);
      return ks.length <= 300 && ks.every((k) => !BAD_KEYS.includes(k) && k.length <= 80 && plain(v[k], depth + 1));
    }
    return false;
  }
  /** قائمة عناصر لمسها الطفل: معرّفات قصيرة أو أرقام صغيرة، بلا تكرار. */
  const pickList = (v) => Array.isArray(v) && v.length <= 60 && new Set(v).size === v.length &&
    v.every((x) => (typeof x === 'string' && /^[\p{L}\p{N}_.\- ]{1,40}$/u.test(x)) || isInt(x, 0, 99));
  const media = (v, kind) => v == null || isMediaRef(v) || !!(kind === 'audio' ? audioSource(v) : imageSource(v));

  const recallRec = (v) => v === null || (isObj(v) && isInt(v.ok, 0, 100) && (v.n === undefined || isInt(v.n, 1, 100)) &&
    isInt(v.days, 0, 100000) && (v.at === undefined || isNum(v.at)) && (v.text === undefined || isStr(v.text)) && plain(v));
  const SCHEMA = {
    // الزمن الفعلي في الدرس بالمللي ثانية (المراجعة 28، أ3)
    activeMs: (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1e9,
    level: (v) => v === 'A' || v === 'B',
    finished: (v) => typeof v === 'boolean',
    exp_done: (v) => typeof v === 'boolean',
    scene: (v) => isInt(v, 0, 500),
    sceneId: (v) => v === null || (isStr(v) && v.length <= 80),
    stars: (v) => isInt(v, 0, 100000),
    finishedAt: (v) => v === null || isNum(v),
    median: (v) => v === null || isNum(v),
    rt: (v) => v === null || isNum(v),
    notes: (v) => isStr(v),
    limitAns: (v) => isStr(v),
    fingerCount: (v) => isStr(v, 20) || isInt(v, 0, 100),
    drawing: (v) => media(v, 'image'),
    // قراءات ردّ الفعل: أرقام، أو نصوص أرقام كما يكتبها الطفل في الخانة (هكذا تحفظها الوحدة الأولى منذ 1.1.6)
    readings: (v) => Array.isArray(v) && v.length <= 20 && v.every((x) => x === null || isNum(x) || (typeof x === 'string' && x.length <= 12 && /^\s*[0-9٠-٩]*(?:[.,٫][0-9٠-٩]+)?\s*$/.test(x))),
    measure: (v) => isObj(v) && ['h', 's'].every((k) => v[k] === undefined || v[k] === null || isNum(v[k]) || isStr(v[k], 10)) && plain(v),
    progress: (v) => isObj(v) && Object.entries(v).every(([k, p]) => /^[A-Za-z0-9_.-]{1,60}$/.test(k) && isObj(p) &&
      typeof p.ok === 'boolean' && (p.hints === undefined || isInt(p.hints, 0, 10000)) &&
      (p.firstAttempt === undefined || typeof p.firstAttempt === 'boolean') &&
      (p.answered === undefined || typeof p.answered === 'boolean') &&
      (p.text === undefined || isStr(p.text)) && (p.choice === undefined || isInt(p.choice, 0, 20)) && plain(p)),
    // عودة الذاكرة ثلاث مرات (3 و7 و21 يوماً): سجلّ لكل مرة، و text ما كتبه الطفل في المرة السابقة حين تبدأ التالية
    recall: (v) => recallRec(v), recall2: (v) => recallRec(v), recall3: (v) => recallRec(v),
    recallRound: (v) => isInt(v, 0, 3),
    predict: (v) => v === null || isInt(v, 0, 10),
    hypo: (v) => v === null || isInt(v, 0, 10),
    pulseAlt: (v) => typeof v === 'boolean',
    ded: (v) => isObj(v) && (v.idea === undefined || v.idea === null || isInt(v.idea, 0, 100)) &&
      ['who', 'plan', 'text'].every((k) => v[k] === undefined || isStr(v[k])) &&
      (v.recordedAt === undefined || isNum(v.recordedAt)) && media(v.audio, 'audio') && plain(v),
    rubric: (v) => isObj(v) && Object.entries(v).every(([k, e]) => k.length <= 80 && (e === null || isInt(e, 0, 2) || (isObj(e) &&
      (e.score === undefined || isInt(e.score, 0, 2)) && (e.signature === undefined || isStr(e.signature, 200)) && plain(e)))),
    approval: (v) => v === null || (isObj(v) && typeof v.ok === 'boolean' && isNum(v.at) && plain(v)),
    defs: (v) => isObj(v) && Object.values(v).every((x) => isStr(x, 80)),
    rewards: (v) => isObj(v) && Object.values(v).every((x) => typeof x === 'boolean'),
    missed: (v) => isObj(v) && Object.values(v).every((x) => typeof x === 'boolean'),
    questions: (v) => Array.isArray(v) && v.length <= 500 && v.every((q) => isObj(q) && isStr(q.text, 2000) && isStr(q.date, 40)),
    passed: (v) => isObj(v) && Object.values(v).every((x) => x === true),
    // دروس بإذن ولي الأمر (U10.L02): معرّف الدرس ← وقت الإذن
    unlocked: (v) => isObj(v) && Object.keys(v).length <= 50 && Object.entries(v).every(([k, t]) => /^U\d{2}\.L\d{2}$/.test(k) && isNum(t)),
    score: (v) => isObj(v) && isInt(v.ok, 0, 1000) && isInt(v.n, 0, 1000) && isNum(v.at),
    // المحاولة الثانية في الاختبار ببنود بديلة لما أخطأ فيه (لا تغيّر score)
    score2: (v) => isObj(v) && isInt(v.ok, 0, 1000) && isInt(v.n, 0, 1000) && isNum(v.at),
    attempts: (v) => Array.isArray(v) && v.length <= 50 && v.every((a) => isObj(a) && isInt(a.ok, 0, 1000) && isInt(a.n, 0, 1000) && isNum(a.at)),
    order: (v) => isObj(v) && Object.values(v).every((o) => Array.isArray(o) && o.length <= 20 && o.every((x) => isInt(x, 0, 19))),
  };
  for (const k of ['bones', 'felt', 'joints', 'found', 'found5']) SCHEMA[k] = pickList;
  // مفاتيح أنشطة المشاهد الخاصة: كائنات بيانات عامة، والتسجيل فيها تحت audio وحده
  // قراءات العدّ: أرقام فقط (أو نص رقمي قصير من إصدار قديم)
  const reading = (x) => (typeof x === 'number' && Number.isFinite(x) && x >= 0 && x <= 1000) || (typeof x === 'string' && /^\d{1,4}$/.test(x));
  for (const k of ['pulse', 'breaths']) SCHEMA[k] = (v) => isObj(v) && media(v.audio, 'audio') && Object.keys(v).every((f) => f === 'audio' || reading(v[f]));
  for (const k of ['veins', 'teach', 'teach5', 'air', 'stomx', 'mouthx', 'bilex', 'absx', 'gutx',
    'heat', 'cellmodel', 'mirror', 'cup', 'survey', 'fill', 'built',
    'kidx', 'urinx', 'wtrx', 'rflx', 'nrvx', 'eyex', 'sensx', 'fearx', 'calmx', 'sleepx', 'memx']) {
    SCHEMA[k] = (v) => isObj(v) && media(v.audio, 'audio') && plain(v);
  }

  function validState(k, v) {
    const s = k.slice(k.lastIndexOf(':') + 1);
    const check = s.startsWith('open_') ? (x) => isStr(x) : SCHEMA[s];
    if (!check) throw new Error('مفتاح غير معروف');
    if (!check(v)) throw new Error('قيمة غير صالحة: ' + s);
  }

  // ---------- التشفير المحلي ----------
  async function digest(s) {
    if (!root.crypto?.subtle) throw new Error('استخدم متصفحًا حديثًا مع HTTPS أو تطبيق الجهاز');
    return hex(await root.crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
  }

  async function pinHash(pin, salt) {
    if (!root.crypto?.subtle) throw new Error('المتصفح لا يدعم حماية الرمز');
    const key = await root.crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
    const bits = await root.crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 100000, hash: 'SHA-256' },
      key,
      256
    );
    return hex(bits);
  }

  /** العدد بأرقام مع تمييزه العربي (ن-18): 1 و2 بلفظهما، 3–10 جمعاً مجروراً، 11–99 مفرداً منصوباً، والمئات مفرداً. */
  function countAr(n, kase, f) {
    n = Math.max(0, Math.floor(Number(n) || 0));
    if (n === 0) return f.zero;
    if (n === 1) return f.one;
    if (n === 2) return kase === 'nom' ? f.two[0] : f.two[1];
    const r = n % 100;
    if (n < 100 ? n <= 10 : r >= 3 && r <= 10) return n + ' ' + f.few;
    if (n < 100 || r >= 11) return n + ' ' + f.many;
    return n + ' ' + f.unit;
  }

  // ---------- رمز ولي الأمر ورمز الاستعادة والمحذوفات (المراجعة 20، ن-1) ----------
  /** يتحقق من رمز ولي أمر حساب بعدّاد محاولات خاص به: بعد 5 أخطاء انتظار يتضاعف حتى ساعة، يبقى بعد إعادة التحميل. */
  async function verifyPin(p, pin) {
    const g = p?.guardian;
    if (!g) throw new Error('الرمز غير صحيح');
    const fails = parse(native.getItem(PIN_FAILS), {}) || {};
    const f = isObj(fails[p.id]) ? fails[p.id] : { n: 0, until: 0 };
    if (f.until > Date.now()) {
      throw new Error('محاولات خاطئة كثيرة. انتظر ' + Math.ceil((f.until - Date.now()) / 1000) + ' ثانية ثم أعد المحاولة.');
    }
    if ((await pinHash(pin, g.salt)) !== g.hash) {
      f.n = (f.n || 0) + 1;
      if (f.n >= 5) f.until = Date.now() + Math.min(3600000, 30000 * 2 ** (f.n - 5));
      fails[p.id] = f;
      try {
        native.setItem(PIN_FAILS, JSON.stringify(fails));
      } catch {}
      throw new Error('الرمز غير صحيح');
    }
    if (fails[p.id]) {
      delete fails[p.id];
      try {
        native.setItem(PIN_FAILS, JSON.stringify(fails));
      } catch {}
    }
  }

  const RESET_WAIT = 72 * 3600000; // طلب إعادة التعيين لمن لا رمز استعادة له: يُتاح بعد 3 أيام
  const REC_ALPHA = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // 32 حرفاً ورقماً بلا 0 وO و1 وI
  /** رمز استعادة من 12 حرفاً (60 بتاً) في ثلاث مجموعات: XXXX-XXXX-XXXX */
  function newRecoveryCode() {
    const b = new Uint8Array(12);
    root.crypto.getRandomValues(b);
    const s = Array.from(b, (x) => REC_ALPHA[x % 32]).join('');
    return s.slice(0, 4) + '-' + s.slice(4, 8) + '-' + s.slice(8);
  }
  const normRecovery = (c) => String(c || '').replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .toUpperCase().replace(/[^0-9A-Z]/g, '');
  async function recoveryHash(code) {
    const salt = newId();
    return { salt, hash: await pinHash(normRecovery(code), salt) };
  }
  /** يحذف رمز الشاشة ورمز الاستعادة وأي طلب معلّق، ويسجّل وقت ذلك لولي الأمر؛ البيانات كما هي. */
  function resetGuardian() {
    const next = registry();
    const p = next.profiles.find((x) => x.id === bound);
    if (!p) throw new Error('اختر حساب الطفل');
    delete p.guardian;
    delete p.recovery;
    delete p.resetRequestedAt;
    p.pinResetAt = new Date().toISOString();
    commit(next);
    // رمز جديد يبدأ بلا عدّاد محاولات قديم
    const fails = parse(native.getItem(PIN_FAILS), {}) || {};
    if (fails[bound]) {
      delete fails[bound];
      try {
        native.setItem(PIN_FAILS, JSON.stringify(fails));
      } catch {}
    }
    api.lock();
  }
  /** يحذف كل مفاتيح حساب ووسائطه من الجهاز. يُستدعى بعد حفظ القائمة بدونه. */
  async function eraseData(p) {
    const ns = nsOf(p);
    const media = [];
    for (const k of Object.keys(native)) {
      if (!k.startsWith(ns) || (ns === LEGACY_NS && isReserved(k))) continue;
      media.push(...refsIn(native.getItem(k)));
      native.removeItem(k);
    }
    if (ns === LEGACY_NS) native.removeItem(LEGACY_PROFILE);
    media.forEach((id) => (mediaCache.delete(id), mediaStored.delete(id)));
    if (media.length) await mediaTx('readwrite', (st) => media.forEach((id) => st.delete(id))).catch(() => {});
  }
  /** ما مضى عليه 30 يوماً في «المحذوفات» يُحذف نهائياً عند فتح التطبيق. */
  async function purgeExpiredTrash() {
    if (registryCorrupt || memoryRegistry) return;
    let next;
    try {
      next = registry();
    } catch {
      return;
    }
    const now = Date.now();
    const old = (next.trash || []).filter((t) => now - Date.parse(t.deletedAt) > TRASH_DAYS * 86400000);
    if (!old.length) return;
    next.trash = next.trash.filter((t) => !old.includes(t));
    try {
      commit(next);
    } catch {
      return;
    }
    for (const t of old) await eraseData(t);
  }

  const BACKUP_KEY = /^atlas:(?:U\d{2}\.(?:L\d{2}|T\d{2}|unit):[A-Za-z0-9_.:-]+|U\d{2}:(?:rubric|notes)|questions)$/;
  let backupSkipped = []; // مفاتيح تُركت خارج آخر نسخة لأن قيمتها لا تجتاز فحص الاستعادة
  let backupTrimmed = []; // مفاتيح دخلت النسخة بعد قصّ نص طويل جداً فيها
  function restorable(k, v) {
    try {
      if (!BACKUP_KEY.test(k) || typeof v !== 'string') return false;
      const value = JSON.parse(v);
      if (!v.includes(MEDIA_REF)) { validState(k, value); validMedia(value); } // الوسائط الناقصة لها تنبيهها المستقل
      return true;
    } catch {
      return false;
    }
  }
  /** يقصّ كل نص عادي أطول من حدّ الاستعادة (لا الوسائط)؛ والباقي كما هو. */
  function trimLong(v, depth = 0) {
    if (typeof v === 'string') return v.length > 20000 && !imageSource(v) && !audioSource(v) && !isMediaRef(v) ? v.slice(0, 20000) : v;
    if (depth > 8 || v === null || typeof v !== 'object') return v;
    if (Array.isArray(v)) return v.map((x) => trimLong(x, depth + 1));
    const o = {};
    for (const [k, x] of Object.entries(v)) o[k] = trimLong(x, depth + 1);
    return o;
  }
  /**
   * القيمة كما تدخل النسخة: كما هي إن قبلتها الاستعادة؛ وإلا بعد قصّ نص طويل فيها إن صارت مقبولة
   * (إجابة لُصق فيها نص ضخم كانت تُسقط تقدّم الدرس كله من النسخة — المراجعة 20، ن-9)؛ وإلا تُترك وتُسمّى.
   */
  function backupValue(k, v) {
    if (restorable(k, v)) return v;
    try {
      const t = JSON.stringify(trimLong(JSON.parse(v)));
      if (t !== v && restorable(k, t)) {
        backupTrimmed.push(k);
        return t;
      }
    } catch {}
    backupSkipped.push(k);
    return null;
  }
  /** ما لا يخرج من الجهاز في أي نسخة: بصمة رمز ولي الأمر ورمز الاستعادة وحالة طلب إعادة التعيين (ن-5). */
  function exportProfile(p) {
    const q = clone(p);
    for (const k of ['ns', 'guardian', 'recovery', 'resetRequestedAt', 'pendingGuardian', 'deletedAt']) delete q[k];
    return q;
  }

  async function snapshotActive() {
    const p0 = active();
    const data = {};
    for (const k of storage.keys()) {
      const v = backupValue(k, await hydrateFull(native.getItem(physical(p0, k))));
      // ما لا تقبله الاستعادة لا يدخل النسخة: قيمة واحدة فاسدة كانت تُسقط استعادة الملف كله يوم الحاجة
      if (v !== null) data[k] = v;
    }
    return { profiles: [{ profile: exportProfile(active()), data }] };
  }
  /** اسم مقروء لمفتاح محفوظ في رسائل النسخ: «U03.L02: progress» */
  const keyName = (k) => k.replace(/^atlas:/, '').replace(/:/, ': ');
  /** نص قائمة الحسابات بلا بصمات الرموز (للنسخة الخام): يُحلَّل إن أمكن، وإلا تُحذف بنص منتظم من النص التالف. */
  function stripPins(text) {
    const r = parse(text, null);
    if (r && typeof r === 'object' && Array.isArray(r.profiles)) {
      for (const p of [...r.profiles, ...(Array.isArray(r.trash) ? r.trash : [])]) {
        if (p && typeof p === 'object') {
          delete p.guardian;
          delete p.recovery;
        }
      }
      return JSON.stringify(r);
    }
    return String(text ?? '').replace(/"(guardian|recovery)"\s*:\s*\{[^{}]*\}\s*,?/g, '');
  }
  /** رسالة واحدة بما قُصّ وما تُرك من آخر نسخة، بأسماء المفاتيح لا بعددها وحده (ن-9). */
  function warnBackup() {
    const parts = [];
    if (backupTrimmed.length) parts.push(`قُصّ نص طويل جداً (أكثر من 20 ألف محرف) ليدخل النسخة في: ${backupTrimmed.map(keyName).join('، ')}`);
    if (backupSkipped.length) parts.push(`تُرك خارج النسخة لأنه غير صالح: ${backupSkipped.map(keyName).join('، ')}`);
    if (parts.length) error('تنبيه: ' + parts.join('. ') + '. بقية بيانات الطفل في النسخة.');
  }

  async function packBackup(payload) {
    return {
      format: 'atlas-backup',
      version: 1,
      createdAt: new Date().toISOString(),
      payload,
      sha256: await digest(JSON.stringify(payload)),
    };
  }

  /**
   * يقرأ سجلات الحسابات من نص القائمة، سليماً كان أو تالفاً: يمشي داخل مصفوفة profiles محرفاً
   * محرفاً مع احترام السلاسل والاقتباسات المهرّبة، ويجمع لكل سجل وحده حقوله النصية والمنطقية من
   * المستوى الأول، ويعلم هل اكتمل السجل. العناصر غير الكائنات (null وغيرها) تُتجاهل، ولا يُؤخذ حقل
   * من activeId ولا من سجل مجاور، ولا من سلسلة مقطوعة.
   */
  function salvageProfiles(text) {
    const out = [];
    if (typeof text !== 'string') return out;
    const head = /"profiles"\s*:\s*\[/.exec(text);
    if (!head) return out;
    let i = head.index + head[0].length;
    let depth = 0; // 0: داخل المصفوفة، 1: داخل سجل حساب
    let cur = null;
    let key = null;
    let wantValue = false;
    const readString = () => {
      let j = i + 1;
      while (j < text.length) {
        if (text[j] === '\\') {
          j += 2;
          continue;
        }
        if (text[j] === '"') {
          const raw = text.slice(i, j + 1);
          i = j + 1;
          try {
            return JSON.parse(raw);
          } catch {
            return null;
          }
        }
        j++;
      }
      i = text.length;
      return null; // سلسلة مقطوعة: لا تُستعمل
    };
    const put = (k, v) => {
      if (k === null) return;
      if (Object.prototype.hasOwnProperty.call(cur.fields, k)) cur.dupes.add(k);
      else cur.fields[k] = v;
    };
    while (i < text.length && depth >= 0) {
      const c = text[i];
      if (c === '"') {
        const str = readString();
        if (depth === 1) {
          if (wantValue) {
            put(key, str);
            key = null;
            wantValue = false;
          } else {
            key = str;
          }
        }
        continue;
      }
      if (depth === 1 && wantValue && /[a-z0-9-]/.test(c)) {
        const word = /^[a-z0-9.eE+-]+/.exec(text.slice(i, i + 40))[0];
        const end = i + word.length;
        // كلمة مكتملة فقط (لا «tr» من «true» مقطوعة)
        if (end < text.length) put(key, word === 'true' ? true : word === 'false' ? false : { literal: word });
        i = end;
        key = null;
        wantValue = false;
        continue;
      }
      if (depth === 1 && c === ':') wantValue = key !== null;
      else if (depth === 1 && c === ',') {
        key = null;
        wantValue = false;
      } else if (c === '{' || c === '[') {
        if (depth === 0 && c === '{') out.push((cur = { fields: {}, dupes: new Set(), closed: false }));
        else if (depth === 1 && wantValue) put(key, { nested: true });
        key = null;
        wantValue = false;
        depth++;
      } else if (c === '}' || c === ']') {
        if (depth === 1 && c === '}' && cur) cur.closed = true;
        depth--;
      }
      i++;
    }
    return out;
  }

  /**
   * هوية حساب من سجله هو فقط: { name, gender, unverified }.
   * - لا سجل واحد مطابق، أو اسم أو جنس غير صالح: هوية مؤقتة صريحة.
   * - حالة التأكيد تُنقل كما هي؛ وتُعدّ «غير مؤكدة» إذا كانت true أو بنوع غير صحيح أو مكررة، أو إذا
   *   انقطع السجل قبل أن يُعرف هل فيه العلامة. لا يُستنتج التأكيد من مجرد قراءة اسم وجنس.
   */
  function identityFrom(rows, fallbackName) {
    const r = rows.length === 1 ? rows[0] : null;
    const f = r?.fields || {};
    const name = typeof f.name === 'string' ? f.name.trim().slice(0, 80) : '';
    const gender = f.gender;
    if (!r || !name || (gender !== 'm' && gender !== 'f') || r.dupes.has('name') || r.dupes.has('gender')) {
      return { name: fallbackName, gender: 'm', unverified: true };
    }
    const has = Object.prototype.hasOwnProperty.call(f, 'unverified');
    const unverified = has ? f.unverified !== false || r.dupes.has('unverified') : !r.closed;
    return unverified ? { name, gender, unverified: true } : { name, gender };
  }

  function salvageIdentity(text, uid, fallbackName) {
    return identityFrom(salvageProfiles(text).filter((r) => r.fields.id === uid), fallbackName);
  }

  /** هوية الطفل القديم: من سجله (ns=atlas:) في القائمة إن قُرئ، وإلا من ملف النسخة الأولى. */
  function legacyIdentity(regText, legacyText) {
    const rows = salvageProfiles(regText).filter((r) => r.fields.ns === LEGACY_NS);
    const old = parse(legacyText, null);
    const fallback = old && typeof old.name === 'string' && old.name.trim() ? old.name.trim().slice(0, 80) : 'طفلي';
    if (rows.length) return identityFrom(rows, fallback);
    // لا سجل في القائمة: ملف النسخة الأولى كتبه ولي الأمر نفسه
    return { name: fallback, gender: old?.gender === 'f' ? 'f' : 'm' };
  }

  /**
   * يحوّل نسخة خام (كل مفاتيح atlas: كما هي) إلى حسابات قابلة للاستعادة. لا يفترض صلاحية القائمة
   * داخلها: كل طفل له بيانات يُستعاد، وهويته من سجله هو، أو هوية مؤقتة صريحة.
   */
  function rawToProfiles(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return [];
    const out = [];
    const regText = typeof data[REG] === 'string' ? data[REG] : '';
    const legacyText = typeof data[LEGACY_PROFILE] === 'string' ? data[LEGACY_PROFILE] : null;
    // كائنات بلا نموذج أصلي: معرّف طفل اسمه __proto__ في نسخة خام لا يلوّث Object.prototype
    const legacyData = Object.create(null);
    const users = Object.create(null);
    for (const [k, v] of Object.entries(data)) {
      if (typeof k !== 'string' || !k.startsWith('atlas:')) continue;
      if (k.startsWith(USER_PREFIX)) {
        const m = k.slice(USER_PREFIX.length).match(/^([A-Za-z0-9_-]{1,80}):(.+)$/);
        if (m) (users[m[1]] ||= Object.create(null))['atlas:' + m[2]] = v;
      } else if (!isReserved(k)) {
        legacyData[k] = v;
      }
    }
    if (legacyText !== null && Object.keys(legacyData).length) {
      out.push({ profile: legacyIdentity(regText, legacyText), data: legacyData });
    }
    let n = 0;
    for (const [uid, d] of Object.entries(users)) {
      out.push({ profile: salvageIdentity(regText, uid, 'طفل مستعاد ' + (n + 1)), data: d });
      if (out[out.length - 1].profile.name === 'طفل مستعاد ' + (n + 1)) n++;
    }
    return out.slice(0, 50);
  }

  // ---------- الواجهة العامة ----------
  const api = {
    storage,
    error,
    active,
    imageSource,
    audioSource,
    status: () => ({ ...status, registryCorrupt }),

    profiles() {
      return registry().profiles.map(({ id, name, gender, photo, restoredAt, unverified, pinResetAt, resetRequestedAt, guardian, pendingGuardian }) => ({
        id, name, gender, photo, restoredAt, unverified: !!unverified, pinResetAt: pinResetAt || null,
        resetRequestedAt: resetRequestedAt || null, hasPin: !!guardian, pendingGuardian: !!pendingGuardian,
      }));
    },

    create({ name, gender, photo = '' }) {
      name = String(name || '').trim().slice(0, 80);
      if (!name) throw new Error('اكتب اسم الطفل');
      const next = registry();
      const p = { id: newId(), name, gender: gender === 'f' ? 'f' : 'm', photo: validPhoto(photo) };
      next.profiles.push(p);
      next.activeId = p.id;
      commit(next); // يرمي دون تغيير إن تعذّر الحفظ: لا حساب ظاهر ولا مفاتيح يتيمة
      bound = p.id;
      api.lock();
      return clone(p);
    },

    select(uid) {
      const next = registry();
      if (!next.profiles.some((p) => p.id === uid)) throw new Error('الحساب غير موجود');
      if (uid === bound) return;
      next.activeId = uid;
      commit(next);
      bound = uid;
      api.lock();
    },

    /**
     * ينقل الحساب النشط إلى «المحذوفات»: يختفي من القائمة وتبقى بياناته كما هي 30 يوماً، يُسترجع فيها من صفحة
     * الحسابات، ثم يُحذف نهائياً (المراجعة 20، ن-1). يحتاج شاشة ولي الأمر مفتوحة، واسم الطفل مكتوباً للتأكيد.
     */
    async remove(confirmName) {
      const p = active();
      if (!p) throw new Error('لا حساب نشط');
      if (!api.guardianUnlocked()) throw new Error('افتح شاشة ولي الأمر برمزك أولاً');
      if (String(confirmName || '').trim() !== p.name.trim()) throw new Error('الاسم المكتوب لا يطابق اسم الحساب. لم يُحذف شيء.');
      await storage.flush();
      const next = registry();
      const q = next.profiles.find((x) => x.id === p.id);
      next.profiles = next.profiles.filter((x) => x.id !== p.id);
      next.trash = [...(next.trash || []), { ...q, deletedAt: new Date().toISOString() }];
      next.activeId = next.profiles[0]?.id || null;
      commit(next); // لا يُمس مفتاح بيانات: الحساب يُسترجع كما كان
      bound = next.activeId;
      api.lock();
      return next.profiles.length;
    },

    /** حسابات «المحذوفات» مع موعد حذفها النهائي. */
    trash() {
      return (registry().trash || []).map(({ id, name, gender, photo, deletedAt, guardian }) => ({
        id, name, gender, photo, deletedAt, hasPin: !!guardian,
        purgeAt: new Date(Date.parse(deletedAt) + TRASH_DAYS * 86400000).toISOString(),
      }));
    },

    /** يعيد حساباً من «المحذوفات» ببياناته كلها؛ يطلب رمز ولي أمر ذلك الحساب إن كان له رمز. */
    async undelete(id, pin) {
      const next = registry();
      const t = (next.trash || []).find((x) => x.id === id);
      if (!t) throw new Error('الحساب غير موجود في المحذوفات.');
      if (t.guardian) await verifyPin(t, String(pin || ''));
      next.trash = next.trash.filter((x) => x.id !== id);
      const { deletedAt, ...q } = t;
      next.profiles.push(q);
      commit(next);
      return clone(q);
    },

    /** حذف نهائي الآن لحساب في «المحذوفات» (برمز ولي أمره إن كان له رمز). لا يُتراجع عنه. */
    async purge(id, pin) {
      const next = registry();
      const t = (next.trash || []).find((x) => x.id === id);
      if (!t) throw new Error('الحساب غير موجود في المحذوفات.');
      if (t.guardian) await verifyPin(t, String(pin || ''));
      next.trash = next.trash.filter((x) => x.id !== id);
      commit(next); // القائمة أولاً: إن تعذّر حفظها لم يُحذف شيء
      await eraseData(t);
    },

    update(v) {
      storage.setItem(LEGACY_PROFILE, JSON.stringify({ ...active(), ...v }));
    },

    /** المساحة المستعملة تقريباً (بالمحارف) للجهاز كله وللحساب النشط. */
    usage() {
      let total = 0;
      let mine = 0;
      const p = active();
      const ns = p ? nsOf(p) : null;
      for (const k of Object.keys(native)) {
        const n = k.length + (native.getItem(k) || '').length;
        total += n;
        if (ns && k.startsWith(ns) && (ns !== LEGACY_NS || !isReserved(k))) mine += n;
      }
      return { total, mine, quota: QUOTA_CHARS, ratio: Math.min(1, total / QUOTA_CHARS) };
    },

    // ---- قفل شاشة ولي الأمر (محلي: يمنع الطفل من الدخول بالخطأ، ولا يشفّر البيانات) ----
    lock() {
      try {
        session.removeItem('atlas:guardian');
      } catch {}
    },
    /** مرات رجوع ساعة الجهاز: [{at: متى اكتُشف، from: ما كانت تشير إليه قبلها}] (ن-6) */
    clockEvents() {
      const c = parse(native.getItem(CLOCK), null);
      return Array.isArray(c?.events) ? c.events.slice() : [];
    },
    /**
     * عدد الأيام بصيغته العربية (ن-18): «يوم واحد»، «يومان/يومين»، «3 أيام»، «11 يوماً»، «100 يوم».
     * kase: 'nom' للرفع (مرّ يومان)، وغيره للجر والنصب (بعد يومين).
     */
    days(n, kase = 'gen') {
      return countAr(n, kase, { zero: 'أقل من يوم', one: 'يوم واحد', two: ['يومان', 'يومين'], few: 'أيام', many: 'يوماً', unit: 'يوم' });
    },
    /** عدد المرات بصيغته: «مرة واحدة»، «مرتان/مرتين»، «3 مرات»، «11 مرة» */
    times(n, kase = 'gen') {
      return countAr(n, kase, { zero: 'ولا مرة', one: 'مرة واحدة', two: ['مرتان', 'مرتين'], few: 'مرات', many: 'مرة', unit: 'مرة' });
    },
    /** مفاتيح تُركت خارج آخر نسخة احتياطية (للعرض والاختبار) */
    backupSkipped: () => backupSkipped.slice(),
    backupTrimmed: () => backupTrimmed.slice(),
    hasPin: () => !!active()?.guardian,
    /** هل لحساب الطفل رمز استعادة؟ (الحسابات من قبل 1.3.0 بلا رمز حتى يفتحها ولي الأمر مرة) */
    hasRecovery: () => !!active()?.recovery,
    guardianUnlocked() {
      const s = parse(session.getItem('atlas:guardian'), null);
      return s?.id === bound && s.until > Date.now();
    },
    /**
     * يحدد رمز ولي الأمر. إن لم يكن للحساب رمز استعادة يُنشأ واحد ويُعاد مرة واحدة ({recovery}) ليعرضه
     * ولي الأمر ويكتبه؛ لا يُحفظ إلا بصمته. والحسابات المستعادة على جهاز جديد بلا رمز (pendingGuardian)
     * تأخذ الرمز ورمز الاستعادة نفسيهما، فلا يحدد الطفل رمزها قبل ولي الأمر.
     */
    async setPin(pin) {
      if (!/^\d{4,12}$/.test(pin)) throw new Error('استخدم رمزًا من 4 إلى 12 رقمًا');
      if (api.hasPin() && !api.guardianUnlocked()) throw new Error('افتح شاشة ولي الأمر');
      const salt = newId();
      const hash = await pinHash(pin, salt);
      const next = registry();
      const p = next.profiles.find((x) => x.id === bound);
      if (!p) throw new Error('اختر حساب الطفل');
      p.guardian = { salt, hash };
      let code = null;
      if (!p.recovery) {
        code = newRecoveryCode();
        p.recovery = await recoveryHash(code);
      }
      for (const q of next.profiles) {
        if (q.id !== bound && q.pendingGuardian && !q.guardian) {
          q.guardian = clone(p.guardian);
          q.recovery = clone(p.recovery);
          delete q.pendingGuardian;
        }
      }
      delete p.pendingGuardian;
      commit(next);
      await api.unlock(pin);
      return code ? { recovery: code } : {};
    },
    /**
     * فتح شاشة ولي الأمر. بعد 5 محاولات خاطئة يُفرض انتظار يتضاعف (30 ثانية، دقيقة، دقيقتان… حتى
     * ساعة)، ويبقى محفوظاً بعد إعادة التحميل. ويُسجَّل أي الأطفال يفتحهم الرمز نفسه، فنسخة «كل أطفال
     * الجهاز» لا تُنزَّل إلا إن فتح الرمزُ كل حساب له رمز. وفتحها بالرمز يلغي أي طلب إعادة تعيين معلّق.
     */
    async unlock(pin) {
      const me = active();
      await verifyPin(me, pin);
      const fails = parse(native.getItem(PIN_FAILS), {}) || {};
      // أي الحسابات الأخرى يفتحها الرمز نفسه (لنسخة «كل الأطفال»). محدود بعدّاد مستقل حتى لا يصير
      // وسيلة لتخمين رموز الإخوة بلا انتظار؛ ولا يمس فتح حساب كل طفل برمزه.
      const opens = [bound];
      const others = registry().profiles.filter((p) => p.id !== bound && p.guardian);
      const of = isObj(fails['*opens']) ? fails['*opens'] : { n: 0, until: 0 };
      if (others.length && !(of.until > Date.now())) {
        for (const p of others) if ((await pinHash(pin, p.guardian.salt)) === p.guardian.hash) opens.push(p.id);
        if (opens.length === others.length + 1) delete fails['*opens'];
        else {
          of.n = (of.n || 0) + 1;
          if (of.n >= 5) of.until = Date.now() + Math.min(3600000, 30000 * 2 ** (of.n - 5));
          fails['*opens'] = of;
        }
        try {
          native.setItem(PIN_FAILS, JSON.stringify(fails));
        } catch {}
      }
      if (me.resetRequestedAt) {
        try {
          const next = registry();
          delete next.profiles.find((x) => x.id === bound).resetRequestedAt;
          commit(next);
        } catch {}
      }
      session.setItem('atlas:guardian', JSON.stringify({ id: bound, until: Date.now() + 900000, opens }));
    },
    /** هل فتح الرمز المُدخل كل حساب محمي على الجهاز؟ */
    guardianOpensAll() {
      const s = parse(session.getItem('atlas:guardian'), null);
      if (!(s?.id === bound && s.until > Date.now())) return false;
      const opens = new Set(Array.isArray(s.opens) ? s.opens : [bound]);
      return registry().profiles.every((p) => !p.guardian || opens.has(p.id));
    },
    /** حساب له رمز وليس له رمز استعادة (من قبل 1.3.0): يُنشأ له رمز ويُعاد مرة واحدة. يحتاج الشاشة مفتوحة. */
    async ensureRecovery() {
      if (!api.guardianUnlocked()) throw new Error('افتح شاشة ولي الأمر');
      if (active()?.recovery) return null;
      return api.newRecovery();
    },
    /** رمز استعادة جديد يحل محل القديم (إن ضاع القديم). يُعاد مرة واحدة. */
    async newRecovery() {
      if (!api.guardianUnlocked()) throw new Error('افتح شاشة ولي الأمر');
      const code = newRecoveryCode();
      const h = await recoveryHash(code);
      const next = registry();
      next.profiles.find((x) => x.id === bound).recovery = h;
      commit(next);
      return code;
    },
    /**
     * «نسيت الرمز»: رمز الاستعادة الذي كتبه ولي الأمر يحذف رمز الشاشة، ثم يُختار رمز جديد ويُعطى رمز استعادة
     * جديد. لا يمس تقدّم الطفل ولا تسجيلاته ولا الدرجات. بعد 3 أخطاء انتظار يتضاعف (دقيقة، دقيقتان…).
     */
    async recoverPin(code) {
      const p = active();
      if (!p) throw new Error('اختر حساب الطفل');
      if (!p.recovery) throw new Error('لا رمز استعادة لهذا الحساب.');
      const key = 'rec:' + bound;
      const fails = parse(native.getItem(PIN_FAILS), {}) || {};
      const f = isObj(fails[key]) ? fails[key] : { n: 0, until: 0 };
      if (f.until > Date.now()) {
        throw new Error('محاولات خاطئة كثيرة. انتظر ' + Math.ceil((f.until - Date.now()) / 1000) + ' ثانية ثم أعد المحاولة.');
      }
      if ((await pinHash(normRecovery(code), p.recovery.salt)) !== p.recovery.hash) {
        f.n = (f.n || 0) + 1;
        if (f.n >= 3) f.until = Date.now() + Math.min(3600000, 60000 * 2 ** (f.n - 3));
        fails[key] = f;
        try {
          native.setItem(PIN_FAILS, JSON.stringify(fails));
        } catch {}
        throw new Error('رمز الاستعادة غير صحيح.');
      }
      delete fails[key];
      try {
        native.setItem(PIN_FAILS, JSON.stringify(fails));
      } catch {}
      resetGuardian();
    },
    /**
     * لمن لا رمز استعادة لحسابه أو ضاع منه: طلب إعادة تعيين يُتاح بعد 3 أيام. يظهر الطلب في صفحة الحسابات
     * طوال المدة، وفتح الشاشة بالرمز يلغيه؛ فلا يكفي الطفلَ أن يطلبه في غفلة من أهله.
     */
    requestReset() {
      const next = registry();
      const p = next.profiles.find((x) => x.id === bound);
      if (!p?.guardian) throw new Error('لا رمز لهذا الحساب.');
      if (!p.resetRequestedAt) {
        p.resetRequestedAt = new Date().toISOString();
        commit(next);
      }
      return api.resetRequest();
    },
    resetRequest() {
      const p = active();
      if (!p?.resetRequestedAt) return null;
      const at = Date.parse(p.resetRequestedAt);
      return { at: p.resetRequestedAt, due: new Date(at + RESET_WAIT).toISOString(), ready: Date.now() >= at + RESET_WAIT };
    },
    completeReset() {
      if (!api.resetRequest()?.ready) throw new Error('لم تنقضِ مدة الطلب بعد.');
      resetGuardian();
    },

    // ---- النسخ الاحتياطي ----
    async backup() {
      if (!api.guardianUnlocked()) throw new Error('افتح شاشة ولي الأمر');
      await api.ready;
      mediaMissed = 0;
      backupSkipped = [];
      backupTrimmed = [];
      const out = await packBackup(await snapshotActive());
      warnMissed();
      warnBackup();
      return out;
    },

    /**
     * نسخة إنقاذ: كل حسابات الجهاز في ملف واحد بصيغة النسخة الكاملة (تُستعاد من شاشة ولي الأمر).
     * متاحة دون رمز في وضع الإنقاذ فقط، أو حين لا رمز للحساب النشط، أو بعد فتح القفل.
     * إن تعذّرت قراءة السجل تُنزَّل المفاتيح كما هي (atlas-raw) حتى لا يضيع شيء.
     */
    async rescueDownload() {
      const stamp = new Date().toISOString().slice(0, 10);
      mediaMissed = 0;
      try {
        const anyPin = !registryCorrupt && registry().profiles.some((p) => p.guardian);
        if (status.mode !== 'rescue' && anyPin && !api.guardianOpensAll()) {
          throw Object.assign(new Error(api.guardianUnlocked()
            ? 'لهذه النسخة يلزم رمز يفتح حسابات كل الأطفال المحمية؛ افتح الشاشة برمز ولي الأمر.'
            : 'افتح شاشة ولي الأمر'), { guard: true });
        }
        if (registryCorrupt) throw new Error('raw'); // القائمة لا تعرف كل الحسابات: ننزّل كل المفاتيح كما هي
        const r = registry();
        const profiles = r.profiles.map((p) => {
          const ns = nsOf(p);
          const data = {};
          for (const k of Object.keys(native)) {
            if (k.startsWith(ns) && (ns !== LEGACY_NS || !isReserved(k))) {
              data['atlas:' + k.slice(ns.length)] = native.getItem(k);
            }
          }
          return { profile: exportProfile(p), data };
        });
        backupSkipped = [];
        backupTrimmed = [];
        for (const e of profiles) for (const k of Object.keys(e.data)) {
          const v = backupValue(k, await hydrateFull(e.data[k]));
          if (v === null) delete e.data[k];
          else e.data[k] = v;
        }
        if (!profiles.length) throw new Error('raw');
        api.download('atlas-rescue-' + stamp + '.json', await packBackup({ profiles }));
        warnMissed();
        warnBackup();
      } catch (e) {
        if (e.guard) throw e;
        const raw = {};
        for (const k of Object.keys(native)) {
          if (!k.startsWith('atlas:') || k === PIN_FAILS) continue;
          // بصمات الرموز لا تخرج حتى في النسخة الخام (ن-5): تُحذف من نص القائمة ولو كان تالفاً
          raw[k] = k === REG || k.startsWith('atlas:accounts:corrupt:') ? stripPins(native.getItem(k)) : await hydrateFull(native.getItem(k));
        }
        api.download('atlas-raw-' + stamp + '.json', { format: 'atlas-raw', createdAt: new Date().toISOString(), data: raw });
        warnMissed();
      }
    },

    /**
     * استعادة نسخة (كاملة أو إنقاذ أو خام) إلى حسابات جديدة؛ لا تُمس الحسابات الموجودة.
     * تُفحص كل الحسابات أولاً على نسخة مستقلة من القائمة، ولا يتغير شيء (القرص أو الذاكرة أو
     * الحساب النشط) إلا بعد نجاح الحفظ الكامل. النسخة الخام (atlas-raw) بلا بصمة: يُتخطّى منها
     * ما لا يصلح ويُعاد عدده.
     */
    async restore(text) {
      if (typeof text !== 'string' || text.length > 30 * 1024 * 1024) throw new Error('ملف كبير جدًا');
      if (registryCorrupt) throw new Error('قائمة الحسابات تالفة؛ اضغط «إصلاح قائمة الحسابات» أولاً.');
      // من يستعيد: ولي الأمر الذي فتح شاشته برمزه، أو لا أحد (جهاز جديد بلا حسابات)
      const host = api.guardianUnlocked() ? active() : null;
      let b;
      try {
        b = JSON.parse(text);
      } catch {
        throw new Error('ملف JSON غير صالح');
      }
      let list;
      const lenient = b?.format === 'atlas-raw';
      if (lenient) {
        list = rawToProfiles(b.data);
        if (!list.length) throw new Error('لا توجد بيانات طفل في النسخة الخام');
      } else {
        list = b?.payload?.profiles;
        if (b?.format !== 'atlas-backup' || b.version !== 1 || !Array.isArray(list) || !list.length || list.length > 50) {
          throw new Error('إصدار غير مدعوم');
        }
        if (b.sha256 !== (await digest(JSON.stringify(b.payload)))) throw new Error('فشل فحص سلامة النسخة؛ لم تتغير البيانات');
      }
      const next = registry(); // نسخة مستقلة
      const hadProfiles = next.profiles.length > 0;
      const entries = [];
      const added = [];
      let skipped = 0;
      for (const e of list) {
        const p = e.profile;
        if (!p || typeof p.name !== 'string' || !p.name.trim() || p.name.length > 80 || !['m', 'f'].includes(p.gender) ||
            !e.data || typeof e.data !== 'object' || Array.isArray(e.data)) {
          throw new Error('حساب غير صالح');
        }
        const q = {
          id: newId(),
          name: p.name,
          gender: p.gender,
          photo: lenient ? '' : validPhoto(p.photo),
          restoredAt: new Date().toISOString(),
        };
        // هوية مؤقتة لم يؤكدها ولي الأمر: تنتقل مع كل صيغ النسخ، ولا يزيلها إلا تعديل الاسم والجنس
        if (p.unverified !== undefined && typeof p.unverified !== 'boolean') throw new Error('حساب غير صالح');
        if (p.unverified === true) q.unverified = true;
        // لا يُؤخذ رمز من النسخة (ن-5؛ النسخ القديمة كانت تحمل بصمته): الحساب المستعاد يأخذ رمز ولي الأمر الذي
        // فتح الشاشة واستعاد، أو ينتظر أول رمز يُحدَّد على هذا الجهاز (pendingGuardian) إن استُعيد على جهاز جديد
        if (host?.guardian) {
          q.guardian = clone(host.guardian);
          if (host.recovery) q.recovery = clone(host.recovery);
        } else {
          q.pendingGuardian = true;
        }
        for (const [k, v] of Object.entries(e.data)) {
          try {
            if (!BACKUP_KEY.test(k) || typeof v !== 'string') {
              throw new Error('مفتاح غير مدعوم');
            }
            let value;
            try {
              value = JSON.parse(v);
            } catch {
              throw new Error('قيمة غير صالحة');
            }
            if (v.includes(MEDIA_REF)) throw new Error('النسخة تشير إلى وسائط ليست فيها');
            validState(k, value);
            validMedia(value);
            // اعتماد الإهداء موافقة ولي أمر على هذا الجهاز: المستورد يحتاج اعتماداً جديداً بعد الاستماع (ن-13)
            if (/:approval$/.test(k) && value?.ok === true) {
              entries.push([physical(q, k), JSON.stringify({ ...value, ok: false, imported: true })]);
              continue;
            }
            entries.push([physical(q, k), v]);
          } catch (err) {
            if (!lenient) throw err;
            skipped++;
          }
        }
        next.profiles.push(q);
        added.push(q);
      }
      // على جهاز فيه حسابات: الاستعادة من شاشة ولي الأمر وحدها (ن-13)؛ والجهاز الجديد بلا حسابات يستعيد من صفحة الحسابات.
      // يُفحص الملف أولاً ثم الإذن، ولا يتغير شيء قبلهما
      if (hadProfiles && !host) {
        throw new Error('الاستعادة على جهاز فيه حسابات تكون من شاشة ولي الأمر: افتحها برمزك ثم اختر «استعادة نسخة».');
      }
      next.activeId = added[0].id;
      // الوسائط إلى IndexedDB أولاً؛ إن تعذّر بقيت داخل القيم كما في النسخة
      const puts = [];
      const stored = entries.map(([k, v]) => {
        const ext = externalize(k, v);
        puts.push(...ext.puts);
        return [k, ext.text];
      });
      let useStore = false;
      if (puts.length) {
        try {
          await mediaTx('readwrite', (st) => puts.forEach(([id, d]) => st.put(d, id)));
          useStore = true;
        } catch {}
      }
      try {
        transaction(useStore ? stored : entries, next); // يرمي ويتراجع عن القرص؛ الذاكرة لم تُمس
      } catch (e) {
        if (useStore) await mediaTx('readwrite', (st) => puts.forEach(([id]) => st.delete(id))).catch(() => {});
        throw e;
      }
      if (useStore) puts.forEach(([id, d]) => (mediaCache.set(id, d), mediaStored.set(id, d)));
      bound = next.activeId;
      api.lock();
      // من الخام: عدد العناصر المتخطاة، وعدد الأطفال بهوية مؤقتة تحتاج تأكيد ولي الأمر
      const temporary = added.filter((x) => x.unverified).length;
      return lenient ? { restored: added.length, skipped, temporary } : added.length;
    },

    /**
     * «إصلاح قائمة الحسابات» التالفة: يحفظ نصها الأصلي جانباً (atlas:accounts:corrupt:<وقت>)
     * ثم يبني قائمة جديدة من البيانات الموجودة: ملف الطفل القديم، وكل مساحة atlas:user:<id>.
     * لا يُحذف أي مفتاح بيانات.
     */
    repairRegistry() {
      registry(); // إن أصلحتها نافذة أخرى نتبنّى قائمتها ولا نعيد البناء
      if (!registryCorrupt) return 0;
      const broken = native.getItem(REG);
      const profiles = [];
      const legacy = legacyProfile();
      if (legacy) {
        Object.assign(legacy, legacyIdentity(broken, native.getItem(LEGACY_PROFILE)));
        legacy.id = newId();
        profiles.push(legacy);
      }
      const uids = new Set();
      for (const k of Object.keys(native)) {
        const m = k.startsWith(USER_PREFIX) && k.slice(USER_PREFIX.length).match(/^([A-Za-z0-9_-]{1,80}):/);
        if (m) uids.add(m[1]);
      }
      let n = 0;
      for (const uid of uids) {
        const who = salvageIdentity(broken, uid, 'طفل مستعاد ' + (n + 1));
        if (who.name === 'طفل مستعاد ' + (n + 1)) n++;
        profiles.push({ id: uid, ...who, photo: '', repairedAt: new Date().toISOString() });
      }
      const next = withBase({ version: 1, activeId: profiles[0]?.id || null, profiles }, broken);
      const backupKey = 'atlas:accounts:corrupt:' + Date.now();
      checkBase(next); // نافذة أخرى غيّرت القائمة: لا نكتب فوقها
      registryCorrupt = false;
      try {
        transaction([[backupKey, broken || '']], next);
      } catch (e) {
        registryCorrupt = true;
        throw e;
      }
      memoryRegistry = null;
      bound = next.activeId;
      leaveRescue();
      api.lock();
      return profiles.length;
    },

    /** بصمة قصيرة لمحتوى (لربط تقييم ولي الأمر أو اعتماده بالنص أو التسجيل الذي قيّمه بالضبط). */
    signature(v) {
      const t = JSON.stringify(v ?? null);
      let a = 2166136261,
        b = 5381;
      for (let i = 0; i < t.length; i++) {
        a = Math.imul(a ^ t.charCodeAt(i), 16777619);
        b = Math.imul(b, 33) ^ t.charCodeAt(i);
      }
      return t.length + ':' + (a >>> 0) + ':' + (b >>> 0);
    },

    /** حجم الوسائط في IndexedDB والسعة المتاحة تقريباً (للعرض في شاشة ولي الأمر والبيت). */
    async mediaUsage() {
      let used = null,
        quota = null;
      try {
        const e = await root.navigator?.storage?.estimate?.();
        if (e) {
          used = e.usage ?? null;
          quota = e.quota ?? null;
        }
      } catch {}
      if (used === null) {
        try {
          used = 0;
          await mediaTx('readonly', (st) => {
            const rq = st.openCursor();
            rq.onsuccess = () => {
              const c = rq.result;
              if (c) {
                used += typeof c.value === 'string' ? c.value.length : 0;
                c.continue();
              }
            };
          });
        } catch {
          return null;
        }
      }
      return { used, quota, store: !!(await openMedia()) };
    },

    /** يصغّر صورة الطفل إلى مربع صغير (نحو 10 كيلوبايت بدل مئات) قبل حفظها. */
    shrinkPhoto(src, size = 160) {
      return new Promise((resolve, reject) => {
        const im = new root.Image();
        im.onload = () => {
          const w = im.naturalWidth,
            h = im.naturalHeight,
            s = Math.min(w, h);
          if (!s) return reject(new Error('تعذّرت قراءة الصورة'));
          const c = root.document.createElement('canvas');
          c.width = c.height = size;
          c.getContext('2d').drawImage(im, (w - s) / 2, (h - s) / 2, s, s, 0, 0, size, size);
          let out = c.toDataURL('image/webp', 0.82);
          if (!out.startsWith('data:image/webp')) out = c.toDataURL('image/jpeg', 0.85);
          resolve(out);
        };
        im.onerror = () => reject(new Error('تعذّرت قراءة الصورة'));
        im.src = src;
      });
    },

    /** الصور الكبيرة المحفوظة من قبل تُصغَّر مرة واحدة (قائمة الحسابات تُقرأ مع كل ضغطة). */
    async shrinkPhotos() {
      if (registryCorrupt) return 0;
      let n = 0;
      for (const p of registry().profiles) {
        if (!p.photo || p.photo.length < 60000) continue;
        try {
          const small = await api.shrinkPhoto(p.photo);
          const next = registry();
          const q = next.profiles.find((x) => x.id === p.id);
          if (!q || q.photo !== p.photo) continue;
          q.photo = validPhoto(small);
          commit(next);
          n++;
        } catch {}
      }
      return n;
    },

    download(name, v, type = 'application/json') {
      const blob = new Blob([typeof v === 'string' ? v : JSON.stringify(v, null, 2)], { type });
      const url = URL.createObjectURL(blob);
      const a = root.document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
      root.setTimeout(() => URL.revokeObjectURL(url), 60000);
    },
  };

  root.addEventListener?.('storage', (e) => {
    if (e.key !== REG) return;
    let id = null;
    try {
      id = registry().activeId;
    } catch {}
    if (id !== bound) {
      api.lock();
      root.location.replace('index.html');
    }
  });

  /*
   * جاهزية الصفحة: نقل الوسائط القديمة إلى IndexedDB ثم تحميل وسائط الطفل النشط إلى الذاكرة.
   * لا تُرفض أبداً، ولا تنتظر أكثر من بضع ثوانٍ (المخزن البطيء لا يوقف التعلّم).
   */
  api.ready = (async () => {
    try {
      root.navigator?.storage?.persist?.().catch?.(() => {});
    } catch {}
    try {
      await Promise.race([
        (async () => {
          await migrateMedia();
          await preloadActive();
          await purgeExpiredTrash();
        })(),
        new Promise((r) => root.setTimeout(r, 15000)), // جهاز بطيء: تبدأ الصفحة، وما لم يُحمَّل يُحمَّل عند الحاجة (storage.load)
      ]);
    } catch {}
  })();

  root.Atlas = api;
})(window);

/* ===== تلاوة الآيات =====
 * القرآن لا يُقرأ بالقارئ الآلي أبداً. مصدر التلاوة أحد اثنين:
 *  1) تسجيل أو ملف يرفعه ولي الأمر من شاشته: يُحفظ للجهاز كله (لا لحساب طفل بعينه) في قاعدة IndexedDB مستقلة «atlas-quran».
 *  2) ملف يضعه المطوّر في app/v2/audio/quran/<سورة>-<آية>.mp3 (أو ‎.m4a أو ‎.ogg) فيُحزم مع التطبيق.
 * ما يرفعه ولي الأمر مقدَّم على ملف المطوّر. وإن لم يوجد أيٌّ منهما تُعرض الآية مكتوبة بلا صوت.
 */
(function (root) {
  'use strict';
  const MAX = 12 * 1048576;
  const shippedCache = new Map();
  const urls = new Map(), drop = (k) => { const u = urls.get(k); if (u) { try { URL.revokeObjectURL(u); } catch { /* لا شيء */ } urls.delete(k); } };
  let db = null;
  const open = () => db || (db = new Promise((resolve) => {
    try {
      if (!root.indexedDB) return resolve(null);
      const rq = root.indexedDB.open('atlas-quran', 1);
      rq.onupgradeneeded = () => rq.result.createObjectStore('audio');
      rq.onsuccess = () => resolve(rq.result);
      rq.onerror = rq.onblocked = () => resolve(null);
    } catch { resolve(null); }
  }));
  const tx = (mode, fn) => open().then((d) => {
    if (!d) throw new Error('تعذّر فتح مخزن التلاوات على هذا الجهاز.');
    return new Promise((resolve, reject) => {
      const t = d.transaction('audio', mode);
      const rq = fn(t.objectStore('audio'));
      t.oncomplete = () => resolve(rq && rq.result);
      t.onerror = t.onabort = () => reject(t.error || new Error('تعذّر الحفظ.'));
    });
  });
  const valid = (k) => typeof k === 'string' && /^\d{1,3}:\d{1,3}$/.test(k);
  const probe = (src) => new Promise((resolve) => {
    let done = false; const end = (v) => { if (!done) { done = true; resolve(v); } };
    try { const a = new Audio(); a.preload = 'metadata'; a.onloadedmetadata = () => end(src); a.onerror = () => end(null); a.src = src; setTimeout(() => end(null), 4000); } catch { end(null); }
  });
  const QA = {
    valid,
    file: (k) => 'audio/quran/' + k.replace(':', '-'),
    async parent(k) { if (!valid(k)) return null; try { const b = await tx('readonly', (s) => s.get(k)); return b instanceof Blob ? b : null; } catch { return null; } },
    /* mp3 أولاً (كل ملفات المنهج mp3)، ثم البقية إن غاب: لا طلبات 404 في الحالة العادية */
    async shipped(k) { if (!valid(k)) return null; if (shippedCache.has(k)) return shippedCache.get(k); let r = null; for (const e of ['.mp3', '.m4a', '.ogg']) { r = await probe(QA.file(k) + e); if (r) break; } shippedCache.set(k, r); return r; },
    /** يعيد {url, from} أو null. from: 'parent' أو 'app' */
    async source(k) {
      const b = await QA.parent(k);
      if (b) { if (!urls.has(k)) urls.set(k, URL.createObjectURL(b)); return { url: urls.get(k), from: 'parent' }; }
      const s = await QA.shipped(k); return s ? { url: s, from: 'app' } : null;
    },
    async put(k, blob) {
      if (!valid(k)) throw new Error('مفتاح آية غير صالح.');
      if (!(blob instanceof Blob) || !/^audio\//.test(blob.type || '')) throw new Error('الملف ليس ملفاً صوتياً.');
      if (!blob.size || blob.size > MAX) throw new Error('حجم الملف يجب ألا يتجاوز 12 ميغابايت.');
      /* ملف لا يستطيع الجهاز تشغيله لا يُحفظ: وإلا حجب التلاوة المرفقة بالتطبيق بصمت */
      const u = URL.createObjectURL(blob), playable = await probe(u); URL.revokeObjectURL(u);
      if (!playable) throw new Error('هذا الجهاز لا يستطيع تشغيل الملف. جرّب ملف mp3 أو m4a.');
      await tx('readwrite', (s) => s.put(blob, k)); drop(k);
    },
    async remove(k) { if (valid(k)) { await tx('readwrite', (s) => s.delete(k)); drop(k); } },
  };
  root.QuranAudio = Object.freeze(QA);
})(typeof window !== 'undefined' ? window : globalThis);

/* ===== حزم صوت المعلق (استوديو جسم الإنسان، المرحلة 1) =====
 * الاستوديو يصدّر «حزمة صوت»: ملف zip فيه manifest.json وتسجيلات، كل تسجيل مربوط ببصمة نصه (audio-key.js).
 * ولي الأمر يستوردها من شاشته؛ تُحفظ للجهاز كله في IndexedDB «atlas-voice» (لا لطفل بعينه، ولا في النسخ الاحتياطية).
 * التسجيل لا يُسمع إلا على نصه: البصمة تُحسب من النص المسموع نفسه، فنص تغيّر لا يجد تسجيله القديم.
 * القرآن لا يدخل هنا أبداً (قائمة التسجيل بلا آيات؛ والتلاوة لها مخزنها «atlas-quran»).
 */
(function (root) {
  'use strict';
  const MAX_FILE = 4 * 1048576, MAX_PACK = 400 * 1048576, MAX_ENTRIES = 20000;
  const KEY = /^[0-9a-f]{8}\.[0-9a-z]{1,4}$/;
  const urls = new Map();
  let db = null, keys = null;
  const open = () => db || (db = new Promise((resolve) => {
    try {
      if (!root.indexedDB) return resolve(null);
      const rq = root.indexedDB.open('atlas-voice', 1);
      rq.onupgradeneeded = () => rq.result.createObjectStore('audio');
      rq.onsuccess = () => resolve(rq.result);
      rq.onerror = rq.onblocked = () => resolve(null);
    } catch { resolve(null); }
  }));
  const tx = (mode, fn) => open().then((d) => {
    if (!d) throw new Error('تعذّر فتح مخزن الصوت على هذا الجهاز.');
    return new Promise((resolve, reject) => {
      const t = d.transaction('audio', mode);
      const rq = fn(t.objectStore('audio'));
      t.oncomplete = () => resolve(rq && rq.result);
      t.onerror = t.onabort = () => reject(t.error || new Error('تعذّر الحفظ (قد تكون مساحة الجهاز ممتلئة).'));
    });
  });

  /* قارئ zip صغير: «مخزَّن» (بلا ضغط) أو «deflate» عبر DecompressionStream. يكفي حزم الاستوديو */
  async function unzip(buf) {
    const v = new DataView(buf), u8 = new Uint8Array(buf);
    let e = -1; for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 65557); i--) if (v.getUint32(i, true) === 0x06054b50) { e = i; break; }
    if (e < 0) throw new Error('الملف ليس حزمة صوت (ليس zip).');
    const n = v.getUint16(e + 10, true); let p = v.getUint32(e + 16, true);
    if (n > MAX_ENTRIES + 1) throw new Error('الحزمة فيها ملفات أكثر من المسموح.');
    const dec = new TextDecoder(), out = new Map();
    for (let k = 0; k < n; k++) {
      if (v.getUint32(p, true) !== 0x02014b50) throw new Error('الحزمة تالفة.');
      const method = v.getUint16(p + 10, true), csize = v.getUint32(p + 20, true), nl = v.getUint16(p + 28, true), xl = v.getUint16(p + 30, true), cl = v.getUint16(p + 32, true), off = v.getUint32(p + 42, true);
      const name = dec.decode(u8.subarray(p + 46, p + 46 + nl)); p += 46 + nl + xl + cl;
      const ln = v.getUint16(off + 26, true), lx = v.getUint16(off + 28, true), start = off + 30 + ln + lx;
      if (start + csize > buf.byteLength) throw new Error('الحزمة تالفة.');
      const raw = u8.subarray(start, start + csize);
      out.set(name, { method, raw });
    }
    const data = async (name) => {
      const f = out.get(name); if (!f) return null;
      if (f.method === 0) return f.raw;
      if (f.method === 8 && typeof DecompressionStream === 'function') return new Uint8Array(await new Response(new Blob([f.raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
      throw new Error('طريقة ضغط غير مدعومة في الحزمة.');
    };
    return { names: [...out.keys()], data };
  }

  const VP = {
    valid: (k) => typeof k === 'string' && KEY.test(k),
    /** مفاتيح التسجيلات المستوردة (تُقرأ مرة لكل صفحة) */
    ready: null,
    has: (k) => !!(keys && keys.has(k)),
    count: () => (keys ? keys.size : 0),
    async url(k) {
      if (!VP.has(k)) return null; if (urls.has(k)) return urls.get(k);
      try { const r = await tx('readonly', (s) => s.get(k)); const b = r && r.blob; if (!(b instanceof Blob)) return null; const u = URL.createObjectURL(b); urls.set(k, u); return u; } catch { return null; }
    },
    /** يستورد حزمة صوت من الاستوديو. يعيد {added, replaced, skipped, lessons} */
    async importPack(file) {
      if (!file || !file.size) throw new Error('لم يُختر ملف.');
      if (file.size > MAX_PACK) throw new Error('الحزمة أكبر من 400 ميغابايت؛ صدّرها درساً درساً.');
      const z = await unzip(await file.arrayBuffer());
      let man; try { man = JSON.parse(new TextDecoder().decode(await z.data('manifest.json'))); } catch { man = null; }
      if (!man || man.type !== 'humanbody-voice-pack' || man.version !== 1 || !Array.isArray(man.entries)) throw new Error('الملف ليس حزمة صوت من استوديو جسم الإنسان.');
      let added = 0, replaced = 0, skipped = 0; const lessons = new Set(), rows = [];
      for (const e of man.entries.slice(0, MAX_ENTRIES)) {
        if (!e || !VP.valid(e.akey) || typeof e.name !== 'string' || !/^audio\/(webm|ogg|mp4|mpeg|aac|wav)/.test(String(e.mime || ''))) { skipped++; continue; }
        const bytes = await z.data(e.name);
        if (!bytes || !bytes.length || bytes.length > MAX_FILE) { skipped++; continue; }
        rows.push({ k: e.akey, v: { blob: new Blob([bytes], { type: String(e.mime).split(';')[0] }), lesson: String(e.lesson || ''), file: String(e.file || ''), at: man.created || '', by: String(man.recorder || '').slice(0, 60) } });
        if (e.lesson) lessons.add(String(e.lesson));
      }
      await VP.ready;
      await tx('readwrite', (s) => { let last = null; for (const r of rows) last = s.put(r.v, r.k); return last; });
      for (const r of rows) { if (keys.has(r.k)) replaced++; else added++; keys.add(r.k); const u = urls.get(r.k); if (u) { try { URL.revokeObjectURL(u); } catch { /* لا شيء */ } urls.delete(r.k); } }
      return { added, replaced, skipped, lessons: [...lessons].sort() };
    },
    async clear() { await tx('readwrite', (s) => s.clear()); keys = new Set(); for (const u of urls.values()) { try { URL.revokeObjectURL(u); } catch { /* لا شيء */ } } urls.clear(); },
    _unzip: unzip,
  };
  VP.ready = tx('readonly', (s) => s.getAllKeys()).then((ks) => { keys = new Set((ks || []).filter(VP.valid)); }, () => { keys = new Set(); });
  root.VoicePack = Object.freeze(VP);
})(typeof window !== 'undefined' ? window : globalThis);
