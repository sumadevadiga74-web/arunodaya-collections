import Product from "../../models/Product.js";
import Category from "../../models/Category.js";
import Brand from "../../models/Brand.js";
import User from "../../models/User.js";
import Order from "../../models/Order.js";

export const dashboardStatsTypeDefs = `#graphql
  type DashboardStats {
    totalProducts: Int!
    totalCategories: Int!
    totalBrands: Int!
    totalUsers: Int!
    totalOrders: Int!
    totalSales: Float!
  }

  extend type Query {
    dashboardStats: DashboardStats!
  }
`;

export const dashboardStatsResolvers = {
  Query: {
    dashboardStats: async () => {
      const [
        totalProducts,
        totalCategories,
        totalBrands,
        totalUsers,
        totalOrders,
        salesResult,
      ] = await Promise.all([
        Product.countDocuments(),
        Category.countDocuments(),
        Brand.countDocuments(),
        User.countDocuments(),
        Order.countDocuments(),
        Order.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: "$totalAmount" },
            },
          },
        ]),
      ]);

      return {
        totalProducts,
        totalCategories,
        totalBrands,
        totalUsers,
        totalOrders,
        totalSales: salesResult[0]?.total || 0,
      };
    },
  },
};
