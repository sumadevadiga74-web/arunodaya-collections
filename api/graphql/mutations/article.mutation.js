import Article from "../../models/Article.js";
import { requireAdmin } from "../../permissions.js";

export const articleMutationTypeDefs = `#graphql
  extend type Mutation {
    createArticle(
      title: String!
      description: String
      image: String
      status: String
    ): Article!

    updateArticle(
      id: ID!
      title: String
      description: String
      image: String
      status: String
    ): Article

    deleteArticle(id: ID!): Article
  }
`;

export const articleMutationResolvers = {
  Mutation: {
    createArticle: async (_, args, context) => {
      requireAdmin(context);

      return await Article.create(args);
    },

    updateArticle: async (_, { id, ...updates }, context) => {
      requireAdmin(context);

      return await Article.findByIdAndUpdate(
        id,
        updates,
        { new: true }
      );
    },

    deleteArticle: async (_, { id }, context) => {
      requireAdmin(context);

      return await Article.findByIdAndDelete(id);
    },
  },
};