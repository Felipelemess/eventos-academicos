@echo off
cd /d "%~dp0"
echo Instalando dependencias (so demora na primeira vez)...
call npm install
if not exist .env (
  call npm run configurar
)
echo.
echo Iniciando o sistema. O navegador abre em alguns segundos.
echo Para desligar, feche esta janela.
start "" /min cmd /c "timeout /t 6 >nul & start http://localhost:3000"
call npm start
pause
