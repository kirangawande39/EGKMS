const mongoose = require("mongoose");

const Permission = require("../permission/permission.model");
const RolePermission = require("../rolePermission/rolePermission.model");
const ACL = require("../acl/acl.model");
const Employee = require("../../employee/employee.model");
const Document = require("../../document/document.model");

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
 * Document Context
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
  documentId = null,
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
   * 4. ACL Context Validation
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

  let employeeObjectId = objectIdOrNull(employeeId);
  let teamObjectId = objectIdOrNull(teamId);
  let departmentObjectId = objectIdOrNull(departmentId);
  const documentObjectId = objectIdOrNull(documentId);

  /*
   * 4.1 Resolve Document Context
   *
   * Workflow routes provide documentId/workflowId,
   * not departmentId/teamId.
   *
   * Therefore, when a document is involved,
   * resolve its department and team first.
   */

  if (documentObjectId) {
    const document = await Document.findById(documentObjectId).select(
      "department team"
    );

    if (!document) {
      return {
        allowed: false,
        reason: "Document not found.",
      };
    }

    if (!departmentObjectId && document.department) {
      departmentObjectId = objectIdOrNull(document.department);
    }

    if (!teamObjectId && document.team) {
      teamObjectId = objectIdOrNull(document.team);
    }
  }

  /*
   * 4.2 Employee-level ACL
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
   * 4.3 Team-level ACL
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
   * 4.4 Department-level ACL
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
   * 4.5 Global hierarchy-level ACL
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
   * 5. No ACL Rule = DENY
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
   * 6. Final ALLOW / DENY
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