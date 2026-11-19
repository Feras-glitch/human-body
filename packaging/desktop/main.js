// غلاف سطح المكتب (ويندوز) لمنهاج «جسم الإنسان» — Electron
// يعرض التطبيق من الملفات المحلية (www/) بلا إنترنت، ويحفظ التقدّم في مجلد المستخدم.
const { app, BrowserWindow, Menu, shell, session, dialog, protocol, net, ipcMain } = require('electron');
const UP = require('./update.js');
const path=require('path');const fs=require('fs');const{fileURLToPath,pathToFileURL}=require('url');

app.setName('HumanBodyCurriculum');            // يحدد مجلد البيانات: %APPDATA%\HumanBodyCurriculum
if (process.platform === 'win32') app.setAppUserModelId('com.feras.humanbody');
if (!app.requestSingleInstanceLock()) { app.quit(); }

const WWW = path.join(__dirname, 'www');
const ICON = path.join(__dirname, 'app.ico');
let win = null;

const page = (name) => path.join(WWW, name);
// نوع البناء وبصمة المحتوى (tools/build-info.mjs يكتبها في www عند الحزم): المسودة غير المعتمدة توسم في «عن التطبيق»
const KIND = { dev: 'نسخة تطوير', draft: 'مسودة غير معتمدة — محتوى لم يعتمده المراجعان العلمي والشرعي بعد؛ للتجربة لا للنشر', release: 'إصدار معتمد' };
function buildInfo() { try { return JSON.parse(fs.readFileSync(page('build-info.json'), 'utf8')); } catch { return {}; } }
const isWeb=u=>/^https?:/i.test(u);
const isLocalPage=u=>{try{const p=fileURLToPath(u),rel=path.relative(WWW,p);return rel!==''&&!rel.startsWith('..')&&!path.isAbsolute(rel)&&/\.html$/i.test(p)}catch{return false}};

function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 860, minWidth: 820, minHeight: 560,
    title: 'جسم الإنسان', icon: ICON, backgroundColor: '#FFF6E3',
    autoHideMenuBar: true, show: false,
    webPreferences: { contextIsolation: true, sandbox: true, spellcheck: false, preload: path.join(__dirname, 'preload.js') }
  });
  win.once('ready-to-show', () => { win.maximize(); win.show(); });
  // الروابط الخارجية (إن وُجدت) تُفتح في المتصفح؛ الداخلية في النافذة نفسها
  win.webContents.setWindowOpenHandler(({ url }) => {
    if(isWeb(url))shell.openExternal(url);else if(isLocalPage(url))win.loadURL(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => { if(!isLocalPage(url)){e.preventDefault();if(isWeb(url))shell.openExternal(url);} });
  win.on('page-title-updated', (e) => { e.preventDefault(); });
  win.loadFile(page('index.html'));
}

function buildMenu() {
  const go = (name) => () => win && win.loadFile(page(name));
  const template = [
    { label: 'التطبيق', submenu: [
      { label: 'الصفحة الرئيسية', accelerator: 'Alt+Home', click: go('index.html') },
      { label: 'رجوع', accelerator: 'Alt+Left', click: () => win && win.webContents.navigationHistory.canGoBack() && win.webContents.navigationHistory.goBack() },
      { label: 'تقدّم', accelerator: 'Alt+Right', click: () => win && win.webContents.navigationHistory.canGoForward() && win.webContents.navigationHistory.goForward() },
      { type: 'separator' },
      { label: 'شاشة ولي الأمر والمعلم', click: go('review.html') },
      { type: 'separator' },
      { label: 'خروج', role: 'quit' }
    ]},
    { label: 'العرض', submenu: [
      { label: 'ملء الشاشة', role: 'togglefullscreen' },
      { label: 'تكبير', role: 'zoomIn' },
      { label: 'تصغير', role: 'zoomOut' },
      { label: 'الحجم الأصلي', role: 'resetZoom' },
      { type: 'separator' },
      { label: 'إعادة تحميل الصفحة', role: 'reload' }
    ]},
    { label: 'مساعدة', submenu: [
      { label: 'عن التطبيق', click: () => { const bi = buildInfo(); dialog.showMessageBox(win, {
        type: 'info', title: 'جسم الإنسان', buttons: ['حسناً'],
        message: 'منهاج «جسم الإنسان» للأطفال 8–12' + (bi.kind === 'draft' ? ' — مسودة غير معتمدة' : ''),
        detail: `${KIND[bi.kind] || 'نوع البناء غير معروف'}\nالإصدار ${app.getVersion()} · بصمة المحتوى ${bi.content || '—'}${bi.commit ? ' · ' + bi.commit : ''}${bi.built ? ' · ' + bi.built : ''} · Electron ${process.versions.electron}\n` +
          `البصمة نفسها على غلاف كتاب المعلم: إن اختلفت فالكتاب والتطبيق من نسختين مختلفتين.\n\nيعمل بلا إنترنت. يُحفظ التقدّم على هذا الجهاز.\n` +
          `المصادر والرخص: «مساعدة» ← «المصادر والرخص».\n\nالنطق الآلي يحتاج صوتاً عربياً في ويندوز:\nالإعدادات ← الوقت واللغة ← الكلام ← إضافة أصوات ← العربية.`
      }); } },
      { label: 'المصادر والرخص', click: go('licenses.html') }
    ]}
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });

// حزمة التحديث الموقّعة (update.js، نظير UpdatePack.java): ملفاتها تُقدَّم على ملفات www المحزومة
const OVERLAY = () => path.join(app.getPath('userData'), 'update');
const SHIPPED = () => buildInfo().content || '';
let overlay = null, served = false;
// يُسجَّل اعتراض file:// فقط حين توجد حزمة مثبّتة؛ بدونها يبقى التحميل كما كان تماماً
function serveOverlay(on) {
  if (on && !served) {
    protocol.handle('file', (req) => {
      try {
        const p = fileURLToPath(req.url), rel = path.relative(WWW, p).split(path.sep).join('/');
        const f = overlay && !rel.startsWith('..') && !path.isAbsolute(rel) ? UP.file(OVERLAY(), rel) : null;
        return net.fetch(f ? pathToFileURL(f).toString() : req.url, { bypassCustomProtocolHandlers: true });
      } catch { return net.fetch(req.url, { bypassCustomProtocolHandlers: true }); }
    });
    served = true;
  } else if (!on && served) { protocol.unhandle('file'); served = false; }
}
const PUB = (() => { try { return fs.readFileSync(path.join(__dirname, 'update-key.pub.pem'), 'utf8'); } catch { return ''; } })();
const fromPage = (e) => isLocalPage(e.senderFrame ? e.senderFrame.url : '') && /review\.html$/i.test(fileURLToPath(e.senderFrame.url));

app.whenReady().then(() => {
  overlay = UP.current(OVERLAY(), SHIPPED());
  if (overlay) serveOverlay(true);
  ipcMain.handle('hb-update-info', () => ({ shipped: SHIPPED(), update: overlay }));
  ipcMain.handle('hb-update-install', (e, bytes) => {
    if (!fromPage(e)) return { ok: false, error: 'غير مسموح.' };
    try { overlay = UP.install(Buffer.from(bytes), SHIPPED(), OVERLAY(), PUB); serveOverlay(true); return { ok: true, info: overlay }; }
    catch (err) { return { ok: false, error: err instanceof UP.Bad ? err.message : 'تعذّر تثبيت الحزمة.' }; }
  });
  ipcMain.handle('hb-update-clear', (e) => { if (!fromPage(e)) return false; overlay = null; serveOverlay(false); try { fs.rmSync(OVERLAY(), { recursive: true, force: true }); } catch { /* لا شيء */ } return true; });

  // الميكروفون فقط (تسجيل الإهداء وشرح الطفل)؛ كل الصلاحيات الأخرى مرفوضة
  session.defaultSession.setPermissionRequestHandler((wc,perm,cb,details)=>cb(isLocalPage(wc.getURL())&&perm==='media'&&Array.isArray(details.mediaTypes)&&details.mediaTypes.length>0&&details.mediaTypes.every(t=>t==='audio')));
  session.defaultSession.setPermissionCheckHandler((wc,perm,origin,details)=>!!wc&&isLocalPage(wc.getURL())&&perm==='media'&&details.mediaType==='audio');
  // التصدير من شاشة ولي الأمر: نافذة حفظ تبدأ في «المستندات»
  session.defaultSession.on('will-download', (e, item) => {
    item.setSaveDialogOptions({ title: 'حفظ نسخة من النتائج', defaultPath: path.join(app.getPath('documents'), item.getFilename()) });
  });
  buildMenu();
  createWindow();
});

app.on('window-all-closed', () => app.quit());
