const express = require("express");

const {
  getAuditLogsController,
} = require("./audit.controller");


const {
  authenticate,
} = require("../../middleware/auth.middleware");

const authorize = require("../../middleware/role.middleware");

const {
  auditReadLimiter,
} = require("./audit.rateLimiter");

const router = express.Router();

// GET AUDIT LOGS
router.get(
  "/",
  authenticate,
  auditReadLimiter,
  authorize("SUPER_ADMIN"),
  getAuditLogsController
);

module.exports = router;