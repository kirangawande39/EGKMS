const Joi = require("joi");

const createTeamValidator = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.empty": "Team name is required",
      "string.min": "Team name must be at least 2 characters",
      "string.max": "Team name cannot exceed 100 characters",
      "any.required": "Team name is required",
    }),

  department: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      "string.hex": "Invalid Department ID",
      "string.length": "Invalid Department ID",
      "any.required": "Department reference is required",
    }),

  teamLead: Joi.string()
    .hex()
    .length(24)
    .allow(null)
    .optional()
    .messages({
      "string.hex": "Invalid Team Lead ID",
      "string.length": "Invalid Team Lead ID",
    }),
});

const updateTeamValidator = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100),

  department: Joi.string()
    .hex()
    .length(24)
    .messages({
      "string.hex": "Invalid Department ID",
      "string.length": "Invalid Department ID",
    }),

  teamLead: Joi.string()
    .hex()
    .length(24)
    .allow(null)
    .messages({
      "string.hex": "Invalid Team Lead ID",
      "string.length": "Invalid Team Lead ID",
    }),

  status: Joi.string()
    .valid("ACTIVE", "INACTIVE")
    .messages({
      "any.only": "Invalid team status",
    }),
}).min(1);

const updateTeamStatusValidator = Joi.object({
  status: Joi.string()
    .valid("ACTIVE", "INACTIVE")
    .required()
    .messages({
      "any.only": "Invalid team status",
      "any.required": "Team status is required",
    }),
});

module.exports = {
  createTeamValidator,
  updateTeamValidator,
  updateTeamStatusValidator,
};