const express = require("express");

const aclController = require(
  "./acl.controller"
);

const {
  createAclSchema,
  updateAclSchema,
  updateAclStatusSchema,
} = require("./acl.validator");

const {
  aclCreateLimiter,
  aclReadLimiter,
  aclUpdateLimiter,
  aclStatusLimiter,
  aclDeleteLimiter,
} = require("./acl.rateLimiter");

const {authenticate} = require(
  "../../../middleware/auth.middleware"
);

const authorize = require(
  "../../../middleware/role.middleware"
);

const validate = require(
  "../../../middleware/validate.middleware"
);

const router = express.Router();

/*
 * Create ACL
 */
router.post(
  "/",
  authenticate,
  aclCreateLimiter,
  authorize("SUPER_ADMIN"),
  validate(createAclSchema),
  aclController.createACL
);

/*
 * Get All ACL Rules
 */
router.get(
  "/",
  authenticate,
  aclReadLimiter,
  authorize("SUPER_ADMIN"),
  aclController.getACLs
);

/*
 * Get ACL By ID
 */
router.get(
  "/:aclId",
  authenticate,
  aclReadLimiter,
  authorize("SUPER_ADMIN"),
  aclController.getACLById
);

/*
 * Update ACL
 */
router.patch(
  "/:aclId",
  authenticate,
  aclUpdateLimiter,
  authorize("SUPER_ADMIN"),
  validate(updateAclSchema),
  aclController.updateACL
);

/*
 * Update ACL Status
 */
router.patch(
  "/:aclId/status",
  authenticate,
  aclStatusLimiter,
  authorize("SUPER_ADMIN"),
  validate(updateAclStatusSchema),
  aclController.updateACLStatus
);

/*
 * Delete ACL
 */
router.delete(
  "/:aclId",
  authenticate,
  aclDeleteLimiter,
  authorize("SUPER_ADMIN"),
  aclController.deleteACL
);

module.exports = router;