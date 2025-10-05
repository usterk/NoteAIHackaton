@echo off
echo.
echo ===============================================
echo  Secure Notes App - Uruchomienie (Windows)
echo ===============================================
echo.

REM Sprawdź czy Docker jest zainstalowany
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker nie jest zainstalowany!
    echo Zainstaluj Docker Desktop z: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Sprawdź czy docker-compose jest zainstalowany
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] docker-compose nie jest zainstalowany!
    pause
    exit /b 1
)

echo [OK] Docker i docker-compose są zainstalowane
echo.
echo Budowanie i uruchamianie aplikacji...
echo.

REM Utwórz folder dla danych jeśli nie istnieje
if not exist "data" mkdir data

REM Uruchom docker-compose
docker-compose up --build

echo.
echo Aplikacja zatrzymana
pause
