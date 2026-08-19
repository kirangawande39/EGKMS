const documentService = require("./document.service");

const getUserId = (req) => req.user?._id || req.user?.id;

const createDocument = async (req, res, next) => {
  try {
    const {
      title,
      description,
      documentType,
      department,
      team,
    } = req.body;

    // console.log("File:",req.file);

    const document = await documentService.createDocument({
      userId: getUserId(req),
      title,
      description,
      documentType,
      department,
      team,
      file: req.file,
    });

    return res.status(201).json({
      success: true,
      message: "Document created successfully",
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

const getDocuments = async (req, res, next) => {
  try {
    const result = await documentService.getDocuments({
      userId: getUserId(req),
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      documentType: req.query.documentType,
      status: req.query.status,
      department: req.query.department,
      team: req.query.team,
    });

    return res.status(200).json({
      success: true,
      message: "Documents fetched successfully.",
      data: result.documents,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getDocumentById = async (req, res, next) => {
  try {
    const document = await documentService.getDocumentById({
      documentId: req.params.documentId,
      userId: getUserId(req),
    });

    return res.status(200).json({
      success: true,
      message: "Document fetched successfully.",
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

const updateDocument = async (req, res, next) => {
  try {
    const document = await documentService.updateDocument({
      documentId: req.params.documentId,
      userId: getUserId(req),
      title: req.body.title,
      description: req.body.description,
      documentType: req.body.documentType,
      department: req.body.department,
      team: req.body.team,
      file: req.file,
    });

    return res.status(200).json({
      success: true,
      message: "Document updated and new version created successfully.",
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

const getDocumentVersions = async (req, res, next) => {
  try {
    const versions = await documentService.getDocumentVersions({
      documentId: req.params.documentId,
      userId: getUserId(req),
    });

    return res.status(200).json({
      success: true,
      message: "Document version history fetched successfully.",
      data: versions,
    });
  } catch (error) {
    next(error);
  }
};

const updateDocumentStatus = async (req, res, next) => {
  try {
    const document = await documentService.updateDocumentStatus({
      documentId: req.params.documentId,
      userId: getUserId(req),
      status: req.body.status,
    });

    return res.status(200).json({
      success: true,
      message: "Document status updated successfully.",
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

const archiveDocument = async (req, res, next) => {
  try {
    const document = await documentService.archiveDocument({
      documentId: req.params.documentId,
      userId: getUserId(req),
    });

    return res.status(200).json({
      success: true,
      message: "Document archived successfully.",
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

const restoreDocument = async (req, res, next) => {
  try {
    const document = await documentService.restoreDocument({
      documentId: req.params.documentId,
      userId: getUserId(req),
    });

    return res.status(200).json({
      success: true,
      message: "Document restored successfully.",
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    await documentService.deleteDocument({
      documentId: req.params.documentId,
      userId: getUserId(req),
    });

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
const viewDocument = async (req, res, next) => {
  try {
    const result = await documentService.viewDocument({
      documentId: req.params.documentId,
      userId: getUserId(req),
    });

    res.setHeader("Content-Type", result.contentType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${result.fileName}"`
    );

    return res.send(result.file);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  getDocumentVersions,
  updateDocumentStatus,
  archiveDocument,
  restoreDocument,
  deleteDocument,
  viewDocument,
};
