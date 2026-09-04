const {
  auditContext,
} = require("../utils/auditContext");

const auditContextMiddleware = (req, res, next) => {
  console.log("========== IP DEBUG ==========");
  console.log("req.ip:", req.ip);
  console.log("req.socket.remoteAddress:", req.socket.remoteAddress);
  console.log("x-forwarded-for:", req.headers["x-forwarded-for"]);
  console.log("x-real-ip:", req.headers["x-real-ip"]);
  console.log("host:", req.headers.host);
  console.log("==============================");

  const context = {
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
  };

  auditContext.run(context, () => {
    next();
  });
};

module.exports = auditContextMiddleware;