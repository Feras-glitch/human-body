package com.feras.humanbody;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.print.PrintAttributes;
import android.print.PrintManager;
import android.speech.tts.TextToSpeech;
import android.speech.tts.Voice;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.ValueCallback;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * غلاف أندرويد لمنهاج «جسم الإنسان».
 * يعرض ملفات التطبيق من assets/www على عنوان https محلي (لا إنترنت)، فيعمل التخزين الدائم والميكروفون والخطوط.
 * ويضيف ما لا يدعمه WebView: النطق العربي (TextToSpeech) بصوت محلي لا يحتاج شبكة، والطباعة، وحفظ ملف التصدير
 * في مكان يختاره ولي الأمر بنافذة النظام (يبقى بعد إزالة التطبيق في كل الإصدارات).
 */
public class MainActivity extends Activity {
    static final String HOST = "appassets.androidplatform.net";
    static final String HOME = "https://" + HOST + "/www/index.html";
    static final int REQ_MIC=7;
    static final int REQ_FILE=8;
    static final int REQ_SAVE=9;
    private byte[] pendingSave;
    private ValueCallback<Uri[]> pendingFiles;

    private WebView web;
    private TextToSpeech tts;
    private volatile boolean ttsReady = false;
    private volatile boolean ttsArabic = false;
    private PermissionRequest pendingPermission;
    private int utteranceId = 0;

    private static final Map<String, String> MIME = new HashMap<String, String>();
    static {
        MIME.put("html", "text/html"); MIME.put("js", "application/javascript"); MIME.put("css", "text/css");
        MIME.put("json", "application/json"); MIME.put("webp", "image/webp"); MIME.put("png", "image/png");
        MIME.put("jpg", "image/jpeg"); MIME.put("jpeg", "image/jpeg"); MIME.put("svg", "image/svg+xml");
        MIME.put("gif", "image/gif"); MIME.put("ttf", "font/ttf"); MIME.put("otf", "font/otf");
        MIME.put("woff", "font/woff"); MIME.put("woff2", "font/woff2"); MIME.put("mp3", "audio/mpeg");
        MIME.put("m4a", "audio/mp4"); MIME.put("ogg", "audio/ogg"); MIME.put("txt", "text/plain");
    }

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
        web.setBackgroundColor(0xFFFFF6E3);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        // حجم خط النظام يُحترم (المراجعة 20، ن-14) في حدود يبقى فيها التصميم سليماً
        s.setTextZoom(Math.max(85, Math.min(150, Math.round(getResources().getConfiguration().fontScale * 100))));
        s.setSupportZoom(true);
        s.setBuiltInZoomControls(true);
        s.setDisplayZoomControls(false);
        overlayDir = new File(getFilesDir(), "update");
        shipped = shippedContent();
        overlay = UpdatePack.current(overlayDir, shipped);
        web.addJavascriptInterface(new Bridge(), "AndroidApp");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if (!HOST.equals(u.getHost())) return null;
                String path = u.getPath();
                if (path == null || path.equals("/")) path = "/www/index.html";
                if (path.endsWith("/")) path = path + "index.html";
                String asset = path.substring(1);
                String ext = asset.contains(".") ? asset.substring(asset.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT) : "";
                String mime = MIME.containsKey(ext) ? MIME.get(ext) : "application/octet-stream";
                Map<String, String> headers = new HashMap<String, String>();
                headers.put("Access-Control-Allow-Origin", "*");
                headers.put("Cache-Control", "no-cache");
                try {
                    File ov = overlay != null ? UpdatePack.file(overlayDir, asset) : null;
                    InputStream in = ov != null ? new FileInputStream(ov) : getAssets().open(asset);
                    String enc = mime.startsWith("text/") || mime.endsWith("javascript") || mime.endsWith("json") ? "utf-8" : null;
                    return new WebResourceResponse(mime, enc, 200, "OK", headers, in);
                } catch (IOException e) {
                    return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", headers, new ByteArrayInputStream(new byte[0]));
                }
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                String scheme = u.getScheme();
                if (HOST.equals(u.getHost()) || "data".equals(scheme) || "blob".equals(scheme) || "about".equals(scheme)) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) { }
                return true;
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (view.getUrl()==null || !HOST.equals(Uri.parse(view.getUrl()).getHost())) { callback.onReceiveValue(null); return true; }
                if(pendingFiles!=null)pendingFiles.onReceiveValue(null);pendingFiles=callback;
                Intent intent=new Intent(Intent.ACTION_OPEN_DOCUMENT);intent.addCategory(Intent.CATEGORY_OPENABLE);intent.setType("*/*");intent.putExtra(Intent.EXTRA_MIME_TYPES,new String[]{"application/json","image/png","image/jpeg","image/webp","audio/mpeg","audio/mp4","audio/aac","audio/ogg","audio/wav","audio/x-wav","audio/webm","application/zip","application/x-zip-compressed","application/octet-stream"});intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                try{startActivityForResult(intent,REQ_FILE);}catch(Exception e){pendingFiles.onReceiveValue(null);pendingFiles=null;toast("تعذر فتح منتقي الملفات");}return true;
            }

            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(new Runnable() { public void run() {
                    if(!HOST.equals(request.getOrigin().getHost())||!"https".equals(request.getOrigin().getScheme())){request.deny();return;}
                    boolean wantsMic=false;
                    for (String r : request.getResources()) if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(r)) wantsMic = true;
                    if (!wantsMic) { request.deny(); return; }
                    if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                        request.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
                    } else {
                        pendingPermission = request;
                        requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQ_MIC);
                    }
                }});
            }
        });

        tts = new TextToSpeech(this, new TextToSpeech.OnInitListener() {
            public void onInit(int status) {
                if (status != TextToSpeech.SUCCESS) return;
                int r = tts.setLanguage(new Locale("ar"));
                // صوت عربي على الجهاز نفسه فقط: الصوت الشبكي يرسل النص (ومعه اسم الطفل) خارج الجهاز (المراجعة 20، إ-3)
                ttsArabic = r != TextToSpeech.LANG_MISSING_DATA && r != TextToSpeech.LANG_NOT_SUPPORTED && localVoice(new Locale("ar")) != null;
                ttsReady = true;
            }
        });

        if (state != null) web.restoreState(state);
        else web.loadUrl(HOME);
    }

    @Override protected void onActivityResult(int code,int result,Intent data){super.onActivityResult(code,result,data);if(code==REQ_FILE&&pendingFiles!=null){pendingFiles.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result,data));pendingFiles=null;}
        if (code == REQ_SAVE) {
            byte[] bytes = pendingSave; pendingSave = null;
            boolean ok = false;
            if (result == RESULT_OK && bytes != null && data != null && data.getData() != null) {
                OutputStream os = null;
                try { os = getContentResolver().openOutputStream(data.getData()); if (os != null) { os.write(bytes); ok = true; } }
                catch (Exception e) { ok = false; }
                finally { if (os != null) try { os.close(); } catch (IOException ignored) { ok = false; } }
            }
            toast(ok ? "حُفظ الملف" : "لم يُحفظ الملف");
            savedResult(ok);
        }
    }

    /** يخبر الصفحة بنتيجة الحفظ بعد أن يختار ولي الأمر المكان (شاشة ولي الأمر تعرضها). */
    private void savedResult(final boolean ok) {
        runOnUiThread(new Runnable() { public void run() {
            if (web != null) web.evaluateJavascript("window.dispatchEvent(new CustomEvent('hb-saved',{detail:{ok:" + ok + "}}))", null);
        }});
    }

    /** أفضل صوت مثبّت على الجهاز للغة، لا يحتاج شبكة؛ أو null. */
    private Voice localVoice(Locale loc) {
        try {
            Voice best = null;
            java.util.Set<Voice> all = tts == null ? null : tts.getVoices();
            if (all == null) return null;
            for (Voice v : all) {
                if (v == null || v.isNetworkConnectionRequired() || v.getLocale() == null) continue;
                if (!loc.getLanguage().equals(v.getLocale().getLanguage())) continue;
                java.util.Set<String> f = v.getFeatures();
                if (f != null && f.contains(TextToSpeech.Engine.KEY_FEATURE_NOT_INSTALLED)) continue;
                if (best == null || v.getQuality() > best.getQuality()) best = v;
            }
            return best;
        } catch (Exception e) {
            return null;
        }
    }
    @Override
    public void onRequestPermissionsResult(int code, String[] perms, int[] results) {
        if (code == REQ_MIC && pendingPermission != null) {
            if (results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED)
                pendingPermission.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
            else {
                pendingPermission.deny();
                Toast.makeText(this, "التسجيل يحتاج إذن الميكروفون من إعدادات التطبيق", Toast.LENGTH_LONG).show();
            }
            pendingPermission = null;
        }
    }

    @Override
    public void onBackPressed() {
        if (web != null && web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    @Override protected void onSaveInstanceState(Bundle out) { super.onSaveInstanceState(out); if (web != null) web.saveState(out); }
    @Override protected void onPause() { super.onPause(); if (web != null) web.onPause(); if (tts != null) tts.stop(); }
    @Override protected void onResume() { super.onResume(); if (web != null) web.onResume(); }
    @Override protected void onDestroy() {
        if(pendingFiles!=null){pendingFiles.onReceiveValue(null);pendingFiles=null;}
        if(tts!=null)tts.shutdown();
        if (web != null) { web.destroy(); web = null; }
        super.onDestroy();
    }

    private void toast(final String msg) {
        runOnUiThread(new Runnable() { public void run() { Toast.makeText(MainActivity.this, msg, Toast.LENGTH_LONG).show(); } });
    }

    /** واجهة JavaScript: window.AndroidApp */
    /* حزمة التحديث الموقّعة (UpdatePack): ملفات تحلّ محل المحزومة */
    File overlayDir; String shipped = ""; volatile UpdatePack.Info overlay;
    String shippedContent() {
        try { InputStream in = getAssets().open("www/build-info.json"); java.io.ByteArrayOutputStream o = new java.io.ByteArrayOutputStream(); byte[] b = new byte[4096]; int n; while ((n = in.read(b)) > 0) o.write(b, 0, n); in.close();
            return new org.json.JSONObject(new String(o.toByteArray(), "UTF-8")).optString("content", ""); } catch (Exception e) { return ""; }
    }

    final class Bridge {
        @JavascriptInterface public String installUpdate(String base64) {
            try {
                UpdatePack.Info i = UpdatePack.install(Base64.decode(base64, Base64.DEFAULT), shipped, overlayDir, UpdatePack.PUB);
                overlay = i; return "{\"ok\":true,\"info\":" + i.json() + "}";
            } catch (UpdatePack.Bad b) { return "{\"ok\":false,\"error\":\"" + UpdatePack.esc(b.getMessage()) + "\"}"; }
            catch (Throwable t) { return "{\"ok\":false,\"error\":\"تعذّر تثبيت الحزمة.\"}"; }
        }
        @JavascriptInterface public String updateInfo() { UpdatePack.Info i = overlay; return "{\"shipped\":\"" + UpdatePack.esc(shipped) + "\",\"update\":" + (i == null ? "null" : i.json()) + "}"; }
        @JavascriptInterface public void clearUpdate() { overlay = null; UpdatePack.deleteTree(overlayDir); }

        @JavascriptInterface public boolean ttsReady() { return ttsReady; }
        @JavascriptInterface public boolean ttsArabic() { return ttsArabic; }

        @JavascriptInterface public void speak(String text, String lang, float rate) {
            if (!ttsReady || text == null) return;
            String l = (lang == null || lang.length() == 0) ? "ar" : lang;
            Locale loc = Locale.forLanguageTag(l);
            Voice v = localVoice(loc);
            if (v == null) return; // لا صوت محلياً لهذه اللغة: لا نطق، بدل إرسال النص إلى صوت شبكي
            tts.setVoice(v);
            tts.setSpeechRate(rate > 0 ? rate : 1f);
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "u" + (++utteranceId));
        }

        @JavascriptInterface public void stop() { if (tts != null) tts.stop(); }
        @JavascriptInterface public boolean isSpeaking() { return tts != null && tts.isSpeaking(); }

        @JavascriptInterface public void print() {
            runOnUiThread(new Runnable() { public void run() {
                PrintManager pm = (PrintManager) getSystemService(PRINT_SERVICE);
                if (pm != null && web != null)
                    pm.print("جسم الإنسان", web.createPrintDocumentAdapter("human-body"), new PrintAttributes.Builder().build());
            }});
        }

        @JavascriptInterface public void saveFile(String name, String mime, String base64) {
            final byte[] data;
            try { data = Base64.decode(base64, Base64.DEFAULT); }
            catch (Exception e) { toast("تعذّر حفظ الملف"); savedResult(false); return; }
            final String safe = name == null ? "file" : name.replaceAll("[\\\\/:*?\"<>|]", "_");
            final String type = (mime == null || mime.length() == 0) ? "application/octet-stream" : mime;
            // نافذة النظام لاختيار المكان (كل الإصدارات): الملف يبقى بعد إزالة التطبيق، بخلاف مجلد التطبيق الخاص
            // الذي كان يُستعمل في أندرويد 7–9 ويُمحى معه (المراجعة 20، ن-2)
            runOnUiThread(new Runnable() { public void run() {
                pendingSave = data;
                Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType(type);
                i.putExtra(Intent.EXTRA_TITLE, safe);
                try { startActivityForResult(i, REQ_SAVE); }
                catch (Exception e) { pendingSave = null; toast("تعذّر فتح نافذة الحفظ"); savedResult(false); }
            }});
        }
    }
}
