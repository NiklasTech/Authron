from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[int] = None


class UserBase(BaseModel):
    email: EmailStr
    username: str


class UserCreate(UserBase):
    password: str
    full_name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    otp_code: Optional[str] = None



class PasswordChange(BaseModel):
    old_password: str
    new_password: str


class UserResponse(UserBase):
    id: int
    full_name: str
    is_active: bool
    is_admin: bool = False
    otp_enabled: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class PasswordReset(BaseModel):
    email: EmailStr


class PasswordCreate(BaseModel):
    title: str
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    password: str
    category: str = "Allgemein"
    notes: Optional[str] = None
    favorite: bool = False


class PasswordResponse(BaseModel):
    id: int
    title: str
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    category: str
    notes: Optional[str] = None
    favorite: bool = False
    totp_enabled: bool = False
    last_used: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PasswordWithSecret(PasswordResponse):
    password: str = ""
    totp_secret: Optional[str] = None

    class Config:
        from_attributes = True


class PasswordFavoriteUpdate(BaseModel):
    favorite: bool


class UserSettingsBase(BaseModel):
    language: Optional[str] = None
    auto_logout_time: Optional[int] = None
    dark_mode: Optional[bool] = None
    show_notifications: Optional[bool] = None
    password_timeout: Optional[int] = None
    enable_two_factor: Optional[bool] = None


class UserSettingsCreate(UserSettingsBase):
    pass


class UserSettingsResponse(UserSettingsBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CategoryCount(BaseModel):
    category: str
    count: int


class AdminUserStats(BaseModel):
    count: int
    active: int
    admins: int


class AdminPasswordStats(BaseModel):
    count: int
    categories_count: int
    top_categories: List[CategoryCount]
    avg_per_user: float


class AdminUserCreate(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    password: str
    is_admin: bool = False


class AdminUserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    full_name: str
    is_active: bool
    is_admin: bool
    created_at: datetime
    password_count: int

    class Config:
        from_attributes = True

class TeamCreate(BaseModel):
    name: str
    description: Optional[str] = None

class TeamUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class TeamResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    created_at: datetime
    member_count: int

    class Config:
        from_attributes = True

class TeamMemberCreate(BaseModel):
    user_id: int
    role: str = "member"

class TeamMemberResponse(BaseModel):
    id: int
    user_id: int
    username: str
    email: str
    role: str


class SharedPasswordCreate(BaseModel):
    title: str
    username: str
    password: str
    email: Optional[str] = None
    website: Optional[str] = None
    category: str = "Shared"
    notes: Optional[str] = None
    team_id: int

class SharedPasswordResponse(BaseModel):
    id: int
    title: str
    username: str
    email: Optional[str] = None
    website: Optional[str] = None
    category: str
    notes: Optional[str] = None
    team_id: int
    team_name: str
    created_by: int
    creator_name: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SharedPasswordWithSecret(SharedPasswordResponse):
    password: str

    class Config:
        from_attributes = True

class PasswordPolicyCreate(BaseModel):
    name: str
    min_length: int = 12
    require_uppercase: bool = True
    require_lowercase: bool = True
    require_numbers: bool = True
    require_special: bool = True
    max_age_days: int = 90

class PasswordPolicyResponse(PasswordPolicyCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ActivityLogFilter(BaseModel):
    user: Optional[str] = None
    action: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class ActivityLogResponse(BaseModel):
    id: int
    user_id: int
    username: str
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[int] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class ActivityLogsResponse(BaseModel):
    logs: List[ActivityLogResponse]
    total_logs: int
    total_pages: int
    page: int
