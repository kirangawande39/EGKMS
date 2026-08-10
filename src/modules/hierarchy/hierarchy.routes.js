const express = require("express");

const router = express.Router();

const hierarchyController =
  require("./hierarchy.controller");

const { authenticate } =
  require("../../middleware/auth.middleware");

const validate =
  require("../../middleware/validate.middleware");

const {
  createHierarchySchema,
  updateHierarchySchema,
} = require("./hierarchy.validator");


// CREATE
// router.post(
//   "/",
//   authenticate,
//   validate(createHierarchySchema),
//   hierarchyController.createHierarchy
// );


// GET ALL
router.get(
  "/",
  authenticate,
  hierarchyController.getAllHierarchy
);



// // GET SINGLE
// router.get(
//   "/:id",
//   authenticate,
//   hierarchyController.getHierarchyById
// );


// // UPDATE
// router.patch(
//   "/:id",
//   authenticate,
//   validate(updateHierarchySchema),
//   hierarchyController.updateHierarchy
// );


// // DELETE
// router.delete(
//   "/:id",
//   authenticate,
//   hierarchyController.deleteHierarchy
// );


module.exports = router;
