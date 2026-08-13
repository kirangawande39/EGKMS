const mongoose = require("mongoose");

const workflowSchema = new mongoose.Schema(
  {
    // Document being processed
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: [true, "Document is required"],
      unique: true,
    },

    // Employee who currently has to review the document
    currentReviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    // Current hierarchy level in the workflow
    currentLevel: {
      type: String,
      enum: [
        "INTERN",
        "EMPLOYEE",
        "TEAM_LEAD",
        "MANAGER",
        "DEPARTMENT_HEAD",
        "EXECUTIVE",
        "GOVERNANCE",
      ],
      default: null,
    },

    // Current workflow state
    status: {
      type: String,
      enum: [
        "PENDING_REVIEW",
        "APPROVED",
        "REVISION",
        "REJECTED",
        "COMPLETED",
      ],
      default: "PENDING_REVIEW",
    },

    // Last action performed in the workflow
    lastAction: {
      type: String,
      enum: [
        "SUBMITTED",
        "REVIEWED",
        "APPROVED",
        "RETURNED",
        "REJECTED",
      ],
      default: "SUBMITTED",
    },

    // Employee who performed the last workflow action
    lastActionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    // When the current workflow step started
    submittedAt: {
      type: Date,
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Workflow", workflowSchema);