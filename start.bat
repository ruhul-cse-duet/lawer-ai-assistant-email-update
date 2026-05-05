@echo off
setlocal

cd /d "%~dp0server"

if not exist node_modules (
  echo Installing dependencies...
  npm install
)

echo Starting server...
npm run dev
