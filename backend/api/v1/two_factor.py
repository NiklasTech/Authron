from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.models import User
from backend.security.dependencies import get_current_active_user
from backend.security.utils import verify_password
from backend.security.otp import setup_2fa, verify_totp
from pydantic import BaseModel

router = APIRouter(prefix="/auth/2fa", tags=["2fa"])


class OTPVerifyRequest(BaseModel):
    otp_code: str


class Disable2FARequest(BaseModel):
    password: str


@router.post("/setup", status_code=status.HTTP_200_OK)
async def setup_two_factor(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if current_user.otp_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Zwei-Faktor-Authentifizierung ist bereits aktiviert"
        )

    setup_data = setup_2fa(current_user.email)

    current_user.otp_secret = setup_data["secret"]
    db.commit()

    return {
        "secret": setup_data["secret"],
        "qr_code": setup_data["qr_code"]
    }


@router.post("/verify", status_code=status.HTTP_200_OK)
async def verify_two_factor(
    request: OTPVerifyRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Verifiziert und aktiviert die Zwei-Faktor-Authentifizierung."""
    if not current_user.otp_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA wurde noch nicht eingerichtet"
        )

    if verify_totp(current_user.otp_secret, request.otp_code):
        current_user.otp_enabled = True
        db.commit()
        return {"success": True, "message": "2FA erfolgreich aktiviert"}

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Ungültiger OTP-Code"
    )


@router.post("/disable", status_code=status.HTTP_200_OK)
async def disable_two_factor(
    request: Disable2FARequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Deaktiviert die Zwei-Faktor-Authentifizierung."""
    if not current_user.otp_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA ist nicht aktiviert"
        )

    if not verify_password(request.password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Falsches Passwort"
        )

    current_user.otp_enabled = False
    current_user.otp_secret = None
    db.commit()

    return {"success": True, "message": "2FA erfolgreich deaktiviert"}
