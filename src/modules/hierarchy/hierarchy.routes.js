const express = require("express");

const router = express.Router();


const hierarchyController =
require("./hierarchy.controller");


const {authenticate} =
require("../../middleware/auth.middleware");



// Create

router.post(
"/",
authenticate,
hierarchyController.createHierarchy
);


// Get All

router.get(
"/",
authenticate,
hierarchyController.getAllHierarchy
);


// Get Single

router.get(
"/:id",
authenticate,
hierarchyController.getHierarchyById
);


// Update

router.patch(
"/:id",
authenticate,
hierarchyController.updateHierarchy
);


// Delete

router.delete(
"/:id",
authenticate,
hierarchyController.deleteHierarchy
);



module.exports = router;