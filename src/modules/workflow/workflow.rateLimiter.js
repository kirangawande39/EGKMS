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

// MY SUBMISSIONS / PENDING WORKFLOWS
const workflowReadLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message:
    "Too many workflow read requests. Please try again after 15 minutes.",
});

// SUBMIT DOCUMENT
const workflowSubmitLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message:
    "Too many document submission requests. Please try again after 15 minutes.",
});

// REVIEW WORKFLOW
const workflowReviewLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message:
    "Too many workflow review requests. Please try again after 15 minutes.",
});

// RESUBMIT DOCUMENT
const workflowResubmitLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message:
    "Too many document resubmission requests. Please try again after 15 minutes.",
});

module.exports = {
  workflowReadLimiter,
  workflowSubmitLimiter,
  workflowReviewLimiter,
  workflowResubmitLimiter,
};