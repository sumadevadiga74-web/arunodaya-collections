import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    mediaType: {
      type: String,
      required: true,
    },

    url: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      default: "",
    },

    fullPublicId: {
      type: String,
      default: "",
    },

    altText: {
      type: String,
      default: "",
    },

    folder: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Media = mongoose.model("Media", mediaSchema);

export default Media;