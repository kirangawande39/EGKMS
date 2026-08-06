const employeeService = require("./employee.service");

// CREATE EMPLOYEE

const createEmployee = async (req, res, next) => {
  try {
    const employee =
      await employeeService.createEmployee(
        req.body,
        req.user?._id || null
      );

    return res.status(201).json({
      success: true,
      message: "Employee created successfully.",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};


// GET ALL EMPLOYEES

const getEmployees = async (req, res, next) => {
  try {
    const {
      hierarchyLevel,
      department,
      team,
      status,
    } = req.query;

    const employees =
      await employeeService.getEmployees({
        hierarchyLevel,
        department,
        team,
        status,
      });

    return res.status(200).json({
      success: true,
      message: "Employees fetched successfully.",
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};


// GET EMPLOYEE BY ID

const getEmployeeById = async (req, res, next) => {
  try {
    const employee =
      await employeeService.getEmployeeById(
        req.params.employeeId
      );

    return res.status(200).json({
      success: true,
      message: "Employee fetched successfully.",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};


// GET EMPLOYEE BY EMAIL

const getEmployeeByEmail = async (req, res, next) => {
  try {
    const employee =
      await employeeService.getEmployeeByEmail(
        req.params.email
      );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee fetched successfully.",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};


// UPDATE EMPLOYEE

const updateEmployee = async (req, res, next) => {
  try {
    const employee =
      await employeeService.updateEmployee(
        req.params.employeeId,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully.",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};


// UPDATE EMPLOYEE STATUS

const updateEmployeeStatus = async (req, res, next) => {
  try {
    const employee =
      await employeeService.updateEmployeeStatus(
        req.params.employeeId,
        req.body.status
      );

    return res.status(200).json({
      success: true,
      message: "Employee status updated successfully.",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};


// DELETE EMPLOYEE

const deleteEmployee = async (req, res, next) => {
  try {
    const result =
      await employeeService.deleteEmployee(
        req.params.employeeId
      );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};


// EXPORTS

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  getEmployeeByEmail,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee,
};