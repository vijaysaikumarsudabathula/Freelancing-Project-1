# ====================================================================
# Deepthi Enterprises - PowerShell Application Startup
# This script starts both backend and frontend servers
# ====================================================================

Write-Host "`n" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deepthi Enterprises Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`n"

# Get the script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Optional: Kill existing Node processes
Write-Host "Checking for running Node processes..." -ForegroundColor Yellow
$runningNodes = Get-Process node -ErrorAction SilentlyContinue
if ($runningNodes) {
    Write-Host "Found $($runningNodes.Count) running Node process(es). Stopping them..." -ForegroundColor Yellow
    $runningNodes | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "Node processes stopped." -ForegroundColor Green
}

Write-Host "`n"

# Start Backend Server
Write-Host "[1/2] Starting Backend Server..." -ForegroundColor Cyan
Write-Host "      Command: node recovery.js" -ForegroundColor Gray
Write-Host "      Port: 5001" -ForegroundColor Gray
Write-Host "      Auto-recovery enabled" -ForegroundColor Gray

$backendPath = Join-Path $ScriptDir "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; node recovery.js" -WindowStyle Normal

Start-Sleep -Seconds 5

# Start Frontend Server
Write-Host "`n[2/2] Starting Frontend Server..." -ForegroundColor Cyan
Write-Host "      Command: npm run dev" -ForegroundColor Gray
Write-Host "      Port: 3000" -ForegroundColor Gray
Write-Host "      Proxy: /api -> http://localhost:5001" -ForegroundColor Gray

$frontendPath = Join-Path $ScriptDir "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendPath'; npm run dev" -WindowStyle Normal

Write-Host "`n"
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ Application Starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "`n"

Write-Host "Frontend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend:   http://localhost:5001" -ForegroundColor Cyan
Write-Host "`n"

Write-Host "Both servers are starting in separate windows." -ForegroundColor Yellow
Write-Host "Please wait 10-15 seconds for them to fully initialize." -ForegroundColor Yellow
Write-Host "`n"

Start-Sleep -Seconds 3

# Optional: Open browser
$openBrowser = Read-Host "Open browser at http://localhost:3000? (y/n)"
if ($openBrowser -eq 'y') {
    Start-Process "http://localhost:3000"
}

Write-Host "`nClose this window when done. The servers will continue running." -ForegroundColor Green
Read-Host "Press Enter to exit"
