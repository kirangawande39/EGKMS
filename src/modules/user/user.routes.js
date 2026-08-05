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

// Controller
const userController =
  require("./user.controller");


// GET ALL USERS


router.get(
  "/",
  authenticate,
  authorize("SUPER_ADMIN"),
  userController.getUsers
);


// GET USER BY ID


router.get(
  "/:userId",
  authenticate,
  authorize("SUPER_ADMIN"),
  userController.getUserById
);


// UPDATE USER


router.patch(
  "/:userId",
  authenticate,
  authorize("SUPER_ADMIN"),
  validate(updateUserValidator),
  userController.updateUser
);


// UPDATE USER ACCOUNT STATUS


router.patch(
  "/:userId/status",
  authenticate,
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
  authorize("SUPER_ADMIN"),
  validate(resetPasswordValidator),
  userController.resetPassword
);


// ASSIGN REPORTING MANAGER


router.patch(
  "/:userId/reporting-manager",
  authenticate,
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
  authorize("SUPER_ADMIN"),
  userController.deleteUser
);

module.exports = router;