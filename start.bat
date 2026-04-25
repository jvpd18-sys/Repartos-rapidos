@echo off
chcp 65001 >nul
title Repartos Rapidos S.A.S - Lanzador
echo ===============================================
echo  Repartos Rapidos S.A.S
echo  Iniciando servicios locales...
echo ===============================================
echo.
echo  Backend:  http://localhost:8000   (docs: /docs)
echo  Frontend: http://localhost:5173
echo  Rastreo:  http://localhost:5173/rastrear
echo.
echo  Credenciales demo:
echo    admin@repartosrapidos.co
echo    Reparto2026!
echo ===============================================

start "Repartos Rapidos - Backend" cmd /k "cd /d %~dp0backend && py -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
timeout /t 3 /nobreak >nul
start "Repartos Rapidos - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 5 /nobreak >nul
start "" "http://localhost:5173"
echo.
echo  Servicios lanzados. Cierra ambas ventanas para detener la aplicacion.
