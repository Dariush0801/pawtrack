@echo off
title PawTrack Git Auto-Sync Watcher
color 0A
echo ========================================================
echo   PawTrack Git Auto-Commit & Auto-Push Watcher
echo   Repository: https://github.com/Dariush0801/pawtrack.git
echo ========================================================
echo.
echo Starting file watcher... Save any file to auto-commit and push.
echo Press Ctrl+C anytime to stop.
echo.
node scripts/auto-sync.js
pause
