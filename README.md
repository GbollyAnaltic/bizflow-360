# BizFlow 360

A full-stack small-business operations platform for managing products, inventory, orders, customers, payments, and business insights from one workspace.

## Live demo

[Launch BizFlow 360](https://bizflow-360-3t42cfwym-bwiseverse.vercel.app/)

## Why I built it

Small businesses often manage daily operations across paper records, messaging apps, and spreadsheets. This creates lost orders, inaccurate stock counts, missed payments, and limited visibility into business performance.

BizFlow 360 brings those workflows into one reliable platform.

## Current release

- Daily revenue and order metrics
- Seven-day sales visualization
- Low-stock monitoring
- Recent order tracking and search
- Product creation workflow
- Responsive, accessible navigation
- ASP.NET Core 8 REST API for products, customers, inventory, and orders
- PostgreSQL persistence and realistic seed data
- Transactional stock deduction and cancellation restocking
- Backend unit tests, Docker Compose, Swagger, and health checks

## Technology

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Radix UI
- C# / ASP.NET Core 8
- PostgreSQL 16 / Entity Framework Core
- Docker Compose

## Backend

The production-style backend lives in [`backend`](backend). Start the API and PostgreSQL database with:

```bash
docker compose up --build
```

Open Swagger at [http://localhost:8080/swagger](http://localhost:8080/swagger). See the [backend documentation](backend/README.md) for endpoints and configuration.

## Planned engineering work

- Connect the Next.js dashboard to the REST API
- JWT authentication and role-based access
- Stripe test payments
- Redis caching and background events
- Docker and cloud deployment

## QA automation roadmap

- Playwright end-to-end tests
- API and database validation
- Contract and accessibility testing
- k6 performance tests
- OWASP ZAP security scans
- GitHub Actions quality gates

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Connect the frontend to the API

Copy `.env.example` to `.env.local`, then set the address of your ASP.NET Core API:

```text
NEXT_PUBLIC_API_URL=http://localhost:8080
```

The dashboard loads summary totals, recent orders, and low-stock products from PostgreSQL through the API. The Add Product form also saves directly to PostgreSQL.

## Status

Phase 2 is in active development. The dashboard is connected to the core backend, PostgreSQL persistence, and initial QA automation. Authentication, payments, and cloud backend deployment are next.

## Author

[GbollyAnaltic](https://github.com/GbollyAnaltic)
