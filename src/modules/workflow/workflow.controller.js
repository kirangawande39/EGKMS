const workflowService = require("./workflow.service");

const submitDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const workflow = await workflowService.submitDocument({
      documentId,
      user: req.user,
    });

    return res.status(200).json({
      success: true,
      message: "Document submitted for review successfully.",
      data: workflow,
    });
  } catch (error) {
    next(error);
  }
};

const getPendingWorkflows = async (req, res, next) => {
  try {
    const workflows = await workflowService.getPendingWorkflows({
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Pending workflows fetched successfully.",
      data: workflows,
    });
  } catch (error) {
    next(error);
  }
};
const getMySubmissions = async (req, res, next) => {
  try {
    const workflows = await workflowService.getMySubmissions(
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "My document workflows fetched successfully.",
      data: workflows,
    });
  } catch (error) {
    next(error);
  }
};
const reviewWorkflow = async (req, res, next) => {
  try {
    const { workflowId } = req.params;
    const { action } = req.body;

    const workflow = await workflowService.reviewWorkflow({
      workflowId,
      reviewerId: req.user.employeeId,
      action,
    });

    let message = "Document returned for revision successfully.";

    if (action === "APPROVE") {
      if (workflow.status === "COMPLETED") {
        message = "Document approved and published successfully.";
      } else {
        const forwardedToMessages = {
          MANAGER:
            "Document approved and forwarded to Manager successfully.",

          DEPARTMENT_HEAD:
            "Document approved and forwarded to Department Head successfully.",

          EXECUTIVE:
            "Document approved and forwarded to Executive successfully.",

          GOVERNANCE:
            "Document approved and forwarded to Governance successfully.",
        };

        message =
          forwardedToMessages[workflow.currentLevel] ||
          "Document approved successfully.";
      }
    }

    if (action === "REJECT") {
      message = "Document rejected successfully.";
    }

    return res.status(200).json({
      success: true,
      message,
      data: workflow,
    });
  } catch (error) {
    next(error);
  }
};

const resubmitDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const workflow = await workflowService.resubmitDocument({
      documentId,
      employeeId: req.user.employeeId,
    });

    return res.status(200).json({
      success: true,
      message: "Document resubmitted for review successfully.",
      data: workflow,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitDocument,
  getPendingWorkflows,
  getMySubmissions,
  reviewWorkflow,
  resubmitDocument
};