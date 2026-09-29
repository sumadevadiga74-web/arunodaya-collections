import Contest from "../../models/Contest.js";
import { requireAdmin } from "../../permissions.js";

export const contestMutationTypeDefs = `#graphql
  extend type Mutation {
    createContest(
      title: String!
      description: String
      image: String
      status: String
    ): Contest!

    updateContest(
      id: ID!
      title: String
      description: String
      image: String
      status: String
    ): Contest

    deleteContest(id: ID!): Contest
  }
`;

export const contestMutationResolvers = {
  Mutation: {
    createContest: async (_, args, context) => {
      requireAdmin(context);

      return await Contest.create(args);
    },

    updateContest: async (_, { id, ...updates }, context) => {
      requireAdmin(context);

      return await Contest.findByIdAndUpdate(
        id,
        updates,
        { new: true }
      );
    },

    deleteContest: async (_, { id }, context) => {
      requireAdmin(context);

      return await Contest.findByIdAndDelete(id);
    },
  },
};