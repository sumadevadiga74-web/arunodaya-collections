
import mongoose from "mongoose";
import Order from "../../models/Order.js";
import User from "../../models/User.js";
import Product from "../../models/Product.js";

export const orderTypeDefs = `#graphql

type OrderItem {
  productId: String!
  quantity: Int!
  size: String
  colour: String
  totalAmount: Float!
  productName: String
  productImage: String
  productPrice: Float
}

type OrderCustomer {
  id: ID!
  name: String
  email: String
  phone: String
}

type TrackingHistoryItem {
  status: String!
  message: String
  date: String
}

type Order {
  id: ID!
  userId: String!
  customer: OrderCustomer
  items: [OrderItem!]!
  totalAmount: Float!
  paymentMode: String
  status: String

  # Delivery tracking
  trackingStatus: String
  trackingHistory: [TrackingHistoryItem!]!

  cancellationReason: String
  cancellationDate: String
  createdAt: String
  updatedAt: String
}

type SalesByStatus {
  status: String!
  sales: Float!
  orders: Int!
  quantity: Int!
}

type SalesByDate {
  date: String!
  sales: Float!
  orders: Int!
  quantity: Int!
}

extend type Query {
  orders: [Order!]!
  salesByStatus: [SalesByStatus!]!
  salesByDate: [SalesByDate!]!
}
`;

export const orderResolvers = {
  Query: {
    orders: async () => {
      const orders = await Order.find().sort({
        createdAt: -1,
      });

      return await Promise.all(
        orders.map(async (order) => {
          let customer = null;

          // Find customer only when userId is a valid MongoDB ObjectId
          if (
            order.userId &&
            mongoose.Types.ObjectId.isValid(
              String(order.userId)
            )
          ) {
            customer = await User.findById(
              String(order.userId)
            );
          }

          const items = await Promise.all(
            (order.items || []).map(async (item) => {
              let product = null;

              // Find product only when productId is a valid ObjectId
              if (
                item.productId &&
                mongoose.Types.ObjectId.isValid(
                  String(item.productId)
                )
              ) {
                product = await Product.findById(
                  String(item.productId)
                );
              }

              return {
                ...item.toObject(),

                productName:
                  product?.name ||
                  "Unknown Product",

                productImage:
                  product?.image || "",

                productPrice:
                  product?.price ?? 0,
              };
            })
          );

          return {
            ...order.toObject(),

            customer: customer
              ? {
                  id: customer._id.toString(),
                  name: customer.name,
                  email: customer.email,
                  phone: customer.phone || "",
                }
              : null,

            items,
          };
        })
      );
    },

    salesByStatus: async () => {
      return await Order.aggregate([
        {
          $group: {
            _id: "$status",

            sales: {
              $sum: "$totalAmount",
            },

            orders: {
              $sum: 1,
            },

            quantity: {
              $sum: {
                $reduce: {
                  input: "$items",
                  initialValue: 0,

                  in: {
                    $add: [
                      "$$value",
                      "$$this.quantity",
                    ],
                  },
                },
              },
            },
          },
        },

        {
          $project: {
            _id: 0,
            status: "$_id",
            sales: 1,
            orders: 1,
            quantity: 1,
          },
        },

        {
          $sort: {
            sales: -1,
          },
        },
      ]);
    },

    salesByDate: async () => {
      return await Order.aggregate([
        {
          $match: {
            createdAt: {
              $exists: true,
              $ne: null,
            },
          },
        },

        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },

            sales: {
              $sum: "$totalAmount",
            },

            orders: {
              $sum: 1,
            },

            quantity: {
              $sum: {
                $reduce: {
                  input: "$items",
                  initialValue: 0,

                  in: {
                    $add: [
                      "$$value",
                      "$$this.quantity",
                    ],
                  },
                },
              },
            },
          },
        },

        {
          $project: {
            _id: 0,
            date: "$_id",
            sales: 1,
            orders: 1,
            quantity: 1,
          },
        },

        {
          $sort: {
            date: 1,
          },
        },
      ]);
    },
  },

  Order: {
    id: (parent) =>
      parent._id.toString(),

    cancellationDate: (parent) =>
      parent.cancellationDate
        ? parent.cancellationDate.toISOString()
        : null,

    createdAt: (parent) =>
      parent.createdAt
        ? parent.createdAt.toISOString()
        : null,

    updatedAt: (parent) =>
      parent.updatedAt
        ? parent.updatedAt.toISOString()
        : null,

    trackingStatus: (parent) =>
      parent.trackingStatus || "order_placed",

    trackingHistory: (parent) => {
      if (
        !parent.trackingHistory ||
        parent.trackingHistory.length === 0
      ) {
        return [
          {
            status: "order_placed",
            message: "Your order has been received.",
            date: parent.createdAt || new Date(),
          },
        ];
      }

      return parent.trackingHistory.map((item) => ({
        status: item.status,
        message: item.message || "",
        date: item.date
          ? item.date.toISOString()
          : new Date().toISOString(),
      }));
    },
  },
};
