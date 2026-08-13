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

module.exports = {
  createDocument,
};