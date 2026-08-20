const express = require("express");

const rolePermissionController = require(
  "./rolePermission.controller"
);

const {
  createRolePermissionSchema,
  updateRolePermissionSchema,
  updateRolePermissionStatusSchema,
} = require("./rolePermission.validator");

const { authenticate } = require(
  "../../../middleware/auth.middleware"
);

const authorize = require(
  "../../../middleware/role.middleware"
);

const validate = require(
  "../../../middleware/validate.middleware"
);

const {
  rolePermissionCreateLimiter,
  rolePermissionReadLimiter,
  rolePermissionUpdateLimiter,
  rolePermissionStatusLimiter,
  rolePermissionDeleteLimiter,
} = require("./rolePermission.rateLimiter");

const router = express.Router();


router.post(
  "/",
  authenticate,
  rolePermissionCreateLimiter,
  authorize("SUPER_ADMIN"),
  validate(createRolePermissionSchema),
  rolePermissionController.createRolePermission
);

/*
 * Get All Role Permissions
 */
router.get(
  "/",
  authenticate,
  rolePermissionReadLimiter,
  authorize("SUPER_ADMIN"),
  rolePermissionController.getRolePermissions
);

/*
 * Get Role Permission By ID
 */
router.get(
  "/:rolePermissionId",
  authenticate,
  rolePermissionReadLimiter,
  authorize("SUPER_ADMIN"),
  rolePermissionController.getRolePermissionById
);

/*
 * Update Role Permission
 */
router.patch(
  "/:rolePermissionId",
  authenticate,
  rolePermissionUpdateLimiter,
  authorize("SUPER_ADMIN"),
  validate(updateRolePermissionSchema),
  rolePermissionController.updateRolePermission
);

/*
 * Update Role Permission Status
 */
router.patch(
  "/:rolePermissionId/status",
  authenticate,
  rolePermissionStatusLimiter,
  authorize("SUPER_ADMIN"),
  validate(updateRolePermissionStatusSchema),
  rolePermissionController.updateRolePermissionStatus
);

/*
 * Delete Role Permission
 */
router.delete(
  "/:rolePermissionId",
  authenticate,
  rolePermissionDeleteLimiter,
  authorize("SUPER_ADMIN"),
  rolePermissionController.deleteRolePermission
);

module.exports = router;