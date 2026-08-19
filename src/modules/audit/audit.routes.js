const express = require("express");

const {
  getAuditLogsController,
} = require("./audit.controller");

const passport = require("../../config/passport");

const {
  authenticate,
} = require("../../middleware/auth.middleware");

const authorize = require("../../middleware/role.middleware");

const router = express.Router();

// GET AUDIT LOGS
router.get(
  "/",
  authenticate,
  authorize("SUPER_ADMIN"),
  getAuditLogsController
);

module.exports = router;