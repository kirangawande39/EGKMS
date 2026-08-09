const Joi = require("joi");


// CREATE DEPARTMENT
const createDepartmentValidator = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.empty": "Department name is required",
      "string.min": "Department name must be at least 2 characters",
      "string.max": "Department name cannot exceed 100 characters",
      "any.required": "Department name is required",
    }),

  code: Joi.string()
    .trim()
    .uppercase()
    .min(2)
    .max(20)
    .required()
    .messages({
      "string.empty": "Department code is required",
      "string.min": "Department code must be at least 2 characters",
      "string.max": "Department code cannot exceed 20 characters",
      "any.required": "Department code is required",
    }),

  head: Joi.string()
    .hex()
    .length(24)
    .allow(null)
    .optional()
    .messages({
      "string.hex": "Invalid Department Head ID",
      "string.length": "Invalid Department Head ID",
    }),
});


// UPDATE DEPARTMENT
const updateDepartmentValidator = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .messages({
      "string.min": "Department name must be at least 2 characters",
      "string.max": "Department name cannot exceed 100 characters",
    }),

  code: Joi.string()
    .trim()
    .uppercase()
    .min(2)
    .max(20)
    .messages({
      "string.min": "Department code must be at least 2 characters",
      "string.max": "Department code cannot exceed 20 characters",
    }),

  head: Joi.string()
    .hex()
    .length(24)
    .allow(null)
    .messages({
      "string.hex": "Invalid Department Head ID",
      "string.length": "Invalid Department Head ID",
    }),

  status: Joi.string()
    .valid("ACTIVE", "INACTIVE")
    .messages({
      "any.only": "Invalid department status",
    }),
}).min(1);


module.exports = {
  createDepartmentValidator,
  updateDepartmentValidator,
};