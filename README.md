# Store — Full-Stack E-Commerce

A secure full-stack e-commerce application with a React frontend, Express API, PostgreSQL (Prisma), and MongoDB for reviews and activity logs.

## Project URLs

| Resource | URL |
|----------|-----|
| GitHub Repository | _Add your repo URL here after pushing_ |
| Frontend (local dev) | http://localhost:5173 |
| Frontend (Docker) | http://localhost |
| Backend API | http://localhost:5000/api |
| Health check | http://localhost:5000/api/health |

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4, React Router, TanStack Query, Axios, Context API |
| Backend | Express 5, TypeScript, Zod, JWT, bcrypt, Multer, Nodemailer |
| Databases | PostgreSQL (Prisma) — users, products, categories, cart; MongoDB (Mongoose) — reviews, activity logs |
| Testing | Jest + Supertest (backend), Vitest + React Testing Library + MSW (frontend) |
| DevOps | Docker, Docker Compose, nginx |

## Features

### Authentication & users
- Register, login, logout (client-side token clear)
- JWT authentication with protected routes
- Role-based access control (`ADMIN` vs `CUSTOMER`)
- User profile view and name update

### Products & shopping
- Product listing with search, filter, sort, and pagination
- Product detail pages with reviews
- Shopping cart (add, update quantity, remove, clear)
- Category management (admin)
- Product CRUD with image upload (admin)
- Store statistics and recent activity (admin)

### Email
- Welcome email on registration via Nodemailer (optional — skipped if SMTP is not configured)

## Frontend Pages

| Page | Path | Access |
|------|------|--------|
| Home | `/` | Public |
| Product listing | `/products` | Public |
| Product details | `/products/:id` | Public |
| Login | `/login` | Public |
| Register | `/register` | Public |
| Cart | `/cart` | Logged-in users |
| Profile | `/profile` | Logged-in users |
| Admin dashboard | `/admin` | Admin only |

## Prerequisites

- **Node.js 20+**
- **npm**
- **Docker Desktop** (for databases and full Docker setup)
- **Git**

## Project Structure

```
├── backend/              # Express API, Prisma, tests
│   ├── prisma/           # Schema, migrations, seed
│   ├── src/              # Routes, controllers, services
│   └── tests/            # Jest unit + integration tests
├── frontend/             # React SPA, Vitest tests
├── docker-compose.yml    # postgres, mongodb, backend, frontend
├── .env.example          # Root env for Docker Compose
├── README.md
└── README.txt
```

---

## Local Development

### 1. Start databases

```bash
docker compose up -d postgres mongodb
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env    # Windows PowerShell: copy .env.example .env
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
cp .env.example .env    # Windows PowerShell: copy .env.example .env
npm install
npm run dev
```

App runs at **http://localhost:5173**

---

## What to Expect After Setup

After seeding, you should see:

- **12 sample products** across 5 categories (Audio, Electronics, Wearables, etc.)
- **2 test accounts** (admin and customer — see credentials below)
- **Home page** with featured products and a link to the full catalog
- **Product listing** with search, filters, sorting, and pagination
- **Product details** with add-to-cart and review submission (when logged in)
- **Admin dashboard** at `/admin` for product/category management and store stats
- **Welcome email** logged as skipped in the backend console if SMTP is empty (registration still works)

Quick smoke test:
1. Open http://localhost:5173
2. Browse products on the home and `/products` pages
3. Log in as `customer@store.com` → add an item to cart
4. Log in as `admin@store.com` → open `/admin` and view stats or edit a product

---

## Docker (Full Stack)

### 1. Configure environment

```bash
cp .env.example .env    # Windows PowerShell: copy .env.example .env
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

## Default Seed Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@store.com` | `Admin123!` |
| Customer | `customer@store.com` | `Customer123!` |

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Register account |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/profile` | Yes | Get profile |
| PATCH | `/api/auth/profile` | Yes | Update name |
| GET | `/api/categories` | No | List categories |
| POST | `/api/categories` | Admin | Create category |
| PUT | `/api/categories/:id` | Admin | Update category |
| DELETE | `/api/categories/:id` | Admin | Delete category |
| GET | `/api/products` | No | List products (search, filter, sort, pagination) |
| GET | `/api/products/:id` | No | Get product |
| POST | `/api/products` | Admin | Create product (multipart) |
| PUT | `/api/products/:id` | Admin | Update product (multipart) |
| DELETE | `/api/products/:id` | Admin | Delete product |
| GET | `/api/products/:id/reviews` | No | List reviews |
| POST | `/api/products/:id/reviews` | Yes | Create review |
| GET | `/api/cart` | Yes | Get cart |
| POST | `/api/cart` | Yes | Add/update cart item |
| PATCH | `/api/cart/:itemId` | Yes | Update quantity |
| DELETE | `/api/cart/:itemId` | Yes | Remove item |
| DELETE | `/api/cart` | Yes | Clear cart |
| GET | `/api/stats` | Admin | Store statistics |

### Product list query params

`search`, `category`, `minPrice`, `maxPrice`, `sort` (`price_asc` | `price_desc` | `name` | `newest`), `page`, `limit`

---

## Testing

Start PostgreSQL before backend integration tests:

```bash
docker compose up -d postgres
```

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

### Root `.env` (Docker Compose)

| Variable | Description |
|----------|-------------|
| `POSTGRES_USER` | PostgreSQL username |
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `POSTGRES_DB` | Database name |
| `DATABASE_URL` | Prisma connection string |
| `DIRECT_DATABASE_URL` | Direct PostgreSQL URL (migrations) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |
| `FRONTEND_URL` | Allowed CORS origin |
| `VITE_API_URL` | API URL baked into frontend build |
| `UPLOAD_DIR` | Uploaded images directory |
| `SMTP_*` | Optional email settings (welcome email skipped if empty) |

### Backend `.env` (local dev)

Copy from `backend/.env.example`. Use `localhost` hostnames for databases.

```
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env` (local dev)

```
VITE_API_URL=http://localhost:5000/api
```

---

## Security

- **JWT authentication** — Bearer token in `Authorization` header; tokens stored in `localStorage` on the client
- **RBAC** — `ADMIN` vs `CUSTOMER` roles; admin-only routes for products, categories, and stats
- **Rate limiting** — Auth routes limited to 10 requests/minute per IP
- **Helmet** — Security headers on all API responses
- **CORS** — Restricted to `FRONTEND_URL`
- **Input validation** — Zod schemas on all mutation endpoints
- **Password hashing** — bcrypt with 12 salt rounds
- **File upload** — JPEG/PNG/WebP only, 5 MB max
- **Secrets** — Never commit `.env` files; use `.env.example` templates only

---

## Build Commands

```bash
# Backend production build
cd backend && npm run build && npm start

# Frontend production build
cd frontend && npm run build && npm run preview

# Docker images
docker build -t ecommerce-backend ./backend
docker build -t ecommerce-frontend ./frontend
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `prisma migrate` fails | Ensure PostgreSQL is running and `DATABASE_URL` is correct |
| CORS errors | Match `FRONTEND_URL` in backend to your frontend origin (`http://localhost:5173` for local dev) |
| Empty product list | Run `npm run seed` (local) or `docker compose exec backend npx prisma db seed` |
| Docker won't start | Ensure Docker Desktop is running; check `docker compose logs` |
| Integration tests skip DB tests | Start PostgreSQL (`docker compose up -d postgres`) before `npm test` in backend |
| Welcome email not sent | Expected when SMTP is empty; configure `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` in `backend/.env` |
| Product update fails on large price | Price must fit `DECIMAL(10,2)` — max `99,999,999.99` |

---

## License

ISC
