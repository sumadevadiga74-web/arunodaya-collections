import Wishlist from "../../models/Wishlist.js";
import Product from "../../models/Product.js";
import { requireAuth } from "../../permissions.js";

export const wishlistTypeDefs = `#graphql
  type Wishlist {
    id: ID!
    userId: String!
    productId: String!
    status: String
    createdAt: String
    updatedAt: String
    product: Product
  }

  extend type Query {
    wishlists: [Wishlist!]!
  }
`;

export const wishlistResolvers = {
  Query: {
    wishlists: async (_, __, context) => {
      const user = requireAuth(context);

      if (user.role === "admin") {
        return await Wishlist.find();
      }

      return await Wishlist.find({
        userId: user.userId,
      });
    },
  },

  Wishlist: {
    id: (parent) => parent._id.toString(),
product: async (parent) => {
  try {
    const product = await Product.findOne({
      _id: parent.productId,
    });

    return product;
  } catch (error) {
    console.error(
      "Wishlist product lookup failed:",
      parent.productId,
      error
    );

    return null;
  }
},
  },
};