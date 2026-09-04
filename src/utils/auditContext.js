const { AsyncLocalStorage } = require("node:async_hooks");

const auditContext = new AsyncLocalStorage();

const getAuditContext = () => {
  return auditContext.getStore();
};

module.exports = {
  auditContext,
  getAuditContext,
};