import Home from "../../models/Home.js";

export const homeTypeDefs = `#graphql
  type Home {
    id: ID!
    title: String
    description: String
    image: String
    status: String
  }

  extend type Query {
    home: Home
  }
`;

export const homeResolvers = {
  Query: {
    home: async () => {
      return await Home.findOne().sort({ createdAt: -1 });
    },
  },
};