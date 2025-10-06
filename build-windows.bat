@echo off
echo Building project for Windows...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo Error: npm is not installed or not in PATH
    exit /b 1
)

echo Installing dependencies...
call npm install

if errorlevel 1 (
    echo Error: Failed to install dependencies
    exit /b 1
)

echo Building project...
call npm run build

if errorlevel 1 (
    echo Error: Build failed
    exit /b 1
)

echo Build completed successfully!
pause
