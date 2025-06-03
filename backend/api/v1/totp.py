from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import Dict, Any
import pyotp
import base64
from datetime import datetime

from backend.database.database import get_db
from backend.database.models import Password, User
from backend.security.dependencies import get_current_active_user
from backend.security.utils import decrypt_password, encrypt_password

router = APIRouter(prefix="/totp", tags=["totp"])

@router.post("/{password_id}/setup", response_model=Dict[str, Any])
async def setup_totp(
    password_id: int,
    totp_secret: str = Body(..., embed=True),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Speichert einen TOTP-Secret für einen Passwort-Eintrag."""
    password_entry = db.query(Password).filter(
        Password.id == password_id,
        Password.user_id == current_user.id
    ).first()

    if not password_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Passwort-Eintrag nicht gefunden"
        )

    try:
        clean_secret = totp_secret.replace(" ", "").upper()
        pyotp.TOTP(clean_secret).now()

        password_entry.totp_secret = encrypt_password(clean_secret)
        password_entry.totp_enabled = True
        password_entry.updated_at = datetime.utcnow()
        db.commit()

        return {
            "success": True,
            "message": "TOTP-Secret erfolgreich gespeichert"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ungültiger TOTP-Secret: {str(e)}"
        )

@router.get("/{password_id}/code")
async def get_totp_code(
    password_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    password_entry = db.query(Password).filter(
        Password.id == password_id,
        Password.user_id == current_user.id
    ).first()

    if not password_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Passwort-Eintrag nicht gefunden"
        )

    if not password_entry.totp_secret or not password_entry.totp_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="TOTP ist für diesen Eintrag nicht aktiviert"
        )

    try:
        decrypted_secret = decrypt_password(password_entry.totp_secret)

        if not decrypted_secret:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="TOTP-Secret konnte nicht entschlüsselt werden"
            )

        decrypted_secret = decrypted_secret.replace(" ", "").upper()

        totp = pyotp.TOTP(decrypted_secret)
        current_code = totp.now()

        timestamp = datetime.now().timestamp()
        remaining_seconds = totp.interval - (timestamp % totp.interval)

        password_entry.last_used = datetime.utcnow()
        db.commit()

        return {
            "code": current_code,
            "remaining_seconds": int(remaining_seconds),
            "interval": totp.interval
        }
    except pyotp.utils.Base32Error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ungültiger TOTP-Secret (kein gültiger Base32-String)"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fehler bei der TOTP-Code-Generierung: {str(e)}"
        )

@router.delete("/{password_id}/disable")
async def disable_totp(
    password_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    password_entry = db.query(Password).filter(
        Password.id == password_id,
        Password.user_id == current_user.id
    ).first()

    if not password_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Passwort-Eintrag nicht gefunden"
        )

    if not password_entry.totp_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="TOTP ist für diesen Eintrag nicht aktiviert"
        )

    password_entry.totp_enabled = False
    password_entry.totp_secret = None
    password_entry.updated_at = datetime.utcnow()
    db.commit()

    return {"message": "TOTP erfolgreich deaktiviert"}

@router.get("/{password_id}/secret")
async def get_totp_secret(
    password_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Gibt den gespeicherten TOTP-Secret zurück (für Anzeige/Bearbeitung)."""
    password_entry = db.query(Password).filter(
        Password.id == password_id,
        Password.user_id == current_user.id
    ).first()

    if not password_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Passwort-Eintrag nicht gefunden"
        )

    if not password_entry.totp_secret or not password_entry.totp_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="TOTP ist für diesen Eintrag nicht aktiviert"
        )

    try:
        decrypted_secret = decrypt_password(password_entry.totp_secret)

        if not decrypted_secret:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="TOTP-Secret konnte nicht entschlüsselt werden"
            )

        return {
            "secret": decrypted_secret
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fehler beim Abrufen des TOTP-Secrets: {str(e)}"
        )
