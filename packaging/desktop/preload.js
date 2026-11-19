// جسر صغير لشاشة ولي الأمر في نسخة ويندوز: حزمة التحديث الموقّعة وحدها (لا شيء آخر من Node يصل إلى الصفحة).
'use strict';
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('HBDesktop', {
  installUpdate: (bytes) => ipcRenderer.invoke('hb-update-install', bytes),
  updateInfo: () => ipcRenderer.invoke('hb-update-info'),
  clearUpdate: () => ipcRenderer.invoke('hb-update-clear'),
});
