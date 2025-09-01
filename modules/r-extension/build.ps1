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
    New-Item -ItemType Directory -Force -Path "dist/fonts" | Out-Null
    New-Item -ItemType Directory -Force -Path "dist/images" | Out-Null

    # Copy icon placeholders from public if they exist, otherwise create placeholders
    if (Test-Path "public/icons") {
        Copy-Item "public/icons/*" "dist/icons/" -ErrorAction SilentlyContinue
    }

    if (Test-Path "public/fonts") {
        Copy-Item "public/fonts/*" "dist/fonts/" -ErrorAction SilentlyContinue
    }

    if (Test-Path "public/images") {
        Copy-Item "public/images/*" "dist/images/" -ErrorAction SilentlyContinue
    }
    
    Write-Host "Extension built successfully!" -ForegroundColor Green
    Write-Host "Files are ready in the 'dist' directory." -ForegroundColor Cyan
} else {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}
