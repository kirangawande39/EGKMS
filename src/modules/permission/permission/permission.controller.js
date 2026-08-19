const permissionService = require("./permission.service");

const createPermission = async (req, res, next) => {
  try {
    const permission = await permissionService.createPermission(
      req.body,
      req.user?._id
    );

    return res.status(201).json({
      success: true,
      message: "Permission created successfully.",
      data: permission,
    });
  } catch (error) {
    next(error);
  }
};

const getPermissions = async (req, res, next) => {
  try {
    const permissions = await permissionService.getPermissions(req.query);

    return res.status(200).json({
      success: true,
      message: "Permissions fetched successfully.",
      data: permissions,
    });
  } catch (error) {
    next(error);
  }
};

const getPermissionById = async (req, res, next) => {
  try {
    const permission = await permissionService.getPermissionById(
      req.params.permissionId
    );

    return res.status(200).json({
      success: true,
      message: "Permission fetched successfully.",
      data: permission,
    });
  } catch (error) {
    next(error);
  }
};

const updatePermission = async (req, res, next) => {
  try {
    const permission = await permissionService.updatePermission(
      req.params.permissionId,
      req.body,
      req.user._id
    );

    return res.status(200).json({
      success: true,
      message: "Permission updated successfully.",
      data: permission,
    });
  } catch (error) {
    next(error);
  }
};

const updatePermissionStatus = async (req, res, next) => {
  try {
    const permission = await permissionService.updatePermissionStatus(
      req.params.permissionId,
      req.body.status,
      req.user._id
    );

    return res.status(200).json({
      success: true,
      message: "Permission status updated successfully.",
      data: permission,
    });
  } catch (error) {
    next(error);
  }
};

const deletePermission = async (req, res, next) => {
  try {
    await permissionService.deletePermission(
      req.params.permissionId
    );

    return res.status(200).json({
      success: true,
      message: "Permission deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
const getPermissionOptions = async (req, res, next) => {
  try {
    const options = await permissionService.getPermissionOptions();

    return res.status(200).json({
      success: true,
      message: "Permission options fetched successfully",
      data: options,
    });
  } catch (error) {
    next(error);
  }
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