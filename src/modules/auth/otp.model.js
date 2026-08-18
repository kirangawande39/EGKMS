
const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },

    otpHash: {
      type: String,
      required: [true, "OTP hash is required"],
      select: false,
    },

    expiresAt: {
      type: Date,
      required: [true, "OTP expiry time is required"],
    },

    attempts: {
      type: Number,
      default: 0,
      min: [0, "Attempts cannot be negative"],
    },

    verified: {
      type: Boolean,
      default: false,
    },
    purpose: {
      type: String,
      enum: [
        "EMAIL_VERIFICATION",
        "PASSWORD_RESET",
      ],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically remove expired OTP documents
otpSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

module.exports = mongoose.model("OTP", otpSchema);
