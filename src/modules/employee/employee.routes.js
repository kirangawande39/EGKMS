const router = require("express").Router();

const validate = require("../../middleware/validate.middleware");
const { authenticate } = require("../../middleware/auth.middleware");
const accessControl = require("../permission/accessControl/accessControl.middleware");
const {
    createEmployeeValidator
} = require("./employee.validator");
const employeeController = require("./employee.controller");


// CREATE EMPLOYEE
router.post(
    "/",
    authenticate,
    accessControl("EMPLOYEE", "CREATE"),
    validate(createEmployeeValidator),
    employeeController.createEmployee
);

// GET ALL EMPLOYEES
router.get(
    "/",
    authenticate,
    accessControl("EMPLOYEE", "VIEW"),
    employeeController.getEmployees
);

// GET EMPLOYEE BY EMAIL
router.get(
    "/email/:email",
    authenticate,
    accessControl("EMPLOYEE", "VIEW"),
    employeeController.getEmployeeByEmail
);

// GET EMPLOYEE BY ID
router.get(
    "/:employeeId",
    authenticate,
    accessControl("EMPLOYEE", "VIEW"),
    employeeController.getEmployeeById
);

// UPDATE EMPLOYEE
router.patch(
    "/:employeeId",
    authenticate,
    accessControl("EMPLOYEE", "EDIT"),
    employeeController.updateEmployee
);

// UPDATE EMPLOYEE STATUS
router.patch(
    "/:employeeId/status",
    authenticate,
    accessControl("EMPLOYEE", "EDIT"),
    employeeController.updateEmployeeStatus
);

// DELETE EMPLOYEE
router.delete(
    "/:employeeId",
    authenticate,
    accessControl("EMPLOYEE", "DELETE"),
    employeeController.deleteEmployee
);


module.exports = router;