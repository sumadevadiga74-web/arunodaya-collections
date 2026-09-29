
import Brand from "../../models/Brand.js";

export const brandTypeDefs = `#graphql

  type Brand {
    id: ID!
    name: String!
    description: String
    image: String
    status: String
    createdAt: String
    updatedAt: String
  }

  extend type Query {
    brands: [Brand!]!
    loadBrands: [Brand!]!
  }

`;

export const brandResolvers = {
  Query: {
    brands: async () => {
      return await Brand.find();
    },

    loadBrands: async () => {
      return await Brand.find();
    },
  },

  Brand: {
    id: (parent) => parent._id.toString(),
  },
};

