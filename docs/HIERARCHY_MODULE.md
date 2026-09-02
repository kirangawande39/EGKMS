# HIERARCHY MODULE DOCUMENTATION

## 1. Module Overview

The **Hierarchy Module** manages the predefined organizational hierarchy levels used by the EGKMS system.

For the current implementation, this module is used as a **read-only configuration module**.

The primary purpose of this module is to provide the available hierarchy levels to the frontend when creating an Employee.

### Current Scope

The module currently supports:

* Fetching all active hierarchy levels
* Returning hierarchy levels in the correct organizational order
* Providing only the fields required by the Employee Create form

### Current Runtime Usage

```text
Super Admin
    ↓
Create Employee
    ↓
Fetch Hierarchy Levels
    ↓
GET /hierarchy
    ↓
Show Hierarchy Dropdown
```

---

# 2. Hierarchy Levels

EGKMS uses the following **8 employee hierarchy levels**:

| Level | Hierarchy       |
| ----: | --------------- |
|     1 | SUPER_ADMIN     |
|     2 | GOVERNANCE      |
|     3 | EXECUTIVE       |
|     4 | DEPARTMENT_HEAD |
|     5 | MANAGER         |
|     6 | TEAM_LEAD       |
|     7 | EMPLOYEE        |
|     8 | INTERN          |

These values represent the employee's actual organizational hierarchy.

### Important

`DEPARTMENT` and `TEAM` are **not employee hierarchy levels**.

They are organizational entities:

```text
Employee
   ├── department → Department
   ├── team → Team
   └── reportingManager → Employee
```

Therefore, the following values must **not** be included in the Employee `hierarchyLevel`:

```text
DEPARTMENT
TEAM
```

The valid Employee hierarchy is:

```text
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

---

# 3. Current Database Structure

The Hierarchy document contains the following fields:

```js
{
  hierarchyLevel,
  level,
  parentId,
  description,
  status,
  createdBy
}
```

For the current GET functionality, the frontend only requires:

```text
_id
hierarchyLevel
level
```

The remaining fields are not required for the Employee Create hierarchy dropdown.

---

# 4. GET All Hierarchy

## Endpoint

```http
GET /hierarchy
```

### Authentication

Authentication is required.

```text
authenticate
```

Only an authenticated user can access the hierarchy list.

---

## Purpose

This API returns all active hierarchy levels from the database.

The records are sorted according to the predefined hierarchy order.

```text
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

---

# 5. Service Implementation

The service intentionally returns only the fields required by the Employee Create form.

```js
const getAllHierarchy = async () => {
  const hierarchy = await Hierarchy.find(
    { status: "active" },
    {
      hierarchyLevel: 1,
      level: 1,
    }
  ).sort({ level: 1 });

  return hierarchy;
};
```

### Why Only These Fields?

The Employee Create form requires:

```text
_id
hierarchyLevel
level
```

Therefore, the API does not need to return unnecessary metadata such as:

```text
parentId
createdBy
description
```

This keeps the API response simple and lightweight.

---

# 6. Expected Response

Example:

```json
{
  "success": true,
  "data": [
    {
      "_id": "6a...",
      "hierarchyLevel": "SUPER_ADMIN",
      "level": 1
    },
    {
      "_id": "6b...",
      "hierarchyLevel": "GOVERNANCE",
      "level": 2
    },
    {
      "_id": "6c...",
      "hierarchyLevel": "EXECUTIVE",
      "level": 3
    },
    {
      "_id": "6d...",
      "hierarchyLevel": "DEPARTMENT_HEAD",
      "level": 4
    },
    {
      "_id": "6e...",
      "hierarchyLevel": "MANAGER",
      "level": 5
    },
    {
      "_id": "6f...",
      "hierarchyLevel": "TEAM_LEAD",
      "level": 6
    },
    {
      "_id": "6g...",
      "hierarchyLevel": "EMPLOYEE",
      "level": 7
    },
    {
      "_id": "6h...",
      "hierarchyLevel": "INTERN",
      "level": 8
    }
  ]
}
```

The complete response contains all active hierarchy levels.

---

# 7. Why `status: "active"` Is Used

The Hierarchy collection contains active and inactive configuration records.

```text
active
inactive
```

The GET API filters only active records:

```js
{ status: "active" }
```

This ensures that inactive hierarchy levels are not displayed in the Employee Create form.

### Result

```text
Database
   ↓
Active Hierarchy Records
   ↓
GET /hierarchy
   ↓
Employee Create Dropdown
```

---

# 8. Sorting

The API uses:

```js
.sort({ level: 1 })
```

This sorts the hierarchy records by their numeric `level` value.

The expected order is:

```text
1 → SUPER_ADMIN
2 → GOVERNANCE
3 → EXECUTIVE
4 → DEPARTMENT_HEAD
5 → MANAGER
6 → TEAM_LEAD
7 → EMPLOYEE
8 → INTERN
```

This ensures that the frontend receives the hierarchy in a consistent organizational order.

---

# 9. Route

Current route:

```js
router.get(
  "/",
  authenticate,
  hierarchyController.getAllHierarchy
);
```

### Request Flow

```text
GET /hierarchy
      ↓
authenticate
      ↓
getAllHierarchy Controller
      ↓
getAllHierarchy Service
      ↓
Hierarchy.find()
      ↓
Filter active records
      ↓
Select required fields
      ↓
Sort by level
      ↓
Response
```

---

# 10. Controller

The controller calls the hierarchy service:

```js
exports.getAllHierarchy = async (req, res, next) => {
  try {
    const hierarchy = await hierarchyService.getAllHierarchy();

    res.status(200).json({
      success: true,
      data: hierarchy,
    });
  } catch (error) {
    next(error);
  }
};
```

The controller does not contain database logic.

The database query remains inside the service layer.

---

# 11. Frontend Usage

The frontend can call:

```http
GET /hierarchy
```

and use the response to populate the Employee Create hierarchy dropdown.

### Example Dropdown

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

When the user selects a hierarchy level, the frontend sends the corresponding `hierarchyLevel` value to the Employee API.

Example:

```json
{
  "hierarchyLevel": "TEAM_LEAD"
}
```

The frontend should not use `DEPARTMENT` or `TEAM` as Employee hierarchy values.

---

# 12. Fields Used by Frontend

| Field            | Required | Purpose                           |
| ---------------- | -------- | --------------------------------- |
| `_id`            | Yes      | Database reference                |
| `hierarchyLevel` | Yes      | Actual employee hierarchy value   |
| `level`          | Yes      | Organizational ordering           |
| `parentId`       | No       | Not required for current dropdown |
| `description`    | No       | Not required                      |
| `status`         | No       | Used internally for filtering     |
| `createdBy`      | No       | Not required                      |
| `createdAt`      | No       | Not required                      |
| `updatedAt`      | No       | Not required                      |

---

# 13. Relationship with Department and Team

Department and Team are separate organizational entities and are not hierarchy levels.

The employee structure is:

```text
Employee
   │
   ├── hierarchyLevel
   │
   ├── department → Department
   │
   ├── team → Team
   │
   └── reportingManager → Employee
```

For example:

```text
Hierarchy Level:
TEAM_LEAD

Department:
Technology

Team:
Backend Development
```

Here:

```text
TEAM_LEAD = Employee hierarchy
Technology = Department
Backend Development = Team
```

They represent different concepts and must not be mixed.

---

# 14. Current Module Scope

### Currently Used

```text
GET /hierarchy
```

This is the only hierarchy operation currently required by the application.

### Currently Not Used

The following operations are not part of the current runtime requirement:

```text
POST   /hierarchy
PATCH  /hierarchy/:id
DELETE /hierarchy/:id
GET    /hierarchy/:id
```


These operations are currently commented out / disabled and should **not** be considered active application functionality.

The hierarchy data is treated as predefined configuration data.

---

# 15. Important Implementation Rule

Do not add unnecessary CRUD functionality to the current Employee workflow.

The current requirement is:

```text
Hierarchy Database
       ↓
GET active hierarchy levels
       ↓
Employee Create Form
       ↓
Hierarchy Dropdown
       ↓
Employee API
```

The frontend should not maintain a hardcoded hierarchy list if the hierarchy data is already available from the database.

The database remains the source of truth for the available hierarchy levels.

---

# 16. Employee Hierarchy Validation

The Employee module should validate hierarchy levels against the same set of values:

```js
const hierarchyLevels = [
  "SUPER_ADMIN",
  "GOVERNANCE",
  "EXECUTIVE",
  "DEPARTMENT_HEAD",
  "MANAGER",
  "TEAM_LEAD",
  "EMPLOYEE",
  "INTERN",
];
```

The Employee `hierarchyLevel` field should use these values only.

```text
Valid:
SUPER_ADMIN
GOVERNANCE
EXECUTIVE
DEPARTMENT_HEAD
MANAGER
TEAM_LEAD
EMPLOYEE
INTERN

Invalid as hierarchyLevel:
DEPARTMENT
TEAM
```

---

# 17. Testing in Postman

### Request

```http
GET http://localhost:5000/<your-base-path>/hierarchy
```

### Authentication

```text
Required
```

### Verify

The response should:

* Return `success: true`
* Return only active hierarchy records
* Return `_id`
* Return `hierarchyLevel`
* Return `level`
* Return records sorted by `level`
* Return only the required hierarchy fields
* Not populate unnecessary `parentId` or `createdBy` data
* Contain only the 8 valid Employee hierarchy levels

Expected hierarchy:

```text
1 → SUPER_ADMIN
2 → GOVERNANCE
3 → EXECUTIVE
4 → DEPARTMENT_HEAD
5 → MANAGER
6 → TEAM_LEAD
7 → EMPLOYEE
8 → INTERN
```

---

# 18. Module Status

```text
Hierarchy Module
│
├── Database Configuration       ✅
├── Hierarchy Records            ✅
├── GET All Hierarchy            ✅ ACTIVE
│
├── GET Single Hierarchy         ⏸ NOT USED
├── Create Hierarchy             ⏸ NOT USED
├── Update Hierarchy             ⏸ NOT USED
└── Delete Hierarchy             ⏸ NOT USED
```

### Current Purpose

**Provide active employee hierarchy levels to the Employee Create form through a GET API.**

---

# 19. Final EGKMS Hierarchy Reference

The final Employee hierarchy used by EGKMS is:

```text
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

Organizational entities remain separate:

```text
Department
    ↓
Team
    ↓
Employee
```

Therefore, `DEPARTMENT` and `TEAM` should not be stored as Employee `hierarchyLevel` values.
