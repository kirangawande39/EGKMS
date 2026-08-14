const Joi = require("joi");

const createDocumentValidator = Joi.object({
  title: Joi.string().trim().required().messages({
    "string.empty": "Document title is required",
    "any.required": "Document title is required",
  }),

  description: Joi.string().trim().allow("", null),

  documentType: Joi.string().trim().uppercase().required().messages({
    "string.empty": "Document type is required",
    "any.required": "Document type is required",
  }),

  department: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .allow("", null)
    .messages({
      "string.pattern.base": "Invalid department ID",
    }),

  team: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .allow("", null)
    .messages({
      "string.pattern.base": "Invalid team ID",
    }),
});
const updateDocumentValidator = (req, res, next) => {
  const errors = {};

  const {
    title,
    description,
    documentType,
    department,
    team,
  } = req.body;

  if (
    title === undefined &&
    description === undefined &&
    documentType === undefined &&
    department === undefined &&
    team === undefined &&
    !req.file
  ) {
    errors.document = "At least one field or updated file is required.";
  }

  if (
    title !== undefined &&
    (typeof title !== "string" || !title.trim())
  ) {
    errors.title = "Title must be a non-empty string.";
  }

  if (
    description !== undefined &&
    typeof description !== "string"
  ) {
    errors.description = "Description must be a string.";
  }

  if (
    documentType !== undefined &&
    (typeof documentType !== "string" || !documentType.trim())
  ) {
    errors.documentType = "Document type must be a valid string.";
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
  createDocumentValidator,
  updateDocumentValidator
};