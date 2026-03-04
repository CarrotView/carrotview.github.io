@echo off
REM Setup script for CarrotView development environment (Windows)
REM Ensures proper Node version and dependencies

echo 🥕 Setting up CarrotView development environment...

REM Check if nvm is available
where nvm >nul 2>nul
if %ERRORLEVEL% == 0 (
    echo ✅ nvm found - using project Node version
    nvm use
) else (
    echo ⚠️ nvm not found - please ensure Node.js v18.19.0+ is installed
)

REM Check Node version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo 📦 Using Node.js %NODE_VERSION%

REM Install dependencies based on available package manager
where bun >nul 2>nul
if %ERRORLEVEL% == 0 (
    echo 🚀 Installing dependencies with Bun...
    bun install
    echo 🎯 Start development with: bun dev
    goto :done
)

where npm >nul 2>nul
if %ERRORLEVEL% == 0 (
    echo 📦 Installing dependencies with npm...
    npm install
    echo 🎯 Start development with: npm run dev
    goto :done
)

echo ❌ No package manager found. Please install Node.js or Bun
pause
exit /b 1

:done
echo ✅ Setup complete! Run your start command and visit http://localhost:8080
pause