const {
  auditContext,
} = require("../utils/auditContext");

const getClientIp = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.socket.remoteAddress || null;
};

const auditContextMiddleware = (req, res, next) => {
  const context = {
    ipAddress: getClientIp(req),
    userAgent: req.get("user-agent"),
  };

  auditContext.run(context, () => {
    next();
  });
};

module.exports = auditContextMiddleware;