# EYOUTH-30912011609418-ShopSphere-email

Standalone Vercel serverless function that sends the ShopSphere welcome email.

This workload is **outside** the main Express API. After registration, the backend
POSTs `{ email, name }` to this function (`EMAIL_SERVICE_URL`) and does not wait
for SMTP.

## Deploy

1. Create a new Vercel project with root directory `EYOUTH-30912011609418-ShopSphere-email`.
2. Set SMTP env vars on that project: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.
3. Set `EMAIL_SERVICE_URL` on the **backend** Vercel project to this function's URL
   (no trailing slash), e.g. `https://your-email-project.vercel.app`.
4. Add GitHub secret `VERCEL_PROJECT_ID_EMAIL` (and `VERCEL_PROJECT_ID_EMAIL_STAGING` if you use staging).

## Local

```bash
cd EYOUTH-30912011609418-ShopSphere-email
npm install
npx vercel dev
```
