import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      default: "Arunodaya Collections",
    },

    siteDescription: {
      type: String,
      default: "",
    },

    logo: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
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

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;
