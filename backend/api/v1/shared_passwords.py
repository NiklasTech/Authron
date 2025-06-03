from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from backend.database.database import get_db
from backend.database.models import User, SharedPassword, Team, TeamMember
from backend.security.dependencies import get_current_active_user
from backend.security.utils import encrypt_password, decrypt_password
from backend.api.v1.schemas import SharedPasswordCreate, SharedPasswordResponse, SharedPasswordWithSecret

router = APIRouter(prefix="/shared/passwords", tags=["shared passwords"])

@router.get("", response_model=List[SharedPasswordResponse])
async def get_shared_passwords(
    team_id: int = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    user_teams = db.query(TeamMember.team_id).filter(TeamMember.user_id == current_user.id).all()
    team_ids = [team_id for (team_id,) in user_teams]

    if not team_ids:
        return []

    query = db.query(SharedPassword).filter(SharedPassword.team_id.in_(team_ids))
    if team_id:
        query = query.filter(SharedPassword.team_id == team_id)

    shared_passwords = query.all()

    result = []
    for password in shared_passwords:
        team = db.query(Team).filter(Team.id == password.team_id).first()
        creator = db.query(User).filter(User.id == password.created_by).first()

        result.append({
            "id": password.id,
            "title": password.title,
            "username": password.username,
            "email": password.email,
            "website": password.website,
            "category": password.category,
            "notes": password.notes,
            "team_id": password.team_id,
            "team_name": team.name if team else "Unbekanntes Team",
            "created_by": password.created_by,
            "creator_name": creator.username if creator else "Unbekannter Benutzer",
            "created_at": password.created_at,
            "updated_at": password.updated_at
        })

    return result

@router.post("", response_model=SharedPasswordResponse, status_code=status.HTTP_201_CREATED)
async def create_shared_password(
    password_data: SharedPasswordCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Erstellt ein neues geteiltes Passwort."""
    team_member = db.query(TeamMember).filter(
        TeamMember.team_id == password_data.team_id,
        TeamMember.user_id == current_user.id
    ).first()

    if not team_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Kein Zugriff auf dieses Team"
        )

    encrypted_password = encrypt_password(password_data.password)

    shared_password = SharedPassword(
        title=password_data.title,
        username=password_data.username,
        email=password_data.email,
        website=password_data.website,
        encrypted_password=encrypted_password,
        category=password_data.category,
        notes=password_data.notes,
        team_id=password_data.team_id,
        created_by=current_user.id
    )

    db.add(shared_password)
    db.commit()
    db.refresh(shared_password)

    team = db.query(Team).filter(Team.id == shared_password.team_id).first()

    return {
        "id": shared_password.id,
        "title": shared_password.title,
        "username": shared_password.username,
        "email": shared_password.email,
        "website": shared_password.website,
        "category": shared_password.category,
        "notes": shared_password.notes,
        "team_id": shared_password.team_id,
        "team_name": team.name if team else "Unbekanntes Team",
        "created_by": shared_password.created_by,
        "creator_name": current_user.username,
        "created_at": shared_password.created_at,
        "updated_at": shared_password.updated_at
    }

@router.get("/{password_id}", response_model=SharedPasswordResponse)
async def get_shared_password(
    password_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    user_teams = db.query(TeamMember.team_id).filter(TeamMember.user_id == current_user.id).all()
    team_ids = [team_id for (team_id,) in user_teams]

    password = db.query(SharedPassword).filter(
        SharedPassword.id == password_id,
        SharedPassword.team_id.in_(team_ids)
    ).first()

    if not password:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Passwort nicht gefunden oder kein Zugriff"
        )

    team = db.query(Team).filter(Team.id == password.team_id).first()
    creator = db.query(User).filter(User.id == password.created_by).first()

    return {
        "id": password.id,
        "title": password.title,
        "username": password.username,
        "email": password.email,
        "website": password.website,
        "category": password.category,
        "notes": password.notes,
        "team_id": password.team_id,
        "team_name": team.name if team else "Unbekanntes Team",
        "created_by": password.created_by,
        "creator_name": creator.username if creator else "Unbekannter Benutzer",
        "created_at": password.created_at,
        "updated_at": password.updated_at
    }

@router.get("/{password_id}/decrypt", response_model=SharedPasswordWithSecret)
async def get_shared_password_with_secret(
    password_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    user_teams = db.query(TeamMember.team_id).filter(TeamMember.user_id == current_user.id).all()
    team_ids = [team_id for (team_id,) in user_teams]

    password = db.query(SharedPassword).filter(
        SharedPassword.id == password_id,
        SharedPassword.team_id.in_(team_ids)
    ).first()

    if not password:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Passwort nicht gefunden oder kein Zugriff"
        )

    team = db.query(Team).filter(Team.id == password.team_id).first()
    creator = db.query(User).filter(User.id == password.created_by).first()

    decrypted_password = decrypt_password(password.encrypted_password)

    password.last_used = datetime.utcnow()
    db.commit()

    return {
        "id": password.id,
        "title": password.title,
        "username": password.username,
        "email": password.email,
        "website": password.website,
        "category": password.category,
        "notes": password.notes,
        "team_id": password.team_id,
        "team_name": team.name if team else "Unbekanntes Team",
        "created_by": password.created_by,
        "creator_name": creator.username if creator else "Unbekannter Benutzer",
        "created_at": password.created_at,
        "updated_at": password.updated_at,
        "password": decrypted_password
    }

@router.put("/{password_id}", response_model=SharedPasswordResponse)
async def update_shared_password(
    password_id: int,
    password_data: SharedPasswordCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    user_teams = db.query(TeamMember.team_id).filter(TeamMember.user_id == current_user.id).all()
    team_ids = [team_id for (team_id,) in user_teams]

    password = db.query(SharedPassword).filter(
        SharedPassword.id == password_id,
        SharedPassword.team_id.in_(team_ids)
    ).first()

    if not password:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Passwort nicht gefunden oder kein Zugriff"
        )

    password.title = password_data.title
    password.username = password_data.username
    password.email = password_data.email
    password.website = password_data.website
    password.category = password_data.category
    password.notes = password_data.notes

    if password_data.password:
        password.encrypted_password = encrypt_password(password_data.password)

    password.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(password)

    team = db.query(Team).filter(Team.id == password.team_id).first()
    creator = db.query(User).filter(User.id == password.created_by).first()

    return {
        "id": password.id,
        "title": password.title,
        "username": password.username,
        "email": password.email,
        "website": password.website,
        "category": password.category,
        "notes": password.notes,
        "team_id": password.team_id,
        "team_name": team.name if team else "Unbekanntes Team",
        "created_by": password.created_by,
        "creator_name": creator.username if creator else "Unbekannter Benutzer",
        "created_at": password.created_at,
        "updated_at": password.updated_at
    }

@router.delete("/{password_id}")
async def delete_shared_password(
    password_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    user_teams = db.query(TeamMember).filter(TeamMember.user_id == current_user.id).all()
    team_ids = [team_id for (team_id,) in user_teams]

    password = db.query(SharedPassword).filter(
        SharedPassword.id == password_id,
        SharedPassword.team_id.in_(team_ids)
    ).first()

    if not password:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Passwort nicht gefunden oder kein Zugriff"
        )

    db.delete(password)
    db.commit()

    return {"message": "Passwort erfolgreich gelöscht"}

@router.post("/{password_id}/used")
async def mark_password_as_used(
    password_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    user_teams = db.query(TeamMember.team_id).filter(TeamMember.user_id == current_user.id).all()
    team_ids = [team_id for (team_id,) in user_teams]

    password = db.query(SharedPassword).filter(
        SharedPassword.id == password_id,
        SharedPassword.team_id.in_(team_ids)
    ).first()

    if not password:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Passwort nicht gefunden oder kein Zugriff"
        )

    password.last_used = datetime.utcnow()
    db.commit()

    return {"message": "Verwendungszeitstempel aktualisiert"}
