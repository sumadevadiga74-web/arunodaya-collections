import Page from "../../models/Page.js";

export const pageMutationTypeDefs = `#graphql
  extend type Mutation {
    createPage(
      title: String!
      slug: String!
      content: String
      image: String
      status: String
    ): Page!

    updatePage(
      id: ID!
      title: String
      slug: String
      content: String
      image: String
      status: String
    ): Page

    deletePage(id: ID!): Page
  }
`;

export const pageMutationResolvers = {
  Mutation: {
    createPage: async (_, args) => {
      return await Page.create(args);
    },

    updatePage: async (_, { id, ...updates }) => {
      return await Page.findByIdAndUpdate(
        id,
        updates,
        { new: true }
      );
    },

    deletePage: async (_, { id }) => {
      return await Page.findByIdAndDelete(id);
    },
  },
};