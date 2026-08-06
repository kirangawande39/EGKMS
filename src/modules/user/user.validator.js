const Joi = require("joi");


// UPDATE USER


const updateUserValidator =
  Joi.object({
    email: Joi.string()
      .email()
      .lowercase()
      .trim(),

    accountStatus: Joi.string()
      .valid(
        "ACTIVE",
        "INACTIVE",
        "SUSPENDED"
      ),
  })
    .min(1)
    .messages({
      "object.min":
        "At least one field is required.",
    });


// UPDATE USER ACCOUNT STATUS


const updateUserAccountStatusValidator =
  Joi.object({
    accountStatus: Joi.string()
      .valid(
        "ACTIVE",
        "INACTIVE",
        "SUSPENDED"
      )
      .required()
      .messages({
        "any.only":
          "Account status must be ACTIVE, INACTIVE, or SUSPENDED.",

        "any.required":
          "Account status is required.",
      }),
  });


// RESET PASSWORD


const resetPasswordValidator =
  Joi.object({
    newPassword: Joi.string()
      .min(8)
      .required()
      .messages({
        "string.min":
          "Password must be at least 8 characters.",

        "any.required":
          "New password is required.",
      }),
  });


// ASSIGN REPORTING MANAGER


const assignReportingManagerValidator =
  Joi.object({
    reportingManager: Joi.string()
      .hex()
      .length(24)
      .allow(null)
      .required()
      .messages({
        "string.hex":
          "Reporting manager must be a valid MongoDB ObjectId.",

        "string.length":
          "Reporting manager must be a valid MongoDB ObjectId.",

        "any.required":
          "Reporting manager is required. Use null to remove it.",
      }),
  });


// EXPORTS


module.exports = {
  updateUserValidator,
  updateUserAccountStatusValidator,
  resetPasswordValidator,
  assignReportingManagerValidator,
};