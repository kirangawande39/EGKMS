const reviewWorkflowValidator = (req, res, next) => {
  const { action } = req.body;

  const errors = {};

  if (!action) {
    errors.action = "Review action is required.";
  } else if (!["APPROVE", "RETURN", "REJECT"].includes(action)) {
    errors.action = "Action must be APPROVE, RETURN or REJECT.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors,
    });
  }

  next();
};

module.exports = {
  reviewWorkflowValidator,
};