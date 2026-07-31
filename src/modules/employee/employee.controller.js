const employeeService = require("./employee.service");


const createEmployee = async (req, res, next) => {

    try {

        const employee = await employeeService.createEmployee(
            req.body
        );


        return res.status(201).json({

            success: true,

            message: "Employee created successfully",

            data: employee

        });


    }
    catch(error){

        next(error);

    }

};


module.exports = {

    createEmployee

};