@echo off
setlocal
cd /d "%~dp0"
echo ========================================================
echo Starting React Frontend (Vite Port 5173)...
echo ========================================================

if exist "%~dp0Major project\frontend" (
    cd /d "%~dp0Major project\frontend"
) else if exist "%~dp0frontend" (
    cd /d "%~dp0frontend"
)

call npm run dev
if errorlevel 1 (
    echo.
    echo React Frontend terminated with an error.
    pause
)
