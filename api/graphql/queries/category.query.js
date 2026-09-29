import Category from "../../models/Category.js";

export const categoryTypeDefs = `#graphql
  type Category {
    id: ID!
    name: String!
    description: String
    image: String
    status: String
    createdAt: String
    updatedAt: String
  }

  extend type Query {
    categories: [Category!]!
  }
`;

export const categoryResolvers = {
  Query: {
    categories: async () => {
      return await Category.find();
    },
  },

  Category: {
    id: (parent) => parent._id.toString(),
  },
};