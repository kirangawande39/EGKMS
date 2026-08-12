const mongoose = require("mongoose");

const ACL = require("./acl.model");
const Permission = require("../permission/permission.model");
const Department = require("../../department/department.model");
const Team = require("../../team/team.model");
const Employee = require("../../employee/employee.model");

const validateReferences = async (data) => {
  const permission = await Permission.findById(
    data.permission
  );

  if (!permission) {
    const error = new Error("Permission not found.");
    error.statusCode = 404;
    throw error;
  }

  if (permission.status !== "ACTIVE") {
    const error = new Error(
      "Cannot create ACL for an inactive permission."
    );
    error.statusCode = 400;
    throw error;
  }

  if (data.department) {
    const department = await Department.findById(
      data.department
    );

    if (!department) {
      const error = new Error(
        "Department not found."
      );
      error.statusCode = 404;
      throw error;
    }
  }

  if (data.team) {
    const team = await Team.findById(data.team);

    if (!team) {
      const error = new Error("Team not found.");
      error.statusCode = 404;
      throw error;
    }

    if (
      data.department &&
      team.department &&
      team.department.toString() !==
        data.department.toString()
    ) {
      const error = new Error(
        "Team does not belong to the selected department."
      );
      error.statusCode = 400;
      throw error;
    }
  }

  if (data.employee) {
    const employee = await Employee.findById(
      data.employee
    );

    if (!employee) {
      const error = new Error(
        "Employee not found."
      );
      error.statusCode = 404;
      throw error;
    }

    if (
      data.department &&
      employee.department &&
      employee.department.toString() !==
        data.department.toString()
    ) {
      const error = new Error(
        "Employee does not belong to the selected department."
      );
      error.statusCode = 400;
      throw error;
    }

    if (
      data.team &&
      employee.team &&
      employee.team.toString() !==
        data.team.toString()
    ) {
      const error = new Error(
        "Employee does not belong to the selected team."
      );
      error.statusCode = 400;
      throw error;
    }
  }
};

const createACL = async (data, userId) => {
  await validateReferences(data);

  const existingACL = await ACL.findOne({
    hierarchyLevel: data.hierarchyLevel,
    permission: data.permission,
    department: data.department || null,
    team: data.team || null,
    employee: data.employee || null,
  });

  if (existingACL) {
    const error = new Error(
      "This ACL rule already exists."
    );
    error.statusCode = 409;
    throw error;
  }

  const acl = await ACL.create({
    hierarchyLevel: data.hierarchyLevel,
    permission: data.permission,
    department: data.department || null,
    team: data.team || null,
    employee: data.employee || null,
    effect: data.effect,
    status: data.status || "ACTIVE",
    createdBy: userId,
  });

  return ACL.findById(acl._id)
    .populate(
      "permission",
      "_id resource action description status"
    )
    .populate(
      "department",
      "_id name code status"
    )
    .populate(
      "team",
      "_id name status"
    )
    .populate(
      "employee",
      "_id employeeId firstName lastName email hierarchyLevel status"
    )
    .populate(
      "createdBy",
      "_id email"
    );
};

const getACLs = async (filters = {}) => {
  const query = {};

  if (filters.hierarchyLevel) {
    query.hierarchyLevel =
      filters.hierarchyLevel;
  }

  if (filters.effect) {
    query.effect = filters.effect;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.permission) {
    query.permission = filters.permission;
  }

  if (filters.department) {
    query.department = filters.department;
  }

  if (filters.team) {
    query.team = filters.team;
  }

  if (filters.employee) {
    query.employee = filters.employee;
  }

  return ACL.find(query)
    .populate(
      "permission",
      "_id resource action description status"
    )
    .populate(
      "department",
      "_id name code status"
    )
    .populate(
      "team",
      "_id name status"
    )
    .populate(
      "employee",
      "_id employeeId firstName lastName email hierarchyLevel status"
    )
    .populate(
      "createdBy",
      "_id email"
    )
    .sort({
      createdAt: -1,
    });
};

const getACLById = async (aclId) => {
  if (!mongoose.Types.ObjectId.isValid(aclId)) {
    const error = new Error(
      "Invalid ACL ID."
    );
    error.statusCode = 400;
    throw error;
  }

  const acl = await ACL.findById(aclId)
    .populate(
      "permission",
      "_id resource action description status"
    )
    .populate(
      "department",
      "_id name code status"
    )
    .populate(
      "team",
      "_id name status"
    )
    .populate(
      "employee",
      "_id employeeId firstName lastName email hierarchyLevel status"
    )
    .populate(
      "createdBy",
      "_id email"
    );

  if (!acl) {
    const error = new Error(
      "ACL rule not found."
    );
    error.statusCode = 404;
    throw error;
  }

  return acl;
};

const updateACL = async (aclId, data) => {
  if (!mongoose.Types.ObjectId.isValid(aclId)) {
    const error = new Error(
      "Invalid ACL ID."
    );
    error.statusCode = 400;
    throw error;
  }

  const acl = await ACL.findById(aclId);

  if (!acl) {
    const error = new Error(
      "ACL rule not found."
    );
    error.statusCode = 404;
    throw error;
  }

  const updatedData = {
    hierarchyLevel:
      data.hierarchyLevel ??
      acl.hierarchyLevel,

    permission:
      data.permission ??
      acl.permission,

    department:
      data.department !== undefined
        ? data.department
        : acl.department,

    team:
      data.team !== undefined
        ? data.team
        : acl.team,

    employee:
      data.employee !== undefined
        ? data.employee
        : acl.employee,

    effect:
      data.effect ??
      acl.effect,

    status:
      data.status ??
      acl.status,
  };

  await validateReferences(updatedData);

  const duplicate = await ACL.findOne({
    _id: { $ne: aclId },
    hierarchyLevel:
      updatedData.hierarchyLevel,
    permission:
      updatedData.permission,
    department:
      updatedData.department || null,
    team:
      updatedData.team || null,
    employee:
      updatedData.employee || null,
  });

  if (duplicate) {
    const error = new Error(
      "This ACL rule already exists."
    );
    error.statusCode = 409;
    throw error;
  }

  Object.assign(acl, updatedData);

  await acl.save();

  return getACLById(acl._id);
};

const updateACLStatus = async (
  aclId,
  status
) => {
  if (!mongoose.Types.ObjectId.isValid(aclId)) {
    const error = new Error(
      "Invalid ACL ID."
    );
    error.statusCode = 400;
    throw error;
  }

  const acl = await ACL.findById(aclId);

  if (!acl) {
    const error = new Error(
      "ACL rule not found."
    );
    error.statusCode = 404;
    throw error;
  }

  acl.status = status;

  await acl.save();

  return getACLById(acl._id);
};

const deleteACL = async (aclId) => {
  if (!mongoose.Types.ObjectId.isValid(aclId)) {
    const error = new Error(
      "Invalid ACL ID."
    );
    error.statusCode = 400;
    throw error;
  }

  const acl = await ACL.findById(aclId);

  if (!acl) {
    const error = new Error(
      "ACL rule not found."
    );
    error.statusCode = 404;
    throw error;
  }

  await ACL.findByIdAndDelete(aclId);

  return true;
};

module.exports = {
  createACL,
  getACLs,
  getACLById,
  updateACL,
  updateACLStatus,
  deleteACL,
};