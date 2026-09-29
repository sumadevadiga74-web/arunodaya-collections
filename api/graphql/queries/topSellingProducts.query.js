import Order from "../../models/Order.js";

export const topSellingProductsTypeDefs = `#graphql
  type TopSellingProduct {
    productId: ID!
    quantity: Int!
    sales: Float!
    orders: Int!
  }

  extend type Query {
    topSellingProducts: [TopSellingProduct!]!
  }
`;

export const topSellingProductsResolvers = {
  Query: {
    topSellingProducts: async () => {
      const products = await Order.aggregate([
        {
          $group: {
            _id: "$productId",
            quantity: { $sum: "$quantity" },
            sales: { $sum: "$totalAmount" },
            orders: { $sum: 1 },
          },
        },
        {
          $sort: {
            quantity: -1,
          },
        },
        {
          $limit: 5,
        },
      ]);

      return products.map((product) => ({
        productId: product._id,
        quantity: product.quantity,
        sales: product.sales,
        orders: product.orders,
      }));
    },
  },
};
