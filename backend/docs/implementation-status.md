# LMS Backend Implementation Status (Dev Snapshot)

_Last updated: 2025-10-14_

This report highlights the modules, primary use cases, and current status of the backend implementation. It focuses on the functionality that has been implemented or touched during development to date.

---

## Module Overview

| Module | Key Responsibilities | Current Status | Notes / Next Steps |
| ------ | -------------------- | -------------- | ------------------ |
| **Auth** | Local login, JWT issuance & refresh, logout | ✅ Login/refresh/logout endpoints implemented with guards and role support | Token revocation still stateless (logout is acknowledgment only) |
| **Identity** | Base user management | ✅ Admin-protected CRUD (`/v1/users`) | Consider aggregated endpoints that call new role-specific flows to reduce multi-step UI work |
| **Parents** | Parent accounts, links to students, parent portal | ✅ Transactional create/update; admin CRUD; parent portal endpoints; Postman collection | Potential TODO: cascade behaviour on parent deletion / audit logging |
| **Students** | Student profiles, guardian orchestration | ✅ Atomically creates student user/profile/parent links; admin endpoints for user + profile management | Evaluate delete behaviour (currently removes student but not parent user) |
| **Teachers** | Teacher profiles | ✅ Atomically creates teacher user/profile; admin profile CRUD | Similar to students—consider revisiting delete semantics for linked data |
| **Scheduling / Learning / Finance** | Existing baseline stubs | ➖ No changes in this iteration | Future work will need richer implementations |
| **Observability** | Logging, tracing, metrics | ✅ pino logging, conditional tracing, Prometheus metrics | Ensure tracing settings match production deployment |
| **Infrastructure / Config** | Environment validation, CORS handling | ✅ Dynamic CORS config (open by default in dev); Prisma migrations pending for new tables | Generate & run migration for parent/student/teacher expansions before release |

---

## Auth Module

- **Endpoints**  
  - `POST /v1/auth/login` – Local strategy, stores access & refresh tokens; Postman tests capture tokens into environment.  
  - `POST /v1/auth/refresh` – Issues new tokens after verifying refresh token.  
  - `POST /v1/auth/logout` – JWT-guarded acknowledgment (no blacklist yet).
- **Guards & Decorators**  
  - `JwtAuthGuard`, `RolesGuard`, `@Roles()` decorator exported for reuse across modules.
- **Outstanding considerations**  
  - Add refresh token revocation / rotation when production-ready security is required.

---

## Identity Module

- **Endpoints** `GET/POST/PATCH/DELETE /v1/users` (admin only).  
- **Role Enforcement** – Controller protected with `JwtAuthGuard` + `RolesGuard('ADMIN')`.  
- **Repository** – Uses Prisma with `$transaction` for `search` to fetch paginated results and count atomically.

---

## Parents Module

- **Admin API**  
  - `POST /v1/admin/parents` – Creates parent user/profile + optional student links atomically.  
  - CRUD endpoints for updating contact info and linking/unlinking students.
- **Parent Portal API**  
  - `GET /v1/parent/dashboard`, `/students`, `/students/:id/*` for schedule, attendance, grades, invoices (requires parent role).
- **Transactions**  
  - Creation & update now use Prisma transactions so user, parent, and link records stay consistent.
- **Postman Assets**  
  - `backend/docs/postman/LMS.postman_collection.json` and `LMS.local.postman_environment.json` capture login tokens automatically.
- **TODO**  
  - Decide on parent deletion strategy (cascade vs. soft delete).  
  - Consider aggregating parent activity metrics.

---

## Students Module

- **Use Case: Create Student User**  
  - `POST /v1/admin/students` – One call creates user, student profile, and optional guardians (existing or new). All steps run in one transaction.
- **Profile Management**  
  - `POST /v1/admin/users/:userId/student-profile`  
  - `PATCH /v1/admin/users/:userId/student-profile`  
  - `DELETE /v1/admin/users/:userId/student-profile`
- **Parent Linking Logic**  
  - New transactional helper handles creation/upsert/delete of parent links inside the same Prisma transaction to avoid orphan records.
- **Next Steps**  
  - Define policy for `deleteProfile` (currently removes student and parent links but not the parent users).  
  - Once migrations are generated, ensure seeds include example parent/teacher references.

---

## Teachers Module

- **Use Case: Create Teacher User**  
  - `POST /v1/admin/teachers` – Transactionally creates user + teacher profile.
- **Profile Management**  
  - `POST/PATCH/DELETE /v1/admin/users/:userId/teacher-profile`
- **Implementation Notes**  
  - Only multi-write operations (`createTeacherUser`) use transactions; simple single-write operations use direct Prisma calls.
- **Next Steps**  
  - Align teacher deletion workflow with student cleanup once requirements are clarified.

---

## Cross-Cutting Updates

- **CORS Configuration**  
  - `CORS_ENABLED=true` by default; empty `CORS_ORIGINS` allows any origin for development.  
  - Production can restrict origins via `.env` without code changes.
- **Environment Schema**  
  - `validation.ts` updated to cover new variables; `.env.example` documents defaults.
- **Transactions**  
  - Reviewed across modules to ensure only genuine multi-write flows use Prisma transactions.

---

## Outstanding Work / Reminders

- Generate Prisma migrations reflecting the new `Parent`, `ParentStudentLink`, student/teacher adjustments.  
- Add automated tests (unit/integration) for new transactional use cases.  
- Decide on lifecycle rules for deleting students/teachers/parents to keep related users consistent.  
- Extend seed data once migrations are created to include scenarios for student/teacher/parent creation flows.  
- Plan frontend integration using new single-call endpoints (`/admin/students`, `/admin/teachers`, `/admin/parents`).

---

If you need more detail on any module or want this report in another format, let me know.***
