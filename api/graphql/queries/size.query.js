import Size from "../../models/Size.js";

export const sizeTypeDefs = `#graphql
  type Size {
    id: ID!
    name: String!
    status: String
    createdAt: String
    updatedAt: String
  }

  extend type Query {
    sizes: [Size!]!
  }
`;

export const sizeResolvers = {
  Query: {
    sizes: async () => {
      return await Size.find();
    },
  },

  Size: {
    id: (parent) => parent._id.toString(),
  },
};