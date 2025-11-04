# Test script for running the bot locally on Windows
# This script helps you test the bot without Docker

Write-Host "Au5 Bot - Local Testing Script" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""

# Check if test-config.json exists
if (-not (Test-Path "test-config.json")) {
    Write-Host "[ERROR] test-config.json not found!" -ForegroundColor Red
    Write-Host "Please create test-config.json with your meeting configuration." -ForegroundColor Yellow
    exit 1
}

# Read the config file
$configContent = Get-Content "test-config.json" -Raw
Write-Host "[OK] Configuration loaded from test-config.json" -ForegroundColor Green

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "[INFO] Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install dependencies!" -ForegroundColor Red
        exit 1
    }
}

# Build the TypeScript code
Write-Host "[INFO] Building TypeScript..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Build failed!" -ForegroundColor Red
    exit 1
}

# Install Playwright browsers if needed
Write-Host "[INFO] Checking Playwright browsers..." -ForegroundColor Yellow
npx playwright install chromium
if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARNING] Failed to install Playwright browsers, but continuing..." -ForegroundColor Yellow
}

# Create screenshots directory
if (-not (Test-Path "screenshots")) {
    New-Item -ItemType Directory -Path "screenshots" | Out-Null
    Write-Host "[OK] Created screenshots directory: $(Get-Location)\screenshots" -ForegroundColor Green
}

# Set environment variable and run
Write-Host ""
Write-Host $"[START] Starting bot to {($configContent | ConvertFrom-Json).meetingUrl}" -ForegroundColor Green
Write-Host "[INFO] Screenshots will be saved to: $(Get-Location)\screenshots" -ForegroundColor Cyan
Write-Host "[INFO] Press Ctrl+C to stop the bot" -ForegroundColor Yellow
Write-Host ""

$env:MEETING_CONFIG = $configContent
node dist/index.js
