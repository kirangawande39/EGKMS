const mongoose = require("mongoose");
const Permission = require("./permission.model");
const {
  PERMISSION_RESOURCES,
  PERMISSION_ACTIONS,
} = require("../permission.constants");

const createPermission = async (data, userId) => {
  const resource = data.resource.trim().toUpperCase();

  const existingPermission = await Permission.findOne({
    resource,
    action: data.action,
  });

  if (existingPermission) {
    const error = new Error(
      "Permission already exists for this resource and action."
    );
    error.statusCode = 409;
    throw error;
  }

  const permission = await Permission.create({
    resource,
    action: data.action,
    description: data.description || null,
    status: data.status || "ACTIVE",
    createdBy: userId || null,
  });

  return permission;
};

const getPermissions = async (filters = {}) => {
  const query = {};

  if (filters.resource) {
    query.resource = filters.resource.trim().toUpperCase();
  }

  if (filters.action) {
    query.action = filters.action;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  return Permission.find(query)
    .populate("createdBy", "_id email")
    .sort({ resource: 1, action: 1 });
};

const getPermissionById = async (permissionId) => {
  if (!mongoose.Types.ObjectId.isValid(permissionId)) {
    const error = new Error("Invalid permission ID.");
    error.statusCode = 400;
    throw error;
  }

  const permission = await Permission.findById(permissionId)
    .populate("createdBy", "_id email");

  if (!permission) {
    const error = new Error("Permission not found.");
    error.statusCode = 404;
    throw error;
  }

  return permission;
};

const updatePermission = async (permissionId, data) => {
  if (!mongoose.Types.ObjectId.isValid(permissionId)) {
    const error = new Error("Invalid permission ID.");
    error.statusCode = 400;
    throw error;
  }

  const permission = await Permission.findById(permissionId);

  if (!permission) {
    const error = new Error("Permission not found.");
    error.statusCode = 404;
    throw error;
  }

  const resource = data.resource
    ? data.resource.trim().toUpperCase()
    : permission.resource;

  const action = data.action || permission.action;

  const duplicate = await Permission.findOne({
    _id: { $ne: permissionId },
    resource,
    action,
  });

  if (duplicate) {
    const error = new Error(
      "Permission already exists for this resource and action."
    );
    error.statusCode = 409;
    throw error;
  }

  if (data.resource !== undefined) {
    permission.resource = resource;
  }

  if (data.action !== undefined) {
    permission.action = data.action;
  }

  if (data.description !== undefined) {
    permission.description = data.description;
  }

  if (data.status !== undefined) {
    permission.status = data.status;
  }

  await permission.save();

  return Permission.findById(permission._id)
    .populate("createdBy", "_id email");
};

const updatePermissionStatus = async (permissionId, status) => {
  if (!mongoose.Types.ObjectId.isValid(permissionId)) {
    const error = new Error("Invalid permission ID.");
    error.statusCode = 400;
    throw error;
  }

  const permission = await Permission.findById(permissionId);

  if (!permission) {
    const error = new Error("Permission not found.");
    error.statusCode = 404;
    throw error;
  }

  permission.status = status;

  await permission.save();

  return permission;
};

const deletePermission = async (permissionId) => {
  if (!mongoose.Types.ObjectId.isValid(permissionId)) {
    const error = new Error("Invalid permission ID.");
    error.statusCode = 400;
    throw error;
  }

  const permission = await Permission.findById(permissionId);

  if (!permission) {
    const error = new Error("Permission not found.");
    error.statusCode = 404;
    throw error;
  }

  await Permission.findByIdAndDelete(permissionId);

  return true;
};

const getPermissionOptions = async () => {
  return {
    resources: PERMISSION_RESOURCES,
    actions: PERMISSION_ACTIONS,
  };
};




module.exports = {
  createPermission,
  getPermissions,
  getPermissionById,
  updatePermission,
  updatePermissionStatus,
  deletePermission,
  getPermissionOptions,
};