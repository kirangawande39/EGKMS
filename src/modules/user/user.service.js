const bcrypt = require("bcrypt");

const User = require("../auth/auth.model");
const Employee = require("../employee/employee.model");

const ApiError = require("../../utils/ApiError");

const { createAuditLog } = require("../audit/audit.service")

// SAFE USER FIELDS

const safeUserSelect =
  "_id employeeId email accountStatus isEmailVerified failedLoginAttempts lockUntil passwordChangedAt lastLogin createdAt updatedAt";

// GET ALL USERS

const getUsers = async () => {
  const users = await User.find()
    .select(safeUserSelect)
    .populate(
      "employeeId",
      "employeeId firstName lastName email hierarchyLevel department team reportingManager status isRegistered"
    )
    .sort({
      createdAt: -1,
    });

  return users;
};

// GET USER BY ID

const getUserById = async (userId) => {
  const user = await User.findById(userId)
    .select(safeUserSelect)
    .populate(
      "employeeId",
      "employeeId firstName lastName email hierarchyLevel department team reportingManager status isRegistered"
    );

  if (!user) {
    throw new ApiError(
      404,
      "User not found."
    );
  }

  return user;
};

// UPDATE USER

const updateUser = async (
  userId,
  updateData,
  actorId
) => {
  const user =
    await User.findById(userId);

  if (!user) {
    throw new ApiError(
      404,
      "User not found."
    );
  }

  const changes = {};

  // Email update
  if (updateData.email) {
    const normalizedEmail =
      updateData.email
        .toLowerCase()
        .trim();

    const emailExists =
      await User.findOne({
        email: normalizedEmail,
        _id: {
          $ne: userId,
        },
      });

    if (emailExists) {
      throw new ApiError(
        409,
        "User email already exists."
      );
    }

    const oldEmail = user.email;

    user.email = normalizedEmail;

    if (oldEmail !== normalizedEmail) {
      changes.email = {
        from: oldEmail,
        to: normalizedEmail,
      };
    }
  }

  // Account status can also be updated
  if (updateData.accountStatus) {
    const oldStatus =
      user.accountStatus;

    user.accountStatus =
      updateData.accountStatus;

    if (
      oldStatus !==
      updateData.accountStatus
    ) {
      changes.accountStatus = {
        from: oldStatus,
        to: updateData.accountStatus,
      };
    }
  }

  await user.save();

  // Audit important user changes
  if (Object.keys(changes).length > 0) {
    await createAuditLog({
      module: "USER",
      action: "USER_CHANGED",
      actor: actorId,
      targetId: user._id,
      targetType: "User",
      description:
        "User information was changed.",
      metadata: {
        changes,
      },
    });
  }

  return User.findById(userId)
    .select(safeUserSelect)
    .populate(
      "employeeId",
      "employeeId firstName lastName email hierarchyLevel department team reportingManager status isRegistered"
    );
};

// UPDATE USER ACCOUNT STATUS

const updateUserAccountStatus = async (
  userId,
  accountStatus,
  actorId
) => {
  const user =
    await User.findById(userId);

  if (!user) {
    throw new ApiError(
      404,
      "User not found."
    );
  }

  const oldStatus =
    user.accountStatus;

  user.accountStatus =
    accountStatus;

  // If account is activated,
  // remove account lock.
  if (accountStatus === "ACTIVE") {
    user.lockUntil = null;
    user.failedLoginAttempts = 0;
  }

  await user.save();

  if (oldStatus !== accountStatus) {
    await createAuditLog({
      module: "USER",
      action: "USER_CHANGED",
      actor: actorId,
      targetId: user._id,
      targetType: "User",
      description:
        "User account status changed.",
      metadata: {
        field: "accountStatus",
        from: oldStatus,
        to: accountStatus,
      },
    });
  }

  return User.findById(userId)
    .select(safeUserSelect)
    .populate(
      "employeeId",
      "employeeId firstName lastName email hierarchyLevel department team reportingManager status isRegistered"
    );
};

// RESET PASSWORD

const resetPassword = async (
  userId,
  newPassword,
  actorId
) => {
  const user =
    await User.findById(userId)
      .select("+password");

  if (!user) {
    throw new ApiError(
      404,
      "User not found."
    );
  }

  const hashedPassword =
    await bcrypt.hash(
      newPassword,
      10
    );

  user.password =
    hashedPassword;

  user.passwordChangedAt =
    new Date();

  // Clear login lock after password reset
  user.failedLoginAttempts = 0;
  user.lockUntil = null;

  // Existing refresh token becomes invalid
  user.refreshTokenHash = null;

  await user.save();

  await createAuditLog({
    module: "USER",
    action: "USER_CHANGED",
    actor: actorId,
    targetId: user._id,
    targetType: "User",
    description:
      "User password was reset.",
    metadata: {
      change: "PASSWORD_RESET",
    },
  });

  return User.findById(userId)
    .select(safeUserSelect)
    .populate(
      "employeeId",
      "employeeId firstName lastName email hierarchyLevel department team reportingManager status isRegistered"
    );
};

// ASSIGN REPORTING MANAGER

const assignReportingManager = async (
  userId,
  reportingManager,
  actorId
) => {
  const user =
    await User.findById(userId);

  if (!user) {
    throw new ApiError(
      404,
      "User not found."
    );
  }

  const employee =
    await Employee.findById(
      user.employeeId?._id || user.employeeId
    );

  if (!employee) {
    throw new ApiError(
      404,
      "Employee linked to user not found."
    );
  }

  const oldReportingManager =
    employee.reportingManager;

  // Null is allowed
  if (
    reportingManager === null ||
    reportingManager === undefined
  ) {
    employee.reportingManager =
      null;

    await employee.save();

    await createAuditLog({
      module: "USER",
      action: "USER_CHANGED",
      actor: actorId,
      targetId: user._id,
      targetType: "User",
      description:
        "Reporting manager was removed from user.",
      metadata: {
        field: "reportingManager",
        from:
          oldReportingManager || null,
        to: null,
      },
    });

    return User.findById(userId)
      .select(safeUserSelect)
      .populate(
        "employeeId",
        "employeeId firstName lastName email hierarchyLevel department team reportingManager status isRegistered"
      );
  }

  // Prevent self reporting
  if (
    reportingManager.toString() ===
    employee._id.toString()
  ) {
    throw new ApiError(
      400,
      "Employee cannot report to themselves."
    );
  }

  const manager =
    await Employee.findById(
      reportingManager
    );

  if (!manager) {
    throw new ApiError(
      404,
      "Reporting manager not found."
    );
  }

  employee.reportingManager =
    reportingManager;

  await employee.save();

  await createAuditLog({
    module: "USER",
    action: "USER_CHANGED",
    actor: actorId,
    targetId: user._id,
    targetType: "User",
    description:
      "Reporting manager was changed.",
    metadata: {
      field: "reportingManager",
      from:
        oldReportingManager || null,
      to: reportingManager,
    },
  });

  return User.findById(userId)
    .select(safeUserSelect)
    .populate(
      "employeeId",
      "employeeId firstName lastName email hierarchyLevel team department reportingManager status isRegistered"
    );
};

// DELETE USER

const deleteUser = async (
  userId,
  actorId
) => {
  const user =
    await User.findById(userId);

  if (!user) {
    throw new ApiError(
      404,
      "User not found."
    );
  }

  await user.deleteOne();

  await createAuditLog({
    module: "USER",
    action: "USER_CHANGED",
    actor: actorId,
    targetId: user._id,
    targetType: "User",
    description:
      "User was removed.",
    metadata: {
      change: "USER_DELETED",
      email: user.email,
    },
  });

  return {
    message:
      "User removed successfully.",
  };
};

// EXPORTS

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  updateUserAccountStatus,
  resetPassword,
  assignReportingManager,
  deleteUser,
};