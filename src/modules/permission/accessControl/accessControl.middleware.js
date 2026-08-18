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

      const documentId =
        req.params.documentId ||
        req.params.workflowId ||
        req.body?.documentId ||
        req.body?.workflowId ||
        req.query.documentId ||
        req.query.workflowId ||
        null;

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

    
      const result = await accessControlService.checkAccess({
        user,
        resource,
        action,
        departmentId,
        teamId,
        employeeId,
        documentId,
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