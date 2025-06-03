from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import os
import shutil
import datetime
import sqlite3
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from backend.database.database import get_db
from backend.api.v1.admin import get_admin_user
from backend.database.models import User

router = APIRouter(prefix="/backup", tags=["backup"])

scheduler = BackgroundScheduler()
scheduler.start()

backup_job = None
backup_interval = None
is_backup_scheduled = False


def create_backup():
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = os.path.join(os.getcwd(), "backups")

    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)

    db_path = "password_manager.db"
    backup_path = os.path.join(backup_dir, f"backup_{timestamp}.backup")

    conn = sqlite3.connect(db_path)
    conn.close()

    shutil.copy2(db_path, backup_path)

    return {
        "message": f"Backup erfolgreich erstellt: backup_{timestamp}.backup",
        "timestamp": datetime.datetime.now().isoformat(),
        "filename": f"backup_{timestamp}.backup",
    }


@router.post("/create", status_code=status.HTTP_201_CREATED)
async def manual_backup(admin_user: User = Depends(get_admin_user)):
    """Manuelles Backup erstellen (nur für Admins)"""
    try:
        return create_backup()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fehler beim Erstellen des Backups: {str(e)}",
        )


@router.get("/list")
async def list_backups(admin_user: User = Depends(get_admin_user)):
    backup_dir = os.path.join(os.getcwd(), "backups")

    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)

    backups = []
    for filename in os.listdir(backup_dir):
        if filename.endswith(".backup"):
            file_path = os.path.join(backup_dir, filename)
            file_size = os.path.getsize(file_path) / (1024 * 1024)
            created_at = datetime.datetime.fromtimestamp(os.path.getctime(file_path))

            backups.append(
                {
                    "filename": filename,
                    "created_at": created_at.isoformat(),
                    "size_mb": round(file_size, 2),
                }
            )

    backups.sort(key=lambda x: x["created_at"], reverse=True)

    return {"backups": backups}


@router.delete("/{filename}")
async def delete_backup(filename: str, admin_user: User = Depends(get_admin_user)):
    if not filename.endswith(".backup"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ungültiger Dateiname. Nur .backup-Dateien können gelöscht werden.",
        )

    backup_dir = os.path.join(os.getcwd(), "backups")
    file_path = os.path.join(backup_dir, filename)

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Backup '{filename}' nicht gefunden",
        )

    try:
        os.remove(file_path)
        return {"message": f"Backup '{filename}' erfolgreich gelöscht"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fehler beim Löschen des Backups: {str(e)}",
        )


@router.post("/schedule")
async def schedule_backup(
    interval: int, enabled: bool = True, admin_user: User = Depends(get_admin_user)
):
    global backup_job, backup_interval, is_backup_scheduled

    if backup_job:
        scheduler.remove_job(backup_job.id)
        backup_job = None
        is_backup_scheduled = False

    if enabled and interval > 0:
        backup_job = scheduler.add_job(
            create_backup, "interval", hours=interval, id="backup_job"
        )
        backup_interval = interval
        is_backup_scheduled = True

        return {
            "message": f"Automatische Backups alle {interval} Stunden aktiviert",
            "enabled": True,
            "interval": interval,
        }
    else:
        return {
            "message": "Automatische Backups deaktiviert",
            "enabled": False,
            "interval": interval,
        }


@router.get("/schedule")
async def get_backup_schedule(admin_user: User = Depends(get_admin_user)):
    return {"enabled": is_backup_scheduled, "interval": backup_interval}
