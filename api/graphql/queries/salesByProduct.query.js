import Order from "../../models/Order.js";

export const salesByProductTypeDefs = `#graphql
  type SalesByProduct {
    productId: ID!
    sales: Float!
    quantity: Int!
    orders: Int!
  }

  extend type Query {
    salesByProduct: [SalesByProduct!]!
  }
`;

export const salesByProductResolvers = {
  Query: {
    salesByProduct: async () => {
      const products = await Order.aggregate([
        {
          $unwind: "$items",
        },
        {
          $group: {
            _id: "$items.productId",
            sales: { $sum: "$items.totalAmount" },
            quantity: { $sum: "$items.quantity" },
            orders: { $sum: 1 },
          },
        },
        {
          $match: {
            _id: { $ne: null },
          },
        },
        {
          $sort: {
            sales: -1,
          },
        },
      ]);

      return products.map((product) => ({
        productId: product._id,
        sales: product.sales,
        quantity: product.quantity,
        orders: product.orders,
      }));
    },
  },
};