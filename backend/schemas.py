import strawberry
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models import User, Product
from auth import get_password_hash, verify_password, create_access_token, decode_access_token
from strawberry.types import Info
from fastapi import Request, HTTPException

@strawberry.type
class UserType:
    id: UUID
    username: str
    email: str
    role: str
    created_at: datetime
    updated_at: datetime

@strawberry.type
class ProductType:
    id: int
    name: str
    description: Optional[str]
    price: Decimal
    quantity: int
    created_at: datetime
    updated_at: datetime

@strawberry.input
class RegisterInput:
    username: str
    email: str
    password: str

@strawberry.input
class LoginInput:
    username: str
    password: str

@strawberry.type
class AuthResponse:
    token: str
    user: UserType

async def get_current_user(info: Info) -> User:
    request: Request = info.context["request"]
    db: AsyncSession = info.context["db"]
    
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise Exception("Unauthorized")
    
    token = auth_header.split(" ")[1]
    payload = decode_access_token(token)
    
    if not payload:
        raise Exception("Unauthorized")
    
    username = payload.get("sub")
    stmt = select(User).where(User.username == username)
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    if not user:
        raise Exception("Unauthorized")
        
    return user

@strawberry.type
class Query:
    @strawberry.field
    def hello(self) -> str:
        return "Hello World"

    @strawberry.field
    async def me(self, info: Info) -> UserType:
        return await get_current_user(info)

@strawberry.type
class Mutation:
    @strawberry.field
    async def register(self, info: Info, input: RegisterInput) -> UserType:
        db: AsyncSession = info.context["db"]
        
        # Check if user exists
        stmt = select(User).where((User.username == input.username) | (User.email == input.email))
        result = await db.execute(stmt)
        if result.scalars().first():
            raise Exception("Username or Email already exists")

        if len(input.password) < 6:
            raise Exception("Password must be at least 6 characters")

        hashed_password = get_password_hash(input.password)
        new_user = User(
            username=input.username,
            email=input.email,
            password_hash=hashed_password,
            role="USER" 
        )
        db.add(new_user)
        # Commit likely needed before refresh? Strawberry resolvers are async.
        try:
            await db.commit()
            await db.refresh(new_user)
        except Exception as e:
            await db.rollback()
            raise Exception(f"Registration failed: {str(e)}")
            
        return new_user

    @strawberry.field
    async def login(self, info: Info, input: LoginInput) -> AuthResponse:
        db: AsyncSession = info.context["db"]
        
        stmt = select(User).where(User.username == input.username)
        result = await db.execute(stmt)
        user = result.scalars().first()

        if not user or not verify_password(input.password, user.password_hash):
            raise Exception("Invalid credentials")

        # Include userId in token as per requirement
        token = create_access_token({"sub": user.username, "userId": str(user.id), "role": user.role})
        
        return AuthResponse(token=token, user=user)

schema = strawberry.Schema(query=Query, mutation=Mutation)
