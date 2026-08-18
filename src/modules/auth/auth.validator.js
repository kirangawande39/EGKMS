const Joi = require("joi");


// COMMON EMAIL


const email = Joi.string()
  .email()
  .lowercase()
  .trim()
  .required()
  .messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  });



// SEND EMAIL OTP


const sendEmailOTPSchema = Joi.object({
  email,
});



// VERIFY EMAIL OTP


const verifyEmailOTPSchema = Joi.object({
  email,

  otp: Joi.string()
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      "string.pattern.base":
        "OTP must be exactly 6 digits",
      "any.required": "OTP is required",
    }),
});



// REGISTER


const registerSchema = Joi.object({
  email,

  password: Joi.string()
    .min(8)
    .max(128)
    .required()
    .messages({
      "string.min":
        "Password must be at least 8 characters",
      "string.max":
        "Password cannot exceed 128 characters",
      "any.required":
        "Password is required",
    }),

  confirmPassword: Joi.any()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only":
        "Password and confirm password must match",
      "any.required":
        "Confirm password is required",
    }),
});



// LOGIN


const loginSchema = Joi.object({
  email,

  password: Joi.string()
    .required()
    .messages({
      "any.required":
        "Password is required",
    }),
});



// REFRESH TOKEN


const refreshTokenSchema = Joi.object({});

// FORGOT PASSWORD
const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});


// VERIFY FORGOT PASSWORD OTP
const verifyForgotPasswordOTPSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
  newPassword: Joi.string().min(8).required(),
});


// CHANGE PASSWORD
const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});


// EXPORTS



module.exports = {
  changePasswordSchema,
  verifyForgotPasswordOTPSchema,
  forgotPasswordSchema,
  sendEmailOTPSchema,
  verifyEmailOTPSchema,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
};
