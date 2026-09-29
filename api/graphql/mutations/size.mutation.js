import Size from "../../models/Size.js";
import { requireAdmin } from "../../permissions.js";

export const sizeMutationTypeDefs = `#graphql
  extend type Mutation {
    createSize(
      name: String!
      status: String
    ): Size!

    updateSize(
      id: ID!
      name: String
      status: String
    ): Size

    deleteSize(id: ID!): Size
  }
`;

export const sizeMutationResolvers = {
  Mutation: {
    createSize: async (_, args, context) => {
      requireAdmin(context);

      return await Size.create(args);
    },

    updateSize: async (_, { id, ...updates }, context) => {
      requireAdmin(context);

      return await Size.findByIdAndUpdate(
        id,
        updates,
        { new: true }
      );
    },

    deleteSize: async (_, { id }, context) => {
      requireAdmin(context);

      return await Size.findByIdAndDelete(id);
    },
  },
};