import Page from "../../models/Page.js";

export const pageTypeDefs = `#graphql
  type Page {
    id: ID!
    title: String
    slug: String
    content: String
    image: String
    status: String
    createdAt: String
    updatedAt: String
  }

  extend type Query {
    pages: [Page!]!
    page(id: ID!): Page
    pageBySlug(slug: String!): Page
  }
`;

export const pageResolvers = {
  Query: {
    pages: async () => {
      return await Page.find();
    },

    page: async (_, { id }) => {
      return await Page.findById(id);
    },

    pageBySlug: async (_, { slug }) => {
      return await Page.findOne({ slug });
    },
  },

  Page: {
    id: (parent) => parent._id.toString(),
  },
};