const rateLimit = require("express-rate-limit");


const createRateLimiter = ({ windowMs, max, message }) => {

    return rateLimit({

        windowMs,

        max,

        message: {
            success: false,
            message
        },

        standardHeaders: true,

        legacyHeaders: false

    });

};


// Register Limiter
const registerLimiter = createRateLimiter({

    windowMs: 15 * 60 * 1000,

    max: 5,

    message: "Too many registration attempts. Please try again after 15 minutes."

});


// Login Limiter
const loginLimiter = createRateLimiter({

    windowMs: 5 * 60 * 1000,

    max: 5,

    message: "Too many login attempts. Please try again after 5 minutes."

});


// Send Email OTP Limiter
const sendEmailOTPLimiter = createRateLimiter({

    windowMs: 5 * 60 * 1000,

    max: 3,

    message: "Too many OTP requests. Please try again after 5 minutes."

});


// Verify Email OTP Limiter
const verifyEmailOTPLimiter = createRateLimiter({

    windowMs: 10 * 60 * 1000,

    max: 10,

    message: "Too many OTP verification attempts. Please try again after 10 minutes."

});


module.exports = {

    registerLimiter,

    loginLimiter,

    sendEmailOTPLimiter,

    verifyEmailOTPLimiter

};