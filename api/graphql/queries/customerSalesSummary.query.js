import Order from "../../models/Order.js";

export const customerSalesSummaryTypeDefs = `#graphql
  type CustomerSalesSummary {
    userId: ID!
    orders: Int!
    quantity: Int!
    sales: Float!
  }

  extend type Query {
    customerSalesSummary: [CustomerSalesSummary!]!
  }
`;

export const customerSalesSummaryResolvers = {
  Query: {
    customerSalesSummary: async () => {
      const summary = await Order.aggregate([
        {
          $group: {
            _id: "$userId",
            orders: { $sum: 1 },
            quantity: { $sum: "$quantity" },
            sales: { $sum: "$totalAmount" },
          },
        },
        {
          $sort: {
            sales: -1,
          },
        },
      ]);

      return summary.map((item) => ({
        userId: item._id,
        orders: item.orders,
        quantity: item.quantity,
        sales: item.sales,
      }));
    },
  },
};
