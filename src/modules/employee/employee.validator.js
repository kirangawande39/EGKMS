const Joi = require("joi");


const createEmployeeValidator = Joi.object({

    name: Joi.string()
        .min(3)
        .required()
        .messages({

            "string.empty": "Employee name is required",

            "string.min": "Employee name must contain minimum 3 characters"

        }),


    email: Joi.string()
        .email()
        .required()
        .messages({

            "string.empty": "Employee email is required",

            "string.email": "Please enter valid employee email"

        }),


    role: Joi.string()
        .valid(
            "admin",
            "manager",
            "employee"
        )
        .default("employee")
        .messages({

            "any.only": "Invalid employee role"

        }),


    department: Joi.string()
        .optional()
        .allow("")
        .messages({

            "string.base": "Department must be a string"

        })

});


module.exports = {
    createEmployeeValidator
};