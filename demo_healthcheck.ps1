# PS-3 Prototype Health Check Script
# Tests all components and provides demo readiness status

Write-Host " PS-3 ADO + BAS Prototype Health Check" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Check if backend is running
Write-Host "`n1. Testing Backend API..." -ForegroundColor Yellow
try {
    $scenario = Invoke-RestMethod -Uri "http://127.0.0.1:8000/scenario" -Method GET -TimeoutSec 5
    Write-Host " Backend API: RUNNING" -ForegroundColor Green
    Write-Host "   Scenario: $($scenario.title)" -ForegroundColor Gray
} catch {
    Write-Host " Backend API: NOT RUNNING" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Fix: Run 'python backend\main.py' in a separate terminal" -ForegroundColor Yellow
}

# Check if frontend is running
Write-Host "`n2. Testing Frontend..." -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 5
    if ($frontend.StatusCode -eq 200) {
        Write-Host " Frontend: RUNNING" -ForegroundColor Green
        Write-Host "   URL: http://localhost:5173" -ForegroundColor Gray
    }
} catch {
    Write-Host " Frontend: NOT RUNNING" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Fix: Run 'cd frontend && npm run dev' in a separate terminal" -ForegroundColor Yellow
}

# Test API endpoints
Write-Host "`n3. Testing API Endpoints..." -ForegroundColor Yellow
try {
    $optimize = Invoke-RestMethod -Uri "http://127.0.0.1:8000/optimize_deception" -Method POST -Body '{}' -ContentType 'application/json' -TimeoutSec 5
    Write-Host " Optimize Endpoint: WORKING" -ForegroundColor Green
    Write-Host "   Best Action: $($optimize.best_action_id)" -ForegroundColor Gray
} catch {
    Write-Host " Optimize Endpoint: FAILED" -ForegroundColor Red
}

try {
    $simulate = Invoke-RestMethod -Uri "http://127.0.0.1:8000/simulate_turn" -Method POST -Body '{"chosen_action_id": "patch_db", "current_beliefs": {"H1": 0.5, "H2": 0.3, "H3": 0.2}}' -ContentType 'application/json' -TimeoutSec 5
    Write-Host " Simulate Endpoint: WORKING" -ForegroundColor Green
    Write-Host "   ROI: $($simulate.roi)" -ForegroundColor Gray
} catch {
    Write-Host " Simulate Endpoint: FAILED" -ForegroundColor Red
}

# Check file structure
Write-Host "`n4. Checking File Structure..." -ForegroundColor Yellow
$requiredFiles = @(
    "backend\main.py",
    "frontend\package.json",
    "frontend\src\App.tsx",
    "frontend\index.html"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host " $file" -ForegroundColor Green
    } else {
        Write-Host " $file - MISSING" -ForegroundColor Red
        $allFilesExist = $false
    }
}

# Demo readiness assessment
Write-Host "`n5. Demo Readiness Assessment..." -ForegroundColor Yellow
$backendRunning = $false
$frontendRunning = $false

try {
    $null = Invoke-RestMethod -Uri "http://127.0.0.1:8000/scenario" -Method GET -TimeoutSec 2
    $backendRunning = $true
} catch { }

try {
    $null = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 2
    $frontendRunning = $true
} catch { }

if ($backendRunning -and $frontendRunning -and $allFilesExist) {
    Write-Host " DEMO READY!" -ForegroundColor Green
    Write-Host "   Both servers running, all files present" -ForegroundColor Green
    Write-Host "   Open http://localhost:5173 to start demo" -ForegroundColor Cyan
} else {
    Write-Host "  DEMO NOT READY" -ForegroundColor Yellow
    Write-Host "   Check the issues above and restart servers" -ForegroundColor Yellow
}

Write-Host "`n6. Demo Script Instructions:" -ForegroundColor Yellow
Write-Host "   1. Open http://localhost:5173 in browser" -ForegroundColor Gray
Write-Host "   2. Click 'Patch DB vuln' action" -ForegroundColor Gray
Write-Host "   3. Click 'Enable verbose auth logs' action" -ForegroundColor Gray
Write-Host "   4. Click 'Deploy web honeypot placeholder' action" -ForegroundColor Gray
Write-Host "   5. Click 'Export Simulation Report (PDF)' button" -ForegroundColor Gray
Write-Host "   6. Show the belief changes and ROI calculations" -ForegroundColor Gray

Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "Health check complete!" -ForegroundColor Cyan
