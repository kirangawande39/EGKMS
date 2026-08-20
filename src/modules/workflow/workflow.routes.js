const express = require("express");

const router = express.Router();

const workflowController = require("./workflow.controller");
const { reviewWorkflowValidator } = require("./workflow.validator")


const { authenticate } = require("../../middleware/auth.middleware");
const {
  startWorkflowEscalationScheduler,
} = require("./workflow.scheduler");
const accessControl = require("../permission/accessControl/accessControl.middleware");
const {
  workflowReadLimiter,
  workflowSubmitLimiter,
  workflowReviewLimiter,
  workflowResubmitLimiter,
} = require("./workflow.rateLimiter");

// Starts the FRS reminder/escalation monitor once when this router is loaded.
startWorkflowEscalationScheduler();

router.get(
  "/my-submissions",
  authenticate,
  workflowReadLimiter,
  accessControl("DOCUMENT", "VIEW"),
  workflowController.getMySubmissions
);

router.get(
  "/pending",
  authenticate,
  workflowReadLimiter,
   accessControl("DOCUMENT", "REVIEW"),
  workflowController.getPendingWorkflows
);

// Submit Document for Workflow Review
router.post(
  "/:documentId/submit",
  authenticate,
  workflowSubmitLimiter,
  accessControl("DOCUMENT", "CREATE"),
  workflowController.submitDocument
);

router.post(
  "/:workflowId/review",
  authenticate,
  workflowReviewLimiter,
  reviewWorkflowValidator,
  workflowController.reviewWorkflow
);

router.post(
  "/:documentId/resubmit",
  authenticate,
  workflowResubmitLimiter,
  workflowController.resubmitDocument
);


module.exports = router;