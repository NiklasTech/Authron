from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse
import json
import csv
import io
from datetime import datetime
from typing import List

from backend.database.database import get_db
from backend.database.models import User, Password
from backend.security.dependencies import get_current_active_user
from backend.security.utils import encrypt_password, decrypt_password
from backend.api.v1.schemas import PasswordCreate

router = APIRouter(prefix="/export-import", tags=["export-import"])

@router.get("/export/{format}")
async def export_passwords(
    format: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if format not in ["json", "csv"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format muss 'json' oder 'csv' sein"
        )

    passwords = db.query(Password).filter(Password.user_id == current_user.id).all()

    if format == "json":
        export_data = []
        for password in passwords:
            decrypted_password = decrypt_password(password.encrypted_password)
            export_data.append({
                "title": password.title,
                "username": password.username,
                "email": password.email,
                "password": decrypted_password,
                "website": password.website,
                "category": password.category,
                "notes": password.notes,
                "favorite": password.favorite,
                "totp_secret": decrypt_password(password.totp_secret) if password.totp_secret else None,
                "totp_enabled": password.totp_enabled
            })

        json_data = json.dumps(export_data, indent=2, ensure_ascii=False)

        return StreamingResponse(
            io.StringIO(json_data),
            media_type="application/json",
            headers={
                "Content-Disposition": f"attachment; filename=passwords_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            }
        )

    else:
        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow([
            "Titel", "Benutzername", "E-Mail", "Passwort", "Webseite",
            "Kategorie", "Notizen", "Favorit", "TOTP Secret", "TOTP Aktiviert"
        ])

        for password in passwords:
            decrypted_password = decrypt_password(password.encrypted_password)
            totp_secret = decrypt_password(password.totp_secret) if password.totp_secret else ""

            writer.writerow([
                password.title,
                password.username or "",
                password.email or "",
                decrypted_password,
                password.website or "",
                password.category,
                password.notes or "",
                "Ja" if password.favorite else "Nein",
                totp_secret,
                "Ja" if password.totp_enabled else "Nein"
            ])

        output.seek(0)

        return StreamingResponse(
            io.StringIO(output.getvalue()),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=passwords_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            }
        )

@router.post("/import")
async def import_passwords(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(('.json', '.csv')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nur JSON- und CSV-Dateien werden unterstützt"
        )

    content = await file.read()

    try:
        imported_count = 0
        skipped_count = 0

        if file.filename.endswith('.json'):
            data = json.loads(content.decode('utf-8'))

            for item in data:
                existing = db.query(Password).filter(
                    Password.user_id == current_user.id,
                    Password.title == item.get("title"),
                    Password.username == item.get("username")
                ).first()

                if existing:
                    skipped_count += 1
                    continue

                encrypted_password = encrypt_password(item.get("password", ""))
                encrypted_totp = encrypt_password(item.get("totp_secret", "")) if item.get("totp_secret") else None

                new_password = Password(
                    title=item.get("title"),
                    username=item.get("username"),
                    email=item.get("email"),
                    website=item.get("website"),
                    encrypted_password=encrypted_password,
                    category=item.get("category", "Importiert"),
                    notes=item.get("notes"),
                    favorite=item.get("favorite", False),
                    totp_secret=encrypted_totp,
                    totp_enabled=item.get("totp_enabled", False),
                    user_id=current_user.id
                )

                db.add(new_password)
                imported_count += 1

        else:
            content_str = content.decode('utf-8')
            csv_reader = csv.DictReader(io.StringIO(content_str))

            for row in csv_reader:
                existing = db.query(Password).filter(
                    Password.user_id == current_user.id,
                    Password.title == row.get("Titel"),
                    Password.username == row.get("Benutzername")
                ).first()

                if existing:
                    skipped_count += 1
                    continue

                encrypted_password = encrypt_password(row.get("Passwort", ""))
                encrypted_totp = encrypt_password(row.get("TOTP Secret", "")) if row.get("TOTP Secret") else None

                new_password = Password(
                    title=row.get("Titel"),
                    username=row.get("Benutzername"),
                    email=row.get("E-Mail"),
                    website=row.get("Webseite"),
                    encrypted_password=encrypted_password,
                    category=row.get("Kategorie", "Importiert"),
                    notes=row.get("Notizen"),
                    favorite=row.get("Favorit") == "Ja",
                    totp_secret=encrypted_totp,
                    totp_enabled=row.get("TOTP Aktiviert") == "Ja",
                    user_id=current_user.id
                )

                db.add(new_password)
                imported_count += 1

        db.commit()

        return {
            "message": f"Import erfolgreich abgeschlossen",
            "imported": imported_count,
            "skipped": skipped_count
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fehler beim Importieren: {str(e)}"
        )
