import Article from "../../models/Article.js";

export const articleTypeDefs = `#graphql
  type Article {
    id: ID!
    title: String!
    description: String
    image: String
    status: String
    createdAt: String
    updatedAt: String
  }

  extend type Query {
    articles: [Article!]!
  }
`;

export const articleResolvers = {
  Query: {
    articles: async () => {
      return await Article.find();
    },
  },

  Article: {
    id: (parent) => parent._id.toString(),
  },
};