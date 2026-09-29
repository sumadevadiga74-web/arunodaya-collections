
import Order from "../../models/Order.js";
import { requireAuth } from "../../permissions.js";
import Product from "../../models/Product.js";

export const orderMutationTypeDefs = `#graphql
  input OrderItemInput {
    productId: String!
    quantity: Int!
    size: String
    colour: String
    totalAmount: Float!
  }

  extend type Mutation {
    createOrder(
      userId: String!
      items: [OrderItemInput!]!
      totalAmount: Float!
      paymentMode: String
      status: String
    ): Order!

    updateOrder(
      id: ID!
      userId: String
      items: [OrderItemInput!]
      totalAmount: Float
      paymentMode: String
      status: String
    ): Order

    updateOrderTracking(
      id: ID!
      trackingStatus: String!
    ): Order

    deleteOrder(id: ID!): Order

    cancelOrder(
      id: ID!
      cancellationReason: String!
    ): Order!
  }
`;

export const orderMutationResolvers = {
  Mutation: {
    /* =========================================================
       CREATE ORDER
    ========================================================= */
    createOrder: async (_, args, context) => {
      const user = requireAuth(context);

      const userRole = String(user.role || "")
        .trim()
        .toLowerCase();

      console.log("======================================");
      console.log("CREATE ORDER MUTATION");
      console.log("AUTH USER:", user);
      console.log("AUTH USER ROLE:", userRole);
      console.log("======================================");

      if (
        userRole !== "admin" &&
        String(args.userId) !== String(user.userId)
      ) {
        throw new Error(
          "You can only create an order for yourself"
        );
      }

      /* ---------------------------------------------------------
         CHECK STOCK
      --------------------------------------------------------- */
      for (const item of args.items) {
        const product = await Product.findById(item.productId);

        if (!product) {
          throw new Error(
            `Product not found: ${item.productId}`
          );
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Not enough stock for "${product.name}". Only ${product.stock} left.`
          );
        }
      }

      /* ---------------------------------------------------------
         REDUCE STOCK
      --------------------------------------------------------- */
      for (const item of args.items) {
        console.log(
          "REDUCING STOCK FOR PRODUCT:",
          item.productId,
          "QUANTITY:",
          item.quantity
        );

        const product = await Product.findById(
          item.productId
        );

        if (!product) {
          throw new Error(
            `Product not found: ${item.productId}`
          );
        }

        product.stock -= item.quantity;

        await product.save();
      }

      /* ---------------------------------------------------------
         CREATE ORDER
      --------------------------------------------------------- */
      const order = await Order.create({
        userId: args.userId,
        items: args.items,
        totalAmount: args.totalAmount,
        paymentMode: args.paymentMode || "COD",
        status: args.status || "pending",

        // Delivery tracking starts here
        trackingStatus: "order_placed",

        trackingHistory: [
          {
            status: "order_placed",
            message: "Your order has been received.",
            date: new Date(),
          },
        ],
      });

      console.log(
        "ORDER CREATED:",
        order._id.toString()
      );

      console.log(
        "ORDER STATUS:",
        order.status
      );

      console.log(
        "TRACKING STATUS:",
        order.trackingStatus
      );

      console.log("======================================");

      return order;
    },

    /* =========================================================
       UPDATE ORDER
    ========================================================= */
    updateOrder: async (_, { id, ...updates }, context) => {
      console.log("======================================");
      console.log("UPDATE ORDER MUTATION CALLED");
      console.log("ORDER ID:", id);
      console.log("UPDATES RECEIVED:", updates);

      const user = requireAuth(context);

      console.log("AUTH USER IN UPDATE:", user);
      console.log("AUTH USER ROLE RAW:", user.role);

      const userRole = String(user.role || "")
        .trim()
        .toLowerCase();

      console.log(
        "AUTH USER ROLE NORMALIZED:",
        userRole
      );

      /* ---------------------------------------------------------
         FIND ORDER
      --------------------------------------------------------- */
      const order = await Order.findById(id);

      if (!order) {
        throw new Error("Order not found");
      }

      console.log(
        "OLD ORDER STATUS:",
        order.status
      );

      console.log(
        "ORDER USER ID:",
        order.userId
      );

      console.log(
        "AUTH USER ID:",
        user.userId
      );

      /* ---------------------------------------------------------
         PERMISSION CHECK
      --------------------------------------------------------- */
      if (
        userRole !== "admin" &&
        String(order.userId) !== String(user.userId)
      ) {
        throw new Error(
          "You can only manage your own orders"
        );
      }

      /* ---------------------------------------------------------
         NON-ADMIN CANNOT CHANGE STATUS
      --------------------------------------------------------- */
      if (
        userRole !== "admin" &&
        updates.status !== undefined
      ) {
        delete updates.status;
      }

      /* ---------------------------------------------------------
         NON-ADMIN USERS CANNOT CHANGE USER ID
      --------------------------------------------------------- */
      if (userRole !== "admin") {
        delete updates.userId;
      }

      /* ---------------------------------------------------------
         APPLY USER ID
      --------------------------------------------------------- */
      if (updates.userId !== undefined) {
        order.userId = updates.userId;
      }

      /* ---------------------------------------------------------
         APPLY ITEMS
      --------------------------------------------------------- */
      if (updates.items !== undefined) {
        order.items = updates.items;
      }

      /* ---------------------------------------------------------
         APPLY TOTAL AMOUNT
      --------------------------------------------------------- */
      if (updates.totalAmount !== undefined) {
        order.totalAmount = updates.totalAmount;
      }

      /* ---------------------------------------------------------
         APPLY PAYMENT MODE
      --------------------------------------------------------- */
      if (updates.paymentMode !== undefined) {
        order.paymentMode = updates.paymentMode;
      }

      /* ---------------------------------------------------------
         APPLY STATUS
      --------------------------------------------------------- */
      if (updates.status !== undefined) {
        console.log(
          "SETTING ORDER STATUS TO:",
          updates.status
        );

        order.status = String(updates.status)
          .trim()
          .toLowerCase();
      }

      console.log(
        "STATUS AFTER ASSIGNMENT:",
        order.status
      );

      console.log(
        "STATUS MODIFIED:",
        order.isModified("status")
      );

      /* ---------------------------------------------------------
         SAVE ORDER
      --------------------------------------------------------- */
      await order.save();

      console.log(
        "STATUS AFTER SAVE:",
        order.status
      );

      console.log(
        "NEW ORDER STATUS:",
        order.status
      );

      console.log(
        "ORDER SAVED SUCCESSFULLY:",
        order._id.toString()
      );

      console.log("======================================");

      return order;
    },

    /* =========================================================
       UPDATE DELIVERY TRACKING
    ========================================================= */
    updateOrderTracking: async (
      _,
      { id, trackingStatus },
      context
    ) => {
      const user = requireAuth(context);

      const userRole = String(user.role || "")
        .trim()
        .toLowerCase();

      /* ---------------------------------------------------------
         ONLY ADMIN CAN UPDATE DELIVERY TRACKING
      --------------------------------------------------------- */
      if (userRole !== "admin") {
        throw new Error(
          "Only admin can update delivery tracking."
        );
      }

      /* ---------------------------------------------------------
         VALID TRACKING STAGES
      --------------------------------------------------------- */
      const trackingStages = {
        order_placed: {
          message:
            "Your order has been received.",
        },

        confirmed: {
          message:
            "Your order has been confirmed and is being prepared.",
        },

        packed: {
          message:
            "Your order has been packed and is ready for dispatch.",
        },

        shipped: {
          message:
            "Your package has left our warehouse.",
        },

        in_transit: {
          message:
            "Your package is on the way.",
        },

        out_for_delivery: {
          message:
            "Your package is nearby and will be delivered soon.",
        },

        delivered: {
          message:
            "Your order has been delivered successfully.",
        },
      };

      const normalizedTrackingStatus = String(
        trackingStatus || ""
      )
        .trim()
        .toLowerCase();

      if (!trackingStages[normalizedTrackingStatus]) {
        throw new Error(
          "Invalid tracking status."
        );
      }

      /* ---------------------------------------------------------
         FIND ORDER
      --------------------------------------------------------- */
      const order = await Order.findById(id);

      if (!order) {
        throw new Error("Order not found");
      }

      /* ---------------------------------------------------------
         DO NOTHING IF SAME STAGE IS SELECTED
      --------------------------------------------------------- */
      if (
        order.trackingStatus ===
        normalizedTrackingStatus
      ) {
        return order;
      }

      /* ---------------------------------------------------------
         UPDATE CURRENT TRACKING STATUS
      --------------------------------------------------------- */
      order.trackingStatus =
        normalizedTrackingStatus;

      /* ---------------------------------------------------------
         ADD TRACKING HISTORY
      --------------------------------------------------------- */
      order.trackingHistory.push({
        status: normalizedTrackingStatus,

        message:
          trackingStages[
            normalizedTrackingStatus
          ].message,

        date: new Date(),
      });

      /* ---------------------------------------------------------
         WHEN DELIVERY IS COMPLETE
         ALSO MARK MAIN ORDER AS DELIVERED
      --------------------------------------------------------- */
      if (
        normalizedTrackingStatus ===
        "delivered"
      ) {
        order.status = "delivered";
      }

      await order.save();

      console.log("======================================");
      console.log("DELIVERY TRACKING UPDATED");
      console.log(
        "ORDER ID:",
        order._id.toString()
      );
      console.log(
        "TRACKING STATUS:",
        order.trackingStatus
      );
      console.log(
        "ORDER STATUS:",
        order.status
      );
      console.log("======================================");

      return order;
    },

    /* =========================================================
       DELETE ORDER
    ========================================================= */
    deleteOrder: async (_, { id }, context) => {
      console.log("======================================");
      console.log("DELETE ORDER MUTATION CALLED");
      console.log("ORDER ID:", id);

      const user = requireAuth(context);

      console.log(
        "AUTH USER IN DELETE:",
        user
      );

      console.log(
        "AUTH USER ROLE RAW:",
        user.role
      );

      const userRole = String(user.role || "")
        .trim()
        .toLowerCase();

      console.log(
        "AUTH USER ROLE NORMALIZED:",
        userRole
      );

      /* ---------------------------------------------------------
         FIND ORDER
      --------------------------------------------------------- */
      const order = await Order.findById(id);

      if (!order) {
        throw new Error("Order not found");
      }

      console.log(
        "ORDER FOUND FOR DELETE:",
        order._id.toString()
      );

      console.log(
        "ORDER OWNER:",
        order.userId
      );

      console.log(
        "AUTH USER ID:",
        user.userId
      );

      /* ---------------------------------------------------------
         PERMISSION CHECK
      --------------------------------------------------------- */
      if (
        userRole !== "admin" &&
        String(order.userId) !== String(user.userId)
      ) {
        throw new Error(
          "You can only manage your own orders"
        );
      }

      /* ---------------------------------------------------------
         DELETE ORDER
      --------------------------------------------------------- */
      const deletedOrder =
        await Order.findByIdAndDelete(id);

      if (!deletedOrder) {
        throw new Error(
          "Order could not be deleted"
        );
      }

      console.log(
        "ORDER DELETED SUCCESSFULLY:",
        id
      );

      console.log("======================================");

      return deletedOrder;
    },

    /* =========================================================
       CANCEL ORDER
    ========================================================= */
    cancelOrder: async (
      _,
      { id, cancellationReason },
      context
    ) => {
      const user = requireAuth(context);

      const userRole = String(user.role || "")
        .trim()
        .toLowerCase();

      console.log("======================================");
      console.log("CANCEL ORDER MUTATION");
      console.log("ORDER ID:", id);
      console.log("AUTH USER:", user);
      console.log("AUTH USER ROLE:", userRole);
      console.log("======================================");

      const order = await Order.findById(id);

      if (!order) {
        throw new Error("Order not found");
      }

      /* ---------------------------------------------------------
         PERMISSION CHECK
      --------------------------------------------------------- */
      if (
        userRole !== "admin" &&
        String(order.userId) !== String(user.userId)
      ) {
        throw new Error(
          "You can only cancel your own orders."
        );
      }

      /* ---------------------------------------------------------
         CURRENT ORDER STATUS
      --------------------------------------------------------- */
      const currentStatus = String(
        order.status || ""
      )
        .trim()
        .toLowerCase();

      /* ---------------------------------------------------------
         CURRENT TRACKING STATUS
      --------------------------------------------------------- */
      const currentTrackingStatus = String(
        order.trackingStatus ||
          "order_placed"
      )
        .trim()
        .toLowerCase();

      /* ---------------------------------------------------------
         ALREADY CANCELLED
      --------------------------------------------------------- */
      if (currentStatus === "cancelled") {
        throw new Error(
          "This order has already been cancelled."
        );
      }

      /* ---------------------------------------------------------
         DELIVERED ORDERS
      --------------------------------------------------------- */
      if (
        currentStatus === "delivered" ||
        currentTrackingStatus === "delivered"
      ) {
        throw new Error(
          "Delivered orders cannot be cancelled."
        );
      }

      /* ---------------------------------------------------------
         SHIPPED / IN TRANSIT / OUT FOR DELIVERY
      --------------------------------------------------------- */
      const cannotCancelAfterShipping = [
        "shipped",
        "in_transit",
        "out_for_delivery",
      ];

      if (
        cannotCancelAfterShipping.includes(
          currentTrackingStatus
        )
      ) {
        throw new Error(
          "This order cannot be cancelled because it has already been shipped."
        );
      }

      /* ---------------------------------------------------------
         CHECK CANCELLATION REASON
      --------------------------------------------------------- */
      if (
        !cancellationReason ||
        !cancellationReason.trim()
      ) {
        throw new Error(
          "Please provide a reason for cancelling the order."
        );
      }

      /* ---------------------------------------------------------
         UPDATE CANCELLATION DETAILS
      --------------------------------------------------------- */
      order.status = "cancelled";

      order.cancellationReason =
        cancellationReason.trim();

      order.cancellationDate = new Date();

      await order.save();

      console.log(
        "ORDER CANCELLED SUCCESSFULLY:",
        order._id.toString()
      );

      console.log("======================================");

      return order;
    },
  },
};

