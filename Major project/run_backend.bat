@echo off
setlocal
cd /d "%~dp0"
echo ========================================================
echo Starting Spring Boot Backend (Port 8080)...
echo ========================================================

if exist "%~dp0Major project\backend\backend" (
    cd /d "%~dp0Major project\backend\backend"
) else if exist "%~dp0backend\backend" (
    cd /d "%~dp0backend\backend"
)

if exist "target\backend-0.0.1-SNAPSHOT.jar" (
    echo Launching optimized backend JAR...
    java -jar "target\backend-0.0.1-SNAPSHOT.jar"
    goto done
)

if exist "%~dp0tools\apache-maven-3.9.9\bin\mvn.cmd" (
    call "%~dp0tools\apache-maven-3.9.9\bin\mvn.cmd" spring-boot:run
) else (
    call mvn spring-boot:run
)

:done
if errorlevel 1 (
    echo.
    echo Spring Boot Backend terminated with an error.
    pause
)
