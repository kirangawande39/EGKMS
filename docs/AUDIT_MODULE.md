Bilkul bhai. 👍
Ab audit module ka **frontend developer ke liye complete `.md` documentation** bana dete hain, jisme clearly hoga:

* Audit module ka purpose
* Kaun-kaun se modules audit hote hain
* Kaunse actions available hain
* GET API
* Authentication/authorization
* Query filters
* Pagination
* Response structure
* Empty array ka meaning
* Frontend mein audit logs kaise display karne hain
* Metadata ko kaise handle karna hai
* Failed Login intentionally excluded hai

Main ise **direct ready-to-copy Markdown** format mein de raha hoon.

---

# EGKMS — Audit Log Module Documentation

````md
# EGKMS — Audit Log Module

## 1. Document Information

| Field | Details |
|---|---|
| Project | EGKMS (Enterprise Governance & Knowledge Management System) |
| Module | Audit Log |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT stored in HttpOnly Cookie |
| API Testing | Postman |
| Purpose | Track important system activities and changes |

---

# 2. Audit Module Overview

The Audit Log module records important activities performed inside the EGKMS system.

The purpose of this module is to maintain a history of important actions such as:

- User login
- User logout
- Password reset
- Document creation
- Document viewing
- Document editing
- Document version creation
- Document archiving
- Workflow submission
- Workflow approval
- Workflow return
- Workflow rejection
- Workflow resubmission
- Workflow escalation
- Permission changes
- RolePermission changes
- ACL changes
- User creation
- Important user-related changes

The audit logs are stored permanently in the MongoDB database and can be retrieved through the Audit Log GET API.

---

# 3. Audit Modules

The system currently supports the following audit modules:

```text
AUTH
DOCUMENT
WORKFLOW
PERMISSION
USER
````

These values are stored in the `module` field.

---

# 4. AUTH Audit Events

The AUTH module records authentication-related activities.

## Supported Actions

| Action         | Description                              |
| -------------- | ---------------------------------------- |
| LOGIN          | User successfully logged into the system |
| LOGOUT         | User successfully logged out             |
| PASSWORD_RESET | User successfully reset their password   |

### Failed Login

Failed login auditing is intentionally not included in the current audit scope.

Therefore, the frontend should not expect a `FAILED_LOGIN` audit event.

---

# 5. DOCUMENT Audit Events

The DOCUMENT module records important document activities.

## Supported Actions

| Action                   | Description                        |
| ------------------------ | ---------------------------------- |
| DOCUMENT_CREATED         | A new document was created         |
| DOCUMENT_VIEWED          | A document was viewed              |
| DOCUMENT_EDITED          | Document information was edited    |
| DOCUMENT_VERSION_CREATED | A new document version was created |
| DOCUMENT_ARCHIVED        | A document was archived            |

Example:

```json
{
  "module": "DOCUMENT",
  "action": "DOCUMENT_CREATED"
}
```

---

# 6. WORKFLOW Audit Events

The WORKFLOW module records document workflow activities.

## Supported Actions

| Action      | Description                       |
| ----------- | --------------------------------- |
| SUBMITTED   | Document was submitted for review |
| APPROVED    | Document was approved             |
| RETURNED    | Document was returned for changes |
| REJECTED    | Document was rejected             |
| RESUBMITTED | Document was resubmitted          |
| ESCALATED   | Workflow was escalated            |

Example:

```json
{
  "module": "WORKFLOW",
  "action": "APPROVED"
}
```

---

# 7. PERMISSION Audit Events

The PERMISSION module records authorization-related changes.

## Supported Actions

| Action                  | Description                                              |
| ----------------------- | -------------------------------------------------------- |
| PERMISSION_CHANGED      | Permission was created or changed                        |
| ROLE_PERMISSION_CHANGED | RolePermission assignment was changed                    |
| ACL_CHANGED             | ACL rule was created, updated, or its status was changed |

Example:

```json
{
  "module": "PERMISSION",
  "action": "ACL_CHANGED"
}
```

---

# 8. USER Audit Events

The USER module records important user-related changes.

## Supported Actions

| Action       | Description                            |
| ------------ | -------------------------------------- |
| USER_CREATED | New user account was created           |
| USER_CHANGED | Important user information was changed |

`USER_CHANGED` may represent changes such as:

* Email change
* Account status change
* Password reset through User Management
* Reporting manager change
* User deletion

The actual change can be identified from the `metadata` field.

Example:

```json
{
  "module": "USER",
  "action": "USER_CHANGED",
  "metadata": {
    "field": "accountStatus",
    "from": "ACTIVE",
    "to": "SUSPENDED"
  }
}
```

---

# 9. Audit Log Data Structure

Each audit log contains information similar to:

```json
{
  "_id": "audit-log-id",
  "module": "DOCUMENT",
  "action": "DOCUMENT_CREATED",
  "actor": {
    "_id": "user-id",
    "employeeId": "employee-id",
    "email": "user@example.com"
  },
  "actorEmail": "user@example.com",
  "targetId": "document-id",
  "targetType": "Document",
  "description": "Document created successfully.",
  "metadata": {},
  "ipAddress": "::1",
  "userAgent": "PostmanRuntime",
  "createdAt": "2026-08-19T07:41:30.432Z",
  "updatedAt": "2026-08-19T07:41:30.432Z"
}
```

---

# 10. Audit Log Fields

| Field         | Type     | Description                         |
| ------------- | -------- | ----------------------------------- |
| `_id`         | ObjectId | Unique audit log ID                 |
| `module`      | String   | Module that generated the event     |
| `action`      | String   | Action performed                    |
| `actor`       | ObjectId | User who performed the action       |
| `actorEmail`  | String   | Email of the actor                  |
| `targetId`    | ObjectId | ID of the affected resource         |
| `targetType`  | String   | Type of affected resource           |
| `description` | String   | Human-readable description          |
| `metadata`    | Object   | Additional event information        |
| `ipAddress`   | String   | IP address of the request           |
| `userAgent`   | String   | Client/user-agent information       |
| `createdAt`   | Date     | Time when the audit log was created |
| `updatedAt`   | Date     | Last update time                    |

---

# 11. Audit Log API

## Get Audit Logs

### Endpoint

```http
GET /api/audit
```

The exact base URL depends on the environment.

For local development:

```http
GET http://localhost:5000/api/audit
```

---

# 12. Authentication

The Audit API is protected.

The frontend must send the authenticated session.

EGKMS uses JWT authentication with HttpOnly cookies.

The frontend should NOT manually send the JWT token in JavaScript.

The browser automatically sends the HttpOnly authentication cookie with the request.

---

# 13. Authorization

Audit logs contain sensitive system activity.

Therefore, the Audit API is restricted to authorized administrative users.

Current route protection:

```text
Authentication
      ↓
Authorization
      ↓
GET Audit Logs
```

The current implementation allows:

```text
SUPER_ADMIN
```

to access the Audit Logs API.

Unauthorized users should receive:

```http
403 Forbidden
```

---

# 14. Basic GET Request

```http
GET /api/audit
```

Example:

```http
GET http://localhost:5000/api/audit
```

---

# 15. Successful Response

Example:

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "_id": "6a856eda57276a8cea4b366b",
        "module": "AUTH",
        "action": "LOGIN",
        "actor": {
          "_id": "6a709395067edbac89537d0f",
          "employeeId": "6a709395067edbac89537d0e",
          "email": "superadmin@dms.com"
        },
        "actorEmail": "superadmin@dms.com",
        "targetId": "6a709395067edbac89537d0f",
        "targetType": "User",
        "description": "User logged in successfully.",
        "metadata": {},
        "ipAddress": "::1",
        "userAgent": "PostmanRuntime/2.3.0",
        "createdAt": "2026-08-19T08:52:42.168Z"
      }
    ],
    "pagination": {
      "total": 4,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

---

# 16. Important Frontend Rule — Empty Logs

Sometimes the API may return:

```json
{
  "success": true,
  "data": {
    "logs": [],
    "pagination": {
      "total": 0,
      "page": 1,
      "limit": 20,
      "totalPages": 0
    }
  }
}
```

This is NOT an error.

It simply means:

> No audit event exists for the selected filter.

For example:

```http
GET /api/audit?module=WORKFLOW
```

may return an empty array if no workflow action has been performed yet.

The frontend should display something like:

```text
No audit records found.
```

instead of showing an API error.

---

# 17. Filter by Module

The API supports filtering by module.

### AUTH

```http
GET /api/audit?module=AUTH
```

### DOCUMENT

```http
GET /api/audit?module=DOCUMENT
```

### WORKFLOW

```http
GET /api/audit?module=WORKFLOW
```

### PERMISSION

```http
GET /api/audit?module=PERMISSION
```

### USER

```http
GET /api/audit?module=USER
```

---

# 18. Filter by Action

The API also supports action filtering.

Example:

```http
GET /api/audit?action=LOGIN
```

Example:

```http
GET /api/audit?action=DOCUMENT_CREATED
```

Example:

```http
GET /api/audit?action=ACL_CHANGED
```

---

# 19. Multiple Filters

Multiple filters can be used together.

Example:

```http
GET /api/audit?module=DOCUMENT&action=DOCUMENT_CREATED
```

Another example:

```http
GET /api/audit?module=USER&action=USER_CHANGED
```

---

# 20. Pagination

Pagination is supported.

Parameters:

| Parameter | Description                | Default |
| --------- | -------------------------- | ------- |
| `page`    | Page number                | 1       |
| `limit`   | Number of records per page | 20      |

Example:

```http
GET /api/audit?page=1&limit=10
```

Example:

```http
GET /api/audit?page=2&limit=20
```

Maximum supported limit:

```text
100
```

---

# 21. Pagination Response

Example:

```json
"pagination": {
  "total": 45,
  "page": 2,
  "limit": 20,
  "totalPages": 3
}
```

Frontend pagination should use:

```text
total
page
limit
totalPages
```

---

# 22. Other Supported Filters

The API can also filter by:

```text
actor
targetId
targetType
from
to
```

Example:

```http
GET /api/audit?actor=USER_ID
```

Example:

```http
GET /api/audit?targetId=DOCUMENT_ID
```

Example:

```http
GET /api/audit?targetType=Document
```

Date filtering:

```http
GET /api/audit?from=2026-08-01&to=2026-08-19
```

---

# 23. Recommended Frontend Audit Table

The frontend can display the following columns:

| Column      | API Field     |
| ----------- | ------------- |
| Date & Time | `createdAt`   |
| Module      | `module`      |
| Action      | `action`      |
| Actor       | `actor.email` |
| Target Type | `targetType`  |
| Description | `description` |
| IP Address  | `ipAddress`   |
| Details     | `metadata`    |

Example UI:

```text
---------------------------------------------------------------
Date        Module       Action             Actor
---------------------------------------------------------------
19 Aug      AUTH         LOGIN              superadmin@dms.com
19 Aug      DOCUMENT     DOCUMENT_CREATED   user@example.com
19 Aug      WORKFLOW     APPROVED           manager@example.com
---------------------------------------------------------------
```

---

# 24. Metadata Handling

`metadata` is dynamic.

Different audit events can contain different metadata.

For example:

### Document

```json
{
  "title": "Employee Leave Policy",
  "documentType": "POLICY",
  "version": "v1.0"
}
```

### User

```json
{
  "field": "accountStatus",
  "from": "ACTIVE",
  "to": "SUSPENDED"
}
```

### ACL

```json
{
  "hierarchyLevel": "MANAGER",
  "permission": "permission-id",
  "effect": "ALLOW",
  "status": "ACTIVE"
}
```

Therefore, the frontend should NOT assume a fixed metadata structure.

Recommended approach:

```text
Show common fields in the table
       ↓
Show metadata inside a Details / View dialog
       ↓
Render available key-value pairs dynamically
```

---

# 25. Sorting

Audit logs are returned with the newest records first.

The backend uses:

```js
.sort({
  createdAt: -1
})
```

Therefore:

```text
Newest Audit Log
        ↓
Oldest Audit Log
```

The frontend does not need to manually sort the initial response.

---

# 26. Audit Log Security

Audit logs should be treated as sensitive information.

Frontend should:

* Only show the Audit page to authorized users.
* Handle `401 Unauthorized`.
* Handle `403 Forbidden`.
* Never allow normal employees to access audit logs.
* Never expose authentication tokens.
* Never modify audit logs from the frontend.
* Use GET only for reading audit logs.

---

# 27. Error Handling

### 401 Unauthorized

User authentication is missing or invalid.

Frontend should redirect the user to the login flow or refresh the session according to the existing authentication flow.

### 403 Forbidden

The user is authenticated but does not have permission to access audit logs.

Frontend should display:

```text
You do not have permission to view audit logs.
```

### 500 Internal Server Error

Display a generic error message:

```text
Unable to load audit logs. Please try again later.
```

---

# 28. Audit Log is Read-Only for Frontend

The frontend only reads audit logs.

There are currently no frontend operations for:

```text
Create Audit Log
Update Audit Log
Delete Audit Log
```

Audit records are automatically generated by backend business operations.

Example:

```text
User Login
    ↓
Backend
    ↓
createAuditLog()
    ↓
MongoDB AuditLog
```

Similarly:

```text
Document Created
    ↓
Backend
    ↓
createAuditLog()
    ↓
MongoDB AuditLog
```

---

# 29. Current Audit Scope

The current EGKMS audit scope is:

```text
AUTH
├── Login
├── Logout
└── Password Reset

DOCUMENT
├── Created
├── Viewed
├── Edited
├── Version Created
└── Archived

WORKFLOW
├── Submitted
├── Approved
├── Returned
├── Rejected
├── Resubmitted
└── Escalated

PERMISSION
├── Permission Created/Changed
├── RolePermission Changed
└── ACL Changed

USER
├── User Created
└── User-related important changes
```

Failed Login auditing is intentionally excluded from the current scope.

---

# 30. Testing Checklist

The following API tests have been completed:

* [x] GET all audit logs
* [x] Filter by AUTH
* [x] Filter by DOCUMENT
* [x] Filter by WORKFLOW
* [x] Filter by PERMISSION
* [x] Filter by USER
* [x] Filter by action
* [x] Pagination
* [x] Actor information
* [x] Target information
* [x] Metadata
* [x] Empty result handling
* [x] Authentication protection
* [x] Authorization protection

An empty `logs` array is considered a valid response when no matching audit records exist.

---

# 31. Frontend Integration Summary

The frontend mainly needs to implement:

```text
Audit Logs Page
        ↓
GET /api/audit
        ↓
Display logs
        ↓
Module Filter
        ↓
Action Filter
        ↓
Date Filter
        ↓
Pagination
        ↓
View Metadata / Details
```

The frontend does not create audit logs manually.

All audit records are generated by the backend automatically.

---

# 32. Quick API Reference

| Purpose            | Method | Endpoint                                             |
| ------------------ | ------ | ---------------------------------------------------- |
| Get all audit logs | GET    | `/api/audit`                                         |
| Filter module      | GET    | `/api/audit?module=AUTH`                             |
| Filter action      | GET    | `/api/audit?action=LOGIN`                            |
| Filter both        | GET    | `/api/audit?module=DOCUMENT&action=DOCUMENT_CREATED` |
| Pagination         | GET    | `/api/audit?page=1&limit=20`                         |
| Filter actor       | GET    | `/api/audit?actor=USER_ID`                           |
| Filter target      | GET    | `/api/audit?targetId=RESOURCE_ID`                    |
| Filter date        | GET    | `/api/audit?from=2026-08-01&to=2026-08-19`           |

---

# 33. Important Frontend Notes

1. Do not manually send JWT tokens if the existing authentication system uses HttpOnly cookies.

2. Do not create audit logs from the frontend.

3. Do not assume `metadata` has a fixed structure.

4. `logs: []` is a valid successful response.

5. Use `pagination.totalPages` for pagination controls.

6. Display newest logs first.

7. Handle `401` and `403` separately.

8. Audit logs are read-only from the frontend.

9. Do not expose audit management controls to normal users.

10. The Audit page should only be accessible to authorized administrative users.

---

# 34. Final Status

The EGKMS Audit Log module backend implementation is complete for the currently defined audit scope.

The frontend can now consume:

```http
GET /api/audit
```

and build the Audit Logs interface using the documented filters, pagination, actor information, target information, descriptions, and metadata.

```
