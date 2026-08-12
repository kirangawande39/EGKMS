const Joi = require("joi");

const hierarchyLevels = [
  "SUPER_ADMIN",
  "GOVERNANCE",
  "EXECUTIVE",
  "DEPARTMENT_HEAD",
  "MANAGER",
  "TEAM_LEAD",
  "EMPLOYEE",
  "INTERN",
];

const statuses = ["ACTIVE", "INACTIVE"];

const createRolePermissionSchema = Joi.object({
  hierarchyLevel: Joi.string()
    .valid(...hierarchyLevels)
    .required()
    .messages({
      "any.only": "Invalid hierarchy level",
      "any.required": "Hierarchy level is required",
    }),

  permission: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      "string.hex": "Invalid permission ID",
      "string.length": "Invalid permission ID",
      "any.required": "Permission ID is required",
    }),

  status: Joi.string()
    .valid(...statuses)
    .default("ACTIVE")
    .messages({
      "any.only": "Invalid permission assignment status",
    }),
});

const updateRolePermissionSchema = Joi.object({
  hierarchyLevel: Joi.string().valid(...hierarchyLevels),

  permission: Joi.string()
    .hex()
    .length(24)
    .messages({
      "string.hex": "Invalid permission ID",
      "string.length": "Invalid permission ID",
    }),

  status: Joi.string()
    .valid(...statuses)
    .messages({
      "any.only": "Invalid permission assignment status",
    }),
})
  .min(1)
  .messages({
    "object.min": "At least one field is required for update",
  });

const updateRolePermissionStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...statuses)
    .required()
    .messages({
      "any.only": "Invalid permission assignment status",
      "any.required": "Permission assignment status is required",
    }),
});

module.exports = {
  createRolePermissionSchema,
  updateRolePermissionSchema,
  updateRolePermissionStatusSchema,
};