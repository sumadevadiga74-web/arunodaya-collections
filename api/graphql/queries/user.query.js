import User from "../../models/User.js";
import { requireAdmin } from "../../permissions.js";

export const userTypeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    phone: String
    role: String!
    status: String
    createdAt: String
    updatedAt: String
  }

  extend type Query {
    users: [User!]!
  }
`;

export const userResolvers = {
  Query: {
    users: async (_, __, context) => {
      requireAdmin(context);

      return await User.find()
        .select("-password")
        .sort({ createdAt: -1 });
    },
  },

  User: {
    id: (parent) => parent._id.toString(),

    createdAt: (parent) =>
      parent.createdAt
        ? parent.createdAt.toISOString()
        : null,

    updatedAt: (parent) =>
      parent.updatedAt
        ? parent.updatedAt.toISOString()
        : null,
  },
};