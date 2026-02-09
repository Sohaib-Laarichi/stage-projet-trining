# FastAPI Backend with GraphQL and Postgres

This project demonstrates a FastAPI backend application serving GraphQL APIs using Strawberry, connected to a PostgreSQL database.

## Project Structure

- `backend/`: Contains the FastAPI application code, database models, and Docker configuration.
- `frontend/`: (Currently empty) Placeholder for frontend application.

## Prerequisites

- Docker and Docker Compose
- Python 3.8+

## Setup and Running

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Start the services (Postgres and pgAdmin):**
    ```bash
    docker-compose up -d
    ```

3.  **Install dependencies (local development):**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the FastAPI server:**
    ```bash
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
    ```

## Accessing the Application

- **Health Check:** [http://localhost:8000/health](http://localhost:8000/health)
- **GraphQL Playground:** [http://localhost:8000/graphql](http://localhost:8000/graphql)
- **pgAdmin:** [http://localhost:5050](http://localhost:5050)
    - **Email:** `admin@admin.com`
    - **Password:** `admin`

## Development Notes

- Database connection string is configured in `.env` (default: `postgresql+asyncpg://user:password@localhost/fastapi_db`).
- Models are defined in `models.py` and schemas in `schemas.py`.
