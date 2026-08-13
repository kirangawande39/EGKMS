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

module.exports = {
  submitDocument,
  getPendingWorkflows,
  getMySubmissions
};