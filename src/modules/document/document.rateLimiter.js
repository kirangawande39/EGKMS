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

// CREATE DOCUMENT + FILE UPLOAD
const documentCreateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message:
    "Too many document creation requests. Please try again after 15 minutes.",
});

// GET / SEARCH / VIEW / VERSION HISTORY
const documentReadLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message:
    "Too many document read requests. Please try again after 15 minutes.",
});

// UPDATE DOCUMENT + NEW VERSION + FILE UPLOAD
const documentUpdateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message:
    "Too many document update requests. Please try again after 15 minutes.",
});

// DOCUMENT STATUS
const documentStatusLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message:
    "Too many document status update requests. Please try again after 15 minutes.",
});

// ARCHIVE
const documentArchiveLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message:
    "Too many document archive requests. Please try again after 15 minutes.",
});

// RESTORE
const documentRestoreLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message:
    "Too many document restore requests. Please try again after 15 minutes.",
});

// DELETE
const documentDeleteLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message:
    "Too many document deletion requests. Please try again after 15 minutes.",
});

module.exports = {
  documentCreateLimiter,
  documentReadLimiter,
  documentUpdateLimiter,
  documentStatusLimiter,
  documentArchiveLimiter,
  documentRestoreLimiter,
  documentDeleteLimiter,
};