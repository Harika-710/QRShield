@echo off
title Starting QRShield...
echo ===================================================
echo           Starting QRShield Application
echo ===================================================
echo 1. Launching Backend on http://localhost:5000 ...
start "QRShield Backend" cmd /k "cd /d %~dp0backend && node server.js"

echo 2. Launching Frontend on http://localhost:5173 ...
start "QRShield Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ===================================================
echo  Both servers are running!
echo  Open your browser and visit:
echo  --^> http://localhost:5173
echo ===================================================
echo.
timeout /t 3 >nul
start http://localhost:5173

