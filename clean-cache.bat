@echo off
REM =====================================================
REM Clean Cache Only (Keep node_modules) - Eduhire
REM =====================================================
REM This script clears only cache files, not dependencies:
REM - Package-lock.json
REM - Build cache
REM - ESLint cache
REM - Parcel cache
REM - Node cache
REM =====================================================

setlocal enabledelayedexpansion

REM Define colors for output
color 0A

echo.
echo ================================================
echo     EDUHIRE PROJECT CACHE CLEANUP
echo     (Preserving node_modules)
echo ================================================
echo.

REM Define paths
set SERVER_PATH=D:\Apps\PythonDocs\Eduhire\server
set CLIENT_PATH=D:\Apps\PythonDocs\Eduhire\client

REM Check if paths exist
if not exist "%SERVER_PATH%" (
    echo ERROR: Server path does not exist: %SERVER_PATH%
    pause
    exit /b 1
)

if not exist "%CLIENT_PATH%" (
    echo ERROR: Client path does not exist: %CLIENT_PATH%
    pause
    exit /b 1
)

echo Paths found:
echo - Server: %SERVER_PATH%
echo - Client: %CLIENT_PATH%
echo.

REM =====================================================
REM CLEAN SERVER CACHE
REM =====================================================
echo.
echo ================================================
echo CLEANING SERVER CACHE
echo ================================================
echo.

REM Delete package-lock.json
if exist "%SERVER_PATH%\package-lock.json" (
    echo Deleting: package-lock.json
    del /q "%SERVER_PATH%\package-lock.json"
    echo [OK] package-lock.json deleted
) else (
    echo [SKIP] package-lock.json not found
)

echo.

REM Delete .env cache
if exist "%SERVER_PATH%\.env.local" (
    echo Deleting: .env.local
    del /q "%SERVER_PATH%\.env.local"
    echo [OK] .env.local deleted
) else (
    echo [SKIP] .env.local not found
)

echo.

REM =====================================================
REM CLEAN CLIENT CACHE
REM =====================================================
echo.
echo ================================================
echo CLEANING CLIENT CACHE
echo ================================================
echo.

REM Delete package-lock.json
if exist "%CLIENT_PATH%\package-lock.json" (
    echo Deleting: package-lock.json
    del /q "%CLIENT_PATH%\package-lock.json"
    echo [OK] package-lock.json deleted
) else (
    echo [SKIP] package-lock.json not found
)

echo.

REM Delete build folder (React build cache)
if exist "%CLIENT_PATH%\build" (
    echo Deleting: build folder
    rmdir /s /q "%CLIENT_PATH%\build"
    echo [OK] build folder deleted
) else (
    echo [SKIP] build folder not found
)

echo.

REM Delete .eslintcache
if exist "%CLIENT_PATH%\.eslintcache" (
    echo Deleting: .eslintcache
    del /q "%CLIENT_PATH%\.eslintcache"
    echo [OK] .eslintcache deleted
) else (
    echo [SKIP] .eslintcache not found
)

echo.

REM Delete .cache folder (parcel cache)
if exist "%CLIENT_PATH%\.cache" (
    echo Deleting: .cache folder
    rmdir /s /q "%CLIENT_PATH%\.cache"
    echo [OK] .cache folder deleted
) else (
    echo [SKIP] .cache folder not found
)

echo.

REM Delete dist folder if exists
if exist "%CLIENT_PATH%\dist" (
    echo Deleting: dist folder
    rmdir /s /q "%CLIENT_PATH%\dist"
    echo [OK] dist folder deleted
) else (
    echo [SKIP] dist folder not found
)

echo.

REM =====================================================
REM NPM CACHE CLEAN
REM =====================================================
echo.
echo ================================================
echo CLEANING NPM GLOBAL CACHE
echo ================================================
echo.

echo Running: npm cache clean --force
call npm cache clean --force
echo [OK] NPM cache cleaned

echo.

REM =====================================================
REM SUMMARY
REM =====================================================
echo.
echo ================================================
echo CACHE CLEANUP COMPLETED!
echo ================================================
echo.
echo BENEFITS:
echo - node_modules preserved (no npm install needed)
echo - Cache cleared for fresh start
echo - Dependencies still installed
echo.
echo YOU CAN NOW:
echo.
echo 1. Start Server:
echo    cd %SERVER_PATH%
echo    npm run dev
echo.
echo 2. Start Client:
echo    cd %CLIENT_PATH%
echo    npm start
echo.
echo ================================================
echo.

pause
