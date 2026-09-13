@echo off
title PawTrack Instant Git Push
color 0B
echo ========================================================
echo   PawTrack Instant Sync & Push to GitHub
echo   Repository: https://github.com/Dariush0801/pawtrack.git
echo ========================================================
echo.
echo [1/4] Staging modified files...
git add -A
echo.
set /p COMMIT_MSG="Enter commit message (or press ENTER for default): "
if "%COMMIT_MSG%"=="" set COMMIT_MSG=Manual sync update: PawTrack Pet Owner Portal
echo.
echo [2/4] Committing changes...
git commit -m "%COMMIT_MSG%"
echo.
echo [3/4] Pulling remote updates with rebase (if any)...
git pull --rebase origin main
echo.
echo [4/4] Pushing to GitHub (main branch)...
git push origin main
echo.
echo ========================================================
echo   Done! Your changes are synced to GitHub and Vercel.
echo ========================================================
echo.
pause
