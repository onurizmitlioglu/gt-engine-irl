import uuid
import random
import string
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import bcrypt
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from db.database import AsyncSessionLocal
from db import models
from sqlalchemy import select

router = APIRouter(prefix="/auth", tags=["auth"])

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def generate_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))


# ─────────────────────────────────────────────
# Schemas
# ─────────────────────────────────────────────

class AnonymousRegisterResponse(BaseModel):
    user_id: str
    code: str
    type: str = "anonymous"


class RegisterRequest(BaseModel):
    email: str
    password: str


class RegisterResponse(BaseModel):
    user_id: str
    email: str
    type: str = "registered"


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    user_id: str
    email: str
    type: str


class CodeLoginRequest(BaseModel):
    code: str


class CodeLoginResponse(BaseModel):
    user_id: str
    code: str
    type: str = "anonymous"


# ─────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────

@router.post("/anonymous", response_model=AnonymousRegisterResponse)
async def register_anonymous():
    """Anonymous user, returns 8 digit code."""
    async with AsyncSessionLocal() as db:
        user = models.User(
            id=str(uuid.uuid4()),
            type="anonymous",
            code=generate_code(),
            plan="free",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return AnonymousRegisterResponse(user_id=user.id, code=user.code)


@router.post("/register", response_model=RegisterResponse)
async def register(request: RegisterRequest):
    """Email + password registration."""
    async with AsyncSessionLocal() as db:
        # Check if email exists
        result = await db.execute(select(models.User).where(models.User.email == request.email))
        existing = result.scalar_one_or_none()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered.")

        user = models.User(
            id=str(uuid.uuid4()),
            type="registered",
            email=request.email,
            password_hash=hash_password(request.password),
            plan="free",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return RegisterResponse(user_id=user.id, email=user.email)


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Email + password login."""
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(models.User).where(models.User.email == request.email))
        user = result.scalar_one_or_none()

        if not user or not verify_password(request.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Email or password is wrong.")

    return LoginResponse(user_id=user.id, email=user.email, type=user.type)


@router.post("/login/code", response_model=CodeLoginResponse)
async def login_with_code(request: CodeLoginRequest):
    """8 digit code login."""
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(models.User).where(models.User.code == request.code))
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(status_code=404, detail="Code not found.")

    return CodeLoginResponse(user_id=user.id, code=user.code)