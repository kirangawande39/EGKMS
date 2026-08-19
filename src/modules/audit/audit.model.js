const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    module: {
      type: String,
      enum: [
        "AUTH",
        "DOCUMENT",
        "WORKFLOW",
        "PERMISSION",
        "USER",
      ],
      required: true,
    },

    action: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    actorEmail: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    targetType: {
      type: String,
      default: null,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    ipAddress: {
      type: String,
      default: null,
    },

    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ module: 1, action: 1 });
auditLogSchema.index({ actor: 1 });
auditLogSchema.index({ targetId: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);