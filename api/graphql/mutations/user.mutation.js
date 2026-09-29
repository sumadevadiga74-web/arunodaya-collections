import User from "../../models/User.js";
import { requireAuth, requireAdmin } from "../../permissions.js";

export const userMutationTypeDefs = `#graphql
  extend type Mutation {
    createUser(
      name: String!
      email: String!
      phone: String
      status: String
    ): User!

    updateUser(
      id: ID!
      name: String
      email: String
      phone: String
      status: String
    ): User

    deleteUser(id: ID!): User
  }
`;

export const userMutationResolvers = {
  Mutation: {
    createUser: async (_, args, context) => {
      requireAdmin(context);

      return await User.create({
        ...args,
        role: "customer",
      });
    },

    updateUser: async (_, { id, ...updates }, context) => {
      const user = requireAuth(context);

      if (user.role !== "admin" && user.userId !== id) {
        throw new Error("You can only update your own profile");
      }

      // Customers cannot change account status.
      if (user.role !== "admin") {
        delete updates.status;
      }

      return await User.findByIdAndUpdate(
        id,
        updates,
        { new: true }
      );
    },

    deleteUser: async (_, { id }, context) => {
      requireAdmin(context);

      return await User.findByIdAndDelete(id);
    },
  },
};