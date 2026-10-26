@echo off
chcp 65001 >nul
echo ========================================================
echo   Khởi động EduConnect SaaS Server bằng Docker
echo ========================================================
echo.

echo Đang kiểm tra Docker...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Docker chưa được bật hoặc không phản hồi.
    echo Vui lòng mở Docker Desktop trước khi chạy file này.
    pause
    exit /b 1
)

echo Đang đóng gói và khởi chạy container (docker compose up)...
docker compose up -d --build

if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo   [OK] Server EduConnect đã khởi chạy thành công!
    echo   Địa chỉ truy cập: http://localhost:3000
    echo ========================================================
    echo Đang mở trình duyệt...
    start http://localhost:3000
) else (
    echo.
    echo [ERROR] Không thể khởi chạy Docker container.
)

pause
