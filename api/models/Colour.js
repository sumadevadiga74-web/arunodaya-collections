import mongoose from "mongoose";

const colourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    code: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Colour = mongoose.model("Colour", colourSchema);

export default Colour;