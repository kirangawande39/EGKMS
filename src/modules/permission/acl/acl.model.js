const mongoose = require("mongoose");

const aclSchema = new mongoose.Schema(
  {
    hierarchyLevel: {
      type: String,
      required: [true, "Hierarchy level is required"],
      enum: [
        "SUPER_ADMIN",
        "GOVERNANCE",
        "EXECUTIVE",
        "DEPARTMENT_HEAD",
        "MANAGER",
        "TEAM_LEAD",
        "EMPLOYEE",
        "INTERN",
      ],
    },

    permission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Permission",
      required: [true, "Permission reference is required"],
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

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    effect: {
      type: String,
      enum: {
        values: ["ALLOW", "DENY"],
        message: "Effect must be ALLOW or DENY",
      },
      required: [true, "ACL effect is required"],
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by is required"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ACL", aclSchema);