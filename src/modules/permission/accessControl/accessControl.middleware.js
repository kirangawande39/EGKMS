const accessControlService = require("./accessControl.service");

/**
 * Access Control Middleware
 */
const accessControl = (resource, action) => {
  return async (req, res, next) => {
    try {
      
      if (!req.user) {
        console.log("❌ ACCESS CONTROL: req.user is undefined");

        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      const user = req.user;
      const departmentId =
        req.params.departmentId ||
        req.body?.department ||
        req.query.department ||
        user.department ||
        null;

      // console.log("RESOLVED departmentId:", departmentId);

      const teamId =
        req.params.teamId ||
        req.body?.team ||
        req.query.team ||
        user.team ||
        null;

      // console.log("RESOLVED teamId:", teamId);

      const employeeId =
        req.params.employeeId ||
        user.employeeId ||
        null;

      // console.log("RESOLVED employeeId:", employeeId);


      console.log({
        user,
        resource,
        action,
        departmentId,
        teamId,
        employeeId,
      });

      // console.log("Calling accessControlService.checkAccess()...");

      const result = await accessControlService.checkAccess({
        user,
        resource,
        action,
        departmentId,
        teamId,
        employeeId,
      });

      // console.log("CHECK ACCESS RESULT:", result);

      if (!result.allowed) {
        // console.log("ACCESS DENIED");
        // console.log("REASON:", result.reason);

        return res.status(403).json({
          success: false,
          message: result.reason || "Access denied.",
        });
      }

      // console.log("ACCESS ALLOWED");

      req.accessControl = result;

      // console.log("========== ACCESS CONTROL END ==========\n");

      next();
    } catch (error) {
  
      next(error);
    }
  };
};

module.exports = accessControl;