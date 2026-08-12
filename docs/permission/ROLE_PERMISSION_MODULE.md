# RolePermission Module

## 1. Purpose

The RolePermission Module connects a Permission with an organizational hierarchy level.

It answers:

> Which hierarchy level has this permission?

Example:

```text
TEAM.CREATE
        ↓
TEAM_LEAD
```

## 2. FRS Alignment

The FRS states that permissions can be configured for every hierarchy and that permissions are assigned by the appropriate higher authority.

The organizational hierarchy is:

```text
SUPER_ADMIN
    ↓
GOVERNANCE
    ↓
EXECUTIVE
    ↓
DEPARTMENT
    ↓
MANAGER
    ↓
TEAM_LEAD
    ↓
TEAM
    ↓
EMPLOYEE
    ↓
INTERN
```

## 3. RolePermission Structure

Current fields:

```text
hierarchyLevel
permission
assignedBy
status
createdAt
updatedAt
```

### hierarchyLevel

One of the supported organizational hierarchy levels.

### permission

MongoDB ObjectId reference to a Permission.

### assignedBy

MongoDB ObjectId reference to the User who assigned the permission.

### status

```text
ACTIVE
INACTIVE
```

Only ACTIVE assignments participate in access checks.

## 4. Assignment Flow

```text
Permission
    ↓
Select hierarchy level
    ↓
RolePermission
    ↓
ACTIVE assignment
```

Example:

```json
{
  "hierarchyLevel": "TEAM_LEAD",
  "permission": "PERMISSION_OBJECT_ID",
  "status": "ACTIVE"
}
```

## 5. Validation Rules

When creating a RolePermission:

```text
Permission must exist
        ↓
Permission must be ACTIVE
        ↓
Hierarchy level must be valid
        ↓
Duplicate assignment must not exist
        ↓
Create RolePermission
```

The service prevents assigning the same permission to the same hierarchy more than once.

## 6. API Operations

The RolePermission module supports:

```text
Create RolePermission
Get RolePermissions
Get RolePermission By ID
Update RolePermission
Update RolePermission Status
Delete RolePermission
```

Typical routes:

```text
POST   /rolePermission
GET    /rolePermission
GET    /rolePermission/:rolePermissionId
PATCH  /rolePermission/:rolePermissionId
PATCH  /rolePermission/:rolePermissionId/status
DELETE /rolePermission/:rolePermissionId
```

## 7. Example

```text
Permission:
TEAM.CREATE

RolePermission:
TEAM_LEAD → TEAM.CREATE
```

This means Team Lead is eligible for the permission, but final access still depends on the ACL (Access Control List).

```text
User
 ↓
Hierarchy = TEAM_LEAD
 ↓
RolePermission = TEAM.CREATE
 ↓
ACL (Access Control List)
 ↓
ALLOW / DENY
```

## 8. Tested Team Configuration

During Team authorization testing:

```text
SUPER_ADMIN → TEAM.CREATE
TEAM_LEAD   → TEAM.CREATE

SUPER_ADMIN → TEAM.VIEW
TEAM_LEAD   → TEAM.VIEW

SUPER_ADMIN → TEAM.EDIT
TEAM_LEAD   → TEAM.EDIT

SUPER_ADMIN → TEAM.DELETE
```

The Team Lead DELETE request was rejected.

## 9. Important Rule

RolePermission is not the final authorization decision.

It only establishes that a hierarchy is assigned a permission.

The final decision is made by the Access Control flow.

## 10. Related Documents

```text
PERMISSION_MODULE.md
ACL_MODULE.md
ACCESS_CONTROL.md
```
