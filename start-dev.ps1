# FleetOS - Start All Services
# Run from the Fleet_OS root directory (right-click -> Run with PowerShell)

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  FleetOS - Starting Development Services  " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# -- 1. Start MongoDB service --------------------------------------------------
Write-Host "[1/3] Checking MongoDB service..." -ForegroundColor Yellow

$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($null -eq $mongoService) {
    Write-Host "  X MongoDB service not found." -ForegroundColor Red
    Write-Host "    Install it with: winget install MongoDB.Server" -ForegroundColor Gray
    Write-Host "    Then re-run this script." -ForegroundColor Gray
    Read-Host "Press Enter to exit"
    exit 1
}

if ($mongoService.Status -ne "Running") {
    Write-Host "  Starting MongoDB service..." -ForegroundColor Yellow
    try {
        Start-Service -Name "MongoDB" -ErrorAction Stop
        Start-Sleep -Seconds 2
        Write-Host "  V MongoDB started" -ForegroundColor Green
    } catch {
        Write-Host "  X Failed to start MongoDB: $_" -ForegroundColor Red
        Write-Host "    Try: net start MongoDB  (as Administrator)" -ForegroundColor Gray
        Read-Host "Press Enter to exit"
        exit 1
    }
} else {
    Write-Host "  V MongoDB already running" -ForegroundColor Green
}

# -- 2. Start Backend ----------------------------------------------------------
Write-Host ""
Write-Host "[2/3] Starting Backend (port 5000)..." -ForegroundColor Yellow
$backend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\backend'; npm run dev" -PassThru
Write-Host "  V Backend launched (PID: $($backend.Id))" -ForegroundColor Green

Start-Sleep -Seconds 3

# -- 3. Start Frontend ---------------------------------------------------------
Write-Host ""
Write-Host "[3/3] Starting Frontend (port 5173)..." -ForegroundColor Yellow
$frontend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\frontend'; npm run dev" -PassThru
Write-Host "  V Frontend launched (PID: $($frontend.Id))" -ForegroundColor Green

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend : http://localhost:5173" -ForegroundColor White
Write-Host "  Backend  : http://localhost:5000/health" -ForegroundColor White
Write-Host "  API      : http://localhost:5000/api/v1" -ForegroundColor White
Write-Host ""
Write-Host "  Login    : admin@fleetos.dev / Admin@1234" -ForegroundColor Gray
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit this launcher"
