import Colour from "../../models/Colour.js";
import { requireAdmin } from "../../permissions.js";

export const colourMutationTypeDefs = `#graphql
  extend type Mutation {
    createColour(
      name: String!
      code: String
      status: String
    ): Colour!

    updateColour(
      id: ID!
      name: String
      code: String
      status: String
    ): Colour

    deleteColour(id: ID!): Colour
  }
`;

export const colourMutationResolvers = {
  Mutation: {
    createColour: async (_, args, context) => {
      requireAdmin(context);

      return await Colour.create(args);
    },

    updateColour: async (_, { id, ...updates }, context) => {
      requireAdmin(context);

      return await Colour.findByIdAndUpdate(
        id,
        updates,
        { new: true }
      );
    },

    deleteColour: async (_, { id }, context) => {
      requireAdmin(context);

      return await Colour.findByIdAndDelete(id);
    },
  },
};