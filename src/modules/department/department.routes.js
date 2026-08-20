const router = require("express").Router();


// Middleware
const validate = require("../../middleware/validate.middleware");
const { authenticate } = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/role.middleware");


// Validator
const {
  createDepartmentValidator,
  updateDepartmentValidator,
} = require("./department.validator");


// Controller
const departmentController = require("./department.controller");

const accessControl = require("../permission/accessControl/accessControl.middleware")

const {
  departmentCreateLimiter,
  departmentReadLimiter,
  departmentUpdateLimiter,
  departmentStatusLimiter,
  departmentDeleteLimiter,
} = require("./department.rateLimiter");


// CREATE DEPARTMENT
router.post(
  "/",
  authenticate,
  departmentCreateLimiter,
  accessControl("DEPARTMENT", "CREATE"),
  validate(createDepartmentValidator),
  departmentController.createDepartment
);


// GET ALL DEPARTMENTS
router.get(
  "/",
  authenticate,
    departmentReadLimiter,
  accessControl("DEPARTMENT", "VIEW"),
  departmentController.getDepartments
);

// GET DEPARTMENT BY ID
router.get(
  "/:departmentId",
  authenticate,
    departmentReadLimiter,
  accessControl("DEPARTMENT", "VIEW"),
  departmentController.getDepartmentById
);

// UPDATE DEPARTMENT
router.patch(
  "/:departmentId",
  authenticate,
  departmentUpdateLimiter,
  accessControl("DEPARTMENT", "EDIT"),
  validate(updateDepartmentValidator),
  departmentController.updateDepartment
);

// UPDATE DEPARTMENT STATUS
router.patch(
  "/:departmentId/status",
  authenticate,
  departmentStatusLimiter,
  accessControl("DEPARTMENT", "DELETE"),
  validate(
    require("joi").object({
      status: require("joi")
        .string()
        .valid("ACTIVE", "INACTIVE")
        .required(),
    })
  ),
  departmentController.updateDepartmentStatus
);


// DELETE DEPARTMENT
router.delete(
  "/:departmentId",
  authenticate,
  departmentDeleteLimiter,
  accessControl("DEPARTMENT", "DELETE"),
  departmentController.deleteDepartment
);


module.exports = router;