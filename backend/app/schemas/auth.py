"""Schemas for the mock Microsoft Entra ID login flow."""
from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class UserProfile(BaseModel):
    id: str
    username: str
    display_name: str
    role: str  # Agent | Supervisor | Admin
    email: str
    avatar_initials: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile
