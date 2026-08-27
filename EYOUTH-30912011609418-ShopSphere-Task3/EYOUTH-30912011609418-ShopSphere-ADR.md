# Architecture Decision Record — EYOUTH-30912011609418-ShopSphere

## Decision 1: Extract Reviews into an Independent Microservice

**What was moved:** The reviews functionality — listing reviews for a product, creating new reviews, and computing review statistics — was extracted from the main Express backend into a standalone review service with its own codebase, Prisma schema, and Vercel deployment at its own URL.

**Why reviews were a suitable candidate for extraction:** Reviews are a self-contained domain with clear boundaries. They have their own data model (Review), their own API surface (list, create, stats), and no complex dependencies on other parts of the application beyond reading product and user IDs for validation. The main application interacts with reviews through a small, well-defined REST interface, making the extraction straightforward. Extracting reviews allows the review service to be scaled, deployed, and updated independently of the main application — for example, review traffic during a product launch does not affect checkout or authentication performance.

## Decision 2: Move Welcome Emails to a Vercel Serverless Function

**What was moved:** The welcome email sent after user registration was moved from a synchronous call inside the main application's registration flow to a standalone Vercel serverless function (`api/send-welcome-email.ts`). The main backend now calls this function fire-and-forget after creating the user, rather than awaiting SMTP transmission in the request path.

**Why serverless suits this workload:** Welcome emails are I/O-bound, sporadic, and non-critical — they depend on an external SMTP server, happen only at registration time (low frequency), and a failure should not block the user from completing registration. Serverless is the natural fit because the function runs only when invoked, scales to zero when idle, requires no always-on server, and a failure in the email function does not affect the main application's availability or response time.
