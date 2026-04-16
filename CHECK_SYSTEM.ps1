# ====================================================================
# Deepthi Enterprises - System Diagnostics
# Checks if everything is set up correctly
# ====================================================================

Write-Host "`n" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Deepthi Enterprises - System Check" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "`n"

# Helper function to print status
function Print-Status {
    param(
        [string]$Test,
        [bool]$Status,
        [string]$Details = ""
    )
    $Icon = if ($Status) { "✅" } else { "❌" }
    Write-Host "$Icon $Test" -ForegroundColor $(if ($Status) { "Green" } else { "Red" })
    if ($Details) {
        Write-Host "   $Details" -ForegroundColor Gray
    }
}

# 1. Check if Node.js is installed
Write-Host "1. Checking Node.js Installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Print-Status "Node.js installed" $? "Version: $nodeVersion"
} catch {
    Print-Status "Node.js installed" $false "Node.js not found in PATH"
}

# 2. Check npm
Write-Host "`n2. Checking NPM Installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>&1
    Print-Status "NPM installed" $? "Version: $npmVersion"
} catch {
    Print-Status "NPM installed" $false "NPM not found in PATH"
}

# 3. Check if ports are available
Write-Host "`n3. Checking Port Availability..." -ForegroundColor Yellow

$port5001 = (netstat -ano 2>$null | findstr ":5001").Length -eq 0
Print-Status "Port 5001 available" $port5001 $(if (!$port5001) {"A process is already using port 5001"} else {"Free"})

$port3000 = (netstat -ano 2>$null | findstr ":3000").Length -eq 0
Print-Status "Port 3000 available" $port3000 $(if (!$port3000) {"A process is already using port 3000"} else {"Free"})

# 4. Check backend directory
Write-Host "`n4. Checking Backend Setup..." -ForegroundColor Yellow

$backendPath = "backend"
$packageJsonExists = Test-Path "$backendPath/package.json"
Print-Status "Backend package.json exists" $packageJsonExists

$nodeModulesExists = Test-Path "$backendPath/node_modules"
Print-Status "Backend node_modules installed" $nodeModulesExists $(if (!$nodeModulesExists) {"Run: cd backend && npm install"} else {""})

$serverJsExists = Test-Path "$backendPath/server.js"
Print-Status "Backend server.js exists" $serverJsExists

$recoveryJsExists = Test-Path "$backendPath/recovery.js"
Print-Status "Backend recovery.js exists" $recoveryJsExists $(if ($recoveryJsExists) {"Auto-recovery enabled"} else {""})

# 5. Check frontend directory
Write-Host "`n5. Checking Frontend Setup..." -ForegroundColor Yellow

$frontendPath = "frontend"
$frontendPackageExists = Test-Path "$frontendPath/package.json"
Print-Status "Frontend package.json exists" $frontendPackageExists

$frontendNodeModules = Test-Path "$frontendPath/node_modules"
Print-Status "Frontend node_modules installed" $frontendNodeModules $(if (!$frontendNodeModules) {"Run: cd frontend && npm install"} else {""})

$viteConfig = Test-Path "$frontendPath/vite.config.ts"
Print-Status "Frontend vite.config.ts exists" $viteConfig

# Check for proxy configuration
if ($viteConfig) {
    $configContent = Get-Content "$frontendPath/vite.config.ts" -Raw
    $hasProxy = $configContent -match "proxy"
    Print-Status "Vite proxy configured" $hasProxy $(if ($hasProxy) {"API requests will proxy to backend"} else {"Warning: No proxy configured"})
}

# 6. Test Backend Connectivity
Write-Host "`n6. Testing Backend Connectivity..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5001/api/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Print-Status "Backend is running" $true "Status: OK, Port: 5001"
        $data = $response.Content | ConvertFrom-Json
        Write-Host "   Uptime: $($data.uptime)s" -ForegroundColor Gray
    } else {
        Print-Status "Backend is running" $false
    }
} catch {
    Print-Status "Backend is running" $false "Backend not responding on port 5001"
}

# 7. Test Frontend + Proxy
Write-Host "`n7. Testing Frontend Connectivity..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Print-Status "Frontend proxy working" $true "Frontend is on 3000, proxy working"
    } else {
        Print-Status "Frontend proxy working" $false
    }
} catch {
    Print-Status "Frontend running" $false "Frontend not responding on port 3000"
    Print-Status "Frontend proxy working" $false "Cannot test proxy - frontend not running"
}

# Summary
Write-Host "`n`n=====================================" -ForegroundColor Cyan
Write-Host "  System Check Complete" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

Write-Host "`nIf everything is green, your system is ready!`n" -ForegroundColor Green
Write-Host "To start the application, run:" -ForegroundColor Yellow
Write-Host "  1. Open Terminal 1: cd backend && node recovery.js" -ForegroundColor Cyan
Write-Host "  2. Open Terminal 2: cd frontend && npm run dev" -ForegroundColor Cyan
Write-Host "  3. Visit: http://localhost:3000" -ForegroundColor Cyan
Write-Host "`n"
