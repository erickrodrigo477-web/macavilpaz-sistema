@echo off
echo Starting Macavilpaz System...

start cmd /k "cd backend && npm run dev"
start cmd /k "cd frontend && npm run dev"
start cmd /k "cd maintenance-prediction && npm run start:dev"

echo Backend, Frontend and Maintenance-Prediction are starting in new windows.
echo Backend: http://localhost:4000
echo Frontend: http://localhost:3000
echo Maintenance Prediction: http://localhost:4001
pause
