const {
  auditContext,
} = require("../utils/auditContext");

const auditContextMiddleware = (req, res, next) => {
  const context = {
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
  };


  auditContext.run(context, () => {
    next();
  });
};

module.exports = auditContextMiddleware;