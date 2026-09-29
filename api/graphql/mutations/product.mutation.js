import Product from "../../models/Product.js";
import { requireAdmin } from "../../permissions.js";

export const productMutationTypeDefs = `#graphql

  input ColourImageInput {
    colour: String!
    image: String!
  }

  input ProductImageInput {
    view: String!
    image: String!
  }

  extend type Mutation {
    createProduct(
      name: String!
      price: Float!
      image: String
      category: String
      brand: ID
      description: String
      stock: Int
      sizes: [String!]
      colours: [String!]
      colourImages: [ColourImageInput!]
      productImages: [ProductImageInput!]
      sizechart: ID
      status: String
    ): Product!

    updateProduct(
      id: ID!
      name: String
      price: Float
      image: String
      category: String
      brand: ID
      description: String
      stock: Int
      sizes: [String!]
      colours: [String!]
      colourImages: [ColourImageInput!]
      productImages: [ProductImageInput!]
      sizechart: ID
      status: String
    ): Product

    deleteProduct(id: ID!): Product
  }
`;

export const productMutationResolvers = {
  Mutation: {
    createProduct: async (_, args, context) => {
      requireAdmin(context);

      const product = await Product.create({
        ...args,
        sizes: args.sizes || [],
        colours: args.colours || [],
        colourImages: args.colourImages || [],
        productImages: args.productImages || [],
      });

      return product;
    },

    updateProduct: async (_, { id, ...updates }, context) => {
      requireAdmin(context);

      return await Product.findByIdAndUpdate(
        id,
        updates,
        { new: true }
      );
    },

    deleteProduct: async (_, { id }, context) => {
      requireAdmin(context);

      return await Product.findByIdAndDelete(id);
    },
  },
};