import Sizechart from "../../models/Sizechart.js";

export const sizechartTypeDefs = `#graphql
  type Sizechart {
    id: ID!
    name: String
    slug: String
    image: String
    status: String
    createdAt: String
    updatedAt: String
  }

  extend type Query {
    sizechartById(id: ID!): Sizechart
    sizechartMany: [Sizechart!]!
    sizechartOne: Sizechart
    getSizecharts: [Sizechart!]!
    getSizechartById(id: ID!): Sizechart
    getSizechartBySlug(slug: String!): Sizechart
    loadSizecharts: [Sizechart!]!
    loadSizechart(id: ID!): Sizechart
  }
`;

export const sizechartResolvers = {
  Query: {
    sizechartById: async (_, { id }) => {
      return await Sizechart.findById(id);
    },

    sizechartMany: async () => {
      return await Sizechart.find();
    },

    sizechartOne: async () => {
      return await Sizechart.findOne();
    },

    getSizecharts: async () => {
      return await Sizechart.find();
    },

    getSizechartById: async (_, { id }) => {
      return await Sizechart.findById(id);
    },

    getSizechartBySlug: async (_, { slug }) => {
      return await Sizechart.findOne({ slug });
    },

    loadSizecharts: async () => {
      return await Sizechart.find();
    },

    loadSizechart: async (_, { id }) => {
      return await Sizechart.findById(id);
    },
  },

  Sizechart: {
    id: (parent) => parent._id.toString(),
  },
};
