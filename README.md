# LMS Backend Scaffold

Modular NestJS monolith scaffolded from `PhanTich_LMS.md`. The project now targets **single-tenant** deployments (one instance per training center) with clear bounded contexts and hexagonal architecture layers so the team can start iterating on MVP use cases immediately.

## Repository Layout
- `backend/` – NestJS application source.
- `docs/` – Architecture notes & diagrams (Mermaid).
- `PhanTich_LMS.md` – Product and architecture analysis (source document).

See `docs/architecture.md` for diagrams and component relationships.

## Getting Started

### Prerequisites
- Node.js 20.x (LTS) and npm 10.x
- MySQL 8.x (preferred) or a compatible database; update `DATABASE_URL` accordingly.
- Redis (cache, queues), RabbitMQ/MinIO optional for later phases.
- Git, Nest CLI (`npm i -g @nestjs/cli`) recommended for developer tooling.

### Installation
```bash
cd backend
npm install
npx prisma generate
```

Copy the example environment config:
```bash
cp .env.example .env
```
Update secrets (`JWT_*`) and service endpoints before running locally.

### Database
- Apply schema migrations:
  ```bash
  npx prisma migrate deploy
  ```
- Generate Prisma Client whenever the schema changes:
  ```bash
  npx prisma generate
  ```
- Seed sample data (admin/teacher/student, demo class & schedule):
  ```bash
  npm run db:seed
  ```
- Prisma schema lives at `backend/prisma/schema.prisma` and mirrors the `erm_v3` single-tenant data model.

### Running the App
```bash
# development with hot reload
npm run start:dev

# production build
npm run build
npm run start
```

Swagger documentation is served at `http://localhost:3000/docs`. API routes are prefixed with `/api`.

### Testing
```bash
npm run lint
npm run test
npm run test:e2e
```

## Environment Variables
Key settings are documented in `.env.example`. Highlights:
- `DATABASE_URL` – MySQL connection string for the instance database.
- `SHADOW_DATABASE_URL` – root connection used by Prisma when generating migrations.
- `JWT_*` – Access/refresh token secrets and TTLs.
- `REDIS_URL`, `BULL_REDIS_URL`, `RABBITMQ_URL` – infrastructure endpoints.
- File storage, observability, and payments placeholders for later integration.

## Module Overview
Each bounded context lives under `src/modules/<context>` with `domain`, `application`, `infrastructure`, and `presentation` slices.

| Module | Purpose |
| --- | --- |
| `auth` | Authentication, JWT strategies, login flow. |
| `identity` | User directory, teacher/student profiles. |
| `curriculum` | Subject catalog management. |
| `classrooms` | Class sections, room inventory, subject assignments. |
| `scheduling` | Session scheduling and timetable queries. |
| `attendance` | Attendance tracking & reporting. |
| `learning` | Assignments, submissions, grading flows. |
| `finance` | Invoicing and payments. |
| `ai` | AI-assisted experiences (stubs for future ML integration). |

## Hexagonal Structure
- **Presentation** (`presentation/http`) – Controllers and DTOs.
- **Application** (`application/services|commands|queries`) – Use cases / CQRS handlers.
- **Domain** (`domain/entities|services`) – Aggregate roots, domain services.
- **Infrastructure** (`infrastructure/*`) – Adapters (DB, HTTP, messaging).

Cross-cutting utilities live under `src/common` (`decorators`, `middleware`, etc.). Global providers:
- `AllExceptionsFilter` formats API errors consistently.
- `RequestContextMiddleware` attaches a request ID for tracing.

## Next Steps
1. Flesh out Prisma models, migrations, and repositories per module.
2. Replace stub services with actual application logic & CQRS handlers.
3. Implement RBAC and fine-grained authorization around class/subject ownership.
4. Configure infra services (Redis/BullMQ, MinIO, observability stack) as the MVP grows.
5. Extend documentation with sequence diagrams and per-module ADRs as decisions are made.

Refer to `docs/architecture.md` for deeper context, deployment targets, and planned evolution paths.
