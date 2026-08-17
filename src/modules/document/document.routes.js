const express = require("express");

const router = express.Router();

const documentController = require("./document.controller");

const {
  createDocumentValidator,
  updateDocumentValidator,
  updateStatusValidator,
} = require("./document.validator");

const { authenticate } = require("../../middleware/auth.middleware");
const validate = require("../../middleware/validate.middleware");
const upload = require("../../middleware/upload.middleware");

// Fine-grained access control is part of the existing EGKMS middleware.
// If your actual middleware filename/path differs, keep the same
// accessControl(resource, action) contract used by Team routes.
const accessControl = require("../permission/accessControl/accessControl.middleware");

// Create
router.post(
  "/",
  authenticate,
  accessControl("DOCUMENT", "CREATE"),
  upload.single("file"),
  validate(createDocumentValidator),
  documentController.createDocument
);

// Get all / search / filter
router.get(
  "/",
  authenticate,
  accessControl("DOCUMENT", "VIEW"),
  documentController.getDocuments
);

// Get one
router.get(
  "/:documentId",
  authenticate,
  accessControl("DOCUMENT", "VIEW"),
  documentController.getDocumentById
);

// Version history
router.get(
  "/:documentId/versions",
  authenticate,
  accessControl("DOCUMENT", "VIEW"),
  documentController.getDocumentVersions
);

// Update document + create new version
router.patch(
  "/:documentId",
  authenticate,
  accessControl("DOCUMENT", "EDIT"),
  upload.single("file"),
  validate(updateDocumentValidator),
  documentController.updateDocument
);

// Lifecycle transition: PUBLISHED → ACTIVE, ACTIVE → AMENDMENT, AMENDMENT → ACTIVE
router.patch(
  "/:documentId/status",
  authenticate,
  accessControl("DOCUMENT", "EDIT"),
  validate(updateStatusValidator),
  documentController.updateDocumentStatus
);

// Archive
router.patch(
  "/:documentId/archive",
  authenticate,
  accessControl("DOCUMENT", "ARCHIVE"),
  documentController.archiveDocument
);

// Restore
router.patch(
  "/:documentId/restore",
  authenticate,
  accessControl("DOCUMENT", "RESTORE"),
  documentController.restoreDocument
);

// Delete
router.delete(
  "/:documentId",
  authenticate,
  accessControl("DOCUMENT", "DELETE"),
  documentController.deleteDocument
);

module.exports = router;
