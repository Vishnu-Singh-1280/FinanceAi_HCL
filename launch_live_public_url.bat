@echo off
title FinanceAI Live Public Server - Vishnu Singh
echo ================================================================
echo  FinanceAI - Live Public Internet Server
echo  Developed by Vishnu Singh
echo ================================================================
echo.

echo [1/2] Launching unified FastAPI server on port 8000...
start "FinanceAI Backend Server" cmd /k "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

echo Waiting 3 seconds for server to initialize...
timeout /t 3 /nobreak >nul

echo.
echo [2/2] Generating instant Public HTTPS link for your project...
echo Share this link with anyone - accessible globally on phone and PC!
echo ----------------------------------------------------------------
echo.
call npx -y localtunnel --port 8000
pause
