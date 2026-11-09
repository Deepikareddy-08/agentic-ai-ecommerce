@echo off
setlocal
cd /d "%~dp0"
echo ========================================================
echo Starting Python ML Recommendation Service (Port 8001)...
echo ========================================================

set "PYTHON_EXE="
if exist "%LOCALAPPDATA%\Python\bin\python.exe" (
    set "PYTHON_EXE=%LOCALAPPDATA%\Python\bin\python.exe"
) else if exist "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" (
    set "PYTHON_EXE=%LOCALAPPDATA%\Programs\Python\Python313\python.exe"
) else (
    set "PATH=%LOCALAPPDATA%\Python\bin;%PATH%"
    py --version >nul 2>&1
    if not errorlevel 1 (
        set "PYTHON_EXE=py"
    ) else (
        set "PYTHON_EXE=python"
    )
)

set "PATH=%LOCALAPPDATA%\Python\bin;%PATH%"
cd /d "%~dp0ml-service"
"%PYTHON_EXE%" main.py
if errorlevel 1 (
    echo.
    echo ML Service terminated with an error.
    pause
)
