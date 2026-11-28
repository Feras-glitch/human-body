#!/usr/bin/env node
// يجمع تطبيق «妈妈指南» المستقل في dist/mom-www: صفحات mom/ وخطوطها (الصينية والعربية) وحدها، بلا شيء من تطبيق الأطفال.
import { cpSync, mkdirSync, rmSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
const OUT = process.argv[2] || 'dist/mom-www', F = 'app/v2/fonts';
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT + '/fonts', { recursive: true });
for (const f of readdirSync('mom')) cpSync('mom/' + f, OUT + '/' + f);
for (const f of readdirSync(F)) if (/^(noto-sans-sc|IBMPlexSansArabic-|OFL-(NotoSansSC|IBMPlexSansArabic))/.test(f)) cpSync(`${F}/${f}`, `${OUT}/fonts/${f}`);
// app-fonts.css: الصينية + IBM Plex العربية فقط
const css = readFileSync(`${F}/app-fonts.css`, 'utf8').split(/(?=@font-face)/).filter(b => !/@font-face/.test(b) || /IBM Plex Sans Arabic/.test(b)).join('');
writeFileSync(`${OUT}/fonts/app-fonts.css`, css);
console.log(OUT, readdirSync(OUT).length, 'ملفات');
