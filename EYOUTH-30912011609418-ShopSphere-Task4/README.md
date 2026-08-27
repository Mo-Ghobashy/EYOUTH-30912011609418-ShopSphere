# Task 4 - CI/CD, Logging, Rollback & Sharing - EYOUTH-30912011609418-ShopSphere

Documents for **Task 4** (CI/CD pipeline, structured logging, rollback plan, project sharing).

| File | Purpose |
|------|---------|
| `EYOUTH-30912011609418-ShopSphere-rollback.md` | One-page rollback plan: detect a failed release via the Task 1 monitoring (UptimeRobot), then restore the previous working version. |

**Related (kept at root / elsewhere):**
- `../EYOUTH-30912011609418-ShopSphere.md` - the project links / sharing document (the submission door with all URLs)
- `../.github/workflows/ci.yml` - the GitHub Actions CI/CD pipeline (install, build, test, deploy; three environments)
- Structured logging location: see the root `README.md` (timestamp + severity, read in Vercel Runtime Logs)
