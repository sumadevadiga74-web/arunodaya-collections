import Wishlist from "../../models/Wishlist.js";
import { requireAuth } from "../../permissions.js";

export const wishlistMutationTypeDefs = `#graphql
  extend type Mutation {
    createWishlist(
      userId: String!
      productId: String!
      status: String
    ): Wishlist!

    deleteWishlist(id: ID!): Wishlist
  }
`;

export const wishlistMutationResolvers = {
  Mutation: {
    createWishlist: async (_, args, context) => {
      const user = requireAuth(context);

      if (
        user.role !== "admin" &&
        args.userId !== user.userId
      ) {
        throw new Error("You can only manage your own wishlist");
      }

      const existingWishlist = await Wishlist.findOne({
        userId: args.userId,
        productId: args.productId,
        status: "active",
      });

      if (existingWishlist) {
        return existingWishlist;
      }

      return await Wishlist.create(args);
    },

    deleteWishlist: async (_, { id }, context) => {
      const user = requireAuth(context);

      const wishlist = await Wishlist.findById(id);

      if (!wishlist) {
        throw new Error("Wishlist item not found");
      }

      if (
        user.role !== "admin" &&
        wishlist.userId !== user.userId
      ) {
        throw new Error("You can only manage your own wishlist");
      }

      return await Wishlist.findByIdAndDelete(id);
    },
  },
};