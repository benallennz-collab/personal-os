@echo off
cd /d "C:\Users\benal\OneDrive\Desktop\Claude OS"
title Personal OS - dev server

echo Making sure no old Personal OS server is still running on port 5173...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"

echo Starting Personal OS...
start "" cmd /c "timeout /t 3 >nul && start http://localhost:5173"
npm run dev
