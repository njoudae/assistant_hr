@echo off
echo ========================================
echo    HR Assistant Platform Installation
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js is installed ✓
echo.

echo Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo Dependencies installed successfully ✓
echo.

echo Creating environment file...
if not exist .env (
    copy env.example .env
    echo Environment file created ✓
    echo.
    echo IMPORTANT: Please edit .env file and add your OpenAI API key!
    echo.
) else (
    echo Environment file already exists ✓
)

echo.
echo ========================================
echo    Installation Complete!
echo ========================================
echo.
echo To start the application:
echo 1. Edit .env file and add your OpenAI API key
echo 2. Run: npm start
echo 3. Open: http://localhost:3000
echo.
pause 