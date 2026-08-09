const teamService = require("./team.service");


// CREATE TEAM
const createTeam = async (req, res, next) => {
  try {
    const team = await teamService.createTeam(
      req.body,
      req.user?._id
    );

    return res.status(201).json({
      success: true,
      message: "Team created successfully.",
      data: team,
    });
  } catch (error) {
    next(error);
  }
};


// GET ALL TEAMS
const getTeams = async (req, res, next) => {
  try {
    const teams = await teamService.getTeams(req.query);

    return res.status(200).json({
      success: true,
      message: "Teams fetched successfully.",
      data: teams,
    });
  } catch (error) {
    next(error);
  }
};


// GET TEAM BY ID
const getTeamById = async (req, res, next) => {
  try {
    const team = await teamService.getTeamById(
      req.params.teamId
    );

    return res.status(200).json({
      success: true,
      message: "Team fetched successfully.",
      data: team,
    });
  } catch (error) {
    next(error);
  }
};


// UPDATE TEAM
const updateTeam = async (req, res, next) => {
  try {
    const team = await teamService.updateTeam(
      req.params.teamId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Team updated successfully.",
      data: team,
    });
  } catch (error) {
    next(error);
  }
};


// UPDATE TEAM STATUS
const updateTeamStatus = async (req, res, next) => {
  try {
    const team = await teamService.updateTeamStatus(
      req.params.teamId,
      req.body.status
    );

    return res.status(200).json({
      success: true,
      message: "Team status updated successfully.",
      data: team,
    });
  } catch (error) {
    next(error);
  }
};


// DELETE TEAM
const deleteTeam = async (req, res, next) => {
  try {
    await teamService.deleteTeam(
      req.params.teamId
    );

    return res.status(200).json({
      success: true,
      message: "Team deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  updateTeamStatus,
  deleteTeam,
};