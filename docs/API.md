# EGKMS — API Security & Rate Limiting Documentation

## 1. Document Overview

This document describes the APIs available in the EGKMS backend and explains, in simple terms:

* API endpoint
* HTTP method
* Purpose of the API
* Authentication requirement
* Authorization / Access Control
* Validation
* Rate limiting
* Rate limit attempts and time window
* Middleware flow

### Base API

```text
/api/v1
```

All module APIs are accessed under this base path.

Example:

```text
/api/v1/document
/api/v1/user
/api/v1/employee
```

---

# 2. Authentication & Security

EGKMS APIs use multiple security layers.

## 2.1 Authentication

Authentication checks whether the user is logged in and has a valid authentication token.

Middleware:

```text
authenticate
```

If authentication fails:

```text
401 Unauthorized
```

---

## 2.2 Authorization

Authorization checks whether the authenticated user has the required system role.

Example:

```text
authorize("SUPER_ADMIN")
```

This means only a `SUPER_ADMIN` can access the API.

If the user does not have the required role:

```text
403 Forbidden
```

---

## 2.3 Access Control

EGKMS also uses permission-based access control.

Example:

```text
accessControl("EMPLOYEE", "CREATE")
```

This means the logged-in user must have permission to:

```text
Resource: EMPLOYEE
Action: CREATE
```

Examples:

```text
EMPLOYEE.VIEW
EMPLOYEE.CREATE
EMPLOYEE.EDIT
EMPLOYEE.DELETE

DOCUMENT.VIEW
DOCUMENT.CREATE
DOCUMENT.EDIT
DOCUMENT.ARCHIVE
DOCUMENT.RESTORE
DOCUMENT.DELETE
DOCUMENT.REVIEW
```

---

## 2.4 Validation

Validation checks whether the request data is correct before sending it to the controller.

Example:

```text
validate(createEmployeeValidator)
```

If request data is invalid, the request is rejected before the business logic runs.

---

## 2.5 Rate Limiting

Rate limiting controls how many requests can be made from the same client within a specific time period.

Example:

```text
15 minutes / 20 requests
```

If the limit is exceeded, the API returns:

```text
429 Too Many Requests
```

Example response:

```json
{
  "success": false,
  "message": "Too many requests. Please try again after 15 minutes."
}
```

---

# 3. Standard Middleware Flow

For protected APIs, EGKMS generally follows:

```text
Request
   ↓
authenticate
   ↓
rateLimiter
   ↓
authorize / accessControl
   ↓
validate
   ↓
controller
   ↓
response
```

Not every API has every middleware.

For example, a GET API may not require validation.

---

# 4. Rate Limiting Policy

The following limits are currently configured.

| Module          | Operation         | Time Window | Max Attempts |
| --------------- | ----------------- | ----------: | -----------: |
| Auth            | Register          |       5 min |            5 |
| Auth            | Login             |       5 min |            5 |
| Auth            | Send Email OTP    |       5 min |            3 |
| Auth            | Verify Email OTP  |      10 min |           10 |
| User            | Read              |      15 min |          100 |
| User            | Update            |      15 min |           50 |
| User            | Status Update     |      15 min |           30 |
| User            | Password Reset    |      15 min |            5 |
| User            | Reporting Manager |      15 min |           30 |
| User            | Delete            |      15 min |           20 |
| Employee        | Create            |      15 min |           30 |
| Employee        | Read              |      15 min |          100 |
| Employee        | Update            |      15 min |           50 |
| Employee        | Status Update     |      15 min |           30 |
| Employee        | Delete            |      15 min |           20 |
| Department      | Create            |      15 min |           20 |
| Department      | Read              |      15 min |          100 |
| Department      | Update            |      15 min |           30 |
| Department      | Status Update     |      15 min |           20 |
| Department      | Delete            |      15 min |           10 |
| Team            | Create            |      15 min |           20 |
| Team            | Read              |      15 min |          100 |
| Team            | Update            |      15 min |           30 |
| Team            | Status Update     |      15 min |           20 |
| Team            | Delete            |      15 min |           10 |
| Document        | Create            |      15 min |           20 |
| Document        | Read/View         |      15 min |          100 |
| Document        | Update/Version    |      15 min |           20 |
| Document        | Status            |      15 min |           30 |
| Document        | Archive           |      15 min |           20 |
| Document        | Restore           |      15 min |           20 |
| Document        | Delete            |      15 min |           10 |
| Workflow        | Read              |      15 min |          100 |
| Workflow        | Submit            |      15 min |           20 |
| Workflow        | Review            |      15 min |           30 |
| Workflow        | Resubmit          |      15 min |           20 |
| Permission      | Create            |      15 min |           20 |
| Permission      | Read              |      15 min |          100 |
| Permission      | Update            |      15 min |           30 |
| Permission      | Status            |      15 min |           20 |
| Permission      | Delete            |      15 min |           10 |
| Role Permission | Create            |      15 min |           20 |
| Role Permission | Read              |      15 min |          100 |
| Role Permission | Update            |      15 min |           30 |
| Role Permission | Status            |      15 min |           20 |
| Role Permission | Delete            |      15 min |           10 |
| ACL             | Create            |      15 min |           20 |
| ACL             | Read              |      15 min |          100 |
| ACL             | Update            |      15 min |           30 |
| ACL             | Status            |      15 min |           20 |
| ACL             | Delete            |      15 min |           10 |
| Audit           | Read              |      15 min |          100 |

---

# 5. Authentication APIs

Base:

```text
/api/v1/auth
```

## 5.1 Register

```text
POST /api/v1/auth/register
```

### Purpose

Creates/registers a user account.

### Security

```text
Authentication: No
Authorization: No
Rate Limit: 5 requests / 5 minutes
```

### Middleware

```text
rateLimiter
   ↓
validator
   ↓
controller
```

---

## 5.2 Login

```text
POST /api/v1/auth/login
```

### Purpose

Logs the user into EGKMS and creates authentication tokens.

### Security

```text
Authentication: No
Authorization: No
Rate Limit: 5 requests / 5 minutes
```

### Middleware

```text
loginLimiter
   ↓
controller
```

---

## 5.3 Send Email OTP

```text
POST /api/v1/auth/send-email-otp
```

### Purpose

Sends an OTP to the user's registered email.

### Security

```text
Authentication: Depends on implementation
Rate Limit: 3 requests / 5 minutes
```

---

## 5.4 Verify Email OTP

```text
POST /api/v1/auth/verify-email-otp
```

### Purpose

Verifies the OTP sent to the user's email.

### Security

```text
Authentication: Depends on implementation
Rate Limit: 10 requests / 10 minutes
```

---

# 6. User Management APIs

Base:

```text
/api/v1/user
```

All listed User APIs require:

```text
Authentication: Required
Authorization: SUPER_ADMIN
```

## 6.1 Get All Users

```text
GET /api/v1/user
```

Purpose:

```text
Gets the list of users.
```

Security:

```text
Rate Limit: 100 requests / 15 minutes
```

---

## 6.2 Get User By ID

```text
GET /api/v1/user/:userId
```

Purpose:

```text
Gets one user's details.
```

Security:

```text
Rate Limit: 100 requests / 15 minutes
```

---

## 6.3 Update User

```text
PATCH /api/v1/user/:userId
```

Purpose:

```text
Updates user information.
```

Security:

```text
Rate Limit: 50 requests / 15 minutes
```

---

## 6.4 Update User Account Status

```text
PATCH /api/v1/user/:userId/status
```

Purpose:

```text
Changes the user's account status.
```

Security:

```text
Rate Limit: 30 requests / 15 minutes
```

---

## 6.5 Reset User Password

```text
POST /api/v1/user/:userId/reset-password
```

Purpose:

```text
Resets the password of a user.
```

Security:

```text
Rate Limit: 5 requests / 15 minutes
```

This API has a stricter limit because password operations are security-sensitive.

---

## 6.6 Assign Reporting Manager

```text
PATCH /api/v1/user/:userId/reporting-manager
```

Purpose:

```text
Assigns a reporting manager to a user.
```

Security:

```text
Rate Limit: 30 requests / 15 minutes
```

---

## 6.7 Delete User

```text
DELETE /api/v1/user/:userId
```

Purpose:

```text
Deletes a user account.
```

Security:

```text
Rate Limit: 20 requests / 15 minutes
```

---

# 7. Employee Management APIs

Base:

```text
/api/v1/employee
```

Employee APIs use permission-based access control.

## 7.1 Create Employee

```text
POST /api/v1/employee
```

Purpose:

```text
Creates a new employee.
```

Security:

```text
Authentication: Required
Access Control: EMPLOYEE.CREATE
Rate Limit: 30 / 15 minutes
Validation: Required
```

Flow:

```text
authenticate
   ↓
rateLimiter
   ↓
accessControl(EMPLOYEE, CREATE)
   ↓
validate
   ↓
controller
```

---

## 7.2 Get All Employees

```text
GET /api/v1/employee
```

Purpose:

```text
Gets all employees.
```

Security:

```text
Access Control: EMPLOYEE.VIEW
Rate Limit: 100 / 15 minutes
```

---

## 7.3 Get Employee By Email

```text
GET /api/v1/employee/email/:email
```

Purpose:

```text
Finds an employee using their email.
```

Security:

```text
Access Control: EMPLOYEE.VIEW
Rate Limit: 100 / 15 minutes
```

---

## 7.4 Get Employee By ID

```text
GET /api/v1/employee/:employeeId
```

Purpose:

```text
Gets one employee's details.
```

Security:

```text
Access Control: EMPLOYEE.VIEW
Rate Limit: 100 / 15 minutes
```

---

## 7.5 Update Employee

```text
PATCH /api/v1/employee/:employeeId
```

Purpose:

```text
Updates employee information.
```

Security:

```text
Access Control: EMPLOYEE.EDIT
Rate Limit: 50 / 15 minutes
```

---

## 7.6 Update Employee Status

```text
PATCH /api/v1/employee/:employeeId/status
```

Purpose:

```text
Changes employee status.
```

Security:

```text
Access Control: EMPLOYEE.EDIT
Rate Limit: 30 / 15 minutes
```

---

## 7.7 Delete Employee

```text
DELETE /api/v1/employee/:employeeId
```

Purpose:

```text
Deletes an employee.
```

Security:

```text
Access Control: EMPLOYEE.DELETE
Rate Limit: 20 / 15 minutes
```

---

# 8. Department Management APIs

Base:

```text
/api/v1/department
```

## 8.1 Create Department

```text
POST /api/v1/department
```

Purpose:

```text
Creates a department.
```

Security:

```text
Authentication: Required
Access Control: DEPARTMENT.CREATE
Rate Limit: 20 / 15 minutes
Validation: Required
```

---

## 8.2 Get All Departments

```text
GET /api/v1/department
```

Purpose:

```text
Gets all departments.
```

Security:

```text
Access Control: DEPARTMENT.VIEW
Rate Limit: 100 / 15 minutes
```

---

## 8.3 Get Department By ID

```text
GET /api/v1/department/:departmentId
```

Purpose:

```text
Gets one department.
```

Security:

```text
Access Control: DEPARTMENT.VIEW
Rate Limit: 100 / 15 minutes
```

---

## 8.4 Update Department

```text
PATCH /api/v1/department/:departmentId
```

Purpose:

```text
Updates department information.
```

Security:

```text
Access Control: DEPARTMENT.EDIT
Rate Limit: 30 / 15 minutes
Validation: Required
```

---

## 8.5 Update Department Status

```text
PATCH /api/v1/department/:departmentId/status
```

Purpose:

```text
Changes department status between ACTIVE and INACTIVE.
```

Security:

```text
Access Control: DEPARTMENT.DELETE
Rate Limit: 20 / 15 minutes
Validation: Required
```

---

## 8.6 Delete Department

```text
DELETE /api/v1/department/:departmentId
```

Purpose:

```text
Deletes a department.
```

Security:

```text
Access Control: DEPARTMENT.DELETE
Rate Limit: 10 / 15 minutes
```

---

# 9. Team Management APIs

Base:

```text
/api/v1/team
```

## 9.1 Create Team

```text
POST /api/v1/team
```

Purpose:

```text
Creates a team under a department.
```

Security:

```text
Access Control: TEAM.CREATE
Rate Limit: 20 / 15 minutes
Validation: Required
```

---

## 9.2 Get All Teams

```text
GET /api/v1/team
```

Purpose:

```text
Gets all teams.
```

Security:

```text
Access Control: TEAM.VIEW
Rate Limit: 100 / 15 minutes
```

---

## 9.3 Get Team By ID

```text
GET /api/v1/team/:teamId
```

Purpose:

```text
Gets one team.
```

Security:

```text
Access Control: TEAM.VIEW
Rate Limit: 100 / 15 minutes
```

---

## 9.4 Update Team

```text
PATCH /api/v1/team/:teamId
```

Purpose:

```text
Updates team information.
```

Security:

```text
Access Control: TEAM.EDIT
Rate Limit: 30 / 15 minutes
Validation: Required
```

---

## 9.5 Update Team Status

```text
PATCH /api/v1/team/:teamId/status
```

Purpose:

```text
Changes team status.
```

Security:

```text
Access Control: TEAM.EDIT
Rate Limit: 20 / 15 minutes
Validation: Required
```

---

## 9.6 Delete Team

```text
DELETE /api/v1/team/:teamId
```

Purpose:

```text
Deletes a team.
```

Security:

```text
Access Control: TEAM.DELETE
Rate Limit: 10 / 15 minutes
```

---

# 10. Document Management APIs

Base:

```text
/api/v1/document
```

Document APIs are protected using permission-based access control.

## 10.1 Create Document

```text
POST /api/v1/document
```

Purpose:

```text
Creates a document and uploads its file.
```

Security:

```text
Access Control: DOCUMENT.CREATE
Rate Limit: 20 / 15 minutes
File Upload: Yes
Validation: Required
```

---

## 10.2 Get Documents / Search / Filter

```text
GET /api/v1/document
```

Purpose:

```text
Gets documents and supports document search/filtering.
```

Security:

```text
Access Control: DOCUMENT.VIEW
Rate Limit: 100 / 15 minutes
```

---

## 10.3 View Document File

```text
GET /api/v1/document/:documentId/view
```

Purpose:

```text
Views the document file.
```

Security:

```text
Access Control: DOCUMENT.VIEW
Rate Limit: 100 / 15 minutes
```

---

## 10.4 Get Document By ID

```text
GET /api/v1/document/:documentId
```

Purpose:

```text
Gets complete information about one document.
```

Security:

```text
Access Control: DOCUMENT.VIEW
Rate Limit: 100 / 15 minutes
```

---

## 10.5 Get Document Versions

```text
GET /api/v1/document/:documentId/versions
```

Purpose:

```text
Gets the version history of a document.
```

Security:

```text
Access Control: DOCUMENT.VIEW
Rate Limit: 100 / 15 minutes
```

---

## 10.6 Update Document

```text
PATCH /api/v1/document/:documentId
```

Purpose:

```text
Updates a document and can create a new document version.
```

Security:

```text
Access Control: DOCUMENT.EDIT
Rate Limit: 20 / 15 minutes
File Upload: Yes
Validation: Required
```

---

## 10.7 Update Document Status

```text
PATCH /api/v1/document/:documentId/status
```

Purpose:

```text
Changes document lifecycle status.
```

Security:

```text
Access Control: DOCUMENT.EDIT
Rate Limit: 30 / 15 minutes
Validation: Required
```

---

## 10.8 Archive Document

```text
PATCH /api/v1/document/:documentId/archive
```

Purpose:

```text
Archives a document.
```

Security:

```text
Access Control: DOCUMENT.ARCHIVE
Rate Limit: 20 / 15 minutes
```

---

## 10.9 Restore Document

```text
PATCH /api/v1/document/:documentId/restore
```

Purpose:

```text
Restores an archived document.
```

Security:

```text
Access Control: DOCUMENT.RESTORE
Rate Limit: 20 / 15 minutes
```

---

## 10.10 Delete Document

```text
DELETE /api/v1/document/:documentId
```

Purpose:

```text
Deletes a document.
```

Security:

```text
Access Control: DOCUMENT.DELETE
Rate Limit: 10 / 15 minutes
```

---

# 11. Workflow APIs

Base:

```text
/api/v1/workflow
```

## 11.1 Get My Submissions

```text
GET /api/v1/workflow/my-submissions
```

Purpose:

```text
Gets documents submitted by the current user for workflow review.
```

Security:

```text
Access Control: DOCUMENT.VIEW
Rate Limit: 100 / 15 minutes
```

---

## 11.2 Get Pending Workflows

```text
GET /api/v1/workflow/pending
```

Purpose:

```text
Gets workflows waiting for the current reviewer.
```

Security:

```text
Access Control: DOCUMENT.REVIEW
Rate Limit: 100 / 15 minutes
```

---

## 11.3 Submit Document For Review

```text
POST /api/v1/workflow/:documentId/submit
```

Purpose:

```text
Submits a document into the review workflow.
```

Security:

```text
Authentication: Required
Access Control: Currently not enabled in the provided route
Rate Limit: 20 / 15 minutes
```

---

## 11.4 Review Workflow

```text
POST /api/v1/workflow/:workflowId/review
```

Purpose:

```text
Allows the reviewer to review the workflow.
```

Security:

```text
Authentication: Required
Rate Limit: 30 / 15 minutes
Validation: Required
```

---

## 11.5 Resubmit Document

```text
POST /api/v1/workflow/:documentId/resubmit
```

Purpose:

```text
Resubmits a document after it has been returned for changes.
```

Security:

```text
Authentication: Required
Rate Limit: 20 / 15 minutes
```

---

# 12. Permission APIs

Base:

```text
/api/v1/permission
```

All listed Permission APIs require:

```text
Authentication: Required
Authorization: SUPER_ADMIN
```

## 12.1 Create Permission

```text
POST /api/v1/permission
```

Purpose:

```text
Creates a permission definition.
```

Rate Limit:

```text
20 / 15 minutes
```

---

## 12.2 Get All Permissions

```text
GET /api/v1/permission
```

Purpose:

```text
Gets all available permissions.
```

Rate Limit:

```text
100 / 15 minutes
```

---

## 12.3 Get Permission Options

```text
GET /api/v1/permission/options
```

Purpose:

```text
Gets permission options that can be used while configuring permissions.
```

Rate Limit:

```text
100 / 15 minutes
```

---

## 12.4 Get Permission By ID

```text
GET /api/v1/permission/:permissionId
```

Purpose:

```text
Gets one permission.
```

Rate Limit:

```text
100 / 15 minutes
```

---

## 12.5 Update Permission

```text
PATCH /api/v1/permission/:permissionId
```

Purpose:

```text
Updates a permission.
```

Rate Limit:

```text
30 / 15 minutes
```

---

## 12.6 Update Permission Status

```text
PATCH /api/v1/permission/:permissionId/status
```

Purpose:

```text
Changes permission status.
```

Rate Limit:

```text
20 / 15 minutes
```

---

## 12.7 Delete Permission

```text
DELETE /api/v1/permission/:permissionId
```

Purpose:

```text
Deletes a permission.
```

Rate Limit:

```text
10 / 15 minutes
```

---

# 13. Role Permission APIs

Base:

```text
/api/v1/role-permission
```

All listed APIs require:

```text
Authentication: Required
Authorization: SUPER_ADMIN
```

## 13.1 Create Role Permission

```text
POST /api/v1/role-permission
```

Purpose:

```text
Creates a role-permission mapping.
```

Rate Limit:

```text
20 / 15 minutes
```

---

## 13.2 Get All Role Permissions

```text
GET /api/v1/role-permission
```

Purpose:

```text
Gets all role-permission mappings.
```

Rate Limit:

```text
100 / 15 minutes
```

---

## 13.3 Get Role Permission By ID

```text
GET /api/v1/role-permission/:rolePermissionId
```

Purpose:

```text
Gets one role-permission mapping.
```

Rate Limit:

```text
100 / 15 minutes
```

---

## 13.4 Update Role Permission

```text
PATCH /api/v1/role-permission/:rolePermissionId
```

Purpose:

```text
Updates a role-permission mapping.
```

Rate Limit:

```text
30 / 15 minutes
```

---

## 13.5 Update Role Permission Status

```text
PATCH /api/v1/role-permission/:rolePermissionId/status
```

Purpose:

```text
Changes role-permission status.
```

Rate Limit:

```text
20 / 15 minutes
```

---

## 13.6 Delete Role Permission

```text
DELETE /api/v1/role-permission/:rolePermissionId
```

Purpose:

```text
Deletes a role-permission mapping.
```

Rate Limit:

```text
10 / 15 minutes
```

---

# 14. ACL APIs

Base:

```text
/api/v1/acl
```

All listed ACL APIs require:

```text
Authentication: Required
Authorization: SUPER_ADMIN
```

## 14.1 Create ACL

```text
POST /api/v1/acl
```

Purpose:

```text
Creates an Access Control List rule.
```

Rate Limit:

```text
20 / 15 minutes
```

---

## 14.2 Get All ACL Rules

```text
GET /api/v1/acl
```

Purpose:

```text
Gets all ACL rules.
```

Rate Limit:

```text
100 / 15 minutes
```

---

## 14.3 Get ACL By ID

```text
GET /api/v1/acl/:aclId
```

Purpose:

```text
Gets one ACL rule.
```

Rate Limit:

```text
100 / 15 minutes
```

---

## 14.4 Update ACL

```text
PATCH /api/v1/acl/:aclId
```

Purpose:

```text
Updates an ACL rule.
```

Rate Limit:

```text
30 / 15 minutes
```

---

## 14.5 Update ACL Status

```text
PATCH /api/v1/acl/:aclId/status
```

Purpose:

```text
Changes ACL rule status.
```

Rate Limit:

```text
20 / 15 minutes
```

---

## 14.6 Delete ACL

```text
DELETE /api/v1/acl/:aclId
```

Purpose:

```text
Deletes an ACL rule.
```

Rate Limit:

```text
10 / 15 minutes
```

---

# 15. Audit Log APIs

Base:

```text
/api/v1/audit
```

## 15.1 Get Audit Logs

```text
GET /api/v1/audit
```

Purpose:

```text
Gets audit logs generated by different EGKMS modules.
```

Examples of logged activities include:

```text
AUTH
DOCUMENT
WORKFLOW
PERMISSION
USER
```

Security:

```text
Authentication: Required
Authorization: SUPER_ADMIN
Rate Limit: 100 / 15 minutes
```

---

# 16. API Security Summary

## Authentication

Authentication protects APIs from unauthenticated users.

```text
authenticate
```

---

## Role Authorization

Role authorization restricts APIs to specific system roles.

Example:

```text
authorize("SUPER_ADMIN")
```

---

## Permission-Based Access Control

Permission-based APIs use:

```text
accessControl("RESOURCE", "ACTION")
```

Examples:

```text
EMPLOYEE.CREATE
EMPLOYEE.VIEW
EMPLOYEE.EDIT
EMPLOYEE.DELETE

DEPARTMENT.CREATE
DEPARTMENT.VIEW
DEPARTMENT.EDIT
DEPARTMENT.DELETE

TEAM.CREATE
TEAM.VIEW
TEAM.EDIT
TEAM.DELETE

DOCUMENT.CREATE
DOCUMENT.VIEW
DOCUMENT.EDIT
DOCUMENT.ARCHIVE
DOCUMENT.RESTORE
DOCUMENT.DELETE
DOCUMENT.REVIEW
```

---

## Rate Limiting

Rate limiting prevents excessive API requests.

Common configuration:

```text
Window: 15 minutes
```

Examples:

```text
Read APIs:
100 requests / 15 minutes

Create APIs:
20–30 requests / 15 minutes

Update APIs:
20–50 requests / 15 minutes

Delete APIs:
10–20 requests / 15 minutes

Sensitive password operations:
5 requests / 15 minutes
```

---

# 17. HTTP Security Responses

## 401 — Unauthorized

Returned when the user is not authenticated or the authentication token is invalid.

```text
401 Unauthorized
```

---

## 403 — Forbidden

Returned when the user is authenticated but does not have the required role or permission.

```text
403 Forbidden
```

---

## 429 — Too Many Requests

Returned when the configured rate limit has been exceeded.

```text
429 Too Many Requests
```

---

## 400 — Bad Request

Generally returned when request data is invalid.

```text
400 Bad Request
```

---

# 18. Complete API Module Summary

Based on the routes provided for this documentation:

| Module          | API Count |
| --------------- | --------: |
| Auth            |         4 |
| User            |         7 |
| Employee        |         7 |
| Department      |         6 |
| Team            |         6 |
| Document        |        10 |
| Workflow        |         5 |
| Permission      |         7 |
| Role Permission |         6 |
| ACL             |         6 |
| Audit           |         1 |
| **Total**       |    **65** |

> **Note:** The total of 65 APIs is based only on the routes provided during the current API/rate-limiter documentation work. If the project contains additional route files/endpoints that were not provided, those are not included in this count.

---

# 19. Recommended Middleware Order

For permission-based routes:

```text
authenticate
    ↓
rateLimiter
    ↓
accessControl
    ↓
validate
    ↓
controller
```

For role-based routes:

```text
authenticate
    ↓
rateLimiter
    ↓
authorize
    ↓
validate
    ↓
controller
```

For public authentication routes:

```text
rateLimiter
    ↓
validate
    ↓
controller
```

---

# 20. Simple Explanation For Frontend Developer

Frontend developers do not need to handle authentication logic manually for every API.

For protected APIs:

1. User must be authenticated.
2. Backend checks the user's role or permission.
3. Backend checks request data when validation is required.
4. Rate limiter checks whether too many requests were made.
5. Controller performs the actual operation.
6. Backend returns the response.

If the API returns:

```text
401
```

the user authentication is invalid or missing.

If it returns:

```text
403
```

the user does not have the required role/permission.

If it returns:

```text
429
```

the API request limit has been exceeded.

The frontend should handle these responses appropriately and should not bypass or manually reproduce backend authorization logic.
