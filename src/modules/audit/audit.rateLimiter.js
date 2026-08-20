const rateLimit = require("express-rate-limit");

const auditReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message:
      "Too many audit log requests. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  auditReadLimiter,
};