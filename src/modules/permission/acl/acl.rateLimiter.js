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

// CREATE ACL
const aclCreateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message:
    "Too many ACL creation requests. Please try again after 15 minutes.",
});

// GET ACLS / GET BY ID
const aclReadLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message:
    "Too many ACL read requests. Please try again after 15 minutes.",
});

// UPDATE ACL
const aclUpdateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message:
    "Too many ACL update requests. Please try again after 15 minutes.",
});

// UPDATE ACL STATUS
const aclStatusLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message:
    "Too many ACL status update requests. Please try again after 15 minutes.",
});

// DELETE ACL
const aclDeleteLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message:
    "Too many ACL deletion requests. Please try again after 15 minutes.",
});

module.exports = {
  aclCreateLimiter,
  aclReadLimiter,
  aclUpdateLimiter,
  aclStatusLimiter,
  aclDeleteLimiter,
};