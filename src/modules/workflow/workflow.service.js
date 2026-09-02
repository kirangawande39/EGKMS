const mongoose = require("mongoose");

const Workflow = require("./workflow.model");
const Document = require("../document/document.model");
const Employee = require("../employee/employee.model");
const User = require("../auth/auth.model");
const Department = require("../department/department.model")
const Team = require("../team/team.model");

const { createAuditLog } = require("../audit/audit.service");

/**
 * Submit a document for workflow review.
 */
const submitDocument = async ({ documentId, user }) => {
  // 1. Validate Document ID
  if (!mongoose.Types.ObjectId.isValid(documentId)) {
    const error = new Error("Invalid document ID.");
    error.statusCode = 400;
    throw error;
  }

  // 2. Find Document
  const document = await Document.findById(documentId);

  if (!document) {
    const error = new Error("Document not found.");
    error.statusCode = 404;
    throw error;
  }

  //   console.log("UserId", user)

  // 3. Find logged-in Employee
  const employee =
    await Employee.findById(
      user.employeeId?._id ||
      user.employeeId
    );

  // console.log("Emp:", employee)

  if (!employee) {
    const error = new Error("Active employee not found.");
    error.statusCode = 404;
    throw error;
  }

  // 4. Only document owner can submit
  if (document.owner.toString() !== employee._id.toString()) {
    const error = new Error(
      "Only the document owner can submit this document."
    );
    error.statusCode = 403;
    throw error;
  }

  // 5. Document must be in DRAFT state
  if (document.status !== "DRAFT") {
    const error = new Error(
      "Only draft documents can be submitted."
    );
    error.statusCode = 400;
    throw error;
  }

  // 6. Determine next authority
  let nextLevel = null;

  switch (employee.hierarchyLevel) {
    case "INTERN":
    case "EMPLOYEE":
      nextLevel = "TEAM_LEAD";
      break;

    case "TEAM_LEAD":
      nextLevel = "MANAGER";
      break;

    case "MANAGER":
      nextLevel = "DEPARTMENT_HEAD";
      break;

    case "DEPARTMENT_HEAD":
      nextLevel = "EXECUTIVE";
      break;

    case "EXECUTIVE":
      nextLevel = "GOVERNANCE";
      break;

    case "GOVERNANCE":
      nextLevel = null;
      break;

    default: {
      const error = new Error(
        "Unable to determine next workflow authority."
      );
      error.statusCode = 400;
      throw error;
    }
  }

  // 7. Governance has no higher review level
  if (!nextLevel) {
    const error = new Error(
      "No next workflow authority available."
    );
    error.statusCode = 400;
    throw error;
  }

  // 8. Prevent duplicate active workflow
  const existingWorkflow = await Workflow.findOne({
    document: document._id,
    status: "PENDING_REVIEW",
  });

  if (existingWorkflow) {
    const error = new Error(
      "This document is already submitted for review."
    );
    error.statusCode = 400;
    throw error;
  }

  // 9. Find next authority in the hierarchy

let nextReviewer = null;

const reviewerQuery = {
  hierarchyLevel: nextLevel,
  status: "ACTIVE",
};

// Employee / Intern → Team Lead
if (nextLevel === "TEAM_LEAD") {
  const teamId =
    employee.team?._id || employee.team;

  if (!teamId) {
    const error = new Error(
      "Employee is not assigned to a team."
    );
    error.statusCode = 400;
    throw error;
  }

  reviewerQuery.team = teamId;

  nextReviewer = await Employee.findOne(reviewerQuery);
}

// Team Lead → Manager
else if (nextLevel === "MANAGER") {
  const reportingManagerId =
    employee.reportingManager?._id ||
    employee.reportingManager;

  if (!reportingManagerId) {
    const error = new Error(
      "Team Lead has no reporting manager assigned."
    );
    error.statusCode = 400;
    throw error;
  }

  nextReviewer = await Employee.findOne({
    _id: reportingManagerId,
    hierarchyLevel: "MANAGER",
    status: "ACTIVE",
  });
}

// Manager → Department Head
else if (nextLevel === "DEPARTMENT_HEAD") {
  const departmentId =
    employee.department?._id ||
    employee.department;

  if (!departmentId) {
    const error = new Error(
      "Manager is not assigned to a department."
    );
    error.statusCode = 400;
    throw error;
  }

  const department = await Department.findById(
    departmentId
  ).select("head");

  if (!department) {
    const error = new Error("Department not found.");
    error.statusCode = 404;
    throw error;
  }

  if (!department.head) {
    const error = new Error(
      "No Department Head is assigned to this department."
    );
    error.statusCode = 404;
    throw error;
  }

  nextReviewer = await Employee.findOne({
    _id: department.head,
    hierarchyLevel: "DEPARTMENT_HEAD",
    status: "ACTIVE",
  });
}

// Department Head → Executive
else if (nextLevel === "EXECUTIVE") {
  const departmentId =
    employee.department?._id ||
    employee.department;

  if (!departmentId) {
    const error = new Error(
      "Department Head is not assigned to a department."
    );
    error.statusCode = 400;
    throw error;
  }

  nextReviewer = await Employee.findOne({
    department: departmentId,
    hierarchyLevel: "EXECUTIVE",
    status: "ACTIVE",
  });
}

// Executive → Governance
else if (nextLevel === "GOVERNANCE") {
  nextReviewer = await Employee.findOne({
    hierarchyLevel: "GOVERNANCE",
    status: "ACTIVE",
  });
}

// Reviewer not found
if (!nextReviewer) {
  const error = new Error(
    `No active ${nextLevel} found for workflow review.`
  );
  error.statusCode = 404;
  throw error;
}

  // 10. Create workflow
  const workflow = await Workflow.create({
    document: document._id,
    currentReviewer: nextReviewer._id,
    currentLevel: nextLevel,
    status: "PENDING_REVIEW",
    lastAction: "SUBMITTED",
    lastActionBy: employee._id,
    submittedAt: new Date(),
    reviewedAt: null,
    reminderCount: 0,
    lastReminderAt: null,
    escalatedAt: null,
    escalationCount: 0,
  });

  // 11. Update document status
  document.status = "SUBMITTED";
  await document.save();

  await createAuditLog({
    module: "WORKFLOW",
    action: "WORKFLOW_SUBMITTED",
    actor: user._id,
    actorEmail: user.email,
    targetId: workflow._id,
    targetType: "Workflow",
    description: "Document submitted for workflow review.",
    metadata: {
      documentId: document._id,
      currentLevel: workflow.currentLevel,
      currentReviewer: workflow.currentReviewer,
    },
  });

  return workflow;
};

const getPendingWorkflows = async ({ userId }) => {
  // 1. Find logged-in User
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  // 2. Find linked active Employee
  const employeeId =
    user.employeeId?._id || user.employeeId;

  const employee = await Employee.findOne({
    _id: employeeId,
    status: "ACTIVE",
  });

  if (!employee) {
    const error = new Error("Active employee not found.");
    error.statusCode = 404;
    throw error;
  }

  // 3. Find workflows assigned to this Employee
  const workflows = await Workflow.find({
    currentReviewer: employee._id,
    status: "PENDING_REVIEW",
  })
    .populate({
      path: "document",
      populate: [
        {
          path: "owner",
          select: "employeeId firstName lastName email hierarchyLevel",
        },
        {
          path: "department",
          select: "name code status",
        },
        {
          path: "team",
          select: "name status teamLead",
        },
      ],
    })
    .populate({
      path: "currentReviewer",
      select: "employeeId firstName lastName email hierarchyLevel",
    })
    .sort({ submittedAt: 1 });

  return workflows;
};

const getMySubmissions = async (user) => {
  // 1. Logged-in user validation
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  // 2. Linked Employee find karo
  const employee =
    await Employee.findById(
      user.employeeId?._id ||
      user.employeeId
    ).select("_id");

  if (!employee) {
    const error = new Error("Employee not found.");
    error.statusCode = 404;
    throw error;
  }

  // 3. Employee ke owned documents find karo
  const documents = await Document.find({
    owner: employee._id,
  }).select("_id");

  const documentIds = documents.map((document) => document._id);

  // 4. In documents ke workflows find karo
  const workflows = await Workflow.find({
    document: { $in: documentIds },
  })
    .populate({
      path: "document",
      populate: [
        {
          path: "owner",
          select:
            "employeeId firstName lastName email hierarchyLevel",
        },
        {
          path: "department",
          select: "name code status",
        },
        {
          path: "team",
          select: "name teamLead status",
        },
      ],
    })
    .populate({
      path: "currentReviewer",
      select:
        "employeeId firstName lastName email hierarchyLevel",
    })
    .sort({ createdAt: -1 });

  if (!workflows.length) {
    const error = new Error("No document submissions found.");
    error.statusCode = 404;
    throw error;
  }

  return workflows;
};
const reviewWorkflow = async ({
  workflowId,
  reviewerId,
  action,
  reviewComment,
}) => {
  if (!mongoose.Types.ObjectId.isValid(workflowId)) {
    const error = new Error("Invalid workflow ID.");
    error.statusCode = 400;
    throw error;
  }

  const workflow = await Workflow.findById(workflowId);

  if (!workflow) {
    const error = new Error("Workflow not found.");
    error.statusCode = 404;
    throw error;
  }

  if (workflow.status !== "PENDING_REVIEW") {
    const error = new Error(
      "This workflow is not pending review."
    );
    error.statusCode = 400;
    throw error;
  }

  // Current reviewer must match logged-in Employee
  if (
    !workflow.currentReviewer ||
    workflow.currentReviewer.toString() !== reviewerId.toString()
  ) {
    const error = new Error(
      "You are not authorized to review this document."
    );
    error.statusCode = 403;
    throw error;
  }

  // Supported workflow actions
  if (!["APPROVE", "RETURN", "REJECT"].includes(action)) {
    const error = new Error(
      "Invalid review action. Use APPROVE, RETURN or REJECT."
    );
    error.statusCode = 400;
    throw error;
  }

  /*
   * RETURN and REJECT must have a reason.
   */
  if (
    (action === "RETURN" || action === "REJECT") &&
    (!reviewComment || !reviewComment.trim())
  ) {
    const error = new Error(
      `Review comment is required when action is ${action}.`
    );
    error.statusCode = 400;
    throw error;
  }

  const reviewer = await Employee.findOne({
    _id: reviewerId,
    status: "ACTIVE",
  });

  if (!reviewer) {
    const error = new Error("Active reviewer not found.");
    error.statusCode = 404;
    throw error;
  }

  // Reviewer hierarchy must match workflow level
  if (reviewer.hierarchyLevel !== workflow.currentLevel) {
    const error = new Error(
      "Reviewer hierarchy level does not match the workflow level."
    );
    error.statusCode = 403;
    throw error;
  }

  // =====================================================
  // RETURN
  // =====================================================

  if (action === "RETURN") {
    workflow.status = "REVISION";
    workflow.currentReviewer = null;
    workflow.lastAction = "RETURNED";
    workflow.lastActionBy = reviewer._id;
    workflow.reviewedAt = new Date();

    await workflow.save();

    await Document.findByIdAndUpdate(workflow.document, {
      status: "REVISION",
      reviewComment: reviewComment.trim(),
    });

    const reviewerUser = await User.findOne({
      employeeId: reviewer._id,
    });

    await createAuditLog({
      module: "WORKFLOW",
      action: "WORKFLOW_RETURNED",
      actor: reviewerUser?._id || null,
      actorEmail: reviewerUser?.email || null,
      targetId: workflow._id,
      targetType: "Workflow",
      description: "Document returned for revision.",
      metadata: {
        documentId: workflow.document,
        reviewComment: reviewComment.trim(),
        currentLevel: workflow.currentLevel,
      },
    });

    return workflow;
  }

  // =====================================================
  // REJECT
  // =====================================================

  if (action === "REJECT") {
    workflow.status = "REJECTED";
    workflow.currentReviewer = null;
    workflow.lastAction = "REJECTED";
    workflow.lastActionBy = reviewer._id;
    workflow.reviewedAt = new Date();

    await workflow.save();

    await Document.findByIdAndUpdate(workflow.document, {
      status: "REJECTED",
      reviewComment: reviewComment.trim(),
    });

    const reviewerUser = await User.findOne({
      employeeId: reviewer._id,
    });

    await createAuditLog({
      module: "WORKFLOW",
      action: "WORKFLOW_REJECTED",
      actor: reviewerUser?._id || null,
      actorEmail: reviewerUser?.email || null,
      targetId: workflow._id,
      targetType: "Workflow",
      description: "Document rejected during workflow review.",
      metadata: {
        documentId: workflow.document,
        reviewComment: reviewComment.trim(),
        currentLevel: workflow.currentLevel,
      },
    });

    return workflow;
  }

  // =====================================================
  // APPROVE
  // =====================================================

  if (action === "APPROVE") {

    // ---------------------------------------------------
    // TEAM LEAD → MANAGER
    // ---------------------------------------------------

    const reviewerUser = await User.findOne({
      employeeId: reviewer._id,
    });

    if (workflow.currentLevel === "TEAM_LEAD") {
      const manager = await Employee.findOne({
        _id: reviewer.reportingManager,
        hierarchyLevel: "MANAGER",
        status: "ACTIVE",
      });

      if (!manager) {
        const error = new Error(
          "Active Manager not found for this Team Lead."
        );
        error.statusCode = 404;
        throw error;
      }

      workflow.currentReviewer = manager._id;
      workflow.currentLevel = "MANAGER";
      workflow.status = "PENDING_REVIEW";
      workflow.lastAction = "APPROVED";
      workflow.lastActionBy = reviewer._id;
      workflow.reviewedAt = new Date();
      workflow.submittedAt = new Date();
      workflow.reminderCount = 0;
      workflow.lastReminderAt = null;
      workflow.escalatedAt = null;

      await workflow.save();

      // Clear previous revision/rejection comment
      await Document.findByIdAndUpdate(workflow.document, {
        reviewComment: null,
      });

      await createAuditLog({
        module: "WORKFLOW",
        action: "WORKFLOW_APPROVED",
        actor: reviewerUser?._id || null,
        actorEmail: reviewerUser?.email || null,
        targetId: workflow._id,
        targetType: "Workflow",
        description: "Document approved and forwarded to the next workflow level.",
        metadata: {
          documentId: workflow.document,
          approvedLevel: "TEAM_LEAD",
          nextLevel: workflow.currentLevel,
          nextReviewer: workflow.currentReviewer,
        },
      });

      return workflow;
    }

    // ---------------------------------------------------
    // MANAGER → DEPARTMENT HEAD
    // ---------------------------------------------------

    if (workflow.currentLevel === "MANAGER") {
      const department = await Department.findById(
        reviewer.department
      ).select("head");

      if (!department) {
        const error = new Error("Department not found.");
        error.statusCode = 404;
        throw error;
      }

      if (!department.head) {
        const error = new Error(
          "Department Head is not assigned."
        );
        error.statusCode = 404;
        throw error;
      }

      const departmentHead = await Employee.findOne({
        _id: department.head,
        hierarchyLevel: "DEPARTMENT_HEAD",
        status: "ACTIVE",
      });

      if (!departmentHead) {
        const error = new Error(
          "Active Department Head not found."
        );
        error.statusCode = 404;
        throw error;
      }

      workflow.currentReviewer = departmentHead._id;
      workflow.currentLevel = "DEPARTMENT_HEAD";
      workflow.status = "PENDING_REVIEW";
      workflow.lastAction = "APPROVED";
      workflow.lastActionBy = reviewer._id;
      workflow.reviewedAt = new Date();
      workflow.submittedAt = new Date();
      workflow.reminderCount = 0;
      workflow.lastReminderAt = null;
      workflow.escalatedAt = null;

      await workflow.save();

      // Clear previous revision/rejection comment
      await Document.findByIdAndUpdate(workflow.document, {
        reviewComment: null,
      });

      await createAuditLog({
        module: "WORKFLOW",
        action: "WORKFLOW_APPROVED",
        actor: reviewerUser?._id || null,
        actorEmail: reviewerUser?.email || null,
        targetId: workflow._id,
        targetType: "Workflow",
        description: "Document approved and forwarded to the next workflow level.",
        metadata: {
          documentId: workflow.document,
          approvedLevel: "MANAGER",
          nextLevel: workflow.currentLevel,
          nextReviewer: workflow.currentReviewer,
        },
      });

      return workflow;

    }

    // ---------------------------------------------------
    // DEPARTMENT HEAD → EXECUTIVE
    // ---------------------------------------------------

    if (workflow.currentLevel === "DEPARTMENT_HEAD") {
      const executive = await Employee.findOne({
        department: reviewer.department,
        hierarchyLevel: "EXECUTIVE",
        status: "ACTIVE",
      });

      if (!executive) {
        const error = new Error(
          "Active Executive not found for this department."
        );
        error.statusCode = 404;
        throw error;
      }

      workflow.currentReviewer = executive._id;
      workflow.currentLevel = "EXECUTIVE";
      workflow.status = "PENDING_REVIEW";
      workflow.lastAction = "APPROVED";
      workflow.lastActionBy = reviewer._id;
      workflow.reviewedAt = new Date();
      workflow.submittedAt = new Date();
      workflow.reminderCount = 0;
      workflow.lastReminderAt = null;
      workflow.escalatedAt = null;

      await workflow.save();

      // Clear previous revision/rejection comment
      await Document.findByIdAndUpdate(workflow.document, {
        reviewComment: null,
      });

      await createAuditLog({
        module: "WORKFLOW",
        action: "WORKFLOW_APPROVED",
        actor: reviewerUser?._id || null,
        actorEmail: reviewerUser?.email || null,
        targetId: workflow._id,
        targetType: "Workflow",
        description: "Document approved and forwarded to the next workflow level.",
        metadata: {
          documentId: workflow.document,
          approvedLevel: "DEPARTMENT_HEAD",
          nextLevel: workflow.currentLevel,
          nextReviewer: workflow.currentReviewer,
        },
      });


      return workflow;
    }

    // ---------------------------------------------------
    // EXECUTIVE → GOVERNANCE
    // ---------------------------------------------------

    if (workflow.currentLevel === "EXECUTIVE") {
      const governance = await Employee.findOne({
        hierarchyLevel: "GOVERNANCE",
        status: "ACTIVE",
      });

      if (!governance) {
        const error = new Error(
          "Active Governance reviewer not found."
        );
        error.statusCode = 404;
        throw error;
      }

      workflow.currentReviewer = governance._id;
      workflow.currentLevel = "GOVERNANCE";
      workflow.status = "PENDING_REVIEW";
      workflow.lastAction = "APPROVED";
      workflow.lastActionBy = reviewer._id;
      workflow.reviewedAt = new Date();
      workflow.submittedAt = new Date();
      workflow.reminderCount = 0;
      workflow.lastReminderAt = null;
      workflow.escalatedAt = null;

      await workflow.save();

      // Clear previous revision/rejection comment
      await Document.findByIdAndUpdate(workflow.document, {
        reviewComment: null,
      });

      await createAuditLog({
        module: "WORKFLOW",
        action: "WORKFLOW_APPROVED",
        actor: reviewerUser?._id || null,
        actorEmail: reviewerUser?.email || null,
        targetId: workflow._id,
        targetType: "Workflow",
        description: "Document approved and forwarded to the next workflow level.",
        metadata: {
          documentId: workflow.document,
          approvedLevel: "EXECUTIVE",
          nextLevel: workflow.currentLevel,
          nextReviewer: workflow.currentReviewer,
        },
      });

      return workflow;
    }

    // ---------------------------------------------------
    // GOVERNANCE → PUBLISHED
    // ---------------------------------------------------

    if (workflow.currentLevel === "GOVERNANCE") {
      workflow.currentReviewer = null;
      workflow.status = "COMPLETED";
      workflow.lastAction = "APPROVED";
      workflow.lastActionBy = reviewer._id;
      workflow.reviewedAt = new Date();
      workflow.submittedAt = new Date();
      workflow.reminderCount = 0;
      workflow.lastReminderAt = null;
      workflow.escalatedAt = null;

      await workflow.save();

      await Document.findByIdAndUpdate(workflow.document, {
        status: "PUBLISHED",
        reviewComment: null,
      });

      await createAuditLog({
        module: "WORKFLOW",
        action: "WORKFLOW_APPROVED",
        actor: reviewerUser?._id || null,
        actorEmail: reviewerUser?.email || null,
        targetId: workflow._id,
        targetType: "Workflow",
        description: "Document approved and published successfully.",
        metadata: {
          documentId: workflow.document,
          approvedLevel: "GOVERNANCE",
          finalApproval: true,
          status: "PUBLISHED",
        },
      });

      return workflow;
    }

    // ---------------------------------------------------
    // SUPER ADMIN → PUBLISHED
    // ---------------------------------------------------

    if (workflow.currentLevel === "SUPER_ADMIN") {
      workflow.currentReviewer = null;
      workflow.status = "COMPLETED";
      workflow.lastAction = "APPROVED";
      workflow.lastActionBy = reviewer._id;
      workflow.reviewedAt = new Date();

      await workflow.save();

      await Document.findByIdAndUpdate(workflow.document, {
        status: "PUBLISHED",
        reviewComment: null,
      });

      return workflow;
    }

    const error = new Error(
      `Approval transition from ${workflow.currentLevel} is not implemented yet.`
    );
    error.statusCode = 400;
    throw error;
  }
};




const resubmitDocument = async ({
  documentId,
  employeeId,
}) => {
  // ---------------------------------------------------
  // 1. Validate Document ID
  // ---------------------------------------------------

  if (!mongoose.Types.ObjectId.isValid(documentId)) {
    const error = new Error("Invalid document ID.");
    error.statusCode = 400;
    throw error;
  }

  // ---------------------------------------------------
  // 2. Find Document
  // ---------------------------------------------------

  const document = await Document.findById(documentId);

  if (!document) {
    const error = new Error("Document not found.");
    error.statusCode = 404;
    throw error;
  }

  // ---------------------------------------------------
  // 3. Only Document Owner Can Resubmit
  // ---------------------------------------------------

  if (
    !document.owner ||
    document.owner.toString() !== employeeId.toString()
  ) {
    const error = new Error(
      "Only the document owner can resubmit this document."
    );
    error.statusCode = 403;
    throw error;
  }

  // ---------------------------------------------------
  // 4. Document Must Be in REVISION
  // ---------------------------------------------------

  if (document.status !== "REVISION") {
    const error = new Error(
      "Only documents in REVISION status can be resubmitted."
    );
    error.statusCode = 400;
    throw error;
  }

  // ---------------------------------------------------
  // 5. Find Workflow
  // ---------------------------------------------------

  const workflow = await Workflow.findOne({
    document: document._id,
  });

  if (!workflow) {
    const error = new Error(
      "Workflow not found for this document."
    );
    error.statusCode = 404;
    throw error;
  }

  if (workflow.status !== "REVISION") {
    const error = new Error(
      "This workflow is not currently in revision."
    );
    error.statusCode = 400;
    throw error;
  }

  // ---------------------------------------------------
  // 6. Find Resubmitting Employee
  // ---------------------------------------------------

  const employee = await Employee.findById(employeeId).select(
    "hierarchyLevel department team status"
  );

  if (!employee) {
    const error = new Error("Employee not found.");
    error.statusCode = 404;
    throw error;
  }

  if (employee.status !== "ACTIVE") {
    const error = new Error(
      "Only active employees can resubmit documents."
    );
    error.statusCode = 403;
    throw error;
  }

  // ---------------------------------------------------
  // 7. Higher Authority Levels
  // ---------------------------------------------------

  const higherAuthorityLevels = [
    "MANAGER",
    "DEPARTMENT_HEAD",
    "EXECUTIVE",
    "GOVERNANCE",
    "SUPER_ADMIN",
  ];


  const isHigherAuthority =
    higherAuthorityLevels.includes(employee.hierarchyLevel);

  // ---------------------------------------------------
  // 8. Higher Authority Resubmission
  // ---------------------------------------------------

  if (isHigherAuthority) {
    let nextReviewer = null;
    let nextLevel = null;

    if (employee.hierarchyLevel === "MANAGER") {
      nextReviewer = await Employee.findOne({
        hierarchyLevel: "DEPARTMENT_HEAD",
        status: "ACTIVE",
      }).select("_id hierarchyLevel");

      if (!nextReviewer) {
        const error = new Error(
          "Active Department Head reviewer not found."
        );
        error.statusCode = 404;
        throw error;
      }

      nextLevel = "DEPARTMENT_HEAD";
    }

    // ---------------------------------------------------
    // Department Head -> Executive
    // ---------------------------------------------------

    if (employee.hierarchyLevel === "DEPARTMENT_HEAD") {
      nextReviewer = await Employee.findOne({
        hierarchyLevel: "EXECUTIVE",
        status: "ACTIVE",
      }).select("_id hierarchyLevel");

      if (!nextReviewer) {
        const error = new Error(
          "Active Executive reviewer not found."
        );
        error.statusCode = 404;
        throw error;
      }

      nextLevel = "EXECUTIVE";
    }

    // ---------------------------------------------------
    // Executive -> Governance
    // ---------------------------------------------------

    else if (employee.hierarchyLevel === "EXECUTIVE") {
      nextReviewer = await Employee.findOne({
        hierarchyLevel: "GOVERNANCE",
        status: "ACTIVE",
      }).select("_id hierarchyLevel");

      if (!nextReviewer) {
        const error = new Error(
          "Active Governance reviewer not found."
        );
        error.statusCode = 404;
        throw error;
      }

      nextLevel = "GOVERNANCE";
    }

    // ---------------------------------------------------
    // Governance -> Final Authority
    // ---------------------------------------------------

    else if (employee.hierarchyLevel === "GOVERNANCE") {
      nextReviewer = null;
      nextLevel = "GOVERNANCE";
    }

    // ---------------------------------------------------
    // Super Admin -> Final Authority
    // ---------------------------------------------------

    else if (employee.hierarchyLevel === "SUPER_ADMIN") {
      nextReviewer = null;
      nextLevel = "SUPER_ADMIN";
    }

    // ---------------------------------------------------
    // Resubmit Document
    // ---------------------------------------------------

    document.status = "SUBMITTED";

    await document.save();

    workflow.currentReviewer = nextReviewer?._id || null;
    workflow.currentLevel = nextLevel;
    workflow.status = "PENDING_REVIEW";
    workflow.lastAction = "SUBMITTED";
    workflow.lastActionBy = employeeId;
    workflow.submittedAt = new Date();
    workflow.reviewedAt = null;
    workflow.reminderCount = 0;
    workflow.lastReminderAt = null;
    workflow.escalatedAt = null;

    await workflow.save();

    // ---------------------------------------------------
    // Audit Log
    // ---------------------------------------------------

    const user = await User.findOne({
      employeeId,
    });

    await createAuditLog({
      module: "WORKFLOW",
      action: "WORKFLOW_RESUBMITTED",
      actor: user?._id || null,
      actorEmail: user?.email || null,
      targetId: workflow._id,
      targetType: "Workflow",
      description:
        "Document resubmitted for workflow review by higher authority.",
      metadata: {
        documentId: document._id,
        currentLevel: workflow.currentLevel,
        currentReviewer: workflow.currentReviewer,
        resubmittedBy: employee.hierarchyLevel,
      },
    });

    return workflow;
  }
  // ---------------------------------------------------
  // 9. Team-Based Resubmission
  // ---------------------------------------------------

  if (!document.team) {
    const error = new Error(
      "Document team is not assigned."
    );
    error.statusCode = 400;
    throw error;
  }

  // ---------------------------------------------------
  // 10. Find Active Team
  // ---------------------------------------------------

  const team = await Team.findOne({
    _id: document.team,
    status: "ACTIVE",
  }).select("teamLead department");

  if (!team) {
    const error = new Error(
      "Active team not found for this document."
    );
    error.statusCode = 404;
    throw error;
  }

  // ---------------------------------------------------
  // 11. Team Lead Required
  // ---------------------------------------------------

  if (!team.teamLead) {
    const error = new Error(
      "Team Lead is not assigned to this team."
    );
    error.statusCode = 404;
    throw error;
  }

  // ---------------------------------------------------
  // 12. Find Active Team Lead
  // ---------------------------------------------------

  const teamLead = await Employee.findOne({
    _id: team.teamLead,
    hierarchyLevel: "TEAM_LEAD",
    status: "ACTIVE",
  });

  if (!teamLead) {
    const error = new Error(
      "Active Team Lead not found for this team."
    );
    error.statusCode = 404;
    throw error;
  }

  // ---------------------------------------------------
  // 13. Resubmit Document
  // ---------------------------------------------------

  document.status = "SUBMITTED";

  await document.save();

  // ---------------------------------------------------
  // 14. Reset Workflow to Team Lead
  // ---------------------------------------------------

  workflow.currentReviewer = teamLead._id;
  workflow.currentLevel = "TEAM_LEAD";
  workflow.status = "PENDING_REVIEW";
  workflow.lastAction = "SUBMITTED";
  workflow.lastActionBy = employeeId;
  workflow.submittedAt = new Date();
  workflow.reviewedAt = null;
  workflow.reminderCount = 0;
  workflow.lastReminderAt = null;
  workflow.escalatedAt = null;

  await workflow.save();

  // ---------------------------------------------------
  // 15. Audit Log
  // ---------------------------------------------------

  const user = await User.findOne({
    employeeId,
  });

  await createAuditLog({
    module: "WORKFLOW",
    action: "WORKFLOW_RESUBMITTED",
    actor: user?._id || null,
    actorEmail: user?.email || null,
    targetId: workflow._id,
    targetType: "Workflow",
    description:
      "Document resubmitted for workflow review.",
    metadata: {
      documentId: document._id,
      currentLevel: workflow.currentLevel,
      currentReviewer: workflow.currentReviewer,
      resubmittedBy: employee.hierarchyLevel,
    },
  });

  return workflow;
};



/**
 * Move a pending workflow to its next authority.
 * This follows the same hierarchy routing used by normal approval.
 */
const getNextReviewerForEscalation = async (workflow) => {
  const reviewer = await Employee.findOne({
    _id: workflow.currentReviewer,
    status: "ACTIVE",
  });

  if (!reviewer) {
    return null;
  }

  if (workflow.currentLevel === "TEAM_LEAD") {
    if (!reviewer.reportingManager) return null;

    return Employee.findOne({
      _id: reviewer.reportingManager,
      hierarchyLevel: "MANAGER",
      status: "ACTIVE",
    });
  }

  if (workflow.currentLevel === "MANAGER") {
    if (!reviewer.department) return null;

    const department = await Department.findById(reviewer.department)
      .select("head");

    if (!department?.head) return null;

    return Employee.findOne({
      _id: department.head,
      hierarchyLevel: "DEPARTMENT_HEAD",
      status: "ACTIVE",
    });
  }

  if (workflow.currentLevel === "DEPARTMENT_HEAD") {
    if (!reviewer.department) return null;

    return Employee.findOne({
      department: reviewer.department,
      hierarchyLevel: "EXECUTIVE",
      status: "ACTIVE",
    });
  }

  // FRS special rule:
  // unresolved Executive review after two reminders may go directly
  // to the Super Admin.
  if (workflow.currentLevel === "EXECUTIVE") {
    let superAdmin = await Employee.findOne({
      hierarchyLevel: "SUPER_ADMIN",
      status: "ACTIVE",
    });

    // Fallback for projects where Super Admin is represented on User
    // rather than Employee.hierarchyLevel.
    if (!superAdmin) {
      const superAdminUser = await User.findOne({
        role: "SUPER_ADMIN",
      }).select("employeeId");

      if (superAdminUser?.employeeId) {
        superAdmin = await Employee.findOne({
          _id: superAdminUser.employeeId,
          status: "ACTIVE",
        });
      }
    }

    return superAdmin;
  }

  // Governance is the top normal review level.
  return null;
};

/**
 * Process unattended workflows.
 *
 * Default:
 *   24 hours -> first reminder
 *   next 24 hours -> second reminder + escalation
 *
 * Configure with:
 *   WORKFLOW_REVIEW_INTERVAL_HOURS
 *
 * The FRS specifies the reminder/escalation sequence but does not
 * prescribe a fixed number of hours, so the timeout is configurable.
 */
const processWorkflowEscalations = async () => {
  const reviewIntervalHours = Number(
    process.env.WORKFLOW_REVIEW_INTERVAL_HOURS || 24
  );

  const reviewIntervalMs = reviewIntervalHours * 60 * 60 * 1000;
  const now = new Date();

  const workflows = await Workflow.find({
    status: "PENDING_REVIEW",
    currentReviewer: { $ne: null },
    submittedAt: { $ne: null },
  });

  for (const workflow of workflows) {
    const elapsedMs = now.getTime() - workflow.submittedAt.getTime();

    if (elapsedMs < reviewIntervalMs) {
      continue;
    }

    // First unattended interval -> reminder.
    if (workflow.reminderCount < 1) {
      workflow.reminderCount = 1;
      workflow.lastReminderAt = now;
      workflow.lastAction = "REMINDER";
      workflow.reviewedAt = null;

      // Start the second review window.
      workflow.submittedAt = now;

      await workflow.save();
      continue;
    }

    // Second unattended interval -> second reminder, then escalation.
    if (workflow.reminderCount === 1) {
      workflow.reminderCount = 2;
      workflow.lastReminderAt = now;

      const nextReviewer = await getNextReviewerForEscalation(workflow);

      if (!nextReviewer) {
        // No higher authority exists (for example Governance).
        // Keep the workflow pending instead of inventing a route.
        workflow.lastAction = "REMINDER";
        workflow.submittedAt = now;
        await workflow.save();
        continue;
      }

      const previousLevel = workflow.currentLevel;
      workflow.currentReviewer = nextReviewer._id;
      workflow.currentLevel =
        nextReviewer.hierarchyLevel;
      workflow.status = "PENDING_REVIEW";
      workflow.lastAction = "ESCALATED";
      workflow.lastActionBy = null;
      workflow.submittedAt = now;
      workflow.reviewedAt = null;
      workflow.escalatedAt = now;
      workflow.escalationCount += 1;
      workflow.reminderCount = 0;



      await workflow.save();

      await createAuditLog({
        module: "WORKFLOW",
        action: "WORKFLOW_ESCALATED",
        actor: null,
        actorEmail: null,
        targetId: workflow._id,
        targetType: "Workflow",
        description: "Workflow automatically escalated to the next authority.",
        metadata: {
          documentId: workflow.document,
          previousLevel,
          newLevel: workflow.currentLevel,
          newReviewer: workflow.currentReviewer,
          escalationCount: workflow.escalationCount,
        },
      });
    }
  }
};

module.exports = {
  submitDocument,
  getPendingWorkflows,
  getMySubmissions,
  reviewWorkflow,
  resubmitDocument,
  processWorkflowEscalations,
};








