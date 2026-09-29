import Order from "../../models/Order.js";

export const monthlySalesSummaryTypeDefs = `#graphql
  type MonthlySalesSummary {
    month: String!
    sales: Float!
    orders: Int!
    quantity: Int!
  }

  extend type Query {
    monthlySalesSummary: [MonthlySalesSummary!]!
  }
`;

export const monthlySalesSummaryResolvers = {
  Query: {
    monthlySalesSummary: async () => {
      const summary = await Order.aggregate([
        {
          $group: {
            _id: {
              year: { $year: { $toDate: "$createdAt" } },
              month: { $month: { $toDate: "$createdAt" } },
            },
            sales: { $sum: "$totalAmount" },
            orders: { $sum: 1 },
            quantity: { $sum: "$quantity" },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]);

      return summary.map((item) => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
        sales: item.sales,
        orders: item.orders,
        quantity: item.quantity,
      }));
    },
  },
};
