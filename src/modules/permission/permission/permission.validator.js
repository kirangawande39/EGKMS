const Joi = require("joi");

const permissionActions = [
  "VIEW",
  "CREATE",
  "EDIT",
  "DELETE",
  "REVIEW",
  "APPROVE",
  "PUBLISH",
  "ARCHIVE",
  "RESTORE",
];

const permissionStatuses = ["ACTIVE", "INACTIVE"];

const createPermissionSchema = Joi.object({
  resource: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.empty": "Permission resource is required",
      "string.min": "Permission resource must be at least 2 characters",
      "string.max": "Permission resource cannot exceed 100 characters",
      "any.required": "Permission resource is required",
    }),

  action: Joi.string()
    .valid(...permissionActions)
    .required()
    .messages({
      "any.only": "Invalid permission action",
      "any.required": "Permission action is required",
    }),

  description: Joi.string()
    .trim()
    .max(500)
    .allow("", null)
    .default(null),

  status: Joi.string()
    .valid(...permissionStatuses)
    .default("ACTIVE"),
});

const updatePermissionSchema = Joi.object({
  resource: Joi.string()
    .trim()
    .min(2)
    .max(100),

  action: Joi.string().valid(...permissionActions),

  description: Joi.string()
    .trim()
    .max(500)
    .allow("", null),

  status: Joi.string().valid(...permissionStatuses),
})
  .min(1)
  .messages({
    "object.min": "At least one field is required for update",
  });

const updatePermissionStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...permissionStatuses)
    .required()
    .messages({
      "any.only": "Invalid permission status",
      "any.required": "Permission status is required",
    }),
});

module.exports = {
  createPermissionSchema,
  updatePermissionSchema,
  updatePermissionStatusSchema,
};