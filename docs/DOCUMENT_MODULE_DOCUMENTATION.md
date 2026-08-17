# EGKMS — Document Management Module Documentation

## 1. Module Overview

The Document Management module is responsible for creating, viewing, updating, versioning, archiving, restoring, and deleting documents according to the EGKMS access-control and lifecycle rules.

The module works together with the Workflow module:

```text
Document
   ↓
DRAFT
   ↓
Submit for Review
   ↓
Workflow
   ↓
Revision / Approval / Rejection
   ↓
Document Lifecycle
   ↓
Published / Active / Archived
```

The Document module does **not** duplicate workflow routing logic. Reviewer assignment, approval, return, rejection, resubmission, reminders, escalation, and final workflow approval remain in the Workflow module.

---

# 2. Module Files

```text
document/
├── document.model.js
├── documentVersion.model.js
├── document.validator.js
├── document.service.js
├── document.controller.js
└── document.routes.js
```

### Responsibility

| File | Responsibility |
|---|---|
| `document.model.js` | Main document schema |
| `documentVersion.model.js` | Stores previous/current document versions |
| `document.validator.js` | Validates request data |
| `document.service.js` | Business logic and database operations |
| `document.controller.js` | Handles HTTP requests/responses |
| `document.routes.js` | Defines endpoints and middleware |

---

# 3. Request Flow

All protected Document APIs follow this general flow:

```text
Frontend / Postman
        ↓
Route
        ↓
authenticate
        ↓
accessControl(resource, action)
        ↓
Validation
        ↓
Controller
        ↓
Service
        ↓
MongoDB / File Storage
        ↓
Response
```

The frontend should not contain business rules such as reviewer routing or version-number calculation.

---

# 4. Authentication

The Document module uses the existing EGKMS authentication system.

Protected requests require:

```text
authenticate
```

The project uses the existing HttpOnly-cookie authentication flow.

Frontend example:

```javascript
await axios.get("/api/v1/document", {
  withCredentials: true
});
```

Do not manually calculate or manage the access/refresh token in the Document module.

---

# 5. Access Control

Document routes use the existing ACL pattern:

```javascript
accessControl("DOCUMENT", "ACTION")
```

Expected permission actions include:

```text
DOCUMENT.CREATE
DOCUMENT.VIEW
DOCUMENT.EDIT
DOCUMENT.DELETE
DOCUMENT.ARCHIVE
DOCUMENT.RESTORE
```

The actual Permission and RolePermission records must exist in the database before these protected endpoints can be used.

The Document module must not bypass the project's existing ACL system with hard-coded role checks unless explicitly required by the FRS.

---

# 6. API Summary

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/document` | Create document |
| `GET` | `/document` | Get accessible documents |
| `GET` | `/document/:documentId` | Get one document |
| `PATCH` | `/document/:documentId` | Update document + create new version |
| `GET` | `/document/:documentId/versions` | Get version history |
| `PATCH` | `/document/:documentId/status` | Lifecycle/status transition |
| `PATCH` | `/document/:documentId/archive` | Archive document |
| `PATCH` | `/document/:documentId/restore` | Restore archived document |
| `DELETE` | `/document/:documentId` | Delete according to access/lifecycle rules |

---

# 7. Create Document

## Endpoint

```http
POST /api/v1/document
```

## Authentication

Required.

## Content Type

```text
multipart/form-data
```

## Form Fields

```text
file          → File
title         → Document title
description   → Document description
documentType  → Example: POLICY
department    → Department MongoDB _id
team          → Team MongoDB _id
```

Example:

```text
title:
Employee Leave Policy

description:
Company employee leave policy

documentType:
POLICY

department:
6a7178421c73966a2997d72b

team:
6a79a5240bfaf71ffa3e23d7

file:
EmployeeLeavePolicy.pdf
```

## Important Rules

Do not send these backend-controlled values:

```text
owner
createdBy
status
currentVersion
```

The backend determines them.

## Initial State

A newly created document starts as:

```text
status = DRAFT
currentVersion = v1.0
```

---

# 8. Department and Team References

The frontend must send MongoDB ObjectIds.

Correct:

```text
department = 6a7178421c73966a2997d72b
team       = 6a79a5240bfaf71ffa3e23d7
```

Incorrect:

```text
department = Information Technology
team       = Frontend Engineering
```

The backend validates that the selected Team belongs to the selected Department.

---

# 9. Get Documents

## Endpoint

```http
GET /api/v1/document
```

## Purpose

Returns documents accessible to the authenticated user according to the existing access-control implementation.

The API also supports search/filter/pagination parameters where implemented.

Example:

```http
GET /api/v1/document?page=1&limit=10
```

Possible filters:

```text
search
documentType
status
department
team
page
limit
```

The frontend should not assume that the user can see every document in the database.

---

# 10. Get Document by ID

## Endpoint

```http
GET /api/v1/document/:documentId
```

Example:

```http
GET /api/v1/document/6a7f011ae39b2059de652fcd
```

## Purpose

Returns the requested document after authentication and access-control checks.

The frontend can use this endpoint for:

```text
Document Details
Document Preview
Edit Screen
Workflow Information
Version Information
```

---

# 11. Update Document

## Endpoint

```http
PATCH /api/v1/document/:documentId
```

## Content Type

If a replacement file is supplied:

```text
multipart/form-data
```

## Example

```text
title:
Employee Leave Policy - Updated

description:
Updated company employee leave policy with revised leave rules

documentType:
POLICY

department:
6a7178421c73966a2997d72b

team:
6a79a5240bfaf71ffa3e23d7

file:
UpdatedLeavePolicy.pdf
```

## Important Rules

The frontend must not send:

```text
owner
createdBy
currentVersion
```

The backend controls these values.

The frontend should use the Document MongoDB `_id` in the URL.

---

# 12. Update and Version Creation

Every successful document modification creates a new version.

Example:

```text
v1.0
 ↓ PATCH
v1.1
 ↓ PATCH
v1.2
```

The old version is preserved in `DocumentVersion`.

The current Document record represents the latest version.

The frontend must use the `currentVersion` returned by the backend instead of calculating the next version itself.

---

# 13. Revision and Update Flow

When a reviewer returns a document:

```text
PENDING_REVIEW
      ↓
RETURN
      ↓
REVISION
      ↓
Document Owner
      ↓
PATCH Document
      ↓
New Version
      ↓
Resubmit
      ↓
PENDING_REVIEW
```

Example:

```text
v1.0
 ↓ reviewer returns
REVISION
 ↓ owner updates
v1.1
 ↓ resubmit
PENDING_REVIEW
```

Document update and Workflow resubmission are separate API operations.

---

# 14. Version History

## Endpoint

```http
GET /api/v1/document/:documentId/versions
```

## Purpose

Returns the version history for the document.

Example:

```text
v1.0
v1.1
v1.2
```

Each version can contain information such as:

```text
version
fileUrl
filePublicId
fileName
fileType
fileSize
createdBy
createdAt
```

The purpose is to preserve historical versions instead of overwriting them.

---

# 15. Status / Lifecycle

The Document model supports lifecycle states such as:

```text
DRAFT
SUBMITTED
REVIEW
REVISION
APPROVED
PUBLISHED
ACTIVE
AMENDMENT
ARCHIVED
```

Important:

Workflow states and Document lifecycle states are not the same thing.

Workflow handles:

```text
PENDING_REVIEW
REVISION
REJECTED
COMPLETED
```

Document handles its document lifecycle.

---

# 16. Workflow Integration

The Document module does not decide the next reviewer.

Submission is handled by the Workflow module:

```http
POST /api/v1/workflow/:documentId/submit
```

Flow:

```text
Document
   ↓
Submit
   ↓
Workflow
   ↓
Team Lead
   ↓
Manager
   ↓
Department Head
   ↓
Executive
   ↓
Governance
   ↓
Published
```

The Document API should not duplicate this routing.

---

# 17. Archive

## Endpoint

```http
PATCH /api/v1/document/:documentId/archive
```

## Purpose

Moves an eligible document into:

```text
ARCHIVED
```

Archive authorization is controlled through the existing ACL system and lifecycle rules.

The API must not silently archive a document that is currently in an invalid lifecycle state.

---

# 18. Restore

## Endpoint

```http
PATCH /api/v1/document/:documentId/restore
```

## Purpose

Restores an archived document according to the configured lifecycle and authorization rules.

The frontend should refresh the document after a successful restore.

---

# 19. Delete

## Endpoint

```http
DELETE /api/v1/document/:documentId
```

Deletion must respect:

```text
Authentication
        ↓
ACL Permission
        ↓
Document ownership / role rules
        ↓
Lifecycle state
        ↓
Delete operation
```

The system should not casually delete historical versions or audit information.

Where governance rules require preservation, archival is preferred over physical deletion.

---

# 20. File Upload

The current implementation uses:

```javascript
upload.single("file")
```

Therefore the frontend/Postman field name must be:

```text
file
```

Current development upload flow:

```text
Frontend
   ↓
FormData
   ↓
Multer
   ↓
Configured File Storage
   ↓
Document
```

The frontend does not need to directly manage the storage provider.

> The EGKMS FRS identifies a private storage model for controlled document storage. The current development implementation may use the project's configured storage provider. Storage migration should be treated as a separate implementation decision.

---

# 21. Frontend Create Example

```javascript
const formData = new FormData();

formData.append("title", title);
formData.append("description", description);
formData.append("documentType", documentType);
formData.append("department", departmentId);

if (teamId) {
  formData.append("team", teamId);
}

formData.append("file", selectedFile);

await axios.post(
  "/api/v1/document",
  formData,
  {
    withCredentials: true
  }
);
```

Do not manually set the multipart boundary.

---

# 22. Frontend Update Example

```javascript
const formData = new FormData();

formData.append("title", title);
formData.append("description", description);
formData.append("documentType", documentType);
formData.append("department", departmentId);

if (teamId) {
  formData.append("team", teamId);
}

if (selectedFile) {
  formData.append("file", selectedFile);
}

await axios.patch(
  `/api/v1/document/${documentId}`,
  formData,
  {
    withCredentials: true
  }
);
```

After success:

```text
Refresh document
        ↓
Read currentVersion
        ↓
Display latest version
```

---

# 23. Frontend Rules

## Send

```text
department → Department._id
team       → Team._id
documentId → Document._id
file       → selected File
```

## Do not send

```text
owner
createdBy
currentVersion
workflow reviewer
workflow currentLevel
next reviewer
```

These are backend-controlled values.

---

# 24. Error Handling

Frontend should handle:

### 400

Validation or invalid request.

### 401

Authentication required/expired.

### 403

User does not have required permission.

### 404

Document/Department/Team/Version not found.

### 409

Business conflict such as an invalid lifecycle/update condition where returned by the backend.

### 500

Unexpected server error.

Example:

```javascript
try {
  await apiCall();
} catch (error) {
  if (error.response?.status === 401) {
    // Handle authentication
  } else if (error.response?.status === 403) {
    // Show permission error
  } else if (error.response?.status === 404) {
    // Show not found
  }
}
```

---

# 25. Postman Testing Order

Use this order when testing the module:

```text
1. Login
      ↓
2. Create Document
      ↓
3. Get All Documents
      ↓
4. Get Document by ID
      ↓
5. Update Document
      ↓
6. Check currentVersion
      ↓
7. Get Version History
      ↓
8. Submit through Workflow
      ↓
9. Return for Revision
      ↓
10. Update Document
      ↓
11. Check new version
      ↓
12. Resubmit
      ↓
13. Complete Workflow
      ↓
14. Test Archive
      ↓
15. Test Restore
      ↓
16. Test Delete according to permission/lifecycle rules
```

---

# 26. Version Testing Example

Initial response:

```json
{
  "currentVersion": "v1.0"
}
```

After update:

```json
{
  "currentVersion": "v1.1"
}
```

After another update:

```json
{
  "currentVersion": "v1.2"
}
```

Version history should preserve:

```text
v1.0
v1.1
v1.2
```

No previous version should be overwritten.

---

# 27. Complete Module Flow

```text
CREATE
  ↓
DRAFT
  ↓
UPDATE
  ↓
v1.1
  ↓
SUBMIT
  ↓
WORKFLOW
  ↓
REVIEW
  ├── APPROVE
  │      ↓
  │   Next Reviewer
  │
  ├── RETURN
  │      ↓
  │   REVISION
  │      ↓
  │   UPDATE
  │      ↓
  │   New Version
  │      ↓
  │   RESUBMIT
  │
  └── REJECT
         ↓
      REJECTED

Normal final flow:
GOVERNANCE
    ↓
PUBLISHED
    ↓
ACTIVE / COMMENCED
    ↓
AMENDMENT / VERSION UPDATE
    ↓
ARCHIVED
```

---

# 28. Current Implementation Status

```text
Create Document                 ✅
File Upload                     ✅
Department Validation           ✅
Team Validation                 ✅
Owner Assignment                ✅
Draft Creation                  ✅
Get All Documents               ✅
Get Document by ID              ✅
Update Document                 ✅
Owner Update Check              ✅
Revision Update                 ✅
New Version Creation            ✅
Version History                 ✅
Status/Lifecycle API            ✅
Archive                         ✅
Restore                         ✅
Delete Rules                    ✅
Search / Filtering              ✅
Workflow Integration            ✅
ACL Integration                 ✅
```

---

# 29. Responsibility Separation

## Document Module

```text
Document data
File data
Ownership
Department / Team relationship
Document update
Version creation
Version history
Document lifecycle
Archive
Restore
Delete
```

## Workflow Module

```text
Submit
Reviewer routing
Approve
Return
Reject
Resubmit
Reminder
Escalation
Governance approval
Super Admin escalation
Publish
```

## Audit Module

```text
Lifecycle audit
Document action audit
Workflow action audit
Permission changes
User activity
Audit history
```

The Audit module should remain separate and consume/log important actions rather than duplicating Document business logic.

---

# 30. FRS Alignment

This module supports the FRS requirements around:

- Document ownership
- Controlled document creation
- Document editing
- Version control
- Review integration
- Lifecycle management
- Publishing integration
- Archival
- Access control

The FRS also requires auditability of important document and lifecycle actions. Audit logging should therefore be implemented through the dedicated Audit module rather than silently omitted.

---

# 31. Important Developer Notes

1. Do not calculate versions in React.
2. Do not choose reviewers in React.
3. Do not send owner/createdBy from the frontend.
4. Always use MongoDB `_id` for Department and Team references.
5. Refresh document data after update.
6. Refresh workflow data after submit/review/resubmit.
7. Treat `currentReviewer: null` as a valid state.
8. Treat `currentVersion` as backend-controlled.
9. Do not delete old versions during an update.
10. Do not bypass ACL middleware.
11. Do not duplicate Workflow logic inside Document.
12. Do not create audit records from the frontend.

---

# 32. Quick API Reference

```text
POST   /api/v1/document
GET    /api/v1/document
GET    /api/v1/document/:documentId
PATCH  /api/v1/document/:documentId
GET    /api/v1/document/:documentId/versions
PATCH  /api/v1/document/:documentId/status
PATCH  /api/v1/document/:documentId/archive
PATCH  /api/v1/document/:documentId/restore
DELETE /api/v1/document/:documentId
```

Workflow remains separate:

```text
POST /api/v1/workflow/:documentId/submit
GET  /api/v1/workflow/pending
GET  /api/v1/workflow/my-submissions
POST /api/v1/workflow/:workflowId/review
POST /api/v1/workflow/:workflowId/resubmit
```

---

# 33. Final Frontend Mental Model

Frontend developer ko simple rule yaad rakhna hai:

```text
Frontend
   ↓
"What does the user want to do?"
   ↓
Call the correct API
   ↓
Backend
   ↓
"Is the user allowed?"
   ↓
"Is the document in the correct state?"
   ↓
"Should a new version be created?"
   ↓
"Should workflow/lifecycle change?"
   ↓
Return updated data
   ↓
Frontend refreshes UI
```

The backend remains the source of truth for EGKMS business rules.
