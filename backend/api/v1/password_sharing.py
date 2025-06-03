from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from pydantic import BaseModel
from typing import List

from backend.database.database import get_db
from backend.database.models import User, Password, SharedPasswordInvite
from backend.security.dependencies import get_current_active_user

router = APIRouter(prefix="/password-sharing", tags=["password sharing"])

class SharePasswordRequest(BaseModel):
    password_id: int
    recipient_email: str

class PendingShareResponse(BaseModel):
    id: int
    password_title: str
    sender_email: str
    created_at: datetime
    invite_token: str

def send_share_email(recipient_email: str, sender_email: str, password_title: str, invite_token: str):
    """Sendet die E-Mail für geteilte Passwörter"""
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")

    if not smtp_username or not smtp_password:
        print("E-Mail-Konfiguration fehlt - E-Mail wird nicht gesendet")
        return

    subject = f"Passwort-Freigabe: {password_title}"
    body = f"""
    Hallo,

    {sender_email} hat ein Passwort mit Ihnen geteilt: "{password_title}"

    Um das geteilte Passwort zu akzeptieren, melden Sie sich bitte in Ihrem Authron-Konto an.

    Nach der Anmeldung sehen Sie die ausstehende Freigabe und können diese annehmen oder ablehnen.

    Diese Einladung läuft in 7 Tagen ab.

    Mit freundlichen Grüßen,
    Ihr Authron-Team
    """

    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_username
        msg['To'] = recipient_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.send_message(msg)
        server.quit()

        print(f"E-Mail erfolgreich an {recipient_email} gesendet")
    except Exception as e:
        print(f"Fehler beim Senden der E-Mail: {str(e)}")

@router.post("/share")
async def share_password(
    request: SharePasswordRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Teilt ein Passwort mit einem anderen Benutzer per E-Mail"""
    password = db.query(Password).filter(
        Password.id == request.password_id,
        Password.user_id == current_user.id
    ).first()

    if not password:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Passwort nicht gefunden"
        )

    invite_token = secrets.token_urlsafe(32)

    invite = SharedPasswordInvite(
        password_id=request.password_id,
        sender_id=current_user.id,
        recipient_email=request.recipient_email,
        invite_token=invite_token,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )

    db.add(invite)
    db.commit()

    send_share_email(request.recipient_email, current_user.email, password.title, invite_token)

    return {"message": "Passwort erfolgreich geteilt"}

@router.get("/pending", response_model=List[PendingShareResponse])
async def get_pending_shares(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Zeigt alle ausstehenden geteilten Passwörter für den User"""
    invites = db.query(SharedPasswordInvite).join(
        Password, SharedPasswordInvite.password_id == Password.id
    ).join(
        User, SharedPasswordInvite.sender_id == User.id
    ).filter(
        SharedPasswordInvite.recipient_email == current_user.email,
        SharedPasswordInvite.status == "pending",
        SharedPasswordInvite.expires_at > datetime.utcnow()
    ).all()

    return [
        PendingShareResponse(
            id=invite.id,
            password_title=invite.password.title,
            sender_email=invite.sender.email,
            created_at=invite.created_at,
            invite_token=invite.invite_token
        )
        for invite in invites
    ]

@router.post("/accept/{invite_token}")
async def accept_share(
    invite_token: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Akzeptiert ein geteiltes Passwort"""
    invite = db.query(SharedPasswordInvite).filter(
        SharedPasswordInvite.invite_token == invite_token,
        SharedPasswordInvite.recipient_email == current_user.email,
        SharedPasswordInvite.status == "pending"
    ).first()

    if not invite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Einladung nicht gefunden"
        )

    if invite.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Diese Einladung ist abgelaufen"
        )

    original_password = invite.password

    new_password = Password(
        title=f"{original_password.title} (geteilt von {invite.sender.email})",
        username=original_password.username,
        email=original_password.email,
        website=original_password.website,
        encrypted_password=original_password.encrypted_password,
        category="Geteilt",
        notes=f"Geteilt von {invite.sender.email} am {datetime.utcnow().strftime('%d.%m.%Y')}",
        user_id=current_user.id
    )

    invite.status = "accepted"
    db.add(new_password)
    db.commit()

    return {"message": "Passwort erfolgreich akzeptiert"}

@router.post("/reject/{invite_token}")
async def reject_share(
    invite_token: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lehnt ein geteiltes Passwort ab"""
    invite = db.query(SharedPasswordInvite).filter(
        SharedPasswordInvite.invite_token == invite_token,
        SharedPasswordInvite.recipient_email == current_user.email,
        SharedPasswordInvite.status == "pending"
    ).first()

    if not invite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Einladung nicht gefunden"
        )

    invite.status = "rejected"
    db.commit()

    return {"message": "Einladung abgelehnt"}

@router.get("/stats")
async def get_sharing_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Gibt Statistiken über geteilte Passwörter zurück"""
    sent_count = db.query(SharedPasswordInvite).filter(
        SharedPasswordInvite.sender_id == current_user.id
    ).count()

    received_count = db.query(SharedPasswordInvite).filter(
        SharedPasswordInvite.recipient_email == current_user.email,
        SharedPasswordInvite.status == "accepted"
    ).count()

    pending_count = db.query(SharedPasswordInvite).filter(
        SharedPasswordInvite.recipient_email == current_user.email,
        SharedPasswordInvite.status == "pending",
        SharedPasswordInvite.expires_at > datetime.utcnow()
    ).count()

    return {
        "sent": sent_count,
        "received": received_count,
        "pending": pending_count
    }
