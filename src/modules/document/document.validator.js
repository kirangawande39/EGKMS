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

module.exports = {
  createDocumentValidator,
};