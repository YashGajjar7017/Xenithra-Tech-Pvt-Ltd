@echo off
REM Build and preview (production-like) for Electron + Vite (Windows)
echo Building renderer and main...
npm run build
if %ERRORLEVEL% neq 0 (
  echo Build failed.
  exit /b %ERRORLEVEL%
)
echo Starting preview...
npm start
