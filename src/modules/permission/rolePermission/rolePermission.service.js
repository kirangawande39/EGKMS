const mongoose = require("mongoose");

const RolePermission = require("./rolePermission.model");
const Permission = require("../permission/permission.model");

const createRolePermission = async (data, userId) => {
  const permission = await Permission.findById(data.permission);

  if (!permission) {
    const error = new Error("Permission not found.");
    error.statusCode = 404;
    throw error;
  }

  if (permission.status !== "ACTIVE") {
    const error = new Error(
      "Cannot assign an inactive permission."
    );
    error.statusCode = 400;
    throw error;
  }

  const existingAssignment = await RolePermission.findOne({
    hierarchyLevel: data.hierarchyLevel,
    permission: data.permission,
  });

  if (existingAssignment) {
    const error = new Error(
      "This permission is already assigned to this hierarchy."
    );
    error.statusCode = 409;
    throw error;
  }

  const rolePermission = await RolePermission.create({
    hierarchyLevel: data.hierarchyLevel,
    permission: data.permission,
    assignedBy: userId,
    status: data.status || "ACTIVE",
  });

  return RolePermission.findById(rolePermission._id)
    .populate(
      "permission",
      "_id resource action description status"
    )
    .populate(
      "assignedBy",
      "_id email"
    );
};

const getRolePermissions = async (filters = {}) => {
  const query = {};

  if (filters.hierarchyLevel) {
    query.hierarchyLevel = filters.hierarchyLevel;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  return RolePermission.find(query)
    .populate(
      "permission",
      "_id resource action description status"
    )
    .populate(
      "assignedBy",
      "_id email"
    )
    .sort({
      hierarchyLevel: 1,
      createdAt: -1,
    });
};

const getRolePermissionById = async (rolePermissionId) => {
  if (!mongoose.Types.ObjectId.isValid(rolePermissionId)) {
    const error = new Error(
      "Invalid role permission ID."
    );
    error.statusCode = 400;
    throw error;
  }

  const rolePermission = await RolePermission.findById(
    rolePermissionId
  )
    .populate(
      "permission",
      "_id resource action description status"
    )
    .populate(
      "assignedBy",
      "_id email"
    );

  if (!rolePermission) {
    const error = new Error(
      "Role permission assignment not found."
    );
    error.statusCode = 404;
    throw error;
  }

  return rolePermission;
};

const updateRolePermission = async (
  rolePermissionId,
  data
) => {
  if (!mongoose.Types.ObjectId.isValid(rolePermissionId)) {
    const error = new Error(
      "Invalid role permission ID."
    );
    error.statusCode = 400;
    throw error;
  }

  const rolePermission = await RolePermission.findById(
    rolePermissionId
  );

  if (!rolePermission) {
    const error = new Error(
      "Role permission assignment not found."
    );
    error.statusCode = 404;
    throw error;
  }

  const hierarchyLevel =
    data.hierarchyLevel ||
    rolePermission.hierarchyLevel;

  const permissionId =
    data.permission ||
    rolePermission.permission;

  if (data.permission) {
    const permission = await Permission.findById(
      data.permission
    );

    if (!permission) {
      const error = new Error(
        "Permission not found."
      );
      error.statusCode = 404;
      throw error;
    }

    if (permission.status !== "ACTIVE") {
      const error = new Error(
        "Cannot assign an inactive permission."
      );
      error.statusCode = 400;
      throw error;
    }
  }

  const duplicate = await RolePermission.findOne({
    _id: { $ne: rolePermissionId },
    hierarchyLevel,
    permission: permissionId,
  });

  if (duplicate) {
    const error = new Error(
      "This permission is already assigned to this hierarchy."
    );
    error.statusCode = 409;
    throw error;
  }

  rolePermission.hierarchyLevel = hierarchyLevel;
  rolePermission.permission = permissionId;

  if (data.status !== undefined) {
    rolePermission.status = data.status;
  }

  await rolePermission.save();

  return RolePermission.findById(rolePermission._id)
    .populate(
      "permission",
      "_id resource action description status"
    )
    .populate(
      "assignedBy",
      "_id email"
    );
};

const updateRolePermissionStatus = async (
  rolePermissionId,
  status
) => {
  if (!mongoose.Types.ObjectId.isValid(rolePermissionId)) {
    const error = new Error(
      "Invalid role permission ID."
    );
    error.statusCode = 400;
    throw error;
  }

  const rolePermission = await RolePermission.findById(
    rolePermissionId
  );

  if (!rolePermission) {
    const error = new Error(
      "Role permission assignment not found."
    );
    error.statusCode = 404;
    throw error;
  }

  rolePermission.status = status;

  await rolePermission.save();

  return RolePermission.findById(rolePermission._id)
    .populate(
      "permission",
      "_id resource action description status"
    )
    .populate(
      "assignedBy",
      "_id email"
    );
};

const deleteRolePermission = async (
  rolePermissionId
) => {
  if (!mongoose.Types.ObjectId.isValid(rolePermissionId)) {
    const error = new Error(
      "Invalid role permission ID."
    );
    error.statusCode = 400;
    throw error;
  }

  const rolePermission = await RolePermission.findById(
    rolePermissionId
  );

  if (!rolePermission) {
    const error = new Error(
      "Role permission assignment not found."
    );
    error.statusCode = 404;
    throw error;
  }

  await RolePermission.findByIdAndDelete(
    rolePermissionId
  );

  return true;
};

module.exports = {
  createRolePermission,
  getRolePermissions,
  getRolePermissionById,
  updateRolePermission,
  updateRolePermissionStatus,
  deleteRolePermission,
};