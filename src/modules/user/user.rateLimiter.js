const rateLimit = require("express-rate-limit");

const createRateLimiter = ({ windowMs, max, message }) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// GET users / GET user by ID
const userReadLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message:
    "Too many user data requests. Please try again after 15 minutes.",
});

// UPDATE USER
const userUpdateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message:
    "Too many user update requests. Please try again after 15 minutes.",
});

// UPDATE ACCOUNT STATUS
const userStatusLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message:
    "Too many account status update requests. Please try again after 15 minutes.",
});

// RESET PASSWORD
const userPasswordResetLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message:
    "Too many password reset requests. Please try again after 15 minutes.",
});

// ASSIGN REPORTING MANAGER
const reportingManagerLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message:
    "Too many reporting manager update requests. Please try again after 15 minutes.",
});

// DELETE USER
const userDeleteLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message:
    "Too many user deletion requests. Please try again after 15 minutes.",
});

module.exports = {
  userReadLimiter,
  userUpdateLimiter,
  userStatusLimiter,
  userPasswordResetLimiter,
  reportingManagerLimiter,
  userDeleteLimiter,
};