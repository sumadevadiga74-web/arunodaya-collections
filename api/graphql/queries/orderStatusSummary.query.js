import Order from "../../models/Order.js";

export const orderStatusSummaryTypeDefs = `#graphql
  type OrderStatusSummary {
    status: String!
    orders: Int!
    sales: Float!
  }

  extend type Query {
    orderStatusSummary: [OrderStatusSummary!]!
  }
`;

export const orderStatusSummaryResolvers = {
  Query: {
    orderStatusSummary: async () => {
      const summary = await Order.aggregate([
        {
          $group: {
            _id: "$status",
            orders: { $sum: 1 },
            sales: { $sum: "$totalAmount" },
          },
        },
        {
          $sort: {
            orders: -1,
          },
        },
      ]);

      return summary.map((item) => ({
        status: item._id || "unknown",
        orders: item.orders,
        sales: item.sales,
      }));
    },
  },
};
