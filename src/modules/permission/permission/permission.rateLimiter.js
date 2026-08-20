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

// CREATE PERMISSION
const permissionCreateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message:
    "Too many permission creation requests. Please try again after 15 minutes.",
});

// GET PERMISSIONS / OPTIONS / GET BY ID
const permissionReadLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message:
    "Too many permission read requests. Please try again after 15 minutes.",
});

// UPDATE PERMISSION
const permissionUpdateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message:
    "Too many permission update requests. Please try again after 15 minutes.",
});

// UPDATE PERMISSION STATUS
const permissionStatusLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message:
    "Too many permission status update requests. Please try again after 15 minutes.",
});

// DELETE PERMISSION
const permissionDeleteLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message:
    "Too many permission deletion requests. Please try again after 15 minutes.",
});

module.exports = {
  permissionCreateLimiter,
  permissionReadLimiter,
  permissionUpdateLimiter,
  permissionStatusLimiter,
  permissionDeleteLimiter,
};