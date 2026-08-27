# EYOUTH-30912011609418-ShopSphere - Project Submission

**Student ID:** EYOUTH-30912011609418
**Repository:** https://github.com/Mo-Ghobashy/EYOUTH-30912011609418-ShopSphere (public)

This is the submission door for ShopSphere. Anyone with this link can view the project: a deployed application, a deployed review service, a serverless function, a CI/CD pipeline, monitoring, and all supporting documents. Each of the four tasks is described below with its live URLs and the exact screenshots that prove it.

---

## Overview

ShopSphere is a full-stack e-commerce application:

- **Frontend** (React + Vite) hosted on Vercel.
- **Backend** (Express + Node + Prisma) hosted on Vercel, connected to a **Supabase** PostgreSQL database.
- **Review service** (a separate microservice) deployed at its own URL; ShopSphere shows reviews through a REST proxy.
- **Welcome-email function** (a serverless function) deployed separately and called fire-and-forget after registration.
- **CI/CD pipeline** (GitHub Actions) with three environments (development, staging, production), structured logging, a rollback plan, and monitoring (UptimeRobot).

---

## Task 1 - Production Deployment, Database, HTTPS, Security & Monitoring

### Deliverables
The production deployment itself: frontend URL, backend URL, health-check endpoint, and the monitoring service registered on that endpoint.

### URLs
| Component | URL |
|-----------|-----|
| Application (Frontend) | https://eyouth-shopsphere.vercel.app |
| Backend API | https://eyouth-shopsphere-api.vercel.app |
| Health check (backend) | https://eyouth-shopsphere-api.vercel.app/api/health |
| Health check (review service) | https://review-service-three.vercel.app/api/health |
| Monitoring (UptimeRobot public status) | https://stats.uptimerobot.com/VE47gDJ9Jt |

- **HTTPS:** all Vercel URLs serve HTTPS (TLS) by default.
- **Database:** Supabase (PostgreSQL) via Prisma.
- **Secrets:** stored as GitHub Actions secrets and in `.env` (gitignored); no `.env` is committed.

### Screenshots to place here
| # | Screenshot | What it proves |
|---|-----------|----------------|
| 1.1 | Frontend loading in a browser with HTTPS padlock visible | The public frontend opens for anyone |
| 1.2 | Backend `/api/health` opening in a browser/curl returning `200`/`{"status":"ok"...}` | The backend is live and healthy |
| 1.3 | A backend response header check (DevTools/curl) showing Helmet headers (`X-Content-Type-Options`, `X-Frame-Options`) | Security headers are active |
| 1.4 | Network tab of frontend showing API calls going to `https://eyouth-shopsphere-api.vercel.app/api/` (not localhost) | Frontend talks to the production backend |
| 1.5 | 11 rapid login attempts returning `429` | Rate limiting is active |
| 1.6 | UptimeRobot status page opened in an **incognito** window showing both monitors UP | Monitoring is live and public |

---

## Task 2 - Architecture Diagram, Service Classification & Kubernetes

### Deliverables
The architecture diagram, the document classifying the three services with reasons, and the Kubernetes manifest files.

### Documents
| File | Location |
|------|----------|
| Architecture diagram | [`EYOUTH-30912011609418-ShopSphere-Task2/EYOUTH-30912011609418-ShopSphere.drawio`](EYOUTH-30912011609418-ShopSphere-Task2/EYOUTH-30912011609418-ShopSphere.drawio) (open with draw.io) |
| Service classification | [`EYOUTH-30912011609418-ShopSphere-Task2/EYOUTH-30912011609418-ShopSphere-classification.md`](EYOUTH-30912011609418-ShopSphere-Task2/EYOUTH-30912011609418-ShopSphere-classification.md) |
| Kubernetes manifests | [`k8s-simulation/`](k8s-simulation/) (two namespaces: `aws-simulation`, `gcp-simulation`) |
| Kubectl instructions | [`k8s-simulation/README.md`](k8s-simulation/README.md) |

**Classification summary:** Vercel (frontend hosting) = PaaS; Vercel (backend hosting) = PaaS; Supabase (PostgreSQL) = SaaS.

### Screenshots to place here
| # | Screenshot | What it proves |
|---|-----------|----------------|
| 2.1 | The architecture diagram (`.drawio` rendered or exported PNG) | Architecture diagram deliverable |
| 2.2 | `kubectl get ns` showing both `aws-simulation` and `gcp-simulation` | Two namespaces exist |
| 2.3 | `kubectl -n aws-simulation get all` (pods + services Running) | AWS namespace has deployed resources |
| 2.4 | `kubectl -n gcp-simulation get all` (pods + services Running) | GCP namespace has deployed resources |
| 2.5 | `kubectl -n aws-simulation get all` AND `kubectl -n gcp-simulation get all` side by side (each lists only its own pods) | Isolation between namespaces |
| 2.6 | Browser showing `http://localhost:8080` (aws **frontend** port-forward) returning the "Simulated on AWS (EKS) / Namespace: aws-simulation" page | AWS frontend Service responds |
| 2.7 | Browser showing `http://localhost:5001` (gcp **backend** port-forward) returning the gcp JSON (`{"status":"ok","namespace":"gcp-simulation",...}`) | GCP backend Service responds |

---

## Task 3 - Review Service, Serverless Function & Architecture Decision Record

### Deliverables
The URL of the deployed review service, the serverless function in working order, and the architecture decision record.

### URLs & Documents
| Component | URL / File |
|-----------|-----------|
| Review Service | https://review-service-three.vercel.app |
| Welcome-email serverless function | https://eyouth-emailservice.vercel.app |
| Architecture Decision Record | [`EYOUTH-30912011609418-ShopSphere-Task3/EYOUTH-30912011609418-ShopSphere-ADR.md`](EYOUTH-30912011609418-ShopSphere-Task3/EYOUTH-30912011609418-ShopSphere-ADR.md) |

- **Review extraction:** reviews now live **only** in the review service; they are removed from the main backend schema. ShopSphere shows reviews through the REST proxy.
- **Serverless welcome email:** the backend POSTs `{ email, name }` fire-and-forget to `EMAIL_SERVICE_URL` after registration.

### Screenshots to place here
| # | Screenshot | What it proves |
|---|-----------|----------------|
| 3.1 | Review service URL opening in a browser returning review data/stats (e.g. `/api/reviews/stats` → `200`) | Review service is deployed and working |
| 3.2 | A product page in ShopSphere showing reviews retrieved from the review service | Reviews are shown via the microservice REST interface |
| 3.3 | The welcome-email function responding `200 {"message":"Welcome email sent"}` (browser/curl on `https://eyouth-emailservice.vercel.app`) | The serverless function works |
| 3.4 | A freshly received **"Welcome" email** in the inbox after registering a new account | The serverless function sends emails end-to-end |
| 3.5 | The ADR document (already a repo file, nothing to run) | Architecture decision record is present |

---

## Task 4 - CI/CD Pipeline, Logging, Rollback Plan & Project Sharing

### Deliverables
The pipeline on the repository, the rollback plan document, and the project links document.

### Documents
| Component | URL / File |
|-----------|-----------|
| CI/CD pipeline | [`../.github/workflows/ci.yml`](.github/workflows/ci.yml) (this repository) |
| Rollback plan | [`EYOUTH-30912011609418-ShopSphere-Task4/EYOUTH-30912011609418-ShopSphere-rollback.md`](EYOUTH-30912011609418-ShopSphere-Task4/EYOUTH-30912011609418-ShopSphere-rollback.md) |
| This links / sharing document | this file ([`EYOUTH-30912011609418-ShopSphere.md`](EYOUTH-30912011609418-ShopSphere.md)) |

- **Pipeline:** GitHub Actions installs, builds, and tests, then deploys to production on a merge into `main`. Three environments exist: **development, staging, production**, each with its own variables.
- **Secrets:** stored as GitHub Actions secrets; no credential appears in the workflow file or run logs (values are masked/absent).
- **Branch protection:** `main` requires the `Install, Build & Test` status check to pass before a merge.
- **Structured logging:** request and error logs carry an ISO timestamp and a severity level (`INFO`, `WARN`, `ERROR`); read in production at **Vercel Dashboard → `eyouth-shopsphere-api` → Logs (Runtime Logs)**.

### Screenshots to place here
| # | Screenshot | What it proves |
|---|-----------|----------------|
| 4.1 | Green GitHub Actions run on `main`: `Install, Build & Test` ✅ and `Deploy to Production` ✅ | A complete pipeline run reached production |
| 4.2 | Inside the `Deploy to Production` job logs showing secret references as `***` (or absent) - search finds no real token | No credential appears in the run logs |
| 4.3 | GitHub **Settings → Environments** showing `development`, `staging`, `production` | Three environments exist |
| 4.4 | GitHub **Settings → Rules (Rulesets)** on `main` requiring the `Install, Build & Test` check | Main is branch-protected |
| 4.5 | The `EYOUTH-30912011609418-ShopSphere-rollback.md` document (already a repo file, nothing to run) | Rollback plan is present and one page |
| 4.6 | The code/editor showing `logger.info(field)`/`logger.error(...)` uses or the relevant logging section of the README | Structured logging is implemented |

---

## All Project URLs in One Table

| Component | URL |
|-----------|-----|
| Application (Frontend) | https://eyouth-shopsphere.vercel.app |
| Backend API | https://eyouth-shopsphere-api.vercel.app |
| Health check (backend) | https://eyouth-shopsphere-api.vercel.app/api/health |
| Review Service | https://review-service-three.vercel.app |
| Health check (review service) | https://review-service-three.vercel.app/api/health |
| Welcome-email serverless function | https://eyouth-emailservice.vercel.app |
| Monitoring (UptimeRobot public status) | https://stats.uptimerobot.com/VE47gDJ9Jt |
| Repository | https://github.com/Mo-Ghobashy/EYOUTH-30912011609418-ShopSphere |

---

## The Five Final Checks (before Submit)

1. **Every file, document, and repository has a name matching the naming convention** (`EYOUTH-30912011609418-ShopSphere`). ✅
2. **The application and the review service both open from their public URLs.** ✅
3. **This links document holds all three URLs and opens for anyone with the link.** ✅
4. **No secret value appears in the repository or in the pipeline run logs.** ✅
5. **The rubric has been worked through item by item alongside the work.** ✅
