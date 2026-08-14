const express = require("express");

const router = express.Router();

const documentController = require("./document.controller");

const {
  createDocumentValidator,
  updateDocumentValidator
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

router.patch(
  "/:documentId",
  authenticate,
  upload.single("file"),
  updateDocumentValidator,
  documentController.updateDocument
);


module.exports = router;