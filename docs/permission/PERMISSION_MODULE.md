# Permission Module

## 1. Purpose

The Permission Module defines the fine-grained actions that can be performed on a system resource.

A permission is represented by:

```text
RESOURCE + ACTION
```

Example:

```text
TEAM + CREATE
TEAM + VIEW
TEAM + EDIT
TEAM + DELETE
```

The module is part of the EGKMS Permission Engine.

## 2. FRS Alignment

The FRS states that the Super Admin can configure permissions for every hierarchy and gives examples including:

```text
View
Create
Edit
Delete
Review
Approve
Publish
Archive
Restore
```

The FRS also requires every request to pass through the Access Control Engine and finish with an Allow / Deny decision.

## 3. Permission Structure

Current permission fields:

```text
resource
action
description
status
createdBy
createdAt
updatedAt
```

### Resource

Identifies the system resource.

Example:

```text
TEAM
```

### Action

Identifies the operation.

Current supported actions:

```text
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

### Status

```text
ACTIVE
INACTIVE
```

Only an ACTIVE permission can participate in access checks.

## 4. Permission Validation

Permission input is validated before it reaches the service layer.

The action must be one of the supported actions.

Example:

```json
{
  "resource": "TEAM",
  "action": "CREATE",
  "description": "Create teams",
  "status": "ACTIVE"
}
```

## 5. Permission Management Responsibility

The FRS identifies Permission Management as a Super Admin responsibility.

The Super Admin can configure permissions for every hierarchy.

## 6. API Operations

The Permission module supports:

```text
Create Permission
Get All Permissions
Get Permission By ID
Update Permission
Update Permission Status
Delete Permission
```

Typical routes:

```text
POST   /permission
GET    /permission
GET    /permission/:permissionId
PATCH  /permission/:permissionId
PATCH  /permission/:permissionId/status
DELETE /permission/:permissionId
```

All Permission configuration operations are protected by authentication and the configured administrative authorization.

## 7. Example

```text
Permission
resource: TEAM
action: CREATE
status: ACTIVE
```

This permission does not by itself give a user access.

The permission must first be assigned to a hierarchy through RolePermission and then pass the ACL (Access Control List) decision.

```text
Permission
    ↓
RolePermission
    ↓
ACL (Access Control List)
    ↓
ALLOW / DENY
```

## 8. Current Team Permissions

The Team access tests configured during development include:

```text
TEAM.CREATE
TEAM.VIEW
TEAM.EDIT
TEAM.DELETE
```

The tested configuration allows:

```text
SUPER_ADMIN → CREATE, VIEW, EDIT, DELETE
TEAM_LEAD   → CREATE, VIEW, EDIT
```

`TEAM.DELETE` for Team Lead is denied by the authorization configuration.

## 9. Important Rule

Do not treat a Permission record as direct user authorization.

Permission defines **what action exists**.

RolePermission defines **which hierarchy can receive that action**.

ACL (Access Control List) defines **where/for whom that action is allowed or denied**.

## 10. Related Documents

```text
ROLE_PERMISSION_MODULE.md
ACL_MODULE.md
ACCESS_CONTROL.md
```
