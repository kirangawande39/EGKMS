# EGKMS --- Workflow / Approval Module Documentation

## 1. Module Overview

The Workflow module manages document submission and review routing in
EGKMS.

Current implemented flow:

``` text
Employee
   ↓
Submit Document
   ↓
Find Employee Team
   ↓
Find Team Lead
   ↓
Create Workflow
   ↓
PENDING_REVIEW
```

------------------------------------------------------------------------

## 2. FRS Alignment

The FRS requires documents to follow the organizational hierarchy
without skipping levels:

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
   ↓
Published
```

The FRS also states that Team Leads review Employee/Intern documents and
submit them to the Manager. Employees must be able to submit documents
and view review status.

------------------------------------------------------------------------

## 3. Current Workflow Data

A workflow record currently contains:

``` text
document
currentReviewer
currentLevel
status
lastAction
lastActionBy
submittedAt
reviewedAt
```

Example:

``` text
currentLevel     → TEAM_LEAD
status           → PENDING_REVIEW
lastAction       → SUBMITTED
currentReviewer  → Team Lead Employee._id
```

------------------------------------------------------------------------

## 4. Document Submit API

### Endpoint

``` http
POST /api/v1/workflow/:documentId/submit
```

### Purpose

Submits a Draft document for review and creates the first workflow
record.

### Current Flow

``` text
Employee
   ↓
Submit Draft
   ↓
Find Employee
   ↓
Find Employee Team
   ↓
Find Team Lead
   ↓
Create Workflow
   ↓
Document = SUBMITTED
   ↓
Workflow = PENDING_REVIEW
```

------------------------------------------------------------------------

## 5. Reviewer Routing

The reviewer is selected from the Employee's Team.

``` text
Employee
   ↓
Employee.team
   ↓
Team
   ↓
Team.teamLead
   ↓
Correct Team Lead
```

Example:

``` text
Rahul
   ↓
Frontend Engineering
   ↓
Amit Shinde
   ↓
currentReviewer = Amit Shinde
```

This ensures the document goes to the Team Lead of the Employee's own
Team.

------------------------------------------------------------------------

## 6. Pending Workflow API

### Endpoint

``` http
GET /api/v1/workflow/pending
```

### Purpose

Returns workflows currently waiting for the logged-in reviewer.

### Access Logic

``` text
Logged-in Employee
        ↓
Workflow.currentReviewer
        ↓
Matching pending workflows only
```

A Team Lead should only receive documents assigned to that Team Lead.

### Tested Result

``` text
Employee account
    → data: []

Correct Team Lead account
    → submitted document returned
```

------------------------------------------------------------------------

## 7. My Submissions API

### Endpoint

``` http
GET /api/v1/workflow/my-submissions
```

### Purpose

Allows the logged-in Employee to see the workflow status of their
submitted documents.

This supports the FRS requirement for Employee/Intern:

``` text
Review Status
```

### Current Response Includes

``` text
Document
Owner
Department
Team
File information
Current Reviewer
Current Level
Workflow Status
Last Action
Submitted At
Reviewed At
```

Example:

``` text
Document:
Employee Leave Policy

Current Reviewer:
Amit Shinde

Current Level:
TEAM_LEAD

Status:
PENDING_REVIEW

Last Action:
SUBMITTED
```

------------------------------------------------------------------------

## 8. Organizational Relationships

Workflow depends on correct existing relationships:

``` text
Department
    ↓
Team
    ↓
Team Lead
    ↓
Employee
```

Important references:

``` text
Team.department
        ↓
Department._id

Team.teamLead
        ↓
Employee._id

Employee.department
        ↓
Department._id

Employee.team
        ↓
Team._id

Employee.reportingManager
        ↓
Employee._id
```

The Team Lead must have:

``` text
hierarchyLevel = TEAM_LEAD
```

------------------------------------------------------------------------

## 9. Testing Completed

### Test 1 --- Employee Pending API

The Employee who submitted the document called:

``` http
GET /api/v1/workflow/pending
```

Result:

``` text
data: []
```

This is correct because the Employee is not the current reviewer.

### Test 2 --- Correct Team Lead Pending API

Amit Shinde logged in and called:

``` http
GET /api/v1/workflow/pending
```

Result:

``` text
Rahul's document returned
currentReviewer = Amit
currentLevel = TEAM_LEAD
status = PENDING_REVIEW
```

### Test 3 --- Reviewer Routing

Old test data had the wrong Team Lead relationship.

After correcting the data:

``` text
Team.teamLead → Amit
Amit.hierarchyLevel → TEAM_LEAD
```

the document was reset to Draft and submitted again.

Final result:

``` text
currentReviewer = Amit's Employee._id
```

### Test 4 --- My Submissions

Rahul called:

``` http
GET /api/v1/workflow/my-submissions
```

The submitted document and current workflow status were returned
successfully.

------------------------------------------------------------------------

## 10. Current API List

``` text
POST /api/v1/workflow/:documentId/submit
        ↓
Submit document for review

GET /api/v1/workflow/pending
        ↓
Get documents assigned to logged-in reviewer

GET /api/v1/workflow/my-submissions
        ↓
Get logged-in Employee's submitted workflow status
```

------------------------------------------------------------------------

## 11. Current Module Status

``` text
Workflow Model
        ↓
COMPLETED

Workflow Validator
        ↓
COMPLETED

Workflow Service
        ↓
COMPLETED + TESTED

Workflow Controller
        ↓
COMPLETED + TESTED

Workflow Routes
        ↓
COMPLETED + TESTED

Document Submission
        ↓
COMPLETED + TESTED

Team Lead Routing
        ↓
COMPLETED + TESTED

Pending Workflow API
        ↓
COMPLETED + TESTED

My Submissions API
        ↓
COMPLETED + TESTED
```

------------------------------------------------------------------------

## 12. What Is Remaining

The Workflow module is **not fully completed yet**.

Remaining major work:

``` text
Team Lead Review
        ↓
Approve / Return
        ↓
Manager Review
        ↓
Department Head Review
        ↓
Executive Review
        ↓
Governance Review
        ↓
Final Approval / Publication
```

Also remaining:

``` text
Revision / Return handling
Escalation
Reminder mechanism
Complete approval history
Workflow audit logging
Version integration
Final workflow integration testing
```

These are not marked as completed until implemented and tested.

------------------------------------------------------------------------

## 13. Current Workflow Progress

``` text
Employee Creates Document
        ↓
DRAFT
        ↓
Employee Submits
        ↓
PENDING_REVIEW
        ↓
Team Lead
        ↓
CURRENTLY WORKING
        ↓
Team Lead Review
        ↓
NEXT
        ↓
Manager
        ↓
Department Head
        ↓
Executive
        ↓
Governance
        ↓
Published
```

------------------------------------------------------------------------

## 14. Frontend Developer Notes

### Team Lead Dashboard

Use:

``` http
GET /api/v1/workflow/pending
```

to show documents waiting for the logged-in Team Lead.

### Employee Dashboard

Use:

``` http
GET /api/v1/workflow/my-submissions
```

to show submitted documents and their current review status.

The frontend should not decide the reviewer.

The backend determines the reviewer using:

``` text
Employee
   ↓
Team
   ↓
Team.teamLead
```

------------------------------------------------------------------------

## 15. Important Test Data Rule

Before testing workflow, verify:

``` text
Employee.department → Correct Department
Employee.team → Correct Team
Team.department → Same Department
Team.teamLead → Correct Team Lead
Team Lead.hierarchyLevel → TEAM_LEAD
Employee.status → ACTIVE
Team.status → ACTIVE
Department.status → ACTIVE
```

Incorrect organization data can cause incorrect workflow routing.

------------------------------------------------------------------------

## 16. FRS Reference

The FRS requires:

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
   ↓
Published
```

The FRS also requires Team Leads to review Employee documents and
Employees/Interns to have review-status visibility.

The FRS requires workflow transitions to generate audit logs. Audit
logging is still remaining work.

------------------------------------------------------------------------

## 17. Final Status

``` text
Workflow Module
        ↓
PARTIALLY COMPLETED
        ↓
Submission
Reviewer Routing
Pending Workflows
My Submissions
        ↓
IMPLEMENTED + TESTED ✅

Approval
Return / Revision
Escalation
Audit Integration
Full Hierarchy
        ↓
REMAINING
```

The current implementation is the first working part of the complete
EGKMS Workflow / Approval Engine.
