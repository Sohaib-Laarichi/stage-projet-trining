# FastAPI Backend with GraphQL and Postgres

This project demonstrates a FastAPI backend application serving GraphQL APIs using Strawberry, connected to a PostgreSQL database. It includes secure authentication using JWT and password hashing with Bcrypt.

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

4.  **Environment Configuration:**
    Ensure you have a `.env` file in the `backend/` directory with the following variables:
    ```env
    DATABASE_URL=postgresql+asyncpg://user:password@localhost:5433/fastapi_db
    POSTGRES_USER=user
    POSTGRES_PASSWORD=password
    POSTGRES_DB=fastapi_db
    SECRET_KEY=secret_key
    ```

5.  **Run the FastAPI server:**
    ```bash
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
    ```

## Accessing the Application

- **Health Check:** [http://localhost:8000/health](http://localhost:8000/health)
- **GraphQL Playground:** [http://localhost:8000/graphql](http://localhost:8000/graphql)
- **pgAdmin:** [http://localhost:5050](http://localhost:5050)
    - **Email:** `admin@admin.com`
    - **Password:** `admin`

## GraphQL Usage

### Authentication Flow

1.  **Register a new user:**
    ```graphql
    mutation Register {
      register(input: {
        username: "sohaib",
        email: "sohaib@dark.com",
        password: "Dark:911"
      }) {
        id
        username
      }
    }
    ```

2.  **Login to get a JWT token:**
    ```graphql
    mutation Login {
      login(input: {
        username: "sohaib",
        password: "Dark:911"
      }) {
        token
        user {
          username
          role
        }
      }
    }
    ```

3.  **Access Protected Routes (e.g., `me` query):**
    Copy the `token` returned from the login mutation and add it to the **HTTP Headers** section in GraphQL Playground:
    ```json
    {
      "Authorization": "Bearer JWT_TOKEN"
    }
    ```

    Then run the query:
    ```graphql
    query Me {
      me {
        id
        username
        email
        role
      }
    }
    ```

## Development Notes

- **Database:** Uses `sqlalchemy` with `asyncpg` for asynchronous database access.
- **Authentication:** Uses `passlib[bcrypt]` for password hashing and `python-jose` for JWT tokens.
- **CORS:** Enabled for all origins (`*`) to facilitate easy testing from browsers.
