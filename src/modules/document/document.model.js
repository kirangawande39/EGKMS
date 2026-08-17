const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Document title is required"],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: null,
    },

    documentType: {
      type: String,
      required: [true, "Document type is required"],
      trim: true,
      uppercase: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Document owner is required"],
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

    fileUrl: {
      type: String,
      required: [true, "Document file is required"],
    },

    filePublicId: {
      type: String,
      required: [true, "Document file reference is required"],
    },

    fileName: {
      type: String,
      required: [true, "Document file name is required"],
    },

    fileType: {
      type: String,
      default: null,
    },

    fileSize: {
      type: Number,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "SUBMITTED",
        "REVIEW",
        "REVISION",
        "APPROVED",
        "PUBLISHED",
        "ACTIVE",
        "AMENDMENT",
        "ARCHIVED",
      ],
      default: "DRAFT",
    },

    currentVersion: {
      type: String,
      default: "v1.0",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by is required"],
    },

    reviewComment: {
      type: String,
      default: null,
      trim: true
    },
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ owner: 1 });
documentSchema.index({ department: 1 });
documentSchema.index({ team: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ documentType: 1 });
documentSchema.index({ currentVersion: 1 });

module.exports = mongoose.model("Document", documentSchema);
