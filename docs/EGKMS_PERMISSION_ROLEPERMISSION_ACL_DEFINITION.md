# EGKMS Permission, RolePermission & ACL Definition

## 1. Document Overview

**Project:** Enterprise Governance & Knowledge Management System
(EGKMS)\
**Module:** Permission Management, RolePermission & ACL / Access
Control\
**Purpose:** Document the permission definitions, hierarchy assignments,
global ACL rules, specific ACL behavior, and testing completed during
the current permission-engine work.

> **Source of truth:** The EGKMS FRS remains the primary source for
> project requirements. The permission matrix below documents the
> **current implemented configuration** and should not be treated as an
> independent requirement.

------------------------------------------------------------------------

# 2. Permission Engine Overview

The EGKMS authorization flow is:

``` text
Authenticated User
        ↓
Employee / Hierarchy
        ↓
Permission
        ↓
RolePermission
        ↓
ACL
        ↓
ALLOW / DENY
        ↓
Protected API
```

### Permission

Defines **what action exists** for a resource.

Example:

``` text
TEAM + CREATE
      ↓
TEAM.CREATE
```

### RolePermission

Defines **which hierarchy level is eligible for that permission**.

Example:

``` text
TEAM.CREATE
      ↓
TEAM_LEAD
```

### ACL

Defines **where/for whom the permission is allowed or denied**.

ACL supports:

``` text
Employee-specific
Team-specific
Department-specific
Global hierarchy-level
```

The current access-control service checks these levels from most
specific to least specific:

``` text
Employee
   ↓
Team
   ↓
Department
   ↓
Global Hierarchy
```

------------------------------------------------------------------------

# 3. Supported Hierarchy Levels

The EGKMS hierarchy used by the Permission Engine is:

``` text
SUPER_ADMIN
    ↓
GOVERNANCE
    ↓
EXECUTIVE
    ↓
DEPARTMENT_HEAD
    ↓
MANAGER
    ↓
TEAM_LEAD
    ↓
EMPLOYEE
    ↓
INTERN
```

These are the hierarchy values supported by the current `RolePermission`
and `ACL` models.

------------------------------------------------------------------------

# 4. Permission Definition

A Permission is represented by:

``` text
RESOURCE + ACTION
```

Supported actions in the current Permission module:

``` text
VIEW
CREATE
EDIT
DELETE
REVIEW
APPROVE
PUBLISH
ARCHIVE
RESTORE
```

Permission fields:

``` text
resource
action
description
status
createdBy
createdAt
updatedAt
```

Only an `ACTIVE` Permission participates in access checks.

------------------------------------------------------------------------

# 5. Permissions Created

During the current permission reset/seed operation:

``` text
Old Permission records deleted: 6
New Permission records created: 25
```

The current 25 permissions are:

    \# Permission          Meaning
  ---- ------------------- ----------------------------
     1 USER.VIEW           View users
     2 USER.CREATE         Create users
     3 USER.EDIT           Edit users
     4 USER.DELETE         Delete users
     5 EMPLOYEE.VIEW       View employees
     6 EMPLOYEE.CREATE     Create employees
     7 EMPLOYEE.EDIT       Edit employees
     8 EMPLOYEE.DELETE     Delete employees
     9 DEPARTMENT.VIEW     View departments
    10 DEPARTMENT.CREATE   Create departments
    11 DEPARTMENT.EDIT     Edit departments
    12 DEPARTMENT.DELETE   Delete departments
    13 TEAM.VIEW           View teams
    14 TEAM.CREATE         Create teams
    15 TEAM.EDIT           Edit teams
    16 TEAM.DELETE         Delete teams
    17 DOCUMENT.VIEW       View documents
    18 DOCUMENT.CREATE     Create documents
    19 DOCUMENT.EDIT       Edit documents
    20 DOCUMENT.DELETE     Delete documents
    21 DOCUMENT.REVIEW     Review documents
    22 DOCUMENT.APPROVE    Approve documents
    23 DOCUMENT.PUBLISH    Publish documents
    24 DOCUMENT.ARCHIVE    Archive documents
    25 DOCUMENT.RESTORE    Restore archived documents

------------------------------------------------------------------------

# 6. Permission Resource Summary

  -----------------------------------------------------------------------------------------------
  Resource      VIEW    CREATE   EDIT    DELETE   REVIEW   APPROVE   PUBLISH   ARCHIVE   RESTORE
  ------------ ------- -------- ------- -------- -------- --------- --------- --------- ---------
  USER            ✓       ✓        ✓       ✓       ---       ---       ---       ---       ---

  EMPLOYEE        ✓       ✓        ✓       ✓       ---       ---       ---       ---       ---

  DEPARTMENT      ✓       ✓        ✓       ✓       ---       ---       ---       ---       ---

  TEAM            ✓       ✓        ✓       ✓       ---       ---       ---       ---       ---

  DOCUMENT        ✓       ✓        ✓       ✓        ✓         ✓         ✓         ✓         ✓
  -----------------------------------------------------------------------------------------------

**Important:** A permission existing in the Permission collection does
**not** automatically give access to any hierarchy.

------------------------------------------------------------------------

# 7. RolePermission Matrix

During the current RolePermission seed:

``` text
RolePermission created: 62
RolePermission skipped: 0
```

The following is the implemented hierarchy-to-permission matrix.

## 7.1 SUPER_ADMIN

``` text
USER.VIEW
USER.CREATE
USER.EDIT
USER.DELETE

EMPLOYEE.VIEW
EMPLOYEE.CREATE
EMPLOYEE.EDIT
EMPLOYEE.DELETE

DEPARTMENT.VIEW
DEPARTMENT.CREATE
DEPARTMENT.EDIT
DEPARTMENT.DELETE

TEAM.VIEW
TEAM.CREATE
TEAM.EDIT
TEAM.DELETE

DOCUMENT.VIEW
DOCUMENT.CREATE
DOCUMENT.EDIT
DOCUMENT.DELETE
DOCUMENT.REVIEW
DOCUMENT.APPROVE
DOCUMENT.PUBLISH
DOCUMENT.ARCHIVE
DOCUMENT.RESTORE
```

**Total:** 25

Super Admin therefore has the complete current Permission set.

The FRS describes Super Admin as the platform owner with complete
platform control and permission-configuration responsibility.
fileciteturn100file19L1-L8

------------------------------------------------------------------------

## 7.2 GOVERNANCE

``` text
DOCUMENT.VIEW
DOCUMENT.CREATE
DOCUMENT.EDIT
DOCUMENT.DELETE
DOCUMENT.REVIEW
DOCUMENT.APPROVE
DOCUMENT.PUBLISH
```

**Total:** 7

------------------------------------------------------------------------

## 7.3 EXECUTIVE

``` text
DEPARTMENT.VIEW
DEPARTMENT.CREATE

DOCUMENT.VIEW
DOCUMENT.CREATE
DOCUMENT.EDIT
DOCUMENT.DELETE
DOCUMENT.REVIEW
DOCUMENT.APPROVE
```

**Total:** 8

------------------------------------------------------------------------

## 7.4 DEPARTMENT_HEAD

``` text
DOCUMENT.VIEW
DOCUMENT.CREATE
DOCUMENT.EDIT
DOCUMENT.DELETE
DOCUMENT.REVIEW
DOCUMENT.APPROVE
```

**Total:** 6

------------------------------------------------------------------------

## 7.5 MANAGER

``` text
DOCUMENT.VIEW
DOCUMENT.EDIT
DOCUMENT.DELETE
DOCUMENT.REVIEW
DOCUMENT.APPROVE
```

**Total:** 5

------------------------------------------------------------------------

## 7.6 TEAM_LEAD

``` text
TEAM.VIEW
TEAM.CREATE
TEAM.EDIT

DOCUMENT.VIEW
DOCUMENT.REVIEW
```

**Total:** 5

------------------------------------------------------------------------

## 7.7 EMPLOYEE

``` text
DOCUMENT.VIEW
DOCUMENT.CREATE
DOCUMENT.EDIT
```

**Total:** 3

------------------------------------------------------------------------

## 7.8 INTERN

``` text
DOCUMENT.VIEW
DOCUMENT.CREATE
DOCUMENT.EDIT
```

**Total:** 3

------------------------------------------------------------------------

# 8. RolePermission Count Verification

  Hierarchy           Assigned Permissions
  ----------------- ----------------------
  SUPER_ADMIN                           25
  GOVERNANCE                             7
  EXECUTIVE                              8
  DEPARTMENT_HEAD                        6
  MANAGER                                5
  TEAM_LEAD                              5
  EMPLOYEE                               3
  INTERN                                 3
  **TOTAL**                         **62**

This matches the seed result:

``` text
RolePermission created: 62
RolePermission skipped: 0
```

------------------------------------------------------------------------

# 9. RolePermission Rules

A RolePermission record contains:

``` text
hierarchyLevel
permission
assignedBy
status
createdAt
updatedAt
```

Validation rules:

``` text
Permission must exist
        ↓
Permission must be ACTIVE
        ↓
Hierarchy level must be valid
        ↓
Duplicate hierarchy + permission is not allowed
        ↓
RolePermission becomes ACTIVE
```

The current model also has a unique index on:

``` text
hierarchyLevel + permission
```

Therefore the same permission cannot be assigned twice to the same
hierarchy level.

------------------------------------------------------------------------

# 10. Global ACL Rules

After creating the RolePermission matrix, the global ACL seed was run.

The global ACL concept is:

``` text
Hierarchy Level
      +
Permission
      +
department = null
team = null
employee = null
      ↓
ALLOW
```

This means the permission is globally allowed for that hierarchy unless
a more specific ACL rule overrides it.

The global ACL seed reads active RolePermissions and creates the
corresponding global `ALLOW` ACL.

Example:

``` text
TEAM_LEAD
   +
TEAM.CREATE
   ↓
Global ACL
   ↓
ALLOW
```

Another example:

``` text
EMPLOYEE
   +
DOCUMENT.CREATE
   ↓
Global ACL
   ↓
ALLOW
```

------------------------------------------------------------------------

# 11. ACL Structure

Current ACL fields:

``` text
hierarchyLevel
permission
department
team
employee
effect
status
createdBy
createdAt
updatedAt
```

Supported effects:

``` text
ALLOW
DENY
```

Context levels:

``` text
Global
Department
Team
Employee
```

------------------------------------------------------------------------

# 12. ACL Resolution Priority

The current access-control service checks the most specific rule first:

``` text
1. Employee-specific ACL
          ↓
2. Team-specific ACL
          ↓
3. Department-specific ACL
          ↓
4. Global hierarchy-level ACL
```

Example:

``` text
Global:
EMPLOYEE + DOCUMENT.CREATE → ALLOW

Specific Employee:
Employee A + DOCUMENT.CREATE → DENY
```

Final result for Employee A:

``` text
DENY
```

because the employee-specific rule is more specific.

------------------------------------------------------------------------

# 13. ALLOW / DENY Decision

The current access-control flow is:

``` text
Request
   ↓
Authenticated User
   ↓
Employee / Hierarchy
   ↓
Permission lookup
   ↓
RolePermission lookup
   ↓
ACL lookup
   ↓
ALLOW / DENY
```

Final behavior:

``` text
No active ACL
      ↓
DENY

ACL effect = DENY
      ↓
DENY

ACL effect = ALLOW
      ↓
Request continues
```

------------------------------------------------------------------------

# 14. Important Separation

These three layers have different responsibilities:

  Layer            Question it answers
  ---------------- -------------------------------------------------
  Permission       What action exists?
  RolePermission   Which hierarchy can receive the action?
  ACL              Where/for whom is the action allowed or denied?

Example:

``` text
DOCUMENT.CREATE
      ↓
Permission exists
      ↓
EMPLOYEE receives DOCUMENT.CREATE
      ↓
ACL checks the employee/team/department/global context
      ↓
ALLOW / DENY
```

------------------------------------------------------------------------

# 15. Administrative Separation

Permission Engine configuration is an administrative responsibility.

A user receiving a business permission such as:

``` text
TEAM.CREATE
```

does not automatically receive:

``` text
Permission configuration
RolePermission configuration
ACL configuration
```

This separation prevents normal business users from changing the
authorization system itself.

------------------------------------------------------------------------

# 16. Testing Completed

## 16.1 Permission Seed

``` text
Old permissions deleted: 6
New permissions created: 25
```

Status:

``` text
PASS
```

------------------------------------------------------------------------

## 16.2 RolePermission Seed

``` text
RolePermission created: 62
RolePermission skipped: 0
```

Status:

``` text
PASS
```

------------------------------------------------------------------------

## 16.3 Global ACL

Global ACL rules were generated from active RolePermissions.

Status:

``` text
PASS
```

------------------------------------------------------------------------

## 16.4 ALLOW Behavior

A valid user with:

``` text
Permission
+
RolePermission
+
Active ALLOW ACL
```

was able to access the protected API.

Status:

``` text
PASS
```

------------------------------------------------------------------------

## 16.5 Specific DENY Override

A specific employee-level `DENY` ACL was created for testing.

Concept:

``` text
Global ALLOW
        +
Employee-specific DENY
        ↓
Access denied
```

The request returned:

``` text
Access denied by ACL.
```

Status:

``` text
PASS
```

The temporary DENY test rule was then made inactive so normal global
ALLOW behavior could continue.

------------------------------------------------------------------------

## 16.6 Team Authorization

The current Team authorization testing covered:

``` text
TEAM.CREATE
TEAM.VIEW
TEAM.EDIT
TEAM.DELETE
```

Team Lead business access was tested through the Permission +
RolePermission + ACL flow.

Status:

``` text
PASS
```

------------------------------------------------------------------------

## 16.7 Document Authorization

Document access control was tested with the current permission engine.

Status:

``` text
PASS
```

------------------------------------------------------------------------

# 17. Current Permission Engine Status

``` text
Permission Module
        ↓
COMPLETED + TESTED

RolePermission Module
        ↓
COMPLETED + TESTED

Global ACL
        ↓
COMPLETED + TESTED

ACL Middleware
        ↓
IMPLEMENTED + TESTED

ALLOW
        ↓
TESTED

DENY
        ↓
TESTED

Specific Employee DENY Override
        ↓
TESTED
```

------------------------------------------------------------------------

# 18. What Is Complete?

## Completed

-   Permission definitions
-   Permission seeding
-   Permission resource/action structure
-   RolePermission model
-   RolePermission validation
-   RolePermission matrix
-   62 hierarchy-permission assignments
-   Global ACL generation
-   Global ALLOW rules
-   Employee-specific ACL support
-   Team-specific ACL support
-   Department-specific ACL support
-   ALLOW handling
-   DENY handling
-   Specific ACL precedence
-   Protected route integration
-   Permission/RolePermission/ACL testing

------------------------------------------------------------------------

# 19. What Is Not a Separate Requirement / API

## Separate Publish API

A separate Publish API is not required by the current implemented
workflow.

The current final publication behavior is:

``` text
GOVERNANCE
     ↓
APPROVE
     ↓
Workflow = COMPLETED
     ↓
Document = PUBLISHED
```

Therefore:

``` text
Separate Publish API → Not currently required
```

The `DOCUMENT.PUBLISH` permission exists as part of the Permission
master and Governance role configuration, but the current workflow
performs final publication through the Governance approval transition.

------------------------------------------------------------------------

# 20. Current Gaps / Important Notes

The following should be treated carefully:

### No-ACL test

The current access-control service is designed so:

``` text
No matching active ACL → DENY
```

This behavior exists in the implementation.

A separate final regression test can be performed later if required, but
it is not necessary to change the authorization logic.

### Full Permission Coverage

The Permission collection currently contains 25 permissions, but not
every hierarchy receives every permission.

That is intentional in the current implemented RolePermission matrix.

### FRS Alignment

The FRS states that Super Admin can configure permissions for every
hierarchy and describes actions such as View, Create, Edit, Delete,
Review, Approve, Publish, Archive, and Restore.
fileciteturn100file19L1-L8

The exact current 25-permission and 62-RolePermission matrix documented
above is the **implemented configuration**, not a claim that every
matrix cell is explicitly mandated by the FRS.

------------------------------------------------------------------------

# 21. Complete Authorization Example

Example: Employee creates a document.

``` text
Employee Login
      ↓
Authentication succeeds
      ↓
Employee hierarchy = EMPLOYEE
      ↓
Requested permission = DOCUMENT.CREATE
      ↓
Permission exists and ACTIVE
      ↓
RolePermission:
EMPLOYEE → DOCUMENT.CREATE
      ↓
ACL lookup
      ↓
Global / Team / Department / Employee rule
      ↓
ALLOW
      ↓
Document Controller
```

If a specific employee DENY exists:

``` text
Employee-specific DENY
      ↓
403 Access denied by ACL
```

------------------------------------------------------------------------

# 22. Final Permission Architecture

``` text
                    EGKMS AUTHORIZATION
                           │
                           ▼
                    Authentication
                           │
                           ▼
                     Employee/User
                           │
                           ▼
                    Hierarchy Level
                           │
                           ▼
                       Permission
                    Resource + Action
                           │
                           ▼
                    RolePermission
                           │
                           ▼
                          ACL
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
        Specific        Specific       Global
        Employee          Team        Hierarchy
            │              │              │
            └──────────────┼──────────────┘
                           ▼
                       ALLOW / DENY
                           │
                           ▼
                     Protected API
```

------------------------------------------------------------------------

# 23. Final Status

``` text
Permission Definition        → COMPLETED
Permission Seed              → COMPLETED
RolePermission Matrix        → COMPLETED
Global ACL Seed              → COMPLETED
ACL ALLOW                    → COMPLETED + TESTED
ACL DENY                     → COMPLETED + TESTED
Specific DENY Override       → COMPLETED + TESTED
Protected API Integration    → COMPLETED + TESTED

Overall Permission Engine
→ COMPLETED + TESTED
```

------------------------------------------------------------------------

# 24. Quick Meeting Explanation

If asked **"How does the EGKMS Permission System work?"**:

> Permission defines the available action for a resource. RolePermission
> assigns that permission to an organizational hierarchy level. ACL then
> applies the most specific access rule for the employee, team,
> department, or global hierarchy and makes the final Allow or Deny
> decision.

If asked **"What did you implement?"**:

> I created 25 permissions, assigned them across the eight EGKMS
> hierarchy levels using 62 RolePermission records, generated global ACL
> Allow rules from those assignments, and implemented specific Employee,
> Team, and Department ACL support with Allow/Deny handling and
> specific-rule precedence. I also tested the authorization behavior on
> protected APIs.

------------------------------------------------------------------------

# 25. Reference Documents

Related EGKMS documentation:

``` text
PERMISSION_MODULE.md
ROLE_PERMISSION_MODULE.md
ACCESS_CONTROL.md
ACL_MODULE.md
```

The EGKMS FRS remains the primary source of truth for requirements.
