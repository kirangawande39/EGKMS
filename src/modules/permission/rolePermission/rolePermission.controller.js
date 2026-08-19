const rolePermissionService = require(
  "./rolePermission.service"
);

const createRolePermission = async (
  req,
  res,
  next
) => {
  try {
    const rolePermission =
      await rolePermissionService.createRolePermission(
        req.body,
        req.user?._id
      );

    return res.status(201).json({
      success: true,
      message:
        "Role permission assigned successfully.",
      data: rolePermission,
    });
  } catch (error) {
    next(error);
  }
};

const getRolePermissions = async (
  req,
  res,
  next
) => {
  try {
    const rolePermissions =
      await rolePermissionService.getRolePermissions(
        req.query
      );

    return res.status(200).json({
      success: true,
      message:
        "Role permissions fetched successfully.",
      data: rolePermissions,
    });
  } catch (error) {
    next(error);
  }
};

const getRolePermissionById = async (
  req,
  res,
  next
) => {
  try {
    const rolePermission =
      await rolePermissionService.getRolePermissionById(
        req.params.rolePermissionId
      );

    return res.status(200).json({
      success: true,
      message:
        "Role permission fetched successfully.",
      data: rolePermission,
    });
  } catch (error) {
    next(error);
  }
};

const updateRolePermission = async (
  req,
  res,
  next
) => {
  try {
    const rolePermission =
      await rolePermissionService.updateRolePermission(
        req.params.rolePermissionId,
        req.body,
        req.user._id
      );

    return res.status(200).json({
      success: true,
      message:
        "Role permission updated successfully.",
      data: rolePermission,
    });
  } catch (error) {
    next(error);
  }
};

const updateRolePermissionStatus = async (
  req,
  res,
  next
) => {
  try {
    const rolePermission =
      await rolePermissionService.updateRolePermissionStatus(
        req.params.rolePermissionId,
        req.body.status,
        req.user._id
      );

    return res.status(200).json({
      success: true,
      message:
        "Role permission status updated successfully.",
      data: rolePermission,
    });
  } catch (error) {
    next(error);
  }
};

const deleteRolePermission = async (
  req,
  res,
  next
) => {
  try {
    await rolePermissionService.deleteRolePermission(
      req.params.rolePermissionId
    );

    return res.status(200).json({
      success: true,
      message:
        "Role permission deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRolePermission,
  getRolePermissions,
  getRolePermissionById,
  updateRolePermission,
  updateRolePermissionStatus,
  deleteRolePermission,
};