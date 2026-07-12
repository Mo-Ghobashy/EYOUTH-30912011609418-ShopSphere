---
name: Ecommerce Full-Stack Plan
overview: Agent-executable build plan for a secure full-stack e-commerce site — React + Express + PostgreSQL/Prisma + MongoDB + Tailwind. Each step has files, commands, dependencies, and done-when criteria.
todos:
  - id: phase-1-setup
    content: "Steps 1.1–1.9: Scaffold monorepo, env files, docker-compose, verify dev servers"
    status: completed
  - id: phase-2-database
    content: "Steps 2.1–2.6: Prisma schema, migrations, MongoDB models, seed data"
    status: completed
  - id: phase-3-auth
    content: "Steps 3.1–3.12: Security middleware, JWT auth, RBAC, profile, email, activity logs"
    status: completed
  - id: phase-4-apis
    content: "Steps 4.1–4.8: Products, categories, cart, reviews, stats APIs"
    status: completed
  - id: phase-5-frontend-base
    content: "Steps 5.1–5.10: Axios, contexts, React Query, Tailwind tokens, shared components"
    status: completed
  - id: phase-6-pages
    content: "Steps 6.1–6.8: All routes/pages with loading, error, empty states"
    status: completed
  - id: phase-7-testing
    content: "Steps 7.1–7.6: Jest/Supertest backend, Vitest/RTL/MSW frontend"
    status: completed
  - id: phase-8-deploy
    content: "Steps 8.1–8.5: Dockerfiles, compose verify, README, GitHub"
    status: completed
isProject: false
---

# Full-Stack E-Commerce — Agent Execution Plan

## How to use this plan (for AI agent)

1. Execute steps **in numeric order** unless `Depends on` says otherwise.
2. **Do not skip** acceptance criteria — verify each step before moving on.
3. **Do not commit** unless the user explicitly asks.
4. **Do not** put real secrets in tracked files — only `.env.example`.
5. **Store name:** use generic placeholder `"Store"` in UI (not "nitec.").
6. **Styling:** Tailwind CSS only.
7. After each phase, run the phase **verification commands** listed at the bottom of that phase.

---

## Locked-in decisions

| Decision | Value |
|----------|-------|
| Frontend | React 18 + Vite + TypeScript + Tailwind |
| Backend | Express + TypeScript |
| Primary DB | PostgreSQL via Prisma |
| Secondary DB | MongoDB (reviews + activity logs only) |
| Auth | JWT in `Authorization: Bearer` header |
| State | Context API (auth/cart) + TanStack React Query (server state) |
| HTTP client | Axios |
| Validation | Zod (backend) |
| File upload | Multer → `backend/uploads/` |
| Email | Nodemailer (welcome on register) |
| Tests | Jest + Supertest (backend), Vitest + RTL + MSW (frontend) |
| Ports | Backend `:5000`, Frontend dev `:5173` |

---

## Architecture

```mermaid
flowchart TB
    subgraph client [frontend]
        Pages --> State --> Axios
    end
    subgraph api [backend]
        Routes --> AuthMW --> Prisma[(PostgreSQL)]
        Routes --> MongoSvc --> Mongo[(MongoDB)]
        Routes --> Upload
        Routes --> Mailer
    end
    Axios -->|"/api/*"| Routes
```

**PostgreSQL (Prisma):** User, Category, Product, CartItem
**MongoDB:** reviews, activity_logs

---

## Target file tree (create as you go)

```
Term1Project/
├── .gitignore
├── docker-compose.yml
├── README.md
├── frontend/
│   ├── Dockerfile
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── api/client.ts
│       ├── api/endpoints.ts
│       ├── context/AuthContext.tsx
│       ├── context/CartContext.tsx
│       ├── hooks/useProducts.ts
│       ├── hooks/useCart.ts
│       ├── components/          # one file per component
│       ├── pages/                 # one file per page
│       ├── routes/ProtectedRoute.tsx
│       ├── routes/AdminRoute.tsx
│       └── mocks/handlers.ts
└── backend/
    ├── Dockerfile
    ├── .env.example
    ├── package.json
    ├── jest.config.ts
    ├── prisma/schema.prisma
    ├── prisma/seed.ts
    ├── uploads/                   # gitignored
    ├── src/
    │   ├── index.ts               # Express app entry
    │   ├── app.ts                 # express setup
    │   ├── config/env.ts
    │   ├── config/prisma.ts
    │   ├── config/mongo.ts
    │   ├── middleware/auth.ts
    │   ├── middleware/rbac.ts
    │   ├── middleware/validate.ts
    │   ├── middleware/upload.ts
    │   ├── middleware/errorHandler.ts
    │   ├── routes/auth.routes.ts
    │   ├── routes/product.routes.ts
    │   ├── routes/category.routes.ts
    │   ├── routes/cart.routes.ts
    │   ├── routes/review.routes.ts
    │   ├── routes/stats.routes.ts
    │   ├── controllers/           # mirror routes
    │   ├── services/email.service.ts
    │   ├── services/activityLog.service.ts
    │   ├── services/review.service.ts
    │   ├── services/stats.service.ts
    │   ├── utils/jwt.ts
    │   ├── utils/password.ts
    │   └── schemas/               # Zod schemas
    └── tests/
        ├── unit/
        └── integration/
```

---

## Phase 1 — Project Setup

### Step 1.1 — Initialize repo root
**Depends on:** nothing
**Create:** [`.gitignore`](.gitignore)
**Contents must ignore:** `node_modules/`, `.env`, `dist/`, `build/`, `uploads/`, `coverage/`, `.DS_Store`
**Done when:** `.gitignore` exists at repo root

---

### Step 1.2 — Scaffold backend
**Depends on:** 1.1
**Run:**
```bash
cd backend
npm init -y
npm install express cors helmet express-rate-limit dotenv bcrypt jsonwebtoken zod multer nodemailer mongoose
npm install prisma @prisma/client
npm install -D typescript ts-node-dev @types/express @types/cors @types/bcrypt @types/jsonwebtoken @types/multer @types/node jest ts-jest supertest @types/supertest
npx tsc --init
npx prisma init
```
**Create:**
- [`backend/src/index.ts`](backend/src/index.ts) — start server on port 5000
- [`backend/src/app.ts`](backend/src/app.ts) — express app with `cors`, `helmet`, `express.json()`, health route `GET /api/health` → `{ status: "ok" }`
- [`backend/package.json`](backend/package.json) scripts: `"dev": "ts-node-dev --respawn src/index.ts"`, `"build": "tsc"`, `"start": "node dist/index.js"`
**Done when:** `npm run dev` starts and `curl http://localhost:5000/api/health` returns ok

---

### Step 1.3 — Scaffold frontend
**Depends on:** 1.1
**Run:**
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install -D tailwindcss @tailwindcss/vite
npm install react-router-dom @tanstack/react-query axios
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event msw jsdom
```
**Configure:**
- Tailwind in [`frontend/vite.config.ts`](frontend/vite.config.ts) via `@tailwindcss/vite` plugin
- [`frontend/src/index.css`](frontend/src/index.css) — `@import "tailwindcss"`
**Done when:** `npm run dev` serves Vite on `:5173`

---

### Step 1.4 — Environment files
**Depends on:** 1.2, 1.3
**Create:**
- [`backend/.env.example`](backend/.env.example)
- [`frontend/.env.example`](frontend/.env.example)
**Backend keys:**
```
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ecommerce
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
UPLOAD_DIR=uploads
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@store.local
```
**Frontend keys:**
```
VITE_API_URL=http://localhost:5000/api
```
**Also create** local `backend/.env` and `frontend/.env` from examples (not committed).
**Done when:** both `.env.example` files exist; local `.env` files load without error

---

### Step 1.5 — Docker Compose (databases only for now)
**Depends on:** 1.4
**Create:** [`docker-compose.yml`](docker-compose.yml)
**Services:**
- `postgres` — image `postgres:16`, port `5432`, env `POSTGRES_USER/PASSWORD/DB`, volume `pgdata`
- `mongodb` — image `mongo:7`, port `27017`, volume `mongodata`
**Run:** `docker compose up -d postgres mongodb`
**Done when:** both containers healthy; backend `DATABASE_URL` and `MONGODB_URI` connect

---

### Step 1.6 — Prisma client setup
**Depends on:** 1.2, 1.5
**Create:**
- [`backend/src/config/prisma.ts`](backend/src/config/prisma.ts) — singleton `PrismaClient`
- [`backend/src/config/env.ts`](backend/src/config/env.ts) — load and validate required env vars with Zod
**Wire:** import prisma in `app.ts`; disconnect on shutdown
**Done when:** backend starts without Prisma connection errors

---

### Step 1.7 — MongoDB connection
**Depends on:** 1.5
**Create:** [`backend/src/config/mongo.ts`](backend/src/config/mongo.ts) — `mongoose.connect(MONGODB_URI)` with connection helper `connectMongo()`
**Call** `connectMongo()` in `index.ts` before listening
**Done when:** backend logs successful MongoDB connection

---

### Step 1.8 — Global error handler
**Depends on:** 1.2
**Create:** [`backend/src/middleware/errorHandler.ts`](backend/src/middleware/errorHandler.ts)
**Behavior:** catch errors, return `{ message, statusCode }`; hide stack in production
**Done when:** unhandled route returns JSON 404; thrown errors return JSON 500

---

### Step 1.9 — Phase 1 verification
**Run:**
```bash
docker compose up -d postgres mongodb
cd backend && npm run dev
cd frontend && npm run dev
```
**Done when:** health endpoint works; both servers run; no connection errors

---

## Phase 2 — Database Schema & Seed

### Step 2.1 — Prisma schema
**Depends on:** 1.6
**Edit:** [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma)

```prisma
enum Role { CUSTOMER ADMIN }

model User {
  id           String     @id @default(uuid())
  email        String     @unique
  passwordHash String
  name         String
  role         Role       @default(CUSTOMER)
  createdAt    DateTime   @default(now())
  cartItems    CartItem[]
}

model Category {
  id       String    @id @default(uuid())
  name     String
  slug     String    @unique
  products Product[]
}

model Product {
  id          String     @id @default(uuid())
  name        String
  description String
  price       Decimal    @db.Decimal(10, 2)
  stock       Int        @default(0)
  imageUrl    String?
  categoryId  String
  category    Category   @relation(fields: [categoryId], references: [id])
  createdAt   DateTime   @default(now())
  cartItems   CartItem[]
}

model CartItem {
  id        String  @id @default(uuid())
  userId    String
  productId String
  quantity  Int     @default(1)
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  @@unique([userId, productId])
}
```

**Run:** `npx prisma migrate dev --name init`
**Done when:** migration folder exists; tables created in PostgreSQL

---

### Step 2.2 — MongoDB schemas
**Depends on:** 1.7
**Create:**
- [`backend/src/models/Review.ts`](backend/src/models/Review.ts) — `{ productId, userId, userName, rating: 1-5, comment, createdAt }`
- [`backend/src/models/ActivityLog.ts`](backend/src/models/ActivityLog.ts) — `{ userId?, action, metadata?, createdAt }`
**Done when:** models export Mongoose schemas; no TS errors

---

### Step 2.3 — Seed script
**Depends on:** 2.1
**Create:** [`backend/prisma/seed.ts`](backend/prisma/seed.ts)
**Seed data:**
- 1 admin: `admin@store.com` / `Admin123!` (hash with bcrypt)
- 1 customer: `customer@store.com` / `Customer123!`
- 3–5 categories (Electronics, Audio, Wearables, etc.)
- 10–15 products with realistic names/prices/stock
**Add to** `package.json`: `"seed": "ts-node prisma/seed.ts"` and prisma seed config
**Run:** `npm run seed`
**Done when:** DB has users, categories, products; admin role is `ADMIN`

---

### Step 2.4 — Activity log service (stub)
**Depends on:** 2.2
**Create:** [`backend/src/services/activityLog.service.ts`](backend/src/services/activityLog.service.ts)
**Export:** `logActivity({ userId?, action, metadata? })` — writes to MongoDB, never throws (fire-and-forget)
**Done when:** function callable; failures logged to console only

---

### Step 2.5 — Phase 2 verification
**Run:**
```bash
npx prisma studio          # verify tables + data
npm run seed               # idempotent or re-runnable
```
**Done when:** seed data visible; no duplicate-key errors on re-run (use upsert where needed)

---

## Phase 3 — Authentication & Security

### Step 3.1 — Password + JWT utilities
**Depends on:** 2.1
**Create:**
- [`backend/src/utils/password.ts`](backend/src/utils/password.ts) — `hashPassword(plain)`, `comparePassword(plain, hash)` using bcrypt cost 12
- [`backend/src/utils/jwt.ts`](backend/src/utils/jwt.ts) — `signToken({ id, email, role })`, `verifyToken(token)`
**Done when:** unit-testable pure functions exist

---

### Step 3.2 — Zod auth schemas
**Depends on:** 1.2
**Create:** [`backend/src/schemas/auth.schema.ts`](backend/src/schemas/auth.schema.ts)
- `registerSchema`: email, password (min 8), name
- `loginSchema`: email, password
- `updateProfileSchema`: name (optional)
**Done when:** schemas export typed objects

---

### Step 3.3 — Auth middleware
**Depends on:** 3.1
**Create:**
- [`backend/src/middleware/auth.ts`](backend/src/middleware/auth.ts) — read `Authorization: Bearer <token>`, set `req.user = { id, email, role }`, else 401
- [`backend/src/middleware/rbac.ts`](backend/src/middleware/rbac.ts) — `requireAdmin` checks `req.user.role === 'ADMIN'`, else 403
- [`backend/src/middleware/validate.ts`](backend/src/middleware/validate.ts) — generic Zod body/query validator
**Done when:** middleware chain works in isolation

---

### Step 3.4 — Apply security middleware globally
**Depends on:** 1.2, 1.4
**Edit:** [`backend/src/app.ts`](backend/src/app.ts)
- `helmet()`
- `cors({ origin: env.FRONTEND_URL, credentials: true })`
- Rate limit on `/api/auth/*`: 10 requests/minute per IP
- `express.json({ limit: '1mb' })`
- Serve static files: `app.use('/uploads', express.static('uploads'))`
**Done when:** CORS blocks unknown origins; rate limit returns 429 after threshold

---

### Step 3.5 — Auth controller + routes
**Depends on:** 3.1–3.4, 2.4
**Create:**
- [`backend/src/controllers/auth.controller.ts`](backend/src/controllers/auth.controller.ts)
- [`backend/src/routes/auth.routes.ts`](backend/src/routes/auth.routes.ts)

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/api/auth/register` | No | `{ email, password, name }` | `{ user, token }` |
| POST | `/api/auth/login` | No | `{ email, password }` | `{ user, token }` |
| GET | `/api/auth/profile` | Yes | — | `{ user }` |
| PATCH | `/api/auth/profile` | Yes | `{ name? }` | `{ user }` |

**Rules:**
- Never return `passwordHash`
- On register: hash password, create user, sign JWT, log `REGISTER` activity
- On login: verify password, sign JWT, log `LOGIN` activity
**Done when:** all 4 endpoints return correct status codes via manual curl/Postman

---

### Step 3.6 — Welcome email service
**Depends on:** 3.5
**Create:** [`backend/src/services/email.service.ts`](backend/src/services/email.service.ts)
**Behavior:**
- `sendWelcomeEmail({ to, name })` using Nodemailer
- If SMTP env vars empty → log warning and skip (do not fail registration)
**Call** from register controller after user created
**Done when:** registration succeeds with or without SMTP configured

---

### Step 3.7 — Mount auth routes
**Depends on:** 3.5
**Edit:** [`backend/src/app.ts`](backend/src/app.ts) — `app.use('/api/auth', authRoutes)`
**Done when:** routes reachable under `/api/auth/*`

---

### Step 3.8 — Phase 3 verification
**Test manually:**
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"test@test.com\",\"password\":\"Test1234!\",\"name\":\"Test\"}"

# Login
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@store.com\",\"password\":\"Admin123!\"}"

# Profile (use token from login)
curl http://localhost:5000/api/auth/profile -H "Authorization: Bearer <TOKEN>"
```
**Done when:** register, login, profile all return 200/201; invalid token returns 401

---

## Phase 4 — Product, Cart, Reviews, Stats APIs

### Step 4.1 — Category APIs
**Depends on:** 3.3
**Create:** `category.controller.ts`, `category.routes.ts`, `category.schema.ts`

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/categories` | No | return all |
| POST | `/api/categories` | Admin | `{ name, slug }` |
| PUT | `/api/categories/:id` | Admin | update |
| DELETE | `/api/categories/:id` | Admin | reject if products exist |

**Done when:** CRUD works; non-admin POST returns 403

---

### Step 4.2 — Upload middleware
**Depends on:** 3.4
**Create:** [`backend/src/middleware/upload.ts`](backend/src/middleware/upload.ts)
- Multer disk storage → `uploads/`
- Accept: `image/jpeg`, `image/png`, `image/webp`
- Max size: 5MB
- Filename: `{uuid}-{originalname}`
**Done when:** invalid MIME returns error; valid image saved to disk

---

### Step 4.3 — Product APIs
**Depends on:** 4.1, 4.2, 2.4
**Create:** `product.controller.ts`, `product.routes.ts`, `product.schema.ts`

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/products` | No | query: `search`, `category`, `minPrice`, `maxPrice`, `sort` (`price_asc`/`price_desc`/`name`/`newest`), `page`, `limit` → `{ data, total, page, totalPages }` |
| GET | `/api/products/:id` | No | include category |
| POST | `/api/products` | Admin | multipart: fields + optional `image` file |
| PUT | `/api/products/:id` | Admin | update fields + optional new image |
| DELETE | `/api/products/:id` | Admin | delete product |

**Log** `PRODUCT_CREATE`, `PRODUCT_UPDATE`, `PRODUCT_DELETE` to activity logs
**Done when:** list supports search/filter/sort/pagination; image URL returned as `/uploads/<filename>`

---

### Step 4.4 — Cart APIs
**Depends on:** 4.3, 3.3, 2.4
**Create:** `cart.controller.ts`, `cart.routes.ts`

| Method | Path | Auth | Body/Notes |
|--------|------|------|------------|
| GET | `/api/cart` | Yes | return items with nested product |
| POST | `/api/cart` | Yes | `{ productId, quantity }` upsert |
| PATCH | `/api/cart/:itemId` | Yes | `{ quantity }` |
| DELETE | `/api/cart/:itemId` | Yes | remove one |
| DELETE | `/api/cart` | Yes | clear all |

**Validate:** quantity >= 1; stock check on add
**Log** `CART_ADD`, `CART_REMOVE` activities
**Done when:** cart persists per user in PostgreSQL

---

### Step 4.5 — Review APIs (MongoDB)
**Depends on:** 2.2, 3.3
**Create:** `review.controller.ts`, `review.routes.ts`, `review.service.ts`

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/products/:id/reviews` | No | paginated list |
| POST | `/api/products/:id/reviews` | Yes | `{ rating, comment }` |

**Done when:** reviews stored in MongoDB; GET returns reviews for product

---

### Step 4.6 — Stats API (admin)
**Depends on:** 4.3, 4.5, 2.4, 3.3
**Create:** `stats.controller.ts`, `stats.routes.ts`, `stats.service.ts`
**GET `/api/stats`** (admin only) returns:
```json
{
  "totalProducts": 0,
  "totalUsers": 0,
  "totalReviews": 0,
  "averageRating": 0,
  "recentActivity": []
}
```
**Done when:** admin gets stats; customer gets 403

---

### Step 4.7 — Mount all routes
**Depends on:** 4.1–4.6
**Edit:** [`backend/src/app.ts`](backend/src/app.ts) — mount `/api/categories`, `/api/products`, `/api/cart`, review routes, `/api/stats`
**Done when:** all routes registered; no path conflicts

---

### Step 4.8 — Phase 4 verification
**Test:** product list with `?search=...&category=...&sort=price_asc&page=1&limit=10`; admin create product with image; customer add to cart; post review; admin fetch stats
**Done when:** full API surface works end-to-end

---

## Phase 5 — Frontend Foundation

### Step 5.1 — Axios client
**Depends on:** 1.3, 1.4
**Create:**
- [`frontend/src/api/client.ts`](frontend/src/api/client.ts) — baseURL from `VITE_API_URL`; request interceptor adds `Authorization` from `localStorage.token`; response interceptor handles 401 → clear token + redirect `/login`
- [`frontend/src/api/endpoints.ts`](frontend/src/api/endpoints.ts) — typed functions per API endpoint
**Done when:** client attaches JWT automatically

---

### Step 5.2 — React Query setup
**Depends on:** 5.1
**Edit:** [`frontend/src/main.tsx`](frontend/src/main.tsx) — wrap app in `QueryClientProvider`
**Create query key factory** in [`frontend/src/api/queryKeys.ts`](frontend/src/api/queryKeys.ts)
**Done when:** app renders with provider; no console errors

---

### Step 5.3 — AuthContext
**Depends on:** 5.1
**Create:** [`frontend/src/context/AuthContext.tsx`](frontend/src/context/AuthContext.tsx)
**Expose:** `{ user, token, isLoading, login, register, logout, updateProfile }`
**Persist:** token + user in `localStorage`; on mount, if token exists fetch `/auth/profile`
**Done when:** login/register/logout update global state

---

### Step 5.4 — CartContext
**Depends on:** 5.1, 5.3
**Create:** [`frontend/src/context/CartContext.tsx`](frontend/src/context/CartContext.tsx)
**Expose:** `{ items, addItem, updateQuantity, removeItem, clearCart, itemCount }`
**Sync:** with `/api/cart` when user is authenticated
**Done when:** cart badge count updates after add

---

### Step 5.5 — Route guards
**Depends on:** 5.3
**Create:**
- [`frontend/src/routes/ProtectedRoute.tsx`](frontend/src/routes/ProtectedRoute.tsx) — redirect to `/login` if no user
- [`frontend/src/routes/AdminRoute.tsx`](frontend/src/routes/AdminRoute.tsx) — redirect to `/` if role !== ADMIN
**Done when:** unauthenticated `/cart` redirects; non-admin `/admin` redirects

---

### Step 5.6 — Tailwind design tokens
**Depends on:** 1.3
**Edit:** [`frontend/tailwind.config.js`](frontend/tailwind.config.js) or CSS theme
**Tokens:**
- `canvas: #F0F0F0`
- `card: #FFFFFF`
- `accent: #2563EB`
- `cta: #C6F135`
- `radius-bento: 24px` / `32px`
- Font: Inter (Google Fonts in `index.html`)
**Done when:** utility classes available (`bg-canvas`, `rounded-bento`, etc.)

---

### Step 5.7 — Shared layout components
**Depends on:** 5.6
**Create in** [`frontend/src/components/`](frontend/src/components/):
- `Navbar.tsx` — logo "Store", search input, cart icon + count, user avatar/menu
- `SearchBar.tsx` — pill-shaped input with search icon button
- `BentoCard.tsx` — white card, soft shadow, large border-radius
- `CTAButton.tsx` — lime pill button with arrow icon
- `LoadingSkeleton.tsx` — pulse placeholders
- `ErrorState.tsx` — message + retry button
- `Pagination.tsx` — page numbers + prev/next
**Done when:** components render in isolation without errors

---

### Step 5.8 — Product components
**Depends on:** 5.7
**Create:**
- `ProductCard.tsx` — image, name, price, link to detail
- `ProductGrid.tsx` — responsive grid of ProductCards
- `FilterSidebar.tsx` — category, price range, sort dropdown
**Done when:** components accept props and match bento aesthetic

---

### Step 5.9 — App router shell
**Depends on:** 5.3–5.5
**Edit:** [`frontend/src/App.tsx`](frontend/src/App.tsx) — define all routes with `react-router-dom`; wrap with AuthProvider, CartProvider, Navbar layout
**Done when:** navigating between placeholder pages works

---

### Step 5.10 — Phase 5 verification
**Done when:** app loads; Navbar shows; route guards redirect correctly; Tailwind tokens visible

---

## Phase 6 — Frontend Pages

Build pages **only after** matching backend APIs exist (Phase 4 complete).

### Step 6.1 — HomePage `/`
**Depends on:** 5.7, 5.8, 4.3
**Create:** [`frontend/src/pages/HomePage.tsx`](frontend/src/pages/HomePage.tsx)
**Layout (bento grid):**
- Large hero card: headline, subtext, CTA "View All Products" → `/products`, featured product image
- Side cards: color swatches widget, "New" product card, vertical feature card
- Bottom row: "More Products" thumbnails, stats widget (downloads/rating placeholder), popular item card
**Fetch:** `useQuery` for featured product + product list (limit 4)
**States:** skeleton while loading; ErrorState on failure
**Done when:** page matches futuristic bento layout; responsive on mobile

---

### Step 6.2 — ProductListingPage `/products`
**Depends on:** 5.8, 4.3
**Create:** [`frontend/src/pages/ProductListingPage.tsx`](frontend/src/pages/ProductListingPage.tsx)
**Features:** SearchBar (updates URL query `?search=`), FilterSidebar, sort, ProductGrid, Pagination
**Sync filters to URL** so refresh preserves state
**Done when:** search/filter/sort/pagination call API and update UI

---

### Step 6.3 — ProductDetailPage `/products/:id`
**Depends on:** 4.3, 4.5, 5.4
**Create:** [`frontend/src/pages/ProductDetailPage.tsx`](frontend/src/pages/ProductDetailPage.tsx)
**Show:** image, name, description, price, stock, category, add-to-cart button, reviews list + form (if logged in)
**Done when:** add-to-cart works; reviews display and submit

---

### Step 6.4 — CartPage `/cart`
**Depends on:** 5.4, 5.5, 4.4
**Create:** [`frontend/src/pages/CartPage.tsx`](frontend/src/pages/CartPage.tsx)
**Show:** line items, quantity +/- controls, subtotal, remove button, empty cart state
**Done when:** quantity changes persist via API; empty state shows CTA to shop

---

### Step 6.5 — Auth pages
**Depends on:** 5.3
**Create:**
- [`frontend/src/pages/LoginPage.tsx`](frontend/src/pages/LoginPage.tsx)
- [`frontend/src/pages/RegisterPage.tsx`](frontend/src/pages/RegisterPage.tsx)
**Features:** form validation messages, loading on submit, error display, redirect after success
**Done when:** login/register flows work against backend

---

### Step 6.6 — ProfilePage `/profile`
**Depends on:** 5.3, 5.5, 3.5
**Create:** [`frontend/src/pages/ProfilePage.tsx`](frontend/src/pages/ProfilePage.tsx)
**Features:** view/edit name; show email (read-only); save button
**Done when:** profile update persists

---

### Step 6.7 — AdminDashboard `/admin`
**Depends on:** 5.5, 4.1–4.6
**Create:** [`frontend/src/pages/AdminDashboard.tsx`](frontend/src/pages/AdminDashboard.tsx)
**Tabs/sections:**
- Stats cards (from `/api/stats`)
- Products table: create/edit/delete + image upload form
- Categories table: CRUD
- Recent activity list
**Done when:** admin can manage products and categories from UI

---

### Step 6.8 — Phase 6 verification
**Manual walkthrough:**
1. Guest browses home → products → product detail
2. Register → add to cart → view cart
3. Login as admin → create product → see on listing
4. Post review as customer
**Done when:** all flows work without console errors

---

## Phase 7 — Testing

### Step 7.1 — Backend Jest config
**Depends on:** Phase 3+
**Create:** [`backend/jest.config.ts`](backend/jest.config.ts)
**Add script:** `"test": "jest --runInBand"`
**Done when:** `npm test` runs (even if 0 tests initially)

---

### Step 7.2 — Backend unit tests
**Depends on:** 7.1
**Create in** [`backend/tests/unit/`](backend/tests/unit/):
- `password.test.ts` — hash/verify
- `jwt.test.ts` — sign/verify/expired
- `rbac.test.ts` — admin allowed, customer blocked
**Done when:** all unit tests pass

---

### Step 7.3 — Backend integration tests
**Depends on:** 7.1, Phase 4
**Create in** [`backend/tests/integration/`](backend/tests/integration/):
- `auth.test.ts` — register, login, profile, 401 cases
- `products.test.ts` — list with filters, admin CRUD, 403 for customer
- `cart.test.ts` — add, update, remove
**Use:** Supertest against `app`; separate test DB or reset between tests
**Done when:** integration suite passes

---

### Step 7.4 — Frontend test setup
**Depends on:** Phase 5
**Configure:** Vitest in [`frontend/vite.config.ts`](frontend/vite.config.ts)
**Add script:** `"test": "vitest run"`
**Done when:** `npm test` runs in frontend

---

### Step 7.5 — MSW + component tests
**Depends on:** 7.4
**Create:**
- [`frontend/src/mocks/handlers.ts`](frontend/src/mocks/handlers.ts) — mock auth, products, cart endpoints
- [`frontend/src/mocks/server.ts`](frontend/src/mocks/server.ts) — MSW setup for tests
**Tests in** [`frontend/src/`](frontend/src/):
- `components/ProductCard.test.tsx`
- `components/Navbar.test.tsx`
- `pages/LoginPage.test.tsx`
- `routes/ProtectedRoute.test.tsx`
**Done when:** frontend tests pass with mocked APIs

---

### Step 7.6 — Phase 7 verification
**Run:**
```bash
cd backend && npm test
cd frontend && npm test
```
**Done when:** both test suites green

---

## Phase 8 — Docker, Docs, Deploy

### Step 8.1 — Backend Dockerfile
**Depends on:** Phase 4
**Create:** [`backend/Dockerfile`](backend/Dockerfile)
- Multi-stage: build TS → production image
- On start: `prisma migrate deploy && node dist/index.js`
- Expose 5000
**Done when:** `docker build -t ecommerce-backend ./backend` succeeds

---

### Step 8.2 — Frontend Dockerfile
**Depends on:** Phase 6
**Create:** [`frontend/Dockerfile`](frontend/Dockerfile)
- Build with `VITE_API_URL` arg pointing to backend
- Serve with nginx on port 80
**Done when:** `docker build -t ecommerce-frontend ./frontend` succeeds

---

### Step 8.3 — Full docker-compose
**Depends on:** 8.1, 8.2, 1.5
**Update:** [`docker-compose.yml`](docker-compose.yml) — add `backend` and `frontend` services
- Backend depends on postgres + mongodb (healthcheck wait)
- Frontend depends on backend
- Env vars from compose env file (not hardcoded secrets)
**Done when:** `docker compose up --build` starts full stack

---

### Step 8.4 — README
**Depends on:** 8.3
**Create:** [`README.md`](README.md)
**Must include:**
- Tech stack list
- Prerequisites (Node 20+, Docker)
- Local dev setup (step-by-step commands)
- Docker setup (`docker compose up --build`)
- Default seed credentials
- API endpoint table
- Test commands
- Environment variable reference
- Security notes (JWT, RBAC, rate limiting)
**Done when:** another developer can clone and run from README alone

---

### Step 8.5 — Final smoke test
**Depends on:** 8.3, 8.4
**Checklist:**
- [ ] `docker compose up --build` — all containers healthy
- [ ] Frontend loads at `http://localhost` (or mapped port)
- [ ] Login as admin and customer works
- [ ] Product CRUD from admin dashboard works
- [ ] Cart flow works
- [ ] Reviews post and display
- [ ] `npm test` passes in both packages
- [ ] No `.env` files tracked in git
**Done when:** all boxes checked

---

## Requirements traceability (course checklist)

| Requirement | Implemented in |
|-------------|----------------|
| Separate frontend/backend | Steps 1.2, 1.3 |
| PostgreSQL + Prisma | Steps 1.5, 2.1, 2.3 |
| MongoDB | Steps 1.7, 2.2, 4.5 |
| .env files | Step 1.4 |
| JWT auth + protected routes | Steps 3.3–3.7, 5.5 |
| RBAC | Steps 3.3, 4.1–4.6 |
| User profile | Steps 3.5, 6.6 |
| Product CRUD + categories | Steps 4.1, 4.3 |
| Search/filter/sort/pagination | Step 4.3, 6.2 |
| Shopping cart | Steps 4.4, 5.4, 6.4 |
| Image upload | Steps 4.2, 4.3, 6.7 |
| Welcome email | Step 3.6 |
| Store statistics | Steps 4.6, 6.7 |
| Activity logs | Steps 2.4, 3.5, 4.3–4.4 |
| Axios + Context + React Query | Steps 5.1–5.4 |
| All required pages | Steps 6.1–6.7 |
| Loading/error handling | Steps 5.7, 6.1–6.4 |
| Jest + Supertest | Steps 7.1–7.3 |
| RTL + MSW | Steps 7.4–7.5 |
| Docker + compose | Steps 8.1–8.3 |
| README + GitHub ready | Steps 8.4–8.5 |

---

## Agent execution order (quick reference)

```
1.1 → 1.2 + 1.3 (parallel) → 1.4 → 1.5 → 1.6 + 1.7 → 1.8 → 1.9
→ 2.1 → 2.2 → 2.3 → 2.4 → 2.5
→ 3.1 → 3.2 → 3.3 → 3.4 → 3.5 → 3.6 → 3.7 → 3.8
→ 4.1 → 4.2 → 4.3 → 4.4 → 4.5 → 4.6 → 4.7 → 4.8
→ 5.1 → 5.2 → 5.3 → 5.4 → 5.5 → 5.6 → 5.7 → 5.8 → 5.9 → 5.10
→ 6.1 → 6.2 → 6.3 → 6.4 → 6.5 → 6.6 → 6.7 → 6.8
→ 7.1 → 7.2 → 7.3 → 7.4 → 7.5 → 7.6
→ 8.1 → 8.2 → 8.3 → 8.4 → 8.5
```

**Parallel opportunity:** Steps 5.6–5.8 (frontend design system) can start during Phase 4 if backend is not ready for integration yet — but page wiring (Phase 6) must wait for APIs.
