# ==============================================================================
# AuraStore Master Service Stopper
# Pure Win32 / Native Execution - Zero CIM / WMI Dependency
# Gracefully and cleanly terminates all AuraStore microservices & clears lock files
# ==============================================================================

Write-Host "==========================================================" -ForegroundColor Red
Write-Host "        AURASTORE - STOPPING ALL MICROSERVICES            " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Red

$projectRoot = "C:\Users\Deepika\Desktop\Major project (2)\Major project"
$targetPorts = @(8080, 8001, 8002, 5173)
$pgCtl = "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe"
$pgData = "C:\Program Files\PostgreSQL\18\data"
$pidFile = "$pgData\postmaster.pid"

# Terminate active background supervisor if running
$supervisorLock = "$projectRoot\.supervisor.pid"
if (Test-Path $supervisorLock) {
    try {
        $sPid = [int](Get-Content $supervisorLock -ErrorAction SilentlyContinue | Select-Object -First 1)
        if ($sPid -and $sPid -ne $PID) {
            Write-Host "Stopping background supervisor (PID $sPid)..." -ForegroundColor Yellow
            Stop-Process -Id $sPid -Force -ErrorAction SilentlyContinue
        }
    } catch {}
    Remove-Item $supervisorLock -Force -ErrorAction SilentlyContinue
}

# Helper: Find process IDs on a port using netstat
function Get-PortPids($port) {
    $pids = @()
    $raw = netstat -ano | findstr ":$port"
    foreach ($line in $raw) {
        $trimmed = $line.Trim()
        if ($trimmed -match ":$port\s+") {
            $parts = ($trimmed -split '\s+')
            if ($parts.Count -ge 5) {
                $p = $parts[-1]
                if ($p -match '^\d+$' -and [int]$p -gt 4) {
                    $pids += [int]$p
                }
            }
        }
    }
    return $pids | Select-Object -Unique
}

# 1. Kill all processes on target ports (8080, 8001, 8002, 5173)
Write-Host "`n[1/3] Terminating processes on ports 8080, 8001, 8002, 5173..." -ForegroundColor Cyan
foreach ($port in $targetPorts) {
    $pids = Get-PortPids $port
    foreach ($p in $pids) {
        Write-Host "  Found process (PID: $p) on port $port. Terminating..." -ForegroundColor Yellow
        & taskkill.exe /F /T /PID $p 2>$null | Out-Null
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
    }
}

# 2. Terminate any lingering Java / Python workers running AuraStore
Write-Host "`n[2/3] Checking for lingering AuraStore worker processes..." -ForegroundColor Cyan
$allJava = Get-Process java -ErrorAction SilentlyContinue
foreach ($j in $allJava) {
    Write-Host "  Terminating java process (PID: $($j.Id))..." -ForegroundColor Yellow
    & taskkill.exe /F /PID $j.Id 2>$null | Out-Null
    Stop-Process -Id $j.Id -Force -ErrorAction SilentlyContinue
}

# 3. Cleanly Stop PostgreSQL Database (so postmaster.pid lock is never left corrupted)
Write-Host "`n[3/3] Gracefully stopping PostgreSQL database (Port 5432)..." -ForegroundColor Cyan
$pgPids = Get-PortPids 5432
if ($pgPids.Count -gt 0) {
    if (Test-Path $pgCtl) {
        & $pgCtl stop -D $pgData -m fast 2>$null | Out-Null
    }
    & net.exe stop postgresql-x64-18 2>$null | Out-Null
    Start-Sleep -Seconds 1
}

# Clean any residual postmaster.pid lock file
if (Test-Path $pidFile) {
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
}

Start-Sleep -Seconds 1

# Verification
$stillActive = @()
foreach ($port in $targetPorts) {
    $pids = Get-PortPids $port
    if ($pids.Count -gt 0) {
        $stillActive += $port
    }
}

if ($stillActive.Count -eq 0) {
    Write-Host "`n==========================================================" -ForegroundColor Green
    Write-Host " [SUCCESS] All AuraStore microservices are completely STOPPED!" -ForegroundColor Green
    Write-Host " - Port 8080 (Backend):    FREE" -ForegroundColor Green
    Write-Host " - Port 8001 (ML Service): FREE" -ForegroundColor Green
    Write-Host " - Port 8002 (AI Service): FREE" -ForegroundColor Green
    Write-Host " - Port 5173 (Frontend):   FREE" -ForegroundColor Green
    Write-Host " - Database Lock File:     CLEAN" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
} else {
    Write-Host "`n[WARNING] Some ports are still active: $($stillActive -join ', ')" -ForegroundColor Red
}
