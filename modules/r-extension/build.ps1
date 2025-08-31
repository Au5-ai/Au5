# Build script for Au5 React Chrome Extension

Write-Host "Building Au5 React Chrome Extension..." -ForegroundColor Green

# Clean dist directory
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}

# Run the build
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful! Copying additional files..." -ForegroundColor Green
    
    # Copy manifest
    Copy-Item "manifest.json" "dist/"
    
    # Copy content CSS
    Copy-Item "src/content.css" "dist/src/"
    
    # Create icons directory and copy placeholder icons
    New-Item -ItemType Directory -Force -Path "dist/icons" | Out-Null
    
    # Copy icon placeholders from public if they exist, otherwise create placeholders
    if (Test-Path "public/icons") {
        Copy-Item "public/icons/*" "dist/icons/" -ErrorAction SilentlyContinue
    }
    
    # Create placeholder icon files if they don't exist
    $iconSizes = @(16, 32, 48, 128)
    foreach ($size in $iconSizes) {
        $iconPath = "dist/icons/icon$size.png"
        if (!(Test-Path $iconPath)) {
            "# Placeholder icon $size x $size`n# Replace with actual PNG file" | Out-File -FilePath $iconPath -Encoding utf8
        }
    }
    
    Write-Host "Extension built successfully!" -ForegroundColor Green
    Write-Host "Files are ready in the 'dist' directory." -ForegroundColor Cyan
    Write-Host "To load in Chrome:" -ForegroundColor Yellow
    Write-Host "1. Open Chrome and go to chrome://extensions/" -ForegroundColor White
    Write-Host "2. Enable 'Developer mode'" -ForegroundColor White
    Write-Host "3. Click 'Load unpacked' and select the 'dist' folder" -ForegroundColor White
} else {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}
