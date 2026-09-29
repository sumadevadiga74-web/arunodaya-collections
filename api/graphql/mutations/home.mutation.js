import Home from "../../models/Home.js";

export const homeMutationTypeDefs = `#graphql
  extend type Mutation {
    createHome(
      title: String!
      description: String
      image: String
      status: String
    ): Home!

    updateHome(
      id: ID!
      title: String
      description: String
      image: String
      status: String
    ): Home

    deleteHome(id: ID!): Home
  }
`;

export const homeMutationResolvers = {
  Mutation: {
    createHome: async (_, args) => {
      return await Home.create(args);
    },

    updateHome: async (_, { id, ...updates }) => {
      return await Home.findByIdAndUpdate(
        id,
        updates,
        { new: true }
      );
    },

    deleteHome: async (_, { id }) => {
      return await Home.findByIdAndDelete(id);
    },
  },
};