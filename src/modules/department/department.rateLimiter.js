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

// CREATE DEPARTMENT
const departmentCreateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message:
    "Too many department creation requests. Please try again after 15 minutes.",
});

// GET DEPARTMENTS / GET BY ID
const departmentReadLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message:
    "Too many department data requests. Please try again after 15 minutes.",
});

// UPDATE DEPARTMENT
const departmentUpdateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message:
    "Too many department update requests. Please try again after 15 minutes.",
});

// UPDATE DEPARTMENT STATUS
const departmentStatusLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message:
    "Too many department status update requests. Please try again after 15 minutes.",
});

// DELETE DEPARTMENT
const departmentDeleteLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message:
    "Too many department deletion requests. Please try again after 15 minutes.",
});

module.exports = {
  departmentCreateLimiter,
  departmentReadLimiter,
  departmentUpdateLimiter,
  departmentStatusLimiter,
  departmentDeleteLimiter,
};