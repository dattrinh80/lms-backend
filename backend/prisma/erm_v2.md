# LMS Database Diagram – Version 2 (Multi-Subject Scheduling)

```mermaid
erDiagram
    TENANT ||--o{ SUBJECT : catalogues
    TENANT ||--o{ CLASSSECTION : organizes
    TENANT ||--o{ ROOM : owns
    TENANT ||--o{ SESSION : schedules

    CLASSSECTION ||--o{ ENROLLMENT : has
    CLASSSECTION ||--o{ CLASSSUBJECT : offers
    CLASSSECTION }o--|| TEACHER : homeroom

    SUBJECT ||--o{ CLASSSUBJECT : mapped
    TEACHER ||--o{ CLASSSUBJECT : leads

    CLASSSUBJECT ||--o{ SESSION : delivers
    CLASSSUBJECT ||--o{ ASSIGNMENT : evaluates
    CLASSSUBJECT }o--|| TEACHER : leadInstructor

    SESSION }o--|| ROOM : heldIn
    SESSION ||--o{ ATTENDANCERECORD : marks

    STUDENT ||--o{ ENROLLMENT : attends
    STUDENT ||--o{ SUBMISSION : submits
    STUDENT ||--o{ INVOICE : billed

    ENROLLMENT ||--o{ STUDENTSCHEDULE : generates
    SESSION ||--o{ STUDENTSCHEDULE : occurs

    ASSIGNMENT ||--o{ SUBMISSION : receives
    SUBMISSION ||--|| GRADE : evaluated

    INVOICE ||--o{ INVOICELINE : details
    INVOICE ||--o{ PAYMENT : settled

    TENANT {
        string id PK
        string code
        string name
        boolean isActive
        json metadata
        datetime createdAt
        datetime updatedAt
    }

    SUBJECT {
        string id PK
        string tenantId FK
        string code
        string name
        string description
        int defaultDurationMinutes
        json metadata
    }

    CLASSSECTION {
        string id PK
        string tenantId FK
        string code
        string name
        string level
        int capacity
        string homeroomTeacherId FK
        string campusId
        json metadata
        datetime startDate
        datetime endDate
    }

    CLASSSUBJECT {
        string id PK
        string tenantId FK
        string classSectionId FK
        string subjectId FK
        string leadTeacherId FK
        int weeklySessions
        int creditHours
        string status
        json metadata
    }

    ROOM {
        string id PK
        string tenantId FK
        string name
        string location
        int capacity
        json metadata
    }

    SESSION {
        string id PK
        string tenantId FK
        string classSubjectId FK
        string teacherId FK
        string roomId FK
        datetime startsAt
        datetime endsAt
        string recurrenceId
        json metadata
    }

    ENROLLMENT {
        string id PK
        string tenantId FK
        string studentId FK
        string classSectionId FK
        string status
        datetime joinedAt
        datetime leftAt
        json metadata
    }

    STUDENT {
        string id PK
        string tenantId FK
        string userId UK
        string code
        json metadata
        datetime createdAt
        datetime updatedAt
    }

    TEACHER {
        string id PK
        string tenantId FK
        string userId UK
        string bio
        json metadata
        datetime createdAt
        datetime updatedAt
    }

    ATTENDANCERECORD {
        string id PK
        string tenantId FK
        string sessionId FK
        string studentId FK
        string status
        string note
        datetime recordedAt
    }

    ASSIGNMENT {
        string id PK
        string tenantId FK
        string classSubjectId FK
        string title
        string description
        datetime dueDate
        json metadata
        datetime createdAt
    }

    SUBMISSION {
        string id PK
        string tenantId FK
        string assignmentId FK
        string studentId FK
        string type
        json payload
        datetime submittedAt
    }

    GRADE {
        string id PK
        string tenantId FK
        string submissionId UK
        float score
        float maxScore
        json rubric
        string feedback
        datetime gradedAt
        string gradedBy
    }

    INVOICE {
        string id PK
        string tenantId FK
        string studentId FK
        string period
        string status
        float totalAmount
        float outstandingAmount
        datetime issuedAt
        datetime dueDate
        json metadata
    }

    INVOICELINE {
        string id PK
        string invoiceId FK
        string item
        int quantity
        float unitPrice
        float subtotal
        json metadata
    }

    PAYMENT {
        string id PK
        string tenantId FK
        string invoiceId FK
        float amount
        string method
        string txRef
        datetime paidAt
        json metadata
    }

    STUDENTSCHEDULE {
        string id PK
        string tenantId FK
        string studentId FK
        string sessionId FK
        bool isRequired
    }
```

> `CLASSSECTION` maps to the existing `Class` table. `CLASSSUBJECT` introduces the many-to-many between classes and subjects, and `STUDENTSCHEDULE` is a materialized view (or denormalized table) for quick timetable queries.
