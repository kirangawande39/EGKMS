const Employee = require("./employee.model");
const ApiError = require("../../utils/ApiError");


const createEmployee = async (employeeData) => {

    const {
        name,
        email,
        role,
        department

    } = employeeData;

    const existingEmployee = await Employee.findOne({
        email
    });


    if (existingEmployee) {

        throw new ApiError(
            409,
            "Employee already exists with this email"
        );

    }

    const employee = await Employee.create({
        name,
        email,
        role,
        department
    });
    return employee;

};


module.exports = {
    createEmployee
};