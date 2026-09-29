import Basket from "../../models/Basket.js";
import { requireAuth } from "../../permissions.js";

export const basketMutationTypeDefs = `#graphql
  extend type Mutation {
    createBasket(
      userId: String!
      productId: String!
      quantity: Int
      size: String
      colour: String
      status: String
    ): Basket!

    updateBasket(
      id: ID!
      userId: String
      productId: String
      quantity: Int
      size: String
      colour: String
      status: String
    ): Basket

    deleteBasket(id: ID!): Basket
  }
`;

export const basketMutationResolvers = {
  Mutation: {
    createBasket: async (_, args, context) => {
      const user = requireAuth(context);

      if (
        user.role !== "admin" &&
        String(args.userId) !== String(user.userId)
      ) {
        throw new Error(
          "You can only manage your own basket"
        );
      }

      const existingBasket = await Basket.findOne({
        userId: args.userId,
        productId: args.productId,
        size: args.size || "",
        colour: args.colour || "",
        status: "active",
      });

      if (existingBasket) {
        existingBasket.quantity =
          (existingBasket.quantity || 0) +
          (args.quantity || 1);

        return await existingBasket.save();
      }

      return await Basket.create({
        ...args,
        size: args.size || "",
        colour: args.colour || "",
        quantity: args.quantity || 1,
      });
    },

    updateBasket: async (_, args, context) => {
      const user = requireAuth(context);

      const basket = await Basket.findById(args.id);

      if (!basket) {
        throw new Error("Basket not found");
      }

      if (
        user.role !== "admin" &&
        String(basket.userId) !== String(user.userId)
      ) {
        throw new Error(
          "You can only manage your own basket"
        );
      }

      if (
        args.quantity !== undefined &&
        args.quantity !== null
      ) {
        if (args.quantity < 1) {
          throw new Error(
            "Quantity must be at least 1"
          );
        }

        basket.quantity = args.quantity;
      }

      if (args.userId !== undefined) {
        basket.userId = args.userId;
      }

      if (args.productId !== undefined) {
        basket.productId = args.productId;
      }

      if (args.size !== undefined) {
        basket.size = args.size;
      }

      if (args.colour !== undefined) {
        basket.colour = args.colour;
      }

      if (args.status !== undefined) {
        basket.status = args.status;
      }

      return await basket.save();
    },

    deleteBasket: async (_, { id }, context) => {
      const user = requireAuth(context);

      const basket = await Basket.findById(id);

      if (!basket) {
        throw new Error("Basket not found");
      }

      if (
        user.role !== "admin" &&
        String(basket.userId) !== String(user.userId)
      ) {
        throw new Error(
          "You can only manage your own basket"
        );
      }

      return await Basket.findByIdAndDelete(id);
    },
  },
};