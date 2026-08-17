const Joi = require("joi");

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

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
    .pattern(objectIdPattern)
    .allow("", null)
    .messages({
      "string.pattern.base": "Invalid department ID",
    }),

  team: Joi.string()
    .pattern(objectIdPattern)
    .allow("", null)
    .messages({
      "string.pattern.base": "Invalid team ID",
    }),
});

const updateDocumentValidator = Joi.object({
  title: Joi.string().trim().min(1),
  description: Joi.string().trim().allow("", null),
  documentType: Joi.string().trim().uppercase().min(1),

  department: Joi.string()
    .pattern(objectIdPattern)
    .allow("", null)
    .messages({
      "string.pattern.base": "Invalid department ID",
    }),

  team: Joi.string()
    .pattern(objectIdPattern)
    .allow("", null)
    .messages({
      "string.pattern.base": "Invalid team ID",
    }),
});

const updateStatusValidator = Joi.object({
  status: Joi.string()
    .valid("ACTIVE", "AMENDMENT")
    .required()
    .messages({
      "any.only": "Only ACTIVE or AMENDMENT can be changed through the document lifecycle API.",
      "any.required": "Document status is required.",
    }),
});

module.exports = {
  createDocumentValidator,
  updateDocumentValidator,
  updateStatusValidator,
};
