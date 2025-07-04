@echo off
echo ========================================
echo 个人生活管理助手 - 一键启动
echo ========================================
echo.

echo 1. 启动后端服务器...
start "后端服务" cmd /k "cd backend && npm start"

echo 2. 等待后端启动完成（10秒）...
timeout /t 10 /nobreak

echo 3. 启动前端开发服务器...
start "前端服务" cmd /k "npm run dev:check"

echo.
echo ========================================
echo 启动完成！
echo 后端服务: http://localhost:3001
echo 前端应用: http://localhost:9527
echo ========================================
echo.
echo 按任意键关闭此窗口...
pause >nul 