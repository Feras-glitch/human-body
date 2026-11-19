package com.feras.humanbody;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.security.KeyFactory;
import java.security.MessageDigest;
import java.security.Signature;
import java.security.spec.X509EncodedKeySpec;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * «حزمة التحديث» الموقّعة (استوديو جسم الإنسان، المرحلة 3): ملفات من التطبيق (www/) تحلّ محل المحزومة، بلا إنترنت.
 * يستوردها ولي الأمر من شاشته. لا تُقبل إلا إذا:
 *   - وُقّع manifest.txt بمفتاح المطوّر (ECDSA P-256؛ المفتاح العام هنا، والخاص خارج المستودع)،
 *   - وكانت مبنية على المحتوى المحزوم في هذه النسخة نفسها (base = بصمة المحتوى في build-info.json)،
 *   - ووافق كل ملف بصمته وحجمه، ومساره داخل www/ وامتداده من المسموح.
 * الحزمة تراكمية: الجديدة تحلّ محل السابقة كلها. وإذا ثُبّتت نسخة أحدث من التطبيق تُترك الحزمة القديمة تلقائياً.
 * Java خالصة (بلا أندرويد) ليُختبر على الحاسوب: tests/update-pack.cjs.
 */
final class UpdatePack {
    /** المفتاح العام للمطوّر: packaging/update-key.pub.pem (يطابقه اختبار) */
    static final String PUB = "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEYUseN498UB1huOa2DMQsza7RMUL7N2mf35P6swOYVyV5HYWgyu3XIKTGyNjxGWe3X0X6RLHLf1410DzJvFs55Q==";
    static final Set<String> EXT = new HashSet<String>(Arrays.asList("html", "js", "css", "json", "webp", "png", "jpg", "svg", "mp3", "ogg", "webm", "m4a", "ttf", "woff2", "txt"));
    static final long MAX_TOTAL = 300L << 20;
    static final int MAX_FILES = 6000;

    static final class Info {
        String base = "", content = "", app = "", created = "";
        int files;
        String json() { return "{\"base\":\"" + esc(base) + "\",\"content\":\"" + esc(content) + "\",\"app\":\"" + esc(app) + "\",\"created\":\"" + esc(created) + "\",\"files\":" + files + "}"; }
    }

    static final class Bad extends Exception { Bad(String m) { super(m); } }

    static Info install(byte[] zip, String shipped, File overlay, String pubB64) throws Exception {
        Map<String, byte[]> z = new HashMap<String, byte[]>();
        long total = 0;
        ZipInputStream in = new ZipInputStream(new ByteArrayInputStream(zip));
        try {
            ZipEntry e; byte[] buf = new byte[65536];
            while ((e = in.getNextEntry()) != null) {
                if (e.isDirectory()) continue;
                if (z.size() >= MAX_FILES) throw new Bad("الحزمة فيها ملفات أكثر من المسموح.");
                ByteArrayOutputStream o = new ByteArrayOutputStream(); int n;
                while ((n = in.read(buf)) > 0) { o.write(buf, 0, n); total += n; if (total > MAX_TOTAL) throw new Bad("الحزمة أكبر من المسموح."); }
                z.put(e.getName(), o.toByteArray());
            }
        } catch (Bad b) { throw b; } catch (Exception x) { throw new Bad("الملف ليس حزمة تحديث (ليس zip سليماً)."); }
        finally { in.close(); }
        byte[] man = z.get("manifest.txt"), sig = z.get("manifest.sig");
        if (man == null || sig == null) throw new Bad("الملف ليس حزمة تحديث موقّعة.");
        boolean ok;
        try {
            Signature s = Signature.getInstance("SHA256withECDSA");
            s.initVerify(KeyFactory.getInstance("EC").generatePublic(new X509EncodedKeySpec(b64(pubB64))));
            s.update(man);
            ok = s.verify(b64(new String(sig, "UTF-8").trim()));
        } catch (Exception x) { ok = false; }
        if (!ok) throw new Bad("التوقيع غير صحيح: الحزمة ليست من المطوّر، أو عُدّل فيها شيء.");
        Info info = new Info();
        List<String[]> files = new ArrayList<String[]>();
        String[] lines = new String(man, "UTF-8").split("\n");
        if (lines.length == 0 || !lines[0].trim().equals("humanbody-update-pack 1")) throw new Bad("نوع الحزمة غير معروف.");
        for (int i = 1; i < lines.length; i++) {
            String l = lines[i].trim(); if (l.isEmpty()) continue;
            String[] p = l.split(" ", 4);
            if (p[0].equals("base") && p.length > 1) info.base = p[1];
            else if (p[0].equals("content") && p.length > 1) info.content = p[1];
            else if (p[0].equals("app") && p.length > 1) info.app = p[1];
            else if (p[0].equals("created") && p.length > 1) info.created = p[1];
            else if (p[0].equals("file") && p.length == 4) files.add(new String[] { p[1], p[2], p[3] });
        }
        if (!info.base.equals(shipped)) throw new Bad("الحزمة مبنية على نسخة أخرى من التطبيق (" + info.base + ")، وهذه النسخة " + shipped + ". اطلب حزمة لهذه النسخة.");
        File tmp = new File(overlay.getParentFile(), overlay.getName() + ".tmp");
        deleteTree(tmp);
        for (String[] f : files) {
            String path = f[2];
            if (!safePath(path)) throw new Bad("مسار غير مسموح في الحزمة: " + path);
            byte[] data = z.get("www/" + path);
            if (data == null || data.length != Long.parseLong(f[1]) || !hex(MessageDigest.getInstance("SHA-256").digest(data)).equals(f[0])) { deleteTree(tmp); throw new Bad("ملف في الحزمة لا يطابق بصمته: " + path); }
            File out = new File(tmp, "www/" + path);
            out.getParentFile().mkdirs();
            OutputStream os = new FileOutputStream(out); try { os.write(data); } finally { os.close(); }
        }
        info.files = files.size();
        OutputStream os = new FileOutputStream(new File(tmp, "meta.txt"));
        try { os.write(("base " + info.base + "\ncontent " + info.content + "\napp " + info.app + "\ncreated " + info.created + "\nfiles " + info.files + "\n").getBytes("UTF-8")); } finally { os.close(); }
        deleteTree(overlay);
        if (!tmp.renameTo(overlay)) { deleteTree(tmp); throw new Bad("تعذّر تثبيت الحزمة (مساحة الجهاز؟)."); }
        return info;
    }

    /** الحزمة المثبّتة إن كانت لهذه النسخة؛ وإلا تُحذف (ثُبّتت نسخة أحدث من التطبيق) */
    static Info current(File overlay, String shipped) {
        File meta = new File(overlay, "meta.txt");
        if (!meta.isFile()) return null;
        Info info = new Info();
        try {
            InputStream in = new FileInputStream(meta); ByteArrayOutputStream o = new ByteArrayOutputStream(); byte[] b = new byte[4096]; int n;
            try { while ((n = in.read(b)) > 0) o.write(b, 0, n); } finally { in.close(); }
            for (String l : new String(o.toByteArray(), "UTF-8").split("\n")) {
                String[] p = l.trim().split(" ", 2); if (p.length < 2) continue;
                if (p[0].equals("base")) info.base = p[1]; else if (p[0].equals("content")) info.content = p[1];
                else if (p[0].equals("app")) info.app = p[1]; else if (p[0].equals("created")) info.created = p[1];
                else if (p[0].equals("files")) info.files = Integer.parseInt(p[1]);
            }
        } catch (Exception x) { deleteTree(overlay); return null; }
        if (!info.base.equals(shipped)) { deleteTree(overlay); return null; }
        return info;
    }

    /** ملف الحزمة لهذا المسار (مثل www/U01.L01.html) إن وُجد */
    static File file(File overlay, String assetPath) {
        if (!assetPath.startsWith("www/") || !safePath(assetPath.substring(4))) return null;
        File f = new File(overlay, assetPath);
        return f.isFile() ? f : null;
    }

    static boolean safePath(String p) {
        if (p.isEmpty() || p.startsWith("/") || p.contains("..") || p.contains("\\") || !p.matches("[A-Za-z0-9._/\\-]+")) return false;
        int dot = p.lastIndexOf('.');
        return dot > 0 && EXT.contains(p.substring(dot + 1).toLowerCase());
    }

    static void deleteTree(File f) {
        if (f == null || !f.exists()) return;
        File[] kids = f.listFiles();
        if (kids != null) for (File k : kids) deleteTree(k);
        f.delete();
    }

    /** base64 بلا java.util.Base64 (غير موجودة قبل أندرويد 8، والتطبيق من أندرويد 7) */
    static byte[] b64(String s) {
        String A = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        ByteArrayOutputStream o = new ByteArrayOutputStream(); int buf = 0, bits = 0;
        for (int i = 0; i < s.length(); i++) {
            int v = A.indexOf(s.charAt(i)); if (v < 0) continue;
            buf = (buf << 6) | v; bits += 6;
            if (bits >= 8) { bits -= 8; o.write((buf >> bits) & 0xff); }
        }
        return o.toByteArray();
    }
    static String hex(byte[] b) { StringBuilder s = new StringBuilder(); for (byte x : b) s.append(String.format("%02x", x)); return s.toString(); }
    static String esc(String s) { return s.replace("\\", "\\\\").replace("\"", "\\\""); }
}
