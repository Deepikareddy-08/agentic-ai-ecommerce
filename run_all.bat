@echo off
title AuraStore - Starting All Microservices
color 0b

:: Auto-elevate to Administrator to control PostgreSQL service and ports cleanly
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Requesting Administrator privileges to manage PostgreSQL service...
    powershell -Command "Start-Process cmd -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs"
    exit /b
)

echo ==========================================================
echo        AURASTORE - STARTING ALL MICROSERVICES
echo ==========================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Major project\start_services.ps1"
