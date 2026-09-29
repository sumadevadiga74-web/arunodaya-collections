import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      default: "",
    },
    
    brand: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Brand",
  default: null,
},

    description: {
      type: String,
      default: "",
    },

    stock: {
      type: Number,
      default: 0,
    },

    sizes: {
      type: [String],
      default: [],
    },

    colours: {
      type: [String],
      default: [],
    },

    colourImages: {
      type: [
        {
          colour: {
            type: String,
            required: true,
          },
          image: {
            type: String,
            required: true,
          },
        },
      ],
      default: [],
    },
    sizechart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sizechart",
      default: null,
    },

    productImages: {
  type: [
    {
      view: {
        type: String,
        enum: ["front", "back", "side", "detail"],
      },
      image: {
        type: String,
      },
    },
  ],
  default: [],
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

const Product = mongoose.model("Product", productSchema);

export default Product;