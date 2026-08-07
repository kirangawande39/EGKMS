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


// CREATE DEPARTMENT
router.post(
  "/",
  authenticate,
  authorize("SUPER_ADMIN", "EXECUTIVE"),
  validate(createDepartmentValidator),
  departmentController.createDepartment
);


// GET ALL DEPARTMENTS
router.get(
  "/",
  authenticate,
  authorize("SUPER_ADMIN", "EXECUTIVE"),
  departmentController.getDepartments
);

// GET DEPARTMENT BY ID
router.get(
  "/:departmentId",
  authenticate,
  authorize("SUPER_ADMIN", "EXECUTIVE"),
  departmentController.getDepartmentById
);

// UPDATE DEPARTMENT
router.patch(
  "/:departmentId",
  authenticate,
  authorize("SUPER_ADMIN", "EXECUTIVE"),
  validate(updateDepartmentValidator),
  departmentController.updateDepartment
);

// UPDATE DEPARTMENT STATUS
router.patch(
  "/:departmentId/status",
  authenticate,
  authorize("SUPER_ADMIN", "EXECUTIVE"),
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
  authorize("SUPER_ADMIN", "EXECUTIVE"),
  departmentController.deleteDepartment
);


module.exports = router;