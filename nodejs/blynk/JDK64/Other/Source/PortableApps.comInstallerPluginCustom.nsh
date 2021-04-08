!macro CustomCodePostInstall
	nsExec::Exec `"$INSTDIR\7zTemp\7z.exe" x -r "$INSTDIR\tools.zip" -o"$INSTDIR\" * -aoa -y`
	Delete "$INSTDIR\tools.zip"
	nsExec::ExecToLog `"$INSTDIR\Other\Source\UnpackPostInstall.bat"`
!macroend
