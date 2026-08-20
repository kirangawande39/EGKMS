const router = require("express").Router();

const validate = require("../../middleware/validate.middleware");
const { authenticate } = require("../../middleware/auth.middleware");
const accessControl = require("../permission/accessControl/accessControl.middleware");
const {
    createEmployeeValidator
} = require("./employee.validator");
const employeeController = require("./employee.controller");
const {
    employeeCreateLimiter,
    employeeReadLimiter,
    employeeUpdateLimiter,
    employeeStatusLimiter,
    employeeDeleteLimiter,
} = require("./employee.rateLimiter");


// CREATE EMPLOYEE
router.post(
    "/",
    authenticate,
    employeeCreateLimiter,
    accessControl("EMPLOYEE", "CREATE"),
    validate(createEmployeeValidator),
    employeeController.createEmployee
);

// GET ALL EMPLOYEES
router.get(
    "/",
    authenticate,
    employeeReadLimiter,
    accessControl("EMPLOYEE", "VIEW"),
    employeeController.getEmployees
);

// GET EMPLOYEE BY EMAIL
router.get(
    "/email/:email",
    authenticate,
    employeeReadLimiter,
    accessControl("EMPLOYEE", "VIEW"),
    employeeController.getEmployeeByEmail
);

// GET EMPLOYEE BY ID
router.get(
    "/:employeeId",
    authenticate,
    employeeReadLimiter,
    accessControl("EMPLOYEE", "VIEW"),
    employeeController.getEmployeeById
);

// UPDATE EMPLOYEE
router.patch(
    "/:employeeId",
    authenticate,
    employeeUpdateLimiter,
    accessControl("EMPLOYEE", "EDIT"),
    employeeController.updateEmployee
);

// UPDATE EMPLOYEE STATUS
router.patch(
    "/:employeeId/status",
    authenticate,
    employeeStatusLimiter,
    accessControl("EMPLOYEE", "EDIT"),
    employeeController.updateEmployeeStatus
);

// DELETE EMPLOYEE
router.delete(
    "/:employeeId",
    authenticate,
    employeeDeleteLimiter,
    accessControl("EMPLOYEE", "DELETE"),
    employeeController.deleteEmployee
);


module.exports = router;