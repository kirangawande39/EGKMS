
const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },

    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },

    hierarchyLevel: {
      type: String,
      required: [true, "Hierarchy level is required"],
      enum: {
        values: [
          "SUPER_ADMIN",
          "GOVERNANCE",
          "EXECUTIVE",
          "DEPARTMENT",
          "MANAGER",
          "TEAM_LEAD",
          "TEAM",
          "EMPLOYEE",
          "INTERN",
        ],
        message: "Invalid hierarchy level",
      },
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },

    reportingManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    status: {
      type: String,
      enum: {
        values: ["ACTIVE", "INACTIVE", "SUSPENDED"],
        message: "Invalid employee status",
      },
      default: "ACTIVE",
    },

    isRegistered: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Employee", employeeSchema);

