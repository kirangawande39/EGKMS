const router = require("express").Router();
const passport = require("passport");


const validate = require("../../middleware/validate.middleware");



const {
    createUserValidator,
    loginValidator,
    sendEmailOTPValidator,
    verifyEmailOTPValidator

} = require("./auth.validator");


const {
    loginLimiter,
    registerLimiter,
    verifyEmailOTPLimiter,
    sendEmailOTPLimiter

} = require("../../middleware/rateLimiter.middleware");


const authController = require("./auth.controller");



router.post(
    "/send-email-otp",
    sendEmailOTPLimiter,
    validate(sendEmailOTPValidator),
    authController.sendEmailOTP
);



router.post(
    "/verify-email-otp",
    verifyEmailOTPLimiter,
    validate(verifyEmailOTPValidator),
    authController.verifyEmailOTP
);



router.post(
    "/register",
    registerLimiter,
    validate(createUserValidator),
    authController.register
);


router.post(
    "/login",
    loginLimiter,
    validate(loginValidator),
    passport.authenticate(
        "local",
        {
            session: false
        }
    ),
    authController.login
);


module.exports = router;