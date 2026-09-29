
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      default: 1,
    },

    size: {
      type: String,
      default: "",
    },

    colour: {
      type: String,
      default: "",
    },

    totalAmount: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

/* =========================================================
   DELIVERY TRACKING HISTORY
========================================================= */

const trackingHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      default: "",
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

/* =========================================================
   ORDER SCHEMA
========================================================= */

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    paymentMode: {
      type: String,
      default: "COD",
    },

    /* =====================================================
       EXISTING ORDER STATUS

       This remains unchanged.

       Values:
       pending
       processing
       completed
       delivered
       cancelled
    ===================================================== */

    status: {
      type: String,
      default: "pending",
    },

    /* =====================================================
       DELIVERY TRACKING STATUS

       This is separate from the main order status.

       Values:
       order_placed
       confirmed
       packed
       shipped
       in_transit
       out_for_delivery
       delivered
    ===================================================== */

    trackingStatus: {
      type: String,
      default: "order_placed",
    },

    /* =====================================================
       DELIVERY TRACKING HISTORY

       Stores every delivery-stage update.
    ===================================================== */

    trackingHistory: {
      type: [trackingHistorySchema],
      default: [],
    },

    /* =====================================================
       CANCELLATION DETAILS
    ===================================================== */

    cancellationReason: {
      type: String,
      default: "",
    },

    cancellationDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;

