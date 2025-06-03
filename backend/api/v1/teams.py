from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from backend.database.database import get_db
from backend.database.models import User, Team, TeamMember
from backend.security.dependencies import get_current_active_user
from backend.api.v1.schemas import TeamCreate, TeamUpdate, TeamResponse, TeamMemberCreate, TeamMemberResponse

router = APIRouter(prefix="/teams", tags=["teams"])

@router.get("", response_model=List[TeamResponse])
async def get_teams(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    user_team_ids = db.query(TeamMember.team_id).filter(TeamMember.user_id == current_user.id).all()
    team_ids = [team_id for (team_id,) in user_team_ids]

    teams = []
    for team_id in team_ids:
        team = db.query(Team).filter(Team.id == team_id).first()
        if team:
            member_count = db.query(TeamMember).filter(TeamMember.team_id == team.id).count()
            team_dict = {
                "id": team.id,
                "name": team.name,
                "description": team.description,
                "created_at": team.created_at,
                "member_count": member_count
            }
            teams.append(team_dict)

    return teams

@router.post("", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
async def create_team(
    team_data: TeamCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    team = Team(
        name=team_data.name,
        description=team_data.description
    )

    db.add(team)
    db.commit()
    db.refresh(team)

    team_member = TeamMember(
        team_id=team.id,
        user_id=current_user.id,
        role="admin"
    )

    db.add(team_member)
    db.commit()

    return {
        "id": team.id,
        "name": team.name,
        "description": team.description,
        "created_at": team.created_at,
        "member_count": 1
    }

@router.get("/{team_id}", response_model=TeamResponse)
async def get_team(
    team_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == current_user.id
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Kein Zugriff auf dieses Team"
        )

    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team nicht gefunden"
        )

    member_count = db.query(TeamMember).filter(TeamMember.team_id == team.id).count()

    return {
        "id": team.id,
        "name": team.name,
        "description": team.description,
        "created_at": team.created_at,
        "member_count": member_count
    }

@router.put("/{team_id}", response_model=TeamResponse)
async def update_team(
    team_id: int,
    team_data: TeamUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == current_user.id,
        TeamMember.role == "admin"
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nur Team-Administratoren können Teams bearbeiten"
        )

    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team nicht gefunden"
        )

    if team_data.name is not None:
        team.name = team_data.name
    if team_data.description is not None:
        team.description = team_data.description

    db.commit()
    db.refresh(team)

    member_count = db.query(TeamMember).filter(TeamMember.team_id == team.id).count()

    return {
        "id": team.id,
        "name": team.name,
        "description": team.description,
        "created_at": team.created_at,
        "member_count": member_count
    }

@router.delete("/{team_id}")
async def delete_team(
    team_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == current_user.id,
        TeamMember.role == "admin"
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nur Team-Administratoren können Teams löschen"
        )

    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team nicht gefunden"
        )

    db.delete(team)
    db.commit()

    return {"message": "Team erfolgreich gelöscht"}

@router.get("/{team_id}/members", response_model=List[TeamMemberResponse])
async def get_team_members(
    team_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    user_member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == current_user.id
    ).first()

    if not user_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Kein Zugriff auf dieses Team"
        )

    members = db.query(TeamMember, User).join(
        User, TeamMember.user_id == User.id
    ).filter(
        TeamMember.team_id == team_id
    ).all()

    result = []
    for member, user in members:
        result.append({
            "id": member.id,
            "user_id": user.id,
            "username": user.username,
            "email": user.email,
            "role": member.role
        })

    return result

@router.post("/{team_id}/members", response_model=TeamMemberResponse)
async def add_team_member(
    team_id: int,
    member_data: TeamMemberCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    admin_member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == current_user.id,
        TeamMember.role == "admin"
    ).first()

    if not admin_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nur Team-Administratoren können Mitglieder hinzufügen"
        )

    existing_member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == member_data.user_id
    ).first()

    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Der Benutzer ist bereits Mitglied dieses Teams"
        )

    user = db.query(User).filter(User.id == member_data.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Benutzer nicht gefunden"
        )

    team_member = TeamMember(
        team_id=team_id,
        user_id=member_data.user_id,
        role=member_data.role
    )

    db.add(team_member)
    db.commit()
    db.refresh(team_member)

    return {
        "id": team_member.id,
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "role": team_member.role
    }

@router.delete("/{team_id}/members/{member_id}")
async def remove_team_member(
    team_id: int,
    member_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    admin_member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == current_user.id,
        TeamMember.role == "admin"
    ).first()

    if not admin_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nur Team-Administratoren können Mitglieder entfernen"
        )

    if admin_member.id == member_id:
        admin_count = db.query(TeamMember).filter(
            TeamMember.team_id == team_id,
            TeamMember.role == "admin"
        ).count()

        if admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Es muss mindestens ein Administrator im Team bleiben"
            )

    member = db.query(TeamMember).filter(
        TeamMember.id == member_id,
        TeamMember.team_id == team_id
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teammitglied nicht gefunden"
        )

    db.delete(member)
    db.commit()

    return {"message": "Teammitglied erfolgreich entfernt"}
