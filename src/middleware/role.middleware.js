/**
 * Hierarchy-based authorization middleware.
 *
 * Usage:
 * authorize("SUPER_ADMIN")
 * authorize("SUPER_ADMIN", "GOVERNANCE")
 *
 * The authenticated employee's hierarchyLevel
 * is used for authorization.
 */

const authorize = (...allowedLevels) => {
  return (req, res, next) => {
    // Authentication middleware must run first.
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // Employee information is attached by Passport
    // in auth.middleware.js
    const employee = req.employee;

    if (!employee) {
      return res.status(403).json({
        success: false,
        message: "Employee information not found.",
      });
    }

    const hierarchyLevel =
      employee.hierarchyLevel;

    // Check hierarchy authorization
    if (!allowedLevels.includes(hierarchyLevel)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized.",
      });
    }

    next();
  };
};

module.exports = authorize;
