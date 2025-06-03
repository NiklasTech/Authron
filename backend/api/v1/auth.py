from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
import logging
from jose import JWTError, jwt
from typing import Dict, Any, Optional

from backend.database.database import get_db
from backend.database.models import User
from backend.security.utils import (
    verify_password,
    get_password_hash,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    SECRET_KEY,
    ALGORITHM
)
from backend.security.dependencies import get_current_active_user, get_current_user
from backend.api.v1.schemas import UserCreate, UserLogin, UserResponse, Token, PasswordReset, PasswordChange
from backend.security.otp import verify_totp

router = APIRouter(prefix="/auth", tags=["authentication"])
logger = logging.getLogger(__name__)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    db_user_by_email = db.query(User).filter(User.email == user_data.email).first()
    if db_user_by_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    db_user_by_username = db.query(User).filter(User.username == user_data.username).first()
    if db_user_by_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    hashed_password = get_password_hash(user_data.password)

    db_user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=hashed_password
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    logger.info(f"New user registered: {user_data.email}")
    return db_user


@router.post("/token", response_model=Dict[str, Any])
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Generate a new JWT token on successful login."""
    user = db.query(User).filter(
        (User.email == form_data.username) | (User.username == form_data.username)
    ).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )

    if user.otp_enabled:
        otp_code = getattr(form_data, "password2", None)

        if not otp_code:
            temp_token_expires = timedelta(minutes=5)
            temp_token = create_access_token(
                data={"sub": str(user.id), "temp": True, "requires_2fa": True},
                expires_delta=temp_token_expires
            )
            return {
                "access_token": temp_token,
                "token_type": "bearer",
                "requires_2fa": True
            }

        if not verify_totp(user.otp_secret, otp_code):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Ungültiger 2FA-Code",
                headers={"WWW-Authenticate": "Bearer"},
            )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )

    logger.info(f"User logged in: {user.email}")
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login", response_model=Dict[str, Any])
async def login(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):
    """Login mit E-Mail und Passwort."""
    user = db.query(User).filter(User.email == user_data.email).first()

    if not user or not verify_password(user_data.password, user.hashed_password):
        return {
            "success": False,
            "detail": "Incorrect email or password"
        }

    if not user.is_active:
        return {
            "success": False,
            "detail": "Inactive user"
        }

    if user.otp_enabled and not user_data.otp_code:
        return {
            "success": True,
            "requires_2fa": True,
            "message": "2FA-Code erforderlich"
        }

    if user.otp_enabled and user_data.otp_code:
        if not verify_totp(user.otp_secret, user_data.otp_code):
            return {
                "success": False,
                "detail": "Ungültiger 2FA-Code"
            }

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )

    return {
        "success": True,
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/reset-password", status_code=status.HTTP_202_ACCEPTED)
async def request_password_reset(reset_data: PasswordReset, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == reset_data.email).first()

    logger.info(f"Password reset requested for: {reset_data.email}")

    return {"message": "If the email is registered, a password reset link will be sent"}


@router.post("/change-password", status_code=status.HTTP_200_OK)
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if not verify_password(password_data.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Aktuelles Passwort ist nicht korrekt"
        )

    if len(password_data.new_password) < 12:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The new password must be at least 12 characters long"
        )

    has_lowercase = any(c.islower() for c in password_data.new_password)
    has_uppercase = any(c.isupper() for c in password_data.new_password)
    has_digit = any(c.isdigit() for c in password_data.new_password)
    has_special = any(not c.isalnum() for c in password_data.new_password)

    if not (has_lowercase and has_uppercase and has_digit and has_special):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The new password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character"
        )

    current_user.hashed_password = get_password_hash(password_data.new_password)
    current_user.updated_at = datetime.utcnow()
    db.commit()

    logger.info(f"Password changed for user: {current_user.email}")
    return {"message": "Password changed successfully"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get information about the currently authenticated user."""
    return current_user


@router.get("/me/basic", response_model=Dict[str, Any])
async def get_current_user_basic_info(request: Request, current_user: User = Depends(get_current_user)):
    token = get_jwt_token_from_request(request)
    payload = decode_jwt(token)

    if payload.get("temp", False) and payload.get("requires_2fa", False):
        return {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "requires_2fa": True,
            "is_active": current_user.is_active,
            "otp_enabled": current_user.otp_enabled
        }

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid token",
    )


def get_jwt_token_from_request(request: Request) -> str:
    authorization = request.headers.get("Authorization", "")
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header missing or invalid")
    return authorization.replace("Bearer ", "")

def decode_jwt(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
