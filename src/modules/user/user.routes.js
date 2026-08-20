const router =
  require("express").Router();

// Middleware
const {
  authenticate,
} = require("../../middleware/auth.middleware");

const authorize =
  require("../../middleware/role.middleware");

const validate =
  require("../../middleware/validate.middleware");

// Validators
const {
  updateUserValidator,
  updateUserAccountStatusValidator,
  resetPasswordValidator,
  assignReportingManagerValidator,
} = require("./user.validator");

const {
  userReadLimiter,
  userUpdateLimiter,
  userStatusLimiter,
  userPasswordResetLimiter,
  reportingManagerLimiter,
  userDeleteLimiter,
} = require("./user.rateLimiter");

// Controller
const userController =
  require("./user.controller");


// GET ALL USERS


router.get(
  "/",
  authenticate,
  userReadLimiter,
  authorize("SUPER_ADMIN"),
  userController.getUsers
);


// GET USER BY ID


router.get(
  "/:userId",
  authenticate,
  userReadLimiter,
  authorize("SUPER_ADMIN"),
  userController.getUserById
);


// UPDATE USER


router.patch(
  "/:userId",
  authenticate,
  userUpdateLimiter,
  authorize("SUPER_ADMIN"),
  validate(updateUserValidator),
  userController.updateUser
);


// UPDATE USER ACCOUNT STATUS


router.patch(
  "/:userId/status",
  authenticate,
  userStatusLimiter,
  authorize("SUPER_ADMIN"),
  validate(
    updateUserAccountStatusValidator
  ),
  userController.updateUserAccountStatus
);


// RESET PASSWORD


router.post(
  "/:userId/reset-password",
  authenticate,
  userPasswordResetLimiter,
  authorize("SUPER_ADMIN"),
  validate(resetPasswordValidator),
  userController.resetPassword
);


// ASSIGN REPORTING MANAGER


router.patch(
  "/:userId/reporting-manager",
  authenticate,
  reportingManagerLimiter,
  authorize("SUPER_ADMIN"),
  validate(
    assignReportingManagerValidator
  ),
  userController.assignReportingManager
);


// DELETE USER


router.delete(
  "/:userId",
  authenticate,
   userDeleteLimiter,
  authorize("SUPER_ADMIN"),
  userController.deleteUser
);

module.exports = router;