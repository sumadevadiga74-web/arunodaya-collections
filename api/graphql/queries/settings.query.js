import Settings from "../../models/Settings.js";

export const settingsTypeDefs = `#graphql
  type Settings {
    id: ID!
    siteName: String
    siteDescription: String
    logo: String
    email: String
    phone: String
    address: String
    status: String
    createdAt: String
    updatedAt: String
  }

  extend type Query {
    settings: Settings
  }
`;

export const settingsResolvers = {
  Query: {
    settings: async () => {
      return await Settings.findOne();
    },
  },

  Settings: {
    id: (parent) => parent._id.toString(),
  },
};
