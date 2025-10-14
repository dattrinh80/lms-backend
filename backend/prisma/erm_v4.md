# LMS Database Diagram - Version 4 (Parent Engagement Enhancements)

```mermaid
erDiagram
    USER ||--o| STUDENT : mapsTo
    USER ||--o| TEACHER : mapsTo
    USER ||--o| PARENT : mapsTo

    PARENT ||--o{ PARENTSTUDENTLINK : oversees
    STUDENT ||--o{ PARENTSTUDENTLINK : assignedTo

    CLASSSECTION ||--o{ ENROLLMENT : has
    CLASSSECTION ||--o{ CLASSSUBJECT : offers
    CLASSSECTION }o--|| TEACHER : homeroom

    SUBJECT ||--o{ CLASSSUBJECT : catalogues
    TEACHER ||--o{ CLASSSUBJECT : instructs

    CLASSSUBJECT ||--o{ SESSION : schedules
    CLASSSUBJECT ||--o{ ASSIGNMENT : evaluates

    SESSION }o--|| ROOM : heldIn
    SESSION ||--o{ ATTENDANCERECORD : marks

    STUDENT ||--o{ ENROLLMENT : attends
    STUDENT ||--o{ SUBMISSION : submits
    STUDENT ||--o{ INVOICE : billed

    ASSIGNMENT ||--o{ SUBMISSION : receives
    SUBMISSION ||--|| GRADE : scored

    INVOICE ||--o{ INVOICELINE : details
    INVOICE ||--o{ PAYMENT : settled

    USER {
        string id PK
        string email
        string password
        string displayName
        json roles
        string status
        json metadata
        datetime createdAt
        datetime updatedAt
    }

    STUDENT {
        string id PK
        string userId UK
        string code
        json metadata
        datetime createdAt
        datetime updatedAt
    }

    TEACHER {
        string id PK
        string userId UK
        string bio
        json metadata
        datetime createdAt
        datetime updatedAt
    }

    PARENT {
        string id PK
        string userId UK
        string phone
        string secondaryEmail
        string address
        string notes
        json metadata
        datetime createdAt
        datetime updatedAt
    }

    PARENTSTUDENTLINK {
        string id PK
        string parentId FK
        string studentId FK
        string relationship
        boolean isPrimary
        string status
        datetime invitedAt
        datetime linkedAt
        datetime revokedAt
        json metadata
    }

    SUBJECT {
        string id PK
        string code
        string name
        string description
        int defaultDurationMinutes
        json metadata
    }

    CLASSSECTION {
        string id PK
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
        string name
        string location
        int capacity
        json metadata
    }

    SESSION {
        string id PK
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
        string studentId FK
        string classSectionId FK
        string status
        datetime joinedAt
        datetime leftAt
        json metadata
    }

    ATTENDANCERECORD {
        string id PK
        string sessionId FK
        string studentId FK
        string status
        string note
        datetime recordedAt
    }

    ASSIGNMENT {
        string id PK
        string classSubjectId FK
        string title
        string description
        datetime dueDate
        json metadata
        datetime createdAt
    }

    SUBMISSION {
        string id PK
        string assignmentId FK
        string studentId FK
        string type
        json payload
        datetime submittedAt
    }

    GRADE {
        string id PK
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
        string invoiceId FK
        float amount
        string method
        string txRef
        datetime paidAt
        json metadata
    }
```

> Version 4 introduces guardian support. Each parent is a specialized `USER` who links to one or more students via `PARENTSTUDENTLINK`, enabling guardians to monitor attendance, schedules, grades, and invoices without duplicating student records.
