# Store — Full-Stack E-Commerce

A secure full-stack e-commerce application with a React frontend, Express API, PostgreSQL (Prisma), and MongoDB for reviews and activity logs.

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4, React Router, TanStack Query, Axios |
| Backend | Express 5, TypeScript, Zod, JWT, bcrypt, Multer, Nodemailer |
| Databases | PostgreSQL (Prisma), MongoDB (Mongoose) |
| Testing | Jest + Supertest (backend), Vitest + RTL + MSW (frontend) |
| DevOps | Docker, Docker Compose, nginx |

## Prerequisites

- **Node.js 20+**
- **npm**
- **Docker Desktop** (for containerized setup)
- **Git**

## Project Structure

```
├── backend/          # Express API
├── frontend/         # React SPA
├── docker-compose.yml
├── .env.example      # Root env for Docker Compose
└── README.md
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
cp .env.example .env
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
cp .env.example .env
npm install
npm run dev
```

App runs at **http://localhost:5173**

---

## Docker (Full Stack)

### 1. Configure environment

```bash
cp .env.example .env
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

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

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
| `SMTP_*` | Optional email settings |

### Backend `.env` (local dev)

Copy from `backend/.env.example`. Use `localhost` hostnames for databases.

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
| CORS errors | Match `FRONTEND_URL` in backend to your frontend origin |
| Empty product list | Run `npm run seed` (local) or `docker compose exec backend npx tsx prisma/seed.ts` |
| Docker won't start | Ensure Docker Desktop is running; check `docker compose logs` |
| Integration tests skip DB tests | Start PostgreSQL (`docker compose up -d postgres`) before `npm test` in backend |

---

## License

ISC
