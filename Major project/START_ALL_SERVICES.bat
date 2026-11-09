@echo off
title AuraStore - Starting All Microservices
color 0b
echo ==========================================================
echo        AURASTORE - STARTING ALL MICROSERVICES
echo ==========================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start_services.ps1"
pause

