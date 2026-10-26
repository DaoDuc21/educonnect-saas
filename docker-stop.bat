@echo off
chcp 65001 >nul
echo ========================================================
echo   Dừng EduConnect SaaS Docker Server
echo ========================================================
echo.

docker compose down

echo.
echo [OK] Đã dừng và giải phóng container EduConnect.
pause
