import Brand from "../../models/Brand.js";
import { requireAdmin } from "../../permissions.js";

export const brandMutationTypeDefs = `#graphql
  extend type Mutation {
    createBrand(
      name: String!
      description: String
      image: String
      status: String
    ): Brand!

    updateBrand(
      id: ID!
      name: String
      description: String
      image: String
      status: String
    ): Brand

    deleteBrand(id: ID!): Brand
  }
`;

export const brandMutationResolvers = {
  Mutation: {
    createBrand: async (_, args, context) => {
      requireAdmin(context);

      return await Brand.create(args);
    },

    updateBrand: async (_, { id, ...updates }, context) => {
      requireAdmin(context);

      return await Brand.findByIdAndUpdate(
        id,
        updates,
        { new: true }
      );
    },

    deleteBrand: async (_, { id }, context) => {
      requireAdmin(context);

      return await Brand.findByIdAndDelete(id);
    },
  },
};