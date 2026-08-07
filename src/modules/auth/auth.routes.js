const express = require("express");

const authController = require("./auth.controller");
const authValidator = require("./auth.validator");
const validate = require("../../middleware/validate.middleware");
const passport = require("passport");

const router = express.Router();


// SEND EMAIL OTP
router.post(
  "/send-email-otp",
  validate(authValidator.sendEmailOTPSchema),
  authController.sendEmailOTP
);

// VERIFY EMAIL OTP
router.post(
  "/verify-email-otp",
  validate(authValidator.verifyEmailOTPSchema),
  authController.verifyEmailOTP
);

// REGISTER
router.post(
  "/register",
  validate(authValidator.registerSchema),
  authController.register
);

// LOGIN
router.post(
  "/login",
  validate(authValidator.loginSchema),
  passport.authenticate("local", {
    session: false,
  }),
  authController.login
);

// REFRESH ACCESS TOKEN
router.post(
  "/refresh",
  authController.refreshToken
);

// LOGOUT
router.post(
  "/logout",
  passport.authenticate("jwt", {
    session: false,
  }),
  authController.logout
);


module.exports = router;
