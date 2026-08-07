const router = require("express").Router();

const {
  authenticate,
} = require("../../middleware/auth.middleware");

const authorize = require("../../middleware/role.middleware");

const validate = require("../../middleware/validate.middleware");

const {
  createTeamValidator,
  updateTeamValidator,
  updateTeamStatusValidator,
} = require("./team.validator");

const teamController = require("./team.controller");


// CREATE TEAM
// FRS: Super Admin and Team Lead have Team creation responsibility.
router.post(
  "/",
  authenticate,
  authorize("SUPER_ADMIN", "TEAM_LEAD"),
  validate(createTeamValidator),
  teamController.createTeam
);


// GET ALL TEAMS
router.get(
  "/",
  authenticate,
  authorize("SUPER_ADMIN", "TEAM_LEAD"),
  teamController.getTeams
);


// GET TEAM BY ID
router.get(
  "/:teamId",
  authenticate,
  authorize("SUPER_ADMIN", "TEAM_LEAD"),
  teamController.getTeamById
);


// UPDATE TEAM
router.patch(
  "/:teamId",
  authenticate,
  authorize("SUPER_ADMIN", "TEAM_LEAD"),
  validate(updateTeamValidator),
  teamController.updateTeam
);


// UPDATE TEAM STATUS
router.patch(
  "/:teamId/status",
  authenticate,
  authorize("SUPER_ADMIN", "TEAM_LEAD"),
  validate(updateTeamStatusValidator),
  teamController.updateTeamStatus
);


// DELETE TEAM
router.delete(
  "/:teamId",
  authenticate,
  authorize("SUPER_ADMIN"),
  teamController.deleteTeam
);


module.exports = router;