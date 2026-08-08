@echo off
title Fasih QA Portfolio - Flask
cd /d "%~dp0"

if not exist venv\Scripts\python.exe (
    echo Creating virtual environment...
    py -3.11 -m venv venv
)

call venv\Scripts\activate.bat

echo Installing/updating dependencies...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

if not exist .env (
    echo.
    echo WARNING: .env was not found.
    echo Copy .env.example to .env and add your OPENAI_API_KEY for the AI chatbot.
    echo.
)

echo.
echo Starting Fasih QA Portfolio...
python app.py
pause
