const rateLimit = require("express-rate-limit");


const createRateLimiter = (options) => {

    return rateLimit({
        windowMs: options.windowMs,
        max: options.max,
        message: {
            success: false,
            message: options.message
        },
        keyGenerator: (req) => req.ip,
        standardHeaders: true,
        legacyHeaders: false
    });

};


const registerLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many registration attempts. Please try again after 15 minutes."
});


const loginLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many login attempts. Please try again after 15 minutes."
});


module.exports = {
    registerLimiter,
    loginLimiter
};