const express = require("express");

const router = express.Router();

const documentController = require("./document.controller");

const {
  createDocumentValidator,
} = require("./document.validator");

const { authenticate } = require("../../middleware/auth.middleware");
const validate = require("../../middleware/validate.middleware");

const upload = require("../../middleware/upload.middleware");

// Create Document
router.post(
  "/",
  authenticate,
  upload.single("file"),
  validate(createDocumentValidator),
  documentController.createDocument
);


module.exports = router;