import mongoose from "mongoose";

const productMediaSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["image", "video"],
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
  },
  { _id: false }
);

const productItemSchema = new mongoose.Schema(
  {
    price: {
      type: Number,
      default: 0,
    },

    onDiscount: {
      type: Boolean,
      default: false,
    },

    mrp: {
      type: Number,
      default: 0,
    },

    discountPerc: {
      type: Number,
      default: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
    },

    sellingPrice: {
      type: Number,
      default: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    offers: {
      minQty: {
        type: Number,
        default: 1,
      },

      maxQty: {
        type: Number,
        default: 1,
      },

      discountType: {
        type: String,
        enum: ["CASH", "PERCENT", "PRODUCT"],
        default: "CASH",
      },

      pricePerUnit: {
        type: Number,
        default: 0,
      },

      percentOff: {
        type: Number,
        default: 0,
      },

      freeProductConfig: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
    },

    categories: {
      type: [String],
      default: [],
    },

    brands: {
      type: [String],
      default: [],
    },

    freeQty: {
      type: Number,
      default: 0,
    },

    barcode: {
      type: String,
      default: "",
    },

    sku: {
      type: String,
      default: "",
    },

    weight: {
      type: {
        type: String,
        enum: ["kg", "gm"],
        default: "gm",
      },

      value: {
        type: Number,
        default: 0,
      },
    },

    stock: {
      type: Number,
      default: 0,
    },

    size: {
      type: String,
      default: "",
    },

    colour: {
      type: String,
      default: "",
    },

    images: {
      type: [productMediaSchema],
      default: [],
    },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["draft", "published", "trash", "active"],
      default: "draft",
    },

    subTitle: {
      type: String,
      default: "",
    },

    slug: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    skuPrefix: {
      type: String,
      default: "",
    },

    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      default: null,
    },

    extraInfo: {
      title: {
        type: String,
        default: "",
      },

      description: {
        type: String,
        default: "",
      },

      image: {
        type: String,
        default: "",
      },
    },

    categories: {
      type: [String],
      default: [],
    },

    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      default: null,
    },

    seo: {
      title: {
        type: String,
        default: "",
      },

      description: {
        type: String,
        default: "",
      },

      image: {
        type: String,
        default: "",
      },
    },

    mainMedia: {
      type: [productMediaSchema],
      default: [],
    },

    images: {
      type: [productMediaSchema],
      default: [],
    },

    similarItems: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Product",
      default: [],
    },

    productImageInfo: {
      lineOne: {
        type: String,
        default: "",
      },

      lineTwo: {
        type: String,
        default: "",
      },
    },

    sizeChart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sizechart",
      default: null,
    },

    rating: {
      type: Number,
      default: 0,
    },

    reviewsCount: {
      type: Number,
      default: 0,
    },

    items: {
      type: [productItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;