import Media from "../../models/Media.js";

export const mediaMutationTypeDefs = `#graphql

  extend type Mutation {
    createMedia(
      mediaType: String!
      url: String!
      publicId: String
      fullPublicId: String
      altText: String
      folder: String
    ): Media!

    deleteMedia(id: ID!): Boolean!
  }
`;

export const mediaMutationResolvers = {
  Mutation: {
    createMedia: async (
      _,
      {
        mediaType,
        url,
        publicId,
        fullPublicId,
        altText,
        folder,
      }
    ) => {
      const media = await Media.create({
        mediaType,
        url,
        publicId,
        fullPublicId,
        altText,
        folder,
      });

      return media;
    },

    deleteMedia: async (_, { id }) => {
      const media = await Media.findById(id);

      if (!media) {
        return false;
      }

      await Media.findByIdAndDelete(id);

      return true;
    },
  },
};