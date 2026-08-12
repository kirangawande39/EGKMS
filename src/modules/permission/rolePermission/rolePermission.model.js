const mongoose = require("mongoose");

const rolePermissionSchema = new mongoose.Schema(
  {
    hierarchyLevel: {
      type: String,
      required: [true, "Hierarchy level is required"],
      enum: {
        values: [
          "SUPER_ADMIN",
          "GOVERNANCE",
          "EXECUTIVE",
          "DEPARTMENT_HEAD",
          "MANAGER",
          "TEAM_LEAD",
          "EMPLOYEE",
          "INTERN",
        ],
        message: "Invalid hierarchy level",
      },
    },

    permission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Permission",
      required: [true, "Permission reference is required"],
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Permission assigner is required"],
    },

    status: {
      type: String,
      enum: {
        values: ["ACTIVE", "INACTIVE"],
        message: "Invalid permission assignment status",
      },
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

/*
 * The same permission should not be assigned
 * multiple times to the same hierarchy.
 *
 * Example:
 *
 * TEAM_LEAD + TEAM.CREATE
 *
 * should exist only once.
 */
rolePermissionSchema.index(
  {
    hierarchyLevel: 1,
    permission: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "RolePermission",
  rolePermissionSchema
);