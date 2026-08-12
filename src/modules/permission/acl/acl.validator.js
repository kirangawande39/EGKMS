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

const effects = ["ALLOW", "DENY"];

const statuses = ["ACTIVE", "INACTIVE"];

const objectId = Joi.string()
  .hex()
  .length(24);

const createAclSchema = Joi.object({
  hierarchyLevel: Joi.string()
    .valid(...hierarchyLevels)
    .required()
    .messages({
      "any.only": "Invalid hierarchy level",
      "any.required": "Hierarchy level is required",
    }),

  permission: objectId.required().messages({
    "string.hex": "Invalid permission ID",
    "string.length": "Invalid permission ID",
    "any.required": "Permission ID is required",
  }),

  department: objectId
    .allow(null)
    .default(null)
    .messages({
      "string.hex": "Invalid department ID",
      "string.length": "Invalid department ID",
    }),

  team: objectId
    .allow(null)
    .default(null)
    .messages({
      "string.hex": "Invalid team ID",
      "string.length": "Invalid team ID",
    }),

  employee: objectId
    .allow(null)
    .default(null)
    .messages({
      "string.hex": "Invalid employee ID",
      "string.length": "Invalid employee ID",
    }),

  effect: Joi.string()
    .valid(...effects)
    .required()
    .messages({
      "any.only": "Effect must be ALLOW or DENY",
      "any.required": "ACL effect is required",
    }),

  status: Joi.string()
    .valid(...statuses)
    .default("ACTIVE")
    .messages({
      "any.only": "Invalid ACL status",
    }),
});

const updateAclSchema = Joi.object({
  hierarchyLevel: Joi.string().valid(...hierarchyLevels),

  permission: objectId.messages({
    "string.hex": "Invalid permission ID",
    "string.length": "Invalid permission ID",
  }),

  department: objectId.allow(null).messages({
    "string.hex": "Invalid department ID",
    "string.length": "Invalid department ID",
  }),

  team: objectId.allow(null).messages({
    "string.hex": "Invalid team ID",
    "string.length": "Invalid team ID",
  }),

  employee: objectId.allow(null).messages({
    "string.hex": "Invalid employee ID",
    "string.length": "Invalid employee ID",
  }),

  effect: Joi.string().valid(...effects),

  status: Joi.string().valid(...statuses),
})
  .min(1)
  .messages({
    "object.min": "At least one field is required for update",
  });

const updateAclStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...statuses)
    .required()
    .messages({
      "any.only": "Invalid ACL status",
      "any.required": "ACL status is required",
    }),
});

module.exports = {
  createAclSchema,
  updateAclSchema,
  updateAclStatusSchema,
};