# ShopSphere Rollback Plan

**Student ID:** EYOUTH-30912011609418

## 1. Detecting a Failed Release

A release is considered failed when the monitoring configured in Task 1 flags a problem.

**Detection instruments (UptimeRobot):**
- The backend health endpoint (`https://eyouth-shopsphere-api.vercel.app/api/health`) is monitored and alerts on downtime or non-200 responses.
- The review service health endpoint (`https://review-service-three.vercel.app/api/health`) is monitored the same way.
- Alerts arrive by email from UptimeRobot within the check interval (set to check every 5 minutes).

**Signals of a failed release:**
- Health check returns non-200 / unreachable.
- Any one of the three services (frontend, backend, review service) fails its health check right after a deployment.

**Readiness:** The deployer confirms the release is bad by opening the Vercel production URL and the health endpoints directly before starting rollback.

## 2. Restoring the Previous Working Version

These are the steps carried out at the moment of the problem. One service at a time, only for the service(s) that failed.

1. Open the **Vercel dashboard** → select the affected project
   (frontend `eyouth-shopsphere`, backend `eyouth-shopsphere-api`, or review service `review-service-three`).
2. Go to **Deployments**.
3. Identify the **most recent deployment marked as Production** that is known to be working
   (the one before the failed deploy — green check, matching the previous healthy state).
4. Click the **⋯** (ellipsis) menu on that working deployment.
5. Select **"Promote to Production"** (for the deployment) — this restores the previous working version.
6. Wait for the promotion to finish (the deployment banner shows a new production build).

## 3. Verifying the Rollback

1. Re-check the health endpoint(s): `https://eyouth-shopsphere-api.vercel.app/api/health` and review service health — expect `200` with `{"status":"ok",...}`.
2. Load the frontend production URL and confirm pages load correctly.
3. Confirm **UptimeRobot** shows the endpoint recovered (no new alert).

If other services are still healthy, no further action is needed for them — only the failed service is rolled back.
