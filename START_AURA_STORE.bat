@echo off
title AuraStore - Master Microservice Supervisor
color 0b

:: Check for Administrator privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    if "%1" neq "-standard" (
        echo [INFO] Requesting Administrator privileges to manage PostgreSQL service...
        powershell -Command "try { Start-Process cmd -ArgumentList '/c \"\"%~f0\"\" -elevated' -Verb RunAs } catch { exit 1 }"
        if %errorlevel% equ 0 exit /b
        echo [NOTICE] Proceeding in Standard User Mode...
    }
)

echo ==========================================================
echo        AURASTORE - STARTING ALL MICROSERVICES
echo ==========================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Major project\start_services.ps1"

