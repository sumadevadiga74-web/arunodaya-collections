import mongoose from "mongoose";

const basketSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    productId: {
      type: String,
      required: true,
    },

    size: {
      type: String,
      default: "",
    },

    colour: {
      type: String,
      default: "",
    },

    quantity: {
      type: Number,
      required: true,
      default: 1,
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

const Basket = mongoose.model("Basket", basketSchema);

export default Basket;