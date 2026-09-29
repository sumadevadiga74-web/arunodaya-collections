import Sizechart from "../../models/Sizechart.js";

export const sizechartMutationTypeDefs = `#graphql
  input SizechartInput {
    id: ID
    name: String
    slug: String
    image: String
    status: String
  }

  type SizechartMutationResponse {
    success: Boolean!
    message: String
    data: Sizechart
  }

  extend type Mutation {
    createSizechart(input: SizechartInput!): SizechartMutationResponse
    updateSizechart(input: SizechartInput!): SizechartMutationResponse
    deleteSizechart(id: ID!): SizechartMutationResponse
  }
`;

export const sizechartMutationResolvers = {
  Mutation: {
    createSizechart: async (_, { input }) => {
      const sizechart = await Sizechart.create(input);

      return {
        success: true,
        message: "Sizechart created successfully",
        data: sizechart,
      };
    },

    updateSizechart: async (_, { input }) => {
      const { id, ...updates } = input;

      const sizechart = await Sizechart.findByIdAndUpdate(
        id,
        updates,
        { new: true }
      );

      return {
        success: true,
        message: "Sizechart updated successfully",
        data: sizechart,
      };
    },

    deleteSizechart: async (_, { id }) => {
      const sizechart = await Sizechart.findByIdAndDelete(id);

      return {
        success: true,
        message: "Sizechart deleted successfully",
        data: sizechart,
      };
    },
  },
};
