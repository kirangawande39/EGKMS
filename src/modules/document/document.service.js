const mongoose = require("mongoose");

const Workflow = require("../workflow/workflow.model");
const Document = require("../document/document.model");
const Employee = require("../employee/employee.model");
const User = require("../auth/auth.model");
const Team = require("../team/team.model");

const submitDocument = async ({ documentId, userId }) => {
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

  // 3. Find logged-in User
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  // 4. Find linked Employee
  const employee = await Employee.findOne({
    _id: user.employeeId,
    status: "ACTIVE",
  });

  if (!employee) {
    const error = new Error("Active employee not found.");
    error.statusCode = 404;
    throw error;
  }

  // 5. Only document owner can submit
  if (
    !document.owner ||
    document.owner.toString() !== employee._id.toString()
  ) {
    const error = new Error(
      "Only the document owner can submit this document."
    );
    error.statusCode = 403;
    throw error;
  }

  // 6. Document must be in DRAFT state
  if (document.status !== "DRAFT") {
    const error = new Error("Only draft documents can be submitted.");
    error.statusCode = 400;
    throw error;
  }

  // 7. Find the Team of the Employee
  if (!employee.team) {
    const error = new Error(
      "Employee is not assigned to a team. Document cannot be submitted."
    );
    error.statusCode = 400;
    throw error;
  }

  const team = await Team.findOne({
    _id: employee.team,
    status: "ACTIVE",
  });

  if (!team) {
    const error = new Error(
      "Employee team not found or inactive."
    );
    error.statusCode = 404;
    throw error;
  }

  // 8. Make sure Employee and Team belong to the same Department
  if (
    employee.department &&
    team.department &&
    employee.department.toString() !== team.department.toString()
  ) {
    const error = new Error(
      "Employee team does not belong to the employee's department."
    );
    error.statusCode = 400;
    throw error;
  }

  // 9. Find Team Lead assigned to THIS Team
  if (!team.teamLead) {
    const error = new Error(
      "No Team Lead is assigned to this team."
    );
    error.statusCode = 400;
    throw error;
  }

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

  // 10. Make sure Team Lead belongs to the same Team
  if (
    !teamLead.team ||
    teamLead.team.toString() !== team._id.toString()
  ) {
    const error = new Error(
      "Assigned Team Lead does not belong to this team."
    );
    error.statusCode = 400;
    throw error;
  }

  // 11. Prevent duplicate active workflow
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

  // 12. Create workflow
  const workflow = await Workflow.create({
    document: document._id,
    currentReviewer: teamLead._id,
    currentLevel: "TEAM_LEAD",
    status: "PENDING_REVIEW",
    lastAction: "SUBMITTED",
    lastActionBy: employee._id,
    submittedAt: new Date(),
  });

  // 13. Update Document status
  document.status = "SUBMITTED";

  await document.save();

  return workflow;
};

module.exports = {
  submitDocument,
};