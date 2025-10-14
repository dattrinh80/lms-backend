# Role-Based Profile Management Flow

This document outlines the REST APIs that support creating base users and attaching role-specific information (student, teacher, parent) in the LMS backend.

## 1. Create the base user

```
POST /v1/users
```

Payload contains credentials (`email`, `password`, `displayName`) and an array of roles. The response returns the newly created `userId`. No role-specific data is stored at this stage.

## 2. Student profile orchestration

```
POST   /v1/admin/users/{userId}/student-profile
GET    /v1/admin/users/{userId}/student-profile
PATCH  /v1/admin/users/{userId}/student-profile
DELETE /v1/admin/users/{userId}/student-profile
```

These endpoints require the caller to have the `ADMIN` role (enforced through `RolesGuard`). The payload allows you to:

- Provide student metadata (`code`, custom key-value data).
- Link existing parent accounts (`parentId`, `relationship`, `isPrimary`, `status`).
- Create new parent accounts on the fly (email, display name, password, optional contact details). New parents are provisioned as users with the `PARENT` role and automatically linked to the student.
- Update or remove parent links after the fact.

The response returns the student profile plus the list of linked parents (including contact info and relationship metadata).

## 3. Teacher profile orchestration

```
POST   /v1/admin/users/{userId}/teacher-profile
GET    /v1/admin/users/{userId}/teacher-profile
PATCH  /v1/admin/users/{userId}/teacher-profile
DELETE /v1/admin/users/{userId}/teacher-profile
```

Also restricted to admins. The payload stores teacher-specific fields (bio and metadata). These endpoints manage the `Teacher` aggregate without mixing in parent or student behaviour.

## 4. Parent profile/portal

- Administrative parent management continues via existing endpoints (`/v1/admin/parents/...`).
- Parents log in with the `PARENT` role and access their children’s learning data through the parent portal routes (`/v1/parent/...`).

## Architectural notes

- `IdentityModule` keeps user creation/authentication logic.
- `StudentsModule` owns student profiles and coordinates with `ParentsModule` for guardian links.
- `TeachersModule` owns teacher profiles.
- `ParentsModule` encapsulates parent aggregates and parent-student link invariants.
- Transactions covering multiple aggregates are orchestrated inside application services (e.g., linking parents after a student record is created).

This separation keeps the system aligned with DDD: each bounded context controls its own entities, while application services coordinate cross-cutting workflows required by the UI.***
