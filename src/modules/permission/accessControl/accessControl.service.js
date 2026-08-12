const mongoose = require("mongoose");

const Permission = require("../permission/permission.model");
const RolePermission = require("../rolePermission/rolePermission.model");
const ACL = require("../acl/acl.model");
const Employee = require("../../employee/employee.model");

/**
 * Check whether a user has the requested permission.
 *
 * Flow:
 *
 * User
 * ↓
 * Employee
 * ↓
 * Hierarchy
 * ↓
 * RolePermission
 * ↓
 * ACL
 * ↓
 * ALLOW / DENY
 */
const checkAccess = async ({
  user,
  resource,
  action,
  departmentId = null,
  teamId = null,
  employeeId = null,
}) => {
  if (!user) {
    return {
      allowed: false,
      reason: "Authentication required.",
    };
  }

  if (!resource || !action) {
    return {
      allowed: false,
      reason: "Resource and action are required.",
    };
  }

  /*
   * 1. Hierarchy Validation
   *
   * User.employeeId contains the Employee ObjectId.
   * hierarchyLevel is stored in Employee.
   */

  const employee = await Employee.findById(user.employeeId).select(
    "_id hierarchyLevel department team"
  );

  if (!employee) {
    return {
      allowed: false,
      reason: "Employee not found.",
    };
  }

  const hierarchyLevel = employee.hierarchyLevel || user.role;

  if (!hierarchyLevel) {
    return {
      allowed: false,
      reason: "User hierarchy level not found.",
    };
  }

  /*
   * 2. Permission Validation
   */

  const permission = await Permission.findOne({
    resource: resource.toUpperCase(),
    action: action.toUpperCase(),
    status: "ACTIVE",
  });

  if (!permission) {
    return {
      allowed: false,
      reason: "Permission not found or inactive.",
    };
  }

  /*
   * 3. RolePermission Validation
   *
   * Example:
   *
   * TEAM_LEAD
   * ↓
   * TEAM.CREATE
   */

  const rolePermission = await RolePermission.findOne({
    hierarchyLevel,
    permission: permission._id,
    status: "ACTIVE",
  });

  if (!rolePermission) {
    return {
      allowed: false,
      reason:
        "Permission is not assigned to this hierarchy level.",
    };
  }

  /*
   * 4. ACL Validation
   *
   * Most specific → least specific:
   *
   * Employee
   * ↓
   * Team
   * ↓
   * Department
   * ↓
   * Global Hierarchy
   */

  const objectIdOrNull = (id) => {
    if (!id) return null;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    return new mongoose.Types.ObjectId(id);
  };

  const employeeObjectId = objectIdOrNull(employeeId);
  const teamObjectId = objectIdOrNull(teamId);
  const departmentObjectId = objectIdOrNull(departmentId);

  /*
   * Employee-level ACL
   */

  let acl = null;

  if (employeeObjectId) {
    acl = await ACL.findOne({
      hierarchyLevel,
      permission: permission._id,
      employee: employeeObjectId,
      status: "ACTIVE",
    }).sort({
      createdAt: -1,
    });
  }

  /*
   * Team-level ACL
   */

  if (!acl && teamObjectId) {
    acl = await ACL.findOne({
      hierarchyLevel,
      permission: permission._id,
      team: teamObjectId,
      status: "ACTIVE",
    }).sort({
      createdAt: -1,
    });
  }

  /*
   * Department-level ACL
   */

  if (!acl && departmentObjectId) {
    acl = await ACL.findOne({
      hierarchyLevel,
      permission: permission._id,
      department: departmentObjectId,
      status: "ACTIVE",
    }).sort({
      createdAt: -1,
    });
  }

  /*
   * Global hierarchy-level ACL
   */

  if (!acl) {
    acl = await ACL.findOne({
      hierarchyLevel,
      permission: permission._id,
      department: null,
      team: null,
      employee: null,
      status: "ACTIVE",
    }).sort({
      createdAt: -1,
    });
  }

  /*
   * No ACL rule means DENY.
   */

  if (!acl) {
    return {
      allowed: false,
      reason:
        "No active ACL (Access Control List) rule found.",
      permission,
      rolePermission,
    };
  }

  /*
   * 5. Final ALLOW / DENY
   */

  if (acl.effect === "DENY") {
    return {
      allowed: false,
      reason: "Access denied by ACL.",
      permission,
      rolePermission,
      acl,
    };
  }

  if (acl.effect === "ALLOW") {
    return {
      allowed: true,
      reason: "Access granted.",
      permission,
      rolePermission,
      acl,
    };
  }

  return {
    allowed: false,
    reason: "Invalid ACL effect.",
    permission,
    rolePermission,
    acl,
  };
};

module.exports = {
  checkAccess,
};