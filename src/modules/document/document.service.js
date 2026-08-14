const Document = require("./document.model");

const Employee = require("../employee/employee.model");
const Department = require("../department/department.model");
const Team = require("../team/team.model");
const User = require("../auth/auth.model");
const DocumentVersion = require("./documentVersion.model");

const createDocument = async ({
  userId,
  title,
  description,
  documentType,
  department,
  team,
  file,
}) => {
  // 1. File is required
  if (!file) {
    throw new Error("Document file is required");
  }

  // 2. Find logged-in User
  const user = await User.findById(userId).select("employeeId");

  if (!user) {
    throw new Error("User not found");
  }

  // 3. Find linked active Employee
  const employee = await Employee.findOne({
    _id: user.employeeId,
    status: "ACTIVE",
  });

  if (!employee) {
    throw new Error("Active employee not found");
  }

  // 4. Validate Department
  if (department) {
    const departmentExists = await Department.findOne({
      _id: department,
      status: "ACTIVE",
    });

    if (!departmentExists) {
      throw new Error("Department not found or inactive");
    }
  }

  // 5. Validate Team
  if (team) {
    const teamExists = await Team.findOne({
      _id: team,
      status: "ACTIVE",
    });

    if (!teamExists) {
      throw new Error("Team not found or inactive");
    }

    // Team must belong to selected Department
    if (
      department &&
      teamExists.department.toString() !== department.toString()
    ) {
      throw new Error(
        "Selected team does not belong to the selected department"
      );
    }
  }

  // 6. Create Document
  const document = await Document.create({
    title,
    description: description || null,
    documentType,

    owner: employee._id,

    department: department || null,
    team: team || null,

    fileUrl: file.path,
    filePublicId: file.filename,
    fileName: file.originalname,
    fileType: file.mimetype,
    fileSize: file.size,

    status: "DRAFT",
    currentVersion: "v1.0",

    createdBy: user._id,
  });

  return document;
};

const updateDocument = async ({
  documentId,
  userId,
  title,
  description,
  documentType,
  department,
  team,
  file,
}) => {
  const document = await Document.findById(documentId);

  if (!document) {
    const error = new Error("Document not found");
    error.statusCode = 404;
    throw error;
  }

  // Find logged-in User
  const user = await User.findById(userId).select("employeeId");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  // Find active employee
  const employee = await Employee.findOne({
    _id: user.employeeId,
    status: "ACTIVE",
  });

  if (!employee) {
    const error = new Error("Active employee not found");
    error.statusCode = 404;
    throw error;
  }

  // Only document owner can modify the document
  if (document.owner.toString() !== employee._id.toString()) {
    const error = new Error(
      "Only the document owner can modify this document."
    );
    error.statusCode = 403;
    throw error;
  }

  // Document can only be modified during revision
  if (document.status !== "REVISION") {
    const error = new Error(
      "Document can only be modified when it is in REVISION status."
    );
    error.statusCode = 400;
    throw error;
  }

  // Department validation
  if (department) {
    const departmentExists = await Department.findOne({
      _id: department,
      status: "ACTIVE",
    });

    if (!departmentExists) {
      const error = new Error(
        "Department not found or inactive"
      );
      error.statusCode = 404;
      throw error;
    }
  }

  // Team validation
  if (team) {
    const teamExists = await Team.findOne({
      _id: team,
      status: "ACTIVE",
    });

    if (!teamExists) {
      const error = new Error(
        "Team not found or inactive"
      );
      error.statusCode = 404;
      throw error;
    }

    if (
      department &&
      teamExists.department.toString() !== department.toString()
    ) {
      const error = new Error(
        "Selected team does not belong to the selected department"
      );
      error.statusCode = 400;
      throw error;
    }
  }

  /*
   * Create next version
   *
   * v1.0 → v1.1
   * v1.1 → v1.2
   */
  const currentVersion = document.currentVersion || "v1.0";

  const versionNumber = Number(
    currentVersion.replace("v1.", "")
  );

  const nextVersion = `v1.${versionNumber + 1}`;

  // File is required for a new version
  if (!file) {
    const error = new Error(
      "Updated document file is required to create a new version."
    );
    error.statusCode = 400;
    throw error;
  }

  // Preserve previous version
  await DocumentVersion.create({
    document: document._id,
    version: currentVersion,
    title: document.title,
    description: document.description,
    fileUrl: document.fileUrl,
    filePublicId: document.filePublicId,
    fileName: document.fileName,
    fileType: document.fileType,
    fileSize: document.fileSize,
    createdBy: employee._id,
  });

  // Update current document with new version
  document.title = title ?? document.title;
  document.description =
    description !== undefined
      ? description
      : document.description;
  document.documentType =
    documentType ?? document.documentType;

  document.department =
    department !== undefined
      ? department || null
      : document.department;

  document.team =
    team !== undefined
      ? team || null
      : document.team;

  document.fileUrl = file.path;
  document.filePublicId = file.filename;
  document.fileName = file.originalname;
  document.fileType = file.mimetype;
  document.fileSize = file.size;

  document.currentVersion = nextVersion;

  await document.save();

  return document;
};

module.exports = {
  createDocument,
  updateDocument
};