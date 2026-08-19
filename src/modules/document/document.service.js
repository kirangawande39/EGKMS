const mongoose = require("mongoose");

const Document = require("./document.model");
const Employee = require("../employee/employee.model");
const Department = require("../department/department.model");
const Team = require("../team/team.model");
const User = require("../auth/auth.model");
const DocumentVersion = require("./documentVersion.model");
const { createAuditLog } = require("../audit/audit.service");
const getStatusCode = (error, fallback = 400) => {
  error.statusCode = error.statusCode || fallback;
  return error;
};

const getAuthenticatedEmployee = async (userId) => {
  const user = await User.findById(userId).select("employeeId");

  if (!user) {
    throw getStatusCode(new Error("User not found"), 404);
  }

  const employee = await Employee.findOne({
    _id: user.employeeId,
    status: "ACTIVE",
  });

  if (!employee) {
    throw getStatusCode(new Error("Active employee not found"), 404);
  }

  return { user, employee };
};

const ensureObjectId = (value, fieldName) => {
  if (value === undefined || value === null || value === "") {
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw getStatusCode(new Error(`Invalid ${fieldName} ID`), 400);
  }
};

const validateDepartmentAndTeam = async ({ department, team }) => {
  ensureObjectId(department, "department");
  ensureObjectId(team, "team");

  let departmentDoc = null;
  let teamDoc = null;

  if (department) {
    departmentDoc = await Department.findOne({
      _id: department,
      status: "ACTIVE",
    });

    if (!departmentDoc) {
      throw getStatusCode(
        new Error("Department not found or inactive"),
        404
      );
    }
  }

  if (team) {
    teamDoc = await Team.findOne({
      _id: team,
      status: "ACTIVE",
    });

    if (!teamDoc) {
      throw getStatusCode(
        new Error("Team not found or inactive"),
        404
      );
    }

    if (
      department &&
      teamDoc.department.toString() !== department.toString()
    ) {
      throw getStatusCode(
        new Error(
          "Selected team does not belong to the selected department"
        ),
        400
      );
    }

    if (!department && teamDoc.department) {
      departmentDoc = await Department.findOne({
        _id: teamDoc.department,
        status: "ACTIVE",
      });

      if (!departmentDoc) {
        throw getStatusCode(
          new Error("Team belongs to an inactive or missing department"),
          400
        );
      }
    }
  }

  return {
    department: departmentDoc,
    team: teamDoc,
  };
};

const createDocument = async ({
  userId,
  title,
  description,
  documentType,
  department,
  team,
  file,
}) => {
  if (!file) {
    throw getStatusCode(new Error("Document file is required"), 400);
  }

  const { user, employee } = await getAuthenticatedEmployee(userId);

  await validateDepartmentAndTeam({ department, team });

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

  await createAuditLog({
    module: "DOCUMENT",
    action: "DOCUMENT_CREATED",
    actor: user._id,
    actorEmail: user.email,
    targetId: document._id,
    targetType: "Document",
    description: "Document created successfully.",
    metadata: {
      title: document.title,
      documentType: document.documentType,
      version: document.currentVersion,
    },
  });

  return document;
};

const parseVersion = (version) => {
  const match = /^v(\d+)\.(\d+)$/.exec(version || "");

  if (!match) {
    throw getStatusCode(
      new Error("Invalid document version format"),
      500
    );
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
  };
};

const getNextVersion = (currentVersion) => {
  const { major, minor } = parseVersion(currentVersion || "v1.0");
  return `v${major}.${minor + 1}`;
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
  if (!mongoose.Types.ObjectId.isValid(documentId)) {
    throw getStatusCode(new Error("Invalid document ID"), 400);
  }

  const document = await Document.findById(documentId)
    .select("+fileUrl +filePublicId");

  if (!document) {
    throw getStatusCode(new Error("Document not found"), 404);
  }

  const { employee, user } = await getAuthenticatedEmployee(userId);

  if (document.owner.toString() !== employee._id.toString()) {
    throw getStatusCode(
      new Error("Only the document owner can modify this document."),
      403
    );
  }

  if (document.status !== "REVISION") {
    throw getStatusCode(
      new Error(
        "Document can only be modified when it is in REVISION status."
      ),
      400
    );
  }

  if (!file) {
    throw getStatusCode(
      new Error(
        "Updated document file is required to create a new version."
      ),
      400
    );
  }

  await validateDepartmentAndTeam({ department, team });

  const currentVersion = document.currentVersion || "v1.0";
  const nextVersion = getNextVersion(currentVersion);

  const createdVersion = await DocumentVersion.create({
    document: document._id,
    version: currentVersion,
    title: document.title,
    description: document.description,
    documentType: document.documentType,
    department: document.department,
    team: document.team,
    fileUrl: document.fileUrl,
    filePublicId: document.filePublicId,
    fileName: document.fileName,
    fileType: document.fileType,
    fileSize: document.fileSize,
    createdBy: employee._id,
  });

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

  await document.save();

  await createAuditLog({
    module: "DOCUMENT",
    action: "DOCUMENT_EDITED",
    actor: user._id,
    actorEmail: user.email,
    targetId: document._id,
    targetType: "Document",
    description: "Document edited successfully.",
    metadata: {
      previousVersion: currentVersion,
      newVersion: nextVersion,
      title: document.title,
    },
  });

  await createAuditLog({
    module: "DOCUMENT",
    action: "VERSION_CREATED",
    actor: user._id,
    actorEmail: user.email,
    targetId: document._id,
    targetType: "Document",
    description: "New document version created.",
    metadata: {
      version: createdVersion.version,
      nextVersion,
    },
  });

  return document;

  return document;
};

const buildDocumentScope = (employee) => {
  if (employee.hierarchyLevel === "SUPER_ADMIN") {
    return {};
  }

  const scope = [
    { owner: employee._id },
  ];

  if (employee.department) {
    scope.push({ department: employee.department });
  }

  if (employee.team) {
    scope.push({ team: employee.team });
  }

  return { $or: scope };
};

const getDocuments = async ({
  userId,
  page = 1,
  limit = 20,
  search,
  documentType,
  status,
  department,
  team,
}) => {
  const { employee } = await getAuthenticatedEmployee(userId);

  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const filters = [buildDocumentScope(employee)];

  if (search) {
    const regex = new RegExp(
      String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i"
    );

    filters.push({
      $or: [
        { title: regex },
        { description: regex },
        { fileName: regex },
      ],
    });
  }

  if (documentType) {
    filters.push({ documentType: String(documentType).toUpperCase() });
  }

  if (status) {
    filters.push({ status: String(status).toUpperCase() });
  }

  if (department) {
    ensureObjectId(department, "department");
    filters.push({ department });
  }

  if (team) {
    ensureObjectId(team, "team");
    filters.push({ team });
  }

  const query = filters.length === 1
    ? filters[0]
    : { $and: filters };

  const skip = (safePage - 1) * safeLimit;

  const [documents, total] = await Promise.all([
    Document.find(query)
      .populate("owner", "employeeId firstName lastName email hierarchyLevel")
      .populate("department", "name code status")
      .populate("team", "name teamLead status")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(safeLimit),

    Document.countDocuments(query),
  ]);

  return {
    documents,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

const getDocumentById = async ({ documentId, userId }) => {
  if (!mongoose.Types.ObjectId.isValid(documentId)) {
    throw getStatusCode(new Error("Invalid document ID"), 400);
  }

  const { employee } = await getAuthenticatedEmployee(userId);

  const scope = buildDocumentScope(employee);

  const document = await Document.findOne({
    _id: documentId,
    ...scope,
  })
    .populate("owner", "employeeId firstName lastName email hierarchyLevel")
    .populate("department", "name code status")
    .populate("team", "name teamLead status")
    .populate("createdBy", "email accountStatus");

  if (!document) {
    throw getStatusCode(
      new Error("Document not found or access denied"),
      404
    );
  }

  return document;
};

const getDocumentVersions = async ({ documentId, userId }) => {
  const currentDocument = await getDocumentById({ documentId, userId });

  const history = await DocumentVersion.find({ document: documentId })
    .populate("createdBy", "employeeId firstName lastName email hierarchyLevel")
    .sort({ createdAt: -1 })
    .lean();

  // DocumentVersion stores previous versions. The current document itself
  // represents the latest version, so include it in the history response too.
  const currentVersion = {
    _id: currentDocument._id,
    document: currentDocument._id,
    version: currentDocument.currentVersion,
    title: currentDocument.title,
    description: currentDocument.description,
    documentType: currentDocument.documentType,
    department: currentDocument.department,
    team: currentDocument.team,
    fileUrl: currentDocument.fileUrl,
    filePublicId: currentDocument.filePublicId,
    fileName: currentDocument.fileName,
    fileType: currentDocument.fileType,
    fileSize: currentDocument.fileSize,
    createdBy: currentDocument.createdBy,
    createdAt: currentDocument.updatedAt,
    updatedAt: currentDocument.updatedAt,
    isCurrent: true,
  };

  return [
    currentVersion,
    ...history.map((version) => ({
      ...version,
      isCurrent: false,
    })),
  ];
};

const updateDocumentStatus = async ({
  documentId,
  userId,
  status,
}) => {
  const document = await getDocumentById({ documentId, userId });

  const allowedTransitions = {
    PUBLISHED: ["ACTIVE"],
    ACTIVE: ["AMENDMENT"],
    AMENDMENT: ["ACTIVE"],
  };

  if (!allowedTransitions[document.status]?.includes(status)) {
    throw getStatusCode(
      new Error(
        `Invalid document lifecycle transition: ${document.status} → ${status}`
      ),
      400
    );
  }

  document.status = status;
  await document.save();

  return document;
};

const archiveDocument = async ({ documentId, userId }) => {
  const document = await getDocumentById({
    documentId,
    userId,
  });

  const { user } =
    await getAuthenticatedEmployee(userId);

  if (!["PUBLISHED", "ACTIVE", "AMENDMENT"].includes(document.status)) {
    throw getStatusCode(
      new Error(
        "Only Published, Active, or Amendment documents can be archived."
      ),
      400
    );
  }

  document.status = "ARCHIVED";
  await document.save();

  await createAuditLog({
  module: "DOCUMENT",
  action: "DOCUMENT_ARCHIVED",
  actor: user._id,
  actorEmail: user.email,
  targetId: document._id,
  targetType: "Document",
  description: "Document archived successfully.",
  metadata: {
    title: document.title,
    previousStatus: "PUBLISHED",
    newStatus: "ARCHIVED",
  },
});

  return document;
};

const restoreDocument = async ({ documentId, userId }) => {
  const document = await Document.findById(documentId);

  if (!document) {
    throw getStatusCode(new Error("Document not found"), 404);
  }

  const { employee } = await getAuthenticatedEmployee(userId);

  if (employee.hierarchyLevel !== "SUPER_ADMIN") {
    throw getStatusCode(
      new Error("Only Super Admin can restore archived documents."),
      403
    );
  }

  if (document.status !== "ARCHIVED") {
    throw getStatusCode(
      new Error("Only archived documents can be restored."),
      400
    );
  }

  document.status = "ACTIVE";
  await document.save();

  return document;
};

const canDeleteDocument = ({ document, employee }) => {
  if (employee.hierarchyLevel === "SUPER_ADMIN") {
    return true;
  }

  // FRS mandatory deletion policy:
  // creator/owner can delete Draft documents.
  if (
    document.status === "DRAFT" &&
    document.owner.toString() === employee._id.toString()
  ) {
    return true;
  }

  // Under review, approved, published, active and archived documents
  // are protected from normal creator deletion.
  return false;
};

const deleteDocument = async ({ documentId, userId }) => {
  const document = await Document.findById(documentId);

  if (!document) {
    throw getStatusCode(new Error("Document not found"), 404);
  }

  const { employee } = await getAuthenticatedEmployee(userId);

  if (!canDeleteDocument({ document, employee })) {
    throw getStatusCode(
      new Error("You are not authorized to delete this document."),
      403
    );
  }

  await DocumentVersion.deleteMany({ document: document._id });
  await document.deleteOne();

  return true;
};

const viewDocument = async ({ documentId, userId }) => {
  if (!mongoose.Types.ObjectId.isValid(documentId)) {
    throw getStatusCode(new Error("Invalid document ID"), 400);
  }

  const { employee, user } = await getAuthenticatedEmployee(userId);

  const scope = buildDocumentScope(employee);

  const document = await Document.findOne({
    _id: documentId,
    ...scope,
  }).select("+fileUrl +filePublicId");

  if (!document) {
    throw getStatusCode(
      new Error("Document not found or access denied"),
      404
    );
  }

  if (!document.fileUrl) {
    throw getStatusCode(
      new Error("Document file not found"),
      404
    );
  }

  const response = await fetch(document.fileUrl);

  if (!response.ok) {
    throw getStatusCode(
      new Error("Unable to retrieve document file"),
      502
    );
  }


  const fileBuffer = Buffer.from(await response.arrayBuffer());

  await createAuditLog({
    module: "DOCUMENT",
    action: "DOCUMENT_VIEWED",
    actor: user._id,
    actorEmail: user.email,
    targetId: document._id,
    targetType: "Document",
    description: "Document viewed successfully.",
    metadata: {
      title: document.title,
      version: document.currentVersion,
    },
  });

  return {
    file: fileBuffer,
    contentType: "application/pdf",
    fileName: document.fileName,
  };
};

module.exports = {
  createDocument,
  updateDocument,
  getDocuments,
  getDocumentById,
  getDocumentVersions,
  updateDocumentStatus,
  archiveDocument,
  restoreDocument,
  deleteDocument,
  viewDocument
};
