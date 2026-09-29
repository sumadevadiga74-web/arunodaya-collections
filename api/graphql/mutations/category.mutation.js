import Category from "../../models/Category.js";
import { requireAdmin } from "../../permissions.js";

export const categoryMutationTypeDefs = `#graphql
  extend type Mutation {
    createCategory(
      name: String!
      description: String
      image: String
      status: String
    ): Category!

    updateCategory(
      id: ID!
      name: String
      description: String
      image: String
      status: String
    ): Category

    deleteCategory(id: ID!): Category
  }
`;

export const categoryMutationResolvers = {
  Mutation: {
    createCategory: async (_, args, context) => {
      requireAdmin(context);

      return await Category.create(args);
    },

    updateCategory: async (_, { id, ...updates }, context) => {
      requireAdmin(context);

      return await Category.findByIdAndUpdate(
        id,
        updates,
        { new: true }
      );
    },

    deleteCategory: async (_, { id }, context) => {
      requireAdmin(context);

      return await Category.findByIdAndDelete(id);
    },
  },
};