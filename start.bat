@echo off
setlocal

REM Ermittelt die lokale IP-Adresse
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4"') do (
    set LOCAL_IP=%%a
    goto :found_ip
)

:found_ip
set LOCAL_IP=%LOCAL_IP:~1%
echo Lokale IP-Adresse: %LOCAL_IP%

REM Startet das Backend (FastAPI) im LAN-Modus
echo Starte FastAPI-Backend auf http://%LOCAL_IP%:8000...
start cmd /k "python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000"

REM Warte kurz, damit das Backend starten kann
timeout /t 3

REM Wechselt ins Frontend-Verzeichnis und startet den Vite-Dev-Server
cd frontend
echo Starte Vite-Dev-Server auf http://%LOCAL_IP%:5173...
set VITE_API_URL=http://%LOCAL_IP%:8000/api/v1
start cmd /k "npm run dev"

echo.
echo Backend läuft auf: http://%LOCAL_IP%:8000
echo Frontend läuft auf: http://%LOCAL_IP%:5173
echo.
echo Drücke eine beliebige Taste zum Beenden...
pause > nul

endlocal
