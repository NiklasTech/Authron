from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional
from datetime import datetime, timedelta
import csv
from fastapi.responses import StreamingResponse
from io import StringIO

from backend.database.database import get_db
from backend.database.models import User, ActivityLog, TeamMember, Team
from backend.security.dependencies import get_current_active_user, get_admin_user
from backend.api.v1.schemas import ActivityLogResponse, ActivityLogsResponse

router = APIRouter(prefix="/logs", tags=["activity logs"])

@router.get("", response_model=ActivityLogsResponse)
async def get_activity_logs(
    page: int = Query(1, ge=1),
    user: Optional[str] = None,
    action: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Gibt Aktivitätsprotokolle zurück, gefiltert nach verschiedenen Kriterien (nur Admin)."""
    per_page = 20
    offset = (page - 1) * per_page

    # Basisabfrage erstellen
    query = db.query(ActivityLog, User).join(User, ActivityLog.user_id == User.id)

    # Filter anwenden
    if user:
        query = query.filter(
            (User.username.ilike(f"%{user}%")) | (User.email.ilike(f"%{user}%"))
        )

    if action:
        query = query.filter(ActivityLog.action == action)

    if start_date:
        try:
            start_date_obj = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
            query = query.filter(ActivityLog.timestamp >= start_date_obj)
        except ValueError:
            pass

    if end_date:
        try:
            end_date_obj = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
            # Füge einen Tag hinzu, damit das Ende des angegebenen Tages enthalten ist
            end_date_obj = end_date_obj + timedelta(days=1)
            query = query.filter(ActivityLog.timestamp <= end_date_obj)
        except ValueError:
            pass

    # Sortieren nach Zeitstempel absteigend (neueste zuerst)
    query = query.order_by(ActivityLog.timestamp.desc())

    # Gesamtzahl der Logs und Anzahl der Seiten berechnen
    total_logs = query.count()
    total_pages = (total_logs + per_page - 1) // per_page

    # Paginierung anwenden
    results = query.offset(offset).limit(per_page).all()

    logs = []
    for log, user in results:
        logs.append({
            "id": log.id,
            "user_id": log.user_id,
            "username": user.username,
            "action": log.action,
            "resource_type": log.resource_type,
            "resource_id": log.resource_id,
            "details": log.details,
            "ip_address": log.ip_address,
            "timestamp": log.timestamp
        })

    return {
        "logs": logs,
        "total_logs": total_logs,
        "total_pages": total_pages,
        "page": page
    }

@router.get("/export")
async def export_activity_logs(
    user: Optional[str] = None,
    action: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Exportiert Aktivitätsprotokolle als CSV (nur Admin)."""
    # Basisabfrage erstellen
    query = db.query(ActivityLog, User).join(User, ActivityLog.user_id == User.id)

    # Filter anwenden (gleich wie bei get_activity_logs)
    if user:
        query = query.filter(
            (User.username.ilike(f"%{user}%")) | (User.email.ilike(f"%{user}%"))
        )

    if action:
        query = query.filter(ActivityLog.action == action)

    if start_date:
        try:
            start_date_obj = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
            query = query.filter(ActivityLog.timestamp >= start_date_obj)
        except ValueError:
            pass

    if end_date:
        try:
            end_date_obj = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
            end_date_obj = end_date_obj + timedelta(days=1)
            query = query.filter(ActivityLog.timestamp <= end_date_obj)
        except ValueError:
            pass

    # Sortieren nach Zeitstempel absteigend
    query = query.order_by(ActivityLog.timestamp.desc())

    # Alle Ergebnisse abrufen
    results = query.all()

    # CSV-Datei erstellen
    output = StringIO()
    writer = csv.writer(output)

    # Header-Zeile schreiben
    writer.writerow([
        "ID", "Benutzer", "E-Mail", "Aktion", "Ressourcentyp",
        "Ressourcen-ID", "Details", "IP-Adresse", "Zeitstempel"
    ])

    # Datenzeilen schreiben
    for log, user in results:
        writer.writerow([
            log.id,
            user.username,
            user.email,
            log.action,
            log.resource_type or "",
            log.resource_id or "",
            log.details or "",
            log.ip_address or "",
            log.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        ])

    # CSV-Datei zurückgeben
    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=activity_logs_{datetime.now().strftime('%Y%m%d')}.csv"}
    )
