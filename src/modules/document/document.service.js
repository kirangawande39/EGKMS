const Document = require("./document.model");

const Employee = require("../employee/employee.model");
const Department = require("../department/department.model");
const Team = require("../team/team.model");
const User = require("../auth/auth.model");

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

module.exports = {
  createDocument,
};