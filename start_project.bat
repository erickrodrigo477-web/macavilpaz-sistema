@echo off
echo Starting Macavilpaz System...

start cmd /k "cd backend && npm run dev"
start cmd /k "cd frontend && npm run dev"

echo Backend and Frontend are starting in new windows.
echo Backend: http://localhost:4000
echo Frontend: http://localhost:3000
pause
