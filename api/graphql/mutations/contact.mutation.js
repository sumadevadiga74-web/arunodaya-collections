import Contact from "../../models/Contact.js";
import { requireAdmin } from "../../permissions.js";

export const contactMutationTypeDefs = `#graphql
  extend type Mutation {
    createContact(
      name: String!
      email: String!
      phone: String
      message: String!
      status: String
    ): Contact!

    updateContact(
      id: ID!
      name: String
      email: String
      phone: String
      message: String
      status: String
    ): Contact

    deleteContact(id: ID!): Contact
  }
`;

export const contactMutationResolvers = {
  Mutation: {
    createContact: async (_, args) => {
      return await Contact.create({
        ...args,
        status: args.status || "new",
      });
    },

    updateContact: async (_, { id, ...updates }, context) => {
      requireAdmin(context);

      return await Contact.findByIdAndUpdate(
        id,
        updates,
        { new: true }
      );
    },

    deleteContact: async (_, { id }, context) => {
      requireAdmin(context);

      return await Contact.findByIdAndDelete(id);
    },
  },
};