
import Media from "../../models/Media.js";

export const mediaTypeDefs = `#graphql

  type Media {
    id: ID!
    mediaType: String!
    url: String!
    publicId: String
    fullPublicId: String
    altText: String
    folder: String
    createdAt: String
    updatedAt: String
  }

  extend type Query {
    media: [Media!]!
  }
`;

export const mediaResolvers = {
  Query: {
    media: async () => {
      return await Media.find().sort({ createdAt: -1 });
    },
  },

  Media: {
    id: (media) => media._id.toString(),
  },
};
