const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    resource: {
      type: String,
      required: [true, "Permission resource is required"],
      trim: true,
      uppercase: true,
    },

    action: {
      type: String,
      required: [true, "Permission action is required"],
      enum: {
        values: [
          "VIEW",
          "CREATE",
          "EDIT",
          "DELETE",
          "REVIEW",
          "APPROVE",
          "PUBLISH",
          "ARCHIVE",
          "RESTORE",
        ],
        message: "Invalid permission action",
      },
    },

    description: {
      type: String,
      trim: true,
      default: null,
    },

    status: {
      type: String,
      enum: {
        values: ["ACTIVE", "INACTIVE"],
        message: "Invalid permission status",
      },
      default: "ACTIVE",
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

/*
 * One permission should exist only once
 * for a particular resource + action combination.
 *
 * Example:
 * TEAM + CREATE
 *
 * Duplicate:
 * TEAM + CREATE
 * TEAM + CREATE
 *
 * is not allowed.
 */
permissionSchema.index(
  {
    resource: 1,
    action: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Permission", permissionSchema);