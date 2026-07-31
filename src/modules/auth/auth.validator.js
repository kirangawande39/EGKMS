const Joi = require("joi");


// Register Validator
const createUserValidator = Joi.object({

    name: Joi.string()
        .min(3)
        .required()
        .messages({

            "string.empty": "Name is required",
            "string.min": "Name must contain minimum 3 characters"

        }),


    email: Joi.string()
        .email()
        .required()
        .messages({

            "string.empty": "Email is required",
            "string.email": "Please enter valid email"

        }),


    password: Joi.string()
        .min(8)
        .required()
        .messages({

            "string.empty": "Password is required",
            "string.min": "Password must be minimum 8 characters"

        }),


    role: Joi.string()
        .valid(
            "admin",
            "employee",
            "manager"
        )
        .default("employee")

});


// Login Validator
const loginValidator = Joi.object({

    email: Joi.string()
        .email()
        .required()
        .messages({

            "string.empty": "Email is required",
            "string.email": "Please enter valid email"

        }),


    password: Joi.string()
        .min(8)
        .required()
        .messages({

            "string.empty": "Password is required",
            "string.min": "Password must be minimum 8 characters"

        })

});


// Send OTP Validator
const sendEmailOTPValidator = Joi.object({

    email: Joi.string()
        .email()
        .required()
        .messages({

            "string.empty": "Email is required",
            "string.email": "Please enter valid email"

        })

});


// Verify OTP Validator
const verifyEmailOTPValidator = Joi.object({

    email: Joi.string()
        .email()
        .required()
        .messages({

            "string.empty": "Email is required",
            "string.email": "Please enter valid email"

        }),


    otp: Joi.string()
        .length(6)
        .pattern(/^[0-9]+$/)
        .required()
        .messages({

            "string.empty": "OTP is required",
            "string.length": "OTP must be 6 digits",
            "string.pattern.base": "OTP must contain only numbers"

        })

});


module.exports = {

    createUserValidator,

    loginValidator,

    sendEmailOTPValidator,

    verifyEmailOTPValidator

};