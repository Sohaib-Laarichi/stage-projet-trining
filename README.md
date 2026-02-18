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
    python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
    ```

## Accessing the Application

- **Health Check:** [http://localhost:8000/health](http://localhost:8000/health)
- **GraphQL Playground:** [http://localhost:8000/graphql](http://localhost:8000/graphql)
- **pgAdmin:** [http://localhost:5050](http://localhost:5050)
    - **Email:** `admin@admin.com`
    - **Password:** `admin`

## Demo

**Demo videos are available in the `test Screen/` folder** .



https://github.com/user-attachments/assets/6adc4532-ca4b-4f1b-9fe4-2049ceb83d63




The demo demonstrates:
- User registration and login flow
- Product CRUD operations (Create, Read, Update, Delete)
- Theme switching (Dark/Light mode)
- Language toggle (EN/FR)
- Form validation and error handling

## GraphQL Usage

### Authentication Flow

1.  **Register a new user:**
    ```graphql
    mutation Register {
      register(input: {
        username: "sohaib",
        email: "sohaib@dark.com",
        password: "Dark:911",
        role: "USER"
      }) {
        id
        username
        role
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

4.  **Product Management:**

    *   **Create a Product :**
        ```graphql
        mutation CreateProduct {
          createProduct(input: {
            name: "Laptop",
            description: "High performance laptop",
            price: 1500.0,
            quantity: 10
          }) {
            id
            name
            price
          }
        }
        ```

    *   **Update a Product :**
        ```graphql
        mutation UpdateProduct {
          updateProduct(id: 1, input: {
            price: 1400.0
          }) {
            id
            name
            price
          }
        }
        ```

    *   **Delete a Product (Admin only):**
        ```graphql
        mutation DeleteProduct {
          deleteProduct(id: 1) {
            id
            name
          }
        }
        ```

    *   **Get All Products:**
        ```graphql
        query GetProducts {
          products {
            id
            name
            price
            quantity
          }
        }
        ```

## Frontend Application

The frontend is a React application built with Vite, using Apollo Client to communicate with the GraphQL API.

### Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19 | UI framework |
| Vite | 7 | Build tool & dev server |
| Apollo Client | 4 | GraphQL client |
| react-router-dom | 7 | Routing & navigation |
| react-hook-form | 7 | Form management |
| zod | 4 | Schema validation |
| react-hot-toast | 2 | Toast notifications |
| react-i18next | 15 | Internationalization |
| i18next | 24 | Translation framework |

### Setup and Running

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at [http://localhost:5173](http://localhost:5173).

### Architecture

#### Apollo Client Setup
The application uses **Apollo Client v4**. Imports for React hooks and the provider come from `@apollo/client/react` for compatibility.

#### Authentication
*   **JWT Handling:** The application checks `localStorage` for a `token`.
*   **Authorization Header:** An Apollo Link (`setContext`) automatically attaches the token to every GraphQL request:
    ```javascript
    Authorization: `Bearer ${token}`
    ```
*   **Protected Routes:** Only authenticated users can access product management pages. Unauthenticated users are redirected to `/login`.

#### Theme System
*   **Dark / Light mode:** Managed via `ThemeContext` using CSS custom properties (`data-theme` attribute on `<html>`).
*   **Persistence:** Theme preference saved to `localStorage` and restored on page load via inline script (prevents FOUC).
*   **Toggle:** Available in the sidebar under Preferences.
*   **Global:** Theme applies to all pages including Login and Register.

#### Internationalization (i18n)
*   **Languages:** English (EN) and French (FR) support via `react-i18next`.
*   **Persistence:** Language preference saved to `localStorage`.
*   **Toggle:** Available in the sidebar - switches between EN/FR.
*   **Coverage:** All UI labels, validation messages, and toast notifications are translated.
*   **Translation Files:** `src/i18n/en.json` and `src/i18n/fr.json`.

#### Logo & Branding
*   **Logo Component:** Reusable `Logo.jsx` with configurable sizes (small/medium/large).
*   **Favicon:** Custom logo displayed in browser tab.
*   **Placement:** Logo appears on Login, Register, and MainLayout sidebar.
*   **Page Title:** "Stock Manager" displayed in browser tab.

### Features Implemented

#### User Registration (US-8)
*   **Route:** `/register`
*   **Form Fields:** Username, Email, Password (min 6 chars), Role (USER/ADMIN dropdown)
*   **Validation:** Zod schema with email format, password length, and role enum validation
*   **Success Flow:** Toast notification → redirect to login page
*   **Error Handling:** Duplicate user detection, network errors
*   **Design:** Split-panel layout matching Login page with SVG illustration
*   **i18n:** Fully translated (EN/FR)

#### Main Layout (US-9)
*   **Sidebar:** Persistent side navigation with menu items:
    *   Products — navigates to `/products`
    *   Theme switch — toggles dark/light mode
    *   Language switch — toggles EN/FR
    *   Logout — clears token and redirects to `/login`
*   **Collapsible:** Sidebar can be toggled open/closed via a button.
*   **Layout route:** All protected pages render inside the layout via `<Outlet />`.

#### Login Page
*   **Design:** Modern split-panel layout with dark gradient form panel and illustration panel.
*   **Validation:** Zod schema (username required, password min 6 chars).
*   **Theme Support:** Fully themed (dark/light mode).
*   **i18n:** Fully translated (EN/FR).
*   **Error Handling:** Network error → "Server unreachable", invalid credentials → toast notification.
*   **Navigation:** Link to Register page for new users.

#### Product CRUD (US-10)

| Feature | Route | Description |
|---------|-------|-------------|
| **List** (US-10.1) | `/products` | Table with Name, Price, Quantity, Actions columns. Loading spinner during fetch. Empty state when no products. |
| **Create** (US-10.2) | `/products/new` | Form with name (min 2), description (optional), price (≥ 0), quantity (≥ 0). On success → toast + redirect. |
| **Edit** (US-10.3) | `/products/:id/edit` | Fetches product by ID, prefills form. On save → update mutation + toast + redirect. |
| **Delete** | Action button | Confirmation dialog → delete mutation → refetch list. |

#### Error Handling
*   **Global Error Boundary:** Wraps the application to catch React runtime errors.
*   **Unauthorized:** GraphQL "Unauthorized" errors → clear token → redirect to `/login`.
*   **GraphQL errors:** Displayed as toast notifications.
*   **Product not found:** Shows a dedicated "Product not found" message with a back link.

### Project Structure (Frontend)

```
frontend/src/
├── context/
│   └── ThemeContext.jsx       # Dark/light theme provider
├── components/
│   ├── MainLayout.jsx         # AppBar + Sidebar layout
│   ├── MainLayout.css
│   ├── Login.jsx              # Login page
│   ├── Login.css
│   ├── Register.jsx           # Registration page
│   ├── ProductList.jsx        # Products table
│   ├── ProductList.css
│   ├── ProductForm.jsx        # Create/Edit product form
│   ├── ProductForm.css
│   ├── Logo.jsx               # Reusable logo component
│   ├── Logo.css
│   └── LogoutButton.jsx       # Standalone logout button
├── i18n/
│   ├── en.json                # English translations
│   ├── fr.json                # French translations
│   └── i18n.js                # i18next configuration
├── schemas/
│   └── authSchema.js          # Zod validation schemas (login/register)
├── queries.js                 # All GraphQL queries & mutations
├── ErrorBoundary.jsx          # Global error boundary
├── App.jsx                    # Routes & PrivateRoute
├── main.jsx                   # Entry point (Apollo + Theme + i18n providers)
├── index.css                  # Theme CSS variables
└── App.css                    # Root styles
```

- **Database:** Uses `sqlalchemy` with `asyncpg` for asynchronous database access.
- **Authentication:** Uses `passlib[bcrypt]` for password hashing and `python-jose` for JWT tokens.
- **CORS:** Enabled for all origins (`*`) to facilitate easy testing from browsers.

---

## Frontend Testing (US-13)

The frontend uses **Vitest** + **Testing Library** for unit and component tests.

### Testing Stack

| Library | Purpose |
|---------|---------|
| `vitest` | Test runner (Vite-native) |
| `@testing-library/react` | React component rendering |
| `@testing-library/jest-dom` | DOM matchers (`toBeInTheDocument`, etc.) |
| `@testing-library/user-event` | Realistic user interaction simulation |
| `jsdom` | Browser-like DOM environment |
| `@apollo/client MockedProvider` | Mock GraphQL responses without a real server |

### Running Tests

```bash
cd frontend

# Run all tests once (CI mode)
npm run test

# Run in watch mode (development)
npm run test:watch

# Open interactive Vitest UI
npm run test:ui
```

### Test Results

```
Test Files  6 passed (6)
     Tests  31 passed (31)
  Duration  ~3.8s
```

### Auth Storage Utility

A pure `localStorage` wrapper was extracted to `src/utils/authStorage.js` to make auth logic independently testable:

```js
import { setToken, getToken, removeToken, isLoggedIn } from './utils/authStorage';
```

### Project Structure (Tests)

```
frontend/src/
├── setupTests.js              # jest-dom import + window.matchMedia mock
├── utils/
│   └── authStorage.js         # Pure auth token utility (US-13.2)
└── __tests__/
    ├── example.test.jsx        # Setup sanity check (US-13.1)
    ├── authStorage.test.js     # Auth logic unit tests (US-13.2)
    ├── productQueries.test.jsx # GraphQL query/mutation tests (US-13.3)
    ├── Login.test.jsx          # LoginPage component tests (US-13.4)
    ├── ProductForm.test.jsx    # ProductFormPage component tests (US-13.4)
    └── ProductList.test.jsx    # ProductsListPage component tests (US-13.4)
```
