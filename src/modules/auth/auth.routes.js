const router = require("express").Router();
const passport = require("passport");

const validate = require('../../middleware/validate.middleware')
const { createUserValidator } = require('../auth/auth.validator')

const authController = require("./auth.controller");

const { register } = require('./auth.controller')



router.post("/login",

    passport.authenticate(
        "local",
        {
            session:false
        }
    ),

    authController.login
);


router.post('/register', validate(createUserValidator) , register);



module.exports = router;