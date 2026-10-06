@echo off
cd /d "%~dp0"
set "PATH=%PATH%;%ProgramFiles%\nodejs;%ProgramFiles(x86)%\nodejs;%LOCALAPPDATA%\Programs\nodejs"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js no esta instalado. Instalar desde https://nodejs.org
  pause
  exit /b 1
)
call npm install --include=dev electron@31 @electron/packager --no-fund --no-audit
call npx @electron/packager . IPHub --platform=win32 --arch=x64 --out=dist --overwrite --executable-name=IPHub --asar
if exist dist\IPHub-win32-x64\IPHub.exe (
  echo OK: dist\IPHub-win32-x64\IPHub.exe
) else (
  echo No se genero el exe.
)
pause
