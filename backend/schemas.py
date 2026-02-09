import strawberry
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from decimal import Decimal

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

@strawberry.type
class Query:
    @strawberry.field
    def hello(self) -> str:
        return "Hello World"

schema = strawberry.Schema(query=Query)
