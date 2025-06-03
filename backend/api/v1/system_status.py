
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
import time
from datetime import datetime
import os
import psutil

from backend.database.database import get_db, engine, SessionLocal
from backend.api.v1.admin import get_admin_user
from backend.database.models import User
from backend.security.utils import (
    fernet,
)

router = APIRouter(prefix="/system", tags=["system"])


@router.get("/status")
async def get_system_status(admin_user: User = Depends(get_admin_user)):
    """Gibt den aktuellen Systemstatus zurück."""

    db_status = "ok"
    db_message = None
    try:
        with SessionLocal() as session:
            result = session.execute(text("SELECT 1")).scalar()
            if result != 1:
                db_status = "error"
                db_message = "Datenbankverbindung fehlgeschlagen"
    except Exception as e:
        db_status = "error"
        db_message = str(e)

    api_status = "ok"

    auth_status = "ok"
    auth_message = None
    try:
        from backend.security.utils import SECRET_KEY

        if (
            not SECRET_KEY
            or SECRET_KEY
            == "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
        ):
            auth_status = "warning"
            auth_message = "Standard-Secret wird verwendet"
    except Exception as e:
        auth_status = "error"
        auth_message = str(e)

    encryption_status = "ok"
    encryption_message = None
    try:
        test_data = "Test123"
        encrypted = fernet.encrypt(test_data.encode())
        decrypted = fernet.decrypt(encrypted).decode()
        if test_data != decrypted:
            encryption_status = "error"
            encryption_message = "Verschlüsselungstest fehlgeschlagen"
    except Exception as e:
        encryption_status = "error"
        encryption_message = str(e)

    cpu_usage = psutil.cpu_percent()
    memory_usage = psutil.virtual_memory().percent
    uptime = time.time() - psutil.boot_time()
    uptime_days = int(uptime / 86400)
    uptime_hours = int((uptime % 86400) / 3600)

    backup_status = "ok"
    backup_message = "Heute, 04:00 Uhr"
    backup_dir = os.path.join(os.getcwd(), "backups")
    if not os.path.exists(backup_dir):
        try:
            os.makedirs(backup_dir)
            backup_status = "warning"
            backup_message = (
                "Backup-Verzeichnis wurde erstellt, aber noch kein Backup vorhanden"
            )
        except Exception as e:
            backup_status = "error"
            backup_message = (
                f"Backup-Verzeichnis konnte nicht erstellt werden: {str(e)}"
            )
    else:
        backups = [f for f in os.listdir(backup_dir) if f.endswith(".backup")]
        if not backups:
            backup_status = "warning"
            backup_message = "Keine Backups gefunden"
        else:
            latest_backup = max(
                backups, key=lambda x: os.path.getmtime(os.path.join(backup_dir, x))
            )
            backup_time = datetime.fromtimestamp(
                os.path.getmtime(os.path.join(backup_dir, latest_backup))
            )
            backup_message = backup_time.strftime("%d.%m.%Y, %H:%M Uhr")

    status_checks = [
        {"name": "Authentifizierung", "status": auth_status, "message": auth_message},
        {"name": "Datenbank", "status": db_status, "message": db_message},
        {
            "name": "Passwort-Verschlüsselung",
            "status": encryption_status,
            "message": encryption_message,
        },
        {"name": "API-Server", "status": api_status, "message": None},
        {"name": "Backup", "status": backup_status, "message": backup_message},
    ]

    system_info = {
        "cpu_usage": cpu_usage,
        "memory_usage": memory_usage,
        "uptime": f"{uptime_days}d {uptime_hours}h",
        "last_backup": backup_message,
    }

    return {
        "status_checks": status_checks,
        "system_info": system_info,
        "timestamp": datetime.utcnow().isoformat(),
    }
