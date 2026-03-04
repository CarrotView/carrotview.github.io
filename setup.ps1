#!/usr/bin/env pwsh
# Setup script for CarrotView development environment
# Cross-platform PowerShell script (works on Windows, macOS, Linux)

Write-Host "🥕 Setting up CarrotView development environment..." -ForegroundColor Green

# Check if nvm is available
$nvmAvailable = $null -ne (Get-Command nvm -ErrorAction SilentlyContinue)
if ($nvmAvailable) {
    Write-Host "✅ nvm found - using project Node version" -ForegroundColor Green
    nvm use
} else {
    Write-Host "⚠️  nvm not found - please ensure Node.js v18.19.0+ is installed" -ForegroundColor Yellow
}

# Check Node version with better error handling
try {
    $nodeVersion = node --version
    Write-Host "📦 Using Node.js $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Error "❌ Node.js not found. Please install Node.js v18.19.0+"
    exit 1
}

# Install dependencies based on available package manager
$bunAvailable = $null -ne (Get-Command bun -ErrorAction SilentlyContinue)
$npmAvailable = $null -ne (Get-Command npm -ErrorAction SilentlyContinue)

if ($bunAvailable) {
    Write-Host "🚀 Installing dependencies with Bun..." -ForegroundColor Magenta
    bun install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "🎯 Start development with: bun dev" -ForegroundColor Green
        Write-Host "🌐 Visit: http://localhost:8080" -ForegroundColor Blue
    } else {
        Write-Error "❌ Bun install failed"
        exit 1
    }
} elseif ($npmAvailable) {
    Write-Host "📦 Installing dependencies with npm..." -ForegroundColor Blue  
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "🎯 Start development with: npm run dev" -ForegroundColor Green
        Write-Host "🌐 Visit: http://localhost:8080" -ForegroundColor Blue
    } else {
        Write-Error "❌ npm install failed"
        exit 1
    }
} else {
    Write-Error "❌ No package manager found. Please install Node.js or Bun"
    exit 1
}

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "📚 Check README.md for more development info" -ForegroundColor Gray