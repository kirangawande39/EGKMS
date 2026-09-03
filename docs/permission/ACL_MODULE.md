# ACL (Access Control List) Module

## 1. Purpose

ACL stands for **Access Control List**.

The ACL Module provides context-specific access rules on top of Permission and RolePermission.

It answers:

> For this hierarchy, permission, department, team, or employee context, should access be **ALLOW** or **DENY**?

---

## 2. FRS Alignment

The FRS defines a layered Access Control Engine containing ACL validation and a final Allow / Deny decision.

The FRS states that access is granted only when every required validation succeeds.

ACL works as an additional access-control layer after Permission and RolePermission validation.

---

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

### permission

MongoDB ObjectId reference to a Permission.

Example:

```text
TEAM.CREATE
```

The actual ACL document stores the Permission ObjectId.

### department

Optional Department ObjectId.

Used when the ACL rule applies to a specific department.

### team

Optional Team ObjectId.

Used when the ACL rule applies to a specific team.

### employee

Optional Employee ObjectId.

Used when the ACL rule applies to a specific employee.

### effect

Defines whether access is allowed or denied.

```text
ALLOW
DENY
```

### status

Defines whether the ACL rule is currently active.

```text
ACTIVE
INACTIVE
```

---

## 4. ACL Scope

ACL rules can be applied at different levels of specificity.

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

### Scope Types

The ACL system supports the following logical scopes:

```text
GLOBAL
DEPARTMENT
TEAM
EMPLOYEE
```

### GLOBAL

A Global ACL applies to the entire hierarchy level.

A Global ACL has:

```text
department = null
team = null
employee = null
```

Example:

```text
TEAM_LEAD
TEAM.CREATE
Global
ALLOW
```

### DEPARTMENT

A Department ACL applies to a specific department.

```text
department != null
team = null
employee = null
```

### TEAM

A Team ACL applies to a specific team.

```text
team != null
employee = null
```

### EMPLOYEE

An Employee ACL applies to a specific employee.

```text
employee != null
```

### Important

`scope` is a **logical filter** and is not stored as a separate field in the ACL database.

The backend determines the scope using:

```text
department
team
employee
```

---

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

---

## 6. No ACL Rule

The current middleware treats the absence of an active matching ACL rule as:

```text
DENY
```

This provides a **default-deny** behavior.

Therefore, access is not granted simply because no DENY rule exists.

An active matching ALLOW rule is required.

---

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

### Routes

```text
POST   /acl
GET    /acl
GET    /acl/:aclId
PATCH  /acl/:aclId
PATCH  /acl/:aclId/status
DELETE /acl/:aclId
```

ACL configuration is administrative configuration and is not performed by normal Team Lead requests.

---

# 8. GET ACL API

The GET `/acl` API supports filtering ACL records using query parameters.

## 8.1 Supported Filters

| Filter           | Supported Values / Input                                                                  | Purpose                           |
| ---------------- | ----------------------------------------------------------------------------------------- | --------------------------------- |
| `hierarchyLevel` | SUPER_ADMIN, GOVERNANCE, EXECUTIVE, DEPARTMENT_HEAD, MANAGER, TEAM_LEAD, EMPLOYEE, INTERN | Filter ACL by hierarchy           |
| `permission`     | Permission ObjectId                                                                       | Filter ACL by specific permission |
| `scope`          | GLOBAL, DEPARTMENT, TEAM, EMPLOYEE                                                        | Filter ACL by context/scope       |
| `department`     | Department ObjectId                                                                       | Filter by department              |
| `team`           | Team ObjectId                                                                             | Filter by team                    |
| `employee`       | Employee ObjectId                                                                         | Filter by employee                |
| `effect`         | ALLOW, DENY                                                                               | Filter by access decision         |
| `status`         | ACTIVE, INACTIVE                                                                          | Filter by ACL status              |

---

## 8.2 Get All ACLs

```http
GET /acl
```

Returns all ACL records.

---

## 8.3 Filter by Hierarchy Level

```http
GET /acl?hierarchyLevel=TEAM_LEAD
```

Returns ACL rules assigned to the `TEAM_LEAD` hierarchy.

Example:

```http
GET /acl?hierarchyLevel=MANAGER
```

---

## 8.4 Filter by Permission

```http
GET /acl?permission=PERMISSION_ID
```

Returns ACL rules associated with the specified Permission.

Example:

```http
GET /acl?permission=64abc123...
```

---

## 8.5 Filter by Scope

### Global ACLs

```http
GET /acl?scope=GLOBAL
```

Returns ACLs where:

```text
department = null
team = null
employee = null
```

### Department ACLs

```http
GET /acl?scope=DEPARTMENT
```

Returns ACLs where:

```text
department != null
team = null
employee = null
```

### Team ACLs

```http
GET /acl?scope=TEAM
```

Returns ACLs where:

```text
team != null
employee = null
```

### Employee ACLs

```http
GET /acl?scope=EMPLOYEE
```

Returns ACLs where:

```text
employee != null
```

---

## 8.6 Filter by Department

```http
GET /acl?department=DEPARTMENT_ID
```

Returns ACL rules associated with the specified department.

---

## 8.7 Filter by Team

```http
GET /acl?team=TEAM_ID
```

Returns ACL rules associated with the specified team.

---

## 8.8 Filter by Employee

```http
GET /acl?employee=EMPLOYEE_ID
```

Returns ACL rules associated with the specified employee.

---

## 8.9 Filter by Effect

### ALLOW

```http
GET /acl?effect=ALLOW
```

### DENY

```http
GET /acl?effect=DENY
```

---

## 8.10 Filter by Status

### Active

```http
GET /acl?status=ACTIVE
```

### Inactive

```http
GET /acl?status=INACTIVE
```

---

## 8.11 Multiple Filters

Multiple filters can be used together.

Example:

```http
GET /acl?scope=GLOBAL&hierarchyLevel=TEAM_LEAD&effect=ALLOW&status=ACTIVE
```

This returns:

```text
Scope       = GLOBAL
Hierarchy   = TEAM_LEAD
Effect      = ALLOW
Status      = ACTIVE
```

Another example:

```http
GET /acl?scope=EMPLOYEE&employee=EMPLOYEE_ID&effect=DENY&status=ACTIVE
```

This returns active employee-specific DENY rules for the specified employee.

---

## 8.12 Frontend Filter Options

The frontend can provide the following filters.

### Scope

```text
ALL
GLOBAL
DEPARTMENT
TEAM
EMPLOYEE
```

### Hierarchy Level

```text
ALL
SUPER_ADMIN
GOVERNANCE
EXECUTIVE
DEPARTMENT_HEAD
MANAGER
TEAM_LEAD
EMPLOYEE
INTERN
```

### Permission

```text
ALL
Permission list
```

### Department

```text
ALL
Department list
```

### Team

```text
ALL
Team list
```

### Employee

```text
ALL
Employee list
```

### Effect

```text
ALL
ALLOW
DENY
```

### Status

```text
ALL
ACTIVE
INACTIVE
```

### Important Frontend Rule

`ALL` is a frontend-only option.

When `ALL` is selected, the frontend should **not send that filter** to the backend.

Correct:

```http
GET /acl
```

Incorrect:

```http
GET /acl?scope=ALL
```

---

## 8.13 Currently Supported GET Filters

The backend currently supports exactly these filters:

```text
hierarchyLevel
permission
scope
department
team
employee
effect
status
```

The frontend should use these query parameters when filtering ACL records.

### Not Currently Supported

The current ACL GET service does **not** support:

```text
page
limit
search
```

Therefore, the frontend should not send these parameters unless pagination or search support is added to the backend later.

---

# 9. Example: Global ALLOW

```json
{
  "hierarchyLevel": "TEAM_LEAD",
  "permission": "PERMISSION_ID",
  "department": null,
  "team": null,
  "employee": null,
  "effect": "ALLOW",
  "status": "ACTIVE"
}
```

This rule allows the `TEAM_LEAD` hierarchy to perform the associated permission globally, provided all previous access-control checks succeed.

---

# 10. Example: Employee-Specific DENY

```json
{
  "hierarchyLevel": "TEAM_LEAD",
  "permission": "PERMISSION_ID",
  "department": null,
  "team": null,
  "employee": "AMIT_EMPLOYEE_ID",
  "effect": "DENY",
  "status": "ACTIVE"
}
```

This rule specifically denies the selected permission for Amit.

If a broader rule exists:

```text
TEAM_LEAD
TEAM.CREATE
Global
ALLOW
```

and the employee-specific rule is:

```text
TEAM_LEAD
TEAM.CREATE
Amit
DENY
```

the employee-specific DENY takes precedence.

---

# 11. Example: Department-Level Rule

```json
{
  "hierarchyLevel": "TEAM_LEAD",
  "permission": "PERMISSION_ID",
  "department": "DEPARTMENT_ID",
  "team": null,
  "employee": null,
  "effect": "DENY",
  "status": "ACTIVE"
}
```

This applies the rule to the selected department.

---

# 12. Example: Team-Level Rule

```json
{
  "hierarchyLevel": "TEAM_LEAD",
  "permission": "PERMISSION_ID",
  "department": null,
  "team": "TEAM_ID",
  "employee": null,
  "effect": "DENY",
  "status": "ACTIVE"
}
```

This applies the rule to the selected team.

---

# 13. ACL Specificity Example

Consider the following rules:

```text
Global
TEAM_LEAD
TEAM.CREATE
ALLOW

Department
TEAM_LEAD
TEAM.CREATE
DENY

Team
TEAM_LEAD
TEAM.CREATE
ALLOW

Employee
TEAM_LEAD
TEAM.CREATE
DENY
```

For the affected employee, the evaluation order is:

```text
Employee
    ↓
Team
    ↓
Department
    ↓
Global
```

The first matching active rule is selected.

Therefore:

```text
Employee DENY
      ↓
Final Decision = DENY
```

---

# 14. ACL Status

ACL rules can be activated or deactivated.

### Active

```text
status = ACTIVE
```

The rule participates in access-control evaluation.

### Inactive

```text
status = INACTIVE
```

The rule does not participate in access-control evaluation.

Example:

An employee-specific DENY rule is created:

```text
TEAM_LEAD
TEAM.CREATE
Employee = Amit
DENY
ACTIVE
```

Amit is blocked from creating a Team.

If the rule is changed to:

```text
INACTIVE
```

the rule is ignored.

If an active global ALLOW rule exists, Amit can then create a Team through that broader rule.

---

# 15. Security Rule

ACL configuration must be protected separately from normal business-resource access.

For example:

```text
Team Lead
    ↓
TEAM.CREATE
    ↓
May create a Team if allowed
```

But:

```text
Team Lead
    ↓
ACL Configuration
    ↓
Not Authorized
```

Normal business-resource permissions and ACL administration permissions must be treated separately.

ACL configuration should only be accessible to authorized administrative/governance users according to the application's authorization configuration.

---

# 16. Frontend Implementation Summary

The ACL management screen can provide:

```text
--------------------------------------------------
ACL Management
--------------------------------------------------

Search
[ Not currently supported by backend ]

Scope
[ ALL ▼ ]

Hierarchy Level
[ ALL ▼ ]

Permission
[ ALL ▼ ]

Department
[ ALL ▼ ]

Team
[ ALL ▼ ]

Employee
[ ALL ▼ ]

Effect
[ ALL ▼ ]

Status
[ ALL ▼ ]

--------------------------------------------------
ACL List
--------------------------------------------------

Hierarchy | Permission | Scope | Department | Team
Employee  | Effect     | Status | Created By
--------------------------------------------------
```

For each filter, the frontend should send the corresponding supported query parameter.

Example:

```http
GET /acl?scope=EMPLOYEE&hierarchyLevel=TEAM_LEAD&effect=DENY&status=ACTIVE
```

The frontend should not send unsupported parameters such as:

```text
search
page
limit
```

unless backend support is implemented later.

---

# 17. Related Documents

```text
PERMISSION_MODULE.md
ROLE_PERMISSION_MODULE.md
ACCESS_CONTROL.md
```
