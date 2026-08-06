"""Mock Microsoft Entra ID authentication.

Simulates an enterprise SSO login flow with a fixed set of demo personas
(Agent, Supervisor, Admin) so the app can demonstrate role-based access
without standing up a real Entra ID tenant. Tokens are opaque demo strings,
not real JWTs — this is explicitly a mock, documented as such in the README.
"""
import base64
import json
import uuid

from fastapi import APIRouter, HTTPException

from app.schemas.auth import LoginRequest, LoginResponse, UserProfile

router = APIRouter(tags=["auth"])

DEMO_USERS: dict[str, dict] = {
    "agent.priya": {
        "password": "demo123",
        "display_name": "Priya Sharma",
        "role": "Agent",
        "email": "priya.sharma@exl.example.com",
        "avatar_initials": "PS",
    },
    "supervisor.daniel": {
        "password": "demo123",
        "display_name": "Daniel Osei",
        "role": "Supervisor",
        "email": "daniel.osei@exl.example.com",
        "avatar_initials": "DO",
    },
    "admin.wei": {
        "password": "demo123",
        "display_name": "Wei Chen",
        "role": "Admin",
        "email": "wei.chen@exl.example.com",
        "avatar_initials": "WC",
    },
}


def _make_mock_token(username: str) -> str:
    payload = {"sub": username, "jti": str(uuid.uuid4())}
    return base64.urlsafe_b64encode(json.dumps(payload).encode()).decode()


@router.post("/auth/login", response_model=LoginResponse)
def login(request: LoginRequest):
    user = DEMO_USERS.get(request.username)
    if not user or user["password"] != request.password:
        raise HTTPException(status_code=401, detail="Invalid demo credentials.")

    profile = UserProfile(
        id=request.username,
        username=request.username,
        display_name=user["display_name"],
        role=user["role"],
        email=user["email"],
        avatar_initials=user["avatar_initials"],
    )
    return LoginResponse(access_token=_make_mock_token(request.username), user=profile)


@router.get("/auth/demo-users")
def list_demo_users():
    """Exposes the demo personas so the login screen can offer one-click selection."""
    return [
        {
            "username": username,
            "password": data["password"],
            "display_name": data["display_name"],
            "role": data["role"],
        }
        for username, data in DEMO_USERS.items()
    ]
