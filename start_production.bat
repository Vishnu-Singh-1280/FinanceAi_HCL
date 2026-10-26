@echo off
echo ========================================================
echo  FinanceAI - Production Unified Local Server
echo  Developed by Vishnu Singh
echo ========================================================
echo.

echo [1/2] Building frontend static bundle...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo Error building frontend.
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo [2/2] Launching unified FastAPI server on http://localhost:8000 ...
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
pause
