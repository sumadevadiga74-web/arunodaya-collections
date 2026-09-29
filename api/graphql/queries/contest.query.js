import Contest from "../../models/Contest.js";

export const contestTypeDefs = `#graphql
  type Contest {
    id: ID!
    title: String!
    description: String
    image: String
    status: String
    createdAt: String
    updatedAt: String
  }

  extend type Query {
    contests: [Contest!]!
  }
`;

export const contestResolvers = {
  Query: {
    contests: async () => {
      return await Contest.find();
    },
  },

  Contest: {
    id: (parent) => parent._id.toString(),
  },
};