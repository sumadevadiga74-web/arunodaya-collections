import Colour from "../../models/Colour.js";

export const colourTypeDefs = `#graphql
  type Colour {
    id: ID!
    name: String!
    code: String
    status: String
    createdAt: String
    updatedAt: String
  }

  extend type Query {
    colours: [Colour!]!
  }
`;

export const colourResolvers = {
  Query: {
    colours: async () => {
      return await Colour.find();
    },
  },

  Colour: {
    id: (parent) => parent._id.toString(),
  },
};