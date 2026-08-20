const router = require("express").Router();

const {
  authenticate,
} = require("../../middleware/auth.middleware");

const accessControl = require("../permission/accessControl/accessControl.middleware");

const validate = require("../../middleware/validate.middleware");

const {
  createTeamValidator,
  updateTeamValidator,
  updateTeamStatusValidator,
} = require("./team.validator");

const teamController = require("./team.controller");

const {
  teamCreateLimiter,
  teamReadLimiter,
  teamUpdateLimiter,
  teamStatusLimiter,
  teamDeleteLimiter,
} = require("./team.rateLimiter");

// CREATE TEAM
// FRS: Team creation responsibility.
// Permission: TEAM.CREATE


router.post(
  "/",
  authenticate,
  teamCreateLimiter,
  accessControl("TEAM", "CREATE"),
  validate(createTeamValidator),
  teamController.createTeam
);


// GET ALL TEAMS
// Permission: TEAM.VIEW


router.get(
  "/",
  authenticate,
  teamReadLimiter,
  accessControl("TEAM", "VIEW"),
  teamController.getTeams
);


// GET TEAM BY ID
// Permission: TEAM.VIEW


router.get(
  "/:teamId",
  authenticate,
  teamReadLimiter,
  accessControl("TEAM", "VIEW"),
  teamController.getTeamById
);


// UPDATE TEAM
// Permission: TEAM.EDIT


router.patch(
  "/:teamId",
  authenticate,
  teamUpdateLimiter,
  accessControl("TEAM", "EDIT"),
  validate(updateTeamValidator),
  teamController.updateTeam
);


// UPDATE TEAM STATUS
// Permission: TEAM.EDIT


router.patch(
  "/:teamId/status",
  authenticate,
  teamStatusLimiter,
  accessControl("TEAM", "EDIT"),
  validate(updateTeamStatusValidator),
  teamController.updateTeamStatus
);


// DELETE TEAM
// Permission: TEAM.DELETE

router.delete(
  "/:teamId",
  authenticate,
  teamDeleteLimiter,
  accessControl("TEAM", "DELETE"),
  teamController.deleteTeam
);

module.exports = router;