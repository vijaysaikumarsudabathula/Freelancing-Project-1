@echo off
REM ====================================================================
REM Deepthi Enterprises - Application Startup Script
REM This script starts both backend and frontend servers
REM ====================================================================

echo.
echo ========================================
echo   Deepthi Enterprises Startup
echo ========================================
echo.

REM Get the script directory
set SCRIPT_DIR=%~dp0

REM Kill any existing Node processes (optional - uncomment if needed)
REM taskkill /F /IM node.exe 2>nul

REM Start Backend Server
echo [1/2] Starting Backend Server...
echo.
start "Deepthi Backend - Port 5001" cmd /k "cd /d "%SCRIPT_DIR%backend" && node recovery.js"
timeout /t 4 /nobreak

REM Start Frontend Server
echo [2/2] Starting Frontend Server...
echo.
start "Deepthi Frontend - Port 3000" cmd /k "cd /d "%SCRIPT_DIR%frontend" && npm run dev"

echo.
echo ========================================
echo   ✅ Application Starting!
echo ========================================
echo.
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:5001
echo.
echo Both servers are starting in separate windows.
echo Please wait 10-15 seconds for them to fully initialize.
echo.
timeout /t 3
