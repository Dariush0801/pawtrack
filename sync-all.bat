@echo off
title PawTrack Full Ecosystem Git Sync (Owner + Admin)
color 0B
cd /d "%~dp0"

echo ========================================================
echo   PawTrack Ecosystem Dual Git Sync (Owner + Admin)
echo ========================================================
echo.
set /p COMMIT_MSG="Enter commit message for both repos (or press ENTER for default): "
if "%COMMIT_MSG%"=="" set COMMIT_MSG=Ecosystem synchronized update: Admin + Pet Owner portal
echo.

echo [1/2] Syncing PawTrack Admin Console...
echo --------------------------------------------------------
echo Repository: https://github.com/Dariush0801/pawtrack_admin.git
cd /d "%~dp0"
git add -A
git commit -m "%COMMIT_MSG%"
git pull --rebase origin main
git push origin main
echo [*] Admin Console Git sync finished.
echo.

echo [2/2] Syncing PawTrack Pet Owner Portal...
echo --------------------------------------------------------
echo Repository: https://github.com/Dariush0801/pawtrack.git
if exist "%~dp0..\PawTrack" (
    cd /d "%~dp0..\PawTrack"
    git add -A
    git commit -m "%COMMIT_MSG%"
    git pull --rebase origin main
    git push origin main
    echo [*] Pet Owner Portal Git sync finished.
) else (
    echo [WARNING] PawTrack Pet Owner directory not found at %~dp0..\PawTrack
)
echo.

cd /d "%~dp0"
echo ========================================================
echo   ✅ Both Owner & Admin Repositories Synced to GitHub!
echo ========================================================
echo.
pause
