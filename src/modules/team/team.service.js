const mongoose = require("mongoose");

const Team = require("./team.model");
const Department = require("../department/department.model");
const Employee = require("../employee/employee.model");


// CREATE TEAM
const createTeam = async (data, userId) => {
  const {
    name,
    department,
    teamLead = null,
  } = data;

  // Check Department ID
  if (!mongoose.Types.ObjectId.isValid(department)) {
    const error = new Error("Invalid Department ID.");
    error.statusCode = 400;
    throw error;
  }

  // Check Department exists
  const departmentExists = await Department.findById(department);

  if (!departmentExists) {
    const error = new Error("Department not found.");
    error.statusCode = 404;
    throw error;
  }

  // Prevent duplicate Team name in same Department
  const existingTeam = await Team.findOne({
    name: name.trim(),
    department,
  });

  if (existingTeam) {
    const error = new Error(
      "Team name already exists in this department."
    );
    error.statusCode = 409;
    throw error;
  }

  // Validate Team Lead if provided
  if (teamLead) {
    if (!mongoose.Types.ObjectId.isValid(teamLead)) {
      const error = new Error("Invalid Team Lead ID.");
      error.statusCode = 400;
      throw error;
    }

    const employee = await Employee.findById(teamLead);

    if (!employee) {
      const error = new Error("Team Lead not found.");
      error.statusCode = 404;
      throw error;
    }

    if (employee.status !== "ACTIVE") {
      const error = new Error(
        "Team Lead must be an active employee."
      );
      error.statusCode = 400;
      throw error;
    }

    // This matches your existing hierarchy enum.
    if (employee.hierarchyLevel !== "TEAM_LEAD") {
      const error = new Error(
        "Selected employee is not a Team Lead."
      );
      error.statusCode = 400;
      throw error;
    }
  }

  const team = await Team.create({
    name: name.trim(),
    department,
    teamLead: teamLead || null,
    createdBy: userId || null,
  });

  return Team.findById(team._id)
    .populate("department", "name code status")
    .populate(
      "teamLead",
      "employeeId firstName lastName email hierarchyLevel status"
    );
};


// GET ALL TEAMS
const getTeams = async (filters = {}) => {
  const query = {};

  if (filters.department) {
    if (!mongoose.Types.ObjectId.isValid(filters.department)) {
      const error = new Error("Invalid Department ID.");
      error.statusCode = 400;
      throw error;
    }

    query.department = filters.department;
  }

  if (filters.teamLead) {
    if (!mongoose.Types.ObjectId.isValid(filters.teamLead)) {
      const error = new Error("Invalid Team Lead ID.");
      error.statusCode = 400;
      throw error;
    }

    query.teamLead = filters.teamLead;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  return Team.find(query)
    .populate("department", "name code status")
    .populate(
      "teamLead",
      "employeeId firstName lastName email hierarchyLevel status"
    )
    .sort({ createdAt: -1 });
};


// GET TEAM BY ID
const getTeamById = async (teamId) => {
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    const error = new Error("Invalid Team ID.");
    error.statusCode = 400;
    throw error;
  }

  const team = await Team.findById(teamId)
    .populate("department", "name code status")
    .populate(
      "teamLead",
      "employeeId firstName lastName email hierarchyLevel status"
    );

  if (!team) {
    const error = new Error("Team not found.");
    error.statusCode = 404;
    throw error;
  }

  return team;
};


// UPDATE TEAM
const updateTeam = async (teamId, data) => {
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    const error = new Error("Invalid Team ID.");
    error.statusCode = 400;
    throw error;
  }

  const team = await Team.findById(teamId);

  if (!team) {
    const error = new Error("Team not found.");
    error.statusCode = 404;
    throw error;
  }

  // Name
  if (data.name !== undefined) {
    const departmentId = data.department || team.department;

    const existingTeam = await Team.findOne({
      name: data.name.trim(),
      department: departmentId,
      _id: { $ne: teamId },
    });

    if (existingTeam) {
      const error = new Error(
        "Team name already exists in this department."
      );
      error.statusCode = 409;
      throw error;
    }

    team.name = data.name.trim();
  }

  // Department
  if (data.department !== undefined) {
    if (!mongoose.Types.ObjectId.isValid(data.department)) {
      const error = new Error("Invalid Department ID.");
      error.statusCode = 400;
      throw error;
    }

    const departmentExists =
      await Department.findById(data.department);

    if (!departmentExists) {
      const error = new Error("Department not found.");
      error.statusCode = 404;
      throw error;
    }

    team.department = data.department;
  }

  // Team Lead
  if (data.teamLead !== undefined) {
    if (data.teamLead === null) {
      team.teamLead = null;
    } else {
      if (!mongoose.Types.ObjectId.isValid(data.teamLead)) {
        const error = new Error("Invalid Team Lead ID.");
        error.statusCode = 400;
        throw error;
      }

      const employee =
        await Employee.findById(data.teamLead);

      if (!employee) {
        const error = new Error("Team Lead not found.");
        error.statusCode = 404;
        throw error;
      }

      if (employee.status !== "ACTIVE") {
        const error = new Error(
          "Team Lead must be an active employee."
        );
        error.statusCode = 400;
        throw error;
      }

      if (employee.hierarchyLevel !== "TEAM_LEAD") {
        const error = new Error(
          "Selected employee is not a Team Lead."
        );
        error.statusCode = 400;
        throw error;
      }

      team.teamLead = data.teamLead;
    }
  }

  // Status
  if (data.status !== undefined) {
    team.status = data.status;
  }

  await team.save();

  return Team.findById(team._id)
    .populate("department", "name code status")
    .populate(
      "teamLead",
      "employeeId firstName lastName email hierarchyLevel status"
    );
};


// UPDATE TEAM STATUS
const updateTeamStatus = async (teamId, status) => {
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    const error = new Error("Invalid Team ID.");
    error.statusCode = 400;
    throw error;
  }

  const team = await Team.findById(teamId);

  if (!team) {
    const error = new Error("Team not found.");
    error.statusCode = 404;
    throw error;
  }

  team.status = status;

  await team.save();

  return team;
};


// DELETE TEAM
const deleteTeam = async (teamId) => {
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    const error = new Error("Invalid Team ID.");
    error.statusCode = 400;
    throw error;
  }

  const team = await Team.findById(teamId);

  if (!team) {
    const error = new Error("Team not found.");
    error.statusCode = 404;
    throw error;
  }

  // Don't delete Team if Employees are assigned to it.
  const employeesUsingTeam = await Employee.exists({
    team: teamId,
  });

  if (employeesUsingTeam) {
    const error = new Error(
      "Team cannot be deleted because employees are assigned to it."
    );
    error.statusCode = 409;
    throw error;
  }

  await Team.findByIdAndDelete(teamId);

  return true;
};


module.exports = {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  updateTeamStatus,
  deleteTeam,
};