# FleetOS — Start MongoDB (portable, no install needed)
# Run this from Fleet_OS root directory

$mongoDir = "$PSScriptRoot\mongodb"
$dataDir  = "$PSScriptRoot\mongodb\data\db"
$logDir   = "$PSScriptRoot\mongodb\log"
$logFile  = "$logDir\mongod.log"

# Find mongod.exe
$mongod = Get-ChildItem $mongoDir -Recurse -Filter "mongod.exe" -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName

if (-not $mongod) {
    Write-Host "ERROR: mongod.exe not found in $mongoDir" -ForegroundColor Red
    Write-Host "Make sure MongoDB was downloaded and extracted." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Create data and log directories
New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
New-Item -ItemType Directory -Path $logDir  -Force | Out-Null

Write-Host ""
Write-Host "Starting MongoDB (portable)..." -ForegroundColor Cyan
Write-Host "  mongod  : $mongod" -ForegroundColor Gray
Write-Host "  data    : $dataDir" -ForegroundColor Gray
Write-Host "  log     : $logFile" -ForegroundColor Gray
Write-Host "  port    : 27017" -ForegroundColor Gray
Write-Host ""

# Start mongod in background
Start-Process -FilePath $mongod `
    -ArgumentList "--dbpath `"$dataDir`" --logpath `"$logFile`" --port 27017" `
    -WindowStyle Hidden

Start-Sleep -Seconds 3

# Verify it's running
$running = (Test-NetConnection -ComputerName 127.0.0.1 -Port 27017 -InformationLevel Quiet -WarningAction SilentlyContinue)
if ($running) {
    Write-Host "MongoDB is running on port 27017!" -ForegroundColor Green
} else {
    Write-Host "MongoDB may still be starting... check log: $logFile" -ForegroundColor Yellow
}
