import Order from "../../models/Order.js";

export const recentOrdersTypeDefs = `#graphql
  type RecentOrder {
    id: ID!
    userId: String!
    productId: String!
    quantity: Int!
    totalAmount: Float!
    status: String
    createdAt: String
  }

  extend type Query {
    recentOrders: [RecentOrder!]!
  }
`;

export const recentOrdersResolvers = {
  Query: {
    recentOrders: async () => {
      const orders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5);

      return orders
        .filter((order) => order.items && order.items.length > 0)
        .map((order) => ({
          id: order._id.toString(),
          userId: order.userId,
          productId: order.items[0].productId,
          quantity: order.items[0].quantity,
          totalAmount: order.items[0].totalAmount,
          status: order.status,
          createdAt: order.createdAt,
        }));
    },
  },
};