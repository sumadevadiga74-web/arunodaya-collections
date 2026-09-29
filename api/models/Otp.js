import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["phone", "email"],
      required: true,
    },

    otp: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

otpSchema.index(
  { identifier: 1, type: 1 },
  { unique: true }
);

otpSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const Otp =
  mongoose.models.Otp ||
  mongoose.model("Otp", otpSchema);

export default Otp;