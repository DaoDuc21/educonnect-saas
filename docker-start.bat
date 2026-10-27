@echo off
chcp 65001 >nul
echo ============================================================================
echo   Khởi động EduConnect SaaS Stack (PostgreSQL 16 + Redis 7 + Next.js Server)
echo ============================================================================
echo.

echo Đang kiểm tra trạng thái Docker...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Docker Desktop chưa được bật hoặc không phản hồi.
    echo Vui lòng bật Docker Desktop trước khi chạy file này.
    pause
    exit /b 1
)

echo Đang khởi chạy toàn bộ hệ thống cơ sở dữ liệu và ứng dụng (docker compose up)...
docker compose up -d --build

if %errorlevel% equ 0 (
    echo.
    echo ============================================================================
    echo   [OK] Toàn bộ hệ thống EduConnect đã khởi chạy thành công!
    echo   - Web Server:   http://localhost:3000
    echo   - Database:     PostgreSQL 16 tại localhost:5432 (Database: educonnect_db)
    echo   - Cache / Sync: Redis 7 tại localhost:6379
    echo   - Health Check: http://localhost:3000/api/health
    echo ============================================================================
    echo Đang mở trình duyệt...
    start http://localhost:3000
) else (
    echo.
    echo [ERROR] Không thể khởi chạy Docker Compose stack.
)

pause
