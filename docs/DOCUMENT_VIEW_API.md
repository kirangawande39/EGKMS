Here is your **fully translated English version (clean + unchanged structure)**:

---

# Document View API – Frontend Handoff

## 1. Document Information

**Project:** EGKMS – Enterprise Governance & Knowledge Management System
**Module:** Document Management
**Feature:** Secure Document View API
**Audience:** Frontend Developer
**Document Type:** Frontend Integration / API Handoff

---

## 2. Purpose

The purpose of the Document View API is to allow frontend users to securely view documents/PDFs without exposing the original Cloudinary file URL or Public ID to the frontend.

### API

`GET /api/v1/documents/:documentId/view`

This API is protected through authentication, document view permission, and existing document access scope.

---

## 3. Previous Approach

Previously, Cloudinary information was being sent to the frontend in the document create/get response:

* `fileUrl`
* `filePublicId`

The frontend was directly opening the `fileUrl` to view the PDF.

### Problem

If the Cloudinary URL is publicly accessible, a user can copy and share it with others.

Anyone with the direct Cloudinary URL can access the document outside the normal DMS authentication and authorization flow.

This was not the desired security behavior for the DMS.

---

## 4. Current Approach

Now, `fileUrl` and `filePublicId` will remain stored internally in MongoDB, but they will not be sent in the normal document API response.

These are internal backend fields.

The frontend will only receive normal document details such as:

* Document ID
* Title
* Description
* Document Type
* Owner
* Department
* Team
* File Name
* File Type
* File Size
* Status
* Current Version
* Created By
* Created Date
* Updated Date

But:

* `fileUrl` will NOT be sent to the frontend.
* `filePublicId` will NOT be sent to the frontend.

---

## 5. New Document View API

### Endpoint

`GET /api/v1/documents/:documentId/view`

### Purpose

This API is used to securely display the actual PDF/document in the browser.

The frontend must NOT use Cloudinary URLs directly.

The frontend will call this API only using the document ID.

---

## 6. View API Flow

Complete flow:

```text
Frontend
   ↓
User clicks View button
   ↓
Frontend calls /documents/:documentId/view
   ↓
Backend Authentication Check
   ↓
DOCUMENT → VIEW Permission Check
   ↓
Document Access Scope Check
   ↓
Fetch document from MongoDB
   ↓
Backend internally uses Cloudinary information
   ↓
PDF is retrieved from Cloudinary
   ↓
Backend returns PDF response
   ↓
Browser PDF Viewer displays document
```

---

## 7. Cloudinary URL Will NOT Be Exposed to Frontend

From the normal document API:

`fileUrl` will NOT be included.

`filePublicId` will NOT be included.

Even in the View API, Cloudinary URL will NOT be returned in JSON format.

The View API directly returns the PDF response.

The browser receives PDF data and displays it using the built-in PDF viewer.

---

## 8. Normal Document API vs View API

### Document Details API

**Endpoint:**

`GET /api/v1/documents/:documentId`

**Purpose:**

Fetch document metadata/details.

**Response Type:**

`JSON`

This response will NOT include:

* `fileUrl`
* `filePublicId`

---

### Document View API

**Endpoint:**

`GET /api/v1/documents/:documentId/view`

**Purpose:**

View the actual document/PDF.

**Response Type:**

`PDF`

The document will be displayed in the browser’s built-in PDF viewer.

---

## 9. Authentication

The View API is not public.

The user must pass the existing application authentication.

If authentication fails, the document will not be accessible.

Expected response:

```text
401 Unauthorized
```

The frontend should handle `401` using the existing authentication/refresh flow.

---

## 10. Permission Check

The View API uses existing document permission:

```text
DOCUMENT → VIEW
```

The user must have permission to view the document.

If permission fails:

```text
403 Forbidden
```

The frontend should handle `403` as an access/authorization error.

---

## 11. Document Scope Check

Along with permission, existing document access scope is also applied.

The backend calculates document scope based on the authenticated employee.

This ensures the user can only access documents allowed by DMS rules.

If the document is outside scope, it will not be returned.

Frontend does NOT need to calculate scope.

---

## 12. Cloudinary Information Handling

Internally in MongoDB:

* `fileUrl`
* `filePublicId`

These are NOT part of frontend responses.

The backend uses them internally when fetching the document.

Architecture:

```text
MongoDB → Backend → Cloudinary
```

Cloudinary information is used only in backend internal flow.

Frontend never receives direct Cloudinary URLs.

---

## 13. View API Response

The View API does NOT return JSON.

It returns the actual PDF file.

### Expected Content Type

```text
application/pdf
```

### Content Disposition

```text
inline
```

So the PDF is opened directly in the browser instead of being downloaded automatically.

Frontend should NOT expect `fileUrl` in JSON.

---

## 14. Frontend Integration

Frontend developers must NOT use Cloudinary URLs in document lists/details.

Only the document ID should be used for the View button.

### Example

Document ID:

```text
document._id
```

View API:

```text
/api/v1/documents/{documentId}/view
```

Frontend must NOT:

* Construct Cloudinary URLs
* Store Cloudinary URLs
* Use Cloudinary Public ID
* Use Cloudinary credentials

Frontend only needs the document ID.

---

## 15. Browser PDF Viewing

Frontend can request the View API for browser PDF viewing.

Conceptually:

```text
GET /api/v1/documents/{documentId}/view
```

Backend returns a PDF response.

If the request is made with an authenticated session, backend validates it using existing authentication flow.

Frontend must NOT directly call Cloudinary.

---

## 16. URL Sharing Security

In the old approach, if User A shared a Cloudinary URL, direct access was possible.

In the new architecture, Cloudinary URLs are not exposed to the frontend.

If User A shares the DMS View API URL, the other user must still pass:

* Authentication
* `DOCUMENT → VIEW` permission
* Document access scope

Just having the URL does NOT bypass authorization.

---

## 17. Important Security Note

This architecture hides Cloudinary public URLs from the frontend and controls document access through backend authorization.

However, once an authorized user views the PDF:

* They can take screenshots
* They can record the screen
* They can manually share the file

It is not possible to make browser-rendered content 100% copy-proof.

### Security Objective

> Prevent unauthorized access to documents just by sharing Cloudinary URLs.

---

## 18. Frontend Responsibilities

Frontend developers must:

1. Use Document Details API for metadata.
2. Use View API for document viewing.
3. Do NOT use Cloudinary URLs directly.
4. Do NOT use Cloudinary Public ID.
5. Do NOT store Cloudinary credentials in frontend.
6. Call View API using document ID.
7. Handle `401 Unauthorized` using existing auth flow.
8. Handle `403 Forbidden` as access/permission error.
9. Display PDF response in browser.
10. Do NOT duplicate backend authorization logic in frontend.

---

## 19. Backend Responsibilities

Backend internally:

1. Verifies user authentication.
2. Checks `DOCUMENT → VIEW` permission.
3. Checks document access scope.
4. Fetches document from MongoDB.
5. Uses internal `fileUrl` / `filePublicId`.
6. Retrieves document from Cloudinary.
7. Returns PDF response.
8. Does NOT expose Cloudinary URLs in JSON responses.

---

## 20. Final Architecture

### Document Details

```text
Frontend
   ↓
Document Details API
   ↓
Backend
   ↓
MongoDB
   ↓
Document Metadata JSON
   ↓
Frontend
```

**Cloudinary URL: Not Exposed**

---

### Document View

```text
Frontend
   ↓
Document View API
   ↓
Authentication
   ↓
Permission Check
   ↓
Document Scope Check
   ↓
MongoDB Internal File Information
   ↓
Cloudinary
   ↓
PDF
   ↓
Backend
   ↓
Browser PDF Viewer
```

**Cloudinary URL: Not Exposed to Frontend**

---

## 21. Frontend Integration Contract

Frontend developers only need to follow these two concepts:

### Document Details

```text
GET /api/v1/documents/:documentId
```

Returns document metadata.

### Document View

```text
GET /api/v1/documents/:documentId/view
```

Returns actual PDF.

### Frontend Does NOT Need

* Cloudinary URL
* Cloudinary Public ID
* Cloudinary credentials
* Cloudinary SDK configuration

### Frontend Needs

* Document ID
* Existing authenticated session/context

---

## 22. API Quick Reference

| API                                      | Purpose                 | Response |
| ---------------------------------------- | ----------------------- | -------- |
| `GET /api/v1/documents/:documentId`      | Document metadata       | JSON     |
| `GET /api/v1/documents/:documentId/view` | Secure document viewing | PDF      |

### View API Security

| Check                        | Required |
| ---------------------------- | -------- |
| Authentication               | Yes      |
| `DOCUMENT → VIEW` Permission | Yes      |
| Document Access Scope        | Yes      |
| Direct Cloudinary URL        | No       |

---

## 23. Final Summary

### Old Approach

```text
MongoDB
   ↓
Cloudinary URL
   ↓
Backend
   ↓
Frontend
   ↓
Direct Cloudinary PDF
```

### New Approach

```text
Frontend
   ↓
Backend View API
   ↓
Authentication
   ↓
Permission
   ↓
Document Scope
   ↓
Cloudinary
   ↓
Backend
   ↓
PDF Viewer
```

### Main Benefit

The direct Cloudinary file path/URL will no longer be exposed in frontend responses.

Document viewing is now fully controlled through backend authentication and authorization flow.

Frontend only needs to use the View API based on document ID.
