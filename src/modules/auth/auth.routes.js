const express = require("express");

const authController = require("./auth.controller");
const authValidator = require("./auth.validator");
const validate = require("../../middleware/validate.middleware");
const passport = require("passport");
const { loginLimiter , sendEmailOTPLimiter , verifyEmailOTPLimiter,registerLimiter } = require("./auth.rateLimiter")

const router = express.Router();


// SEND EMAIL OTP
router.post(
  "/send-email-otp",
  sendEmailOTPLimiter,
  validate(authValidator.sendEmailOTPSchema),
  authController.sendEmailOTP
);

// VERIFY EMAIL OTP
router.post(
  "/verify-email-otp",
  verifyEmailOTPLimiter,
  validate(authValidator.verifyEmailOTPSchema),
  authController.verifyEmailOTP
);

// REGISTER
router.post(
  "/register",
  registerLimiter,
  validate(authValidator.registerSchema),
  authController.register
);

// LOGIN
router.post(
  "/login",
  loginLimiter,
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

// FORGOT PASSWORD - SEND OTP
router.post(
  "/forgot-password",
  validate(authValidator.forgotPasswordSchema),
  authController.forgotPassword
);

// FORGOT PASSWORD - VERIFY OTP
router.post(
  "/verify-forgot-password-otp",
  validate(authValidator.verifyForgotPasswordOTPSchema),
  authController.verifyForgotPasswordOTP
);

// CHANGE PASSWORD - LOGGED IN USER
router.post(
  "/change-password",
  passport.authenticate("jwt", {
    session: false,
  }),
  validate(authValidator.changePasswordSchema),
  authController.changePassword
);


module.exports = router;
