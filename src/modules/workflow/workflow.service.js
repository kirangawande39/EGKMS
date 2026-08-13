const mongoose = require("mongoose");

const Workflow = require("./workflow.model");
const Document = require("../document/document.model");
const Employee = require("../employee/employee.model");
const User = require("../auth/auth.model");

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
  const employee = await Employee.findById({ _id: user.employeeId });

  console.log("Emp:", employee)

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
  const nextReviewer = await Employee.findOne({
    hierarchyLevel: nextLevel,
    status: "ACTIVE",
  });

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
  });

  // 11. Update document status
  document.status = "SUBMITTED";
  await document.save();

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
  const employee = await Employee.findOne({
    _id: user.employeeId,
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
  // 1. Logged-in User find karo

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  // 2. User se linked Employee find karo
  const employee = await Employee.findById(user.employeeId);

  if (!employee) {
    const error = new Error("Employee not found.");
    error.statusCode = 404;
    throw error;
  }

  // 3. Employee ke submitted workflows find karo
  const workflows = await Workflow.find({
    lastActionBy: employee._id,
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

module.exports = {
  submitDocument,
  getPendingWorkflows,
  getMySubmissions
};

