const express = require("express");

const permissionController = require("./permission.controller");

const {
    createPermissionSchema,
    updatePermissionSchema,
    updatePermissionStatusSchema,
} = require("./permission.validator");

const { authenticate } = require("../../../middleware/auth.middleware");
const authorize = require("../../../middleware/role.middleware");
const validate = require("../../../middleware/validate.middleware");
const {
  permissionCreateLimiter,
  permissionReadLimiter,
  permissionUpdateLimiter,
  permissionStatusLimiter,
  permissionDeleteLimiter,
} = require("./permission.rateLimiter");

const router = express.Router();

/*
* Create Permission
* FRS: Permission configuration is a Super Admin responsibility.
*/

router.post(
  "/",
  authenticate,
  permissionCreateLimiter,
  authorize("SUPER_ADMIN"),
  validate(createPermissionSchema),
  permissionController.createPermission
);

/*
 * Get All Permissions
 */
router.get(
  "/",
  authenticate,
  permissionReadLimiter,
  authorize("SUPER_ADMIN"),
  permissionController.getPermissions
);

router.get(
  "/options",
  authenticate,
  permissionReadLimiter,
  authorize("SUPER_ADMIN"),
  permissionController.getPermissionOptions
);
/*
 * Get Permission By ID
 */
router.get(
  "/:permissionId",
  authenticate,
  permissionReadLimiter,
  authorize("SUPER_ADMIN"),
  permissionController.getPermissionById
);

/*
 * Update Permission
 */
router.patch(
  "/:permissionId",
  authenticate,
  permissionUpdateLimiter,
  authorize("SUPER_ADMIN"),
  validate(updatePermissionSchema),
  permissionController.updatePermission
);

/*
 * Update Permission Status
 */
router.patch(
  "/:permissionId/status",
  authenticate,
  permissionStatusLimiter,
  authorize("SUPER_ADMIN"),
  validate(updatePermissionStatusSchema),
  permissionController.updatePermissionStatus
);

/*
 * Delete Permission
 */
router.delete(
  "/:permissionId",
  authenticate,
  permissionDeleteLimiter,
  authorize("SUPER_ADMIN"),
  permissionController.deletePermission
);

module.exports = router;