const router = require("express").Router();
const validate = require("../../middleware/validate.middleware");
const { authenticate } = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/role.middleware");
const {
    createEmployeeValidator
} = require("./employee.validator");
const employeeController = require("./employee.controller");


// CREATE EMPLOYEE
router.post(
    "/",
    authenticate,
    authorize("SUPER_ADMIN"),
    validate(createEmployeeValidator),
    employeeController.createEmployee
);

// GET ALL EMPLOYEES
router.get(
    "/",
    authenticate,
    authorize("SUPER_ADMIN"),
    employeeController.getEmployees
);

// GET EMPLOYEE BY EMAIL
router.get(
    "/email/:email",
    authenticate,
    authorize("SUPER_ADMIN"),
    employeeController.getEmployeeByEmail
);

// GET EMPLOYEE BY ID
router.get(
    "/:employeeId",
    authenticate,
    authorize("SUPER_ADMIN"),
    employeeController.getEmployeeById
);

// UPDATE EMPLOYEE
router.patch(
    "/:employeeId",
    authenticate,
    authorize("SUPER_ADMIN"),
    employeeController.updateEmployee
);

// UPDATE EMPLOYEE STATUS
router.patch(
    "/:employeeId/status",
    authenticate,
    authorize("SUPER_ADMIN"),
    employeeController.updateEmployeeStatus
);

// DELETE EMPLOYEE
router.delete(
    "/:employeeId",
    authenticate,
    authorize("SUPER_ADMIN"),
    employeeController.deleteEmployee
);


module.exports = router;