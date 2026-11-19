; مُثبِّت ويندوز لمنهاج «جسم الإنسان» — يُبنى بـ makensis (يعمل على لينكس)
; التثبيت للمستخدم الحالي بلا صلاحيات مدير، في %LOCALAPPDATA%\Programs\HumanBody
Unicode true
SetCompressor /SOLID lzma
SetCompressorDictSize 64
RequestExecutionLevel user

!ifndef SRC
  !error "SRC غير محدد"
!endif
!ifndef OUT
  !define OUT "HumanBody-Setup.exe"
!endif
!ifndef VERSION
  !define VERSION "1.0.0"
!endif
; مسودة غير معتمدة (BUILD_KIND=draft): TAG «-draft» في رقم الإصدار الظاهر، وLABEL في اسم المُثبِّت وقائمة البرامج.
; النص العربي يُعرَّف هنا لا في سطر الأوامر: makensis على لينكس يرفض معاملات غير لاتينية في محلية C
!ifndef TAG
  !define TAG ""
!endif
!if "${TAG}" == "-draft"
  !define LABEL " (مسودة غير معتمدة)"
!else
  !define LABEL ""
!endif
; قائمة ما يثبّته هذا المُثبِّت (يولّدها build-windows.sh): سطر لكل ملف «F مسار» ثم لكل مجلد «D مسار» من الأعمق
!ifndef LIST
  !error "LIST غير محدد (قائمة الملفات من build-windows.sh)"
!endif

!define APPNAME "جسم الإنسان"
!define EXENAME "HumanBody.exe"
!define REGKEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\HumanBodyCurriculum"

Name "${APPNAME}${LABEL}"
OutFile "${OUT}"
InstallDir "$LOCALAPPDATA\Programs\HumanBody"
InstallDirRegKey HKCU "Software\HumanBodyCurriculum" "InstallDir"
Icon "${SRC}\resources\app\app.ico"
UninstallIcon "${SRC}\resources\app\app.ico"
BrandingText "منهاج جسم الإنسان ${VERSION}${LABEL}"
ShowInstDetails nevershow
VIProductVersion "${VERSION}.0"
VIAddVersionKey "ProductName" "Human Body Curriculum"
VIAddVersionKey "FileDescription" "Human Body Curriculum Setup"
VIAddVersionKey "FileVersion" "${VERSION}"
VIAddVersionKey "ProductVersion" "${VERSION}${TAG}"
VIAddVersionKey "LegalCopyright" "Feras"

!include "MUI2.nsh"
!define MUI_ICON "${SRC}\resources\app\app.ico"
!define MUI_UNICON "${SRC}\resources\app\app.ico"
!define MUI_FINISHPAGE_RUN "$INSTDIR\${EXENAME}"
!define MUI_FINISHPAGE_RUN_TEXT "شغّل «${APPNAME}» الآن"
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "Arabic"

; ===== (المراجعة 20، ن-19) لا إجبار على إغلاق التطبيق، ولا حذف لمجلد بكامله =====

; التطبيق مفتوح؟ يُطلب من ولي الأمر إغلاقه (قد يكون الطفل في منتصف تسجيل أو رسم)، ولا يُغلق قسراً.
; في التثبيت الصامت (/S، بلا أحد أمام الشاشة) يُطلب الإغلاق العادي، ولا يُجبر إلا بعد ثلاث محاولات.
!macro CLOSE_APP UN
Function ${UN}CloseApp
  StrCpy $R1 0
  check:
    nsExec::ExecToStack 'cmd /c tasklist /FI "IMAGENAME eq ${EXENAME}" /FI "USERNAME eq %USERNAME%" /NH | find /I "${EXENAME}"'
    Pop $R0
    Pop $R2
    StrCmp $R0 "0" 0 done
    IfSilent silent
    MessageBox MB_RETRYCANCEL|MB_ICONEXCLAMATION "«${APPNAME}» مفتوح الآن.$\r$\nأغلقه أولاً بعد أن ينهي الطفل ما يفعله (ما لم يُحفظ من تسجيل أو رسم يضيع)، ثم اختر «إعادة المحاولة»." IDRETRY check
    Abort
  silent:
    IntOp $R1 $R1 + 1
    IntCmp $R1 3 force soft force
  soft:
    nsExec::Exec 'taskkill /IM ${EXENAME}'
    Sleep 2000
    Goto check
  force:
    nsExec::Exec 'taskkill /F /IM ${EXENAME}'
    Sleep 1000
  done:
FunctionEnd
!macroend
!insertmacro CLOSE_APP ""
!insertmacro CLOSE_APP "un."

; يحذف ما في قائمة النسخة المثبتة وحده: ملفاتها، ثم مجلداتها إن فرغت. ما وضعه المستخدم في المجلد يبقى.
!macro REMOVE_LISTED UN
Function ${UN}RemoveListed
  IfFileExists "$INSTDIR\HumanBody.files" 0 done
  ClearErrors
  FileOpen $0 "$INSTDIR\HumanBody.files" r
  IfErrors done
  next:
    ClearErrors
    FileRead $0 $1
    IfErrors close
  trim:
    StrCpy $2 $1 1 -1
    StrCmp $2 "$\n" cut
    StrCmp $2 "$\r" cut parse
  cut:
    StrCpy $1 $1 -1
    Goto trim
  parse:
    StrCpy $2 $1 2
    StrCpy $3 $1 "" 2
    StrCmp $3 "" next
    StrCmp $2 "F " 0 +3
      Delete "$INSTDIR\$3"
      Goto next
    StrCmp $2 "D " 0 next
      RMDir "$INSTDIR\$3"
      Goto next
  close:
    FileClose $0
    Delete "$INSTDIR\HumanBody.files"
  done:
FunctionEnd
!macroend
!insertmacro REMOVE_LISTED ""
!insertmacro REMOVE_LISTED "un."

Section "Install"
  Call CloseApp
  SetOutPath "$INSTDIR"
  ; التحديث: ملفات النسخة السابقة كما في قائمتها (فلا يبقى ما حُذف من النسخة الجديدة)؛ التقدّم في %APPDATA% لا يُمس
  IfFileExists "$INSTDIR\HumanBody.files" 0 legacy
    Call RemoveListed
    Goto copy
  legacy:
    ; نسخة حتى 1.2.0 بلا قائمة: مجلد التطبيق resources\app من صنعه وحده
    RMDir /r "$INSTDIR\resources\app"
  copy:
  File /r "${SRC}\*.*"
  File "/oname=HumanBody.files" "${LIST}"
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  CreateShortCut "$DESKTOP\${APPNAME}.lnk" "$INSTDIR\${EXENAME}" "" "$INSTDIR\resources\app\app.ico" 0
  CreateDirectory "$SMPROGRAMS\${APPNAME}"
  CreateShortCut "$SMPROGRAMS\${APPNAME}\${APPNAME}.lnk" "$INSTDIR\${EXENAME}" "" "$INSTDIR\resources\app\app.ico" 0
  CreateShortCut "$SMPROGRAMS\${APPNAME}\إزالة ${APPNAME}.lnk" "$INSTDIR\Uninstall.exe"
  WriteRegStr HKCU "Software\HumanBodyCurriculum" "InstallDir" "$INSTDIR"
  WriteRegStr HKCU "${REGKEY}" "DisplayName" "${APPNAME}${LABEL}"
  WriteRegStr HKCU "${REGKEY}" "DisplayVersion" "${VERSION}${TAG}"
  WriteRegStr HKCU "${REGKEY}" "Publisher" "Feras"
  WriteRegStr HKCU "${REGKEY}" "DisplayIcon" "$INSTDIR\resources\app\app.ico"
  WriteRegStr HKCU "${REGKEY}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "${REGKEY}" "UninstallString" '"$INSTDIR\Uninstall.exe"'
  WriteRegDWORD HKCU "${REGKEY}" "NoModify" 1
  WriteRegDWORD HKCU "${REGKEY}" "NoRepair" 1
SectionEnd

Section "Uninstall"
  Call un.CloseApp
  Delete "$DESKTOP\${APPNAME}.lnk"
  Delete "$SMPROGRAMS\${APPNAME}\${APPNAME}.lnk"
  Delete "$SMPROGRAMS\${APPNAME}\إزالة ${APPNAME}.lnk"
  RMDir "$SMPROGRAMS\${APPNAME}"
  Call un.RemoveListed
  Delete "$INSTDIR\Uninstall.exe"
  RMDir "$INSTDIR"
  DeleteRegKey HKCU "${REGKEY}"
  DeleteRegKey HKCU "Software\HumanBodyCurriculum"
  ; تقدّم الأطفال وتسجيلاتهم في %APPDATA%\HumanBodyCurriculum: يُسأل ولي الأمر، والمختار «لا» (وفي الإزالة الصامتة تبقى)
  IfFileExists "$APPDATA\HumanBodyCurriculum\*.*" 0 kept
  MessageBox MB_YESNO|MB_ICONQUESTION|MB_DEFBUTTON2 "هل تحذف أيضاً تقدّم الأطفال وتسجيلاتهم ورسومهم من هذا الجهاز؟$\r$\n$\r$\n«لا»: تبقى، وتعود كما هي إن ثبّتّ التطبيق من جديد.$\r$\n«نعم»: تُحذف نهائياً، ولا تُسترجع إلا من نسخة احتياطية." /SD IDNO IDNO kept
  RMDir /r "$APPDATA\HumanBodyCurriculum"
  kept:
SectionEnd
