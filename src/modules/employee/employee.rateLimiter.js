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

// CREATE EMPLOYEE
const employeeCreateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message:
    "Too many employee creation requests. Please try again after 15 minutes.",
});

// GET EMPLOYEES / GET BY EMAIL / GET BY ID
const employeeReadLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message:
    "Too many employee data requests. Please try again after 15 minutes.",
});

// UPDATE EMPLOYEE
const employeeUpdateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message:
    "Too many employee update requests. Please try again after 15 minutes.",
});

// UPDATE EMPLOYEE STATUS
const employeeStatusLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message:
    "Too many employee status update requests. Please try again after 15 minutes.",
});

// DELETE EMPLOYEE
const employeeDeleteLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message:
    "Too many employee deletion requests. Please try again after 15 minutes.",
});

module.exports = {
  employeeCreateLimiter,
  employeeReadLimiter,
  employeeUpdateLimiter,
  employeeStatusLimiter,
  employeeDeleteLimiter,
};