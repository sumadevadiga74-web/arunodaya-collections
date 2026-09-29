import mongoose from "mongoose";
import Basket from "../../models/Basket.js";
import Product from "../../models/Product.js";
import { requireAuth } from "../../permissions.js";

export const basketTypeDefs = `#graphql
  type Basket {
    id: ID!
    userId: String!
    productId: String!
    size: String
    colour: String
    quantity: Int!
    status: String
    createdAt: String
    updatedAt: String
  }

  extend type Query {
    baskets: [Basket!]!
  }
`;

export const basketResolvers = {
  Query: {
    baskets: async (_, __, context) => {
      const user = requireAuth(context);

      let baskets;

      if (user.role === "admin") {
        baskets = await Basket.find();
      } else {
        baskets = await Basket.find({
          userId: user.userId,
        });
      }

      const validBaskets = [];

      for (const basket of baskets) {
        // --------------------------------------------------
        // Ignore old/invalid product IDs
        // --------------------------------------------------

        if (
          !basket.productId ||
          !mongoose.Types.ObjectId.isValid(
            String(basket.productId)
          )
        ) {
          console.warn(
            "⚠️ Ignoring basket with invalid productId:",
            basket._id?.toString(),
            basket.productId
          );

          continue;
        }

        // --------------------------------------------------
        // Check whether product still exists
        // --------------------------------------------------

        const productExists = await Product.exists({
          _id: basket.productId,
        });

        if (!productExists) {
          console.warn(
            "⚠️ Ignoring basket for deleted product:",
            basket.productId
          );

          continue;
        }

        validBaskets.push(basket);
      }

      return validBaskets;
    },
  },

  Basket: {
    id: (parent) => parent._id.toString(),
  },
};