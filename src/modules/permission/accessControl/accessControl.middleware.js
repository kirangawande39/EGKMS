const accessControlService = require(
  "./accessControl.service"
);

/**
 * Access Control Middleware
 *
 * Usage:
 *
 * accessControl("TEAM", "CREATE")
 *
 * Flow:
 *
 * authenticate
 *      ↓
 * accessControl
 *      ↓
 * RolePermission
 *      ↓
 * ACL
 *      ↓
 * ALLOW / DENY
 */
const accessControl = (
  resource,
  action
) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

      /*
       * Employee information may be attached
       * by authentication middleware.
       *
       * We keep fallback support because the
       * current authentication structure may
       * expose hierarchy differently.
       */
      const user = req.user;

      const departmentId =
        req.params.departmentId ||
        req.body.department ||
        req.query.department ||
        user.department ||
        null;

      const teamId =
        req.params.teamId ||
        req.body.team ||
        req.query.team ||
        user.team ||
        null;

      const employeeId =
        req.params.employeeId ||
        user.employeeId ||
        null;

      const result =
        await accessControlService.checkAccess({
          user,
          resource,
          action,
          departmentId,
          teamId,
          employeeId,
        });

      if (!result.allowed) {
        return res.status(403).json({
          success: false,
          message:
            result.reason ||
            "Access denied.",
        });
      }

      /*
       * Make authorization result available
       * to controller/service if needed.
       */
      req.accessControl = result;

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = accessControl;