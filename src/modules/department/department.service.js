const mongoose = require("mongoose");

const Department = require("./department.model");
const Employee = require("../employee/employee.model");


// CREATE DEPARTMENT
const createDepartment = async (data, userId) => {
  const { name, code, head = null } = data;

  // Check duplicate department name
  const existingName = await Department.findOne({
    name: name.trim(),
  });

  if (existingName) {
    const error = new Error("Department name already exists.");
    error.statusCode = 409;
    throw error;
  }

  // Check duplicate department code
  const existingCode = await Department.findOne({
    code: code.toUpperCase(),
  });

  if (existingCode) {
    const error = new Error("Department code already exists.");
    error.statusCode = 409;
    throw error;
  }

  // Validate Department Head if provided
  if (head) {
    if (!mongoose.Types.ObjectId.isValid(head)) {
      const error = new Error("Invalid Department Head ID.");
      error.statusCode = 400;
      throw error;
    }

    const employee = await Employee.findById(head);

    if (!employee) {
      const error = new Error("Department Head not found.");
      error.statusCode = 404;
      throw error;
    }

    if (employee.status !== "ACTIVE") {
      const error = new Error(
        "Department Head must be an active employee."
      );
      error.statusCode = 400;
      throw error;
    }
  }

  const department = await Department.create({
    name: name.trim(),
    code: code.toUpperCase(),
    head: head || null,
    createdBy: userId || null,
  });

  return department;
};


// GET ALL DEPARTMENTS
const getDepartments = async (filters = {}) => {
  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }

  const departments = await Department.find(query)
    .populate(
      "head",
      "employeeId firstName lastName email hierarchyLevel status"
    )
    .sort({
      createdAt: -1,
    });

  return departments;
};


// GET DEPARTMENT BY ID
const getDepartmentById = async (departmentId) => {
  if (!mongoose.Types.ObjectId.isValid(departmentId)) {
    const error = new Error("Invalid Department ID.");
    error.statusCode = 400;
    throw error;
  }

  const department = await Department.findById(departmentId)
    .populate(
      "head",
      "employeeId firstName lastName email hierarchyLevel status"
    );

  if (!department) {
    const error = new Error("Department not found.");
    error.statusCode = 404;
    throw error;
  }

  return department;
};


// UPDATE DEPARTMENT
const updateDepartment = async (departmentId, data) => {
  if (!mongoose.Types.ObjectId.isValid(departmentId)) {
    const error = new Error("Invalid Department ID.");
    error.statusCode = 400;
    throw error;
  }

  const department = await Department.findById(departmentId);

  if (!department) {
    const error = new Error("Department not found.");
    error.statusCode = 404;
    throw error;
  }

  // Check duplicate name
  if (data.name) {
    const existingName = await Department.findOne({
      name: data.name.trim(),
      _id: { $ne: departmentId },
    });

    if (existingName) {
      const error = new Error("Department name already exists.");
      error.statusCode = 409;
      throw error;
    }

    department.name = data.name.trim();
  }

  // Check duplicate code
  if (data.code) {
    const existingCode = await Department.findOne({
      code: data.code.toUpperCase(),
      _id: { $ne: departmentId },
    });

    if (existingCode) {
      const error = new Error("Department code already exists.");
      error.statusCode = 409;
      throw error;
    }

    department.code = data.code.toUpperCase();
  }

  // Update Department Head
  if (data.head !== undefined) {
    if (data.head === null) {
      department.head = null;
    } else {
      if (!mongoose.Types.ObjectId.isValid(data.head)) {
        const error = new Error("Invalid Department Head ID.");
        error.statusCode = 400;
        throw error;
      }

      const employee = await Employee.findById(data.head);

      if (!employee) {
        const error = new Error("Department Head not found.");
        error.statusCode = 404;
        throw error;
      }

      if (employee.status !== "ACTIVE") {
        const error = new Error(
          "Department Head must be an active employee."
        );
        error.statusCode = 400;
        throw error;
      }

      department.head = data.head;
    }
  }

  // Update status
  if (data.status) {
    department.status = data.status;
  }

  await department.save();

  return Department.findById(department._id).populate(
    "head",
    "employeeId firstName lastName email hierarchyLevel status"
  );
};


// UPDATE DEPARTMENT STATUS
const updateDepartmentStatus = async (departmentId, status) => {
  if (!mongoose.Types.ObjectId.isValid(departmentId)) {
    const error = new Error("Invalid Department ID.");
    error.statusCode = 400;
    throw error;
  }

  const department = await Department.findById(departmentId);

  if (!department) {
    const error = new Error("Department not found.");
    error.statusCode = 404;
    throw error;
  }

  department.status = status;

  await department.save();

  return department;
};


// DELETE DEPARTMENT
const deleteDepartment = async (departmentId) => {
  if (!mongoose.Types.ObjectId.isValid(departmentId)) {
    const error = new Error("Invalid Department ID.");
    error.statusCode = 400;
    throw error;
  }

  const department = await Department.findById(departmentId);

  if (!department) {
    const error = new Error("Department not found.");
    error.statusCode = 404;
    throw error;
  }

  // Check if employees are using this department
  const employeeUsingDepartment = await Employee.exists({
    department: departmentId,
  });

  if (employeeUsingDepartment) {
    const error = new Error(
      "Department cannot be deleted because employees are assigned to it."
    );
    error.statusCode = 409;
    throw error;
  }

  await Department.findByIdAndDelete(departmentId);

  return true;
};


module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  updateDepartmentStatus,
  deleteDepartment,
};