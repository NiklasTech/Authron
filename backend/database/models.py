from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from backend.database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    otp_secret = Column(String, nullable=True)
    otp_enabled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    passwords = relationship("Password", back_populates="owner", cascade="all, delete-orphan")
    settings = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    team_memberships = relationship("TeamMember", back_populates="user", cascade="all, delete-orphan")

class Password(Base):
    __tablename__ = "passwords"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    username = Column(String)
    email = Column(String)
    website = Column(String)
    encrypted_password = Column(String)
    category = Column(String, default="Other")
    notes = Column(String, nullable=True)
    favorite = Column(Boolean, default=False)
    totp_secret = Column(String, nullable=True)
    totp_enabled = Column(Boolean, default=False)
    last_used = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="passwords")


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    language = Column(String, default="de")
    auto_logout_time = Column(Integer, default=30)
    dark_mode = Column(Boolean, default=True)
    show_notifications = Column(Boolean, default=True)
    password_timeout = Column(Integer, default=10)
    enable_two_factor = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="settings")

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    members = relationship("TeamMember", back_populates="team", cascade="all, delete-orphan")
    shared_passwords = relationship("SharedPassword", back_populates="team", cascade="all, delete-orphan")


class TeamMember(Base):
    __tablename__ = "team_members"
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    role = Column(String, default="member")
    created_at = Column(DateTime, default=datetime.utcnow)
    team = relationship("Team", back_populates="members")
    user = relationship("User", back_populates="team_memberships")


class SharedPassword(Base):
    __tablename__ = "shared_passwords"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    username = Column(String)
    email = Column(String, nullable=True)
    website = Column(String, nullable=True)
    encrypted_password = Column(String)
    category = Column(String, default="Shared")
    notes = Column(String, nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id"))
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    team = relationship("Team", back_populates="shared_passwords")
    creator = relationship("User")

class SharedPasswordInvite(Base):
    __tablename__ = "shared_password_invites"

    id = Column(Integer, primary_key=True, index=True)
    password_id = Column(Integer, ForeignKey("passwords.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))
    recipient_email = Column(String, index=True)
    invite_token = Column(String, unique=True, index=True)
    status = Column(String, default="pending")
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    password = relationship("Password")
    sender = relationship("User")


class PasswordPolicy(Base):
    __tablename__ = "password_policies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    min_length = Column(Integer, default=12)
    require_uppercase = Column(Boolean, default=True)
    require_lowercase = Column(Boolean, default=True)
    require_numbers = Column(Boolean, default=True)
    require_special = Column(Boolean, default=True)
    max_age_days = Column(Integer, default=90)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String)
    resource_type = Column(String, nullable=True)
    resource_id = Column(Integer, nullable=True)
    details = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
