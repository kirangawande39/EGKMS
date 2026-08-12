# Access Control

## 1. Purpose

This document describes the integration of the Permission, RolePermission, and ACL (Access Control List) modules.

The Access Control Engine is responsible for making the final authorization decision before a protected controller executes.

## 2. FRS Access Control Engine

The FRS defines the following layered sequence:

```text
Authentication
↓
Hierarchy Validation
↓
Role Validation
↓
Department Validation
↓
Manager Validation
↓
Team Validation
↓
ACL Validation
↓
Permission Validation
↓
Allow / Deny
```

The current middleware implementation uses the available authentication, hierarchy, Permission, RolePermission, and ACL layers. Additional context checks should only be introduced when supported by the current module requirements and implementation.

## 3. Current Middleware Flow

The current `accessControl(resource, action)` flow is conceptually:

```text
Request
   ↓
Authentication
   ↓
Hierarchy Level
   ↓
Permission lookup
   ↓
RolePermission lookup
   ↓
ACL lookup
   ↓
ALLOW / DENY
   ↓
Controller
```

## 4. Authentication

The request must contain an authenticated user.

If the user is missing:

```text
Authentication required.
```

The request is denied.

Authentication uses the project's JWT + Refresh Token architecture with HttpOnly cookies.

The browser sends the authentication cookie automatically for authenticated requests.

## 5. Hierarchy Validation

The access-control layer identifies the user's hierarchy level.

Supported hierarchy levels:

```text
SUPER_ADMIN
GOVERNANCE
EXECUTIVE
DEPARTMENT_HEAD
MANAGER
TEAM_LEAD
EMPLOYEE
INTERN
```

The hierarchy is then used to locate the applicable RolePermission and ACL rules.

## 6. Permission Validation

The requested resource and action are normalized and looked up as an ACTIVE Permission.

Example:

```text
resource = TEAM
action   = CREATE
```

The middleware searches for:

```text
TEAM + CREATE + ACTIVE
```

If the Permission does not exist or is inactive:

```text
Permission not found or inactive.
```

## 7. RolePermission Validation

The middleware checks whether the user's hierarchy has the requested Permission.

Example:

```text
User hierarchy:
TEAM_LEAD

Requested permission:
TEAM.CREATE
```

The system looks for:

```text
TEAM_LEAD
    +
TEAM.CREATE
    +
ACTIVE
```

If no active assignment exists:

```text
Permission is not assigned to this hierarchy level.
```

## 8. ACL Validation

ACL stands for **Access Control List**.

After Permission and RolePermission validation, the middleware searches for the most specific active ACL rule.

Priority:

```text
Employee-specific
        ↓
Team-specific
        ↓
Department-specific
        ↓
Global hierarchy-level
```

This means a specific rule can override a broader rule.

## 9. Final ALLOW / DENY

If no active ACL rule is found:

```text
DENY
```

If the selected ACL has:

```text
effect = DENY
```

the request is rejected.

If:

```text
effect = ALLOW
```

the request continues to the controller.

Conceptually:

```text
No ACL      → DENY
ACL DENY    → DENY
ACL ALLOW   → CONTINUE
```

## 10. Route Integration

Protected Team routes use the Access Control middleware instead of hard-coded role checks.

Example:

```javascript
router.post(
  "/",
  authenticate,
  accessControl("TEAM", "CREATE"),
  validate(createTeamValidator),
  teamController.createTeam
);
```

Other Team routes:

```javascript
router.get(
  "/",
  authenticate,
  accessControl("TEAM", "VIEW"),
  teamController.getTeams
);

router.get(
  "/:teamId",
  authenticate,
  accessControl("TEAM", "VIEW"),
  teamController.getTeamById
);

router.patch(
  "/:teamId",
  authenticate,
  accessControl("TEAM", "EDIT"),
  validate(updateTeamValidator),
  teamController.updateTeam
);

router.patch(
  "/:teamId/status",
  authenticate,
  accessControl("TEAM", "EDIT"),
  validate(updateTeamStatusValidator),
  teamController.updateTeamStatus
);

router.delete(
  "/:teamId",
  authenticate,
  accessControl("TEAM", "DELETE"),
  teamController.deleteTeam
);
```

## 11. Team Authorization Matrix

Current tested Team configuration:

| Operation | Permission | Super Admin | Team Lead |
|---|---|---:|---:|
| Create Team | TEAM.CREATE | ALLOW | ALLOW |
| View Teams | TEAM.VIEW | ALLOW | ALLOW |
| View Team | TEAM.VIEW | ALLOW | ALLOW |
| Edit Team | TEAM.EDIT | ALLOW | ALLOW |
| Update Team Status | TEAM.EDIT | ALLOW | ALLOW |
| Delete Team | TEAM.DELETE | ALLOW | DENY |

## 12. ALLOW Test

Team Lead successfully created a Team when:

```text
TEAM.CREATE
+
TEAM_LEAD RolePermission
+
Active global ACL ALLOW
```

Result:

```text
Team created successfully.
```

## 13. DENY Test

An employee-specific ACL was temporarily created:

```text
Hierarchy: TEAM_LEAD
Permission: TEAM.CREATE
Employee: Amit
Effect: DENY
Status: ACTIVE
```

Amit's Team creation request returned:

```text
Access denied by ACL.
```

This confirmed that the employee-specific ACL takes precedence over the broader global ALLOW.

The test rule was then changed to:

```text
Status: INACTIVE
```

After that, Amit's Team creation request succeeded again through the active global ALLOW rule.

## 14. Administrative Separation

Permission, RolePermission, and ACL configuration are administrative operations.

A Team Lead can use a granted business permission such as:

```text
TEAM.CREATE
```

but should not automatically gain permission to configure the Permission Engine itself.

Therefore:

```text
Business Access
    ≠
Access-Control Configuration
```

## 15. Security Principles

```text
1. Authentication is required.
2. Permission must exist and be ACTIVE.
3. RolePermission must exist and be ACTIVE.
4. ACL must resolve to an active rule.
5. DENY blocks access.
6. No matching ACL defaults to DENY in the current middleware.
7. More specific ACL rules are checked before broader rules.
8. Access-control configuration is administrative.
9. Protected routes should use accessControl(resource, action).
10. Avoid duplicating hard-coded role checks where fine-grained access control is intended.
```

## 16. Current Implementation Status

```text
Permission Module
        ↓
COMPLETED ✅

RolePermission Module
        ↓
COMPLETED ✅

ACL (Access Control List) Module
        ↓
COMPLETED ✅

Access Control Middleware
        ↓
IMPLEMENTED + TESTED ✅

ALLOW behavior
        ↓
TESTED ✅

DENY behavior
        ↓
TESTED ✅

Specific Employee DENY override
        ↓
TESTED ✅

Team CREATE
        ↓
TESTED ✅

Team VIEW
        ↓
TESTED ✅

Team EDIT
        ↓
TESTED ✅

Team DELETE
        ↓
TESTED ✅
```

## 17. Important FRS Note

The FRS requires layered access control and says every request must pass the defined validation sequence before Allow / Deny.

The current implementation is the project's implemented Permission + RolePermission + ACL layer. It should continue to be extended carefully so that future Department, Manager, Team, Employee, and document-level authorization remains consistent with the FRS.

## 18. Related Documents

```text
PERMISSION_MODULE.md
ROLE_PERMISSION_MODULE.md
ACL_MODULE.md
```
