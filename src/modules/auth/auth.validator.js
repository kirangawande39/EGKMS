const Joi = require("joi");


const createUserValidator = Joi.object({

    name:Joi.string()
        .min(3)
        .required()
        .messages({

            "string.empty":"Name is required",
            "string.min":"Name must contain minimum 3 characters"

        }),


    email:Joi.string()
        .email()
        .required()
        .messages({

            "string.empty":"Email is required",
            "string.email":"Please enter valid email"

        }),


    password:Joi.string()
        .min(8)
        .required()
        .messages({

            "string.empty":"Password is required",
            "string.min":"Password must be minimum 8 characters"

        }),


    role:Joi.string()
        .valid(
            "admin",
            "employee",
            "manager"
        )
        .default("employee")

});

module.exports={createUserValidator}