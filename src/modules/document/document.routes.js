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

const {
  documentCreateLimiter,
  documentReadLimiter,
  documentUpdateLimiter,
  documentStatusLimiter,
  documentArchiveLimiter,
  documentRestoreLimiter,
  documentDeleteLimiter,
} = require("./document.rateLimiter"); 

// Create
router.post(
  "/",
  authenticate,
  documentCreateLimiter,
  accessControl("DOCUMENT", "CREATE"),
  upload.single("file"),
  validate(createDocumentValidator),
  documentController.createDocument
);

// Get all / search / filter
router.get(
  "/",
  authenticate,
  documentReadLimiter,
  accessControl("DOCUMENT", "VIEW"),
  documentController.getDocuments
);
// View document file
router.get(
  "/:documentId/view",
  authenticate,
  documentReadLimiter,
  accessControl("DOCUMENT", "VIEW"),
  documentController.viewDocument
);

// Get one
router.get(
  "/:documentId",
  authenticate,
  documentReadLimiter,
  accessControl("DOCUMENT", "VIEW"),
  documentController.getDocumentById
);


// Version history
router.get(
  "/:documentId/versions",
  authenticate,
  documentReadLimiter,
  accessControl("DOCUMENT", "VIEW"),
  documentController.getDocumentVersions
);

// Update document + create new version
router.patch(
  "/:documentId",
  authenticate,
  documentUpdateLimiter,
  accessControl("DOCUMENT", "EDIT"),
  upload.single("file"),
  validate(updateDocumentValidator),
  documentController.updateDocument
);

// Lifecycle transition: PUBLISHED → ACTIVE, ACTIVE → AMENDMENT, AMENDMENT → ACTIVE
router.patch(
  "/:documentId/status",
  authenticate,
  documentStatusLimiter,
  accessControl("DOCUMENT", "EDIT"),
  validate(updateStatusValidator),
  documentController.updateDocumentStatus
);

// Archive
router.patch(
  "/:documentId/archive",
  authenticate,
  documentArchiveLimiter,
  accessControl("DOCUMENT", "ARCHIVE"),
  documentController.archiveDocument
);

// Restore
router.patch(
  "/:documentId/restore",
  authenticate,
  documentRestoreLimiter,
  accessControl("DOCUMENT", "RESTORE"),
  documentController.restoreDocument
);

// Delete
router.delete(
  "/:documentId",
  authenticate,
  documentDeleteLimiter,
  accessControl("DOCUMENT", "DELETE"),
  documentController.deleteDocument
);

module.exports = router;
