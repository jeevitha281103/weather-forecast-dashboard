@echo off
title Weather Forecast Dashboard
cd /d "%~dp0"
echo ================================
echo  Weather Forecast Dashboard
echo ================================
echo.
echo Current folder: %cd%
echo.
echo Checking Node.js...
node --version
echo Checking npm...
npm --version
echo.
echo Starting Vite dev server...
echo.
npm run dev
echo.
echo ================================
echo  Server stopped
echo ================================
pause