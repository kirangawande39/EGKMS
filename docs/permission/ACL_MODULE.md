# ACL (Access Control List) Module

## 1. Purpose

ACL stands for **Access Control List**.

The ACL Module provides context-specific access rules on top of Permission and RolePermission.

It answers:

> For this hierarchy, permission, department, team, or employee context, should access be ALLOW or DENY?

## 2. FRS Alignment

The FRS defines a layered Access Control Engine containing ACL validation and a final Allow / Deny decision.

The FRS states that access is granted only when every required validation succeeds.

## 3. ACL Structure

Current ACL fields:

```text
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

### hierarchyLevel

The hierarchy to which the ACL rule applies.

### permission

MongoDB ObjectId reference to a Permission.

### department

Optional Department ObjectId.

### team

Optional Team ObjectId.

### employee

Optional Employee ObjectId.

### effect

```text
ALLOW
DENY
```

### status

```text
ACTIVE
INACTIVE
```

## 4. ACL Scope

The current access-control implementation checks the most specific active rule first:

```text
Employee
    ↓
Team
    ↓
Department
    ↓
Global Hierarchy
```

This allows a specific rule to override a broader rule.

## 5. ALLOW / DENY

### ALLOW

The request can continue when all previous checks succeed and the selected ACL effect is:

```text
ALLOW
```

### DENY

The request is blocked when the selected ACL effect is:

```text
DENY
```

Example:

```text
TEAM_LEAD
TEAM.CREATE
Employee = Amit
Effect = DENY
```

If Amit requests Team creation, the employee-specific DENY is selected before the global Team Lead ALLOW.

## 6. No ACL Rule

The current middleware treats the absence of an active matching ACL rule as:

```text
DENY
```

This provides a default-deny behavior.

## 7. API Operations

The ACL module supports:

```text
Create ACL
Get ACLs
Get ACL By ID
Update ACL
Update ACL Status
Delete ACL
```

Typical routes:

```text
POST   /acl
GET    /acl
GET    /acl/:aclId
PATCH  /acl/:aclId
PATCH  /acl/:aclId/status
DELETE /acl/:aclId
```

ACL configuration is administrative configuration and is not performed by normal Team Lead requests.

## 8. Example: Global ALLOW

```json
{
  "hierarchyLevel": "TEAM_LEAD",
  "permission": "TEAM.CREATE",
  "department": null,
  "team": null,
  "employee": null,
  "effect": "ALLOW",
  "status": "ACTIVE"
}
```

## 9. Example: Employee-Specific DENY

```json
{
  "hierarchyLevel": "TEAM_LEAD",
  "permission": "TEAM.CREATE",
  "department": null,
  "team": null,
  "employee": "AMIT_EMPLOYEE_ID",
  "effect": "DENY",
  "status": "ACTIVE"
}
```

This was manually tested and successfully blocked Amit's Team creation request.

After the test, the DENY rule was changed to:

```text
INACTIVE
```

Amit could then create a Team again through the active global ALLOW rule.

## 10. Security Rule

ACL configuration must be protected separately from normal business-resource access.

For example:

```text
Team Lead
    ↓
TEAM.CREATE
    ↓
May create a Team if allowed
```

but:

```text
Team Lead
    ↓
ACL configuration
    ↓
Not authorized
```

## 11. Related Documents

```text
PERMISSION_MODULE.md
ROLE_PERMISSION_MODULE.md
ACCESS_CONTROL.md
```
