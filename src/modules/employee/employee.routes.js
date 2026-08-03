const router = require("express").Router();


// Middleware
const validate = require("../../middleware/validate.middleware");

const { authenticate } = require('../../middleware/auth.middleware')
const authorize = require('../../middleware/role.middleware')

// Validator
const {
    createEmployeeValidator

} = require("./employee.validator");


// Controller
const employeeController = require("./employee.controller");

router.post(
    "/",
    authenticate,
    authorize("SUPER_ADMIN"),
    validate(createEmployeeValidator),
    employeeController.createEmployee
);

module.exports = router;