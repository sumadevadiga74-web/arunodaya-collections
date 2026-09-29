import Settings from "../../models/Settings.js";

export const settingsMutationTypeDefs = `#graphql
  extend type Mutation {
    createSettings(
      siteName: String
      siteDescription: String
      logo: String
      email: String
      phone: String
      address: String
      status: String
    ): Settings!

    updateSettings(
      id: ID!
      siteName: String
      siteDescription: String
      logo: String
      email: String
      phone: String
      address: String
      status: String
    ): Settings

    deleteSettings(id: ID!): Settings
  }
`;

export const settingsMutationResolvers = {
  Mutation: {
    createSettings: async (_, args) => {
      return await Settings.create(args);
    },

    updateSettings: async (_, { id, ...updates }) => {
      return await Settings.findByIdAndUpdate(
        id,
        updates,
        { new: true }
      );
    },

    deleteSettings: async (_, { id }) => {
      return await Settings.findByIdAndDelete(id);
    },
  },
};
