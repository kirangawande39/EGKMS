const passport = require("passport");

/**
 * Authenticate user using JWT access token.
 *
 * Access token is expected in:
 * HttpOnly cookie: accessToken
 */
const authenticate = (req, res, next) => {
  passport.authenticate(
    "jwt",
    { session: false },
    (error, user, info) => {
      if (error) {
        return next(error);
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message:
            info?.message || "Authentication required.",
        });
      }

      // Attach authenticated user
      req.user = user;

      // Passport attaches current employee
      // information to the authenticated user.
      if (user._employee) {
        req.employee = user._employee;
      }

      next();
    }
  )(req, res, next);
};

module.exports = {
  authenticate,
};
