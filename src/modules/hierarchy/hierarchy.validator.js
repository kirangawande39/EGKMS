const Joi = require("joi");
const mongoose = require("mongoose");


// Allowed hierarchy levels
const hierarchyLevels = [
  "SUPER_ADMIN",
  "GOVERNANCE",
  "EXECUTIVE",
  "DEPARTMENT",
  "MANAGER",
  "TEAM_LEAD",
  "TEAM",
  "EMPLOYEE",
  "INTERN",
];


// Allowed statuses
const hierarchyStatuses = [
  "active",
  "inactive",
];


// MongoDB ObjectId validation
const objectId = Joi.string()
  .custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.error("any.invalid");
    }

    return value;
  })
  .messages({
    "any.invalid": "Invalid parent hierarchy ID",
  });


// CREATE HIERARCHY
const createHierarchySchema = Joi.object({

  hierarchyLevel: Joi.string()
    .valid(...hierarchyLevels)
    .required()
    .messages({
      "any.only": "Invalid hierarchy level",
      "any.required": "Hierarchy level is required",
      "string.empty": "Hierarchy level is required",
    }),


  level: Joi.number()
    .integer()
    .min(1)
    .max(9)
    .required()
    .messages({
      "number.base": "Hierarchy level order must be a number",
      "number.integer": "Hierarchy level order must be an integer",
      "number.min": "Hierarchy level order must be at least 1",
      "number.max": "Hierarchy level order cannot exceed 9",
      "any.required": "Hierarchy level order is required",
    }),


  parentId: objectId
    .allow(null)
    .default(null),


  description: Joi.string()
    .trim()
    .max(500)
    .allow("", null)
    .default(null)
    .messages({
      "string.max": "Hierarchy description cannot exceed 500 characters",
    }),


  status: Joi.string()
    .valid(...hierarchyStatuses)
    .default("active")
    .messages({
      "any.only": "Invalid hierarchy status",
    }),

});


// UPDATE HIERARCHY
const updateHierarchySchema = Joi.object({

  hierarchyLevel: Joi.string()
    .valid(...hierarchyLevels)
    .messages({
      "any.only": "Invalid hierarchy level",
    }),


  level: Joi.number()
    .integer()
    .min(1)
    .max(9)
    .messages({
      "number.base": "Hierarchy level order must be a number",
      "number.integer": "Hierarchy level order must be an integer",
      "number.min": "Hierarchy level order must be at least 1",
      "number.max": "Hierarchy level order cannot exceed 9",
    }),


  parentId: objectId
    .allow(null),


  description: Joi.string()
    .trim()
    .max(500)
    .allow("", null)
    .messages({
      "string.max": "Hierarchy description cannot exceed 500 characters",
    }),


  status: Joi.string()
    .valid(...hierarchyStatuses)
    .messages({
      "any.only": "Invalid hierarchy status",
    }),

})
  .min(1)
  .messages({
    "object.min": "At least one field is required for update",
  });


// UPDATE STATUS
const updateHierarchyStatusSchema = Joi.object({

  status: Joi.string()
    .valid(...hierarchyStatuses)
    .required()
    .messages({
      "any.only": "Invalid hierarchy status",
      "any.required": "Hierarchy status is required",
    }),

});


module.exports = {
  createHierarchySchema,
  updateHierarchySchema,
  updateHierarchyStatusSchema,
};
