const express = require("express");

const router = express.Router();

const workflowController = require("./workflow.controller");

const { authenticate } = require("../../middleware/auth.middleware");

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


module.exports = router;