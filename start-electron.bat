@echo off
if not exist "backend\venv" (
    echo Virtual Environment not found!
    pause
    exit /b 1
)
if not exist "frontend\node_modules" (
    echo Node Modules not found!
    pause
    exit /b 1
)
cd frontend
set NODE_ENV=development
npm run electron-dev
