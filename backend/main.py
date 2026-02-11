from fastapi import FastAPI
from strawberry.fastapi import GraphQLRouter
from schemas import schema
from database import engine, Base
import logging

# Logger setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database connection successful")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")

@app.get("/health")
async def health_check():
    return {"status": "UP"}


from database import get_db
from fastapi import Request
from auth import decode_access_token

async def get_context(request: Request):
    async for session in get_db():
        user = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer"):
            try:
                token = auth_header.split(" ")[1]
                user = decode_access_token(token)
            except Exception:
                user = None

        yield {
            "db": session,
            "request": request,
            "user": user
        }

graphql_app = GraphQLRouter(schema, context_getter=get_context)
app.include_router(graphql_app, prefix="/graphql")

