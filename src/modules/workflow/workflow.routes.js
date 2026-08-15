const express = require("express");

const router = express.Router();

const workflowController = require("./workflow.controller");
const { reviewWorkflowValidator } = require("./workflow.validator")


const { authenticate } = require("../../middleware/auth.middleware");
const {
  startWorkflowEscalationScheduler,
} = require("./workflow.scheduler");

// Starts the FRS reminder/escalation monitor once when this router is loaded.
startWorkflowEscalationScheduler();

router.get(
  "/my-submissions",
  authenticate,
  workflowController.getMySubmissions
);

router.get(
  "/pending",
  authenticate,
  workflowController.getPendingWorkflows
);

// Submit Document for Workflow Review
router.post(
  "/:documentId/submit",
  authenticate,
  workflowController.submitDocument
);

router.post(
  "/:workflowId/review",
  authenticate,
  reviewWorkflowValidator,
  workflowController.reviewWorkflow
);

router.post(
  "/:documentId/resubmit",
  authenticate,
  workflowController.resubmitDocument
);


module.exports = router;