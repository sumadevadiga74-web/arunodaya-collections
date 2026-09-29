import Order from "../../models/Order.js";

export const salesChartTypeDefs = `#graphql
  type SalesChartData {
    date: String!
    sales: Float!
    orders: Int!
    quantity: Int!
  }

  extend type Query {
    salesChart: [SalesChartData!]!
  }
`;

export const salesChartResolvers = {
  Query: {
    salesChart: async () => {
      const orders = await Order.find().sort({ createdAt: 1 });

      const monthlySales = {};

      for (const order of orders) {
        const date = new Date(order.createdAt);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");

        const key = `${year}-${month}`;

        if (!monthlySales[key]) {
          monthlySales[key] = {
            date: key,
            sales: 0,
            orders: 0,
            quantity: 0,
          };
        }

        monthlySales[key].sales += Number(order.totalAmount || 0);
        monthlySales[key].orders += 1;
        monthlySales[key].quantity += Number(order.quantity || 0);
      }

      return Object.values(monthlySales);
    },
  },
};
