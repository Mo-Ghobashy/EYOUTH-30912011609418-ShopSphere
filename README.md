# ShopSphere — Full-Stack E-Commerce

A secure full-stack e-commerce application built with a React frontend, an Express API,
and PostgreSQL via Prisma ORM storing users, products, categories, cart items, orders,
and activity logs. Product reviews live in a separate review microservice. Includes JWT
authentication, role-based access control, a shopping cart, and a full checkout flow
with server-side payment validation.

## Project URLs

| Resource | URL |
|----------|-----|
| GitHub Repository | https://github.com/Mo-Ghobashy/EYOUTH-30912011609418-ShopSphere |
| Links document | [EYOUTH-30912011609418-ShopSphere.md](EYOUTH-30912011609418-ShopSphere.md) |
| Frontend (production) | https://eyouth-shopsphere.vercel.app |
| Backend API (production) | https://eyouth-shopsphere-api.vercel.app |
| Health check (production) | https://eyouth-shopsphere-api.vercel.app/api/health |
| Review service | https://review-service-three.vercel.app |
| Frontend (local dev) | http://localhost:5173 |
| Frontend (Docker) | http://localhost |
| Backend API (local) | http://localhost:5000/api |
| Health check (local) | http://localhost:5000/api/health |

## Project Documents by Task

| Task | Document |
|------|----------|
| Task 2 — Architecture & classification | [`EYOUTH-30912011609418-ShopSphere-Task2/`](EYOUTH-30912011609418-ShopSphere-Task2/) (diagram `.drawio` + classification) |
| Task 2 — Kubernetes simulation | [`k8s-simulation/README.md`](k8s-simulation/README.md) (namespaces, manifests, kubectl) |
| Task 3 — Architecture Decision Record | [`EYOUTH-30912011609418-ShopSphere-Task3/`](EYOUTH-30912011609418-ShopSphere-Task3/) |
| Task 4 — Rollback plan | [`EYOUTH-30912011609418-ShopSphere-Task4/`](EYOUTH-30912011609418-ShopSphere-Task4/) |
| Task 4 — Submission / links door | [`EYOUTH-30912011609418-ShopSphere.md`](EYOUTH-30912011609418-ShopSphere.md) |

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4, React Router, TanStack Query, Axios, Context API |
| Backend | Express 5, TypeScript, Zod, JWT, bcrypt, Multer, Nodemailer |
| Databases | PostgreSQL (Prisma ORM) — users, products, categories, cart, orders, activity logs. Reviews: separate microservice. |
| Testing | Jest + Supertest (backend), Vitest + React Testing Library + MSW (frontend) |
| DevOps | Docker, Docker Compose, nginx |

## Features

### Authentication & users
- Register, login, logout (client-side token clear, with confirmation dialog)
- JWT authentication with protected routes on both API and UI
- Role-based access control (`ADMIN` vs `CUSTOMER`)
- User profile view and name update
- Welcome email on registration via Nodemailer (skipped gracefully if SMTP is not configured)

### Products & shopping
- Product listing with search, filter by category, price range filter, sorting, and pagination
- Product detail pages with reviews
- Shopping cart (add, update quantity, remove, clear)
- Category management (admin)
- Product CRUD with image upload (admin)
- Store statistics and recent activity (admin)

### Checkout & payments
- Full checkout flow: shipping details + card payment
- Server-side total computation from database prices (client amounts are never trusted)
- Atomic stock validation and decrement inside a transaction
- Mock payment gateway — full card numbers are never stored or logged (only brand + last 4 digits)
- Orders persisted in PostgreSQL with per-user history

### Email
- Welcome email sent after registration. If `SMTP_*` variables are empty the email is skipped and a warning is logged — registration still works.

## Frontend Pages

| Page | Path | Access |
|------|------|--------|
| Home | `/` | Public |
| Product listing | `/products` | Public |
| Product details | `/products/:id` | Public (dynamic routing) |
| Login | `/login` | Public |
| Register | `/register` | Public |
| Cart | `/cart` | Logged-in users |
| Checkout | `/checkout` | Logged-in users |
| Profile | `/profile` | Logged-in users |
| Admin dashboard | `/admin` | Admin only |

## Prerequisites

- **Node.js 20+**
- **npm**
- **Docker Desktop** (for databases and the full Docker setup)
- **Git**

## Project Structure

```
├── backend/                  # Express API, Prisma, tests
│   ├── prisma/               # Schema, migrations, seed data
│   ├── src/
│   │   ├── config/           # Prisma, env configuration
│   │   ├── controllers/      # Request handlers (one job per endpoint)
│   │   ├── middleware/       # Auth (JWT), RBAC, validation, upload, errors
│   │   ├── routes/           # Route definitions
│   │   ├── schemas/          # Zod validation schemas
│   │   ├── services/         # Payment, stats, review proxy, activity log
│   │   └── utils/            # JWT, password hashing, helpers
│   └── tests/                # Jest unit + Supertest integration tests
├── frontend/                 # React SPA (Vite), Vitest tests
│   ├── src/
│   │   ├── api/              # Axios client, endpoints, query keys
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # AuthContext, CartContext
│   │   ├── mocks/            # MSW handlers for frontend tests
│   │   ├── pages/            # One file per page
│   │   ├── routes/           # ProtectedRoute, AdminRoute guards
│   │   └── types/ utils/     # Shared types and helpers
├── EYOUTH-30912011609418-ShopSphere-review-service/  # Reviews microservice
├── EYOUTH-30912011609418-ShopSphere-email/           # Welcome-email serverless function
├── k8s-simulation/           # aws-simulation + gcp-simulation namespaces
├── docker-compose.yml        # postgres, backend, frontend
├── EYOUTH-30912011609418-ShopSphere.md  # Project sharing / links document
├── .env.example              # Root env template for Docker Compose
└── README.md
```

---

## Local Development

### 1. Start databases

```bash
docker compose up -d postgres
```

### 2. Backend setup

```bash
cd backend
copy .env.example .env    # PowerShell (cmd: copy .env.example .env)
npm install
npx prisma migrate deploy
npm run seed
npm run dev
```

API runs at **http://localhost:5000**

### 3. Frontend setup

In a new terminal:

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

App runs at **http://localhost:5173**

---

## What to Expect After Setup

After seeding, you should see:

- **12 real products** (Sony, Bose, Apple, JBL, Marshall…) across 5 categories, each with product photos
- **2 test accounts** (admin and customer — see credentials below)
- Home page with featured products, brand sections, and footer
- Product listing with search, filters, sorting, and pagination (mobile-responsive layout)
- Product details with add-to-cart and review submission (when logged in)
- Checkout flow at `/checkout` with shipping form and card payment
- Admin dashboard at `/admin`: store stats (users, products, orders, revenue), product/category management, activity log
- Welcome email logged as skipped in the backend console if SMTP is empty (registration still works)

Quick smoke test:
1. Open http://localhost:5173
2. Browse products on the home and `/products` pages
3. Log in as `customer@store.com` → add an item to cart → proceed to payment → pay with test card `4242 4242 4242 4242`
4. Log in as `admin@store.com` → open `/admin` → view stats (order count and revenue should reflect your purchase)

---

## Default Seed Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@store.com` | `Admin123!` |
| Customer | `customer@store.com` | `Customer123!` |

## Payment Test Cards

The payment gateway is simulated. Any Luhn-valid card number succeeds; any valid number ending in `034` is declined.

| Card | Result |
|------|--------|
| `4242 4242 4242 4242` | Approved |
| `4242 4242 4240 1034` | Declined |

> In production this mock gateway would be replaced by a real PSP (e.g., Stripe Elements) so raw card data never reaches the server.

---

## Docker (Full Stack)

### 1. Configure environment

```bash
copy .env.example .env    # from the repository root
```

Edit `.env` and set a strong `JWT_SECRET` before deploying.

### 2. Build and start

```bash
docker compose up --build -d
```

### 3. Seed the database (first run)

```bash
docker compose exec backend npx prisma db seed
```

### 4. Access the app

| Service | URL |
|---------|-----|
| Frontend | http://localhost |
| Backend API | http://localhost:5000/api |
| Health check | http://localhost:5000/api/health |

### 5. Stop

```bash
docker compose down
```

---

## Testing

Backend integration tests run against a dedicated **`ecommerce_test`** database so your
development data is never touched. Create it once and apply migrations:

```bash
docker exec ecommerce-postgres psql -U postgres -c "CREATE DATABASE ecommerce_test"
cd backend
$env:DATABASE_URL='postgresql://postgres:postgres@localhost:5432/ecommerce_test'; npx prisma migrate deploy
```

Run the tests — **always with `npm test`**, which runs suites serially (`--runInBand`).
Running `npx jest` directly runs suites in parallel and they will interfere with each other:

```bash
# Backend (Jest unit + Supertest integration)
cd backend && npm test

# Frontend (Vitest + React Testing Library + MSW)
cd frontend && npm test
```

### Test coverage

| Area | Framework | Location |
|------|-----------|----------|
| Backend unit tests | Jest | `backend/tests/unit/` (JWT, password, RBAC) |
| Backend integration tests | Jest + Supertest | `backend/tests/integration/` (auth, products, cart) |
| Frontend component tests | Vitest + RTL | `frontend/src/**/*.test.tsx` |
| API mocking | MSW | `frontend/src/mocks/` |

---

## Environment Variables

No secret value is ever committed to the repository — only `.env.example` templates live here.

### Root `.env` (Docker Compose)

| Variable | Description |
|----------|-------------|
| `POSTGRES_USER` | PostgreSQL username |
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `POSTGRES_DB` | Database name |
| `DATABASE_URL` | Prisma connection string |
| `DIRECT_DATABASE_URL` | Direct PostgreSQL URL (migrations) |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |
| `FRONTEND_URL` | Allowed CORS origin |
| `VITE_API_URL` | API URL baked into the frontend build |
| `UPLOAD_DIR` | Uploaded images directory |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | SMTP for the **email function** (not the main API) |
| `REVIEW_SERVICE_URL` | Base URL of the review microservice |
| `EMAIL_SERVICE_URL` | Base URL of the standalone welcome-email Vercel function |

### Backend `.env` (local dev)

Copy from `backend/.env.example`. Use `localhost` hostnames for databases.

```
FRONTEND_URL=http://localhost:5173
REVIEW_SERVICE_URL=http://localhost:5001
EMAIL_SERVICE_URL=http://localhost:3001
```

SMTP is configured on the **email function** project (`EYOUTH-30912011609418-ShopSphere-email`), not on the main API.

### Frontend `.env` (local dev)

```
VITE_API_URL=http://localhost:5000/api
```

---

## Security

- **JWT authentication** — Bearer token in `Authorization` header; tokens stored in `localStorage` on the client
- **RBAC** — `ADMIN` vs `CUSTOMER` roles; admin-only routes for products, categories, and stats
- **Rate limiting** — auth routes limited to 10 req/min/IP; checkout limited to 5 attempts/min/IP
- **Helmet** — security headers on all API responses
- **CORS** — restricted to `FRONTEND_URL`
- **Input validation** — Zod schemas on every mutation endpoint (server re-validates everything the client checks)
- **Password hashing** — bcrypt with 12 salt rounds
- **Checkout integrity** — totals computed server-side from database prices; stock re-checked inside an atomic transaction
- **Card data** — full PAN never stored or logged; only brand + last 4 digits saved with the order
- **File upload** — JPEG/PNG/WebP only, 5 MB max
- **Secrets** — never committed; environment variables only

---

## Structured logging

The backend uses [Pino](https://getpino.io/). Every **request** log and **error** log includes:

- **Timestamp** — ISO-8601 via `pino.stdTimeFunctions.isoTime`
- **Severity level** — `INFO` (completed requests), `WARN` (4xx), `ERROR` (5xx and failures)

Example request entry: method, URL, status, duration, IP, plus `time` and `level`.

**Where to read the logs in production:** Vercel Dashboard → project **eyouth-shopsphere-api** → **Logs** (Runtime Logs).

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Register account (+ welcome email) |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/profile` | Yes | Get profile |
| PATCH | `/api/auth/profile` | Yes | Update name |
| GET | `/api/categories` | No | List categories |
| POST | `/api/categories` | Admin | Create category |
| PUT | `/api/categories/:id` | Admin | Update category |
| DELETE | `/api/categories/:id` | Admin | Delete category |
| GET | `/api/products` | No | List products (search, filter, sort, pagination) |
| GET | `/api/products/:id` | No | Get product |
| POST | `/api/products` | Admin | Create product (multipart image upload) |
| PUT | `/api/products/:id` | Admin | Update product (multipart) |
| DELETE | `/api/products/:id` | Admin | Delete product |
| GET | `/api/products/:id/reviews` | No | List reviews |
| POST | `/api/products/:id/reviews` | Yes | Create review |
| GET | `/api/cart` | Yes | Get cart |
| POST | `/api/cart` | Yes | Add/update cart item |
| PATCH | `/api/cart/:itemId` | Yes | Update quantity |
| DELETE | `/api/cart/:itemId` | Yes | Remove item |
| DELETE | `/api/cart` | Yes | Clear cart |
| POST | `/api/orders/checkout` | Yes | Checkout: validates shipping + card, authorizes payment, creates order, clears cart |
| GET | `/api/orders/:id` | Yes | Get own order by ID |
| GET | `/api/stats` | Admin | Users, products, orders, revenue, reviews, avg rating, recent activity |

### Product list query params

`search`, `category`, `minPrice`, `maxPrice`, `sort` (`price_asc` | `price_desc` | `name` | `newest`), `page`, `limit`

### Checkout request shape

```json
{
  "shipping": {
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+201000000000",
    "address": "12 Nile Street",
    "city": "Cairo",
    "zip": "11511",
    "country": "Egypt"
  },
  "payment": {
    "cardHolder": "JANE DOE",
    "cardNumber": "4242424242424242",
    "expiry": "09/29",
    "cvc": "123"
  }
}
```

---

## Build Commands

```bash
# Backend production build
cd backend && npm run build && npm start

# Frontend production build
cd frontend && npm run build && npm run preview

# Docker images
docker build -t shopsphere-backend ./backend
docker build -t shopsphere-frontend ./frontend
```

---

## Deployment (Production)

Target production topology:

| Piece | Service |
|-------|---------|
| Frontend | Vercel (production build) |
| Backend | Vercel (serverless) |
| Main database | PostgreSQL on Supabase |
| | Monitoring | UptimeRobot watching `/api/health` |

Deployment checklist:

1. Create Supabase project → copy the connection string (use port `5432`, append `?sslmode=require`)
2. Apply migrations: set `DATABASE_URL` to Supabase and run `npx prisma migrate deploy`
4. Deploy backend to Vercel with env vars: `DATABASE_URL`, `DIRECT_DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_URL`, `REVIEW_SERVICE_URL`, `EMAIL_SERVICE_URL`
5. Deploy `EYOUTH-30912011609418-ShopSphere-email` as its own Vercel project; put SMTP vars on **that** project
6. Deploy frontend to Vercel with build env var `VITE_API_URL` pointing at the backend URL
7. Verify HTTPS, CORS, Helmet headers, and rate limiting are active on the deployed backend
8. Register the public health-check URL in UptimeRobot (HTTP monitor); paste the public status URL into `EYOUTH-30912011609418-ShopSphere.md`

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `prisma migrate` fails | Ensure PostgreSQL is running and `DATABASE_URL` is correct |
| CORS errors | Match `FRONTEND_URL` in backend to your frontend origin (`http://localhost:5173` for local dev) |
| Empty product list | Run `npm run seed` (local) or `docker compose exec backend npx prisma db seed` |
| Integration tests wipe dev data | They don't anymore — tests use `ecommerce_test`; make sure it exists (see Testing section) |
| Integration tests fail randomly when run directly with jest | Use `npm test` (serial execution); parallel workers share one test DB and conflict |
| Docker won't start | Ensure Docker Desktop is running; check `docker compose logs` |
| Welcome email not sent | Set `EMAIL_SERVICE_URL` on the backend; configure SMTP on the email Vercel project |
| Payment declined in testing | Cards ending in `034` are intentionally declined; use `4242 4242 4242 4242` |
| Product update fails on large price | Price must fit `DECIMAL(10,2)` — max `99,999,999.99` |

---

## License

ISC

