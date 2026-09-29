import Contact from "../../models/Contact.js";

export const contactTypeDefs = `#graphql
  type Contact {
    id: ID!
    name: String!
    email: String!
    phone: String
    message: String!
    status: String
    createdAt: String
    updatedAt: String
  }

  extend type Query {
    contacts: [Contact!]!
  }
`;

export const contactResolvers = {
  Query: {
    contacts: async () => {
      return await Contact.find();
    },
  },

  Contact: {
    id: (parent) => parent._id.toString(),
  },
};