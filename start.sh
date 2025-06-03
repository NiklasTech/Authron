#!/bin/bash

# Ermittelt die lokale IP-Adresse
LOCAL_IP=$(ip -4 addr show | grep inet | grep -v "127.0.0.1" | awk '{print $2}' | cut -d/ -f1)

# Stellt sicher, dass die IP gefunden wurde
if [ -z "$LOCAL_IP" ]; then
  echo "Fehler: Keine lokale IP gefunden."
  exit 1
fi

# Startet das Backend (FastAPI) im LAN-Modus
echo "Starte FastAPI-Backend auf http://$LOCAL_IP:8000..."
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000 &

# Wechselt ins Frontend-Verzeichnis und startet den Vite-Dev-Server
cd frontend  # Oder das Verzeichnis, in dem sich deine Vite-App befindet
echo "Starte Vite-Dev-Server auf http://$LOCAL_IP:5173..."
VITE_API_URL=http://$LOCAL_IP:8000/api/v1 npm run dev
