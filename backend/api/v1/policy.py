from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from backend.database.database import get_db
from backend.database.models import User, PasswordPolicy
from backend.security.dependencies import get_current_active_user, get_admin_user
from backend.api.v1.schemas import PasswordPolicyCreate, PasswordPolicyResponse

router = APIRouter(prefix="/policies", tags=["password policies"])

@router.get("", response_model=List[PasswordPolicyResponse])
async def get_all_policies(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Gibt alle Passwort-Richtlinien zurück."""
    policies = db.query(PasswordPolicy).all()
    return policies

@router.post("", response_model=PasswordPolicyResponse, status_code=status.HTTP_201_CREATED)
async def create_policy(
    policy_data: PasswordPolicyCreate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Erstellt eine neue Passwort-Richtlinie (nur Admin)."""
    existing_policy = db.query(PasswordPolicy).filter(PasswordPolicy.name == policy_data.name).first()
    if existing_policy:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Eine Richtlinie mit dem Namen '{policy_data.name}' existiert bereits"
        )

    policy = PasswordPolicy(
        name=policy_data.name,
        min_length=policy_data.min_length,
        require_uppercase=policy_data.require_uppercase,
        require_lowercase=policy_data.require_lowercase,
        require_numbers=policy_data.require_numbers,
        require_special=policy_data.require_special,
        max_age_days=policy_data.max_age_days
    )

    db.add(policy)
    db.commit()
    db.refresh(policy)

    return policy

@router.get("/{policy_id}", response_model=PasswordPolicyResponse)
async def get_policy(
    policy_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    policy = db.query(PasswordPolicy).filter(PasswordPolicy.id == policy_id).first()
    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Richtlinie nicht gefunden"
        )

    return policy

@router.put("/{policy_id}", response_model=PasswordPolicyResponse)
async def update_policy(
    policy_id: int,
    policy_data: PasswordPolicyCreate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    policy = db.query(PasswordPolicy).filter(PasswordPolicy.id == policy_id).first()
    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Richtlinie nicht gefunden"
        )

    if policy_data.name != policy.name:
        existing_policy = db.query(PasswordPolicy).filter(PasswordPolicy.name == policy_data.name).first()
        if existing_policy:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Eine Richtlinie mit dem Namen '{policy_data.name}' existiert bereits"
            )

    policy.name = policy_data.name
    policy.min_length = policy_data.min_length
    policy.require_uppercase = policy_data.require_uppercase
    policy.require_lowercase = policy_data.require_lowercase
    policy.require_numbers = policy_data.require_numbers
    policy.require_special = policy_data.require_special
    policy.max_age_days = policy_data.max_age_days
    policy.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(policy)

    return policy

@router.delete("/{policy_id}")
async def delete_policy(
    policy_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    policy = db.query(PasswordPolicy).filter(PasswordPolicy.id == policy_id).first()
    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Richtlinie nicht gefunden"
        )

    db.delete(policy)
    db.commit()

    return {"message": "Richtlinie erfolgreich gelöscht"}
