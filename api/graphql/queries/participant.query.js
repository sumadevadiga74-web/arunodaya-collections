import Participant from "../../models/Participant.js";

export const participantTypeDefs = `#graphql
  type Participant {
    id: ID!
    name: String!
    email: String!
    phone: String
    contestId: String
    status: String
    createdAt: String
    updatedAt: String
  }

  extend type Query {
    participants: [Participant!]!
  }
`;

export const participantResolvers = {
  Query: {
    participants: async () => {
      return await Participant.find();
    },
  },

  Participant: {
    id: (parent) => parent._id.toString(),
  },
};