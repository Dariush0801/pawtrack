@echo off
title PawTrack Instant Git Push
color 0B
echo ========================================================
echo   PawTrack Instant Sync & Push to GitHub
echo   Repository: https://github.com/Dariush0801/pawtrack.git
echo ========================================================
echo.
echo [1/3] Staging all files...
git add -A
echo [2/3] Committing changes...
git commit -m "Update PawTrack code and configuration"
echo [3/3] Pushing to GitHub (main)...
git push origin main
echo.
echo ========================================================
echo   Done! Your changes are synced to GitHub and Vercel.
echo ========================================================
echo.
pause
