from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
import logging

from backend.database.database import get_db
from backend.database.models import User, UserSettings
from backend.security.dependencies import get_current_active_user
from backend.api.v1.schemas import UserSettingsCreate, UserSettingsResponse

router = APIRouter(prefix="/users", tags=["user settings"])
logger = logging.getLogger(__name__)

@router.get("/settings", response_model=UserSettingsResponse)
async def get_user_settings(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()

    if not settings:
        settings = UserSettings(
            user_id=current_user.id,
            language="de",
            auto_logout_time=30,
            dark_mode=True,
            show_notifications=True,
            password_timeout=10,
            enable_two_factor=False
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return settings

@router.put("/settings", response_model=UserSettingsResponse)
async def update_user_settings(
    settings_data: UserSettingsCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()

    if not db_settings:
        db_settings = UserSettings(user_id=current_user.id)
        db.add(db_settings)

    update_data = settings_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_settings, key, value)

    db_settings.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_settings)

    logger.info(f"Benutzereinstellungen aktualisiert für: {current_user.email}")
    return db_settings
