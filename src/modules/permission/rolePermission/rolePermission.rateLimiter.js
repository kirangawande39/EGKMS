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

// CREATE ROLE PERMISSION
const rolePermissionCreateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message:
    "Too many role permission creation requests. Please try again after 15 minutes.",
});

// GET ROLE PERMISSIONS / GET BY ID
const rolePermissionReadLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message:
    "Too many role permission read requests. Please try again after 15 minutes.",
});

// UPDATE ROLE PERMISSION
const rolePermissionUpdateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message:
    "Too many role permission update requests. Please try again after 15 minutes.",
});

// UPDATE STATUS
const rolePermissionStatusLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message:
    "Too many role permission status update requests. Please try again after 15 minutes.",
});

// DELETE ROLE PERMISSION
const rolePermissionDeleteLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message:
    "Too many role permission deletion requests. Please try again after 15 minutes.",
});

module.exports = {
  rolePermissionCreateLimiter,
  rolePermissionReadLimiter,
  rolePermissionUpdateLimiter,
  rolePermissionStatusLimiter,
  rolePermissionDeleteLimiter,
};