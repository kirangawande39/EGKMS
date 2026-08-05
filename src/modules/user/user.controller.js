const userService = require("./user.service");


// GET ALL USERS


const getUsers = async (
  req,
  res,
  next
) => {
  try {
    const users =
      await userService.getUsers();

    return res.status(200).json({
      success: true,
      message:
        "Users fetched successfully.",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};


// GET USER BY ID


const getUserById = async (
  req,
  res,
  next
) => {
  try {
    const { userId } =
      req.params;

    const user =
      await userService.getUserById(
        userId
      );

    return res.status(200).json({
      success: true,
      message:
        "User fetched successfully.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};


// UPDATE USER


const updateUser = async (
  req,
  res,
  next
) => {
  try {
    const { userId } =
      req.params;

    const user =
      await userService.updateUser(
        userId,
        req.body
      );

    return res.status(200).json({
      success: true,
      message:
        "User updated successfully.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};


// UPDATE USER ACCOUNT STATUS


const updateUserAccountStatus =
  async (
    req,
    res,
    next
  ) => {
    try {
      const { userId } =
        req.params;

      const { accountStatus } =
        req.body;

      const user =
        await userService.updateUserAccountStatus(
          userId,
          accountStatus
        );

      return res.status(200).json({
        success: true,
        message:
          "User account status updated successfully.",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };


// RESET PASSWORD


const resetPassword = async (
  req,
  res,
  next
) => {
  try {
    const { userId } =
      req.params;

    const { newPassword } =
      req.body;

    const user =
      await userService.resetPassword(
        userId,
        newPassword
      );

    return res.status(200).json({
      success: true,
      message:
        "User password reset successfully.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};


// ASSIGN REPORTING MANAGER


const assignReportingManager =
  async (
    req,
    res,
    next
  ) => {
    try {
      const { userId } =
        req.params;

      const {
        reportingManager,
      } = req.body;

      const user =
        await userService.assignReportingManager(
          userId,
          reportingManager
        );

      return res.status(200).json({
        success: true,
        message:
          "Reporting manager assigned successfully.",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };


// DELETE USER


const deleteUser = async (
  req,
  res,
  next
) => {
  try {
    const { userId } =
      req.params;

    const result =
      await userService.deleteUser(
        userId
      );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
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