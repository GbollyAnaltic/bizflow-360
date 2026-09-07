# BizFlow 360 Backend

ASP.NET Core 8 REST API with PostgreSQL persistence for the BizFlow 360 small-business operations platform.

## Business capabilities

- Products with unique SKUs, pricing, reorder levels, and archival
- Customers with unique email addresses and contact information
- Inventory adjustments with an immutable transaction history
- Transactional order creation with stock validation and automatic deduction
- Order cancellation with automatic inventory restoration
- Dashboard totals calculated from persisted business data
- OpenAPI/Swagger documentation and database health checks

## Run with Docker

From the repository root:

```bash
docker compose up --build
```

- API: http://localhost:8080
- Swagger: http://localhost:8080/swagger
- Health: http://localhost:8080/health
- PostgreSQL: localhost:5432

The database receives realistic seed products and customers on its first startup.

## Run tests

```bash
dotnet test backend/BizFlow.Backend.sln
```

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET/POST | `/api/products` | Search and create products |
| GET/PUT/DELETE | `/api/products/{id}` | Read, update, or archive a product |
| GET/POST | `/api/customers` | Search and create customers |
| GET/PUT | `/api/customers/{id}` | Read or update a customer |
| POST | `/api/inventory/products/{id}/adjustments` | Add or remove stock |
| GET | `/api/inventory/transactions` | Review inventory audit history |
| GET/POST | `/api/orders` | Search and create orders |
| PATCH | `/api/orders/{id}/status` | Change order status or cancel an order |
| GET | `/api/dashboard/summary` | Get live operational totals |

## Configuration

Set production secrets with environment variables. Never commit real passwords.

```text
ConnectionStrings__Postgres=Host=...;Database=...;Username=...;Password=...
Cors__AllowedOrigins__0=https://your-frontend.example
```

The committed password is for local Docker development only.

## Deploy to Render

The repository includes `render.yaml`, which creates the Docker API and PostgreSQL database together.

1. In Render, choose **New > Blueprint**.
2. Connect `GbollyAnaltic/bizflow-360`.
3. Render detects `render.yaml`; approve the two resources.
4. After deployment, copy the API service URL.
5. In Vercel, add `NEXT_PUBLIC_API_URL` with that URL and redeploy the frontend.

Render supplies `DATABASE_URL` securely. The API converts the managed PostgreSQL URL to an Npgsql connection string during startup.
