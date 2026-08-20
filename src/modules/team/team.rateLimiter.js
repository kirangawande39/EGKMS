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

// CREATE TEAM
const teamCreateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message:
    "Too many team creation requests. Please try again after 15 minutes.",
});

// GET TEAMS / GET TEAM BY ID
const teamReadLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message:
    "Too many team data requests. Please try again after 15 minutes.",
});

// UPDATE TEAM
const teamUpdateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message:
    "Too many team update requests. Please try again after 15 minutes.",
});

// UPDATE TEAM STATUS
const teamStatusLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message:
    "Too many team status update requests. Please try again after 15 minutes.",
});

// DELETE TEAM
const teamDeleteLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message:
    "Too many team deletion requests. Please try again after 15 minutes.",
});

module.exports = {
  teamCreateLimiter,
  teamReadLimiter,
  teamUpdateLimiter,
  teamStatusLimiter,
  teamDeleteLimiter,
};