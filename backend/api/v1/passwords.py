from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
from datetime import datetime

from backend.database.database import get_db
from backend.database.models import Password, User
from backend.security.dependencies import get_current_active_user
from backend.security.utils import encrypt_password, decrypt_password
from backend.api.v1.schemas import PasswordCreate, PasswordResponse, PasswordWithSecret, PasswordFavoriteUpdate

router = APIRouter(prefix="/passwords", tags=["passwords"])
logger = logging.getLogger(__name__)

@router.post("", response_model=PasswordResponse, status_code=status.HTTP_201_CREATED)
async def create_password(
    password_data: PasswordCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
        encrypted_password = encrypt_password(password_data.password)

        db_password = Password(
            title=password_data.title,
            username=password_data.username,
            email=password_data.email,
            website=password_data.website,
            encrypted_password=encrypted_password,
            category=password_data.category,
            notes=password_data.notes,
            user_id=current_user.id,
            favorite=password_data.favorite
        )

        db.add(db_password)
        db.commit()
        db.refresh(db_password)

        logger.info(f"Passworteintrag für Benutzer {current_user.email} erstellt: {password_data.title}")
        return db_password
    except Exception as e:
        logger.error(f"Fehler beim Erstellen des Passworteintrags: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Fehler beim Erstellen des Passworteintrags"
        )

@router.get("", response_model=List[PasswordResponse])
async def get_all_passwords(
    category: Optional[str] = Query(None, description="Nach Kategorie filtern"),
    search: Optional[str] = Query(None, description="Suchbegriff für Titel/Benutzername/Website"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(Password).filter(Password.user_id == current_user.id)

    if category:
        query = query.filter(Password.category == category)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Password.title.ilike(search_term)) |
            (Password.username.ilike(search_term)) |
            (Password.email.ilike(search_term)) |
            (Password.website.ilike(search_term))
        )

    passwords = query.all()
    return passwords

@router.get("/{password_id}", response_model=PasswordResponse)
async def get_password(
    password_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Gibt einen bestimmten Passworteintrag zurück."""
    password = db.query(Password).filter(
        Password.id == password_id,
        Password.user_id == current_user.id
    ).first()

    if not password:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Passworteintrag nicht gefunden"
        )

    return password

@router.get("/{password_id}/decrypt", response_model=PasswordWithSecret)
async def get_decrypted_password(
    password_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Gibt einen Passworteintrag mit entschlüsseltem Passwort zurück."""
    try:
        password = db.query(Password).filter(
            Password.id == password_id,
            Password.user_id == current_user.id
        ).first()

        if not password:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Passworteintrag nicht gefunden"
            )

        result = {
            "id": password.id,
            "title": password.title,
            "username": password.username,
            "email": password.email,
            "website": password.website,
            "category": password.category,
            "notes": password.notes,
            "favorite": password.favorite,
            "last_used": password.last_used,
            "created_at": password.created_at,
            "updated_at": password.updated_at
        }

        try:
            decrypted_password = decrypt_password(password.encrypted_password)
            result["password"] = decrypted_password
        except Exception as e:
            logger.error(f"Fehler beim Entschlüsseln des Passworts: {str(e)}")
            result["password"] = "[Passwort kann nicht entschlüsselt werden]"

        password.last_used = datetime.utcnow()
        db.commit()

        return PasswordWithSecret(**result)
    except Exception as e:
        logger.error(f"Fehler beim Abrufen des entschlüsselten Passworts: {str(e)}")
        return PasswordWithSecret(
            id=password_id,
            title="Fehler",
            category="",
            password="[Fehler bei der Entschlüsselung]",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

@router.put("/{password_id}", response_model=PasswordResponse)
async def update_password(
    password_id: int,
    password_data: PasswordCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Aktualisiert einen bestehenden Passworteintrag."""
    password = db.query(Password).filter(
        Password.id == password_id,
        Password.user_id == current_user.id
    ).first()

    if not password:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Passworteintrag nicht gefunden"
        )

    password.title = password_data.title
    password.username = password_data.username
    password.email = password_data.email
    password.website = password_data.website

    if password_data.password:
        try:
            password.encrypted_password = encrypt_password(password_data.password)
        except Exception as e:
            logger.error(f"Fehler beim Verschlüsseln des Passworts: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Fehler beim Verschlüsseln des Passworts"
            )

    password.category = password_data.category
    password.notes = password_data.notes
    password.favorite = password_data.favorite
    password.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(password)

    logger.info(f"Passworteintrag für Benutzer {current_user.email} aktualisiert: {password.title}")
    return password

@router.delete("/{password_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_password(
    password_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    password = db.query(Password).filter(
        Password.id == password_id,
        Password.user_id == current_user.id
    ).first()

    if not password:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Passworteintrag nicht gefunden"
        )

    db.delete(password)
    db.commit()

    logger.info(f"Passworteintrag für Benutzer {current_user.email} gelöscht: {password.title}")
    return None

@router.post("/{password_id}/used", status_code=status.HTTP_200_OK)
async def mark_password_as_used(
    password_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Markiert einen Passworteintrag als verwendet."""
    password = db.query(Password).filter(
        Password.id == password_id,
        Password.user_id == current_user.id
    ).first()

    if not password:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Passworteintrag nicht gefunden"
        )

    password.last_used = datetime.utcnow()
    db.commit()

    return {"message": "Verwendungszeitstempel aktualisiert"}

@router.patch("/{password_id}/favorite", status_code=status.HTTP_200_OK)
async def toggle_favorite(
    password_id: int,
    data: PasswordFavoriteUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Setzt den Favoriten-Status eines Passworteintrags."""
    password = db.query(Password).filter(
        Password.id == password_id,
        Password.user_id == current_user.id
    ).first()

    if not password:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Passworteintrag nicht gefunden"
        )

    password.favorite = data.favorite
    db.commit()

    return {"message": "Favoriten-Status aktualisiert", "favorite": password.favorite}
