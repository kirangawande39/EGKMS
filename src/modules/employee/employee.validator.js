const Joi = require("joi");



// CREATE EMPLOYEE VALIDATOR


const createEmployeeValidator = Joi.object({
  employeeId: Joi.string()
    .trim()
    .uppercase()
    .required()
    .messages({
      "string.empty": "Employee ID is required.",
      "any.required": "Employee ID is required.",
    }),

  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.empty": "First name is required.",
      "string.min":
        "First name must contain at least 2 characters.",
      "string.max":
        "First name cannot exceed 50 characters.",
      "any.required": "First name is required.",
    }),

  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.empty": "Last name is required.",
      "string.min":
        "Last name must contain at least 2 characters.",
      "string.max":
        "Last name cannot exceed 50 characters.",
      "any.required": "Last name is required.",
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required()
    .messages({
      "string.empty": "Employee email is required.",
      "string.email":
        "Please enter a valid employee email.",
      "any.required":
        "Employee email is required.",
    }),

  hierarchyLevel: Joi.string()
    .valid(
      "SUPER_ADMIN",
      "GOVERNANCE",
      "EXECUTIVE",
      "DEPARTMENT_HEAD",
      "MANAGER",
      "TEAM_LEAD",
      "EMPLOYEE",
      "INTERN"
    )
    .required()
    .messages({
      "any.only": "Invalid hierarchy level.",
      "any.required":
        "Hierarchy level is required.",
    }),

  department: Joi.string()
    .trim()
    .allow("", null)
    .default(null)
    .messages({
      "string.base":
        "Department must be a string.",
    }),

  team: Joi.string()
    .trim()
    .allow("", null)
    .default(null)
    .messages({
      "string.base":
        "Team must be a string.",
    }),

  reportingManager: Joi.string()
    .trim()
    .allow("", null)
    .default(null)
    .messages({
      "string.base":
        "Reporting manager must be a valid ID.",
    }),
});


module.exports = {
  createEmployeeValidator,
};
