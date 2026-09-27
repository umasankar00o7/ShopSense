@echo off
title ShopSense Intelligence Backend Server
color 0b
echo ============================================================
echo           SHOPSENSE: E-COMMERCE INTELLIGENCE PLATFORM
echo ============================================================
echo.
echo [1/3] Navigating to Project Directory...
cd /d "%~dp0"

echo [2/3] Activating Python Virtual Environment...
call venv\Scripts\activate.bat

echo [3/3] Starting ShopSense API on Port 8001...
echo.
echo Server running at: http://127.0.0.1:8001
echo Leave this window open while using the web application!
echo ============================================================
echo.

python -m uvicorn backend.main:app --port 8001

pause