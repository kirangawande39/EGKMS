const Employee = require("./employee.model");

const ApiError = require("../../utils/ApiError");



// CREATE EMPLOYEE

const createEmployee = async (employeeData, createdBy = null) => {
  const {
    employeeId,
    firstName,
    lastName,
    email,
    hierarchyLevel,
    department,
    team,
    reportingManager,
  } = employeeData;

  const normalizedEmail = email
    .toLowerCase()
    .trim();

  // Check duplicate employee ID
  const existingEmployeeId =
    await Employee.findOne({
      employeeId: employeeId
        .trim()
        .toUpperCase(),
    });

  if (existingEmployeeId) {
    throw new ApiError(
      409,
      "Employee ID already exists."
    );
  }

  // Check duplicate email
  const existingEmail =
    await Employee.findOne({
      email: normalizedEmail,
    });

  if (existingEmail) {
    throw new ApiError(
      409,
      "Employee email already exists."
    );
  }

  // Validate reporting manager
  if (reportingManager) {
    const manager =
      await Employee.findById(
        reportingManager
      );

    if (!manager) {
      throw new ApiError(
        404,
        "Reporting manager not found."
      );
    }
  }

  // Create employee
  const employee =
    await Employee.create({
      employeeId: employeeId
        .trim()
        .toUpperCase(),

      firstName: firstName.trim(),

      lastName: lastName.trim(),

      email: normalizedEmail,

      hierarchyLevel,

      department:
        department || null,

      team:
        team || null,

      reportingManager:
        reportingManager || null,

      status: "ACTIVE",

      isRegistered: false,

      createdBy,
    });

  return employee;
};



// GET EMPLOYEE BY ID

const getEmployeeById = async (
  employeeId
) => {
  const employee =
    await Employee.findById(
      employeeId
    )
      .populate(
        "department",
        "name code status"
      )
      .populate(
        "team",
        "name status"
      )
      .populate(
        "reportingManager",
        "employeeId firstName lastName email hierarchyLevel"
      );

  if (!employee) {
    throw new ApiError(
      404,
      "Employee not found."
    );
  }

  return employee;
};



// GET EMPLOYEE BY EMAIL

const getEmployeeByEmail = async (
  email
) => {
  const normalizedEmail =
    email.toLowerCase().trim();

  const employee =
    await Employee.findOne({
      email: normalizedEmail,
    })
      .populate(
        "department",
        "name code status"
      )
      .populate(
        "team",
        "name status"
      )
      .populate(
        "reportingManager",
        "employeeId firstName lastName email hierarchyLevel"
      );

  return employee;
};



// UPDATE EMPLOYEE


const updateEmployee = async (
  employeeId,
  updateData
) => {
  const employee =
    await Employee.findById(
      employeeId
    );

  if (!employee) {
    throw new ApiError(
      404,
      "Employee not found."
    );
  }

  // Normalize email if provided
  if (updateData.email) {
    updateData.email =
      updateData.email
        .toLowerCase()
        .trim();

    const emailExists =
      await Employee.findOne({
        email: updateData.email,
        _id: {
          $ne: employeeId,
        },
      });

    if (emailExists) {
      throw new ApiError(
        409,
        "Employee email already exists."
      );
    }
  }

  // Normalize employee ID if provided
  if (updateData.employeeId) {
    updateData.employeeId =
      updateData.employeeId
        .trim()
        .toUpperCase();

    const employeeIdExists =
      await Employee.findOne({
        employeeId:
          updateData.employeeId,
        _id: {
          $ne: employeeId,
        },
      });

    if (employeeIdExists) {
      throw new ApiError(
        409,
        "Employee ID already exists."
      );
    }
  }

  // Validate reporting manager
  if (updateData.reportingManager) {
    if (
      updateData.reportingManager.toString() ===
      employeeId.toString()
    ) {
      throw new ApiError(
        400,
        "Employee cannot report to themselves."
      );
    }

    const manager =
      await Employee.findById(
        updateData.reportingManager
      );

    if (!manager) {
      throw new ApiError(
        404,
        "Reporting manager not found."
      );
    }
  }

  // Prevent changing registration state
  // directly through generic update.
  delete updateData.isRegistered;

  Object.assign(
    employee,
    updateData
  );

  await employee.save();

  return employee;
};



// UPDATE EMPLOYEE STATUS


const updateEmployeeStatus = async (
  employeeId,
  status
) => {
  const employee =
    await Employee.findById(
      employeeId
    );

  if (!employee) {
    throw new ApiError(
      404,
      "Employee not found."
    );
  }

  employee.status = status;

  await employee.save();

  return employee;
};



// DELETE EMPLOYEE


const deleteEmployee = async (
  employeeId
) => {
  const employee =
    await Employee.findById(
      employeeId
    );

  if (!employee) {
    throw new ApiError(
      404,
      "Employee not found."
    );
  }

  await employee.deleteOne();

  return {
    message:
      "Employee deleted successfully.",
  };
};



// GET ALL EMPLOYEES


const getEmployees = async (
  filters = {}
) => {
  const query = {};

  if (filters.hierarchyLevel) {
    query.hierarchyLevel =
      filters.hierarchyLevel;
  }

  if (filters.department) {
    query.department =
      filters.department;
  }

  if (filters.team) {
    query.team =
      filters.team;
  }

  if (filters.status) {
    query.status =
      filters.status;
  }

  const employees =
    await Employee.find(query)
      .populate(
        "department",
        "name code status"
      )
      .populate(
        "team",
        "name status"
      )
      .populate(
        "reportingManager",
        "employeeId firstName lastName email hierarchyLevel"
      )
      .sort({
        createdAt: -1,
      });

  return employees;
};



// EXPORTS


module.exports = {
  createEmployee,
  getEmployeeById,
  getEmployeeByEmail,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee,
  getEmployees,
};
