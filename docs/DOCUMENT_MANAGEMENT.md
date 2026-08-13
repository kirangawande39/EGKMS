# Document Management Module

## 1. Module Overview

The Document Management module handles document creation and file upload
for EGKMS.

Current implemented flow:

``` text
Frontend / Postman
        ↓
Create Document Form
        ↓
Upload File
        ↓
Multer
        ↓
Cloudinary
        ↓
MongoDB Document Record
        ↓
DRAFT
        ↓
v1.0
```

> **Storage Note:** The FRS specifies AWS S3 Private Bucket as the final
> storage technology. Cloudinary is currently being used for
> development/testing. The storage layer should later be moved to S3 for
> final FRS compliance.

------------------------------------------------------------------------

## 2. Create Document API

**Method:** `POST`

**Endpoint:**

``` text
/api/v1/document
```

The API creates a document and stores the uploaded file.

### Authentication

The API requires authentication. The access token is handled through the
existing authentication mechanism/cookie.

Fetch:

``` javascript
fetch("/api/v1/document", {
  method: "POST",
  credentials: "include",
  body: formData
});
```

Axios:

``` javascript
axios.post("/api/v1/document", formData, {
  withCredentials: true
});
```

------------------------------------------------------------------------

## 3. Request Format

Because a real PDF/DOCX file is uploaded, the request must use:

``` text
multipart/form-data
```

In Postman:

``` text
Body → form-data
```

### Fields

  Key              Type   Description
  ---------------- ------ --------------------------
  `file`           File   PDF/DOCX document
  `title`          Text   Document title
  `description`    Text   Document description
  `documentType`   Text   Document type
  `department`     Text   Department MongoDB `_id`
  `team`           Text   Team MongoDB `_id`

Example:

``` text
file          → EmployeeLeavePolicy.pdf
title         → Employee Leave Policy
description   → Company employee leave policy
documentType  → POLICY
department    → DEPARTMENT_OBJECT_ID
team          → TEAM_OBJECT_ID
```

`department` and `team` must contain MongoDB ObjectIds, not names.

If the document has no Team association, `team` can be left empty
according to the current implementation.

------------------------------------------------------------------------

## 4. File Upload

The route uses:

``` javascript
upload.single("file")
```

Therefore the frontend/Postman file key must be exactly:

``` text
file
```

The upload flow is:

``` text
Selected File
     ↓
FormData
     ↓
Multer
     ↓
Cloudinary
     ↓
File URL / Public ID
     ↓
MongoDB Document
```

The frontend does not need to upload the file to Cloudinary directly.

------------------------------------------------------------------------

## 5. Document Ownership

The frontend does **not** send the document owner.

Backend flow:

``` text
Authenticated User
        ↓
User.employeeId
        ↓
Employee
        ↓
Document.owner
```

This follows the FRS rule that every document has exactly one Owner.

The backend also sets `createdBy` from the authenticated User.

------------------------------------------------------------------------

## 6. Department and Team Validation

The backend validates:

``` text
Department
   ↓
Must exist
   ↓
Must be ACTIVE
```

For Team:

``` text
Team
   ↓
Must exist
   ↓
Must be ACTIVE
   ↓
Must belong to selected Department
```

Example:

``` text
Information Technology
        ↓
Backend Engineering
        ↓
Document
```

If the Team does not belong to the selected Department, the API rejects
the request.

------------------------------------------------------------------------

## 7. Initial Document State

After successful creation:

``` text
status = DRAFT
currentVersion = v1.0
```

Create and Submit are separate operations.

``` text
Upload / Create
      ↓
POST /api/v1/document
      ↓
DRAFT
```

Later:

``` text
Submit for Review
      ↓
POST /api/v1/document/:documentId/submit
      ↓
Workflow
```

The Submit/Approval workflow is not part of the current Create API.

------------------------------------------------------------------------

## 8. Example Success Response

``` json
{
  "success": true,
  "message": "Document created successfully",
  "data": {
    "_id": "DOCUMENT_OBJECT_ID",
    "title": "Employee Leave Policy",
    "description": "Company employee leave policy",
    "documentType": "POLICY",
    "owner": "EMPLOYEE_OBJECT_ID",
    "department": "DEPARTMENT_OBJECT_ID",
    "team": "TEAM_OBJECT_ID",
    "fileUrl": "CLOUDINARY_FILE_URL",
    "filePublicId": "CLOUDINARY_FILE_REFERENCE",
    "fileName": "EmployeeLeavePolicy.pdf",
    "fileType": "application/pdf",
    "fileSize": 123456,
    "status": "DRAFT",
    "currentVersion": "v1.0",
    "createdBy": "USER_OBJECT_ID"
  }
}
```

The frontend should use the returned `_id` as the Document ID for future
operations.

------------------------------------------------------------------------

## 9. Frontend Form Example

``` javascript
const formData = new FormData();

formData.append("title", title);
formData.append("description", description);
formData.append("documentType", documentType);
formData.append("department", departmentId);

if (teamId) {
  formData.append("team", teamId);
}

formData.append("file", selectedFile);

await axios.post("/api/v1/document", formData, {
  withCredentials: true
});
```

Do not manually set the `Content-Type` header when using Axios with
`FormData`. The browser handles the multipart boundary.

------------------------------------------------------------------------

## 10. Frontend Responsibilities

``` text
Collect form data
        ↓
Select file
        ↓
Create FormData
        ↓
Call Create Document API
        ↓
Show loading state
        ↓
Handle success/error
        ↓
Refresh document data
```

Frontend should not decide:

``` text
owner
createdBy
status
currentVersion
```

These are controlled by the backend.

------------------------------------------------------------------------

## 11. Current Backend Structure

``` text
document/
├── document.model.js
├── document.validator.js
├── document.service.js
├── document.controller.js
└── document.routes.js
```

Upload support:

``` text
src/
├── config/
│   └── cloudinary.js
└── middleware/
    └── upload.middleware.js
```

Current status:

``` text
Document Model          ✅
Document Validator      ✅
Document Service        ✅
Document Controller     ✅
Document Routes         ✅
Multer                  ✅
Cloudinary Upload       ✅
Create Document API     ✅
DRAFT Creation          ✅
Version v1.0            ✅
Postman Testing         ✅
```

------------------------------------------------------------------------

## 12. Current API Flow

``` text
Authenticated User
        ↓
Create Document Form
        ↓
Select File
        ↓
Click Upload / Create
        ↓
POST /api/v1/document
        ↓
Authentication
        ↓
Multer
        ↓
Cloudinary
        ↓
Joi Validation
        ↓
User → Employee
        ↓
Department Validation
        ↓
Team Validation
        ↓
Document Creation
        ↓
DRAFT
        ↓
v1.0
```

------------------------------------------------------------------------

## 13. Common Errors

### Team not found or inactive

``` json
{
  "success": false,
  "errorName": "Error",
  "message": "Team not found or inactive",
  "errors": []
}
```

Use the actual active `Team._id`, not the Team name.

### Department not found or inactive

Use the actual active `Department._id`.

### File is required

Make sure the request contains:

``` text
Key: file
Type: File
```

### Invalid Department/Team ID

Use a valid MongoDB ObjectId.

------------------------------------------------------------------------

## 14. FRS Alignment

The FRS requires every document to have exactly one owner. The current
implementation derives the owner from the authenticated Employee.

The FRS document lifecycle is:

``` text
Draft
  ↓
Submitted
  ↓
Review
  ↓
Revision
  ↓
Approved
  ↓
Published
  ↓
Active / Commenced
  ↓
Amendment
  ↓
Version Update
  ↓
Archived
```

The current Create API implements only:

``` text
Create Document
      ↓
DRAFT
```

Workflow, approval, version control, audit logging, escalation, and
other lifecycle stages are separate remaining work.

The FRS also requires documents to follow organizational hierarchy
without skipping levels.

------------------------------------------------------------------------

## 15. Next Work

Current:

``` text
Document Create
      ↓
COMPLETED ✅
```

Next:

``` text
Workflow / Submit
      ↓
Approval
      ↓
Version Control
      ↓
Audit Logging
      ↓
Escalation
```

The next workflow must follow the FRS hierarchy, such as:

``` text
Employee
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
```

------------------------------------------------------------------------

## 16. Quick Frontend Reference

``` text
API:
POST /api/v1/document

Request:
multipart/form-data

File key:
file

References:
department → Department._id
team → Team._id

Backend controlled:
owner
createdBy
status
currentVersion

Initial status:
DRAFT

Initial version:
v1.0

Create and Submit:
Separate APIs
```

## 17. Summary

The current Document Create API is ready for frontend integration.

Frontend developers should:

1.  Use `multipart/form-data`.
2.  Send the file using the key `file`.
3.  Send Department and Team MongoDB `_id` values.
4.  Not send owner or backend-controlled fields.
5.  Treat a newly created document as `DRAFT`.
6.  Store/use the returned Document `_id`.
7.  Use a separate Submit-for-Review action when the Workflow API is
    implemented.
