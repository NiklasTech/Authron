from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
import logging
from datetime import datetime

from backend.database.database import get_db
from backend.database.models import User, Password, UserSettings
from backend.security.dependencies import get_current_active_user
from backend.security.utils import get_password_hash
from backend.api.v1.schemas import AdminUserStats, AdminPasswordStats, AdminUserCreate, AdminUserResponse

router = APIRouter(prefix="/admin", tags=["admin"])
logger = logging.getLogger(__name__)

async def get_admin_user(current_user: User = Depends(get_current_active_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin-Rechte erforderlich"
        )
    return current_user


@router.get("/stats/users", response_model=AdminUserStats)
async def get_user_stats(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Gibt Statistiken über die registrierten Benutzer zurück."""
    total_users = db.query(func.count(User.id)).scalar()
    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar()
    admins = db.query(func.count(User.id)).filter(User.is_admin == True).scalar()

    return {
        "count": total_users,
        "active": active_users,
        "admins": admins
    }


@router.get("/stats/passwords", response_model=AdminPasswordStats)
async def get_password_stats(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Gibt Statistiken über die gespeicherten Passwörter zurück."""
    total_passwords = db.query(func.count(Password.id)).scalar()

    categories_count = db.query(func.count(func.distinct(Password.category))).scalar()

    top_categories = db.query(
        Password.category,
        func.count(Password.id).label('count')
    ).group_by(Password.category).order_by(func.count(Password.id).desc()).limit(5).all()

    avg_passwords_per_user = db.query(
        func.avg(
            db.query(func.count(Password.id))
            .filter(Password.user_id == User.id)
            .correlate(User)
            .scalar_subquery()
        )
    ).scalar() or 0

    return {
        "count": total_passwords,
        "categories_count": categories_count,
        "top_categories": [{"category": cat, "count": count} for cat, count in top_categories],
        "avg_per_user": round(float(avg_passwords_per_user), 2)
    }


@router.get("/users", response_model=list[AdminUserResponse])
async def get_all_users(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Gibt eine Liste aller Benutzer zurück (nur für Admins)."""
    users = db.query(User).all()

    result = []
    for user in users:
        password_count = db.query(func.count(Password.id)).filter(Password.user_id == user.id).scalar()
        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "is_active": user.is_active,
            "is_admin": user.is_admin,
            "created_at": user.created_at,
            "password_count": password_count
        }
        result.append(user_data)

    return result


@router.patch("/users/{user_id}/toggle-active", status_code=status.HTTP_200_OK)
async def toggle_user_active(
    user_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Ändert den Aktiv-Status eines Benutzers."""
    if user_id == admin_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Du kannst deinen eigenen Status nicht ändern"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Benutzer nicht gefunden"
        )

    user.is_active = not user.is_active
    user.updated_at = datetime.utcnow()
    db.commit()

    logger.info(f"Admin {admin_user.email} hat den Status von Benutzer {user.email} auf {user.is_active} geändert")
    return {"id": user.id, "is_active": user.is_active}


@router.patch("/users/{user_id}/toggle-admin", status_code=status.HTTP_200_OK)
async def toggle_user_admin(
    user_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Ändert den Admin-Status eines Benutzers."""
    if user_id == admin_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Du kannst deinen eigenen Admin-Status nicht ändern"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Benutzer nicht gefunden"
        )

    user.is_admin = not user.is_admin
    user.updated_at = datetime.utcnow()
    db.commit()

    logger.info(f"Admin {admin_user.email} hat den Admin-Status von Benutzer {user.email} auf {user.is_admin} geändert")
    return {"id": user.id, "is_admin": user.is_admin}


@router.post("/users", response_model=AdminUserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: AdminUserCreate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()

    if existing_user:
        if existing_user.email == user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="E-Mail-Adresse wird bereits verwendet"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Benutzername wird bereits verwendet"
            )

    hashed_password = get_password_hash(user_data.password)

    new_user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        is_active=True,
        is_admin=user_data.is_admin
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    settings = UserSettings(user_id=new_user.id)
    db.add(settings)
    db.commit()

    result = {
        "id": new_user.id,
        "username": new_user.username,
        "email": new_user.email,
        "full_name": new_user.full_name,
        "is_active": new_user.is_active,
        "is_admin": new_user.is_admin,
        "created_at": new_user.created_at,
        "password_count": 0
    }

    logger.info(f"Admin {admin_user.email} hat einen neuen Benutzer erstellt: {new_user.email}")
    return result


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Löscht einen Benutzer und alle seine Daten (nur für Admins)."""
    if user_id == admin_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Du kannst deinen eigenen Account nicht löschen"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Benutzer nicht gefunden"
        )

    db.delete(user)
    db.commit()

    logger.info(f"Admin {admin_user.email} hat den Benutzer {user.email} gelöscht")
    return None
