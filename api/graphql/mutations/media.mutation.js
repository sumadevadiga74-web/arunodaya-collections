
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
  },
};
