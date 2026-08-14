const mongoose = require("mongoose");

const documentVersionSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: [true, "Document is required"],
    },

    version: {
      type: String,
      required: [true, "Version is required"],
    },

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

    fileUrl: {
      type: String,
      required: [true, "Version file is required"],
    },

    filePublicId: {
      type: String,
      required: [true, "Version file reference is required"],
    },

    fileName: {
      type: String,
      required: [true, "Version file name is required"],
    },

    fileType: {
      type: String,
      default: null,
    },

    fileSize: {
      type: Number,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Version creator is required"],
    },
  },
  {
    timestamps: true,
  }
);

documentVersionSchema.index(
  { document: 1, version: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "DocumentVersion",
  documentVersionSchema
);