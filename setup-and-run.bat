@echo off
title Weather Dashboard Setup & Run
cd /d "%~dp0"

echo ========================================
echo  Weather Forecast Dashboard - Auto Setup
echo ========================================
echo.

echo [1/5] Checking Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js not found. Install from https://nodejs.org
    goto :error
)

echo.
echo [2/5] Cleaning old install...
if exist node_modules rd /s /q node_modules 2>nul
if exist package-lock.json del package-lock.json 2>nul
echo Done.

echo.
echo [3/5] Installing dependencies...
npm install
echo npm install exit code: %errorlevel%
if errorlevel 1 (
    echo ERROR: npm install failed
    goto :error
)

echo.
echo [4/5] Checking API key...
if not exist .env.local (
    echo.
    echo ========================================
    echo  API KEY REQUIRED
    echo ========================================
    echo Get free key at: https://home.openweathermap.org/api_keys
    echo.
    set /p APIKEY="Paste your 32-char API key here: "
    if "%APIKEY%"=="" (
        echo No key entered. Exiting.
        goto :error
    )
    echo VITE_OPENWEATHER_API_KEY=%APIKEY% > .env.local
    echo Saved to .env.local
) else (
    echo Using existing .env.local
    type .env.local
)

echo.
echo [5/5] Starting server...
echo.
echo Opening http://localhost:3000
echo Press Ctrl+C to stop
echo.
npm run dev

:error
echo.
echo Press any key to exit...
pause >nul