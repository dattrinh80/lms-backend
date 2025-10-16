# Database Schema Overview

This document summarizes the current Prisma data model and highlights the main relationships between entities in the LMS backend.

## User (`User`)

| Field | Type | Attributes | Notes |
| --- | --- | --- | --- |
| `id` | String | `@id`, `@default(cuid())` | Primary key |
| `email` | String | `@unique` | Login identifier, used for invitations |
| `username` | String | `@unique` | Human-friendly, system-wide unique username |
| `password` | String |  | Bcrypt hash |
| `displayName` | String |  | Full name |
| `role` | `UserRole` enum |  | `ADMIN`, `STUDENT`, `TEACHER`, `PARENT`, `HUMAN_RESOURCES` |
| `status` | String | `@default("active")` | One of `active`, `inactive`, `invited` |
| `metadata` | Json | Optional | Flexible key/value store |
| `phoneNumber` | String | Optional | Normalized string |
| `dateOfBirth` | DateTime | Optional | Birth date (UTC) |
| `createdAt` | DateTime | `@default(now())` | Creation timestamp |
| `updatedAt` | DateTime | `@updatedAt` | Auto-maintained |

Relationships:

- 1:1 with `Student`, `Teacher`, `Parent` (depending on role).

## Student (`Student`)

| Field | Type | Attributes |
| --- | --- | --- |
| `id` | String | `@id`, `@default(cuid())` |
| `userId` | String | `@unique` |
| `code` | String | `@unique`, optional |
| `metadata` | Json | Optional |
| `createdAt` | DateTime | `@default(now())` |
| `updatedAt` | DateTime | `@updatedAt` |

Relationships:

- `user` → `User` (required, cascade on delete).
- `enrollments` → many `Enrollment`.
- `submissions` → many `Submission`.
- `invoices` → many `Invoice`.
- `attendance` → many `AttendanceRecord`.
- `parents` → many `ParentStudentLink`.

## Teacher (`Teacher`)

| Field | Type | Attributes |
| --- | --- | --- |
| `id` | String | `@id`, `@default(cuid())` |
| `userId` | String | `@unique` |
| `bio` | String | Optional |
| `metadata` | Json | Optional |
| `createdAt` | DateTime | `@default(now())` |
| `updatedAt` | DateTime | `@updatedAt` |

Relationships:

- `user` → `User` (required, cascade on delete).
- `homeroomOf` → many `ClassSection`.
- `classSubjects` → many `ClassSubject`.
- `sessions` → many `Session`.

## Parent (`Parent`)

| Field | Type | Attributes |
| --- | --- | --- |
| `id` | String | `@id`, `@default(cuid())` |
| `userId` | String | `@unique` |
| `phone` | String | Optional |
| `secondaryEmail` | String | Optional |
| `address` | String | Optional |
| `notes` | String | Optional |
| `metadata` | Json | Optional |
| `createdAt` | DateTime | `@default(now())` |
| `updatedAt` | DateTime | `@updatedAt` |

Relationships:

- `user` → `User` (required, cascade on delete).
- `links` → many `ParentStudentLink`.

## Subject (`Subject`)

| Field | Type | Attributes |
| --- | --- | --- |
| `id` | String | `@id`, `@default(cuid())` |
| `code` | String | `@unique` |
| `name` | String |  |
| `description` | String | Optional |
| `defaultDurationMinutes` | Int | Optional |
| `metadata` | Json | Optional |

Relationships:

- `classSubjects` → many `ClassSubject`.

## Class Section (`ClassSection`)

| Field | Type | Attributes |
| --- | --- | --- |
| `id` | String | `@id`, `@default(cuid())` |
| `code` | String | `@unique` |
| `name` | String |  |
| `level` | String | Optional |
| `capacity` | Int | Optional |
| `homeroomTeacherId` | String | Optional |
| `campusId` | String | Optional |
| `metadata` | Json | Optional |
| `startDate` | DateTime | Optional |
| `endDate` | DateTime | Optional |

Relationships:

- `homeroomTeacher` → optional `Teacher`.
- `enrollments` → many `Enrollment`.
- `classSubjects` → many `ClassSubject`.

## Class Subject (`ClassSubject`)

| Field | Type | Attributes |
| --- | --- | --- |
| `id` | String | `@id`, `@default(cuid())` |
| `classSectionId` | String |  |
| `subjectId` | String |  |
| `leadTeacherId` | String | Optional |
| `weeklySessions` | Int | Optional |
| `creditHours` | Int | Optional |
| `status` | String | `@default("active")`, optional |
| `metadata` | Json | Optional |

Relationships:

- Belongs to `ClassSection` and `Subject`.
- `leadTeacher` → optional `Teacher`.
- `sessions` → many `Session`.
- `assignments` → many `Assignment`.

Compound unique: `@@unique([classSectionId, subjectId])`.

## Room (`Room`)

| Field | Type | Attributes |
| --- | --- | --- |
| `id` | String | `@id`, `@default(cuid())` |
| `name` | String | `@unique` |
| `location` | String | Optional |
| `capacity` | Int | Optional |
| `metadata` | Json | Optional |

Relationships:

- `sessions` → many `Session`.

## Session (`Session`)

| Field | Type | Attributes |
| --- | --- | --- |
| `id` | String | `@id`, `@default(cuid())` |
| `classSubjectId` | String |  |
| `teacherId` | String | Optional |
| `roomId` | String | Optional |
| `startsAt` | DateTime |  |
| `endsAt` | DateTime |  |
| `recurrenceId` | String | Optional |
| `metadata` | Json | Optional |

Relationships:

- `classSubject` → `ClassSubject`.
- `teacher` → optional `Teacher`.
- `room` → optional `Room`.
- `attendance` → many `AttendanceRecord`.

Indexes: `startsAt`, `(teacherId, startsAt)`, `(roomId, startsAt)`.

## Enrollment (`Enrollment`)

| Field | Type | Attributes |
| --- | --- | --- |
| `id` | String | `@id`, `@default(cuid())` |
| `studentId` | String |  |
| `classSectionId` | String |  |
| `status` | String | `@default("active")` |
| `joinedAt` | DateTime | `@default(now())` |
| `leftAt` | DateTime | Optional |
| `metadata` | Json | Optional |

Relationships:

- `student` → `Student`.
- `classSection` → `ClassSection`.

Compound unique: `@@unique([studentId, classSectionId])`.

## Attendance Record (`AttendanceRecord`)

| Field | Type | Attributes |
| --- | --- | --- |
| `id` | String | `@id`, `@default(cuid())` |
| `sessionId` | String |  |
| `studentId` | String |  |
| `status` | String |  |
| `note` | String | Optional |
| `recordedAt` | DateTime | `@default(now())` |

Relationships:

- `session` → `Session`.
- `student` → `Student`.

Compound unique: `@@unique([sessionId, studentId])`.

## Assignment (`Assignment`)

| Field | Type | Attributes |
| --- | --- | --- |
| `id` | String | `@id`, `@default(cuid())` |
| `classSubjectId` | String |  |
| `title` | String |  |
| `description` | String | Optional |
| `dueDate` | DateTime | Optional |
| `metadata` | Json | Optional |
| `createdAt` | DateTime | `@default(now())` |

Relationships:

- `classSubject` → `ClassSubject`.
- `submissions` → many `Submission`.

## Submission (`Submission`)

| Field | Type | Attributes |
| --- | --- | --- |
| `id` | String | `@id`, `@default(cuid())` |
| `assignmentId` | String |  |
| `studentId` | String |  |
| `type` | String |  |
| `payload` | Json | Optional |
| `submittedAt` | DateTime | `@default(now())` |

Relationships:

- `assignment` → `Assignment`.
- `student` → `Student`.
- `grade` → optional `Grade`.

Compound unique: `@@unique([assignmentId, studentId])`.

## Grade (`Grade`)

| Field | Type | Attributes |
| --- | --- | --- |
| `id` | String | `@id`, `@default(cuid())` |
| `submissionId` | String | `@unique` |
| `score` | Float |  |
| `maxScore` | Float |  |
| `rubric` | Json | Optional |
| `feedback` | String | Optional |
| `gradedAt` | DateTime | `@default(now())` |
| `gradedBy` | String | Optional |

Relationship:

- `submission` → `Submission`.

---

### Additional Entities

The schema also defines supporting entities such as `Invoice`, `Payment`, `ParentStudentLink`, `ParentPortal*` projections, etc. Their structure follows the same pattern: a primary key, foreign keys back to the core tables, optional metadata, and timestamps. Refer to `prisma/schema.prisma` for the exhaustive list.

---

### Diagram (Conceptual)

```
User (1) ──── Student (0/1)
     ├────── Teacher (0/1)
     └────── Parent (0/1)

Student ─< Enrollment >─ ClassSection ─< ClassSubject >─ Subject
ClassSubject ─< Session ─> Teacher / Room
ClassSubject ─< Assignment ─< Submission ─(1:1)─ Grade
Session ─< AttendanceRecord ─> Student
Parent ─< ParentStudentLink >─ Student
```

This representation should help onboard developers quickly and serve as a reference when evolving the data model.

