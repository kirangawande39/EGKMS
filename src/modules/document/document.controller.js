const documentService = require("./document.service");

const createDocument = async (req, res, next) => {
  try {
    const {
      title,
      description,
      documentType,
      department,
      team,
    } = req.body;

    const document = await documentService.createDocument({
      userId: req.user.id,
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

const updateDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const document = await documentService.updateDocument({
      documentId,
      userId: req.user._id,
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

module.exports = {
  createDocument,
  updateDocument
};