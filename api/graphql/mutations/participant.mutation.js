import Participant from "../../models/Participant.js";
import { requireAdmin } from "../../permissions.js";

export const participantMutationTypeDefs = `#graphql
  extend type Mutation {
    createParticipant(
      name: String!
      email: String!
      phone: String
      contestId: String
      status: String
    ): Participant!

    updateParticipant(
      id: ID!
      name: String
      email: String
      phone: String
      contestId: String
      status: String
    ): Participant

    deleteParticipant(id: ID!): Participant
  }
`;

export const participantMutationResolvers = {
  Mutation: {
    createParticipant: async (_, args, context) => {
      requireAdmin(context);

      return await Participant.create(args);
    },

    updateParticipant: async (_, { id, ...updates }, context) => {
      requireAdmin(context);

      return await Participant.findByIdAndUpdate(
        id,
        updates,
        { new: true }
      );
    },

    deleteParticipant: async (_, { id }, context) => {
      requireAdmin(context);

      return await Participant.findByIdAndDelete(id);
    },
  },
};