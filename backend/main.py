from fastapi import FastAPI
from strawberry.fastapi import GraphQLRouter
from schemas import schema
from database import engine, Base
import logging

# Logger setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

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

graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")

